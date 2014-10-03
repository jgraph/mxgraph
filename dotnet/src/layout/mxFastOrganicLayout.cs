// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Fast organic layout algorithm.
    /// </summary>
    public class mxFastOrganicLayout: mxIGraphLayout
    {

        /// <summary>
        /// Holds the enclosing graph.
        /// </summary>
        protected mxGraph graph;

        /// <summary>
        /// The force constant by which the attractive forces are divided and the
        /// replusive forces are multiple by the square of. The value equates to the
        /// average radius there is of free space around each node. Default is 50.
        /// </summary>
        protected double forceConstant = 50;

        /// <summary>
        /// Cache of forceConstant^2 for performance.
        /// </summary>
        protected double forceConstantSquared = 0;

        /// <summary>
        /// Minimal distance limit. Default is 2. Prevents of
        /// dividing by zero.
        /// </summary>
        protected double minDistanceLimit = 2;

        /// <summary>
        /// Cached version of minDistanceLimit squared.
        /// </summary>
        protected double minDistanceLimitSquared = 0;

        /// <summary>
        /// Start value of temperature. Default is 200.
        /// </summary>
        protected double initialTemp = 200;

        /// <summary>
        /// Temperature to limit displacement at later stages of layout.
        /// </summary>
        protected double temperature = 0;

        /// <summary>
        /// Total number of iterations to run the layout though.
        /// </summary>
        protected int maxIterations = 0;

        /// <summary>
        /// Current iteration count.
        /// </summary>
        protected int iteration = 0;

        /// <summary>
        /// An array of all vertices to be laid out.
        /// </summary>
        protected Object[] vertexArray;

        /// <summary>
        /// An array of locally stored X co-ordinate displacements for the vertices.
        /// </summary>
        protected double[] dispX;

        /// <summary>
        /// An array of locally stored Y co-ordinate displacements for the vertices.
        /// </summary>
        protected double[] dispY;

        /// <summary>
        /// An array of locally stored co-ordinate positions for the vertices.
        /// </summary>
        protected double[][] cellLocation;

        /// <summary>
        /// The approximate radius of each cell, nodes only.
        /// </summary>
        protected double[] radius;

        /// <summary>
        /// The approximate radius squared of each cell, nodes only.
        /// </summary>
        protected double[] radiusSquared;

        /// <summary>
        /// Array of booleans representing the movable states of the vertices.
        /// </summary>
        protected bool[] isMoveable;

        /// <summary>
        /// Local copy of cell neighbours.
        /// </summary>
        protected int[][] neighbours;

        /// <summary>
        /// Boolean flag that specifies if the layout is allowed to run. If this is
        /// set to false, then the layout exits in the following iteration.
        /// </summary>
        protected bool allowedToRun = true;

        /// <summary>
        /// Maps from vertices to indices.
        /// </summary>
        protected Dictionary<object, int> indices = new Dictionary<object, int>();

        /// <summary>
        /// Random number generator.
        /// </summary>
        protected Random random = new Random();

        /// <summary>
        /// Constructs a new fast organic layout for the specified graph.
        /// </summary>
        /// <param name="graph"></param>
        public mxFastOrganicLayout(mxGraph graph)
        {
            this.graph = graph;
        }

        /// <summary>
        /// Flag to stop a running layout run.
        /// </summary>
        public bool IsAllowedToRun
        {
            get { return allowedToRun; }
            set { allowedToRun = value; }
        }

        /// <summary>
        /// Returns true if the given cell should be ignored by the layout algorithm.
        /// This implementation returns false if the cell is a vertex and has at least
        /// one connected edge.
        /// </summary>
        /// <param name="cell">Object that represents the cell.</param>
        /// <returns>Returns true if the given cell should be ignored.</returns>
        public bool IsCellIgnored(Object cell)
        {
            return !graph.Model.IsVertex(cell) ||
                graph.Model.GetEdgeCount(cell) == 0;
        }

        /// <summary>
        /// Maximum number of iterations.
        /// </summary>
        public int MaxIterations
        {
            get { return maxIterations; }
            set { maxIterations = value; }
        }

        /// <summary>
        /// Force constant to be used for the springs.
        /// </summary>
        public double ForceConstant
        {
            get { return forceConstant; }
            set { forceConstant = value; }
        }

        /// <summary>
        /// Minimum distance between nodes.
        /// </summary>
        public double MinDistanceLimit
        {
            get { return minDistanceLimit; }
            set { minDistanceLimit = value; }
        }

        /// <summary>
        /// Initial temperature.
        /// </summary>
        public double InitialTemp
        {
            get { return initialTemp; }
            set { initialTemp = value; }
        }

        /// <summary>
        /// Reduces the temperature of the layout from an initial setting in a linear
        /// fashion to zero.
        /// </summary>
        protected void reduceTemperature()
        {
            temperature = initialTemp * (1.0 - iteration / maxIterations);
        }

        /// <summary>
        /// Notified when a cell is being moved in a parent
        /// that has automatic layout to update the cell
        /// state (eg. index) so that the outcome of the
        /// layou will position the vertex as close to the
        /// point (x, y) as possible.
        /// 
        /// Not yet implemented.
        /// </summary>
        /// <param name="cell"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        public void move(Object cell, double x, double y)
        {
            // TODO: Map the position to a child index for
            // the cell to be placed closest to the position
        }

        /// <summary>
        /// Executes the fast organic layout.
        /// </summary>
        /// <param name="parent"></param>
        public void execute(Object parent)
        {
            mxIGraphModel model = graph.Model;

            // Finds the relevant vertices for the layout
            int childCount = model.GetChildCount(parent);
            List<Object> tmp = new List<Object>(childCount);

            for (int i = 0; i < childCount; i++)
            {
                Object child = model.GetChildAt(parent, i);

                if (!IsCellIgnored(child))
                {
                    tmp.Add(child);
                }
            }

            vertexArray = tmp.ToArray();
            int n = vertexArray.Length;

            dispX = new double[n];
            dispY = new double[n];
            cellLocation = new double[n][];
            isMoveable = new bool[n];
            neighbours = new int[n][];
            radius = new double[n];
            radiusSquared = new double[n];

            minDistanceLimitSquared = minDistanceLimit * minDistanceLimit;

            if (forceConstant < 0.001)
            {
                forceConstant = 0.001;
            }

            forceConstantSquared = forceConstant * forceConstant;

            // Create a map of vertices first. This is required for the array of
            // arrays called neighbours which holds, for each vertex, a list of
            // ints which represents the neighbours cells to that vertex as
            // the indices into vertexArray
            for (int i = 0; i < vertexArray.Length; i++)
            {
                Object vertex = vertexArray[i];
                cellLocation[i] = new double[2];

                // Set up the mapping from array indices to cells
                indices[vertex] = i;
                mxGeometry bounds = model.GetGeometry(vertex);

                // Set the X,Y value of the internal version of the cell to
                // the center point of the vertex for better positioning
                double width = bounds.Width;
                double height = bounds.Height;

                // Randomize (0, 0) locations
                double x = bounds.X;
                double y = bounds.Y;

                cellLocation[i][0] = x + width / 2.0;
                cellLocation[i][1] = y + height / 2.0;

                radius[i] = Math.Min(width, height);
                radiusSquared[i] = radius[i] * radius[i];
            }

            for (int i = 0; i < n; i++)
            {
                dispX[i] = 0;
                dispY[i] = 0;
                isMoveable[i] = graph.IsCellMovable(vertexArray[i]);

                // Get lists of neighbours to all vertices, translate the cells
                // obtained in indices into vertexArray and store as an array
                // against the orginial cell index
                Object[] edges = mxGraphModel.GetEdges(model, vertexArray[i]);
                Object[] cells = mxGraphModel.GetOpposites(model, edges,
                        vertexArray[i], true, true);

                neighbours[i] = new int[cells.Length];

                for (int j = 0; j < cells.Length; j++)
                {
                    int? index = indices[cells[j]];

                    // Check the connected cell in part of the vertex list to be
                    // acted on by this layout
                    if (index != null)
                    {
                        neighbours[i][j] = (int) index;
                    }

                    // Else if index of the other cell doesn't correspond to
                    // any cell listed to be acted upon in this layout. Set
                    // the index to the value of this vertex (a dummy self-loop)
                    // so the attraction force of the edge is not calculated
                    else
                    {
                        neighbours[i][j] = i;
                    }
                }
            }
            temperature = initialTemp;

            // If max number of iterations has not been set, guess it
            if (maxIterations == 0)
            {
                maxIterations = (int)(20 * Math.Sqrt(n));
            }

            // Main iteration loop
            for (iteration = 0; iteration < maxIterations; iteration++)
            {
                if (!allowedToRun)
                {
                    return;
                }

                // Calculate repulsive forces on all vertices
                calcRepulsion();

                // Calculate attractive forces through edges
                calcAttraction();

                calcPositions();
                reduceTemperature();
            }

            // Moved cell location back to top-left from center locations used in
            // algorithm
            model.BeginUpdate();
            try
            {
                double? minx = null;
                double? miny = null;

                for (int i = 0; i < vertexArray.Length; i++)
                {
                    Object vertex = vertexArray[i];
                    mxGeometry geo = model.GetGeometry(vertex);

                    if (geo != null)
                    {
                        cellLocation[i][0] -= geo.Width / 2.0;
                        cellLocation[i][1] -= geo.Height / 2.0;

                        geo = geo.Clone();

                        geo.X = graph.Snap(cellLocation[i][0]);
                        geo.Y = graph.Snap(cellLocation[i][1]);

                        model.SetGeometry(vertex, geo);

                        if (minx == null)
                        {
                            minx = geo.X;
                        }
                        else
                        {
                            minx = Math.Min((double) minx, geo.X);
                        }

                        if (miny == null)
                        {
                            miny = geo.Y;
                        }
                        else
                        {
                            miny = Math.Min((double) miny, geo.Y);
                        }
                    }
                }

                // Modifies the cloned geometries in-place. Not needed
                // to clone the geometries again as we're in the same
                // undoable change.
                if (minx != null || miny != null)
                {
                    for (int i = 0; i < vertexArray.Length; i++)
                    {
                        Object vertex = vertexArray[i];
                        mxGeometry geo = model.GetGeometry(vertex);

                        if (geo != null)
                        {
                            if (minx != null)
                            {
                                geo.X -= ((double) minx) - 1;
                            }

                            if (miny != null)
                            {
                                geo.Y -= ((double) miny) - 1;
                            }
                        }
                    }
                }
            }
            finally
            {
                model.EndUpdate();
            }
        }

        /// <summary>
        /// Takes the displacements calculated for each cell and applies them to the
        /// local cache of cell positions. Limits the displacement to the current
        /// temperature.
        /// </summary>
        protected void calcPositions()
        {
            for (int index = 0; index < vertexArray.Length; index++)
            {
                if (isMoveable[index])
                {
                    // Get the distance of displacement for this node for this
                    // iteration
                    double deltaLength = Math.Sqrt(dispX[index] * dispX[index]
                            + dispY[index] * dispY[index]);

                    if (deltaLength < 0.001)
                    {
                        deltaLength = 0.001;
                    }

                    // Scale down by the current temperature if less than the
                    // displacement distance
                    double newXDisp = dispX[index] / deltaLength
                            * Math.Min(deltaLength, temperature);
                    double newYDisp = dispY[index] / deltaLength
                            * Math.Min(deltaLength, temperature);

                    // reset displacements
                    dispX[index] = 0;
                    dispY[index] = 0;

                    // Update the cached cell locations
                    cellLocation[index][0] += newXDisp;
                    cellLocation[index][1] += newYDisp;
                }
            }
        }

        /// <summary>
        /// Calculates the attractive forces between all laid out nodes linked by
        /// edges
        /// </summary>
        protected void calcAttraction()
        {
            // Check the neighbours of each vertex and calculate the attractive
            // force of the edge connecting them
            for (int i = 0; i < vertexArray.Length; i++)
            {
                for (int k = 0; k < neighbours[i].Length; k++)
                {
                    // Get the index of the othe cell in the vertex array
                    int j = neighbours[i][k];

                    // Do not proceed self-loops
                    if (i != j)
                    {
                        double xDelta = cellLocation[i][0] - cellLocation[j][0];
                        double yDelta = cellLocation[i][1] - cellLocation[j][1];

                        // The distance between the nodes
                        double deltaLengthSquared = xDelta * xDelta + yDelta
                                * yDelta - radiusSquared[i] - radiusSquared[j];

                        if (deltaLengthSquared < minDistanceLimitSquared)
                        {
                            deltaLengthSquared = minDistanceLimitSquared;
                        }

                        double deltaLength = Math.Sqrt(deltaLengthSquared);
                        double force = (deltaLengthSquared) / forceConstant;

                        double displacementX = (xDelta / deltaLength) * force;
                        double displacementY = (yDelta / deltaLength) * force;

                        if (isMoveable[i])
                        {
                            this.dispX[i] -= displacementX;
                            this.dispY[i] -= displacementY;
                        }

                        if (isMoveable[j])
                        {
                            dispX[j] += displacementX;
                            dispY[j] += displacementY;
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Calculates the repulsive forces between all laid out nodes
        /// </summary>
        protected void calcRepulsion()
        {
            int vertexCount = vertexArray.Length;

            for (int i = 0; i < vertexCount; i++)
            {
                for (int j = i; j < vertexCount; j++)
                {
                    // Exits if the layout is no longer allowed to run
                    if (!allowedToRun)
                    {
                        return;
                    }

                    if (j != i)
                    {
                        double xDelta = cellLocation[i][0] - cellLocation[j][0];
                        double yDelta = cellLocation[i][1] - cellLocation[j][1];

                        if (xDelta == 0)
                        {
                            xDelta = 0.01 + random.NextDouble();
                        }

                        if (yDelta == 0)
                        {
                            yDelta = 0.01 + random.NextDouble();
                        }

                        // Distance between nodes
                        double deltaLength = Math.Sqrt((xDelta * xDelta)
                                + (yDelta * yDelta));

                        double deltaLengthWithRadius = deltaLength - radius[i]
                                - radius[j];

                        if (deltaLengthWithRadius < minDistanceLimit)
                        {
                            deltaLengthWithRadius = minDistanceLimit;
                        }

                        double force = forceConstantSquared / deltaLengthWithRadius;

                        double displacementX = (xDelta / deltaLength) * force;
                        double displacementY = (yDelta / deltaLength) * force;

                        if (isMoveable[i])
                        {
                            dispX[i] += displacementX;
                            dispY[i] += displacementY;
                        }

                        if (isMoveable[j])
                        {
                            dispX[j] -= displacementX;
                            dispY[j] -= displacementY;
                        }
                    }
                }
            }
        }

    }
}
