// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Xml;
using System.Text;
using System.Drawing;
using System.Security.Cryptography;
using System.Windows.Forms;

namespace com.mxgraph
{
    /// <summary>
    /// Contains various helper methods for use with mxGraph.
    /// </summary>
    public class mxUtils
    {

        /// <summary>
        /// Returns the size of the given label.
        /// </summary>
        public static mxRectangle GetLabelSize(string label, Dictionary<string, Object> style, int width)
        {
            return GetSizeForString(label, GetFont(style), width);
        }

        /// <summary>
        /// Returns the paint bounds for the given label.
        /// </summary>
        /// <returns></returns>
        public static mxRectangle GetLabelPaintBounds(String label,
            Dictionary<string, Object> style, bool isHtml, mxPoint offset,
            mxRectangle vertexBounds, double scale)
        {
            bool horizontal = mxUtils.IsTrue(style, mxConstants.STYLE_HORIZONTAL, true);
            int w = 0;

            if (vertexBounds != null &&
                GetString(style, mxConstants.STYLE_WHITE_SPACE, "nowrap").Equals("wrap"))
            {
                if (horizontal)
                {
                    w = (int)(vertexBounds.Width / scale);
                }
                else
                {
                    w = (int)(vertexBounds.Height / scale);
                }
            }

            mxRectangle size = mxUtils.GetLabelSize(label, style, w);

            double x = offset.X;
            double y = offset.Y;
            double width = 0;
            double height = 0;

            if (vertexBounds != null)
            {
                x += vertexBounds.X;
                y += vertexBounds.Y;

                // Limits the label to the swimlane title
                if (mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "").Equals(
                    mxConstants.SHAPE_SWIMLANE))
                {
                    double start = mxUtils.GetDouble(style, mxConstants.STYLE_STARTSIZE,
                        mxConstants.DEFAULT_STARTSIZE) * scale;

                    if (horizontal)
                    {
                        width += vertexBounds.Width;
                        height += start;
                    }
                    else
                    {
                        width += start;
                        height += vertexBounds.Height;
                    }
                }
                else
                {
                    width += vertexBounds.Width;
                    height += vertexBounds.Height;
                }
            }

            return mxUtils.GetScaledLabelBounds(x, y,
                size, width, height, style, scale);
        }

        /// <summary>
        /// Returns the bounds for a label for the given location and size, taking
        /// into account the alignment and spacing in the specified style, as well
        /// as the width and height of the rectangle that contains the label.
        /// (For edge labels this width and height is 0.) The scale is used to scale
        /// the given size and the spacings in the specified style.
        /// </summary>
        public static mxRectangle GetScaledLabelBounds(double x, double y, mxRectangle size,
            double outerWidth, double outerHeight, Dictionary<string, Object> style, double scale)
        {
            // Adds an inset of 3 pixels
            double inset = mxConstants.LABEL_INSET* scale;

            // Scales the size of the label
            double width = size.Width * scale + 2 * inset;
            double height = size.Height * scale;

            // Gets the global spacing and orientation
            bool horizontal = IsTrue(style, mxConstants.STYLE_HORIZONTAL, true);
            int spacing = (int)(GetInt(style, mxConstants.STYLE_SPACING) * scale);

            // Gets the alignment settings
            Object align = GetString(style, mxConstants.STYLE_ALIGN,
                    mxConstants.ALIGN_CENTER);
            Object valign = GetString(style, mxConstants.STYLE_VERTICAL_ALIGN,
                    mxConstants.ALIGN_MIDDLE);

            // Gets the vertical spacing
            int top = (int)(GetInt(style, mxConstants.STYLE_SPACING_TOP) * scale);
            int bottom = (int)(GetInt(style,
                    mxConstants.STYLE_SPACING_BOTTOM) * scale);

            // Gets the horizontal spacing
            int left = (int)(GetInt(style, mxConstants.STYLE_SPACING_LEFT) * scale);
            int right = (int)(GetInt(style,
                    mxConstants.STYLE_SPACING_RIGHT) * scale);

            // Applies the orientation to the spacings
            if (!horizontal)
            {
                int tmp = top;
                top = right;
                right = bottom;
                bottom = left;
                left = tmp;

                double tmp2 = width;
                width = height;
                height = tmp2;
            }

            // Computes the position of the label for the horizontal alignment
            if ((horizontal && align.Equals(mxConstants.ALIGN_CENTER))
                    || (!horizontal && valign.Equals(mxConstants.ALIGN_MIDDLE)))
            {
                x += (outerWidth - width) / 2 + left - right;
            }
            else if ((horizontal && align.Equals(mxConstants.ALIGN_RIGHT))
                    || (!horizontal && valign.Equals(mxConstants.ALIGN_BOTTOM)))
            {
                x += outerWidth - width - spacing - right;
            }
            else
            {
                x += spacing + left;
            }

            // Computes the position of the label for the vertical alignment
            if ((!horizontal && align.Equals(mxConstants.ALIGN_CENTER))
                    || (horizontal && valign.Equals(mxConstants.ALIGN_MIDDLE)))
            {
                y += (outerHeight - height) / 2 + top - bottom;
            }
            else if ((!horizontal && align.Equals(mxConstants.ALIGN_LEFT))
                    || (horizontal && valign.Equals(mxConstants.ALIGN_BOTTOM)))
            {
                y += outerHeight - height - spacing - bottom;
            }
            else
            {
                y += spacing + top;
            }

            return new mxRectangle(x, y, width, height);
        }

