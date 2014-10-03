// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for a cell that can be used in an mxGraphModel.
    /// </summary>
    public interface mxICell
    {
        /// <summary>
        /// Sets or returns the Id of the cell.
        /// </summary>
        string Id
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the user object of the cell.
        /// </summary>
        Object Value
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the geometry of the cell.
        /// </summary>
        mxGeometry Geometry
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the string that describes the style.
        /// </summary>
        string Style
        {
            get;
            set;
        }

        /// <summary>
        /// Returns true if the cell is a vertex.
        /// </summary>
        bool Vertex
        {
            get;
        }

        /// <summary>
        /// Returns true if the cell is an edge.
        /// </summary>
        bool Edge
        {
            get;
        }

        /// <summary>
        /// Returns true if the cell is connectable.
        /// </summary>
        bool Connectable
        {
            get;
        }

        /// <summary>
        /// Sets or returns the visible state of the cell.
        /// </summary>
        bool Visible
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the collapsed state of the cell.
        /// </summary>
        bool Collapsed
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the parent of the cell.
        /// </summary>
        mxICell Parent
        {
            get;
            set;
        }

        /// <summary>
        /// Returns the source or target terminal of the cell.
        /// </summary>
        /// <param name="source">Boolean that specifies if the source terminal should be
        /// returned.</param>
        /// <returns>Returns the source or target terminal.</returns>
        mxICell GetTerminal(bool source);

        /// <summary>
        /// Sets the source or target terminal.
        /// </summary>
        /// <param name="terminal">Cell that represents the new source or target terminal.</param>
        /// <param name="source">Boolean that specifies if the source or target terminal
        /// should be set.</param>
        /// <returns>Returns the new terminal.</returns>
        mxICell SetTerminal(mxICell terminal, bool source);

        /// <summary>
        /// Returns the number of child cells.
        /// </summary>
        /// <returns>Returns the number of child cells.</returns>
        int ChildCount();

        /// <summary>
        /// Returns the index of the specified child in the child array.
        /// </summary>
        /// <param name="child">Child whose index should be returned.</param>
        /// <returns>Returns the index of the specified child.</returns>
        int GetIndex(mxICell child);

        /// <summary>
        /// Returns the child at the specified index.
        /// </summary>
        /// <param name="index">Integer that specifies the child to be returned.</param>
        /// <returns>Returns the child at the specified index.</returns>
        mxICell GetChildAt(int index);

        /// <summary>
        /// Appends the specified child into the child array and updates the parent
        /// reference of the child.
        /// </summary>
        /// <param name="child">Cell to be appended to the child array.</param>
        /// <returns>Returns the appended child.</returns>
        mxICell Insert(mxICell child);

        /// <summary>
        /// Inserts the specified child into the child array at the specified index
        /// and updates the parent reference of the child.
        /// </summary>
        /// <param name="child">Cell to be inserted into the child array.</param>
        /// <param name="index">Integer that specifies the index at which the child should
        /// be inserted into the child array.</param>
        /// <returns>Returns the inserted child.</returns>
        mxICell Insert(mxICell child, int index);

        /// <summary>
        /// Removes the child at the specified index from the child array and
        /// returns the child that was removed. Will remove the parent reference of
        /// the child.
        /// </summary>
        /// <param name="index">Integer that specifies the index of the child to be
        /// removed.</param>
        /// <returns>Returns the child that was removed.</returns>
        mxICell Remove(int index);

        /// <summary>
        /// Removes the given child from the child array. Will remove the parent
        /// reference of the child.
        /// </summary>
        /// <param name="child"></param>
        /// <returns>Returns the child that was removed.</returns>
        mxICell Remove(mxICell child);

        /// <summary>
        /// Removes the cell from its parent.
        /// </summary>
        void RemoveFromParent();

        /// <summary>
        /// Returns the number of edges in the edge array.
        /// </summary>
        /// <returns>Returns the number of edges.</returns>
        int EdgeCount();

        /// <summary>
        /// Returns the index of the specified edge in the edge array.
        /// </summary>
        /// <param name="edge">Cell whose index should be returned.</param>
        /// <returns>Returns the index of the given edge.</returns>
        int GetEdgeIndex(mxICell edge);

        /// <summary>
        /// Returns the edge at the specified index in the edge array.
        /// </summary>
        /// <param name="index">Integer that specifies the index of the edge to be
        /// returned.</param>
        /// <returns>Returns the edge at the specified index.</returns>
        mxICell GetEdgeAt(int index);

        /// <summary>
        /// Inserts the specified edge into the edge array and returns the edge.
        /// Will update the respective terminal reference of the edge.
        /// </summary>
        /// <param name="edge">Cell to be inserted into the edge array.</param>
        /// <param name="isOutgoing">Boolean that specifies if the edge is outgoing.</param>
        /// <returns>Returns the inserted edge.</returns>
        mxICell InsertEdge(mxICell edge, bool isOutgoing);

        /// <summary>
        /// Removes the specified edge from the edge array and returns the edge.
        /// Will remove the respective terminal reference from the edge.
        /// </summary>
        /// <param name="edge">Cell to be removed from the edge array.</param>
        /// <param name="isOutgoing">Boolean that specifies if the edge is outgoing.</param>
        /// <returns>Returns the edge that was removed.</returns>
        mxICell RemoveEdge(mxICell edge, bool isOutgoing);

        /// <summary>
        /// Removes the edge from its source or target terminal.
        /// </summary>
        /// <param name="isSource">Boolean that specifies if the edge should be removed
        /// from its source or target terminal.</param>
        void RemoveFromTerminal(bool isSource);
        
        /// <summary>
        /// Returns a clone of this cell.
        /// </summary>
        /// <returns>Returns a clone of this cell.</returns>
	    Object Clone();

    }

}
