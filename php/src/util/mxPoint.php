<?php
/**
 * $Id: mxPoint.php,v 1.10 2010-01-02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxPoint
{

	/**
	 * Class: mxPoint
	 *
	 * Implements a 2-dimensional point with double precision coordinates.
	 * 
	 * Variable: x
	 *
	 * Holds the x-coordinate of the point. Default is 0.
	 */
	var $x = 0;

	/**
	 * Variable: y
	 *
	 * Holds the y-coordinate of the point. Default is 0.
	 */
	var $y = 0;

	/**
	 * Constructor: mxPoint
	 *
	 * Constructs a new point for the optional x and y coordinates. If no
	 * coordinates are given, then the default values for <x> and <y> are used.
	 */
	function mxPoint($x = 0, $y = 0)
	{
	 	$this->x = $x;
		$this->y = $y;
	}

	/**
	 * Function: equals
	 *
	 * Returns true if the given object equals this point.
	 */
	function equals($obj)
	{
        if ($obj instanceof mxPoint)
        {
            return $obj->x == $this->x &&
            	$obj->y == $this->y;
        }

        return false;
	}

	/**
	 * Function: copy
	 *
	 * Returns a copy of this <mxPoint>.
	 */
	function copy()
	{
	 	return new mxPoint($this->x, $this->y);
	}

}
?>
