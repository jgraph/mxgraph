using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Basic implementation of a canvas that draws a graph.
    /// </summary>
    public abstract class mxBasicCanvas : mxICanvas
    {
        /// <summary>
        /// Defines the default value for the imageBasePath in all GDI canvases.
        /// Default is an empty string.
        /// </summary>
        public static string DEFAULT_IMAGEBASEPATH = "";

        /// <summary>
        /// Defines the base path for images with relative paths. Trailing slash
        /// is required. Default value is DEFAULT_IMAGEBASEPATH.
        /// </summary>
        protected string imageBasePath = DEFAULT_IMAGEBASEPATH;

        /// <summary>
        /// Specifies the current translation. Default is (0,0).
        /// </summary>
        protected Point translate = new Point(0, 0);

        /// <summary>
        /// Specifies the current scale. Default is 1.
        /// </summary>
        protected double scale;

        /// <summary>
        /// Specifies whether labels should be painted. Default is true.
        /// </summary>
        protected bool drawLabels = true;

        /// <summary>
        /// see com.mxgraph.mxICanvas.Translate
        /// </summary>
        public Point Translate
        {
            get { return translate; }
            set { translate = value; }
        }

        /// <summary>
        /// see com.mxgraph.mxICanvas.Scale
        /// </summary>
        public double Scale
        {
            get { return scale; }
            set { scale = value; }
        }

        /// <summary>
        /// see com.mxgraph.mxICanvas.DrawCell()
        /// </summary>
        public abstract Object DrawCell(mxCellState state);

        /// <summary>
        /// see com.mxgraph.mxICanvas.DrawLabel()
        /// </summary>
        public abstract Object DrawLabel(string text, mxCellState state, bool html);

        /// <summary>
        /// Sets if labels should be visible.
        /// </summary>
        public bool DrawLabels
        {
            get { return drawLabels; }
            set { drawLabels = value; }
        }

        /// <summary>
        /// Sets or gets the image base path.
        /// </summary>
        public string ImageBasePath
        {
            get { return imageBasePath; }
            set { imageBasePath = value; }
        }

        /// <summary>
        /// Gets the image path from the given style.  If the path is relative (does
        /// not start with a slash) then it is appended to the imageBasePath.
        /// </summary>
        /// <param name="style"></param>
        /// <returns></returns>
        protected string GetImageForStyle(Dictionary<string, Object> style)
        {
            string filename = mxUtils.GetString(style, mxConstants.STYLE_IMAGE);

            if (filename != null && !filename.StartsWith("/"))
            {
                filename = imageBasePath + filename;
            }

            return filename;
        }

    }
}
