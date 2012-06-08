/**
 * $Id: mxRhombus.js,v 1.25 2012-04-04 07:34:50 gaudenz Exp $
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
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxRhombus.prototype = new mxShape();
mxRhombus.prototype.constructor = mxRhombus;

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxRhombus.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxRhombus.prototype.preferModeHtml = false;

/**
 * Function: createHtml
 *
 * Creates and returns the HTML node to represent this shape.
 */
mxRhombus.prototype.createHtml = function()
{
	var node = document.createElement('DIV');
	this.configureHtmlShape(node);
	
	return node;
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node(s) to represent this shape.
 */
mxRhombus.prototype.createVml = function()
{
	var node = document.createElement('v:shape');
	this.configureVmlShape(node);
	
	return node;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxRhombus.prototype.createSvg = function()
{
	return this.createSvgGroup('path');
};

// TODO: When used as an indicator, this.node.points is null
// so we use a path object for building general diamonds.
//mxRhombus.prototype.redraw = function() {
//	this.node.setAttribute('strokeweight', (this.strokewidth * this.scale) + 'px');
//	var x = this.bounds.x;
//	var y = this.bounds.y;
//	var w = this.bounds.width;
//	var h = this.bounds.height;
//	this.node.points.value = (x+w/2)+','+y+' '+(x+w)+','+(y+h/2)+
//		' '+(x+w/2)+','+(y+h)+' '+x+','+(y+h/2)+' '+
//		(x+w/2)+','+y;
//}

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxRhombus.prototype.redrawVml = function()
{
	this.updateVmlShape(this.node);
	var x = 0;
	var y = 0;
	var w = Math.round(this.bounds.width);
	var h = Math.round(this.bounds.height);

	this.node.path = 'm ' + Math.round(x + w / 2) + ' ' + y +
		' l ' + (x + w) + ' ' + Math.round(y + h / 2) +
		' l ' + Math.round(x + w / 2) + ' ' + (y + h) +
		' l ' + x + ' ' + Math.round(y + h / 2) + ' x e';
};

/**
 * Function: redrawHtml
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxRhombus.prototype.redrawHtml = function()
{
	this.updateHtmlShape(this.node);
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxRhombus.prototype.redrawSvg = function()
{
	this.updateSvgNode(this.innerNode);
	
	if (this.shadowNode != null)
	{
		this.updateSvgNode(this.shadowNode);
	}
};

/**
 * Function: createSvgSpan
 *
 * Updates the path for the given SVG node.
 */
mxRhombus.prototype.updateSvgNode = function(node)
{
	var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
	node.setAttribute('stroke-width', strokeWidth);
	var x = this.bounds.x;
	var y = this.bounds.y;
	var w = this.bounds.width;
	var h = this.bounds.height;
	var d = 'M ' + Math.round(x + w / 2) + ' ' + Math.round(y) + ' L ' + Math.round(x + w) + ' ' + Math.round(y + h / 2) +
		' L ' + Math.round(x + w / 2) + ' ' + Math.round(y + h) + ' L ' + Math.round(x) + ' ' + Math.round(y + h / 2) +
		' Z ';
	node.setAttribute('d', d);
	this.updateSvgTransform(node, node == this.shadowNode);

	if (this.isDashed)
	{
		var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
		node.setAttribute('stroke-dasharray', phase + ' ' + phase);
	}
};
