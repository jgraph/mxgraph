/**
 * $Id: mxText.js,v 1.48 2013/04/09 13:16:53 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxText
 *
 * Extends <mxShape> to implement a text shape. To change vertical text from
 * bottom to top to top to bottom, the following code can be used:
 * 
 * (code)
 * mxText.prototype.verticalTextRotation = 90;
 * (end)
 * 
 * Constructor: mxText
 *
 * Constructs a new text shape.
 * 
 * Parameters:
 * 
 * value - String that represents the text to be displayed. This is stored in
 * <value>.
 * bounds - <mxRectangle> that defines the bounds. This is stored in
 * <mxShape.bounds>.
 * align - Specifies the horizontal alignment. Default is ''. This is stored in
 * <align>.
 * valign - Specifies the vertical alignment. Default is ''. This is stored in
 * <valign>.
 * color - String that specifies the text color. Default is 'black'. This is
 * stored in <color>.
 * family - String that specifies the font family. Default is
 * <mxConstants.DEFAULT_FONTFAMILY>. This is stored in <family>.
 * size - Integer that specifies the font size. Default is
 * <mxConstants.DEFAULT_FONTSIZE>. This is stored in <size>.
 * fontStyle - Specifies the font style. Default is 0. This is stored in
 * <fontStyle>.
 * spacing - Integer that specifies the global spacing. Default is 2. This is
 * stored in <spacing>.
 * spacingTop - Integer that specifies the top spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingTop>.
 * spacingRight - Integer that specifies the right spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingRight>.
 * spacingBottom - Integer that specifies the bottom spacing. Default is 0.The
 * sum of the spacing and this is stored in <spacingBottom>.
 * spacingLeft - Integer that specifies the left spacing. Default is 0. The
 * sum of the spacing and this is stored in <spacingLeft>.
 * horizontal - Boolean that specifies if the label is horizontal. Default is
 * true. This is stored in <horizontal>.
 * background - String that specifies the background color. Default is null.
 * This is stored in <background>.
 * border - String that specifies the label border color. Default is null.
 * This is stored in <border>.
 * wrap - Specifies if word-wrapping should be enabled. Default is false.
 * This is stored in <wrap>.
 * clipped - Specifies if the label should be clipped. Default is false.
 * This is stored in <clipped>.
 * overflow - Value of the overflow style. Default is 'visible'.
 */
function mxText(value, bounds, align, valign, color,
	family,	size, fontStyle, spacing, spacingTop, spacingRight,
	spacingBottom, spacingLeft, horizontal, background, border,
	wrap, clipped, overflow, labelPadding)
{
	mxShape.call(this);
	this.value = value;
	this.bounds = bounds;
	this.color = (color != null) ? color : 'black';
	this.align = (align != null) ? align : '';
	this.valign = (valign != null) ? valign : '';
	this.family = (family != null) ? family : mxConstants.DEFAULT_FONTFAMILY;
	this.size = (size != null) ? size : mxConstants.DEFAULT_FONTSIZE;
	this.fontStyle = (fontStyle != null) ? fontStyle : mxConstants.DEFAULT_FONTSTYLE;
	this.spacing = parseInt(spacing || 2);
	this.spacingTop = this.spacing + parseInt(spacingTop || 0);
	this.spacingRight = this.spacing + parseInt(spacingRight || 0);
	this.spacingBottom = this.spacing + parseInt(spacingBottom || 0);
	this.spacingLeft = this.spacing + parseInt(spacingLeft || 0);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.background = background;
	this.border = border;
	this.wrap = (wrap != null) ? wrap : false;
	this.clipped = (clipped != null) ? clipped : false;
	this.overflow = (overflow != null) ? overflow : 'visible';
	this.labelPadding = (labelPadding != null) ? labelPadding : 0;
	this.rotation = 0;
};

/**
 * Extends mxShape.
 */
mxUtils.extend(mxText, mxShape);

