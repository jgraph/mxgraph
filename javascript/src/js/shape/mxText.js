/**
 * $Id: mxText.js,v 1.172 2012-07-16 14:42:11 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxText
 *
 * Extends <mxShape> to implement a text shape. To change vertical text from
 * bottom to top to top to bottom, the following code can be used:
 * 
 * (code)
 * mxText.prototype.ieVerticalFilter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)';
 * mxText.prototype.verticalTextDegree = 90;
 * 
 * mxText.prototype.getVerticalOffset = function(offset)
 * {
 *   return new mxPoint(-offset.y, offset.x);
 * };
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
	this.value = value;
	this.bounds = bounds;
	this.color = (color != null) ? color : 'black';
	this.align = (align != null) ? align : '';
	this.valign = (valign != null) ? valign : '';
	this.family = (family != null) ? family : mxConstants.DEFAULT_FONTFAMILY;
	this.size = (size != null) ? size : mxConstants.DEFAULT_FONTSIZE;
	this.fontStyle = (fontStyle != null) ? fontStyle : 0;
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
};

/**
 * Extends mxShape.
 */
mxText.prototype = new mxShape();
mxText.prototype.constructor = mxText;

/**
 * Variable: replaceLinefeeds
 * 
 * Specifies if linefeeds in HTML labels should be replaced with BR tags.
 * Default is true. This is also used in <mxImageExport> to export the label.
 */
mxText.prototype.replaceLinefeeds = true;

/**
 * Variable: ieVerticalFilter
 * 
 * Holds the filter definition for vertical text in IE. Default is
 * progid:DXImageTransform.Microsoft.BasicImage(rotation=3).
 */
mxText.prototype.ieVerticalFilter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)';

/**
 * Variable: verticalTextDegree
 * 
 * Specifies the degree to be used for vertical text. Default is -90.
 */
mxText.prototype.verticalTextDegree = -90;

/**
 * Variable: forceIgnoreStringSize
 * 
 * Specifies if the string size should always be ignored. Default is false.
 * This can be used to improve rendering speed in slow browsers. This can be
 * used if all labels are smaller than the vertex width. String sizes are
 * ignored by default for labels which are left aligned with no background and
 * border or if the overflow is set to fill. 
 */
mxText.prototype.forceIgnoreStringSize = false;

/**
 * Function: isStyleSet
 *
 * Returns true if the given font style (bold, italic etc)
 * is true in this shape's fontStyle.
 *
 * Parameters:
 *
 * style - Fontstyle constant from <mxConstants>.
 */
mxText.prototype.isStyleSet = function(style)
{
	return (this.fontStyle & style) == style;
};

/**
 * Function: create
 *
 * Override to create HTML regardless of gradient and
 * rounded property.
 */
mxText.prototype.create = function(container)
{
	var node = null;
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		node = this.createSvg();
	}
	else if (this.dialect == mxConstants.DIALECT_STRICTHTML ||
			this.dialect == mxConstants.DIALECT_PREFERHTML ||
			!mxUtils.isVml(container))
	{
		if (mxClient.IS_SVG && !mxClient.NO_FO)
		{
			node = this.createForeignObject();
		}
		else
		{
			node = this.createHtml();
		}
	}
	else
	{
		node = this.createVml();
	}
	
	return node;
};

/**
 * Function: updateBoundingBox
 * 
 * Overrides method to do nothing.
 */
mxText.prototype.updateBoundingBox = function()
{
	// do nothing
};

/**
 * Function: createForeignObject
 *
 * Creates and returns the foreignObject node to represent this shape.
 */
mxText.prototype.createForeignObject = function()
{
	var node = document.createElementNS(mxConstants.NS_SVG, 'g');
	
	var fo = document.createElementNS(mxConstants.NS_SVG, 'foreignObject');
	fo.setAttribute('pointer-events', 'fill');

	// Ignored in FF
	if (this.overflow == 'hidden')
	{
		fo.style.overflow = 'hidden';
	}
	else
	{
		// Fill and default are visible
		fo.style.overflow = 'visible';
	}
	
	var body = document.createElementNS(mxConstants.NS_XHTML, 'body');
	body.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml'); // FF
	body.style.margin = '0px';
	body.style.height = '100%';
	
	fo.appendChild(body);
	node.appendChild(fo);
	
	return node;
};

/**
 * Function: createHtml
 *
 * Creates and returns the HTML node to represent this shape.
 */
