// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Cells are the elements of the graph model. They represent the state
    /// of the groups, vertices and edges in a graph.
    /// </summary>
    public class mxCell : mxICell
    {

        /// <summary>
        /// Holds the Id. Default is null.
        /// </summary>
        protected string id;

        /// <summary>
        /// Holds the user object. Default is null.
        /// </summary>
        protected Object value;

        /// <summary>
        /// Holds the geometry. Default is null.
        /// </summary>
        protected mxGeometry geometry;

        /// <summary>
        /// Holds the geometry. Default is null.
        /// </summary>
        protected string style;

        /// <summary>
        /// Specifies whether the cell is a vertex. Default value is false.
        /// </summary>
        protected bool vertex = false;

        /// <summary>
        /// Specifies whether the cell is an edge. Default value is false.
        /// </summary>
        protected bool edge = false;

        /// <summary>
        /// Specifies whether the cell connectable. Default value is true.
        /// </summary>
        protected bool connectable = true;

        /// <summary>
        /// Specifies whether the cell is visible. Default value is true.
        /// </summary>
        protected bool visible = true;

        /// <summary>
        /// Specifies whether the cell is collapsed. Default value is false.
        /// </summary>
        protected bool collapsed = false;

        /// <summary>
        /// Reference to the parent cell.
        /// </summary>
        protected mxICell parent;

        /// <summary>
        /// Reference to the source terminal of an edge.
        /// </summary>
        protected mxICell source;

        /// <summary>
        /// Reference to the target terminal of an edge.
        /// </summary>
        protected mxICell target;

        /// <summary>
        /// Holds the child cells.
        /// </summary>
        protected /* transient */ List<mxICell> children;

        /// <summary>
        /// Holds the connected edges.
        /// </summary>
        protected /* transient */ List<mxICell> edges;

        /// <summary>
        /// Constructs a new empty cell.
        /// </summary>
        public mxCell() : this(null) { }

        /// <summary>
        /// Constructs a new cell for the given value.
        /// </summary>
        /// <param name="value">Value that represents the user object.</param>
        public mxCell(Object value) : this(value, null, null) { }

        /// <summary>
        /// Constructs a new cell for the given value, geometry and style.
        /// </summary>
        /// <param name="value">Value that represents the user object.</param>
        /// <param name="geometry">Geometry of the cell to be created.</param>
        /// <param name="style">Style of the cell to be created.</param>
        public mxCell(Object value, mxGeometry geometry, string style)
        {
            Value = value;
            Geometry = geometry;
            Style = style;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Id
         */
        public string Id
        {
            get { return id; }
            set { id = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Value
         */
        public Object Value
        {
            get { return value; }
            set { this.value = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Geometry
         */
        public mxGeometry Geometry
        {
            get { return geometry; }
            set { geometry = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Style
         */
        public string Style
        {
            get { return style; }
            set { style = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.IsVertex
         */
        public bool Vertex
        {
            get { return vertex; }
            set { vertex = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.IsEdge
         */
        public bool Edge
        {
            get { return edge; }
            set { edge = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.IsConnectable
         */
        public bool Connectable
        {
            get { return connectable; }
            set { connectable = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.IsVisible
         */
        public bool Visible
        {
            get { return visible; }
            set { visible = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.IsCollapsed
         */
        public bool Collapsed
        {
            get { return collapsed; }
            set { collapsed = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Parent
         */
        public mxICell Parent
        {
            get { return parent; }
            set { parent = value; }
        }

        /// <summary>
        /// Sets or returns the source terminal of the cell.
        /// </summary>
        public mxICell Source
        {
            get { return source; }
            set { source = value; }
        }

        /// <summary>
        /// Sets or returns the target terminal of the cell.
        /// </summary>
        public mxICell Target
        {
            get { return target; }
            set { target = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.GetTerminal(bool)
         */
        public mxICell GetTerminal(bool source)
        {
            return (source) ? Source : Target;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.SetTerminal(mxICell, bool)
         */
        public mxICell SetTerminal(mxICell terminal, bool isSource)
        {
            if (isSource)
            {
                Source = terminal;
            }
            else
            {
                Target = terminal;
            }

            return terminal;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.ChildCount()
         */
        public int ChildCount()
        {
            return (children != null) ? children.Count : 0;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.GetIndex(mxICell)
         */
        public int GetIndex(mxICell child)
        {
            return (children != null) ? children.IndexOf(child) : -1;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.GetChildAt(int)
         */
        public mxICell GetChildAt(int index)
        {
            return (children != null) ? (mxICell)children[index] : null;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Insert(mxICell)
         */
        public mxICell Insert(mxICell child)
        {
            int index = ChildCount();

            if (child.Parent == this)
            {
                index--;
            }

            return Insert(child, index);
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Insert(mxICell, int)
         */
        public mxICell Insert(mxICell child, int index)
        {
            if (child != null)
            {
                child.RemoveFromParent();
                child.Parent = this;

                if (children == null)
                {
                    children = new List<mxICell>();
                    children.Add(child);
                }
                else
                {
                    children.Insert(index, child);
                }
            }

            return child;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Remove(int)
         */
        public mxICell Remove(int index)
        {
            mxICell child = null;

            if (children != null && index >= 0)
            {
                child = GetChildAt(index);
                Remove(child);
            }

            return child;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Remove(mxICell)
         */
        public mxICell Remove(mxICell child)
        {
            if (child != null && children != null)
            {
                children.Remove(child);
                child.Parent = null;
            }

            return child;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.RemoveFromParent()
         */
        public void RemoveFromParent()
        {
            if (parent != null)
            {
                parent.Remove(this);
            }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.EdgeCount()
         */
        public int EdgeCount()
        {
            return (edges != null) ? edges.Count : 0;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.GetEdgeIndex(mxICell)
         */
        public int GetEdgeIndex(mxICell edge)
        {
            return (edges != null) ? edges.IndexOf(edge) : -1;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.GetEdgeAt(int)
         */
        public mxICell GetEdgeAt(int index)
        {
            return (edges != null) ? edges[index] : null;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.InsertEdge(mxICell, bool)
         */
        public mxICell InsertEdge(mxICell edge, bool isOutgoing)
        {
            if (edge != null)
            {
                edge.RemoveFromTerminal(isOutgoing);
                edge.SetTerminal(this, isOutgoing);

                if (edges == null ||
                    edge.GetTerminal(!isOutgoing) != this ||
                    !edges.Contains(edge))
                {
                    if (edges == null)
                    {
                        edges = new List<mxICell>();
                    }

                    edges.Add(edge);
                }
            }

            return edge;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.RemoveEdge(mxICell, bool)
         */
        public mxICell RemoveEdge(mxICell edge, bool isOutgoing)
        {
            if (edge != null)
            {
                if (edge.GetTerminal(!isOutgoing) != this &&
                    edges != null)
                {
                    edges.Remove(edge);
                }

                edge.SetTerminal(null, isOutgoing);
            }
            return edge;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.RemoveFromTerminal(bool)
         */
        public void RemoveFromTerminal(bool isSource)
        {
            mxICell terminal = GetTerminal(isSource);

            if (terminal != null)
            {
                terminal.RemoveEdge(this, isSource);
            }
        }

	    /// <summary>
	    /// Returns the specified attribute from the user object if it is an XML
        /// node.
	    /// </summary>
        /// <param name="name">Name of the attribute whose value should be returned.</param>
        /// <returns>Returns the value of the given attribute or null.</returns>
	    public String GetAttribute(String name)
	    {
		    return GetAttribute(name, null);
	    }
    	
	    /// <summary>
	    /// Returns the specified attribute from the user object if it is an XML
        /// node.
	    /// </summary>
        /// <param name="name">Name of the attribute whose value should be returned.</param>
        /// <param name="defaultValue">Default value to use if the attribute has no value.</param>
        /// <returns>Returns the value of the given attribute or defaultValue.</returns>
	    public String GetAttribute(String name, String defaultValue)
	    {
            Object userObject = Value;
            String val = null;

            if (userObject is XmlElement)
		    {
                XmlElement element = (XmlElement)userObject;
                val = element.GetAttribute(name);
		    }

            if (val == null)
		    {
                val = defaultValue;
		    }

            return val;
	    }
    	
	    /// <summary>
        /// Sets the specified attribute on the user object if it is an XML node.
	    /// </summary>
        /// <param name="name">Name of the attribute whose value should be set.</param>
        /// <param name="value">New value of the attribute.</param>
	    public void SetAttribute(String name, String value)
	    {
		    Object userObject = Value;
    		
		    if (userObject is XmlElement)
		    {
                XmlElement element = (XmlElement)userObject;
			    element.SetAttribute(name, value);
		    }
	    }
    	
        /* (non-Dotnetdoc)
         * see com.mxgraph.mxICell.Clone()
         */
        public Object Clone()
        {
            mxCell cell = new mxCell();
            cell.Collapsed = Collapsed;
            cell.Connectable = Connectable;
            cell.Edge = Edge;
            cell.Style = Style;
            cell.Vertex = Vertex;
            cell.Visible = Visible;

            mxGeometry geometry = Geometry;

            if (geometry != null)
            {
                cell.Geometry = geometry.Clone();
            }

            Object value = Value;

            if (value is XmlNode)
            {
                cell.Value = ((XmlNode)value).CloneNode(true);
            }
            else
            {
                cell.Value = Value;
            }

            return cell;
        }
    }

}
