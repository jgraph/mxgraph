// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a 2-dimensional rectangle with double precision coordinates.
    /// </summary>
    public class mxRectangle : mxPoint
    {

        /// <summary>
        /// Holds the width. Default is 0.
        /// </summary>
        protected double width;

        /// <summary>
        /// Holds the height. Default is 0.
        /// </summary>
        protected double height;

        /// <summary>
        /// Constructs a new rectangle at (0, 0) with the width and height set to 0.
        /// </summary>
        public mxRectangle(): this(0, 0, 0, 0) {}

        /// <summary>
        /// Constructs a copy of the given rectangle.
        /// </summary>
        /// <param name="rect">Rectangle to construct a copy of.</param>
        public mxRectangle(mxRectangle rect)
            : this(rect.X, rect.Y, rect.Width, rect.Height) { }

        /// <summary>
        /// Constructs a copy of the given rectangle.
        /// </summary>
        /// <param name="rect">Rectangle to construct a copy of.</param>
        public mxRectangle(Rectangle rect)
            : this(rect.X, rect.Y, rect.Width, rect.Height) { }

        /// <summary>
        /// Constructs a rectangle using the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the new rectangle.</param>
        /// <param name="y">Y-coordinate of the new rectangle.</param>
        /// <param name="width">Width of the new rectangle.</param>
        /// <param name="height">Height of the new rectangle.</param>
        public mxRectangle(double x, double y, double width, double height): base(x, y)
        {
            Width = width;
            Height = height;
        }

        /// <summary>
        /// Sets or returns the width of the rectangle.
        /// </summary>
        public double Width
        {
            get { return width; }
            set { width = value; }
        }

        /// <summary>
        /// Sets or returns the height of the rectangle.
        /// </summary>
        public double Height
        {
            get { return height; }
            set { height = value; }
        }

        /// <summary>
        /// Sets this rectangle to the specified values
        /// </summary>
        public void setRect(double x, double y, double w, double h)
        {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        }

        /// <summary>
        /// Returns the x-coordinate of the center.
        /// </summary>
        /// <returns>Returns the x-coordinate of the center.</returns>
        public double GetCenterX()
        {
            return X + Width / 2;
        }

        /// <summary>
        /// Returns the y-coordinate of the center.
        /// </summary>
        /// <returns>Returns the y-coordinate of the center.</returns>
        public double GetCenterY()
        {
            return Y + Height / 2;
        }

        /// <summary>
        /// Adds the given rectangle to this rectangle.
        /// </summary>
        public void Add(mxRectangle rect)
        {
            if (rect != null)
            {
                double minX = Math.Min(x, rect.x);
                double minY = Math.Min(y, rect.y);
                double maxX = Math.Max(x + width, rect.x + rect.width);
                double maxY = Math.Max(y + height, rect.y + rect.height);

                x = minX;
                y = minY;
                width = maxX - minX;
                height = maxY - minY;
            }
        }

        /// <summary>
        /// Grows the rectangle by the given amount, that is, this method subtracts
        /// the given amount from the x- and y-coordinates and adds twice the amount
        /// to the width and height.
        /// </summary>
        /// <param name="amount">Amount by which the rectangle should be grown.</param>
        public void Grow(double amount)
        {
            x -= amount;
            y -= amount;
            width += 2 * amount;
            height += 2 * amount;
        }

        /// <summary>
        /// Returns true if this rectangle contains the given point (x, y).
        /// </summary>
        /// <param name="x">X-coordinate of the point.</param>
        /// <param name="y">Y-coordinate of the point.</param>
        /// <returns>Returns true if (x, y) lies within the given area.</returns>
        public bool Contains(double x, double y)
        {
            return (this.x <= x &&
                    this.x + width >= x &&
                    this.y <= y &&
                    this.y + height >= y);
        }

        /// <summary>
        /// Returns the bounds as a new rectangle.
        /// </summary>
        /// <returns>Returns a new rectangle for the bounds.</returns>
        public Rectangle GetRectangle()
        {
            int ix = (int)Math.Round(x);
            int iy = (int)Math.Round(y);
            int iw = (int)Math.Round(width - ix + x);
            int ih = (int)Math.Round(height - iy + y);

            return new Rectangle(ix, iy, iw, ih);
        }

        /// <summary>
        /// Returns true if the given object equals this rectangle.
        /// </summary>
        /// <returns>Returns true if obj is equal.</returns>
        new public Boolean Equals(Object obj)
        {
            if (obj is mxRectangle)
            {
                mxRectangle rect = (mxRectangle) obj;

                return rect.X == X &&
                    rect.Y == Y &&
                    rect.Width == Width &&
                    rect.Height == height;
            }

            return false;
        }

        /// <summary>
        /// Returns a new instance of the same rectangle.
        /// </summary>
        /// <returns>Returns a clone of the rectangle.</returns>
        new public mxRectangle Clone()
        {
            return new mxRectangle(this);
        }

    }

}
