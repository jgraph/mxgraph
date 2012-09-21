using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    public class mxSaxOutputHandler
    {
        /// <summary>
        /// Holds the current canvas.
        /// </summary>
        protected mxICanvas2D canvas;
            
	    /// <summary>
	    /// Holds the handlers for specific XML nodes.
	    /// </summary>
	    protected Dictionary<string, ElementHandler> handlers = new Dictionary<string, ElementHandler>();
                
        /// <summary>
        /// Defines the requirements for an object that parses a node.
        /// </summary>
        public delegate void ElementHandler(Dictionary<string, string> atts);

        /// <summary>
        /// Constructs a new sax output handler for the given canvas.
        /// </summary>
        public mxSaxOutputHandler(mxICanvas2D canvas)
        {
            Canvas = canvas;
            InitHandlers();
        }

        /// <summary>
        /// Sets or returns the current canvas.
        /// </summary>
        public mxICanvas2D Canvas
        {
            get { return canvas; }
            set { canvas = value; }
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
                        Dictionary<string, string> attrs =
                                new Dictionary<string, string>();

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
        public void ParseElement(string tagName, Dictionary<string, string> atts)
        {
            string key = tagName.ToLower();

            if (handlers.ContainsKey(key))
            {
                handlers[key](atts);
            }
        }

        protected string GetString(Dictionary<string, string> atts, string key)
        {
            return GetString(atts, key, null);
        }

        protected string GetString(Dictionary<string, string> atts, string key, string defaultValue)
        {
            if (atts.ContainsKey(key))
            {
                defaultValue = atts[key];
            }

            return defaultValue;
        }

        protected double GetDouble(Dictionary<string, string> atts, string key)
        {
            return GetDouble(atts, key, 0);
        }

        protected double GetDouble(Dictionary<string, string> atts, string key, double defaultValue)
        {
            if (atts.ContainsKey(key))
            {
                defaultValue = double.Parse(atts[key]);
            }

            return defaultValue;
        }

        protected int GetInt(Dictionary<string, string> atts, string key)
        {
            return GetInt(atts, key, 0);
        }

        protected int GetInt(Dictionary<string, string> atts, string key, int defaultValue)
        {
            if (atts.ContainsKey(key))
            {
                defaultValue = int.Parse(atts[key]);
            }

            return defaultValue;
        }

        protected bool IsTrue(Dictionary<string, string> atts, string key)
        {
            return IsTrue(atts, key, false);
        }

        protected bool IsTrue(Dictionary<string, string> atts, string key, bool defaultValue)
        {
            if (atts.ContainsKey(key))
            {
                defaultValue = atts[key].Equals("1");
            }

            return defaultValue;
        }

	    /// <summary>
	    /// 
	    /// </summary>
	    protected void InitHandlers()
	    {
		    handlers["save"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Save();
		    };

		    handlers["restore"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Restore();
		    };

		    handlers["scale"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Scale(GetDouble(atts, "scale"));
		    };

		    handlers["translate"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Translate(GetDouble(atts, "dx"), GetDouble(atts, "dy"));
		    };

		    handlers["rotate"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Rotate(GetDouble(atts, "theta"), IsTrue(atts, "flipH"),
                    IsTrue(atts, "flipV"), GetDouble(atts, "cx"), GetDouble(atts, "cy"));
		    };

		    handlers["strokewidth"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.StrokeWidth = GetDouble(atts, "width");
		    };
            
            handlers["strokecolor"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.StrokeColor = GetString(atts, "color");
		    };

            handlers["dashed"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Dashed = IsTrue(atts, "dashed");
		    };

            handlers["dashpattern"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.DashPattern = GetString(atts, "pattern");
		    };

            handlers["linecap"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.LineCap = GetString(atts, "cap");
		    };

            handlers["linejoin"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.LineJoin = GetString(atts, "join");
		    };

            handlers["miterlimit"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.MiterLimit = GetDouble(atts, "limit");
		    };

            handlers["fontsize"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FontSize = GetDouble(atts, "size");
		    };

            handlers["fontcolor"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FontColor = GetString(atts, "color");
		    };

            handlers["fontfamily"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FontFamily = GetString(atts, "family");
		    };

            handlers["fontstyle"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FontStyle = GetInt(atts, "style");
		    };

            handlers["alpha"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Alpha = GetDouble(atts, "alpha");
		    };

            handlers["fillcolor"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FillColor = GetString(atts, "color");
		    };

            handlers["gradient"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.SetGradient(GetString(atts, "c1"), GetString(atts, "c2"),
                    GetDouble(atts, "x"), GetDouble(atts, "y"),
				    GetDouble(atts, "w"), GetDouble(atts, "h"),
				    GetString(atts, "direction"));
		    };

            handlers["glass"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.SetGlassGradient(GetDouble(atts, "x"), GetDouble(atts, "y"),
				    GetDouble(atts, "w"), GetDouble(atts, "h"));
		    };

            handlers["rect"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Rect(GetDouble(atts, "x"), GetDouble(atts, "y"),
                    GetDouble(atts, "w"), GetDouble(atts, "h"));
		    };

            handlers["roundrect"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Roundrect(GetDouble(atts, "x"), GetDouble(atts, "y"),
                    GetDouble(atts, "w"), GetDouble(atts, "h"),
                    GetDouble(atts, "dx"), GetDouble(atts, "dy"));
		    };

            handlers["ellipse"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Ellipse(GetDouble(atts, "x"), GetDouble(atts, "y"),
                    GetDouble(atts, "w"), GetDouble(atts, "h"));
		    };

            handlers["image"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Image(GetDouble(atts, "x"), GetDouble(atts, "y"),
                    GetDouble(atts, "w"), GetDouble(atts, "h"),
                    GetString(atts, "src"), IsTrue(atts, "aspect"),
                    IsTrue(atts, "flipH"), IsTrue(atts, "flipV"));
		    };

            handlers["text"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.Text(GetDouble(atts, "x"), GetDouble(atts, "y"),
                    GetDouble(atts, "w"), GetDouble(atts, "h"),
                    GetString(atts, "str"), GetString(atts, "align"),
                    GetString(atts, "valign"), IsTrue(atts, "vertical"),
                    IsTrue(atts, "wrap"), GetString(atts, "format"));
		    };

            handlers["begin"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Begin();
		    };

            handlers["move"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.MoveTo(GetDouble(atts, "x"), GetDouble(atts, "y"));
		    };

            handlers["line"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.LineTo(GetDouble(atts, "x"), GetDouble(atts, "y"));
		    };

            handlers["quad"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.QuadTo(GetDouble(atts, "x1"), GetDouble(atts, "y1"),
                    GetDouble(atts, "x2"), GetDouble(atts, "y2"));
		    };

            handlers["curve"] = delegate(Dictionary<string, string> atts)
		    {
                canvas.CurveTo(GetDouble(atts, "x1"), GetDouble(atts, "y1"),
                    GetDouble(atts, "x2"), GetDouble(atts, "y2"),
                    GetDouble(atts, "x3"), GetDouble(atts, "y3"));
		    };

            handlers["close"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Close();
		    };

            handlers["stroke"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Stroke();
		    };
            handlers["fill"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Fill();
		    };

            handlers["fillstroke"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.FillAndStroke();
		    };

            handlers["shadow"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Shadow(GetString(atts, "value"), IsTrue(atts, "filled", true));
		    };

            handlers["clip"] = delegate(Dictionary<string, string> atts)
		    {
			    canvas.Clip();
		    };
	    }
    }
}
