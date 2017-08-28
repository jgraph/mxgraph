// $Id: mxGdiCanvas2D.cs,v 1.12 2013/05/23 10:29:42 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Diagnostics;

namespace com.mxgraph
{
    /// <summary>
    /// Used for exporting images.
    /// <example>To render to an image from a given XML string, graph size and
    /// and background color, the following code is used:
    /// <code>
    /// Image image = mxUtils.CreateImage(width, height, background);
    /// Graphics g = Graphics.FromImage(image);
    /// g.SmoothingMode = SmoothingMode.HighQuality;
    /// mxSaxOutputHandler handler = new mxSaxOutputHandler(new mxGdiCanvas2D(g));
    /// handler.Read(new XmlTextReader(new StringReader(xml)));
    /// </code>
    /// </example>
    /// Text rendering is available for plain text only, with optional word wrapping.
    /// </summary>
    public class mxGdiCanvas2D : mxICanvas2D
    {
        /// <summary>
        /// matchHtmlAlignment
        /// </summary>
        protected bool matchHtmlAlignment = true;

        /// <summary>
        /// htmlAsPlainText
        /// </summary>
        protected bool htmlAsPlainText = true;

        /// <summary>
        /// htmlAsPlainText
        /// </summary>
        protected bool wrapPlainText = true;

	    /// <summary>
        /// Reference to the graphics instance for painting.
	    /// </summary>
	    protected Graphics graphics;

	    /// <summary>
        /// Represents the current state of the canvas.
	    /// </summary>
	    protected CanvasState state = new CanvasState();

	    /// <summary>
        /// Stack of states for save/restore.
	    /// </summary>
	    protected Stack<CanvasState> stack = new Stack<CanvasState>();

	    /// <summary>
        /// Holds the current path.
	    /// </summary>
	    protected GraphicsPath currentPath;

	    /// <summary>
	    /// Holds the last point of a moveTo or lineTo operation to determine if the
        /// current path is orthogonal.
	    /// </summary>
	    protected mxPoint lastPoint;

	    /// <summary>
	    /// FontCaching
	    /// </summary>
	    protected Font lastFont = null;

	    /// <summary>
	    /// FontCaching
	    /// </summary>
        protected FontStyle lastFontStyle = 0;

	    /// <summary>
	    /// FontCaching
	    /// </summary>
	    protected float lastFontSize = 0;

	    /// <summary>
	    /// FontCaching
	    /// </summary>
	    protected String lastFontFamily = "";

	    /// <summary>
        /// Constructs a new graphics export canvas.
	    /// </summary>
	    public mxGdiCanvas2D(Graphics g)
	    {
            Graphics = g;
	    }

	    /// <summary>
        /// Sets the graphics instance.
	    /// </summary>
        Graphics Graphics
        {
            get { return graphics; }
            set { graphics = value; }
        }

	    /// <summary>
        /// Saves the current canvas state.
	    /// </summary>
	    public void Save()
	    {
            state.state = graphics.Save();
		    stack.Push(state);
		    state = (CanvasState) state.Clone();
	    }

	    /// <summary>
        /// Restores the last canvas state.
	    /// </summary>
	    public void Restore()
	    {
		    state = stack.Pop();
            graphics.Restore(state.state);
	    }

	    /// <summary>
	    /// Sets the given scale.
	    /// </summary>
	    /// <param name="value"></param>
	    public void Scale(double value)
	    {
		    // This implementation uses custom scale/translate and built-in rotation
		    state.scale = state.scale * value;
	    }

	    /// <summary>
	    /// Translates the canvas.
	    /// </summary>
	    /// <param name="dx"></param>
	    /// <param name="dy"></param>
	    public void Translate(double dx, double dy)
	    {
		    // This implementation uses custom scale/translate and built-in rotation
		    state.dx += dx;
		    state.dy += dy;
	    }

	    /// <summary>
	    /// Rotates the canvas.
	    /// </summary>
	    public void Rotate(double theta, bool flipH, bool flipV, double cx,
			    double cy)
	    {
            cx += state.dx;
            cy += state.dy;
            cx *= state.scale;
            cy *= state.scale;

            // This implementation uses custom scale/translate and built-in rotation
            // Rotation state is part of the AffineTransform in state.transform
            if (flipH && flipV)
            {
                theta += 180;
            }
            else if (flipH ^ flipV)
            {
                double tx = (flipH) ? cx : 0;
                int sx = (flipH) ? -1 : 1;

                double ty = (flipV) ? cy : 0;
                int sy = (flipV) ? -1 : 1;

                graphics.TranslateTransform((float)-tx, (float)-ty, MatrixOrder.Append);
                graphics.ScaleTransform(sx, sy, MatrixOrder.Append);
                graphics.TranslateTransform((float)tx, (float)ty, MatrixOrder.Append);
            }

            graphics.TranslateTransform((float)-cx, (float)-cy, MatrixOrder.Append);
            graphics.RotateTransform((float)theta, MatrixOrder.Append);
            graphics.TranslateTransform((float)cx, (float)cy, MatrixOrder.Append);
	    }

