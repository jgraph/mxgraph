// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Threading;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a graph model. The graph model acts as a wrapper around the
    /// cells which are in charge of storing the actual graph datastructure.
    /// The model acts as a transactional wrapper with event notification for
    /// all changes, whereas the cells contain the atomic operations for
    /// updating the actual datastructure.
    /// </summary>
    public class mxGraphModel: mxIGraphModel
    {
        /// <summary>
        /// Fires when the graph model has changed.
        /// </summary>
        public event mxGraphModelChangeEventHandler GraphModelChange;

        /// <summary>
        /// Holds the root cell, which in turn contains the cells that represent the
        /// layers of the diagram as child cells. That is, the actual element of the
        /// diagram are supposed to live in the third generation of cells and below.
        /// </summary>
        protected mxICell root;

        /// <summary>
        /// Maps from Ids to cells.
        /// </summary>
        protected Dictionary<Object, Object> cells;

        /// <summary>
        /// Specifies if edges should automatically be moved into the nearest common
        /// ancestor of their terminals. Default is true.
        /// </summary>
        protected bool createIds = true;

        /// <summary>
        /// Specifies if the parent of edges should be automatically change to point
        /// to the nearest common ancestor of its terminals. Default is true.
        /// </summary>
        protected bool maintainEdgeParent = true;

        /// <summary>
        /// Specifies the next Id to be created. Initial value is 0.
        /// </summary>
        protected int nextId = 0;

        /// <summary>
        /// Counter for the depth of nested transactions. Each call to beginUpdate
        /// increments this counter and each call to endUpdate decrements it. When
        /// the counter reaches 0, the transaction is closed and the respective
        /// events are fired. Initial value is 0.
        /// </summary>
        protected int updateLevel = 0;

        /// <summary>
        /// Constructs a new empty graph model.
        /// </summary>
        public mxGraphModel(): this(null) {}

        /// <summary>
        /// Constructs a new graph model. If no root is specified
        /// then a new root mxCell with a default layer is created.
        /// </summary>
        /// <param name="root">Cell that represents the root cell.</param>
        public mxGraphModel(Object root)
        {
            if (root != null)
            {
                Root = root;
            }
            else
            {
                Clear();
            }
        }

        /// <summary>
        /// Sets a new root using createRoot.
        /// </summary>
        public void Clear()
        {
            Root = CreateRoot();
        }

        /// <summary>
        /// Creates a new root cell with a default layer (child 0).
        /// </summary>
        public Object CreateRoot()
        {
            mxCell root = new mxCell();
            root.Insert(new mxCell());

            return root;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Object GetCell(string id)
        {
            Object result = null;

            if (cells != null)
            {
                cells.TryGetValue(id, out result);
            }

            return result;
        }

        /// <summary>
        /// Sets of returns if edges should automatically be moved into the
        /// nearest common ancestor of their terminals.
        /// </summary>
        public bool IsMaintainEdgeParent
        {
            get { return maintainEdgeParent; }
            set { maintainEdgeParent = value; }
        }

        /// <summary>
        /// Sets or returns if the model automatically creates Ids and resolves Id
        /// collisions.
        /// </summary>
        public bool IsCreateIds
        {
            get { return createIds; }
            set { createIds = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.Root
         */
        public Object Root
        {
            get { return root; }
            set {
                BeginUpdate();
                try
                {
                    root = (mxICell) value;
                    this.nextId = 0;
                    this.cells = null;
                    CellAdded(root);
                }
                finally
                {
                    EndUpdate();
                }
            }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.IsAncestor(Object[], bool)
         */
        public Object[] CloneCells(Object[] cells, bool includeChildren)
        {
            Hashtable mapping = new Hashtable();
            Object[] clones = new Object[cells.Length];

            for (int i = 0; i < cells.Length; i++)
            {
                clones[i] = CloneCell(cells[i], mapping, includeChildren);
            }

            for (int i = 0; i < cells.Length; i++)
            {
                RestoreClone(clones[i], cells[i], mapping);
            }

            return clones;
        }

        /// <summary>
        /// Inner helper method for cloning cells recursively.
        /// </summary>
        protected Object CloneCell(Object cell, Hashtable mapping, bool includeChildren)
	    {
		    if (cell is mxICell)
		    {
		    	mxICell mxc = (mxICell) mapping[cell];
		    	
		    	if (mxc == null)
		    	{
					mxc = (mxICell) ((mxICell) cell).Clone();
				    mapping[cell] = mxc;
	
				    if (includeChildren)
				    {
					    int childCount = GetChildCount(cell);
	
					    for (int i = 0; i < childCount; i++)
					    {
						    Object clone = CloneCell(GetChildAt(cell, i), mapping, true);
						    mxc.Insert((mxICell) clone);
					    }
				    }
				}

			    return mxc;
		    }

		    return null;
	    }

        /// <summary>
        /// Inner helper method for restoring the connections in
        /// a network of cloned cells.
        /// </summary>
        protected void RestoreClone(Object clone, Object cell, Hashtable mapping)
	    {
		    if (clone is mxICell)
		    {
			    mxICell mxc = (mxICell) clone;
			    Object source = GetTerminal(cell, true);

			    if (source is mxICell)
			    {
				    mxICell tmp = (mxICell) mapping[source];

				    if (tmp != null)
				    {
					    tmp.InsertEdge(mxc, true);
				    }
			    }

			    Object target = GetTerminal(cell, false);

			    if (target is mxICell)
			    {
				    mxICell tmp = (mxICell) mapping[target];

				    if (tmp != null)
				    {
					    tmp.InsertEdge(mxc, false);
				    }
			    }
		    }
    		
		    int childCount = GetChildCount(clone);

		    for (int i = 0; i < childCount; i++)
		    {
			    RestoreClone(GetChildAt(clone, i), GetChildAt(cell, i), mapping);
		    }
	    }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.IsAncestor(Object, Object)
         */
        public bool IsAncestor(Object parent, Object child)
        {
            while (child != null && child != parent)
            {
                child = GetParent(child);
            }
            return child == parent;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.Contains(Object)
         */
        public bool Contains(Object cell)
        {
            return IsAncestor(Root, cell);
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.GetParent(Object)
         */
        public Object GetParent(Object child)
        {
            return (child is mxICell) ? ((mxICell)child).Parent : null;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.Add(Object, Object, int)
         */
        public Object Add(Object parent, Object child, int index)
        {
            if (child != parent && parent is mxICell && child is mxICell)
            {
                bool parentChanged = parent != GetParent(child);

                BeginUpdate();
                try
                {
                    ((mxICell)parent).Insert((mxICell)child, index);
                    CellAdded(child);
                }
                finally
                {
                    EndUpdate();
                }

                if (IsMaintainEdgeParent &&
                    parentChanged)
                {
                    UpdateEdgeParents(child);
                }
            }

            return child;
        }

        /// <summary>
        /// Invoked after a cell has been added to a parent. This recursively
        /// creates an Id for the new cell and/or resolves Id collisions.
        /// </summary>
        /// <param name="cell">Cell that has been added.</param>
        protected void CellAdded(Object cell)
        {
            if (cell is mxICell)
            {
                mxICell mxc = (mxICell)cell;

                if (mxc.Id == null && IsCreateIds)
                {
                    mxc.Id = CreateId(cell);
                }

                if (mxc.Id != null)
                {
                    Object collision = GetCell(mxc.Id);

                    if (collision != cell)
                    {
                        while (collision != null)
                        {
                            mxc.Id = CreateId(cell);
                            collision = GetCell(mxc.Id);
                        }

                        if (cells == null)
                        {
                            cells = new Dictionary<Object, Object>();
                        }

                        cells[mxc.Id] = cell;
                    }
                }

                // Makes sure IDs of deleted cells are not reused
                try
                {
                    int id = Convert.ToInt32(mxc.Id);
                    nextId = Math.Max(nextId, id + 1);
                }
                catch (FormatException e)
                {
                    Trace.WriteLine(this + ".CellAdded(" + cell + "): " + e.Message);
                }

                int childCount = mxc.ChildCount();

                for (int i = 0; i < childCount; i++)
                {
                    CellAdded(mxc.GetChildAt(i));
                }
            }
        }

        /// <summary>
        /// Creates a new Id for the given cell and increments the global counter
        /// for creating new Ids.
        /// </summary>
        /// <param name="cell">Cell for which a new Id should be created.</param>
        /// <returns>Returns a new Id for the given cell.</returns>
        public string CreateId(Object cell)
        {
            string id = nextId.ToString();
            nextId++;

            return id;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.Remove(Object)
        /// </summary>
        /// <param name="cell"></param>
        /// <returns></returns>
        public Object Remove(Object cell)
        {
            if (cell is mxICell)
            {
                mxICell mx = (mxICell)cell;

                BeginUpdate();
                try
                {
                    if (cell == root)
                    {
                        Root = null;
                    }
                    else
                    {
                        mx.RemoveFromParent();
                    }

                    CellRemoved(cell);
                }
                finally
                {
                    EndUpdate();
                }
            }

            return cell;
        }

        /// <summary>
        /// Invoked after a cell has been removed from the model. This recursively
        /// removes the cell from its terminals and removes the mapping from the Id
        /// to the cell.
        /// </summary>
        /// <param name="cell">Cell that has been removed.</param>
        protected void CellRemoved(Object cell)
        {
            if (cell is mxICell)
            {
                mxICell mxc = (mxICell)cell;
                int childCount = mxc.ChildCount();

                for (int i = 0; i < childCount; i++)
                {
                    CellRemoved(mxc.GetChildAt(i));
                }

                mxc.RemoveFromTerminal(true);
                mxc.RemoveFromTerminal(false);

                if (cells != null && mxc.Id != null)
                {
                    cells.Remove(mxc.Id);
                }
            }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.GetChildCount(Object)
         */
        public int GetChildCount(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).ChildCount() : 0;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.GetChildAt(Object, int)
         */
        public Object GetChildAt(Object parent, int index)
        {
            return (parent is mxICell) ? ((mxICell)parent).GetChildAt(index) : null;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.GetTerminal(Object, bool)
         */
        public Object GetTerminal(Object edge, bool isSource)
        {
            return (edge is mxICell) ? ((mxICell)edge).GetTerminal(isSource) : null;
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxIGraphModel.SetTerminal(Object, Object, bool)
         */
        public Object SetTerminal(Object edge, Object terminal, bool isSource)
        {
            mxICell mxe = (mxICell)edge;
            mxICell previous = mxe.GetTerminal(isSource);

            BeginUpdate();
            try
            {
                if (terminal != null)
                {
                    ((mxICell)terminal).InsertEdge(mxe, isSource);
                }
                else if (previous != null)
                {
                    previous.RemoveEdge(mxe, isSource);
                }
            }
            finally
            {
                EndUpdate();
            }

            if (IsMaintainEdgeParent)
            {
                UpdateEdgeParent(edge, Root);
            }

            return terminal;
        }

        /// <summary>
        /// Updates the parents of the edges connected to the given cell and all its
        /// descendants so that each edge is contained in the nearest common ancestor.
        /// </summary>
        /// <param name="cell">Cell whose edges should be checked and updated.</param>
        public void UpdateEdgeParents(Object cell)
        {
            UpdateEdgeParents(cell, Root);
        }

        /// <summary>
        /// Updates the parents of the edges connected to the given cell and all its
        /// descendants so that the edge is contained in the nearest-common-ancestor.
        /// </summary>
        /// <param name="cell">Cell whose edges should be checked and updated.</param>
        /// <param name="root">Root of the cell hierarchy that contains all cells.</param>
        public void UpdateEdgeParents(Object cell, Object root)
        {
            // Updates edges on children first
            int childCount = GetChildCount(cell);

            for (int i = 0; i < childCount; i++)
            {
                Object child = GetChildAt(cell, i);
                UpdateEdgeParents(child, root);
            }

            // Updates the parents of all connected edges
            int edgeCount = GetEdgeCount(cell);
            List<Object> edges = new List<Object>();

            for (int i = 0; i < edgeCount; i++)
            {
                edges.Add(GetEdgeAt(cell, i));
            }

            foreach (Object edge in edges)
            {
                // Updates edge parent if edge and child have
                // a common root node (does not need to be the
                // model root node)
                if (IsAncestor(root, edge))
                {
                    UpdateEdgeParent(edge, root);
                }
            }
        }

        /// <summary>
        /// Inner helper method to update the parent of the specified edge to the
        /// nearest-common-ancestor of its two terminals.
        /// </summary>
        /// <param name="edge">Specifies the edge to be updated.</param>
        /// <param name="root">Current root of the model.</param>
        public void UpdateEdgeParent(Object edge, Object root)
        {
            Object source = GetTerminal(edge, true);
            Object target = GetTerminal(edge, false);
            Object cell = null;
           
            // Uses the first non-relative descendants of the source terminal
            while (source != null && !IsEdge(source) &&
                GetGeometry(source) != null && GetGeometry(source).Relative)
            {
                source = GetParent(source);
            }

            // Uses the first non-relative descendants of the target terminal
            while (target != null && !IsEdge(target) &&
                GetGeometry(target) != null && GetGeometry(target).Relative)
            {
                target = GetParent(target);
            }
		
            if (IsAncestor(root, source) &&
                IsAncestor(root, target))
            {
                if (source == target)
                {
                    cell = GetParent(source);
                }
                else
                {
                    cell = GetNearestCommonAncestor(source, target);
                }

                if (cell != null &&
                    GetParent(cell) != root &&
                    GetParent(edge) != cell)
                {
                    mxGeometry geo = GetGeometry(edge);

                    if (geo != null)
                    {
                        mxPoint origin1 = GetOrigin(GetParent(edge));
                        mxPoint origin2 = GetOrigin(cell);

                        double dx = origin2.X - origin1.X;
                        double dy = origin2.Y - origin1.Y;

                        geo = (mxGeometry) geo.Clone();
                        geo.Translate(-dx, -dy);
                        SetGeometry(edge, geo);
                    }

                    Add(cell, edge, GetChildCount(cell));
                }
            }
        }

        /// <summary>
        /// Returns the absolute, cummulated origin for the children inside the
        /// given parent.
        /// </summary>
        public mxPoint GetOrigin(Object cell)
        {
            mxPoint result = null;

            if (cell != null)
            {
                result = GetOrigin(GetParent(cell));

                if (!IsEdge(cell))
                {
                    mxGeometry geo = GetGeometry(cell);

                    if (geo != null)
                    {
                        result.X += geo.X;
                        result.Y += geo.Y;
                    }
                }
            }
            else
            {
                result = new mxPoint();
            }

            return result;
        }

        /// <summary>
        /// Returns the nearest common ancestor for the specified cells.
        /// </summary>
        /// <param name="cell1">Cell that specifies the first cell in the tree.</param>
        /// <param name="cell2">Cell that specifies the second cell in the tree.</param>
        /// <returns>Returns the nearest common ancestor of the given cells.</returns>
        public Object GetNearestCommonAncestor(Object cell1, Object cell2)
        {
            if (cell1 != null && cell2 != null)
            {
                // Creates the cell path for the second cell
                String path = mxCellPath.Create((mxICell)cell2);

                if (path != null && path.Length > 0)
                {
                    // Bubbles through the ancestors of the target
                    // cell to find the nearest common ancestor.
                    Object cell = cell1;
                    String current = mxCellPath.Create((mxICell)cell);

                    while (cell != null)
                    {
                        Object parent = GetParent(cell);

                        // Checks if the cell path is equal to the beginning
                        // of the given cell path
                        if (path.IndexOf(current + mxCellPath.PATH_SEPARATOR) == 0 &&
                            parent != null)
                        {
                            return cell;
                        }

                        current = mxCellPath.GetParentPath(current);
                        cell = parent;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.GetEdgeCount(Object)
        /// </summary>
        public int GetEdgeCount(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).EdgeCount() : 0;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.GetEdgeAt(Object, int)
        /// </summary>
        public Object GetEdgeAt(Object parent, int index)
        {
            return (parent is mxICell) ? ((mxICell)parent).GetEdgeAt(index) : null;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.IsVertex(Object)
        /// </summary>
        public bool IsVertex(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Vertex : false;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.IsEdge(Object)
        /// </summary>
        public bool IsEdge(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Edge : false;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.IsConnectable(Object)
        /// </summary>
        public bool IsConnectable(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Connectable : false;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.GetValue(Object)
        /// </summary>
        public Object GetValue(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Value : null;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.SetValue(Object, Object)
        /// </summary>
        public Object SetValue(Object cell, Object value)
        {
            BeginUpdate();
            try
            {
                ((mxICell) cell).Value = value;
            }
            finally
            {
                EndUpdate();
            }

            return value;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.GetGeometry(Object)
        /// </summary>
        public mxGeometry GetGeometry(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Geometry : null;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.SetGeometry(Object, mxGeometry)
        /// </summary>
        public mxGeometry SetGeometry(Object cell, mxGeometry geometry)
        {
            BeginUpdate();
            try
            {
                ((mxICell)cell).Geometry = geometry;
            }
            finally
            {
                EndUpdate();
            }

            return geometry;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.GetStyle(Object)
        /// </summary>
        public string GetStyle(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Style : null;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.SetStyle(Object, string)
        /// </summary>
        public string SetStyle(Object cell, string style)
        {
            BeginUpdate();
            try
            {
                ((mxICell)cell).Style = style;
            }
            finally
            {
                EndUpdate();
            }

            return style;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.IsVisible(Object)
        /// </summary>
        public bool IsVisible(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Visible : false;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.SetVisible(Object, bool)
        /// </summary>
        public bool SetVisible(Object cell, bool visible)
        {
            BeginUpdate();
            try
            {
                ((mxICell)cell).Visible = visible;
            }
            finally
            {
                EndUpdate();
            }

            return visible;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.IsCollapsed(Object)
        /// </summary>
        public bool IsCollapsed(Object cell)
        {
            return (cell is mxICell) ? ((mxICell)cell).Collapsed : false;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.SetCollapsed(Object, bool)
        /// </summary>
        public bool SetCollapsed(Object cell, bool collapsed)
        {
            BeginUpdate();
            try
            {
                ((mxICell)cell).Collapsed = collapsed;
            }
            finally
            {
                EndUpdate();
            }

            return collapsed;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.BeginUpdate()
        /// </summary>
        public void BeginUpdate()
        {
            updateLevel++;
        }

        /// <summary>
        /// see com.mxgraph.mxIGraphModel.EndUpdate()
        /// </summary>
        public void EndUpdate()
        {
            updateLevel--;

            if (updateLevel == 0 && GraphModelChange != null)
            {
                GraphModelChange();
            }
        }

        /// <summary>
        /// Merges the children of the given cell into the given target cell inside
        /// this model. All cells are cloned unless there is a corresponding cell in
        /// the model with the same id, in which case the source cell is ignored and
        /// all edges are connected to the corresponding cell in this model. Edges
        /// are considered to have no identity and are always cloned unless the
        /// cloneAllEdges flag is set to false, in which case edges with the same
        /// id in the target model are reconnected to reflect the terminals of the
        /// source edges.
        /// </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <param name="cloneAllEdges"></param>
        public void MergeChildren(mxICell from, mxICell to, bool cloneAllEdges)
        {
            BeginUpdate();
            try
            {
                Dictionary<Object, Object> mapping = new Dictionary<Object, Object>();
                MergeChildrenImpl(from, to, cloneAllEdges, mapping);

                // Post-processes all edges in the mapping and
                // reconnects the terminals to the corresponding
                // cells in the target model
                foreach (KeyValuePair<Object, Object> kvp in mapping)
                {
                    Object edge = kvp.Key;
                    Object cell = kvp.Value;
                    Object terminal = GetTerminal(edge, true);

                    if (terminal != null)
                    {
                        terminal = mapping[terminal];
                        SetTerminal(cell, terminal, true);
                    }

                    terminal = GetTerminal(edge, false);

                    if (terminal != null)
                    {
                        terminal = mapping[terminal];
                        SetTerminal(cell, terminal, false);
                    }
                }
            }
            finally
            {
                EndUpdate();
            }
        }

        /// <summary>
        /// Clones the children of the source cell into the given target cell in
        /// this model and adds an entry to the mapping that maps from the source
        /// cell to the target cell with the same id or the clone of the source cell
        /// that was inserted into this model.
        /// </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <param name="cloneAllEdges"></param>
        /// <param name="mapping"></param>
        protected void MergeChildrenImpl(mxICell from, mxICell to, bool cloneAllEdges, Dictionary<Object, Object> mapping)
        {
            BeginUpdate();
		    try
		    {
                int childCount = from.ChildCount();

			    for (int i = 0; i < childCount; i++)
			    {
                    mxICell cell = from.GetChildAt(i);
				    String id = cell.Id;
                    mxICell target = (mxICell) ((id != null && (!IsEdge(cell) || !cloneAllEdges)) ? GetCell(id)
						    : null);

				    // Clones and adds the child if no cell exists for the id
				    if (target == null)
				    {
					    mxCell clone = (mxCell) cell.Clone();
					    clone.Id = id;

                        // Do *NOT* use model.add as this will move the edge away
                        // from the parent in updateEdgeParent if maintainEdgeParent
                        // is enabled in the target model
                        target = to.Insert(clone);
                        CellAdded(target);
				    }

				    // Stores the mapping for later reconnecting edges
				    mapping[cell] = target;

				    // Recurses
				    MergeChildrenImpl(cell, target, cloneAllEdges, mapping);
			    }
		    }
		    finally
		    {
			    EndUpdate();
		    }
        }

        /// <summary>
        /// Returns the number of incoming or outgoing edges.
        /// </summary>
        /// <param name="model">Graph model that contains the connection data.</param>
        /// <param name="cell">Cell whose edges should be counted.</param>
        /// <param name="outgoing">Boolean that specifies if the number of outgoing or
        /// incoming edges should be returned.</param>
        /// <returns>Returns the number of incoming or outgoing edges.</returns>
        public static int GetDirectedEdgeCount(mxIGraphModel model, Object cell, bool outgoing)
        {
            return GetDirectedEdgeCount(model, cell, outgoing, null);
        }

        /// <summary>
        /// Returns the number of incoming or outgoing edges, ignoring the given
        /// edge.
        /// </summary>
        /// <param name="model">Graph model that contains the connection data.</param>
        /// <param name="cell">Cell whose edges should be counted.</param>
        /// <param name="outgoing">Boolean that specifies if the number of outgoing or
        /// incoming edges should be returned.</param>
        /// <param name="ignoredEdge">Object that represents an edge to be ignored.</param>
        /// <returns>Returns the number of incoming or outgoing edges.</returns>
        public static int GetDirectedEdgeCount(mxIGraphModel model, Object cell, bool outgoing, Object ignoredEdge)
        {
            int count = 0;
            int edgeCount = model.GetEdgeCount(cell);

            for (int i = 0; i < edgeCount; i++)
            {
                Object edge = model.GetEdgeAt(cell, i);

                if (edge != ignoredEdge
                        && model.GetTerminal(edge, outgoing) == cell)
                {
                    count++;
                }
            }

            return count;
        }

        /// <summary>
        /// Returns all edges connected to this cell including loops.
        /// </summary>
        /// <param name="model">Model that contains the connection information</param>
        /// <param name="cell">Cell whose connections should be returned</param>
        /// <returns></returns>
        public static Object[] GetEdges(mxIGraphModel model, Object cell)
        {
            return GetEdges(model, cell, true, true, true);
        }

        /// <summary>
        /// Returns all edges connected to this cell without loops.
        /// </summary>
        /// <param name="model">Model that contains the connection information</param>
        /// <param name="cell">Cell whose connections should be returned</param>
        /// <returns>Returns the array of connected edges for the given cell</returns>
        public static Object[] GetConnections(mxIGraphModel model, Object cell)
        {
            return GetEdges(model, cell, true, true, false);
        }

        /// <summary>
        /// Returns the incoming edges of the given cell without loops.
        /// </summary>
        /// <param name="model">Graphmodel that contains the edges</param>
        /// <param name="cell">Cell whose incoming edges should be returned</param>
        /// <returns>Returns the incoming edges for the given cell</returns>
        public static Object[] GetIncomingEdges(mxIGraphModel model, Object cell)
        {
            return GetEdges(model, cell, true, false, false);
        }

        /// <summary>
        /// Returns the outgoing edges of the given cell without loops.
        /// </summary>
        /// <param name="model">Graphmodel that contains the edges</param>
        /// <param name="cell">Cell whose outgoing edges should be returned</param>
        /// <returns>Returns the outgoing edges for the given cell</returns>
        public static Object[] GetOutgoingEdges(mxIGraphModel model, Object cell)
        {
            return GetEdges(model, cell, false, true, false);
        }

        /// <summary>
        /// Returns all distinct edges connected to this cell. If at least one of
        /// incoming or outgoing is true, then loops are ignored, otherwise if both
        /// are false, then all edges connected to the given cell are returned
        /// including loops.
        /// </summary>
        /// <param name="model">Model that contains the connection information</param>
        /// <param name="cell">Cell whose connections should be returned</param>
        /// <param name="incoming">Specifies if incoming edges should be returned</param>
        /// <param name="outgoing">Specifies if outgoing edges should be returned</param>
        /// <param name="includeLoops">Specifies if loops should be returned</param>
        /// <returns>Returns the array of connected edges for the given cell</returns>
        public static Object[] GetEdges(mxIGraphModel model, Object cell,
                bool incoming, bool outgoing, bool includeLoops)
        {
            int edgeCount = model.GetEdgeCount(cell);
            List<Object> result = new List<Object>(edgeCount);

            for (int i = 0; i < edgeCount; i++)
            {
                Object edge = model.GetEdgeAt(cell, i);
                Object source = model.GetTerminal(edge, true);
                Object target = model.GetTerminal(edge, false);

                if ((includeLoops && source == target) ||
                    ((source != target) &&
                   ((incoming && target == cell) ||
                   (outgoing && source == cell))))
                {
                    result.Add(edge);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns all edges between the given source and target mxCells. If the
        /// optional boolean directed argument is false, then a matching edge is
        /// returned regardless of its direction.
        /// </summary>
        /// <param name="model"></param>
        /// <param name="source"></param>
        /// <param name="target"></param>
        /// <returns></returns>
        public static Object[] GetEdgesBetween(mxIGraphModel model, Object source,
                Object target)
        {
            return GetEdgesBetween(model, source, target, false);
        }

        /// <summary>
        /// Returns all edges between the given source and target mxCells. If the
        /// optional boolean directed argument is false, then a matching edge is
        /// returned regardless of its direction.
        /// </summary>
        /// <param name="model">The graph model that contains the graph.</param>
        /// <param name="source">mxCell that defines the source terminal of the edge to be
        /// returned.</param>
        /// <param name="target">mxCell that defines the target terminal of the edge to be
        /// returned.</param>
        /// <param name="directed">Optional boolean that specifies if the direction of the
        /// edge should be taken into account. Default is true.</param>
        /// <returns></returns>
        public static Object[] GetEdgesBetween(mxIGraphModel model, Object source,
                Object target, bool directed)
        {
            int tmp1 = model.GetEdgeCount(source);
            int tmp2 = model.GetEdgeCount(target);

            // Assumes the source has less connected edges
            Object terminal = source;
            int edgeCount = tmp1;

            // Uses the smaller array of connected edges
            // for searching the edge
            if (tmp2 < tmp1)
            {
                edgeCount = tmp2;
                terminal = target;
            }

            List<Object> result = new List<Object>();

            // Checks if the edge is connected to the correct
            // cell and returns the first match
            for (int i = 0; i < edgeCount; i++)
            {
                Object edge = model.GetEdgeAt(terminal, i);
                Object src = model.GetTerminal(edge, true);
                Object trg = model.GetTerminal(edge, false);
                bool isSource = src == source;

                if (isSource
                        && trg == target
                        || (!directed && model.GetTerminal(edge, !isSource) == target))
                {
                    result.Add(edge);
                }
            }

            return result.ToArray();
        }

        /// <summary>
        /// Returns all opposite vertices wrt terminal for the given edges, only$
        /// returning sources and/or targets as specified. The result is returned as
        /// an array of mxCells.
        /// </summary>
        /// <param name="model">Model that contains the graph.</param>
        /// <param name="edges">Array of edges to be examined.</param>
        /// <param name="terminal">Cell that specifies the known end of the edges.</param>
        /// <param name="sources">Boolean that specifies if source terminals should
        /// be contained in the result. Default is true.</param>
        /// <param name="targets">Boolean that specifies if target terminals should
        /// be contained in the result. Default is true.</param>
        /// <returns>Returns the array of opposite terminals for the given edges.</returns>
        public static Object[] GetOpposites(mxIGraphModel model, Object[] edges,
                Object terminal, bool sources, bool targets)
        {
            List<Object> terminals = new List<Object>();

            if (edges != null)
            {
                for (int i = 0; i < edges.Length; i++)
                {
                    Object source = model.GetTerminal(edges[i], true);
                    Object target = model.GetTerminal(edges[i], false);

                    // Checks if the terminal is the source of
                    // the edge and if the target should be
                    // stored in the result
                    if (source == terminal && target != null && target != terminal
                            && targets)
                    {
                        terminals.Add(target);
                    }

                    // Checks if the terminal is the taget of
                    // the edge and if the source should be
                    // stored in the result
                    else if (target == terminal && source != null
                            && source != terminal && sources)
                    {
                        terminals.Add(source);
                    }
                }
            }

            return terminals.ToArray();
        }

        /// <summary>
        /// Sets the source and target of the given edge in a single atomic change.
        /// </summary>
        /// <param name="model">Model that contains the graph.</param>
        /// <param name="edge">Cell that specifies the edge.</param>
        /// <param name="source">Cell that specifies the new source terminal.</param>
        /// <param name="target">Cell that specifies the new target terminal.</param>
        public static void SetTerminals(mxIGraphModel model, Object edge, Object source, Object target)
        {
            model.BeginUpdate();
            try
            {
                model.SetTerminal(edge, source, true);
                model.SetTerminal(edge, target, false);
            }
            finally
            {
                model.EndUpdate();
            }
        }

        /// <summary>
        /// Returns the child vertices of the given parent.
        /// </summary>
        /// <param name="model">Model that contains the hierarchical information.</param>
        /// <param name="parent">Cell whose child vertices should be returned.</param>
        /// <returns>Returns the child vertices of the given parent.</returns>
        public static Object[] getChildVertices(mxIGraphModel model, Object parent)
        {
            return getChildCells(model, parent, true, false);
        }

        /// <summary>
        /// Returns the child edges of the given parent.
        /// </summary>
        /// <param name="model">Model that contains the hierarchical information.</param>
        /// <param name="parent">Cell whose child edges should be returned.</param>
        /// <returns>Returns the child edges of the given parent.</returns>
        public static Object[] getChildEdges(mxIGraphModel model, Object parent)
        {
            return getChildCells(model, parent, false, true);
        }

        /// <summary>
        /// Returns the children of the given cell that are vertices and/or edges
        /// depending on the arguments.
        /// </summary>
        /// <param name="model">Model that contains the hierarchical information.</param>
        /// <param name="parent">Cell whose child vertices or edges should be returned.</param>
        /// <param name="vertices">Boolean indicating if child vertices should be returned.</param>
        /// <param name="edges">Boolean indicating if child edges should be returned.</param>
        /// <returns>Returns the child vertices and/or edges of the given parent.</returns>
        public static Object[] getChildCells(mxIGraphModel model, Object parent,
                bool vertices, bool edges)
        {
            int childCount = model.GetChildCount(parent);
            List<Object> result = new List<Object>(childCount);

            for (int i = 0; i < childCount; i++)
            {
                Object child = model.GetChildAt(parent, i);

                if ((edges && model.IsEdge(child))
                        || (vertices && model.IsVertex(child)))
                {
                    result.Add(child);
                }
            }

            return result.ToArray();
        }

    }
}
