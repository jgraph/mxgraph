<?php
/**
 * $Id: mxCodecTest.php,v 1.11 2010-09-13 15:45:28 gaudenz Exp $
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
		$v1 = $graph->insertVertex($parent, null, "Hello", 20, 20, 80, 30);
		$v2 = $graph->insertVertex($parent, null, "World!", 200, 150, 80, 30);
		$e1 = $graph->insertEdge($parent, null, "e1", $v1, $v2);
		$e1->getGeometry()->points = array(new mxPoint(10, 10));

		$v3 = $graph->insertVertex($e1, null, "v3", 0, 0, 40, 40, "shape=ellipse");
		$v3->getGeometry()->relative = true;
		$v3->getGeometry()->offset = new mxPoint(-20, -20);
		
		$model->add($parent, $e1, 0);
	}
	catch (Exception $e)
	{
		$model->endUpdate();
		throw($e);
	}
	$model->endUpdate();

	$doc = mxUtils::createXmlDocument();
	$enc = new mxCodec($doc);
	$node = $enc->encode($model);
	$xml1 = $doc->saveXML($node);

	$doc = mxUtils::parseXml($xml1);
	$dec = new mxCodec($doc);
	$dec->decode($doc->documentElement, $model);

	$doc = mxUtils::createXmlDocument();
	$enc = new mxCodec($doc);
	$node = $enc->encode($model);
	$xml2 = $doc->saveXML($node);

	if ($xml1 == $xml2)
	{
		echo "Test Passed: ".htmlentities($xml1);
	}
	else
	{
		echo "Test Failed: <br>xml1=".htmlentities($xml1)."<br>xml2=".htmlentities($xml2);
	}
}

// Uses a local font so that all examples work on all platforms. This can be
// changed to vera on Mac or arial on Windows systems.
mxConstants::$DEFAULT_FONTFAMILY = "verah";
putenv("GDFONTPATH=".realpath("../examples/ttf"));

// If you can't get the fonts to render try using one of the following:
//mxConstants::$DEFAULT_FONTFAMILY = "C:\WINDOWS\Fonts\arial.ttf";
//mxConstants::$TTF_ENABLED = false;

main();
?>
