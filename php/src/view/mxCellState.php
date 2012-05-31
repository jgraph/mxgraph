<?php
/**
 * $Id: mxCellState.php,v 1.20 2010-06-30 11:03:50 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxCellState extends mxRectangle
{
	
	/**
	 * Class: mxCellState
	 * 
	 * Represents the current state of a cell in a given <mxGraphView>.
	 * 
	 * Variable: view
	 * 
	 * Reference to the enclosing <mxGraphView>.
	 */
	var $view;
	
	/**
	 * Variable: cell
	 *
	 * Reference to the <mxCell> that is represented by this state.
	 */
	var $cell;
	
	/**
	 * Variable: style
	 * 
	 * Contains an array of key, value pairs that represent the style of the
	 * cell.
	 */
	var $style;

	/**
	 * Variable: invalid
	 * 
	 * Specifies if the state is invalid. Default is true.
	 */
	var $invalid = true;

	/**
	 * Variable: origin
	 *
	 * <mxPoint> that holds the origin for all child cells. Default is a new
	 * empty <mxPoint>.
	 */
	var $origin;
	
	/**
	 * Variable: absolutePoints
	 * 
	 * Holds an array of <mxPoints> that represent the absolute points of an
	 * edge.
	 */
	var $absolutePoints;

	/**
	 * Variable: absoluteOffset
	 *
	 * <mxPoint> that holds the absolute offset. For edges, this is the
	 * absolute coordinates of the label position. For vertices, this is the
	 * offset of the label relative to the top, left corner of the vertex. 
	 */
	var $absoluteOffset;
	
	/**
	 * Variable: terminalDistance
	 * 
	 * Caches the distance between the end points for an edge.
	 */
	var $terminalDistance;
	
	/**
	 * Variable: length
	 *
	 * Caches the length of an edge.
	 */
	var $length;
	
	/**
	 * Variable: segments
	 * 
	 * Array of numbers that represent the cached length of each segment of the
	 * edge.
	 */
	var $segments;
		
	/**
	 * Variable: labelBounds
	 * 
	 * Holds the rectangle which contains the label.
	 */
	var $labelBounds;
	
	/**
	 * Variable: boundingBox
	 * 
	 * Holds the largest rectangle which contains all rendering for this cell.
	 */
	var $boundingBox;

	/**
	 * Constructor: mxCellState
	 * 
	 * Constructs a new object that represents the current state of the given
	 * cell in the specified view.
	 * 
	 * Parameters:
	 * 
	 * view - <mxGraphView> that contains the state.
	 * cell - <mxCell> that this state represents.
	 * style - Array of key, value pairs that constitute the style.
	 */
	function mxCellState($view = null, $cell = null, $style = null)
	{
		$this->view = $view;
		$this->cell = $cell;
		$this->style = $style;
		
		$this->origin = new mxPoint();
		$this->absoluteOffset = new mxPoint();
	}

	/**
	 * Function: getPerimeterBounds
	 * 
	 * Returns the <mxRectangle> that should be used as the perimeter of the
	 * cell.
	 */
	function getPerimeterBounds($border = 0)
	{
		$bounds = new mxRectangle($this->x, $this->y, $this->width, $this->height);
		
		if ($border != 0)
		{
			$bounds->grow($border);
		}
		
		return $bounds;
	}
	
	/**
	 * Function: copy
	 *
	 * Returns a copy of this state where all members are deeply cloned
	 * except the view and cell references, which are copied with no
	 * cloning to the new instance.
	 */
	function copy()
	{
	 	$clone = new mxCellState($this->view, $this->cell, $this->style);

		// Clones the absolute points
		if ($this->absolutePoints != null)
		{
			$clone->absolutePoints = array();
			
			for ($i = 0; $i < sizeof($this->absolutePoints); $i++)
			{
				array_push($clone->absolutePoints, $this->absolutePoints[$i]->copy());
			}
		}

		if ($this->origin != null)
		{
			$clone->origin = $this->origin->copy();
		}

		if ($this->absoluteOffset != null)
		{
			$clone->absoluteOffset = $this->absoluteOffset->copy();
		}
	
		if ($this->labelBounds != null)
		{
			$clone->labelBounds = $this->labelBounds->copy();
		}
		
		if ($this->boundingBox != null)
		{
			$clone->boundingBox = $this->boundingBox->copy();
		}

		$clone->terminalDistance = $this->terminalDistance;
		$clone->segments = $this->segments;
		$clone->length = $this->length;
		$clone->x = $this->x;
		$clone->y = $this->y;
		$clone->width = $this->width;
		$clone->height = $this->height;
		
		return $clone;
	}

}

?>