        /// <summary>
        /// Returns the size of the given text.
        /// </summary>
        /// <param name="text">String whose size should be returned.</param>
        /// <param name="font">Specifies the font that should be used.</param>
        /// <returns>Returns the size of the given text.</returns>
        public static mxRectangle GetSizeForString(String text, Font font)
        {
            return GetSizeForString(text, font, 0);
        }

        /// <summary>
        /// Returns an mxRectangle with the size (width and height in pixels) of
        /// the given text.
        /// </summary>
        /// <param name="text">String whose size should be returned.</param>
        /// <param name="font">Specifies the font that should be used.</param>
        /// <param name="width">Specifies the width of the text block for word wrapping.</param>
        /// <returns>Returns the size of the given text.</returns>
        public static mxRectangle GetSizeForString(String text, Font font, int width)
        {
            TextFormatFlags flags = TextFormatFlags.Default;

            if (width > 0)
            {
                flags |= TextFormatFlags.WordBreak;
            }

            Size proposedSize = new Size(width, 0);
            Size result = TextRenderer.MeasureText(text, font, proposedSize, flags);

            return new mxRectangle(0, 0, result.Width, result.Height);
        }

        /// <summary>
        /// Converts the given degree to radians.
        /// </summary>
        public static double ToRadians(double deg)
        {
            return Math.PI * deg / 180.0;
        }

        /// <summary>
        /// Converts the given arc to a series of curves.
        /// </summary>
        /// <param name="x0"></param>
        /// <param name="y0"></param>
        /// <param name="r1"></param>
        /// <param name="r2"></param>
        /// <param name="angle"></param>
        /// <param name="largeArcFlag"></param>
        /// <param name="sweepFlag"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <returns></returns>
        public static double[] ArcToCurves(double x0, double y0, double r1, double r2, double angle, double largeArcFlag, double sweepFlag, double x, double y)
        {
            x -= x0;
            y -= y0;

            if (r1 == 0 || r2 == 0)
            {
                return new double[0];
            }

            double fS = sweepFlag;
            double psai = angle;
            r1 = Math.Abs(r1);
            r2 = Math.Abs(r2);
            double ctx = -x / 2;
            double cty = -y / 2;
            double cpsi = Math.Cos(psai * Math.PI / 180);
            double spsi = Math.Sin(psai * Math.PI / 180);
            double rxd = cpsi * ctx + spsi * cty;
            double ryd = -1 * spsi * ctx + cpsi * cty;
            double rxdd = rxd * rxd;
            double rydd = ryd * ryd;
            double r1x = r1 * r1;
            double r2y = r2 * r2;
            double lamda = rxdd / r1x + rydd / r2y;
            double sds;

            if (lamda > 1)
            {
                r1 = Math.Sqrt(lamda) * r1;
                r2 = Math.Sqrt(lamda) * r2;
                sds = 0;
            }
            else
            {
                double seif = 1;

                if (largeArcFlag == fS)
                {
                    seif = -1;
                }

                sds = seif * Math.Sqrt((r1x * r2y - r1x * rydd - r2y * rxdd) / (r1x * rydd + r2y * rxdd));
            }

            double txd = sds * r1 * ryd / r2;
            double tyd = -1 * sds * r2 * rxd / r1;
            double tx = cpsi * txd - spsi * tyd + x / 2;
            double ty = spsi * txd + cpsi * tyd + y / 2;
            double rad = Math.Atan2((ryd - tyd) / r2, (rxd - txd) / r1) - Math.Atan2(0, 1);
            double s1 = (rad >= 0) ? rad : 2 * Math.PI + rad;
            rad = Math.Atan2((-ryd - tyd) / r2, (-rxd - txd) / r1) - Math.Atan2((ryd - tyd) / r2, (rxd - txd) / r1);
            double dr = (rad >= 0) ? rad : 2 * Math.PI + rad;

            if (fS == 0 && dr > 0)
            {
                dr -= 2 * Math.PI;
            }
            else if (fS != 0 && dr < 0)
            {
                dr += 2 * Math.PI;
            }

            double sse = dr * 2 / Math.PI;
            int seg = (int)Math.Ceiling(sse < 0 ? -1 * sse : sse);
            double segr = dr / seg;
            double t = 8 / 3 * Math.Sin(segr / 4) * Math.Sin(segr / 4) / Math.Sin(segr / 2);
            double cpsir1 = cpsi * r1;
            double cpsir2 = cpsi * r2;
            double spsir1 = spsi * r1;
            double spsir2 = spsi * r2;
            double mc = Math.Cos(s1);
            double ms = Math.Sin(s1);
            double x2 = -t * (cpsir1 * ms + spsir2 * mc);
            double y2 = -t * (spsir1 * ms - cpsir2 * mc);
            double x3 = 0;
            double y3 = 0;

            double[] result = new double[seg * 6];

            for (int n = 0; n < seg; ++n)
            {
                s1 += segr;
                mc = Math.Cos(s1);
                ms = Math.Sin(s1);

                x3 = cpsir1 * mc - spsir2 * ms + tx;
                y3 = spsir1 * mc + cpsir2 * ms + ty;
                double dx = -t * (cpsir1 * ms + spsir2 * mc);
                double dy = -t * (spsir1 * ms - cpsir2 * mc);

                // CurveTo updates x0, y0 so need to restore it
                int index = n * 6;
                result[index] = x2 + x0;
                result[index + 1] = y2 + y0;
                result[index + 2] = x3 - dx + x0;
                result[index + 3] = y3 - dy + y0;
                result[index + 4] = x3 + x0;
                result[index + 5] = y3 + y0;

                x2 = x3 + dx;
                y2 = y3 + dy;
            }

            return result;
        }

