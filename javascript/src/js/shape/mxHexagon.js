/**
 * $Id: mxHexagon.js,v 1.3 2012/11/22 21:04:16 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxHexagon
 * 
 * Implementation of the hexagon shape.
 * 
 * Constructor: mxHexagon
 *
 * Constructs a new hexagon shape.
 */
function mxHexagon()
{
	mxActor.call(this);
};

/**
 * Extends mxActor.
 */
mxUtils.extend(mxHexagon, mxActor);

/**
 * Function: redrawPath
 *
 * Draws the path for this shape.
 */
mxHexagon.prototype.redrawPath = function(c, x, y, w, h)
{
	c.moveTo(0.25 * w, 0);
	c.lineTo(0.75 * w, 0);
	c.lineTo(w, 0.5 * h);
	c.lineTo(0.75 * w, h);
	c.lineTo(0.25 * w, h);
	c.lineTo(0, 0.5 * h);
	c.close();
};
