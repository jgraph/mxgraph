/**
 * $Id: mxImageShape.js,v 1.67 2012-04-22 10:16:23 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxImageShape
 *
 * Extends <mxShape> to implement an image shape. This shape is registered
 * under <mxConstants.SHAPE_IMAGE> in <mxCellRenderer>.
 * 
 * Constructor: mxImageShape
 * 
 * Constructs a new image shape.
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * image - String that specifies the URL of the image. This is stored in
 * <image>.
 * fill - String that defines the fill color. This is stored in <fill>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 0. This is stored in <strokewidth>.
 */
function mxImageShape(bounds, image, fill, stroke, strokewidth)
{
	this.bounds = bounds;
	this.image = (image != null) ? image : '';
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.isShadow = false;
};

/**
 * Extends mxShape.
 */
mxImageShape.prototype = new mxShape();
mxImageShape.prototype.constructor = mxImageShape;

/**
 * Variable: crisp
 * 
 * Disables crisp rendering via attributes. Image quality defines the rendering
 * quality. Default is false.
 */
mxImageShape.prototype.crisp = false;

/**
 * Variable: preserveImageAspect
 *
 * Switch to preserve image aspect. Default is true.
 */
mxImageShape.prototype.preserveImageAspect = true;

/**
 * Function: apply
 * 
 * Overrides <mxShape.apply> to replace the fill and stroke colors with the
 * respective values from <mxConstants.STYLE_IMAGE_BACKGROUND> and
 * <mxConstants.STYLE_IMAGE_BORDER>.
 * 
 * Applies the style of the given <mxCellState> to the shape. This
 * implementation assigns the following styles to local fields:
 * 
 * - <mxConstants.STYLE_IMAGE_BACKGROUND> => fill
 * - <mxConstants.STYLE_IMAGE_BORDER> => stroke
 *
 * Parameters:
 *
 * state - <mxCellState> of the corresponding cell.
 */
mxImageShape.prototype.apply = function(state)
{
	mxShape.prototype.apply.apply(this, arguments);
	
	this.fill = null;
	this.stroke = null;

	if (this.style != null)
	{
		this.fill = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BACKGROUND);
		this.stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER);
		this.preserveImageAspect = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_ASPECT, 1) == 1;
		this.gradient = null;
	}
};

/**
 * Function: create
 *
 * Override to create HTML regardless of gradient and
 * rounded property.
 */
mxImageShape.prototype.create = function()
{
	var node = null;

	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		// Workaround: To avoid control-click on images in Firefox to
		// open the image in a new window, this image needs to be placed
		// inside a group with a rectangle in the foreground which has a
		// fill property but no visibility and absorbs all events.
		// The image in turn must have all pointer-events disabled.
		node = this.createSvgGroup('rect');
		this.innerNode.setAttribute('visibility', 'hidden');
		this.innerNode.setAttribute('pointer-events', 'fill');
		
		this.imageNode = document.createElementNS(mxConstants.NS_SVG, 'image');
		this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', this.image);
		this.imageNode.setAttribute('style', 'pointer-events:none');
		this.configureSvgShape(this.imageNode);
		
		// Removes invalid attributes on the image node
		this.imageNode.removeAttribute('stroke');
		this.imageNode.removeAttribute('fill');
		node.insertBefore(this.imageNode, this.innerNode);
		
		// Inserts node for background and border color rendering
		if ((this.fill != null && this.fill != mxConstants.NONE) ||
			(this.stroke != null && this.stroke != mxConstants.NONE))
		{
			this.bg = document.createElementNS(mxConstants.NS_SVG, 'rect');
			node.insertBefore(this.bg, node.firstChild);
		}
		
		// Preserves image aspect as default
		if (!this.preserveImageAspect)
		{
			this.imageNode.setAttribute('preserveAspectRatio', 'none');
		}
	}
	else
	{
		// Uses VML image for all non-embedded images in IE to support better
		// image flipping quality and avoid workarounds for event redirection
		var flipH = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_FLIPH, 0) == 1;
		var flipV = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_FLIPV, 0) == 1;
        var img = this.image.toUpperCase();
		
		// Handles non-flipped embedded images in IE6
		if (mxClient.IS_IE && !flipH && !flipV && img.substring(0, 6) == 'MHTML:')
	    {
			// LATER: Check if outer DIV is required or if aspect can be implemented
			// by adding an offset to the image loading or the background via CSS.
			this.imageNode = document.createElement('DIV');
			this.imageNode.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader ' +
				'(src=\'' + this.image + '\', sizingMethod=\'scale\')';
			
			node = document.createElement('DIV');
			this.configureHtmlShape(node);
			node.appendChild(this.imageNode);
		}
		// Handles all data URL images and HTML images for IE9 with no VML support (in SVG mode)
		else if (!mxClient.IS_IE || img.substring(0, 5) == 'DATA:' || document.documentMode >= 9)
		{
			this.imageNode = document.createElement('img');
			this.imageNode.setAttribute('src', this.image);
			this.imageNode.setAttribute('border', '0');
			this.imageNode.style.position = 'absolute';
			this.imageNode.style.width = '100%';
			this.imageNode.style.height = '100%';

			node = document.createElement('DIV');
			this.configureHtmlShape(node);
			node.appendChild(this.imageNode);
		}
		else
		{
			this.imageNode = document.createElement('v:image');
			this.imageNode.style.position = 'absolute';
			this.imageNode.src = this.image;

			// Needed to draw the background and border but known
			// to cause problems in print preview with https
			node = document.createElement('DIV');
			this.configureHtmlShape(node);
			
			// Workaround for cropped images in IE7/8
			node.style.overflow = 'visible';
			node.appendChild(this.imageNode);
		}
	}
	
	return node;
};

