/**
 * $Id: mxStencil.js,v 1.10 2013/04/12 07:51:33 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxStencil
 *
 * Implements a generic shape which is based on a XML node as a description.
 * The node contains a background and a foreground node, which contain the
 * definition to render the respective part of the shape. Note that the
 * fill, stroke or fillstroke of the background is be the first statement
 * of the foreground. This is because the content of the background node
 * maybe used to not only render the shape itself, but also its shadow and
 * other elements which do not require a fill, stroke or fillstroke.
 * 
 * The shape uses a coordinate system with a width of 100 and a height of
 * 100 by default. This can be changed by setting the w and h attribute of
 * the shape element. The aspect attribute can be set to "variable" (default)
 * or "fixed". If fixed is used, then the aspect which is defined via the w
 * and h attribute is kept constant while the shape is scaled.
 * 
 * The possible contents of the background and foreground elements are rect,
 * ellipse, roundrect, text, image, include-shape or paths. A path element
 * contains move, line, curve, quad, arc and close elements. The rect, ellipse
 * and roundrect elements may be thought of as special path elements. All these
 * path elements must be followed by either fill, stroke or fillstroke (note
 * that text, image and include-shape or not path elements).
 * 
 * The background element can be empty or contain at most one path element. It
 * should not contain a text, image or include-shape element. If the background
 * element is empty, then no shadow or glass effect will be rendered. If the
 * background element is non-empty, then the corresponding fill, stroke or
 * fillstroke should be the first element in the subsequent foreground element.
 *  
 * The format of the XML is "a simplified HTML 5 Canvas". Each command changes
 * the "current" state, so eg. a linecap, linejoin will be used for all
 * subsequent line drawing, unless a save/restore appears, which saves/restores
 * a state in a stack.
 * 
 * The connections section contains the fixed connection points for a stencil.
 * The perimeter attribute of the constraint element should have a value of 0
 * or 1 (default), where 1 (true) specifies that the given point should be
 * projected into the perimeter of the given shape.
 * 
 * The x- and y-coordinates are typically between 0 and 1 and define the
 * location of the connection point relative to the width and height of the
 * shape.
 * 
 * The dashpattern directive sets the current dashpattern. The format for the
 * pattern attribute is a space-separated sequence of numbers, eg. 5 5 5 5,
 * that specifies the lengths of alternating dashes and spaces in dashed lines.
 * The dashpattern should be used together with the dashed directive to
 * enabled/disable the dashpattern. The default dashpattern is 3 3.
 * 
 * The strokewidth attribute defines a strokewidth behaviour for the shape. It
 * can contain a numeric value or the keyword "inherit", which means that the
 * strokeWidth of the cell is only changed on scaling, not on resizing.
 * If numeric values are used, the strokeWidth of the cell is changed on both
 * scaling and resizing and the value defines the multiple that is applied to
 * the width.
 * 
 * To support i18n in the text element, use the localized attribute of 1 to use
 * the str as a key in <mxResources.get>. To handle all str attributes of all
 * text nodes like this, set the <mxStencil.defaultLocalized> value to true.
 * 
 * Constructor: mxStencil
 * 
 * Constructs a new generic shape by setting <desc> to the given XML node and
 * invoking <parseDescription> and <parseConstraints>.
 * 
 * Parameters:
 * 
 * desc - XML node that contains the stencil description.
 */
function mxStencil(desc)
{
	this.desc = desc;
	this.parseDescription();
	this.parseConstraints();
};

/**
 * Variable: defaultLocalized
 * 
 * Static global variable that specifies the default value for the localized
 * attribute of the text element. Default is false.
 */
mxStencil.defaultLocalized = false;

/**
 * Variable: desc
 *
 * Holds the XML node with the stencil description.
 */
mxStencil.prototype.desc = null;

/**
 * Variable: constraints
 * 
 * Holds an array of <mxConnectionConstraints> as defined in the shape.
 */
mxStencil.prototype.constraints = null;

/**
 * Variable: aspect
 *
 * Holds the aspect of the shape. Default is 'auto'.
 */
mxStencil.prototype.aspect = null;

/**
 * Variable: w0
 *
 * Holds the width of the shape. Default is 100.
 */
mxStencil.prototype.w0 = null;

/**
 * Variable: h0
 *
 * Holds the height of the shape. Default is 100.
 */
mxStencil.prototype.h0 = null;

/**
 * Variable: bgNodes
 *
 * Holds the XML node with the stencil description.
 */
mxStencil.prototype.bgNode = null;

/**
 * Variable: fgNodes
 *
 * Holds the XML node with the stencil description.
 */
mxStencil.prototype.fgNode = null;

/**
 * Variable: strokewidth
 *
 * Holds the strokewidth direction from the description.
 */
