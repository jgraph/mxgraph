/**
aaa * $Id: mxShape.js,v 1.38 2013/02/01 13:54:05 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxShape
 *
 * Base class for all shapes. A shape in mxGraph is a
 * separate implementation for SVG, VML and HTML. Which
 * implementation to use is controlled by the <dialect>
 * property which is assigned from within the <mxCellRenderer>
 * when the shape is created. The dialect must be assigned
 * for a shape, and it does normally depend on the browser and
 * the confiuration of the graph (see <mxGraph> rendering hint).
 *
 * For each supported shape in SVG and VML, a corresponding
 * shape exists in mxGraph, namely for text, image, rectangle,
 * rhombus, ellipse and polyline. The other shapes are a
 * combination of these shapes (eg. label and swimlane)
 * or they consist of one or more (filled) path objects
 * (eg. actor and cylinder). The HTML implementation is
 * optional but may be required for a HTML-only view of
 * the graph.
 *
 * Custom Shapes:
 *
 * To extend from this class, the basic code looks as follows.
 * In the special case where the custom shape consists only of
 * one filled region or one filled region and an additional stroke
 * the <mxActor> and <mxCylinder> should be subclassed,
 * respectively.
 *
 * (code)
 * function CustomShape() { }
 * 
 * CustomShape.prototype = new mxShape();
 * CustomShape.prototype.constructor = CustomShape; 
 * (end)
 *
 * To register a custom shape in an existing graph instance,
 * one must register the shape under a new name in the graph's
 * cell renderer as follows:
 *
 * (code)
 * mxCellRenderer.registerShape('customShape', CustomShape);
 * (end)
 *
 * The second argument is the name of the constructor.
 *
 * In order to use the shape you can refer to the given name above
 * in a stylesheet. For example, to change the shape for the default
 * vertex style, the following code is used:
 *
 * (code)
 * var style = graph.getStylesheet().getDefaultVertexStyle();
 * style[mxConstants.STYLE_SHAPE] = 'customShape';
 * (end)
 * 
 * Constructor: mxShape
 *
 * Constructs a new shape.
 */
function mxShape(stencil)
{
	this.stencil = stencil;
	
	// Sets some defaults
	this.strokewidth = 1;
	this.rotation = 0;
	this.opacity = 100;
	this.flipH = false;
	this.flipV = false;
};

/**
 * Variable: dialect
 *
 * Holds the dialect in which the shape is to be painted.
 * This can be one of the DIALECT constants in <mxConstants>.
 */
mxShape.prototype.dialect = null;

/**
 * Variable: scale
 *
 * Holds the scale in which the shape is being painted.
 */
mxShape.prototype.scale = 1;

/**
 * Variable: bounds
 *
 * Holds the <mxRectangle> that specifies the bounds of this shape.
 */
mxShape.prototype.bounds = null;

/**
 * Variable: points
 *
 * Holds the array of <mxPoints> that specify the points of this shape.
 */
mxShape.prototype.points = null;

/**
 * Variable: node
 *
 * Holds the outermost DOM node that represents this shape.
 */
mxShape.prototype.node = null;

/**
 * Variable: state
 * 
 * Optional reference to the corresponding <mxCellState>.
 */
mxShape.prototype.style = null;

/**
 * Variable: style
 *
 * Optional reference to the style of the corresponding <mxCellState>.
 */
mxShape.prototype.style = null;

/**
 * Variable: boundingBox
 *
 * Contains the bounding box of the shape, that is, the smallest rectangle
 * that includes all pixels of the shape.
 */
mxShape.prototype.boundingBox = null;

/**
 * Variable: stencil
 *
 * Holds the <mxStencil> that defines the shape.
 */
mxShape.prototype.stencil = null;

/**
 * Variable: svgStrokeTolerance
 *
 * Event-tolerance for SVG strokes (in px). Default is 6.
 */
mxShape.prototype.svgStrokeTolerance = 6;

/**
 * Variable: pointerEvents
 * 
 * Specifies if pointer events should be handled. Default is true.
 */
mxShape.prototype.pointerEvents = true;

