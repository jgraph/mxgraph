<?php
/**
 * $Id: mxObjectCodec.php,v 1.20 2010-12-01 09:19:58 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxObjectCodec
{
	
	/**
	 * Class: mxObjectCodec
	 *
	 * XML codec for PHP object graphs.
	 * 
	 * Implementation note:
	 * 
	 * The passing of the argument by reference in <decode>, <decodeNode>,
	 * <decodeAttributes>, <decodeAttribute>, <decodeChildren>, <decodeChild>,
	 * <beforeDecode> and <afterDecode> is required since the object may be an
	 * array instance, which needs an explicit reference operator even in PHP 5
	 * to be changed in-place.
	 * 
	 * Variable: template
	 *
	 * Holds the template object associated with this codec.
	 */
	var $template;
	
	/**
	 * Variable: exclude
	 *
	 * Array containing the variable names that should be
	 * ignored by the codec.
	 */
	var $exclude;
	
	/**
	 * Variable: idrefs
	 *
	 * Array containing the variable names that should be
	 * turned into or converted from references. See
	 * <mxCodec.getId> and <mxCodec.getObject>.
	 */
	var $idrefs;
	
	/**
	 * Variable: mapping
	 *
	 * Maps from from fieldnames to XML attribute names.
	 */
	var $mapping;
	
	/**
	 * Variable: reverse
	 *
	 * Maps from from XML attribute names to fieldnames.
	 */
	var $reverse;

	/**
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
	function mxObjectCodec($template, $exclude = array(),
		$idrefs = array(), $mapping = array())
	{
		$this->template = $template;
		
		$this->exclude = $exclude;
		$this->idrefs = $idrefs;
		$this->mapping = $mapping;
		
		$this->reverse = array();
		
		foreach($mapping as $key => $value)
		{
			$this->reverse[$value] = $key;
		}
	}
	
	/**
	 * Function: getName
	 *
	 * Creates a new instance of the template for this codec.
	 */
	function getName()
	{
		return mxCodecRegistry::getName($this->template);
	}
	
	/**
	 * Function: cloneTemplate
	 *
	 * Creates a new instance of the template for this codec.
	 */
	function cloneTemplate()
	{
		if (is_array($this->template))
		{
			return array();
		}
		else
		{
			$tmp = get_class($this->template);

			return new $tmp();
		}
	}
	
	/**
	 * Function: getFieldName
	 * 
	 * Returns the fieldname for the given attributename.
	 * Looks up the value in the <reverse> mapping or returns
	 * the input if there is no reverse mapping for the
	 * given name.
	 */
	function getFieldName($attributename)
	{
		if ($attributename != null)
		{
			$mapped = ((in_array($attributename, $this->reverse))) ?
				$this->reverse[$attributename] : null;
			
			if ($mapped != null)
			{
				$attributename = $mapped;
			}
		}
		
		return $attributename;
	}

	/**
	 * Function: getAttributeName
	 * 
	 * Returns the attributename for the given fieldname.
	 * Looks up the value in the <mapping> or returns
	 * the input if there is no mapping for the
	 * given name.
	 */
	function getAttributeName($fieldname)
	{
		if (isset($fieldname) && isset($this->mapping[$fieldname]))
		{
			$fieldname = $this->mapping[$fieldname];
		}
		
		return $fieldname;
	}

	/**
	 * Function: isExcluded
	 *
	 * Returns true if the given attribute is to be ignored by the codec. This
	 * implementation returns true if the given fieldname is in <exclude> or
	 * if the fieldname equals <mxObjectIdentity.FIELD_NAME>.
	 *
	 * Parameters:
	 *
	 * obj - Object instance that contains the field.
	 * attr - Fieldname of the field.
	 * value - Value of the field.
	 * write - Boolean indicating if the field is being encoded or decoded.
	 * Write is true if the field is being encoded, else it is being decoded.
	 */
	function isExcluded($obj, $attr, $value, $write)
	{
		return mxUtils::indexOf($this->exclude, $attr) >= 0;
	}
	
	/**
	 * Function: isReference
	 *
	 * Returns true if the given fieldname is to be treated
	 * as a textual reference (ID). This implementation returns
	 * true if the given fieldname is in <idrefs>.
	 *
	 * Parameters:
	 *
	 * obj - Object instance that contains the field.
	 * attr - Fieldname of the field.
	 * value - Value of the field. 
	 * write - Boolean indicating if the field is being encoded or decoded.
	 * Write is true if the field is being encoded, else it is being decoded.
	 */
	function isReference($obj, $attr, $value, $write)
	{
		return mxUtils::indexOf($this->idrefs, $attr) >= 0;
	}

	/**
	 * Function: encode
	 *
	 * Encodes the specified object and returns a node
	 * representing then given object. Calls <beforeEncode>
	 * after creating the node and <afterEncode> with the 
	 * resulting node after processing.
	 *
	 * Enc is a reference to the calling encoder. It is used
	 * to encode complex objects and create references.
	 *
	 * This implementation encodes all variables of an
	 * object according to the following rules:
	 *
	 * - If the variable name is in <exclude> then it is ignored.
	 * - If the variable name is in <idrefs> then <mxCodec.getId>
	 * is used to replace the object with its ID.
	 * - The variable name is mapped using <mapping>.
	 * - If obj is an array and the variable name is numeric
	 * (ie. an index) then it is not encoded.
	 * - If the value is an object, then the codec is used to
	 * create a child node with the variable name encoded into
	 * the "as" attribute.
	 * - Else, if <encodeDefaults> is true or the value differs
	 * from the template value, then ...
	 * - ... if obj is not an array, then the value is mapped to
	 * an attribute.
	 * - ... else if obj is an array, the value is mapped to an
	 * add child with a value attribute or a text child node,
	 * if the value is a function.
	 *
	 * If no ID exists for a variable in <idrefs> or if an object
	 * cannot be encoded, a warning is issued using <mxLog.warn>.
	 *
	 * Returns the resulting XML node that represents the given
	 * object.
	 *
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * obj - Object to be encoded.
	 */
	function encode($enc, $obj)
	{
		$node = $enc->document->createElement($this->getName());
		
		$obj = $this->beforeEncode($enc, $obj, $node);
		$this->encodeObject($enc, $obj, $node);
		
		return $this->afterEncode($enc, $obj, $node);
	}
		
	/**
	 * Function: encodeObject
	 *
	 * Encodes the value of each member in then given obj
	 * into the given node using <encodeValue>.
	 * 
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * obj - Object to be encoded.
	 * node - XML node that contains the encoded object.
	 */
	function encodeObject($enc, $obj, $node)
	{
		$enc->setAttribute($node, "id", $enc->getId($obj));
		
		if (is_array($obj))
		{
			$count = sizeof($obj);

			for ($i = 0; $i < $count; $i++)
			{
				$this->encodeValue($enc, $obj, null, $obj[$i], $node);
			}
		}
		else
		{
			$vars = get_object_vars($obj);
			
		    foreach ($vars as $name => $value)
		    {
		    	if ($value != null &&
		    		!$this->isExcluded($obj, $name, $value, true))
		    	{
		    		if (is_numeric($name))
		    		{
		    			unset($name);
		    		}
		    		
		    		$this->encodeValue($enc, $obj, $name, $value, $node);
		    	}
		    }
		}
	}
	
	/**
	 * Function: encodeValue
	 * 
	 * Converts the given value according to the mappings
	 * and id-refs in this codec and uses <writeAttribute>
	 * to write the attribute into the given node.
	 * 
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * obj - Object whose property is going to be encoded.
	 * name - XML node that contains the encoded object.
	 * value - Value of the property to be encoded.
	 * node - XML node that contains the encoded object.
	 */
	function encodeValue($enc, $obj, $name, $value, $node)
	{
		if ($value != null)
		{
			if ($this->isReference($obj, $name, $value, true))
			{
				$tmp = $enc->getId($value);
				
				if (!isset($tmp))
				{
			    	mxLog::warn("mxObjectCodec.encode: No ID for value of ".
			    		$this->getName().".$name of type ".get_class($value));
			    	return; // exit
			    }
			    
			    $value = $tmp;
			}

			$defaults = (is_object($this->template)) ? get_object_vars($this->template) : null;
			$defaultValue = (isset($defaults[$name])) ? $defaults[$name] : null;
			
			// Checks if the value is a named default value
			if (!isset($name) || $enc->encodeDefaults || $defaultValue !== $value)
			{
				$name = $this->getAttributeName($name);
				$this->writeAttribute($enc, $obj, $name, $value, $node);	
			}
		}
	}

	/**
	 * Function: writeAttribute
	 * 
	 * Writes the given value into node using <writePrimitiveAttribute>
	 * or <writeComplexAttribute> depending on the type of the value.
	 */
	function writeAttribute($enc, $obj, $attr, $value, $node)
	{
		if (!is_object($value) && !is_array($value) /* primitive type */)
		{
			$this->writePrimitiveAttribute($enc, $obj, $attr, $value, $node);
		}
		else /* complex type */
		{
			$this->writeComplexAttribute($enc, $obj, $attr, $value, $node);
    	}
    }
	
	/**
	 * Function: writePrimitiveAttribute
	 * 
	 * Writes the given value as an attribute of the given node.
	 */
	function writePrimitiveAttribute($enc, $obj, $attr, $value, $node)
	{
		$value = $this->convertValueToXml($value);
		
		if (!isset($attr))
		{
    		$child = $enc->document->createElement("add");
    		
    		// TODO: Handle "as" attribute for maps here
	    	$enc->setAttribute($child, "value", $value);
    		$node->appendChild($child);
    	}
    	else
    	{
        	$enc->setAttribute($node, $attr, $value);
    	}		
	}
		
	/**
	 * Function: writeComplexAttribute
	 * 
	 * Writes the given value as a child node of the given node.
	 */
	function writeComplexAttribute($enc, $obj, $attr, $value, $node)
	{
    	$child = $enc->encode($value);
    	
    	if (isset($child))
    	{
    		if (isset($attr))
    		{
	    		$child->setAttribute("as", $attr);
	    	}
	    	
	    	$node->appendChild($child);
    	}
    	else
    	{
    		mxLog::warn("mxObjectCodec.encode: No node for value of ".
    			$this->getName().".$attr");
    	}
	}
	
	/**
	 * Function: convertValueToXml
	 * 
	 * Returns the given value without applying a conversion.
	 */
	function convertValueToXml($value)
	{
		return $value;
	}
				
	/**
	 * Function: convertValueFromXml
	 * 
	 * Returns the given value. In PHP there is no need to convert the
	 * boolean strings "0" and "1" to their numeric / boolean values.
	 */
	function convertValueFromXml($value)
	{
		return $value;
	}

	/**
	 * Function: beforeEncode
	 *
	 * Hook for subclassers to pre-process the object before
	 * encoding. This returns the input object. The return
	 * value of this function is used in <encode> to perform
	 * the default encoding into the given node.
	 *
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * obj - Object to be encoded.
	 * node - XML node to encode the object into.
	 */
	function beforeEncode($enc, $obj, $node)
	{
		return $obj;
	}
	
	/**
	 * Function: afterEncode
	 *
	 * Hook for subclassers to post-process the node
	 * for the given object after encoding and return the
	 * post-processed node. This implementation returns 
	 * the input node. The return value of this method
	 * is returned to the encoder from <encode>.
	 *
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * obj - Object to be encoded.
	 * node - XML node that represents the default encoding.
	 */
	function afterEncode($enc, $obj, $node)
	{
		return $node;
	}

	/**
	 * Function: decode
	 *
	 * Parses the given node into the object or returns a new object
	 * representing the given node.
	 *
	 * Dec is a reference to the calling decoder. It is used to decode
	 * complex objects and resolve references.
	 *
	 * If a node has an id attribute then the object cache is checked for the
	 * object. If the object is not yet in the cache then it is constructed
	 * using the constructor of <template> and cached in <mxCodec.objects>.
	 *
	 * This implementation decodes all attributes and childs of a node
	 * according to the following rules:
	 *
	 * - If the variable name is in <exclude> or if the attribute name is "id"
	 * or "as" then it is ignored.
	 * - If the variable name is in <idrefs> then <mxCodec.getObject> is used
	 * to replace the reference with an object.
	 * - The variable name is mapped using a reverse <mapping>.
	 * - If the value has a child node, then the codec is used to create a
	 * child object with the variable name taken from the "as" attribute.
	 * - If the object is an array and the variable name is empty then the
	 * value or child object is appended to the array.
	 * - If an add child has no value or the object is not an array then
	 * the child text content is evaluated using <mxUtils.eval>.
	 *
	 * For add nodes where the object is not an array and the variable name
	 * is defined, the default mechanism is used, allowing to override/add
	 * methods as follows:
	 *
	 * (code)
	 * <Object>
	 *   <add as="hello"><![CDATA[
	 *     function(arg1) {
	 *       alert('Hello '+arg1);
	 *     }
	 *   ]]></add>
	 * </Object>
	 * (end) 
	 *
	 * If no object exists for an ID in <idrefs> a warning is issued
	 * using <mxLog.warn>.
	 *
	 * Returns the resulting object that represents the given XML node
	 * or the object given to the method as the into parameter.
	 *
	 * Parameters:
	 *
	 * dec - <mxCodec> that controls the decoding process.
	 * node - XML node to be decoded.
	 * into - Optional objec to encode the node into.
	 */
	function decode($dec, $node, &$into = null)
	{
		$id = $node->getAttribute("id");
		$obj = null;
		
		if (array_key_exists($id, $dec->objects))
		{
			$obj = $dec->objects[$id];
		}

		if (!isset($obj))
		{
			if (isset($into))
			{
				$obj = $into;
			}
			else
			{
				$obj = $this->cloneTemplate();
			}
			
			if (strlen($id) > 0)
			{
				$dec->putObject($id, $obj);
			}
		}

		$node = $this->beforeDecode($dec, $node, $obj);
		$this->decodeNode($dec, $node, $obj);

	    return $this->afterDecode($dec, $node, $obj);
	}		
	
	/**
	 * Function: decodeNode
	 * 
	 * Calls <decodeAttributes> and <decodeChildren> for the given node.
	 */	
	function decodeNode($dec, $node, &$obj)
	{
		if (isset($node))
		{
			$this->decodeAttributes($dec, $node, $obj);
			$this->decodeChildren($dec, $node, $obj);
		}
	}

	/**
	 * Function: decodeAttributes
	 * 
	 * Decodes all attributes of the given node using <decodeAttribute>.
	 */	
	function decodeAttributes($dec, $node, &$obj)
	{
		$attrs = $node->attributes;

		if ($attrs != null)
		{
			for ($i = 0; $i < $attrs->length; $i++)
			{
				$this->decodeAttribute($dec, $attrs->item($i), $obj);
			}
		}
	}	

	/**
	 * Function: decodeAttribute
	 * 
	 * Reads the given attribute into the specified object.
	 */	
	function decodeAttribute($dec, $attr, &$obj)
	{
		$name = $attr->nodeName;

		if ($name != "as" && $name != "id")
		{
			// Converts the string true and false to their boolean values.
			// This may require an additional check on the obj to see if
			// the existing field is a boolean value or uninitialized, in
			// which case we may want to convert true and false to a string.
			$value = $this->convertValueFromXml($attr->nodeValue);
			$fieldname = $this->getFieldName($name);
			
			if ($this->isReference($obj, $fieldname, $value, false))
			{
				$tmp = $dec->getObject($value);
				
				if (!isset($tmp))
				{
			    	mxLog::warn("mxObjectCodec.decode: No object for ".
			    		$this->getName().".$fieldname=$value");
			    	return; // exit
			    }
			    
			    $value = $tmp;
			}

			if (!$this->isExcluded($obj, $fieldname, $value, false))
			{
				//mxLog.debug(mxCodecRegistry::getName($obj)."$name=$value");
				$obj->$fieldname = $value;
			}
		}
	}

	/**
	 * Function: decodeChildren
	 * 
	 * Decodec all children of the given node using <decodeChild>.
	 */	
	function decodeChildren($dec, $node, &$obj)
	{
		$child = $node->firstChild;
		
		while ($child != null)
		{
			$tmp = $child->nextSibling;
			
			if ($child->nodeType == XML_ELEMENT_NODE &&
				!$this->processInclude($dec, $child, $obj))
			{
				$this->decodeChild($dec, $child, $obj);
			}
			
			$child = $tmp;
		}
	}

	/**
	 * Function: decodeChild
	 * 
	 * Reads the specified child into the given object.
	 */	
	function decodeChild($dec, $child, &$obj)
	{
		$fieldname = $this->getFieldName($child->getAttribute("as"));
		
		if (!isset($fieldname) ||
			!$this->isExcluded($obj, $fieldname, $child, false))
		{
			$template = $this->getFieldTemplate($obj, $fieldname, $child);
			$value = null;
			
			if ($child->nodeName == "add")
			{
				$value = $child->getAttribute("value");
				
				if (!isset($value))
				{
					// TODO: Evaluate text content
					//$value = eval($child->get_content());
					//mxLog.debug('Decoded '+fieldname+' '+mxUtils.getTextContent(child));
				}
			}
			else
			{
				
				$value = $dec->decode($child, $template);
			}
			
			$this->addObjectValue($obj, $fieldname, $value, $template);
		}
	}
		
	/**
	 * Function: getFieldTemplate
	 * 
	 * Returns the template instance for the given field. This returns the
	 * value of the field, null if the value is an array or an empty collection
	 * if the value is a collection. The value is then used to populate the
	 * field for a new instance. For strongly typed languages it may be
	 * required to override this to return the correct collection instance
	 * based on the encoded child.
	 */
	function getFieldTemplate(&$obj, $fieldname, $child)
	{
		$template = (is_object($obj)) ? $obj->$fieldname : null;
		
		// Non-empty arrays are replaced completely
		if (is_array($template) && count($template) > 0)
		{
			$template = null;
		}
		
		return $template;
	}
		
	/**
	 * Function: addObjectValue
	 * 
	 * Sets the decoded child node as a value of the given object. If the
	 * object is a map, then the value is added with the given fieldname as a
	 * key. If the fieldname is not empty, then setFieldValue is called or
	 * else, if the object is a collection, the value is added to the
	 * collection. For strongly typed languages it may be required to
	 * override this with the correct code to add an entry to an object.
	 */
	function addObjectValue(&$obj, $fieldname, $value, $template)
	{
		if ($value !== null && ($template == null || $value != $template))
		{	
			if (isset($fieldname) && strlen($fieldname) > 0)
			{
				$obj->$fieldname = $value;
			}
			else
			{
				array_push($obj, $value);
			}
			//mxLog.debug('Decoded '+mxUtils.getFunctionName(obj.constructor)+'.'+fieldname+': '+value);
		}
	}
	
	/**
	 * Function: processInclude
	 *
	 * Returns true if the given node is an include directive and
	 * executes the include by decoding the XML document. Returns
	 * false if the given node is not an include directive.
	 *
	 * Parameters:
	 *
	 * dec - <mxCodec> that controls the encoding/decoding process.
	 * node - XML node to be checked.
	 * into - Optional object to pass-thru to the codec.
	 */
	function processInclude($dec, $node, $into)
	{
		if ($node->nodeName == "include")
		{
			$name = $node->getAttribute("name");
			
			if (isset($name))
			{
				try
				{
					$xml = mxUtils::loadXmlDocument($name)->documentElement;
					
					if (isset($xml))
					{
						$dec->decode($xml, $into);
					}
				}
				catch (Exception $e)
				{
					// ignore
				}
			}
			
			return true;
		}
		
		return false;
	}
	
	/**
	 * Function: beforeDecode
	 *
	 * Hook for subclassers to pre-process the node for
	 * the specified object and return the node to be
	 * used for further processing by <decode>.
	 * The object is created based on the template in the 
	 * calling method and is never null. This implementation
	 * returns the input node. The return value of this
	 * function is used in <decode> to perform
	 * the default decoding into the given object.
	 *
	 * Parameters:
	 *
	 * dec - <mxCodec> that controls the decoding process.
	 * node - XML node to be decoded.
	 * obj - Object to encode the node into.
	 */
	function beforeDecode($dec, $node, &$obj)
	{
		return $node;
	}
	
	/**
	 * Function: afterDecode
	 *
	 * Hook for subclassers to post-process the object after
	 * decoding. This implementation returns the given object
	 * without any changes. The return value of this method
	 * is returned to the decoder from <decode>.
	 *
	 * Parameters:
	 *
	 * enc - <mxCodec> that controls the encoding process.
	 * node - XML node to be decoded.
	 * obj - Object that represents the default decoding.
	 */
	function afterDecode($dec, $node, &$obj)
	{
		return $obj;
	}

}

mxCodecRegistry::register(new mxObjectCodec(array()));
?>
