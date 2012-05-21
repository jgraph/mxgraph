<?php
/**
 * $Id: mxHtmlCanvas.php,v 1.19 2011-03-16 11:11:26 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxHtmlCanvas extends mxGdCanvas
{

	/**
	 * Class: mxHtmlCanvas
	 *
	 * Canvas for drawing graphs using HTML.
	 * 
	 * Variable: html
	 *
	 * Holds the html markup.
	 */
	var $html;

	/**
	 * Constructor: mxGdCanvas
	 *
	 * Constructs a new GD canvas. Use a HTML color definition for
	 * the optional background parameter, eg. white or #FFFFFF.
	 */
	function mxHtmlCanvas($scale=1, $basePath = "")
	{
		parent::mxGdCanvas(null, null, $scale, null, $basePath);
		$this->html = "";
	}

	/**
	 * Function: getHtml
	 *
	 * Gets the HTML that represents the canvas.
	 */
	function getHtml()
	{
		return $this->html;
	}

	/**
	 * Function: out
	 *
	 * Adds the specified string to the output.
	 */
	function out($string)
	{
		return $this->html .= "$string\n";
	}

	/**
	 * Function: drawLine
	 *
	 * Draws the specified line.
	 */
	function drawLine($x0, $y0, $x1, $y1, $stroke = null, $dashed = false)
	{
 		$tmpX = min($x0, $x1);
 		$tmpY = min($y0, $y1);
 		$w = max($x0, $x1) - $tmpX;
 		$h = max($y0, $y1) - $tmpY;
 		$x0 = $tmpX;
 		$y0 = $tmpY;
 		
 		if ($w == 0 || $h == 0)
 		{
			$style = "position:absolute;".
				"overflow:hidden;".
				"left:".$x0."px;".
				"top:".$y0."px;".
				"width:".$w."px;".
				"height:".$h."px;".
				"border-color:$stroke;".
				"border-style:solid;".
				"border-width:1 1 0 0px";
	 		$this->out("<DIV STYLE='$style'></DIV>");
		}
		else
		{
			$x = $x0 + ($x1 - $x0) / 2;
			$this->drawLine($x0, $y0, $x, $y0);
			$this->drawLine($x, $y0, $x, $y1);
			$this->drawLine($x, $y1, $x1, $y1);
		}
 	}
	
	/**
	 * Function: drawShape
	 *
	 * Draws the specified shape.
	 */
	function drawShape($shape, $x, $y, $w, $h, $stroke=null, $fill=null)
	{
		$style = "position:absolute;".
			"left:".$x."px;".
			"top:".$y."px;".
			"width:".$w."px;".
			"height:".$h."px;".
			"border-style:solid;".
			"border-color:$stroke;".
			"border-width:1px;".
			"background-color:$fill;";
 		$this->out("<DIV STYLE='$style'></DIV>");
	}

	/**
	 * Function: drawImage
	 *
	 * Draws the specified image.
	 */
	function drawImage($x, $y, $w, $h, $image, $aspect = true, $flipH = false, $flipV = false)
	{
		$style = "position:absolute;".
			"left:".$x."px;".
			"top:".$y."px;".
			"width:".$w."px;".
			"height:".$h."px;";
 		$this->out("<IMAGE SRC='$image' STYLE='$style'/>");
	}

	/**
	 * Function: drawText
	 *
	 * Draws the specified text.
	 */
	function drawText($string, $x, $y, $w, $h, $style)
	{
		$horizontal = mxUtils::getValue($style, mxConstants::$STYLE_HORIZONTAL, 1);
	 	$font = mxUtils::getValue($style, mxConstants::$STYLE_FONTFAMILY,
			mxConstants::$W3C_DEFAULT_FONTFAMILY);
		$fontSize = mxUtils::getValue($style, mxConstants::$STYLE_FONTSIZE,
			mxConstants::$DEFAULT_FONTSIZE) * $this->scale;
 		$color = mxUtils::getValue($style, mxConstants::$STYLE_FONTCOLOR, "black");
		$align = mxUtils::getValue($style, mxConstants::$STYLE_ALIGN, "center");
		$valign = mxUtils::getValue($style, mxConstants::$STYLE_VERTICAL_ALIGN, "middle");

		$style = "position:absolute;".
			"overflow:hidden;".
			"left:".($x-4)."px;".
			"width:".$w."px;".
			"height:".$h."px;".
			"font-family:$font;".
			"font-size:".$fontSize."px;".
			"color:$color;";
			
		if ($horizontal)
		{
			$style .= "top:".($y-5)."px;";
		}
		else
		{
			$style .= "top:".($y-$h)."px;";
		}
		
		$string = htmlentities($string);
		$string = str_replace("\n", "<br>", $string);
 		$this->out("<TABLE STYLE='$style'>".
			"<TR><TD ALIGN='$align' VALIGN='$valign'>".
			"$string</TD></TR></TABLE>");
	}

	/**
	 * Destructor: destroy
	 *
	 * Destroy all allocated resources.
	 */
	function destroy()
	{
	 	$this->html = "";
	}
	
	/**
	 * Function: drawGraph
	 * 
	 * Draws the given graph using this canvas.
	 */
	public static function drawGraph($graph, $clip = null, $bg = null)
	{
	 	$graph->view->validate();

	 	$canvas = new mxHtmlCanvas($graph->view->scale);
	 	$graph->drawGraph($canvas);
	 	
	 	return $canvas->getHtml();
	}

}
?>
