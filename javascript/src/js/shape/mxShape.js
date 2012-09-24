/**
 * $Id: mxShape.js,v 1.173 2012-07-31 11:46:53 gaudenz Exp $
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
 * respectively. These implement <redrawPath> in order to create
 * the path expression for VML and SVG via a unified API (see
 * <mxPath>). <mxCylinder.redrawPath> has an additional boolean
 * argument to draw the foreground and background separately.
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
 * graph.cellRenderer.registerShape('customShape', CustomShape);
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
function mxShape() { };

/**
 * Variable: SVG_STROKE_TOLERANCE
 *
 * Event-tolerance for SVG strokes (in px). Default is 8.
 */
mxShape.prototype.SVG_STROKE_TOLERANCE = 8;

/**
 * Variable: scale
 *
 * Holds the scale in which the shape is being painted.
 */
mxShape.prototype.scale = 1;

/**
 * Variable: dialect
 *
 * Holds the dialect in which the shape is to be painted.
 * This can be one of the DIALECT constants in <mxConstants>.
 */
mxShape.prototype.dialect = null;

/**
 * Variable: crisp
 *
 * Special attribute for SVG rendering to set the shape-rendering attribute to
 * crispEdges in the output. This is ignored in IE. Default is false. To
 * disable antialias in IE, the explorer.css file can be changed as follows:
 * 
 * [code]
 * v\:* {
 *   behavior: url(#default#VML);
 *   antialias: false;
 * }
 * [/code]
 */
mxShape.prototype.crisp = false;

/**
 * Variable: roundedCrispSvg
 *
 * Specifies if crisp rendering should be enabled for rounded shapes.
 * Default is true.
 */
mxShape.prototype.roundedCrispSvg = true;

/**
 * Variable: mixedModeHtml
 *
 * Specifies if <createHtml> should be used in mixed Html mode.
 * Default is true.
 */
mxShape.prototype.mixedModeHtml = true;

/**
 * Variable: preferModeHtml
 *
 * Specifies if <createHtml> should be used in prefer Html mode.
 * Default is true.
 */
mxShape.prototype.preferModeHtml = true;

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
 * Variable: label
 *
 * Reference to the DOM node that should contain the label. This is null
 * if the label should be placed inside <node> or <innerNode>.
 */
mxShape.prototype.label = null;

/**
 * Variable: innerNode
 *
 * Holds the DOM node that graphically represents this shape. This may be
 * null if the outermost DOM <node> represents this shape.
 */
mxShape.prototype.innerNode = null;

/**
 * Variable: style
 *
 * Holds the style of the cell state that corresponds to this shape. This may
 * be null if the shape is used directly, without a cell state.
 */
mxShape.prototype.style = null;

/**
 * Variable: startOffset
 *
 * Specifies the offset in pixels from the first point in <points> and
 * the actual start of the shape.
 */
mxShape.prototype.startOffset = null;

/**
 * Variable: endOffset
 *
 * Specifies the offset in pixels from the last point in <points> and
 * the actual start of the shape.
 */
mxShape.prototype.endOffset = null;

/**
 * Variable: boundingBox
 *
 * Contains the bounding box of the shape, that is, the smallest rectangle
 * that includes all pixels of the shape.
 */
mxShape.prototype.boundingBox = null;

/**
 * Variable: vmlNodes
 *
 * Array if VML node names to fix in IE8 standards mode.
 */
mxShape.prototype.vmlNodes = ['node', 'strokeNode', 'fillNode', 'shadowNode'];

/**
 * Variable: vmlScale
 *
 * Internal scaling for VML using coordsize for better precision.
 */
mxShape.prototype.vmlScale = 1;

/**
 * Variable: strokewidth
 *
 * Holds the current strokewidth. Default is 1.
 */
mxShape.prototype.strokewidth = 1;

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
	
	if (this.innerNode != null)
	{
		this.innerNode.style.cursor = cursor;
	}
	
	if (this.node != null)
	{
		this.node.style.cursor = cursor;
	}
	
	if (this.pipe != null)
	{
		this.pipe.style.cursor = cursor;
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
			
			// Workaround for broken VML in IE8 standards mode. This gives an ID to
			// each element that is referenced from this instance. After adding the
			// DOM to the document, the outerHTML is overwritten to fix the VML
			// rendering and the references are restored.
			if (document.documentMode == 8 && mxUtils.isVml(this.node))
			{
				this.reparseVml();
			}
		}
	}

	// Gradients are inserted late when the owner SVG element is known
	if (this.insertGradientNode != null)
	{
		this.insertGradient(this.insertGradientNode);
		this.insertGradientNode = null;
	}
};

/**
 * Function: reparseVml
 * 
 * Forces a parsing of the outerHTML of this node and restores all references specified in <vmlNodes>.
 * This is a workaround for the VML rendering bug in IE8 standards mode.
 */
mxShape.prototype.reparseVml = function()
{
	// Assigns temporary IDs to VML nodes so that references can be restored when
	// inserted into the DOM as a string
	for (var i = 0; i < this.vmlNodes.length; i++)
	{
		if (this[this.vmlNodes[i]] != null)
		{
			this[this.vmlNodes[i]].setAttribute('id', 'mxTemporaryReference-' + this.vmlNodes[i]);
		}
	}

	this.node.outerHTML = this.node.outerHTML;
	
	// Restores references to the actual DOM nodes
	for (var i = 0; i < this.vmlNodes.length; i++)
	{
		if (this[this.vmlNodes[i]] != null)
		{
			this[this.vmlNodes[i]] = this.node.ownerDocument.getElementById('mxTemporaryReference-' + this.vmlNodes[i]);
			this[this.vmlNodes[i]].removeAttribute('id');
		}
	}
};

/**
 * Function: insertGradient
 * 
 * Inserts the given gradient node.
 */