/**
 * Variable: baseSpacingTop
 * 
 * Specifies the spacing to be added to the top spacing. Default is 0. Use the
 * value 5 here to get the same label positions as in mxGraph 1.x.
 */
mxText.prototype.baseSpacingTop = 0;

/**
 * Variable: baseSpacingBottom
 * 
 * Specifies the spacing to be added to the bottom spacing. Default is 0. Use the
 * value 1 here to get the same label positions as in mxGraph 1.x.
 */
mxText.prototype.baseSpacingBottom = 0;

/**
 * Variable: baseSpacingLeft
 * 
 * Specifies the spacing to be added to the left spacing. Default is 0.
 */
mxText.prototype.baseSpacingLeft = 0;

/**
 * Variable: baseSpacingRight
 * 
 * Specifies the spacing to be added to the right spacing. Default is 0.
 */
mxText.prototype.baseSpacingRight = 0;

/**
 * Variable: replaceLinefeeds
 * 
 * Specifies if linefeeds in HTML labels should be replaced with BR tags.
 * Default is true.
 */
mxText.prototype.replaceLinefeeds = true;

/**
 * Variable: verticalTextRotation
 * 
 * Rotation for vertical text. Default is -90 (bottom to top).
 */
mxText.prototype.verticalTextRotation = -90;

/**
 * Variable: ignoreClippedStringSize
 * 
 * Specifies if the actual string size should be measured if a label is clipped.
 * If disabled the boundingBox will not ignore the actual size of the string
 * and use <bounds> instead. Default is true. <ignoreStringSize> has precedence
 * over this switch.
 */
mxText.prototype.ignoreClippedStringSize = true;

/**
 * Variable: ignoreStringSize
 * 
 * Specifies if the actual string size should be measured. If disabled the
 * boundingBox will not ignore the actual size of the string. Default is false.
 */
mxText.prototype.ignoreStringSize = false;

/**
 * Function: isParseVml
 * 
 * Text shapes do not contain VML markup and do not need to be parsed. This
 * method returns false to speed up rendering in IE8.
 */
mxText.prototype.isParseVml = function()
{
	return false;
};

/**
 * Function: isHtmlAllowed
 * 
 * Returns true if HTML is allowed for this shape. This implementation returns
 * true if the browser is not in IE8 standards mode.
 */
mxText.prototype.isHtmlAllowed = function()
{
	return document.documentMode != 8;
};

/**
 * Function: getSvgScreenOffset
 * 
 * Disables offset in IE9 for crisper image output.
 */
mxText.prototype.getSvgScreenOffset = function()
{
	return 0;
};

/**
 * Function: checkBounds
 * 
 * Returns true if the bounds are not null and all of its variables are numeric.
 */
mxText.prototype.checkBounds = function()
{
	return (this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
			!isNaN(this.bounds.width) && !isNaN(this.bounds.height));
};

/**
 * Function: updateBoundingBox
 *
 * Updates the <boundingBox> for this shape using the given node and position.
 */
