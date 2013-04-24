/**
 * $Id: mxSvgCanvas2D.js,v 1.46 2013/04/23 14:22:50 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxSvgCanvas2D
 *
 * Extends <mxAbstractCanvas2D> to implement a canvas for SVG. This canvas writes all
 * calls as SVG output to the given SVG root node.
 * 
 * Open issues:
 * - Opacity for transformed foreignObjects in Chrome.
 * - Gradient IDs must be refactored for fragments.
 * 
 * (code)
 * var svgDoc = mxUtils.createXmlDocument();
 * var root = (svgDoc.createElementNS != null) ?
 * 		svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
 * 
 * if (svgDoc.createElementNS == null)
 * {
 *   root.setAttribute('xmlns', mxConstants.NS_SVG);
 * }
 * 
 * var bounds = graph.getGraphBounds();
 * root.setAttribute('width', (bounds.x + bounds.width + 4) + 'px');
 * root.setAttribute('height', (bounds.y + bounds.height + 4) + 'px');
 * root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
 * root.setAttribute('version', '1.1');
 * 
 * svgDoc.appendChild(root);
 * 
 * var svgCanvas = new mxSvgCanvas2D(root);
 * (end)
 * 
 * A description of the public API is available in <mxXmlCanvas2D>.
 * 
 * Constructor: mxSvgCanvas2D
 *
 * Constructs a new SVG canvas.
 * 
 * Parameters:
 * 
 * root - SVG container for the output.
 * styleEnabled - Optional boolean that specifies if a style section should be
 * added. The style section sets the default font-size, font-family and
 * stroke-miterlimit globally. Default is false.
 */
function mxSvgCanvas2D(root, styleEnabled)
{
	mxAbstractCanvas2D.call(this);

	/**
	 * Variable: root
	 * 
	 * Reference to the container for the SVG content.
	 */
	this.root = root;

	/**
	 * Variable: gradients
	 * 
	 * Local cache of gradients for quick lookups.
	 */
	this.gradients = [];

	/**
	 * Variable: defs
	 * 
	 * Reference to the defs section of the SVG document. Only for export.
	 */
	this.defs = null;
	
	/**
	 * Variable: styleEnabled
	 * 
	 * Stores the value of styleEnabled passed to the constructor.
	 */
	this.styleEnabled = (styleEnabled != null) ? styleEnabled : false;
	
	var svg = null;
	
	// Adds optional defs section for export
	if (root.ownerDocument != document)
	{
		var node = root;

		// Finds owner SVG element in XML DOM
		while (node != null && node.nodeName != 'svg')
		{
			node = node.parentNode;
		}
		
		svg = node;
	}

	if (svg != null)
	{
		// Tries to get existing defs section
		var tmp = svg.getElementsByTagName('defs');
		
		if (tmp.length > 0)
		{
			this.defs = svg.getElementsByTagName('defs')[0];
		}
		
		// Adds defs section if none exists
		if (this.defs == null)
		{
			this.defs = this.createElement('defs');
			
			if (svg.firstChild != null)
			{
				svg.insertBefore(this.defs, svg.firstChild);
			}
			else
			{
				svg.appendChild(this.defs);
			}
		}

		// Adds stylesheet
		if (this.styleEnabled)
		{
			this.defs.appendChild(this.createStyle());
		}
	}
};

/**
 * Extends mxAbstractCanvas2D
 */
mxUtils.extend(mxSvgCanvas2D, mxAbstractCanvas2D);

/**
 * Variable: path
 * 
 * Holds the current DOM node.
 */
mxSvgCanvas2D.prototype.node = null;

/**
 * Variable: matchHtmlAlignment
 * 
 * Specifies if plain text output should match HTML alignment. Defaul is true.
 */
mxSvgCanvas2D.prototype.matchHtmlAlignment = true;

/**
 * Variable: textEnabled
 * 
 * Specifies if text output should be enabled. Default is true.
 */
mxSvgCanvas2D.prototype.textEnabled = true;

/**
 * Variable: foEnabled
 * 
 * Specifies if use of foreignObject for HTML markup is allowed. Default is true.
 */
mxSvgCanvas2D.prototype.foEnabled = true;

/**
 * Variable: foAltText
 * 
 * Specifies the fallback text for unsupported foreignObjects in exported
 * documents. Default is '[Object]'. If this is set to null then no fallback
 * text is added to the exported document.
 */
mxSvgCanvas2D.prototype.foAltText = '[Object]';

/**
 * Variable: strokeTolerance
 * 
 * Adds transparent paths for strokes.
 */
mxSvgCanvas2D.prototype.strokeTolerance = 0;

/**
 * Variable: refCount
 * 
 * Local counter for references in SVG export.
 */
mxSvgCanvas2D.prototype.refCount = 0;

/**
 * Variable: blockImagePointerEvents
 * 
 * Specifies if a transparent rectangle should be added on top of images to absorb
 * all pointer events. Default is false. This is only needed in Firefox to disable
 * control-clicks on images.
 */
mxSvgCanvas2D.prototype.blockImagePointerEvents = false;

/**
 * Function: reset
 * 
 * Returns any offsets for rendering pixels.
 */
