// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a 2-dimensional point with double precision coordinates.
    /// </summary>
    public class mxPoint
    {

        /// <summary>
        /// Holds the x-coordinate of the point. Default is 0.
        /// </summary>
        protected double x;

        /// <summary>
        /// Holds the y-coordinate of the point. Default is 0.
        /// </summary>
        protected double y;

        /// <summary>
        /// Constructs a new point at (0, 0).
        /// </summary>
        public mxPoint(): this(0, 0) {}

        /// <summary>
        /// Constructs a new point at the location of the given point.
        /// </summary>
        /// <param name="point">Point that specifies the location.</param>
        public mxPoint(Point point) : this(point.X, point.Y) { }

        /// <summary>
        /// Constructs a new point at the location of the given point.
        /// </summary>
        /// <param name="point">Point that specifies the location.</param>
        public mxPoint(mxPoint point): this(point.X, point.Y) {}

        /// <summary>
        /// Constructs a new point at (x, y).
        /// </summary>
        /// <param name="x">X-coordinate of the point to be created.</param>
        /// <param name="y">Y-coordinate of the point to be created.</param>
        public mxPoint(double x, double y)
        {
            X = x;
            Y = y;
        }

        /// <summary>
        /// Sets or returns the x-coordinate of the point.
        /// </summary>
        public double X
        {
            get { return x; }
            set { x = value; }
        }

        /// <summary>
        /// Sets or returns the y-coordinate of the point.
        /// </summary>
        public double Y
        {
            get { return y; }
            set { y = value; }
        }

        /// <summary>
        /// Returns the coordinates as a new point.
        /// </summary>
        /// <returns>Returns a new point for the location.</returns>
        public Point GetPoint()
        {
            return new Point((int) Math.Round(x), (int) Math.Round(y));
        }

        /// <summary>
        /// Returns true if the given object equals this point.
        /// </summary>
        /// <returns>Returns true if obj is equal.</returns>
        new public Boolean Equals(Object obj)
        {
            if (obj is mxPoint)
            {
                mxPoint pt = (mxPoint)obj;

                return pt.X == X &&
                    pt.Y == Y;
            }

            return false;
        }
        /// <summary>
        /// Returns a new instance of the same point.
        /// </summary>
        /// <returns>Returns a clone of the point.</returns>
        public mxPoint Clone()
        {
            return new mxPoint(this);
        }

    }

}