mxText.prototype.updateBoundingBox = function()
{
	var node = this.node;
	
	if (document.documentMode == 8 && node.firstChild != null)
	{
		node = node.firstChild;
		
		if (node.firstChild != null)
		{
			node = node.firstChild;
		}
	}
	
	this.boundingBox = this.bounds.clone();
	var rot = this.getTextRotation();

	if (!this.ignoreStringSize && node != null && this.overflow != 'fill' && (!this.clipped || !this.ignoreClippedStringSize))
	{
		var ow = null;
		var oh = null;
		
		if (node.ownerSVGElement != null)
		{
			if (node.firstChild != null && node.firstChild.firstChild != null &&
				node.firstChild.firstChild.nodeName == 'foreignObject')
			{
				node = node.firstChild.firstChild;
				ow = (this.wrap) ? this.bounds.width : parseInt(node.getAttribute('width')) * this.scale;
				oh = parseInt(node.getAttribute('height')) * this.scale;
			}
			else
			{
				var b = node.getBBox();
				
				if (b.width == 0 && b.height == 0)
				{
					return;
				}
				
				this.boundingBox = new mxRectangle(b.x, b.y, b.width, b.height);
				rot = 0;
			}
		}
		else
		{
			var td = this.state.view.textDiv;
			
			// Use cached offset size
			if (this.offsetWidth != null && this.offsetHeight != null)
			{
				ow = (this.wrap) ? this.bounds.width : this.offsetWidth * this.scale;
				oh = this.offsetHeight * this.scale;
			}
			// Cannot get node size while container hidden so a
			// shared temporary DIV is used for text measuring
			else if (td != null)
			{
				this.updateFont(td);
				this.updateSize(td);
				
				if (mxUtils.isNode(this.value))
				{
					td.innerHTML = this.value.outerHTML;
				}
				else
				{
					var val = (this.replaceLinefeeds) ? this.value.replace(/\n/g, '<br/>') : this.value;
					td.innerHTML = val;
				}

				ow = (this.wrap) ? this.bounds.width : td.offsetWidth * this.scale;
				oh = td.offsetHeight * this.scale;
			}
			else
			{
				ow = (this.wrap) ? this.bounds.width : node.offsetWidth * this.scale;
				oh = node.offsetHeight * this.scale;
			}
		}

		if (ow != null && oh != null)
		{
			var x0 = this.bounds.x + this.margin.x * ow;
			var y0 = this.bounds.y + this.margin.y * oh;
			
			this.boundingBox = new mxRectangle(x0, y0, ow, oh);
		}
	}
	else
	{
		this.boundingBox.x += this.margin.x * this.boundingBox.width;
		this.boundingBox.y += this.margin.y * this.boundingBox.height;		
	}

	if (this.boundingBox != null)
	{
		if (rot != 0)
		{
			var bbox = mxUtils.getBoundingBox(this.boundingBox, rot);
			
			this.boundingBox.x = bbox.x;
			this.boundingBox.y = bbox.y;
			
			if (!mxClient.IS_QUIRKS)
			{
				this.boundingBox.width = bbox.width;
				this.boundingBox.height = bbox.height;
			}
		}
	
		this.boundingBox.x = Math.floor(this.boundingBox.x);
		this.boundingBox.y = Math.floor(this.boundingBox.y);
		this.boundingBox.width = Math.ceil(this.boundingBox.width);
		this.boundingBox.height = Math.ceil(this.boundingBox.height);
	}
};

/**
 * Function: getShapeRotation
 * 
 * Returns 0 to avoid using rotation in the canvas via updateTransform.
 */
mxText.prototype.getShapeRotation = function()
{
	return 0;
};

/**
 * Function: getTextRotation
 * 
 * Returns the rotation for the text label of the corresponding shape.
 */
mxText.prototype.getTextRotation = function()
{
	return (this.state != null && this.state.shape != null) ? this.state.shape.getTextRotation() : 0;
};

/**
 * Function: isPaintBoundsInverted
 * 
 * Inverts the bounds if <mxShape.isBoundsInverted> returns true or if the
 * horizontal style is false.
 */
mxText.prototype.isPaintBoundsInverted = function()
{
	return !this.horizontal && this.state != null && this.state.view.graph.model.isVertex(this.state.cell);
};

/**
 * Function: configureCanvas
 * 
 * Sets the state of the canvas for drawing the shape.
 */
mxText.prototype.configureCanvas = function(c, x, y, w, h)
{
	mxShape.prototype.configureCanvas.apply(this, arguments);
	
	c.setFontColor(this.color);
	c.setFontBackgroundColor(this.background);
	c.setFontBorderColor(this.border);
	c.setFontFamily(this.family);
	c.setFontSize(this.size);
	c.setFontStyle(this.fontStyle);
};

