// $Id: mxConstants.cs,v 1.60 2012-11-19 16:56:51 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Drawing;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Defines various global constants.
    /// </summary>
    public class mxConstants
    {
        /// <summary>
        /// Defines the portion of the cell which is
	    /// to be used as a connectable region.
        /// </summary>
        public static double DEFAULT_HOTSPOT = 0.3;

        /// <summary>
        /// Defines the minimum size in pixels of the 
	    /// portion of the cell cell which is to be 
	    /// used as a connectable region.
        /// </summary>
        public static double MIN_HOTSPOT_SIZE = 8;

        /// <summary>
        /// Defines the SVG namespace.
        /// </summary>
	    public static string NS_SVG = "http://www.w3.org/2000/svg";

        /// <summary>
        /// Defines the XHTML namespace.
        /// </summary>
        public static string NS_XHTML = "http://www.w3.org/1999/xhtml";

        /// <summary>
        /// Defines the XLink namespace.
        /// </summary>
	    public static string NS_XLINK = "http://www.w3.org/1999/xlink";

        /// <summary>
        /// Comma separated list of default fonts for CSS properties.
        /// And the default font family value for new image export.
        /// Default is Arial, Helvetica.
        /// </summary>
        public static String DEFAULT_FONTFAMILIES = "Arial,Helvetica";

        /// <summary>
        /// Default family for fonts. Default is Arial.
        /// </summary>
        public static String DEFAULT_FONTFAMILY = "Arial";

        /// <summary>
        /// Default size for fonts. Value is 11.
        /// </summary>
        public static float DEFAULT_FONTSIZE = 11;

        /// <summary>
        /// Defines the default start size for swimlanes. Default is 40.
        /// </summary>
        public static float DEFAULT_STARTSIZE = 40;

        /// <summary>
        /// Specifies the line spacing. Default is 2.
        /// </summary>
        public static int LINESPACING = 2;

        /// <summary>
        /// Defines the factor to multiply font sizes in
        /// points to be used as font sizes in em. Default
        /// is 1/1.33 = 0.75.
        /// </summary>
        public static double FONT_SIZEFACTOR = 0.75;

        /// <summary>
        /// Defines the inset in absolute pixels between the label
        /// bounding box and the label text. Default is 3.
        /// </summary>
        public static int LABEL_INSET = 3;

        /// <summary>
        /// Default size for markers. Value is 6.
        /// </summary>
        public static float DEFAULT_MARKERSIZE = 6;

        /// <summary>
        /// Defines the default width and height for images used in the
        /// label shape. Default is 24.
        /// </summary>
        public static int DEFAULT_IMAGESIZE = 24;

        /// <summary>
        /// Defines the default opacity for stencils shadows. Default is 1.
        /// </summary>
        public static int STENCIL_SHADOW_OPACITY = 1;

        /// <summary>
        /// Defines the default shadow color for stencils. Default is "gray".
        /// </summary>
        public static String STENCIL_SHADOWCOLOR = "gray";

        /// <summary>
        /// Defines the color to be used to draw shadows. Default is gray.
        /// </summary>
        public static Color SHADOWCOLOR = Color.Gray;

        /// <summary>
        /// Defines the x-offset to be used for shadows. Default is 2.
        /// </summary>
        public static int SHADOW_OFFSETX = 2;

        /// <summary>
        /// Defines the y-offset to be used for shadows. Default is 3.
        /// </summary>
        public static int SHADOW_OFFSETY = 3;

        /// <summary>
        /// Defines the color to be used to draw shadows in W3C standards. Default
        /// is gray.
        /// </summary>
        public static string W3C_SHADOWCOLOR = "gray";

        /// <summary>
        /// Defines the length of the horizontal segment of an Entity Relation.
        /// This can be overridden using mxConstants.STYLE_SEGMENT style.
        /// Default is 30.
        /// </summary>
        public static int ENTITY_SEGMENT = 30;

        /// <summary>
        /// Defines the rounding factor for rounded rectangles in percent between
        /// 0 and 1. Values should be smaller than 0.5. Default is 0.15.
        /// </summary>
        public static double RECTANGLE_ROUNDING_FACTOR = 0.15;

        /// <summary>
        /// Defines the size of the arcs for rounded edges. Default is 10.
        /// </summary>
        public static double LINE_ARCSIZE = 10;
	
        /// <summary>
        /// Defines the spacing between the arrow shape and its terminals. Default
        /// is 10.
        /// </summary>
        public static int ARROW_SPACING = 10;

        /// <summary>
        /// Defines the width of the arrow shape. Default is 30.
        /// </summary>
        public static int ARROW_WIDTH = 30;

        /// <summary>
        /// Defines the size of the arrowhead in the arrow shape. Default is 30.
        /// </summary>
        public static int ARROW_SIZE = 30;

        /// <summary>
        /// Defines the value for none. Default is "none".
        /// </summary>
        public static string NONE = "none";

        /// <summary>
        /// Defines the key for the perimeter style.
        /// Possible values are the functions defined
        /// in mxPerimeter.
        /// </summary>
	    public static string STYLE_PERIMETER = "perimeter";

        /// <summary>
        /// Defines the ID of the cell that should be used for computing the
        /// perimeter point of the source for an edge. This allows for graphically
        /// connecting to a cell while keeping the actual terminal of the edge.
        /// </summary>
        public static string STYLE_SOURCE_PORT = "sourcePort";

        /// <summary>
        /// Defines the ID of the cell that should be used for computing the
        /// perimeter point of the target for an edge. This allows for graphically
        /// connecting to a cell while keeping the actual terminal of the edge.
        /// </summary>
        public static string STYLE_TARGET_PORT = "targetPort";

        /// <summary>
        /// Defines the key for the opacity style (0-100).
        /// </summary>
	    public static string STYLE_OPACITY = "opacity";

        /// <summary>
        /// Defines the key for the text opacity style (0-100).
        /// </summary>
        public static string STYLE_TEXT_OPACITY = "textOpacity";

        /// <summary>
        /// Defines the key for the overflow style. Possible values are "visible",
        /// "hidden" and "fill". The default value is "visible". This value
        /// specifies how overlapping vertex labels are handles. A value of
        /// "visible" will show the complete label. A value of "hidden" will clip
        /// the label so that it does not overlap the vertex bounds. A value of
        /// "fill" will use the vertex bounds for the label.
        /// </summary>
        public static string STYLE_OVERFLOW = "overflow";

	    /// <summary>
	    /// Defines if the connection points on either end of the edge should be
        /// computed so that the edge is vertical or horizontal if possible and
        /// if the point is not at a fixed location. Default is false. This is
        /// used in mxGraph.IsOrthogonal, which also returns true if the edgeStyle
        /// of the edge is an elbow or entity.
	    /// </summary>
	    public static string STYLE_ORTHOGONAL = "orthogonal";

	    /// <summary>
	    /// Defines the key for the horizontal relative coordinate connection point
        /// of an edge with its source terminal.
	    /// </summary>
	    public static string STYLE_EXIT_X = "exitX";

	    /// <summary>
	    /// Defines the key for the vertical relative coordinate connection point
        /// of an edge with its source terminal.
	    /// </summary>
	    public static string STYLE_EXIT_Y = "exitY";

	    /// <summary>
	    /// Defines if the perimeter should be used to find the exact entry point
        /// along the perimeter of the source. Possible values are 0 (false) and
        /// 1 (true). Default is 1 (true).
	    /// </summary>
	    public static string STYLE_EXIT_PERIMETER = "exitPerimeter";

	    /// <summary>
	    /// Defines the key for the horizontal relative coordinate connection point
        /// of an edge with its target terminal.
	    /// </summary>
	    public static string STYLE_ENTRY_X = "entryX";

	    /// <summary>
	    /// Defines the key for the vertical relative coordinate connection point
        /// of an edge with its target terminal.
	    /// </summary>
	    public static string STYLE_ENTRY_Y = "entryY";

	    /// <summary>
	    /// Defines if the perimeter should be used to find the exact entry point
        /// along the perimeter of the target. Possible values are 0 (false) and
        /// 1 (true). Default is 1 (true).
	    /// </summary>
        public static string STYLE_ENTRY_PERIMETER = "entryPerimeter";

        /// <summary>
        /// Defines the key for the white-space style. Possible values are "nowrap"
        /// and "wrap". The default value is "nowrap". This value specifies how
        /// white-space inside a HTML vertex label should be handled. A value of
        /// "nowrap" means the text will never wrap to the next line until a
        /// linefeed is encountered. A value of "wrap" means text will wrap when
        /// necessary.
        /// </summary>
        public static string STYLE_WHITE_SPACE = "whiteSpace";

        /// <summary>
        /// Defines the key for the rotation style (0-360).
        /// </summary>
        public static string STYLE_ROTATION = "rotation";

        /// <summary>
        /// Defines the key for the fillColor style. The value is a string
        /// expression supported by ColorTranslator.FromHtml.
        /// </summary>
	    public static string STYLE_FILLCOLOR = "fillColor";

        /// <summary>
        /// Defines the key for the gradientColor style. The value is a string
        /// expression supported by ColorTranslator.FromHtml. This is ignored
        /// if no fill color is defined.
        /// </summary>
	    public static string STYLE_GRADIENTCOLOR = "gradientColor";

        /// <summary>
        /// Defines the key for the gradient direction. Possible values are
        /// <i>DIRECTION_EAST</i>, <i>DIRECTION_WEST</i>,
        /// <i>DIRECTION_NORTH</i> and <i>DIRECTION_SOUTH</i>. Default
        /// is <i>DIRECTION_SOUTH</i>. Generally, and by default in mxGraph,
        /// gradient painting is done from the value of <i>STYLE_FILLCOLOR</i>
        /// to the value of <i>STYLE_GRADIENTCOLOR</i>. Taking the example of
        /// <i>DIRECTION_NORTH</i>, this means <i>STYLE_FILLCOLOR</i>
        /// color at the bottom of paint pattern and
        /// <i>STYLE_GRADIENTCOLOR</i> at top, with a gradient in-between.
        /// </summary>
        public static string STYLE_GRADIENT_DIRECTION = "gradientDirection";

        /// <summary>
        /// Defines the key for the strokeColor style. The value is a string
        /// expression supported by ColorTranslator.FromHtml.
        /// </summary>
	    public static string STYLE_STROKECOLOR = "strokeColor";

        /// <summary>
        /// Defines the key for the separatorColor style. The value is a string
        /// expression supported by ColorTranslator.FromHtml. This style is only
        /// used for SHAPE_SWIMLANE shapes.
        /// </summary>
	    public static string STYLE_SEPARATORCOLOR = "separatorColor";

        /// <summary>
        /// Defines the key for the strokeWidth style. The type of the value is
        /// <i>float</i> and the possible range is any non-negative value.
        /// The value reflects the stroke width in pixels.
        /// </summary>
	    public static string STYLE_STROKEWIDTH = "strokeWidth";

        /// <summary>
        /// Defines the key for the align style. Possible values are
        /// <i>ALIGN_LEFT</i>, <i>ALIGN_CENTER</i> and
        /// <i>ALIGN_RIGHT</i>. This value defines how the lines of the label
        /// are horizontally aligned. <i>ALIGN_LEFT</i> mean label text lines
        /// are aligned to left of the label bounds, <i>ALIGN_RIGHT</i> to the
        /// right of the label bounds and <i>ALIGN_CENTER</i> means the
        /// center of the text lines are aligned in the center of the label bounds.
        /// Note this value doesn't affect the positioning of the overall label
        /// bounds relative to the vertex, to move the label bounds horizontally, use
        /// <i>STYLE_LABEL_POSITION</i>
        /// </summary>
	    public static string STYLE_ALIGN = "align";

        /// <summary>
        /// Defines the key for the verticalAlign style. Possible values are
        /// <i>ALIGN_TOP</i>, <i>ALIGN_MIDDLE</i> and
        /// <i>ALIGN_BOTTOM</i>. This value defines how the lines of the label
        /// are vertically aligned. <i>ALIGN_TOP</i> means the topmost label
        /// text line is aligned against the top of the label bounds,
        /// <i>ALIGN_BOTTOM</i> means the bottom-most label text line is
        /// aligned against the bottom of the label bounds and
        /// <i>ALIGN_MIDDLE</i> means there is equal spacing between the
        /// topmost text label line and the top of the label bounds and the
        /// bottom-most text label line and the bottom of the label bounds. Note
        /// this value doesn't affect the positioning of the overall label bounds
        /// relative to the vertex, to move the label bounds vertically, use
        /// <i>STYLE_VERTICAL_LABEL_POSITION</i>.
        /// </summary>
	    public static string STYLE_VERTICAL_ALIGN = "verticalAlign";

        /// <summary>
        /// Defines the key for the horizontal label position of vertices. Possible
        /// values are <i>ALIGN_LEFT</i>, <i>ALIGN_CENTER</i> and
        /// <i>ALIGN_RIGHT</i>. Default is <i>ALIGN_CENTER</i>. The
        /// label align defines the position of the label relative to the cell.
        /// <i>ALIGN_LEFT</i> means the entire label bounds is placed
        /// completely just to the left of the vertex, <i>ALIGN_RIGHT</i>
        /// means adjust to the right and <i>ALIGN_CENTER</i> means the label
        /// bounds are vertically aligned with the bounds of the vertex. Note this
        /// value doesn't affect the positioning of label within the label bounds,
        /// to move the label horizontally within the label bounds, use
        /// <i>STYLE_ALIGN</i>.
        /// </summary>
		public static String STYLE_LABEL_POSITION = "labelPosition";

	    /// <summary>
	    /// Defines the key for the vertical label position of vertices. Possible
        /// values are <i>ALIGN_TOP</i>, <i>ALIGN_BOTTOM</i> and
        /// <i>ALIGN_MIDDLE</i>. Default is <i>ALIGN_MIDDLE</i>. The
        /// label align defines the position of the label relative to the cell.
        /// <i>ALIGN_TOP</i> means the entire label bounds is placed
        /// completely just on the top of the vertex, <i>ALIGN_BOTTOM</i>
        /// means adjust on the bottom and <i>ALIGN_MIDDLE</i> means the label
        /// bounds are horizontally aligned with the bounds of the vertex. Note
        /// this value doesn't affect the positioning of label within the label
        /// bounds, to move the label vertically within the label bounds, use
        /// <i>STYLE_VERTICAL_ALIGN</i>.
        /// </summary>
		public static String STYLE_VERTICAL_LABEL_POSITION = "verticalLabelPosition";

        /// <summary>
        /// Defines the key for the align style. Possible values are
        /// <i>ALIGN_LEFT</i>, <i>ALIGN_CENTER</i> and
        /// <i>ALIGN_RIGHT</i>. The value defines how any image in the vertex
        /// label is aligned horizontally within the label bounds of a SHAPE_LABEL
        /// shape.
        /// </summary>
        public static string STYLE_IMAGE_ALIGN = "imageAlign";

        /// <summary>
        /// Defines the key for the verticalAlign style. Possible values are
        /// <i>ALIGN_TOP</i>, <i>ALIGN_MIDDLE</i> and
        /// <i>ALIGN_BOTTOM</i>. The value defines how any image in the vertex
        /// label is aligned vertically within the label bounds of a SHAPE_LABEL
        /// shape.
        /// </summary>
        public static string STYLE_IMAGE_VERTICAL_ALIGN = "imageVerticalAlign";

        /// <summary>
        /// Defines the key for the glass style. Possible values are 0 (disabled) and
        /// 1(enabled). The default value is 0. This is used in mxLabel.
        /// </summary>
        public static String STYLE_GLASS = "glass";

        /// <summary>
        /// Defines the key for the image style. Possible values are any image URL,
        /// registered key in mxImageResources or short data URI as defined in
        /// mxImageBundle.
        /// The type of the value is <i>String</i>. This is the path to the
        /// image to image that is to be displayed within the label of a vertex. See
        /// mxGraphics2DCanvas.getImageForStyle, loadImage and setImageBasePath on
        /// how the image URL is resolved. Finally, mxUtils.loadImage is used for
        /// loading the image for a given URL.
        /// </summary>
	    public static string STYLE_IMAGE = "image";

        /// <summary>
        /// Defines the key for the imageWidth style. The type of this value is
        /// <i>int</i>, the value is the image width in pixels and must be
        /// greated than 0.
        /// </summary>
	    public static string STYLE_IMAGE_WIDTH = "imageWidth";

        /// <summary>
        /// Defines the key for the imageHeight style The type of this value is
        /// <i>int</i>, the value is the image height in pixels and must be
        /// greater than 0.
        /// </summary>
	    public static string STYLE_IMAGE_HEIGHT = "imageHeight";

		/// <summary>
		/// Defines the key for the image background color. This style is only used
        /// for image shapes. Possible values are all HTML color names or HEX codes.
		/// </summary>
		public static string STYLE_IMAGE_BACKGROUND = "imageBackground";

		/// <summary>
		/// Defines the key for the image border color. This style is only used for
        /// image shapes. Possible values are all HTML color names or HEX codes.
		/// </summary>
		public static string STYLE_IMAGE_BORDER = "imageBorder";

        /// <summary>
        /// Defines the key for the horizontal image flip. This style is only used
        /// in mxImageShape. Possible values are 0 and 1. Default is 0.
        /// </summary>
        public static string STYLE_IMAGE_FLIPH = "imageFlipH";

        /// <summary>
        /// Defines the key for the vertical image flip. This style is only used
        /// in mxImageShape. Possible values are 0 and 1. Default is 0.
        /// </summary>
        public static string STYLE_IMAGE_FLIPV = "imageFlipV";

        /// <summary>
        /// Defines the key for the horizontal stencil flip. This style is only used
        /// for <mxStencilShape>. Possible values are 0 and 1. Default is 0.
        /// </summary>
        public static String STYLE_STENCIL_FLIPH = "stencilFlipH";

        /// <summary>
        /// Defines the key for the vertical stencil flip. This style is only used
        /// for <mxStencilShape>. Possible values are 0 and 1. Default is 0.
        /// </summary>
        public static String STYLE_STENCIL_FLIPV = "stencilFlipV";

        /// <summary>
        /// Defines the key for the noLabel style. If this is true then no
        /// label is visible for a given cell. Possible values are true or
        /// false (1 or 0). Default is false (0).
        /// </summary>
        public static String STYLE_NOLABEL = "noLabel";

        /// <summary>
        /// Defines the key for the noEdgeStyle style. If this is
        /// true then no edge style is applied for a given edge.
        /// Possible values are true or false (1 or 0).
        /// Default is false.
        /// </summary>
        public static String STYLE_NOEDGESTYLE = "noEdgeStyle";

        /// <summary>
        /// Defines the key for the label background color. The value is a string
        /// expression supported by ColorTranslator.FromHtml.
        /// </summary>
        public static String STYLE_LABEL_BACKGROUNDCOLOR = "labelBackgroundColor";

        /// <summary>
        /// Defines the key for the label border color. The value is a string
        /// expression supported by ColorTranslator.FromHtml.
        /// </summary>
        public static String STYLE_LABEL_BORDERCOLOR = "labelBorderColor";

        /// <summary>
        /// Defines the key for the indicatorShape style.
        /// Possible values are any of the SHAPE_*
        /// constants.
        /// </summary>
	    public static string STYLE_INDICATOR_SHAPE = "indicatorShape";

        /// <summary>
        /// Defines the key for the indicatorImage style.
        /// Possible values are any image URL, the type of the value is
        /// <i>String</i>.
        /// </summary>
	    public static string STYLE_INDICATOR_IMAGE = "indicatorImage";

        /// <summary>
        /// Defines the key for the indicatorColor style. The value is a string
        /// expression supported by ColorTranslator.FromHtml.
        /// </summary>
	    public static string STYLE_INDICATOR_COLOR = "indicatorColor";

        /// <summary>
        /// Defines the key for the indicatorGradientColor style. The value is a
        /// string expression supported byColorTranslator.FromHtml. This style is
        /// only supported in SHAPE_LABEL shapes.
        /// </summary>
	    public static string STYLE_INDICATOR_GRADIENTCOLOR = "indicatorGradientColor";

        /// <summary>
        /// Defines the key for the indicatorSpacing style (in px).
        /// </summary>
	    public static string STYLE_INDICATOR_SPACING = "indicatorSpacing";

        /// <summary>
        /// Defines the key for the indicatorWidth style (in px).
        /// </summary>
	    public static string STYLE_INDICATOR_WIDTH = "indicatorWidth";

        /// <summary>
        /// Defines the key for the indicatorHeight style (in px).
        /// </summary>
	    public static string STYLE_INDICATOR_HEIGHT = "indicatorHeight";

        /// <summary>
        /// Defines the key for the shadow style. The type of the value is
        /// <i>boolean</i>. This style applies to vertices and arrow style
        /// edges.
        /// </summary>
	    public static string STYLE_SHADOW = "shadow";

        /// <summary>
        /// Defines the key for the segment style. The type of this value is
        /// <i>float</i> and the value represents the size of the horizontal
        /// segment of the entity relation style. Default is ENTITY_SEGMENT.
        /// </summary>
        public static String STYLE_SEGMENT = "segment";

        /// <summary>
        /// Defines the key for the endArrow style.
        /// Possible values are all constants in this
        /// class that start with ARROW_. This style is
        /// supported in the mxConnector shape.
        /// </summary>
	    public static string STYLE_ENDARROW = "endArrow";

        /// <summary>
        /// Defines the key for the startArrow style.
        /// Possible values are all constants in this
        /// class that start with ARROW_.
        /// See STYLE_ENDARROW.
        /// This style is supported in the mxConnector shape.
        /// </summary>
	    public static string STYLE_STARTARROW = "startArrow";

        /// <summary>
        /// Defines the key for the endSize style. The type of this value is
        /// <i>float</i> and the value represents the size of the end
        /// marker in pixels.
        /// </summary>
	    public static string STYLE_ENDSIZE = "endSize";

        /// <summary>
        /// Defines the key for the startSize style. The type of this value is
        /// <i>float</i> and the value represents the size of the start marker
        /// or the size of the swimlane title region depending on the shape it is
        /// used for.
        /// </summary>
	    public static string STYLE_STARTSIZE = "startSize";

        /// <summary>
        /// Defines the key for the dashed style. The type of this value is
        /// <i>boolean</i> and the value determines whether or not an edge or
        /// border is drawn with a dashed pattern along the line.
        /// </summary>
	    public static string STYLE_DASHED = "dashed";

        /// <summary>
        /// Defines the key for the rounded style. The type of this value is
        /// <i>boolean</i>. For edges this determines whether or not joins
        /// between edges segments are smoothed to a rounded finish. For vertices
        /// that have the rectangle shape, this determines whether or not the
        /// rectangle is rounded.
        /// </summary>
	    public static string STYLE_ROUNDED = "rounded";

        /// <summary>
        /// Defines the key for the source perimeter spacing. The type of this value
        /// is <i>double</i>. This is the distance between the source connection
        /// point of an edge and the perimeter of the source vertex in pixels. This
        /// style only applies to edges.
        /// </summary>
        public static string STYLE_SOURCE_PERIMETER_SPACING = "sourcePerimeterSpacing";

        /// <summary>
        /// Defines the key for the target perimeter spacing. The type of this value
        /// is <i>double</i>. This is the distance between the target connection
        /// point of an edge and the perimeter of the target vertex in pixels. This
        /// style only applies to edges.
        /// </summary>
        public static string STYLE_TARGET_PERIMETER_SPACING = "targetPerimeterSpacing";

        /// <summary>
        /// Defines the key for the perimeter spacing. This is the distance between
        /// the connection point and the perimeter in pixels. When used in a vertex
        /// style, this applies to all incoming edges to floating ports (edges that
        /// terminate on the perimeter of the vertex). When used in an edge style,
        /// this spacing applies to the source and target separately, if they
        /// terminate in floating ports (on the perimeter of the vertex).
        /// </summary>
	    public static string STYLE_PERIMETER_SPACING = "perimeterSpacing";

        /// <summary>
        /// Defines the key for the spacing. The value represents the spacing, in
        /// pixels, added to each side of a label in a vertex (style applies to
        /// vertices only).
        /// </summary>
	    public static string STYLE_SPACING = "spacing";

        /// <summary>
        /// Defines the key for the spacingTop style. The value represents the
        /// spacing, in pixels, added to the top side of a label in a vertex (style
        /// applies to vertices only).
        /// </summary>
	    public static string STYLE_SPACING_TOP = "spacingTop";

        /// <summary>
        /// Defines the key for the spacingLeft style. The value represents the
        /// spacing, in pixels, added to the left side of a label in a vertex (style
        /// applies to vertices only).
        /// </summary>
        public static string STYLE_SPACING_LEFT = "spacingLeft";

        /// <summary>
        /// Defines the key for the spacingBottom style The value represents the
        /// spacing, in pixels, added to the bottom side of a label in a vertex
        /// (style applies to vertices only).
        /// </summary>
        public static string STYLE_SPACING_BOTTOM = "spacingBottom";

        /// <summary>
        /// Defines the key for the spacingRight style The value represents the
        /// spacing, in pixels, added to the right side of a label in a vertex (style
        /// applies to vertices only).
        /// </summary>
        public static string STYLE_SPACING_RIGHT = "spacingRight";

        /// <summary>
        /// Defines the key for the horizontal style. Possible values are
        /// <i>true</i> or <i>false</i>. This value only applies to
        /// vertices. If the <i>STYLE_SHAPE</i> is <i>SHAPE_SWIMLANE</i>
        /// a value of <i>false</i> indicates that the swimlane should be drawn
        /// vertically, <i>true</i> indicates to draw it horizontally. If the
        /// shape style does not indicate that this vertex is a swimlane, this value
        /// affects only whether the label is drawn horizontally or vertically.
        /// </summary>
	    public static string STYLE_HORIZONTAL = "horizontal";

        /// <summary>
        /// Defines the key for the direction style. The direction style is used to
        /// specify the direction of certain shapes (eg. <i>mxTriangle</i>).
        /// Possible values are <i>DIRECTION_EAST</i> (default),
        /// <i>DIRECTION_WEST</i>, <i>DIRECTION_NORTH</i> and
        /// <i>DIRECTION_SOUTH</i>. This value only applies to vertices.
        /// </summary>
        public static string STYLE_DIRECTION = "direction";

        /// <summary>
        /// Defines the key for the elbow style. Possible values are
        /// <i>ELBOW_HORIZONTAL</i> and <i>ELBOW_VERTICAL</i>. Default is
        /// <i>ELBOW_HORIZONTAL</i>. This defines how the three segment
        /// orthogonal edge style leaves its terminal vertices. The vertical style
        /// leaves the terminal vertices at the top and bottom sides.
        /// </summary>
        public static string STYLE_ELBOW = "elbow";

        /// <summary>
        /// Defines the key for the fontColor style. The value is type
        /// <i>String</i> and of the expression supported by
        /// ColorTranslator.FromHtml.
        /// </summary>
	    public static string STYLE_FONTCOLOR = "fontColor";

        /// <summary>
        /// Defines the key for the fontFamily style. Possible values are names such
        /// as Arial; Dialog; Verdana; Times New Roman. The value is of type
        /// <i>String</i>.
        /// </summary>
	    public static string STYLE_FONTFAMILY = "fontFamily";

        /// <summary>
        /// Defines the key for the fontSize style (in points). The type of the value
        /// is <i>int</i>.
        /// </summary>
	    public static string STYLE_FONTSIZE = "fontSize";

        /// <summary>
        /// Defines the key for the fontStyle style. Values may be any logical AND
        /// (sum) of FONT_BOLD, FONT_ITALIC, FONT_UNDERLINE and FONT_SHADOW. The type
        /// of the value is <i>int</i>.
        /// </summary>
	    public static string STYLE_FONTSTYLE = "fontStyle";

        /// <summary>
        /// Defines the key for the shape style.
        /// Possible values are any of the SHAPE_*
        /// constants.
        /// </summary>
	    public static string STYLE_SHAPE = "shape";

        /// <summary>
        /// Takes a function that creates points. Possible values are the
        /// functions defined in mxEdgeStyle.
        /// </summary>
	    public static string STYLE_EDGE = "edgeStyle";

        /// <summary>
        /// Defines the key for the loop style. Possible values are the
        /// functions defined in mxEdgeStyle.
        /// </summary>
        public static string STYLE_LOOP = "loopStyle";

        /// <summary>
        /// Defines the key for the horizontal routing center. Possible values are
        /// between -0.5 and 0.5. This is the relative offset from the center used
        /// for connecting edges. The type of this value is <i>float</i>.
        /// </summary>
        public static String STYLE_ROUTING_CENTER_X = "routingCenterX";

        /// <summary>
        /// Defines the key for the vertical routing center. Possible values are
        /// between -0.5 and 0.5. This is the relative offset from the center used
        /// for connecting edges. The type of this value is <i>float</i>.
        /// </summary>
        public static String STYLE_ROUTING_CENTER_Y = "routingCenterY";

        /// <summary>
        /// FONT_BOLD
        /// </summary>
        public const int FONT_BOLD = 1;

        /// <summary>
        /// FONT_ITALIC
        /// </summary>
        public const int FONT_ITALIC = 2;

        /// <summary>
        /// FONT_UNDERLINE
        /// </summary>
        public const int FONT_UNDERLINE = 4;

        /// <summary>
        /// FONT_SHADOW
        /// </summary>
        public const int FONT_SHADOW = 8;

        /// <summary>
        /// SHAPE_RECTANGLE
        /// </summary>
        public const string SHAPE_RECTANGLE = "rectangle";

        /// <summary>
        /// SHAPE_ELLIPSE
        /// </summary>
        public const string SHAPE_ELLIPSE = "ellipse";

        /// <summary>
        /// SHAPE_DOUBLE_ELLIPSE
        /// </summary>
        public const string SHAPE_DOUBLE_ELLIPSE = "doubleEllipse";

        /// <summary>
        /// SHAPE_RHOMBUS
        /// </summary>
        public const string SHAPE_RHOMBUS = "rhombus";

        /// <summary>
        /// SHAPE_LINE
        /// </summary>
        public const string SHAPE_LINE = "line";

        /// <summary>
        /// SHAPE_IMAGE
        /// </summary>
        public const string SHAPE_IMAGE = "image";
    	
        /// <summary>
        /// SHAPE_ARROW
        /// </summary>
        public const string SHAPE_ARROW = "arrow";
    	
        /// <summary>
        /// SHAPE_LABEL
        /// </summary>
        public const string SHAPE_LABEL = "label";
    	
        /// <summary>
        /// SHAPE_CYLINDER
        /// </summary>
        public const string SHAPE_CYLINDER = "cylinder";
    	
        /// <summary>
        /// SHAPE_SWIMLANE
        /// </summary>
        public const string SHAPE_SWIMLANE = "swimlane";
    		
        /// <summary>
        /// SHAPE_CONNECTOR
        /// </summary>
        public const string SHAPE_CONNECTOR = "connector";
    		
        /// <summary>
        /// SHAPE_ACTOR
        /// </summary>
        public const string SHAPE_ACTOR = "actor";

        /// <summary>
        /// SHAPE_CLOUD
        /// </summary>
        public const string SHAPE_CLOUD = "cloud";

        /// <summary>
        /// SHAPE_TRIANGLE
        /// </summary>
        public const string SHAPE_TRIANGLE = "triangle";

        /// <summary>
        /// SHAPE_HEXAGON
        /// </summary>
        public const string SHAPE_HEXAGON = "hexagon";

        /// <summary>
        /// ARROW_CLASSIC
        /// </summary>
        public const string ARROW_CLASSIC = "classic";

        /// <summary>
        /// ARROW_BLOCK
        /// </summary>
        public const string ARROW_BLOCK = "block";

        /// <summary>
        /// ARROW_OPEN
        /// </summary>
        public const string ARROW_OPEN = "open";

        /// <summary>
        /// ARROW_BLOCK
        /// </summary>
        public const string ARROW_OVAL = "oval";

        /// <summary>
        /// ARROW_OPEN
        /// </summary>
        public const string ARROW_DIAMOND = "diamond";

        /// <summary>
        /// ALIGN_LEFT
        /// </summary>
        public const string ALIGN_LEFT = "left";

        /// <summary>
        /// ALIGN_CENTER
        /// </summary>
        public const string ALIGN_CENTER = "center";

        /// <summary>
        /// ALIGN_RIGHT
        /// </summary>
        public const string ALIGN_RIGHT = "right";

        /// <summary>
        /// ALIGN_TOP
        /// </summary>
        public const string ALIGN_TOP = "top";

        /// <summary>
        /// ALIGN_MIDDLE
        /// </summary>
        public const string ALIGN_MIDDLE = "middle";

        /// <summary>
        /// ALIGN_BOTTOM
        /// </summary>
	    public const string ALIGN_BOTTOM = "bottom";

	    /// <summary>
        /// DIRECTION_NORTH
	    /// </summary>
	    public const string DIRECTION_NORTH = "north";

	    /// <summary>
        /// DIRECTION_SOUTH
	    /// </summary>
	    public const string DIRECTION_SOUTH = "south";

	    /// <summary>
        /// DIRECTION_EAST
	    /// </summary>
	    public const string DIRECTION_EAST = "east";

	    /// <summary>
        /// DIRECTION_WEST
	    /// </summary>
        public const string DIRECTION_WEST = "west";

        /// <summary>
        /// ELBOW_VERTICAL
        /// </summary>
        public const string ELBOW_VERTICAL = "vertical";

        /// <summary>
        /// ELBOW_HORIZONTAL
        /// </summary>
        public const string ELBOW_HORIZONTAL = "horizontal";

	    /// <summary>
	    /// Name of the elbow edge style. Can be used as a string value
        /// for the STYLE_EDGE style.
	    /// </summary>
	    public const string EDGESTYLE_ELBOW = "elbowEdgeStyle";

	    /// <summary>
	    /// Name of the entity relation edge style. Can be used as a string value
        /// for the STYLE_EDGE style.
	    /// </summary>
	    public const string EDGESTYLE_ENTITY_RELATION = "entityRelationEdgeStyle";

	    /// <summary>
	    /// Name of the loop edge style. Can be used as a string value
        /// for the STYLE_EDGE style.
	    /// </summary>
	    public const string EDGESTYLE_LOOP = "loopEdgeStyle";

	    /// <summary>
	    /// Name of the side to side edge style. Can be used as a string value
        /// for the STYLE_EDGE style.
	    /// </summary>
	    public const string EDGESTYLE_SIDETOSIDE = "sideToSideEdgeStyle";

	    /// <summary>
	    /// Name of the top to bottom edge style. Can be used as a string value
        /// for the STYLE_EDGE style.
	    /// </summary>
	    public const string EDGESTYLE_TOPTOBOTTOM = "topToBottomEdgeStyle";

	    /// <summary>
	    /// Name of the ellipse perimeter. Can be used as a string value
        /// for the STYLE_PERIMETER style.
	    /// </summary>
	    public const string PERIMETER_ELLIPSE = "ellipsePerimeter";

	    /// <summary>
	    /// Name of the rectangle perimeter. Can be used as a string value
        /// for the STYLE_PERIMETER style.
	    /// </summary>
	    public const string PERIMETER_RECTANGLE = "rectanglePerimeter";

	    /// <summary>
	    /// Name of the rhombus perimeter. Can be used as a string value
        /// for the STYLE_PERIMETER style.
	    /// </summary>
	    public const string PERIMETER_RHOMBUS = "rhombusPerimeter";

	    /// <summary>
	    /// Name of the triangle perimeter. Can be used as a string value
        /// for the STYLE_PERIMETER style.
	    /// </summary>
        public const string PERIMETER_TRIANGLE = "trianglePerimeter";

    }

}
