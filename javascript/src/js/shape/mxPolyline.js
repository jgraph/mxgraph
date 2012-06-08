/**
 * $Id: mxPolyline.js,v 1.31 2012-05-24 12:00:45 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPolyline
 *
 * Extends <mxShape> to implement a polyline (a line with multiple points).
 * This shape is registered under <mxConstants.SHAPE_POLYLINE> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxPolyline
 *
 * Constructs a new polyline shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxPolyline(points, stroke, strokewidth)
{
	this.points = points;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxPolyline.prototype = new mxShape();
mxPolyline.prototype.constructor = mxPolyline;

/**
 * Variable: addPipe
 *
 * Specifies if a SVG path should be created around any path to increase the
 * tolerance for mouse events. Default is false since this shape is filled.
 */
mxPolyline.prototype.addPipe = true;

/**
 * Function: create
 *
 * Override to create HTML regardless of gradient and
 * rounded property.
 */
mxPolyline.prototype.create = function()
{
	var node = null;
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		node = this.createSvg();
	}
	else if (this.dialect == mxConstants.DIALECT_STRICTHTML ||
			(this.dialect == mxConstants.DIALECT_PREFERHTML &&
			this.points != null && this.points.length > 0))
	{
		node = document.createElement('DIV');
		this.configureHtmlShape(node);
		node.style.borderStyle = '';
		node.style.background = '';
	}
	else
	{
		node = document.createElement('v:shape');
		this.configureVmlShape(node);
		var strokeNode = document.createElement('v:stroke');
	
		if (this.opacity != null)
		{
			strokeNode.opacity = this.opacity + '%';
		}
		
		node.appendChild(strokeNode);
	}
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Overrides the method to update the bounds if they have not been
 * assigned.
 */
mxPolyline.prototype.redrawVml = function()
{
	// Updates the bounds based on the points
	if (this.points != null && this.points.length > 0 && this.points[0] != null)
	{
		this.bounds = new mxRectangle(this.points[0].x,this.points[0].y, 0, 0);
		
		for (var i = 1; i < this.points.length; i++)
		{
			this.bounds.add(new mxRectangle(this.points[i].x,this.points[i].y, 0, 0));
		}
	}

	mxShape.prototype.redrawVml.apply(this, arguments);
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxPolyline.prototype.createSvg = function()
{
	var g = this.createSvgGroup('path');
	
	// Creates an invisible shape around the path for easier
	// selection with the mouse. Note: Firefox does not ignore
	// the value of the stroke attribute for pointer-events: stroke,
	// it does, however, ignore the visibility attribute.
	if (this.addPipe)
	{
		this.pipe = this.createSvgPipe();
		g.appendChild(this.pipe);
	}
	
	return g;
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxPolyline.prototype.redrawSvg = function()
{
	this.updateSvgShape(this.innerNode);
	var d = this.innerNode.getAttribute('d');
	
	if (d != null && this.pipe != null)
	{
		this.pipe.setAttribute('d', d);
		var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
		this.pipe.setAttribute('stroke-width', strokeWidth + mxShape.prototype.SVG_STROKE_TOLERANCE);
	}
};
