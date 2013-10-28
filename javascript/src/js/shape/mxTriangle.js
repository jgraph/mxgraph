/**
 * $Id: mxTriangle.js,v 1.4 2013/10/28 08:45:05 gaudenz Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxTriangle
 * 
 * Implementation of the triangle shape.
 * 
 * Constructor: mxTriangle
 *
 * Constructs a new triangle shape.
 */
function mxTriangle()
{
	mxActor.call(this);
};

/**
 * Extends mxActor.
 */
mxUtils.extend(mxTriangle, mxActor);

/**
 * Function: redrawPath
 *
 * Draws the path for this shape.
 */
mxTriangle.prototype.redrawPath = function(c, x, y, w, h)
{
	c.moveTo(0, 0);
	c.lineTo(w, 0.5 * h);
	c.lineTo(0, h);
	c.close();
};
