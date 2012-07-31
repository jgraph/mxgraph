/**
 * $Id: mxCylinder.js,v 1.38 2012-07-31 11:46:53 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxCylinder
 *
 * Extends <mxShape> to implement an cylinder shape. If a
 * custom shape with one filled area and an overlay path is
 * needed, then this shape's <redrawPath> should be overridden.
 * This shape is registered under <mxConstants.SHAPE_CYLINDER>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxCylinder
 *
 * Constructs a new cylinder shape.
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
function mxCylinder(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxCylinder.prototype = new mxShape();
mxCylinder.prototype.constructor = mxCylinder;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxCylinder.prototype.vmlNodes = mxCylinder.prototype.vmlNodes.concat(['background', 'foreground']);

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxCylinder.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxCylinder.prototype.preferModeHtml = false;

/**
 * Variable: addPipe
 *
 * Specifies if a SVG path should be created around the background for better
 * hit detection. Default is false.
 */
mxCylinder.prototype.addPipe = false;

/**
 * Variable: strokedBackground
 *
 * Specifies if the background should be stroked. Default is true.
 */
mxCylinder.prototype.strokedBackground = true;

/**
 * Variable: maxHeight
 *
 * Defines the maximum height of the top and bottom part
 * of the cylinder shape.
 */
mxCylinder.prototype.maxHeight = 40;

/**
 * Variable: vmlScale
 *
 * Renders VML with a scale of 2.
 */
mxCylinder.prototype.vmlScale = 2;

/**
 * Function: create
 *
 * Overrides the method to make sure the <stroke> is never
 * null. If it is null is will be assigned the <fill> color.
 */
mxCylinder.prototype.create = function(container)
{
	if (this.stroke == null)
	{
		this.stroke = this.fill;
	}
	
	// Calls superclass implementation of create
	return mxShape.prototype.create.apply(this, arguments);
};

/**
 * Function: reconfigure
 *
 * Overrides the method to make sure the <stroke> is applied to the foreground.
 */
mxCylinder.prototype.reconfigure = function()
{
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		this.configureSvgShape(this.foreground);
		this.foreground.setAttribute('fill', 'none');
	}
	else if (mxUtils.isVml(this.node))
	{
		this.configureVmlShape(this.background);
		this.configureVmlShape(this.foreground);
	}
	
	mxShape.prototype.reconfigure.apply(this);
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxCylinder.prototype.createVml = function()
{
	var node = document.createElement('v:group');

	// Draws the background
	this.background = document.createElement('v:shape');
	this.label = this.background;
	this.configureVmlShape(this.background);
	node.appendChild(this.background);
	
	// Ignores values that only apply to the background
	this.fill = null;
	this.isShadow = false;
	this.configureVmlShape(node);
	
	// Draws the foreground
	this.foreground = document.createElement('v:shape');
	this.configureVmlShape(this.foreground);
	
	// To match SVG defaults jointsyle miter, miterlimit 4
	this.fgStrokeNode = document.createElement('v:stroke');
	this.fgStrokeNode.joinstyle = 'miter';
	this.fgStrokeNode.miterlimit = 4;
	this.foreground.appendChild(this.fgStrokeNode);
	
	node.appendChild(this.foreground);
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxCylinder.prototype.redrawVml = function()
{
	this.updateVmlShape(this.node);
	this.updateVmlShape(this.background);
	this.updateVmlShape(this.foreground);
	this.background.path = this.createPath(false);
	this.foreground.path = this.createPath(true);
	
	this.fgStrokeNode.dashstyle = this.strokeNode.dashstyle;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxCylinder.prototype.createSvg = function()
{
	var g = this.createSvgGroup('path');
	this.foreground = document.createElementNS(mxConstants.NS_SVG, 'path');
	
	if (this.stroke != null && this.stroke != mxConstants.NONE)
	{
		this.foreground.setAttribute('stroke', this.stroke);
	}
	else
	{
		this.foreground.setAttribute('stroke', 'none');
	}
	
	this.foreground.setAttribute('fill', 'none');
	g.appendChild(this.foreground);
	
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
mxCylinder.prototype.redrawSvg = function()
{
	var strokeWidth = Math.round(Math.max(1, this.strokewidth * this.scale));
	this.innerNode.setAttribute('stroke-width', strokeWidth);
	
	if (this.crisp && (this.rotation == null || this.rotation == 0))
	{
		this.innerNode.setAttribute('shape-rendering', 'crispEdges');
		this.foreground.setAttribute('shape-rendering', 'crispEdges');
	}
	else
	{
		this.innerNode.removeAttribute('shape-rendering');
		this.foreground.removeAttribute('shape-rendering');
	}

	// Paints background
	var d = this.createPath(false);
	
	if (d.length > 0)
	{
		this.innerNode.setAttribute('d', d);
		
		// Updates event handling element
		if (this.pipe != null)
		{
			this.pipe.setAttribute('d', d);
			this.pipe.setAttribute('stroke-width', strokeWidth + mxShape.prototype.SVG_STROKE_TOLERANCE);
			this.pipe.setAttribute('transform', (this.innerNode.getAttribute('transform') || ''));
		}
	}
	else
	{
		this.innerNode.removeAttribute('d');
		
		// Updates event handling element
		if (this.pipe != null)
		{
			this.pipe.removeAttribute('d');
		}
	}
	
	// Stroked background
	if (!this.strokedBackground)
	{
		this.innerNode.setAttribute('stroke', 'none');
	}

	// Paints shadow
	if (this.shadowNode != null)
	{
		this.shadowNode.setAttribute('stroke-width', strokeWidth);
		this.shadowNode.setAttribute('d', d);
		this.shadowNode.setAttribute('transform',  this.getSvgShadowTransform());
	}

	// Paints foreground
	d = this.createPath(true);
	
	if (d.length > 0)
	{
		this.foreground.setAttribute('stroke-width', strokeWidth);
		this.foreground.setAttribute('d', d);
	}
	else
	{
		this.foreground.removeAttribute('d');
	}
	
	if (this.isDashed)
	{
		var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
		this.innerNode.setAttribute('stroke-dasharray', phase + ' ' + phase);
		this.foreground.setAttribute('stroke-dasharray', phase + ' ' + phase);
	}
};

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This method uses the <mxPath>
 * abstraction to paint the shape for VML and SVG.
 */
mxCylinder.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
	var dy = Math.min(this.maxHeight, Math.round(h / 5));
	
	if (isForeground)
	{
		path.moveTo(0, dy);
		path.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
	}
	else
	{
		path.moveTo(0, dy);
		path.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
		path.lineTo(w, h - dy);
		path.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
		path.close();
	}
};
