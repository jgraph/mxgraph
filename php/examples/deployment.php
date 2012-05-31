<?php
/**
 * $Id: deployment.php,v 1.12 2011-03-11 10:48:19 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 */
include_once("../src/mxServer.php");

/**
 * Function: main
 * 
 * Demonstrates the deployment of a graph which is created on the server side
 * and then deployed with the client library in a single response. This is done
 * by replacing the %graph% placeholder in the javascript/example/template.html
 * file with the XML representation of the graph that was created on the server.
 * 
 * Point your browser to http://localhost/graph to fetch the HTML file. Make sure
 * to deploy the mxgraph distribution directory to the webroot for this example
 * to work, or replace the mxBasePath and URL for the mxClient.js in the
 * template to match your environment.
 *
 * This example returns an HTML page when the client issues a get request. The
 * readme in the php directory explains how to run this example.
 * 
 * The template.html file is used by this example. In main a graph is created
 * and the XML of the graph obtained by:
 * 
 *   $enc = new mxCodec();
 *   $xmlNode = $enc->encode($model);
 *   $xml = $xmlNode->ownerDocument->saveXML($xmlNode);
 * 
 * The template.html is then loaded as a string and instances of %graph% are
 * replaced with the XML of the graph. In the template.html the following line
 * defines the page body:
 * 
 *   <body onload="main(document.getElementById('graphContainer'), '%graph%');">
 * 
 * So the XML string of the graph becomes the second parameter of the main
 * function. When the template.html page is loaded in the browser, the main
 * function is called and within that function these lines:
 * 
 *   var doc = mxUtils.parseXml(xml);
 *   var codec = new mxCodec(doc);
 *   codec.decode(doc.documentElement, graph.getModel());
 * 
 * insert the XML into the graph model and that graph will then display.
 */
function main()
{
	// True-type fonts not needed in this example
	mxConstants::$TTF_ENABLED = false;

	// Creates the graph on the server-side
	$graph = new mxGraph();
	$model = $graph->getModel();
	$parent = $graph->getDefaultParent();

	$model->beginUpdate();
	try
	{	
		$v1 = $graph->insertVertex($parent, null, "Hello", 20, 20, 80, 30);
		$v2 = $graph->insertVertex($parent, null, "World", 200, 150, 80, 30);
		$graph->insertEdge($parent, null, "", $v1, $v2);
	}
	catch (Exception $e)
	{
		$model->endUpdate();
		throw($e);
	}
	$model->endUpdate();

	// Turns the graph into XML data
	$enc = new mxCodec();
	$xmlNode = $enc->encode($model);
	$xml = addslashes(htmlentities(str_replace("\n", "&#xa;",
		$xmlNode->ownerDocument->saveXML($xmlNode))));
	
	// Loads the template into a single string
	$template = mxUtils::readFile("template.html");

	// Replaces the placeholder in the template with the XML data
	// which is then parsed into the graph model. Note: In a production
	// environment you should use a template engine instead.
	$page = str_replace("%graph%", $xml, $template);
	
	// Makes sure there is no caching on the client side
	header("Pragma: no-cache"); // HTTP 1.0
	header("Cache-control: private, no-cache, no-store");
	header("Expires: 0");

	echo $page;
}

// Uses a local font so that all examples work on all platforms. This can be
// changed to vera on Mac or arial on Windows systems.
mxConstants::$DEFAULT_FONTFAMILY = "ttf/verah.ttf";

// If you can't get the fonts to render try using one of the following:
//mxConstants::$DEFAULT_FONTFAMILY = "C:\WINDOWS\Fonts\arial.ttf";
//mxConstants::$DEFAULT_FONTFAMILY = "verah"; putenv("GDFONTPATH=".realpath("./ttf"));
//mxConstants::$TTF_ENABLED = false;

// Handles save image request
if ($_SERVER["REQUEST_METHOD"] == "POST")
{
	$xml = urldecode($_POST["xml"]);
	
	// Creates a PNG representation of the file
	$image =  mxGraphViewImageReader::convert($xml, "#FFFFFF");
	header("Content-Type: image/png");
	echo mxUtils::encodeImage($image);
}
else
{
	main();
}
?>