mxShape.prototype.insertGradient = function(node)
{
	// Gradients are inserted late when the owner SVG element is known
	if (node != null)
	{
		// Checks if the given gradient already exists inside the SVG element
		// that also contains the node that represents this shape. If the gradient
		// with the same ID exists in another SVG element, then this will add
		// a copy of the gradient with a different ID to the SVG element and update
		// the reference accordingly. This is required in Firefox because if the
		// referenced fill element is removed from the DOM the shape appears black.
		var count = 0;
		var id = node.getAttribute('id');
		var gradient = document.getElementById(id);

		while (gradient != null && gradient.ownerSVGElement != this.node.ownerSVGElement)
		{
			count++;
			id = node.getAttribute('id') + '-' + count;
			gradient = document.getElementById(id);
		}
		
		// According to specification, gradients should be put in a defs
		// section in the first child of the owner SVG element. However,
		// it turns out that gradients only work when added as follows.
		if (gradient == null)
		{
			node.setAttribute('id', id);
			this.node.ownerSVGElement.appendChild(node);
			gradient = node;
		}
		
		if (gradient != null)
		{
			var ref = 'url(#' + id + ')';
			var tmp = (this.innerNode != null) ? this.innerNode : this.node;
			
			if (tmp != null && tmp.getAttribute('fill') != ref)
			{
				tmp.setAttribute('fill', ref);
			}
		}
	}
};

/**
 * Function: isMixedModeHtml
 * 
 * Used to determine if a shape can be rendered using <createHtml> in mixed
 * mode Html without compromising the display accuracy. The default 
 * implementation will check if the shape is not rounded or rotated and has
 * no gradient, and will use a DIV if that is the case. It will also check
 * if <mxShape.mixedModeHtml> is true, which is the default settings.
 * Subclassers can either override <mixedModeHtml> or this function if the 
 * result depends on dynamic values. The graph's dialect is available via
 * <dialect>.
 */
mxShape.prototype.isMixedModeHtml = function()
{
	return this.mixedModeHtml && !this.isRounded && !this.isShadow && this.gradient == null &&
		mxUtils.getValue(this.style, mxConstants.STYLE_GLASS, 0) == 0 &&
		mxUtils.getValue(this.style, mxConstants.STYLE_ROTATION, 0) == 0;
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
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		node = this.createSvg();
	}
	else if (this.dialect == mxConstants.DIALECT_STRICTHTML ||
			(this.preferModeHtml && this.dialect == mxConstants.DIALECT_PREFERHTML) ||
			(this.isMixedModeHtml() && this.dialect == mxConstants.DIALECT_MIXEDHTML))
	{
		node = this.createHtml();
	}
	else
	{
		node = this.createVml();
	}
	
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
	var node = document.createElement('DIV');
	this.configureHtmlShape(node);
	
	return node;
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
		
		if (this.node.glassOverlay)
		{
			this.node.glassOverlay.parentNode.removeChild(this.node.glassOverlay);
			this.node.glassOverlay = null;
		}
		
		this.node = null;
	}
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
	var style = state.style;
	this.style = style;
	
	if (style != null)
	{
		this.fill = mxUtils.getValue(style, mxConstants.STYLE_FILLCOLOR, this.fill);
		this.gradient = mxUtils.getValue(style, mxConstants.STYLE_GRADIENTCOLOR, this.gradient);
		this.gradientDirection = mxUtils.getValue(style, mxConstants.STYLE_GRADIENT_DIRECTION, this.gradientDirection);
		this.opacity = mxUtils.getValue(style, mxConstants.STYLE_OPACITY, this.opacity);
		this.stroke = mxUtils.getValue(style, mxConstants.STYLE_STROKECOLOR, this.stroke);
		this.strokewidth = mxUtils.getNumber(style, mxConstants.STYLE_STROKEWIDTH, this.strokewidth);
		this.isShadow = mxUtils.getValue(style, mxConstants.STYLE_SHADOW, this.isShadow);
		this.isDashed = mxUtils.getValue(style, mxConstants.STYLE_DASHED, this.isDashed);
		this.spacing = mxUtils.getValue(style, mxConstants.STYLE_SPACING, this.spacing);
		this.startSize = mxUtils.getNumber(style, mxConstants.STYLE_STARTSIZE, this.startSize);
		this.endSize = mxUtils.getNumber(style, mxConstants.STYLE_ENDSIZE, this.endSize);
		this.isRounded = mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, this.isRounded);
		this.startArrow = mxUtils.getValue(style, mxConstants.STYLE_STARTARROW, this.startArrow);
		this.endArrow = mxUtils.getValue(style, mxConstants.STYLE_ENDARROW, this.endArrow);
		this.rotation = mxUtils.getValue(style, mxConstants.STYLE_ROTATION, this.rotation);
		this.direction = mxUtils.getValue(style, mxConstants.STYLE_DIRECTION, this.direction);
		
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
 * Function: createSvgGroup
 *
 * Creates a SVG group element and adds the given shape as a child of the
 * element. The child is stored in <innerNode> for later access.
 */
mxShape.prototype.createSvgGroup = function(shape)
{
	var g = document.createElementNS(mxConstants.NS_SVG, 'g');
	
	// Creates the shape inside an svg group
	this.innerNode = document.createElementNS(mxConstants.NS_SVG, shape);
	this.configureSvgShape(this.innerNode);
	
	// Avoids anti-aliasing for non-rounded rectangles with a
	// strokewidth of 1 or more pixels
	if (shape == 'rect' && this.strokewidth * this.scale >= 1 && !this.isRounded)
	{
		this.innerNode.setAttribute('shape-rendering', 'optimizeSpeed');
	}
	
	// Creates the shadow
	this.shadowNode = this.createSvgShadow(this.innerNode);
	
	if (this.shadowNode != null)
	{
		g.appendChild(this.shadowNode);
	}
	
	// Appends the main shape after the shadow
	g.appendChild(this.innerNode);
	
	return g;
};

/**
 * Function: createSvgShadow
 *
 * Creates a clone of the given node and configures the node's color
 * to use <mxConstants.SHADOWCOLOR>.
 */
mxShape.prototype.createSvgShadow = function(node)
{
	if (this.isShadow)
	{
		var shadow = node.cloneNode(true);
		shadow.setAttribute('opacity', mxConstants.SHADOW_OPACITY);
		
		if (this.fill != null && this.fill != mxConstants.NONE)
		{
			shadow.setAttribute('fill', mxConstants.SHADOWCOLOR);
		}

		if (this.stroke != null && this.stroke != mxConstants.NONE)
		{
			shadow.setAttribute('stroke', mxConstants.SHADOWCOLOR);
		}
		
		return shadow;
	}
	
	return null;
};

/**
 * Function: configureHtmlShape
 *
 * Configures the specified HTML node by applying the current color,
 * bounds, shadow, opacity etc.
 */
