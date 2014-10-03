// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Represents the geometry of a cell. For vertices, the geometry consists
    /// of the x- and y-location, as well as the width and height. For edges,
    /// the edge either defines the source- and target-terminal, or the geometry
    /// defines the respective terminal points.
    /// </summary>
    public class mxGeometry : mxRectangle
    {

        /// <summary>
        /// Global switch to translate the points in translate. Default is true.
        /// </summary>
        public static bool TRANSLATE_CONTROL_POINTS = true;

        /// <summary>
        /// Stores alternate values for x, y, width and height in a rectangle.
        /// Default is null.
        /// </summary>
        protected mxRectangle alternateBounds;

        /// <summary>
        /// Defines the source-point of the edge. This is used if the
        /// corresponding edge does not have a source vertex. Otherwise it is
        /// ignored. Default is null.
        /// </summary>
        protected mxPoint sourcePoint;

        /// <summary>
        /// Defines the target-point of the edge. This is used if the
        /// corresponding edge does not have a source vertex. Otherwise it is
        /// ignored. Default is null.
        /// </summary>
        protected mxPoint targetPoint;

        /// <summary>
        /// Holds the offset of the label for edges. This is the absolute vector
        /// between the center of the edge and the top, left point of the label.
        /// Default is null.
        /// </summary>
        protected mxPoint offset;

        /// <summary>
        /// List of mxPoints which specifies the control points along the edge.
        /// These points are the intermediate points on the edge, for the endpoints
        /// use targetPoint and sourcePoint or set the terminals of the edge to
        /// a non-null value. Default is null.
        /// </summary>
        protected List<mxPoint> points;

        /// <summary>
        /// Specifies if the coordinates in the geometry are to be interpreted as
        /// relative coordinates. Default is false. This is used to mark a geometry
        /// with an x- and y-coordinate that is used to describe an edge label
        /// position.
        /// </summary>
        protected bool relative = false;

        /// <summary>
        /// Constructs a new geometry at (0, 0) with the width and height set to 0.
        /// </summary>
        public mxGeometry() : this(0, 0, 0, 0) { }

        /// <summary>
        /// Constructs a geometry using the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the new geometry.</param>
        /// <param name="y">Y-coordinate of the new geometry.</param>
        /// <param name="width">Width of the new geometry.</param>
        /// <param name="height">Height of the new geometry.</param>
        public mxGeometry(double x, double y, double width, double height) : base(x, y, width, height) { }

        /// <summary>
        /// Constructs a copy of the given geometry.
        /// </summary>
        /// <param name="geometry">Geometry to construct a copy of.</param>
        public mxGeometry(mxGeometry geometry)
            : base(geometry.X, geometry.Y, geometry.Width, geometry
                    .Height)
        {
            if (geometry.points != null)
            {
                points = new List<mxPoint>(geometry.points.Count);

                foreach (mxPoint pt in geometry.points)
                {
                    points.Add(pt.Clone());
                }
            }

            if (geometry.sourcePoint != null)
            {
                sourcePoint = geometry.sourcePoint.Clone();
            }

            if (geometry.targetPoint != null)
            {
                targetPoint = geometry.targetPoint.Clone();
            }

            if (geometry.offset != null)
            {
                offset = geometry.offset.Clone();
            }

            if (geometry.alternateBounds != null)
            {
                alternateBounds = geometry.alternateBounds.Clone();
            }

            relative = geometry.relative;
        }

        /// <summary>
        /// Sets or returns the alternate bounds.
        /// </summary>
        public mxRectangle AlternateBounds
        {
            get { return alternateBounds; }
            set { alternateBounds = value; }
        }

        /// <summary>
        /// Sets or returns the source point.
        /// </summary>
        public mxPoint SourcePoint
        {
            get { return sourcePoint; }
            set { sourcePoint = value; }
        }

        /// <summary>
        /// Sets or returns the target point.
        /// </summary>
        public mxPoint TargetPoint
        {
            get { return targetPoint; }
            set { targetPoint = value; }
        }

        /// <summary>
        /// Sets or returns the list of control points.
        /// </summary>
        public List<mxPoint> Points
        {
            get { return points; }
            set { points = value; }
        }

        /// <summary>
        /// Sets or returns the offset.
        /// </summary>
        public mxPoint Offset
        {
            get { return offset; }
            set { offset = value; }
        }

        /// <summary>
        /// Sets or returns if the geometry is relative.
        /// </summary>
        public bool Relative
        {
            get { return relative; }
            set { relative = value; }
        }

        /// <summary>
        /// Returns the point representing the source or target point of this edge.
        /// This is only used if the edge has no source or target vertex.
        /// </summary>
        /// <param name="source">Boolean that specifies if the source or target point
        /// should be returned.</param>
        /// <returns>Returns the source or target point.</returns>
        public mxPoint GetTerminalPoint(bool source)
        {
            return (source) ? sourcePoint : targetPoint;
        }

        /// <summary>
        /// Sets the sourcePoint or targetPoint to the given point and returns the
        /// new point.
        /// </summary>
        /// <param name="point">Point to be used as the new source or target point.</param>
        /// <param name="source">Boolean that specifies if the source or target point
        /// should be set.</param>
        /// <returns>Returns the new point.</returns>
        public mxPoint SetTerminalPoint(mxPoint point, bool source)
        {
            if (source)
            {
                sourcePoint = point;
            }
            else
            {
                targetPoint = point;
            }

            return point;
        }

        /// <summary>
        /// Translates the geometry by the specified amount. That is, x and y of the
        /// geometry, the sourcePoint, targetPoint and all elements of points are
        /// translated by the given amount. X and y are only translated if the
        /// geometry is not relative. If TRANSLATE_CONTROL_POINTS is false, then
        /// are not modified by this function.
        /// </summary>
        /// <param name="dx">Integer that specifies the x-coordinate of the translation.</param>
        /// <param name="dy">Integer that specifies the y-coordinate of the translation.</param>
        public void Translate(double dx, double dy)
        {
            // Translates the geometry
            if (!Relative)
            {
                x += dx;
                y += dy;
            }

            // Translates the source point
            if (sourcePoint != null)
            {
                sourcePoint.X += dx;
                sourcePoint.Y += dy;
            }

            // Translates the target point
            if (targetPoint != null)
            {
                targetPoint.X += dx;
                targetPoint.Y += dy;
            }

            // Translate the control points
            if (TRANSLATE_CONTROL_POINTS &&
                points != null)
            {
                int count = points.Count;

                for (int i = 0; i < count; i++)
                {
                    mxPoint pt = points[i];

                    pt.X += dx;
                    pt.Y += dy;
                }
            }
        }

        /// <summary>
        /// Returns a new instance of the same geometry.
        /// </summary>
        /// <returns>Returns a clone of the geometry.</returns>
        public new mxGeometry Clone()
        {
            return new mxGeometry(this);
        }

    }

}
