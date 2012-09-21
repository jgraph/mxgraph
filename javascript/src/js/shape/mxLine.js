/**
 * $Id: mxLine.js,v 1.36 2012-03-30 04:44:59 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxLine
 *
 * Extends <mxShape> to implement a horizontal line shape.
 * This shape is registered under <mxConstants.SHAPE_LINE> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxLine
 *
 * Constructs a new line shape.
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * stroke - String that defines the stroke color. Default is 'black'. This is
 * stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxLine(bounds, stroke, strokewidth)
{
	this.bounds = bounds;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxLine.prototype = new mxShape();
mxLine.prototype.constructor = mxLine;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxLine.prototype.vmlNodes = mxLine.prototype.vmlNodes.concat(['label', 'innerNode']);

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxLine.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxLine.prototype.preferModeHtml = false;

/**
 * Function: clone
 *
 * Overrides the clone method to add special fields.
 */
mxLine.prototype.clone = function()
{
	var clone = new mxLine(this.bounds,
		this.stroke, this.strokewidth);
	clone.isDashed = this.isDashed;
	
	return clone;
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxLine.prototype.createVml = function()
{
	var node = document.createElement('v:group');
	node.style.position = 'absolute';
	
	// Represents the text label container
	this.label = document.createElement('v:rect');
	this.label.style.position = 'absolute';
	this.label.stroked = 'false';
	this.label.filled = 'false';
	node.appendChild(this.label);
	
	// Represents the straight line shape
	this.innerNode = document.createElement('v:shape');
	this.configureVmlShape(this.innerNode);
	node.appendChild(this.innerNode);
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Redraws this VML shape by invoking <updateVmlShape> on this.node.
 */
mxLine.prototype.reconfigure = function()
{
	if (mxUtils.isVml(this.node))
	{
		this.configureVmlShape(this.innerNode);
	}
	else
	{
		mxShape.prototype.reconfigure.apply(this, arguments);
	}
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxLine.prototype.redrawVml = function()
{
	this.updateVmlShape(this.node);
	this.updateVmlShape(this.label);

	this.innerNode.coordsize = this.node.coordsize;
	this.innerNode.strokeweight = (this.strokewidth * this.scale) + 'px';
	this.innerNode.style.width = this.node.style.width;
	this.innerNode.style.height = this.node.style.height;

	var w = this.bounds.width;
	var h =this.bounds.height;
	
	if (this.direction == mxConstants.DIRECTION_NORTH ||
		this.direction == mxConstants.DIRECTION_SOUTH)
	{
		this.innerNode.path = 'm ' + Math.round(w / 2) + ' 0' +
			' l ' + Math.round(w / 2) + ' ' + Math.round(h) + ' e';
	}
	else
	{
		this.innerNode.path = 'm 0 ' + Math.round(h / 2) +
			' l ' + Math.round(w) + ' ' + Math.round(h / 2) + ' e';
	}
};
	
/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxLine.prototype.createSvg = function()
{
	var g = this.createSvgGroup('path');

	// Creates an invisible shape around the path for easier
	// selection with the mouse. Note: Firefox does not ignore
	// the value of the stroke attribute for pointer-events: stroke.
	// It does, however, ignore the visibility attribute.
	this.pipe = this.createSvgPipe();
	g.appendChild(this.pipe);
	
	return g;
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxLine.prototype.redrawSvg = function()
{
	var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
	this.innerNode.setAttribute('stroke-width', strokeWidth);
	
	if (this.bounds != null)
	{
		var x = this.bounds.x;
		var y = this.bounds.y;
		var w = this.bounds.width;
		var h = this.bounds.height;
		
		var d = null;
		
		if (this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH)
		{
			d = 'M ' + Math.round(x + w / 2) + ' ' + Math.round(y) + ' L ' + Math.round(x + w / 2) + ' ' + Math.round(y + h);
		}
		else
		{
			d = 'M ' + Math.round(x) + ' ' + Math.round(y + h / 2) + ' L ' + Math.round(x + w) + ' ' + Math.round(y + h / 2);
		}
		
		this.innerNode.setAttribute('d', d);
		this.pipe.setAttribute('d', d);
		this.pipe.setAttribute('stroke-width', this.strokewidth + mxShape.prototype.SVG_STROKE_TOLERANCE);
		
		this.updateSvgTransform(this.innerNode, false);
		this.updateSvgTransform(this.pipe, false);	
		
		if (this.crisp)
		{
			this.innerNode.setAttribute('shape-rendering', 'crispEdges');
		}
		else
		{
			this.innerNode.removeAttribute('shape-rendering');
		}
		
		if (this.isDashed)
		{
			var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
			this.innerNode.setAttribute('stroke-dasharray', phase + ' ' + phase);
		}
	}
};
