using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Xml;
using System.Reflection;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{

    /// <summary>
    /// Implements a stencil for the given XML definition. This class implements the mxGraph
    /// stencil schema.
    /// </summary>
    public class mxStencil
    {
        /// <summary>
        /// Holds the top-level node of the stencil definition.
        /// </summary>
        protected XmlElement desc;

        /// <summary>
        /// Holds the aspect of the shape. Default is "auto".
        /// </summary>
        protected string aspect = null;

        /// <summary>
        /// Holds the width of the shape. Default is 100.
        /// </summary>
        protected double w0 = 100;

        /// <summary>
        /// Holds the height of the shape. Default is 100.
        /// </summary>
        protected double h0 = 100;

        /// <summary>
        /// Holds the XML node with the stencil description.
        /// </summary>
        protected XmlElement bgNode = null;

        /// <summary>
        /// Holds the XML node with the stencil description.
        /// </summary>
        protected XmlElement fgNode = null;

        /// <summary>
        /// Holds the strokewidth direction from the description.
        /// </summary>
        protected string strokewidth = null;

        /// <summary>
        /// Holds the last x-position of the cursor.
        /// </summary>
        protected double lastMoveX = 0;

        /// <summary>
        /// Holds the last y-position of the cursor.
        /// </summary>
        protected double lastMoveY = 0;

        /// <summary>
        /// Constructs a new stencil for the given mxGraph shape description.
        /// </summary>
        /// <param name="description"></param>
        public mxStencil(XmlElement description)
        {
            Description = description;
        }

        /// <summary>
        /// Sets or returns the description.
        /// </summary>
        public XmlElement Description
        {
            get { return desc; }
            set
            {
                desc = value;
                ParseDescription();
            }
        }

        /// <summary>
        /// Creates the canvas for rendering the stencil.
        /// </summary>
        /// <param name="gc"></param>
        /// <returns></returns>
        protected mxGdiCanvas2D CreateCanvas(mxGdiCanvas gc)
        {
            return new mxGdiCanvas2D(gc.Graphics);
        }
        
	    /// <summary>
	    /// Paints the stencil for the given state.
	    /// </summary>
	    public void PaintShape(mxGdiCanvas gc, mxCellState state)
	    {
            mxGdiCanvas2D canvas = CreateCanvas(gc);
            Dictionary<string, object> style = state.Style;

		    double rotation = mxUtils.GetDouble(style, mxConstants.STYLE_ROTATION,
				    0);
		    String direction = mxUtils.GetString(style,
				    mxConstants.STYLE_DIRECTION, null);

		    // Default direction is east (ignored if rotation exists)
		    if (direction != null)
		    {
			    if (direction.Equals("north"))
			    {
				    rotation += 270;
			    }
			    else if (direction.Equals("west"))
			    {
				    rotation += 180;
			    }
			    else if (direction.Equals("south"))
			    {
				    rotation += 90;
			    }
		    }

		    // New styles for shape flipping the stencil
		    bool flipH = mxUtils.IsTrue(style, mxConstants.STYLE_STENCIL_FLIPH,
				    false);
		    bool flipV = mxUtils.IsTrue(style, mxConstants.STYLE_STENCIL_FLIPV,
				    false);

		    if (flipH && flipV)
		    {
			    rotation += 180;
			    flipH = false;
			    flipV = false;
		    }

		    // Saves the global state for each cell
		    canvas.Save();

		    // Adds rotation and horizontal/vertical flipping
		    rotation = rotation % 360;

		    if (rotation != 0 || flipH || flipV)
		    {
			    canvas.Rotate(rotation, flipH, flipV, state.GetCenterX(),
					    state.GetCenterY());
		    }

		    // Note: Overwritten in mxStencil.paintShape (can depend on aspect)
		    double scale = state.View.Scale;
		    double sw = mxUtils.GetDouble(style, mxConstants.STYLE_STROKEWIDTH, 1)
				    * scale;
		    canvas.StrokeWidth = sw;

		    double alpha = mxUtils.GetDouble(style, mxConstants.STYLE_OPACITY, 100) / 100;
		    String gradientColor = mxUtils.GetString(style,
				    mxConstants.STYLE_GRADIENTCOLOR, null);

		    // Converts colors with special keyword none to null
		    if (gradientColor != null && gradientColor.Equals(mxConstants.NONE))
		    {
			    gradientColor = null;
		    }

		    String fillColor = mxUtils.GetString(style,
				    mxConstants.STYLE_FILLCOLOR, null);

		    if (fillColor != null && fillColor.Equals(mxConstants.NONE))
		    {
			    fillColor = null;
		    }

		    String strokeColor = mxUtils.GetString(style,
				    mxConstants.STYLE_STROKECOLOR, null);

		    if (strokeColor != null && strokeColor.Equals(mxConstants.NONE))
		    {
			    strokeColor = null;
		    }

		    // Draws the shadow if the fillColor is not transparent
		    if (mxUtils.IsTrue(style, mxConstants.STYLE_SHADOW, false))
		    {
			    DrawShadow(canvas, state, rotation, flipH, flipV, state, alpha, fillColor != null);
		    }

		    canvas.Alpha = alpha;

		    // Sets the dashed state
		    if (mxUtils.IsTrue(style, mxConstants.STYLE_DASHED, false))
		    {
			    canvas.Dashed = true;
		    }

		    // Draws background and foreground
		    if (strokeColor != null || fillColor != null)
		    {
			    if (strokeColor != null)
			    {
				    canvas.StrokeColor = strokeColor;
			    }

			    if (fillColor != null)
			    {
				    if (gradientColor != null
						    && !gradientColor.Equals("transparent"))
				    {
					    canvas.SetGradient(fillColor, gradientColor, state.X,
							    state.Y, state.Width, state.Height,
							    direction, 1, 1);
				    }
				    else
				    {
					    canvas.FillColor = fillColor;
				    }
			    }

			    // Draws background and foreground of shape
			    DrawShape(canvas, state, state, true);
			    DrawShape(canvas, state, state, false);
		    }
	    }
    	
	    /// <summary>
	    /// Draws the shadow.
	    /// </summary>
	    /// <param name="canvas"></param>
	    /// <param name="state"></param>
	    /// <param name="rotation"></param>
	    /// <param name="flipH"></param>
	    /// <param name="flipV"></param>
	    /// <param name="bounds"></param>
	    /// <param name="alpha"></param>
	    protected void DrawShadow(mxGdiCanvas2D canvas, mxCellState state, double rotation, bool flipH,
			    bool flipV, mxRectangle bounds, double alpha, bool filled)
	    {
		    // Requires background in generic shape for shadow, looks like only one
		    // fillAndStroke is allowed per current path, try working around that
		    // Computes rotated shadow offset
		    double rad = rotation * Math.PI / 180;
		    double cos = Math.Cos(-rad);
		    double sin = Math.Sin(-rad);
		    mxPoint offset = mxUtils.GetRotatedPoint(new mxPoint(mxConstants.SHADOW_OFFSETX, mxConstants.SHADOW_OFFSETY), cos, sin);
    		
		    if (flipH)
		    {
			    offset.X *= -1;
		    }
    		
		    if (flipV)
		    {
			    offset.Y *= -1;
		    }
    		
		    // TODO: Use save/restore instead of negative offset to restore (requires fix for HTML canvas)
		    canvas.Translate(offset.X, offset.Y);
    		
		    // Returns true if a shadow has been painted (path has been created)
		    if (DrawShape(canvas, state, bounds, true))
		    {
			    canvas.Alpha = mxConstants.STENCIL_SHADOW_OPACITY * alpha;
                // TODO: Implement new shadow
			    //canvas.Shadow(mxConstants.STENCIL_SHADOWCOLOR, filled);
		    }

		    canvas.Translate(-offset.X, -offset.Y);
	    }
    			
	    /**
	     * Draws this stencil inside the given bounds.
	     */
	    public bool DrawShape(mxGdiCanvas2D canvas, mxCellState state,
			    mxRectangle bounds, bool background)
	    {
		    XmlNode elt = (background) ? bgNode : fgNode;

		    if (elt != null)
		    {
			    String direction = mxUtils.GetString(state.Style,
					    mxConstants.STYLE_DIRECTION, null);
			    mxRectangle aspect = ComputeAspect(state, bounds, direction);
			    double minScale = Math.Min(aspect.Width, aspect.Height);
			    double sw = strokewidth.Equals("inherit") ? mxUtils.GetDouble(
					    state.Style, mxConstants.STYLE_STROKEWIDTH, 1)
					    * state.View.Scale : double
					    .Parse(strokewidth) * minScale;
			    lastMoveX = 0;
			    lastMoveY = 0;
			    canvas.StrokeWidth = sw;

			    XmlNode tmp = elt.FirstChild;

			    while (tmp != null)
			    {
				    if (tmp.NodeType == XmlNodeType.Element)
				    {
					    DrawElement(canvas, state, (XmlElement) tmp, aspect);
				    }

				    tmp = tmp.NextSibling;
			    }

			    return true;
		    }

		    return false;
	    }

	    /// <summary>
	    /// Returns a rectangle that contains the offset in x and y and the horizontal
        /// and vertical scale in width and height used to draw this shape inside the
        /// given rectangle.
	    /// </summary>
	    /// <param name="state"></param>
	    /// <param name="bounds"></param>
	    /// <param name="direction"></param>
	    /// <returns></returns>
	    protected mxRectangle ComputeAspect(mxCellState state, mxRectangle bounds,
			    string direction)
	    {
		    double x0 = bounds.X;
		    double y0 = bounds.Y;
		    double sx = bounds.Width / w0;
		    double sy = bounds.Height / h0;

		    bool inverse = (direction != null && (direction.Equals("north") || direction
				    .Equals("south")));

		    if (inverse)
		    {
			    sy = bounds.Width / h0;
			    sx = bounds.Height / w0;

			    double delta = (bounds.Width - bounds.Height) / 2;

			    x0 += delta;
			    y0 -= delta;
		    }

		    if (aspect.Equals("fixed"))
		    {
			    sy = Math.Min(sx, sy);
			    sx = sy;

			    // Centers the shape inside the available space
			    if (inverse)
			    {
				    x0 += (bounds.Height - this.w0 * sx) / 2;
				    y0 += (bounds.Width - this.h0 * sy) / 2;
			    }
			    else
			    {
				    x0 += (bounds.Width - this.w0 * sx) / 2;
				    y0 += (bounds.Height - this.h0 * sy) / 2;
			    }
		    }

		    return new mxRectangle(x0, y0, sx, sy);
	    }

	    /// <summary>
        /// Draws the given element.
	    /// </summary>
	    /// <param name="canvas"></param>
	    /// <param name="state"></param>
	    /// <param name="node"></param>
	    /// <param name="aspect"></param>
	    protected void DrawElement(mxGdiCanvas2D canvas, mxCellState state,
                XmlElement node, mxRectangle aspect)
	    {
            string name = node.Name;
		    double x0 = aspect.X;
		    double y0 = aspect.Y;
		    double sx = aspect.Width;
		    double sy = aspect.Height;
		    double minScale = Math.Min(sx, sy);

		    // LATER: Move to lookup table
		    if (name.Equals("save"))
		    {
			    canvas.Save();
		    }
		    else if (name.Equals("restore"))
		    {
			    canvas.Restore();
		    }
		    else if (name.Equals("path"))
		    {
			    canvas.Begin();

			    // Renders the elements inside the given path
			    XmlNode childNode = node.FirstChild;

			    while (childNode != null)
			    {
				    if (childNode.NodeType == XmlNodeType.Element)
				    {
                        DrawElement(canvas, state, (XmlElement) childNode, aspect);
				    }

				    childNode = childNode.NextSibling;
			    }
		    }
		    else if (name.Equals("close"))
		    {
			    canvas.Close();
		    }
		    else if (name.Equals("move"))
		    {
			    lastMoveX = x0 + GetDouble(node, "x") * sx;
			    lastMoveY = y0 + GetDouble(node, "y") * sy;
			    canvas.MoveTo(lastMoveX, lastMoveY);
		    }
		    else if (name.Equals("line"))
		    {
			    lastMoveX = x0 + GetDouble(node, "x") * sx;
			    lastMoveY = y0 + GetDouble(node, "y") * sy;
			    canvas.LineTo(lastMoveX, lastMoveY);
		    }
		    else if (name.Equals("quad"))
		    {
			    lastMoveX = x0 + GetDouble(node, "x2") * sx;
			    lastMoveY = y0 + GetDouble(node, "y2") * sy;
			    canvas.QuadTo(x0 + GetDouble(node, "x1") * sx,
					    y0 + GetDouble(node, "y1") * sy, lastMoveX, lastMoveY);
		    }
		    else if (name.Equals("curve"))
		    {
			    lastMoveX = x0 + GetDouble(node, "x3") * sx;
			    lastMoveY = y0 + GetDouble(node, "y3") * sy;
			    canvas.CurveTo(x0 + GetDouble(node, "x1") * sx,
					    y0 + GetDouble(node, "y1") * sy, x0 + GetDouble(node, "x2")
							    * sx, y0 + GetDouble(node, "y2") * sy, lastMoveX,
					    lastMoveY);
		    }
		    else if (name.Equals("arc"))
		    {
			    // Arc from stencil is turned into curves in image output
			    double r1 = GetDouble(node, "rx") * sx;
			    double r2 = GetDouble(node, "ry") * sy;
			    double angle = GetDouble(node, "x-axis-rotation");
			    double largeArcFlag = GetDouble(node, "large-arc-flag");
			    double sweepFlag = GetDouble(node, "sweep-flag");
			    double x = x0 + GetDouble(node, "x") * sx;
			    double y = y0 + GetDouble(node, "y") * sy;

			    double[] curves = mxUtils.ArcToCurves(this.lastMoveX,
					    this.lastMoveY, r1, r2, angle, largeArcFlag, sweepFlag, x,
					    y);

			    for (int i = 0; i < curves.Length; i += 6)
			    {
				    canvas.CurveTo(curves[i], curves[i + 1], curves[i + 2],
						    curves[i + 3], curves[i + 4], curves[i + 5]);

				    lastMoveX = curves[i + 4];
				    lastMoveY = curves[i + 5];
			    }
		    }
		    else if (name.Equals("rect"))
		    {
			    canvas.Rect(x0 + GetDouble(node, "x") * sx,
					    y0 + GetDouble(node, "y") * sy, GetDouble(node, "w") * sx,
					    GetDouble(node, "h") * sy);
		    }
		    else if (name.Equals("roundrect"))
		    {
			    double arcsize = GetDouble(node, "arcsize");

			    if (arcsize == 0)
			    {
				    arcsize = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;
			    }

			    double w = GetDouble(node, "w") * sx;
			    double h = GetDouble(node, "h") * sy;
			    double factor = arcsize / 100;
			    double r = Math.Min(w * factor, h * factor);

			    canvas.Roundrect(x0 + GetDouble(node, "x") * sx,
					    y0 + GetDouble(node, "y") * sy, GetDouble(node, "w") * sx,
					    GetDouble(node, "h") * sy, r, r);
		    }
		    else if (name.Equals("ellipse"))
		    {
			    canvas.Ellipse(x0 + GetDouble(node, "x") * sx,
					    y0 + GetDouble(node, "y") * sy, GetDouble(node, "w") * sx,
					    GetDouble(node, "h") * sy);
		    }
		    else if (name.Equals("image"))
		    {
			    string src = EvaluateAttribute(node, "src", state);

			    canvas.Image(x0 + GetDouble(node, "x") * sx,
					    y0 + GetDouble(node, "y") * sy, GetDouble(node, "w") * sx,
					    GetDouble(node, "h") * sy, src, false,
					    GetString(node, "flipH", "0").Equals("1"),
					    GetString(node, "flipV", "0").Equals("1"));
		    }
		    else if (name.Equals("text"))
		    {
			    String str = EvaluateAttribute(node, "str", state);
                double rotation = GetString(node, "vertical", "0").Equals("1") ? -90 : 0;

			    canvas.Text(x0 + GetDouble(node, "x") * sx,
					    y0 + GetDouble(node, "y") * sy, 0, 0, str,
					    node.GetAttribute("align"), node.GetAttribute("valign"),
					    false, "", null, false, rotation, null);
		    }
		    else if (name.Equals("include-shape"))
		    {
			    mxStencil stencil = mxStencilRegistry.GetStencil(node
					    .GetAttribute("name"));

			    if (stencil != null)
			    {
				    double x = x0 + GetDouble(node, "x") * sx;
				    double y = y0 + GetDouble(node, "y") * sy;
				    double w = GetDouble(node, "w") * sx;
				    double h = GetDouble(node, "h") * sy;

				    mxRectangle tmp = new mxRectangle(x, y, w, h);
				    stencil.DrawShape(canvas, state, tmp, true);
				    stencil.DrawShape(canvas, state, tmp, false);
			    }
		    }
		    else if (name.Equals("fillstroke"))
		    {
			    canvas.FillAndStroke();
		    }
		    else if (name.Equals("fill"))
		    {
			    canvas.Fill();
		    }
		    else if (name.Equals("stroke"))
		    {
			    canvas.Stroke();
		    }
		    else if (name.Equals("strokewidth"))
		    {
			    canvas.StrokeWidth = GetDouble(node, "width") * minScale;
		    }
		    else if (name.Equals("dashed"))
		    {
			    canvas.Dashed = node.GetAttribute("dashed") == "1";
		    }
		    else if (name.Equals("dashpattern"))
		    {
			    string value = node.GetAttribute("pattern");

			    if (value != null)
			    {
				    string[] tmp = value.Split(' ');
                    StringBuilder pat = new StringBuilder();

				    for (int i = 0; i < tmp.Length; i++)
				    {
					    if (tmp[i].Length > 0)
					    {
						    pat.Append(double.Parse(tmp[i]) * minScale);
						    pat.Append(" ");
					    }
				    }

				    value = pat.ToString();
			    }

			    canvas.DashPattern = value;
		    }
		    else if (name.Equals("strokecolor"))
		    {
			    canvas.StrokeColor = node.GetAttribute("color");
		    }
		    else if (name.Equals("linecap"))
		    {
			    canvas.LineCap = node.GetAttribute("cap");
		    }
		    else if (name.Equals("linejoin"))
		    {
			    canvas.LineJoin = node.GetAttribute("join");
		    }
		    else if (name.Equals("miterlimit"))
		    {
			    canvas.MiterLimit = GetDouble(node, "limit");
		    }
		    else if (name.Equals("fillcolor"))
		    {
			    canvas.FillColor = node.GetAttribute("color");
		    }
		    else if (name.Equals("fontcolor"))
		    {
			    canvas.FontColor = node.GetAttribute("color");
		    }
		    else if (name.Equals("fontstyle"))
		    {
			    canvas.FontStyle = GetInt(node, "style", 0);
		    }
		    else if (name.Equals("fontfamily"))
		    {
			    canvas.FontFamily = node.GetAttribute("family");
		    }
		    else if (name.Equals("fontsize"))
		    {
			    canvas.FontSize = GetDouble(node, "size") * minScale;
		    }
	    }

	    /// <summary>
        /// Returns the given attribute or the default value.
	    /// </summary>
	    /// <param name="elt"></param>
	    /// <param name="attribute"></param>
	    /// <param name="defaultValue"></param>
	    /// <returns></returns>
        protected int GetInt(XmlElement elt, string attribute, int defaultValue)
	    {
            string value = elt.GetAttribute(attribute);

		    if (value != null && value.Length > 0)
		    {
			    try
			    {
				    defaultValue = (int) Math.Round(float.Parse(value));
			    }
			    catch (Exception e)
			    {
				    // ignore
			    }
		    }

		    return defaultValue;
	    }

	    /// <summary>
        /// Returns the given attribute or 0.
	    /// </summary>
	    /// <param name="elt"></param>
	    /// <param name="attribute"></param>
	    /// <returns></returns>
        protected double GetDouble(XmlElement elt, String attribute)
	    {
		    return GetDouble(elt, attribute, 0);
	    }

	    /// <summary>
        /// Returns the given attribute or the default value.
	    /// </summary>
	    /// <param name="elt"></param>
	    /// <param name="attribute"></param>
	    /// <param name="defaultValue"></param>
	    /// <returns></returns>
        protected double GetDouble(XmlElement elt, String attribute,
			    double defaultValue)
	    {
            string value = elt.GetAttribute(attribute);

		    if (value != null && value.Length > 0)
		    {
			    try
			    {
				    defaultValue = double.Parse(value);
			    }
			    catch (Exception e)
			    {
				    // ignore
			    }
		    }

		    return defaultValue;
	    }

	    /// <summary>
	    /// Returns the given attribute or the default value.
	    /// </summary>
	    /// <param name="elt"></param>
	    /// <param name="attribute"></param>
	    /// <param name="defaultValue"></param>
	    /// <returns></returns>
        protected string GetString(XmlElement elt, string attribute,
			    string defaultValue)
	    {
		    string value = elt.GetAttribute(attribute);

		    if (value != null && value.Length > 0)
		    {
			    defaultValue = value;
		    }

		    return defaultValue;
	    }

	    /// <summary>
        /// Parses the description of this shape.
	    /// </summary>
	    protected void ParseDescription()
	    {
		    // LATER: Preprocess nodes for faster painting
		    fgNode = (XmlElement) desc.GetElementsByTagName("foreground")[0];
            bgNode = (XmlElement) desc.GetElementsByTagName("background")[0];
		    w0 = GetDouble(desc, "w", w0);
            h0 = GetDouble(desc, "h", h0);

		    // Possible values for aspect are: variable and fixed where
		    // variable means fill the available space and fixed means
		    // use w0 and h0 to compute the aspect.
		    aspect = GetString(desc, "aspect", "variable");

		    // Possible values for strokewidth are all numbers and "inherit"
		    // where the inherit means take the value from the style (ie. the
		    // user-defined stroke-width). Note that the strokewidth is scaled
		    // by the minimum scaling that is used to draw the shape (sx, sy).
		    strokewidth = GetString(desc, "strokewidth", "1");
	    }

	    /// <summary>
	    /// Gets the attribute for the given name from the given node. If the attribute
        /// does not exist then the text content of the node is evaluated and if it is
        /// a function it is invoked with <state> as the only argument and the return
        /// value is used as the attribute value to be returned.
	    /// </summary>
	    /// <param name="elt"></param>
	    /// <param name="attribute"></param>
	    /// <param name="state"></param>
	    /// <returns></returns>
	    public string EvaluateAttribute(XmlElement elt, string attribute,
			    mxCellState state)
	    {
		    string result = elt.GetAttribute(attribute);

		    if (result == null)
		    {
			    // JS functions as text content are currently not supported in .NET
		    }

		    return result;
	    }

    }
}