mxSvgCanvas2D.prototype.reset = function()
{
	mxAbstractCanvas2D.prototype.reset.apply(this, arguments);
	this.gradients = [];
};

/**
 * Function: createStyle
 * 
 * Creates the optional style section.
 */
mxSvgCanvas2D.prototype.createStyle = function(x)
{
	var style = this.createElement('style');
	style.setAttribute('type', 'text/css');
	mxUtils.write(style, 'svg{font-family:' + mxConstants.DEFAULT_FONTFAMILY +
			';font-size:' + mxConstants.DEFAULT_FONTSIZE +
			';fill:none;stroke-miterlimit:10}');
	
	return style;
};

/**
 * Function: createElement
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.createElement = function(tagName, namespace)
{
	if (this.root.ownerDocument.createElementNS != null)
	{
		return this.root.ownerDocument.createElementNS(namespace || mxConstants.NS_SVG, tagName);
	}
	else
	{
		var elt = this.root.ownerDocument.createElement(tagName);
		
		if (namespace != null)
		{
			elt.setAttribute('xmlns', namespace);
		}
		
		return elt;
	}
};

/**
 * Function: getAlternateContent
 * 
 * Returns the alternate content for the given foreignObject.
 */
mxSvgCanvas2D.prototype.createAlternateContent = function(fo, x, y, w, h, str, align, valign, wrap, format, fill, clip, rotation)
{
	if (this.foAltText != null)
	{
		var s = this.state;
		var alt = this.createElement('text');
		alt.setAttribute('x', Math.round(w / 2));
		alt.setAttribute('y', Math.round((h + s.fontSize) / 2));
		alt.setAttribute('fill', s.fontColor || 'black');
		alt.setAttribute('text-anchor', 'middle');
		alt.setAttribute('font-size', Math.round(s.fontSize) + 'px');
		alt.setAttribute('font-family', s.fontFamily);
		
		if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
		{
			alt.setAttribute('font-weight', 'bold');
		}
		
		if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
		{
			alt.setAttribute('font-style', 'italic');
		}
		
		if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
		{
			alt.setAttribute('text-decoration', 'underline');
		}
		
		mxUtils.write(alt, this.foAltText);
		
		return alt;
	}
	else
	{
		return null;
	}
};

/**
 * Function: createGradientId
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.createGradientId = function(start, end, alpha1, alpha2, direction)
{
	// Removes illegal characters from gradient ID
	if (start.charAt(0) == '#')
	{
		start = start.substring(1);
	}
	
	if (end.charAt(0) == '#')
	{
		end = end.substring(1);
	}
	
	// Workaround for gradient IDs not working in Safari 5 / Chrome 6
	// if they contain uppercase characters
	start = start.toLowerCase() + '-' + alpha1;
	end = end.toLowerCase() + '-' + alpha2;

	// Wrong gradient directions possible?
	var dir = null;
	
	if (direction == null || direction == mxConstants.DIRECTION_SOUTH)
	{
		dir = 's';
	}
	else if (direction == mxConstants.DIRECTION_EAST)
	{
		dir = 'e';
	}
	else
	{
		var tmp = start;
		start = end;
		end = tmp;
		
		if (direction == mxConstants.DIRECTION_NORTH)
		{
			dir = 's';
		}
		else if (direction == mxConstants.DIRECTION_WEST)
		{
			dir = 'e';
		}
	}
	
	return 'mx-gradient-' + start + '-' + end + '-' + dir;
};

/**
 * Function: getSvgGradient
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.getSvgGradient = function(start, end, alpha1, alpha2, direction)
{
	var id = this.createGradientId(start, end, alpha1, alpha2, direction);
	var gradient = this.gradients[id];
	
	if (gradient == null)
	{
		var svg = this.root.ownerSVGElement;

		var counter = 0;
		var tmpId = id + '-' + counter;

		if (svg != null)
		{
			gradient = svg.ownerDocument.getElementById(tmpId);
			
			while (gradient != null && gradient.ownerSVGElement != svg)
			{
				tmpId = id + '-' + counter++;
				gradient = svg.ownerDocument.getElementById(tmpId);
			}
		}
		else
		{
			// Uses shorter IDs for export
			tmpId = 'id' + (++this.refCount);
		}
		
		if (gradient == null)
		{
			gradient = this.createSvgGradient(start, end, alpha1, alpha2, direction);
			gradient.setAttribute('id', tmpId);
			
			if (this.defs != null)
			{
				this.defs.appendChild(gradient);
			}
			else
			{
				svg.appendChild(gradient);
			}
		}

		this.gradients[id] = gradient;
	}

	return gradient.getAttribute('id');
};

/**
 * Function: createSvgGradient
 * 
 * Creates the given SVG gradient.
 */
