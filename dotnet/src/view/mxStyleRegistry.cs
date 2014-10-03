// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Diagnostics;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Static class that acts as a global registry for codecs. See mxCodec for
    /// an example of using this class.
    /// </summary>
    public class mxStyleRegistry
    {

        /// <summary>
        /// Maps from strings to objects.
        /// </summary>
        protected static Dictionary<string, Object> values = new Dictionary<string, Object>();

        // Registers the known codecs and package names
        static mxStyleRegistry()
        {
            PutValue(mxConstants.EDGESTYLE_ELBOW, mxEdgeStyle.ElbowConnector);
            PutValue(mxConstants.EDGESTYLE_ENTITY_RELATION, mxEdgeStyle.EntityRelation);
            PutValue(mxConstants.EDGESTYLE_LOOP, mxEdgeStyle.Loop);
            PutValue(mxConstants.EDGESTYLE_SIDETOSIDE, mxEdgeStyle.SideToSide);
            PutValue(mxConstants.EDGESTYLE_TOPTOBOTTOM, mxEdgeStyle.TopToBottom);

            PutValue(mxConstants.PERIMETER_ELLIPSE, mxPerimeter.EllipsePerimeter);
            PutValue(mxConstants.PERIMETER_RECTANGLE, mxPerimeter.RectanglePerimeter);
            PutValue(mxConstants.PERIMETER_RHOMBUS, mxPerimeter.RhombusPerimeter);
            PutValue(mxConstants.PERIMETER_TRIANGLE, mxPerimeter.TrianglePerimeter);
        }

        /// <summary>
        /// Puts the given object into the registry under the given name.
        /// </summary>
        public static void PutValue(String name, Object value)
        {
            values[name] = value;
        }

        /// <summary>
        /// Returns the value associated with the given name.
        /// </summary>
        public static Object GetValue(String name)
        {
            if (values.ContainsKey(name))
            {
                return values[name];
            }

            return null;
        }

        /// <summary>
        /// Returns the value associated with the given name.
        /// </summary>
        public static String GetName(Object value)
        {
            foreach (String key in values.Keys)
            {
                if (values[key] == value)
                {
                    return key;
                }
            }

            return null;
        }

    }

}
