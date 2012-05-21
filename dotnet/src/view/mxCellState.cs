// $Id: mxCellState.cs,v 1.25 2010-06-09 17:32:14 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Represents the current state of a cell in a given graph view.
    /// </summary>
    public class mxCellState : mxRectangle
    {
        /// <summary>
        /// Reference to the enclosing graph view.
        /// </summary>
        protected mxGraphView view;

        /// <summary>
        /// Reference to the cell that is represented by this state.
        /// </summary>
        protected Object cell;

        /// <summary>
        /// Contains an array of key, value pairs that represent the style of the
        /// cell.
        /// </summary>
        protected Dictionary<string, Object> style;

        /// <summary>
        /// Holds the origin for all child cells.
        /// </summary>
        protected mxPoint origin = new mxPoint();

        /// <summary>
        /// List of mxPoints that represent the absolute points of an edge.
        /// </summary>
        protected List<mxPoint> absolutePoints;

        /// <summary>
        /// Holds the absolute offset. For edges, this is the absolute coordinates
        /// of the label position. For vertices, this is the offset of the label
        /// relative to the top, left corner of the vertex.
        /// </summary>
        protected mxPoint absoluteOffset = new mxPoint();

        /// <summary>
        /// Caches the distance between the end points of an edge.
        /// </summary>
        protected double terminalDistance;

        /// <summary>
        /// Caches the length of an edge.
        /// </summary>
        protected double length;

        /// <summary>
        /// Array of numbers that represent the cached length of each segment of the
        /// edge.
        /// </summary>
        protected double[] segments;

        /// <summary>
        /// Holds the rectangle which contains the label.
        /// </summary>
        protected mxRectangle labelBounds;

        /// <summary>
        /// Holds the largest rectangle which contains all rendering for this cell.
        /// </summary>
        protected mxRectangle boundingBox;

        /// <summary>
        /// Constructs an empty cell state.
        /// </summary>
        public mxCellState() : this(null, null, null) { }

        /// <summary>
        /// Constructs a new object that represents the current state of the given
        /// cell in the specified view.
        /// </summary>
        /// <param name="view">Graph view that contains the state.</param>
        /// <param name="cell">Cell that this state represents.</param>
        /// <param name="style">Array of key, value pairs that constitute the style.</param>
        public mxCellState(mxGraphView view, Object cell, Dictionary<string, Object> style)
        {
            View = view;
            Cell = cell;
            Style = style;
        }

        /// <summary>
        /// Sets or returns the enclosing graph view.
        /// </summary>
        public mxGraphView View
        {
            get { return view; }
            set { view = value; }
        }

        /// <summary>
        /// Sets or returns the cell that is represented by this state.
        /// </summary>
        public Object Cell
        {
            get { return cell; }
            set { cell = value; }
        }

        /// <summary>
        /// Sets or returns the cell style as a map of key, value pairs.
        /// </summary>
        public Dictionary<string, Object> Style
        {
            get { return style; }
            set { style = value; }
        }

        /// <summary>
        /// Sets or returns the origin for the children.
        /// </summary>
        public mxPoint Origin
        {
            get { return origin; }
            set { origin = value; }
        }

        /// <summary>
        /// Sets or returns the absolute points.
        /// </summary>
        public List<mxPoint> AbsolutePoints
        {
            get { return absolutePoints; }
            set { absolutePoints = value; }
        }

        /// <summary>
        /// Sets or returns the absolute offset.
        /// </summary>
        public mxPoint AbsoluteOffset
        {
            get { return absoluteOffset; }
            set { absoluteOffset = value; }
        }

        /// <summary>
        /// Sets or returns the terminal distance.
        /// </summary>
        public double TerminalDistance
        {
            get { return terminalDistance; }
            set { terminalDistance = value; }
        }

        /// <summary>
        /// Sets or returns the length.
        /// </summary>
        public double Length
        {
            get { return length; }
            set { length = value; }
        }

        /// <summary>
        /// Sets or returns the length of the segments.
        /// </summary>
        public double[] Segments
        {
            get { return segments; }
            set { segments = value; }
        }

        /// <summary>
        /// Sets or returns the label bounds.
        /// </summary>
        public mxRectangle LabelBounds
        {
            get { return labelBounds; }
            set { labelBounds = value; }
        }

        /// <summary>
        /// Sets or returns the bounding box.
        /// </summary>
        public mxRectangle BoundingBox
        {
            get { return boundingBox; }
            set { boundingBox = value; }
        }

        /// <summary>
        /// Returns the number of absolute points.
        /// </summary>
        /// <returns></returns>
        public int AbsolutePointCount()
        {
            return (absolutePoints != null) ? absolutePoints.Count : 0;
        }

        /// <summary>
        /// Returns the rectangle that should be used as the perimeter of the cell.
        /// This implementation adds the perimeter spacing to the rectangle
        /// defined by this cell state.
        /// </summary>
        /// <returns>Returns the rectangle that defines the perimeter.</returns>
        public mxRectangle GetPerimeterBounds()
        {
            return GetPerimeterBounds(0);
        }

        /// <summary>
        /// Returns the rectangle that should be used as the perimeter of the cell.
        /// </summary>
        /// <param name="border"></param>
        /// <returns>Returns the rectangle that defines the perimeter.</returns>
        public mxRectangle GetPerimeterBounds(double border)
        {
            mxRectangle bounds = new mxRectangle(this);

            if (border != 0)
            {
                bounds.Grow(border);
            }

            return bounds;
        }

        /// <summary>
        /// Sets the first or last point in the list of points depending on source.
        /// </summary>
        /// <param name="point">Point that represents the terminal point.</param>
        /// <param name="source">Boolean that specifies if the first or last point should
        /// be assigned.</param>
        public void SetAbsoluteTerminalPoint(mxPoint point, bool source)
        {
            if (source)
            {
                if (absolutePoints == null)
                {
                    absolutePoints = new List<mxPoint>();
                }

                if (absolutePoints == null ||
                    absolutePoints.Count == 0)
                {
                    absolutePoints.Add(point);
                }
                else
                {
                    absolutePoints[0] = point;
                }
            }
            else
            {
                if (absolutePoints == null)
                {
                    absolutePoints = new List<mxPoint>();
                    absolutePoints.Add(null);
                    absolutePoints.Add(point);
                }
                else if (absolutePoints.Count == 1)
                {
                    absolutePoints.Add(point);
                }
                else
                {
                    absolutePoints[absolutePoints.Count - 1] = point;
                }
            }
        }

        /// <summary>
        /// Returns a clone of this state where all members are deeply cloned
        /// except the view and cell references, which are copied with no
        /// cloning to the new instance.
        /// </summary>
        /// <returns></returns>
        new public mxCellState Clone()
        {
            mxCellState clone = new mxCellState(view, cell, style);

            if (absolutePoints != null)
            {
                clone.absolutePoints = new List<mxPoint>();

                foreach (mxPoint pt in absolutePoints)
                {
                    clone.absolutePoints.Add(pt.Clone());
                }
            }

            if (origin != null)
            {
                clone.origin = origin.Clone();
            }

            if (absoluteOffset != null)
            {
                clone.absoluteOffset = absoluteOffset.Clone();
            }

            if (labelBounds != null)
            {
                clone.labelBounds = labelBounds.Clone();
            }

            if (boundingBox != null)
            {
                clone.boundingBox = boundingBox.Clone();
            }

            clone.terminalDistance = terminalDistance;
            clone.segments = segments;
            clone.length = length;
            clone.x = x;
            clone.y = y;
            clone.width = width;
            clone.height = height;

            return clone;
        }

    }
}
