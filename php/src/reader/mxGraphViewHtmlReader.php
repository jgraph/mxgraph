<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */

class mxGraphViewHtmlReader extends mxGraphViewImageReader
{

	/**
	 * Class: mxGraphViewHtmlReader
	 *
	 * A display XML to HTML converter. This allows to create an image of a graph
	 * without having to parse and create the graph model using the XML file
	 * created for the mxGraphView object in the thin client.
	 * 
	 * Constructor: mxGraphViewHtmlReader
	 *
	 * Constructs a new HTML graph view reader.
	 */
	function mxGraphViewHtmlReader()
	{
		parent::mxGraphViewImageReader();
	}

	/**
	 * Function: createCanvas
	 *
	 * Returns the canvas to be used for rendering.
	 */
	function createCanvas($attrs)
	{
		return new mxHtmlCanvas($this->scale);
	}

	/**
	 * Function: convert
	 *
	 * Creates the HTML markup for the given display XML string.
	 */
	static function convert($string, $background = null)
	{
		$viewReader = new mxGraphViewHtmlReader();
		
		$viewReader->read($string);
		$html = $viewReader->canvas->getHtml();
		$viewReader->destroy();
		
		return $html;	
	}

	/**
	 * Function: convertFile
	 *
	 * Creates the HTML markup for the given display XML file.
	 */
	static function convertFile($filename, $background = null)
	{
		$viewReader = new mxGraphViewHtmlReader();
		
		$viewReader->readFile($filename);
		$html = $viewReader->canvas->getHtml();
		$viewReader->destroy();
		
		return $html;		
	}

}
?>
