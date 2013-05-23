/**
 * $Id: mxRhombus.js,v 1.2 2012/11/22 10:40:09 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxRhombus
 *
 * Extends <mxShape> to implement a rhombus (aka diamond) shape.
 * This shape is registered under <mxConstants.SHAPE_RHOMBUS>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxRhombus
 *
 * Constructs a new rhombus shape.
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
function mxRhombus(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxRhombus, mxShape);

/**
 * Function: paintVertexShape
 * 
 * Generic painting implementation.
 */
mxRhombus.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var hw = w / 2;
	var hh = h / 2;

	c.begin();
	c.moveTo(x + hw, y);
	c.lineTo(x + w, y + hh);
	c.lineTo(x + hw, y + h);
	c.lineTo(x, y + hh);
	c.close();
	
	c.fillAndStroke();
};