	    /// <summary>
	    /// Sets the strokewidth.
	    /// </summary>
        public double StrokeWidth
        {
            set
            {
                // Lazy and cached instantiation strategy for all stroke properties
		        if (value != state.strokeWidth)
		        {
			        state.strokeWidth = value;
		        }
            }
        }

	    /// <summary>
        /// Caches color conversion as it is expensive.
	    /// </summary>
        public string StrokeColor
        {
            set
            {
                // Lazy and cached instantiation strategy for all stroke properties
		        if (state.strokeColorValue == null || !state.strokeColorValue.Equals(value))
		        {
			        state.strokeColorValue = value;
			        state.strokeColor = null;
                    state.pen = null;
		        }
            }
        }

	    /// <summary>
	    /// Specifies if lines are dashed.
	    /// </summary>
        public bool Dashed
        {
            set
            {
		        state.dashed = value;
            }
        }

        /// <summary>
        /// Specifies if lines are dashed.
        /// </summary>
        public bool FixDash
        {
            set
            {
                state.fixDash = value;
            }
        }

        /// <summary>
        /// Sets the dashpattern.
        /// </summary>
        public string DashPattern
        {
            set
            {
		        if (value != null && !state.dashPattern.Equals(value) && value.Length > 0)
		        {
			        String[] tokens = value.Split(' ');
                    float[] dashpattern = new float[tokens.Length];

			        for (int i = 0; i < tokens.Length; i++)
			        {
				        dashpattern[i] = (float) (float.Parse(tokens[i]));
			        }

			        state.dashPattern = dashpattern;
		        }
            }
        }

