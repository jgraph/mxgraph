// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirements for an object that implements a graph layout.
    /// </summary>
    public interface mxIGraphLayout
    {

        /// <summary>
        /// Executes the layout for the children of the specified parent.
        /// </summary>
        /// <param name="parent">Parent cell that contains the children to be layed out.</param>
        void execute(Object parent);

        /// <summary>
        /// Notified when a cell is being moved in a parent that has automatic
        /// layout to update the cell state (eg. index) so that the outcome of the
        /// layout will position the vertex as close to the point (x, y) as
        /// possible.
        /// </summary>
        /// <param name="cell">Cell which is being moved.</param>
        /// <param name="x">X-coordinate of the new cell location.</param>
        /// <param name="y">Y-coordinate of the new cell location.</param>
        void move(Object cell, double x, double y);

    }
}
