<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxConstants
{

	/**
	 * Class: mxConstants
	 *
	 * Defines global constants.
	 * 
	 * Variable: RAD_PER_DEG
	 *
	 * Defines the number of radiants per degree.
	 */
	public static $RAD_PER_DEG = 0.0174532;

	/**
	 * Variable: DEG_PER_RAD
	 *
	 * Defines the number of degrees per radiant.
	 */
	public static $DEG_PER_RAD = 57.2957795;

	/**
	 * Variable: ACTIVE_REGION
	 *
	 * Defines the portion of the cell which is
	 * to be used as a connectable region.
	 */
	public static $ACTIVE_REGION = 0.3;

	/**
	 * Variable: MIN_ACTIVE_REGION
	 *
	 * Defines the minimum size in pixels of the 
	 * portion of the cell cell which is to be 
	 * used as a connectable region.
	 */
	public static $MIN_ACTIVE_REGION = 8;

	/**
	 * Variable: NS_SVG
	 *
	 * Defines the SVG namespace.
	 */
	public static $NS_SVG = "http://www.w3.org/2000/svg";

	/**
	 * Variable: NS_XHTML
	 *
	 * Defines the XHTML namespace.
	 */
	public static $NS_XHTML = "http://www.w3.org/1999/xhtml";

	/**
	 * Variable: NS_XLINK
	 *
	 * Defined the XLink namespace.
	 */
	public static $NS_XLINK = "http://www.w3.org/1999/xlink";

	/**
	 * Variable: W3C_SHADOWCOLOR
	 *
	 * Defines the color to be used to draw
	 * shadows in DOM documents.
	 */
	public static $W3C_SHADOWCOLOR = "gray";

	/**
	 * Variable: SHADOW_OFFSETX
	 *
	 * Defines the x-offset to be used for shadows. Default is 2.
	 */
	public static $SHADOW_OFFSETX = 2;

	/**
	 * Variable: SHADOW_OFFSETY
	 *
	 * Defines the y-offset to be used for shadows. Default is 3.
	 */
	public static $SHADOW_OFFSETY = 3;

	/**
	 * Variable: W3C_DEFAULT_FONTFAMILY
	 * 
	 * Defines the default family for HTML markup. Default is times, serif.
	 */
	public static $W3C_DEFAULT_FONTFAMILY = "times, serif";

	/**
	 * Variable: TTF_ENABLED
	 * 
	 * Whether TrueType fonts should be enabled in the mxGdCanvas
	 * by default. Default is true.
	 */
	public static $TTF_ENABLED = true;

	/**
	 * Variable: TTF_SIZEFACTOR
	 * 
	 * Defines the factor which wich the font sizes are to be
	 * multiplied when used in truetype fonts. Default is 0.66.
	 */
	public static $TTF_SIZEFACTOR = 0.66;

	/**
	 * Variable: DEFAULT_FONTFAMILY
	 * 
	 * Defines the default family for all truetype fonts. Default is vera.
	 */
	public static $DEFAULT_FONTFAMILY = "vera";

	/**
	 * Variable: DEFAULT_FONTSIZE
	 * 
	 * Defines the default size (in px). Default is 11.
	 */
	public static $DEFAULT_FONTSIZE = 11;

	/**
	 * Variable: DEFAULT_STARTSIZE
	 * 
	 * Defines the default start size for swimlanes. Default is 40.
	 */
	public static $DEFAULT_STARTSIZE = 40;
	
	/**
	 * Variable: DEFAULT_LINESPACING
	 * 
	 * Defines the default linespacing. Default is 7.
	 */
	public static $DEFAULT_LINESPACING = 7;

	/**
	 * Variable: LABEL_INSET
	 * 
	 * Defines the inset in absolute pixels between the label bounding box and
	 * the label text. Default is 3.
	 */
	public static $LABEL_INSET = 3;

	/**
	 * Variable: DEFAULT_MARKERSIZE
	 * 
	 * Defines the default size for all markers. Default is 6.
	 */
	public static $DEFAULT_MARKERSIZE = 6;

	/**
	 * Variable: DEFAULT_IMAGESIZE
	 * 
	 * Defines the default width and height for images used in the
	 * label shape. Default is 24.
	 */
	public static $DEFAULT_IMAGESIZE = 24;

	/**
	 * Variable: ENTITY_SEGMENT
	 * 
	 * Defines the length of the horizontal segment of an Entity Relation.
	 * This can be overridden using <mxConstants.STYLE_SEGMENT> style.
	 * Default is 30.
	 */
	public static $ENTITY_SEGMENT = 30;

	/**
	 * Variable: ARROW_SPACING
	 * 
	 * Defines the spacing between the arrow shape and its terminals. Default
	 * is 10.
	 */
	public static $ARROW_SPACING = 10;

	/**
	 * Variable: ARROW_WIDTH
	 * 
	 * Defines the width of the arrow shape. Default is 30.
	 */
	public static $ARROW_WIDTH = 30;

	/**
	 * Variable: ARROW_SIZE
	 * 
	 * Defines the size of the arrowhead in the arrow shape. Default is 30.
	 */
	public static $ARROW_SIZE = 30;

	/**
	 * Variable: NONE
	 * 
	 * Defines the value for none. Default is "none".
	 */
	public static $NONE = "none";

	/**
	 * Variable: STYLE_PERIMETER
	 *
	 * Defines the key for the perimeter style. This is a function that defines
	 * the perimeter around a particular shape. Possible values are the
	 * functions defined in <mxPerimeter>. Alternatively, the constants in this
	 * class that start with <code>PERIMETER_</code> may be used to access
	 * perimeter styles in <mxStyleRegistry>.
	 */
	public static $STYLE_PERIMETER = "perimeter";
	
	/**
	 * Defines the ID of the cell that should be used for computing the
	 * perimeter point of the source for an edge. This allows for graphically
	 * connecting to a cell while keeping the actual terminal of the edge.
	 */
	public static $STYLE_SOURCE_PORT = "sourcePort";
	
	/**
	 * Defines the ID of the cell that should be used for computing the
	 * perimeter point of the target for an edge. This allows for graphically
	 * connecting to a cell while keeping the actual terminal of the edge.
	 */
	public static $STYLE_TARGET_PORT = "targetPort";
	
	/**
	 * Variable: STYLE_OPACITY
	 *
	 * Defines the key for the opacity style. The type of the value is 
	 * numeric and the possible range is 0-100.
	 */
	public static $STYLE_OPACITY = "opacity";

	/**
	 * Variable: STYLE_TEXT_OPACITY
	 *
	 * Defines the key for the text opacity style. The type of the value is 
	 * numeric and the possible range is 0-100.
	 */
	public static $STYLE_TEXT_OPACITY = "textOpacity";

	/**
	 * Variable: STYLE_OVERFLOW
	 * 
	 * Defines the key for the overflow style. Possible values are "visible",
	 * "hidden" and "fill". The default value is "visible". This value
	 * specifies how overlapping vertex labels are handles. A value of
	 * "visible" will show the complete label. A value of "hidden" will clip
	 * the label so that it does not overlap the vertex bounds. A value of
	 * "fill" will use the vertex bounds for the label.
	 * 
	 * This style is ignored in PHP.
	 */
	public static $STYLE_OVERFLOW = "overflow";

    /**
	 * Variable: STYLE_ORTHOGONAL
	 *
	 * Defines if the connection points on either end of the edge should be
	 * computed so that the edge is vertical or horizontal if possible and
	 * if the point is not at a fixed location. Default is false. This is
	 * used in <mxGraph.isOrthogonal>, which also returns true if the edgeStyle
	 * of the edge is an elbow or entity.
	 */
    public static $STYLE_ORTHOGONAL = "orthogonal";

    /**
	 * Variable: STYLE_EXIT_X
	 *
	 * Defines the key for the horizontal relative coordinate connection point
	 * of an edge with its source terminal.
	 */
    public static $STYLE_EXIT_X = "exitX";

    /**
	 * Variable: STYLE_EXIT_Y
	 *
	 * Defines the key for the vertical relative coordinate connection point
	 * of an edge with its source terminal.
	 */
    public static $STYLE_EXIT_Y = "exitY";

    /**
	 * Variable: STYLE_EXIT_PERIMETER
	 *
	 * Defines if the perimeter should be used to find the exact entry point
	 * along the perimeter of the source. Possible values are 0 (false) and
	 * 1 (true). Default is 1 (true).
	 */
    public static $STYLE_EXIT_PERIMETER = "exitPerimeter";

    /**
	 * Variable: STYLE_ENTRY_X
	 *
	 * Defines the key for the horizontal relative coordinate connection point
	 * of an edge with its target terminal.
	 */
    public static $STYLE_ENTRY_X = "entryX";

    /**
	 * Variable: STYLE_ENTRY_Y
	 *
	 * Defines the key for the vertical relative coordinate connection point
	 * of an edge with its target terminal.
	 */
    public static $STYLE_ENTRY_Y = "entryY";

    /**
	 * Variable: sSTYLE_ENTRY_PERIMETER
	 *
	 * Defines if the perimeter should be used to find the exact entry point
	 * along the perimeter of the target. Possible values are 0 (false) and
	 * 1 (true). Default is 1 (true).
	 */
    public static $STYLE_ENTRY_PERIMETER = "entryPerimeter";
	
	/**
	 * Variable: STYLE_WHITE_SPACE
	 * 
	 * Defines the key for the white-space style. Possible values are "nowrap"
	 * and "wrap". The default value is "nowrap". This value specifies how
	 * white-space inside a HTML vertex label should be handled. A value of
	 * "nowrap" means the text will never wrap to the next line until a
	 * linefeed is encountered. A value of "wrap" means text will wrap when
	 * necessary. This style is only used for HTML labels.
	 * 
	 * This style is ignored in PHP.
	 */
	public static $STYLE_WHITE_SPACE = "whiteSpace";
	
	/**
	 * Variable: STYLE_ROTATION
	 *
	 * Defines the key for the rotation style. The type of the value is 
	 * numeric and the possible range is 0-360.
	 */
	public static $STYLE_ROTATION = "rotation";

	/**
	 * Variable: STYLE_FILLCOLOR
	 *
	 * Defines the key for the fill color. Possible values are all HTML color
	 * names or HEX codes, as well as special keywords such as 'swimlane,
	 * 'inherit' or 'indicated' to use the color code of a related cell or the
	 * indicator shape.
	 */
	public static $STYLE_FILLCOLOR = "fillColor";
	
	/**
	 * Variable: STYLE_SWIMLANE_FILLCOLOR
	 *
	 * Defines the key for the fill color of the swimlane background. Possible
	 * values are all HTML color names or HEX codes. Default is no background.
	 * Value is "swimlaneFillColor".
	 */
	public static $STYLE_SWIMLANE_FILLCOLOR = "swimlaneFillColor";

	/**
	 * Variable: STYLE_GRADIENTCOLOR
	 *
	 * Defines the key for the gradient color. Possible values are all HTML color
	 * names or HEX codes, as well as special keywords such as 'swimlane,
	 * 'inherit' or 'indicated' to use the color code of a related cell or the
	 * indicator shape. This is ignored if no fill color is defined.
	 */
	public static $STYLE_GRADIENTCOLOR = "gradientColor";

	/**
	 * Variable: STYLE_GRADIENT_DIRECTION
	 * 
	 * Defines the key for the gradient direction. Possible values are
	 * <DIRECTION_EAST>, <DIRECTION_WEST>, <DIRECTION_NORTH> and
	 * <DIRECTION_SOUTH>. Default is <DIRECTION_SOUTH>. Generally, and by
	 * default in mxGraph, gradient painting is done from the value of
	 * <STYLE_FILLCOLOR> to the value of <STYLE_GRADIENTCOLOR>. Taking the
	 * example of <DIRECTION_NORTH>, this means <STYLE_FILLCOLOR> color at the 
	 * bottom of paint pattern and <STYLE_GRADIENTCOLOR> at top, with a
	 * gradient in-between.
	 */
	public static $STYLE_GRADIENT_DIRECTION = "gradientDirection";
	
	/**
	 * Variable: STYLE_STROKECOLOR
	 *
	 * Defines the key for the strokeColor style. Possible values are all HTML
	 * color names or HEX codes, as well as special keywords such as 'swimlane,
	 * 'inherit' or 'indicated' to use the color code of a related cell or the
	 * indicator shape.
	 */
	public static $STYLE_STROKECOLOR = "strokeColor";

	/**
	 * Variable: STYLE_SEPARATORCOLOR
	 *
	 * Defines the key for the separatorColor style. Possible values are all
	 * HTML color names or HEX codes. This style is only used for
	 * <SHAPE_SWIMLANE> shapes.
	 */
	public static $STYLE_SEPARATORCOLOR = "separatorColor";

	/**
	 * Variable: STYLE_STROKEWIDTH
	 *
	 * Defines the key for the strokeWidth style. The type of the value is 
	 * numeric and the possible range is any non-negative value. The value
	 * the stroke width in pixels.
	 */
	public static $STYLE_STROKEWIDTH = "strokeWidth";

	/**
	 * Variable: STYLE_ALIGN
	 *
	 * Defines the key for the align style. Possible values are <ALIGN_LEFT>,
	 * <ALIGN_CENTER> and <ALIGN_RIGHT>. This value defines how the lines of
	 * the label are horizontally aligned. <ALIGN_LEFT> mean label text lines
	 * are aligned to left of the label bounds, <ALIGN_RIGHT> to the right of
	 * the label bounds and <ALIGN_CENTER> means the center of the text lines
	 * are aligned in the center of the label bounds. Note this value doesn't
	 * affect the positioning of the overall label bounds relative to the
	 * vertex, to move the label bounds horizontally, use
	 * <STYLE_LABEL_POSITION>.
	 */
	public static $STYLE_ALIGN = "align";

	/**
	 * Variable: STYLE_VERTICAL_ALIGN
	 *
	 * Defines the key for the verticalAlign style. Possible values are
	 * <ALIGN_TOP>, <ALIGN_MIDDLE> and <ALIGN_BOTTOM>. This value defines how
	 * the lines of the label are vertically aligned. <ALIGN_TOP> means the
	 * topmost label text line is aligned against the top of the label bounds,
	 * <ALIGN_BOTTOM> means the bottom-most label text line is aligned against
	 * the bottom of the label bounds and <ALIGN_MIDDLE> means there is equal
	 * spacing between the topmost text label line and the top of the label
	 * bounds and the bottom-most text label line and the bottom of the label
	 * bounds. Note this value doesn't affect the positioning of the overall
	 * label bounds relative to the vertex, to move the label bounds
	 * vertically, use <STYLE_VERTICAL_LABEL_POSITION>.
	 */
	public static $STYLE_VERTICAL_ALIGN = "verticalAlign";

	/**
	 * Variable: STYLE_LABEL_POSITION
	 * 
	 * Defines the key for the horizontal label position of vertices. Possible
	 * values are <ALIGN_LEFT>, <ALIGN_CENTER> and <ALIGN_RIGHT>. Default is
	 * <ALIGN_CENTER>. The label align defines the position of the label
	 * relative to the cell. <ALIGN_LEFT> means the entire label bounds is
	 * placed completely just to the left of the vertex, <ALIGN_RIGHT> means
	 * adjust to the right and <ALIGN_CENTER> means the label bounds are
	 * vertically aligned with the bounds of the vertex. Note this value
	 * doesn't affect the positioning of label within the label bounds, to move
	 * the label horizontally within the label bounds, use <STYLE_ALIGN>.
	 */
	public static $STYLE_LABEL_POSITION = "labelPosition";

	/**
	 * Variable: STYLE_VERTICAL_LABEL_POSITION
	 * 
	 * Defines the key for the vertical label position of vertices. Possible
	 * values are <ALIGN_TOP>, <ALIGN_BOTTOM> and <ALIGN_MIDDLE>. Default is
	 * <ALIGN_MIDDLE>. The label align defines the position of the label
	 * relative to the cell. <ALIGN_TOP> means the entire label bounds is
	 * placed completely just on the top of the vertex, <ALIGN_BOTTOM> means
	 * adjust on the bottom and <ALIGN_MIDDLE> means the label bounds are
	 * horizontally aligned with the bounds of the vertex. Note this value
	 * doesn't affect the positioning of label within the label bounds, to move
	 * the label vertically within the label bounds, use
	 * <STYLE_VERTICAL_ALIGN>.
	 */
	public static $STYLE_VERTICAL_LABEL_POSITION = "verticalLabelPosition";
	
	/**
	 * Variable: STYLE_IMAGE_ALIGN
	 *
	 * Defines the key for the align style. Possible values are <ALIGN_LEFT>,
	 * <ALIGN_CENTER> and <ALIGN_RIGHT>. The value defines how any image in the
	 * vertex label is aligned horizontally within the label bounds of a
	 * <SHAPE_LABEL> shape.
	 */
	public static $STYLE_IMAGE_ALIGN = "imageAlign";

	/**
	 * Variable: STYLE_IMAGE_VERTICALALIGN
	 *
	 * Defines the key for the verticalAlign style. Possible values are
	 * <ALIGN_TOP>, <ALIGN_MIDDLE> and <ALIGN_BOTTOM>. The value defines how
	 * any image in the vertex label is aligned vertically within the label
	 * bounds of a <SHAPE_LABEL> shape.
	 */
	public static $STYLE_IMAGE_VERTICAL_ALIGN = "imageVerticalAlign";

	/**
	 * Variable: STYLE_IMAGE
	 *
	 * Defines the key for the image style. Possible values are any image URL,
	 * registered key in <mxImageResources> or short data URI as defined
	 * in <mxImageBundle>.
	 * The type of the value is String. This is the path to the image to image
	 * that is to be displayed within the label of a vertex. Finally,
	 * <mxUtils.loadImage> is used for loading the image for a given value.
	 */
	public static $STYLE_IMAGE = "image";

	/**
	 * Variable: STYLE_IMAGE_WIDTH
	 *
	 * Defines the key for the imageWidth style. The type of this value is
	 * int, the value is the image width in pixels and must be greater than 0.
	 */
	public static $STYLE_IMAGE_WIDTH = "imageWidth";

	/**
	 * Variable: STYLE_IMAGE_HEIGHT
	 *
	 * Defines the key for the imageHeight style. The type of this value is
	 * int, the value is the image height in pixels and must be greater than 0.
	 */
	public static $STYLE_IMAGE_HEIGHT = "imageHeight";

	/**
	 * Variable: STYLE_IMAGE_BACKGROUND
	 * 
	 * Defines the key for the image background color. This style is only used
	 * in <mxImageShape>. Possible values are all HTML color names or HEX
	 * codes.
	 */
	public static $STYLE_IMAGE_BACKGROUND = "imageBackground";

	/**
	 * Variable: STYLE_IMAGE_BORDER
	 * 
	 * Defines the key for the image border color. This style is only used in
	 * <mxImageShape>. Possible values are all HTML color names or HEX codes.
	 */
	public static $STYLE_IMAGE_BORDER = "imageBorder";
	
	/**
	 * Variable: STYLE_IMAGE_FLIPH
	 * 
	 * Defines the key for the horizontal image flip. This style is only used
	 * for painting images. Possible values are 0 and 1. Default is 0.
	 */
	public static $STYLE_IMAGE_FLIPH = "imageFlipH";

	/**
	 * Variable: STYLE_IMAGE_FLIPV
	 * 
	 * Defines the key for the vertical image flip. This style is only used
	 * for painting images. Possible values are 0 and 1. Default is 0.
	 */
	public static $STYLE_IMAGE_FLIPV = "imageFlipV";
	
	/**
	 * Variable: STYLE_NOLABEL
	 * 
	 * Defines the key for the noLabel style. If this is
	 * true then no label is visible for a given cell.
	 * Possible values are true or false (1 or 0).
	 * Default is false.
	 */
	public static $STYLE_NOLABEL = "noLabel";

	/**
	 * Variable: STYLE_NOEDGESTYLE
	 * 
	 * Defines the key for the noEdgeStyle style. If this is
	 * true then no edge style is applied for a given edge.
	 * Possible values are true or false (1 or 0).
	 * Default is false.
	 */
	public static $STYLE_NOEDGESTYLE = "noEdgeStyle";

	/**
	 * Variable: STYLE_LABEL_BACKGROUNDCOLOR
	 * 
	 * Defines the key for the label background color. Possible values are all
	 * HTML color names or HEX codes.
	 */
	public static $STYLE_LABEL_BACKGROUNDCOLOR = "labelBackgroundColor";

	/**
	 * Variable: STYLE_LABEL_BORDERCOLOR
	 * 
	 * Defines the key for the label border color. Possible values are all
	 * HTML color names or HEX codes.
	 */
	public static $STYLE_LABEL_BORDERCOLOR = "labelBorderColor";

	/**
	 * Variable: STYLE_INDICATOR_SHAPE
	 *
	 * Defines the key for the indicatorShape style.
	 * Possible values are any of the SHAPE_*
	 * constants.
	 */
	public static $STYLE_INDICATOR_SHAPE = "indicatorShape";

	/**
	 * Variable: STYLE_INDICATOR_IMAGE
	 *
	 * Defines the key for the indicatorImage style.
	 * Possible values are any image URL.
	 */
	public static $STYLE_INDICATOR_IMAGE = "indicatorImage";

	/**
	 * Variable: STYLE_INDICATOR_COLOR
	 *
	 * Defines the key for the indicatorColor style. Possible values are all
	 * HTML color names or HEX codes, as well as the special 'swimlane' keyword
	 * to refer to the color of the parent swimlane if one exists.
	 */
	public static $STYLE_INDICATOR_COLOR = "indicatorColor";

	/**
	 * Variable: STYLE_INDICATOR_GRADIENTCOLOR
	 *
	 * Defines the key for the indicatorGradientColor style. Possible values
	 * are all HTML color names or HEX codes. This style is only supported in
	 * <SHAPE_LABEL> shapes.
	 */
	public static $STYLE_INDICATOR_GRADIENTCOLOR = "indicatorGradientColor";

	/**
	 * Variable: STYLE_INDICATOR_SPACING
	 *
	 * Defines the key for the indicatorSpacing style (in px).
	 */
	public static $STYLE_INDICATOR_SPACING = "indicatorSpacing";

	/**
	 * Variable: STYLE_INDICATOR_WIDTH
	 *
	 * Defines the key for the indicatorWidth style (in px).
	 */
	public static $STYLE_INDICATOR_WIDTH = "indicatorWidth";

	/**
	 * Variable: STYLE_INDICATOR_HEIGHT
	 *
	 * Defines the key for the indicatorHeight style (in px).
	 */
	public static $STYLE_INDICATOR_HEIGHT = "indicatorHeight";

	/**
	 * Variable: STYLE_SHADOW
	 *
	 * Defines the key for the shadow style. The type of the value is Boolean.
	 */
	public static $STYLE_SHADOW = "shadow";
	
	/**
	 * Variable: STYLE_SEGMENT
	 * 
	 * Defines the key for the segment style. The type of this value is
	 * float and the value represents the size of the horizontal
	 * segment of the entity relation style. Default is ENTITY_SEGMENT.
	 */
	public static $STYLE_SEGMENT = "segment";
	
	/**
	 * Variable: STYLE_ENDARROW
	 *
	 * Defines the key for the endArrow style.
	 * Possible values are all constants in this
	 * class that start with ARROW_.
	 * This style is supported in the
	 * <mxConnector> shape.
	 *
	 * Example:
	 * (code)
	 * style[mxConstants.public static $STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
	 * (end)
	 */
	public static $STYLE_ENDARROW = "endArrow";

	/**
	 * Variable: STYLE_STARTARROW
	 *
	 * Defines the key for the startArrow style.
	 * Possible values are all constants in this
	 * class that start with ARROW_.
	 * See <public static $STYLE_ENDARROW>.
	 * This style is supported in the
	 * <mxConnector> shape.
	 */
	public static $STYLE_STARTARROW = "startArrow";

	/**
	 * Variable: STYLE_ENDSIZE
	 *
	 * Defines the key for the endSize style. The type of this value is numeric
	 * and the value represents the size of the end marker in pixels.
	 */
	public static $STYLE_ENDSIZE = "endSize";

	/**
	 * Variable: STYLE_STARTSIZE
	 *
	 * Defines the key for the startSize style. The type of this value is
	 * numeric and the value represents the size of the start marker or the
	 * size of the swimlane title region depending on the shape it is used for.
	 */
	public static $STYLE_STARTSIZE = "startSize";

	/**
	 * Variable: STYLE_SWIMLANE_LINE
	 *
	 * Defines the key for the swimlaneLine style. This style specifies whether
	 * the line between the title regio of a swimlane should be visible. Use 0
	 * for hidden or 1 (default) for visible. Value is "swimlaneLine".
	 */
	public static $STYLE_SWIMLANE_LINE = "swimlaneLine";
	
	/**
	 * Variable: STYLE_DASHED
	 *
	 * Defines the key for the endSize style. The type of this value is numeric
	 * and the value represents the size of the end marker in pixels.
	 */
	public static $STYLE_DASHED = "dashed";

	/**
	 * Variable: STYLE_ROUNDED
	 *
	 * Defines the key for the rounded style. The type of this value is
	 * Boolean. For edges this determines whether or not joins between edges
	 * segments are smoothed to a rounded finish. For vertices that have the
	 * rectangle shape, this determines whether or not the rectangle is
	 * rounded.
	 */
	public static $STYLE_ROUNDED = "rounded";

	/**
	 * Variable: STYLE_SOURCE_PERIMETER_SPACING
	 *
	 * Defines the key for the source perimeter spacing. The type of this value
	 * is numeric. This is the distance between the source connection point of
	 * an edge and the perimeter of the source vertex in pixels. This style
	 * only applies to edges.
	 */
	public static $STYLE_SOURCE_PERIMETER_SPACING = "sourcePerimeterSpacing";

	/**
	 * Variable: STYLE_TARGET_PERIMETER_SPACING
	 *
	 * Defines the key for the source perimeter spacing. The type of this value
	 * is numeric. This is the distance between the target connection point of
	 * an edge and the perimeter of the target vertex in pixels.
	 */
	public static $STYLE_TARGET_PERIMETER_SPACING = "targetPerimeterSpacing";

	/**
	 * Variable: STYLE_PERIMETER_SPACING
	 *
	 * Defines the key for the perimeter spacing. This is the distance between
	 * the connection point and the perimeter in pixels. When used in a vertex
	 * style, this applies to all incoming edges to floating ports (edges that
	 * terminate on the perimeter of the vertex). When used in an edge style,
	 * this spacing applies to the source and target separately, if they
	 * terminate in floating ports (on the perimeter of the vertex).
	 */
	public static $STYLE_PERIMETER_SPACING = "perimeterSpacing";
	
	/**
	 * Variable: STYLE_SPACING
	 *
	 * Defines the key for the spacing. The value represents the spacing, in
	 * pixels, added to each side of a label in a vertex (style applies to
	 * vertices only).
	 */
	public static $STYLE_SPACING = "spacing";
	
	/**
	 * Variable: STYLE_SPACING_TOP
	 *
	 * Defines the key for the spacingTop style. The value represents the
	 * spacing, in pixels, added to the top side of a label in a vertex (style
	 * applies to vertices only).
	 */
	public static $STYLE_SPACING_TOP = "spacingTop";

	/**
	 * Variable: STYLE_SPACING_LEFT
	 *
	 * Defines the key for the spacingLeft style. The value represents the
	 * spacing, in pixels, added to the left side of a label in a vertex (style
	 * applies to vertices only).
	 */
	public static $STYLE_SPACING_LEFT = "spacingLeft";

	/**
	 * Variable: STYLE_SPACING_BOTTOM
	 *
	 * Defines the key for the spacingBottom style The value represents the
	 * spacing, in pixels, added to the bottom side of a label in a vertex
	 * (style applies to vertices only).
	 */
	public static $STYLE_SPACING_BOTTOM = "spacingBottom";

	/**
	 * Variable: STYLE_SPACING_RIGHT
	 *
	 * Defines the key for the spacingRight style The value represents the
	 * spacing, in pixels, added to the right side of a label in a vertex (style
	 * applies to vertices only).
	 */
	public static $STYLE_SPACING_RIGHT = "spacingRight";

	/**
	 * Variable: STYLE_HORIZONTAL
	 *
	 * Defines the key for the horizontal style. Possible values are
	 * true or false. This value only applies to vertices. If the <STYLE_SHAPE>
	 * is <code>SHAPE_SWIMLANE</code> a value of false indicates that the
	 * swimlane should be drawn vertically, true indicates to draw it
	 * horizontally. If the shape style does not indicate that this vertex is a
	 * swimlane, this value affects only whether the label is drawn
	 * horizontally or vertically.
	 */
	public static $STYLE_HORIZONTAL = "horizontal";

	/**
	 * Variable: STYLE_DIRECTION
	 * 
	 * Defines the key for the direction style. The direction style is used
	 * to specify the direction of certain shapes (eg. <mxTriangle>).
	 * Possible values are <DIRECTION_EAST> (default), <DIRECTION_WEST>,
	 * <DIRECTION_NORTH> and <DIRECTION_SOUTH>.
	 */
	public static $STYLE_DIRECTION = "direction";

	/**
	 * Variable: STYLE_ELBOW
	 *
	 * Defines the key for the elbow style. Possible values are
	 * <ELBOW_HORIZONTAL> and <ELBOW_VERTICAL>. Default is <ELBOW_HORIZONTAL>.
	 * This defines how the three segment orthogonal edge style leaves its
	 * terminal vertices. The vertical style leaves the terminal vertices at
	 * the top and bottom sides.
	 */
	public static $STYLE_ELBOW = "elbow";

	/**
	 * Variable: STYLE_FONTCOLOR
	 *
	 * Defines the key for the fontColor style. Possible values are all HTML
	 * color names or HEX codes.
	 */
	public static $STYLE_FONTCOLOR = "fontColor";

	/**
	 * Variable: STYLE_FONTFAMILY
	 *
	 * Defines the key for the fontFamily style. Possible values are names such
	 * as Arial; Dialog; Verdana; Times New Roman. The value is of type String.
	 */
	public static $STYLE_FONTFAMILY = "fontFamily";

	/**
	 * Variable: STYLE_FONTSIZE
	 *
	 * Defines the key for the fontSize style (in px). The type of the value
	 * is int.
	 */
	public static $STYLE_FONTSIZE = "fontSize";

	/**
	 * Variable: STYLE_FONTSTYLE
	 *
	 * Defines the key for the fontStyle style. Values may be any logical AND
	 * (sum) of <FONT_BOLD>, <FONT_ITALIC> and <FONT_UNDERLINE>.
	 * The type of the value is int.
	 */
	public static $STYLE_FONTSTYLE = "fontStyle";

	/**
	 * Variable: STYLE_SHAPE
	 *
	 * Defines the key for the shape. Possible values are all constants
	 * with a SHAPE-prefix or any newly defined shape names.
	 */
	public static $STYLE_SHAPE = "shape";

	/**
	 * Variable: STYLE_EDGE
	 *
	 * Defines the key for the edge style. Possible values are the functions
	 * defined in <mxEdgeStyle>.
	 */
	public static $STYLE_EDGE = "edgeStyle";

	/**
	 * Variable: STYLE_LOOP
	 * 
	 * Defines the key for the loop style. Possible values are the functions
	 * defined in <mxEdgeStyle>.
	 */
	public static $STYLE_LOOP = "loopStyle";

	/**
	 * Variable: STYLE_ROUTING_CENTER_X
	 * 
	 * Defines the key for the horizontal routing center. Possible values are
	 * between -0.5 and 0.5. This is the relative offset from the center used
	 * for connecting edges. The type of this value is numeric.
	 */
	public static $STYLE_ROUTING_CENTER_X = "routingCenterX";

	/**
	 * Variable: STYLE_ROUTING_CENTER_Y
	 * 
	 * Defines the key for the vertical routing center. Possible values are
	 * between -0.5 and 0.5. This is the relative offset from the center used
	 * for connecting edges. The type of this value is numeric.
	 */
	public static $STYLE_ROUTING_CENTER_Y = "routingCenterY";

	/**
	 * Variable: FONT_BOLD
	 */
	public static $FONT_BOLD = 1;

	/**
	 * Variable: FONT_ITALIC
	 */
	public static $FONT_ITALIC = 2;

	/**
	 * Variable: FONT_UNDERLINE
	 */
	public static $FONT_UNDERLINE = 4;

	/**
	 * Variable: SHAPE_RECTANGLE
	 */
	public static $SHAPE_RECTANGLE = "rectangle";

	/**
	 * Variable: SHAPE_ELLIPSE
	 */
	public static $SHAPE_ELLIPSE = "ellipse";

	/**
	 * Variable: SHAPE_DOUBLE_ELLIPSE
	 */
	public static $SHAPE_DOUBLE_ELLIPSE = "doubleEllipse";

	/**
	 * Variable: SHAPE_RHOMBUS
	 */
	public static $SHAPE_RHOMBUS = "rhombus";

	/**
	 * Variable: SHAPE_LINE
	 */
	public static $SHAPE_LINE = "line";

	/**
	 * Variable: SHAPE_IMAGE
	 */
	public static $SHAPE_IMAGE = "image";
	
	/**
	 * Variable: SHAPE_ARROW
	 */
	public static $SHAPE_ARROW = "arrow";
	
	/**
	 * Variable: SHAPE_LABEL
	 */
	public static $SHAPE_LABEL = "label";
	
	/**
	 * Variable: SHAPE_CYLINDER
	 */
	public static $SHAPE_CYLINDER = "cylinder";
	
	/**
	 * Variable: SHAPE_SWIMLANE
	 */
	public static $SHAPE_SWIMLANE = "swimlane";
		
	/**
	 * Variable: SHAPE_CONNECTOR
	 */
	public static $SHAPE_CONNECTOR = "connector";
		
	/**
	 * Variable: SHAPE_ACTOR
	 */
	public static $SHAPE_ACTOR = "actor";
		
	/**
	 * Variable: SHAPE_CLOUD
	 */
	public static $SHAPE_CLOUD = "cloud";
		
	/**
	 * Variable: SHAPE_TRIANGLE
	 */
	public static $SHAPE_TRIANGLE = "triangle";
		
	/**
	 * Variable: SHAPE_HEXAGON
	 */
	public static $SHAPE_HEXAGON = "hexagon";

	/**
	 * Variable: ARROW_CLASSIC
	 */
	public static $ARROW_CLASSIC = "classic";

	/**
	 * Variable: ARROW_BLOCK
	 */
	public static $ARROW_BLOCK = "block";

	/**
	 * Variable: ARROW_OPEN
	 */
	public static $ARROW_OPEN = "open";

	/**
	 * Variable: ARROW_OVAL
	 */
	public static $ARROW_OVAL = "oval";

	/**
	 * Variable: ARROW_DIAMOND
	 */
	public static $ARROW_DIAMOND = "diamond";

	/**
	 * Variable: ALIGN_LEFT
	 */
	public static $ALIGN_LEFT = "left";

	/**
	 * Variable: ALIGN_CENTER
	 */
	public static $ALIGN_CENTER = "center";

	/**
	 * Variable: ALIGN_RIGHT
	 */
	public static $ALIGN_RIGHT = "right";

	/**
	 * Variable: ALIGN_TOP
	 */
	public static $ALIGN_TOP = "top";

	/**
	 * Variable: ALIGN_MIDDLE
	 */
	public static $ALIGN_MIDDLE = "middle";

	/**
	 * Variable: ALIGN_BOTTOM
	 */
	public static $ALIGN_BOTTOM = "bottom";

	/**
	 * Variable: DIRECTION_NORTH
	 */
	public static $DIRECTION_NORTH = "north";

	/**
	 * Variable: DIRECTION_SOUTH
	 */
	public static $DIRECTION_SOUTH = "south";

	/**
	 * Variable: DIRECTION_EAST
	 */
	public static $DIRECTION_EAST = "east";

	/**
	 * Variable: DIRECTION_WEST
	 */
	public static $DIRECTION_WEST = "west";

	/**
	 * Variable: ELBOW_VERTICAL
	 */
	public static $ELBOW_VERTICAL = "vertical";

	/**
	 * Variable: ELBOW_HORIZONTAL
	 */
	public static $ELBOW_HORIZONTAL = "horizontal";

	/**
	 * Variable: 
	 *
	 * Name of the elbow edge style. Can be used as a string value
	 * for the STYLE_EDGE style.
	 */
	public static $EDGESTYLE_ELBOW = "elbowEdgeStyle";

	/**
	 * Variable: EDGESTYLE_ENTITY_RELATION
	 *
	 * Name of the entity relation edge style. Can be used as a string value
	 * for the STYLE_EDGE style.
	 */
	public static $EDGESTYLE_ENTITY_RELATION = "entityRelationEdgeStyle";

	/**
	 * Variable: EDGESTYLE_LOOP
	 *
	 * Name of the loop edge style. Can be used as a string value
	 * for the STYLE_EDGE style.
	 */
	public static $EDGESTYLE_LOOP = "loopEdgeStyle";

	/**
	 * Variable: EDGESTYLE_SIDETOSIDE
	 *
	 * Name of the side to side edge style. Can be used as a string value
	 * for the STYLE_EDGE style.
	 */
	public static $EDGESTYLE_SIDETOSIDE = "sideToSideEdgeStyle";

	/**
	 * Variable: EDGESTYLE_TOPTOBOTTOM
	 *
	 * Name of the top to bottom edge style. Can be used as a string value
	 * for the STYLE_EDGE style.
	 */
	public static $EDGESTYLE_TOPTOBOTTOM = "topToBottomEdgeStyle";

	/**
	 * Variable: PERIMETER_ELLIPSE
	 *
	 * Name of the ellipse perimeter. Can be used as a string value
	 * for the STYLE_PERIMETER style.
	 */
	public static $PERIMETER_ELLIPSE = "ellipsePerimeter";

	/**
	 * Variable: PERIMETER_RECTANGLE
	 *
	 * Name of the rectangle perimeter. Can be used as a string value
	 * for the STYLE_PERIMETER style.
	 */
	public static $PERIMETER_RECTANGLE = "rectanglePerimeter";

	/**
	 * Variable: PERIMETER_RHOMBUS
	 *
	 * Name of the rhombus perimeter. Can be used as a string value
	 * for the STYLE_PERIMETER style.
	 */
	public static $PERIMETER_RHOMBUS = "rhombusPerimeter";

	/**
	 * Variable: PERIMETER_TRIANGLE
	 *
	 * Name of the triangle perimeter. Can be used as a string value
	 * for the STYLE_PERIMETER style.
	 */
	public static $PERIMETER_TRIANGLE = "trianglePerimeter";

}
?>
