/**
 * $Id: mxActor.js,v 1.35 2012-07-31 11:46:53 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxActor
 *
 * Extends <mxShape> to implement an actor shape. If a custom shape with one
 * filled area is needed, then this shape's <redrawPath> should be overridden.
 * 
 * Example:
 * 
 * (code)
 * function SampleShape() { }
 * 
 * SampleShape.prototype = new mxActor();
 * SampleShape.prototype.constructor = vsAseShape;
 * 
 * mxCellRenderer.prototype.defaultShapes['sample'] = SampleShape;
 * SampleShape.prototype.redrawPath = function(path, x, y, w, h)
 * {
 *   path.moveTo(0, 0);
 *   path.lineTo(w, h);
 *   // ...
 *   path.close();
 * }
 * (end)
 * 
 * This shape is registered under <mxConstants.SHAPE_ACTOR> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxActor
 *
 * Constructs a new actor shape.
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
function mxActor(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxActor.prototype = new mxShape();
mxActor.prototype.constructor = mxActor;

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxActor.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxActor.prototype.preferModeHtml = false;

/**
 * Variable: vmlScale
 *
 * Renders VML with a scale of 2.
 */
mxActor.prototype.vmlScale = 2;

/**
 * Function: createVml
 *
 * Creates and returns the VML node(s) to represent this shape.
 */
mxActor.prototype.createVml = function()
{
	var node = document.createElement('v:shape');
	node.style.position = 'absolute';
	this.configureVmlShape(node);
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxActor.prototype.redrawVml = function()
{
	this.updateVmlShape(this.node);
	this.node.path = this.createPath();
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxActor.prototype.createSvg = function()
{
	return this.createSvgGroup('path');
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxActor.prototype.redrawSvg = function()
{
	var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
	this.innerNode.setAttribute('stroke-width', strokeWidth);
	this.innerNode.setAttribute('stroke-linejoin', 'round');

	if (this.crisp && (this.rotation == null || this.rotation == 0))
	{
		this.innerNode.setAttribute('shape-rendering', 'crispEdges');
	}
	else
	{
		this.innerNode.removeAttribute('shape-rendering');
	}
	
	var d = this.createPath();
	
	if (d.length > 0)
	{
		this.innerNode.setAttribute('d', d);

		if (this.shadowNode != null)
		{
			this.shadowNode.setAttribute('transform', this.getSvgShadowTransform() + 
				(this.innerNode.getAttribute('transform') || ''));
			this.shadowNode.setAttribute('stroke-width', strokeWidth);
			this.shadowNode.setAttribute('d', d);
		}
	}
	else
	{
		this.innerNode.removeAttribute('d');
		
		if (this.shadowNode != null)
		{
			this.shadowNode.removeAttribute('d');
		}
	}
	
	if (this.isDashed)
	{
		var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
		this.innerNode.setAttribute('stroke-dasharray', phase + ' ' + phase);
	}
};

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxActor.prototype.redrawPath = function(path, x, y, w, h)
{
	var width = w/3;
	path.moveTo(0, h);
	path.curveTo(0, 3 * h / 5, 0, 2 * h / 5, w / 2, 2 * h / 5);
	path.curveTo(w / 2 - width, 2 * h / 5, w / 2 - width, 0, w / 2, 0);
	path.curveTo(w / 2 + width, 0, w / 2 + width, 2 * h / 5, w / 2, 2 * h / 5);
	path.curveTo(w, 2 * h / 5, w, 3 * h / 5, w, h);
	path.close();
};