	    /// <summary>
	    /// Sets the linecap.
	    /// </summary>
        public string LineCap
        {
            set
            {
		        if (!state.lineCap.Equals(value))
		        {
			        state.lineCap = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the linejoin.
	    /// </summary>
        public string LineJoin
        {
            set
            {
		        if (!state.lineJoin.Equals(value))
		        {
			        state.lineJoin = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the miterlimit.
	    /// </summary>
        public double MiterLimit
        {
            set
            {
		        if (value != state.miterLimit)
		        {
			        state.miterLimit = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the fontsize.
	    /// </summary>
        public double FontSize
        {
            set
            {
		        if (value != state.fontSize)
		        {
			        state.fontSize = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the fontcolor.
	    /// </summary>
        public string FontColor
        {
            set
            {
                if (state.fontColorValue == null || !state.fontColorValue.Equals(value))
		        {
			        state.fontColorValue = value;
			        state.fontBrush = null;
                    state.fontColor = null;
                }
            }
	    }

        /// <summary>
        /// Default value 0. See {@link mxConstants#STYLE_FONTSTYLE}.
        /// </summary>
        public string FontBackgroundColor
        {
            set
            {
                if (state.fontBackgroundColorValue == null || !state.fontBackgroundColorValue.Equals(value))
                {
                    state.fontBackgroundColorValue = value;
                    state.fontBackgroundColor = null;
                }
            }
        }

        /// <summary>
        /// Default value 0. See {@link mxConstants#STYLE_FONTSTYLE}.
        /// </summary>
        public string FontBorderColor
        {
            set
            {
                if (state.fontBorderColorValue == null || !state.fontBorderColorValue.Equals(value))
                {
                    state.fontBorderColorValue = value;
                    state.fontBorderColor = null;
                }
            }
        }

	    /// <summary>
	    /// Sets the font family.
	    /// </summary>
        public string FontFamily
        {
            set
            {
		        if (!state.fontFamily.Equals(value))
		        {
			        state.fontFamily = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the given fontstyle.
	    /// </summary>
        public int FontStyle
        {
            set
            {
		        if (value != state.fontStyle)
		        {
			        state.fontStyle = value;
		        }
            }
	    }

	    /// <summary>
	    /// Sets the given alpha.
	    /// </summary>
        public double Alpha
        {
            set
            {
                state.alpha = value;
            }
	    }

        /// <summary>
        /// Sets the given alpha.
        /// </summary>
        public double StrokeAlpha
        {
            set
            {
                state.strokeAlpha = value;
            }
        }

        /// <summary>
        /// Sets the given alpha.
        /// </summary>
        public double FillAlpha
        {
            set
            {
                state.fillAlpha = value;
                state.brush = new SolidBrush(ParseColor(state.fillColorValue, state.fillAlpha));
            }
        }

	    /// <summary>
	    /// Sets the given fillcolor.
	    /// </summary>
        public string FillColor
        {
            set
            {
                state.fillColorValue = value;
                state.brush = new SolidBrush(ParseColor(state.fillColorValue, state.fillAlpha));
            }
	    }

        /// <summary>
        /// Default value {@link mxConstants#NONE}.
        /// </summary>
        public bool Shadow
        {
            set
            {
                state.shadow = value;
            }
        }

        /// <summary>
        /// Default value {@link mxConstants#NONE}.
        /// </summary>
        public string ShadowColor
        {
            set
            {
                if (state.shadowColorValue == null || !state.shadowColorValue.Equals(value))
                {
                    state.shadowColorValue = value;
                    state.shadowColor = null;
                }
            }
        }

        /// <summary>
        /// Default value 1. This method may add rendering overhead and should be
        /// used with care.
        /// </summary>
        public double ShadowAlpha
        {
            set
            {
                state.shadowAlpha = value;
                state.shadowColor = null;
            }
        }

        /// <summary>
        /// Prepares the canvas to draw a gradient.
        /// </summary>
        public void SetShadowOffset(double dx, double dy)
        {
            state.shadowOffsetX = dx;
            state.shadowOffsetY = dy;
        }

	    /// <summary>
	    /// Sets the given gradient.
	    /// </summary>
	    public void SetGradient(String color1, String color2, double x, double y,
			    double w, double h, String direction, double alpha1, double alpha2)
	    {
		    // LATER: Add lazy instantiation and check if paint already created
            x = (state.dx + x) * state.scale;
		    y = (state.dy + y) * state.scale;
		    h *= state.scale;
		    w *= state.scale;

            Color c1 = ParseColor(color1);

            if (alpha1 != 1)
            {
                c1 = Color.FromArgb((int)(alpha1 * 255), c1.R, c1.G, c1.B);
            }

            Color c2 = ParseColor(color2);

            if (alpha2 != 1)
            {
                c2 = Color.FromArgb((int)(alpha2 * 255), c2.R, c2.G, c2.B);
            }
		
            // FIXME: Needs to swap colors and use only horizontal and vertical
            LinearGradientMode mode = LinearGradientMode.Vertical;

            if (direction != null && direction.Length > 0
                    && !direction.Equals(mxConstants.DIRECTION_SOUTH))
            {
                if (direction.Equals(mxConstants.DIRECTION_EAST))
                {
                    mode = LinearGradientMode.Horizontal;
                }
                else if (direction.Equals(mxConstants.DIRECTION_NORTH))
                {
                    Color tmp = c1;
                    c1 = c2;
                    c2 = tmp;
                    double tmp2 = alpha1;
                    alpha1 = alpha2;
                    alpha2 = tmp2;
                }
                else if (direction.Equals(mxConstants.DIRECTION_WEST))
                {
                    mode = LinearGradientMode.Horizontal;
                    Color tmp = c1;
                    c1 = c2;
                    c2 = tmp;
                    double tmp2 = alpha1;
                    alpha1 = alpha2;
                    alpha2 = tmp2;
                }
            }

            state.brush = new LinearGradientBrush(new RectangleF((float) x, (float) y,
                (float) w, (float) h), c1, c2, mode);
	    }
        
	    /// <summary>
	    /// Helper method that uses {@link mxUtils#parseColor(String)}. Subclassers
        /// can override this to implement caching for frequently used colors.
	    /// </summary>
        protected Color ParseColor(string hex)
        {
            return ParseColor(hex, 1);
        }

	    /// <summary>
	    /// Helper method that uses {@link mxUtils#parseColor(String)}. Subclassers
        /// can override this to implement caching for frequently used colors.
	    /// </summary>
	    protected Color ParseColor(string hex, double alpha)
	    {
            if (hex == null || alpha == 0 || hex.Equals(mxConstants.NONE))
            {
                // TODO: Return null
                return Color.Transparent;
            }

            Color color = ColorTranslator.FromHtml(hex);

            // Poor man's setAlpha
            color = Color.FromArgb((int) (alpha * state.alpha * 255), color.R, color.G, color.B);

            return color;
	    }

	    /// <summary>
	    /// Draws a rectangle.
	    /// </summary>
	    public void Rect(double x, double y, double w, double h)
	    {
		    currentPath = new GraphicsPath();
		    currentPath.AddRectangle(new RectangleF((float) ((state.dx + x) * state.scale),
                    (float) ((state.dy + y) * state.scale), (float) (w * state.scale),
                    (float) (h * state.scale)));
	    }

	    /// <summary>
        /// Draws a rounded rectangle.
	    /// </summary>
	    public void Roundrect(double x, double y, double w, double h, double dx,
			    double dy)
	    {
		    Begin();
		    MoveTo(x + dx, y);
		    LineTo(x + w - dx, y);
		    QuadTo(x + w, y, x + w, y + dy);
		    LineTo(x + w, y + h - dy);
		    QuadTo(x + w, y + h, x + w - dx, y + h);
		    LineTo(x + dx, y + h);
		    QuadTo(x, y + h, x, y + h - dy);
		    LineTo(x, y + dy);
		    QuadTo(x, y, x + dx, y);
	    }

	    /// <summary>
	    /// Draws an ellipse.
	    /// </summary>
	    public void Ellipse(double x, double y, double w, double h)
	    {
		    currentPath = new GraphicsPath();
		    currentPath.AddEllipse((float) ((state.dx + x) * state.scale),
                    (float) ((state.dy + y) * state.scale), (float) (w * state.scale),
                    (float) (h * state.scale));
	    }

	    /// <summary>
	    /// Draws an image.
	    /// </summary>
	    public void Image(double x, double y, double w, double h, String src,
			    bool aspect, bool flipH, bool flipV)
	    {
		    if (src != null && w > 0 && h > 0)
		    {
			    Image image = LoadImage(src);

                if (image != null)
			    {
                    GraphicsState previous = graphics.Save();
                    Rectangle bounds = GetImageBounds(image, x, y, w, h, aspect);
                    ConfigureImageGraphics(bounds.X, bounds.Y, bounds.Width,
                        bounds.Height, flipH, flipV);
                    DrawImage(image, bounds);
                    graphics.Restore(previous);
			    }
		    }
	    }

        /// <summary>
        /// Implements the call to the graphics API.
        /// </summary>
        protected void DrawImage(Image image, Rectangle bounds)
        {
            graphics.DrawImage(image, bounds);
        }

	    /// <summary>
	    /// Loads the specified image.
	    /// </summary>
	    protected Image LoadImage(String src)
	    {
		    return mxUtils.LoadImage(src);
	    }

	    /// <summary>
	    /// Returns the bounds for the given image.
	    /// </summary>
	    protected Rectangle GetImageBounds(Image img, double x, double y,
			    double w, double h, bool aspect)
	    {
		    x = (state.dx + x) * state.scale;
		    y = (state.dy + y) * state.scale;
		    w *= state.scale;
		    h *= state.scale;

		    if (aspect)
		    {
                Size size = GetImageSize(img);
                double s = Math.Min(w / size.Width, h / size.Height);
                int sw = (int)Math.Round(size.Width * s);
                int sh = (int)Math.Round(size.Height * s);
                x += (w - sw) / 2;
                y += (h - sh) / 2;
                w = sw;
                h = sh;
		    }
		    else
		    {
			    w = Math.Round(w);
			    h = Math.Round(h);
		    }

		    return new Rectangle((int) x, (int) y, (int) w, (int) h);
	    }

        /// <summary>
        /// Returns the size for the given image.
        /// </summary>
        protected Size GetImageSize(Image image)
        {
            return new Size(image.Width, image.Height);
        }

	    /// <summary>
        /// Creates a graphic instance for rendering an image.
	    /// </summary>
	    protected void ConfigureImageGraphics(double x, double y,
			    double w, double h, bool flipH, bool flipV)
	    {
            // FIXME: Wrong results
		    if (flipH || flipV)
		    {
                float cx = (float)(x + w / 2);
                float cy = (float)(y + h / 2);

                if (flipV && flipH)
                {
                    graphics.TranslateTransform(-cx, -cy, MatrixOrder.Append);
                    graphics.RotateTransform(180, MatrixOrder.Append);
                    graphics.TranslateTransform(cx, cy, MatrixOrder.Append);
                }
                else
                {
                    double tx = (flipH) ? cx : 0;
                    int sx = (flipH) ? -1 : 1;

                    double ty = (flipV) ? cy : 0;
                    int sy = (flipV) ? -1 : 1;

                    graphics.TranslateTransform((float)-tx, (float)-ty, MatrixOrder.Append);
                    graphics.ScaleTransform(sx, sy, MatrixOrder.Append);
                    graphics.TranslateTransform((float)tx, (float)ty, MatrixOrder.Append);
                }
            }
	    }

	    /// <summary>
        /// Draws the given text.
	    /// </summary>
	    public void Text(double x, double y, double w, double h, string str, string align, string valign,
                bool wrap, string format, string overflow, bool clip, double rotation, string dir)
	    {
            bool htmlFormat = format != null && format.Equals("html");

            if (htmlFormat && !htmlAsPlainText)
            {
                return;
            }

            if (state.fontColor == null)
            {
                state.fontColor = ParseColor(state.fontColorValue);
                state.fontBrush = new SolidBrush((Color) state.fontColor);
            }

            if (state.fontColor != null && state.fontColor != Color.Transparent)
		    {
                // HTML format is currently not supported so all BR are
                // replaced with linefeeds and rendered as plain text.
                if (format != null && format.Equals("html"))
                {
                    str = str.Replace("<br/>", "\n");
                    str = str.Replace("<br>", "\n");
                }

                x = state.dx + x;
                y = state.dy + y;

                // Uses graphics-based scaling for consistent word wrapping
                graphics.ScaleTransform((float)state.scale, (float)state.scale, MatrixOrder.Append);

			    // Font-metrics needed below this line
                GraphicsState previous = graphics.Save();
                UpdateFont();

                if (rotation != 0)
                {
                    graphics.TranslateTransform((float)-(x * state.scale), (float)-(y * state.scale), MatrixOrder.Append);
                    graphics.RotateTransform((float) rotation, MatrixOrder.Append);
                    graphics.TranslateTransform((float)(x * state.scale), (float)(y * state.scale), MatrixOrder.Append);
                }

                // Workaround for inconsistent word wrapping
                if (wrap)
                {
                    w += 5;
                }

                // Workaround for y-position
                y += 1;

                PointF margin = GetMargin(align, valign);
                StringFormat fmt = CreateStringFormat(align, valign, (htmlFormat || wrapPlainText) && wrap,
                    !matchHtmlAlignment && clip && w > 0 && h > 0);
                SizeF size = graphics.MeasureString(str, lastFont, new SizeF((float)w, (float)h), fmt);
                float cw = (w == 0 || (!wrap && !clip)) ? size.Width : (float)Math.Min(size.Width, w);
                float ch = (h == 0 || (!wrap && !clip)) ? size.Height : (float)Math.Min(size.Height, h);
                float cx = (float)(x + margin.X * cw);
                float cy = (float)(y + margin.Y * ch);
                RectangleF clipRect = new RectangleF(cx, cy, cw, ch);

                if (state.fontBackgroundColorValue != null)
                {
                    if (state.fontBackgroundColor == null)
                    {
                        state.fontBackgroundColor = ParseColor(state.fontBackgroundColorValue);
                    }

                    if (state.fontBackgroundColor != null && state.fontBackgroundColor != Color.Transparent)
                    {
                        RectangleF bg = new RectangleF(clipRect.X + 1, clipRect.Y - 1, clipRect.Width - 2, clipRect.Height - 1);
                        graphics.FillRectangle(new SolidBrush((Color)state.fontBackgroundColor), bg);
                    }
                }

                if (state.fontBorderColorValue != null)
                {
                    if (state.fontBorderColor == null)
                    {
                        state.fontBorderColor = ParseColor(state.fontBorderColorValue);
                    }

                    if (state.fontBorderColor != null && state.fontBorderColor != Color.Transparent)
                    {
                        RectangleF bg = new RectangleF(clipRect.X + 1, clipRect.Y - 1, clipRect.Width - 2, clipRect.Height);
                        graphics.DrawRectangle(new Pen((Color)state.fontBorderColor), bg.X, bg.Y, bg.Width, bg.Height);
                    }
                }

                // Matches clipped vertical and horizontal alignment
                if (matchHtmlAlignment)
                {
                    if (clip && w > 0 && h > 0)
                    {
                        graphics.Clip = new Region(clipRect);
                    }

                    if (clip && size.Height > h && h > 0)
                    {
                        y -= margin.Y * (size.Height - h);
                    }
                }

                x += margin.X * w;
                y += margin.Y * h;

                // LATER: Match HTML horizontal alignment
                RectangleF bounds = new RectangleF((float)x, (float)y, (float)w, (float)h);
                graphics.DrawString(str, lastFont, state.fontBrush, bounds, fmt);
                graphics.Restore(previous);
		    }
	    }

        /**
         * 
         */
        protected PointF GetMargin(String align, String valign)
        {
            float dx = 0;
            float dy = 0;

            if (align != null)
            {
                if (align.Equals(mxConstants.ALIGN_CENTER))
                {
                    dx = -0.5f;
                }
                else if (align.Equals(mxConstants.ALIGN_RIGHT))
                {
                    dx = -1;
                }
            }

            if (valign != null)
            {
                if (valign.Equals(mxConstants.ALIGN_MIDDLE))
                {
                    dy = -0.5f;
                }
                else if (valign.Equals(mxConstants.ALIGN_BOTTOM))
                {
                    dy = -1;
                }
            }

            return new PointF(dx, dy);
        }

        /// <summary>
        /// Creates the specified string format.
        /// </summary>
        public static StringFormat CreateStringFormat(string align, string valign, bool wrap, bool clip)
        {
            StringFormat format = new StringFormat();
            format.Trimming = StringTrimming.None;

            if (!clip)
            {
                format.FormatFlags |= StringFormatFlags.NoClip;
            }

            // This is not required as the rectangle for the text will take this flag into account.
            // However, we want to avoid any possible word-wrap unless explicitely specified.
            if (!wrap)
            {
                format.FormatFlags |= StringFormatFlags.NoWrap;
            }

            if (align == null || align.Equals(mxConstants.ALIGN_LEFT))
            {
                format.Alignment = StringAlignment.Near;
            }
            else if (align.Equals(mxConstants.ALIGN_CENTER))
            {
                format.Alignment = StringAlignment.Center;                
            }
            else if (align.Equals(mxConstants.ALIGN_RIGHT))
            {
                format.Alignment = StringAlignment.Far;
            }

            if (valign == null || valign.Equals(mxConstants.ALIGN_TOP))
            {
                format.LineAlignment = StringAlignment.Near;
            }
            else if (valign.Equals(mxConstants.ALIGN_MIDDLE))
            {
                format.LineAlignment = StringAlignment.Center;
            }
            else if (valign.Equals(mxConstants.ALIGN_BOTTOM))
            {
                format.LineAlignment = StringAlignment.Far;
            }

            return format;
        }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void Begin()
	    {
		    currentPath = new GraphicsPath();
		    lastPoint = null;
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void MoveTo(double x, double y)
	    {
		    if (currentPath != null)
		    {
                // StartFigure avoids connection between last figure and new figure
                currentPath.StartFigure();
                lastPoint = new mxPoint((state.dx + x) * state.scale, (state.dy + y) * state.scale);
		    }
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void LineTo(double x, double y)
	    {
		    if (currentPath != null)
		    {
                mxPoint nextPoint = new mxPoint((state.dx + x) * state.scale, (state.dy + y) * state.scale);

                if (lastPoint != null)
                {
			        currentPath.AddLine((float) lastPoint.X, (float) lastPoint.Y,
                            (float) nextPoint.X, (float) nextPoint.Y);
                }

                lastPoint = nextPoint;
		    }
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void QuadTo(double x1, double y1, double x2, double y2)
	    {
		    if (currentPath != null)
		    {
                mxPoint nextPoint = new mxPoint((state.dx + x2) * state.scale,
                    (state.dy + y2) * state.scale);

                if (lastPoint != null)
                {
            	    double cpx0 = lastPoint.X;
				    double cpy0 = lastPoint.Y;
				    double qpx1 = (state.dx + x1) * state.scale;
				    double qpy1 = (state.dy + y1) * state.scale;
    				
				    double cpx1 = cpx0 + 2f/3f * (qpx1 - cpx0);
				    double cpy1 = cpy0 + 2f/3f * (qpy1 - cpy0);
    				
				    double cpx2 = nextPoint.X + 2f/3f * (qpx1 - nextPoint.X);
				    double cpy2 = nextPoint.Y + 2f/3f * (qpy1 - nextPoint.Y);

                    currentPath.AddBezier((float)cpx0, (float)cpy0,
                        (float)cpx1, (float)cpy1, (float)cpx2, (float)cpy2,
                        (float)nextPoint.X, (float)nextPoint.Y);
                }

                lastPoint = nextPoint;
		    }
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void CurveTo(double x1, double y1, double x2, double y2, double x3,
			    double y3)
	    {
		    if (currentPath != null)
		    {
                mxPoint nextPoint = new mxPoint((state.dx + x3) * state.scale, (state.dy + y3) * state.scale);

                if (lastPoint != null)
                {
                    currentPath.AddBezier((float)lastPoint.X, (float)lastPoint.Y,
                        (float)((state.dx + x1) * state.scale),
                        (float)((state.dy + y1) * state.scale),
                        (float)((state.dx + x2) * state.scale),
                        (float)((state.dy + y2) * state.scale),
                        (float)nextPoint.X, (float)nextPoint.Y);
                }

                lastPoint = nextPoint;
		    }
	    }

	    /// <summary>
        /// Closes the current path.
	    /// </summary>
	    public void Close()
	    {
		    if (currentPath != null)
		    {
			    currentPath.CloseFigure();
		    }
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void Stroke()
	    {
            PaintCurrentPath(false, true);
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void Fill()
	    {
            PaintCurrentPath(true, false);
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    public void FillAndStroke()
	    {
            PaintCurrentPath(true, true);
	    }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="value"></param>
        protected void PaintCurrentPath(bool filled, bool stroked)
        {
            if (currentPath != null)
            {
                if (stroked)
                {
                    if (state.strokeColor == null)
                    {
                        state.strokeColor = ParseColor(state.strokeColorValue, state.strokeAlpha);
                    }
                }

                if (state.shadow)
                {
                    PaintShadow(filled, stroked);
                }

                if (filled && state.brush != null)
                {
                    graphics.FillPath(state.brush, currentPath);
                }

                if (stroked && state.strokeColor != null && state.strokeColor != Color.Transparent)
                {
                    UpdatePen();
                    graphics.DrawPath(state.pen, currentPath);
                }
            }
        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="value"></param>
        protected void PaintShadow(bool filled, bool stroked)
        {
            if (state.shadowColor == null)
            {
                state.shadowColor = ParseColor(state.shadowColorValue);

                if (state.shadowAlpha != 1)
                {
                    Color c = (Color)state.shadowColor;
                    state.shadowColor = Color.FromArgb((int)(state.shadowAlpha * 255), c.R, c.G, c.B);
                }
            }

            if (state.shadowColor != null && state.shadowColor != Color.Transparent)
            {
                double dx = state.shadowOffsetX * state.scale;
                double dy = state.shadowOffsetY * state.scale;
                float tx = (float) dx;
                float ty = (float) dy;

                graphics.TranslateTransform(tx, ty, MatrixOrder.Append);

                // LATER: Cache shadowPen and shadowBrush
                if (filled && state.brush != null)
                {
                    Brush shadowBrush = new SolidBrush((Color)state.shadowColor);
                    graphics.FillPath(shadowBrush, currentPath);
                }

                if (stroked && state.strokeColor != null && state.strokeColor != Color.Transparent)
                {
                    Pen shadowPen = new Pen((Color)state.shadowColor, (float)state.strokeWidth);
                    graphics.DrawPath(shadowPen, currentPath);
                }

                graphics.TranslateTransform(-tx, -ty, MatrixOrder.Append);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        protected void UpdateFont()
        {
            float size = (float)(state.fontSize * mxConstants.FONT_SIZEFACTOR);
            FontStyle style = ((state.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) ?
                System.Drawing.FontStyle.Bold : System.Drawing.FontStyle.Regular;
            style |= ((state.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) ?
                System.Drawing.FontStyle.Italic : System.Drawing.FontStyle.Regular;
            style |= ((state.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) ?
                System.Drawing.FontStyle.Underline : System.Drawing.FontStyle.Regular;

            if (lastFont == null || !lastFontFamily.Equals(state.fontFamily) || size != lastFontSize || style != lastFontStyle)
            {
                lastFont = CreateFont(state.fontFamily, style, size);
                lastFontFamily = state.fontFamily;
                lastFontStyle = style;
                lastFontSize = size;
            }
        }

	    /// <summary>
        /// Hook for subclassers to implement font caching.
	    /// </summary>
        protected Font CreateFont(String family, FontStyle style, float size)
	    {
            return new Font(GetFontName(family), size, style);
	    }

        /// <summary>
        /// Returns a font name for the given font family.
        /// </summary>
        protected String GetFontName(String family)
        {
            if (family != null)
            {
                int comma = family.IndexOf(',');

                if (comma >= 0)
                {
                    family = family.Substring(0, comma);
                }
            }

            return family;
        }

	    /// <summary>
	    /// 
	    /// </summary>
	    protected void UpdatePen()
	    {
		    if (state.pen == null)
		    {
                float sw = (float)(state.strokeWidth * state.scale);
                state.pen = new Pen((Color)state.strokeColor, sw);

                System.Drawing.Drawing2D.LineCap cap = System.Drawing.Drawing2D.LineCap.Flat;

			    if (state.lineCap.Equals("round"))
			    {
				    cap = System.Drawing.Drawing2D.LineCap.Round;
			    }
			    else if (state.lineCap.Equals("square"))
			    {
                    cap = System.Drawing.Drawing2D.LineCap.Square;
			    }

                state.pen.StartCap = cap;
                state.pen.EndCap = cap;

                System.Drawing.Drawing2D.LineJoin join = System.Drawing.Drawing2D.LineJoin.Miter;

			    if (state.lineJoin.Equals("round"))
			    {
                    join = System.Drawing.Drawing2D.LineJoin.Round;
			    }
			    else if (state.lineJoin.Equals("bevel"))
			    {
                    join = System.Drawing.Drawing2D.LineJoin.Bevel;
			    }

                state.pen.LineJoin = join;
                state.pen.MiterLimit = (float) state.miterLimit;

                if (state.dashed)
                {
                    float[] dash = new float[state.dashPattern.Length];

                    for (int i = 0; i < dash.Length; i++)
                    {
                        dash[i] = (float)(state.dashPattern[i] * ((state.fixDash) ? 1 : state.strokeWidth));
                    }

                    state.pen.DashPattern = dash;
                }
		    }
	    }

	    /// <summary>
	    /// 
	    /// </summary>
	    protected class CanvasState : ICloneable
	    {
		    /// <summary>
		    /// 
		    /// </summary>
		    internal double alpha = 1;

            /// <summary>
            /// 
            /// </summary>
            internal double fillAlpha = 1;

            /// <summary>
            /// 
            /// </summary>
            internal double strokeAlpha = 1;

		    /// <summary>
		    /// 
		    /// </summary>
		    internal double scale = 1;

            /// <summary>
            /// 
            /// </summary>
		    internal double dx = 0;

            /// <summary>
            /// 
            /// </summary>
		    internal double dy = 0;

            /// <summary>
            /// 
            /// </summary>
		    internal double miterLimit = 10;

            /// <summary>
            /// 
            /// </summary>
		    internal int fontStyle = 0;

            /// <summary>
            /// 
            /// </summary>
		    internal double fontSize = mxConstants.DEFAULT_FONTSIZE;

            /// <summary>
            /// 
            /// </summary>
		    internal string fontFamily = mxConstants.DEFAULT_FONTFAMILIES;

            /// <summary>
            /// 
            /// </summary>
		    internal string fontColorValue = "#000000";

            /// <summary>
            /// 
            /// </summary>
            internal Color? fontColor;

            /// <summary>
            /// 
            /// </summary>
            internal Brush fontBrush = new SolidBrush(Color.Black);

            /// <summary>
            /// 
            /// </summary>
            internal string fontBackgroundColorValue = mxConstants.NONE;

            /// <summary>
            /// 
            /// </summary>
            internal Color? fontBackgroundColor;

            /// <summary>
            /// 
            /// </summary>
            internal string fontBorderColorValue = mxConstants.NONE;

            /// <summary>
            /// 
            /// </summary>
            internal Color? fontBorderColor;

            /// <summary>
            /// 
            /// </summary>
		    internal string lineCap = "flat";

            /// <summary>
            /// 
            /// </summary>
		    internal string lineJoin = "miter";

            /// <summary>
            /// 
            /// </summary>
		    internal double strokeWidth = 1;

            /// <summary>
            /// 
            /// </summary>
		    internal string strokeColorValue = mxConstants.NONE;

            /// <summary>
            /// 
            /// </summary>
		    internal Color? strokeColor;

            /// <summary>
            /// 
            /// </summary>
            internal string fillColorValue = mxConstants.NONE;

            /// <summary>
            /// 
            /// </summary>
		    internal Brush brush;

            /// <summary>
            /// 
            /// </summary>
            internal Pen pen;

            /// <summary>
            /// 
            /// </summary>
		    internal bool dashed = false;

            /// <summary>
            /// 
            /// </summary>
            internal bool fixDash = false;

            /// <summary>
            /// 
            /// </summary>
            internal float[] dashPattern = { 3, 3 };

            /// <summary>
            /// 
            /// </summary>
            internal bool shadow = false;

            /// <summary>
            /// 
            /// </summary>
            internal string shadowColorValue = mxConstants.NONE;

            /// <summary>
            /// 
            /// </summary>
            internal Color? shadowColor;

            /// <summary>
            /// 
            /// </summary>
            internal double shadowAlpha = 1;

            /// <summary>
            /// 
            /// </summary>
            internal double shadowOffsetX = mxConstants.SHADOW_OFFSETX;

            /// <summary>
            /// 
            /// </summary>
            internal double shadowOffsetY = mxConstants.SHADOW_OFFSETY;

            /// <summary>
            /// 
            /// </summary>
            internal GraphicsState state;

            /// <summary>
            /// 
            /// </summary>
		    public Object Clone()
		    {
			    return MemberwiseClone();
		    }
	    }
    }
}