mxShape.prototype.configureHtmlShape = function(node)
{
	if (mxUtils.isVml(node))
	{
		this.configureVmlShape(node);
	}
	else
	{
		node.style.position = 'absolute';
		node.style.overflow = 'hidden';
		var color = this.stroke;
		
		if (color != null && color != mxConstants.NONE)
		{
			node.style.borderColor = color;

			if (this.isDashed)
			{
				node.style.borderStyle = 'dashed';
			}
			else if (this.strokewidth > 0)
			{
				node.style.borderStyle = 'solid';
			}

			node.style.borderWidth = Math.ceil(this.strokewidth * this.scale) + 'px';
		}
		else
		{
			node.style.borderWidth = '0px';
		}

		color = this.fill;
		node.style.background = '';
		
		if (color != null && color != mxConstants.NONE)
		{
			node.style.backgroundColor = color;
		}
		else if (this.points == null)
		{
			this.configureTransparentBackground(node);
		}
		
		if (this.opacity != null)
		{
			mxUtils.setOpacity(node, this.opacity);
		}
	}
};

/**
 * Function: updateVmlFill
 *
 * Updates the given VML fill node.
 */
mxShape.prototype.updateVmlFill = function(node, c1, c2, dir, alpha)
{
	node.color = c1;
	
	if (alpha != null && alpha != 100)
	{
		node.opacity = alpha + '%';
		
		if (c2 != null)
		{
			// LATER: Set namespaced attribute without using setAttribute
			// which is required for updating the value in IE8 standards.
			node.setAttribute('o:opacity2', alpha + '%');
		}
	}

	if (c2 != null)
	{
		node.type = 'gradient';
		node.color2 = c2;
		var angle = '180';
		
		if (this.gradientDirection == mxConstants.DIRECTION_EAST)
		{
			angle = '270';
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_WEST)
		{
			angle = '90';
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_NORTH)
		{
			angle = '0';
		}

		node.angle = angle;
	}
};

/**
 * Function: updateVmlStrokeNode
 *
 * Creates the stroke node for VML.
 */
mxShape.prototype.updateVmlStrokeNode = function(parent)
{
	// Stroke node is always needed to specify defaults that match SVG output
	if (this.strokeNode == null)
	{
		this.strokeNode = document.createElement('v:stroke');
		
		// To math SVG defaults jointsyle miter and miterlimit 4
		this.strokeNode.joinstyle = 'miter';
		this.strokeNode.miterlimit = 4;
		
		parent.appendChild(this.strokeNode);
	}
	
	if (this.opacity != null)
	{
		this.strokeNode.opacity = this.opacity + '%';
	}
	
	this.updateVmlDashStyle();
};

/**
 * Function: updateVmlStrokeColor
 *
 * Updates the VML stroke color for the given node.
 */
mxShape.prototype.updateVmlStrokeColor = function(node)
{
	var color = this.stroke;

	if (color != null && color != mxConstants.NONE)
	{
		node.stroked = 'true';
		node.strokecolor = color;
	}
	else
	{
		node.stroked = 'false';
	}
};

/**
 * Function: configureVmlShape
 *
 * Configures the specified VML node by applying the current color,
 * bounds, shadow, opacity etc.
 */
mxShape.prototype.configureVmlShape = function(node)
{
	node.style.position = 'absolute';
	this.updateVmlStrokeColor(node);
	node.style.background = '';
	var color = this.fill;
	
	if (color != null && color != mxConstants.NONE)
	{
		if (this.fillNode == null)
		{
			this.fillNode = document.createElement('v:fill');
			node.appendChild(this.fillNode);
		}

		this.updateVmlFill(this.fillNode, color, this.gradient, this.gradientDirection, this.opacity);
	}
	else
	{
		node.filled = 'false';
		
		if (this.points == null)
		{
			this.configureTransparentBackground(node);
		}
	}

	this.updateVmlStrokeNode(node);
	
	if (this.isShadow)
	{
		this.createVmlShadow(node);
	}

	// Fixes possible hang in IE when arcsize is set on non-rects
	if (node.nodeName == 'roundrect')
	{
		// Workaround for occasional "member not found" error
		try
		{
			var f = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;

			if (this.style != null)
			{
				f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, f);
			}
			
			node.setAttribute('arcsize', String(f) + '%');
		}
		catch (e)
		{
			// ignore
		}
	}
};

/**
 * Function: createVmlShadow
 *
 * Creates the VML shadow node.
 */
mxShape.prototype.createVmlShadow = function(node)
{
	// Adds a shadow only once per shape
	if (this.shadowNode == null)
	{
		this.shadowNode = document.createElement('v:shadow');
		this.shadowNode.on = 'true';
		this.shadowNode.color = mxConstants.SHADOWCOLOR;
		this.shadowNode.opacity = (mxConstants.SHADOW_OPACITY * 100) + '%';
		
		this.shadowStrokeNode = document.createElement('v:stroke');
		this.shadowNode.appendChild(this.shadowStrokeNode);
		
		node.appendChild(this.shadowNode);
	}
};

/**
 * Function: configureTransparentBackground
 * 
 * Hook to make the background of a shape transparent. This hook was added as
 * a workaround for the "display non secure items" warning dialog in IE which
 * appears if the background:url(transparent.gif) is used in the overlay pane
 * of a diagram. Since only mxImageShapes currently exist in the overlay pane
 * this function is only overridden in mxImageShape.
 */
mxShape.prototype.configureTransparentBackground = function(node)
{
	node.style.background = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';
};

/**
 * Function: configureSvgShape
 *
 * Configures the specified SVG node by applying the current color,
 * bounds, shadow, opacity etc.
 */
mxShape.prototype.configureSvgShape = function(node)
{
	var color = this.stroke;
	
	if (color != null && color != mxConstants.NONE)
	{
		node.setAttribute('stroke', color);
	}
	else
	{
		node.setAttribute('stroke', 'none');
	}

	color = this.fill;

	if (color != null && color != mxConstants.NONE)
	{
		// Fetches a reference to a shared gradient
		if (this.gradient != null)
		{
			var id = this.getGradientId(color, this.gradient);
			
			if (this.gradientNode != null && this.gradientNode.getAttribute('id') != id)
			{
				this.gradientNode = null;
				node.setAttribute('fill', '');
			}
			
			if (this.gradientNode == null)
			{
				this.gradientNode = this.createSvgGradient(id,
					color, this.gradient, node);
				node.setAttribute('fill', 'url(#'+id+')');
			}
		}
		else
		{
			// TODO: Remove gradient from document if no longer shared
			this.gradientNode = null;
			node.setAttribute('fill', color);
		}
	}
	else
	{
		node.setAttribute('fill', 'none');
	}

	if (this.opacity != null)
	{
		// Improves opacity performance in Firefox
		node.setAttribute('fill-opacity', this.opacity / 100);
		node.setAttribute('stroke-opacity', this.opacity / 100);
	}
};

