/**
 * $Id: mxConnector.js,v 1.6 2013/01/15 18:03:42 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxConnector
 * 
 * Extends <mxShape> to implement a connector shape. The connector
 * shape allows for arrow heads on either side.
 * 
 * This shape is registered under <mxConstants.SHAPE_CONNECTOR> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxConnector
 * 
 * Constructs a new connector shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * Default is 'black'.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxConnector(points, stroke, strokewidth)
{
	mxPolyline.call(this, points, stroke, strokewidth);
};

/**
 * Extends mxPolyline.
 */
mxUtils.extend(mxConnector, mxPolyline);

/**
 * Function: paintEdgeShape
 * 
 * Paints the line shape.
 */
mxConnector.prototype.paintEdgeShape = function(c, pts)
{
	// The indirection via functions for markers is needed in
	// order to apply the offsets before painting the line and
	// paint the markers after painting the line.
	var sourceMarker = this.createMarker(c, pts, true);
	var targetMarker = this.createMarker(c, pts, false);

	if (this.style == null || this.style[mxConstants.STYLE_CURVED] != 1)
	{
		this.paintLine(c, pts, this.isRounded);
	}
	else
	{
		this.paintCurvedLine(c, pts);
	}
	
	// Disables shadows, dashed styles and fixes fill color for markers
	c.setFillColor(this.stroke);
	c.setShadow(false);
	c.setDashed(false);
	
	if (sourceMarker != null)
	{
		sourceMarker();
	}
	
	if (targetMarker != null)
	{
		targetMarker();
	}
};

/**
 * Function: paintLine
 * 
 * Paints the line shape.
 */
mxConnector.prototype.paintCurvedLine = function(c, pts)
{
	c.begin();
	
	var pt = pts[0];
	var n = pts.length;
	
	c.moveTo(pt.x, pt.y);
	
	for (var i = 1; i < n - 2; i++)
	{
		var p0 = pts[i];
		var p1 = pts[i + 1];
		var ix = (p0.x + p1.x) / 2;
		var iy = (p0.y + p1.y) / 2;
		
		c.quadTo(p0.x, p0.y, ix, iy);
	}
	
	var p0 = pts[n - 2];
	var p1 = pts[n - 1];
	
	c.quadTo(p0.x, p0.y, p1.x, p1.y);
	c.stroke();
};

/**
 * Function: createMarker
 * 
 * Prepares the marker by adding offsets in pts and returning a function to
 * paint the marker.
 */
mxConnector.prototype.createMarker = function(c, pts, source)
{
	// Computes the norm and the inverse norm
	var n = pts.length;
	
	var p0 = (source) ? pts[1] : pts[n - 2];
	var pe = (source) ? pts[0] : pts[n - 1];

	var dx = pe.x - p0.x;
	var dy = pe.y - p0.y;

	var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
	
	var unitX = dx / dist;
	var unitY = dy / dist;

	var size = mxUtils.getNumber(this.style, (source) ? mxConstants.STYLE_STARTSIZE : mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE);
	
	// Allow for stroke width in the end point used and the 
	// orthogonal vectors describing the direction of the marker
	var type = mxUtils.getValue(this.style, (source) ? mxConstants.STYLE_STARTARROW : mxConstants.STYLE_ENDARROW);
	var filled = this.style[(source) ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL] != 0;
	
	return mxMarker.createMarker(c, this, type, pe, unitX, unitY, size, source, this.strokewidth, filled);
};

/**
 * Function: augmentBoundingBox
 *
 * Augments the bounding box with the strokewidth and shadow offsets.
 */
mxConnector.prototype.augmentBoundingBox = function(bbox)
{
	mxShape.prototype.augmentBoundingBox.apply(this, arguments);
	
	// Adds marker sizes
	var size = 0;
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, mxConstants.NONE) != mxConstants.NONE)
	{
		size = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE) + 1;
	}
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, mxConstants.NONE) != mxConstants.NONE)
	{
		size = Math.max(size, mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE)) + 1;
	}
	
	bbox.grow(Math.ceil(size * this.scale));
};