/**
 * Variable: stencilPointerEvents
 * 
 * Specifies if pointer events outside of stencils should be handled. Default
 * is false. Set this to true for backwards compatibility with the 1.x branch.
 */
mxShape.prototype.stencilPointerEvents = false;

/**
 * Variable: vmlScale
 * 
 * Scale for improving the precision of VML rendering. Default is 1.
 */
mxShape.prototype.vmlScale = 1;

/**
 * Function: init
 *
 * Initializes the shape by creaing the DOM node using <create>
 * and adding it into the given container.
 *
 * Parameters:
 *
 * container - DOM node that will contain the shape.
 */
mxShape.prototype.init = function(container)
{
	if (this.node == null)
	{
		this.node = this.create(container);
		
		if (container != null)
		{
			container.appendChild(this.node);
		}
	}
};

/**
 * Function: isParseVml
 * 
 * Specifies if any VML should be added via insertAdjacentHtml to the DOM. This
 * is only needed in IE8 and only if the shape contains VML markup. This method
 * returns true.
 */
mxShape.prototype.isParseVml = function()
{
	return true;
};

/**
 * Function: isHtmlAllowed
 * 
 * Returns true if HTML is allowed for this shape. This implementation always
 * returns false.
 */
mxShape.prototype.isHtmlAllowed = function()
{
	return false;
};

/**
 * Function: getSvgScreenOffset
 * 
 * Returns 0, or 0.5 if <strokewidth> % 2 == 1.
 */
mxShape.prototype.getSvgScreenOffset = function()
{
	return (mxUtils.mod(Math.max(1, Math.round(this.strokewidth * this.scale)), 2) == 1) ? 0.5 : 0;
};

/**
 * Function: create
 *
 * Creates and returns the DOM node(s) for the shape in
 * the given container. This implementation invokes
 * <createSvg>, <createHtml> or <createVml> depending
 * on the <dialect> and style settings.
 *
 * Parameters:
 *
 * container - DOM node that will contain the shape.
 */
