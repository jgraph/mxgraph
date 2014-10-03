<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */

class mxGraphViewImageReader
{

	/**
	 * Class: mxGraphViewImageReader
	 *
	 * A display XML to image converter. This allows to create an image of a graph
	 * without having to parse and create the graph model using the XML file
	 * created for the mxGraphView object in the thin client.
	 *
	 * To create the XML for the mxGraphView on the client:
	 *
	 * (code)
	 * var enc = new mxCodec(mxUtils.createXMLDocument());
	 * var node = enc.encode(editor.graph.view);
	 * var xml = mxUtils.getXML(node);
	 * (end)
	 * 
	 * Variable: canvas
	 *
	 * Holds the canvas.
	 */
	var $canvas;
	
	/**
	 * Variable: scale
	 * 
	 * Holds the global scale of the graph. This is set just before
	 * createCanvas is called.
	 */
	var $scale = 1;
	
	/**
	 * Variable: parser
	 *
	 * Holds the SAX parser.
	 */
	var $parser;
	
	/**
	 * Variable: background
	 *
	 * Holds the background color.
	 */
	var $background;
	
	/**
	 * Variable: border
	 *
	 * Holds the border size. Default is 0.
	 */
	var $border;

	/**
	 * Constructor: mxGraphViewImageReader
	 *
	 * Constructs a new image graph view reader.
	 */
	function mxGraphViewImageReader($background = null, $border = 0)
	{
		$this->parser = xml_parser_create();
		
		xml_parser_set_option($this->parser, XML_OPTION_CASE_FOLDING, 0);
		xml_set_object($this->parser, $this);
		xml_set_element_handler($this->parser, "startElement", "endElement");
			
		$this->background = $background;
		$this->border = $border;
	}

	/**
	 * Function: createCanvas
	 *
	 * Returns the canvas to be used for rendering.
	 */
	function createCanvas($attrs)
	{
		$width = $attrs["x"] + $attrs["width"] + $this->border + 1;
		$height = $attrs["y"] + $attrs["height"] + $this->border + 1;

		return new mxGdCanvas($width, $height, $this->scale, $this->background);
	}

	/**
	 * Function: read
	 *
	 * Reads the specified view XML string.
	 */
	function read($string)
	{
		xml_parse($this->parser, $string, true);
	}
	
	/**
	 * Function: readFile
	 *
	 * Reads the specified view XML file in blocks of 4096 bytes.
	 */
	function readFile($filename)
	{
		$fp = fopen($filename, "r");
		
		while ($data = fread($fp, 4096))
		{
			xml_parse($this->parser, $data, feof($fp)) or
			die (sprintf("XML Error: %s at line %d", 
				xml_error_string(xml_get_error_code($this->parser)),
				xml_get_current_line_number($this->parser)));
		}
		
		fclose($fp);
	}

	/**
	 * Function: startElement
	 *
	 * Invoked by the SAX parser when an element starts.
	 */
	function startElement($parser, $name, $attrs)
	{
		if ($this->canvas == null && $name == "graph")
		{
			$this->scale = mxUtils::getValue($attrs, "scale", 1);
			$this->canvas = $this->createCanvas($attrs);
		}
		else if ($this->canvas != null)
		{
			$edge = $name == "edge";
			$group = $name == "group";
			$vertex = $name == "vertex";
			
			if (($edge && isset($attrs["points"])) ||
				(($vertex || $group) && isset($attrs["x"]) &&
				isset($attrs["y"]) && isset($attrs["width"]) &&
				isset($attrs["height"])))
			{
				$state = new mxCellState(null, null, $attrs);

				$label = $this->parseState($state, $edge);
				$this->canvas->drawCell($state);
				$this->canvas->drawLabel($label, $state, false);
			}
		}
	}
	
	/**
	 * Function: parseState
	 *
	 * Parses the bounds, absolute points and label information from the style
	 * of the state into its respective fields and returns the label of the
	 * cell.
	 */
	function parseState($state, $edge)
	{
		$style = $state->style;

		// Parses the bounds
		$state->x = mxUtils::getNumber($style, "x");
		$state->y = mxUtils::getNumber($style, "y");
		$state->width = mxUtils::getNumber($style, "width");
		$state->height = mxUtils::getNumber($style, "height");

		// Parses the absolute points list
		$tmp = mxUtils::getValue($style, "points");
		
		if (strlen($tmp) > 0)
		{
			$pts = $this->parsePoints($tmp);
			
			if (sizeof($pts) > 0)
			{
				$state->absolutePoints = $pts;
			}
		}
		
        // Parses the label and label bounds
		$label = mxUtils::getValue($style, "label");
		
		if ($label != null && strlen($label) > 0)
		{
			$offset = new mxPoint(mxUtils::getNumber($style, "dx"),
				mxUtils::getNumber($style, "dy"));
			$vertexBounds = (!$edge) ? $state : null;
			$state->labelBounds = mxUtils::getLabelPaintBounds($label, $style,
				mxUtils::getValue($style, "html", false), $offset,
				$vertexBounds, $this->scale);
		}
		
		return $label;
	}

	/**
	 * Function: parsePoints
	 * 
	 * Parses a string that represents a list of points into an array of
	 * <mxPoints>.
	 */
	function parsePoints($str)
	{
		$pts = array();
		
		if (isset($str))
		{
		 	$len = strlen($str);
			$tmp = "";
			$x = "";
	
		 	for ($i = 0; $i < $len; $i++)
		 	{
		 		$c = $str[$i];
		 		
		 		if ($c == "," || $c == " ")
		 		{
		 			if (strlen($x) == 0)
		 			{
		 				$x = $tmp;
		 			}
		 			else
		 			{
		 				array_push($pts, new mxPoint($x, $tmp));
		 				$x = "";
		 			}
		 			
	 				$tmp = "";
		 		}
		 		else
		 		{
					$tmp .= $c;	 		
		 		}
		 	}
		 	
		 	array_push($pts, new mxPoint($x, $tmp));
		}
		
	 	return $pts;
	}

	/**
	 * Function: endElement
	 *
	 * Invoked by the SAX parser when an element ends.
	 */
	function endElement($parser, $name)
	{
	 	// ignore
	}

	/**
	 * Destructor: destroy
	 *
	 * Destroy all allocated resources for this reader.
	 */
	function destroy()
	{
	 	$this->canvas->destroy();
	 	xml_parser_free($this->parser);
	}

	/**
	 * Function: convert
	 *
	 * Creates the image for the given display XML string.
	 */
	static function convert($string, $background = null)
	{
		$viewReader = new mxGraphViewImageReader($background);
		$viewReader->read($string);
		$image = $viewReader->canvas->getImage();
		
		return $image;	
	}

	/**
	 * Function: convertFile
	 *
	 * Creates the image for the given display XML file.
	 */
	static function convertFile($filename, $background = null)
	{
		$viewReader = new mxGraphViewImageReader($background);
		$viewReader->readFile($filename);
		$image = $viewReader->canvas->getImage();
		
		return $image;		
	}

}
?>