mxStencil.prototype.strokewidth = null;

/**
 * Function: parseDescription
 *
 * Reads <w0>, <h0>, <aspect>, <bgNodes> and <fgNodes> from <desc>.
 */
mxStencil.prototype.parseDescription = function()
{
	// LATER: Preprocess nodes for faster painting
	this.fgNode = this.desc.getElementsByTagName('foreground')[0];
	this.bgNode = this.desc.getElementsByTagName('background')[0];
	this.w0 = Number(this.desc.getAttribute('w') || 100);
	this.h0 = Number(this.desc.getAttribute('h') || 100);
	
	// Possible values for aspect are: variable and fixed where
	// variable means fill the available space and fixed means
	// use w0 and h0 to compute the aspect.
	var aspect = this.desc.getAttribute('aspect');
	this.aspect = (aspect != null) ? aspect : 'variable';
	
	// Possible values for strokewidth are all numbers and "inherit"
	// where the inherit means take the value from the style (ie. the
	// user-defined stroke-width). Note that the strokewidth is scaled
	// by the minimum scaling that is used to draw the shape (sx, sy).
	var sw = this.desc.getAttribute('strokewidth');
	this.strokewidth = (sw != null) ? sw : '1';
};

/**
 * Function: parseConstraints
 *
 * Reads the constraints from <desc> into <constraints> using
 * <parseConstraint>.
 */
mxStencil.prototype.parseConstraints = function()
{
	var conns = this.desc.getElementsByTagName('connections')[0];
	
	if (conns != null)
	{
		var tmp = mxUtils.getChildNodes(conns);
		
		if (tmp != null && tmp.length > 0)
		{
			this.constraints = [];
			
			for (var i = 0; i < tmp.length; i++)
			{
				this.constraints.push(this.parseConstraint(tmp[i]));
			}
		}
	}
};

/**
 * Function: parseConstraint
 *
 * Parses the given XML node and returns its <mxConnectionConstraint>.
 */
mxStencil.prototype.parseConstraint = function(node)
{
	var x = Number(node.getAttribute('x'));
	var y = Number(node.getAttribute('y'));
	var perimeter = node.getAttribute('perimeter') == '1';
	
	return new mxConnectionConstraint(new mxPoint(x, y), perimeter);
};

/**
 * Function: evaluateTextAttribute
 * 
 * Gets the given attribute as a text. The return value from <evaluateAttribute>
 * is used as a key to <mxResources.get> if the localized attribute in the text
 * node is 1 or if <defaultLocalized> is true.
 */
mxStencil.prototype.evaluateTextAttribute = function(node, attribute, state)
{
	var result = this.evaluateAttribute(node, attribute, state);
	var loc = node.getAttribute('localized');
	
	if ((mxStencil.defaultLocalized && loc == null) || loc == '1')
	{
		result = mxResources.get(result);
	}

	return result;
};

/**
 * Function: evaluateAttribute
 *
 * Gets the attribute for the given name from the given node. If the attribute
 * does not exist then the text content of the node is evaluated and if it is
 * a function it is invoked with <state> as the only argument and the return
 * value is used as the attribute value to be returned.
 */
mxStencil.prototype.evaluateAttribute = function(node, attribute, shape)
{
	var result = node.getAttribute(attribute);
	
	if (result == null)
	{
		var text = mxUtils.getTextContent(node);
		
		if (text != null)
		{
			var funct = mxUtils.eval(text);
			
			if (typeof(funct) == 'function')
			{
				result = funct(shape);
			}
		}
	}
	
	return result;
};

/**
 * Function: drawShape
 *
 * Draws this stencil inside the given bounds.
 */
mxStencil.prototype.drawShape = function(canvas, shape, x, y, w, h)
{
	// TODO: Internal structure (array of special structs?), relative and absolute
	// coordinates (eg. note shape, process vs star, actor etc.), text rendering
	// and non-proportional scaling, how to implement pluggable edge shapes
	// (start, segment, end blocks), pluggable markers, how to implement
	// swimlanes (title area) with this API, add icon, horizontal/vertical
	// label, indicator for all shapes, rotation
	this.drawChildren(canvas, shape, x, y, w, h, this.bgNode, false);
	this.drawChildren(canvas, shape, x, y, w, h, this.fgNode, true);
};

/**
 * Function: drawShape
 *
 * Draws this stencil inside the given bounds.
 */
