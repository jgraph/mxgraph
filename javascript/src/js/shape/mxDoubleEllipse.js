/**
 * $Id: mxDoubleEllipse.js,v 1.19 2012-05-21 18:27:17 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxDoubleEllipse
 *
 * Extends <mxShape> to implement a double ellipse shape.
 * This shape is registered under <mxConstants.SHAPE_DOUBLE_ELLIPSE>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxDoubleEllipse
 *
 * Constructs a new ellipse shape.
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
function mxDoubleEllipse(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxDoubleEllipse.prototype = new mxShape();
mxDoubleEllipse.prototype.constructor = mxDoubleEllipse;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxDoubleEllipse.prototype.vmlNodes = mxDoubleEllipse.prototype.vmlNodes.concat(['background', 'foreground']);

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxDoubleEllipse.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxDoubleEllipse.prototype.preferModeHtml = false;

/**
 * Variable: vmlScale
 *
 * Renders VML with a scale of 2.
 */
mxDoubleEllipse.prototype.vmlScale = 2;

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxDoubleEllipse.prototype.createVml = function()
{
	var node = document.createElement('v:group');

	// Draws the background
	this.background = document.createElement('v:arc');
	this.background.startangle = '0';
	this.background.endangle = '360';
	this.configureVmlShape(this.background);

	node.appendChild(this.background);
	
	// Ignores values that only apply to the background
	this.label = this.background;
	this.isShadow = false;
	this.fill = null;

	// Draws the foreground
	this.foreground = document.createElement('v:oval');
	this.configureVmlShape(this.foreground);
	
	node.appendChild(this.foreground);
	
	this.stroke = null;
	this.configureVmlShape(node);
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxDoubleEllipse.prototype.redrawVml = function()
{
	this.updateVmlShape(this.node);
	this.updateVmlShape(this.background);
	this.updateVmlShape(this.foreground);

	var inset = Math.round((this.strokewidth + 3) * this.scale) * this.vmlScale;
	var w = Math.round(this.bounds.width * this.vmlScale);
	var h = Math.round(this.bounds.height * this.vmlScale);
	
	this.foreground.style.top = inset + 'px'; // relative
	this.foreground.style.left = inset + 'px'; // relative
	this.foreground.style.width = Math.max(0, w - 2 * inset) + 'px';
	this.foreground.style.height = Math.max(0, h - 2 * inset) + 'px';
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxDoubleEllipse.prototype.createSvg = function()
{
	var g = this.createSvgGroup('ellipse');
	this.foreground = document.createElementNS(mxConstants.NS_SVG, 'ellipse');
	
	if (this.stroke != null)
	{
		this.foreground.setAttribute('stroke', this.stroke);
	}
	else
	{
		this.foreground.setAttribute('stroke', 'none');
	}
	
	this.foreground.setAttribute('fill', 'none');
	g.appendChild(this.foreground);
	
	return g;
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxDoubleEllipse.prototype.redrawSvg = function()
{
	if (this.crisp)
	{
		this.innerNode.setAttribute('shape-rendering', 'crispEdges');
		this.foreground.setAttribute('shape-rendering', 'crispEdges');
	}
	else
	{
		this.innerNode.removeAttribute('shape-rendering');
		this.foreground.removeAttribute('shape-rendering');
	}
	
	this.updateSvgNode(this.innerNode);
	this.updateSvgNode(this.shadowNode);
	this.updateSvgNode(this.foreground, (this.strokewidth + 3) * this.scale);
	
	if (this.isDashed)
	{
		var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
		this.innerNode.setAttribute('stroke-dasharray', phase + ' ' + phase);
	}
};

/**
 * Function: updateSvgNode
 *
 * Updates the given node to reflect the new <bounds> and <scale>.
 */
mxDoubleEllipse.prototype.updateSvgNode = function(node, inset)
{
	inset = (inset != null) ? inset : 0;
	
	if (node != null)
	{
		var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
		node.setAttribute('stroke-width', strokeWidth);
		
		node.setAttribute('cx', this.bounds.x + this.bounds.width / 2);
		node.setAttribute('cy', this.bounds.y + this.bounds.height / 2);
		node.setAttribute('rx', Math.max(0, this.bounds.width / 2 - inset));
		node.setAttribute('ry', Math.max(0, this.bounds.height / 2 - inset));

		// Updates the transform of the shadow
		if (this.shadowNode != null)
		{
			this.shadowNode.setAttribute('transform',  this.getSvgShadowTransform());
		}
	}
};
