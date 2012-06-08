/**
 * $Id: mxRectangleShape.js,v 1.16 2011-06-24 11:27:31 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxRectangleShape
 *
 * Extends <mxShape> to implement a rectangle shape.
 * This shape is registered under <mxConstants.SHAPE_RECTANGLE>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxRectangleShape
 *
 * Constructs a new rectangle shape.
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
function mxRectangleShape(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxRectangleShape.prototype = new mxShape();
mxRectangleShape.prototype.constructor = mxRectangleShape;

/**
 * Function: createHtml
 *
 * Creates and returns the HTML node to represent this shape.
 */
mxRectangleShape.prototype.createHtml = function()
{
	var node = document.createElement('DIV');
	this.configureHtmlShape(node);
	
	return node;
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxRectangleShape.prototype.createVml = function()
{
	var name = (this.isRounded) ? 'v:roundrect' : 'v:rect';
	var node = document.createElement(name);
	this.configureVmlShape(node);
	
	return node;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node to represent this shape.
 */
mxRectangleShape.prototype.createSvg = function()
{
	return this.createSvgGroup('rect');
};
