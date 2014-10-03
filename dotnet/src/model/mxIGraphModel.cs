// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Threading;
using System.Collections;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for an object that listens to a graph model.
    /// </summary>
    public delegate void mxGraphModelChangeEventHandler();

    /// <summary>
    /// Defines the requirements for a graph model to be used with mxGraph.
    /// </summary>
    public interface mxIGraphModel
    {

        /// <summary>
        /// Called when the graph model has changed.
        /// </summary>
        event mxGraphModelChangeEventHandler GraphModelChange;

        /// <summary>
        /// Holds the root cell.
        /// </summary>
        Object Root
        {
            get;
            set;
        }
        
        /// <summary>
        /// Returns an array of clones for the given array of cells.
        /// Depending on the value of includeChildren, a deep clone is created for
        /// each cell. Connections are restored based if the corresponding
        /// cell is contained in the passed in array.
        /// </summary>
        /// <param name="cells">Array of cells to be cloned.</param>
        /// <param name="includeChildren">Boolean indicating if the cells should be cloned
        /// with all descendants.</param>
        /// <returns>Returns a cloned array of cells.</returns>
        Object[] CloneCells(Object[] cells, bool includeChildren);

        /// <summary>
        /// Returns true if the given parent is an ancestor of child.
        /// </summary>
        /// <param name="parent">Cell that specifies the parent.</param>
        /// <param name="child">Cell that specifies the child.</param>
        /// <returns>Returns true if child is an ancestor of parent.</returns>
        bool IsAncestor(Object parent, Object child);

        /// <summary>
        /// Returns true if the model contains the given cell.
        /// </summary>
        /// <param name="cell">Cell to be checked.</param>
        /// <returns>Returns true if the cell is in the model.</returns>
        bool Contains(Object cell);

        /// <summary>
        /// Returns the parent of the given cell.
        /// </summary>
        /// <param name="child">Cell whose parent should be returned.</param>
        /// <returns>Returns the parent of the given cell.</returns>
        Object GetParent(Object child);

        /// <summary>
        /// Adds the specified child to the parent at the given index. If no index
        /// is specified then the child is appended to the parent's array of
        /// children.
        /// </summary>
        /// <param name="parent">Cell that specifies the parent to contain the child.</param>
        /// <param name="child">Cell that specifies the child to be inserted.</param>
        /// <param name="index">Integer that specifies the index of the child.</param>
        /// <returns>Returns the inserted child.</returns>
        Object Add(Object parent, Object child, int index);

        /// <summary>
        /// Removes the specified cell from the model. This operation will remove
        /// the cell and all of its children from the model.
        /// </summary>
        /// <param name="parent">Cell that should be removed.</param>
        /// <returns>Returns the removed cell.</returns>
        Object Remove(Object parent);

        /// <summary>
        /// Returns the number of children in the given cell.
        /// </summary>
        /// <param name="cell">Cell whose number of children should be returned.</param>
        /// <returns>Returns the number of children in the given cell.</returns>
        int GetChildCount(Object cell);

        /// <summary>
        /// Returns the child of the given parent at the given index.
        /// </summary>
        /// <param name="parent">Cell that represents the parent.</param>
        /// <param name="index">Integer that specifies the index of the child to be
        /// returned.</param>
        /// <returns>Returns the child at index in parent.</returns>
        Object GetChildAt(Object parent, int index);

        /// <summary>
        /// Returns the source or target terminal of the given edge depending on the
        /// value of the boolean parameter.
        /// </summary>
        /// <param name="edge">Cell that specifies the edge.</param>
        /// <param name="source">Boolean indicating which end of the edge should be
        /// returned.</param>
        /// <returns>Returns the source or target of the given edge.</returns>
        Object GetTerminal(Object edge, bool source);

        /// <summary>
        /// Sets the source or target terminal of the given edge using.
        /// </summary>
        /// <param name="edge">Cell that specifies the edge.</param>
        /// <param name="terminal">Cell that specifies the new terminal.</param>
        /// <param name="source">Boolean indicating if the terminal is the new source or
        /// target terminal of the edge.</param>
        Object SetTerminal(Object edge, Object terminal, bool source);

        /// <summary>
        /// Returns the number of distinct edges connected to the given cell.
        /// </summary>
        /// <param name="cell">Cell that represents the vertex.</param>
        /// <returns>Returns the number of edges connected to cell.</returns>
        int GetEdgeCount(Object cell);

        /// <summary>
        /// Returns the edge of cell at the given index.
        /// </summary>
        /// <param name="cell">Cell that specifies the vertex.</param>
        /// <param name="index">Integer that specifies the index of the edge to return.</param>
        /// <returns>Returns the edge at the given index.</returns>
        Object GetEdgeAt(Object cell, int index);

        /// <summary>
        /// Returns true if the given cell is a vertex.
        /// </summary>
        /// <param name="cell">Cell that represents the possible vertex.</param>
        /// <returns>Returns true if the given cell is a vertex.</returns>
        bool IsVertex(Object cell);

        /// <summary>
        /// Returns true if the given cell is an edge.
        /// </summary>
        /// <param name="cell">Cell that represents the possible edge.</param>
        /// <returns>Returns true if the given cell is an edge.</returns>
        bool IsEdge(Object cell);

        /// <summary>
        /// Returns true if the given cell is connectable.
        /// </summary>
        /// <param name="cell">Cell whose connectable state should be returned.</param>
        /// <returns>Returns the connectable state of the given cell.</returns>
        bool IsConnectable(Object cell);

        /// <summary>
        /// Returns the user object of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose user object should be returned.</param>
        /// <returns>Returns the user object of the given cell.</returns>
        Object GetValue(Object cell);

        /// <summary>
        /// Sets the user object of then given cell.
        /// </summary>
        /// <param name="cell">Cell whose user object should be changed.</param>
        /// <param name="value">Object that defines the new user object.</param>
        Object SetValue(Object cell, Object value);

        /// <summary>
        /// Returns the geometry of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose geometry should be returned.</param>
        /// <returns>Returns the geometry of the given cell.</returns>
        mxGeometry GetGeometry(Object cell);

        /// <summary>
        /// Sets the geometry of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose geometry should be changed.</param>
        /// <param name="geometry">Object that defines the new geometry.</param>
        mxGeometry SetGeometry(Object cell, mxGeometry geometry);

        /// <summary>
        /// Returns the style of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose style should be returned.</param>
        /// <returns>Returns the style of the given cell.</returns>
        string GetStyle(Object cell);

        /// <summary>
        /// Sets the style of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose style should be changed.</param>
        /// <param name="style">String of the form stylename[;key=value] to specify
        /// the new cell style.</param>
        string SetStyle(Object cell, string style);

        /// <summary>
        /// Returns true if the given cell is collapsed.
        /// </summary>
        /// <param name="cell">Cell whose collapsed state should be returned.</param>
        /// <returns>Returns the collapsed state of the given cell.</returns>
        bool IsCollapsed(Object cell);

        /// <summary>
        /// Sets the collapsed state of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose collapsed state should be changed.</param>
        /// <param name="collapsed">Boolean that specifies the new collpased state.</param>
        bool SetCollapsed(Object cell, bool collapsed);

        /// <summary>
        /// Returns true if the given cell is visible.
        /// </summary>
        /// <param name="cell">Cell whose visible state should be returned.</param>
        /// <returns>Returns the visible state of the given cell.</returns>
        bool IsVisible(Object cell);

        /// <summary>
        /// Sets the visible state of the given cell.
        /// </summary>
        /// <param name="cell">Cell whose visible state should be changed.</param>
        /// <param name="visible">Boolean that specifies the new visible state.</param>
        bool SetVisible(Object cell, bool visible);

        /// <summary>
        /// Increments the updateLevel by one. The event notification is queued
        /// until updateLevel reaches 0 by use of endUpdate.
        /// </summary>
        void BeginUpdate();

        /// <summary>
        /// Decrements the updateLevel by one and fires a notification event if the
        /// updateLevel reaches 0.
        /// </summary>
        void EndUpdate();

    }

}