        /// <summary>
        /// Returns the bounding box of the rotated rectangle.
        /// </summary>
        public static mxRectangle GetBoundingBox(mxRectangle rect, double rotation)
        {
            // TODO: Check use of GraphicsPath (see mxGdiCanvas.DrawText)
            mxRectangle result = null;

            if (rect != null && rotation != 0)
            {
                double rad = ToRadians(rotation);
                double cos = Math.Cos(rad);
                double sin = Math.Sin(rad);

                mxPoint cx = new mxPoint(rect.X + rect.Width / 2,
                    rect.Y + rect.Height / 2);

                mxPoint p1 = new mxPoint(rect.X, rect.Y);
                mxPoint p2 = new mxPoint(rect.X + rect.Width, rect.Y);
                mxPoint p3 = new mxPoint(p2.X, rect.Y + rect.Height);
                mxPoint p4 = new mxPoint(rect.X, p3.Y);

                p1 = GetRotatedPoint(p1, cos, sin, cx);
                p2 = GetRotatedPoint(p2, cos, sin, cx);
                p3 = GetRotatedPoint(p3, cos, sin, cx);
                p4 = GetRotatedPoint(p4, cos, sin, cx);

                result = new mxRectangle((int)p1.X, (int)p1.Y, 0,
                        0);
                result.Add(new mxRectangle(p2.X, p2.Y, 0, 0));
                result.Add(new mxRectangle(p3.X, p3.Y, 0, 0));
                result.Add(new mxRectangle(p4.X, p4.Y, 0, 0));
            }

            return result;
        }

        /// <summary>
        /// Rotates the given point by the given cos and sin.
        /// </summary>
        public static mxPoint GetRotatedPoint(mxPoint pt, double cos, double sin)
        {
            return GetRotatedPoint(pt, cos, sin, new mxPoint());
        }