mxShape.prototype.create = function(container)
{
	var node = null;

	if (container.ownerSVGElement != null)
	{
		node = this.createSvg(container);
	}
	else if (document.documentMode == 8 || this.dialect == mxConstants.DIALECT_SVG ||
		(this.dialect != mxConstants.DIALECT_VML && this.isHtmlAllowed()))
	{
		node = this.createHtml(container);
	}
	else
	{
		node = this.createVml(container);
	}
	
	return node;
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxShape.prototype.createSvg = function()
{
	return document.createElementNS(mxConstants.NS_SVG, 'g');
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxShape.prototype.createVml = function()
{
	var node = document.createElement(mxClient.VML_PREFIX + ':group');
	node.style.position = 'absolute';
	
	return node;
};

/**
 * Function: createHtml
 *
 * Creates and returns the HTML DOM node(s) to represent
 * this shape. This implementation falls back to <createVml>
 * so that the HTML creation is optional.
 */
mxShape.prototype.createHtml = function()
{
	var node = document.createElement('div');
	node.style.position = 'absolute';
	
	return node;
};

/**
 * Function: reconfigure
 *
 * Reconfigures this shape. This will update the colors etc in
 * addition to the bounds or points.
 */
mxShape.prototype.reconfigure = function()
{
	this.redraw();
};

/**
 * Function: redraw
 *
 * Creates and returns the SVG node(s) to represent this shape.
 */
mxShape.prototype.redraw = function()
{
	this.updateBoundsFromPoints();
	
	if (this.checkBounds())
	{
		this.node.style.visibility = '';

		if (this.node.nodeName == 'DIV' && this.isHtmlAllowed())
		{
			this.redrawHtmlShape();
		}
		else
		{	
			this.redrawShape();
		}

		this.updateBoundingBox();
	}
	else
	{
		this.node.style.visibility = 'hidden';
		this.boundingBox = null;
	}
};

/**
 * Function: updateBoundsFromPoints
 * 
 * Updates the bounds based on the points.
 */
mxShape.prototype.updateBoundsFromPoints = function()
{
	var pts = this.points;
	
	if (pts != null && pts.length > 0 && pts[0] != null)
	{
		this.bounds = new mxRectangle(Number(pts[0].x), Number(pts[0].y), 1, 1);
		
		for (var i = 1; i < this.points.length; i++)
		{
			if (pts[i] != null)
			{
				this.bounds.add(new mxRectangle(Number(pts[i].x), Number(pts[i].y), 1, 1));
			}
		}
	}
	
};

/**
 * Function: checkBounds
 * 
 * Returns true if the bounds are not null and all of its variables are numeric.
 */
mxShape.prototype.checkBounds = function()
{
	return (this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
			!isNaN(this.bounds.width) && !isNaN(this.bounds.height) &&
			this.bounds.width > 0 && this.bounds.height > 0);
};

/**
 * Function: createVmlGroup
 *
 * Returns the temporary element used for rendering in IE8 standards mode.
 */
mxShape.prototype.createVmlGroup = function()
{
	var node = document.createElement(mxClient.VML_PREFIX + ':group');
	node.style.position = 'absolute';
	node.style.width = this.node.style.width;
	node.style.height = this.node.style.height;
	
	return node;
};

/**
 * Function: redrawShape
 *
 * Updates the SVG or VML shape.
 */
mxShape.prototype.redrawShape = function()
{
	var canvas = this.createCanvas();

	// Specifies if events should be handled
	canvas.pointerEvents = this.pointerEvents;

	// Removes all children
	while(this.node.hasChildNodes())
	{
		this.node.removeChild(this.node.lastChild);
	}

	this.paint(canvas);

	if (this.node != canvas.root)
	{
		// Forces parsing in IE8 standards mode - slow! avoid
		this.node.insertAdjacentHTML('beforeend', canvas.root.outerHTML);
	}

	if (this.node.nodeName == 'DIV' && document.documentMode == 8)
	{
		// Makes DIV transparent to events for IE8 in IE8 standards
		// mode (Note: Does not work for IE9 in IE8 standards mode)
		this.node.style.filter = '';
		
		// Adds event transparency in IE8 standards
		if (this.stencil == null || !this.stencilPointerEvents)
		{
			mxUtils.addTransparentBackgroundFilter(this.node);
		}
	}
	
	this.destroyCanvas(canvas);
};

/**
 * Function: createCanvas
 * 
 * Destroys the given canvas which was used for drawing. This implementation
 * increments the reference counts on all shared gradients used in the canvas.
 */
mxShape.prototype.createCanvas = function()
{
	var canvas = null;
	var node = null;
	
	// LATER: Check if reusing existing DOM nodes improves performance
	if (this.node.ownerSVGElement != null)
	{
		canvas = new mxSvgCanvas2D(this.node, false);
		canvas.strokeTolerance = this.svgStrokeTolerance;
		canvas.blockImagePointerEvents = mxClient.IS_NS && !mxClient.IS_SF && !mxClient.IS_GC;
		var off = this.getSvgScreenOffset();

		if (off != 0)
		{
			this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
		}
		else
		{
			this.node.removeAttribute('transform');
		}
	}
	else
	{
		this.updateVmlContainer();
		var w = Math.max(1, Math.round(this.bounds.width));
		var h = Math.max(1, Math.round(this.bounds.height));
		
		// Workaround for VML rendering bug in IE8 standards mode
		if (document.documentMode == 8 && this.isParseVml())
		{
			node = this.createVmlGroup();
		}
		else
		{
			node = this.node;			
		}
		
		canvas = new mxVmlCanvas2D(node, false);
		
		if (node.tagUrn != '')
		{
			node.coordsize = (w * this.vmlScale) + ',' + (h * this.vmlScale);
			canvas.scale(this.vmlScale);
			canvas.vmlScale = this.vmlScale;
		}

		// Painting relative to top, left shape corner
		var s = this.scale;
		canvas.translate(-Math.round(this.bounds.x / s), -Math.round(this.bounds.y / s));
	}

	return canvas;
};

/**
 * Function: updateVmlContainer
 * 
 * Updates the bounds of the VML container.
 */
mxShape.prototype.updateVmlContainer = function()
{
	this.node.style.left = Math.round(this.bounds.x) + 'px';
	this.node.style.top = Math.round(this.bounds.y) + 'px';
	var w = Math.max(1, Math.round(this.bounds.width));
	var h = Math.max(1, Math.round(this.bounds.height));
	this.node.style.width = w + 'px';
	this.node.style.height = h + 'px';
	this.node.style.overflow = 'visible';
};

/**
 * Function: destroyCanvas
 * 
 * Destroys the given canvas which was used for drawing. This implementation
 * increments the reference counts on all shared gradients used in the canvas.
 */
mxShape.prototype.destroyCanvas = function(canvas)
{
	// Manages reference counts
	if (canvas instanceof mxSvgCanvas2D)
	{
		// Increments ref counts
		for (var key in canvas.gradients)
		{
			var gradient = canvas.gradients[key];
			gradient.mxRefCount = (gradient.mxRefCount || 0) + 1;
		}
		
		this.releaseSvgGradients(this.oldGradients);
		this.oldGradients = canvas.gradients;
	}
};

/**
 * Function: paint
 * 
 * Generic rendering code.
 */
mxShape.prototype.paint = function(c)
{
	// Scale is passed-through to canvas
	var s = this.scale;
	var x = this.bounds.x / s;
	var y = this.bounds.y / s;
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;

	if (this.isPaintBoundsInverted())
	{
		var t = (w - h) / 2;
		x += t;
		y -= t;
		var tmp = w;
		w = h;
		h = tmp;
	}
	
	this.updateTransform(c, x, y, w, h);
	this.configureCanvas(c, x, y, w, h);
	
	if (this.stencil != null)
	{
		this.paintStencilShape(c, x, y, w, h);
	}
	else
	{
		// Stencils have separate strokewidth
		c.setStrokeWidth(this.strokewidth);
		
		if (this.points != null)
		{
			// Paints edge shape
			var pts = [];
			
			for (var i = 0; i < this.points.length; i++)
			{
				pts.push(new mxPoint(this.points[i].x / s, this.points[i].y / s));
			}

			this.paintEdgeShape(c, pts);
		}
		else
		{
			// Paints vertex shape
			this.paintVertexShape(c, x, y, w, h);
		}
	}
};

/**
 * Function: configureCanvas
 * 
 * Sets the state of the canvas for drawing the shape.
 */
mxShape.prototype.configureCanvas = function(c, x, y, w, h)
{
	var dash = null;
	
	if (this.style != null)
	{
		dash = this.style['dashPattern'];		
	}

	c.setAlpha(this.opacity / 100);

	// Sets alpha, colors and gradients
	if (this.isShadow != null)
	{
		c.setShadow(this.isShadow);
	}
	
	// Dash pattern
	if (this.isDashed != null)
	{
		c.setDashed(this.isDashed);
	}

	if (dash != null)
	{
		c.setDashPattern(dash);
	}
	
	if (this.gradient != null)
	{
		var b = this.getGradientBounds(c, x, y, w, h);
		c.setGradient(this.fill, this.gradient, b.x, b.y, b.width, b.height, this.gradientDirection);
	}
	else
	{
		c.setFillColor(this.fill);
	}

	c.setStrokeColor(this.stroke);
};

/**
 * Function: getGradientBounds
 * 
 * Returns the bounding box for the gradient box for this shape.
 */
mxShape.prototype.getGradientBounds = function(c, x, y, w, h)
{
	return new mxRectangle(x, y, w, h);
};

/**
 * Function: updateTransform
 * 
 * Sets the scale and rotation on the given canvas.
 */
mxShape.prototype.updateTransform = function(c, x, y, w, h)
{
	// NOTE: Currently, scale is implemented in state and canvas. This will
	// move to canvas in a later version, so that the states are unscaled
	// and untranslated and do not need an update after zooming or panning.
	c.scale(this.scale);
	c.rotate(this.getShapeRotation(), this.flipH, this.flipV, x + w / 2, y + h / 2);
};

/**
 * Function: paintStencilShape
 * 
 * Paints the line shape.
 */
mxShape.prototype.paintStencilShape = function(c, x, y, w, h)
{
	if (this.stencilPointerEvents)
	{
		if (this.dialect == mxConstants.DIALECT_SVG)
		{
			this.addTransparentBackgroundRectangle(this.node, x, y, w, h);
		}
		// For IE8 we do not add event transparency in redrawShape
		else if (document.documentMode != 8)
		{
			this.setTransparentBackgroundImage(this.node);
		}
	}
	
	// Paints a stencil
	this.stencil.drawShape(c, this, x, y, w, h);
};

/**
 * Function: paintVertexShape
 * 
 * Paints the vertex shape.
 */
mxShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	this.paintBackground(c, x, y, w, h);
	c.setShadow(false);
	this.paintForeground(c, x, y, w, h);
};

/**
 * Function: paintBackground
 * 
 * Hook for subclassers. This implementation is empty.
 */
mxShape.prototype.paintBackground = function(c, x, y, w, h) { };

/**
 * Function: paintForeground
 * 
 * Hook for subclassers. This implementation is empty.
 */
mxShape.prototype.paintForeground = function(c, x, y, w, h) { };

/**
 * Function: paintEdgeShape
 * 
 * Hook for subclassers. This implementation is empty.
 */
mxShape.prototype.paintEdgeShape = function(c, pts) { };

/**
 * Function: getArcSize
 * 
 * Returns the arc size for the given dimension.
 */
mxShape.prototype.getArcSize = function(w, h)
{
	var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
		mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
	return Math.min(w * f, h * f);
};

/**
 * Function: paintGlassEffect
 * 
 * Paints the glass gradient effect.
 */
mxShape.prototype.paintGlassEffect = function(c, x, y, w, h, arc)
{
	var sw = Math.ceil(this.strokewidth / 2);
	var size = 0.4;
	
	c.setGradient('#ffffff', '#ffffff', x, y, w, h * 0.6, 'south', 0.9, 0.1);
	c.begin();
	arc += 2 * sw;
		
	if (this.isRounded)
	{
		c.moveTo(x - sw + arc, y - sw);
		c.quadTo(x - sw, y - sw, x - sw, y - sw + arc);
		c.lineTo(x - sw, y + h * size);
		c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
		c.lineTo(x + w + sw, y - sw + arc);
		c.quadTo(x + w + sw, y - sw, x + w + sw - arc, y - sw);
	}
	else
	{
		c.moveTo(x - sw, y - sw);
		c.lineTo(x - sw, y + h * size);
		c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
		c.lineTo(x + w + sw, y - sw);
	}
	
	c.close();
	c.fill();
};

/**
 * Function: apply
 * 
 * Applies the style of the given <mxCellState> to the shape. This
 * implementation assigns the following styles to local fields:
 * 
 * - <mxConstants.STYLE_FILLCOLOR> => fill
 * - <mxConstants.STYLE_GRADIENTCOLOR> => gradient
 * - <mxConstants.STYLE_GRADIENT_DIRECTION> => gradientDirection
 * - <mxConstants.STYLE_OPACITY> => opacity
 * - <mxConstants.STYLE_STROKECOLOR> => stroke
 * - <mxConstants.STYLE_STROKEWIDTH> => strokewidth
 * - <mxConstants.STYLE_SHADOW> => isShadow
 * - <mxConstants.STYLE_DASHED> => isDashed
 * - <mxConstants.STYLE_SPACING> => spacing
 * - <mxConstants.STYLE_STARTSIZE> => startSize
 * - <mxConstants.STYLE_ENDSIZE> => endSize
 * - <mxConstants.STYLE_ROUNDED> => isRounded
 * - <mxConstants.STYLE_STARTARROW> => startArrow
 * - <mxConstants.STYLE_ENDARROW> => endArrow
 * - <mxConstants.STYLE_ROTATION> => rotation
 * - <mxConstants.STYLE_DIRECTION> => direction
 * - <mxConstants.STYLE_GLASS> => glass
 *
 * This keeps a reference to the <style>. If you need to keep a reference to
 * the cell, you can override this method and store a local reference to
 * state.cell or the <mxCellState> itself.
 *
 * Parameters:
 *
 * state - <mxCellState> of the corresponding cell.
 */
mxShape.prototype.apply = function(state)
{
	this.state = state;
	this.style = state.style;

	if (this.style != null)
	{
		this.fill = mxUtils.getValue(this.style, mxConstants.STYLE_FILLCOLOR, this.fill);
		this.gradient = mxUtils.getValue(this.style, mxConstants.STYLE_GRADIENTCOLOR, this.gradient);
		this.gradientDirection = mxUtils.getValue(this.style, mxConstants.STYLE_GRADIENT_DIRECTION, this.gradientDirection);
		this.opacity = mxUtils.getValue(this.style, mxConstants.STYLE_OPACITY, this.opacity);
		this.stroke = mxUtils.getValue(this.style, mxConstants.STYLE_STROKECOLOR, this.stroke);
		this.strokewidth = mxUtils.getNumber(this.style, mxConstants.STYLE_STROKEWIDTH, this.strokewidth);
		this.spacing = mxUtils.getValue(this.style, mxConstants.STYLE_SPACING, this.spacing);
		this.startSize = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, this.startSize);
		this.endSize = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, this.endSize);
		this.startArrow = mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, this.startArrow);
		this.endArrow = mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, this.endArrow);
		this.rotation = mxUtils.getValue(this.style, mxConstants.STYLE_ROTATION, this.rotation);
		this.direction = mxUtils.getValue(this.style, mxConstants.STYLE_DIRECTION, this.direction);
		this.flipH = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPH, 0) == 1;
		this.flipV = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPV, 0) == 1;	
		
		// Legacy support for stencilFlipH/V
		if (this.stencil != null)
		{
			this.flipH = mxUtils.getValue(this.style, 'stencilFlipH', 0) == 1 || this.flipH;
			this.flipV = mxUtils.getValue(this.style, 'stencilFlipV', 0) == 1 || this.flipV;
		}
		
		if (this.direction == 'north' || this.direction == 'south')
		{
			var tmp = this.flipH;
			this.flipH = this.flipV;
			this.flipV = tmp;
		}

		this.isShadow = mxUtils.getValue(this.style, mxConstants.STYLE_SHADOW, this.isShadow) == 1;
		this.isDashed = mxUtils.getValue(this.style, mxConstants.STYLE_DASHED, this.isDashed) == 1;
		this.isRounded = mxUtils.getValue(this.style, mxConstants.STYLE_ROUNDED, this.isRounded) == 1;
		this.glass = mxUtils.getValue(this.style, mxConstants.STYLE_GLASS, this.glass) == 1;
		
		if (this.fill == 'none')
		{
			this.fill = null;
		}

		if (this.gradient == 'none')
		{
			this.gradient = null;
		}

		if (this.stroke == 'none')
		{
			this.stroke = null;
		}
	}
};