/**
 * Function: updateVmlContainer
 * 
 * Sets the width and height of the container to 1px.
 */
mxText.prototype.updateVmlContainer = function()
{
	this.node.style.left = Math.round(this.bounds.x) + 'px';
	this.node.style.top = Math.round(this.bounds.y) + 'px';
	this.node.style.width = '1px';
	this.node.style.height = '1px';
	this.node.style.overflow = 'visible';
};

/**
 * Function: paint
 * 
 * Generic rendering code.
 */
mxText.prototype.paint = function(c)
{
	// Scale is passed-through to canvas
	var s = this.scale;
	var x = this.bounds.x / s;
	var y = this.bounds.y / s;
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;

	this.updateTransform(c, x, y, w, h);
	this.configureCanvas(c, x, y, w, h);
	
	// Checks if text contains HTML markup
	var realHtml = mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML;
	
	// Always renders labels as HTML in VML
	var fmt = (realHtml || c instanceof mxVmlCanvas2D) ? 'html' : '';
	var val = this.value;
	
	if (!realHtml && fmt == 'html')
	{
		val =  mxUtils.htmlEntities(val, false);
	}
	
	val = (!mxUtils.isNode(this.value) && this.replaceLinefeeds && fmt == 'html') ?
		val.replace(/\n/g, '<br/>') : val;
		
	c.text(x, y, w, h, val, this.align, this.valign, this.wrap, fmt, this.overflow == 'fill',
		this.clipped, this.getTextRotation());
};

/**
 * Function: redrawHtmlShape
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.redrawHtmlShape = function()
{
	var style = this.node.style;
	
	if (this.opacity < 1)
	{
		style.opacity = this.opacity;
	}
	else
	{
		style.opacity = '';
	}

	// Resets CSS styles
	style.overflow = '';
	style.width = '';
	style.height = '';
	
	this.updateFont(this.node);
	this.updateSize(this.node);
	this.updateValue();
	
	this.offsetWidth = null;
	this.offsetHeight = null;
	
	if (mxClient.CSS_PREFIX != null)
	{
		this.updateHtmlTransform();
	}
	else
	{
		this.updateHtmlFilter();
	}
};

/**
 * Function: updateHtmlTransform
 *
 * Returns the spacing as an <mxPoint>.
 */
mxText.prototype.updateHtmlTransform = function()
{
	var theta = this.getTextRotation();
	var style = this.node.style;
	var dx = this.margin.x;
	var dy = this.margin.y;
	
	if (theta != 0)
	{
		style[mxClient.CSS_PREFIX + 'TransformOrigin'] = (-dx * 100) + '%' + ' ' + (-dy * 100) + '%';
		style[mxClient.CSS_PREFIX + 'Transform'] = 'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)' +
			'scale(' + this.scale + ') rotate(' + theta + 'deg)';
	}
	else
	{
		style[mxClient.CSS_PREFIX + 'TransformOrigin'] = '0% 0%';
		style[mxClient.CSS_PREFIX + 'Transform'] = 'scale(' + this.scale + ')' +
			'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)';
	}

	style.left = Math.round(this.bounds.x) + 'px';
	style.top = Math.round(this.bounds.y) + 'px';
};

/**
 * Function: updateHtmlFilter
 *
 * Rotated text rendering quality is bad for IE9 quirks/IE8 standards
 */
