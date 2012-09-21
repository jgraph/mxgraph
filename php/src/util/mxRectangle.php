<?php
/**
 * $Id: mxRectangle.php,v 1.18 2010-12-15 16:28:52 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxRectangle extends mxPoint
{

	/**
	 * Class: mxRectangle
	 *
	 * Implements a 2-dimensional rectangle with double precision coordinates.
	 * 
	 * Variable: width
	 *
	 * Holds the width of the rectangle. Default is 0.
	 */
	var $width = 0;

	/**
	 * Variable: height
	 *
	 * Holds the height of the rectangle. Default is 0.
	 */
	var $height = 0;

	/**
	 * Constructor: mxRectangle
	 *
	 * Constructs a new rectangle for the optional parameters. If no parameters
	 * are given then the respective default values are used.
	 */
	function mxRectangle($x = 0, $y = 0, $width = 0, $height = 0)
	{
		parent::mxPoint($x, $y);
		
	 	$this->width = $width;
		$this->height = $height;
	}

	/**
	 * Function: setRect
	 *
	 * Sets this rectangle to the specified values.
	 */
	function setRect($x, $y, $width, $height)
	{
	    $this->x = $x;
	    $this->y = $y;
	    $this->width = $w;
	    $this->height = $h;
	}
	
	/**
	 * Function: getCenterX
	 * 
	 * Returns the x-coordinate of the center point.
	 */
	function getCenterX()
	{
		return $this->x + $this->width / 2;
	}
	
	/**
	 * Function: getCenterY
	 * 
	 * Returns the y-coordinate of the center point.
	 */
	function getCenterY()
	{
		return $this->y + $this->height / 2;
	}
	
	/**
	 * Function: add
	 *
	 * Adds the given rectangle to this rectangle.
	 */
	function add($rect)
	{
		if ($rect != null)
		{
			$minX = min($this->x, $rect->x);
			$minY = min($this->y, $rect->y);
			$maxX = max($this->x + $this->width, $rect->x + $rect->width);
			$maxY = max($this->y + $this->height, $rect->y + $rect->height);
			
			$this->x = $minX;
			$this->y = $minY;
			$this->width = $maxX - $minX;
			$this->height = $maxY - $minY;
		}
	}

	/**
	 * Function: grow
	 *
	 * Grows the rectangle by the given amount, that is, this method subtracts
	 * the given amount from the x- and y-coordinates and adds twice the amount
	 * to the width and height.
	 */
	function grow($amount)
	{
		$this->x -= $amount;
		$this->y -= $amount;
		$this->width += 2 * $amount;
		$this->height += 2 * $amount;
	}

	/**
	 * Function: equals
	 *
	 * Returns true if the given object equals this rectangle.
	 */
	function equals($obj)
	{
        if ($obj instanceof mxRectangle)
        {
            return $obj->x == $this->x && $obj->y == $this->y &&
            	$obj->width == $this->width && $obj->height = $this->height;
        }

        return false;
	}

	/**
	 * Function: copy
	 *
	 * Returns a copy of this <mxRectangle>.
	 */
	function copy()
	{
	 	return new mxRectangle($this->x, $this->y, $this->width, $this->height);
	}

}
?>
