/**
 * $Id: mxPolyline.js,v 1.4 2013/02/04 09:27:33 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPolyline
 *
 * Extends <mxShape> to implement a polyline (a line with multiple points).
 * This shape is registered under <mxConstants.SHAPE_POLYLINE> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxPolyline
 *
 * Constructs a new polyline shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxPolyline(points, stroke, strokewidth)
{
	mxShape.call(this);
	this.points = points;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxPolyline, mxShape);

/**
 * Function: getRotation
 * 
 * Overrides to return 0.
 */
mxPolyline.prototype.getRotation = function()
{
	return 0;
};

/**
 * Function: paintEdgeShape
 * 
 * Paints the line shape.
 */
mxPolyline.prototype.paintEdgeShape = function(c, pts)
{
	this.paintLine(c, pts, this.isRounded);
};

/**
 * Function: paintLine
 * 
 * Paints the line shape.
 */
mxPolyline.prototype.paintLine = function(c, pts, rounded)
{
	var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
	var pt = pts[0];
	var pe = pts[pts.length - 1];

	c.begin();
	c.moveTo(pt.x, pt.y);
	
	// Draws the line segments
	for (var i = 1; i < pts.length - 1; i++)
	{
		var tmp = pts[i];
		var dx = pt.x - tmp.x;
		var dy = pt.y - tmp.y;

		if ((rounded && i < pts.length - 1) && (dx != 0 || dy != 0))
		{
			// Draws a line from the last point to the current
			// point with a spacing of size off the current point
			// into direction of the last point
			var dist = Math.sqrt(dx * dx + dy * dy);
			var nx1 = dx * Math.min(arcSize, dist / 2) / dist;
			var ny1 = dy * Math.min(arcSize, dist / 2) / dist;

			var x1 = tmp.x + nx1;
			var y1 = tmp.y + ny1;
			c.lineTo(x1, y1);

			// Draws a curve from the last point to the current
			// point with a spacing of size off the current point
			// into direction of the next point
			var next = pts[i + 1];
			dx = next.x - tmp.x;
			dy = next.y - tmp.y;

			dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
			var nx2 = dx * Math.min(arcSize, dist / 2) / dist;
			var ny2 = dy * Math.min(arcSize, dist / 2) / dist;

			var x2 = tmp.x + nx2;
			var y2 = tmp.y + ny2;

			c.quadTo(tmp.x, tmp.y, x2, y2);
			tmp = new mxPoint(x2, y2);
		}
		else
		{
			c.lineTo(tmp.x, tmp.y);
		}

		pt = tmp;
	}

	c.lineTo(pe.x, pe.y);
	c.stroke();
};