mxText.prototype.updateHtmlFilter = function()
{
	var style = this.node.style;
	var dx = this.margin.x;
	var dy = this.margin.y;
	var s = this.scale;
	
	// Resets filter before getting offsetWidth
	style.filter = '';
	
	// Adds 1 to match table height in 1.x
	var ow = 0;
	var oh = 0;
	var td = (this.state != null) ? this.state.view.textDiv : null;

	// Fallback for hidden text rendering in IE quirks mode
	if (td != null)
	{
		td.style.overflow = '';
		td.style.height = '';
		td.style.width = '';
		
		this.updateFont(td);
		this.updateSize(td);

		if (mxUtils.isNode(this.value))
		{
			td.innerHTML = this.value.outerHTML;
		}
		else
		{
			var val = this.value;
			
			if (this.dialect != mxConstants.DIALECT_STRICTHTML)
			{
				// LATER: Can be cached in updateValue
				val = mxUtils.htmlEntities(val, false);
			}
	
			val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
			td.innerHTML = val;
		}
		
		ow = td.offsetWidth + 2; 
		oh = td.offsetHeight + 2;
	}
	else
	{
		// Adds 1 to match table height in 1.x
		ow = this.node.offsetWidth;
		oh = this.node.offsetHeight + 1;
	}
	
	// Stores for later user
	this.offsetWidth = ow;
	this.offsetHeight = oh;

	var w = this.bounds.width / s;
	var h = this.bounds.height / s;
	
	// Simulates max-height CSS in quirks mode
	if (mxClient.IS_QUIRKS && (this.clipped || this.overflow == 'fill') && h > 0)
	{
		h = Math.min(h, oh);
		style.height = Math.round(h + 1) + 'px';
	}
	else
	{
		h = oh;
	}

	if (this.overflow != 'fill')
	{
		// Simulates max-height CSS in quirks mode
		if (mxClient.IS_QUIRKS && (this.clipped || this.wrap) && w > 0)
		{
			w = Math.min(w, ow);
			style.width = Math.round(w) + 'px';
		}
		else
		{
			w = ow;
		}
	}
	
	h *= s;
	w *= s;
	
	// Rotation case is handled via VML canvas
	var rad = this.getTextRotation() * (Math.PI / 180);
	
	// Precalculate cos and sin for the rotation
	var real_cos = parseFloat(parseFloat(Math.cos(rad)).toFixed(8));
	var real_sin = parseFloat(parseFloat(Math.sin(-rad)).toFixed(8));

	rad %= 2 * Math.PI;
	
	if (rad < 0)
	{
		rad += 2 * Math.PI;
	}
	
	rad %= Math.PI;
	
	if (rad > Math.PI / 2)
	{
		rad = Math.PI - rad;
	}
	
	var cos = Math.cos(rad);
	var sin = Math.sin(-rad);

	var tx = w * -(dx + 0.5);
	var ty = h * -(dy + 0.5);

	var top_fix = (h - h * cos + w * sin) / 2 + real_sin * tx - real_cos * ty;
	var left_fix = (w - w * cos + h * sin) / 2 - real_cos * tx - real_sin * ty;
	
	if (rad != 0)
	{
		style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + real_cos + ", M12="+
			real_sin + ", M21=" + (-real_sin) + ", M22=" + real_cos + ", sizingMethod='auto expand')";
	}
	
	style.zoom = s;
	style.left = Math.round(this.bounds.x + left_fix - w / 2) + 'px';
	style.top = Math.round(this.bounds.y + top_fix - h / 2) + 'px';
};

