<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
interface mxEdgeStyleFunction
{

	/**
	 * Interface: mxEdgeStyleFunction
	 * 
	 * Defines the requirements for an edge style function.
	 * 
	 * Function: apply
	 * 
	 * Implements an edge style function. At the time the function is called, the result
	 * array contains a placeholder (null) for the first absolute point,
	 * that is, the point where the edge and source terminal are connected.
	 * The implementation of the style then adds all intermediate waypoints
	 * except for the last point, that is, the connection point between the
	 * edge and the target terminal. The first ant the last point in the
	 * result array are then replaced with mxPoints that take into account
	 * the terminal's perimeter and next point on the edge.
	 *
	 * Parameters:
	 * 
	 * state - <mxCellState> that represents the edge to be updated.
	 * source - <mxCellState> that represents the source terminal.
	 * target - <mxCellState> that represents the target terminal.
	 * points - List of relative control points.
	 * result - Array of <mxPoints> that represent the actual points of the
	 * edge.
	 */
	public function apply($state, $source, $target, $points, &$result);

}

/**
 * Class: mxEntityRelation
 * 
 * Implements an entity relation style for edges (as used in database
 * schema diagrams).  At the time the function is called, the result
 * array contains a placeholder (null) for the first absolute point,
 * that is, the point where the edge and source terminal are connected.
 * The implementation of the style then adds all intermediate waypoints
 * except for the last point, that is, the connection point between the
 * edge and the target terminal. The first ant the last point in the
 * result array are then replaced with mxPoints that take into account
 * the terminal's perimeter and next point on the edge.
 */
class mxEntityRelation implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$graph = $view->graph;
		$segment = mxUtils::getValue($state->style,
			mxConstants::$STYLE_SEGMENT,
			mxConstants::$ENTITY_SEGMENT) * $view->scale;

		$pts = $state->absolutePoints;
		$p0 = $pts[0];
		$pe = $pts[sizeof($pts) - 1];

	 	$isSourceLeft = false;
	 	
		if (isset($p0))
		{
			$source = new mxCellState();
			$source->x = $p0->x;
			$source->y = $p0->y;
		}
	 	else if (isset($source))
	 	{
		 	$sourceGeometry = $graph->getCellGeometry($source->cell);	 		
	 	
		 	if ($sourceGeometry->relative)
		 	{
		 		$isSourceLeft = $sourceGeometry->x <= 0.5;
		 	}
		 	else if ($target != null)
		 	{
		 		$isSourceLeft = $target->x + $target->width < $source->x;
		 	}
		}
	 	
	 	$isTargetLeft = true;
	 	
		if (isset($pe))
		{
			$target = new mxCellState();
			$target->x = $pe->x;
			$target->y = $pe->y;
		}
	 	else if (isset($target))
	 	{
		 	$targetGeometry = $graph->getCellGeometry($target->cell);	 		
	 	
		 	if ($targetGeometry->relative)
		 	{
		 		$isTargetLeft = $targetGeometry->x <= 0.5;
		 	}
		 	else if ($source != null)
		 	{
		 		$isTargetLeft = $source->x + $source->width < $target->x;
		 	}
		}
	 	
		if (isset($source) && isset($target))
		{
			$x0 = ($isSourceLeft) ? $source->x : $source->x + $source->width;
			$y0 = $view->getRoutingCenterY($source);
			
			$xe = ($isTargetLeft) ? $target->x : $target->x + $target->width;
			$ye = $view->getRoutingCenterY($target);
	
			$seg = $segment;
			
			$dx = ($isSourceLeft) ? -$seg : $seg;
			$dep = new mxPoint($x0+$dx, $y0);
			array_push($result, $dep);
					
			$dx = ($isTargetLeft) ? -$seg : $seg;
			$arr = new mxPoint($xe+$dx, $ye);
	
			// Adds intermediate points if both go out on same side
			if ($isSourceLeft == $isTargetLeft)
			{
				$x = ($isSourceLeft) ?
					min($x0, $xe)-$segment :
					max($x0, $xe)+$segment;
				array_push($result, new mxPoint($x, $y0));
				array_push($result, new mxPoint($x, $ye));
			}
			else if (($dep->x < $arr->x) == $isSourceLeft)
			{
				$midY = $y0 + ($ye - $y0) / 2;
				array_push($result, new mxPoint($dep->x, $midY));
				array_push($result, new mxPoint($arr->x, $midY));
			}
			
			array_push($result, $arr);
		}
	}

}

/**
 * Class: mxLoop
 * 
 * Implements a self-reference, aka. loop.
 */
