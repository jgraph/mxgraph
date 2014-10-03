<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 */
include_once("../src/mxServer.php");

/**
 * Creates a graph using the API and returns the XML.
 */
function createGraph()
{
	$id = $_GET["id"];
	error_log("Requested id=".$id);
	
	// Creates the graph on the server-side
	$graph = new mxGraph();
	$model = $graph->getModel();
	$parent = $graph->getDefaultParent();

	$model->beginUpdate();
	
	$v1 = $graph->insertVertex($parent, null, "Hello", 20, 20, 80, 30);
	$v2 = $graph->insertVertex($parent, null, "World", 200, 150, 80, 30);
	$graph->insertEdge($parent, null, "", $v1, $v2);

	$model->endUpdate();

	$enc = new mxCodec();
	$xmlNode = $enc->encode($model);
	
	return str_replace("\n", "&#xa;", $xmlNode->ownerDocument->saveXML($xmlNode));
}

/**
 * Handles save request and prints XML.
 */
if (isset($_POST["xml"]))
{
	$id = $_GET["id"];
	$xml = str_replace("\n", "&#xa;", stripslashes($_POST["xml"]));
	
	error_log("Received id=".$id." xml=".$xml);
}
else
{
	if (isset($_GET["id"]))
	{
		header("Content-Type: text/xml;charset=UTF-8");
		header("Pragma: no-cache"); // HTTP 1.0
		header("Cache-Control: private, no-cache, no-store");
		header("Expires: 0");
		
		echo createGraph();
	}
	else
	{
		// Redirects to frontend.html
		header('Location: frontend.html');
	}
}
?>