/**
 * Function: setCursor
 * 
 * Sets the cursor on the given shape.
 *
 * Parameters:
 *
 * cursor - The cursor to be used.
 */
mxShape.prototype.setCursor = function(cursor)
{
	if (cursor == null)
	{
		cursor = '';
	}
	
	this.cursor = cursor;

	if (this.node != null)
	{
		this.node.style.cursor = cursor;
	}
};

/**
 * Function: getCursor
 * 
 * Returns the current cursor.
 */
mxShape.prototype.getCursor = function()
{
	return this.cursor;
};

/**
 * Function: updateBoundingBox
 *
 * Updates the <boundingBox> for this shape using <createBoundingBox> and
 * <augmentBoundingBox> and stores the result in <boundingBox>.
 */
mxShape.prototype.updateBoundingBox = function()
{
	if (this.bounds != null)
	{
		var bbox = this.createBoundingBox();
		
		if (bbox != null)
		{
			this.augmentBoundingBox(bbox);
			
			var rot = this.getShapeRotation();
			
			if (rot != 0)
			{
				bbox = mxUtils.getBoundingBox(bbox, rot);
			}
	
			bbox.x = Math.floor(bbox.x);
			bbox.y = Math.floor(bbox.y);
			bbox.width = Math.ceil(bbox.width);
			bbox.height = Math.ceil(bbox.height);
		}

		this.boundingBox = bbox;
	}
};

