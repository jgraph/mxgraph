<?php
/**
 * Copyright (c) 2006, Gaudenz Alder
 *
 * Class: mxServer
 *
 * Bootstrapping for the PHP backend. This is version 3.9.10
 * of mxGraph.
 *
 * Variable: MXGRAPH-VERSION
 *
 * Constant that holds the current mxGraph version. The current version
 * is 3.9.10.
 */
define("MXGRAPH-VERSION", "3.9.10");

// Disables external entities in XML
libxml_disable_entity_loader(true);

include_once("util/mxLog.php");
include_once("util/mxConstants.php");
include_once("util/mxUtils.php");
include_once("util/mxPoint.php");
include_once("util/mxRectangle.php");
include_once("util/mxEvent.php");
include_once("util/mxEventObject.php");
include_once("util/mxEventSource.php");
include_once("util/mxImageBundle.php");
include_once("model/mxCell.php");
include_once("model/mxCellPath.php");
include_once("model/mxGeometry.php");
include_once("model/mxGraphModel.php");
include_once("canvas/mxGdCanvas.php");
include_once("canvas/mxHtmlCanvas.php");
include_once("reader/mxGraphViewImageReader.php");
include_once("reader/mxGraphViewHtmlReader.php");
include_once("view/mxCellState.php");
include_once("view/mxConnectionConstraint.php");
include_once("view/mxStylesheet.php");
include_once("view/mxPerimeter.php");
include_once("view/mxEdgeStyle.php");
include_once("view/mxStyleRegistry.php");
include_once("view/mxGraphView.php");
include_once("view/mxGraph.php");
include_once("io/mxCodecRegistry.php");
include_once("io/mxCodec.php");
include_once("io/mxObjectCodec.php");
include_once("io/mxCellCodec.php");
include_once("io/mxModelCodec.php");
include_once("io/mxStylesheetCodec.php");
?>
