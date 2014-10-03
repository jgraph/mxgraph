/**
 * Copyright (c) 2006-2013, JGraph Ltd
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
	this.updateMargin();
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
 * Specifies if the string size should be measured in <updateBoundingBox> if
 * the label is clipped and the label position is center and middle. If this is
 * true, then the bounding box will be set to <bounds>. Default is true.
 * <ignoreStringSize> has precedence over this switch.
 */
mxText.prototype.ignoreClippedStringSize = true;

/**
 * Variable: ignoreStringSize
 * 
 * Specifies if the actual string size should be measured. If disabled the
 * boundingBox will not ignore the actual size of the string, otherwise
 * <bounds> will be used instead. Default is false.
 */
mxText.prototype.ignoreStringSize = false;

/**
 * Variable: textWidthPadding
 * 
 * Specifies the padding to be added to the text width for the bounding box.
 * This is needed to make sure no clipping is applied to borders. Default is 4
 * for IE 8 standards mode and 3 for all others.
 */
mxText.prototype.textWidthPadding = (document.documentMode == 8) ? 4 : 3;

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
 * Function: apply
 * 
 * Extends mxShape to updat the text styles.
 *
 * Parameters:
 *
 * state - <mxCellState> of the corresponding cell.
 */
mxText.prototype.apply = function(state)
{
	mxShape.prototype.apply.apply(this, arguments);
	
	if (this.style != null)
	{
		this.fontStyle = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSTYLE, this.fontStyle);
		this.family = mxUtils.getValue(this.style, mxConstants.STYLE_FONTFAMILY, this.family);
		this.size = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSIZE, this.size);
		this.color = mxUtils.getValue(this.style, mxConstants.STYLE_FONTCOLOR, this.color);
		this.align = mxUtils.getValue(this.style, mxConstants.STYLE_ALIGN, this.align);
		this.valign = mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_ALIGN, this.valign);
		this.spacingTop = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_TOP, this.spacingTop);
		this.spacingRight = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_RIGHT, this.spacingRight);
		this.spacingBottom = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_BOTTOM, this.spacingBottom);
		this.spacingLeft = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_LEFT, this.spacingLeft);
		this.horizontal = mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, this.horizontal);
		this.background = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, this.background);
		this.border = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BORDERCOLOR, this.border);
		this.updateMargin();
	}
};

/**
 * Function: updateBoundingBox
 *
 * Updates the <boundingBox> for this shape using the given node and position.
 */
