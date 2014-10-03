// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for a canvas that paints the vertices and
    /// edges of a graph.
    /// </summary>
    public interface mxICanvas
    {

        /// <summary>
        /// Sets or returns the user object of the cell.
        /// </summary>
        Point Translate
        {
            get;
            set;
        }

        /// <summary>
        /// Sets or returns the user object of the cell.
        /// </summary>
        double Scale
        {
            get;
            set;
        }

        /// <summary>
        /// Draws the given cell.
        /// </summary>
        /// <param name="state">State of the cell to be painted.</param>
        /// <returns>Object that represents the vertex.</returns>
        Object DrawCell(mxCellState state);

        /// <summary>
        /// Draws the given label.
        /// </summary>
        /// <param name="text">String that represents the label.</param>
        /// <param name="state">State of the cell whose label is to be painted.</param>
        /// <param name="html">Specifies if the label contains HTML markup.</param>
        /// <returns>Object that represents the label.</returns>
        Object DrawLabel(string text, mxCellState state, bool html);

    }

}
