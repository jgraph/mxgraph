/**
 * $Id: mxLabel.js,v 1.40 2012-05-22 16:10:12 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxLabel
 *
 * Extends <mxShape> to implement an image shape with a label.
 * This shape is registered under <mxConstants.SHAPE_LABEL> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxLabel
 *
 * Constructs a new label shape.
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
function mxLabel(bounds, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxLabel.prototype = new mxShape();
mxLabel.prototype.constructor = mxLabel;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxLabel.prototype.vmlNodes = mxLabel.prototype.vmlNodes.concat(['label', 'imageNode', 'indicatorImageNode', 'rectNode']);

/**
 * Variable: imageSize
 *
 * Default width and height for the image. Default is
 * <mxConstants.DEFAULT_IMAGESIZE>.
 */
mxLabel.prototype.imageSize = mxConstants.DEFAULT_IMAGESIZE;

/**
 * Variable: spacing
 *
 * Default value for spacing. Default is 2.
 */
mxLabel.prototype.spacing = 2;

/**
 * Variable: indicatorSize
 *
 * Default width and height for the indicicator. Default is
 * 10.
 */
mxLabel.prototype.indicatorSize = 10;

/**
 * Variable: indicatorSpacing
 *
 * Default spacing between image and indicator. Default is 2.
 */
mxLabel.prototype.indicatorSpacing = 2;

/**
 * Variable: opaqueVmlImages
 * 
 * Specifies if all VML images should be rendered without transparency, that
 * is, if the current opacity should be ignored for images. Default is false.
 */
mxLabel.prototype.opaqueVmlImages = false;

/**
 * Function: init
 *
 * Initializes the shape and adds it to the container. This function is
 * overridden so that the node is already in the DOM when the indicator
 * is added. This is required to access the ownerSVGelement of the
 * container in the init function of the indicator.
 */
mxLabel.prototype.init = function(container)
{
	mxShape.prototype.init.apply(this, arguments);
	
	// Creates the indicator shape after the node was added to the DOM
	if (this.indicatorColor != null && this.indicatorShape != null)
	{
		this.indicator = new this.indicatorShape();
		this.indicator.dialect = this.dialect;
		this.indicator.bounds = this.bounds;
		this.indicator.fill = this.indicatorColor;
		this.indicator.stroke = this.indicatorColor;
		this.indicator.gradient = this.indicatorGradientColor;
		this.indicator.direction = this.indicatorDirection;
		this.indicator.init(this.node);
		this.indicatorShape = null;
	}
};

/**
 * Function: reconfigure
 *
 * Reconfigures this shape. This will update the colors of the indicator
 * and reconfigure it if required.
 */
mxLabel.prototype.reconfigure = function()
{
	mxShape.prototype.reconfigure.apply(this);
	
	if (this.indicator != null)
	{
		this.indicator.fill = this.indicatorColor;
		this.indicator.stroke = this.indicatorColor;
		this.indicator.gradient = this.indicatorGradientColor;
		this.indicator.direction = this.indicatorDirection;
		this.indicator.reconfigure();
	}
};

/**
 * Function: createHtml
 *
 * Creates and returns the HTML node to represent this shape.
 */