mxSvgCanvas2D.prototype.createSvgGradient = function(start, end, alpha1, alpha2, direction)
{
	var gradient = this.createElement('linearGradient');
	gradient.setAttribute('x1', '0%');
	gradient.setAttribute('y1', '0%');
	gradient.setAttribute('x2', '0%');
	gradient.setAttribute('y2', '0%');
	
	if (direction == null || direction == mxConstants.DIRECTION_SOUTH)
	{
		gradient.setAttribute('y2', '100%');
	}
	else if (direction == mxConstants.DIRECTION_EAST)
	{
		gradient.setAttribute('x2', '100%');
	}
	else if (direction == mxConstants.DIRECTION_NORTH)
	{
		gradient.setAttribute('y1', '100%');
	}
	else if (direction == mxConstants.DIRECTION_WEST)
	{
		gradient.setAttribute('x1', '100%');
	}
	
	var op = (alpha1 < 1) ? ';stop-opacity:' + alpha1 : '';
	
	var stop = this.createElement('stop');
	stop.setAttribute('offset', '0%');
	stop.setAttribute('style', 'stop-color:' + start + op);
	gradient.appendChild(stop);
	
	op = (alpha2 < 1) ? ';stop-opacity:' + alpha2 : '';
	
	stop = this.createElement('stop');
	stop.setAttribute('offset', '100%');
	stop.setAttribute('style', 'stop-color:' + end + op);
	gradient.appendChild(stop);
	
	return gradient;
};

/**
 * Function: addNode
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.addNode = function(filled, stroked)
{
	var node = this.node;
	var s = this.state;

	if (node != null)
	{
		if (node.nodeName == 'path')
		{
			// Checks if the path is not empty
			if (this.path != null && this.path.length > 0)
			{
				node.setAttribute('d', this.path.join(' '));
			}
			else
			{
				return;
			}
		}

		if (filled && s.fillColor != null)
		{
			this.updateFill();
		}
		else if (!this.styleEnabled)
		{
			// Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=814952
			if (node.nodeName == 'ellipse' && mxClient.IS_NS && !mxClient.IS_GC && !mxClient.IS_SF)
			{
				node.setAttribute('fill', 'transparent');
			}
			else
			{
				node.setAttribute('fill', 'none');
			}
			
			// Sets the actual filled state for stroke tolerance
			filled = false;
		}
		
		if (stroked && s.strokeColor != null)
		{
			this.updateStroke();
		}
		else if (!this.styleEnabled)
		{
			node.setAttribute('stroke', 'none');
		}
		
		if (s.transform != null && s.transform.length > 0)
		{
			node.setAttribute('transform', s.transform);
		}
		
		if (s.shadow)
		{
			this.root.appendChild(this.createShadow(node));
		}
		
		// Adds stroke tolerance
		if (this.strokeTolerance > 0 && !filled)
		{
			this.root.appendChild(this.createTolerance(node));
		}

		// Adds pointer events
		if (this.pointerEvents && (node.nodeName != 'path' ||
			this.path[this.path.length - 1] == this.closeOp))
		{
			node.setAttribute('pointer-events', 'all');
		}
		
		// LATER: Update existing DOM for performance
		this.root.appendChild(node);
	}
};

/**
 * Function: updateFill
 * 
 * Transfers the stroke attributes from <state> to <node>.
 */
mxSvgCanvas2D.prototype.updateFill = function()
{
	var s = this.state;
	
	if (s.alpha < 1)
	{
		this.node.setAttribute('fill-opacity', s.alpha);
	}
	
	if (s.fillColor != null)
	{
		if (s.gradientColor != null)
		{
			var id = this.getSvgGradient(s.fillColor, s.gradientColor, s.fillAlpha, s.gradientAlpha, s.gradientDirection);
			this.node.setAttribute('fill', 'url(#' + id + ')');
		}
		else
		{
			this.node.setAttribute('fill', s.fillColor.toLowerCase());
		}
	}
};

/**
 * Function: updateStroke
 * 
 * Transfers the stroke attributes from <state> to <node>.
 */
mxSvgCanvas2D.prototype.updateStroke = function()
{
	var s = this.state;

	this.node.setAttribute('stroke', s.strokeColor.toLowerCase());
	
	if (s.alpha < 1)
	{
		this.node.setAttribute('stroke-opacity', s.alpha);
	}
	
	// Sets the stroke properties (1 is default in SVG)
	var sw = Math.max(1, this.format(s.strokeWidth * s.scale));
	
	if (sw != 1)
	{
		this.node.setAttribute('stroke-width', sw);
	}
	
	if (this.node.nodeName == 'path')
	{
		this.updateStrokeAttributes();
	}
	
	if (s.dashed)
	{
		this.node.setAttribute('stroke-dasharray', this.createDashPattern(sw));
	}
};

/**
 * Function: updateStrokeAttributes
 * 
 * Transfers the stroke attributes from <state> to <node>.
 */
mxSvgCanvas2D.prototype.updateStrokeAttributes = function()
{
	var s = this.state;
	
	// Linejoin miter is default in SVG
	if (s.lineJoin != null && s.lineJoin != 'miter')
	{
		this.node.setAttribute('stroke-linejoin', s.lineJoin);
	}
	
	if (s.lineCap != null)
	{
		// flat is called butt in SVG
		var value = s.lineCap;
		
		if (value == 'flat')
		{
			value = 'butt';
		}
		
		// Linecap butt is default in SVG
		if (value != 'butt')
		{
			this.node.setAttribute('stroke-linecap', value);
		}
	}
	
	// Miterlimit 10 is default in our document
	if (s.miterLimit != null && (!this.styleEnabled || s.miterLimit != 10))
	{
		this.node.setAttribute('stroke-miterlimit', s.miterLimit);
	}
};

