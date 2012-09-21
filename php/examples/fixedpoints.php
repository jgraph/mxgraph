<?php
/**
 * $Id: fixedpoints.php,v 1.4 2011-02-23 10:28:19 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 */
include_once("../src/mxServer.php");

/**
 * Function: main
 * 
 * Creates a graph using the API and converts it into a PNG image.
 */
function main()
{
	// Creates graph with model
	$model = new mxGraphModel();
	$graph = new mxGraph($model);
	$parent = $graph->getDefaultParent();
	
	// Adds cells into the model
	$model->beginUpdate();
	try
	{
		$v1 = $graph->insertVertex($parent, null, "Hello,", 20, 20, 80, 60,
			"shape=triangle;perimeter=trianglePerimeter");
		$v2 = $graph->insertVertex($parent, null, "World!", 200, 150, 80, 60,
			"shape=ellipse;perimeter=ellipsePerimeter");
		$v3 = $graph->insertVertex($parent, null, "Hello,", 200, 20, 80, 30);
		$e1 = $graph->insertEdge($parent, null, "", $v1, $v2,
			"edgeStyle=elbowEdgeStyle;elbow=horizontal;".
			"exitX=0.5;exitY=1;exitPerimeter=1;entryX=0;entryY=0;entryPerimeter=1;");
		$e2 = $graph->insertEdge($parent, null, "", $v3, $v2,
			"edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=0;".
			"entryX=0;entryY=0;entryPerimeter=1;");
	}
	catch (Exception $e)
	{
		$model->endUpdate();
		throw($e);
	}
	$model->endUpdate();

	// Sends PNG image to client
	$image = $graph->createImage(null, "#FFFFFF");
	
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