/**
 * Function: updateValue
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.updateValue = function()
{
	if (mxUtils.isNode(this.value))
	{
		this.node.innerHTML = '';
		this.node.appendChild(this.value);
	}
	else
	{
		var val = this.value;
		
		if (this.dialect != mxConstants.DIALECT_STRICTHTML)
		{
			val = mxUtils.htmlEntities(val, false);
		}
		
		val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
		var bg = (this.background != null && this.background != mxConstants.NONE) ? this.background : null;
		var bd = (this.border != null && this.border != mxConstants.NONE) ? this.border : null;

		if (bg != null || bd != null)
		{
			if (this.overflow == 'fill')
			{
				if (bg != null)
				{
					this.node.style.backgroundColor = bg;
				}
				
				if (bd != null)
				{
					this.node.style.border = '1px solid ' + bd;
				}
			}
			else
			{
				var css = '';
				
				if (bg != null)
				{
					css += 'background-color:' + bg + ';';
				}
				
				if (bd != null)
				{
					css += 'border:1px solid ' + bd + ';';
				}
				
				// Wrapper DIV for background, zoom needed for inline in quirks
				// FIXME: Background size in quirks mode for wrapped text
				val = '<div style="zoom:1;' + css + 'display:inline-block;_display:inline;' +
					'padding-bottom:1px;padding-right:1px;line-height:' +
					this.node.style.lineHeight + '">' + val + '</div>';
				this.node.style.lineHeight = '';
			}
		}
	
		this.node.innerHTML = val;
	}
};

/**
 * Function: updateFont
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.updateFont = function(node)
{
	var style = node.style;
	
	style.lineHeight = Math.round(this.size * mxConstants.LINE_HEIGHT) + 'px';
	style.fontSize = Math.round(this.size) + 'px';
	style.fontFamily = this.family;
	style.verticalAlign = 'top';
	style.color = this.color;
	
	if ((this.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		style.fontWeight = 'bold';
	}
	else
	{
		style.fontWeight = '';
	}

	if ((this.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		style.fontStyle = 'italic';
	}
	else
	{
		style.fontStyle = '';
	}
	
	if ((this.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		style.textDecoration = 'underline';
	}
	else
	{
		style.textDecoration = '';
	}
	
	if (this.align == mxConstants.ALIGN_CENTER)
	{
		style.textAlign = 'center';
	}
	else if (this.align == mxConstants.ALIGN_RIGHT)
	{
		style.textAlign = 'right';
	}
	else
	{
		style.textAlign = 'left';
	}
};

/**
 * Function: updateSize
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.updateSize = function(node)
{
	var w = Math.round(this.bounds.width / this.scale);
	var h = Math.round(this.bounds.height / this.scale);
	var style = node.style;
	
	// NOTE: Do not use maxWidth here because wrapping will
	// go wrong if the cell is outside of the viewable area
	if (this.clipped)
	{
		style.overflow = 'hidden';
		
		if (h > 0)
		{
			style.maxHeight = h + 'px';
		}
		
		if (w > 0)
		{
			style.width = w + 'px';
		}
	}
	else if (this.overflow == 'fill')
	{
		style.width = w + 'px';
		
		if (h > 0)
		{
			style.maxHeight = h + 'px';
		}
	}
	
	if (this.wrap && w > 0)
	{
		if (!this.clipped)
		{
			style.width = w + 'px';
		}
		
		style.whiteSpace = 'normal';
	}
	else
	{
		style.whiteSpace = 'nowrap';
	}
};

/**
 * Function: getMargin
 *
 * Returns the spacing as an <mxPoint>.
 */
mxText.prototype.updateMargin = function()
{
	this.margin = mxUtils.getAlignmentAsPoint(this.align, this.valign);
};

/**
 * Function: getSpacing
 *
 * Returns the spacing as an <mxPoint>.
 */
mxText.prototype.getSpacing = function()
{
	var dx = 0;
	var dy = 0;

	if (this.align == mxConstants.ALIGN_CENTER)
	{
		dx = (this.spacingLeft - this.spacingRight) / 2;
	}
	else if (this.align == mxConstants.ALIGN_RIGHT)
	{
		dx = -this.spacingRight - this.baseSpacingRight;
	}
	else
	{
		dx = this.spacingLeft + this.baseSpacingLeft;
	}

	if (this.valign == mxConstants.ALIGN_MIDDLE)
	{
		dy = (this.spacingTop - this.spacingBottom) / 2;
	}
	else if (this.valign == mxConstants.ALIGN_BOTTOM)
	{
		dy = -this.spacingBottom - this.baseSpacingBottom;;
	}
	else
	{
		dy = this.spacingTop + this.baseSpacingTop;
	}
	
	return new mxPoint(dx, dy);
};
