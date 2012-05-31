<?php
/**
 * $Id: mxStylesheetCodec.php,v 1.10 2011-06-13 08:18:42 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxStylesheetCodec extends mxObjectCodec
{

	/**
	 * Class: mxStylesheetCodec
	 *
	 * Codec for <mxStylesheets>. This class is created and registered
	 * dynamically at load time and used implicitely via <mxCodec>
	 * and the <mxCodecRegistry>.
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
	function mxStylesheetCodec($template)
	{
		parent::mxObjectCodec($template);
	}
	
	/**
	 * Override <mxObjectCodec.encode>.
	 */
	function encode($enc, $obj)
	{
		$node = $enc->document->createElement($this->getName());
		
		foreach ($obj->styles as $i => $value)
		{
			$styleNode = $enc->document->createElement("add");
			
			if (isset($i))
			{
				$styleNode->setAttribute("as", $i);
				
				foreach ($style as $j => $value)
				{
					$value = $this->getStringValue($j, $value);
					
					if (isset($value))
					{
						$entry = $enc->document->createElement("add");
						$entry->setAttribute("value", $value);
						$entry->setAttribute("as", $j);
						$styleNode->appendChild($entry);
					}
				}
				
				if ($styleNode->getChildCount() > 0)
				{
					$node->appendChild($styleNode);
				}
			}
		}
		
	    return node;
	}
		
	/**
	 * Returns the string for encoding the given value.
	 */
	function getStringValue($key, $value)
	{
		return (!function_exists($value) && !is_object($value)) ? $value : null;
	}
	
	/**
	 * Override <mxObjectCodec.decode>.
	 */
	function decode($dec, $node, &$into = null)
	{
		$id = $node->getAttribute("id");
		$obj = (in_array($id, $dec->objects)) ? $dec->objects[$id] : null;
		
		if (!isset($obj))
		{
			if (isset($into))
			{
				$obj = $into;
			}
			else
			{
				$tmp = get_class($this->template);
				$obj = new $tmp();
			}
			
			if (isset($id))
			{
				$dec->putObject($id, $obj);
			}
		}

		$node = $node->firstChild;
		
		while (isset($node))
		{
			if (!$this->processInclude($dec, $node, $obj) &&
				$node->nodeName == "add")
			{
				$as = $node->getAttribute("as");
				
				if (strlen($as) > 0)
				{
					$extend = $node->getAttribute("extend");

					$style = (strlen($extend) > 0 &&
						isset($obj->styles[$extend])) ?
						array_slice($obj->styles[$extend], 0) :
						null;					
					
					if (!isset($style))
					{
						$style = array();
					}
					
					$entry = $node->firstChild;
					
					while (isset($entry))
					{
						if ($entry->nodeType == XML_ELEMENT_NODE)
						{
							$key = $entry->getAttribute("as");
						 	
						 	if ($entry->nodeName == "add")
						 	{
							 	$text = $entry->textContent;
							 	$value = null;
							 	
							 	if (isset($text) && strlen($text) > 0)
							 	{
							 		$value = mxUtils::evaluate($text);
							 	}
							 	else
							 	{
							 		$value = $entry->getAttribute("value");
								}
								
								if ($value != null)
								{
									$style[$key] = $value;
								}
						 	}
						 	else if ($entry->nodeName == "remove")
						 	{
						 		unset($style[$key]);
						 	}
						}
						
						$entry = $entry->nextSibling;
					}
				
					$obj->putCellStyle($as, $style);
				}
			}
			
			$node = $node->nextSibling;
		}
		
		return $obj;
	}

}

mxCodecRegistry::register(new mxStylesheetCodec(new mxStylesheet()));
?>
