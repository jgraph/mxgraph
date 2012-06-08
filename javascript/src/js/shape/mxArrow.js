/**
 * $Id: mxArrow.js,v 1.31 2012-05-23 19:09:22 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxArrow
 *
 * Extends <mxShape> to implement an arrow shape. (The shape
 * is used to represent edges, not vertices.)
 * This shape is registered under <mxConstants.SHAPE_ARROW>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxArrow
 *
 * Constructs a new arrow shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 * arrowWidth - Optional integer that defines the arrow width. Default is
 * <mxConstants.ARROW_WIDTH>. This is stored in <arrowWidth>.
 * spacing - Optional integer that defines the spacing between the arrow shape
 * and its endpoints. Default is <mxConstants.ARROW_SPACING>. This is stored in
 * <spacing>.
 * endSize - Optional integer that defines the size of the arrowhead. Default
 * is <mxConstants.ARROW_SIZE>. This is stored in <endSize>.
 */
function mxArrow(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize)
{
	this.points = points;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.arrowWidth = (arrowWidth != null) ? arrowWidth : mxConstants.ARROW_WIDTH;
	this.spacing = (spacing != null) ? spacing : mxConstants.ARROW_SPACING;
	this.endSize = (endSize != null) ? endSize : mxConstants.ARROW_SIZE;
};

/**
 * Extends <mxActor>.
 */
mxArrow.prototype = new mxActor();
mxArrow.prototype.constructor = mxArrow;

/**
 * Variable: addPipe
 *
 * Specifies if a SVG path should be created around any path to increase the
 * tolerance for mouse events. Default is false since this shape is filled.
 */
mxArrow.prototype.addPipe = false;

/**
 * Variable: enableFill
 *
 * Specifies if fill colors should be ignored. This must be set to true for
 * shapes that are stroked only. Default is true since this shape is filled.
 */
mxArrow.prototype.enableFill = true;

/**
 * Function: configureTransparentBackground
 * 
 * Overidden to remove transparent background.
 */
mxArrow.prototype.configureTransparentBackground = function(node)
{
	// do nothing
};

/**
 * Function: updateBoundingBox
 *
 * Updates the <boundingBox> for this shape.
 */
mxArrow.prototype.augmentBoundingBox = function(bbox)
{
	// FIXME: Fix precision, share math and cache results with painting code
	bbox.grow(Math.max(this.arrowWidth / 2, this.endSize / 2) * this.scale);
	
	mxShape.prototype.augmentBoundingBox.apply(this, arguments);
};

/**
 * Function: createVml
 *
 * Extends <mxShape.createVml> to ignore fill if <enableFill> is false.
 */
mxArrow.prototype.createVml = function()
{
	if (!this.enableFill)
	{
		this.fill = null;
	}
	
	return mxActor.prototype.createVml.apply(this, arguments);
};

/**
 * Function: createSvg
 *
 * Extends <mxActor.createSvg> to ignore fill if <enableFill> is false and
 * create an event handling shape if <this.addPipe> is true.
 */
mxArrow.prototype.createSvg = function()
{
	if (!this.enableFill)
	{
		this.fill = null;
	}
	
	var g = mxActor.prototype.createSvg.apply(this, arguments);
	
	// Creates an invisible shape around the path for easier
	// selection with the mouse. Note: Firefox does not ignore
	// the value of the stroke attribute for pointer-events: stroke,
	// it does, however, ignore the visibility attribute.
	if (this.addPipe)
	{
		this.pipe = this.createSvgPipe();
		g.appendChild(this.pipe);
	}
	
	return g;
};

/**
 * Function: reconfigure
 *
 * Extends <mxActor.reconfigure> to ignore fill if <enableFill> is false.
 */
mxArrow.prototype.reconfigure = function()
{
	if (!this.enableFill)
	{
		this.fill = null;
	}
	
	mxActor.prototype.reconfigure.apply(this, arguments);
};

/**
 * Function: redrawSvg
 *
 * Extends <mxActor.redrawSvg> to update the event handling shape if one
 * exists.
 */
mxArrow.prototype.redrawSvg = function()
{
	mxActor.prototype.redrawSvg.apply(this, arguments);
	
	if (this.pipe != null)
	{
		var d = this.innerNode.getAttribute('d');
		
		if (d != null)
		{
			this.pipe.setAttribute('d', this.innerNode.getAttribute('d'));
			var strokeWidth = Math.round(this.strokewidth * this.scale);
			this.pipe.setAttribute('stroke-width', strokeWidth + mxShape.prototype.SVG_STROKE_TOLERANCE);
		}
	}
};

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxArrow.prototype.redrawPath = function(path, x, y, w, h)
{
	// All points are offset
	path.translate.x -= x;
	path.translate.y -= y;

	// Geometry of arrow
	var spacing = this.spacing * this.scale;
	var width = this.arrowWidth * this.scale;
	var arrow = this.endSize * this.scale;

	// Base vector (between end points)
	var p0 = this.points[0];
	var pe = this.points[this.points.length - 1];
	
	var dx = pe.x - p0.x;
	var dy = pe.y - p0.y;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var length = dist - 2 * spacing - arrow;
	
	// Computes the norm and the inverse norm
	var nx = dx / dist;
	var ny = dy / dist;
	var basex = length * nx;
	var basey = length * ny;
	var floorx = width * ny/3;
	var floory = -width * nx/3;
	
	// Computes points
	var p0x = p0.x - floorx / 2 + spacing * nx;
	var p0y = p0.y - floory / 2 + spacing * ny;
	var p1x = p0x + floorx;
	var p1y = p0y + floory;
	var p2x = p1x + basex;
	var p2y = p1y + basey;
	var p3x = p2x + floorx;
	var p3y = p2y + floory;
	// p4 not necessary
	var p5x = p3x - 3 * floorx;
	var p5y = p3y - 3 * floory;
	
	path.moveTo(p0x, p0y);
	path.lineTo(p1x, p1y);
	path.lineTo(p2x, p2y);
	path.lineTo(p3x, p3y);
	path.lineTo(pe.x - spacing * nx, pe.y - spacing * ny);
	path.lineTo(p5x, p5y);
	path.lineTo(p5x + floorx, p5y + floory);
	path.lineTo(p0x, p0y);
	path.close();
};