/**
 * Function: createDashPattern
 * 
 * Creates the SVG dash pattern for the given state.
 */
mxSvgCanvas2D.prototype.createDashPattern = function(scale)
{
	var s = this.state;
	var dash = s.dashPattern.split(' ');
	var pat = [];
	
	if (dash.length > 0)
	{
		for (var i = 0; i < dash.length; i++)
		{
			pat[i] = Number(dash[i]) * scale;
		}
	}
	
	return pat.join(' ');
};

/**
 * Function: createTolerance
 * 
 * Creates a hit detection tolerance shape for the given node.
 */
mxSvgCanvas2D.prototype.createTolerance = function(node)
{
	var tol = node.cloneNode(true);
	var sw = parseFloat(tol.getAttribute('stroke-width') || 1) + this.strokeTolerance;
	tol.setAttribute('pointer-events', 'stroke');
	tol.setAttribute('visibility', 'hidden');
	tol.removeAttribute('stroke-dasharray');
	tol.setAttribute('stroke-width', sw);
	tol.setAttribute('fill', 'none');
	
	// Workaround for Opera ignoring the visiblity attribute above while
	// other browsers need a stroke color to perform the hit-detection but
	// do not ignore the visibility attribute. Side-effect is that Opera's
	// hit detection for horizontal/vertical edges seems to ignore the tol.
	tol.setAttribute('stroke', (mxClient.IS_OP) ? 'none' : 'white');
	
	return tol;
};

/**
 * Function: createShadow
 * 
 * Creates a shadow for the given node.
 */
mxSvgCanvas2D.prototype.createShadow = function(node)
{
	var shadow = node.cloneNode(true);
	var s = this.state;
	
	if (shadow.getAttribute('fill') != 'none')
	{
		shadow.setAttribute('fill', s.shadowColor);
	}
	
	if (shadow.getAttribute('stroke') != 'none')
	{
		shadow.setAttribute('stroke', s.shadowColor);
	}

	shadow.setAttribute('transform', 'translate(' + this.format(s.shadowDx * s.scale) +
		',' + this.format(s.shadowDy * s.scale) + ')' + (s.transform || ''));
	shadow.setAttribute('opacity', s.shadowAlpha);
	
	return shadow;
};

/**
 * Function: rotate
 * 
 * Sets the rotation of the canvas. Note that rotation cannot be concatenated.
 */
mxSvgCanvas2D.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
	if (theta != 0 || flipH || flipV)
	{
		var s = this.state;
		cx += s.dx;
		cy += s.dy;
	
		cx *= s.scale;
		cy *= s.scale;

		s.transform = s.transform || '';
		
		// This implementation uses custom scale/translate and built-in rotation
		// Rotation state is part of the AffineTransform in state.transform
		if (flipH && flipV)
		{
			theta += 180;
		}
		else if (flipH ^ flipV)
		{
			var tx = (flipH) ? cx : 0;
			var sx = (flipH) ? -1 : 1;
	
			var ty = (flipV) ? cy : 0;
			var sy = (flipV) ? -1 : 1;
	
			s.transform += 'translate(' + this.format(tx) + ',' + this.format(ty) + ')' +
				'scale(' + this.format(sx) + ',' + this.format(sy) + ')' +
				'translate(' + this.format(-tx) + ',' + this.format(-ty) + ')';
		}
		
		if (flipH ? !flipV : flipV)
		{
			theta *= -1;
		}
		
		if (theta != 0)
		{
			s.transform += 'rotate(' + this.format(theta) + ',' + this.format(cx) + ',' + this.format(cy) + ')';
		}
		
		s.rotation = s.rotation + theta;
		s.rotationCx = cx;
		s.rotationCy = cy;
	}
};

/**
 * Function: begin
 * 
 * Extends superclass to create path.
 */
mxSvgCanvas2D.prototype.begin = function()
{
	mxAbstractCanvas2D.prototype.begin.apply(this, arguments);
	this.node = this.createElement('path');
};

