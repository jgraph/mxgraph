// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for a perimeter function.
    /// </summary>
    /// <param name="bounds">Rectangle that represents the absolute bounds of the
    /// vertex.</param>
    /// <param name="vertex">Cell state that represents the vertex.</param>
    /// <param name="next">Point that represents the nearest neighbour point on the
    /// given edge.</param>
    /// <param name="orthogonal">Boolean that specifies if the orthogonal projection onto
    /// the perimeter should be returned. If this is false then the intersection
    /// of the perimeter and the line between the next and the center point is
    /// returned.</param>
    public delegate mxPoint mxPerimeterFunction(mxRectangle bounds, mxCellState vertex, mxPoint next, bool orthogonal);

    /// <summary>
    /// Provides various perimeter functions to be used in a style
    /// as the value of mxConstants.STYLE_PERIMETER.
    /// </summary>
    public class mxPerimeter
    {

        /// <summary>
        /// Describes a rectangular perimeter for the given bounds.
        /// </summary>
        public static mxPerimeterFunction RectanglePerimeter = delegate(
            mxRectangle bounds, mxCellState vertex, mxPoint next, bool orthogonal)
        {
            double cx = bounds.GetCenterX();
            double cy = bounds.GetCenterY();
            double dx = next.X - cx;
            double dy = next.Y - cy;
            double alpha = Math.Atan2(dy, dx);

            mxPoint p = new mxPoint();
            double pi = Math.PI;
            double pi2 = Math.PI / 2;
            double beta = pi2 - alpha;
            double t = Math.Atan2(bounds.Height, bounds.Width);

            if (alpha < -pi + t || alpha > pi - t)
            {
                // Left edge
                p.X = bounds.X;
                p.Y = cy - bounds.Width * Math.Tan(alpha) / 2;
            }
            else if (alpha < -t)
            {
                // Top Edge
                p.Y = bounds.Y;
                p.X = cx - bounds.Height * Math.Tan(beta) / 2;
            }
            else if (alpha < t)
            {
                // Right Edge
                p.X = bounds.X + bounds.Width;
                p.Y = cy + bounds.Width * Math.Tan(alpha) / 2;
            }
            else
            {
                // Bottom Edge
                p.Y = bounds.Y + bounds.Height;
                p.X = cx + bounds.Height * Math.Tan(beta) / 2;
            }

            if (orthogonal)
            {
                if (next.X >= bounds.X &&
                    next.X <= bounds.X + bounds.Width)
                {
                    p.X = next.X;
                }
                else if (next.Y >= bounds.Y &&
                           next.Y <= bounds.Y + bounds.Height)
                {
                    p.Y = next.Y;
                }

                if (next.X < bounds.X)
                {
                    p.X = bounds.X;
                }
                else if (next.X > bounds.X + bounds.Width)
                {
                    p.X = bounds.X + bounds.Width;
                }

                if (next.Y < bounds.Y)
                {
                    p.Y = bounds.Y;
                }
                else if (next.Y > bounds.Y + bounds.Height)
                {
                    p.Y = bounds.Y + bounds.Height;
                }
            }

            return p;
        };

        /// <summary>
        /// Describes an elliptic perimeter.
        /// </summary>
        public static mxPerimeterFunction EllipsePerimeter = delegate(
            mxRectangle bounds, mxCellState vertex, mxPoint next, bool orthogonal)
        {
            double x = bounds.X;
            double y = bounds.Y;
            double a = bounds.Width / 2;
            double b = bounds.Height / 2;
            double cx = x + a;
            double cy = y + b;
            double px = next.X;
            double py = next.Y;

            // Calculates straight line equation through
            // point and ellipse center y = d * x + h
            long dx = (long)(px - cx);
            long dy = (long)(py - cy);

            if (dx == 0 && dy != 0)
            {
                return new mxPoint(cx, cy + b * dy / Math.Abs(dy));
            }
            else if (dx == 0 && dy == 0)
            {
                return new mxPoint(px, py);
            }

            if (orthogonal)
            {
                if (py >= y && py <= y + bounds.Height)
                {
                    double ty = py - cy;
                    double tx = Math.Sqrt(a * a * (1 - (ty * ty) / (b * b)));

                    if (Double.IsNaN(tx))
                    {
                        tx = 0;
                    }

                    if (px <= x)
                    {
                        tx = -tx;
                    }

                    return new mxPoint(cx + tx, py);
                }

                if (px >= x && px <= x + bounds.Width)
                {
                    double tx = px - cx;
                    double ty = Math.Sqrt(b * b * (1 - (tx * tx) / (a * a)));

                    if (Double.IsNaN(ty))
                    {
                        ty = 0;
                    }

                    if (py <= y)
                    {
                        ty = -ty;
                    }

                    return new mxPoint(px, cy + ty);
                }
            }

            // Calculates intersection
            double d = dy / dx;
            double h = cy - d * cx;
            double e = a * a * d * d + b * b;
            double f = -2 * cx * e;
            double g = a * a * d * d * cx * cx +
                    b * b * cx * cx -
                    a * a * b * b;
            double det = Math.Sqrt(f * f - 4 * e * g);

            // Two solutions (perimeter points)
            double xout1 = (-f + det) / (2 * e);
            double xout2 = (-f - det) / (2 * e);
            double yout1 = d * xout1 + h;
            double yout2 = d * xout2 + h;
            double dist1 = Math.Sqrt(Math.Pow((xout1 - px), 2)
                        + Math.Pow((yout1 - py), 2));
            double dist2 = Math.Sqrt(Math.Pow((xout2 - px), 2)
                        + Math.Pow((yout2 - py), 2));

            // Correct solution
            double xout = 0;
            double yout = 0;
            
            if (dist1 < dist2)
            {
                xout = xout1;
                yout = yout1;
            }
            else
            {
                xout = xout2;
                yout = yout2;
            }
            
            return new mxPoint(xout, yout);
        };

        /// <summary>
        /// Describes a rhombus (aka diamond) perimeter.
        /// </summary>
        public static mxPerimeterFunction RhombusPerimeter = delegate(
            mxRectangle bounds, mxCellState vertex, mxPoint next, bool orthogonal)
        {
            double x = bounds.X;
            double y = bounds.Y;
            double w = bounds.Width;
            double h = bounds.Height;

            double cx = x + w / 2;
            double cy = y + h / 2;

            double px = next.X;
            double py = next.Y;

            // Special case for intersecting the diamond's corners
            if (cx == px)
            {
                if (cy > py)
                {
                    return new mxPoint(cx, y); // top
                }
                else
                {
                    return new mxPoint(cx, y + h); // bottom
                }
            }
            else if (cy == py)
            {
                if (cx > px)
                {
                    return new mxPoint(x, cy); // left
                }
                else
                {
                    return new mxPoint(x + w, cy); // right
                }
            }

            double tx = cx;
            double ty = cy;

            if (orthogonal)
            {
                if (px >= x &&
                    px <= x + w)
                {
                    tx = px;
                }
                else if (py >= y &&
                          py <= y + h)
                {
                    ty = py;
                }
            }

            // In which quadrant will the intersection be?
            // set the slope and offset of the border line accordingly
            if (px < cx)
            {
                if (py < cy)
                {
                    return mxUtils.Intersection(px, py, tx, ty, cx, y,
                            x, cy);
                }
                else
                {
                    return mxUtils.Intersection(px, py, tx, ty, cx, y
                            + h, x, cy);
                }
            }
            else if (py < cy)
            {
                return mxUtils.Intersection(px, py, tx, ty, cx, y,
                        x + w, cy);
            }
            else
            {
                return mxUtils.Intersection(px, py, tx, ty, cx, y + h, x
                        + w, cy);
            }
        };
    
        /// <summary>
        /// Describes a triangle perimeter.
        /// </summary>
        public static mxPerimeterFunction TrianglePerimeter = delegate(
            mxRectangle bounds, mxCellState vertex, mxPoint next, bool orthogonal)
        {
            string direction = (vertex != null) ? mxUtils.GetString(
                vertex.Style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST) :
                mxConstants.DIRECTION_EAST;
            bool vertical = direction.Equals(mxConstants.DIRECTION_NORTH) ||
                direction.Equals(mxConstants.DIRECTION_SOUTH);

			double x = bounds.X;
			double y = bounds.Y;
			double w = bounds.Width;
			double h = bounds.Height;

			double cx = x + w / 2;
			double cy = y + h / 2;

			mxPoint start = new mxPoint(x, y);
			mxPoint corner = new mxPoint(x + w, cy);
			mxPoint end = new mxPoint(x, y + h);

            if (direction.Equals(mxConstants.DIRECTION_NORTH))
            {
                start = end;
                corner = new mxPoint(cx, y);
                end = new mxPoint(x + w, y + h);
            }
            else if (direction.Equals(mxConstants.DIRECTION_SOUTH))
            {
                corner = new mxPoint(cx, y + h);
                end = new mxPoint(x + w, y);
            }
            else if (direction.Equals(mxConstants.DIRECTION_WEST))
            {
                start = new mxPoint(x + w, y);
                corner = new mxPoint(x, cy);
                end = new mxPoint(x + w, y + h);
            }

			// Compute angle
			double dx = next.X - cx;
			double dy = next.Y - cy;

			double alpha = (vertical) ? Math.Atan2(dx, dy) : Math.Atan2(dy, dx);
			double t = (vertical) ? Math.Atan2(w, h) : Math.Atan2(h, w);
			
            bool baseSide = false;
			
			if (direction.Equals(mxConstants.DIRECTION_NORTH) ||
				direction.Equals(mxConstants.DIRECTION_WEST))
			{
				baseSide = alpha > -t && alpha < t;
			}
			else
			{
				baseSide = alpha < -Math.PI + t || alpha > Math.PI - t;	
			}

            mxPoint result = null;

			if (baseSide)
			{
				if (orthogonal &&
					((vertical &&
					next.X >= start.X &&
					next.X <= end.X) ||
					(!vertical &&
					next.Y >= start.Y &&
					next.Y <= end.Y)))
				{
					if (vertical)
					{
						result = new mxPoint(next.X, start.Y);
					}
					else
					{
						result = new mxPoint(start.X, next.Y);
					}
				}
				else
				{
                    if (direction.Equals(mxConstants.DIRECTION_EAST))
                    {
                        result = new mxPoint(x, y + h / 2 -
                            w * Math.Tan(alpha) / 2);
                    }
                    else if (direction.Equals(mxConstants.DIRECTION_NORTH))
					{
						result = new mxPoint(x + w / 2 + h * Math.Tan(alpha) / 2,
							y + h);
					}
                    else if (direction.Equals(mxConstants.DIRECTION_SOUTH))
					{
						result = new mxPoint(x + w / 2 - h * Math.Tan(alpha) / 2,
							y);
					}
					else if (direction.Equals(mxConstants.DIRECTION_WEST))
					{
						result = new mxPoint(x + w, y + h / 2 +
							w * Math.Tan(alpha) / 2);
					}
					else
					{
						
					}
				}
			}
			else
			{
				if (orthogonal)
				{
					mxPoint pt = new mxPoint(cx, cy);
			
					if (next.Y >= y && next.Y <= y + h)
					{
						pt.X = (vertical) ? cx : (
                            (direction.Equals(mxConstants.DIRECTION_WEST)) ?
								x + w : x);
						pt.Y = next.Y;
					}
					else if (next.X >= x && next.X <= x + w)
					{
						pt.X = next.X;
						pt.Y = (!vertical) ? cy : (
                            (direction.Equals(mxConstants.DIRECTION_NORTH)) ?
								y + h : y);
					}
					
					// Compute angle
					dx = next.X - pt.X;
					dy = next.Y - pt.Y;
					
					cx = pt.X;
					cy = pt.Y;
				}

				if ((vertical && next.X <= x + w / 2) ||
					(!vertical && next.Y <= y + h / 2))
				{
					result = mxUtils.Intersection(next.X, next.Y, cx, cy,
						start.X, start.Y, corner.X, corner.Y);
				}
				else
				{
					result = mxUtils.Intersection(next.X, next.Y, cx, cy,
						corner.X, corner.Y, end.X, end.Y);
				}
			}

			if (result == null)
			{
				result = new mxPoint(cx, cy);
			}

			return result;
        };

    }

}