/**
 * Function: getGradientId
 *
 * Creates a unique ID for the gradient of this shape.
 */
mxShape.prototype.getGradientId = function(start, end)
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
	start = start.toLowerCase();
	end = end.toLowerCase();

	var dir = null;
	
	if (this.gradientDirection == null ||
		this.gradientDirection == mxConstants.DIRECTION_SOUTH)
	{
		dir = 'south';
	}
	else if (this.gradientDirection == mxConstants.DIRECTION_EAST)
	{
		dir = 'east';
	}
	else
	{
		var tmp = start;
		start = end;
		end = tmp;
		
		if (this.gradientDirection == mxConstants.DIRECTION_NORTH)
		{
			dir = 'south';
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_WEST)
		{
			dir = 'east';
		}
	}
	
	return 'mx-gradient-'+start+'-'+end+'-'+dir;
};

/**
 * Function: createSvgPipe
 *
 * Creates an invisible path which is used to increase the hit detection for
 * edges in SVG.
 */
mxShape.prototype.createSvgPipe = function(id, start, end, node)
{
	var pipe = document.createElementNS(mxConstants.NS_SVG, 'path');
	pipe.setAttribute('pointer-events', 'stroke');
	pipe.setAttribute('fill', 'none');
	pipe.setAttribute('visibility', 'hidden');
	// Workaround for Opera ignoring the visiblity attribute above while
	// other browsers need a stroke color to perform the hit-detection but
	// do not ignore the visibility attribute. Side-effect is that Opera's
	// hit detection for horizontal/vertical edges seems to ignore the pipe.
	pipe.setAttribute('stroke', (mxClient.IS_OP) ? 'none' : 'white');
	
	return pipe;
};

/**
 * Function: createSvgGradient
 *
 * Creates a gradient object for SVG using the specified startcolor,
 * endcolor and opacity.
 */
mxShape.prototype.createSvgGradient = function(id, start, end, node)
{
	var gradient = this.insertGradientNode;
	
	if (gradient == null)
	{
		gradient = document.createElementNS(mxConstants.NS_SVG, 'linearGradient');
		gradient.setAttribute('id', id);
		gradient.setAttribute('x1', '0%');
		gradient.setAttribute('y1', '0%');
		gradient.setAttribute('x2', '0%');
		gradient.setAttribute('y2', '0%');
		
		if (this.gradientDirection == null ||
			this.gradientDirection == mxConstants.DIRECTION_SOUTH)
		{
			gradient.setAttribute('y2', '100%');
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_EAST)
		{
			gradient.setAttribute('x2', '100%');
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_NORTH)
		{
			gradient.setAttribute('y1', '100%');
		}
		else if (this.gradientDirection == mxConstants.DIRECTION_WEST)
		{
			gradient.setAttribute('x1', '100%');
		}
		
		var stop = document.createElementNS(mxConstants.NS_SVG, 'stop');
		stop.setAttribute('offset', '0%');
		stop.setAttribute('style', 'stop-color:'+start);
		gradient.appendChild(stop);
		
		stop = document.createElementNS(mxConstants.NS_SVG, 'stop');
		stop.setAttribute('offset', '100%');
		stop.setAttribute('style', 'stop-color:'+end);
		gradient.appendChild(stop);
	}
	
	// Inserted later when the owner SVG element is known
	this.insertGradientNode = gradient;
	
	return gradient;
};

/**
 * Function: createPoints
 *
 * Creates a path expression using the specified commands for this.points.
 * If <isRounded> is true, then the path contains curves for the corners.
 */
mxShape.prototype.createPoints = function(moveCmd, lineCmd, curveCmd, isRelative)
{
	var offsetX = (isRelative) ? this.bounds.x : 0;
	var offsetY = (isRelative) ? this.bounds.y : 0;

	// Workaround for crisp shape-rendering in IE9
	var crisp = (this.crisp && this.dialect == mxConstants.DIALECT_SVG && mxClient.IS_IE) ? 0.5 : 0;

	if (isNaN(this.points[0].x) || isNaN(this.points[0].y))
	{
		return null;
	}
	
	var size = mxConstants.LINE_ARCSIZE * this.scale;
	var p0 = this.points[0];
	
	if (this.startOffset != null)
	{
		p0 = p0.clone();
		p0.x += this.startOffset.x;
		p0.y += this.startOffset.y;
	}
	
	var points = moveCmd + ' ' + (Math.round(p0.x - offsetX) + crisp) + ' ' +
					(Math.round(p0.y - offsetY) + crisp) + ' ';
	
	for (var i = 1; i < this.points.length; i++)
	{
		p0 = this.points[i - 1];
		var pt = this.points[i];
		
		if (isNaN(pt.x) || isNaN(pt.y))
		{
			return null;
		}
		
		if (i == this.points.length - 1 && this.endOffset != null)
		{
			pt = pt.clone();
			pt.x += this.endOffset.x;
			pt.y += this.endOffset.y;
		}
		
		var dx = p0.x - pt.x;
		var dy = p0.y - pt.y;
		
		if ((this.isRounded && i < this.points.length - 1) &&
			(dx != 0 || dy != 0) && this.scale > 0.3)
		{
			// Draws a line from the last point to the current point with a spacing
			// of size off the current point into direction of the last point
			var dist = Math.sqrt(dx * dx + dy * dy);
			var nx1 = dx * Math.min(size, dist / 2) / dist;
			var ny1 = dy * Math.min(size, dist / 2) / dist;
			points += lineCmd + ' ' + (Math.round(pt.x + nx1 - offsetX) + crisp) + ' ' + 
						(Math.round(pt.y + ny1 - offsetY) + crisp) + ' ';

			// Draws a curve from the last point to the current point with a spacing
			// of size off the current point into direction of the next point
			var pe = this.points[i+1];
			dx = pe.x - pt.x;
			dy = pe.y - pt.y;
			
			dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
			
			if (dist != 0)
			{
				var nx2 = dx * Math.min(size, dist / 2) / dist;
				var ny2 = dy * Math.min(size, dist / 2) / dist;
				
				points += curveCmd + ' ' + Math.round(pt.x - offsetX) + ' '+
						Math.round(pt.y - offsetY) + ' ' + Math.round(pt.x - offsetX) + ',' +
						Math.round(pt.y - offsetY) + ' ' + (Math.round(pt.x + nx2 - offsetX) + crisp) + ' ' +
							(Math.round(pt.y + ny2 - offsetY) + crisp) + ' ';
			}
		}
		else
		{
			points += lineCmd + ' ' + (Math.round(pt.x - offsetX) + crisp) + ' ' + (Math.round(pt.y - offsetY) + crisp) + ' ';
		}
	}
	
	return points;
};

