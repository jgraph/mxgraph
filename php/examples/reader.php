<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 */
include_once("../src/mxServer.php");

/**
 * Function: main
 * 
 * Reads a graph view XML file and creates HTML on the fly,
 * ie. without creating a graph and model for it.
 */
function main()
{
	// Reads the XML representation of a graph_view_! If you need to
	// create an image for a graph_model_ then use the following code:
	//
	// $doc = mxUtils::parseXml($xml);
	// $dec = new mxCodec($doc);
	// $dec->decode($doc->documentElement, $graph->getModel());
	//
	// $image = $graph->createImage(null, "#FFFFFF");

	$filename = "diagrams/graphview.xml";
	//echo mxGraphViewHtmlReader::convertFile($filename);

	// Creates a PNG representation of the file
	$image =  mxGraphViewImageReader::convertFile($filename, "#FFFFFF");

	// Creates an interlaced image for better loading in the browser
	//imageInterlace($image, 1);
	// Marks background color as being transparent
	//imageColorTransparent($image, imageColorAllocate($image, 255, 255, 255));
	
	header("Content-Type: image/png");
	echo mxUtils::encodeImage($image);
}

// Uses a local font so that all examples work on all platforms. This can be
// changed to vera on Mac or arial on Windows systems.
mxConstants::$DEFAULT_FONTFAMILY = "ttf/verah.ttf";

// If you can't get the fonts to render try using one of the following:
//mxConstants::$DEFAULT_FONTFAMILY = "C:\WINDOWS\Fonts\arial.ttf";
//mxConstants::$DEFAULT_FONTFAMILY = "verah"; putenv("GDFONTPATH=".realpath("./ttf"));
//mxConstants::$TTF_ENABLED = false;

main();
?>
