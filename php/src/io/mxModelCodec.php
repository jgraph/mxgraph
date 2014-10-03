<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxModelCodec extends mxObjectCodec
{

	/**
	 * Class: mxModelCodec
	 *
	 * Codec for <mxGraphModels>. This class is created and registered
	 * dynamically at load time and used implicitly via <mxCodec>
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
	function mxModelCodec($template)
	{
		parent::mxObjectCodec($template);
	}
	
	/**
	 * Overrides <mxObjectCodec.encodeObject>.
	 */
	function encodeObject($enc, $obj, $node)
	{
		$rootNode = $enc->document->createElement("root");
		$enc->encodeCell($obj->getRoot(), $rootNode);
		$node->appendChild($rootNode);
	}

	/**
	 * Override <mxObjectCodec.decodeChild>.
	 */	
	function decodeChild($dec, $child, &$obj)
	{
		if ($child->nodeName == "root")
		{
			$this->decodeRoot($dec, $child, $obj);
		}
		else
		{
			parent::decodeChild($dec, $child, $obj);
		}
	}
		
	/**
	 * Override <mxObjectCodec.decodeRoot>.
	 */
	function decodeRoot($dec, $root, $model)
	{
		$rootCell = null;
		$tmp = $root->firstChild;
		
		while (isset($tmp))
		{
			$cell = $dec->decodeCell($tmp);
			
			if (isset($cell) && $cell->getParent() == null)
			{
				$rootCell = $cell;
			}
			
			$tmp = $tmp->nextSibling;
		}

		// Sets the root on the model if one has been decoded
		if (isset($rootCell))
		{
			$model->setRoot($rootCell);
		}
	}

}

mxCodecRegistry::register(new mxModelCodec(new mxGraphModel()));
?>
