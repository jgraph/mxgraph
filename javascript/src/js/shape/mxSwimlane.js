/**
 * $Id: mxSwimlane.js,v 1.17 2013/04/01 12:21:21 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxSwimlane
 *
 * Extends <mxShape> to implement a swimlane shape. This shape is registered
 * under <mxConstants.SHAPE_SWIMLANE> in <mxCellRenderer>. Use the
 * <mxConstants.STYLE_STYLE_STARTSIZE> to define the size of the title
 * region, <mxConstants.STYLE_SWIMLANE_FILLCOLOR> for the content area fill,
 * <mxConstants.STYLE_SEPARATORCOLOR> to draw an additional vertical separator
 * and <mxConstants.STYLE_SWIMLANE_LINE> to hide the line between the title
 * region and the content area. The <mxConstants.STYLE_HORIZONTAL> affects
 * the orientation of this shape, not only its label.
 * 
 * Constructor: mxSwimlane
 *
 * Constructs a new swimlane shape.
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxSwimlane(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxSwimlane, mxShape);

/**
 * Variable: imageSize
 *
 * Default imagewidth and imageheight if an image but no imagewidth
 * and imageheight are defined in the style. Value is 16.
 */
mxSwimlane.prototype.imageSize = 16;

/**
 * Function: getGradientBounds
 * 
 * Returns the bounding box for the gradient box for this shape.
 */
mxSwimlane.prototype.getGradientBounds = function(c, x, y, w, h)
{
	var start = Math.min(h, mxUtils.getValue(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
	
	return new mxRectangle(x, y, w, start);
};

/**
 * Function: getRotation
 * 
 * Overrides rotation to include the horizontal flag in the shape rotation.
 */
mxSwimlane.prototype.getRotation = function()
{
	var rot = mxShape.prototype.getRotation.apply(this, arguments);
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) != 1)
	{
		rot += mxText.prototype.verticalTextRotation;
	}
	
	return rot;
};

/**
 * Function: getTextRotation
 * 
 * Redirect the text rotation to the shape rotation to avoid adding the vertical
 * text rotation twice.
 */
mxSwimlane.prototype.getTextRotation = function()
{
	return this.getRotation();
};

/**
 * Function: isPaintBoundsInverted
 * 
 * Overrides bounds inversion to maintain the bounds if the shape is rotated
 * via the horizontal flag.
 */
mxSwimlane.prototype.isPaintBoundsInverted = function()
{
	return mxShape.prototype.isPaintBoundsInverted.apply(this, arguments) ||
		mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) != 1;
};

/**
 * Function: getArcSize
 * 
 * Returns the arcsize for the swimlane.
 */
mxSwimlane.prototype.getArcSize = function(w, h, start)
{
	var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;

	return start * f * 3; 
};

/**
 * Function: paintVertexShape
 *
 * Paints the swimlane vertex shape.
 */
mxSwimlane.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var start = Math.min(h, mxUtils.getValue(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
	var fill = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_FILLCOLOR, mxConstants.NONE);
	var swimlaneLine = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_LINE, 1) == 1;
	var r = 0;

	c.translate(x, y);
	
	if (!this.isRounded)
	{
		this.paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine);
	}
	else
	{
		r = this.getArcSize(w, h, start);
		this.paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine);
	}
	
	var sep = mxUtils.getValue(this.style, mxConstants.STYLE_SEPARATORCOLOR, mxConstants.NONE);
	this.paintSeparator(c, w, start, h, sep);

	if (this.image != null)
	{
		var bounds = this.getImageBounds(x, y, w, h);
		c.image(bounds.x - x, bounds.y - y, bounds.width, bounds.height,
				this.image, false, false, false);
	}
	
	if (this.glass)
	{
		c.setShadow(false);
		this.paintGlassEffect(c, 0, 0, w, start, r);
	}
};

/**
 * Function: paintSwimlane
 *
 * Paints the swimlane vertex shape.
 */
mxSwimlane.prototype.paintSwimlane = function(c, x, y, w, h, start, fill, swimlaneLine)
{
	if (fill != mxConstants.NONE)
	{
		c.save();
		c.setFillColor(fill);
		c.rect(0, 0, w, h);
		c.fillAndStroke();
		c.restore();
		c.setShadow(false);
	}
	
	c.begin();
	c.moveTo(0, start);
	c.lineTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w, start);
	
	if (swimlaneLine)
	{
		c.close();
	}
	
	c.fillAndStroke();
	
	// Transparent content area
	if (start < h && fill == mxConstants.NONE)
	{
		c.pointerEvents = false;
		
		c.begin();
		c.moveTo(0, start);
		c.lineTo(0, h);
		c.lineTo(w, h);
		c.lineTo(w, start);
		c.stroke();
	}
};

/**
 * Function: paintRoundedSwimlane
 *
 * Paints the swimlane vertex shape.
 */
mxSwimlane.prototype.paintRoundedSwimlane = function(c, x, y, w, h, start, r, fill, swimlaneLine)
{
	if (fill != mxConstants.NONE)
	{
		c.save();
		c.setFillColor(fill);
		c.roundrect(0, 0, w, h, r, r);
		c.fillAndStroke();
		c.restore();
		c.setShadow(false);
	}
	
	c.begin();
	c.moveTo(w, start);
	c.lineTo(w, r);
	c.quadTo(w, 0, w - Math.min(w / 2, r), 0);
	c.lineTo(Math.min(w / 2, r), 0);
	c.quadTo(0, 0, 0, r);
	c.lineTo(0, start);
	
	if (swimlaneLine)
	{
		c.close();
	}

	c.fillAndStroke();
	
	// Transparent content area
	if (start < h && fill == mxConstants.NONE)
	{
		c.pointerEvents = false;
		
		c.begin();
		c.moveTo(0, start);
		c.lineTo(0, h - r);
		c.quadTo(0, h, Math.min(w / 2, r), h);
		c.lineTo(w - Math.min(w / 2, r), h);
		c.quadTo(w, h, w, h - r);
		c.lineTo(w, start);
		c.stroke();
	}
};

/**
 * Function: paintSwimlane
 *
 * Paints the swimlane vertex shape.
 */
mxSwimlane.prototype.paintSeparator = function(c, x, y, h, color)
{
	if (color != mxConstants.NONE)
	{
		c.setStrokeColor(color);
		c.setDashed(true);
		c.begin();
		c.moveTo(x, y);
		c.lineTo(x, h);
		c.stroke();
		c.setDashed(false);
	}
};

/**
 * Function: getImageBounds
 *
 * Paints the swimlane vertex shape.
 */
mxSwimlane.prototype.getImageBounds = function(x, y, w, h)
{
	return new mxRectangle(x + w - this.imageSize, y, this.imageSize, this.imageSize);
};
