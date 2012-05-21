/**
 * $Id: mxSwimlane.js,v 1.43 2011-11-04 13:54:50 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxSwimlane
 *
 * Extends <mxShape> to implement a swimlane shape.
 * This shape is registered under <mxConstants.SHAPE_SWIMLANE>
 * in <mxCellRenderer>.
 * 
 * Constructor: mxSwimlane
 *
 * Constructs a new swimlane shape.
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
function mxSwimlane(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxSwimlane.prototype = new mxShape();
mxSwimlane.prototype.constructor = mxSwimlane;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxSwimlane.prototype.vmlNodes = mxSwimlane.prototype.vmlNodes.concat(['label', 'content', 'imageNode', 'separator']);

/**
 * Variable: imageSize
 *
 * Default imagewidth and imageheight if an image but no imagewidth
 * and imageheight are defined in the style. Value is 16.
 */
mxSwimlane.prototype.imageSize = 16;

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode. This is for better
 * handling of event-transparency of the content area.
 */
mxSwimlane.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode. This is for better
 * handling of event-transparency of the content area.
 */
mxRhombus.prototype.preferModeHtml = false;

/**
 * Function: createHtml
 *
 * Creates and returns the HTML node to represent this shape.
 */
mxSwimlane.prototype.createHtml = function()
{
	var node = document.createElement('DIV');
	this.configureHtmlShape(node);
	node.style.background = '';
	node.style.backgroundColor = '';
	node.style.borderStyle = 'none';

	// Adds a node that will contain the text label
	this.label = document.createElement('DIV');
	this.configureHtmlShape(this.label);
	node.appendChild(this.label);

	// Adds a node for the content area of the swimlane
	this.content = document.createElement('DIV');
	this.configureHtmlShape(this.content);
	this.content.style.backgroundColor = '';
	
	// Sets border styles depending on orientation
	if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true))
	{
		this.content.style.borderTopStyle = 'none';			
	}
	else
	{
		this.content.style.borderLeftStyle = 'none';
	}
	
	this.content.style.cursor = 'default';
	node.appendChild(this.content);
	
	// Adds a node for the separator
	var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
	
	if (color != null)
	{
		this.separator = document.createElement('DIV');
		this.separator.style.borderColor = color;
		this.separator.style.borderLeftStyle = 'dashed';
		node.appendChild(this.separator);
	}
	
	// Adds a node for the image
	if (this.image != null)
	{
		this.imageNode = mxUtils.createImage(this.image);
		this.configureHtmlShape(this.imageNode);
		this.imageNode.style.borderStyle = 'none';
		node.appendChild(this.imageNode);
	}
	
	return node;
};

/**
 * Function: reconfigure
 *
 * Overrides to avoid filled content area in HTML and updates the shadow
 * in SVG.
 */
mxSwimlane.prototype.reconfigure = function(node)
{
	mxShape.prototype.reconfigure.apply(this, arguments);
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		if (this.shadowNode != null)
		{
			this.updateSvgShape(this.shadowNode);
			
			if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true))
			{
				this.shadowNode.setAttribute('height', this.startSize*this.scale);
			}
			else
			{
				this.shadowNode.setAttribute('width', this.startSize*this.scale);				
			}
		}
	}
	else if (!mxUtils.isVml(this.node))
	{
		this.node.style.background = '';
		this.node.style.backgroundColor = '';
	}
};

/**
 * Function: redrawHtml
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxSwimlane.prototype.redrawHtml = function()
{
	this.updateHtmlShape(this.node);
	this.node.style.background = '';
	this.node.style.backgroundColor = '';
	this.startSize = parseInt(mxUtils.getValue(this.style,
		mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
	this.updateHtmlShape(this.label);
	this.label.style.top = '0px';
	this.label.style.left = '0px';
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true))
	{
		this.startSize = Math.min(this.startSize, this.bounds.height);
		this.label.style.height = (this.startSize * this.scale)+'px'; // relative
		this.updateHtmlShape(this.content);
		this.content.style.background = '';
		this.content.style.backgroundColor = '';
		
		var h = this.startSize*this.scale;
		
		this.content.style.top = h+'px';
		this.content.style.left = '0px';
		this.content.style.height = Math.max(1, this.bounds.height - h)+'px';
		
		if (this.separator != null)
		{
			this.separator.style.left = Math.round(this.bounds.width)+'px';
			this.separator.style.top = Math.round(this.startSize*this.scale)+'px';
			this.separator.style.width = '1px';
			this.separator.style.height = Math.round(this.bounds.height)+'px';
			this.separator.style.borderWidth = Math.round(this.scale)+'px';
		}
		
		if (this.imageNode != null)
		{
			this.imageNode.style.left = (this.bounds.width-this.imageSize-4)+'px';
			this.imageNode.style.top = '0px';
			// TODO: Use imageWidth and height from style if available
			this.imageNode.style.width = Math.round(this.imageSize*this.scale)+'px';
			this.imageNode.style.height = Math.round(this.imageSize*this.scale)+'px';
		}
	}
	else
	{
		this.startSize = Math.min(this.startSize, this.bounds.width);
		this.label.style.width = (this.startSize * this.scale)+'px'; // relative
		this.updateHtmlShape(this.content);
		this.content.style.background = '';
		this.content.style.backgroundColor = '';
		
		var w = this.startSize*this.scale;
		
		this.content.style.top = '0px';
		this.content.style.left = w+'px';
		this.content.style.width = Math.max(0, this.bounds.width - w)+'px';
		
		if (this.separator != null)
		{
			this.separator.style.left = Math.round(this.startSize*this.scale)+'px';
			this.separator.style.top = Math.round(this.bounds.height)+'px';
			this.separator.style.width = Math.round(this.bounds.width)+'px';
			this.separator.style.height = '1px';
		}
		
		if (this.imageNode != null)
		{
			this.imageNode.style.left = (this.bounds.width-this.imageSize-4)+'px';
			this.imageNode.style.top = '0px';
			this.imageNode.style.width = this.imageSize*this.scale+'px';
			this.imageNode.style.height = this.imageSize*this.scale+'px';
		}
	}
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node(s) to represent this shape.
 */