        /// <summary>
        /// Rotates the given point by the given cos and sin.
        /// </summary>
        public static mxPoint GetRotatedPoint(mxPoint pt, double cos, double sin,
                mxPoint c)
        {
            double x = pt.X - c.X;
            double y = pt.Y - c.Y;

            double x1 = x * cos - y * sin;
            double y1 = y * cos + x * sin;

            return new mxPoint(x1 + c.X, y1 + c.Y);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="g"></param>
        /// <param name="brush"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        public static void FillClippedRect(Graphics g, Brush brush, int x, int y, int width, int height)
        {
		    RectangleF bg = new RectangleF(x, y, width, height);

		    if (g.ClipBounds != null)
		    {
                bg.Intersect(g.ClipBounds);
		    }

		    g.FillRectangle(brush, bg.X, bg.Y, bg.Width, bg.Height);
        }

        /// <summary>
        /// Creates an image for the given parameters.
        /// </summary>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="background"></param>
        /// <returns></returns>
        public static Image CreateImage(int width, int height, Color? background)
        {
            Image image = new Bitmap(width, height);
            Graphics g = Graphics.FromImage(image);

            if (background != null)
            {
                g.FillRectangle(new SolidBrush((Color)background),
                        0, 0, width, height);
            }
            else
            {
                g.Clear(Color.Transparent);
            }

            return image;
        }

        /// <summary>
        /// Creates a new list of new points obtained by translating the points in
        /// the given list by the given vector. Elements that are not mxPoints are
        /// added to the result as-is.
        /// </summary>
        /// <param name="pts"></param>
        /// <param name="dx"></param>
        /// <param name="dy"></param>
        /// <returns></returns>
        public static List<mxPoint> TranslatePoints(List<mxPoint> pts, double dx, double dy)
	    {
		    List<mxPoint> result = null;

		    if (pts != null)
		    {
                result = new List<mxPoint>(pts.Count);

                foreach (mxPoint point in pts)
                {
                    mxPoint pt = point.Clone();

                    pt.X += dx;
                    pt.Y += dy;

                    result.Add(pt);
                }
		    }

		    return result;
	    }

        /// <summary>
        /// Returns the intersection of two lines as an mxPoint.
        /// </summary>
        /// <param name="x0">X-coordinate of the first line's startpoint.</param>
        /// <param name="y0">Y-coordinate of the first line's startpoint.</param>
        /// <param name="x1">X-coordinate of the first line's endpoint.</param>
        /// <param name="y1">Y-coordinate of the first line's endpoint.</param>
        /// <param name="x2">X-coordinate of the second line's startpoint.</param>
        /// <param name="y2">Y-coordinate of the second line's startpoint.</param>
        /// <param name="x3">X-coordinate of the second line's endpoint.</param>
        /// <param name="y3">Y-coordinate of the second line's endpoint.</param>
        /// <returns></returns>
        public static mxPoint Intersection(double x0, double y0, double x1,
                double y1, double x2, double y2, double x3, double y3)
        {
            double denom = ((y3 - y2) * (x1 - x0)) - ((x3 - x2) * (y1 - y0));
            double nume_a = ((x3 - x2) * (y0 - y2)) - ((y3 - y2) * (x0 - x2));
            double nume_b = ((x1 - x0) * (y0 - y2)) - ((y1 - y0) * (x0 - x2));

            double ua = nume_a / denom;
            double ub = nume_b / denom;

            if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0)
            {
                // Get the intersection point
                double intersectionX = x0 + ua * (x1 - x0);
                double intersectionY = y0 + ua * (y1 - y0);

                return new mxPoint(intersectionX, intersectionY);
            }

            // No intersection
            return null;
        }

        /// <summary>
        /// Returns the stylename in a style of the form stylename[;key=value] or an
        /// empty string if the given style does not contain a stylename.
        /// </summary>
        /// <param name="style">String of the form stylename[;key=value].</param>
        /// <returns>Returns the stylename from the given formatted string.</returns>
        public static String GetStylename(String style)
        {
            if (style != null)
            {
                String[] pairs = style.Split(';');
                String stylename = pairs[0];

                if (stylename.IndexOf("=") < 0)
                {
                    return stylename;
                }
            }

            return "";
        }

        /// <summary>
        /// Returns the stylenames in a style of the form stylename[;key=value] or an
        /// empty array if the given style does not contain any stylenames.
        /// </summary>
        /// <param name="style">String of the form stylename[;stylename][;key=value].</param>
        /// <returns>Returns the stylename from the given formatted string.</returns>
        public static String[] GetStylenames(String style)
        {
            ArrayList result = new ArrayList();

            if (style != null)
            {
                String[] pairs = style.Split(';');

                for (int i = 0; i < pairs.Length; i++)
                {
                    if (pairs[i].IndexOf("=") < 0)
                    {
                        result.Add(pairs[i]);
                    }
                }
            }

            return (String[]) result.ToArray();
        }

        /// <summary>
        /// Returns the index of the given stylename in the given style. This
        /// returns -1 if the given stylename does not occur (as a stylename) in the
        /// given style, otherwise it returns the index of the first character.
        /// </summary>
        /// <param name="style"></param>
        /// <param name="stylename"></param>
        /// <returns></returns>
        public static int IndexOfStylename(String style, String stylename)
        {
            if (style != null && stylename != null)
            {
                String[] tokens = style.Split(';');
                int pos = 0;

                for (int i = 0; i < tokens.Length; i++)
                {
                    if (tokens[i].Equals(stylename))
                    {
                        return pos;
                    }

                    pos += tokens[i].Length + 1;
                }
            }

            return -1;
        }

        /// <summary>
        /// Adds the specified stylename to the given style if it does not already
        /// contain the stylename.
        /// </summary>
        /// <param name="style"></param>
        /// <param name="stylename"></param>
        /// <returns></returns>
        public String AddStylename(String style, String stylename)
        {
            if (IndexOfStylename(style, stylename) < 0)
            {
                if (style == null)
                {
                    style = "";
                }
                else if (style.Length > 0 && style[style.Length] != ';')
                {
                    style += ';';
                }

                style += stylename;
            }

            return style;
        }

        /// <summary>
        /// Removes all occurrences of the specified stylename in the given style
        /// and returns the updated style.
        /// </summary>
        /// <param name="style"></param>
        /// <param name="stylename"></param>
        /// <returns></returns>
        public String RemoveStylename(String style, String stylename)
        {
            StringBuilder buffer = new StringBuilder();

            if (style != null)
            {
                String[] tokens = style.Split(';');

                for (int i = 0; i < tokens.Length; i++)
                {
                    if (!tokens[i].Equals(stylename))
                    {
                        buffer.Append(tokens[i] + ";");
                    }
                }
            }

            String result = buffer.ToString();

            return (result.Length > 1) ? result.Substring(0, result.Length - 1)
                    : result;
        }