/**
 * Function: updateHtmlShape
 *
 * Updates the bounds or points of the specified HTML node and
 * updates the inner children to reflect the changes.
 */
mxShape.prototype.updateHtmlShape = function(node)
{
	if (node != null)
	{
		if (mxUtils.isVml(node))
		{
			this.updateVmlShape(node);
		}
		else
		{
			var sw = Math.ceil(this.strokewidth * this.scale);
			node.style.borderWidth = Math.max(1, sw) + 'px';
			
			if (this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
				!isNaN(this.bounds.width) && !isNaN(this.bounds.height))
			{
				node.style.left = Math.round(this.bounds.x - sw / 2) + 'px';
				node.style.top = Math.round(this.bounds.y - sw / 2) + 'px';

				if (document.compatMode == 'CSS1Compat')
				{
					sw = -sw;
				}
				
				node.style.width = Math.round(Math.max(0, this.bounds.width + sw)) + 'px';
				node.style.height = Math.round(Math.max(0, this.bounds.height + sw)) + 'px';
				
				if (this.bounds.width == 0 || this.bounds.height == 0)
				{
					node.style.visibility = 'hidden';
				}
				else
				{
					node.style.visibility = 'visible';
				}
			}
		}
		
		if (this.points != null && this.bounds != null && !mxUtils.isVml(node))
		{
			if (this.divContainer == null)
			{
				this.divContainer = node;
			}

			while (this.divContainer.firstChild != null)
			{
				mxEvent.release(this.divContainer.firstChild);
				this.divContainer.removeChild(this.divContainer.firstChild);
			}
			
			node.style.borderStyle = '';
			node.style.background = '';
			
			if (this.points.length == 2)
			{
				var p0 = this.points[0];
				var pe = this.points[1];

				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;

				if (dx == 0 || dy == 0)
				{
					node.style.borderStyle = 'solid';
				}
				else
				{
					node.style.width = Math.round(this.bounds.width + 1) + 'px';
					node.style.height = Math.round(this.bounds.height + 1) + 'px';
					
					var length = Math.sqrt(dx * dx + dy * dy);
					var dotCount = 1 + (length / (8 * this.scale));
					
					var nx = dx / dotCount;
					var ny = dy / dotCount;
					var x = p0.x - this.bounds.x;
					var y = p0.y - this.bounds.y;
					
					for (var i = 0; i < dotCount; i++)
					{
						var tmp = document.createElement('DIV');
						
						tmp.style.position = 'absolute';
						tmp.style.overflow = 'hidden';
						
						tmp.style.left = Math.round(x) + 'px';
						tmp.style.top = Math.round(y) + 'px';
						tmp.style.width = Math.max(1, 2 * this.scale) + 'px';
						tmp.style.height = Math.max(1, 2 * this.scale) + 'px';

						tmp.style.backgroundColor = this.stroke;
						this.divContainer.appendChild(tmp);
						
						x += nx;
						y += ny;
					}
				}
			}
			else if (this.points.length == 3)
			{
				var mid = this.points[1];
				
				var n = '0';
				var s = '1';
				var w = '0';
				var e = '1';
				
				if (mid.x == this.bounds.x)
				{
					e = '0';
					w = '1';
				}
				
				if (mid.y == this.bounds.y)
				{
					n = '1';
					s = '0';
				}
				
				node.style.borderStyle = 'solid';
				node.style.borderWidth = n + ' ' + e + ' ' + s + ' ' + w + 'px';
			}
			else
			{
				node.style.width = Math.round(this.bounds.width + 1) + 'px';
				node.style.height = Math.round(this.bounds.height + 1) + 'px';
				var last = this.points[0];
				
				for (var i = 1; i < this.points.length; i++)
				{
					var next = this.points[i];
					
					// TODO: Use one div for multiple lines
					var tmp = document.createElement('DIV');

					tmp.style.position = 'absolute';
					tmp.style.overflow = 'hidden';

					tmp.style.borderColor = this.stroke;
					tmp.style.borderStyle = 'solid';
					tmp.style.borderWidth = '1 0 0 1px';
					
					var x = Math.min(next.x, last.x) - this.bounds.x;
					var y = Math.min(next.y, last.y) - this.bounds.y;
					var w = Math.max(1, Math.abs(next.x - last.x));
					var h = Math.max(1, Math.abs(next.y - last.y));
					
					tmp.style.left = x + 'px';
					tmp.style.top = y + 'px';
					tmp.style.width = w + 'px';
					tmp.style.height = h + 'px';
					
					this.divContainer.appendChild(tmp);
					last = next;
				}
			}
		}
	}
};

/**
 * Function: updateVmlDashStyle
 *
 * Updates the dashstyle in the stroke node.
 */
mxShape.prototype.updateVmlDashStyle = function()
{
	if (this.isDashed)
	{
		if (this.strokeNode.dashstyle != 'dash')
		{
			this.strokeNode.dashstyle = 'dash';
		}
	}
	else if (this.strokeNode.dashstyle != 'solid')
	{
		this.strokeNode.dashstyle = 'solid';
	}
};

/**
 * Function: updateVmlShape
 *
 * Updates the bounds or points of the specified VML node and
 * updates the inner children to reflect the changes.
 */
