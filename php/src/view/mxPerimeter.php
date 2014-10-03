<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
interface mxPerimeterFunction
{

	/**
	 * Interface: mxPerimeterFunction
	 * 
	 * Defines the requirements for a perimeter function.
	 * 
	 * Function: apply
	 * 
	 * Implements a perimeter function.
	 *
	 * Parameters:
	 *
	 * bounds - <mxRectangle> that represents the absolute bounds of the
	 * vertex.
	 * vertex - <mxCellState> that represents the vertex.
	 * next - <mxPoint> that represents the nearest neighbour point on the
	 * given edge.
	 * orthogonal - Boolean that specifies if the orthogonal projection onto
	 * the perimeter should be returned. If this is false then the intersection
	 * of the perimeter and the line between the next and the center point is
	 * returned.
	 */
	public function apply($bounds, $vertex, $next, $orthogonal);

}

/**
 * Class: mxRectanglePerimeter
 *
 * Implements a rectangular perimeter for the given bounds.
 */
class mxRectanglePerimeter implements mxPerimeterFunction
{

	/**
	 *
	 */
	public function apply($bounds, $vertex, $next, $orthogonal)
	{
		$cx = $bounds->x + $bounds->width / 2;
		$cy = $bounds->y + $bounds->height / 2;
		$dx = $next->x - $cx;
		$dy = $next->y - $cy;
		$alpha = atan2($dy, $dx);
		$p = new mxPoint(0, 0);
		$pi = pi();
		$pi2 = $pi / 2;
		$beta = $pi2 - $alpha;
		$t = atan2($bounds->height, $bounds->width);
		
		if ($alpha < - $pi + $t || $alpha > $pi - $t)
		{
			// Left side
			$p->x = $bounds->x;
			$p->y = $cy - $bounds->width * tan($alpha) / 2;
		}
		else if ($alpha < -$t)
		{
			// Top side
			$p->y = $bounds->y;
			$p->x = $cx - $bounds->height * tan($beta) / 2;
		}
		else if ($alpha < $t)
		{
			// Right side
			$p->x = $bounds->x + $bounds->width;
			$p->y = $cy + $bounds->width * tan($alpha) / 2;
		}
		else
		{
			// Bottom side
			$p->y = $bounds->y + $bounds->height;
			$p->x = $cx + $bounds->height * tan($beta) / 2;			
		}

		if ($orthogonal)
		{
			if ($next->x >= $bounds->x &&
				$next->x <= $bounds->x + $bounds->width)
			{
				$p->x = $next->x;
			}
			else if ($next->y >= $bounds->y &&
			  	$next->y <= $bounds->y + $bounds->height)
			{
				$p->y = $next->y;
			}
			
			if ($next->x < $bounds->x)
			{
				$p->x = $bounds->x;
			}
			else if ($next->x > $bounds->x + $bounds->width)
			{
				$p->x = $bounds->x + $bounds->width + 1;
			}
			
			if ($next->y < $bounds->y)
			{
				$p->y = $bounds->y;
			}
			else if ($next->y > $bounds->y + $bounds->height)
			{
				$p->y = $bounds->y + $bounds->height + 1;
			}
		}
		
		return $p;
	}

}

/**
 * Class: mxEllipsePerimeter
 * 
 * Implements an elliptic perimeter. See <RectanglePerimeter>
 * for a description of the parameters.
 */
class mxEllipsePerimeter implements mxPerimeterFunction
{