/**
 * Function: rect
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.rect = function(x, y, w, h)
{
	var s = this.state;
	var n = this.createElement('rect');
	n.setAttribute('x', this.format((x + s.dx) * s.scale));
	n.setAttribute('y', this.format((y + s.dy) * s.scale));
	n.setAttribute('width', this.format(w * s.scale));
	n.setAttribute('height', this.format(h * s.scale));
	
	this.node = n;
};

/**
 * Function: roundrect
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.roundrect = function(x, y, w, h, dx, dy)
{
	this.rect(x, y, w, h);
	
	if (dx > 0)
	{
		this.node.setAttribute('rx', this.format(dx * this.state.scale));
	}
	
	if (dy > 0)
	{
		this.node.setAttribute('ry', this.format(dy * this.state.scale));
	}
};

/**
 * Function: ellipse
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.ellipse = function(x, y, w, h)
{
	var s = this.state;
	var n = this.createElement('ellipse');
	// No rounding for consistent output with 1.x
	n.setAttribute('cx', Math.round((x + w / 2 + s.dx) * s.scale));
	n.setAttribute('cy', Math.round((y + h / 2 + s.dy) * s.scale));
	n.setAttribute('rx', w / 2 * s.scale);
	n.setAttribute('ry', h / 2 * s.scale);
	this.node = n;
};

/**
 * Function: image
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.converter.convert(src);
	
	// LATER: Add option for embedding images as base64.
	aspect = (aspect != null) ? aspect : true;
	flipH = (flipH != null) ? flipH : false;
	flipV = (flipV != null) ? flipV : false;
	
	var s = this.state;
	x += s.dx;
	y += s.dy;
	
	var node = this.createElement('image');
	node.setAttribute('x', this.format(x * s.scale));
	node.setAttribute('y', this.format(y * s.scale));
	node.setAttribute('width', this.format(w * s.scale));
	node.setAttribute('height', this.format(h * s.scale));
	
	// Workaround for implicit namespace handling in HTML5 export
	if (node.setAttributeNS == null || this.root.ownerDocument != document)
	{
		node.setAttribute('xlink:href', src);
	}
	else
	{
		node.setAttributeNS(mxConstants.NS_XLINK, 'href', src);
	}
	
	if (!aspect)
	{
		node.setAttribute('preserveAspectRatio', 'none');
	}

	if (s.alpha < 1)
	{
		node.setAttribute('opacity', s.alpha);
	}
	
	var tr = this.state.transform || '';
	
	if (flipH || flipV)
	{
		var sx = 1;
		var sy = 1;
		var dx = 0;
		var dy = 0;
		
		if (flipH)
		{
			sx = -1;
			dx = -w - 2 * x;
		}
		
		if (flipV)
		{
			sy = -1;
			dy = -h - 2 * y;
		}
		
		// Adds image tansformation to existing transform
		tr += 'scale(' + sx + ',' + sy + ')translate(' + dx + ',' + dy + ')';
	}

	if (tr.length > 0)
	{
		node.setAttribute('transform', tr);
	}
	
	this.root.appendChild(node);
	
	// Disables control-clicks on images in Firefox to open in new tab
	// by putting a rect in the foreground that absorbs all events and
	// disabling all pointer-events on the original image tag.
	if (this.blockImagePointerEvents)
	{
		node.setAttribute('style', 'pointer-events:none');
		
		node = this.createElement('rect');
		node.setAttribute('visibility', 'hidden');
		node.setAttribute('pointer-events', 'fill');
		node.setAttribute('x', this.format(x * s.scale));
		node.setAttribute('y', this.format(y * s.scale));
		node.setAttribute('width', this.format(w * s.scale));
		node.setAttribute('height', this.format(h * s.scale));
		this.root.appendChild(node);
	}
};

/**
 * Function: createDiv
 * 
 * Private helper function to create SVG elements
 */
mxSvgCanvas2D.prototype.createDiv = function(str, align, valign, style, fill)
{
	var s = this.state;

	// Inline block for rendering HTML background over SVG in Safari
	style = 'display:inline-block;font-size:' + Math.round(s.fontSize) + 'px;font-family:' + s.fontFamily +
		';color:' + s.fontColor + ';line-height:' + Math.round(s.fontSize * mxConstants.LINE_HEIGHT) + 'px;' + style;

	if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		style += 'font-weight:bold;';
	}

	if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		style += 'font-style:italic;';
	}
	
	if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		style += 'text-decoration:underline;';
	}
	
	if (align == mxConstants.ALIGN_CENTER)
	{
		style += 'text-align:center;';
	}
	else if (align == mxConstants.ALIGN_RIGHT)
	{
		style += 'text-align:right;';
	}

	var css = '';
	
	if (s.fontBackgroundColor != null)
	{
		css += 'background-color:' + s.fontBackgroundColor + ';';
	}
	
	if (s.fontBorderColor != null)
	{
		css += 'border:1px solid ' + s.fontBorderColor + ';';
	}
	
	var val = str;
	
	if (!mxUtils.isNode(val))
	{
		// Converts HTML entities to unicode since HTML entities are not allowed in XHTML
		var ta = document.createElement('textarea');
		ta.innerHTML = val.replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		val = ta.value;

		if (!fill)
		{
			if (css.length > 0)
			{
				val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;' + css + '">' + val + '</div>';
			}
		}
		else
		{
			style += css;
		}
	}

	// Uses DOM API where available. This cannot be used in IE9/10 to avoid
	// an opening and two (!) closing TBODY tags being added to tables.
	if (!mxClient.IS_IE && document.createElementNS)
	{
		var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
		div.setAttribute('style', style);
		
		if (mxUtils.isNode(val))
		{
			// Creates a copy for export
			if (this.root.ownerDocument != document)
			{
				div.appendChild(val.cloneNode(true));
			}
			else
			{
				div.appendChild(val);
			}
		}
		else
		{
			div.innerHTML = val;
		}
		
		return div;
	}
	else
	{
		// Serializes for export
		if (mxUtils.isNode(val) && this.root.ownerDocument != document)
		{
			val = val.outerHTML;
		}
		
		// Converts invalid tags to XHTML
		// LATER: Check for all unclosed tags
		val = val.replace(/<br>/g, '<br />').replace(/<hr>/g, '<hr />');

		// NOTE: FF 3.6 crashes if content CSS contains "height:100%"
		return mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + 
			'">' + val + '</div>').documentElement;
	}
};

