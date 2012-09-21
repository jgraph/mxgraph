/**
 * $Id: mxPath.js,v 1.24 2012-06-13 17:31:32 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPath
 *
 * An abstraction for creating VML and SVG paths. See <mxActor> for using this
 * object inside an <mxShape> for painting cells.
 * 
 * Constructor: mxPath
 *
 * Constructs a path for the given format, which is one of svg or vml.
 * 
 * Parameters:
 * 
 * format - String specifying the <format>. May be one of vml or svg
 * (default).
 */
function mxPath(format)
{
	this.format = format;
	this.path = [];
	this.translate = new mxPoint(0, 0);
};

/**
 * Variable: format
 *
 * Defines the format for the output of this path. Possible values are
 * svg and vml.
 */
mxPath.prototype.format = null;

/**
 * Variable: translate
 *
 * <mxPoint> that specifies the translation of the complete path.
 */
mxPath.prototype.translate = null;

/**
 * Variable: scale
 *
 * Number that specifies the translation of the path.
 */
mxPath.prototype.scale = 1;

/**
 * Variable: path
 *
 * Contains the textual representation of the path as an array.
 */
mxPath.prototype.path = null;

/**
 * Function: isVml
 *
 * Returns true if <format> is vml.
 */
mxPath.prototype.isVml = function()
{
	return this.format == 'vml';
};

/**
 * Function: getPath
 *
 * Returns string that represents the path in <format>.
 */
mxPath.prototype.getPath = function()
{
	return this.path.join('');
};

/**
 * Function: setTranslate
 *
 * Set the global translation of this path, that is, the origin of the 
 * coordinate system.
 * 
 * Parameters:
 * 
 * x - X-coordinate of the new origin.
 * y - Y-coordinate of the new origin.
 */
mxPath.prototype.setTranslate = function(x, y)
{
	this.translate = new mxPoint(x, y);
};

/**
 * Function: moveTo
 *
 * Moves the cursor to (x, y).
 * 
 * Parameters:
 * 
 * x - X-coordinate of the new cursor location.
 * y - Y-coordinate of the new cursor location.
 */
mxPath.prototype.moveTo = function(x, y)
{
	x += this.translate.x;
	y += this.translate.y;
	
	x *= this.scale;
	y *= this.scale;
	
	if (this.isVml())
	{
		this.path.push('m ', Math.round(x), ' ', Math.round(y), ' ');
	}
	else
	{
		this.path.push('M ', x, ' ', y, ' ');
	}
};
	
/**
 * Function: lineTo
 *
 * Draws a straight line from the current poin to (x, y).
 * 
 * Parameters:
 * 
 * x - X-coordinate of the endpoint.
 * y - Y-coordinate of the endpoint.
 */
mxPath.prototype.lineTo = function(x, y)
{
	x += this.translate.x;
	y += this.translate.y;
	
	x *= this.scale;
	y *= this.scale;
	
	if (this.isVml())
	{
		this.path.push('l ', Math.round(x), ' ', Math.round(y), ' ');
	}
	else
	{
		this.path.push('L ', x, ' ', y, ' ');
	}
};

/**
 * Function: quadTo
 * 
 * Draws a quadratic Bézier curve from the current point to (x, y) using
 * (x1, y1) as the control point.
 * 
 * Parameters:
 * 
 * x1 - X-coordinate of the control point.
 * y1 - Y-coordinate of the control point.
 * x - X-coordinate of the endpoint. 
 * y - Y-coordinate of the endpoint.
 */
mxPath.prototype.quadTo = function(x1, y1, x, y)
{
	x1 += this.translate.x;
	y1 += this.translate.y;
	
	x1 *= this.scale;
	y1 *= this.scale;
	
	x += this.translate.x;
	y += this.translate.y;
	
	x *= this.scale;
	y *= this.scale;
	
	if (this.isVml())
	{
		this.path.push('c ', Math.round(x1), ' ', Math.round(y1), ' ', Math.round(x), ' ',
			Math.round(y), ' ', Math.round(x), ' ', Math.round(y), ' ');
	}
	else
	{
		this.path.push('Q ', x1, ' ', y1, ' ', x, ' ', y, ' ');
	}
};

/**
 * Function: curveTo
 *
 * Draws a cubic Bézier curve from the current point to (x, y) using
 * (x1, y1) as the control point at the beginning of the curve and (x2, y2)
 * as the control point at the end of the curve.
 * 
 * Parameters:
 * 
 * x1 - X-coordinate of the first control point.
 * y1 - Y-coordinate of the first control point.
 * x2 - X-coordinate of the second control point.
 * y2 - Y-coordinate of the second control point.
 * x - X-coordinate of the endpoint. 
 * y - Y-coordinate of the endpoint.
 */
mxPath.prototype.curveTo = function(x1, y1, x2, y2, x, y)
{
	x1 += this.translate.x;
	y1 += this.translate.y;
	
	x1 *= this.scale;
	y1 *= this.scale;
	
	x2 += this.translate.x;
	y2 += this.translate.y;
	
	x2 *= this.scale;
	y2 *= this.scale;
	
	x += this.translate.x;
	y += this.translate.y;
	
	x *= this.scale;
	y *= this.scale;
	
	if (this.isVml())
	{
		this.path.push('c ', Math.round(x1), ' ', Math.round(y1), ' ', Math.round(x2),
			' ', Math.round(y2), ' ', Math.round(x), ' ', Math.round(y), ' ');
	}
	else
	{
		this.path.push('C ', x1, ' ', y1, ' ', x2,
			' ', y2, ' ', x, ' ', y, ' ');
	}
};

/**
 * Function: ellipse
 *
 * Adds the given ellipse. Some implementations may require the path to be
 * closed after this operation.
 */
mxPath.prototype.ellipse = function(x, y, w, h)
{
	x += this.translate.x;
	y += this.translate.y;
	x *= this.scale;
	y *= this.scale;

	if (this.isVml())
	{
		this.path.push('at ', Math.round(x), ' ', Math.round(y), ' ', Math.round(x + w), ' ', Math.round(y +  h), ' ',
				Math.round(x), ' ', Math.round(y + h / 2), ' ', Math.round(x), ' ', Math.round(y + h / 2));
	}
	else
	{
		var startX = x;
		var startY = y + h/2;
		var endX = x + w;
		var endY = y + h/2;
		var r1 = w/2;
		var r2 = h/2;
		this.path.push('M ', startX, ' ', startY, ' ');
		this.path.push('A ', r1, ' ', r2, ' 0 1 0 ', endX, ' ', endY, ' ');
		this.path.push('A ', r1, ' ', r2, ' 0 1 0 ', startX, ' ', startY);
	}
};

/**
 * Function: addPath
 *
 * Adds the given path.
 */
mxPath.prototype.addPath = function(path)
{
	this.path = this.path.concat(path.path);
};

/**
 * Function: write
 *
 * Writes directly into the path. This bypasses all conversions.
 */
mxPath.prototype.write = function(string)
{
	this.path.push(string, ' ');
};

/**
 * Function: end
 *
 * Ends the path.
 */
mxPath.prototype.end = function()
{
	if (this.format == 'vml')
	{
		this.path.push('e');
	}
};

/**
 * Function: close
 *
 * Closes the path.
 */
mxPath.prototype.close = function()
{
	if (this.format == 'vml')
	{
		this.path.push('x e');
	}
	else
	{
		this.path.push('Z');
	}
};
