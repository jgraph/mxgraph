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
    /// A converter that renders display XML data onto a GDI canvas.
    /// </summary>
    public class mxGraphViewImageReader : mxGraphViewReader
    {

        /// <summary>
        /// Specifies the background color.
        /// </summary>
        protected Color? background;

        /// <summary>
        /// Specifies the border size. Default is 0.
        /// </summary>
        protected int border;

        /// <summary>
        /// Default is true.
        /// </summary>
        protected bool antiAlias;

        /// <summary>
        /// Default is true.
        /// </summary>
        protected bool cropping;

        /// <summary>
        /// Specifies the optional clipping rectangle.
        /// </summary>
        protected mxRectangle clip;

        /// <summary>
        /// Constructs a new GDI reader for the given display XML reader.
        /// </summary>
        /// <param name="reader"></param>
        public mxGraphViewImageReader(XmlReader reader) : this(reader, null) { }

        /// <summary>
        /// Constructs a new GDI reader for the given display XML reader.
        /// </summary>
        public mxGraphViewImageReader(XmlReader reader, Color? background) : this(reader, background, 0) { }

        /// <summary>
        /// Constructs a new GDI reader for the given display XML reader.
        /// </summary>
        public mxGraphViewImageReader(XmlReader reader, Color? background, int border)
            : this(reader, background, border, true) { }

        /// <summary>
        /// Constructs a new GDI reader for the given display XML reader.
        /// </summary>
        public mxGraphViewImageReader(XmlReader reader, Color? background, int border, bool antiAlias)
            : this(reader, background, border, antiAlias, true) { }

        /// <summary>
        /// Constructs a new GDI reader for the given display XML reader.
        /// </summary>
        public mxGraphViewImageReader(XmlReader reader, Color? background, int border, bool antiAlias, bool cropping)
        {
            Background = background;
            Border = border;
            AntiAlias = antiAlias;
            Cropping = cropping;
            Read(reader);
        }

        /// <summary>
        /// Accessors for the background property.
        /// </summary>
        public Color? Background
        {
            get { return background; }
            set { background = value; }
        }

        /// <summary>
        /// Accessors for the border property.
        /// </summary>
        public int Border
        {
            get { return border; }
            set { border = value; }
        }

        /// <summary>
        /// Accessors for the background property.
        /// </summary>
        public bool AntiAlias
        {
            get { return antiAlias; }
            set { antiAlias = value; }
        }

        /// <summary>
        /// Accessors for the cropping property.
        /// </summary>
        public bool Cropping
        {
            get { return cropping; }
            set { cropping = value; }
        }

        /// <summary>
        /// Accessors for the clip property.
        /// </summary>
        public mxRectangle Clip
        {
            get { return clip; }
            set { clip = value; }
        }

        /* (non-Dotnetdoc)
         * see com.mxgraph.mxGraphViewReader.CreateCanvas()
         */
        override public mxICanvas CreateCanvas(Dictionary<string, Object> attrs)
        {
            int width = 0;
            int height = 0;
            int dx = 0;
            int dy = 0;

            mxRectangle tmp = Clip;

            if (tmp != null)
            {
                dx -= (int)tmp.X;
                dy -= (int)tmp.Y;
                width = (int)tmp.Width;
                height = (int)tmp.Height;
            }
            else
            {
                int x = (int)Math.Round(mxUtils.GetDouble(attrs, "x"));
                int y = (int)Math.Round(mxUtils.GetDouble(attrs, "y"));
                width = (int)(Math.Round(mxUtils.GetDouble(attrs, "width")))
                    + border + 3;
                height = (int)(Math.Round(mxUtils.GetDouble(attrs, "height")))
                    + border + 3;

                if (cropping)
                {
                    dx = -x + 3;
                    dy = -y + 3;
                }
                else
                {
                    width += x;
                    height += y;
                }
            }

            mxImageCanvas canvas = new mxImageCanvas(new mxGdiCanvas(),
                    width, height, Background, AntiAlias);
            canvas.Translate = new Point(dx, dy);

            return canvas;
        }

        /// <summary>
        /// Creates the image for the given display XML reader. For a given XmlReader,
        /// use the following code to create the view reader:
        /// new mxGraphViewImageReader(xmlReader, background, border, antiAlias);
        /// </summary>
        /// <param name="viewReader">Reader that contains the display XML.</param>
        /// <returns>Returns an image representing the display XML reader.</returns>
        public static Image Convert(mxGraphViewImageReader viewReader)
        {
            if (viewReader.Canvas is mxImageCanvas)
            {
                return ((mxImageCanvas) viewReader.Canvas).Destroy();
            }

            return null;
        }

    }

}
