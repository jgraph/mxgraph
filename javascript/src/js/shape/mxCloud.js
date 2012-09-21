/**
 * $Id: mxCloud.js,v 1.12 2011-06-24 11:27:30 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxCloud
 *
 * Extends <mxActor> to implement a cloud shape.
 * 
 * This shape is registered under <mxConstants.SHAPE_CLOUD> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxCloud
 *
 * Constructs a new cloud shape.
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
function mxCloud(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxActor.
 */
mxCloud.prototype = new mxActor();
mxCloud.prototype.constructor = mxActor;

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxCloud.prototype.redrawPath = function(path, x, y, w, h)
{
	path.moveTo(0.25 * w, 0.25 * h);
	path.curveTo(0.05 * w, 0.25 * h, 0, 0.5 * h, 0.16 * w, 0.55 * h);
	path.curveTo(0, 0.66 * h, 0.18 * w, 0.9 * h, 0.31 * w, 0.8 * h);
	path.curveTo(0.4 * w, h, 0.7 * w, h, 0.8 * w, 0.8 * h);
	path.curveTo(w, 0.8 * h, w, 0.6 * h, 0.875 * w, 0.5 * h);
	path.curveTo(w, 0.3 * h, 0.8 * w, 0.1 * h, 0.625 * w, 0.2 * h);
	path.curveTo(0.5 * w, 0.05 * h, 0.3 * w, 0.05 * h, 0.25 * w, 0.25 * h);
	path.close();
};