/**
 * Function: createBoundingBox
 *
 * Returns a new rectangle that represents the bounding box of the bare shape
 * with no shadows or strokewidths.
 */
mxShape.prototype.createBoundingBox = function()
{
	var bb = this.bounds.clone();
	
	if (this.isPaintBoundsInverted())
	{
		var t = (bb.width - bb.height) / 2;
		bb.x += t;
		bb.y -= t;
		var tmp = bb.width;
		bb.width = bb.height;
		bb.height = tmp;
	}
	
	return bb;
};

/**
 * Function: augmentBoundingBox
 *
 * Augments the bounding box with the strokewidth and shadow offsets.
 */
mxShape.prototype.augmentBoundingBox = function(bbox)
{
	if (this.isShadow)
	{
		bbox.width += Math.ceil(mxConstants.SHADOW_OFFSET_X * this.scale);
		bbox.height += Math.ceil(mxConstants.SHADOW_OFFSET_Y * this.scale);
	}
	
	// Adds strokeWidth
	var sw = Math.ceil(this.strokewidth * this.scale);
	bbox.grow(Math.ceil(sw / 2));
};

/**
 * Function: isPaintBoundsInverted
 * 
 * Returns true if the bounds should be inverted.
 */
mxShape.prototype.isPaintBoundsInverted = function()
{
	// Stencil implements inversion via aspect
	return this.stencil == null && (this.direction == 'north' || this.direction == 'south');
};