mxText.prototype.updateBoundingBox = function()
{
	var node = this.node;
	this.boundingBox = this.bounds.clone();
	var rot = this.getTextRotation();
	
	var h = (this.style != null) ? mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER) : null;
	var v = (this.style != null) ? mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE) : null;

	if (!this.ignoreStringSize && node != null && this.overflow != 'fill' && (!this.clipped ||
		!this.ignoreClippedStringSize || h != mxConstants.ALIGN_CENTER || v != mxConstants.ALIGN_MIDDLE))
	{
		var ow = null;
		var oh = null;
		
		if (node.ownerSVGElement != null)
		{
			if (node.firstChild != null && node.firstChild.firstChild != null &&
				node.firstChild.firstChild.nodeName == 'foreignObject')
			{
				node = node.firstChild.firstChild;
				ow = parseInt(node.getAttribute('width')) * this.scale;
				oh = parseInt(node.getAttribute('height')) * this.scale;
			}
			else
			{
				try
				{
					var b = node.getBBox();
					
					// Workaround for bounding box of empty string
					if (typeof(this.value) == 'string' && mxUtils.trim(this.value) == 0)
					{
						return;
					}
					
					if (b.width == 0 && b.height == 0)
					{
						return;
					}
					
					this.boundingBox = new mxRectangle(b.x, b.y, b.width, b.height);
					rot = 0;
				}
				catch (e)
				{
					// Ignores NS_ERROR_FAILURE in FF if container display is none.
				}
			}
		}
		else
		{
			var td = (this.state != null) ? this.state.view.textDiv : null;

			// Use cached offset size
			if (this.offsetWidth != null && this.offsetHeight != null)
			{
				ow = this.offsetWidth * this.scale;
				oh = this.offsetHeight * this.scale;
			}
			else
			{
				// Cannot get node size while container hidden so a
				// shared temporary DIV is used for text measuring
				if (td != null)
				{
					this.updateFont(td);
					this.updateSize(td, false);
					this.updateInnerHtml(td);
					
					node = td;
				}
				
				var sizeDiv = node;

				if (document.documentMode == 8)
				{
					var w = Math.round(this.bounds.width / this.scale);
	
					if (this.wrap && w > 0)
					{
						node.whiteSpace = 'normal';

						// Innermost DIV is used for measuring text
						var divs = sizeDiv.getElementsByTagName('div');
						
						if (divs.length > 0)
						{
							sizeDiv = divs[divs.length - 1];
						}
						
						ow = sizeDiv.offsetWidth + 2;
						divs = this.node.getElementsByTagName('div');
						
						if (this.clipped)
						{
							ow = Math.min(w, ow);
						}
						
						// Second last DIV width must be updated in DOM tree
						if (divs.length > 1)
						{
							divs[divs.length - 2].style.width = ow + 'px';
						}
					}
					else
					{
						node.whiteSpace = 'nowrap';
					}
				}
				else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
				{
					sizeDiv = sizeDiv.firstChild;
				}
				
				ow = (sizeDiv.offsetWidth + this.textWidthPadding) * this.scale;
				oh = sizeDiv.offsetHeight * this.scale;
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
		
	c.text(x, y, w, h, val, this.align, this.valign, this.wrap, fmt, this.overflow,
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
	style.whiteSpace = 'normal';
	style.overflow = '';
	style.width = '';
	style.height = '';
	
	this.updateValue();
	this.updateFont(this.node);
	this.updateSize(this.node, (this.state == null || this.state.view.textDiv == null));
	
	this.offsetWidth = null;
	this.offsetHeight = null;

	if (mxClient.IS_IE && (document.documentMode == null || document.documentMode <= 8))
	{
		this.updateHtmlFilter();
	}
	else
	{
		this.updateHtmlTransform();
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
		mxUtils.setPrefixedStyle(style, 'transformOrigin', (-dx * 100) + '%' + ' ' + (-dy * 100) + '%');
		mxUtils.setPrefixedStyle(style, 'transform', 'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)' +
			'scale(' + this.scale + ') rotate(' + theta + 'deg)');
	}
	else
	{
		mxUtils.setPrefixedStyle(style, 'transformOrigin', '0% 0%');
		mxUtils.setPrefixedStyle(style, 'transform', 'scale(' + this.scale + ')' +
			'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)');
	}

	style.left = Math.round(this.bounds.x) + 'px';
	style.top = Math.round(this.bounds.y) + 'px';
};

/**
 * Function: setInnerHtml
 * 
 * Sets the inner HTML of the given element to the <value>.
 */
mxText.prototype.updateInnerHtml = function(elt)
{
	if (mxUtils.isNode(this.value))
	{
		elt.innerHTML = this.value.outerHTML;
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
		val = '<div style="display:inline-block;_display:inline;">' + val + '</div>';
		
		elt.innerHTML = val;
	}
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
	var sizeDiv = this.node;
	
	// Fallback for hidden text rendering in IE quirks mode
	if (td != null)
	{
		td.style.overflow = '';
		td.style.height = '';
		td.style.width = '';
		
		this.updateFont(td);
		this.updateSize(td, false);
		this.updateInnerHtml(td);
		
		var w = Math.round(this.bounds.width / this.scale);

		if (this.wrap && w > 0)
		{
			td.whiteSpace = 'normal';
			ow = w;
			
			if (this.clipped)
			{
				ow = Math.min(ow, this.bounds.width);
			}

			td.style.width = ow + 'px';
		}
		else
		{
			td.whiteSpace = 'nowrap';
		}
		
		sizeDiv = td;
		
		if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
		{
			sizeDiv = sizeDiv.firstChild;
		}

		// Required to update the height of the text box after wrapping width is known 
		if (!this.clipped && this.wrap && w > 0)
		{
			ow = sizeDiv.offsetWidth + this.textWidthPadding;
			td.style.width = ow + 'px';
		}
		
		oh = sizeDiv.offsetHeight + 2;
		
		if (mxClient.IS_QUIRKS && this.border != null && this.border != mxConstants.NONE)
		{
			oh += 3;
		}
	}
	else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
	{
		sizeDiv = sizeDiv.firstChild;
		
		oh = sizeDiv.offsetHeight;
	}

	ow = sizeDiv.offsetWidth + this.textWidthPadding;
	
	if (this.clipped)
	{
		oh = Math.min(oh, this.bounds.height);
	}
	
	// Stores for later use
	this.offsetWidth = ow;
	this.offsetHeight = oh;
	
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;
	
	// Simulates max-height CSS in quirks mode
	if (mxClient.IS_QUIRKS && (this.clipped || (this.overflow == 'width' && h > 0)))
	{
		h = Math.min(h, oh);
		style.height = Math.round(h) + 'px';
	}
	else
	{
		h = oh;
	}

	if (this.overflow != 'fill' && this.overflow != 'width')
	{
		if (this.clipped)
		{
			ow = Math.min(w, ow);
		}
		
		w = ow;

		// Simulates max-width CSS in quirks mode
		if ((mxClient.IS_QUIRKS && this.clipped) || this.wrap)
		{
			style.width = Math.round(w) + 'px';
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

		if (this.overflow == 'fill' || this.overflow == 'width')
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
			// and to measure wrapped font sizes in all browsers
			// FIXME: Background size in quirks mode for wrapped text
			val = '<div style="zoom:1;' + css + 'display:inline-block;_display:inline;' +
				'text-decoration:inherit;padding-bottom:1px;padding-right:1px;line-height:' +
				this.node.style.lineHeight + '">' + val + '</div>';
			this.node.style.lineHeight = '';
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
	
	style.lineHeight = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(this.size * mxConstants.LINE_HEIGHT) + 'px' : mxConstants.LINE_HEIGHT;
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
mxText.prototype.updateSize = function(node, enableWrap)
{
	var w = Math.round(this.bounds.width / this.scale);
	var h = Math.round(this.bounds.height / this.scale);
	var style = node.style;
	
	// NOTE: Do not use maxWidth here because wrapping will
	// go wrong if the cell is outside of the viewable area
	if (this.clipped)
	{
		style.overflow = 'hidden';
		style.width = w + 'px';
		
		if (!mxClient.IS_QUIRKS)
		{
			style.maxHeight = h + 'px';
		}
	}
	else if (this.overflow == 'fill')
	{
		style.width = w + 'px';
		style.height = h + 'px';
	}
	else if (this.overflow == 'width')
	{
		style.width = w + 'px';
		style.maxHeight = h + 'px';
	}
	
	if (this.wrap && w > 0)
	{
		style.whiteSpace = 'normal';
		style.width = w + 'px';

		if (enableWrap)
		{
			var sizeDiv = node;
			
			if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
			{
				sizeDiv = sizeDiv.firstChild;
			}
			
			var tmp = sizeDiv.offsetWidth + 3;
			
			if (this.clipped)
			{
				tmp = Math.min(tmp, w);
			}
			
			style.width = tmp+ 'px';
		}
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