	/**
	 *
	 */
	public function apply($bounds, $vertex, $next, $orthogonal)
	{
		$x = $bounds->x;
		$y = $bounds->y;
		$a = $bounds->width / 2;
		$b = $bounds->height / 2;
		$cx = $x + $a;
		$cy = $y + $b;
		$px = $next->x;
		$py = $next->y;
		
		// Calculates straight line equation through
		// point and ellipse center y = d * x + h
		$dx = (int) ($px - $cx);
		$dy = (int) ($py - $cy);
		
		if ($dx == 0 && $dy != 0)
		{
			return new mxPoint($cx, $cy + $b * $dy / abs($dy));
		}
		else if ($dx == 0 && $dy == 0)
		{
			return new mxPoint($px, $py);
		}

		if ($orthogonal)
		{
			if ($py >= $y && $py <= $y + $bounds->height)
			{
				$ty = $py - $cy;
				$tx = sqrt($a*$a*(1-($ty*$ty)/($b*$b)));
				
				if (is_nan($tx))
				{
					$tx = 0;
				}
				
				if ($px <= $x)
				{
					$tx = -$tx;
				}
				
				return new mxPoint($cx+$tx, $py);
			}
			
			if ($px >= $x && $px <= $x + $bounds->width)
			{
				$tx = $px - $cx;
				$ty = sqrt($b*$b*(1-($tx*$tx)/($a*$a)));
				
				if (is_nan($ty))
				{
					$ty = 0;
				}
				
				if ($py <= $y)
				{
					$ty = -$ty;	
				}
				
				return new mxPoint($px, $cy + $ty);
			}
		}
		
		// Calculates intersection
		$d = $dy / $dx;
		$h = $cy - $d * $cx;
		$e = $a * $a * $d * $d + $b * $b;
		$f = -2 * $cx * $e;
		$g = $a * $a * $d * $d * $cx * $cx +
				$b * $b * $cx * $cx -
				$a * $a * $b * $b;
		$det = sqrt($f * $f - 4 * $e * $g);
		
		// Two solutions (perimeter points)
		$xout1 = (-$f + $det) / (2 * $e);
		$xout2 = (-$f - $det) / (2 * $e);
		$yout1 = $d * $xout1 + $h;
		$yout2 = $d * $xout2 + $h;
		$dist1 = sqrt(pow($xout1 - $px, 2)
					+ pow($yout1 - $py, 2));
		$dist2 = sqrt(pow($xout2 - $px, 2)
					+ pow($yout2 - $py, 2));

		// Correct solution
		$xout = 0;
		$yout = 0;
		if ($dist1 < $dist2)
		{
			$xout = $xout1;
			$yout = $yout1;
		}
		else
		{
			$xout = $xout2;
			$yout = $yout2;
		}
		
		return new mxPoint($xout, $yout);
	}

}

/**
 * Class: mxRhombusPerimeter
 * 
 * Implements a rhombus (aka diamond) perimeter. See <RectanglePerimeter>
 * for a description of the parameters.
 */
class mxRhombusPerimeter implements mxPerimeterFunction
{

	/**
	 *
	 */
	public function apply($bounds, $vertex, $next, $orthogonal)
	{
		$x = $bounds->x;
		$y = $bounds->y;
		$w = $bounds->width;
		$h = $bounds->height;
		
		$cx = $x + $w / 2;
		$cy = $y + $h / 2;
		
		$px = $next->x;
		$py = $next->y;
		
		// Special case for intersecting the diamond's corners
		if ($cx == $px)
		{
			if ($cy > $py)
			{
				return new mxPoint($cx, $y); // top
			}
			else
			{
				return new mxPoint($cx, $y + $h); // bottom
			}
		}
		else if ($cy == $py)
		{
			if ($cx > $px)
			{
				return new mxPoint($x, $cy); // left
			}
			else
			{
				return new mxPoint($x + $w, $cy); // right
			}
		}
		
		$tx = $cx;
		$ty = $cy;
		
		if ($orthogonal)
		{
			if ($px >= $x && $px <= $x + $w)
			{
				$tx = $px;
			}
			else if ($py >= $y && $py <= $y + $h)
			{
				$ty = $py;
			}
		}
		
		// In which quadrant will the intersection be?
		// set the slope and offset of the border line accordingly
		if ($px < $cx)
		{
			if ($py < $cy)
			{
				return mxUtils::intersection($px, $py,
					$tx, $ty, $cx, $y, $x, $cy);
			}
			else
			{
				return mxUtils::intersection($px, $py,
					$tx, $ty, $cx, $y + $h, $x, $cy);
			}
		}
		else if ($py < $cy)
		{
			return mxUtils::intersection($px, $py,
				$tx, $ty, $cx, $y, $x + $w, $cy);
		}
		else
		{
			return mxUtils::intersection($px, $py,
				$tx, $ty, $cx, $y + $h, $x + $w, $cy);
		}
	}

}

/**
 * Class: mxTrianglePerimeter
 * 
 * Implements a triangle perimeter. See <RectanglePerimeter> for a
 * description of the parameters.
 */
class mxTrianglePerimeter implements mxPerimeterFunction
{