/**
 * Function: updateAspect
 * 
 * Updates the aspect of the image for the given image width and height.
 */
mxImageShape.prototype.updateAspect = function(w, h)
{
	var s = Math.min(this.bounds.width / w, this.bounds.height / h);
	w = Math.max(0, Math.round(w * s));
	h = Math.max(0, Math.round(h * s));
	var x0 = Math.max(0, Math.round((this.bounds.width - w) / 2));
	var y0 = Math.max(0, Math.round((this.bounds.height - h) / 2));
	var st = this.imageNode.style;
	
	// Positions the child node relative to the parent node
	if (this.imageNode.parentNode == this.node)
	{
		// Workaround for duplicate offset in VML in IE8 is
		// to use parent padding instead of left and top
		this.node.style.paddingLeft = x0 + 'px';
		this.node.style.paddingTop = y0 + 'px';
	}
	else
	{
		st.left = (Math.round(this.bounds.x) + x0) + 'px';
		st.top = (Math.round(this.bounds.y) + y0) + 'px';
	}
	
	st.width = w + 'px';
	st.height = h + 'px';
};

/**
 * Function: scheduleUpdateAspect
 * 
 * Schedules an asynchronous <updateAspect> using the current <image>.
 */
mxImageShape.prototype.scheduleUpdateAspect = function()
{
	var img = new Image();
	
	img.onload = mxUtils.bind(this, function()
	{
		mxImageShape.prototype.updateAspect.call(this, img.width, img.height);
	});
	
	img.src = this.image;
};

/**
 * Function: redraw
 * 
 * Overrides <mxShape.redraw> to preserve the aspect ratio of images.
 */
mxImageShape.prototype.redraw = function()
{
	mxShape.prototype.redraw.apply(this, arguments);
	
	if (this.imageNode != null && this.bounds != null)
	{
		// Horizontal and vertical flipping
		var flipH = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_FLIPH, 0) == 1;
		var flipV = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_FLIPV, 0) == 1;
		
		if (this.dialect == mxConstants.DIALECT_SVG)
		{
			var sx = 1;
			var sy = 1;
			var dx = 0;
			var dy = 0;
			
			if (flipH)
			{
				sx = -1;
				dx = -this.bounds.width - 2 * this.bounds.x;
			}
			
			if (flipV)
			{
				sy = -1;
				dy = -this.bounds.height - 2 * this.bounds.y;
			}
			
			// Adds image tansformation to existing transforms
			var transform = (this.imageNode.getAttribute('transform') || '') +
				' scale('+sx+' '+sy+')'+ ' translate('+dx+' '+dy+')';
			this.imageNode.setAttribute('transform', transform);
		}
		else
		{
			// Sets default size (no aspect)
			if (this.imageNode.nodeName != 'DIV')
			{
				this.imageNode.style.width = Math.max(0, Math.round(this.bounds.width)) + 'px';
				this.imageNode.style.height = Math.max(0, Math.round(this.bounds.height)) + 'px';
			}

			// Preserves image aspect
			if (this.preserveImageAspect)
			{
				this.scheduleUpdateAspect();
			} 

			if (flipH || flipV)
			{
				if (mxUtils.isVml(this.imageNode))
				{
					if (flipH && flipV)
					{
						this.imageNode.style.rotation = '180';
					}
					else if (flipH)
					{
						this.imageNode.style.flip = 'x';
					}
					else
					{
						this.imageNode.style.flip = 'y';
					}
				}
				else
				{
					var filter = (this.imageNode.nodeName == 'DIV') ? 'progid:DXImageTransform.Microsoft.AlphaImageLoader ' +
						'(src=\'' + this.image + '\', sizingMethod=\'scale\')' : '';
	
					if (flipH && flipV)
					{
						filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
					}
					else if (flipH)
					{
						filter += 'progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
					}
					else
					{
						filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)';
					}
	
					if (this.imageNode.style.filter != filter)
					{
						this.imageNode.style.filter = filter;
					}
				}
			}
		}
	}
};

/**
 * Function: configureTransparentBackground
 * 
 * Workaround for security warning in IE if this is used in the overlay pane
 * of a diagram. 
 */
mxImageShape.prototype.configureTransparentBackground = function(node)
{
	// do nothing
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxImageShape.prototype.redrawSvg = function()
{
	this.updateSvgShape(this.innerNode);
	this.updateSvgShape(this.imageNode);
	
	if (this.bg != null)
	{
		this.updateSvgShape(this.bg);
		
		if (this.fill != null)
		{
			this.bg.setAttribute('fill', this.fill);
		}
		else
		{
			this.bg.setAttribute('fill', 'none');
		}
		
		if (this.stroke != null)
		{
			this.bg.setAttribute('stroke', this.stroke);
		}
		else
		{
			this.bg.setAttribute('stroke', 'none');
		}
		
		this.bg.setAttribute('shape-rendering', 'crispEdges');
	}
};

/**
 * Function: configureSvgShape
 *
 * Extends method to set opacity on images.
 */
mxImageShape.prototype.configureSvgShape = function(node)
{
	mxShape.prototype.configureSvgShape.apply(this, arguments);
	
	if (this.imageNode != null)
	{
		if (this.opacity != null)
		{
			this.imageNode.setAttribute('opacity', this.opacity / 100);
		}
		else
		{
			this.imageNode.removeAttribute('opacity');
		}
	}
};
