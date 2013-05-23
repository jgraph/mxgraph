/**
 * $Id: mxDoubleEllipse.js,v 1.4 2013/01/05 21:30:31 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxDoubleEllipse
 *
 * Extends <mxShape> to implement a double ellipse shape.
 * This shape is registered under <mxConstants.SHAPE_DOUBLE_ELLIPSE>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxDoubleEllipse
 *
 * Constructs a new ellipse shape.
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
function mxDoubleEllipse(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxDoubleEllipse, mxShape);

/**
 * Variable: vmlScale
 * 
 * Scale for improving the precision of VML rendering. Default is 10.
 */
mxDoubleEllipse.prototype.vmlScale = 10;

/**
 * Function: paintBackground
 * 
 * Paints the background.
 */
mxDoubleEllipse.prototype.paintBackground = function(c, x, y, w, h)
{
	c.ellipse(x, y, w, h);
	c.fillAndStroke();
};

/**
 * Function: paintForeground
 * 
 * Paints the foreground.
 */
mxDoubleEllipse.prototype.paintForeground = function(c, x, y, w, h)
{
	var inset = Math.min(4, Math.min(w / 5, h / 5));
	x += inset;
	y += inset;
	w -= 2 * inset;
	h -= 2 * inset;
	
	// FIXME: Rounding issues in IE8 standards mode (not in 1.x)
	if (w > 0 && h > 0)
	{
		c.ellipse(x, y, w, h);
	}
	
	c.stroke();
};