mxShape.prototype.updateVmlShape = function(node)
{
	node.strokeweight = (this.strokewidth * this.scale) + 'px';

	// Dash pattern needs updating as it depends on strokeweight in VML
	if (this.strokeNode != null)
	{
		this.updateVmlDashStyle();
	}
	
	// Updates the offset of the shadow
	if (this.shadowNode != null)
	{
		var dx = Math.round(mxConstants.SHADOW_OFFSET_X * this.scale);
		var dy = Math.round(mxConstants.SHADOW_OFFSET_Y * this.scale);
		this.shadowNode.offset = dx + 'px,' + dy + 'px';
	}

	if (this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
		!isNaN(this.bounds.width) && !isNaN(this.bounds.height))
	{
		var f = 1;

		var w = Math.max(0, Math.round(this.bounds.width));
		var h = Math.max(0, Math.round(this.bounds.height));
		
		// Groups and shapes need a coordsize
		if (this.points != null || node.nodeName == 'shape' || node.nodeName == 'group')
		{
			var tmp = (node.parentNode.nodeName == 'group') ? 1 : this.vmlScale;
			node.coordsize = (w * tmp) + ',' + (h * tmp);
		}
		else if (node.parentNode.nodeName == 'group')
		{
			f = this.vmlScale;
		}
		
		// Only top-level nodes are non-relative and rotated
		if (node.parentNode != this.node)
		{
			node.style.left = Math.round(this.bounds.x * f) + 'px';
			node.style.top = Math.round(this.bounds.y * f) + 'px';
			
			if (this.points == null)
			{
				if (this.rotation != null && this.rotation != 0)
				{
					node.style.rotation = this.rotation;
				}
				else if (node.style.rotation != null)
				{
					node.style.rotation = '';
				}
			}
		}
		
		node.style.width = (w * f) + 'px';
		node.style.height = (h * f) + 'px';
	}
	
	if (this.points != null && node.nodeName != 'group')
	{
		if (node.nodeName == 'polyline' && node.points != null)
		{
			var points = '';
			
			for (var i = 0; i < this.points.length; i++)
			{
				points += this.points[i].x + ',' + this.points[i].y + ' ';
			}
			
			node.points.value = points;
			
			node.style.left = null;
			node.style.top = null;
			node.style.width = null;
			node.style.height = null;
		}
		else if (this.bounds != null)
		{
			var points = this.createPoints('m', 'l', 'c', true);
			
			// Smooth style for VML (experimental)
			if (this.style != null && this.style[mxConstants.STYLE_SMOOTH])
			{
				var pts = this.points;
				var n = pts.length;
				
				if (n > 3)
				{
					var x0 = this.bounds.x;
					var y0 = this.bounds.y;
					points = 'm ' + Math.round(pts[0].x - x0) + ' ' + Math.round(pts[0].y - y0) + ' qb';
					
					for (var i = 1; i < n - 1; i++)
					{
						points += ' ' + Math.round(pts[i].x - x0) + ' ' + Math.round(pts[i].y - y0);
					}

					points += ' nf l ' + Math.round(pts[n - 1].x - x0) + ' ' + Math.round(pts[n - 1].y - y0);
				}
			}

			node.path = points + ' e';
		}
	}
};

/**
 * Function: updateSvgBounds
 * 
 * Updates the bounds of the given node using <bounds>.
 */
mxShape.prototype.updateSvgBounds = function(node)
{
	var w = this.bounds.width;
	var h = this.bounds.height;
	
	if (this.isRounded && !(this.crisp && mxClient.IS_IE))
	{
		node.setAttribute('x', this.bounds.x);
		node.setAttribute('y', this.bounds.y);
		node.setAttribute('width', w);
		node.setAttribute('height', h);
	}
	else
	{
		// Workaround for crisp shape-rendering in IE9
		var dd = (this.crisp && mxClient.IS_IE) ? 0.5 : 0;
		node.setAttribute('x', Math.round(this.bounds.x) + dd);
		node.setAttribute('y', Math.round(this.bounds.y) + dd);

		w = Math.round(w);
		h = Math.round(h);
		
		node.setAttribute('width', w);
		node.setAttribute('height', h);
	}

	if (this.isRounded)
	{
		var f = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;

		if (this.style != null)
		{
			f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, f) / 100;
		}
		
		var r = Math.min(w * f,  h * f);
		node.setAttribute('rx', r);
		node.setAttribute('ry', r);
	}

	this.updateSvgTransform(node, node == this.shadowNode);
};

/**
 * Function: updateSvgPath
 * 
 * Updates the path of the given node using <points>.
 */
mxShape.prototype.updateSvgPath = function(node)
{
	var d = this.createPoints('M', 'L', 'C', false);
	
	if (d != null)
	{
		node.setAttribute('d', d);
		
		// Smooth style for SVG (experimental)
		if (this.style != null && this.style[mxConstants.STYLE_SMOOTH])
		{
			var pts = this.points;
			var n = pts.length;
			
			if (n > 3)
			{
				var points = 'M '+pts[0].x+' '+pts[0].y+' ';
				points += ' Q '+pts[1].x + ' ' + pts[1].y + ' ' +
					' '+pts[2].x + ' ' + pts[2].y;
				
				for (var i = 3; i < n; i++)
				{
					points += ' T ' + pts[i].x + ' ' + pts[i].y;
				}

				node.setAttribute('d', points);
			}
		}

		node.removeAttribute('x');
		node.removeAttribute('y');
		node.removeAttribute('width');
		node.removeAttribute('height');
	}
};

/**
 * Function: updateSvgScale
 *
 * Updates the properties of the given node that depend on the scale and checks
 * the crisp rendering attribute.
 */
mxShape.prototype.updateSvgScale = function(node)
{
	node.setAttribute('stroke-width', Math.round(Math.max(1, this.strokewidth * this.scale)));

	if (this.isDashed)
	{
		var phase = Math.max(1, Math.round(3 * this.scale * this.strokewidth));
		node.setAttribute('stroke-dasharray', phase + ' ' + phase);
	}

	if (this.crisp && (this.roundedCrispSvg || this.isRounded != true) &&
		(this.rotation == null || this.rotation == 0))
	{
		node.setAttribute('shape-rendering', 'crispEdges');
	}
	else
	{
		node.removeAttribute('shape-rendering');
	}
};

/**
 * Function: updateSvgShape
 *
 * Updates the bounds or points of the specified SVG node and
 * updates the inner children to reflect the changes.
 */