mxLabel.prototype.createHtml = function()
{
	var name = 'DIV';
	var node = document.createElement(name);
	this.configureHtmlShape(node);
	
	// Adds a small subshape inside this shape
	if (this.indicatorImage != null)
	{
		this.indicatorImageNode = mxUtils.createImage(this.indicatorImage);
		this.indicatorImageNode.style.position = 'absolute';
		node.appendChild(this.indicatorImageNode);
	}
	
	// Adds an image node to the div
	if (this.image != null)
	{
		this.imageNode = mxUtils.createImage(this.image);
		this.stroke = null;
		this.configureHtmlShape(this.imageNode);
		mxUtils.setOpacity(this.imageNode, '100');
		node.appendChild(this.imageNode);
	}
	
	return node;
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxLabel.prototype.createVml = function()
{
	var node = document.createElement('v:group');

	// Background
	var name = (this.isRounded) ? 'v:roundrect' : 'v:rect';
	this.rectNode = document.createElement(name);
	this.configureVmlShape(this.rectNode);
	
	// Disables the shadow and configures the enclosing group
	this.isShadow = false;
	this.configureVmlShape(node);
	node.coordorigin = '0,0';
	node.appendChild(this.rectNode);
	
	// Adds a small subshape inside this shape
	if (this.indicatorImage != null)
	{
		this.indicatorImageNode = this.createVmlImage(this.indicatorImage, (this.opaqueVmlImages) ? null : this.opacity);
		node.appendChild(this.indicatorImageNode);
	}
	
	// Adds an image node to the div
	if (this.image != null)
	{
		this.imageNode = this.createVmlImage(this.image, (this.opaqueVmlImages) ? null : this.opacity);
		node.appendChild(this.imageNode);
	}
	
	// Container for the label on top of everything
	this.label = document.createElement('v:rect');
	this.label.style.top = '0px'; // relative
	this.label.style.left = '0px'; // relative
	this.label.filled = 'false';
	this.label.stroked = 'false';
	node.appendChild(this.label);
	
	return node;
};

/**
 * Function: createVmlImage
 *
 * Creates an image node for the given image src and opacity to be used in VML.
 */
mxLabel.prototype.createVmlImage = function(src, opacity)
{
	var result = null;
	
	// Workaround for data URIs not supported in VML and for added
	// border around images if opacity is used (not needed in IE9,
	// but IMG node is probably better and faster anyway).
	if (src.substring(0, 5) == 'data:' || opacity != null)
	{
		result = document.createElement('img');
		mxUtils.setOpacity(result, opacity);
		result.setAttribute('border', '0');
		result.style.position = 'absolute';
		result.setAttribute('src', src);
	}
	else
	{
		result = document.createElement('v:image');
		result.src = src;
	}
	
	return result;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node to represent this shape.
 */
mxLabel.prototype.createSvg = function()
{
	var g = this.createSvgGroup('rect');

	// Adds a small subshape to the svg group
	if (this.indicatorImage != null)
	{
		this.indicatorImageNode = document.createElementNS(mxConstants.NS_SVG, 'image');
		this.indicatorImageNode.setAttributeNS(mxConstants.NS_XLINK, 'href', this.indicatorImage);
		g.appendChild(this.indicatorImageNode);
		
		if (this.opacity != null)
		{
			this.indicatorImageNode.setAttribute('opacity', this.opacity / 100);
		}
	}
	
	// Adds an image to the svg group
	if (this.image != null)
	{
		this.imageNode = document.createElementNS(mxConstants.NS_SVG, 'image');
		this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'href', this.image);
		
		if (this.opacity != null)
		{
			this.imageNode.setAttribute('opacity', this.opacity / 100);
		}

		// Disables control-click and alt-click in Firefox
		this.imageNode.setAttribute('style', 'pointer-events:none');
		this.configureSvgShape(this.imageNode);
		g.appendChild(this.imageNode);
	}

	return g;
};

/**
 * Function: redraw
 *
 * Overrides redraw to define a unified implementation for redrawing
 * all supported dialects.
 */
mxLabel.prototype.redraw = function()
{
	this.updateBoundingBox();
	var isSvg = (this.dialect == mxConstants.DIALECT_SVG);
	var isVml = mxUtils.isVml(this.node);
	
	// Updates the bounds of the outermost shape
	if (isSvg)
	{
		this.updateSvgShape(this.innerNode);
		
		if (this.shadowNode != null)
		{
			this.updateSvgShape(this.shadowNode);
		}

		this.updateSvgGlassPane();
	}
	else if (isVml)
	{
		this.updateVmlShape(this.node);
		this.updateVmlShape(this.rectNode);
		this.label.style.width = this.node.style.width;
		this.label.style.height = this.node.style.height;
		
		this.updateVmlGlassPane();
	}
	else
	{
		this.updateHtmlShape(this.node);
	}

	// Updates the imagewidth and imageheight		
	var imageWidth = 0;
	var imageHeight = 0;
	
	if (this.imageNode != null)
	{
		imageWidth = (this.style[mxConstants.STYLE_IMAGE_WIDTH] ||
			this.imageSize) * this.scale;
		imageHeight = (this.style[mxConstants.STYLE_IMAGE_HEIGHT] ||
			this.imageSize) * this.scale;
	}
	
	// Updates the subshape size and location
	var indicatorSpacing = 0;
	var indicatorWidth = 0;
	var indicatorHeight = 0;
	
	if (this.indicator != null || this.indicatorImageNode != null)
	{
		indicatorSpacing = (this.style[mxConstants.STYLE_INDICATOR_SPACING] ||
			this.indicatorSpacing) * this.scale;
		indicatorWidth = (this.style[mxConstants.STYLE_INDICATOR_WIDTH] ||
			this.indicatorSize) * this.scale;
		indicatorHeight = (this.style[mxConstants.STYLE_INDICATOR_HEIGHT] ||
			this.indicatorSize) * this.scale;
	}
	
	var align = this.style[mxConstants.STYLE_IMAGE_ALIGN];
	var valign = this.style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN];

	var inset = this.spacing * this.scale + 5;		
	var width = Math.max(imageWidth, indicatorWidth);
	var height = imageHeight + indicatorSpacing + indicatorHeight;
	
	var x = (isSvg) ? this.bounds.x : 0;
	
	if (align == mxConstants.ALIGN_RIGHT)
	{
		x += this.bounds.width - width - inset;
	}
	else if (align == mxConstants.ALIGN_CENTER)
	{
		x += (this.bounds.width - width) / 2;
	}
	else // default is left
	{
		x += inset;
	}
	
	var y = (isSvg) ? this.bounds.y : 0;
	
	if (valign == mxConstants.ALIGN_BOTTOM)
	{
		y += this.bounds.height - height - inset;
	}
	else if (valign == mxConstants.ALIGN_TOP)
	{
		y += inset;
	}
	else // default is middle
	{
		y += (this.bounds.height - height) / 2;
	}
	
	// Updates the imagenode
	if (this.imageNode != null)
	{
		if (isSvg)
		{
			this.imageNode.setAttribute('x', (x + (width - imageWidth) / 2) + 'px');
			this.imageNode.setAttribute('y', y + 'px');
			this.imageNode.setAttribute('width', imageWidth + 'px');
			this.imageNode.setAttribute('height', imageHeight + 'px');
		}
		else
		{
			this.imageNode.style.left = (x + width - imageWidth) + 'px';
			this.imageNode.style.top = y + 'px';
			this.imageNode.style.width = imageWidth + 'px';
			this.imageNode.style.height = imageHeight + 'px';
			this.imageNode.stroked = 'false';
		}
	}
	
	// Updates the subshapenode (aka. indicator)
	if (this.indicator != null)
	{
		this.indicator.bounds = new mxRectangle(
			x + (width - indicatorWidth) / 2,
			y + imageHeight + indicatorSpacing,
			indicatorWidth, indicatorHeight);
		this.indicator.redraw();
	}
	else if (this.indicatorImageNode != null)
	{
		if (isSvg)
		{
			this.indicatorImageNode.setAttribute('x', (x + (width - indicatorWidth) / 2) + 'px');
			this.indicatorImageNode.setAttribute('y', (y + imageHeight + indicatorSpacing) + 'px');
			this.indicatorImageNode.setAttribute('width', indicatorWidth + 'px');
			this.indicatorImageNode.setAttribute('height', indicatorHeight + 'px');
		}
		else
		{			
			this.indicatorImageNode.style.left = (x + (width - indicatorWidth) / 2) + 'px';
			this.indicatorImageNode.style.top = (y + imageHeight + indicatorSpacing) + 'px';
			this.indicatorImageNode.style.width = indicatorWidth + 'px';
			this.indicatorImageNode.style.height = indicatorHeight + 'px';
		}
	}
};
