// $Id: mxGraphView.cs,v 1.2 2014/02/19 09:40:59 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Diagnostics;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a view for the graph. This class is in charge of computing the
    /// absolute coordinates for the relative child geometries, the points for
    /// perimeters and edge styles and keeping them cached in mxCellStates for
    /// faster retrieval. The states are updated whenever the model or the view
    /// state (translate, scale) changes. The scale and translate are honoured in
    /// the bounds.
    /// </summary>
    public class mxGraphView
    {
        /// <summary>
        /// Shared instance of an empty point.
        /// </summary>
        private static mxPoint EMPTY_POINT = new mxPoint();

        /// <summary>
        /// Reference to the enclosing graph.
        /// </summary>
        protected mxGraph graph;

        /// <summary>
        /// Caches the current bounds of the graph.
        /// </summary>
        protected mxRectangle graphBounds = new mxRectangle();

        /// <summary>
        /// Specifies the scale. Default is 1 (100%).
        /// </summary>
        protected double scale = 1;

        /// <summary>
        /// Point that specifies the current translation. Default is a new
        /// empty point.
        /// </summary>
        protected mxPoint translate = new mxPoint(0, 0);

        /// <summary>
        /// Maps from cells to cell states.
        /// </summary>
        protected Dictionary<Object, mxCellState> states = new Dictionary<Object, mxCellState>();

        /// <summary>
        /// Specifies if the view should be revalidated if the scale or
        /// translation changes.
        /// </summary>
        protected bool eventsEnabled = true;

        /// <summary>
        /// Constructs a new view for the given graph.
        /// </summary>
        /// <param name="graph">Reference to the enclosing graph.</param>
        public mxGraphView(mxGraph graph)
        {
            this.graph = graph;
        }

        /// <summary>
        /// Returns the enclosing graph.
        /// </summary>
        public mxGraph Graph
        {
            get { return graph; }
        }

        /// <summary>
        /// Returns the cached diagram bounds.
        /// </summary>
        public mxRectangle GraphBounds
        {
            get { return graphBounds; }
            set { graphBounds = value; }
        }

        /// <summary>
        /// Sets or returns the current scale.
        /// </summary>
        public double Scale
        {
            get { return scale; }
            set
            {
                if (scale != value)
                {
                    scale = value;
                    Revalidate();
                }
            }
        }

        /// <summary>
        /// Sets or returns the current translation.
        /// </summary>
        public mxPoint Translate
        {
            get { return translate; }
            set
            {
                if (translate.X != value.X ||
                    translate.Y != value.Y)
                {
                    translate = value;
                    Revalidate();
                }
            }
        }

        /// <summary>
        /// Sets or returns the current translation.
        /// </summary>
        public Dictionary<Object, mxCellState> States
        {
            get { return states; }
            set { states = value; }
        }

        /// <summary>
        /// Sets or returns the current scale.
        /// </summary>
        public bool IsEventsEnabled
        {
            get { return eventsEnabled; }
            set { eventsEnabled = value; }
        }

        /// <summary>
        /// Returns the bounding box for an array of cells or null, if no cells are
        /// specified.
        /// </summary>
        /// <param name="cells"></param>
        /// <returns></returns>
        public mxRectangle GetBounds(Object[] cells)
        {
            return GetBounds(cells, false);
        }

        /// <summary>
        /// Returns the bounding box for an array of cells or null, if no cells are
        /// specified.
        /// </summary>
        /// <param name="cells"></param>
        /// <returns></returns>
        public mxRectangle GetBoundingBox(Object[] cells)
        {
            return GetBounds(cells, true);
        }

        /// <summary>
        /// Returns the bounding box for an array of cells or null, if no cells are
        /// specified.
        /// </summary>
        public mxRectangle GetBounds(Object[] cells, bool boundingBox)
        {
            mxRectangle result = null;

            if (cells != null && cells.Length > 0)
            {
                mxIGraphModel model = graph.Model;

                for (int i = 0; i < cells.Length; i++)
                {
                    if (model.IsVertex(cells[i]) || model.IsEdge(cells[i]))
                    {
                        mxCellState state = GetState(cells[i]);

                        if (state != null)
                        {
                            mxRectangle tmp = (boundingBox) ? state.BoundingBox : state;

                            if (tmp != null)
                            {
                                if (result == null)
                                {
                                    result = new mxRectangle(tmp);
                                }
                                else
                                {
                                    result.Add(tmp);
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// First invalidates, then validates all cell states.
        /// </summary>
        public void Revalidate()
        {
            Invalidate();
            Validate();
        }

        /// <summary>
        /// Invalidates all cell states.
        /// </summary>
        public void Invalidate()
        {
            // LATER: Invalidate cell states recursively
            states.Clear();
        }

        /// <summary>
        /// First validates all bounds and then validates all points recursively on
        /// all visible cells.
        /// </summary>
        public void Validate()
        {
            Object cell = graph.Model.Root;

            if (cell != null && states.Count == 0)
            {
                mxRectangle graphBounds = GetBoundingBox(ValidateCellState(ValidateCell(cell)));
                GraphBounds = (graphBounds != null) ? graphBounds : new mxRectangle();
            }
        }

        /// <summary>
        /// Shortcut to validateCell with visible set to true.
        /// </summary>
        public mxRectangle GetBoundingBox(mxCellState state)
        {
            return GetBoundingBox(state, true);
        }

        /// <summary>
        /// Returns the bounding box of the shape and the label for the given
        /// cell state and its children if recurse is true.
        /// </summary>
        /// <param name="state">Cell state whose bounding box should be returned.</param>
        /// <param name="recurse">Boolean indicating if the children should be included.</param>
        public mxRectangle GetBoundingBox(mxCellState state, Boolean recurse)
        {
            mxRectangle bbox = null;

            if (state != null)
            {
                if (state.BoundingBox != null)
                {
                    bbox = (mxRectangle)state.BoundingBox.Clone();
                }

                if (recurse)
                {
                    mxIGraphModel model = graph.Model;
                    int childCount = model.GetChildCount(state.Cell);

                    for (int i = 0; i < childCount; i++)
                    {
                        mxRectangle bounds = GetBoundingBox(
                                GetState(model.GetChildAt(state.Cell, i)), true);

                        if (bounds != null)
                        {
                            if (bbox == null)
                            {
                                bbox = bounds;
                            }
                            else
                            {
                                bbox.Add(bounds);
                            }
                        }
                    }
                }
            }

            return bbox;
        }

        /// <summary>
        /// Shortcut to validateCell with visible set to true.
        /// </summary>
        public Object ValidateCell(Object cell)
        {
            return ValidateCell(cell, true);
        }

        /// <summary>
        /// Recursively creates the cell state for the given cell if visible is true and
        /// the given cell is visible. If the cell is not visible but the state exists
        /// then it is removed using removeState.
        /// </summary>
        /// <param name="cell">Cell whose cell state should be created.</param>
        /// <param name="visible">Boolean indicating if the cell should be visible.</param>
        public Object ValidateCell(Object cell, Boolean visible)
        {
            if (cell != null)
            {
                visible = visible && graph.IsCellVisible(cell);
                mxCellState state = GetState(cell, visible);

                if (state != null && !visible)
                {
                    RemoveState(cell);
                }
                else
                {
                    mxIGraphModel model = graph.Model;
                    int childCount = model.GetChildCount(cell);

                    for (int i = 0; i < childCount; i++)
                    {
                        ValidateCell(
                                model.GetChildAt(cell, i),
                                visible && !graph.IsCellCollapsed(cell));
                    }
                }
            }

            return cell;
        }

        /// <summary>
        /// Shortcut to validateCellState with recurse set to true.
        /// </summary>
        public mxCellState ValidateCellState(Object cell)
        {
            return ValidateCellState(cell, true);
        }

        /// <summary>
        /// Validates the cell state for the given cell.
        /// </summary>
        /// <param name="cell">Cell whose cell state should be validated.</param>
        /// <param name="recurse">Boolean indicating if the children of the cell should be
        /// validated.</param>
        /// <returns></returns>
        public mxCellState ValidateCellState(Object cell, Boolean recurse)
        {
            mxCellState state = null;

            if (cell != null)
            {
                state = GetState(cell);

                if (state != null)
                {
                    mxIGraphModel model = graph.Model;

                    if (state.Invalid)
                    {
                        state.Invalid = false;

                        ValidateCellState(model.GetParent(cell), false);
                        mxCellState source = ValidateCellState(GetVisibleTerminal(cell, true), false);
                        mxCellState target = ValidateCellState(GetVisibleTerminal(cell, false), false);

                        UpdateCellState(state, source, target);

                        if (model.IsEdge(cell) || model.IsVertex(cell))
                        {
                            UpdateLabelBounds(state);
                            UpdateBoundingBox(state);
                        }
                    }

                    if (recurse)
                    {
                        int childCount = model.GetChildCount(cell);

                        for (int i = 0; i < childCount; i++)
                        {
                            ValidateCellState(model.GetChildAt(cell, i));
                        }
                    }
                }
            }
            
            return state;
        }

        /// <summary>
        /// Updates the given cell state.
        /// </summary>
        /// <param name="state"></param>
        public void UpdateCellState(mxCellState state, mxCellState source, mxCellState target)
        {
            state.AbsoluteOffset.X = 0;
            state.AbsoluteOffset.Y = 0;
            state.Origin.X = 0;
            state.Origin.Y = 0;
            state.Length = 0;

            mxIGraphModel model = graph.Model;
            mxCellState pState = GetState(model.GetParent(state.Cell));

            if (pState != null)
            {
                state.Origin.X += pState.Origin.X;
                state.Origin.Y += pState.Origin.Y;
            }

            mxPoint offset = graph.GetChildOffsetForCell(state.Cell);

            if (offset != null)
            {
                state.Origin.X += offset.X;
                state.Origin.Y += offset.Y;
            }

            mxGeometry geo = graph.GetCellGeometry(state.Cell);

            if (geo != null)
            {
                if (!model.IsEdge(state.Cell))
                {
                    mxPoint origin = state.Origin;
                    offset = geo.Offset;

                    if (offset == null)
                    {
                        offset = EMPTY_POINT;
                    }

                    if (geo.Relative && pState != null)
                    {
                        if (model.IsEdge(pState.Cell))
                        {
                            mxPoint orig = GetPoint(pState, geo);

                            if (orig != null)
                            {
                                origin.X += (orig.X / scale) - pState.Origin.X - translate.X;
                                origin.Y += (orig.Y / scale) - pState.Origin.Y - translate.Y;
                            }
                        }
                        else
                        {
                            origin.X += geo.X * pState.Width / scale + offset.X;
                            origin.Y += geo.Y * pState.Height / scale + offset.Y;
                        }
                    }
                    else
                    {
                        state.AbsoluteOffset = new mxPoint(scale * offset.X,
                                scale * offset.Y);
                        origin.X += geo.X;
                        origin.Y += geo.Y;
                    }
                }

                state.X = scale * (translate.X + state.Origin.X);
                state.Y = scale * (translate.Y + state.Origin.Y);
                state.Width = scale * geo.Width;
                state.Height = scale * geo.Height;

                if (model.IsVertex(state.Cell))
                {
                    UpdateVertexState(state, geo);
                }

                if (model.IsEdge(state.Cell))
                {
                    UpdateEdgeState(state, geo, source, target);
                }
            }
        }

        /// <summary>
        /// Validates the given cell state.
        /// </summary>
        public void UpdateVertexState(mxCellState state, mxGeometry geo)
        {
            // LATER: Add support for rotation
            UpdateVertexLabelOffset(state);
        }

        /// <summary>
        /// Validates the given cell state.
        /// </summary>
        public void UpdateEdgeState(mxCellState state, mxGeometry geo, mxCellState source, mxCellState target)
        {
            // This will remove edges with no terminals and no terminal points
		    // as such edges are invalid and produce NPEs in the edge styles.
		    // Also removes connected edges that have no visible terminals.
		    if ((graph.Model.GetTerminal(state.Cell, true) != null && source == null) ||
			    (source == null && geo.GetTerminalPoint(true) == null) ||
			    (graph.Model.GetTerminal(state.Cell, false) != null && target == null) ||
			    (target == null && geo.GetTerminalPoint(false) == null))
		    {
                RemoveState(state.Cell, true);
            }
            else
            {
                UpdateFixedTerminalPoints(state, source, target);
                UpdatePoints(state, geo.Points, source, target);
                UpdateFloatingTerminalPoints(state, source, target);

                if (state.AbsolutePointCount() < 2 || state.AbsolutePoints[0] == null || state
                                .AbsolutePoints[state.AbsolutePointCount() - 1] == null)
                {
                    // This will remove edges with invalid points from the list of states in the view.
                    // Happens if the one of the terminals and the corresponding terminal point is null.
                    RemoveState(state.Cell, true);
                }
                else
                {
                    UpdateEdgeBounds(state);
                    state.AbsoluteOffset = GetPoint(state, geo);
                }
            }
        }

        /// <summary>
        /// Updates the absoluteOffset of the given vertex cell state. This takes
        /// into account the label position styles.
        /// </summary>
        /// <param name="state">Cell state whose absolute offset should be updated.</param>
        public void UpdateVertexLabelOffset(mxCellState state)
        {
            string horizontal = mxUtils.GetString(state.Style,
                    mxConstants.STYLE_LABEL_POSITION,
                    mxConstants.ALIGN_CENTER);

            if (horizontal.Equals(mxConstants.ALIGN_LEFT))
            {
                state.AbsoluteOffset.X -= state.Width;
            }
            else if (horizontal.Equals(mxConstants.ALIGN_RIGHT))
            {
                state.AbsoluteOffset.X += state.Width;
            }

            string vertical = mxUtils.GetString(state.Style,
                    mxConstants.STYLE_VERTICAL_LABEL_POSITION,
                    mxConstants.ALIGN_MIDDLE);

            if (vertical.Equals(mxConstants.ALIGN_TOP))
            {
                state.AbsoluteOffset.Y -= state.Height;
            }
            else if (vertical.Equals(mxConstants.ALIGN_BOTTOM))
            {
                state.AbsoluteOffset.Y += state.Height;
            }
        }

        /// <summary>
        /// Updates the label bounds in the given state.
        /// </summary>
        /// <param name="state"></param>
        public void UpdateLabelBounds(mxCellState state)
        {
            Object cell = state.Cell;
            Dictionary<string, Object> style = state.Style;

            if (mxUtils.GetString(style, mxConstants.STYLE_OVERFLOW, "").Equals("fill"))
            {
                state.LabelBounds = new mxRectangle(state);
            }
            else
            {
                string label = graph.GetLabel(cell);
                mxRectangle vertexBounds = (!graph.Model.IsEdge(cell)) ?
                    state : null;
                state.LabelBounds = mxUtils.GetLabelPaintBounds(label,
                    style, false, state.AbsoluteOffset, vertexBounds,
                    scale);
            }
        }

        /// <summary>
        /// Updates the bounding box in the given cell state.
        /// </summary>
        /// <param name="state">Cell state whose bounding box should be
        /// updated.</param>
        /// <returns></returns>
        public mxRectangle UpdateBoundingBox(mxCellState state)
        {
            // Gets the cell bounds and adds shadows and markers
            mxRectangle rect = new mxRectangle(state.GetRectangle());
            Dictionary<string, Object> style = state.Style;

            // Adds extra pixels for the marker and stroke assuming
            // that the border stroke is centered around the bounds
            // and the first pixel is drawn inside the bounds
            double strokeWidth = Math.Max(1, Math.Round(mxUtils.GetInt(style,
                    mxConstants.STYLE_STROKEWIDTH, 1)
                    * scale));
            strokeWidth -= Math.Max(1, strokeWidth / 2);

            if (graph.Model.IsEdge(state.Cell))
            {
                int ms = 0;

                if (style.ContainsKey(mxConstants.STYLE_ENDARROW)
                        || style.ContainsKey(mxConstants.STYLE_STARTARROW))
                {
                    ms = (int)Math.Round(mxConstants.DEFAULT_MARKERSIZE * scale);
                }

                // Adds the strokewidth
                rect.Grow(ms + strokeWidth);

                // Adds worst case border for an arrow shape
                if (mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "").Equals(
                        mxConstants.SHAPE_ARROW))
                {
                    rect.Grow(mxConstants.ARROW_WIDTH / 2);
                }
            }
            else
            {
                rect.Grow(strokeWidth);
            }

            // Adds extra pixels for the shadow
            if (mxUtils.IsTrue(style, mxConstants.STYLE_SHADOW))
            {
                rect.Width += mxConstants.SHADOW_OFFSETX;
                rect.Height += mxConstants.SHADOW_OFFSETY;
            }

            // Adds oversize images in labels
            if (mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "").Equals(
                    mxConstants.SHAPE_LABEL))
            {
                if (mxUtils.GetString(style, mxConstants.STYLE_IMAGE) != null)
                {
                    double w = mxUtils.GetInt(style,
                            mxConstants.STYLE_IMAGE_WIDTH,
                            mxConstants.DEFAULT_IMAGESIZE) * scale;
                    double h = mxUtils.GetInt(style,
                            mxConstants.STYLE_IMAGE_HEIGHT,
                            mxConstants.DEFAULT_IMAGESIZE) * scale;

                    double x = state.X;
                    double y = 0;

                    string imgAlign = mxUtils
                            .GetString(style, mxConstants.STYLE_IMAGE_ALIGN,
                                    mxConstants.ALIGN_LEFT);
                    string imgValign = mxUtils.GetString(style,
                            mxConstants.STYLE_IMAGE_VERTICAL_ALIGN,
                            mxConstants.ALIGN_MIDDLE);

                    if (imgAlign.Equals(mxConstants.ALIGN_RIGHT))
                    {
                        x += state.Width - w;
                    }
                    else if (imgAlign.Equals(mxConstants.ALIGN_CENTER))
                    {
                        x += (state.Width - w) / 2;
                    }

                    if (imgValign.Equals(mxConstants.ALIGN_TOP))
                    {
                        y = state.Y;
                    }
                    else if (imgValign.Equals(mxConstants.ALIGN_BOTTOM))
                    {
                        y = state.Y + state.Height - h;
                    }
                    else
                    {
                        y = state.Y + (state.Height - h) / 2;
                    }

                    rect.Add(new mxRectangle(x, y, w, h));
                }
            }

            // Adds the rotated bounds to the bounding box if the
            // shape is rotated
            double rotation = mxUtils.GetDouble(style, mxConstants.STYLE_ROTATION);
            mxRectangle bbox = mxUtils.GetBoundingBox(rect, rotation);

            // Add the rotated bounding box to the non-rotated so
            // that all handles are also covered
            if (bbox != null)
            {
                rect.Add(bbox);
            }

            // Unifies the cell bounds and the label bounds
            if (!mxUtils.GetString(style, mxConstants.STYLE_OVERFLOW, "").Equals("hidden"))
            {
                rect.Add(state.LabelBounds);
            }

            state.BoundingBox = rect;

            return rect;
        }

        /// <summary>
        /// Sets the initial absolute terminal points in the given state before the edge
        /// style is computed.
        /// </summary>
        /// <param name="edge">Cell state whose initial terminal points should be updated.</param>
        /// <param name="source">Cell state which represents the source terminal.</param>
        /// <param name="target">Cell state which represents the target terminal.</param>
        public void UpdateFixedTerminalPoints(mxCellState edge, mxCellState source, mxCellState target)
        {
            UpdateFixedTerminalPoint(edge, source, true,
                graph.GetConnectionConstraint(edge, source, true));
            UpdateFixedTerminalPoint(edge, target, false,
                graph.GetConnectionConstraint(edge, target, false));
        }

        /// <summary>
        /// Sets the fixed source or target terminal point on the given edge.
        /// </summary>
        /// <param name="edge">State whose terminal point should be updated.</param>
        /// <param name="terminal">State which represents the actual terminal.</param>
        /// <param name="source">Boolean that specifies if the terminal is the source.</param>
        /// <param name="constraint">Constraint that specifies the connection.</param>
        public void UpdateFixedTerminalPoint(mxCellState edge, mxCellState terminal,
            bool source, mxConnectionConstraint constraint)
        {
            mxPoint pt = null;

            if (constraint != null)
            {
                pt = graph.GetConnectionPoint(terminal, constraint);
            }

            if (pt == null && terminal == null)
            {
                mxPoint orig = edge.Origin;
                mxGeometry geo = graph.GetCellGeometry(edge.Cell);
                pt = geo.GetTerminalPoint(source);

                if (pt != null)
                {
                    pt = new mxPoint(scale * (translate.X + pt.X + orig.X),
                                     scale * (translate.Y + pt.Y + orig.Y));
                }
            }

            edge.SetAbsoluteTerminalPoint(pt, source);
        }

        /// <summary>
        /// Updates the absolute points in the given state using the specified array
        /// of points as the relative points.
        /// </summary>
        /// <param name="edge">Cell state whose absolute points should be updated.</param>
        /// <param name="points">Array of points that constitute the relative points.</param>
        /// <param name="source">Cell that represents the source terminal.</param>
        /// <param name="target">Cell that represents the target terminal.</param>
        public void UpdatePoints(mxCellState edge, List<mxPoint> points, mxCellState source, mxCellState target)
        {
            if (edge != null)
            {
                List<mxPoint> pts = new List<mxPoint>();
                pts.Add(edge.AbsolutePoints[0]);
                mxEdgeStyleFunction edgeStyle = GetEdgeStyle(edge, points, source, target);

                if (edgeStyle != null)
                {
                    mxCellState src = GetTerminalPort(edge, source, true);
                    mxCellState trg = GetTerminalPort(edge, target, false);

                    ((mxEdgeStyleFunction)edgeStyle)(edge, src, trg, points, pts);
                }
                else if (points != null)
                {
                    for (int i = 0; i < points.Count; i++)
                    {
                        if (points[i] is mxPoint)
                        {
                            mxPoint pt = points[i].Clone();
                            pts.Add(TransformControlPoint(edge, pt));
                        }
                    }
                }

                List<mxPoint> tmp = edge.AbsolutePoints;
                pts.Add(tmp[tmp.Count - 1]);

                edge.AbsolutePoints = pts;
            }
        }

        /// <summary>
        /// Transforms the given control point to an absolute point.
        /// </summary>
        public mxPoint TransformControlPoint(mxCellState state, mxPoint pt)
        {
            mxPoint orig = state.Origin;

            return new mxPoint(scale * (pt.X + translate.X + orig.X),
                scale * (pt.Y + translate.Y + orig.Y));
        }


        /// <summary>
        /// Returns the edge style function to be used to render the given edge
        /// state.
        /// </summary>
        public mxEdgeStyleFunction GetEdgeStyle(mxCellState edge, List<mxPoint> points,
            Object source, Object target)
        {
            object edgeStyle = null;

            if (source != null && source == target)
            {
                edge.Style.TryGetValue(mxConstants.STYLE_LOOP, out edgeStyle);

                if (edgeStyle == null)
                {
                    edgeStyle = graph.DefaultLoopStyle;
                }
            }
            else if (!mxUtils.IsTrue(edge.Style,
                mxConstants.STYLE_NOEDGESTYLE, false))
            {
                edge.Style.TryGetValue(mxConstants.STYLE_EDGE, out edgeStyle);
            }

            // Converts string values to objects
            if (edgeStyle is String)
            {
                string str = edgeStyle.ToString();
                Object tmp = mxStyleRegistry.GetValue(str);

                if (tmp == null)
                {
                    tmp = mxUtils.Eval(str);
                }

                edgeStyle = tmp;
            }

            if (edgeStyle is mxEdgeStyleFunction)
            {
                return (mxEdgeStyleFunction)edgeStyle;
            }

            return null;
        }

        /// <summary>
        /// Updates the terminal points in the given state after the edge style was
        /// computed for the edge.
        /// </summary>
        /// <param name="state">State whose terminal points should be updated.</param>
        /// <param name="source">State that represents the source terminal.</param>
        /// <param name="target">State that represents the target terminal.</param>
        public void UpdateFloatingTerminalPoints(mxCellState state, mxCellState source, mxCellState target)
        {
            mxPoint p0 = state.AbsolutePoints[0];
            mxPoint pe = state.AbsolutePoints[state.AbsolutePointCount() - 1];

            if (pe == null && target != null)
            {
                UpdateFloatingTerminalPoint(state, target, source, false);
            }

            if (p0 == null && source != null)
            {
                UpdateFloatingTerminalPoint(state, source, target, true);
            }
        }

        /// <summary>
        /// Updates the absolute terminal point in the given state for the given
        /// start and end state, where start is the source if source is true.
        /// </summary>
        /// <param name="edge">State whose terminal point should be updated.</param>
        /// <param name="start">for the terminal on "this" side of the edge.</param>
        /// <param name="end">for the terminal on the other side of the edge.</param>
        /// <param name="source">Boolean indicating if start is the source terminal state.</param>
        public void UpdateFloatingTerminalPoint(mxCellState edge, mxCellState start,
            mxCellState end, bool source)
        {
            start = GetTerminalPort(edge, start, source);
            mxPoint next = GetNextPoint(edge, end, source);
            double border = mxUtils.GetDouble(edge.Style, mxConstants.STYLE_PERIMETER_SPACING);
            border += mxUtils.GetDouble(edge.Style, (source) ?
                mxConstants.STYLE_SOURCE_PERIMETER_SPACING :
                mxConstants.STYLE_TARGET_PERIMETER_SPACING);
            mxPoint pt = GetPerimeterPoint(start, next, graph.IsOrthogonal(edge), border);
            edge.SetAbsoluteTerminalPoint(pt, source);
        }

        /// <summary>
        /// Returns the given terminal or the port defined in the given edge state if a
        /// cell state exists for that port.
        /// </summary>
        public mxCellState GetTerminalPort(mxCellState state, mxCellState terminal, bool source)
        {
            string key = (source) ? mxConstants.STYLE_SOURCE_PORT
                    : mxConstants.STYLE_TARGET_PORT;
            string id = mxUtils.GetString(state.Style, key);

            if (id != null && graph.Model is mxGraphModel)
            {
                mxCellState tmp = GetState(((mxGraphModel)graph.Model).GetCell(id));

                // Only uses ports where a cell state exists
                if (tmp != null)
                {
                    terminal = tmp;
                }
            }

            return terminal;
        }

        /// <summary>
        /// Returns a point that defines the location of the intersection point between
        /// the perimeter and the line between the center of the shape and the given point.
        /// </summary>
        public mxPoint GetPerimeterPoint(mxCellState terminal, mxPoint next, bool orthogonal)
        {
            return GetPerimeterPoint(terminal, next, orthogonal, 0);
        }

        /// <summary>
        /// Returns a point that defines the location of the intersection point between
        /// the perimeter and the line between the center of the shape and the given point.
        /// </summary>
        /// <param name="terminal">State for the source or target terminal.</param>
        /// <param name="next">Point that lies outside of the given terminal.</param>
        /// <param name="orthogonal">Specifies if the orthogonal projection onto
        /// the perimeter should be returned. If this is false then the intersection
        /// of the perimeter and the line between the next and the center point is
        /// returned.</param>
        /// <param name="border">Optional border between the perimeter and the shape.</param>
        public mxPoint GetPerimeterPoint(mxCellState terminal, mxPoint next, bool orthogonal, double border)
        {
            mxPoint point = null;

            if (terminal != null)
            {
                mxPerimeterFunction perimeter = GetPerimeterFunction(terminal);

                if (perimeter != null && next != null)
                {
                    mxRectangle bounds = GetPerimeterBounds(terminal, border);

                    if (bounds.Width > 0 || bounds.Height > 0)
                    {
                        point = perimeter(bounds, terminal, next, orthogonal);
                    }
                }

                if (point == null)
                {
                    point = GetPoint(terminal);
                }
            }

            return point;
        }

        /// <summary>
        /// Returns the x-coordinate of the center point for automatic routing.
        /// </summary>
        /// <returns>Returns the x-coordinate of the routing center point.</returns>
        public double GetRoutingCenterX(mxCellState state)
        {
            float f = (state.Style != null) ? mxUtils.GetFloat(state.
                Style, mxConstants.STYLE_ROUTING_CENTER_X) : 0;

            return state.GetCenterX() + f * state.Width;
        }

        /// <summary>
        /// Returns the y-coordinate of the center point for automatic routing.
        /// </summary>
        /// <returns>Returns the y-coordinate of the routing center point.</returns>
        public double GetRoutingCenterY(mxCellState state)
        {
            float f = (state.Style != null) ? mxUtils.GetFloat(state.
                Style, mxConstants.STYLE_ROUTING_CENTER_Y) : 0;

            return state.GetCenterY() + f * state.Height;
        }

        /// <summary>
        /// Returns the perimeter bounds for the given terminal, edge pair.
        /// </summary>
        public mxRectangle GetPerimeterBounds(mxCellState terminal, double border)
        {
            if (terminal != null)
            {
                border += mxUtils.GetDouble(terminal.Style, mxConstants.STYLE_PERIMETER_SPACING);
            }

            return terminal.GetPerimeterBounds(border * scale);
        }

        /// <summary>
        /// Returns the perimeter function for the given state.
        /// </summary>
        public mxPerimeterFunction GetPerimeterFunction(mxCellState state)
        {
            object perimeter = null;
            state.Style.TryGetValue(mxConstants.STYLE_PERIMETER, out perimeter);

            // Converts string values to objects
            if (perimeter is String)
            {
                string str = perimeter.ToString();
                Object tmp = mxStyleRegistry.GetValue(str);

                if (tmp == null)
                {
                    tmp = mxUtils.Eval(str);
                }

                perimeter = tmp;
            }

            if (perimeter is mxPerimeterFunction)
            {
                return (mxPerimeterFunction)perimeter;
            }

            return null;
        }

        /// <summary>
        /// Returns the nearest point in the list of absolute points or the center
        /// of the opposite terminal.
        /// </summary>
        /// <param name="edge">State that represents the edge.</param>
        /// <param name="opposite">State that represents the opposite terminal.</param>
        /// <param name="source">Boolean indicating if the next point for the source or target
        /// should be returned.</param>
        public mxPoint GetNextPoint(mxCellState edge, mxCellState opposite, bool source)
        {
            List<mxPoint> pts = edge.AbsolutePoints;
            mxPoint point = null;

            if (pts != null && pts.Count >= 2)
            {
                int count = pts.Count;
                int index = (source) ? Math.Min(1, count - 1) : Math.Max(0, count - 2);
                point = pts[index];
            }

            if (point == null && opposite != null)
            {
                point = new mxPoint(opposite.GetCenterX(), opposite.GetCenterY());
            }

            return point;
        }

        /// <summary>
        /// Returns the nearest ancestor terminal that is visible. The edge appears
        /// to be connected to this terminal on the display.
        /// </summary>
        /// <param name="edge">Cell whose visible terminal should be returned.</param>
        /// <param name="source">Boolean that specifies if the source or target terminal
        /// should be returned.</param>
        /// <returns>Returns the visible source or target terminal.</returns>
        public Object GetVisibleTerminal(Object edge, bool source)
        {
            mxIGraphModel model = graph.Model;
            Object result = model.GetTerminal(edge, source);
            Object best = result;

            while (result != null)
            {
                if (!graph.IsCellVisible(best) ||
                    graph.IsCellCollapsed(result))
                {
                    best = result;
                }

                result = model.GetParent(result);
            }

            // Checks if the result is not a layer
            if (model.GetParent(best) == model.Root)
            {
                best = null;
            }

            return best;
        }

        /// <summary>
        /// Updates the given state using the bounding box of the absolute points.
        /// Also updates terminal distance, length and segments.
        /// </summary>
        /// <param name="state">Cell state whose bounds should be updated.</param>
        public void UpdateEdgeBounds(mxCellState state)
        {
            List<mxPoint> points = state.AbsolutePoints;
            mxPoint p0 = points[0];
            mxPoint pe = points[points.Count - 1];

            if (p0 == null || pe == null)
            {

                // Note: This is an error that normally occurs
                // if a connected edge has a null-terminal, ie.
                // edge.source == null or edge.target == null.
                states.Remove(state.Cell);
            }
            else
            {
                if (p0.X != pe.X || p0.Y != pe.Y)
                {
                    double dx = pe.X - p0.X;
                    double dy = pe.Y - p0.Y;
                    state.TerminalDistance = Math.Sqrt(dx * dx + dy * dy);
                }
                else
                {
                    state.TerminalDistance = 0;
                }

                double length = 0;
                double[] segments = new double[points.Count - 1];
                mxPoint pt = p0;

                if (pt != null)
                {
                    double minX = pt.X;
                    double minY = pt.Y;
                    double maxX = minX;
                    double maxY = minY;

                    for (int i = 1; i < points.Count; i++)
                    {
                        mxPoint tmp = points[i];
                        if (tmp != null)
                        {
                            double dx = pt.X - tmp.X;
                            double dy = pt.Y - tmp.Y;

                            double segment = Math.Sqrt(dx * dx + dy * dy);
                            segments[i - 1] = segment;
                            length += segment;
                            pt = tmp;

                            minX = Math.Min(pt.X, minX);
                            minY = Math.Min(pt.Y, minY);
                            maxX = Math.Max(pt.X, maxX);
                            maxY = Math.Max(pt.Y, maxY);
                        }
                    }

                    state.Length = length;
                    state.Segments = segments;
                    double markerSize = 1; // TODO: include marker size

                    state.X = minX;
                    state.Y = minY;
                    state.Width = Math.Max(markerSize, maxX - minX);
                    state.Height = Math.Max(markerSize, maxY - minY);
                }
                else
                {
                    state.Length = 0;
                }
            }
        }

        /// <summary>
        /// Returns the absolute center point along the given edge.
        /// </summary>
        public mxPoint GetPoint(mxCellState state)
        {
            return GetPoint(state, null);
        }

        /// <summary>
        /// Returns the absolute point on the edge for the given relative
        /// geometry as a point. The edge is represented by the given cell state.
        /// </summary>
        /// <param name="state">Represents the state of the parent edge.</param>
        /// <param name="geometry">Represents the relative location.</param>
        public mxPoint GetPoint(mxCellState state, mxGeometry geometry)
        {
            double x = state.GetCenterX();
            double y = state.GetCenterY();

            if (state.Segments != null && (geometry == null || geometry.Relative))
            {
                double gx = (geometry != null) ? geometry.X / 2 : 0;
                int pointCount = state.AbsolutePoints.Count;
                double dist = (gx + 0.5) * state.Length;
                double[] segments = state.Segments;
                double segment = segments[0];
                double length = 0;
                int index = 1;

                while (dist > length + segment && index < pointCount - 1)
                {
                    length += segment;
                    segment = segments[index++];
                }

                double factor = (segment == 0) ? 0 : (dist - length) / segment;
                mxPoint p0 = state.AbsolutePoints[index - 1];
                mxPoint pe = state.AbsolutePoints[index];

                if (p0 != null &&
                    pe != null)
                {
                    double gy = 0;
                    double offsetX = 0;
                    double offsetY = 0;

                    if (geometry != null)
                    {
                        gy = geometry.Y;
                        mxPoint offset = geometry.Offset;

                        if (offset != null)
                        {
                            offsetX = offset.X;
                            offsetY = offset.Y;
                        }
                    }

                    double dx = pe.X - p0.X;
                    double dy = pe.Y - p0.Y;
                    double nx = (segment == 0) ? 0 : dy / segment;
                    double ny = (segment == 0) ? 0 : dx / segment;

                    x = p0.X + dx * factor + (nx * gy + offsetX) * scale;
                    y = p0.Y + dy * factor - (ny * gy - offsetY) * scale;
                }
            }
            else if (geometry != null)
            {
                mxPoint offset = geometry.Offset;

                if (offset != null)
                {
                    x += offset.X;
                    y += offset.Y;
                }
            }

            return new mxPoint(x, y);
        }

        /// <summary>
        /// Returns the state for the given cell or null if no state is defined for
        /// the cell.
        /// </summary>
        /// <param name="cell">Cell whose state should be returned.</param>
        /// <returns>Returns the state for the given cell.</returns>
        public mxCellState GetState(Object cell)
        {
            return GetState(cell, false);
        }

        /// <summary>
        /// Returns the object that maps from cells to states.
        /// </summary>
        public Dictionary<Object, mxCellState> GetStates(Object[] cells)
        {
            return states;
        }

        /// <summary>
        /// Returns the states for the given array of cells. The array contains
        /// all states that are not null, that is, the returned array may have
        /// less elements than the given array.
        /// </summary>
        public mxCellState[] GetCellStates(Object[] cells)
        {
            List<mxCellState> result = new List<mxCellState>(cells.Length);

            for (int i = 0; i < cells.Length; i++)
            {
                mxCellState state = GetState(cells[i]);

                if (state != null)
                {
                    result.Add(state);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns the cell state for the given cell. If create is true, then
        /// the state is created if it does not yet exist.
        /// </summary>
        /// <param name="cell">Cell for which a new state should be returned.</param>
        /// <param name="create">Boolean indicating if a new state should be created if it
        /// does not yet exist.</param>
        /// <returns>Returns the state for the given cell.</returns>
        public mxCellState GetState(Object cell, bool create)
        {
            mxCellState state = null;

            if (cell != null)
            {
                if (states.ContainsKey(cell))
                {
                    state = states[cell];
                }
                else if (create && graph.IsCellVisible(cell))
                {
                    state = CreateState(cell);
                    states[cell] = state;
                }
            }

            return state;
        }

        /// <summary>
        /// Shortcut to removeState with recurse set to false.
        /// </summary>
        public mxCellState RemoveState(Object cell)
        {
            mxCellState state = null;

            if (states.ContainsKey(cell))
            {
                state = states[cell];
                states.Remove(cell);
            }

            return state;
        }

        /// <summary>
        /// Removes and returns the mxCellState for the given cell.
        /// </summary>
        /// <param name="cell">mxCell for which the mxCellState should be removed.</param>
        /// <returns>Returns the mxCellState that has been removed.</returns>
        public mxCellState RemoveState(Object cell, Boolean recurse)
        {
            if (recurse)
            {
                mxIGraphModel model = graph.Model;
                int childCount = model.GetChildCount(cell);

                for (int i = 0; i < childCount; i++)
                {
                    RemoveState(model.GetChildAt(cell, i), true);
                }
            }

            mxCellState state = null;

            if (states.ContainsKey(cell))
            {
                state = states[cell];
                states.Remove(cell);
            }

            return state;
        }

        /// <summary>
        /// Creates and returns a cell state for the given cell.
        /// </summary>
        /// <param name="cell">Cell for which a new state should be created.</param>
        /// <returns>Returns a new state for the given cell.</returns>
        public mxCellState CreateState(Object cell)
        {
            Dictionary<string, Object> style = graph.GetCellStyle(cell);

            return new mxCellState(this, cell, style);
        }

    }

}
