/**
 * $Id: mxRectangle.js,v 1.17 2010-12-08 12:46:03 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxRectangle
 *
 * Extends <mxPoint> to implement a 2-dimensional rectangle with double
 * precision coordinates.
 * 
 * Constructor: mxRectangle
 *
 * Constructs a new rectangle for the optional parameters. If no parameters
 * are given then the respective default values are used.
 */
function mxRectangle(x, y, width, height)
{
	mxPoint.call(this, x, y);

	this.width = (width != null) ? width : 0;
	this.height = (height != null) ? height : 0;
};

/**
 * Extends mxPoint.
 */
mxRectangle.prototype = new mxPoint();
mxRectangle.prototype.constructor = mxRectangle;

/**
 * Variable: width
 *
 * Holds the width of the rectangle. Default is 0.
 */
mxRectangle.prototype.width = null;

/**
 * Variable: height
 *
 * Holds the height of the rectangle. Default is 0.
 */
mxRectangle.prototype.height = null;

/**
 * Function: setRect
 * 
 * Sets this rectangle to the specified values
 */
mxRectangle.prototype.setRect = function(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
};

/**
 * Function: getCenterX
 * 
 * Returns the x-coordinate of the center point.
 */
mxRectangle.prototype.getCenterX = function ()
{
	return this.x + this.width/2;
};

/**
 * Function: getCenterY
 * 
 * Returns the y-coordinate of the center point.
 */
mxRectangle.prototype.getCenterY = function ()
{
	return this.y + this.height/2;
};

/**
 * Function: add
 *
 * Adds the given rectangle to this rectangle.
 */
mxRectangle.prototype.add = function(rect)
{
	if (rect != null)
	{
		var minX = Math.min(this.x, rect.x);
		var minY = Math.min(this.y, rect.y);
		var maxX = Math.max(this.x + this.width, rect.x + rect.width);
		var maxY = Math.max(this.y + this.height, rect.y + rect.height);
		
		this.x = minX;
		this.y = minY;
		this.width = maxX - minX;
		this.height = maxY - minY;
	}
};

/**
 * Function: grow
 *
 * Grows the rectangle by the given amount, that is, this method subtracts
 * the given amount from the x- and y-coordinates and adds twice the amount
 * to the width and height.
 */
mxRectangle.prototype.grow = function(amount)
{
	this.x -= amount;
	this.y -= amount;
	this.width += 2 * amount;
	this.height += 2 * amount;
};

/**
 * Function: getPoint
 * 
 * Returns the top, left corner as a new <mxPoint>.
 */
mxRectangle.prototype.getPoint = function()
{
	return new mxPoint(this.x, this.y);
};

/**
 * Function: equals
 * 
 * Returns true if the given object equals this rectangle.
 */
mxRectangle.prototype.equals = function(obj)
{
	return obj.x == this.x &&
		obj.y == this.y &&
		obj.width == this.width &&
		obj.height == this.height;
};
