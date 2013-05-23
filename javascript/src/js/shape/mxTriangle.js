/**
 * $Id: mxTriangle.js,v 1.3 2012/11/22 21:04:16 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
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