mxShape.prototype.updateSvgShape = function(node)
{
	if (this.points != null && this.points[0] != null)
	{
		this.updateSvgPath(node);
	}
	else if (this.bounds != null)
	{
		this.updateSvgBounds(node);
	}
	
	this.updateSvgScale(node);
};

/**
 * Function: getSvgShadowTransform
 * 
 * Returns the current transformation for SVG shadows.
 */
mxShape.prototype.getSvgShadowTransform = function(node, shadow)
{
	var dx = mxConstants.SHADOW_OFFSET_X * this.scale;
	var dy = mxConstants.SHADOW_OFFSET_Y * this.scale;
	
	return 'translate(' + dx + ' ' + dy + ')';
};

/**
 * Function: updateSvgTransform
 * 
 * Updates the tranform of the given node.
 */
mxShape.prototype.updateSvgTransform = function(node, shadow)
{
	var st = (shadow) ? this.getSvgShadowTransform() : '';
	
	if (this.rotation != null && this.rotation != 0)
	{
		var cx = this.bounds.x + this.bounds.width / 2;
		var cy = this.bounds.y + this.bounds.height / 2;
		node.setAttribute('transform', 'rotate(' + this.rotation + ',' + cx + ',' + cy + ') ' + st);
	}
	else
	{
		if (shadow)
		{
			node.setAttribute('transform', st);
		}
		else
		{
			node.removeAttribute('transform');
		}
	}
};

/**
 * Function: reconfigure
 *
 * Reconfigures this shape. This will update the colors etc in
 * addition to the bounds or points.
 */
mxShape.prototype.reconfigure = function()
{
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		if (this.innerNode != null)
		{
			this.configureSvgShape(this.innerNode);
		}
		else
		{
			this.configureSvgShape(this.node);
		}

		if (this.insertGradientNode != null)
		{
			this.insertGradient(this.insertGradientNode);
			this.insertGradientNode = null;
		}
	}
	else if (mxUtils.isVml(this.node))
	{
		this.node.style.visibility = 'hidden';
		this.configureVmlShape(this.node);
		this.node.style.visibility = 'visible';
	}
	else
	{
		this.node.style.visibility = 'hidden';
		this.configureHtmlShape(this.node);
		this.node.style.visibility = 'visible';
	}
};

/**
 * Function: redraw
 *
 * Invokes <redrawSvg>, <redrawVml> or <redrawHtml> depending on the
 * dialect of the shape.
 */
mxShape.prototype.redraw = function()
{
	this.updateBoundingBox();
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		this.redrawSvg();
	}
	else if (mxUtils.isVml(this.node))
	{
		this.node.style.visibility = 'hidden';
		this.redrawVml();
		this.node.style.visibility = 'visible';
	}
	else
	{
		this.redrawHtml();
	}
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
		this.augmentBoundingBox(bbox);
		
		var rot = Number(mxUtils.getValue(this.style, mxConstants.STYLE_ROTATION, 0));
		
		if (rot != 0)
		{
			bbox = mxUtils.getBoundingBox(bbox, rot);
		}
		
		bbox.x = Math.floor(bbox.x);
		bbox.y = Math.floor(bbox.y);
		// TODO: Fix rounding errors
		bbox.width = Math.ceil(bbox.width);
		bbox.height = Math.ceil(bbox.height);

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
	return this.bounds.clone();
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
 * Function: redrawSvg
 *
 * Redraws this SVG shape by invoking <updateSvgShape> on this.node,
 * this.innerNode and this.shadowNode.
 */
mxShape.prototype.redrawSvg = function()
{
	if (this.innerNode != null)
	{
		this.updateSvgShape(this.innerNode);
		
		if (this.shadowNode != null)
		{
			this.updateSvgShape(this.shadowNode);
		}
	}
	else
	{
		this.updateSvgShape(this.node);

		// Updates the transform of the shadow
		if (this.shadowNode != null)
		{
			this.shadowNode.setAttribute('transform',  this.getSvgShadowTransform());
		}
	}
	
	this.updateSvgGlassPane();
};

/**
 * Function: updateVmlGlassPane
 * 
 * Draws the glass overlay if mxConstants.STYLE_GLASS is 1.
 */
mxShape.prototype.updateVmlGlassPane = function()
{
	// Currently only used in mxLabel. Most shapes would have to be changed to use
	// a group node in VML which might affect performance for glass-less cells.
	if (this.bounds != null && this.node.nodeName == 'group' && this.style != null &&
		mxUtils.getValue(this.style, mxConstants.STYLE_GLASS, 0) == 1)
	{
		// Glass overlay
		if (this.node.glassOverlay == null)
		{
			// Creates glass overlay
			this.node.glassOverlay = document.createElement('v:shape');
			this.node.glassOverlay.setAttribute('filled', 'true');
			this.node.glassOverlay.setAttribute('fillcolor', 'white');
			this.node.glassOverlay.setAttribute('stroked', 'false');
			
			var fillNode = document.createElement('v:fill');
			fillNode.setAttribute('type', 'gradient');
			fillNode.setAttribute('color', 'white');
			fillNode.setAttribute('color2', 'white');
			fillNode.setAttribute('opacity', '90%');
			fillNode.setAttribute('o:opacity2', '15%');
			fillNode.setAttribute('angle', '180');
			
			this.node.glassOverlay.appendChild(fillNode);
			this.node.appendChild(this.node.glassOverlay);
		}
		
		var size = 0.4;
		
		// TODO: Mask with rectangle or rounded rectangle of label
		var b = this.bounds;
		var sw = Math.ceil(this.strokewidth * this.scale / 2 + 1);
		var d = 'm ' + (-sw) + ' ' + (-sw) + ' l ' + (-sw) + ' ' + Math.round(b.height * size) +
			' c ' + Math.round(b.width * 0.3) + ' ' + Math.round(b.height * 0.6) +
			' ' + Math.round(b.width * 0.7) + ' ' + Math.round(b.height * 0.6) +
			' ' + Math.round(b.width + sw) + ' ' + Math.round(b.height * size) +
			' l '+Math.round(b.width + sw)+' ' + (-sw) + ' x e';
		this.node.glassOverlay.style.position = 'absolute';
		this.node.glassOverlay.style.width = b.width + 'px';
		this.node.glassOverlay.style.height = b.height + 'px';
		this.node.glassOverlay.setAttribute('coordsize',
				Math.round(this.bounds.width) + ',' +
				Math.round(this.bounds.height));
		this.node.glassOverlay.setAttribute('path', d);
	}
	else if (this.node.glassOverlay != null)
	{
		this.node.glassOverlay.parentNode.removeChild(this.node.glassOverlay);
		this.node.glassOverlay = null;
	}
};