class mxLoop implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		if ($source != null)
		{
			$view = $state->view;
			$graph = $view->graph;
			$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;

			if ($pt != null)
			{
				$pt = $view->transformControlPoint($state, $pt);
					
				if (mxUtils::contains($source, $pt->x, $pt->y))
				{
					$pt = null;
				}
			}
		
			$x = 0;
			$dx = 0;
			$y = 0;
			$dy = 0;
			
			$seg = mxUtils::getValue($state->style,
				mxConstants::$STYLE_SEGMENT, $graph->gridSize)
				* $view->scale;
			$dir = mxUtils::getValue($state->style,
				mxConstants::$STYLE_DIRECTION,
				mxConstants::$DIRECTION_WEST);

			if ($dir == mxConstants::$DIRECTION_NORTH ||
				$dir == mxConstants::$DIRECTION_SOUTH)
			{
				$x = $view->getRoutingCenterX($source);
				$dx = $seg;
			}
			else
			{
				$y = $view->getRoutingCenterY($source);
				$dy = $seg;
			}
			
			if ($pt == null ||
				$pt->x < $source->x ||
				$pt->x > $source->x + $source->width)
			{
				if ($pt != null)
				{
					$x = $pt->x;
					$dy = max(abs($y - $pt->y), $dy);
				}
				else
				{
					if ($dir == mxConstants::$DIRECTION_NORTH)
					{
						$y = $source->y - 2 * $dx;
					}
					else if ($dir == mxConstants::$DIRECTION_SOUTH)
					{
						$y = $source->y + $source->height + 2 * $dx;
					}
					else if ($dir == mxConstants::$DIRECTION_EAST)
					{
						$x = $source->x - 2 * $dy;
					}
					else
					{
						$x = $source->x + $source->width + 2 * $dy;
					}
				}
			}
			else if ($pt != null)
			{
				$x = $view->getRoutingCenterX($source);
				$dx = max(abs($x - $pt->x), $dy);
				$y = $pt->y;
				$dy = 0;
			}
			
			array_push($result, new mxPoint($x-$dx, $y-$dy));
			array_push($result, new mxPoint($x+$dx, $y+$dy));
		}
	}
	
}

/**
 * Class: mxElbowConnector
 * 
 * Uses either <SideToSide> or <TopToBottom> depending on the horizontal
 * flag in the cell style. <SideToSide> is used if horizontal is true or
 * unspecified. See <EntityRelation> for a description of the
 * parameters.
 */
class mxElbowConnector implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;

		$vertical = false;
		$horizontal = false;
		
		if ($source != null && $target != null)
		{
			if ($pt != null)
			{
				$left = min($source->x, $target->x);
				$right = max($source->x + $source->width,
					$target->x + $target->width);
	
				$top = min($source->y, $target->y);
				$bottom = max($source->y + $source->height,
					$target->y + $target->height);

				$pt = $state->view->transformControlPoint($state, $pt);
				
				$vertical = $pt->y < $top || $pt->y > $bottom;
				$horizontal = $pt->x < $left || $pt->x > $right;
			}
			else
			{
				$left = max($source->x, $target->x);
				$right = min($source->x + $source->width,
					$target->x + $target->width);
					
				$vertical = $left == $right;
				
				if (!$vertical)
				{
					$top = max($source->y, $target->y);
					$bottom = min($source->y + $source->height,
						$target->y + $target->height);
						
					$horizontal = $top == $bottom;
				}
			}
		}

		if (!$horizontal && ($vertical ||
			mxUtils::getValue($state->style, mxConstants::$STYLE_ELBOW) == mxConstants::$ELBOW_VERTICAL))
		{
			mxEdgeStyle::$TopToBottom->apply($state, $source, $target, $points, $result);
		}
		else
		{
			mxEdgeStyle::$SideToSide->apply($state, $source, $target, $points, $result);
		}
	}

}

/**
 * Class: mxSideToSide
 * 
 * Implements a vertical elbow edge. See <EntityRelation> for a description
 * of the parameters.
 */
