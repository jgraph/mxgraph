// $Id: mxGraph.cs,v 1.105 2012-04-18 09:05:49 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a graph object that allows to create diagrams from a graph model
    /// and stylesheet.
    /// </summary>
    public class mxGraph
    {
        /// <summary>
        /// Holds the version number of this release. Current version
        /// is 1.10.4.2.
        /// </summary>
        public const String VERSION = "1.10.4.2";

        /// <summary>
        /// Holds the model that contains the cells to be displayed.
        /// </summary>
        protected mxIGraphModel model;

        /// <summary>
        /// Holds the stylesheet that defines the appearance of the cells.
        /// </summary>
        protected mxStylesheet stylesheet;

        /// <summary>
        /// Holds the view that caches the cell states.
        /// </summary>
        protected mxGraphView view;

        /// <summary>
        /// Specifies the default style for loops.
        /// </summary>
        protected mxEdgeStyleFunction defaultLoopStyle = mxEdgeStyle.Loop;

        /// <summary>
        /// Specifies the tolerance for mouse clicks. Default is 4.
        /// </summary>
        protected int tolerance = 4;

        /// <summary>
        /// Specifies if labels should be visible. This is used in
        /// GetLabel. Default is true.
        /// </summary>
        protected bool labelsVisible = true;

        /// <summary>
        /// Specifies the grid size. Default is 10.
        /// </summary>
        protected int gridSize = 10;

        /// <summary>
        /// Specifies if the grid is enabled. Default is true.
        /// </summary>
        protected bool gridEnabled = true;

        /// <summary>
        /// Holds the list of image bundles.
        /// </summary>
        protected List<mxImageBundle> imageBundles = new List<mxImageBundle>();

        /// <summary>
        /// Constructs a new graph with an empty graph model.
        /// </summary>
        public mxGraph() : this(null, null) { }

        /// <summary>
        /// Constructs a new graph for the specified model. If no model is
        /// specified, then a new, empty graph model is used.
        /// </summary>
        public mxGraph(mxIGraphModel model) : this(model, null) { }

        /// <summary>
        /// Constructs a new graph for the specified model. If no model is
        /// specified, then a new, empty graph model is used.
        /// </summary>
        public mxGraph(mxStylesheet stylesheet) : this(null, stylesheet) { }

        /// <summary>
        /// Constructs a new graph for the specified model. If no model is
        /// specified, then a new, empty graph model is used.
        /// </summary>
        public mxGraph(mxIGraphModel model, mxStylesheet stylesheet)
        {
            this.Model = (model != null) ? model : new mxGraphModel();
            this.Stylesheet = (stylesheet != null) ? stylesheet : CreateStylesheet();
            this.View = CreateGraphView();
        }

        /// <summary>
        /// Constructs a new stylesheet to be used in this graph.
        /// </summary>
        /// <returns></returns>
        protected mxStylesheet CreateStylesheet()
        {
            return new mxStylesheet();
        }

        /// <summary>
        /// Constructs a new view to be used in this graph.
        /// </summary>
        /// <returns></returns>
        protected mxGraphView CreateGraphView()
        {
            return new mxGraphView(this);
        }

        /// <summary>
        /// Sets or returns the graph model that contains the graph data.
        /// </summary>
        public mxIGraphModel Model
        {
            get { return model; }
            set
            {
                // TODO: Remove listener from old model
                model = value;
                model.GraphModelChange += new mxGraphModelChangeEventHandler(GraphModelChanged);
            }
        }

        /// <summary>
        /// Sets or returns the stylesheet that provides the style.
        /// </summary>
        public mxStylesheet Stylesheet
        {
            get { return stylesheet; }
            set { stylesheet = value; }
        }

        /// <summary>
        /// Sets or returns the view that contains the cell states.
        /// </summary>
        public mxGraphView View
        {
            get { return view; }
            set
            {
                view = value;

                if (view != null)
                {
                    view.Revalidate();
                }
            }
        }

        /// <summary>
        /// Sets or returns the default edge style for loops.
        /// </summary>
        public mxEdgeStyleFunction DefaultLoopStyle
        {
            get { return defaultLoopStyle; }
            set { defaultLoopStyle = value; }
        }

        /// <summary>
        /// Sets or returns the enabled state of the grid.
        /// </summary>
        public bool GridEnabled
        {
            get { return gridEnabled; }
            set { gridEnabled = value; }
        }

        /// <summary>
        /// Sets or returns the grid size.
        /// </summary>
        public int GridSize
        {
            get { return gridSize; }
            set { gridSize = value; }
        }

        /// <summary>
        /// Sets or returns if labels are visible
        /// </summary>
        public bool LabelsVisible
        {
            get { return labelsVisible; }
            set { labelsVisible = value; }
        }

        /// <summary>
        /// Sets or returns the image bundles.
        /// </summary>
        public List<mxImageBundle> ImageBundles
        {
            get { return imageBundles; }
            set { imageBundles = value; }
        }

        /// <summary>
        /// Snaps the given numeric value to the grid if gridEnabled is true.
        /// </summary>
        /// <param name="value">Numeric value to be snapped to the grid.</param>
        /// <returns>Returns the value aligned to the grid.</returns>
        public double Snap(double value)
        {
            if (GridEnabled)
            {
                value = Math.Round(value / gridSize) * gridSize;
            }

            return value;
        }

        /// <summary>
        /// Returns the first child of the root in the model, that is, the first or
        /// default layer of the diagram.
        /// </summary>
        /// <returns>Returns the default parent for new cells.</returns>
        public Object GetDefaultParent()
        {
            return model.GetChildAt(model.Root, 0);
        }

        /// <summary>
        /// Returns the textual representation for the given cell.
        /// </summary>
        /// <param name="cell">Cell to be converted to a string.</param>
        /// <returns>Returns the textual representation of the cell.</returns>
        public string ConvertValueToString(Object cell)
        {
            Object result = model.GetValue(cell);

            return (result != null) ? result.ToString() : "";
        }

        /// <summary>
        /// Returns a string or markup that represents the label for the given
        /// cell. This implementation uses ConvertValueToString if labelsVisible
        /// is true. Otherwise it returns an empty string.
        /// </summary>
        /// <param name="cell"></param>
        /// <returns></returns>
        public string GetLabel(Object cell)
        {
            string result = "";

            if (cell != null)
            {
                mxCellState state = View.GetState(cell);
                Dictionary<string, Object> style = (state != null) ?
                    state.Style : GetCellStyle(cell);

                if (labelsVisible &&
                    !mxUtils.IsTrue(style, mxConstants.STYLE_NOLABEL, false))
                {
                    result = ConvertValueToString(cell);
                }
            }

            return result;
        }

        /// <summary>
        /// Returns the offset to be used for the cells inside the given cell. The
        /// root and layer cells may be identified using mxGraphModel.isRoot and
        /// mxGraphModel.isLayer. This implementation returns null.
        /// </summary>
        /// <param name="cell">Cell whose offset should be returned.</param>
        /// <returns>Returns the child offset for the given cell.</returns>
        public mxPoint GetChildOffsetForCell(Object cell)
        {
            return null;
        }

        /// <summary>
        /// Returns true if perimeter points should be computed such that the
        /// resulting edge has only horizontal or vertical segments. 
        /// </summary>
        /// <param name="edge">Cell state that represents the edge.</param>
        /// <returns>True if the edge is orthogonal.</returns>
        public bool IsOrthogonal(mxCellState edge)
        {
            if (edge.Style.ContainsKey(mxConstants.STYLE_ORTHOGONAL))
            {
                return mxUtils.IsTrue(edge.Style, mxConstants.STYLE_ORTHOGONAL);
            }

            mxEdgeStyleFunction tmp = view.GetEdgeStyle(edge, null, null, null);

            return tmp == mxEdgeStyle.ElbowConnector ||
                tmp == mxEdgeStyle.SideToSide ||
                tmp == mxEdgeStyle.TopToBottom ||
                tmp == mxEdgeStyle.EntityRelation;
        }

        /// <summary>
        /// Returns true if the given cell is a swimlane.
        /// </summary>
        /// <param name="cell">Cell that should be checked.</param>
        /// <returns>Returns true if the cell is a swimlane.</returns>
        public bool IsSwimlane(Object cell)
        {
            if (cell != null)
            {
                if (Model.GetParent(cell) != Model.Root)
                {
                    mxCellState state = View.GetState(cell);
                    Dictionary<string, Object> style = (state != null) ?
                        state.Style : GetCellStyle(cell);

                    if (style != null &&
                        !Model.IsEdge(cell))
                    {
                        return mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "").
                            Equals(mxConstants.SHAPE_SWIMLANE);
                    }
                }
            }

            return false;
        }

        /// <summary>
        /// Returns true if the given cell is movable. This implementation always
        /// returns true.
        /// </summary>
        /// <param name="cell">Cell whose movable state should be returned.</param>
        /// <returns>Returns true if the cell is movable.</returns>
        public bool IsCellMovable(Object cell)
        {
            return true;
        }

        /// <summary>
        /// Returns true if the given cell is visible. This implementation returns
        /// true if the visible state of the cell in the model is true.
        /// </summary>
        /// <param name="cell">Cell whose visible state should be returned.</param>
        /// <returns>Returns the visible state of the cell.</returns>
        public bool IsCellVisible(Object cell)
        {
            return model.IsVisible(cell);
        }

        /// <summary>
        /// Returns true if the given cell is collapsed. This implementation returns
        /// true if the collapsed state of the cell in the model is true.
        /// </summary>
        /// <param name="cell">Cell whose collapsed state should be returned.</param>
        /// <returns>Returns the collapsed state of the cell.</returns>
        public bool IsCellCollapsed(Object cell)
        {
            return model.IsCollapsed(cell);
        }

        /// <summary>
        /// Returns true if the given cell is connectable. This implementation returns
        /// true if the connectable state of the cell in the model is true.
        /// </summary>
        /// <param name="cell">Cell whose connectable state should be returned.</param>
        /// <returns>Returns the connectable state of the cell.</returns>
        public bool IsCellConnectable(Object cell)
        {
            return model.IsConnectable(cell);
        }

        /// <summary>
        /// Returns the geometry for the given cell.
        /// </summary>
        /// <param name="cell">Cell whose geometry should be returned.</param>
        /// <returns>Returns the geometry of the cell.</returns>
        public mxGeometry GetCellGeometry(Object cell)
        {
            return model.GetGeometry(cell);
        }

        /// <summary>
        /// Returns the style for the given cell.
        /// </summary>
        /// <param name="cell">Cell whose style should be returned.</param>
        /// <returns>Returns the style of the cell.</returns>
        public Dictionary<string, Object> GetCellStyle(Object cell)
        {
            Dictionary<string, Object> style = (model.IsEdge(cell)) ?
                stylesheet.DefaultEdgeStyle :
                stylesheet.DefaultVertexStyle;

            string name = model.GetStyle(cell);

            if (name != null)
            {
                style = PostProcessCellStyle(stylesheet.GetCellStyle(name, style));
            }

            if (style == null)
            {
                style = mxStylesheet.EMPTY_STYLE;
            }

            return style;
        }

        /// <summary>
        /// Tries to resolve the value for the image style in the image bundles
        /// and turns short data URIs as defined in mxImageBundle to data URIs
        /// as defined in RFC 2397 of the IETF.
        /// </summary>
        protected Dictionary<string, Object> PostProcessCellStyle(Dictionary<string, Object> style)
        {
            if (style != null)
            {
                String key = mxUtils.GetString(style, mxConstants.STYLE_IMAGE);
                String image = GetImageFromBundles(key);

                if (image != null)
                {
                    style[mxConstants.STYLE_IMAGE] = image;
                }
                else
                {
                    image = key;
                }

                // Converts short data uris to normal data uris
                if (image != null && image.StartsWith("data:image/"))
                {
                    int comma = image.IndexOf(',');

                    if (comma > 0)
                    {
                        image = image.Substring(0, comma) + ";base64," +
                            image.Substring(comma + 1);
                    }

                    style[mxConstants.STYLE_IMAGE] = image;
                }
            }

            return style;
        }

        /// <summary>
        /// Adds the specified bundle.
        /// </summary>
        public void AddImageBundle(mxImageBundle bundle)
        {
            imageBundles.Add(bundle);
        }

        /// <summary>
        /// Removes the specified bundle.
        /// </summary>
        public void RemoveImageBundle(mxImageBundle bundle)
        {
            imageBundles.Remove(bundle);
        }

        /// <summary>
        /// Searches all bundles for the specified key and returns the value for the
        /// first match or null if the key is not found.
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public String GetImageFromBundles(String key)
        {
            if (key != null)
            {
                foreach (mxImageBundle bundle in imageBundles)
                {
                    String value = bundle.GetImage(key);

                    if (value != null)
                    {
                        return value;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// Sets the key to value in the styles of the given cells. This will modify
        /// the existing cell styles in-place and override any existing assignment
        /// for the given key. If no cells are specified, then the selection cells
        /// are changed. If no value is specified, then the respective key is
        /// removed from the styles.
        /// </summary>
        /// <param name="key">String representing the key to be assigned.</param>
        /// <param name="value">String representing the new value for the key.</param>
        /// <param name="cells">Array of cells to change the style for.</param>
        public void SetCellStyles(String key, String value, Object[] cells)
        {
            mxUtils.SetCellStyles(model, cells, key, value);
        }

        /// <summary>
        /// Creates and adds a new vertex with an empty style, see AddVertex.
        /// </summary>
        public Object InsertVertex(Object parent, string id, Object value, double x, double y,
            double width, double height)
        {
            return InsertVertex(parent, id, value, x, y, width, height, null);
        }

        /// <summary>
        /// Creates and adds a new vertex with an empty style, see AddVertex.
        /// </summary>
        public Object InsertVertex(Object parent, string id, Object value, double x, double y,
            double width, double height, string style)
        {
            return InsertVertex(parent, id, value, x, y, width, height, style, false);
        }

        /// <summary>
        /// Adds a new vertex into the given parent using value as the user object
        /// and the given coordinates as the geometry of the new vertex. The id and
        /// style are used for the respective properties of the new cell, which is
        /// returned.
        /// </summary>
        /// <param name="parent">Cell that specifies the parent of the new vertex.</param>
        /// <param name="id">Optional string that defines the Id of the new vertex.</param>
        /// <param name="value">Object to be used as the user object.</param>
        /// <param name="x">Integer that defines the x coordinate of the vertex.</param>
        /// <param name="y">Integer that defines the y coordinate of the vertex.</param>
        /// <param name="width">Integer that defines the width of the vertex.</param>
        /// <param name="height">Integer that defines the height of the vertex.</param>
        /// <param name="style">Optional string that defines the cell style.</param>
        /// <returns>Returns the new vertex that has been inserted.</returns>
        public Object InsertVertex(Object parent, string id, Object value, double x, double y,
            double width, double height, string style, bool relative)
        {
            if (parent == null)
            {
                parent = GetDefaultParent();
            }

            Object vertex = CreateVertex(parent, id, value, x, y, width, height, style, relative);
            int index = model.GetChildCount(parent);

            return model.Add(parent, vertex, index);
        }
        
        /// <summary>
        /// Creates a new vertex to be used in insertVertex.
        /// </summary>
        public Object CreateVertex(Object parent, string id, Object value, double x, double y,
            double width, double height, string style)
        {
            return CreateVertex(parent, id, value, x, y, width, height, style, false);
        }

        /// <summary>
        /// Creates a new vertex to be used in insertVertex.
        /// </summary>
        public Object CreateVertex(Object parent, string id, Object value, double x, double y,
            double width, double height, string style, bool relative)
        {
            mxGeometry geometry = new mxGeometry(x, y, width, height);
            geometry.Relative = relative;

            mxCell vertex = new mxCell(value, geometry, style);
            vertex.Id = id;
            vertex.Vertex = true;
            vertex.Connectable = true;

            return vertex;
        }

        /// <summary>
        /// Creates and adds a new edge with an empty style.
        /// </summary>
        public Object InsertEdge(Object parent, string id, Object value, Object source, Object target)
        {
            return InsertEdge(parent, id, value, source, target, null);
        }

        /// <summary>
        /// Adds a new edge into the given parent using value as the user object and
        /// the given source and target as the terminals of the new edge. The Id and
        /// style are used for the respective properties of the new cell, which is
        /// returned.
        /// </summary>
        /// <param name="parent">Cell that specifies the parent of the new edge.</param>
        /// <param name="id">Optional string that defines the Id of the new edge.</param>
        /// <param name="value">Object to be used as the user object.</param>
        /// <param name="source">Cell that defines the source of the edge.</param>
        /// <param name="target">Cell that defines the target of the edge.</param>
        /// <param name="style">Optional string that defines the cell style.</param>
        /// <returns>Returns the new edge that has been inserted.</returns>
        public Object InsertEdge(Object parent, string id, Object value, Object source, Object target, string style)
        {
            if (parent == null)
            {
                parent = GetDefaultParent();
            }

            Object edge = CreateEdge(parent, id, value, source, target, style);

            // Appends the edge to the given parent and sets
            // the edge terminals in a single transaction
            int index = model.GetChildCount(parent);

            model.BeginUpdate();
            try
            {
                model.Add(parent, edge, index);
                model.SetTerminal(edge, source, true);
                model.SetTerminal(edge, target, false);
            }
            finally
            {
                model.EndUpdate();
            }

            return edge;
        }

        /// <summary>
        /// Creates the edge to be used in insertEdge. This implementation does
        /// not set the source and target of the edge, these are set when the
        /// edge is added to the model.
        /// </summary>
        public Object CreateEdge(Object parent, string id, Object value, Object source, Object target, string style)
        {
            mxCell edge = new mxCell(value, new mxGeometry(), style);

            edge.Id = id;
            edge.Edge = true;
            edge.Geometry.Relative = true;

            return edge;
        }

        /// <summary>
        /// Returns the bounds of the visible graph.
        /// </summary>
        public mxRectangle GetGraphBounds()
        {
            return view.GraphBounds;
        }

        /// <summary>
        /// Returns the bounds of the given cell.
        /// </summary>
        public mxRectangle GetCellBounds(Object cell)
        {
            return GetCellBounds(cell, false);
        }

        /// <summary>
        /// Returns the bounds of the given cell including all connected edges
        /// if includeEdge is true.
        /// </summary>
        public mxRectangle GetCellBounds(Object cell, bool includeEdges)
        {
            return GetCellBounds(cell, includeEdges, false);
        }

        /// <summary>
        /// Returns the bounds of the given cell including all connected edges
        /// if includeEdge is true.
        /// </summary>
        public mxRectangle GetCellBounds(Object cell, bool includeEdges, bool includeDescendants)
        {
            return GetCellBounds(cell, includeEdges, includeDescendants, false);
        }

        /// <summary>
        /// Returns the bounds of the given cell.
        /// </summary>
        public mxRectangle GetBoundingBox(Object cell)
        {
            return GetBoundingBox(cell, false);
        }

        /// <summary>
        /// Returns the bounding box of the given cell including all connected edges
        /// if includeEdge is true.
        /// </summary>
        public mxRectangle GetBoundingBox(Object cell, bool includeEdges)
        {
            return GetCellBounds(cell, includeEdges, false);
        }

        /// <summary>
        /// Returns the bounding box of the given cell including all connected edges
        /// if includeEdge is true.
        /// </summary>
        public mxRectangle GetBoundingBox(Object cell, bool includeEdges, bool includeDescendants)
        {
            return GetCellBounds(cell, includeEdges, includeDescendants, true);
        }

        /// <summary>
        /// Returns the bounding box of the given cells and their descendants.
        /// </summary>
        public mxRectangle GetPaintBounds(Object[] cells)
        {
            return GetBoundsForCells(cells, false, true, true);
        }

        /// <summary>
        /// Returns the bounds for the given cells.
        /// </summary>
        public mxRectangle GetBoundsForCells(Object[] cells, bool includeEdges,
                bool includeDescendants, bool boundingBox)
        {
            mxRectangle result = null;

            if (cells != null && cells.Length > 0)
            {
                for (int i = 0; i < cells.Length; i++)
                {
                    mxRectangle tmp = GetCellBounds(cells[i], includeEdges,
                        includeDescendants, boundingBox);

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

            return result;
        }

        /// <summary>
        /// Returns the bounds of the given cell including all connected edges
        /// if includeEdge is true.
        /// </summary>
        public mxRectangle GetCellBounds(Object cell, bool includeEdges,
                bool includeDescendants, bool boundingBox)
        {
            Object[] cells = null;

            // Includes the connected edges
            if (includeEdges)
            {
                int edgeCount = model.GetEdgeCount(cell);
                cells = new Object[edgeCount + 1];
                cells[0] = cell;

                for (int i = 0; i < edgeCount; i++)
                {
                    cells[i + 1] = model.GetEdgeAt(cell, i);
                }
            }
            else
            {
                cells = new Object[] { cell };
            }

            mxRectangle result = null;

            if (boundingBox)
            {
                result = view.GetBoundingBox(cells);
            }
            else
            {
                result = view.GetBounds(cells);
            }

            // Recursively includes the bounds of the children
            if (includeDescendants)
            {
                int childCount = model.GetChildCount(cell);

                for (int i = 0; i < childCount; i++)
                {
                    mxRectangle tmp = GetCellBounds(model.GetChildAt(cell, i),
                            includeEdges, true, boundingBox);

                    if (result != null)
                    {
                        result.Add(tmp);
                    }
                    else
                    {
                        result = tmp;
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Returns a connection constraint that describes the given connection
        /// point. This result can then be passed to getConnectionPoint.
        /// </summary>
        /// <param name="edge">Cell state that represents the edge.</param>
        /// <param name="terminal">Cell state that represents the terminal.</param>
        /// <param name="source">Boolean indicating if the terminal is the source or target.</param>
        /// <returns></returns>
		public mxConnectionConstraint GetConnectionConstraint(mxCellState edge, mxCellState terminal, bool source)
		{
            mxPoint point = null;
            string key = (source) ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X;

            if (edge.Style.ContainsKey(key))
            {
                double x = mxUtils.GetDouble(edge.Style, key);
                key = (source) ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y;

                if (edge.Style.ContainsKey(key))
                {
                    double y = mxUtils.GetDouble(edge.Style, key);
					point = new mxPoint(x, y);
				}
			}
			
			bool perimeter = false;
			
			if (point != null)
			{
				perimeter = mxUtils.IsTrue(edge.Style, (source) ?
					mxConstants.STYLE_EXIT_PERIMETER :
					mxConstants.STYLE_ENTRY_PERIMETER, true);
			}
			
			return new mxConnectionConstraint(point, perimeter);
		}

        /// <summary>
        /// Returns the nearest point in the list of absolute points or the center
        /// of the opposite terminal.
        /// </summary>
        /// <param name="vertex">Cell state that represents the vertex.</param>
        /// <param name="constraint">Connection constraint that represents the connection
        /// point constraint as returned by getConnectionConstraint.</param>
		public mxPoint GetConnectionPoint(mxCellState vertex, mxConnectionConstraint constraint)
		{
            mxPoint point = null;
			
			if (vertex != null &&
				constraint.Point != null)
			{
				point = new mxPoint(vertex.X + constraint.Point.X * vertex.Width,
						vertex.Y + constraint.Point.Y * vertex.Height);
			}
			
			if (point != null &&
				constraint.Perimeter)
			{
				point = View.GetPerimeterPoint(vertex, point, false);
			}
			
			return point;
		}

        /// <summary>
        /// Returns the cell at the given location.
        /// </summary>
        public Object GetCellAt(int x, int y)
        {
            return GetCellAt(x, y, true);
        }

        /// <summary>
        /// Returns the cell at the given location.
        /// </summary>
        public Object GetCellAt(int x, int y, bool hitSwimlaneContent)
        {
            return GetCellAt(x, y, hitSwimlaneContent, null);
        }

        /// <summary>
        /// Returns the bottom-most cell that intersects the given point (x, y) in
        /// the cell hierarchy starting at the given parent.
        /// </summary>
        /// <param name="x">X-coordinate of the location to be checked.</param>
        /// <param name="y">Y-coordinate of the location to be checked.</param>
        /// <param name="hitSwimlaneContent"></param>
        /// <param name="parent">that should be used as the root of the recursion.</param>
        /// <returns>Returns the child at the given location.</returns>
        public Object GetCellAt(int x, int y, bool hitSwimlaneContent,
                Object parent)
        {
            if (parent == null)
            {
                parent = GetDefaultParent();
            }

            if (parent != null)
            {
                Rectangle hit = new Rectangle(x, y, 1, 1);
                int childCount = model.GetChildCount(parent);

                for (int i = childCount - 1; i >= 0; i--)
                {
                    Object cell = model.GetChildAt(parent, i);
                    Object result = GetCellAt(x, y, hitSwimlaneContent, cell);

                    if (result != null)
                    {
                        return result;
                    }
                    else if (IsCellVisible(cell)
                            && Intersects(view.GetState(cell), hit)
                            && (!IsSwimlane(cell) || hitSwimlaneContent || !HitsSwimlaneContent(
                                    cell, x, y)))
                    {
                        return cell;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// Returns the bottom-most cell that intersects the given point (x, y) in
        /// the cell hierarchy that starts at the given parent.
        /// </summary>
        /// <param name="state"></param>
        /// <param name="rect"></param>
        /// <returns>Returns true if the given cell state and rectangle intersect.</returns>
        public bool Intersects(mxCellState state, Rectangle rect)
        {
            if (state != null)
            {
                // Checks if the label intersects
                if (state.LabelBounds != null
                        && state.LabelBounds.GetRectangle().IntersectsWith(rect))
                {
                    return true;
                }

                int pointCount = state.AbsolutePointCount();

                // Checks if the segments of the edge intersect
                if (pointCount > 0)
                {
                    mxRectangle tmp = new mxRectangle(rect);
                    tmp.Grow(tolerance);
                    rect = tmp.GetRectangle();

                    mxPoint p0 = state.AbsolutePoints[0];

                    for (int i = 0; i < pointCount; i++)
                    {
                        mxPoint p1 = state.AbsolutePoints[i];

                        // FIXME: Implement line intersection check
                        //if (rect.IntersectsLine(p0.X, p0.Y, p1.X, p1
                        //        .Y))
                        //    return true;

                        p0 = p1;
                    }
                }
                else
                {
                    // Checks if the bounds of the shape intersect
                    return state.GetRectangle().IntersectsWith(rect);
                }
            }

            return false;
        }

        /// <summary>
        /// Returns true if the given point is inside the content area of the given
        /// swimlane. (The content area of swimlanes is transparent to events.) This
        /// implementation does not check if the given state is a swimlane, it is
        /// assumed that the caller has checked this before using this method.
        /// </summary>
        public bool HitsSwimlaneContent(Object swimlane, int x, int y)
        {
            // FIXME: Add global switch
            if (true) //transparentSwimlaneContent)
            {
                mxCellState state = view.GetState(swimlane);

                if (state != null)
                {
                    int start = (int)  Math.Max(2, Math.Round(mxUtils.GetDouble(state.Style,
                            mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE)
                            * view.Scale));
                    Rectangle rect = state.GetRectangle();

                    if (mxUtils.IsTrue(state.Style,
                            mxConstants.STYLE_HORIZONTAL, true))
                    {
                        rect.Y += start;
                        rect.Height -= start;
                    }
                    else
                    {
                        rect.X += start;
                        rect.Width -= start;
                    }

                    return rect.Contains(x, y);
                }
            }

            return false;
        }

        /// <summary>
        /// Returns the visible child vertices of the given parent.
        /// </summary>
        /// <param name="parent">Cell whose children should be returned.</param>
        /// <returns></returns>
        public Object[] GetChildVertices(Object parent)
        {
            return GetChildCells(parent, true, false);
        }

        /// <summary>
        /// Returns the visible child edges of the given parent.
        /// </summary>
        /// <param name="parent">Cell whose children should be returned.</param>
        /// <returns></returns>
        public Object[] GetChildEdges(Object parent)
        {
            return GetChildCells(parent, false, true);
        }

        /// <summary>
        /// Returns the visible children of the given parent.
        /// </summary>
        public Object[] GetChildCells(Object parent)
        {
            return GetChildCells(parent, false, false);
        }

        /// <summary>
        /// Returns the visible child vertices or edges in the given parent. If
        /// vertices and edges is false, then all children are returned.
        /// </summary>
        /// <param name="parent">Cell whose children should be returned.</param>
        /// <param name="vertices">Specifies if child vertices should be returned.</param>
        /// <param name="edges">Specifies if child edges should be returned.</param>
        /// <returns></returns>
        public Object[] GetChildCells(Object parent, bool vertices, bool edges)
        {
            Object[] cells = mxGraphModel.getChildCells(model, parent, vertices,
                    edges);
            List<Object> result = new List<Object>(cells.Length);

            // Filters out the non-visible child cells
            for (int i = 0; i < cells.Length; i++)
            {
                if (IsCellVisible(cells[i]))
                {
                    result.Add(cells[i]);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns all visible edges connected to the given cell without loops.
        /// </summary>
        /// <param name="cell">Cell whose connections should be returned.</param>
        /// <returns>Returns the connected edges for the given cell.</returns>
        public Object[] GetConnections(Object cell)
        {
            return GetConnections(cell, null);
        }

        /// <summary>
        /// Returns all visible edges connected to the given cell without loops.
        /// </summary>
        /// <param name="cell">Cell whose connections should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for a connection
        /// to be returned.</param>
        /// <returns>Returns the connected edges for the given cell.</returns>
        public Object[] GetConnections(Object cell, Object parent)
        {
            return GetEdges(cell, parent, true, true, false);
        }

        /// <summary>
        /// Returns all incoming visible edges connected to the given cell without
        /// loops.
        /// </summary>
        /// <param name="cell">Cell whose incoming edges should be returned.</param>
        /// <returns>Returns the incoming edges of the given cell.</returns>
        public Object[] GetIncomingEdges(Object cell)
        {
            return GetIncomingEdges(cell, null);
        }

        /// <summary>
        /// Returns the visible incoming edges for the given cell. If the optional
        /// parent argument is specified, then only child edges of the given parent
        /// are returned.
        /// </summary>
        /// <param name="cell">Cell whose incoming edges should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for a connection
        /// to be returned.</param>
        /// <returns>Returns the incoming edges of the given cell.</returns>
        public Object[] GetIncomingEdges(Object cell, Object parent)
        {
            return GetEdges(cell, parent, true, false, false);
        }

        /// <summary>
        /// Returns all outgoing visible edges connected to the given cell without
        /// loops.
        /// </summary>
        /// <param name="cell">Cell whose outgoing edges should be returned.</param>
        /// <returns>Returns the outgoing edges of the given cell.</returns>
        public Object[] GetOutgoingEdges(Object cell)
        {
            return GetOutgoingEdges(cell, null);
        }

        /// <summary>
        /// Returns the visible outgoing edges for the given cell. If the optional
        /// parent argument is specified, then only child edges of the given parent
        /// are returned.
        /// </summary>
        /// <param name="cell">Cell whose outgoing edges should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for a connection
        /// to be returned.</param>
        /// <returns>Returns the outgoing edges of the given cell.</returns>
        public Object[] GetOutgoingEdges(Object cell, Object parent)
        {
            return GetEdges(cell, parent, false, true, false);
        }

        /// <summary>
        /// Returns all visible edges connected to the given cell including loops.
        /// </summary>
        /// <param name="cell">Cell whose edges should be returned.</param>
        /// <returns>Returns the edges of the given cell.</returns>
        public Object[] GetEdges(Object cell)
        {
            return GetEdges(cell, null);
        }

        /// <summary>
        /// Returns all visible edges connected to the given cell including loops.
        /// </summary>
        /// <param name="cell">Cell whose edges should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for an edge
        /// to be returned.</param>
        /// <returns>Returns the edges of the given cell.</returns>
        public Object[] GetEdges(Object cell, Object parent)
        {
            return GetEdges(cell, parent, true, true, true);
        }
        
        /// <summary>
        /// Returns the incoming and/or outgoing edges for the given cell.
        /// If the optional parent argument is specified, then only edges are returned
        /// where the opposite is in the given parent cell. If at least one of incoming
        /// or outgoing is true, then loops are ignored, if both are false, then all
        /// edges connected to the given cell are returned including loops.
        /// </summary>
        /// <param name="cell">Cell whose edges should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for an edge to be
        /// returned.</param>
        /// <param name="incoming">Specifies if incoming edges should be included in the
        /// result.</param>
        /// <param name="outgoing">Specifies if outgoing edges should be included in the
        /// result.</param>
        /// <param name="includeLoops">Specifies if loops should be included in the
        /// result.</param>
        /// <returns>Returns the edges connected to the given cell.</returns>
        public Object[] GetEdges(Object cell, Object parent, bool incoming,
                bool outgoing, bool includeLoops)
        {
            return GetEdges(cell, parent, incoming, outgoing, includeLoops, false);
        }

        /// <summary>
        /// Returns the incoming and/or outgoing edges for the given cell.
        /// If the optional parent argument is specified, then only edges are returned
        /// where the opposite is in the given parent cell. If at least one of incoming
        /// or outgoing is true, then loops are ignored, if both are false, then all
        /// edges connected to the given cell are returned including loops.
        /// </summary>
        /// <param name="cell">Cell whose edges should be returned.</param>
        /// <param name="parent">Optional parent of the opposite end for an edge to be
        /// returned.</param>
        /// <param name="incoming">Specifies if incoming edges should be included in the
        /// result.</param>
        /// <param name="outgoing">Specifies if outgoing edges should be included in the
        /// result.</param>
        /// <param name="includeLoops">Specifies if loops should be included in the
        /// result.</param>
        /// <param name="recurse">Boolean the specifies if the parent specified only 
        /// need be an ancestral parent, true, or the direct parent, false.</param>
        /// <returns>Returns the edges connected to the given cell.</returns>
        public Object[] GetEdges(Object cell, Object parent, bool incoming,
                bool outgoing, bool includeLoops, bool recurse)
        {
            bool isCollapsed = IsCellCollapsed(cell);
            List<Object> edges = new List<Object>();
            int childCount = model.GetChildCount(cell);

            for (int i = 0; i < childCount; i++)
            {
                Object child = model.GetChildAt(cell, i);

                if (isCollapsed || !IsCellVisible(child))
                {
                    edges.AddRange(mxGraphModel.GetEdges(model, child,
                            incoming, outgoing, includeLoops));
                }
            }

            edges.AddRange(mxGraphModel.GetEdges(model, cell, incoming,
                    outgoing, includeLoops));
            List<Object> result = new List<Object>(edges.Count);

            foreach (Object edge in edges)
            {
                Object source = view.GetVisibleTerminal(edge, true);
                Object target = view.GetVisibleTerminal(edge, false);

                if ((includeLoops && source == target) || ((source != target) &&
                    (incoming && target == cell && (parent == null ||
                        IsValidAncestor(source, parent, recurse)))
                        || (outgoing && source == cell && (parent == null ||
                        IsValidAncestor(target, parent, recurse)))))
                {
                    result.Add(edge);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns whether or not the specified parent is a valid
        /// ancestor of the specified cell, either direct or indirectly
        /// based on whether ancestor recursion is enabled.
        /// </summary>
        /// <param name="cell">The possible child cell</param>
        /// <param name="parent">The possible parent cell</param>
        /// <param name="recurse">boolean whether or not to recurse the child ancestors</param>
        public bool IsValidAncestor(Object cell, Object parent, bool recurse)
        {
            return (recurse ? model.IsAncestor(parent, cell) : model
			    .GetParent(cell) == parent);
        }

        /// <summary>
        /// Returns all distinct visible opposite cells of the terminal on the
        /// given edges.
        /// </summary>
        /// <param name="edges"></param>
        /// <param name="terminal"></param>
        /// <returns></returns>
        public Object[] GetOpposites(Object[] edges, Object terminal)
        {
            return GetOpposites(edges, terminal, true, true);
        }

        /// <summary>
        /// Returns all distincts visible opposite cells for the specified
        /// terminal on the given edges.
        /// </summary>
        /// <param name="edges">Edges whose opposite terminals should be returned.</param>
        /// <param name="terminal">Terminal that specifies the end whose opposite should be
        /// returned.</param>
        /// <param name="sources">Specifies if source terminals should be included in the
        /// result.</param>
        /// <param name="targets">Specifies if targer terminals should be included in the
        /// result.</param>
        /// <returns></returns>
        public Object[] GetOpposites(Object[] edges, Object terminal,
                bool sources, bool targets)
        {
            List<Object> terminals = new List<Object>();

            // Uses dictionary to implement a set semantic in the result
            Dictionary<Object, Object> hash = new Dictionary<Object, Object>();

            if (edges != null)
            {
                for (int i = 0; i < edges.Length; i++)
                {
                    Object source = view.GetVisibleTerminal(edges[i], true);
                    Object target = view.GetVisibleTerminal(edges[i], false);

                    // Checks if the terminal is the source of
                    // the edge and if the target should be
                    // stored in the result
                    if (source == terminal && target != null && target != terminal
                            && targets)
                    {
                        if (!hash.ContainsKey(target))
                        {
                            hash[target] = target;
                            terminals.Add(target);
                        }
                    }

                    // Checks if the terminal is the taget of
                    // the edge and if the source should be
                    // stored in the result
                    else if (target == terminal && source != null
                            && source != terminal && sources)
                    {
                        if (!hash.ContainsKey(source))
                        {
                            hash[source] = source;
                            terminals.Add(source);
                        }
                    }
                }
            }

            return terminals.ToArray();
        }

        /// <summary>
        /// Returns the edges between the given source and target. This takes into
        /// account collapsed and invisible cells and returns the connected edges
        /// as displayed on the screen.
        /// </summary>
        /// <param name="source"></param>
        /// <param name="target"></param>
        /// <returns></returns>
        public Object[] GetEdgesBetween(Object source, Object target)
        {
            return GetEdgesBetween(source, target, false);
        }

        /// <summary>
        /// Returns the edges between the given source and target. This takes into
        /// account collapsed and invisible cells and returns the connected edges
        /// as displayed on the screen.
        /// </summary>
        /// <param name="source"></param>
        /// <param name="target"></param>
        /// <param name="directed"></param>
        /// <returns></returns>
        public Object[] GetEdgesBetween(Object source, Object target,
                bool directed)
        {
            Object[] edges = GetEdges(source);
            List<Object> result = new List<Object>(edges.Length);

            // Checks if the edge is connected to the correct
            // cell and returns the first match
            for (int i = 0; i < edges.Length; i++)
            {
                Object src = view.GetVisibleTerminal(edges[i], true);
                Object trg = view.GetVisibleTerminal(edges[i], false);

                if ((src == source && trg == target) ||
                    (!directed && src == target && trg == source))
                {
                    result.Add(edges[i]);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns all children in the given parent which do not have incoming
        /// edges. If the result is empty then the with the greatest difference
        /// between incoming and outgoing edges is returned.
        /// </summary>
        /// <param name="parent">Cell whose children should be checked.</param>
        /// <returns></returns>
        public List<Object> FindTreeRoots(Object parent)
        {
            return FindTreeRoots(parent, false);
        }
        
        /// <summary>
        /// Returns all children in the given parent which do not have incoming
        /// edges. If the result is empty then the with the greatest difference
        /// between incoming and outgoing edges is returned.
        /// </summary>
        /// <param name="parent">Cell whose children should be checked.</param>
        /// <param name="isolate">Specifies if edges should be ignored if the opposite
        /// end is not a child of the given parent cell.</param>
        /// <returns>Array of tree roots in parent.</returns>
        public List<Object> FindTreeRoots(Object parent, bool isolate)
        {
            return FindTreeRoots(parent, isolate, false);
        }

        /// <summary>
        /// Returns all children in the given parent which do not have incoming
        /// edges. If the result is empty then the with the greatest difference
        /// between incoming and outgoing edges is returned.
        /// </summary>
        /// <param name="parent">Cell whose children should be checked.</param>
        /// <param name="isolate">Specifies if edges should be ignored if the opposite
        /// end is not a child of the given parent cell.</param>
        /// <param name="invert">Specifies if outgoing or incoming edges should be counted
        /// for a tree root. If false then outgoing edges will be counted.</param>
        /// <returns>Array of tree roots in parent.</returns>
        public List<Object> FindTreeRoots(Object parent, bool isolate, bool invert)
        {
            List<Object> roots = new List<Object>();

            if (parent != null)
            {
                int childCount = model.GetChildCount(parent);
                Object best = null;
                int maxDiff = 0;

                for (int i = 0; i < childCount; i++)
                {
                    Object cell = model.GetChildAt(parent, i);

                    if (model.IsVertex(cell) && IsCellVisible(cell))
                    {
                        Object[] conns = GetConnections(cell, (isolate) ? parent : null);
                        int fanOut = 0;
                        int fanIn = 0;

                        for (int j = 0; j < conns.Length; j++)
                        {
                            Object src = view.GetVisibleTerminal(conns[j], true);

                            if (src == cell)
                            {
                                fanOut++;
                            }
                            else
                            {
                                fanIn++;
                            }
                        }

                        if ((invert && fanOut == 0 && fanIn > 0)
                                || (!invert && fanIn == 0 && fanOut > 0))
                        {
                            roots.Add(cell);
                        }

                        int diff = (invert) ? fanIn - fanOut : fanOut - fanIn;

                        if (diff > maxDiff)
                        {
                            maxDiff = diff;
                            best = cell;
                        }
                    }
                }

                if (roots.Count == 0 &&
                    best != null)
                {
                    roots.Add(best);
                }
            }

            return roots;
        }

        /// <summary>
        /// Draws the graph onto the given canvas.
        /// </summary>
        /// <param name="canvas">Canvas onto which the graph should be drawn.</param>
        public void DrawGraph(mxICanvas canvas)
        {
            DrawCell(canvas, model.Root);
        }

        /// <summary>
        /// Draws the given cell onto the specified canvas.
        /// </summary>
        /// <param name="canvas">Canvas onto which the cell should be drawn.</param>
        /// <param name="cell">Cell that should be drawn onto the canvas.</param>
        public void DrawCell(mxICanvas canvas, Object cell)
        {
            DrawState(canvas, view.GetState(cell), GetLabel(cell));

            // Draws the children on top
            int childCount = model.GetChildCount(cell);

            for (int i = 0; i < childCount; i++)
            {
                DrawCell(canvas, model.GetChildAt(cell, i));
            }
        }

        /// <summary>
        /// Draws the given cell and label onto the specified canvas. No
        /// children or descendants are painted.
        /// </summary>
        public void DrawState(mxICanvas canvas, mxCellState state, String label)
        {
            Object cell = (state != null) ? state.Cell : null;

            if (cell != null && cell != model.Root && (model.IsVertex(cell) || model.IsEdge(cell)))
            {
                Object obj = canvas.DrawCell(state);
                Object lab = null;

			    // Holds the current clipping region in case the label will
			    // be clipped
                Region clip = null;
                Region newClip = new Region(state.GetRectangle());

			    // Indirection for image canvas that contains a graphics canvas
                mxICanvas clippedCanvas = (mxUtils.GetString(state.Style, mxConstants.
                    STYLE_OVERFLOW, "").Equals("hidden")) ? canvas : null;

			    if (clippedCanvas is mxImageCanvas)
			    {
				    clippedCanvas = ((mxImageCanvas) clippedCanvas).GdiCanvas;
				    Point pt = ((mxImageCanvas) canvas).Translate;
                    newClip.Translate(pt.X, pt.Y);
			    }

			    if (clippedCanvas is mxGdiCanvas)
			    {
				    Graphics g = ((mxGdiCanvas) clippedCanvas).Graphics;
				    clip = g.Clip;
                    g.Clip = newClip;
			    }

                if (label != null && state.LabelBounds != null)
                {
                    lab = canvas.DrawLabel(label, state, false);
                }
                    
			    // Restores the previous clipping region
			    if (clippedCanvas is mxGdiCanvas)
			    {
                    ((mxGdiCanvas)clippedCanvas).Graphics.Clip = clip;
			    }

                // Invokes the cellDrawn callback with the object which was created
                // by the canvas to represent the cell graphically
                if (obj != null)
                {
                    // LATER: Add inner callback for rendering
                    //CellDrawn(cell, obj, lab);
                }
            }
        }

        /// <summary>
        /// Called when the graph model has changed to invalidate the view.
        /// </summary>
        public void GraphModelChanged()
        {
            view.Revalidate();
        }

    }

}
