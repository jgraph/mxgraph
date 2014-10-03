// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for an edge style function.  At the time
    /// the function is called, the result array contains a placeholder (null)
    /// for the first absolute point, that is, the point where the edge and
    /// source terminal are connected. The implementation of the style then
    /// adds all intermediate waypoints except for the last point, that is,
    /// the connection point between the edge and the target terminal. The
    /// first ant the last point in the result array are then replaced with
    /// mxPoints that take into account the terminal's perimeter and next point
    /// on the edge.
    /// </summary>
    /// <param name="state">Cell state that represents the edge to be updated.</param>
    /// <param name="source">Cell state that represents the source terminal.</param>
    /// <param name="target">Cell state that represents the target terminal.</param>
    /// <param name="points">List of relative control points.</param>
    /// <param name="result">Array of points that represent the actual points of the
    /// edge.</param>
    public delegate void mxEdgeStyleFunction(mxCellState state, mxCellState source,
        mxCellState target, List<mxPoint> points, List<mxPoint> result);

    /// <summary>
    /// Provides various edge styles to be used as the values for
    /// mxConstants.STYLE_EDGE in a cell style.
    /// </summary>
    public class mxEdgeStyle
    {

        /// <summary>
        /// Implements an entity relation style for edges (as used in database
        /// schema diagrams).
        /// </summary>
        public static mxEdgeStyleFunction EntityRelation = delegate(
            mxCellState state, mxCellState source,
            mxCellState target, List<mxPoint> points,
            List<mxPoint> result)
        {
            mxGraphView view = state.View;
            mxIGraphModel model = view.Graph.Model;
            double segment = mxUtils.GetDouble(state.Style,
                mxConstants.STYLE_SEGMENT, mxConstants.ENTITY_SEGMENT) *
                state.View.Scale;

            mxPoint p0 = state.AbsolutePoints[0];
            mxPoint pe = state.AbsolutePoints[state.AbsolutePointCount() - 1];

            bool isSourceLeft = false;

            if (p0 != null)
            {
                source = new mxCellState();
                source.X = p0.X;
                source.Y = p0.Y;
            }
            else if (source != null)
            {
                mxGeometry sourceGeometry = model.GetGeometry(source.Cell);

                if (sourceGeometry.Relative)
                {
                    isSourceLeft = sourceGeometry.X <= 0.5;
                }
                else if (target != null)
                {
                    isSourceLeft = target.X + target.Width < source
                            .X;
                }
            }

			bool isTargetLeft = true;

            if (pe != null)
            {
                target = new mxCellState();
                target.X = pe.X;
                target.Y = pe.Y;
            }
            else if (target != null)
            {
                mxGeometry targetGeometry = model.GetGeometry(target.Cell);

                if (targetGeometry.Relative)
                {
                    isTargetLeft = targetGeometry.X <= 0.5;
                }
                else if (source != null)
                {
                    isTargetLeft = source.X + source.Width < target
                            .X;
                }
            }

            if (source != null && target != null)
            {
                double x0 = (isSourceLeft) ? source.X : source.X
                        + source.Width;
                double y0 = view.GetRoutingCenterY(source);

                double xe = (isTargetLeft) ? target.X : target.X
                        + target.Width;
                double ye = view.GetRoutingCenterY(target);

                double seg = segment;

                double dx = (isSourceLeft) ? -seg : seg;
                mxPoint dep = new mxPoint(x0 + dx, y0);
                result.Add(dep);

                dx = (isTargetLeft) ? -seg : seg;
                mxPoint arr = new mxPoint(xe + dx, ye);

                // Adds intermediate points if both go out on same side
                if (isSourceLeft == isTargetLeft)
                {
                    double x = (isSourceLeft) ? Math.Min(x0, xe) - segment : Math
                            .Max(x0, xe)
                            + segment;
                    result.Add(new mxPoint(x, y0));
                    result.Add(new mxPoint(x, ye));
                }
                else if ((dep.X < arr.X) == isSourceLeft)
                {
                    double midY = y0 + (ye - y0) / 2;
                    result.Add(new mxPoint(dep.X, midY));
                    result.Add(new mxPoint(arr.X, midY));
                }

                result.Add(arr);
            }
		};

        /// <summary>
        /// Implements a self-reference, aka. loop.
        /// </summary>
        public static mxEdgeStyleFunction Loop = delegate(
            mxCellState state, mxCellState source,
            mxCellState target, List<mxPoint> points,
            List<mxPoint> result)
        {
            if (source != null)
            {
                mxGraphView view = state.View;
                mxGraph graph = view.Graph;
                mxPoint pt = (points != null && points.Count > 0) ? points[0] : null;

                if (pt != null)
                {
                    pt = view.TransformControlPoint(state, pt);

                    if (source.Contains(pt.X, pt.Y))
                    {
                        pt = null;
                    }
                }

                double x = 0;
                double dx = 0;
                double y = 0;
                double dy = 0;

                double seg = mxUtils.GetDouble(state.Style,
                    mxConstants.STYLE_SEGMENT, graph.GridSize)
                    * view.Scale;
                String dir = mxUtils.GetString(state.Style,
                                mxConstants.STYLE_DIRECTION,
                                mxConstants.DIRECTION_WEST);
                if (dir.Equals(mxConstants.DIRECTION_NORTH)
                   || dir.Equals(mxConstants.DIRECTION_SOUTH))
                {
                    x = view.GetRoutingCenterX(source);
                    dx = seg;
                }
                else
                {
                    y = view.GetRoutingCenterY(source);
                    dy = seg;
                }

                if (pt == null ||
                    pt.X < source.X ||
                    pt.X > source.X + source.Width)
                {
                    if (pt != null)
                    {
                        x = pt.X;
                        dy = Math.Max(Math.Abs(y - pt.Y), dy);
                    }
                    else
                    {
                        if (dir.Equals(mxConstants.DIRECTION_NORTH))
                        {
                            y = source.Y - 2 * dx;
                        }
                        else if (dir.Equals(mxConstants.DIRECTION_SOUTH))
                        {
                            y = source.Y + source.Height + 2 * dx;
                        }
                        else if (dir.Equals(mxConstants.DIRECTION_EAST))
                        {
                            x = source.X - 2 * dy;
                        }
                        else
                        {
                            x = source.X + source.Width + 2 * dy;
                        }
                    }
                }
                else if (pt != null)
                {
                    x = view.GetRoutingCenterX(source);
                    dx = Math.Max(Math.Abs(x - pt.X), dy);
                    y = pt.Y;
                    dy = 0;
                }

                result.Add(new mxPoint(x - dx, y - dy));
                result.Add(new mxPoint(x + dx, y + dy));
            }
	    };

        /// <summary>
        /// Uses either SideToSide or TopToBottom depending on the horizontal
        /// flag in the cell style. SideToSide is used if horizontal is true or
        /// unspecified.
        /// </summary>
        public static mxEdgeStyleFunction ElbowConnector = delegate(
            mxCellState state, mxCellState source,
            mxCellState target, List<mxPoint> points,
            List<mxPoint> result)
        {
            mxPoint pt = (points != null && points.Count > 0) ? points[0] : null;

            bool vertical = false;
    		bool horizontal = false;

            if (source != null && target != null)
		    {
                if (pt != null)
                {
                    double left = Math.Min(source.X, target.X);
                    double right = Math.Max(source.X + source.Width,
                        target.X + target.Width);

                    double top = Math.Min(source.Y, target.Y);
                    double bottom = Math.Max(source.Y + source.Height,
                        target.Y + target.Height);

                    pt = state.View.TransformControlPoint(state, pt);

                    vertical = pt.Y < top || pt.Y > bottom;
                    horizontal = pt.X < left || pt.X > right;
                }
                else
                {
                    double left = Math.Max(source.X, target.X);
                    double right = Math.Min(source.X + source.Width,
                            target.X + target.Width);

                    vertical = left == right;

                    if (!vertical)
                    {
                        double top = Math.Max(source.Y, target.Y);
                        double bottom = Math.Min(source.Y
                                + source.Height, target.Y
                                + target.Height);

                        horizontal = top == bottom;
                    } 
                }
		    }

		    if (!horizontal && (vertical ||
			    mxUtils.GetString(state.Style, mxConstants.STYLE_ELBOW, "").Equals(mxConstants.ELBOW_VERTICAL)))
		    {
			    mxEdgeStyle.TopToBottom(state, source, target, points, result);
		    }
		    else
		    {
			    mxEdgeStyle.SideToSide(state, source, target, points, result);
		    }
        };

        /// <summary>
        /// Implements a vertical elbow edge.
        /// </summary>
        public static mxEdgeStyleFunction SideToSide = delegate(
            mxCellState state, mxCellState source,
            mxCellState target, List<mxPoint> points,
            List<mxPoint> result)
        {
            mxGraphView view = state.View;
            mxPoint pt = (points != null && points.Count > 0) ? points[0] : null;
            mxPoint p0 = state.AbsolutePoints[0];
            mxPoint pe = state.AbsolutePoints[state.AbsolutePointCount() - 1];

            if (pt != null)
            {
                pt = view.TransformControlPoint(state, pt);
            }

            if (p0 != null)
            {
                source = new mxCellState();
                source.X = p0.X;
                source.Y = p0.Y;
            }

            if (pe != null)
            {
                target = new mxCellState();
                target.X = pe.X;
                target.Y = pe.Y;
            }

            if (source != null && target != null)
            {
                double l = Math.Max(source.X, target.X);
                double r = Math.Min(source.X + source.Width,
                                 target.X + target.Width);

                double x = (pt != null) ? pt.X : r + (l - r) / 2;

                double y1 = view.GetRoutingCenterY(source);
                double y2 = view.GetRoutingCenterY(target);

                if (pt != null)
                {
                    if (pt.Y >= source.Y &&
                        pt.Y <= source.Y + source.Height)
                    {
                        y1 = pt.Y;
                    }

                    if (pt.Y >= target.Y &&
                        pt.Y <= target.Y + target.Height)
                    {
                        y2 = pt.Y;
                    }
                }

                if (!target.Contains(x, y1) &&
                    !source.Contains(x, y1))
                {
                    result.Add(new mxPoint(x, y1));
                }

                if (!target.Contains(x, y2) &&
                    !source.Contains(x, y2))
                {
                    result.Add(new mxPoint(x, y2));
                }

                if (result.Count == 1)
                {
                    if (pt != null)
                    {
                        result.Add(new mxPoint(x, pt.Y));
                    }
                    else
                    {
                        double t = Math.Max(source.Y, target.Y);
                        double b = Math.Min(source.Y + source.Height,
                                target.Y + target.Height);

                        result.Add(new mxPoint(x, t + (b - t) / 2));
                    }
                }
            }
        };

        /// <summary>
        /// Implements a horizontal elbow edge.
        /// </summary>
        public static mxEdgeStyleFunction TopToBottom = delegate(
            mxCellState state, mxCellState source,
            mxCellState target, List<mxPoint> points,
            List<mxPoint> result)
        {
            mxGraphView view = state.View;
            mxPoint pt = (points != null && points.Count > 0) ? points[0] : null;
            mxPoint p0 = state.AbsolutePoints[0];
            mxPoint pe = state.AbsolutePoints[state.AbsolutePointCount() - 1];

            if (pt != null)
            {
                pt = view.TransformControlPoint(state, pt);
            }

            if (p0 != null)
            {
                source = new mxCellState();
                source.X = p0.X;
                source.Y = p0.Y;
            }

            if (pe != null)
            {
                target = new mxCellState();
                target.X = pe.X;
                target.Y = pe.Y;
            }

            if (source != null && target != null)
            {
                double t = Math.Max(source.Y, target.Y);
                double b = Math.Min(source.Y + source.Height,
                                 target.Y + target.Height);

                double x = view.GetRoutingCenterX(source);

                if (pt != null &&
                    pt.X >= source.X &&
                    pt.X <= source.X + source.Width)
                {
                    x = pt.X;
                }

                double y = (pt != null) ? pt.Y : b + (t - b) / 2;

                if (!target.Contains(x, y) &&
                    !source.Contains(x, y))
                {
                    result.Add(new mxPoint(x, y));
                }

                if (pt != null &&
                    pt.X >= target.X &&
                    pt.X <= target.X + target.Width)
                {
                    x = pt.X;
                }
                else
                {
                    x = view.GetRoutingCenterX(target);
                }

                if (!target.Contains(x, y) &&
                    !source.Contains(x, y))
                {
                    result.Add(new mxPoint(x, y));
                }

                if (result.Count == 1)
                {
                    if (pt != null)
                    {
                        result.Add(new mxPoint(pt.X, y));
                    }
                    else
                    {
                        double l = Math.Max(source.X, target.X);
                        double r = Math.Min(source.X + source.Width,
                                target.X + target.Width);

                        result.Add(new mxPoint(l + (r - l) / 2, y));
                    }
                }
            }
        };

    }

}
