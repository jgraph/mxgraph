// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the appearance of the cells in a graph.
    /// </summary>
    public class mxStylesheet
    {

        /// <summary>
        /// Shared immutable empty dictionary (for undefined cell styles).
        /// </summary>
        public static Dictionary<string, Object> EMPTY_STYLE = new Dictionary<string, Object>();

        /// <summary>
        /// Maps from names to styles.
        /// </summary>
        protected Dictionary<string, Dictionary<string, Object>> styles =
            new Dictionary<string, Dictionary<string, Object>>();

        /// <summary>
        /// Constructs a new stylesheet and assigns default styles.
        /// </summary>
        public mxStylesheet()
        {
            DefaultVertexStyle = CreateDefaultVertexStyle();
            DefaultEdgeStyle = CreateDefaultEdgeStyle();
        }

        /// <summary>
        /// Sets or returns the map that contains the styles.
        /// </summary>
        public Dictionary<string, Dictionary<string, Object>> Styles
        {
            get { return styles; }
            set { styles = value; }
        }

        /// <summary>
        /// Creates and returns the default vertex style.
        /// </summary>
        /// <returns>Returns the default vertex style.</returns>
        protected Dictionary<string, Object> CreateDefaultVertexStyle()
        {
            Dictionary<string, Object> style = new Dictionary<string, Object>();

            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
            style[mxConstants.STYLE_FILLCOLOR] = "#C3D9FF";
            style[mxConstants.STYLE_STROKECOLOR] = "#6482B9";
            style[mxConstants.STYLE_FONTCOLOR] = "#774400";

            return style;
        }

        /// <summary>
        /// Creates and returns the default edge style.
        /// </summary>
        /// <returns>Returns the default edge style.</returns>
        protected Dictionary<string, Object> CreateDefaultEdgeStyle()
        {
            Dictionary<string, Object> style = new Dictionary<string, Object>();

            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
            style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
            style[mxConstants.STYLE_STROKECOLOR] = "#6482B9";
            style[mxConstants.STYLE_FONTCOLOR] = "#446299";

            return style;
        }

        /// <summary>
        /// Sets or returns the default style for vertices.
        /// </summary>
        public Dictionary<string, Object> DefaultVertexStyle
        {
            get { return styles["defaultVertex"]; }
            set { PutCellStyle("defaultVertex", value); }
        }

        /// <summary>
        /// Sets or returns the default style for edges.
        /// </summary>
        public Dictionary<string, Object> DefaultEdgeStyle
        {
            get { return styles["defaultEdge"]; }
            set { PutCellStyle("defaultEdge", value); }
        }

        /// <summary>
        /// Stores the specified style under the given name.
        /// </summary>
        /// <param name="name">Name for the style to be stored.</param>
        /// <param name="style">Key, value pairs that define the style.</param>
        public void PutCellStyle(string name, Dictionary<string, Object> style)
        {
            styles[name] = style;
        }

        /// <summary>
        /// Returns the cell style for the specified cell or the given defaultStyle
        /// if no style can be found for the given stylename.
        /// </summary>
        /// <param name="name">String of the form [(stylename|key=value);] that represents the
        /// style.</param>
        /// <param name="defaultStyle">Default style to be returned if no style can be found.</param>
        /// <returns>Returns the style for the given formatted cell style.</returns>
        public Dictionary<string, Object> GetCellStyle(string name,
            Dictionary<string, Object> defaultStyle)
        {
		    Dictionary<string, Object> style = defaultStyle;

		    if (name != null && name.Length > 0)
            {
                string[] pairs = name.Split(';');

			    if (pairs != null)
                {
                    if (style != null && !name.StartsWith(";"))
                    {
                        style = new Dictionary<string, Object>(style);
                    }
                    else
                    {
                        style = new Dictionary<string, Object>();
                    }

			 	    for (int i = 0; i < pairs.Length; i++)
                    {
                        string tmp = pairs[i];
                        int c = tmp.IndexOf('=');

                        if (c >= 0)
                        {
                            string key = tmp.Substring(0, c);
                            string value = tmp.Substring(c + 1);

                            if (value.Equals(mxConstants.NONE))
                            {
                                style.Remove(key);
                            }
                            else
                            {
                                style[key] = value;
                            }
                        }
                        else if (styles.ContainsKey(tmp))
                        {
                            Dictionary<string, Object> tmpStyle = styles[tmp];

                            foreach (KeyValuePair<string, Object> entry in tmpStyle)
                            {
                                style[entry.Key] = entry.Value;
                            }
                        }
				    }
			    }
		    }

		    return style;
        }

    }

}