/**
 * Function: getRotation
 * 
 * Returns the rotation from the style.
 */
mxShape.prototype.getRotation = function()
{
	return (this.rotation != null) ? this.rotation : 0;
};

/**
 * Function: getTextRotation
 * 
 * Returns the rotation for the text label.
 */
mxShape.prototype.getTextRotation = function()
{
	var rot = this.getRotation();
	
	if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) != 1)
	{
		rot += mxText.prototype.verticalTextRotation;
	}
	
	return rot;
};

/**
 * Function: getShapeRotation
 * 
 * Returns the actual rotation of the shape.
 */
mxShape.prototype.getShapeRotation = function()
{
	var rot = this.getRotation();
	
	if (this.direction != null)
	{
		if (this.direction == 'north')
		{
			rot += 270;
		}
		else if (this.direction == 'west')
		{
			rot += 180;
		}
		else if (this.direction == 'south')
		{
			rot += 90;
		}
	}
	
	return rot;
};

/**
 * Function: addTransparentBackgroundRectangle
 * 
 * Paints the line shape.
 */
mxShape.prototype.addTransparentBackgroundRectangle = function(node, x, y, w, h)
{
	var rect = document.createElementNS(mxConstants.NS_SVG, 'rect');
	rect.setAttribute('x', x);
	rect.setAttribute('y', y);
	rect.setAttribute('width', w);
	rect.setAttribute('height', h);
	rect.setAttribute('fill', 'none');
	rect.setAttribute('stroke', 'none');
	rect.setAttribute('pointer-events', 'all');
	this.node.appendChild(rect);
};

/**
 * Function: setTransparentBackgroundImage
 * 
 * Paints the line shape.
 */
mxShape.prototype.setTransparentBackgroundImage = function(node)
{
	node.style.backgroundImage = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';
};

/**
 * Function: releaseSvgGradients
 * 
 * Paints the line shape.
 */
mxShape.prototype.releaseSvgGradients = function(grads)
{
	if (grads != null)
	{
		for (var key in grads)
		{
			var gradient = grads[key];
			gradient.mxRefCount = (gradient.mxRefCount || 0) - 1;
			
			if (gradient.mxRefCount == 0 && gradient.parentNode != null)
			{
				gradient.parentNode.removeChild(gradient);
			}
		}
	}
};

/**
 * Function: destroy
 *
 * Destroys the shape by removing it from the DOM and releasing the DOM
 * node associated with the shape using <mxEvent.release>.
 */
mxShape.prototype.destroy = function()
{
	if (this.node != null)
	{
		mxEvent.release(this.node);
		
		if (this.node.parentNode != null)
		{
			this.node.parentNode.removeChild(this.node);
		}
		
		this.node = null;
	}
	
	// Decrements refCount and removes unused
	this.releaseSvgGradients(this.oldGradients);
	this.oldGradients = null;
};
