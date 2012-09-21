/**
 * $Id: mxTriangle.js,v 1.10 2011-09-02 10:01:00 gaudenz Exp $
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
function mxTriangle() { };

/**
 * Extends <mxActor>.
 */
mxTriangle.prototype = new mxActor();
mxTriangle.prototype.constructor = mxTriangle;

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxTriangle.prototype.redrawPath = function(path, x, y, w, h)
{
	path.moveTo(0, 0);
	path.lineTo(w, 0.5 * h);
	path.lineTo(0, h);
	path.close();
};