mxSwimlane.prototype.createVml = function()
{
	var node = document.createElement('v:group');
	var name = (this.isRounded) ? 'v:roundrect' : 'v:rect';
	this.label = document.createElement(name);
	
	// First configure the label with all settings
	this.configureVmlShape(this.label);
	
	if (this.isRounded)
	{
		this.label.setAttribute('arcsize', '20%');
	}

	// Disables stuff and configures the rest
	this.isShadow = false;
	this.configureVmlShape(node);
	node.coordorigin = '0,0';
	node.appendChild(this.label);
	
	this.content = document.createElement(name);

	var tmp = this.fill;
	this.fill = null;
	
	this.configureVmlShape(this.content);
	node.style.background = '';
	
	if (this.isRounded)
	{
		this.content.setAttribute('arcsize', '4%');
	}
	
	this.fill = tmp;
	this.content.style.borderBottom = '0px';
	
	node.appendChild(this.content);
	
	var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
	
	if (color != null)
	{
		this.separator = document.createElement('v:shape');
		this.separator.style.position = 'absolute';
		this.separator.strokecolor = color;

		var strokeNode = document.createElement('v:stroke');
		strokeNode.dashstyle = '2 2';
		this.separator.appendChild(strokeNode);
		
		node.appendChild(this.separator);
	}
	
	if (this.image != null)
	{
		this.imageNode = document.createElement('v:image');
		this.imageNode.src = this.image;
		this.configureVmlShape(this.imageNode);
		this.imageNode.stroked = 'false';
		
		node.appendChild(this.imageNode);
	}
	
	return node;
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxSwimlane.prototype.redrawVml = function()
{
	var x = Math.round(this.bounds.x);
	var y = Math.round(this.bounds.y);
	var w = Math.round(this.bounds.width);
	var h = Math.round(this.bounds.height);

	this.updateVmlShape(this.node);
	this.node.coordsize = w + ',' + h;

	this.updateVmlShape(this.label);
	this.label.style.top = '0px';
	this.label.style.left = '0px';
	this.label.style.rotation = null;

	this.startSize = parseInt(mxUtils.getValue(this.style,
			mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
	var start = Math.round(this.startSize * this.scale);

	if (this.separator != null)
	{
		this.separator.coordsize = w + ',' + h;
		this.separator.style.left = x + 'px';
		this.separator.style.top = y + 'px';
		this.separator.style.width = w + 'px';
		this.separator.style.height = h + 'px';
	}
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true))
	{
		start = Math.min(start, this.bounds.height);
		this.label.style.height = start + 'px'; // relative
		this.updateVmlShape(this.content);
		this.content.style.background = '';
		this.content.style.top = start + 'px';
		this.content.style.left = '0px';
		this.content.style.height = Math.max(0, h - start)+'px';
		
		if (this.separator != null)
		{
			var d = 'm ' + (w - x) + ' ' + (start - y) +
				' l ' + (w - x) + ' ' + (h - y) + ' e';
			this.separator.path = d;
		}
		
		if (this.imageNode != null)
		{
			var img = Math.round(this.imageSize*this.scale);
			
			this.imageNode.style.left = (w-img-4)+'px';
			this.imageNode.style.top = '0px';
			this.imageNode.style.width = img + 'px';
			this.imageNode.style.height = img + 'px';
		}
	}
	else
	{
		start = Math.min(start, this.bounds.width);
		this.label.style.width = start + 'px'; // relative
		this.updateVmlShape(this.content);
		this.content.style.background = '';
		this.content.style.top = '0px';
		this.content.style.left = start + 'px';
		this.content.style.width = Math.max(0, w - start) + 'px';
		
		if (this.separator != null)
		{
			var d = 'm ' + (start - x) + ' ' + (h - y) +
				' l ' + (w - x) + ' ' + (h - y) + ' e';
			this.separator.path = d;
		}
		
		if (this.imageNode != null)
		{
			var img = Math.round(this.imageSize * this.scale);
			
			this.imageNode.style.left = (w - img - 4)+'px';
			this.imageNode.style.top = '0px';
			this.imageNode.style.width = img + 'px';
			this.imageNode.style.height = img + 'px';		
		}
	}

	this.content.style.rotation = null;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxSwimlane.prototype.createSvg = function()
{
	var node = this.createSvgGroup('rect');

	if (this.isRounded)
	{
		this.innerNode.setAttribute('rx', 10);
		this.innerNode.setAttribute('ry', 10);
	}

	this.content = document.createElementNS(mxConstants.NS_SVG, 'path');
	this.configureSvgShape(this.content);
	this.content.setAttribute('fill', 'none');

	if (this.isRounded)
	{
		this.content.setAttribute('rx', 10);
		this.content.setAttribute('ry', 10);
	}
	
	node.appendChild(this.content);
	var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
	
	if (color != null)
	{
		this.separator = document.createElementNS(mxConstants.NS_SVG, 'line');
		
		this.separator.setAttribute('stroke', color);
		this.separator.setAttribute('fill', 'none');
		this.separator.setAttribute('stroke-dasharray', '2, 2');
		
		node.appendChild(this.separator);
	}
	
	if (this.image != null)
	{
		this.imageNode = document.createElementNS(mxConstants.NS_SVG, 'image');
		
		this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'href', this.image);
		this.configureSvgShape(this.imageNode);
		
		node.appendChild(this.imageNode);
	}
	
	return node;
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxSwimlane.prototype.redrawSvg = function()
{
	var tmp = this.isRounded;
	this.isRounded = false;
	
	this.updateSvgShape(this.innerNode);
	this.updateSvgShape(this.content);
	var horizontal = mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true);
	this.startSize = parseInt(mxUtils.getValue(this.style,
			mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
	var ss = this.startSize * this.scale;
	
	// Updates the size of the shadow node
	if (this.shadowNode != null)
	{
		this.updateSvgShape(this.shadowNode);
		
		if (horizontal)
		{
			this.shadowNode.setAttribute('height', ss);
		}
		else
		{
			this.shadowNode.setAttribute('width', ss);				
		}
	}
	
	this.isRounded = tmp;

	this.content.removeAttribute('x');
	this.content.removeAttribute('y');
	this.content.removeAttribute('width');
	this.content.removeAttribute('height');
	
	var crisp = (this.crisp && mxClient.IS_IE) ? 0.5 : 0;
	var x = Math.round(this.bounds.x) + crisp;
	var y = Math.round(this.bounds.y) + crisp;
	var w = Math.round(this.bounds.width);
	var h = Math.round(this.bounds.height);
	
	if (horizontal)
	{
		ss = Math.min(ss, h);
		this.innerNode.setAttribute('height', ss);
		var points = 'M ' + x + ' ' + (y + ss) +
			' l 0 ' + (h - ss) + ' l ' + w + ' 0' + 
			' l 0 ' + (ss - h);
		this.content.setAttribute('d', points);
	
		if (this.separator != null)
		{
			this.separator.setAttribute('x1', x + w);
			this.separator.setAttribute('y1', y + ss);
			this.separator.setAttribute('x2', x + w);
			this.separator.setAttribute('y2', y + h);
		}
		
		if (this.imageNode != null)
		{
			this.imageNode.setAttribute('x', x + w - this.imageSize - 4);
			this.imageNode.setAttribute('y', y);
			this.imageNode.setAttribute('width', this.imageSize * this.scale + 'px');
			this.imageNode.setAttribute('height', this.imageSize * this.scale + 'px');
		}
	}
	else
	{
		ss = Math.min(ss, w);
		this.innerNode.setAttribute('width', ss);
		var points = 'M ' + (x + ss) + ' ' + y +
			' l ' + (w - ss) + ' 0' + ' l 0 ' + h +
			' l ' + (ss - w) + ' 0';
		this.content.setAttribute('d', points);
		
		if (this.separator != null)
		{
			this.separator.setAttribute('x1', x + ss);
			this.separator.setAttribute('y1', y + h);
			this.separator.setAttribute('x2', x + w);
			this.separator.setAttribute('y2', y + h);
		}
		
		if (this.imageNode != null)
		{
			this.imageNode.setAttribute('x', x + w - this.imageSize - 4);
			this.imageNode.setAttribute('y', y);
			this.imageNode.setAttribute('width', this.imageSize * this.scale + 'px');
			this.imageNode.setAttribute('height', this.imageSize * this.scale + 'px');
		}
	}
};