mxText.prototype.createHtml = function()
{
	var table = this.createHtmlTable();
	table.style.position = 'absolute';
	
	return table;
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node(s) to represent this shape.
 */
mxText.prototype.createVml = function()
{
	return document.createElement('v:textbox');
};

/**
 * Function: redrawHtml
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.redrawHtml = function()
{
	this.redrawVml();
};

/**
 * Function: getOffset
 *
 * Returns the description of the space between the <bounds> size and the label
 * size as an <mxPoint>.
 */
mxText.prototype.getOffset = function(outerWidth, outerHeight, actualWidth, actualHeight, horizontal)
{
	horizontal = (horizontal != null) ? horizontal : this.horizontal;

	var tmpalign = (horizontal) ? this.align : this.valign;
	var tmpvalign = (horizontal) ? this.valign : this.align;
	var dx = actualWidth - outerWidth;
	var dy = actualHeight - outerHeight;
	
	if (tmpalign == mxConstants.ALIGN_CENTER || tmpalign == mxConstants.ALIGN_MIDDLE)
	{
		dx = Math.round(dx / 2);
	}
	else if (tmpalign == mxConstants.ALIGN_LEFT || tmpalign === mxConstants.ALIGN_TOP)
	{
		dx = (horizontal) ? 0 : (actualWidth - actualHeight) / 2;
	}
	else if (!horizontal) // BOTTOM
	{
		dx = (actualWidth + actualHeight) / 2 - outerWidth;
	}

	if (tmpvalign == mxConstants.ALIGN_MIDDLE || tmpvalign == mxConstants.ALIGN_CENTER)
	{
		dy = Math.round(dy / 2);
	}
	else if (tmpvalign == mxConstants.ALIGN_TOP || tmpvalign == mxConstants.ALIGN_LEFT)
	{
		dy = (horizontal) ? 0 : (actualHeight + actualWidth) / 2 - outerHeight;
	}
	else if (!horizontal) // RIGHT
	{
		dy = (actualHeight - actualWidth) / 2;
	}
	
	return new mxPoint(dx, dy);
};

/**
 * Function: getSpacing
 *
 * Returns the spacing as an <mxPoint>.
 */
mxText.prototype.getSpacing = function(horizontal)
{
	horizontal = (horizontal != null) ? horizontal : this.horizontal;

	var dx = 0;
	var dy = 0;

	if (this.align == mxConstants.ALIGN_CENTER)
	{
		dx = (this.spacingLeft - this.spacingRight) / 2;
	}
	else if (this.align == mxConstants.ALIGN_RIGHT)
	{
		dx = -this.spacingRight;
	}
	else
	{
		dx = this.spacingLeft;
	}

	if (this.valign == mxConstants.ALIGN_MIDDLE)
	{
		dy = (this.spacingTop - this.spacingBottom) / 2;
	}
	else if (this.valign == mxConstants.ALIGN_BOTTOM)
	{
		dy = -this.spacingBottom;
	}
	else
	{
		dy = this.spacingTop;
	}
	
	return (horizontal) ? new mxPoint(dx, dy) : new mxPoint(dy, dx);
};

/**
 * Function: createHtmlTable
 *
 * Creates and returns a HTML table with a table body and a single row with a
 * single cell.
 */
mxText.prototype.createHtmlTable = function()
{
	var table = document.createElement('table');
	table.style.borderCollapse = 'collapse';
	var tbody = document.createElement('tbody');
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	
	// Workaround for ignored table height in IE9 standards mode
	if (document.documentMode >= 9)
	{
		// FIXME: Ignored in print preview for IE9 standards mode
		td.style.height = '100%';
	}

	tr.appendChild(td);
	tbody.appendChild(tr);
	table.appendChild(tbody);
	
	return table;
};

/**
 * Function: updateTableStyle
 * 
 * Updates the style of the given HTML table and the value
 * within the table.
 */
mxText.prototype.updateHtmlTable = function(table, scale)
{
	scale = (scale != null) ? scale : 1;
	var td = table.firstChild.firstChild.firstChild;
	
	// Reset of width required to measure actual width after word wrap
	if (this.wrap)
	{
		table.style.width = '';
	}
	
	// Updates the value
	if (mxUtils.isNode(this.value))
	{
		if (td.firstChild != this.value)
		{
			if (td.firstChild != null)
			{
				td.removeChild(td.firstChild);
			}
			
			td.appendChild(this.value);
		}
	}
	else
	{
		if (this.lastValue != this.value)
		{
			td.innerHTML = (this.replaceLinefeeds) ? this.value.replace(/\n/g, '<br/>') : this.value;
			this.lastValue = this.value;
		}
	}

	// Font style
	var fontSize = Math.round(this.size * scale);

	if (fontSize <= 0)
	{
		table.style.visibility = 'hidden';
	}
	else
	{
		// Do not use visible here as it will clone
		// all labels while panning in IE
		table.style.visibility = '';
	}
	
	table.style.fontSize = fontSize + 'px';
	table.style.color = this.color;
	table.style.fontFamily = this.family;
	
	// Bold
	if (this.isStyleSet(mxConstants.FONT_BOLD))
	{
		table.style.fontWeight = 'bold';
	}
	else
	{
		table.style.fontWeight = 'normal';
	}
	
	// Italic
	if (this.isStyleSet(mxConstants.FONT_ITALIC))
	{
		table.style.fontStyle = 'italic';
	}
	else
	{
		table.style.fontStyle = '';
	}
	
	// Underline
	if (this.isStyleSet(mxConstants.FONT_UNDERLINE))
	{
		table.style.textDecoration = 'underline';
	}
	else
	{
		table.style.textDecoration = '';
	}

	// Font shadow (only available in IE)
	if (mxClient.IS_IE)
	{
		if (this.isStyleSet(mxConstants.FONT_SHADOW))
		{
			td.style.filter = 'Shadow(Color=#666666,'+'Direction=135,Strength=%)';
		}
		else
		{
			td.style.removeAttribute('filter');
		}
	}

	// Horizontal and vertical alignment
	td.style.textAlign =
		(this.align == mxConstants.ALIGN_RIGHT) ? 'right' :
		((this.align == mxConstants.ALIGN_CENTER) ? 'center' :
		'left');
	td.style.verticalAlign =
		(this.valign == mxConstants.ALIGN_BOTTOM) ? 'bottom' :
		((this.valign == mxConstants.ALIGN_MIDDLE) ? 'middle' :
		'top');
	
	// Background style (Must use TD not TABLE for Firefox when rotated)
	if (this.value.length > 0 && this.background != null)
	{
		td.style.background = this.background;
	}
	else
	{
		td.style.background = '';
	}
	
	td.style.padding = this.labelPadding + 'px';
	
	if (this.value.length > 0 && this.border != null)
	{
		table.style.borderColor = this.border;
		table.style.borderWidth = '1px';
		table.style.borderStyle = 'solid';
	}
	else
	{
		table.style.borderStyle = 'none';
	}
};

/**
 * Function: getTableSize
 * 
 * Returns the actual size of the table.
 */
mxText.prototype.getTableSize = function(table)
{
	return new mxRectangle(0, 0, table.offsetWidth, table.offsetHeight);
};

/**
 * Function: updateTableWidth
 *
 * Updates the width of the given HTML table.
 */
mxText.prototype.updateTableWidth = function(table)
{
	var td = table.firstChild.firstChild.firstChild;

	// Word-wrap for vertices (not edges) and only if not
	// just getting the bounding box in SVG
	if (this.wrap && this.bounds.width > 0 && this.dialect != mxConstants.DIALECT_SVG)
	{
		// Makes sure the label is not wrapped when measuring full length
		td.style.whiteSpace = 'nowrap';
		var size = this.getTableSize(table);
		var space = Math.min(size.width, ((this.horizontal || mxUtils.isVml(this.node)) ?
				this.bounds.width : this.bounds.height) / this.scale);
		
		// Opera needs the new width to be scaled
		if (mxClient.IS_OP)
		{
			space *= this.scale;
		}

		table.style.width = Math.round(space) + 'px';
		td.style.whiteSpace = 'normal';
	}
	else
	{
		table.style.width = '';
	}

	if (!this.wrap)
	{
		td.style.whiteSpace = 'nowrap';
	}
	else
	{
		td.style.whiteSpace = 'normal';
	}
};

/**
 * Function: redrawVml
 *
 * Updates the VML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.redrawVml = function()
{
	if (this.node.nodeName == 'g')
	{
		this.redrawForeignObject();
	}
	else if (mxUtils.isVml(this.node))
	{
		this.redrawTextbox();
	}
	else
	{
		this.redrawHtmlTable();
	}
};

/**
 * Function: redrawTextbox
 *
 * Redraws the textbox for this text. This is only used in IE in exact
 * rendering mode.
 */
mxText.prototype.redrawTextbox = function()
{
	// Gets VML textbox
	var textbox = this.node;

	// Creates HTML container on the fly
	if (textbox.firstChild == null)
	{
		textbox.appendChild(this.createHtmlTable());
	}

	// Updates the table style and value
	var table = textbox.firstChild;
	this.updateHtmlTable(table);
	this.updateTableWidth(table);
	
	// Opacity
	if (this.opacity != null)
	{
		mxUtils.setOpacity(table, this.opacity);
	}
	
	table.style.filter = '';
	textbox.inset = '0px,0px,0px,0px';
	
	if (this.overflow != 'fill')
	{
		// Only tables can be used to work out the actual size of the markup
		var size = this.getTableSize(table);
		var w = size.width * this.scale;
		var h = size.height * this.scale;
		var offset = this.getOffset(this.bounds.width, this.bounds.height, w, h);
	
		// Rotates the label (IE only)
		if (!this.horizontal)
		{
			table.style.filter = this.ieVerticalFilter;
		}
		
		// Adds horizontal/vertical spacing
		var spacing = this.getSpacing();
		var x = this.bounds.x - offset.x + spacing.x * this.scale;
		var y = this.bounds.y - offset.y + spacing.y * this.scale;
	
		// Textboxes are always relative to their parent shape's top, left corner so
		// we use the inset for absolute positioning as they allow negative values
		// except for edges where the bounds are used to find the shape center
		var x0 = this.bounds.x;
		var y0 = this.bounds.y;
		var ow = this.bounds.width;
		var oh = this.bounds.height;
	
		// Insets are given as left, top, right, bottom
		if (this.horizontal)
		{
			var tx = Math.round(x - x0);
			var ty = Math.round(y - y0);
			
			var r = Math.min(0, Math.round(x0 + ow - x - w - 1));
			var b = Math.min(0, Math.round(y0 + oh - y - h - 1));
			textbox.inset = tx + 'px,' + ty + 'px,' + r + 'px,' + b + 'px';
		}
		else
		{
			var t = 0;
			var l = 0;
			var r = 0;
			var b = 0;
			
			if (this.align == mxConstants.ALIGN_CENTER)
			{
				t = (oh - w) / 2;
				b = t;
			}
			else if (this.align == mxConstants.ALIGN_LEFT)
			{
				t = oh - w; 
			}
			else
			{
				b = oh - w;
			}
			
			if (this.valign == mxConstants.ALIGN_MIDDLE)
			{
				l = (ow - h) / 2;
				r = l;
			}
			else if (this.valign == mxConstants.ALIGN_BOTTOM)
			{
				l = ow - h; 
			}
			else
			{
				r = ow - h;
			}
			
			textbox.inset = l + 'px,' + t + 'px,' + r + 'px,' + b + 'px';
		}
		
		textbox.style.zoom = this.scale;
	
		// Clipping
		if (this.clipped && this.bounds.width > 0 && this.bounds.height > 0)
		{
			this.boundingBox = this.bounds.clone();
			var dx = Math.round(x0 - x);
			var dy = Math.round(y0 - y);
	
			textbox.style.clip = 'rect(' + (dy / this.scale) + ' ' +
				((dx + this.bounds.width) / this.scale) + ' ' +
				((dy + this.bounds.height) / this.scale) + ' ' +
				(dx / this.scale) + ')';
		}
		else
		{
			this.boundingBox = new mxRectangle(x, y, w, h);
		}
	}
	else
	{
		this.boundingBox = this.bounds.clone();
	}
};

/**
 * Function: redrawHtmlTable
 * 
 * Redraws the HTML table. This is used for HTML labels in all modes except
 * exact in IE and if NO_FO is false for the browser.
 */
mxText.prototype.redrawHtmlTable = function()
{
	if (isNaN(this.bounds.x) || isNaN(this.bounds.y) ||
		isNaN(this.bounds.width) || isNaN(this.bounds.height))
	{
		return;
	}
	
	// Gets table
	var table = this.node;
	var td = table.firstChild.firstChild.firstChild;

	// Un-rotates for computing the actual size
	// TODO: Check if the result can be tweaked instead in getActualSize
	// and only do this if actual rotation did change
	var oldBrowser = false;
	var fallbackScale = 1;
	
	if (mxClient.IS_IE)
	{
		table.style.removeAttribute('filter');
	}
	else if (mxClient.IS_SF || mxClient.IS_GC)
	{
		table.style.WebkitTransform = '';
	}
	else if (mxClient.IS_MT)
	{
		table.style.MozTransform = '';
		td.style.MozTransform = '';
	}
	else
	{
		if (mxClient.IS_OT)
		{
			table.style.OTransform = '';
		}
		
		fallbackScale = this.scale;
		oldBrowser = true;
	}

	// Resets the current zoom for text measuring
	td.style.zoom = '';
	
	// Updates the table style and value
	this.updateHtmlTable(table, fallbackScale);
	this.updateTableWidth(table);

	// Opacity
	if (this.opacity != null)
	{
		mxUtils.setOpacity(table, this.opacity);
	}

	// Resets the bounds for computing the actual size
	table.style.left = '';
	table.style.top = '';
	table.style.height = '';

	// Workaround for multiple zoom even if CSS style is reset here
	var currentZoom = parseFloat(td.style.zoom) || 1;

	// Only tables can be used to work out the actual size of the markup
	// NOTE: offsetWidth and offsetHeight are very slow in quirks and IE 8 standards mode
	var w = this.bounds.width;
	var h = this.bounds.height;
	
	var ignoreStringSize = this.forceIgnoreStringSize || this.overflow == 'fill' ||
			(this.align == mxConstants.ALIGN_LEFT && this.background == null && this.border == null);
	
	if (!ignoreStringSize)
	{
		var size = this.getTableSize(table);
		w = size.width / currentZoom;
		h = size.height / currentZoom;
	}

	var offset = this.getOffset(this.bounds.width / this.scale,
			this.bounds.height / this.scale, w, h,
			oldBrowser || this.horizontal);

	// Adds horizontal/vertical spacing
	var spacing = this.getSpacing(oldBrowser || this.horizontal);
	var x = this.bounds.x / this.scale - offset.x + spacing.x;
	var y = this.bounds.y / this.scale - offset.y + spacing.y;

	// Updates the table bounds and stores the scale to be used for
	// defining the table width and height, as well as an offset
	var s = this.scale;
	var s2 = 1;
	var shiftX = 0;
	var shiftY = 0;
	
	// Rotates the label and adds offset
	if (!this.horizontal)
	{
		if (mxClient.IS_IE && mxClient.IS_SVG)
		{
			table.style.msTransform = 'rotate(' + this.verticalTextDegree + 'deg)';
		}
		else if (mxClient.IS_IE)
		{
			table.style.filter = this.ieVerticalFilter;
			shiftX = (w - h) / 2;
			shiftY = -shiftX;
		}
		else if (mxClient.IS_SF || mxClient.IS_GC)
		{
			table.style.WebkitTransform = 'rotate(' + this.verticalTextDegree + 'deg)';
		}
		else if (mxClient.IS_OT)
		{
			table.style.OTransform = 'rotate(' + this.verticalTextDegree + 'deg)';
		}
		else if (mxClient.IS_MT)
		{
			// Firefox paints background and border only if background is on TD
			// and border is on TABLE and both are rotated, just the TD with a
			// rotation of zero (don't remove the 0-rotate CSS style)
			table.style.MozTransform = 'rotate(' + this.verticalTextDegree + 'deg)';
			td.style.MozTransform = 'rotate(0deg)';
			
			s2 = 1 / this.scale;
			s = 1;
		}
	}

	// Sets the zoom
	var correction = true;
	
	if (mxClient.IS_MT || oldBrowser)
	{
		if (mxClient.IS_MT)
		{
			table.style.MozTransform += ' scale(' + this.scale + ')';
			s2 = 1 / this.scale;
		}
		else if (mxClient.IS_OT)
		{
			td.style.OTransform = 'scale(' + this.scale + ')';
			table.style.borderWidth = Math.round(this.scale * parseInt(table.style.borderWidth)) + 'px';
		}
	}
	else if (!oldBrowser)
	{
		// Workaround for unsupported zoom CSS in IE9 standards mode
		if (document.documentMode >= 9)
		{
			td.style.msTransform = 'scale(' + this.scale + ')';
		}
		// Uses transform in Webkit for better HTML scaling
		else if (mxClient.IS_SF || mxClient.IS_GC)
		{
			td.style.WebkitTransform = 'scale(' + this.scale + ')';
		}
		else
		{
			td.style.zoom = this.scale;
			
			// Fixes scaling of border width
			if (table.style.borderWidth != '' && document.documentMode != 8)
			{
				table.style.borderWidth = Math.round(this.scale * parseInt(table.style.borderWidth)) + 'px';
			}
			
			// Workaround for wrong scale in IE8 standards mode
			if (document.documentMode == 8 || !mxClient.IS_IE)
			{
				s = 1;
			}
			
			correction = false;
		}
	}

	if (correction)
	{
		// Workaround for scaled TD position
		shiftX = (this.scale - 1) * w / (2 * this.scale);
		shiftY = (this.scale - 1) * h / (2 * this.scale);
		s = 1;
	}
	
	if (this.overflow != 'fill')
	{
	    var rect =  new mxRectangle(Math.round((x + shiftX) * this.scale),
	    		Math.round((y + shiftY) * this.scale), Math.round(w * s), Math.round(h * s));
	    table.style.left = rect.x + 'px';
	    table.style.top = rect.y + 'px';
	    table.style.width = rect.width + 'px';
	    table.style.height = rect.height + 'px';
		
		// Workaround for wrong scale in border and background rendering for table and td in IE8/9 standards mode
		if ((this.background != null || this.border != null) && document.documentMode >= 8)
		{
			var html = (this.replaceLinefeeds) ? this.value.replace(/\n/g, '<br/>') : this.value;
			td.innerHTML = '<div style="padding:' + this.labelPadding + 'px;background:' + td.style.background + ';border:' + table.style.border + '">' + html + '</div>';
			td.style.padding = '0px';
			td.style.background = '';
			table.style.border = '';
		}

		// Clipping
		if (this.clipped && this.bounds.width > 0 && this.bounds.height > 0)
		{
			this.boundingBox = this.bounds.clone();
	
			// Clipping without rotation or for older browsers
			if (this.horizontal || (oldBrowser && !mxClient.IS_OT))
			{
				var dx = Math.max(0, offset.x * s);
				var dy = Math.max(0, offset.y * s);

				// TODO: Fix clipping for Opera
				table.style.clip = 'rect(' + (dy) + 'px ' + (dx + this.bounds.width * s2) +
					'px ' + (dy + this.bounds.height * s2) + 'px ' + (dx) + 'px)';
			}
			else
			{
				// Workaround for IE clip using top, right, bottom, left (un-rotated)
				if (mxClient.IS_IE)
				{
					var uw = this.bounds.width;
					var uh = this.bounds.height;
					var dx = 0;
					var dy = 0;
	
					if (this.align == mxConstants.ALIGN_LEFT)
					{
						dx = Math.max(0, w - uh / this.scale) * this.scale;
					}
					else if (this.align == mxConstants.ALIGN_CENTER)
					{
						dx = Math.max(0, w - uh / this.scale) * this.scale / 2;
					}
					
					if (this.valign == mxConstants.ALIGN_BOTTOM)
					{
						dy = Math.max(0, h - uw / this.scale) * this.scale;
					}
					else if (this.valign == mxConstants.ALIGN_MIDDLE)
					{
						dy = Math.max(0, h - uw / this.scale) * this.scale / 2;
					}
	
					table.style.clip = 'rect(' + (dx) + 'px ' + (dy + uw - 1) +
						'px ' + (dx + uh - 1) + 'px ' + (dy) + 'px)';
				}
				else
				{
					var uw = this.bounds.width / this.scale;
					var uh = this.bounds.height / this.scale;
					
					if (mxClient.IS_OT)
					{
						uw = this.bounds.width;
						uh = this.bounds.height;
					}
					
					var dx = 0;
					var dy = 0;
	
					if (this.align == mxConstants.ALIGN_RIGHT)
					{
						dx = Math.max(0, w - uh);
					}
					else if (this.align == mxConstants.ALIGN_CENTER)
					{
						dx = Math.max(0, w - uh) / 2;
					}
					
					if (this.valign == mxConstants.ALIGN_BOTTOM)
					{
						dy = Math.max(0, h - uw);
					}
					else if (this.valign == mxConstants.ALIGN_MIDDLE)
					{
						dy = Math.max(0, h - uw) / 2;
					}
					
					if (mxClient.IS_GC || mxClient.IS_SF)
					{
						dx *= this.scale;
						dy *= this.scale;
						uw *= this.scale;
						uh *= this.scale;
					}
	
					table.style.clip = 'rect(' + (dy) + ' ' + (dx + uh) +
						' ' + (dy + uw) + ' ' + (dx) + ')';
				}
			}
		}
		else
		{
			this.boundingBox = rect;
		}
	}
	else
	{
		this.boundingBox = this.bounds.clone();
		
		if (document.documentMode >= 9 || mxClient.IS_SVG)
		{
			table.style.left = Math.round(this.bounds.x + this.scale / 2 + shiftX) + 'px';
			table.style.top = Math.round(this.bounds.y + this.scale / 2 + shiftY) + 'px';
			table.style.width = Math.round((this.bounds.width - this.scale) / this.scale) + 'px';
			table.style.height = Math.round((this.bounds.height - this.scale) / this.scale) + 'px';
		}
		else
		{
			s = (document.documentMode == 8) ? this.scale : 1;
			table.style.left = Math.round(this.bounds.x + this.scale / 2) + 'px';
			table.style.top = Math.round(this.bounds.y + this.scale / 2) + 'px';
			table.style.width = Math.round((this.bounds.width - this.scale) / s) + 'px';
			table.style.height = Math.round((this.bounds.height - this.scale) / s) + 'px';
		}
	}
};

/**
 * Function: getVerticalOffset
 *
 * Returns the factors for the offset to be added to the text vertical
 * text rotation. This implementation returns (offset.y, -offset.x).
 */
mxText.prototype.getVerticalOffset = function(offset)
{
	return new mxPoint(offset.y, -offset.x);
};

/**
 * Function: redrawForeignObject
 *
 * Redraws the foreign object for this text.
 */
mxText.prototype.redrawForeignObject = function()
{
	// Gets SVG group with foreignObject
	var group = this.node;
	var fo = group.firstChild;
	
	// Searches the table which appears behind the background
	while (fo == this.backgroundNode)
	{
		fo = fo.nextSibling;
	}
	
	var body = fo.firstChild;
	
	// Creates HTML container on the fly
	if (body.firstChild == null)
	{
		body.appendChild(this.createHtmlTable());
	}

	// Updates the table style and value
	var table = body.firstChild;
	this.updateHtmlTable(table);
	
	// Workaround for bug in Google Chrome where the text is moved to origin if opacity
	// is set on the table, so we set the opacity on the foreignObject instead.
	if (this.opacity != null)
	{
		fo.setAttribute('opacity', this.opacity / 100);
	}
	
	// Workaround for table background not appearing above the shape that is
	// behind the label in Safari. To solve this, we add a background rect that
	// paints the background instead.
	if (mxClient.IS_SF)
	{
		table.style.borderStyle = 'none';
		table.firstChild.firstChild.firstChild.style.background = '';
		
		if (this.backgroundNode == null && (this.background != null || this.border != null))
		{
			this.backgroundNode = document.createElementNS(mxConstants.NS_SVG, 'rect');
			group.insertBefore(this.backgroundNode, group.firstChild);
		}
		else if (this.backgroundNode != null && this.background == null && this.border == null)
		{
			this.backgroundNode.parentNode.removeChild(this.backgroundNode);
			this.backgroundNode = null;
		}
		
		if (this.backgroundNode != null)
		{
			if (this.background != null)
			{
				this.backgroundNode.setAttribute('fill', this.background);
			}
			else
			{
				this.backgroundNode.setAttribute('fill', 'none');
			}
	
			if (this.border != null)
			{
				this.backgroundNode.setAttribute('stroke', this.border);
			}
			else
			{
				this.backgroundNode.setAttribute('stroke', 'none');
			}
		}
	}
	
	var tr = '';
	
	if (this.overflow != 'fill')
	{
		// Resets the bounds for computing the actual size
		fo.removeAttribute('width');
		fo.removeAttribute('height');
		fo.style.width = '';
		fo.style.height = '';
		fo.style.clip = '';
		
		// Workaround for size of table not updated if inside foreignObject
		if (this.wrap || (!mxClient.IS_GC && !mxClient.IS_SF))
		{
			document.body.appendChild(table);
		}

		this.updateTableWidth(table);
		
		// Only tables can be used to work out the actual size of the markup
		var size = this.getTableSize(table);
		var w = size.width;
		var h = size.height;

		if (table.parentNode != body)
		{
			body.appendChild(table);
		}

		// Adds horizontal/vertical spacing
		var spacing = this.getSpacing();
		
		var x = this.bounds.x / this.scale + spacing.x;
		var y = this.bounds.y / this.scale + spacing.y;
		var uw = this.bounds.width / this.scale;
		var uh = this.bounds.height / this.scale;
		var offset = this.getOffset(uw, uh, w, h);
		
		// Rotates the label and adds offset
		if (this.horizontal)
		{
			x -= offset.x;
			y -= offset.y;
			
			tr = 'scale(' + this.scale + ')';
		}
		else
		{
			var x0 = x + w / 2;
			var y0 = y + h / 2;
			
			tr = 'scale(' + this.scale + ') rotate(' + this.verticalTextDegree + ' ' + x0 + ' ' + y0 + ')';
	
			var tmp = this.getVerticalOffset(offset);
			x += tmp.x;
			y += tmp.y;
		}
		
		// Must use translate instead of x- and y-attribute on FO for iOS
		tr += ' translate(' + x + ' ' + y + ')';
		
		// Updates the bounds of the background node in Webkit
		if (this.backgroundNode != null)
		{
			this.backgroundNode.setAttribute('width', w);
			this.backgroundNode.setAttribute('height', h);
		}
		
		// Updates the foreignObject size
		fo.setAttribute('width', w);
		fo.setAttribute('height', h);
		
		// Clipping
		// TODO: Fix/check clipping for foreignObjects in Chrome 5.0 - if clipPath
		// is used in the group then things can no longer be moved around
		if (this.clipped && this.bounds.width > 0 && this.bounds.height > 0)
		{
			this.boundingBox = this.bounds.clone();
			var dx = Math.max(0, offset.x);
			var dy = Math.max(0, offset.y);

			if (this.horizontal)
			{
				fo.style.clip = 'rect(' + dy + 'px,' + (dx + uw) +
					'px,' + (dy + uh) + 'px,' + (dx) + 'px)';
			}
			else
			{
				var dx = 0;
				var dy = 0;
	
				if (this.align == mxConstants.ALIGN_RIGHT)
				{
					dx = Math.max(0, w - uh);
				}
				else if (this.align == mxConstants.ALIGN_CENTER)
				{
					dx = Math.max(0, w - uh) / 2;
				}
				
				if (this.valign == mxConstants.ALIGN_BOTTOM)
				{
					dy = Math.max(0, h - uw);
				}
				else if (this.valign == mxConstants.ALIGN_MIDDLE)
				{
					dy = Math.max(0, h - uw) / 2;
				}
	
				fo.style.clip = 'rect(' + (dy) + 'px,' + (dx + uh) +
					'px,' + (dy + uw) + 'px,' + (dx) + 'px)';
			}
			
			// Clipping for the background node in Chrome
			if (this.backgroundNode != null)
			{
				x = this.bounds.x / this.scale;
				y = this.bounds.y / this.scale;
				
				if (!this.horizontal)
				{
					x += (h + w) / 2 - uh;
					y += (h - w) / 2;
					
					var tmp = uw;
					uw = uh;
					uh = tmp;
				}
	
				// No clipping in Chome available due to bug
				if (!mxClient.IS_GC)
				{
					var clip = this.getSvgClip(this.node.ownerSVGElement, x, y, uw, uh);
					
					if (clip != this.clip)
					{
						this.releaseSvgClip();
						this.clip = clip;
						clip.refCount++;
					}
				
					this.backgroundNode.setAttribute('clip-path', 'url(#' + clip.getAttribute('id') + ')');
				}
			}
		}
		else
		{
			// Removes clipping from background and cleans up the clip
			this.releaseSvgClip();
			
			if (this.backgroundNode != null)
			{
				this.backgroundNode.removeAttribute('clip-path');
			}
			
			if (this.horizontal)
			{
				this.boundingBox = new mxRectangle(x * this.scale, y * this.scale, w * this.scale, h * this.scale);
			}
			else
			{
				this.boundingBox = new mxRectangle(x * this.scale, y * this.scale, h * this.scale, w * this.scale);
			}
		}
	}
	else
	{
		this.boundingBox = this.bounds.clone();
		
		var s = this.scale;
		var w = this.bounds.width / s;
		var h = this.bounds.height / s;
		
		// Updates the foreignObject and table bounds
		fo.setAttribute('width', w);
		fo.setAttribute('height', h);
		table.style.width = w + 'px';
		table.style.height = h + 'px';
		
		// Updates the bounds of the background node in Webkit
		if (this.backgroundNode != null)
		{
			this.backgroundNode.setAttribute('width', table.clientWidth);
			this.backgroundNode.setAttribute('height', table.offsetHeight);
		}
		
		// Must use translate instead of x- and y-attribute on FO for iOS
		tr = 'scale(' + s + ') translate(' + (this.bounds.x / s) +
			' ' + (this.bounds.y / s) + ')';

		if (!this.wrap)
		{
			var td = table.firstChild.firstChild.firstChild;
			td.style.whiteSpace = 'nowrap';
		}
	}
	
	group.setAttribute('transform', tr);
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxText.prototype.createSvg = function()
{
	// Creates a group so that shapes inside are rendered properly, if this is
	// a text node then the background rectangle is not rendered in Webkit.
	var node = document.createElementNS(mxConstants.NS_SVG, 'g');

	var uline = this.isStyleSet(mxConstants.FONT_UNDERLINE) ? 'underline' : 'none';
	var weight = this.isStyleSet(mxConstants.FONT_BOLD) ? 'bold' : 'normal';
	var s = this.isStyleSet(mxConstants.FONT_ITALIC) ? 'italic' : null;

	// Underline is not implemented in FF, see
	// https://bugzilla.mozilla.org/show_bug.cgi?id=317196
	node.setAttribute('text-decoration', uline);
	node.setAttribute('font-family', this.family);
	node.setAttribute('font-weight', weight);
	node.setAttribute('font-size', Math.round(this.size * this.scale) + 'px');
	node.setAttribute('fill', this.color);
	var align = (this.align == mxConstants.ALIGN_RIGHT) ? 'end' :
					(this.align == mxConstants.ALIGN_CENTER) ? 'middle' :
					'start';
	node.setAttribute('text-anchor', align);
	
	if (s != null)
	{
		node.setAttribute('font-style', s);
	}

	// Adds a rectangle for the background color
	if (this.background != null || this.border != null)
	{
		this.backgroundNode = document.createElementNS(mxConstants.NS_SVG, 'rect');
		this.backgroundNode.setAttribute('shape-rendering', 'crispEdges');

		if (this.background != null)
		{
			this.backgroundNode.setAttribute('fill', this.background);
		}
		else
		{
			this.backgroundNode.setAttribute('fill', 'none');
		}
		
		if (this.border != null)
		{
			this.backgroundNode.setAttribute('stroke', this.border);
		}
		else
		{
			this.backgroundNode.setAttribute('stroke', 'none');
		}
	}
	
	this.updateSvgValue(node);
	
	return node;
};

/**
 * Updates the text represented by the SVG DOM nodes.
 */
mxText.prototype.updateSvgValue = function(node)
{
	if (this.currentValue != this.value)
	{
		// Removes all existing children
		while (node.firstChild != null)
		{
			node.removeChild(node.firstChild);
		}
		
		if (this.value != null)
		{
			// Adds tspan elements for the lines
			var uline = this.isStyleSet(mxConstants.FONT_UNDERLINE) ? 'underline' : 'none';
			var lines = this.value.split('\n');
			
			// Workaround for empty lines breaking the return value of getBBox
			// for the enclosing g element so we avoid adding empty lines
			// but still count them as a linefeed
			this.textNodes = new Array(lines.length);
			
		 	for (var i = 0; i < lines.length; i++)
		 	{
		 		if (!this.isEmptyString(lines[i]))
		 		{
			 		var tspan = this.createSvgSpan(lines[i]);
					node.appendChild(tspan);
					this.textNodes[i] = tspan;
					
					// Requires either 'inherit' in Webkit or explicit setting
					// to work in Webkit and IE9 standards mode. Both, inherit
					// and underline do not work in FF. This is a known bug in
					// FF (see above).
			 		tspan.setAttribute('text-decoration', uline);
		 		}
		 		else
		 		{
		 			this.textNodes[i] = null;
		 		}
			}
		}
		
		this.currentValue = this.value;
	}
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.redrawSvg = function()
{
	if (this.node.nodeName == 'foreignObject')
	{
		this.redrawHtml();
		
		return;
	}
	
	var fontSize = Math.round(this.size * this.scale);
	
	if (fontSize <= 0)
	{
		this.node.setAttribute('visibility', 'hidden');
	}
	else
	{
		this.node.removeAttribute('visibility');
	}
		
	this.updateSvgValue(this.node);
	this.node.setAttribute('font-size', fontSize + 'px');

	if (this.opacity != null)
	{
		// Improves opacity performance in Firefox
		this.node.setAttribute('fill-opacity', this.opacity/100);
		this.node.setAttribute('stroke-opacity', this.opacity/100);
	}

	// Workaround to avoid the use of getBBox to find the size
	// of the label. A temporary HTML table is created instead.
	var previous = this.value;
	var table = this.createHtmlTable();
		
	// Makes sure the table is updated and replaces all HTML entities 
	this.lastValue = null;
	this.value = mxUtils.htmlEntities(this.value, false);
	this.updateHtmlTable(table);
	
	// Adds the table to the DOM to find the actual size
	document.body.appendChild(table);
	var w = table.offsetWidth * this.scale;
	var h = table.offsetHeight * this.scale;
	
	// Cleans up the DOM and restores the original value
	table.parentNode.removeChild(table);
	this.value = previous;

	// Sets the bounding box for the unclipped case so that
	// the full background can be painted using it, the initial
	// value for dx and the +4 in the width below are for
	// error correction of the HTML and SVG text width
	var dx = 2 * this.scale;
	
	if (this.align == mxConstants.ALIGN_CENTER)
	{
		dx += w / 2;
	}
	else if (this.align == mxConstants.ALIGN_RIGHT)
	{
		dx += w;
	}

	var dy = Math.round(fontSize * 1.3);
	var childCount = this.node.childNodes.length;
	var lineCount = (this.textNodes != null) ? this.textNodes.length : 0;
	
	if (this.backgroundNode != null)
	{
		childCount--;
	}
	
	var x = this.bounds.x;
	var y = this.bounds.y;

	x += (this.align == mxConstants.ALIGN_RIGHT) ?
		((this.horizontal) ? this.bounds.width : this.bounds.height)-
		this.spacingRight * this.scale :
		(this.align == mxConstants.ALIGN_CENTER) ?
			this.spacingLeft * this.scale +
			(((this.horizontal) ? this.bounds.width : this.bounds.height) -
			this.spacingLeft * this.scale - this.spacingRight * this.scale) / 2 :
			this.spacingLeft * this.scale + 1;

	// Makes sure the alignment is like in VML and HTML
	y += (this.valign == mxConstants.ALIGN_BOTTOM) ?
			((this.horizontal) ? this.bounds.height : this.bounds.width) -
			(lineCount - 1) * dy - this.spacingBottom * this.scale - 4 :
			(this.valign == mxConstants.ALIGN_MIDDLE) ?
				(this.spacingTop * this.scale +
				((this.horizontal) ? this.bounds.height : this.bounds.width) -
				this.spacingBottom * this.scale -
				(lineCount - 1.5) * dy) / 2 :
				this.spacingTop * this.scale + dy;
	
	if (this.overflow == 'fill')
	{
		if (this.align == mxConstants.ALIGN_CENTER)
		{
			x = Math.max(this.bounds.x + w / 2, x);	
		}
		
		y = Math.max(this.bounds.y + fontSize, y);
		
		this.boundingBox = new mxRectangle(x - dx, y - dy,
				w + 4 * this.scale, h + 1 * this.scale);
		this.boundingBox.x = Math.min(this.bounds.x, this.boundingBox.x);
		this.boundingBox.y = Math.min(this.bounds.y, this.boundingBox.y);
		this.boundingBox.width = Math.max(this.bounds.width, this.boundingBox.width);
		this.boundingBox.height = Math.max(this.bounds.height, this.boundingBox.height);
	}
	else
	{
		this.boundingBox = new mxRectangle(x - dx, y - dy,
			w + 4 * this.scale, h + 1 * this.scale);
	}

	if (!this.horizontal)
	{
		var cx = this.bounds.x + this.bounds.width / 2;
		var cy = this.bounds.y + this.bounds.height / 2;
		
		var offsetX = (this.bounds.width - this.bounds.height) / 2;
		var offsetY = (this.bounds.height - this.bounds.width) / 2;
		
		this.node.setAttribute('transform',
			'rotate(' + this.verticalTextDegree + ' ' + cx + ' ' + cy + ') ' +
			'translate(' + (-offsetY) + ' ' + (-offsetX) + ')');
	}

	// TODO: Font-shadow
	this.redrawSvgTextNodes(x, y, dy);

	/*
	 * FIXME: Bounding box is not rotated. This seems to be a problem for
	 * all vertical text boxes. Workaround is in mxImageExport.
	if (!this.horizontal)
	{
		var b = this.bounds.y + this.bounds.height;
		var cx = this.boundingBox.getCenterX() - this.bounds.x;
		var cy = this.boundingBox.getCenterY() - this.bounds.y;
		
		var y = b - cx - this.bounds.height / 2;
		this.boundingBox.x = this.bounds.x + cy - this.boundingBox.width / 2;
		this.boundingBox.y = y;
	}
	*/
	
	// Updates the bounds of the background node if one exists
	if (this.value.length > 0 && this.backgroundNode != null && this.node.firstChild != null)
	{
		if (this.node.firstChild != this.backgroundNode)
		{
			this.node.insertBefore(this.backgroundNode, this.node.firstChild);
		}

		// FIXME: For larger font sizes the linespacing between HTML and SVG
		// seems to be different and hence the bounding box isn't accurate.
		// Also in Firefox the background box is slighly offset.
		this.backgroundNode.setAttribute('x', this.boundingBox.x + this.scale / 2 + 1 * this.scale);
		this.backgroundNode.setAttribute('y', this.boundingBox.y + this.scale / 2 + 2 * this.scale - this.labelPadding);
		this.backgroundNode.setAttribute('width', this.boundingBox.width - this.scale - 2 * this.scale);
		this.backgroundNode.setAttribute('height', this.boundingBox.height - this.scale);

		var strokeWidth = Math.round(Math.max(1, this.scale));
		this.backgroundNode.setAttribute('stroke-width', strokeWidth);
	}
	
	// Adds clipping and updates the bounding box
	// NOTE: Clipping is broken in latest Chrome - no longer possible to move stuff if used
	if (!mxClient.IS_GC)
	{
		if (this.clipped && this.bounds.width > 0 && this.bounds.height > 0)
		{
			this.boundingBox = this.bounds.clone();
	
			if (!this.horizontal)
			{
				this.boundingBox.width = this.bounds.height;
				this.boundingBox.height = this.bounds.width;
			}
			
			x = this.bounds.x;
			y = this.bounds.y;
			
			if (this.horizontal)
			{
				w = this.bounds.width;
				h = this.bounds.height;
			}
			else
			{
				w = this.bounds.height;
				h = this.bounds.width;	
			}
			
			var clip = this.getSvgClip(this.node.ownerSVGElement, x, y, w, h);
			
			if (clip != this.clip)
			{
				this.releaseSvgClip();
				this.clip = clip;
				clip.refCount++;
			}
				
			this.node.setAttribute('clip-path', 'url(#' + clip.getAttribute('id') + ')');
		}
		else
		{
			this.releaseSvgClip();
			this.node.removeAttribute('clip-path');
		}
	}
};

/**
 * Function: redrawSvgTextNodes
 * 
 * Hook to update the position of the SVG text nodes.
 */
mxText.prototype.redrawSvgTextNodes = function(x, y, dy)
{
	if (this.textNodes != null)
	{
		var currentY = y;
		
		for (var i = 0; i < this.textNodes.length; i++)
		{
			var node = this.textNodes[i];
			
			if (node != null)
			{
				node.setAttribute('x', x);
				node.setAttribute('y', currentY);
	
				// Triggers an update in Firefox 1.5.0.x (don't add a semicolon!)
				node.setAttribute('style', 'pointer-events: all');
			}
			
			currentY += dy;
		}
	}
};

/**
 * Function: releaseSvgClip
 * 
 * Releases the given SVG clip removing it from the DOM if required.
 */
mxText.prototype.releaseSvgClip = function()
{
	if (this.clip != null)
	{
		this.clip.refCount--;
		
		if (this.clip.refCount == 0)
		{
			this.clip.parentNode.removeChild(this.clip);
		}
		
		this.clip = null;
	}
};

/**
 * Function: getSvgClip
 * 
 * Returns a new or existing SVG clip path which is a descendant of the given
 * SVG node with a unique ID. 
 */
mxText.prototype.getSvgClip = function(svg, x, y, w, h)
{
	x = Math.round(x);
	y = Math.round(y);
	w = Math.round(w);
	h = Math.round(h);
	
	var id = 'mx-clip-' + x + '-' + y + '-' + w + '-' + h;

	// Quick access
	if (this.clip != null && this.clip.ident == id)
	{
		return this.clip;
	}
	
	var counter = 0;
	var tmp = id + '-' + counter;
	var clip = document.getElementById(tmp);
	
	// Tries to find an existing clip in the given SVG
	while (clip != null)
	{
		if (clip.ownerSVGElement == svg)
		{
			return clip;
		}
		
		counter++;
		tmp = id + '-' + counter;
		clip = document.getElementById(tmp);
	}
	
	// Creates a new clip node and adds it to the DOM
	if (clip != null)
	{
		clip = clip.cloneNode(true);
		counter++;
	}
	else
	{
		clip = document.createElementNS(mxConstants.NS_SVG, 'clipPath');
		
		var rect = document.createElementNS(mxConstants.NS_SVG, 'rect');
		rect.setAttribute('x', x);
		rect.setAttribute('y', y);
		rect.setAttribute('width', w);
		rect.setAttribute('height', h);
		
		clip.appendChild(rect);
	}
	
	clip.setAttribute('id', id + '-' + counter);
	clip.ident = id; // For quick access above
	svg.appendChild(clip);
	clip.refCount = 0;
	
	return clip;
};

/**
 * Function: isEmptyString
 *
 * Returns true if the given string is empty or
 * contains only whitespace.
 */
mxText.prototype.isEmptyString = function(text)
{
	return text.replace(/ /g, '').length == 0;
};

/**
 * Function: createSvgSpan
 *
 * Creats an SVG tspan node for the given text.
 */
mxText.prototype.createSvgSpan = function(text)
{
	// Creates a text node since there is no enclosing text element but
	// rather a group, which is required to render the background rectangle
	// in Webkit. This can be changed to tspan if the enclosing node is
	// a text but this leads to an hidden background in Webkit.
	var node = document.createElementNS(mxConstants.NS_SVG, 'text');
	// Needed to preserve multiple white spaces, but ignored in IE9 plus white-space:pre
	// is ignored in HTML output for VML, so better to not use this for SVG labels
	// node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
	// Alternative idea is to replace all spaces with &nbsp; to fix HTML in IE, but
	// IE9/10 with SVG will still ignore the xml:space preserve tag as discussed here:
	// http://stackoverflow.com/questions/8086292/significant-whitespace-in-svg-embedded-in-html
	// Could replace spaces with &nbsp; in text but HTML tags must be scaped first.
	mxUtils.write(node, text);
	
	return node;
};

/**
 * Function: destroy
 *
 * Extends destroy to remove any allocated SVG clips.
 */
mxText.prototype.destroy = function()
{
	this.releaseSvgClip();
	mxShape.prototype.destroy.apply(this, arguments);
};
