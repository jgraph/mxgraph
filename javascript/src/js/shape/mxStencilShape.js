/**
 * $Id: mxStencilShape.js,v 1.7 2011-11-04 13:54:50 gaudenz Exp $
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
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxStencilShape.prototype.createVml = function()
{
	// TODO: VML group is required for rotation to work in mxStencil.
	// DIV is used as a workaround for IE8 standards mode because VML
	// groups don't seem to render with the outerHTML solution used in
	// mxShape.init (same if delayed after renderDom in redrawShape).
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
		this.node.innerHTML = '';
		this.node.style.left = Math.round(this.bounds.x) + 'px';
		this.node.style.top = Math.round(this.bounds.y) + 'px';
		var w = Math.round(this.bounds.width);
		var h = Math.round(this.bounds.height);
		this.node.style.width = w + 'px';
		this.node.style.height = h + 'px';
		
		if (mxUtils.isVml(this.node))
		{
			this.node.coordsize = w + ',' + h;
		}
	}
	else
	{
		while (this.node.firstChild != null)
		{
			this.node.removeChild(this.node.firstChild);
		}
	}
	
	this.stencil.renderDom(this, this.bounds, this.node);
};