class mxSideToSide implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;
		$pts = $state->absolutePoints;
		$p0 = $pts[0];
		$pe = $pts[sizeof($pts) - 1];
		
		if ($pt != null)
		{
			$pt = $view->transformControlPoint($state, $pt);
		}

		if (isset($p0))
		{
			$source = new mxCellState();
			$source->x = $p0->x;
			$source->y = $p0->y;
		}
		
		if (isset($pe))
		{
			$target = new mxCellState();
			$target->x = $pe->x;
			$target->y = $pe->y;
		}

		if (isset($source) && isset($target))
		{
			$l = max($source->x, $target->x);
			$r = min($source->x+$source->width, $target->x+$target->width);
	
			$x = ($pt != null) ? $pt->x : $r + ($l-$r)/2;
			
			$y1 = $view->getRoutingCenterY($source);
			$y2 = $view->getRoutingCenterY($target);
			
			if ($pt != null)
			{
				if ($pt->y >= $source->y &&
					$pt->y <= $source->y + $source->height)
				{
					$y1 = $pt->y;
				}
				
				if ($pt->y >= $target->y &&
					$pt->y <= $target->y + $target->height)
				{
					$y2 = $pt->y;
				}
			}
			
			if (!mxUtils::contains($target, $x, $y1) &&
				!mxUtils::contains($source, $x, $y1))
			{
				array_push($result, new mxPoint($x, $y1));
			}
			
			if (!mxUtils::contains($target, $x, $y2) &&
				!mxUtils::contains($source, $x, $y2))
			{
				array_push($result, new mxPoint($x, $y2));
			}
	
			if (sizeof($result) == 1)
			{
				if (isset($pt))
				{
					array_push($result, new mxPoint($x, $pt->y));
				}
				else
				{
					$t = max($source->y, $target->y);
					$b = min($source->y+$source->height, $target->y+$target->height);
					
					array_push($result, new mxPoint($x, $t + ($b - $t) / 2));
				}
			}
		}
	}
	
}
	
/**
 * Class: mxTopToBottom
 * 
 * Implements a horizontal elbow edge. See <EntityRelation> for a
 * description of the parameters.
 */
class mxTopToBottom implements mxEdgeStyleFunction
{

	/**
	 * 
	 */
	public function apply($state, $source, $target, $points, &$result)
	{
		$view = $state->view;
		$pt = ($points != null && sizeof($points) > 0) ? $points[0] : null;
		$pts = $state->absolutePoints;
		$p0 = $pts[0];
		$pe = $pts[sizeof($pts) - 1];
		
		if ($pt != null)
		{
			$pt = $view->transformControlPoint($state, $pt);
		}

		if (isset($p0))
		{
			$source = new mxCellState();
			$source->x = $p0->x;
			$source->y = $p0->y;
		}
		
		if (isset($pe))
		{
			$target = new mxCellState();
			$target->x = $pe->x;
			$target->y = $pe->y;
		}

		if (isset($source) && isset($target))
		{
			$t = max($source->y, $target->y);
			$b = min($source->y+$source->height, $target->y+$target->height);
	
			$x = $view->getRoutingCenterX($source);
			
			if ($pt != null && 
				$pt->x >= $source->x &&
				$pt->x <= $source->x + $source->width)
			{
				$x = $pt->x;
			}
			
			$y = ($pt != null) ? $pt->y : $b + ($t - $b) / 2;
			
			if (!mxUtils::contains($target, $x, $y) &&
				!mxUtils::contains($source, $x, $y))
			{
				array_push($result, new mxPoint($x, $y));
			}
			
			if ($pt != null &&
				$pt->x >= $target->x &&
				$pt->x <= $target->x + $target->width)
			{
				$x = $pt->x;
			}
			else
			{
				$x = $view->getRoutingCenterX($target);
			}
			
			if (!mxUtils::contains($target, $x, $y) &&
				!mxUtils::contains($source, $x, $y))
			{
				array_push($result, new mxPoint($x, $y));
			}
	
			if (sizeof($result) == 1)
			{
				if ($pt == null)
				{
					array_push($result, new mxPoint($x, $y));
				}
				else
				{
					$l = max($source->x, $target->x);
					$r = min($source->x + $source->width, $target->x + $target->width);
					
					array_push($result, new mxPoint($r + ($r - $l) / 2, $y));
				}
			}
		}
	}
	
}

/**	
 *
 * Class: mxEdgeStyle
 * 
 * Provides various edge styles to be used as the values for
 * <mxConstants.STYLE_EDGE> in a cell style.
 */
class mxEdgeStyle
{

	/**
	 * Variable: EntityRelation
	 *
	 * Provides an entity relation style for edges (as used in database
	 * schema diagrams).
	 */
	public static $EntityRelation;

	/**
	 * Variable: Loop
	 *
	 * Provides a self-reference, aka. loop.
	 */
	public static $Loop;

	/**
	 * Variable: ElbowConnector
	 *
	 * Provides an elbow connector.
	 */
	public static $ElbowConnector;
	
	/**
	 * Variable: SideToSide
	 *
	 * Provides a side to side connector.
	 */
	public static $SideToSide;

	/**
	 * Variable: TopToBottom
	 *
	 * Provides a top to bottom connector.
	 */
	public static $TopToBottom;

}

// Instanciates the declared static members of the above class
mxEdgeStyle::$EntityRelation = new mxEntityRelation();
mxEdgeStyle::$Loop = new mxLoop();
mxEdgeStyle::$ElbowConnector = new mxElbowConnector();
mxEdgeStyle::$SideToSide = new mxSideToSide();
mxEdgeStyle::$TopToBottom = new mxTopToBottom();
?>