/**
 * Function: updateSvgGlassPane
 *
 * Draws the glass overlay if mxConstants.STYLE_GLASS is 1.
 */
mxShape.prototype.updateSvgGlassPane = function()
{
	if (this.node.nodeName == 'g' && this.style != null &&
		mxUtils.getValue(this.style, mxConstants.STYLE_GLASS, 0) == 1)
	{
		// Glass overlay
		if (this.node.glassOverlay == null)
		{
			// Glass overlay gradient
			if (this.node.ownerSVGElement.glassGradient == null)
			{
				// Creates glass overlay gradient
				var glassGradient = document.createElementNS(mxConstants.NS_SVG, 'linearGradient');
				glassGradient.setAttribute('x1', '0%');
				glassGradient.setAttribute('y1', '0%');
				glassGradient.setAttribute('x2', '0%');
				glassGradient.setAttribute('y2', '100%');
				
				var stop1 = document.createElementNS(mxConstants.NS_SVG, 'stop');
				stop1.setAttribute('offset', '0%');
				stop1.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.9');
				glassGradient.appendChild(stop1);
				
				var stop2 = document.createElementNS(mxConstants.NS_SVG, 'stop');
				stop2.setAttribute('offset', '100%');
				stop2.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.1');
				glassGradient.appendChild(stop2);
				
				// Finds a unique ID for the gradient
				var prefix = 'mx-glass-gradient-';
				var counter = 0;
				
				while (document.getElementById(prefix+counter) != null)
				{
					counter++;
				}
				
				glassGradient.setAttribute('id', prefix+counter);
				this.node.ownerSVGElement.appendChild(glassGradient);
				this.node.ownerSVGElement.glassGradient = glassGradient;
			}
			
			// Creates glass overlay
			this.node.glassOverlay = document.createElementNS(mxConstants.NS_SVG, 'path');
			// LATER: Not sure what the behaviour is for mutiple SVG elements in page.
			// Probably its possible that this points to an element in another SVG
			// node which when removed will result in an undefined background.
			var id = this.node.ownerSVGElement.glassGradient.getAttribute('id');
			this.node.glassOverlay.setAttribute('style', 'fill:url(#'+id+');');
			this.node.appendChild(this.node.glassOverlay);
		}
		
		var size = 0.4;
		
		// TODO: Mask with rectangle or rounded rectangle of label
		var b = this.bounds;
		var sw = Math.ceil(this.strokewidth * this.scale / 2);
		var d = 'm ' + (b.x - sw) + ',' + (b.y - sw) +
			' L ' + (b.x - sw) + ',' + (b.y + b.height * size) +
			' Q '+ (b.x + b.width * 0.5) + ',' + (b.y + b.height * 0.7) + ' '+
			(b.x + b.width + sw) + ',' + (b.y + b.height * size) +
			' L ' + (b.x + b.width + sw) + ',' + (b.y - sw) + ' z';
		this.node.glassOverlay.setAttribute('d', d);
	}
	else if (this.node.glassOverlay != null)
	{
		this.node.glassOverlay.parentNode.removeChild(this.node.glassOverlay);
		this.node.glassOverlay = null;
	}
};

/**
 * Function: redrawVml
 *
 * Redraws this VML shape by invoking <updateVmlShape> on this.node.
 */
mxShape.prototype.redrawVml = function()
{
	this.node.style.visibility = 'hidden';
	this.updateVmlShape(this.node);
	this.updateVmlGlassPane();
	this.node.style.visibility = 'visible';
};

/**
 * Function: redrawHtml
 *
 * Redraws this HTML shape by invoking <updateHtmlShape> on this.node.
 */
mxShape.prototype.redrawHtml = function()
{
	this.updateHtmlShape(this.node);
};

/**
 * Function: getRotation
 * 
 * Returns the current rotation including direction.
 */
mxShape.prototype.getRotation = function()
{
	var rot = this.rotation || 0;
	
	// Default direction is east (ignored if rotation exists)
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
 * Function: createPath
 *
 * Creates an <mxPath> for the specified format and origin. The path object is
 * then passed to <redrawPath> and <mxPath.getPath> is returned.
 */
mxShape.prototype.createPath = function(arg)
{
	var x = this.bounds.x;
	var y = this.bounds.y;
	var w = this.bounds.width;
	var h = this.bounds.height;
	var dx = 0;
	var dy = 0;
	
	// Inverts bounds for stencils which are rotated 90 or 270 degrees
	if (this.direction == 'north' || this.direction == 'south')
	{
		dx = (w - h) / 2;
		dy = (h - w) / 2;
		x += dx;
		y += dy;
		var tmp = w;
		w = h;
		h = tmp;
	}
	
	var rotation = this.getRotation();
	var path = null;
	
	if (this.dialect == mxConstants.DIALECT_SVG)
	{
		path = new mxPath('svg');
		path.setTranslate(x, y);

		// Adds rotation as a separate transform
		if (rotation != 0)
		{
			var cx = this.bounds.getCenterX();
			var cy = this.bounds.getCenterY();
			var transform = 'rotate(' + rotation + ' ' + cx + ' ' + cy + ')';
			
			if (this.innerNode != null)
			{
				this.innerNode.setAttribute('transform', transform);
			}
			
			if (this.foreground != null)
			{
				this.foreground.setAttribute('transform', transform);
			}

			// Shadow needs different transform so that it ends up on the correct side
			if (this.shadowNode != null)
			{
				this.shadowNode.setAttribute('transform',  this.getSvgShadowTransform() + ' ' + transform);
			}
		}
	}
	else
	{
		path = new mxPath('vml');
		path.setTranslate(dx, -dx);
		path.scale = this.vmlScale;
		
		if (rotation != 0)
		{
			this.node.style.rotation = rotation;
		}
	}
	
	this.redrawPath(path, x, y, w, h, arg);
	
	return path.getPath();
};

/**
 * Function: redrawPath
 *
 * Draws the path for this shape. This implementation is empty. See
 * <mxActor> and <mxCylinder> for implementations. 
 */
mxShape.prototype.redrawPath = function(path, x, y, w, h)
{
	// do nothing
};
