/**
 * $Id: mxHexagon.js,v 1.8 2011-09-02 10:01:00 gaudenz Exp $
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
function mxHexagon() { };

/**
 * Extends <mxActor>.
 */
mxHexagon.prototype = new mxActor();
mxHexagon.prototype.constructor = mxHexagon;

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxHexagon.prototype.redrawPath = function(path, x, y, w, h)
{
	path.moveTo(0.25 * w, 0);
	path.lineTo(0.75 * w, 0);
	path.lineTo(w, 0.5 * h);
	path.lineTo(0.75 * w, h);
	path.lineTo(0.25 * w, h);
	path.lineTo(0, 0.5 * h);
	path.close();
};