        /// <summary>
        /// Removes all stylenames from the given style and returns the updated
        /// style.
        /// </summary>
        /// <param name="style"></param>
        /// <returns></returns>
        public static String RemoveAllStylenames(String style)
        {
            StringBuilder buffer = new StringBuilder();

            if (style != null)
            {
                String[] tokens = style.Split(';');

                for (int i = 0; i < tokens.Length; i++)
                {
                    if (tokens[i].IndexOf('=') >= 0)
                    {
                        buffer.Append(tokens[i] + ";");
                    }
                }
            }

            String result = buffer.ToString();

            return (result.Length > 1) ? result.Substring(0, result.Length - 1)
                    : result;
        }

        /// <summary>
        /// Assigns the value for the given key in the styles of the given cells, or
        /// removes the key from the styles if the value is null.
        /// </summary>
        /// <param name="model">Model to execute the transaction in.</param>
        /// <param name="cells">Array of cells to be updated.</param>
        /// <param name="key">Key of the style to be changed.</param>
        /// <param name="value">New value for the given key.</param>
        public static void SetCellStyles(mxIGraphModel model, Object[] cells, String key, String value)
        {
            if (cells != null && cells.Length > 0)
            {
                model.BeginUpdate();
                try
                {
                    for (int i = 0; i < cells.Length; i++)
                    {
                        if (cells[i] != null)
                        {
                            String style = SetStyle(
                                model.GetStyle(cells[i]),
                                key, value);
                            model.SetStyle(cells[i], style);
                        }
                    }
                }
                finally
                {
                    model.EndUpdate();
                }
            }
        }

        /// <summary>
        /// Adds or removes the given key, value pair to the style and returns the
        /// new style. If value is null or zero length then the key is removed from
        /// the style.
        /// </summary>
        /// <param name="style">String of the form stylename[;key=value].</param>
        /// <param name="key">Key of the style to be changed.</param>
        /// <param name="value">New value for the given key.</param>
        /// <returns>Returns the new style.</returns>
        public static String SetStyle(String style, String key, String value)
        {
            bool isValue = value != null && value.Length > 0;

            if (style == null || style.Length == 0)
            {
                if (isValue)
                {
                    style = key + "=" + value;
                }
            }
            else
            {
                int index = style.IndexOf(key + "=");

                if (index < 0)
                {
                    String sep = (style.EndsWith(";")) ? "" : ";";

                    if (isValue)
                    {
                        style = style + sep + key + '=' + value;
                    }
                    else
                    {
                        style = style + sep + key + "=0";
                    }
                }
                else
                {
                    String tmp = (isValue) ? key + "=" + value : "";
                    int cont = style.IndexOf(";", index);

                    if (!isValue)
                    {
                        cont++;
                    }

                    style = style.Substring(0, index) + tmp +
                        ((cont > index) ? style.Substring(cont) : "");
                }
            }

            return style;
        }

        /// <summary>
        /// Sets or toggles the flag bit for the given key in the cell's styles.
        /// If value is null then the flag is toggled.
        /// </summary>
        /// <param name="model">Model that contains the cells.</param>
        /// <param name="cells">Array of cells to change the style for.</param>
        /// <param name="key">Key of the style to be changed.</param>
        /// <param name="flag">Integer for the bit to be changed.</param>
        /// <param name="value">Optional boolean value for the flag.</param>
        public static void SetCellStyleFlags(mxIGraphModel model, Object[] cells, String key, int flag, Boolean value)
        {
            if (cells != null && cells.Length > 0)
            {
                model.BeginUpdate();

                try
                {
                    for (int i = 0; i < cells.Length; i++)
                    {
                        if (cells[i] != null)
                        {
                            String style = SetStyleFlag(
                                model.GetStyle(cells[i]),
                                key, flag, value);
                            model.SetStyle(cells[i], style);
                        }
                    }
                }
                finally
                {
                    model.EndUpdate();
                }
            }
        }

