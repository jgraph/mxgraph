/**
 * $Id: mxStencilShape.js,v 1.10 2012-07-16 10:22:44 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxStencilShape
 *
 * Implements a shape based on a <mxStencil>.
 *  
 * Constructor: mxStencilShape
 * 
 * Constructs a new generic shape.
 */
function mxStencilShape(stencil)
{
	this.stencil = stencil;
};

/**
 * Extends mxShape.
 */
mxStencilShape.prototype = new mxShape();
mxStencilShape.prototype.constructor = mxStencilShape;

/**
 * Variable: mixedModeHtml
 *
 * Always prefers VML in mixed mode for stencil shapes. Default is false.
 */
mxStencilShape.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Always prefers VML in prefer HTML mode for stencil shapes. Default is false.
 */
mxStencilShape.prototype.preferModeHtml = false;

/**
 * Variable: stencil
 *
 * Holds the <mxStencil> that defines the shape.
 */
mxStencilShape.prototype.stencil = null;

/**
 * Variable: state
 *
 * Holds the <mxCellState> associated with this shape.
 */
mxStencilShape.prototype.state = null;

/**
 * Variable: vmlScale
 *
 * Renders VML with a scale of 4.
 */
mxStencilShape.prototype.vmlScale = 4;

/**
 * Function: apply
 * 
 * Extends <mxShape> apply to keep a reference to the <mxCellState>.
 *
 * Parameters:
 *
 * state - <mxCellState> of the corresponding cell.
 */
mxStencilShape.prototype.apply = function(state)
{
	this.state = state;
	mxShape.prototype.apply.apply(this, arguments);
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxStencilShape.prototype.createSvg = function()
{
	var node = document.createElementNS(mxConstants.NS_SVG, 'g');
	this.configureSvgShape(node);
	
	return node;
};

/**
 * Function: configureHtmlShape
 *
 * Overrides method to set the overflow style to visible.
 */
mxStencilShape.prototype.configureHtmlShape = function(node)
{
	mxShape.prototype.configureHtmlShape.apply(this, arguments);
	
	if (!mxUtils.isVml(node))
	{
		node.style.overflow = 'visible';
	}
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxStencilShape.prototype.createVml = function()
{
	var name = (document.documentMode == 8) ? 'div' : 'v:group';
	var node = document.createElement(name);
	this.configureTransparentBackground(node);
	node.style.position = 'absolute';
	
	return node;
};

/**
 * Function: configureVmlShape
 *
 * Configures the specified VML node by applying the current color,
 * bounds, shadow, opacity etc.
 */
mxStencilShape.prototype.configureVmlShape = function(node)
{
	// do nothing
};

/**
 * Function: redraw
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxStencilShape.prototype.redraw = function()
{
	this.updateBoundingBox();
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		this.redrawShape();
	}
	else
	{
		this.node.style.visibility = 'hidden';
		this.redrawShape();
		this.node.style.visibility = 'visible';
	}
};

/**
 * Function: redrawShape
 *
 * Updates the SVG or VML shape.
 */
mxStencilShape.prototype.redrawShape = function()
{
	// LATER: Update existing DOM nodes to improve repaint performance
	if (this.dialect != mxConstants.DIALECT_SVG)
	{
		this.node.style.left = Math.round(this.bounds.x) + 'px';
		this.node.style.top = Math.round(this.bounds.y) + 'px';
		var w = Math.round(this.bounds.width);
		var h = Math.round(this.bounds.height);
		this.node.style.width = w + 'px';
		this.node.style.height = h + 'px';
		
		var node = this.node;
		
		// Workaround for VML rendering bug in IE8 standards mode where all VML must be
		// parsed via assigning the innerHTML of the parent HTML node to keep all event
		// handlers referencing node and support rotation via v:group parent element. 
		if (this.node.nodeName == 'DIV')
		{
			node = document.createElement('v:group');
			node.style.position = 'absolute';
			node.style.left = '0px';
			node.style.top = '0px';
			node.style.width = w + 'px';
			node.style.height = h + 'px';
		}
		else
		{
			node.innerHTML = '';
		}

		if (mxUtils.isVml(node))
		{
			var s = (document.documentMode != 8) ? this.vmlScale : 1;
			node.coordsize = (w * s) + ',' + (h * s);
		}
		
		this.stencil.renderDom(this, this.bounds, node);
		
		if(this.node != node)
		{
			// Forces parsing in IE8 standards mode
			this.node.innerHTML = node.outerHTML;
		}
	}
	else
	{
		while (this.node.firstChild != null)
		{
			this.node.removeChild(this.node.firstChild);
		}
		
		this.stencil.renderDom(this, this.bounds, this.node);
	}
};
