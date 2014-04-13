/**
 * $Id: mxRectangleShape.js,v 1.12 2013/10/28 08:45:05 gaudenz Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxRectangleShape
 *
 * Extends <mxShape> to implement a rectangle shape.
 * This shape is registered under <mxConstants.SHAPE_RECTANGLE>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxRectangleShape
 *
 * Constructs a new rectangle shape.
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
function mxRectangleShape(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxRectangleShape, mxShape);

/**
 * Function: isHtmlAllowed
 *
 * Returns true for non-rounded, non-rotated shapes with no glass gradient.
 */
mxRectangleShape.prototype.isHtmlAllowed = function()
{
	return !this.isRounded && !this.glass && this.rotation == 0;
};

/**
 * Function: paintBackground
 * 
 * Generic background painting implementation.
 */
mxRectangleShape.prototype.paintBackground = function(c, x, y, w, h)
{
	if (this.isRounded)
	{
		var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
			mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
		var r = Math.min(w * f, h * f);
		c.roundrect(x, y, w, h, r, r);
	}
	else
	{
		c.rect(x, y, w, h);
	}
		
	c.fillAndStroke();
};

/**
 * Function: paintForeground
 * 
 * Generic background painting implementation.
 */
mxRectangleShape.prototype.paintForeground = function(c, x, y, w, h)
{
	if (this.glass)
	{
		this.paintGlassEffect(c, x, y, w, h, this.getArcSize(w + this.strokewidth, h + this.strokewidth));
	}
};
