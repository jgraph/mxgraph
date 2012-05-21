// $Id: mxICanvas2D.cs,v 1.4 2012-04-24 13:56:56 gaudenz Exp $
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
    public interface mxICanvas2D
    {
        /// <summary>
        /// Saves the current state of the canvas.
        /// </summary>
        void Save();

        /// <summary>
        /// Restores the previous state of the canvas.
        /// </summary>
        void Restore();

        /// <summary>
        /// Uniformaly scales the canvas by the given amount.
        /// </summary>
        /// <param name="value">The new scale value.</param>
        void Scale(double value);

        /// <summary>
        /// Translates the canvas by the given amount.
        /// </summary>
        /// <param name="dx">X-coordinate of the translation.</param>
        /// <param name="dy">Y-coordinate of the translation.</param>
        void Translate(double dx, double dy);

        /// <summary>
        /// Rotates the canvas by the given angle around the given center. This
        /// method may add rendering overhead and should be used with care.
        /// </summary>
        /// <param name="theta">Rotation angle in degrees (0 - 360).</param>
        /// <param name="flipH">Specifies if drawing should be flipped horizontally.</param>
        /// <param name="flipV">Specifies if drawing should be flipped vertically.</param>
        /// <param name="cx">X-coordinate of the center point.</param>
        /// <param name="cy">Y-coordinate of the center point.</param>
        void Rotate(double theta, bool flipH, bool flipV, double cx, double cy);

        /// <summary>
        /// Sets the stroke width. This should default to 1 if unset.
        /// </summary>
        double StrokeWidth
        {
            set;
        }

        /// <summary>
        /// Sets the stroke color. This should default to mxConstants.NONE if unset.
        /// </summary>
        string StrokeColor
        {
            set;
        }

        /// <summary>
        /// Sets the dashed state. This should default to false if unset.
        /// </summary>
        bool Dashed
        {
            set;
        }

        /// <summary>
        /// Sets the dash pattern. This should default to "3 3" if unset.
        /// </summary>
        string DashPattern
        {
            set;
        }

        /// <summary>
        /// Sets the linecap. This should default to "flat" if unset.
        /// </summary>
        string LineCap
        {
            set;
        }

        /// <summary>
        /// Sets the linejoin. This should default to "miter" if unset.
        /// </summary>
        string LineJoin
        {
            set;
        }

        /// <summary>
        /// Sets the miterlimit. This should default to 10 if unset.
        /// </summary>
        double MiterLimit
        {
            set;
        }

        /// <summary>
        /// Default value mxConstants.DEFAULT_FONTSIZE.
        /// </summary>
        double FontSize
        {
            set;
        }

        /// <summary>
        /// Default value "#000000".
        /// </summary>
        string FontColor
        {
            set;
        }

        /// <summary>
        /// Default value {@link mxConstants#DEFAULT_FONTFAMILY}.
        /// </summary>
        string FontFamily
        {
            set;
        }

        /// <summary>
        /// Default value 0. See {@link mxConstants#STYLE_FONTSTYLE}.
        /// </summary>
        int FontStyle
        {
            set;
        }

        /// <summary>
        /// Default value 1. This method may add rendering overhead and should be
        /// used with care.
        /// </summary>
        double Alpha
        {
            set;
        }

        /// <summary>
        /// Default value {@link mxConstants#NONE}.
        /// </summary>
        string FillColor
        {
            set;
        }

        /// <summary>
        /// Prepares the canvas to draw a gradient.
        /// </summary>
        void SetGradient(string color1, string color2, double x, double y,
                double w, double h, string direction);

        /// <summary>
        /// Prepares the canvas to draw a glass gradient.
        /// </summary>
        void SetGlassGradient(double x, double y, double w, double h);

        /// <summary>
        /// Next fill or stroke should draw a rectangle.
        /// </summary>
        void Rect(double x, double y, double w, double h);

        /// <summary>
        /// Next fill or stroke should draw a round rectangle.
        /// </summary>
        void Roundrect(double x, double y, double w, double h, double dx, double dy);

        /// <summary>
        /// Next fill or stroke should draw an ellipse.
        /// </summary>
        void Ellipse(double x, double y, double w, double h);

        /// <summary>
        /// Draws the given image.
        /// </summary>
        void Image(double x, double y, double w, double h, string src,
                bool aspect, bool flipH, bool flipV);

        /// <summary>
        /// Draws the given string. Possible values for format are empty string for
        // plain text and html for HTML markup.
        /// </summary>
        void Text(double x, double y, double w, double h, string str, string align,
                string valign, bool vertical, bool wrap, string format);

        /// <summary>
        /// Begins a new path.
        /// </summary>
        void Begin();

        /// <summary>
        /// Moves to the given path.
        /// </summary>
        void MoveTo(double x, double y);

        /// <summary>
        /// Draws a line to the given path.
        /// </summary>
        void LineTo(double x, double y);

        /// <summary>
        /// Draws a quadratic curve to the given point.
        /// </summary>
        void QuadTo(double x1, double y1, double x2, double y2);

        /// <summary>
        /// Draws a bezier curve to the given point.
        /// </summary>
        void CurveTo(double x1, double y1, double x2, double y2, double x3,
                double y3);

        /// <summary>
        /// Closes the current path.
        /// </summary>
        void Close();

        /// <summary>
        /// Paints the outline of the current path.
        /// </summary>
        void Stroke();

        /// <summary>
        /// Fills the current path.
        /// </summary>
        void Fill();

        /// <summary>
        /// Fills and paints the outline of the current path.
        /// </summary>
        void FillAndStroke();

        /// <summary>
        /// Paints the current path as a shadow.
        /// </summary>
        void Shadow(string value, bool filled);

        /// <summary>
        /// Uses the current path for clipping.
        /// </summary>
        void Clip();

    }

}