mxStencil.prototype.drawChildren = function(canvas, shape, x, y, w, h, node, disableShadow)
{
	if (node != null)
	{
		var direction = mxUtils.getValue(shape.style, mxConstants.STYLE_DIRECTION, null);
		var aspect = this.computeAspect(shape.style, x, y, w, h, direction);
		var minScale = Math.min(aspect.width, aspect.height);
		var sw = (this.strokewidth == 'inherit') ?
				Number(mxUtils.getNumber(shape.style, mxConstants.STYLE_STROKEWIDTH, 1)) :
				Number(this.strokewidth) * minScale;
		canvas.setStrokeWidth(sw);

		var tmp = node.firstChild;
		
		while (tmp != null)
		{
			if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				this.drawNode(canvas, shape, tmp, aspect, disableShadow);
			}
			
			tmp = tmp.nextSibling;
		}
	}
};

/**
 * Function: computeAspect
 *
 * Returns a rectangle that contains the offset in x and y and the horizontal
 * and vertical scale in width and height used to draw this shape inside the
 * given <mxRectangle>.
 * 
 * Parameters:
 * 
 * shape - <mxShape> to be drawn.
 * bounds - <mxRectangle> that should contain the stencil.
 * direction - Optional direction of the shape to be darwn.
 */
mxStencil.prototype.computeAspect = function(shape, x, y, w, h, direction)
{
	var x0 = x;
	var y0 = y;
	var sx = w / this.w0;
	var sy = h / this.h0;
	
	var inverse = (direction == 'north' || direction == 'south');

	if (inverse)
	{
		sy = w / this.h0;
		sx = h / this.w0;
		
		var delta = (w - h) / 2;

		x0 += delta;
		y0 -= delta;
	}

	if (this.aspect == 'fixed')
	{
		sy = Math.min(sx, sy);
		sx = sy;
		
		// Centers the shape inside the available space
		if (inverse)
		{
			x0 += (h - this.w0 * sx) / 2;
			y0 += (w - this.h0 * sy) / 2;
		}
		else
		{
			x0 += (w - this.w0 * sx) / 2;
			y0 += (h - this.h0 * sy) / 2;
		}
	}

	return new mxRectangle(x0, y0, sx, sy);
};

/**
 * Function: drawNode
 *
 * Draws this stencil inside the given bounds.
 */