        /// <summary>
        /// Sets or removes the given key from the specified style and returns the
        /// new style. If value is null then the flag is toggled.
        /// </summary>
        /// <param name="style">String of the form stylename[;key=value].</param>
        /// <param name="key">Key of the style to be changed.</param>
        /// <param name="flag">Integer for the bit to be changed.</param>
        /// <param name="value">Optional boolean value for the given flag.</param>
        /// <returns>Returns the new style.</returns>
        public static String SetStyleFlag(String style, String key, int flag, bool? value)
        {
            if (style == null || style.Length == 0)
            {
                if (value == null || (bool)value)
                {
                    style = key + "=" + flag;
                }
                else
                {
                    style = key + "=0";
                }
            }
            else
            {
                int index = style.IndexOf(key + '=');

                if (index < 0)
                {
                    if (value == null || (bool) value)
                    {
                        String sep = (style.EndsWith(";")) ? "" : ";";
                        style = style + sep + key + "=" + flag;
                    }
                }
                else
                {
                    int cont = style.IndexOf(";", index);
                    String tmp = "";
                    int result = 0;

                    if (cont < 0)
                    {
                        tmp = style.Substring(index + key.Length + 1);
                    }
                    else
                    {
                        tmp = style.Substring(index + key.Length + 1, cont);
                    }

                    if (value == null)
                    {
                        result = int.Parse(tmp) ^ flag;
                    }
                    else if ((bool) value)
                    {
                        result = int.Parse(tmp) | flag;
                    }
                    else
                    {
                        result = int.Parse(tmp) & ~flag;
                    }

                    style = style.Substring(0, index) + key + "=" + result +
                        ((cont >= 0) ? style.Substring(cont) : "");

                }
            }

            return style;
        }

        /// <summary>
        /// Returns true if the dictionary contains true for the given key or
        /// false if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the boolean value for key in dict.</returns>
        public static bool IsTrue(Dictionary<string, Object> dict, string key)
        {
            return IsTrue(dict, key, false);
        }

