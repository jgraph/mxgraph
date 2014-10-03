// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// An abstract converter that renders display XML data onto a canvas.
    /// </summary>
    public abstract class mxGraphViewReader
    {

        /// <summary>
        /// Holds the canvas to be used for rendering the graph.
        /// </summary>
        protected mxICanvas canvas;

        /// <summary>
        /// Holds the global scale of the graph. This is set just before
        /// createCanvas is called.
        /// </summary>
        protected double scale = 1;

        /// <summary>
        /// Constructs a new graph view reader.
        /// </summary>
        public mxGraphViewReader(): this(null) { }

        /// <summary>
        /// Constructs a new graph view reader and reads the given display XML data.
        /// </summary>
        /// <param name="reader">Reader that represents the display XML data.</param>
        public mxGraphViewReader(XmlReader reader)
        {
            Read(reader);
        }

        /// <summary>
        /// Returns the canvas to be used for rendering.
        /// </summary>
        /// <param name="attrs">Specifies the attributes of the new canvas.</param>
        /// <returns>Returns a new canvas.</returns>
        public abstract mxICanvas CreateCanvas(Dictionary<string, Object> attrs);

        /// <summary>
        /// Returns the canvas that is used for rendering the graph.
        /// </summary>
        public mxICanvas Canvas
        {
            get { return canvas; }
        }

        /// <summary>
        /// Reads the given display XML data and parses all elements.
        /// </summary>
        /// <param name="reader">Reader that represents the display XML data.</param>
        public void Read(XmlReader reader)
        {
            if (reader != null)
            {
                while (reader.Read())
                {
                    if (reader.NodeType == XmlNodeType.Element)
                    {
                        string tagName = reader.LocalName.ToUpper();
                        Dictionary<string, Object> attrs =
                                new Dictionary<string, Object>();

                        if (reader.MoveToFirstAttribute())
                        {
                            do
                            {
                                attrs[reader.LocalName] = reader.Value;
                            } while (reader.MoveToNextAttribute());
                        }

                        ParseElement(tagName, attrs);
                    }
                }
            }
        }

        /// <summary>
        /// Parses the given element and paints it onto the canvas.
        /// </summary>
        /// <param name="tagName">Name of the node to be parsed.</param>
        /// <param name="attrs">Attributes of the node to be parsed.</param>
        public void ParseElement(string tagName, Dictionary<string, Object> attrs)
        {
            if (canvas == null && tagName.ToLower().Equals("graph"))
            {
                scale = mxUtils.GetDouble(attrs, "scale", 1);
                canvas = CreateCanvas(attrs);

                if (canvas != null)
                {
                    canvas.Scale = scale;
                }
            }
            else if (canvas != null)
            {
                bool edge = tagName.ToLower().Equals("edge");
                bool group = tagName.ToLower().Equals("group");
                bool vertex = tagName.ToLower().Equals("vertex");

                if ((edge && attrs.ContainsKey("points")) ||
                    ((vertex || group) && attrs.ContainsKey("x") &&
                    attrs.ContainsKey("y") && attrs.ContainsKey("width") &&
                    attrs.ContainsKey("height")))
                {
                    mxCellState state = new mxCellState(null, null, attrs);

                    string label = ParseState(state, edge);
                    canvas.DrawCell(state);
                    canvas.DrawLabel(label, state, false);
                }
            }
        }

        /// <summary>
        /// Parses the bounds, absolute points and label information from the style
        /// of the state into its respective fields and returns the label of the
        /// cell.
        /// </summary>
        public string ParseState(mxCellState state, bool edge)
        {
            Dictionary<string, object> style = state.Style;

            // Parses the bounds
            state.X = mxUtils.GetDouble(style, "x");
            state.Y = mxUtils.GetDouble(style, "y");
            state.Width = mxUtils.GetDouble(style, "width");
            state.Height = mxUtils.GetDouble(style, "height");

            // Parses the absolute points list
            List<mxPoint> pts = ParsePoints(mxUtils.GetString(style, "points"));

            if (pts.Count > 0)
            {
                state.AbsolutePoints = pts;
            }

            // Parses the label and label bounds
            string label = mxUtils.GetString(style, "label");

            if (label != null && label.Length > 0)
            {
                mxPoint offset = new mxPoint(mxUtils.GetDouble(style, "dx"),
                    mxUtils.GetDouble(style, "dy"));
                mxRectangle vertexBounds = (!edge) ? state : null;
                state.LabelBounds = mxUtils.GetLabelPaintBounds(label, style,
                    mxUtils.IsTrue(style, "html", false), offset, vertexBounds,
                    scale);
            }

            return label;
        }

        /// <summary>
        /// Parses the list of points into an object-oriented representation.
        /// </summary>
        /// <param name="pts">String containing a list of points.</param>
        /// <returns>Returns the points as a list of mxPoints.</returns>
        public static List<mxPoint> ParsePoints(string pts)
        {
            List<mxPoint> result = new List<mxPoint>();

            if (pts != null)
            {
                int len = pts.Length;
                string tmp = "";
                string x = null;

                for (int i = 0; i < len; i++)
                {
                    char c = pts[i];

                    if (c == ',' ||
                        c == ' ')
                    {
                        if (x == null)
                        {
                            x = tmp;
                        }
                        else
                        {
                            result.Add(new mxPoint(double.Parse(x),
                                    double.Parse(tmp)));
                            x = null;
                        }

                        tmp = "";
                    }
                    else
                    {
                        tmp += c;
                    }
                }

                result.Add(new mxPoint(double.Parse(x),
                    double.Parse(tmp)));
            }

            return result;
        }

    }

}