mxStencil.prototype.drawNode = function(canvas, shape, node, aspect, disableShadow)
{
	var name = node.nodeName;
	var x0 = aspect.x;
	var y0 = aspect.y;
	var sx = aspect.width;
	var sy = aspect.height;
	var minScale = Math.min(sx, sy);

	if (name == 'save')
	{
		canvas.save();
	}
	else if (name == 'restore')
	{
		canvas.restore();
	}
	else if (name == 'path')
	{
		canvas.begin();

		// Renders the elements inside the given path
		var childNode = node.firstChild;
		
		while (childNode != null)
		{
			if (childNode.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				this.drawNode(canvas, shape, childNode, aspect, disableShadow);
			}
			
			childNode = childNode.nextSibling;
		}
	}
	else if (name == 'close')
	{
		canvas.close();
	}
	else if (name == 'move')
	{
		canvas.moveTo(x0 + Number(node.getAttribute('x')) * sx, y0 + Number(node.getAttribute('y')) * sy);
	}
	else if (name == 'line')
	{
		canvas.lineTo(x0 + Number(node.getAttribute('x')) * sx, y0 + Number(node.getAttribute('y')) * sy);
	}
	else if (name == 'quad')
	{
		canvas.quadTo(x0 + Number(node.getAttribute('x1')) * sx,
				y0 + Number(node.getAttribute('y1')) * sy,
				x0 + Number(node.getAttribute('x2')) * sx,
				y0 + Number(node.getAttribute('y2')) * sy);
	}
	else if (name == 'curve')
	{
		canvas.curveTo(x0 + Number(node.getAttribute('x1')) * sx,
				y0 + Number(node.getAttribute('y1')) * sy,
				x0 + Number(node.getAttribute('x2')) * sx,
				y0 + Number(node.getAttribute('y2')) * sy,
				x0 + Number(node.getAttribute('x3')) * sx,
				y0 + Number(node.getAttribute('y3')) * sy);
	}
	else if (name == 'arc')
	{
		canvas.arcTo(Number(node.getAttribute('rx')) * sx,
				Number(node.getAttribute('ry')) * sy,
				Number(node.getAttribute('x-axis-rotation')),
				Number(node.getAttribute('large-arc-flag')),
				Number(node.getAttribute('sweep-flag')),
				x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy);
	}
	else if (name == 'rect')
	{
		canvas.rect(x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy,
				Number(node.getAttribute('w')) * sx,
				Number(node.getAttribute('h')) * sy);
	}
	else if (name == 'roundrect')
	{
		var arcsize = node.getAttribute('arcsize');
		
		if (arcsize == 0)
		{
			arcsize = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;
		}
		
		var w = Number(node.getAttribute('w')) * sx;
		var h = Number(node.getAttribute('h')) * sy;
		var factor = Number(arcsize) / 100;
		var r = Math.min(w * factor, h * factor);
		
		canvas.roundrect(x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy,
				w, h, r, r);
	}
	else if (name == 'ellipse')
	{
		canvas.ellipse(x0 + Number(node.getAttribute('x')) * sx,
			y0 + Number(node.getAttribute('y')) * sy,
			Number(node.getAttribute('w')) * sx,
			Number(node.getAttribute('h')) * sy);
	}
	else if (name == 'image')
	{
		var src = this.evaluateAttribute(node, 'src', shape);
		
		canvas.image(x0 + Number(node.getAttribute('x')) * sx,
			y0 + Number(node.getAttribute('y')) * sy,
			Number(node.getAttribute('w')) * sx,
			Number(node.getAttribute('h')) * sy,
			src, false, node.getAttribute('flipH') == '1',
			node.getAttribute('flipV') == '1');
	}
	else if (name == 'text')
	{
		var str = this.evaluateTextAttribute(node, 'str', shape);
		var rotation = node.getAttribute('vertical') == '1' ? -90 : 0;
		
		if (node.getAttribute('align-shape') == '0')
		{
			var dr = shape.rotation;

			// Depends on flipping
			var flipH = mxUtils.getValue(shape.style, mxConstants.STYLE_FLIPH, 0) == 1;
			var flipV = mxUtils.getValue(shape.style, mxConstants.STYLE_FLIPV, 0) == 1;
			
			if (flipH && flipV)
			{
				rotation -= dr;
			}
			else if (flipH || flipV)
			{
				rotation += dr;
			}
			else
			{
				rotation -= dr;
			}
		}

		rotation -= node.getAttribute('rotation');

		canvas.text(x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy,
				0, 0, str, node.getAttribute('align') || 'left',
				node.getAttribute('valign') || 'top', false, '',
				false, false, rotation);
	}
	else if (name == 'include-shape')
	{
		var stencil = mxStencilRegistry.getStencil(node.getAttribute('name'));
		
		if (stencil != null)
		{
			var x = x0 + Number(node.getAttribute('x')) * sx;
			var y = y0 + Number(node.getAttribute('y')) * sy;
			var w = Number(node.getAttribute('w')) * sx;
			var h = Number(node.getAttribute('h')) * sy;
			
			stencil.drawShape(canvas, shape, x, y, w, h);
		}
	}
	else if (name == 'fillstroke')
	{
		canvas.fillAndStroke();
	}
	else if (name == 'fill')
	{
		canvas.fill();
	}
	else if (name == 'stroke')
	{
		canvas.stroke();
	}
	else if (name == 'strokewidth')
	{
		var s = (node.getAttribute('fixed') == '1') ? 1 : minScale;
		canvas.setStrokeWidth(Number(node.getAttribute('width')) * s);
	}
	else if (name == 'dashed')
	{
		canvas.setDashed(node.getAttribute('dashed') == '1');
	}
	else if (name == 'dashpattern')
	{
		var value = node.getAttribute('pattern');
		
		if (value != null)
		{
			var tmp = value.split(' ');
			var pat = [];
			
			for (var i = 0; i < tmp.length; i++)
			{
				if (tmp[i].length > 0)
				{
					pat.push(Number(tmp[i]) * minScale);
				}
			}
			
			value = pat.join(' ');
			canvas.setDashPattern(value);
		}
	}
	else if (name == 'strokecolor')
	{
		canvas.setStrokeColor(node.getAttribute('color'));
	}
	else if (name == 'linecap')
	{
		canvas.setLineCap(node.getAttribute('cap'));
	}
	else if (name == 'linejoin')
	{
		canvas.setLineJoin(node.getAttribute('join'));
	}
	else if (name == 'miterlimit')
	{
		canvas.setMiterLimit(Number(node.getAttribute('limit')));
	}
	else if (name == 'fillcolor')
	{
		canvas.setFillColor(node.getAttribute('color'));
	}
	else if (name == 'alpha')
	{
		canvas.setAlpha(node.getAttribute('alpha'));
	}
	else if (name == 'fontcolor')
	{
		canvas.setFontColor(node.getAttribute('color'));
	}
	else if (name == 'fontstyle')
	{
		canvas.setFontStyle(node.getAttribute('style'));
	}
	else if (name == 'fontfamily')
	{
		canvas.setFontFamily(node.getAttribute('family'));
	}
	else if (name == 'fontsize')
	{
		canvas.setFontSize(Number(node.getAttribute('size')) * minScale);
	}
	
	if (disableShadow && (name == 'fillstroke' || name == 'fill' || name == 'stroke'))
	{
		disableShadow = false;
		canvas.setShadow(false);
	}
};