/**
 * Function: text
 * 
 * Paints the given text. Possible values for format are empty string for plain
 * text and html for HTML markup. Note that HTML markup is only supported if
 * foreignObject is supported and <foEnabled> is true. (This means IE9 and later
 * does currently not support HTML text as part of shapes.)
 */
mxSvgCanvas2D.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, fill, clip, rotation)
{
	if (this.textEnabled && str != null)
	{
		rotation = (rotation != null) ? rotation : 0;
		
		var s = this.state;
		x += s.dx;
		y += s.dy;
		
		if (this.foEnabled && format == 'html')
		{
			var style = 'vertical-align:top;';
			
			if (clip)
			{
				style += 'overflow:hidden;';
				
				if (h > 0)
				{
					style += 'max-height:' + Math.round(h) + 'px;';
				}
				
				if (w > 0)
				{
					style += 'width:' + Math.round(w) + 'px;';
				}
			}
			else if (fill)
			{
				style += 'width:' + Math.round(w) + 'px;';
				
				if (h > 0)
				{
					style += 'max-height:' + Math.round(h) + 'px;';
				}
			}
			
			if (wrap && w > 0)
			{
				if (!clip)
				{
					style += 'width:' + Math.round(w) + 'px;';
				}
				
				style += 'white-space:normal;';
			}
			else
			{
				style += 'white-space:nowrap;';
			}
			
			// Uses outer group for opacity and transforms to
			// fix rendering order in Chrome
			var group = this.createElement('g');
			
			if (s.alpha < 1)
			{
				group.setAttribute('opacity', s.alpha);
			}

			var fo = this.createElement('foreignObject');
			fo.setAttribute('pointer-events', 'all');
			
			var div = this.createDiv(str, align, valign, style, fill);
			
			// Ignores invalid XHTML labels
			if (div == null)
			{
				return;
			}
			
			group.appendChild(fo);
			this.root.appendChild(group);
			
			// Code that depends on the size which is computed after
			// the element was added to the DOM.
			var ow = 0;
			
			if (mxClient.IS_IE && !mxClient.IS_SVG)
			{
				// Handles non-standard namespace for getting size in IE
				var clone = document.createElement('div');
				
				clone.style.cssText = div.getAttribute('style');
				clone.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
				clone.style.visibility = 'hidden';
				clone.innerHTML = (mxUtils.isNode(str)) ? str.outerHTML : str;

				document.body.appendChild(clone);
				ow = clone.offsetWidth;
				
				// Computes max-height in quirks
				if (mxClient.IS_QUIRKS && h > 0 && clip)
				{
					// +2 to show background and border are visible
					h = Math.min(h, clone.offsetHeight + 2);
				}
				else
				{
					h = clone.offsetHeight;
				}
				
				clone.parentNode.removeChild(clone);
				fo.appendChild(div);
			}
			// Workaround for export and Firefox 3.x (Opera has same bug but it cannot
			// be fixed for all cases using this workaround so foreignObject is disabled). 
			else if (this.root.ownerDocument != document ||
				navigator.userAgent.indexOf('Firefox/3.') >= 0)
			{
				// Getting size via local document for export
				div.style.visibility = 'hidden';
				document.body.appendChild(div);
				
				ow = div.offsetWidth;
				h = div.offsetHeight;

				fo.appendChild(div);
				div.style.visibility = '';
			}
			else
			{
				fo.appendChild(div);
				ow = div.offsetWidth;
				h = div.offsetHeight;
			}
			
			if (fill)
			{
				w = Math.max(w, ow);
			}
			else
			{
				w = ow;
			}

			if (s.alpha < 1)
			{
				group.setAttribute('opacity', s.alpha);
			}
			
			var dx = 0;
			var dy = 0;

			if (align == mxConstants.ALIGN_CENTER)
			{
				dx -= w / 2;
			}
			else if (align == mxConstants.ALIGN_RIGHT)
			{
				dx -= w;
			}
			
			x += dx;
			
			if (valign == mxConstants.ALIGN_MIDDLE)
			{
				dy -= h / 2;
			}
			else if (valign == mxConstants.ALIGN_BOTTOM)
			{
				dy -= h;
			}
			
			y += dy;

			var tr = (s.scale != 1) ? 'scale(' + s.scale + ')' : '';

			if (s.rotation != 0 && this.rotateHtml)
			{
				tr += 'rotate(' + (s.rotation) + ',' + (w / 2) + ',' + (h / 2) + ')';
				var pt = this.rotatePoint((x + w / 2) * s.scale, (y + h / 2) * s.scale,
					s.rotation, s.rotationCx, s.rotationCy);
				x = pt.x - w * s.scale / 2;
				y = pt.y - h * s.scale / 2;
			}
			else
			{
				x *= s.scale;
				y *= s.scale;
			}

			if (rotation != 0)
			{
				tr += 'rotate(' + (rotation) + ',' + (-dx) + ',' + (-dy) + ')';
			}

			group.setAttribute('transform', 'translate(' + Math.round(x) + ',' + Math.round(y) + ')' + tr);
			fo.setAttribute('width', Math.round(Math.max(1, w)));
			fo.setAttribute('height', Math.round(Math.max(1, h)));
			
			// Adds alternate content if foreignObject not supported in viewer
			if (this.root.ownerDocument != document)
			{
				var alt = this.createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, fill, clip, rotation);
				
				if (alt != null)
				{
					fo.setAttribute('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility');
					var sw = this.createElement('switch');
					sw.appendChild(fo);
					sw.appendChild(alt);
					group.appendChild(sw);
				}
			}
		}
		else
		{
			this.plainText(x, y, w, h, str, align, valign, wrap, fill, clip, rotation);
		}
	}
};