        /// <summary>
        /// Returns true if the dictionary contains true for the given key or the
        /// given default value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the boolean value for key in dict.</returns>
        public static bool IsTrue(Dictionary<string, Object> dict, string key, bool defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                return value.Equals("1") || value.ToString().ToLower().Equals("true");
            }
        }

        /// <summary>
        /// Returns the value for key in dictionary as an int or 0 if no value is
        /// defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the integer value for key in dict.</returns>
        public static int GetInt(Dictionary<string, Object> dict, string key)
        {
            return GetInt(dict, key, 0);
        }

        /// <summary>
        /// Returns the value for key in dictionary as an int or the given default
        /// value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the integer value for key in dict.</returns>
        public static int GetInt(Dictionary<string, Object> dict, string key, int defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                return int.Parse(value.ToString());
            }
        }

        /// <summary>
        /// Returns the value for key in dictionary as a float or 0 if no value is
        /// defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the float value for key in dict.</returns>
        public static float GetFloat(Dictionary<string, Object> dict, string key)
        {
            return GetFloat(dict, key, 0);
        }

        /// <summary>
        /// Returns the value for key in dictionary as a float or the given default
        /// value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the float value for key in dict.</returns>
        public static float GetFloat(Dictionary<string, Object> dict, string key, float defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                return float.Parse(value.ToString());
            }
        }

        /// <summary>
        /// Returns the value for key in dictionary as a double or 0 if no value is
        /// defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the double value for key in dict.</returns>
        public static double GetDouble(Dictionary<string, Object> dict, string key)
        {
            return GetDouble(dict, key, 0);
        }

        /// <summary>
        /// Returns the value for key in dictionary as a double or the given default
        /// value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the double value for key in dict.</returns>
        public static double GetDouble(Dictionary<string, Object> dict, string key, double defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                return double.Parse(value.ToString());
            }
        }

        /// <summary>
        /// Returns the value for key in dictionary as a string or null if no value
        /// is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the string value for key in dict.</returns>
        public static string GetString(Dictionary<string, Object> dict, string key)
        {
            return GetString(dict, key, null);
        }

        /// <summary>
        /// Returns the value for key in dictionary as a string or the given default
        /// value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the string value for key in dict.</returns>
        public static string GetString(Dictionary<string, Object> dict, string key, string defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                return value.ToString();
            }
        }

        /// <summary>
        /// Returns the value for key in dictionary as a color or null if no value
        /// is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <returns>Returns the color value for key in dict.</returns>
        public static Color? GetColor(Dictionary<string, Object> dict, string key)
        {
            return GetColor(dict, key, null);
        }

        /// <summary>
        /// Returns the value for key in dictionary as a color or the given default
        /// value if no value is defined for the key.
        /// </summary>
        /// <param name="dict">Dictionary that contains the key, value pairs.</param>
        /// <param name="key">Key whose value should be returned.</param>
        /// <param name="defaultValue">Default value to return if the key is undefined.</param>
        /// <returns>Returns the color value for key in dict.</returns>
        public static Color? GetColor(Dictionary<string, Object> dict, string key, Color? defaultValue)
        {
            object value = null;
            dict.TryGetValue(key, out value);

            if (value == null)
            {
                return defaultValue;
            }
            else
            {
                if (value.ToString().Equals("none"))
                {
                    return null;
                }

                return ColorTranslator.FromHtml(value.ToString());
            }
        }

        /// <summary>
        /// 
        /// 
        /// </summary>
        /// <param name="style"></param>
        /// <returns></returns>
        public static Font GetFont(Dictionary<string, Object> style)
        {
            return GetFont(style, 1);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="style"></param>
        /// <param name="scale"></param>
        /// <returns></returns>
        public static Font GetFont(Dictionary<string, Object> style, double scale)
        {
            float fontSize = (float)(GetDouble(style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE) * scale);
            string fontFamily = GetString(style, mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
            int fontStyle = GetInt(style, mxConstants.STYLE_FONTSTYLE);

            FontStyle tmp = ((fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) ? FontStyle.Bold
                : FontStyle.Regular;
            tmp |= ((fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) ? FontStyle.Italic
                : FontStyle.Regular;
            tmp |= ((fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) ? FontStyle.Underline
                : FontStyle.Regular;

            return new Font(fontFamily, (float)(fontSize * mxConstants.FONT_SIZEFACTOR), tmp);
        }

        /// <summary>
        /// Creates a new StringFormat object for the given style.
        /// </summary>
        /// <param name="style"></param>
        /// <returns></returns>
        public static StringFormat GetStringFormat(Dictionary<string, Object> style)
        {
            StringFormat format = new StringFormat(StringFormatFlags.NoClip);
            format.Trimming = StringTrimming.None;

            // This is not required as the rectangle for the text will take this flag into account.
            // However, we want to avoid any possible word-wrap unless explicitely specified.
            if (!mxUtils.GetString(style, mxConstants.STYLE_WHITE_SPACE, "").Equals("wrap"))
            {
                format.FormatFlags |= StringFormatFlags.NoWrap;
            }

            // Sets the horizontal alignment
            string align = GetString(style, mxConstants.STYLE_ALIGN);

            if (align == null || align.Equals(mxConstants.ALIGN_CENTER))
            {
                format.Alignment = StringAlignment.Center;
            }
            else if (align.Equals(mxConstants.ALIGN_LEFT))
            {
                format.Alignment = StringAlignment.Near;
            }
            else if (align.Equals(mxConstants.ALIGN_RIGHT))
            {
                format.Alignment = StringAlignment.Far;
            }

            // Sets the vertical alignment
            string vAlign = GetString(style, mxConstants.STYLE_VERTICAL_ALIGN);

            if (vAlign == null || vAlign.Equals(mxConstants.ALIGN_MIDDLE))
            {
                format.LineAlignment = StringAlignment.Center;
            }
            else if (vAlign.Equals(mxConstants.ALIGN_TOP))
            {
                format.LineAlignment = StringAlignment.Near;
            }
            else if (vAlign.Equals(mxConstants.ALIGN_BOTTOM))
            {
                format.LineAlignment = StringAlignment.Far;
            }

            return format;
        }

        /// <summary>
        /// Reads the given filename into a string.
        /// </summary>
        /// <param name="filename">Name of the file to be read.</param>
        /// <returns>Returns a string representing the file contents.</returns>
        public static string ReadFile(string filename)
        {
            return File.ReadAllText(filename);
        }

        /// <summary>
        /// Returns the Md5 hash for the given text.
        /// </summary>
        /// <param name="text">String whose Md5 hash should be returned.</param>
        /// <returns>Returns the Md5 hash for the given text.</returns>
        public static string GetMd5Hash(string text)
        {
            MD5 md5Hasher = new MD5CryptoServiceProvider();
            byte[] data = md5Hasher.ComputeHash(Encoding.ASCII.GetBytes(text));

            return Convert.ToBase64String(data);
        }

        /// <summary>
        /// Returns true if the given value is an XML node with the specified nodename.
        /// specified.
        /// </summary>
        /// <param name="value">Object that represents the value to be tested.</param>
        /// <param name="nodeName">String that specifies the node name.</param>
        /// <returns>Returns true if the node name of the user object is equal to the
        /// given type.</returns>
        public static bool IsNode(Object value, String nodeName)
        {
            return IsNode(value, nodeName, null, null);
        }

        /// <summary>
        /// Returns true if the user object is an XML node with the specified type
        /// and and the optional attribute has the specified value or is not
        /// specified.
        /// </summary>
        /// <param name="value">Object that represents the value to be tested.</param>
        /// <param name="nodeName">String that specifies the node name.</param>
        /// <param name="attributeName">Optional attribute name to check.</param>
        /// <param name="attributeValue">Optional attribute value to check.</param>
        /// <returns>Returns true if the cell matches the given conditions.</returns>
        public static bool IsNode(Object value, String nodeName, String attributeName, String attributeValue)
        {
            if (value is XmlElement)
            {
                XmlElement element = (XmlElement)value;

                if (String.Compare(element.Name, attributeName, true) == 0)
                {
                    return attributeName == null ||
                        String.Compare(element.GetAttribute(attributeName),
                        attributeValue, true) == 0;
                }
            }

            return false;
        }

        /// <summary>
        /// Loads an image from the local filesystem, a data URI or any other URL.
        /// </summary>
        public static Image LoadImage(String url)
        {
            Image img = null;

            if (url != null)
            {
                try
                {
                    img = Image.FromFile(url);
                }
                catch (Exception)
                {
                    Stream stream = null;

                    // Parses data URIs of the form data:image/format;base64,xxx
                    if (url.StartsWith("data:image/"))
                    {
                        int comma = url.IndexOf(',');
                        byte[] data = Convert.FromBase64String(url.Substring(comma + 1));
                        stream = new MemoryStream(data);
                    }
                    else
                    {
                        try
                        {
                            WebClient wc = new WebClient();
                            stream = wc.OpenRead(url);
                        }
                        catch (Exception)
                        {
                            // ignore
                        }
                    }

                    if (stream != null)
                    {
                        try
                        {
                            img = Image.FromStream(stream);
                        }
                        catch (Exception e)
                        {
                            // ignore
                        }
                    }
                }
            }

            return img;
        }

        /// <summary>
        /// Returns a new, empty DOM document. External entities and DTDs are ignored.
        /// </summary>
        /// <returns>Returns a new DOM document.</returns>
        public static XmlDocument CreateDocument()
        {
            XmlDocument document = new XmlDocument();

            document.XmlResolver = null;

            return document;
        }

        /// <summary>
        /// Returns a new DOM document for the given URI.
        /// </summary>
        /// <param name="uri">URI to parse into the document.</param>
        /// <returns>Returns a new DOM document for the given URI.</returns>
        public static XmlDocument LoadDocument(string uri)
        {
            XmlDocument doc = CreateDocument();
            doc.Load(uri);

            return doc;
        }

        /// <summary>
        /// Returns a document that represents the given XML string.
        /// </summary>
        /// <param name="xml">String that contains the XML markup.</param>
        /// <returns>Returns an XML document.</returns>
        public static XmlDocument ParseXml(string xml)
        {
            XmlDocument doc = CreateDocument();
            doc.LoadXml(xml);

            return doc;
        }

        /// <summary>
        /// Returns the first node where attr equals value.
        /// This implementation does not use XPath.
        /// </summary>
        public static XmlNode FindNode(XmlNode node, String attr, String value)
	    {
            Object tmp = node.Attributes[attr];
    		
		    if (tmp != null &&
			    tmp.ToString().Equals(value))
		    {
			    return node;
		    }
    		
		    node = node.FirstChild;
    		
		    while (node != null)
		    {
			    XmlNode result = FindNode(node, attr, value);
    			
			    if (result != null)
			    {
				    return result;
			    }
    			
			    node = node.NextSibling;
		    }
    		
		    return null;
	    }

        /// <summary>
        /// Evaluates a Java expression to a class member using mxCodecRegistry.
        /// The range of supported expressions is limited to static class
        /// members such as mxEdgeStyle.ElbowConnector.
        /// </summary>
        /// <param name="expression"></param>
        /// <returns></returns>
        public static Object Eval(string expression)
        {
            int dot = expression.LastIndexOf(".");

            if (dot > 0)
            {
                Type type = mxCodecRegistry.GetTypeForName(expression.Substring(0, dot));

                if (type != null)
                {
                    try
                    {
                        return type.GetField(expression.Substring(dot + 1)).GetValue(null);
                    }
                    catch (Exception e)
                    {
                        Trace.WriteLine("mxUtils.Eval(" + expression + "): " + e.Message);
                    }
                }
            }

            return expression;
        }

        /// <summary>
        /// Converts the ampersand, quote, prime, less-than and greater-than characters
        /// to their corresponding HTML entities in the given string.
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static String HtmlEntities(String text)
        {
            return text.Replace("&", "&amp;").Replace("\"", "&quot;")
                    .Replace("'", "&prime;").Replace("<", "&lt;").Replace(
                            ">", "&gt;");
        }

        /// <summary>
        /// Returns a string that represents the given node.
        /// </summary>
        /// <param name="node">Node to return the XML for.</param>
        /// <returns>Returns an XML string.</returns>
        public static string GetXml(XmlNode node)
        {
            return GetXml(node, Formatting.None);
        }

        /// <summary>
        /// Returns a pretty-printed XML string for the given node.
        /// </summary>
        /// <param name="node">Node to return the XML for.</param>
        /// <returns>Returns a formatted XML string.</returns>
        public static string GetPrettyXml(XmlNode node)
        {
            return GetXml(node, Formatting.Indented);
        }

        /// <summary>
        /// Returns a pretty-printed XML string for the given node.
        /// </summary>
        /// <param name="node">Node to return the XML for.</param>
        /// <param name="formatting">Formatting of the string to be returned.</param>
        /// <returns>Returns a formatted XML string.</returns>
        public static string GetXml(XmlNode node, Formatting formatting)
        {
            StringWriter stringWriter = new StringWriter();
            XmlTextWriter xmlTextWriter = new XmlTextWriter(stringWriter);

            xmlTextWriter.Formatting = formatting;
            node.WriteTo(xmlTextWriter);
            xmlTextWriter.Flush();

            return stringWriter.ToString();
        }

    }

}
