<?php
/**
 * $Id: mxGraphView.php,v 1.108 2011-11-17 14:10:53 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxGraphView extends mxEventSource
{

	/**
	 * Class: mxGraphView
	 *
	 * Implements a view for the graph. Fires scale and translate events
	 * if one of the values change.
	 * 
	 * This class fires the following events:
	 * 
	 * mxEvent.SCALE fires after the scale was changed in setScale. The
	 * <code>scale</code> and <code>previousScale</code> arguments contain the
	 * new and previous scale.
	 * 
	 * mxEvent.TRANSLATE fires after the translate was changed in setTranslate. The
	 * <code>translate</code> and <code>previousTranslate</code> arguments contain
	 * the new and previous value for translate.
	 * 
	 * Variable: EMPTY_POINT
	 * 
	 * An empty <mxPoint> instance.
	 */
	var $EMPTY_POINT;

	/**
	 * Variable: graph
	 * 
	 * Holds the <mxGraph>.
	 */
	var $graph;
	
	/**
	 * Variable: graphBounds
	 * 
	 * Holds the bounds of the current view.
	 */
	var $graphBounds;
	
	/**
	 * Variable: scale
	 * 
	 * Holds the current scale.
	 */
	var $scale = 1;
	
	/**
	 * Variable: translate
	 * 
	 * Holds the current translate.
	 */
	var $translate;
	
	/**
	 * Variable: states
	 * 
	 * Maps from cells to states.
	 */
	var $states = array();

	/**
	 * Constructor: mxGraphView
	 * 
	 * Constructs a new view for the specified <mxGraph>.
	 */
	function mxGraphView($graph)
	{
		$this->EMPTY_POINT = new mxPoint();
		$this->graph = $graph;
		$this->translate = new mxPoint();
		$this->graphBounds = new mxRectangle();
	}

	/**
	 * Function: setScale
	 * 
	 * Sets the scale, revalidates the view and fires
	 * a scale event.
	 */
	function setScale($scale)
	{
		$previous = $this->scale;
		
		if ($this->scale != $scale)
		{
			$this->scale = $scale;
			$this->revalidate();
		}
			
		$this->fireEvent(new mxEventObject(mxEvent::$SCALE, "scale", $scale, "previousScale", $previous));
	}

	/**
	 * Function: setTranslate
	 * 
	 * Sets the translation, revalidates the view and
	 * fires a translate event.
	 */
	function setTranslate($translate)
	{
		$previous = $this->translate;
		
		if ($this->translate->x != $translate->x ||
			$this->translate->y != $translate->y)
		{
			$this->translate = $translate;
			$this->revalidate();
		}
			
		$this->fireEvent(new mxEventObject(mxEvent::$TRANSLATE, "translate", $translate, "previousTranslate", $previous));
	}

	/**
	 * Function: getGraphBounds
	 * 
	 * Returns <graphBounds>.
	 */
    function getGraphBounds()
    {
    	return $this->graphBounds;
    }

	/**
	 * Function: setGraphBounds
	 * 
	 * Sets <graphBounds>.
	 */
    function setGraphBounds($value)
    {
    	$this->graphBounds = $value;
    }

    /**
     * Function: getBoundingBox
     * 
     * Returns the bounding for for an array of cells or null, if no cells are
     * specified.
     */
    function getBoundingBox($cells)
    {
    	return $this->getBounds($cells, true);
    }

	/**
	 * Function: getBounds
	 * 
	 * Returns the bounding for for an array of cells or null, if no cells are
	 * specified.
	 */
    function getBounds($cells, $boundingBox = false)
    {
    	$cellCount = sizeof($cells);
    	$result = null;
    	
        if ($cellCount > 0)
        {
        	$model = $this->graph->getModel();
        
			for ($i = 0; $i < $cellCount; $i++)
			{
				if ($model->isVertex($cells[$i]) || $model->isEdge($cells[$i]))
				{
	            	$state = $this->getState($cells[$i]);
	
		            if ($state != null)
		            {
		            	$bounds = ($boundingBox) ? $state->boundingBox : $state;
		            	
		            	if ($bounds != null)
		            	{
			            	if ($result == null)
			            	{
			            		$result = new mxRectangle($bounds->x, $bounds->y,
			            			$bounds->width, $bounds->height);
			            	}
							else
			                {
			                	$result->add($bounds);
			                }
		            	}
		            }
		    	}
			}
        }

        return $result;
    }

	/**
	 * Function: invalidate
	 */
	function revalidate()
	{
		$this->invalidate();
		$this->validate();
	}

	/**
	 * Function: invalidate
	 * 
	 * Invalidates the cached cell states.
	 */
	function invalidate()
	{
		// LATER: Invalidate cell states recursively
		$this->states = array();
	}

	/**
	 * Function: validate
	 * 
	 * Calls <validateBounds> followed by <validatePoints> on
	 * the root cell if the cache is invalid.
	 */
	function validate($cell = null)
	{
	 	if ($cell == null)
	 	{
	 		$cell = $this->graph->model->root;
	 	}
	 	
	 	// Checks if cache is invalid
	 	if ($cell != null && sizeof($this->states) == 0)
	 	{
		 	$this->validateBounds(null, $cell);
		 	$bounds = $this->validatePoints(null, $cell);
		 	
		 	if (!isset($bounds))
		 	{
		 		$bounds = new mxRectangle();
		 	}
		 	
		 	$this->setGraphBounds($bounds);
		}
	}

	/**
	 * Function: validateBounds
	 * 
	 * Validates the bounds of the cell state for the specified cell
	 * recursively, for all children if the cell is not collapsed.
	 */
	function validateBounds($parentState, $cell)
	{
		$model = $this->graph->getModel();
	 	$state = $this->getState($cell, true);
	 	
	 	if ($state != null)
	 	{
	 		if (!$this->graph->isCellVisible($cell))
	 		{
	 			$this->removeState($cell);
	 		}
	 		else if ($parentState != null)
	 		{
				$state->absoluteOffset->x = 0;
				$state->absoluteOffset->y = 0;
	 			$state->origin->x = $parentState->origin->x;
	 			$state->origin->y = $parentState->origin->y;
	 			$geo = $this->graph->getCellGeometry($cell);
	 			
	 			if ($geo != null)
	 			{
		 			if (!$model->isEdge($cell))
		 			{
		 				$origin = $state->origin;
		 				$offset = $geo->offset;
		 				
		 				if ($offset == null)
		 				{
		 					$offset = $this->EMPTY_POINT;
		 				}
		 				
		 				if ($geo->relative)
		 				{
		 					$origin->x += $geo->x * $parentState->width /
		 						$this->scale+ $offset->x;
		 					$origin->y += $geo->y * $parentState->height /
		 						$this->scale + $offset->y;
		 				}
		 				else
		 				{
		 					$state->absoluteOffset = new mxPoint(
		 						$this->scale * $offset->x,
		 						$this->scale * $offset->y);
			 				$origin->x += $geo->x;
			 				$origin->y += $geo->y;
			 			}
		 			}
	
		            // Updates the cell state's bounds
			 		$trl = $this->translate;
			 		$state->x = $this->scale * ($trl->x + $state->origin->x);
			 		$state->y = $this->scale * ($trl->y + $state->origin->y);
			 		$state->width = $this->scale * $geo->width;
			 		$state->height = $this->scale * $geo->height;
			 		
			 		if ($model->isVertex($cell))
			 		{
			 			$this->updateVertexLabelOffset($state);
			 		}
		 		}
	 		}

 			// Applies Offset
 			$offset = $this->graph->getChildOffsetForCell($cell);
 			
 			if ($offset != null)
 			{
 				$state->origin->x += $offset->x;
 				$state->origin->y += $offset->y;
 			}
	 	}
	 	
	 	if ($state != null && !$this->graph->isCellCollapsed($cell))
	 	{
	 		$childCount = $model->getChildCount($cell);
	 		
	 		for ($i = 0; $i < $childCount; $i++)
	 		{
	 			$this->validateBounds($state, $model->getChildAt($cell, $i));
	 		}
	 	}
	}
	
	/**
	 * Function: updateVertexLabelOffset
	 * 
	 * Updates the absoluteOffset of the given vertex cell state. This takes
	 * into account the label position styles.
	 * 
	 * Parameters:
	 * 
	 * state - <mxCellState> whose absolute offset should be updated.
	 */
	function updateVertexLabelOffset($state)
	{
		$horizontal = mxUtils::getValue($state->style,
				mxConstants::$STYLE_LABEL_POSITION,
				mxConstants::$ALIGN_CENTER);
		
		if ($horizontal == mxConstants::$ALIGN_LEFT)
		{
			$state->absoluteOffset->x -= $state->width;
		}
		else if ($horizontal == mxConstants::$ALIGN_RIGHT)
		{
			$state->absoluteOffset->x += $state->width;
		}
		
		$vertical = mxUtils::getValue($state->style,
				mxConstants::$STYLE_VERTICAL_LABEL_POSITION,
				mxConstants::$ALIGN_MIDDLE);
		
		if ($vertical == mxConstants::$ALIGN_TOP)
		{
			$state->absoluteOffset->y -= $state->height;
		}
		else if ($vertical == mxConstants::$ALIGN_BOTTOM)
		{
			$state->absoluteOffset->y += $state->height;
		}
	}

	/**
	 * Function: validatePoints
	 * 
	 * Validates the points of the cell state for the specified cell
	 * recursively, for all children if the cell is not collapsed.
	 */
	function validatePoints($parentState, $cell)
	{
	 	$model = $this->graph->model;
		$state = $this->getState($cell);
		$bbox = null;
	 	
	 	if (isset($state))
	 	{
			$geo = $this->graph->getCellGeometry($cell);
	 	
	 		if (isset($geo) && $model->isEdge($cell))
	 		{
				// Updates the points on the source terminal if its an edge
	 			$source = $this->getState($this->getVisibleTerminal($cell, true));

	 			if (isset($source) && $model->isEdge($source->cell) &&
	 				!$model->isAncestor($source, $cell))
	 			{
					$tmp = $this->getState($model->getParent($source->cell));
					$this->validatePoints($tmp, $source->cell);
	 			}

				// Updates the points on the target terminal if its an edge
	 			$target = $this->getState($this->getVisibleTerminal($cell, false));
	 			
	 			if (isset($target) && $model->isEdge($target->cell) &&
	 				!$model->isAncestor($target, $cell))
	 			{
					$tmp = $this->getState($model->getParent($target->cell));
					$this->validatePoints($tmp, $target->cell);
	 			}

	 			$this->updateFixedTerminalPoints($state, $source, $target);
	 			$this->updatePoints($state, $geo->points, $source, $target);
	 			$this->updateFloatingTerminalPoints($state, $source, $target);
	 			$this->updateEdgeBounds($state);
	 			$state->absoluteOffset = $this->getPoint($state, $geo);
	 		}
	 		else if ($geo != null && $geo->relative && $parentState != null &&
	 			$model->isEdge($parentState->cell))
	 		{
	 			$origin = $this->getPoint($parentState, $geo);
	 			
	 			if (isset($origin))
	 			{
					$state->x = $origin->x;
	 				$state->y = $origin->y;
	 				
					$origin->x = ($origin->x / $this->scale) - $this->translate->x;
					$origin->y = ($origin->y / $this->scale) - $this->translate->y;
		 			$state->origin = $origin;
		 			
		 			$this->childMoved($parentState, $state);
				 }
	 		}
	 		
		 	if ($model->isEdge($cell) || $model->isVertex($cell))
		 	{
		 		$this->updateLabelBounds($state);
		 		$bbox = $this->updateBoundingBox($state)->copy();
		 	}
	 	}
	 	
	 	if (isset($state) && !$this->graph->isCellCollapsed($cell))
	 	{
	 		$childCount = $cell->getChildCount();
	 		
	 		for ($i = 0; $i < $childCount; $i++)
	 		{
	 			$child = $cell->getChildAt($i);
	 			$bounds = $this->validatePoints($state, $child);
	 			
				if (isset($bounds))
				{
					if (!isset($bbox))
					{
						$bbox = $bounds;
					}
					else
					{
						$bbox->add($bounds);
					}
				}
	 		}
		}
		
		return $bbox;
	}

	/**
	 * Function: childMoved
	 *
	 * Invoked when a child state was moved as a result of late evaluation
	 * of its position. This is invoked for relative edge children whose
	 * position can only be determined after the points of the parent edge
	 * are updated in validatePoints, and validates the bounds of all
	 * descendants of the child using validateBounds.
	 * 
	 * Parameters:
	 * 
	 * parent - <mxCellState> that represents the parent state.
	 * child - <mxCellState> that represents the child state.
	 */
    function childMoved($parent, $child)
    {
        $cell = $child->cell;
		
		// Children of relative edge children need to validate
		// their bounds after their parent state was updated
		if (!$this->graph->isCellCollapsed($cell))
		{
			$model = $this->graph->getModel();
			$childCount = $model->getChildCount($cell);

			for ($i = 0; $i < $childCount; $i++)
			{
				$this->validateBounds($child, $model->getChildAt($cell, $i));
			}
		}
    }

	/**
	 * Function: updateBoundingBox
	 * 
	 * Updates the label bounds in the given state.
	 */
    function updateLabelBounds($state)
    {
        $cell = $state->cell;
        $style = $state->style;
        
        if (mxUtils::getValue($style, mxConstants::$STYLE_OVERFLOW) == "fill")
		{
			$state->labelBounds = new mxRectangle($state->x, $state->y, $state->width, $state->height);
		}
		else
		{
	        $label = $this->graph->getLabel($cell);
    	    $vertexBounds = (!$this->graph->model->isEdge($cell)) ? $state : null;
        	$state->labelBounds = mxUtils::getLabelPaintBounds($label, $style,
        		false, $state->absoluteOffset, $vertexBounds, $this->scale);
		}
    }

	/**
	 * Function: updateBoundingBox
	 * 
	 * Updates the bounding box in the given cell state.
	 */
	function updateBoundingBox($state)
	{
        // Gets the cell bounds and adds shadows and markers
        $rect = new mxRectangle($state->x, $state->y, $state->width, $state->height);
        $style = $state->style;

        // Adds extra pixels for the marker and stroke assuming
        // that the border stroke is centered around the bounds
        // and the first pixel is drawn inside the bounds
        $strokeWidth = max(1, mxUtils::getNumber($style,
            mxConstants::$STYLE_STROKEWIDTH, 1) * $this->scale);
        $strokeWidth -= max(1, $strokeWidth / 2);

        if ($this->graph->model->isEdge($state->cell))
        {
			$ms = 0;

            if (isset($style[mxConstants::$STYLE_ENDARROW])
                    || isset($style[mxConstants::$STYLE_STARTARROW]))
            {
                $ms = round(mxConstants::$DEFAULT_MARKERSIZE * $this->scale);
            }

            // Adds the strokewidth
           	$rect->grow($ms + $strokeWidth);

            // Adds worst case border for an arrow shape
            if (mxUtils::getValue($style, mxConstants::$STYLE_SHAPE) ==
                    mxConstants::$SHAPE_ARROW)
            {
                $rect->grow(mxConstants::$ARROW_WIDTH / 2);
            }
        }
        else
        {
        	$rect->grow($strokeWidth);
        }

        // Adds extra pixels for the shadow
        if (mxUtils::getValue($style, mxConstants::$STYLE_SHADOW, false) == true)
        {
            $rect->width += mxConstants::$SHADOW_OFFSETX;
            $rect->height += mxConstants::$SHADOW_OFFSETY;
        }

        // Adds oversize images in labels
        if (mxUtils::getValue($style, mxConstants::$STYLE_SHAPE) ==
        	mxConstants::$SHAPE_LABEL)
        {
            if (mxUtils::getValue($style, mxConstants::$STYLE_IMAGE) != null)
            {
                $w = mxUtils::$getValue($style,
                        mxConstants::$STYLE_IMAGE_WIDTH,
                        mxConstants::$DEFAULT_IMAGESIZE) * $this->scale;
                $h = mxUtils::$getValue($style,
                        mxConstants::$STYLE_IMAGE_HEIGHT,
                        mxConstants::$DEFAULT_IMAGESIZE) * $this->scale;

                $x = $state->x;
                $y = 0;

                $imgAlign = mxUtils::getValue($style, mxConstants::$STYLE_IMAGE_ALIGN,
                                mxConstants::$ALIGN_CENTER);
                $imgValign = mxUtils::getValue(style,
                        mxConstants::$STYLE_IMAGE_VERTICAL_ALIGN,
                        mxConstants::$ALIGN_MIDDLE);

                if ($imgAlign == mxConstants::$ALIGN_RIGHT)
                {
                    $x += $state->width - $w;
                }
                else if ($imgAlign == mxConstants::$ALIGN_CENTER)
                {
                    $x += ($state->width - $w) / 2;
                }

                if ($imgValign == mxConstants::$ALIGN_TOP)
                {
                    $y = $state->y;
                }
                else if ($imgValign == mxConstants::$ALIGN_BOTTOM)
                {
                    $y = $state->y + $state->height - $h;
                }
                else
                {
                    $y = $state->y + ($state->height - $h) / 2;
                }

                $rect->add(new mxRectangle($x, $y, $w, $h));
            }
        }
        
        // No need to add rotated rectangle bounds here because
        // GD does not support rotation

        // Unifies the cell bounds and the label bounds
		$rect->add($state->labelBounds);
        $state->boundingBox = $rect;

        return $rect;
    }

	/**
	 * Function: updateFixedTerminalPoints
	 *
	 * Sets the initial absolute terminal points in the given state before the edge
	 * style is computed.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> whose initial terminal points should be updated.
	 * source - <mxCellState> which represents the source terminal.
	 * target - <mxCellState> which represents the target terminal.
	 */
	function updateFixedTerminalPoints($edge, $source, $target)
	{
		$this->updateFixedTerminalPoint($edge, $source, true,
			$this->graph->getConnectionConstraint($edge, $source, true));
		$this->updateFixedTerminalPoint($edge, $target, false,
			$this->graph->getConnectionConstraint($edge, $target, false));
	}

	/**
	 * Function: updateFixedTerminalPoint
	 *
	 * Sets the fixed source or target terminal point on the given edge.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> whose terminal point should be updated.
	 * terminal - <mxCellState> which represents the actual terminal.
	 * source - Boolean that specifies if the terminal is the source.
	 * constraint - <mxConnectionConstraint> that specifies the connection.
	 */
	function updateFixedTerminalPoint($edge, $terminal, $source, $constraint)
	{
		$pt = null;
		
		if (isset($constraint))
		{
			$pt = $this->graph->getConnectionPoint($terminal, $constraint);
		}
		
		if (!isset($pt) && !isset($terminal))
		{
			$s = $this->scale;
			$tr = $this->translate;
			$orig = $edge->origin;
			$geo = $this->graph->getCellGeometry($edge->cell);
			$pt = $geo->getTerminalPoint($source);
			
			if (isset($pt))
			{
				$pt = new mxPoint($s * ($tr->x + $pt->x + $orig->x),
					$s * ($tr->y + $pt->y + $orig->y));
			}
		}

		if (!is_array($edge->absolutePoints))
		{
			$edge->absolutePoints = array();
		}

		$n = sizeof($edge->absolutePoints);
		
		if ($source)
		{
			if ($n > 0)
			{
				$state->absolutePoints[0] = $pt;
			}
			else
			{
				array_push($edge->absolutePoints, $pt);
			}
		}
		else
		{
			$n = sizeof($edge->absolutePoints);
			
			if ($n > 1)
			{
				$edge->absolutePoints[$n - 1] = $pt;
			}
			else
			{
				array_push($edge->absolutePoints, $pt);
			}
		}
	}

	/**
	 * Function: updatePoints
	 *
	 * Updates the absolute points in the given state using the specified array
	 * of <mxPoints> as the relative points.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> whose absolute points should be updated.
	 * points - Array of <mxPoints> that constitute the relative points.
	 * source - <mxCellState> that represents the source terminal.
	 * target - <mxCellState> that represents the target terminal.
	 */
	function updatePoints($edge, $points, $source, $target)
	{
		if (isset($edge))
		{
			$pts = array();
			array_push($pts, $edge->absolutePoints[0]);
			$edgeStyle = $this->getEdgeStyle($edge, $points, $source, $target);

			if (isset($edgeStyle))
			{
				$src = $this->getTerminalPort($edge, $source, true);
				$trg = $this->getTerminalPort($edge, $target, false);

				$edgeStyle->apply($edge, $src, $trg, $points, $pts);
			}
			else if (isset($points))
			{
				for ($i = 0; $i < sizeof($points); $i++)
				{
					if (isset($points[$i]))
					{
						$pt = $points[$i]->copy();
						array_push($pts, $this->transformControlPoint($edge, $pt));
					}
				}
			}
			
			$n = sizeof($edge->absolutePoints);
			array_push($pts, $edge->absolutePoints[$n-1]);

			$edge->absolutePoints = $pts;
		}
	}
	
	/**
	 * Function: transformControlPoint
	 *
	 * Transforms the given control point to an absolute point.
	 */
    function transformControlPoint($state, $pt)
    {
    	$orig = $state->origin;
    
        return new mxPoint($this->scale * ($pt->x + $this->translate->x + $orig->x),
        	$this->scale * ($pt->y + $this->translate->y + $orig->y));
    }
    
	/**
	 * Function: getEdgeStyle
	 *
	 * Returns the edge style function to be used to render the given edge
	 * state.
	 */
	function getEdgeStyle($edge, $points, $source, $target)
	{
		$edgeStyle = null;
		
		if (isset($source) && $source === $target)
		{
			$edgeStyle = mxUtils::getValue($edge->style, mxConstants::$STYLE_LOOP);
			
			if (!isset($edgeStyle))
			{
				$edgeStyle = $this->graph->defaultLoopStyle;
			}
		}
		else if (!mxUtils::getValue($edge->style, mxConstants::$STYLE_NOEDGESTYLE, false))
		{
			$edgeStyle = mxUtils::getValue($edge->style, mxConstants::$STYLE_EDGE);
		}
		
		// Converts string values to objects
		if (is_string($edgeStyle))
		{
			$tmp = mxStyleRegistry::getValue($edgeStyle);
			
			if ($tmp == null && strpos($edgeStyle, ".") !== false)
			{
				$tmp = mxUtils::evaluate($edgeStyle);
			}
			
			$edgeStyle = $tmp;
		}
		
		if ($edgeStyle instanceof mxEdgeStyleFunction)
		{
			return $edgeStyle;
		}
		
		return null;
	}

	/**
	 * Function: updateFloatingTerminalPoints
	 *
	 * Updates the terminal points in the given state after the edge style was
	 * computed for the edge.
	 * 
	 * Parameters:
	 * 
	 * state - <mxCellState> whose terminal points should be updated.
	 * source - <mxCellState> that represents the source terminal.
	 * target - <mxCellState> that represents the target terminal.
	 */
	function updateFloatingTerminalPoints($state, $source, $target)
	{
		$pts = $state->absolutePoints;
		$p0 = $pts[0];
		$pe = $pts[sizeof($pts) - 1];
		
		if (!isset($pe) && isset($target))
		{
			$this->updateFloatingTerminalPoint($state, $target, $source, false);
		}
		
		if (!isset($p0) && isset($source))
		{
			$this->updateFloatingTerminalPoint($state, $source, $target, true);
		}
	}

	/**
	 * Function: updateFloatingTerminalPoint
	 *
	 * Updates the absolute terminal point in the given state for the given
	 * start and end state, where start is the source if source is true.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> whose terminal point should be updated.
	 * start - <mxCellState> for the terminal on "this" side of the edge.
	 * end - <mxCellState> for the terminal on the other side of the edge.
	 * source - Boolean indicating if start is the source terminal state.
	 */
	function updateFloatingTerminalPoint($edge, $start, $end, $source)
	{
		$start = $this->getTerminalPort($edge, $start, $source);
		$next = $this->getNextPoint($edge, $end, $source);
		$border = mxUtils::getNumber($edge->style, mxConstants::$STYLE_PERIMETER_SPACING);
		$border = mxUtils::getNumber($edge->style, ($source) ?
			mxConstants::$STYLE_SOURCE_PERIMETER_SPACING :
			mxConstants::$STYLE_TARGET_PERIMETER_SPACING);
		$pt = $this->getPerimeterPoint($start, $next, $this->graph->isOrthogonal($edge), $border);
	 	$index = ($source) ? 0 : sizeof($edge->absolutePoints) - 1;
	 	$edge->absolutePoints[$index] = $pt;
	}

	/**
	 * Function: getTerminalPort
	 * 
	 * Returns an <mxCellState> that represents the source or target terminal or
	 * port for the given edge.
	 * 
	 * Parameters:
	 * 
	 * state - <mxCellState> that represents the state of the edge.
	 * terminal - <mxCellState> that represents the terminal.
	 * source - Boolean indicating if the given terminal is the source terminal.
	 */
	function getTerminalPort($state, $terminal, $source)
	{
		$key = ($source) ? mxConstants::$STYLE_SOURCE_PORT
				: mxConstants::$STYLE_TARGET_PORT;
		$id = mxUtils::getValue($state->style, $key);

		if ($id != null)
		{
			$tmp = $this->getState($this->graph->model->getCell($id));

			// Only uses ports where a cell state exists
			if (isset($tmp))
			{
				$terminal = $tmp;
			}
		}
		
		return $terminal;
	}
	
	/**
	 * Function: getPerimeterPoint
	 *
	 * Returns an <mxPoint> that defines the location of the intersection point between
	 * the perimeter and the line between the center of the shape and the given point.
	 * 
	 * Parameters:
	 * 
	 * terminal - <mxCellState> for the source or target terminal.
	 * next - <mxPoint> that lies outside of the given terminal.
	 * orthogonal - Boolean that specifies if the orthogonal projection onto
	 * the perimeter should be returned. If this is false then the intersection
	 * of the perimeter and the line between the next and the center point is
	 * returned.
	 * border - Optional border between the perimeter and the shape.
	 */
	function getPerimeterPoint($terminal, $next, $orthogonal, $border = null)
	{
		$point = null;
		
		if ($terminal != null)
		{
			$perimeter = $this->getPerimeterFunction($terminal);
			
			if (isset($perimeter) && isset($next))
			{
				$bounds = $this->getPerimeterBounds($terminal, $border);
				
				if ($bounds->width > 0 || $bounds->height > 0)
				{
					$point = $perimeter->apply($bounds,	$terminal, $next, $orthogonal);
				}
			}
			
			if (!isset($point))
			{
				$point = $this->getPoint($terminal);
			}
		}

	 	return $point;
	}
		
	/**
	 * Function: getRoutingCenterX
	 * 
	 * Returns the x-coordinate of the center point for automatic routing.
	 */
	function getRoutingCenterX($state)
	{
		$f = ($state->style != null) ? mxUtils::getNumber($state->style,
			mxConstants::$STYLE_ROUTING_CENTER_X) : 0;
	
		return $state->getCenterX() + $f * $state->width;
	}
	
	/**
	 * Function: getRoutingCenterY
	 * 
	 * Returns the y-coordinate of the center point for automatic routing.
	 */
	function getRoutingCenterY($state)
	{
		$f = ($state->style != null) ? mxUtils::getNumber($state->style,
			mxConstants::$STYLE_ROUTING_CENTER_Y) : 0;
	
		return $state->getCenterY() + $f * $state->height;
	}

	/**
	 * Function: getPerimeterBounds
	 *
	 * Returns the perimeter bounds for the given terminal, edge pair as an
	 * <mxRectangle>.
	 * 
	 * Parameters:
	 * 
	 * terminal - <mxCellState> that represents the terminal.
	 * border - Number that adds a border between the shape and the perimeter.
	 */
	function getPerimeterBounds($terminal, $border = 0)
	{
		if ($terminal != null)
		{
			$border += mxUtils::getNumber($terminal->style, mxConstants::$STYLE_PERIMETER_SPACING);
		}

		return $terminal->getPerimeterBounds($border * $this->scale);
	}

	/**
	 * Function: getPerimeterFunction
	 * 
	 * Returns the perimeter function for the given state.
	 */
	function getPerimeterFunction($state)
	{
		$perimeter = mxUtils::getValue($state->style, mxConstants::$STYLE_PERIMETER);
		
		// Converts string values to objects
		if (is_string($perimeter))
		{
			$tmp = mxStyleRegistry::getValue($perimeter);
			
			if ($tmp == null && strpos($perimeter, ".") !== false)
			{
				$tmp = mxUtils::evaluate($perimeter);
			}
			
			$perimeter = $tmp;
		}
		
		if ($perimeter instanceof mxPerimeterFunction)
		{
			return $perimeter;
		}
		
		return null;
	}

	/**
	 * Function: getNextPoint
	 *
	 * Returns the nearest point in the list of absolute points or the center
	 * of the opposite terminal.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> that represents the edge.
	 * opposite - <mxCellState> that represents the opposite terminal.
	 * source - Boolean indicating if the next point for the source or target
	 * should be returned.
	 */
	function getNextPoint($edge, $opposite, $source)
	{
		$pts = $edge->absolutePoints;
		$point = null;
		
		if ($pts != null && ($source || sizeof($pts) > 2 || !isset($opposite)))
		{
			$count = sizeof($pts);
			$index = ($source) ? min(1, $count - 1) : max(0, $count - 2);
			$point = $pts[$index];
		}
		
		if (!isset($point) && isset($opposite))
		{
			$point = new mxPoint($opposite->getCenterX(), $opposite->getCenterY());
		}

	 	return $point;
	}

	/**
	 * Function: getVisibleTerminal
	 *
	 * Returns the nearest ancestor terminal that is visible. The edge appears
	 * to be connected to this terminal on the display.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCell> whose visible terminal should be returned.
	 * source - Boolean that specifies if the source or target terminal
	 * should be returned.
	 */
	function getVisibleTerminal($edge, $source)
	{
	 	$model = $this->graph->model;
	 	$result = $model->getTerminal($edge, $source);
	 	$best = $result;
	 	
	 	while ($result != null)
	 	{
	 		if (!$this->graph->isCellVisible($best)||
	 			$this->graph->isCellCollapsed($result))
	 		{
	 			$best = $result;
	 		}
	 		
	 		$result = $model->getParent($result);
	 	}

		// Checks if the result is not a layer
		if ($model->getParent($best) === $model->getRoot())
		{
			$best = null;
		}
		
	 	return $best;
	}

	/**
	 * Function: updateEdgeBounds
	 * 
	 * Updates the bounds of the specified state based on the
	 * absolute points in the state.
	 */
	function updateEdgeBounds($state)
	{
	 	$points = $state->absolutePoints;

	 	if ($points != null && sizeof($points) > 0)
	 	{
	 		$p0 = $points[0];
	 		$n = sizeof($points);
	 		$pe = $points[$n-1];
	 		
	 		if ($p0 == null ||
	 			$pe == null)
	 		{
	 			$this->removeState($state->cell);
	 		}
	 		else
	 		{
		 		if ($p0->x != $pe->x ||
		 			$p0->y != $pe->y)
		 		{
		 			$dx = $pe->x - $p0->x;
		 			$dy = $pe->y - $p0->y;
		 			$state->terminalDistance = sqrt($dx*$dx+$dy*$dy);
		 		}
		 		else
		 		{
		 			$state->terminalDistance = 0;
		 		}
		 		
		 		$length = 0;
				$segments = array();
		 		$pt = $p0;
		 		
		 		if ($pt != null)
		 		{
		 			$minX = $pt->x;
		 			$minY = $pt->y;
		 			$maxX = $minX;
		 			$maxY = $minY;
		 			
		 			for ($i=1; $i<$n; $i++)
		 			{
		 				$tmp = $points[$i];
		 				if ($tmp != null)
		 				{
		 					$dx = $pt->x - $tmp->x;
		 					$dy = $pt->y - $tmp->y;
	
							$segment = sqrt($dx*$dx+$dy*$dy);
							array_push($segments, $segment);
		 					$length += $segment;
		 					$pt = $tmp;
	
		 					$minX = min($pt->x, $minX);
		 					$minY = min($pt->y, $minY);
		 					$maxX = max($pt->x, $maxX);
		 					$maxY = max($pt->y, $maxY);
		 				}
		 			}
		 			
		 			$state->length = $length;
		 			$state->segments = $segments;
		 			
		 			$state->x = $minX;
		 			$state->y = $minY;
		 			$state->width = $maxX - $minX;
		 			$state->height = $maxY - $minY;
		 		}
			}
		}
	}

	/**
	 * Function: getPoint
	 *
	 * Returns the absolute point on the edge for the given relative
	 * <mxGeometry> as an <mxPoint>. The edge is represented by the given
	 * <mxCellState>.
	 * 
	 * Parameters:
	 * 
	 * state - <mxCellState> that represents the state of the parent edge.
	 * geometry - <mxGeometry> that represents the relative location.
	 */
	function getPoint($state, $geometry = null)
	{
        $x = $state->getCenterX();
        $y = $state->getCenterY();

        if (isset($state->segments) && (!isset($geometry) || $geometry->relative))
        {
            $gx = (isset($geometry)) ? $geometry->x / 2 : 0;
            $pointCount = sizeof($state->absolutePoints);
            $dist = ($gx + 0.5) * $state->length;
            $segments = $state->segments;
            $segment = $segments[0];
            $length = 0;
            $index = 1;

            while ($dist > $length + $segment && $index < $pointCount - 1)
            {
                $length += $segment;
                $segment = $segments[$index++];
            }

			$factor = ($segment == 0) ? 0 : ($dist - $length) / $segment;
			$p0 = $state->absolutePoints[$index - 1];
			$pe = $state->absolutePoints[$index];

			if ($p0 != null && $pe != null)
			{
				$gy = 0;
				$offsetX = 0;
				$offsetY = 0;

				if (isset($geometry))
				{
					$gy = $geometry->y;
					$offset = $geometry->offset;

					if (isset($offset))
					{
						$offsetX = $offset->x;
						$offsetY = $offset->y;
					}
				}

				$dx = $pe->x - $p0->x;
				$dy = $pe->y - $p0->y;
				$nx = ($segment == 0) ? 0 : $dy / $segment;
				$ny = ($segment == 0) ? 0 : $dx / $segment;

				$x = $p0->x + $dx * $factor + ($nx * $gy + $offsetX) * $this->scale;
				$y = $p0->y + $dy * $factor - ($ny * $gy - $offsetY) * $this->scale;
            }
        }
        else if (isset($geometry))
        {
            $offset = $geometry->offset;

            if (isset($offset))
            {
                $x += $offset->x;
                $y += $offset->y;
            }
        }

        return new mxPoint($x, $y);
	}

	/**
	 * Function: getState
	 * 
	 * Returns the cell state for the specified cell. If
	 * create is true then the state is created and added
	 * to the cache if it does not yet exist.
	 */
	function getState($cell, $create = false)
	{
	 	$state = null;
	 	
	 	if ($cell != null)
	 	{
	 		$id = $this->getHashCode($cell);
		 	$state = (isset($this->states[$id])) ?
		 		$this->states[$id] : null;
		 	
		 	if ($state == null && $create &&
		 		$this->graph->isCellVisible($cell))
		 	{
				$state = $this->createState($cell);
				$this->states[$id] = $state;
		 	}
		}

	 	return $state;
	}
	
	/**
	 * Function: getHashCode
	 *
	 * Returns a unique string that represents the given instance.
	 */
	function getHashCode($cell)
	{
	 	// PHP >= 5.2
		if (function_exists("spl_object_hash"))
		{
			return spl_object_hash($cell);
		}
		else
		{
			return (string) $cell;
		}
	}
				
	/**
	 * Function: getStates
	 *
	 * Returns the <mxCellStates> for the given array of <mxCells>. The array
	 * contains all states that are not null, that is, the returned array may
	 * have less elements than the given array.
	 */
	function getStates()
	{
		return $this->states;
	}

	/**
	 * Function: getStates
	 *
	 * Returns the <mxCellStates> for the given array of <mxCells>. The array
	 * contains all states that are not null, that is, the returned array may
	 * have less elements than the given array.
	 */
	function getCellStates($cells)
	{
		$result = array();
		$count = sizeof($cells);
		
		for ($i = 0; $i <$count; $i++)
		{
			$state = $this->getState($cells[$i]);
			
			if ($state != null)
			{
				array_push($result, $state);
			}
		}
		
		return $result;
	}

	/**
	 * Function: removeState
	 * 
	 * Removes and returns the mxCellState for the given cell.
	 */
	function removeState($cell)
	{
	 	$state = null;
	 	
	 	if ($cell != null)
	 	{
	 		$id = $this->getHashCode($cell);
		 	$state = $this->states[$id];
		 	unset($this->states[$id]);
		}

	 	return $state;
	}

	/**
	 * Function: createState
	 * 
	 * Creates the state for the specified cell.
	 */
	function createState($cell)
	{
	 	$style = $this->graph->getCellStyle($cell);
	 	
	 	return new mxCellState($this, $cell, $style);
	}

}
?>
