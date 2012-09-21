using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Class that can draw an independent array of cells.
    /// </summary>
    public class mxCellRenderer
    {

        private mxCellRenderer()
        {
            // static class
        }

        /// <summary>
        /// Draws the given cells using a Graphics2D canvas and returns the buffered image
        /// that represents the cells.
        /// </summary>
        public static mxICanvas DrawCells(mxGraph graph, Object[] cells, double scale,
                mxRectangle clip, CanvasFactory factory)
        {
            mxICanvas canvas = null;

            if (cells == null)
            {
                cells = new Object[] { graph.Model.Root };
            }

            if (cells != null)
            {
                // Gets the current state of the view
                mxGraphView view = graph.View;
                Dictionary<Object, mxCellState> states = view.States;
                double oldScale = view.Scale;

                // Keeps the existing translation as the cells might
                // be aligned to the grid in a different way in a graph
                // that has a translation other than zero
                bool eventsEnabled = view.IsEventsEnabled;

                // Disables firing of scale events so that there is no
                // repaint or update of the original graph
                view.IsEventsEnabled = false;

                try
                {
                    // TODO: Factor-out into mxTemporaryCellStates class
                    view.States = new Dictionary<Object, mxCellState>();
                    view.Scale = scale;

                    // Creates virtual parent state for validation
                    mxCellState state = view.CreateState(new mxCell());

                    // Validates the vertices and edges without adding them to
                    // the model so that the original cells are not modified
                    for (int i = 0; i < cells.Length; i++)
                    {
                        view.ValidateBounds(state, cells[i]);
                    }

                    for (int i = 0; i < cells.Length; i++)
                    {
                        view.ValidatePoints(state, cells[i]);
                    }

                    if (clip == null)
                    {
                        clip = graph.GetPaintBounds(cells);
                    }

                    if (clip != null && clip.Width > 0 && clip.Height > 0)
                    {
                        Rectangle rect = clip.GetRectangle();
                        canvas = factory.CreateCanvas(rect.Width + 1,
                                rect.Height + 1);

                        if (canvas != null)
                        {
                            double previousScale = canvas.Scale;
                            Point previousTranslate = canvas.Translate;

                            try
                            {
                                canvas.Translate = new Point(-rect.X, -rect.Y);
                                canvas.Scale = view.Scale;

                                for (int i = 0; i < cells.Length; i++)
                                {
                                    graph.DrawCell(canvas, cells[i]);
                                }
                            }
                            finally
                            {
                                canvas.Scale = previousScale;
                                canvas.Translate = previousTranslate;
                            }
                        }
                    }
                }
                finally
                {
                    view.Scale = oldScale;
                    view.States = states;
                    view.IsEventsEnabled = eventsEnabled;
                }
            }

            return canvas;
        }

        /// <summary>
        /// Creates an image for the given arguments.
        /// </summary>
        public static Image CreateImage(mxGraph graph, Object[] cells, double scale, Color? background,
            bool antiAlias, mxRectangle clip)
        {
            return CreateImage(graph, cells, scale, background, antiAlias, clip, new mxGdiCanvas());
        }

        /// <summary>
        /// Creates an image for the given arguments.
        /// </summary>
        public static Image CreateImage(mxGraph graph, Object[] cells, double scale, Color? background,
            bool antiAlias, mxRectangle clip, mxGdiCanvas graphicsCanvas)
        {
            mxImageCanvas canvas = (mxImageCanvas) DrawCells(graph, cells, scale, clip,
                new ImageCanvasFactory(graphicsCanvas, background, antiAlias));

            return canvas.Destroy();
        }

        /// <summary>
        /// Defines the requirements for a class that can create canvases.
        /// </summary>
        public abstract class CanvasFactory
        {
            /// <summary>
            /// Returns a new canvas for the given dimension.
            /// </summary>
            public abstract mxICanvas CreateCanvas(int width, int height);
        }

        /// <summary>
        /// FIXME: Use anonymous class in CreateImage with invocation parameters
        /// in factory method code.
        /// </summary>
        public class ImageCanvasFactory : CanvasFactory
        {
            /// <summary>
            /// Holds the graphics canvas to be used for painting.
            /// </summary>
            protected mxGdiCanvas graphicsCanvas;

            /// <summary>
            /// Specifies the background color.
            /// </summary>
            protected Color? background;

            /// <summary>
            /// Specifies if antialiasing should be enabled.
            /// </summary>
            protected bool antiAlias;

            /// <summary>
            /// Constructs a new image canvas factors.
            /// </summary>
            /// <param name="graphicsCanvas">Specifies the graphics canvas for painting.</param>
            /// <param name="background">Specifies the background color of the image.</param>
            /// <param name="antiAlias">Specifies if antialiasing should be enabled.</param>
            public ImageCanvasFactory(mxGdiCanvas graphicsCanvas, Color? background, bool antiAlias)
            {
                this.graphicsCanvas = graphicsCanvas;
                this.background = background;
                this.antiAlias = antiAlias;
            }

            public override mxICanvas CreateCanvas(int width, int height)
            {
                return new mxImageCanvas(graphicsCanvas, width, height, background, antiAlias);
            }
        }

    }

}
