// $Id: mxGdiCanvas.cs,v 1.88 2012-03-24 11:58:09 gaudenz Exp $
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
    /// Implementation of a canvas that uses GDI for painting.
    /// </summary>
    public class mxGdiCanvas : mxBasicCanvas
    {

        /// <summary>
        /// Specifies if image aspect should be preserved in drawImage.
        /// </summary>
        public static bool PRESERVE_IMAGE_ASPECT = true;

        /// <summary>
        /// Cache for loading images.
        /// </summary>
        protected Dictionary<string, Image> imageCache = new Dictionary<string, Image>();

        /// <summary>
        /// Global graphics handle to the image.
        /// </summary>
        protected Graphics g;

        /// <summary>
        /// Constructs a new GDI canvas.
        /// </summary>
        public mxGdiCanvas(): this(null) {}

        /// <summary>
        /// Constructs a new GDI canvas for the given graphics instance.
        /// </summary>
        public mxGdiCanvas(Graphics g)
        {
            this.g = g;
        }

        /// <summary>
        /// Sets or gets the graphics object to paint the canvas.
        /// </summary>
        public Graphics Graphics
        {
            get { return g; }
            set { g = value; }
        }

        /// <summary>
        /// Returns an image instance for the given URL. If the URL has
        /// been loaded before than an instance of the same instance is
        /// returned as in the previous call.
        /// </summary>
        protected Image LoadImage(String image)
        {
            Image img = (imageCache.ContainsKey(image)) ? imageCache[image] : null;

            if (img == null)
            {
                img = mxUtils.LoadImage(image);

                if (img != null)
                {
                    imageCache[image] = img;
                }
            }

            return img;
        }

        /// <summary>
        /// see com.mxgraph.mxICanvas.DrawCell()
        /// </summary>
        public override Object DrawCell(mxCellState state)
        {
            Dictionary<string, object> style = state.Style;
            GraphicsState graphicsState = g.Save();

            // Applies the local translation
            g.TranslateTransform(translate.X, translate.Y);

            // Checks if the cell is an edge
            if (state.AbsolutePointCount() > 1)
            {
                DrawLine(state.AbsolutePoints, style);
            }
            else
            {
                Rectangle bounds = state.GetRectangle();
                int x = bounds.X;
                int y = bounds.Y;
                int w = bounds.Width;
                int h = bounds.Height;

                // Applies the rotation on the graphics object and stores
                // the previous transform so that it can be restored
                float rotation = mxUtils.GetFloat(style, mxConstants.STYLE_ROTATION);

                if (rotation != 0)
                {
                    int cx = x + w / 2;
                    int cy = y + h / 2;

                    g.TranslateTransform(cx, cy);
                    g.RotateTransform(rotation);
                    g.TranslateTransform(-cx, -cy);
                }

                // Draws a swimlane if start is > 0
                string shape = mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "");

                if (!shape.Equals(mxConstants.SHAPE_SWIMLANE))
                {
                    // NOTE: Should draw built-in shapes first
                    mxStencil stencil = mxStencilRegistry.GetStencil(shape);

                    if (stencil != null)
                    {
                        stencil.PaintShape(this, state);
                    }
                    else
                    {
                        DrawShape(x, y, w, h, style);
                    }
                }
                else
                {
                    int start = (int)Math.Round(mxUtils.GetDouble(style,
                        mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE) * scale);

                    // Removes some styles to draw the content area
                    Dictionary<string, Object> cloned = new Dictionary<string, Object>(style);
                    cloned.Remove(mxConstants.STYLE_FILLCOLOR);
                    cloned.Remove(mxConstants.STYLE_ROUNDED);

                    if (mxUtils.IsTrue(style, mxConstants.STYLE_HORIZONTAL, true))
                    {
                        DrawShape(x, y, w, Math.Min(h, start), style);
                        DrawShape(x, y + start, w, h - start, cloned);
                    }
                    else
                    {
                        DrawShape(x, y, Math.Min(w, start), h, style);
                        DrawShape(x + start, y, w - start, h, cloned);
                    }
                }
            }

            // Resets all changes to the graphics configuration
            g.Restore(graphicsState);

            return null;
        }

        /// <summary>
        /// see com.mxgraph.mxICanvas.DrawLabel()
        /// </summary>
        public override Object DrawLabel(string text, mxCellState state, bool html)
        {
            Dictionary<string, object> style = state.Style;
            GraphicsState graphicsState = g.Save();

            // Applies the local translation
            g.TranslateTransform(translate.X, translate.Y);

            Rectangle bounds = (state.LabelBounds != null) ? state.LabelBounds.GetRectangle() : state.GetRectangle();
            DrawText(text, bounds.X, bounds.Y, bounds.Width, bounds.Height, style);

            // Resets all changes to the graphics configuration
            g.Restore(graphicsState);

            return null;
        }

        /// <summary>
        /// Draws the shape specified with the STYLE_SHAPE key in the given style.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="style">Style of the the shape.</param>
        public void DrawShape(int x, int y, int w, int h,
                Dictionary<string, Object> style)
        {
            // Draws the shape
            string shape = mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "");
            bool image = shape.Equals(mxConstants.STYLE_IMAGE);

            // Redirects background styles for image shapes
            string fillStyle = (image) ? mxConstants.STYLE_IMAGE_BACKGROUND : mxConstants.STYLE_FILLCOLOR;
            string strokeStyle = (image) ? mxConstants.STYLE_IMAGE_BORDER : mxConstants.STYLE_STROKECOLOR;

            // Prepares the background and foreground
            Pen pen = null;
            Color? penColor = mxUtils.GetColor(style, strokeStyle);
            float penWidth = mxUtils.GetFloat(style, mxConstants.STYLE_STROKEWIDTH, 1);

            Brush brush = null;
            Color? fillColor = mxUtils.GetColor(style, fillStyle);
            float opacity = mxUtils.GetFloat(style, mxConstants.STYLE_OPACITY, 100);
            int alpha = (int)(255 * opacity / 100);

            bool shadow = mxUtils.IsTrue(style, mxConstants.STYLE_SHADOW, false);

            if (fillColor != null)
            {
                Color fill = (Color)fillColor;

                if (opacity != 100)
                {
                    fill = Color.FromArgb(alpha, fill.R, fill.G, fill.B);
                }

                Color? gradientColor = mxUtils.GetColor(style, mxConstants.STYLE_GRADIENTCOLOR);

                if (gradientColor != null)
                {
                    String gradientDirection = mxUtils.GetString(style,
                            mxConstants.STYLE_GRADIENT_DIRECTION,
                            mxConstants.DIRECTION_SOUTH);
                    LinearGradientMode mode = LinearGradientMode.Vertical;
                    Color start = fill;
                    Color stop = (Color)gradientColor;

                    if (gradientDirection.Equals(mxConstants.DIRECTION_EAST))
                    {
                        Color tmp = start;
                        start = stop;
                        stop = tmp;

                        mode = LinearGradientMode.Horizontal;
                    }
                    else if (gradientDirection.Equals(mxConstants.DIRECTION_NORTH))
                    {
                        Color tmp = start;
                        start = stop;
                        stop = tmp;
                    }
                    else if (gradientDirection.Equals(mxConstants.DIRECTION_WEST))
                    {
                        mode = LinearGradientMode.Horizontal;
                    }

                    Rectangle area = new Rectangle(x, y, w, h);
                    brush = new LinearGradientBrush(area, start, stop, mode);
                }
                else
                {
                    brush = new SolidBrush(fill);
                }
            }

            // Prepares the foreground
            if (penColor != null && penWidth > 0)
            {
                pen = new Pen((Color)penColor, (float) (penWidth * scale));

                if (mxUtils.IsTrue(style, mxConstants.STYLE_DASHED, false))
                {
                    pen.DashPattern = new float[] { (float)(3 * scale), (float)(3 * scale) };
                }
            }

            switch (shape)
            {
                 case (mxConstants.SHAPE_ELLIPSE):
                {
                    DrawOval(x, y, w, h, brush, pen, shadow);
                    break;
                }
                case (mxConstants.SHAPE_LINE):
                {
                    string direction = mxUtils
                            .GetString(style, mxConstants.STYLE_DIRECTION,
                                    mxConstants.DIRECTION_EAST);

                    if (direction.Equals(mxConstants.DIRECTION_EAST)
                            || direction.Equals(mxConstants.DIRECTION_WEST))
                    {
                        int mid = (int)(y + h / 2);
                        g.DrawLine(pen, x, mid, x + w, mid);
                    }
                    else
                    {
                        int mid = (int)(x + w / 2);
                        g.DrawLine(pen, mid, y, mid, y + h);
                    }

                    break;
                }
                case (mxConstants.SHAPE_DOUBLE_ELLIPSE):
                {
                    DrawOval(x, y, w, h, brush, pen, shadow);

                    int inset = (int)(3 + penWidth * scale);
                    x += inset;
                    y += inset;
                    w -= 2 * inset;
                    h -= 2 * inset;
                    DrawOval(x, y, w, h, null, pen, false);
                    break;
                }
                case (mxConstants.SHAPE_RHOMBUS):
                {
                    DrawRhombus(x, y, w, h, brush, pen, shadow);
                    break;
                }
                case (mxConstants.SHAPE_CYLINDER):
                {
                    DrawCylinder(x, y, w, h, brush, pen, shadow);
                    break;
                }
                case (mxConstants.SHAPE_ACTOR):
                {
                    DrawActor(x, y, w, h, brush, pen, shadow);
                    break;
                }
                case (mxConstants.SHAPE_CLOUD):
                {
                    DrawCloud(x, y, w, h, brush, pen, shadow);
                    break;
                }
                case (mxConstants.SHAPE_TRIANGLE):
                {
                    string direction = mxUtils.GetString(style, mxConstants.STYLE_DIRECTION, "");
                    DrawTriangle(x, y, w, h, brush, pen, shadow, direction);
                    break;
                }
                case (mxConstants.SHAPE_HEXAGON):
                {
                    string direction = mxUtils.GetString(style, mxConstants.STYLE_DIRECTION, "");
                    DrawHexagon(x, y, w, h, brush, pen, shadow, direction);
                    break;
                }
                default:
                {
                    bool rounded = mxUtils.IsTrue(style, mxConstants.STYLE_ROUNDED);
                    DrawRect(x, y, w, h, brush, pen, shadow, rounded);

                    bool flipH = mxUtils.IsTrue(style, mxConstants.STYLE_IMAGE_FLIPH, false);
                    bool flipV = mxUtils.IsTrue(style, mxConstants.STYLE_IMAGE_FLIPV, false);

                    // Draws the image as a shape
                    if (image)
                    {
                        string img = GetImageForStyle(style);

                        if (img != null)
                        {
                            DrawImage(x, y, w, h, img, PRESERVE_IMAGE_ASPECT, flipH, flipV);
                        }
                    }

                    // Draws the image of the label inside the label shape
                    if (shape.Equals(mxConstants.SHAPE_LABEL))
                    {
                        string img = GetImageForStyle(style);

                        if (img != null)
                        {
                            string imgAlign = mxUtils.GetString(style,
                                    mxConstants.STYLE_IMAGE_ALIGN,
                                    mxConstants.ALIGN_LEFT);
                            string imgValign = mxUtils.GetString(style,
                                    mxConstants.STYLE_IMAGE_VERTICAL_ALIGN,
                                    mxConstants.ALIGN_MIDDLE);
                            int imgWidth = (int)(mxUtils.GetInt(style,
                                    mxConstants.STYLE_IMAGE_WIDTH,
                                    mxConstants.DEFAULT_IMAGESIZE) * scale);
                            int imgHeight = (int)(mxUtils.GetInt(style,
                                    mxConstants.STYLE_IMAGE_HEIGHT,
                                    mxConstants.DEFAULT_IMAGESIZE) * scale);
                            int spacing = (int)(mxUtils.GetInt(style,
                                    mxConstants.STYLE_SPACING, 2) * scale);

                            int imgX = x;

                            if (imgAlign.Equals(mxConstants.ALIGN_CENTER))
                            {
                                imgX += (w - imgWidth) / 2;
                            }
                            else if (imgAlign.Equals(mxConstants.ALIGN_RIGHT))
                            {
                                imgX += w - imgWidth - spacing;
                            }
                            else // LEFT
                            {
                                imgX += spacing;
                            }

                            int imgY = y;

                            if (imgValign.Equals(mxConstants.ALIGN_TOP))
                            {
                                imgY += spacing;
                            }
                            else if (imgValign.Equals(mxConstants.ALIGN_BOTTOM))
                            {
                                imgY += h - imgHeight - spacing;
                            }
                            else // MIDDLE
                            {
                                imgY += (h - imgHeight) / 2;
                            }

                            DrawImage(imgX, imgY, imgWidth, imgHeight, img);
                        }

                        // Paints the glass effect for labels
                        if (mxUtils.IsTrue(style, mxConstants.STYLE_GLASS, false))
                        {
                            DrawGlassEffect(x, y, w, h, style);
                        }
                    }

                    break;
                }
            }
        }

        /// <summary>
        /// Draws the glass effect.
        /// </summary>
        protected void DrawGlassEffect(int x, int y, int w, int h,
                Dictionary<string, Object> style)
        {
            double size = 0.4;
            int sw = (int)Math.Ceiling(mxUtils.GetFloat(style,
                mxConstants.STYLE_STROKEWIDTH, 1) * scale / 2); 

            Rectangle area = new Rectangle(x - sw - 1,
                y - sw - 1, w + 2 * sw + 1, (int)(h * 0.9));
            Brush brush = new LinearGradientBrush(area, Color.FromArgb((int)(255 * 0.9), 255, 255, 255),
                Color.FromArgb(0, 255, 255, 255), LinearGradientMode.Vertical);

            GraphicsPath path = new GraphicsPath();
            
            path.AddLine(x - sw, y - sw,
                x - sw, (int)Math.Ceiling(y + h * size));
            // FIXME: Use quadratic curve here via x + w / 2, y + h * 0.7
            path.AddBezier(x - sw, (int)(y + h * size),
                (int)(x + w * 0.3), (int)(y + h * 0.6),
                (int)(x + w * 0.7), (int)(y + h * 0.6),
                x + w + sw, (int)(y + h * size));
            path.AddLine(x + w + sw, (int)(y + h * size),
                x + w + sw, y - sw);
            path.CloseFigure();

            g.FillPath(brush, path);
        }

        /// <summary>
        /// Draws a a polygon for the given parameters.
        /// </summary>
        /// <param name="polygon">Points of the polygon.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawPolygon(Point[] polygon, Brush brush, Pen pen, bool shadow)
        {
            if (brush != null)
            {
                if (shadow)
                {
                    g.TranslateTransform(mxConstants.SHADOW_OFFSETX, mxConstants.SHADOW_OFFSETY);
                    Brush shadowBrush = new SolidBrush(mxConstants.SHADOWCOLOR);
                    g.FillPolygon(shadowBrush, polygon);
                    g.TranslateTransform(-mxConstants.SHADOW_OFFSETX, -mxConstants.SHADOW_OFFSETY);
                }

                g.FillPolygon(brush, polygon);
            }

            if (pen != null)
            {
                g.DrawPolygon(pen, polygon);
            }
        }
        /// <summary>
        /// Draws a path for the given parameters.
        /// </summary>
        /// <param name="path">Path object to be drawn.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawPath(GraphicsPath path, Brush brush, Pen pen, bool shadow)
        {
            if (brush != null)
            {
                if (shadow)
                {
                    g.TranslateTransform(mxConstants.SHADOW_OFFSETX, mxConstants.SHADOW_OFFSETY);
                    Brush shadowBrush = new SolidBrush(mxConstants.SHADOWCOLOR);
                    g.FillPath(shadowBrush, path);
                    g.TranslateTransform(-mxConstants.SHADOW_OFFSETX, -mxConstants.SHADOW_OFFSETY);
                }

                g.FillPath(brush, path);
            }

            if (pen != null)
            {
                g.DrawPath(pen, path);
            }
        }

        /// <summary>
        /// Draws a rectangle for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        /// <param name="rounded">Boolean indicating if the rectangle is rounded.</param>
        protected void DrawRect(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow,
            bool rounded)
        {
            if (rounded)
            {
                GraphicsPath path = new GraphicsPath();
                int radius = getArcSize(w, h);
                path.AddLine(x + radius, y, x + w - radius, y);
                path.AddArc(x + w - radius, y, radius, radius, 270, 90);
                path.AddLine(x + w, y + radius, x + w, y + h - radius);
                path.AddArc(x + w - radius, y + h - radius, radius, radius, 0, 90);
                path.AddLine(x + w - radius, y + h, x + radius, y + h);
                path.AddArc(x, y + h - radius, radius, radius, 90, 90);
                path.AddLine(x, y + h - radius, x, y + radius);
                path.AddArc(x, y, radius, radius, 180, 90);
                path.CloseFigure();

                DrawPath(path, brush, pen, shadow);
            }
            else
            {
                if (brush != null)
                {
                    if (shadow)
                    {
                        Brush shadowBrush = new SolidBrush(mxConstants.SHADOWCOLOR);
                        g.FillRectangle(shadowBrush, x + mxConstants.SHADOW_OFFSETX,
                            y + mxConstants.SHADOW_OFFSETY, w, h);
                    }

                    g.FillRectangle(brush, x, y, w, h);
                }

                if (pen != null)
                {
                    g.DrawRectangle(pen, x, y, w, h);
                }
            }
        }
        
        /// <summary>
        /// Draws an image for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the image.</param>
        /// <param name="y">Y-coordinate of the image.</param>
        /// <param name="w">Width of the image.</param>
        /// <param name="h">Height of the image.</param>
        /// <param name="image">URL of the image.</param>
        protected void DrawImage(int x, int y, int w, int h, String image)
        {
            DrawImage(x, y, w, h, image, PRESERVE_IMAGE_ASPECT, false, false);
        }

        /// <summary>
        /// Draws an image for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the image.</param>
        /// <param name="y">Y-coordinate of the image.</param>
        /// <param name="w">Width of the image.</param>
        /// <param name="h">Height of the image.</param>
        /// <param name="image">URL of the image.</param>
        protected void DrawImage(int x, int y, int w, int h, String image,
            bool preserveAspect, bool flipH, bool flipV)
        {
            Image img = LoadImage(image);

            if (img != null)
            {
                if (preserveAspect)
                {
                    double iw = img.Width;
                    double ih = img.Height;
                    double s = Math.Min(w / iw, h / ih);
                    x += (int)(w - iw * s) / 2;
                    y += (int)(h - ih * s) / 2;
                    w = (int)(iw * s);
                    h = (int)(ih * s);
                }

                if (flipH || flipV)
                {
                    img = (Image) img.Clone();
                }

                if (flipH && flipV)
                {
                    img.RotateFlip(RotateFlipType.RotateNoneFlipXY);
                }
                else if (flipH)
                {
                    img.RotateFlip(RotateFlipType.RotateNoneFlipX);
                }
                else if (flipV)
                {
                    img.RotateFlip(RotateFlipType.RotateNoneFlipY);
                }

                g.DrawImage(img, x, y, w, h);
            }
        }

        /// <summary>
        /// Draws an oval for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawOval(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow)
        {
            if (brush != null)
            {
                if (shadow)
                {
                    Brush shadowBrush = new SolidBrush(mxConstants.SHADOWCOLOR);
                    g.FillEllipse(shadowBrush, x + mxConstants.SHADOW_OFFSETX,
                        y + mxConstants.SHADOW_OFFSETY, w, h);
                }

                g.FillEllipse(brush, x, y, w, h);
            }

            if (pen != null)
            {
                g.DrawEllipse(pen, x, y, w, h);
            }
        }

        /// <summary>
        /// Draws an rhombus (aka. diamond) for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawRhombus(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow)
        {
            int halfWidth = w / 2;
            int halfHeight = h / 2;
            Point[] diamond = new Point[]{new Point(x+halfWidth, y),
                        new Point(x+w, y+halfHeight), new Point(x+halfWidth, y+h),
                        new Point(x, y+halfHeight)};

            DrawPolygon(diamond, brush, pen, shadow);
        }

        /// <summary>
        /// Draws a cylinder for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawCylinder(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow)
        {
            int h4 = h / 4;
            int r = w - 1;

            if (brush != null)
            {
                GraphicsPath path = new GraphicsPath(FillMode.Winding);
                path.AddRectangle(new Rectangle(x,
                    y + h4 / 2, r, h - h4));
                path.AddEllipse(new Rectangle(x, y, r, h4));
                path.AddEllipse(new Rectangle(x, y + h - h4, r, h4));

                DrawPath(path, brush, null, shadow);
            }

            if (pen != null)
            {
                int h2 = h4 / 2;
                g.DrawEllipse(pen, x, y, r, h4);
                g.DrawLine(pen, x, y + h2, x, y + h - h2);
                g.DrawLine(pen, x + w - 1, y + h2, x + w - 1,
                        y + h - h2);
                g.DrawArc(pen, x, y + h - h4, r, h4, 0, 180);
            }
        }

        /// <summary>
        /// Draws an actor shape for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawActor(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow)
        {
            int width = w * 2 / 6;

            GraphicsPath path = new GraphicsPath(FillMode.Winding);

            path.StartFigure();
            path.AddBezier(new Point(x, y + h), new Point(x, y + 3 * h / 5), new Point(x, y + 2 * h / 5), new Point(x + w / 2, y + 2 * h
                    / 5));
            path.AddBezier(new Point(x + w / 2, y + 2 * h
                    / 5), new Point(x + w / 2 - width, y + 2 * h / 5), new Point(x + w / 2 - width, y), new Point(x
                    + w / 2, y));
            path.AddBezier(new Point(x + w / 2, y), new Point(x + w / 2 + width, y), new Point(x + w / 2 + width, y + 2 * h / 5), new Point(x
                    + w / 2, y + 2 * h / 5));
            path.AddBezier(new Point(x
                    + w / 2, y + 2 * h / 5), new Point(x + w, y + 2 * h / 5), new Point(x + w, y + 3 * h / 5), new Point(x + w, y + h));
            path.CloseFigure();

            DrawPath(path, brush, pen, shadow);
        }

        /// <summary>
        /// Draws a cloud shape for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        protected void DrawCloud(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow)
        {
            GraphicsPath path = new GraphicsPath(FillMode.Winding);

            path.StartFigure();
            path.AddBezier(new Point((int)(x + 0.25 * w), (int)(y + 0.25 * h)), new Point((int)(x + 0.05 * w),
                    (int)(y + 0.25 * h)), new Point((int)x, (int)(y + 0.5 * h)), new Point((int)(x + 0.16 * w),
                    (int)(y + 0.55 * h)));
            path.AddBezier(new Point((int)(x + 0.16 * w),
                    (int)(y + 0.6 * h)), new Point((int)x, (int)(y + 0.66 * h)), new Point((int)(x + 0.18 * w),
                    (int)(y + 0.9 * h)), new Point((int)(x + 0.31 * w),
                    (int)(y + 0.8 * h)));
            path.AddBezier(new Point((int)(x + 0.31 * w),
                    (int)(y + 0.8 * h)), new Point((int)(x + 0.4 * w), (int)(y + h)), new Point((int)(x + 0.7 * w),
                    (int)(y + h)), new Point((int)(x + 0.8 * w),
                    (int)(y + 0.8 * h)));
            path.AddBezier(new Point((int)(x + 0.8 * w),
                    (int)(y + 0.8 * h)), new Point((int)(x + w), (int)(y + 0.8 * h)), new Point((int)(x + w),
                    (int)(y + 0.6 * h)), new Point((int)(x + 0.875 * w),
                    (int)(y + 0.5 * h)));
            path.AddBezier(new Point((int)(x + 0.875 * w),
                    (int)(y + 0.5 * h)), new Point((int)(x + w), (int)(y + 0.3 * h)), new Point((int)(x + 0.8 * w),
                    (int)(y + 0.1 * h)), new Point((int)(x + 0.625 * w), (int)(y + 0.2 * h)));
            path.AddBezier(new Point((int)(x + 0.625 * w), (int)(y + 0.2 * h)), new Point((int)(x + 0.5 * w),
                    (int)(y + 0.05 * h)), new Point((int)(x + 0.3 * w), (int)(y + 0.05 * h)),
                    new Point((int)(x + 0.25 * w), (int)(y + 0.25 * h)));
            path.CloseFigure();

            DrawPath(path, brush, pen, shadow);
        }

        /// <summary>
        /// Draws a triangle shape for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        /// <param name="direction">Specifies the direction of the triangle.</param>
        protected void DrawTriangle(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow, string direction)
        {
            Point[] triangle = null;

            if (direction.Equals(mxConstants.DIRECTION_NORTH))
            {
                triangle = new Point[]{
                    new Point(x, y + h),
                    new Point(x+w/2, y),
                    new Point(x+w, y+h)};
            }
            else if (direction.Equals(mxConstants.DIRECTION_SOUTH))
            {
                triangle = new Point[]{
                    new Point(x, y),
                    new Point(x+w/2, y+h),
                    new Point(x+w, y)};
            }
            else if (direction.Equals(mxConstants.DIRECTION_WEST))
            {
                triangle = new Point[]{
                    new Point(x + w, y),
                    new Point(x, y+h/2),
                    new Point(x + w, y+h)};
            }
            else // east
            {
                triangle = new Point[]{
                    new Point(x, y),
                    new Point(x+w, y+h/2),
                    new Point(x, y+h)};
            }

            DrawPolygon(triangle, brush, pen, shadow);
        }

        /// <summary>
        /// Draws a hexagon shape for the given parameters.
        /// </summary>
        /// <param name="x">X-coordinate of the shape.</param>
        /// <param name="y">Y-coordinate of the shape.</param>
        /// <param name="w">Width of the shape.</param>
        /// <param name="h">Height of the shape.</param>
        /// <param name="brush">Optional brush for painting the background.</param>
        /// <param name="pen">Optional pen for painting the border.</param>
        /// <param name="shadow">Boolean indicating if a shadow should be painted.</param>
        /// <param name="direction">Specifies the direction of the hexagon.</param>
        protected void DrawHexagon(int x, int y, int w, int h, Brush brush, Pen pen, bool shadow, string direction)
        {
            Point[] hexagon = null;

            if (direction.Equals(mxConstants.DIRECTION_NORTH) ||
                direction.Equals(mxConstants.DIRECTION_SOUTH))
            {
                hexagon = new Point[]{
                    new Point(x + (int)(0.5 * w), y),
                    new Point(x + w, y + (int)(0.25 * h)),
                    new Point(x + w, y + (int)(0.75 * h)),
                    new Point(x + (int)(0.5 * w), y + h),
                    new Point(x, y + (int)(0.75 * h)),
                    new Point(x, y + (int)(0.25 * h))};
            }
            else
            {
                hexagon = new Point[]{
                    new Point(x + (int) (0.25 * w), y),
                    new Point(x + (int)(0.75 * w), y),
                    new Point(x + w, y + (int)(0.5 * h)),
                    new Point(x + (int)(0.75 * w), y + h),
                    new Point(x + (int)(0.25 * w), y + h),
                    new Point(x, y + (int)(0.5 * h))};
            }

            DrawPolygon(hexagon, brush, pen, shadow);
        }

        /// <summary>
        /// Computes the arc size for the given dimension.
        /// </summary>
        /// <param name="w">Width of the rectangle.</param>
        /// <param name="h">Height of the rectangle.</param>
        /// <returns>Returns the arc size for the given dimension.</returns>
        public static int getArcSize(int w, int h)
        {
            int arcSize;

            if (w <= h)
            {
                arcSize = h / 5;
                if (arcSize > (w / 2))
                {
                    arcSize = w / 2;
                }
            }
            else
            {
                arcSize = w / 5;
                if (arcSize > (h / 2))
                {
                    arcSize = h / 2;
                }
            }
            return arcSize;
        }

        /// <summary>
        /// Draws the given lines as segments between all points of the given list
        /// of mxPoints.
        /// </summary>
        /// <param name="pts">List of points that define the line.</param>
        /// <param name="style">Style to be used for painting the line.</param>
        public void DrawLine(List<mxPoint> pts, Dictionary<string, Object> style)
        {
            Color? penColor = mxUtils.GetColor(style, mxConstants.STYLE_STROKECOLOR, Color.Black);
            float penWidth = mxUtils.GetFloat(style, mxConstants.STYLE_STROKEWIDTH, 1);
            Boolean rounded = mxUtils.IsTrue(style, mxConstants.STYLE_ROUNDED, false);

            if (penColor != null && penWidth > 0)
            {
                Pen pen = new Pen((Color)penColor, (float)(penWidth * scale));

                if (mxUtils.IsTrue(style, mxConstants.STYLE_DASHED, false))
                {
                    float[] tmp = { (float)(3 * scale), (float)(3 * scale) };
                    pen.DashPattern = tmp;
                }

                // Draws the shape
                string shape = mxUtils.GetString(style, mxConstants.STYLE_SHAPE, "");

                switch (shape)
                {
                    case (mxConstants.SHAPE_ARROW):
                    {
                        // Base vector (between end points)
                        mxPoint p0 = pts[0];
                        mxPoint pe = pts[pts.Count - 1];

                        int x = (int) Math.Min(p0.X, pe.X);
                        int y = (int) Math.Min(p0.Y, pe.Y);
                        int x1 = (int) Math.Max(p0.X, pe.X);
                        int y1 = (int) Math.Max(p0.Y, pe.Y);
                        int w = x1 - x;
                        int h = y1 - y;

                        Rectangle bounds = new Rectangle(x, y, w, h);
                        
                        bool shadow = mxUtils.IsTrue(style, mxConstants.STYLE_SHADOW, false);
                        Color? fillColor = mxUtils.GetColor(style, mxConstants.STYLE_FILLCOLOR);
                        float opacity = mxUtils.GetFloat(style, mxConstants.STYLE_OPACITY, 100);
                        int alpha = (int)(255 * opacity / 100);
                        Brush brush = null;

                        if (fillColor != null)
                        {
                            Color fill = (Color)fillColor;

                            if (opacity != 100)
                            {
                                fill = Color.FromArgb(alpha, fill.R, fill.G, fill.B);
                            }

                            Color? gradientColor = mxUtils.GetColor(style, mxConstants.STYLE_GRADIENTCOLOR);

                            if (gradientColor != null)
                            {
                                String gradientDirection = mxUtils.GetString(style,
                                        mxConstants.STYLE_GRADIENT_DIRECTION);
                                LinearGradientMode mode = LinearGradientMode.ForwardDiagonal;

                                if (gradientDirection != null
                                        && !gradientDirection
                                                .Equals(mxConstants.DIRECTION_SOUTH))
                                {
                                    if (gradientDirection.Equals(mxConstants.DIRECTION_EAST))
                                    {
                                        mode = LinearGradientMode.BackwardDiagonal;
                                    }
                                    else if (gradientDirection.Equals(mxConstants.DIRECTION_NORTH))
                                    {
                                        mode = LinearGradientMode.Horizontal;
                                    }
                                    else if (gradientDirection.Equals(mxConstants.DIRECTION_WEST))
                                    {
                                        mode = LinearGradientMode.Vertical;
                                    }
                                }

                                brush = new LinearGradientBrush(bounds, fill, (Color)gradientColor, mode);
                            }
                            else
                            {
                                brush = new SolidBrush(fill);
                            }
                        }

                        // Geometry of arrow
                        double spacing = mxConstants.ARROW_SPACING * scale;
                        double width = mxConstants.ARROW_WIDTH * scale;
                        double arrow = mxConstants.ARROW_SIZE * scale;

                        double dx = pe.X - p0.X;
                        double dy = pe.Y - p0.Y;
                        double dist = Math.Sqrt(dx * dx + dy * dy);
                        double length = dist - 2 * spacing - arrow;

                        // Computes the norm and the inverse norm
                        double nx = dx / dist;
                        double ny = dy / dist;
                        double basex = length * nx;
                        double basey = length * ny;
                        double floorx = width * ny / 3;
                        double floory = -width * nx / 3;

                        // Computes points
                        double p0x = p0.X - floorx / 2 + spacing * nx;
                        double p0y = p0.Y - floory / 2 + spacing * ny;
                        double p1x = p0x + floorx;
                        double p1y = p0y + floory;
                        double p2x = p1x + basex;
                        double p2y = p1y + basey;
                        double p3x = p2x + floorx;
                        double p3y = p2y + floory;
                        // p4 not necessary
                        double p5x = p3x - 3 * floorx;
                        double p5y = p3y - 3 * floory;

                        Point[] poly = new Point[]{
                            new Point((int) p0x, (int) p0y),
                            new Point((int) p1x, (int) p1y),
                            new Point((int) p2x, (int) p2y),
                            new Point((int) p3x, (int) p3y),
                            new Point((int) (pe.X - spacing * nx), (int) (pe
                                .Y - spacing * ny)),
                            new Point((int) p5x, (int) p5y),
                            new Point((int) (p5x + floorx), (int) (p5y + floory))};
                        DrawPolygon(poly, brush, pen, shadow);

                        break;
                    }
                    default:
                    {
                        // TODO: Move code into DrawConnector method

                        // Draws the start marker
                        Object marker = mxUtils.GetString(style, mxConstants.STYLE_STARTARROW);

                        mxPoint p0 = pts[0];
                        mxPoint pt = pts[1];
                        mxPoint offset = null;

                        if (marker != null)
                        {
                            float size = (float) (mxUtils.GetFloat(style, mxConstants.STYLE_STARTSIZE,
                                mxConstants.DEFAULT_MARKERSIZE));
                            offset = DrawMarker(marker, pt, p0, size, pen);
                        }
                        else
                        {
                            double dx = pt.X - p0.X;
                            double dy = pt.Y - p0.Y;

                            double dist = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
                            double nx = dx * penWidth * scale / dist;
                            double ny = dy * penWidth * scale / dist;

                            offset = new mxPoint(nx / 2, ny / 2);
                        }

                        // Applies offset to point
                        if (offset != null)
                        {
                            p0 = p0.Clone();
                            p0.X += offset.X;
                            p0.Y += offset.Y;

                            offset = null;
                        }

                        // Draws the end marker
                        marker = mxUtils.GetString(style, mxConstants.STYLE_ENDARROW);

                        mxPoint pe = pts[pts.Count - 1];
                        pt = pts[pts.Count - 2];

                        if (marker != null)
                        {
                            float size = (float) (mxUtils.GetFloat(style, mxConstants.STYLE_ENDSIZE,
                                 mxConstants.DEFAULT_MARKERSIZE));
                            offset = DrawMarker(marker, pt, pe, size, pen);
                        }
                        else
                        {
                            double dx = pt.X - p0.X;
                            double dy = pt.Y - p0.Y;

                            double dist = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
                            double nx = dx * penWidth * scale / dist;
                            double ny = dy * penWidth * scale / dist;

                            offset = new mxPoint(nx / 2, ny / 2);
                        }

                        // Applies offset to the point
                        if (offset != null)
                        {
                            pe = pe.Clone();
                            pe.X += offset.X;
                            pe.Y += offset.Y;

                            offset = null;
                        }

                        // Draws the line using a GraphicsPath
                        GraphicsPath path = new GraphicsPath();
                        double arcSize = mxConstants.LINE_ARCSIZE * scale;
                        pt = p0;

                        for (int i = 1; i < pts.Count - 1; i++)
                        {
                            mxPoint tmp = pts[i];
                            double dx = pt.X - tmp.X;
                            double dy = pt.Y - tmp.Y;

                            if ((rounded && i < pts.Count - 1) && (dx != 0 || dy != 0)
                                    && scale > 0.3)
                            {
                                // Draws a line from the last point to the current point with a
                                // spacing of size off the current point into direction of the
                                // last point
                                double dist = Math.Sqrt(dx * dx + dy * dy);
                                double nx1 = dx * Math.Min(arcSize, dist / 2) / dist;
                                double ny1 = dy * Math.Min(arcSize, dist / 2) / dist;
                                path.AddLine((float)(pt.X), (float)(pt.Y),
                                    (float)(tmp.X + nx1), (float)(tmp.Y + ny1));

                                // Draws a line from the last point to the current point with a
                                // spacing of size off the current point into direction of the
                                // last point
                                mxPoint next = pts[i + 1];
                                dx = next.X - tmp.X;
                                dy = next.Y - tmp.Y;
                                dist = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
                                double nx2 = dx * Math.Min(arcSize, dist / 2) / dist;
                                double ny2 = dy * Math.Min(arcSize, dist / 2) / dist;
                                path.AddBezier(
                                    (float)(tmp.X + nx1), (float)(tmp.Y + ny1),
                                    (float)(tmp.X), (float)(tmp.Y),
                                    (float)(tmp.X), (float)(tmp.Y),
                                    (float)(tmp.X + nx2), (float)(tmp.Y + ny2));
                                tmp = new mxPoint(tmp.X + nx2, tmp.Y + ny2);
                            }
                            else
                            {
                                path.AddLine((float)(pt.X), (float)(pt.Y), (float)(tmp.X), (float)(tmp.Y));
                            }

                            pt = tmp;
                        }

                        path.AddLine((float)(pt.X), (float)(pt.Y), (float)(pe.X), (float)(pe.Y));
                        g.DrawPath(pen, path);

                        break;
                    }
                }
            }
        }

        /// <summary>
        /// Draws the given type of marker.
        /// </summary>
        /// <param name="type"></param>
        /// <param name="p0"></param>
        /// <param name="pe"></param>
        /// <param name="size"></param>
        /// <param name="pen"></param>
        /// <returns></returns>
        public mxPoint DrawMarker(Object type, mxPoint p0, mxPoint pe, float size, Pen pen)
        {
            Brush brush = new SolidBrush(pen.Color);
            float strokeWidth = (float) (pen.Width / scale);
            mxPoint offset = null;

            // Computes the norm and the inverse norm
            double dx = pe.X - p0.X;
            double dy = pe.Y - p0.Y;

            double dist = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
            double absSize = size * scale;
            double nx = dx * absSize / dist;
            double ny = dy * absSize / dist;

            pe = (mxPoint)pe.Clone();
            pe.X -= nx * strokeWidth / (2 * size);
            pe.Y -= ny * strokeWidth / (2 * size);

            nx *= 0.5 + strokeWidth / 2;
            ny *= 0.5 + strokeWidth / 2;

            if (type.Equals(mxConstants.ARROW_CLASSIC))
            {
                GraphicsPath path = new GraphicsPath();
                path.AddLines(new Point[]{
                    new Point((int)Math.Round(pe.X), (int)Math.Round(pe.Y)),
                    new Point((int)Math.Round(pe.X - nx - ny / 2),
                        (int)Math.Round(pe.Y - ny + nx / 2)),
                    new Point((int)Math.Round(pe.X - nx * 3 / 4),
                        (int)Math.Round(pe.Y - ny * 3 / 4)),
                    new Point((int)Math.Round(pe.X + ny / 2 - nx),
                        (int)Math.Round(pe.Y - ny - nx / 2))});
                path.CloseFigure();

                g.FillPath(brush, path);
                g.DrawPath(pen, path);

                offset = new mxPoint(-nx * 3 / 4, -ny * 3 / 4);
            }
            else if (type.Equals(mxConstants.ARROW_BLOCK))
            {
                GraphicsPath path = new GraphicsPath();
                path.AddLines(new Point[]{
                    new Point((int)Math.Round(pe.X), (int)Math.Round(pe.Y)),
                    new Point((int)Math.Round(pe.X - nx - ny / 2),
                        (int)Math.Round(pe.Y - ny + nx / 2)),
                    new Point((int)Math.Round(pe.X + ny / 2 - nx),
                        (int)Math.Round(pe.Y - ny - nx / 2))});
                path.CloseFigure();

                g.FillPath(brush, path);
                g.DrawPath(pen, path);

                offset = new mxPoint(-nx * 3 / 4, -ny * 3 / 4);
            }
            else if (type.Equals(mxConstants.ARROW_OPEN))
            {
                nx *= 1.2;
                ny *= 1.2;

                g.DrawLine(pen, (int)Math.Round(pe.X - nx - ny / 2),
                        (int)Math.Round(pe.Y - ny + nx / 2),
                        (int)Math.Round(pe.X - nx / 6),
                        (int)Math.Round(pe.Y - ny / 6));
                g.DrawLine(pen, (int)Math.Round(pe.X - nx / 6),
                        (int)Math.Round(pe.Y - ny / 6),
                        (int)Math.Round(pe.X + ny / 2 - nx),
                        (int)Math.Round(pe.Y - ny - nx / 2));

                offset = new mxPoint(-nx / 4, -ny / 4);
            }
            else if (type.Equals(mxConstants.ARROW_OVAL))
            {
                nx *= 1.2;
                ny *= 1.2;
                absSize *= 1.2;

                int cx = (int)Math.Round(pe.X - nx / 2);
                int cy = (int)Math.Round(pe.Y - ny / 2);
                int a = (int)Math.Round(absSize / 2);
                int a2 = (int)Math.Round(absSize);

                g.FillEllipse(brush, cx - a, cy - a, a2, a2);
                g.DrawEllipse(pen, cx - a, cy - a, a2, a2);

                offset = new mxPoint(-nx / 2, -ny / 2);
            }
            else if (type.Equals(mxConstants.ARROW_DIAMOND))
            {
                nx *= 1.2;
                ny *= 1.2;

                Point[] poly = new Point[]{
                    new Point((int)Math.Round(pe.X + nx / 2),
                        (int)Math.Round(pe.Y + ny / 2)),
                    new Point((int)Math.Round(pe.X - ny / 2),
                        (int)Math.Round(pe.Y + nx / 2)),
                    new Point((int)Math.Round(pe.X - nx / 2),
                        (int)Math.Round(pe.Y - ny / 2)),
                    new Point((int)Math.Round(pe.X + ny / 2),
                        (int)Math.Round(pe.Y - nx / 2))};

                g.FillPolygon(brush, poly);
                g.DrawPolygon(pen, poly);
            }

            return offset;
        }

        /// <summary>
        /// Draws the specified text either using drawHtmlString or using drawString.
        /// </summary>
        /// <param name="text"></param>
        /// <param name="x">X-coordinate of the text.</param>
        /// <param name="y">Y-coordinate of the text.</param>
        /// <param name="w">Width of the text.</param>
        /// <param name="h">Height of the text.</param>
        /// <param name="style">Style to be used for painting the text.</param>
        public void DrawText(string text, int x, int y, int w, int h,
                Dictionary<string, Object> style)
        {
            if (text != null && text.Length > 0)
            {
                Font font = mxUtils.GetFont(style, scale);

                if (font.Size > 0)
                {
                    // Draws the label background and border
                    Color? labelBackground = mxUtils.GetColor(style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR);
                    Color? labelBorder = mxUtils.GetColor(style, mxConstants.STYLE_LABEL_BORDERCOLOR);
                    Color? fontColor = mxUtils.GetColor(style, mxConstants.STYLE_FONTCOLOR, Color.Black);

                    float opacity = mxUtils.GetFloat(style, mxConstants.STYLE_OPACITY, 100);
                    int alpha = (int)(255 * opacity / 100);

                    if (opacity < 100)
                    {
                        if (labelBackground != null)
                        {
                            Color tmp = (Color)labelBackground;
                            labelBackground = Color.FromArgb(alpha, tmp.R, tmp.G, tmp.B);
                        }

                        if (labelBorder != null)
                        {
                            Color tmp = (Color)labelBorder;
                            labelBorder = Color.FromArgb(alpha, tmp.R, tmp.G, tmp.B);
                        }

                        if (fontColor != null)
                        {
                            Color tmp = (Color)fontColor;
                            fontColor = Color.FromArgb(alpha, tmp.R, tmp.G, tmp.B);
                        }
                    }


                    // Draws the label background
                    if (labelBackground != null)
                    {
                        Brush bg = new SolidBrush((Color)labelBackground);
                        g.FillRectangle(bg, x, y, w, h);
                    }

                    // Draws the label border
                    if (labelBorder != null)
                    {
                        Pen pen = new Pen((Color)labelBorder, (float)(1 * scale));
                        g.DrawRectangle(pen, x, y, w, h);
                    }

                    Brush brush = new SolidBrush((Color)fontColor);
                    StringFormat format = mxUtils.GetStringFormat(style);

                    // Rotates the graphics for vertical labels
                    RectangleF rect = new Rectangle(x, y, w, h);
                    bool horizontal = mxUtils.IsTrue(style, mxConstants.STYLE_HORIZONTAL, true);

                    if (!horizontal)
                    {
                        Matrix mat = new Matrix();
                        mat.RotateAt(-90f, new PointF(x + w / 2, y + h / 2), MatrixOrder.Append);
                        g.Transform = mat;

                        // Rotates the rectangle again to match the drawing as it
                        // is already rotated and will be rotated again in the
                        // drawString call according to the transform above
                        GraphicsPath path = new GraphicsPath();
                        path.AddRectangle(rect);
                        path.Transform(mat);
                        rect = path.GetBounds();
                    }

                    // Draws the text
                    g.DrawString(text, font, brush, rect, format);

                    // Resets the rotation
                    g.ResetTransform();
                }
            }
        }

        /// <summary>
        /// Destroys the canvas and frees all allocated resources.
        /// </summary>
        public void Destroy()
        {
            g.Dispose();
        }

    }

}