/**
 * Function: createClip
 * 
 * Creates a clip for the given coordinates.
 */
mxSvgCanvas2D.prototype.createClip = function(x, y, w, h)
{
	x = Math.round(x);
	y = Math.round(y);
	w = Math.round(w);
	h = Math.round(h);
	
	var id = 'mx-clip-' + x + '-' + y + '-' + w + '-' + h;

	var counter = 0;
	var tmp = id + '-' + counter;
	
	// Resolves ID conflicts
	while (document.getElementById(tmp) != null)
	{
		tmp = id + '-' + (++counter);
	}
	
	clip = this.createElement('clipPath');
	clip.setAttribute('id', tmp);
	
	var rect = this.createElement('rect');
	rect.setAttribute('x', x);
	rect.setAttribute('y', y);
	rect.setAttribute('width', w);
	rect.setAttribute('height', h);
		
	clip.appendChild(rect);
	
	return clip;
};

/**
 * Function: text
 * 
 * Paints the given text. Possible values for format are empty string for
 * plain text and html for HTML markup.
 */
mxSvgCanvas2D.prototype.plainText = function(x, y, w, h, str, align, valign, wrap, fill, clip, rotation)
{
	rotation = (rotation != null) ? rotation : 0;
	var s = this.state;
	var size = Math.round(s.fontSize);
	var node = this.createElement('g');
	var tr = s.transform || '';

	// Non-rotated text
	if (rotation != 0)
	{
		tr += 'rotate(' + rotation  + ',' + this.format(x * s.scale) + ',' + this.format(y * s.scale) + ')';
	}

	if (clip && w > 0 && h > 0)
	{
		var cx = x;
		var cy = y;
		
		if (align == mxConstants.ALIGN_CENTER)
		{
			cx -= w / 2;
		}
		else if (align == mxConstants.ALIGN_RIGHT)
		{
			cx -= w;
		}
		
		if (valign == mxConstants.ALIGN_MIDDLE)
		{
			cy -= h / 2;
		}
		else if (valign == mxConstants.ALIGN_BOTTOM)
		{
			cy -= h;
		}
		
		// LATER: Remove spacing from clip rectangle
		var c = this.createClip(cx * s.scale - 2, cy * s.scale - 2, w * s.scale + 4, h * s.scale + 4);
		
		if (this.defs != null)
		{
			this.defs.appendChild(c);
		}
		else
		{
			// Makes sure clip is removed with referencing node
			this.root.appendChild(c);
		}
		
		node.setAttribute('clip-path', 'url(#' + c.getAttribute('id') + ')');
	}
	
	this.updateFont(node, align);

	// Default is left
	var anchor = (align == mxConstants.ALIGN_RIGHT) ? 'end' :
					(align == mxConstants.ALIGN_CENTER) ? 'middle' :
					'start';

	// Text-anchor start is default in SVG
	if (anchor != 'start')
	{
		node.setAttribute('text-anchor', anchor);
	}
	
	if (!this.styleEnabled || size != mxConstants.DEFAULT_FONTSIZE)
	{
		node.setAttribute('font-size', Math.round(size * s.scale) + 'px');
	}
	
	if (tr.length > 0)
	{
		node.setAttribute('transform', tr);
	}
	
	if (s.alpha < 1)
	{
		node.setAttribute('opacity', s.alpha);
	}
	
	var lines = str.split('\n');
	var lh = Math.round(size * mxConstants.LINE_HEIGHT);
	var textHeight = size + (lines.length - 1) * lh;

	var cy = y + size - 1;

	if (valign == mxConstants.ALIGN_MIDDLE)
	{
		var dy = ((this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight) / 2;
		cy -= dy + 1;
	}
	else if (valign == mxConstants.ALIGN_BOTTOM)
	{
		var dy = (this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight;
		cy -= dy + 2;
	}
	
	for (var i = 0; i < lines.length; i++)
	{
		// Workaround for bounding box of empty lines and spaces
		if (lines[i].length > 0 && mxUtils.trim(lines[i]).length > 0)
		{
			var text = this.createElement('text');
			// LATER: Match horizontal HTML alignment
			text.setAttribute('x', this.format(x * s.scale));
			text.setAttribute('y', this.format(cy * s.scale));
			
			mxUtils.write(text, lines[i]);
			node.appendChild(text);
		}

		cy += lh;
	}

	this.root.appendChild(node);
	this.addTextBackground(node, str, x, y, w, textHeight, align, valign, fill);
};

/**
 * Function: addTextBackground
 * 
 * Background color and border
 */
mxSvgCanvas2D.prototype.updateFont = function(node)
{
	var s = this.state;

	node.setAttribute('fill', s.fontColor);
	
	if (!this.styleEnabled || s.fontFamily != mxConstants.DEFAULT_FONTFAMILY)
	{
		node.setAttribute('font-family', s.fontFamily);
	}

	if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
	{
		node.setAttribute('font-weight', 'bold');
	}

	if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
	{
		node.setAttribute('font-style', 'italic');
	}
	
	if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
	{
		node.setAttribute('text-decoration', 'underline');
	}
};

/**
 * Function: addTextBackground
 * 
 * Background color and border
 */
mxSvgCanvas2D.prototype.addTextBackground = function(node, str, x, y, w, h, align, valign, fill)
{
	var s = this.state;

	if (s.fontBackgroundColor != null || s.fontBorderColor != null)
	{
		var bbox = null;
		
		if (fill)
		{
			if (align == mxConstants.ALIGN_CENTER)
			{
				x -= w / 2;
			}
			else if (align == mxConstants.ALIGN_RIGHT)
			{
				x -= w;
			}
			
			if (valign == mxConstants.ALIGN_MIDDLE)
			{
				y -= h / 2;
			}
			else if (valign == mxConstants.ALIGN_BOTTOM)
			{
				y -= h;
			}
			
			bbox = new mxRectangle((x + 1) * s.scale, y * s.scale, (w - 2) * s.scale, (h + 2) * s.scale);
		}
		else if (node.getBBox != null && this.root.ownerDocument == document)
		{
			// Uses getBBox only if inside document for correct size
			bbox = node.getBBox();
			var ie = mxClient.IS_IE && mxClient.IS_SVG;
			bbox = new mxRectangle(bbox.x, bbox.y + ((ie) ? 0 : 1), bbox.width, bbox.height + ((ie) ? 1 : 0));
		}
		else
		{
			// Computes size if not in document or no getBBox available
			var div = document.createElement('div');

			// Wrapping and clipping can be ignored here
			div.style.lineHeight = Math.round(s.fontSize * mxConstants.LINE_HEIGHT) + 'px';
			div.style.fontSize = Math.round(s.fontSize) + 'px';
			div.style.fontFamily = s.fontFamily;
			div.style.whiteSpace = 'nowrap';
			div.style.position = 'absolute';
			div.style.visibility = 'hidden';
			div.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
			div.style.zoom = '1';
			
			if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
			{
				div.style.fontWeight = 'bold';
			}

			if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
			{
				div.style.fontStyle = 'italic';
			}
			
			str = mxUtils.htmlEntities(str, false);
			div.innerHTML = str.replace(/\n/g, '<br/>');
			
			document.body.appendChild(div);
			var w = div.offsetWidth;
			var h = div.offsetHeight;
			div.parentNode.removeChild(div);
			
			if (align == mxConstants.ALIGN_CENTER)
			{
				x -= w / 2;
			}
			else if (align == mxConstants.ALIGN_RIGHT)
			{
				x -= w;
			}
			
			if (valign == mxConstants.ALIGN_MIDDLE)
			{
				y -= h / 2;
			}
			else if (valign == mxConstants.ALIGN_BOTTOM)
			{
				y -= h;
			}
			
			bbox = new mxRectangle((x + 1) * s.scale, (y + 2) * s.scale, w * s.scale, (h + 1) * s.scale);
		}
		
		if (bbox != null)
		{
			var n = this.createElement('rect');
			n.setAttribute('fill', s.fontBackgroundColor || 'none');
			n.setAttribute('stroke', s.fontBorderColor || 'none');
			n.setAttribute('x', Math.floor(bbox.x - 1));
			n.setAttribute('y', Math.floor(bbox.y - 1));
			n.setAttribute('width', Math.ceil(bbox.width + 2));
			n.setAttribute('height', Math.ceil(bbox.height));

			var sw = (s.fontBorderColor != null) ? Math.max(1, this.format(s.scale)) : 0;
			n.setAttribute('stroke-width', sw);
			
			// Workaround for crisp rendering - only required if not exporting
			if (this.root.ownerDocument == document && mxUtils.mod(sw, 2) == 1)
			{
				n.setAttribute('transform', 'translate(0.5, 0.5)');
			}
			
			node.insertBefore(n, node.firstChild);
		}
	}
};

/**
 * Function: stroke
 * 
 * Paints the outline of the current path.
 */
mxSvgCanvas2D.prototype.stroke = function()
{
	this.addNode(false, true);
};

/**
 * Function: fill
 * 
 * Fills the current path.
 */
mxSvgCanvas2D.prototype.fill = function()
{
	this.addNode(true, false);
};

/**
 * Function: fillAndStroke
 * 
 * Fills and paints the outline of the current path.
 */
mxSvgCanvas2D.prototype.fillAndStroke = function()
{
	this.addNode(true, true);
};
