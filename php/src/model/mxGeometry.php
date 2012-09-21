<?php
/**
 * $Id: mxGeometry.php,v 1.18 2010-06-29 12:05:42 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxGeometry extends mxRectangle
{

	/**
	 * Class: mxGeometry
	 *
	 * Represents the geometry of a cell. For vertices, the geometry consists
	 * of the x- and y-location, as well as the width and height. For edges,
	 * the edge either defines the source- and target-terminal, or the geometry
	 * defines the respective terminal points.
	 * 
	 * Variable: TRANSLATE_CONTROL_POINTS
	 * 
	 * Global switch to translate the points in translate. Default is true.
	 */
	public static $TRANSLATE_CONTROL_POINTS = true;

	/**
	 * Variable: alternateBounds
	 *
	 * Stores alternate values for x, y, width and height in a rectangle.
	 * Default is null.
	 */
	var $alternateBounds;

	/**
	 * Variable: sourcePoint
	 *
	 * Defines the source point of the edge. This is used if the corresponding
	 * edge does not have a source vertex. Otherwise it is ignored. Default is
	 * null.
	 */
	var $sourcePoint;
	
	/**
	 * Variable: targetPoint
	 *
	 * Defines the target point of the edge. This is used if the corresponding
	 * edge does not have a target vertex. Otherwise it is ignored. Default is
	 * null.
	 */
	var $targetPoint;
		
	/**
	 * Variable: points
	 *
	 * Array of <mxPoints> which specifies the control points along the edge.
	 * These points are the intermediate points on the edge, for the endpoints
	 * use <targetPoint> and <sourcePoint> or set the terminals of the edge to
	 * a non-null value. Default is null.
	 */
	var $points;
	
	/**
	 * Variable: offset
	 *
	 * Holds the offset of the label for edges. This is the absolute vector
	 * between the center of the edge and the top, left point of the label.
	 * Default is null.
	 */
	var $offset;

	/**
	 * Variable: relative
	 *
	 * Specifies if the coordinates in the geometry are to be interpreted as
	 * relative coordinates. Default is false. This is used to mark a geometry
	 * with an x- and y-coordinate that is used to describe an edge label
	 * position.
	 */
	var $relative = false;

	/**
	 * Constructor: mxGeometry
	 *
	 * Constructs a new object to describe the size and location
	 * of a vertex or the control points of an edge.
	 */
	function mxGeometry($x=0, $y=0, $width=0, $height=0)
	{
		parent::mxRectangle($x, $y, $width, $height);
	}

	/**
	 * Function: getTerminalPoint
	 * 
	 * Returns the <mxPoint> representing the source or target point of this
	 * edge. This is only used if the edge has no source or target vertex.
	 * 
	 * Parameters:
	 * 
	 * isSource - Boolean that specifies if the source or target point
	 * should be returned.
	 */
	function getTerminalPoint($isSource)
	{
		return ($isSource) ? $this->sourcePoint : $this->targetPoint;
	}
	
	/**
	 * Function: setTerminalPoint
	 * 
	 * Sets the <sourcePoint> or <targetPoint> to the given <mxPoint> and
	 * returns the new point.
	 * 
	 * Parameters:
	 * 
	 * point - Point to be used as the new source or target point.
	 * isSource - Boolean that specifies if the source or target point
	 * should be set.
	 */
	function setTerminalPoint($point, $isSource)
	{
		if ($isSource)
		{
			$this->sourcePoint = $point;
		}
		else
		{
			$this->targetPoint = $point;
		}
		
		return $point;
	}
	
	/**
	 * Function: translate
	 * 
	 * Translates the geometry by the specified amount. That is, <x> and <y>
	 * of the geometry, the <sourcePoint>, <targetPoint> and all elements of
	 * <points> are translated by the given amount. <x> and <y> are only
	 * translated if <relative> is false. If <TRANSLATE_CONTROL_POINTS> is
	 * false, then <points> are not modified by this function.
	 * 
	 * Parameters:
	 * 
	 * dx - Integer that specifies the x-coordinate of the translation.
	 * dy - Integer that specifies the y-coordinate of the translation.
	 */
	function translate($dx, $dy)
	{
		// Translates the geometry
		if (!$this->relative)
		{
			$this->x += $dx;
			$this->y += $dy;
		}
		
		// Translates the source point
		if ($this->sourcePoint != null)
		{
			$this->sourcePoint->x += $dx;
			$this->sourcePoint->y += $dy;
		}
		
		// Translates the target point
		if ($this->targetPoint != null)
		{
			$this->targetPoint->x += $dx;
			$this->targetPoint->y += $dy;
		}

		// Translate the control points
		if (mxGeometry::$TRANSLATE_CONTROL_POINTS &&
			$this->points != null)
		{
			$count = sizeof($this->points);
			
			for ($i = 0; $i < $count; $i++)
			{
				$pt = $this->points[i];
				
				$pt->x += $dx;
				$pt->y += $dy;
			}
		}
	}
	
	/**
	 * Function: copy
	 *
	 * Returns a copy of this <mxGeometry>.
	 */
	function copy()
	{
	 	$clone = new mxGeometry($this->x, $this->y, $this->width, $this->height);
				
		// Clones the points
		if ($this->points != null)
		{
			$clone->points = array();
			
			for ($i = 0; $i < sizeof($this->points); $i++)
			{
				array_push($clone->points, $this->points[$i]->copy());
			}
		}
		
		// Clones the alternatebounds
		if ($this->alternateBounds != null)
		{
			$clone->alternateBounds = $this->alternateBounds->copy();
		}
		
		// Clones the offset
		if ($this->offset != null)
		{
			$clone->offset = $this->offset->copy();
		}
		
		// Clones the source and targetpoint
		if ($this->sourcePoint != null)
		{
			$clone->sourcePoint = $this->sourcePoint->copy();
		}
		
		if ($this->targetPoint != null)
		{
			$clone->targetPoint = $this->targetPoint->copy();
		}

	 	$clone->relative = $this->relative;

		return $clone;
	}

}

?>