	/**
	 *
	 */
	public function apply($bounds, $vertex, $next, $orthogonal)
	{
		$direction = ($vertex != null) ?
			mxUtils::getValue($vertex->style, mxConstants::$STYLE_DIRECTION) : null;
		$vertical = $direction == mxConstants::$DIRECTION_NORTH ||
			$direction == mxConstants::$DIRECTION_SOUTH;

		$x = $bounds->x;
		$y = $bounds->y;
		$w = $bounds->width;
		$h = $bounds->height;
		
		$cx = $x + $w / 2;
		$cy = $y + $h / 2;
		
		$start = new mxPoint($x, $y);
		$corner = new mxPoint($x + $w, $cy);
		$end = new mxPoint($x, $y + $h);
		
		if ($direction == mxConstants::$DIRECTION_NORTH)
		{
			$start = end;
			$corner = new mxPoint($cx, $y);
			$end = new mxPoint($x + $w, $y + $h);
		}
		else if ($direction == mxConstants::$DIRECTION_SOUTH)
		{
			$corner = new mxPoint($cx, $y + $h);
			$end = new mxPoint($x + $w, $y);
		}
		else if ($direction == mxConstants::$DIRECTION_WEST)
		{
			$start = new mxPoint($x + $w, $y);
			$corner = new mxPoint($x, $cy);
			$end = new mxPoint($x + $w, $y + $h);
		}

		$dx = $next->x - $cx;
		$dy = $next->y - $cy;

		$alpha = ($vertical) ? atan2($dx, $dy) : atan2($dy, $dx);
		$t = ($vertical) ? Matan2($w, $h) : atan2($h, $w);
		
		$base = false;
		
		if ($direction == mxConstants::$DIRECTION_NORTH ||
			$direction == mxConstants::$DIRECTION_WEST)
		{
			$base = $alpha > -$t && $alpha < $t;
		}
		else
		{
			$base = $alpha < -pi() + $t || $alpha > pi() - $t;	
		}

		$result = null;			

		if ($base)
		{
			if ($orthogonal && (($vertical && $next->x >= $start->x &&
				$next->x <= $end->x) || (!$vertical && $next->y >= $start->y &&
				$next->y <= $end->y)))
			{
				if ($vertical)
				{
					$result = new mxPoint($next->x, $start->y);
				}
				else
				{
					$result = new mxPoint($start->x, $next->y);
				}
			}
			else
			{
				if ($direction == mxConstants::$DIRECTION_NORTH)
				{
					$result = new mxPoint($x + $w / 2 + $h * tan($alpha) / 2,
						$y + $h);
				}
				else if ($direction == mxConstants::$DIRECTION_SOUTH)
				{
					$result = new mxPoint($x + $w / 2 - $h * tan($alpha) / 2,
						$y);
				}
				else if ($direction == mxConstants::$DIRECTION_WEST)
				{
					$result = new mxPoint($x + $w, $y + $h / 2 +
						$w * tan($alpha) / 2);
				}
				else
				{
					$result = new mxPoint($x, $y + $h / 2 -
						$w * tan($alpha) / 2);
				}
			}
		}
		else
		{
			if ($orthogonal)
			{
				$pt = new mxPoint($cx, $cy);
		
				if ($next->y >= $y && $next->y <= $y + $h)
				{
					$pt->x = ($vertical) ? $cx : (
						($direction == mxConstants::$DIRECTION_WEST) ?
							$x + $w : $x);
					$pt->y = $next->y;
				}
				else if ($next->x >= $x && $next->x <= $x + $w)
				{
					$pt->x = $next->x;
					$pt->y = (!$vertical) ? $cy : (
						($direction == mxConstants::$DIRECTION_NORTH) ?
							$y + $h : $y);
				}
				
				// Compute angle
				$dx = $next->x - $pt->x;
				$dy = $next->y - $pt->y;
				
				$cx = $pt->x;
				$cy = $pt->y;
			}

			if (($vertical && $next->x <= $x + $w / 2) ||
				(!$vertical && $next->y <= $y + $h / 2))
			{
				$result = mxUtils::intersection($next->x, $next->y, $cx, $cy,
					$start->x, $start->y, $corner->x, $corner->y);
			}
			else
			{
				$result = mxUtils::intersection($next->x, $next->y, $cx, $cy,
					$corner->x, $corner->y, $end->x, $end->y);
			}
		}
		
		if ($result == null)
		{
			$result = new mxPoint($cx, $cy);
		}
		
		return $result;
	}

}

/**
 * Class: mxPerimeter
 * 
 * Provides various perimeter functions to be used in a style
 * as the value of <mxConstants.STYLE_PERIMETER>.
 * 
 * The parameters are explained in <RectanglePerimeter>.
 */
class mxPerimeter
{

	/**
	 * Variable: RectanglePerimeter
	 *
	 * Provides a rectangular perimeter.
	 */
	public static $RectanglePerimeter;

	/**
	 * Variable: EllipsePerimeter
	 *
	 * Provides an elliptic perimeter.
	 */
	public static $EllipsePerimeter;

	/**
	 * Variable: RhombusPerimeter
	 *
	 * Provides a rhombus (aka diamond) perimeter.
	 */
	public static $RhombusPerimeter;

	/**
	 * Variable: TrianglePerimeter
	 *
	 * Provides a triangle perimeter. See <RectanglePerimeter> for a
	 * description of the parameters.
	 */
	public static $TrianglePerimeter;

}

// Instanciates the declared static members of the above class
mxPerimeter::$RectanglePerimeter = new mxRectanglePerimeter();
mxPerimeter::$EllipsePerimeter = new mxEllipsePerimeter();
mxPerimeter::$RhombusPerimeter = new mxRhombusPerimeter();
mxPerimeter::$TrianglePerimeter = new mxTrianglePerimeter();
?>
