<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxCellCodec extends mxObjectCodec
{

	/**
	 * Class: mxCellCodec
	 *
	 * Codec for <mxCell>s. This class is created and registered
	 * dynamically at load time and used implicitely via <mxCodec>
	 * and the <mxCodecRegistry>.
	 *
	 * Transient Fields:
	 *
	 * - children
	 * - edges
	 * - states
	 * - overlay
	 * - mxTransient
	 *
	 * Reference Fields:
	 *
	 * - parent
	 * - source
	 * - target
	 * 
	 * Constructor: mxObjectCodec
	 *
	 * Constructs a new codec for the specified template object.
	 * The variables in the optional exclude array are ignored by
	 * the codec. Variables in the optional idrefs array are
	 * turned into references in the XML. The optional mapping
	 * may be used to map from variable names to XML attributes.
	 *
	 * Parameters:
	 *
	 * template - Prototypical instance of the object to be
	 * encoded/decoded.
	 * exclude - Optional array of fieldnames to be ignored.
	 * idrefs - Optional array of fieldnames to be converted to/from
	 * references.
	 * mapping - Optional mapping from field- to attributenames.
	 */
	function mxCellCodec($template)
	{
		parent::mxObjectCodec($template, array("children", "edges", "states",
			"overlay", "mxTransient"), array("parent",
			"source", "target"));
	}
	
	/**
	 * Override <mxObjectCodec.isExcluded>.
	 */
	function isExcluded($obj, $attr, $value, $isWrite)
	{
		return parent::isExcluded($obj, $attr, $value, $isWrite) ||
				($isWrite && $attr == "value" && is_object($value) &&
			   get_class($value) == "DOMElement");
	}

	/**
	 * Override <mxObjectCodec.afterEncode>.
	 */
	function afterEncode($enc, $obj, $node)
	{
		if (is_object($obj->value) && get_class($obj->value) == "DOMElement")
		{
			// Wraps the graphical annotation up in the
			// user object (inversion) by putting the
			// result of the default encoding into
			// a clone of the user object (node type 1)
			// and returning this cloned user object.
			$tmp = $node;

			$node = $enc->document->importNode($obj->value, true);
			$node->appendChild($tmp);
						
			// Moves the id attribute to the outermost
			// XML node, namely the node which denotes
			// the object boundaries in the file.
			$id = $tmp->getAttribute("id");
			$node->setAttribute("id", $id);
			$tmp->removeAttribute("id");
		}

		return $node;
	}

	/**
	 * Override <mxObjectCodec.beforeDecode>.
	 */
	function beforeDecode($dec, $node, &$obj)
	{
		$inner = $node;
		$classname = $this->getName();
		
		if ($node->nodeName != $classname)
		{
			// Passes the inner graphical annotation node to the
			// object codec for further processing of the cell.
			$tmp = $node->getElementsByTagName($classname)->item(0);
			
			if (isset($tmp) && $tmp->parentNode == $node)
			{
				$inner = $tmp;

				// Removes annotation and whitespace from node
				$tmp2 = $tmp->previousSibling;

				while (isset($tmp2) && $tmp2->nodeType == XML_TEXT_NODE)
				{
					$tmp3 = $tmp2->previousSibling;

					if (strlen(trim($tmp2->textContent)) == 0)
					{
						$tmp2->parentNode->removeChild($tmp2);
					}
					
					$tmp2 = $tmp3;
				}
				
				// Removes more whitespace
				$tmp2 = $tmp->nextSibling;
				
				while (isset($tmp2) && $tmp2->nodeType == XML_TEXT_NODE)
				{
					$tmp3 = $tmp2->previousSibling;
					
					if (strlen(trim($tmp2->textContent)) == 0)
					{
						$tmp2->parentNode->removeChild($tmp2);
					}
					
					$tmp2 = $tmp3;
				}
				
				$tmp->parentNode->removeChild($tmp);
			}
			else
			{
				$inner = null;
			}
			
			// Creates the user object out of the XML node
			$obj->value = $node->cloneNode(true);
			$id = $obj->value->getAttribute("id");
			
			if (strlen($id) > 0)
			{
				$obj->setId($id);
				$obj->value->removeAttribute("id");
			}
		}
		else
		{
			$obj->setId($node->getAttribute("id"));
		}
			
		// Preprocesses and removes all Id-references
		// in order to use the correct encoder (this)
		// for the known references to cells (all).
		if (isset($inner))
		{
			for ($i = 0; $i < sizeof($this->idrefs); $i++)
			{
				$attr = $this->idrefs[$i];
				$ref = $inner->getAttribute($attr);
				
				if (strlen($ref) > 0)
				{
					$inner->removeAttribute($attr);
					$object = (isset($dec->objects[$ref])) ? $dec->objects[$ref] : null;
					
					if (!isset($object))
					{
						$object = $dec->lookup($ref);
					}
					
					if (!isset($object))
					{
						// Needs to decode forward reference
						$element = $dec->getElementById($ref);

						if (isset($element))
						{
							$decoder = mxCodecRegistry::$codecs[$element->nodeName];
	
							if (!isset($decoder))
							{
								$decoder = $this;
							}

							$object = $decoder->decode($dec, $element);
						}
					}
											
					$obj->$attr = $object;
				}
			}
		}
		
		return $inner;
	}

}

mxCodecRegistry::register(new mxCellCodec(new mxCell()));
?>
