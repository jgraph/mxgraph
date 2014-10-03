<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxStylesheet
{
	
	/**
	 * Class: mxStylesheet
	 * 
	 * Defines the appearance of the cells in a graph. See
	 * <putCellStyle> for an example of creating a style.
	 *
	 * Default Styles:
	 * 
	 * The stylesheet contains two built-om styles, which are
	 * used if no style is defined for a cell:
	 *
	 *   defaultVertex - Default style for vertices
	 *   defaultEdge - Default style for edges
	 *   
	 * Function: styles
	 * 
	 * Maps from names to styles.
	 */
	var $styles = array();

	/**
	 * Constructor: mxStylesheet
	 * 
	 * Constructs a new stylesheet and assigns default styles.
	 */
	function mxStylesheet()
	{
	 	$this->putDefaultVertexStyle($this->createDefaultVertexStyle());
	 	$this->putDefaultEdgeStyle($this->createDefaultEdgeStyle());
	}

	/**
	 * Function: createDefaultVertexStyle
	 * 
	 * Creates and returns the default vertex style.
	 */
	function createDefaultVertexStyle()
	{
	 	$style = array();
	 	
	 	$style[mxConstants::$STYLE_SHAPE] = mxConstants::$SHAPE_RECTANGLE;
	 	$style[mxConstants::$STYLE_PERIMETER] = mxPerimeter::$RectanglePerimeter;
	 	$style[mxConstants::$STYLE_VERTICAL_ALIGN] = mxConstants::$ALIGN_MIDDLE;
	 	$style[mxConstants::$STYLE_ALIGN] = mxConstants::$ALIGN_CENTER;
	 	$style[mxConstants::$STYLE_FILLCOLOR] = "#C3D9FF";
	 	$style[mxConstants::$STYLE_STROKECOLOR] = "#6482B9";
	 	$style[mxConstants::$STYLE_FONTCOLOR] = "#774400";
	 	
	 	return $style;
	}

	/**
	 * Function: createDefaultEdgeStyle
	 * 
	 * Creates and returns the default edge style.
	 */
	function createDefaultEdgeStyle()
	{
	 	$style = array();
	 	
		$style[mxConstants::$STYLE_SHAPE] = mxConstants::$SHAPE_CONNECTOR;
		$style[mxConstants::$STYLE_ENDARROW] = mxConstants::$ARROW_CLASSIC;
		$style[mxConstants::$STYLE_VERTICAL_ALIGN] = mxConstants::$ALIGN_MIDDLE;
		$style[mxConstants::$STYLE_ALIGN] = mxConstants::$ALIGN_CENTER;
		$style[mxConstants::$STYLE_STROKECOLOR] = "#6482B9";
		$style[mxConstants::$STYLE_FONTCOLOR] = "#446299";
	 	
	 	return $style;
	}
	
	/**
	 * Function: putDefaultVertexStyle
	 * 
	 * Sets the default style for vertices.
	 */
	function putDefaultVertexStyle($style)
	{
		$this->putCellStyle("defaultVertex", $style);
	}

	/**
	 * Function: putDefaultEdgeStyle
	 * 
	 * Sets the default style for edges.
	 */
	function putDefaultEdgeStyle($style)
	{
		$this->putCellStyle("defaultEdge", $style);
	}

	/**
	 * Function: getDefaultVertexStyle
	 * 
	 * Returns the default style for vertices.
	 */
	function getDefaultVertexStyle()
	{
		return $this->styles["defaultVertex"];
	}

	/**
	 * Function: getDefaultEdgeStyle
	 * 
	 * Sets the default style for edges.
	 */
	function getDefaultEdgeStyle()
	{
		return $this->styles["defaultEdge"];
	}
	
	/**
	 * Function: putCellStyle
	 * 
	 * Stores the specified style under the given name.
	 *
	 * Example:
	 * 
	 * The following example adds a new style (called 'rounded') into an
	 * existing stylesheet:
	 * 
	 * (code)
	 * var style = new Array();
	 * style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	 * style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RightAngleRectanglePerimeter;
	 * style[mxConstants.STYLE_ROUNDED] = 'true';
	 * graph.stylesheet.putCellStyle('rounded', style);
	 * (end)
	 * 
	 * In the above example, the new style is an array. The possible  keys of
	 * the array are all the constants in <mxConstants> that start with STYLE
	 * and the values are either JavaScript objects, such as
	 * <mxPerimeter.RightAngleRectanglePerimeter> (which is in fact a function)
	 * or expressions, such as 'true'. Note that not all keys will be
	 * interpreted by all shapes (eg. the line shape ignores the fill color).
	 * The final call to this method associates the style with a name in the
	 * stylesheet. The style is used in a cell with the following code:
	 * 
	 * (code)
	 * model.setStyle(cell, 'rounded');
	 * (end)
	 * 
	 * Parameters:
	 * 
	 * name - Name for the style to be stored.
	 * style - Key, value pairs that define the style.
	 */
	function putCellStyle($name, $style)
	{
		$this->styles[$name] = $style;
	}
	
	/**
	 * Function: getCellStyle
	 * 
	 * Returns the cell style for the specified cell or the given defaultStyle
	 * if no style can be found for the given stylename.
	 * 
	 * Parameters:
	 * 
	 * name - String of the form [(stylename|key=value);] that represents the
	 * style.
	 * defaultStyle - Default style to be returned if no style can be found.
	 */
	function getCellStyle($name, $defaultStyle = null)
	{
		$style = $defaultStyle;
		
		if ($name != null && strlen($name) > 0)
		{
			$pairs = explode(";", $name);

			if (isset($pairs))
			{
				if (isset($style) && $name{0} != ';')
				{
					$style = array_slice($style, 0);
				}
				else
				{
					$style = array();
				}
				
				for ($i = 0; $i < sizeof($pairs); $i++)
				{
					$tmp = $pairs[$i];
					$pos = strpos($pairs[$i], "=");
					
					if ($pos !== false)
					{
						$key = substr($tmp, 0, $pos);
						$value = substr($tmp, $pos+1);
						
						if ($value == mxConstants::$NONE)
						{
							unset($style[$key]);
						}
						else
						{
							$style[$key] = $value;
						}
					}
					else if (isset($this->styles[$tmp]))
					{
						$tmpStyle = $this->styles[$tmp];

						foreach ($tmpStyle as $key => $value)
						{
							$style[$key] = $value;
						}
					}
				}
			}
		}

		return $style;
	}

}
?>
