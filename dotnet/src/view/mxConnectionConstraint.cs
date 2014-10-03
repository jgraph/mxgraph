// Copyright (c) 2007-2008, Gaudenz Alder
namespace com.mxgraph
{
    /// <summary>
    /// Defines an object that contains the constraints about how to connect one
    /// side of an edge to its terminal.
    /// </summary>
    public class mxConnectionConstraint
    {
        /// <summary>
        /// Point that specifies the fixed location of the connection point.
        /// </summary>
        protected mxPoint point;

        /// <summary>
        /// Boolean that specifies if the point should be projected onto the perimeter
        /// of the terminal.
        /// </summary>
        protected bool perimeter;

        /// <summary>
        /// Constructs an empty connection constraint.
        /// </summary>
        public mxConnectionConstraint() : this(null) { }

        /// <summary>
        /// Constructs a connection constraint for the given point.
        /// </summary>
        public mxConnectionConstraint(mxPoint point) : this(point, true) { }

        /// <summary>
        /// Constructs a new connection constraint for the given point and boolean
        /// arguments.
        /// </summary>
        /// <param name="point">Optional mxPoint that specifies the fixed location of the point
        /// in relative coordinates. Default is null.</param>
        /// <param name="perimeter">Optional boolean that specifies if the fixed point should be
        /// projected onto the perimeter of the terminal. Default is true.</param>
        public mxConnectionConstraint(mxPoint point, bool perimeter)
        {
            Point = point;
            Perimeter = perimeter;
        }

        /// <summary>
        /// Sets or returns the point.
        /// </summary>
        public mxPoint Point
        {
            get { return point; }
            set { point = value; }
        }

        /// <summary>
        /// Sets or returns perimeter.
        /// </summary>
        public bool Perimeter
        {
            get { return perimeter; }
            set { perimeter = value; }
        }

    }

}
