<?php
/**
 * $Id: mxCodec.php,v 1.16 2010-09-13 15:45:28 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxCodec
{
	
	/**
	 * Class: mxCodec
	 *
	 * XML codec for PHP object graphs. In order to resolve forward references
	 * when reading files the XML document that contains the data must be passed
	 * to the constructor.
	 * 
	 * Variable: document
	 *
	 * The owner document of the codec.
	 */
	var $document;
	
	/**
	 * Variable: objects
	 *
	 * Maps from IDs to objects.
	 */
	var $objects = array();
	
	/**
	 * Variable: encodeDefaults
	 *
	 * Specifies if default values should be encoded.
	 * Default is false.
	 */
	var $encodeDefaults = false;

	/**
	 * Constructor: mxGraphViewHtmlReader
	 *
	 * Constructs a new HTML graph view reader.
	 */
	function mxCodec($document=null)
	{
		if ($document == null)
		{
			$document = mxUtils::createXmlDocument();
		}
		
		$this->document = $document;
	}

	/**
	 * Function: putObject
	 * 
	 * Assoiates the given object with the given ID.
	 * 
	 * Parameters
	 * 
	 * id - ID for the object to be associated with.
	 * obj - Object to be associated with the ID.
	 */
	function putObject($id, $object)
	{
		$this->objects[$id] = $object;

		return $object;
	}

	/**
	 * Function: getObject
	 *
	 * Returns the decoded object for the element with the specified ID in
	 * <document>. If the object is not known then <lookup> is used to find an
	 * object. If no object is found, then the element with the respective ID
	 * from the document is parsed using <decode>.
	 */
	function getObject($id)
	{		
		$obj = null;
		
		if (isset($id))
		{
			$obj = $this->objects[$id];
			
			if (!isset($obj))
			{
				$obj = $this->lookup($id);
				
				if (!isset($obj))
				{
					$node = $this->getElementById($id);
					
					if (isset($node))
					{
						$obj = $this->decode($node);
					}
				}
			}
		}
		
		return $obj;
	}

	/**
	 * Function: lookup
	 *
	 * Hook for subclassers to implement a custom lookup
	 * mechanism for cell IDs. This implementation always
	 * returns null.
	 *
	 * Parameters:
	 *
	 * id - ID of the object to be returned.
	 */
	function lookup($id)
	{		
		return null;
	}

	/**
	 * Function: getElementById
	 *
	 * Returns the element with the given ID from
	 * <document>. The optional attr argument specifies
	 * the name of the ID attribute. Default is "id".
	 * The XPath expression used to find the element is
	 * //*[@attr='arg'] where attr is the name of the
	 * ID attribute and arg is the given id.
	 *
	 * Parameters:
	 *
	 * id - String that contains the ID.
	 * attr - Optional string for the attributename.
	 * Default is "id".
	 */
	function getElementById($id, $attr="id")
	{		
		$expr = "//*[@$attr='$id']";
		
		return mxUtils::selectSingleNode($this->document, $expr);
	}

	/**
	 * Function: getId
	 *
	 * Returns the ID of the specified object. This implementation
	 * calls <reference> first and if that returns null handles
	 * the object as an <mxCell> by returning their IDs using
	 * <mxCell.getId>. If no ID exists for the given cell, then
	 * an on-the-fly ID is generated using <mxCellPath.create>.
	 *
	 * Parameters:
	 *
	 * obj - Object to return the ID for.
	 */
	function getId($obj)
	{
		$id = null;
		
		if (isset($obj))
		{
			$id = $this->reference($obj);
			
			if (!isset($id) && mxCodecRegistry::getName($obj) == "mxCell")
			{
				$id = $obj->getId();

				if (!isset($id))
				{
					// Uses an on-the-fly Id
					$id = mxCellPath::create($obj);
					
					if (strlen($id) == 0)
					{
						$id = "root";
					}
				}
			}
		}
		
		return $id;
	}

	/**
	 * Function: reference
	 *
	 * Hook for subclassers to implement a custom method
	 * for retrieving IDs from objects. This implementation
	 * always returns null.
	 *
	 * Parameters:
	 *
	 * obj - Object whose ID should be returned.
	 */
	function reference($obj)
	{
		return null;
	}
	
	/**
	 * Function: encode
	 *
	 * Encodes the specified object and returns the resulting
	 * XML node.
	 *
	 * Parameters:
	 *
	 * obj - Object to be encoded. 
	 */
	function encode($obj)
	{
		$node = null;
		
		if (is_object($obj) || is_array($obj))
		{
			if (is_array($obj))
			{
				$enc = new mxObjectCodec(array());
			}
			else
			{
				$enc = mxCodecRegistry::getCodec(
					mxCodecRegistry::getName($obj));
			}
			
			if (isset($enc))
			{
				$node = $enc->encode($this, $obj);
			}
			else
			{
				if (get_class($obj) == "DOMElement")
				{
					$node = $obj->cloneNode(true);
				}
				else
				{
		    		mxLog::warn("mxCodec.encode: No codec for ".
		    			mxCodecRegistry::getName($obj));
				}
			}
		}
		
		return $node;
	}

	/**
	 * Function: decode
	 *
	 * Decodes the given XML node. The optional "into"
	 * argument specifies an existing object to be
	 * used. If no object is given, then a new instance
	 * is created using the constructor from the codec.
	 *
	 * The function returns the passed in object or
	 * the new instance if no object was given.
	 *
	 * Parameters:
	 *
	 * node - XML node to be decoded.
	 * into - Optional object to be decodec into.
	 */
	function decode($node, $into = null)
	{
		$obj = null;
		
		if (isset($node) && $node->nodeType == XML_ELEMENT_NODE)
		{
			$dec = mxCodecRegistry::getCodec($node->nodeName);
			
			try
			{
				if (isset($dec))
				{
					$obj = $dec->decode($this, $node, $into);
				}
				else
				{
					$obj = $node->cloneNode(true);
					$obj->removeAttribute("as");
				}
			}
			catch (Exception $ex)
			{
				// ignore
				mxLog::debug("Cannot decode ".$node->nodeName.": $ex");
				throw $ex;
			}
		}
		
		return $obj;
	}

	/**
	 * Function: encodeCell
	 *
	 * Encoding of cell hierarchies is built-into the core, but
	 * is a higher-level function that needs to be explicitely
	 * used by the respective object encoders (eg. <mxModelCodec>,
	 * <mxChildChangeCodec> and <mxRootChangeCodec>). This
	 * implementation writes the given cell and its children as a
	 * (flat) sequence into the given node. The children are not
	 * encoded if the optional includeChildren is false. The
	 * function is in charge of adding the result into the
	 * given node and has no return value.
	 *
	 * Parameters:
	 *
	 * cell - <mxCell> to be encoded.
	 * node - Parent XML node to add the encoded cell into.
	 * includeChildren - Optional boolean indicating if the
	 * function should include all descendents. Default is true. 
	 */
	function encodeCell($cell, $node, $includeChildren=true)
	{
		$node->appendChild($this->encode($cell));
		
		if ($includeChildren)
		{
			$childCount = $cell->getChildCount();
			
			for ($i = 0; $i < $childCount; $i++)
			{
				$this->encodeCell($cell->getChildAt($i), $node);
			}
		}
	}

	/**
	 * Function: decodeCell
	 *
	 * Decodes cells that have been encoded using inversion, ie.
	 * where the user object is the enclosing node in the XML,
	 * and restores the group and graph structure in the cells.
	 * Returns a new <mxCell> instance that represents the
	 * given node.
	 *
	 * Parameters:
	 *
	 * node - XML node that contains the cell data.
	 * restoreStructures - Optional boolean indicating whether
	 * the graph structure should be restored by calling insert
	 * and insertEdge on the parent and terminals, respectively.
	 * Default is true.
	 */
	function decodeCell($node, $restoreStructures = true)
	{
		$cell = null;
		
		if (isset($node) && $node->nodeType == XML_ELEMENT_NODE)
		{
			// Tries to find a codec for the given node name. If that does
			// not return a codec then the node is the user object (an XML node
			// that contains the mxCell, aka inversion).
			$decoder = mxCodecRegistry::getCodec($node->nodeName);

			// Tries to find the codec for the cell inside the user object.
			// This assumes all node names inside the user object are either
			// not registered or they correspond to a class for cells.
			if (!isset($decoder))
			{
				$child = $node->firstChild;
				
				while (isset($child) && !($decoder instanceof mxCellCodec))
				{
					$decoder = mxCodecRegistry::getCodec($child->nodeName);
					$child = $child->nextSibling;
				}
			}
			
			if (!($decoder instanceof mxCellCodec))
			{
				$decoder = mxCodecRegistry::getCodec("mxCell");
			}

			$cell = $decoder->decode($this, $node);
			
			if ($restoreStructures)
			{
				$this->insertIntoGraph($cell);
			}
		}
		
		return $cell;
	}
	
	/**
	 * Function: insertIntoGraph
	 *
	 * Inserts the given cell into its parent and terminal cells.
	 */
	function insertIntoGraph($cell)
	{
		$parent = $cell->getParent();
		$source = $cell->getTerminal(true);
		$target = $cell->getTerminal(false);
		
		// Fixes possible inconsistencies during insert into graph
		$cell->setTerminal(null, false);
		$cell->setTerminal(null, true);
		$cell->setParent(null);
		
		if (isset($parent))
		{
			$parent->insert($cell);
		}

		if (isset($source))
		{
			$source->insertEdge($cell, true);
		}

		if (isset($target))
		{
			$target->insertEdge($cell, false);
		}
	}
	
	/**
	 * Function: setAttribute
	 *
	 * Sets the attribute on the specified node to value. This is a
	 * helper method that makes sure the attribute and value arguments
	 * are not null.
	 *
	 * Parameters:
	 *
	 * node - XML node to set the attribute for.
	 * attributes - Attributename to be set.
	 * value - New value of the attribute.
	 */
	function setAttribute($node, $attribute, $value)
	{
		if (is_array($value))
		{
			error_log("cannot write array $attribute");
		}
		else if (isset($attribute) && isset($value))
		{
			$node->setAttribute($attribute, $value);
		}
	}

}
?>
