/**
 * $Id: mxStencil.js,v 1.91 2012-07-16 10:22:44 gaudenz Exp $
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
 * The strokewidth attribute defines a fixed strokewidth for the shape. It
 * can contain a numeric value or the keyword "inherit", which means that the
 * strokeWidth from the cell's style will be used and muliplied with the shape's
 * scale. If numeric values are used, those are multiplied with the minimum
 * scale used to render the stencil inside the shape's bounds.
 * 
 * Constructor: mxStencilShape
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
 * Function: evaluateAttribute
 *
 * Gets the attribute for the given name from the given node. If the attribute
 * does not exist then the text content of the node is evaluated and if it is
 * a function it is invoked with <state> as the only argument and the return
 * value is used as the attribute value to be returned.
 */
mxStencil.prototype.evaluateAttribute = function(node, attribute, state)
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
				result = funct(state);
			}
		}
	}
	
	return result;
};

/**
 * Function: renderDom
 *
 * Updates the SVG or VML shape.
 */
mxStencil.prototype.renderDom = function(shape, bounds, parentNode, state)
{
	var vml = shape.dialect != mxConstants.DIALECT_SVG;
	var vmlScale = (document.documentMode == 8) ? 1 : shape.vmlScale;
	var rotation = shape.rotation || 0;
	var inverse = false;
	
	// New styles for shape flipping the stencil
	var flipH = shape.style[mxConstants.STYLE_STENCIL_FLIPH];
	var flipV = shape.style[mxConstants.STYLE_STENCIL_FLIPV];
	
	if (flipH ? !flipV : flipV)
	{
		rotation *= -1;
	}
	
	// Default direction is east (ignored if rotation exists)
	if (shape.direction != null)
	{
		if (shape.direction == 'north')
		{
			rotation += 270;
		}
		else if (shape.direction == 'west')
		{
			rotation += 180;
		}
		else if (shape.direction == 'south')
		{
			rotation += 90;
		}

		inverse = (shape.direction == 'north' || shape.direction == 'south');
	}

	if (flipH && flipV)
	{
		rotation += 180;
		flipH = false;
		flipV = false;
	}

	// SVG transform should be applied on all child shapes
	var svgTransform = '';

	// Implements direction style and vertical/horizontal flip
	// via container transformation.
	if (vml)
	{
		if (flipH)
		{
			parentNode.style.flip = 'x';
		}
		else if (flipV)
		{
			parentNode.style.flip = 'y';
		}
		
		if (rotation != 0)
		{
			parentNode.style.rotation = rotation;
		}
	}
	else
	{
		if (flipH || flipV)
		{
			var sx = 1;
			var sy = 1;
			var dx = 0;
			var dy = 0;
			
			if (flipH)
			{
				sx = -1;
				dx = -bounds.width - 2 * bounds.x;
			}
			
			if (flipV)
			{
				sy = -1;
				dy = -bounds.height - 2 * bounds.y;
			}
			
			svgTransform = 'scale(' + sx + ' ' + sy + ') translate(' + dx + ' ' + dy + ')';
		}
		
		// Adds rotation as a separate transform
		if (rotation != 0)
		{
			var cx = bounds.getCenterX();
			var cy = bounds.getCenterY();
			svgTransform += ' rotate(' + rotation + ' ' + cx + ' ' + cy + ')';
		}
	}

	var background = (state == null);

	if (this.bgNode != null || this.fgNode != null)
	{
		var x0 = (vml && state == null) ? 0 : bounds.x;
		var y0 = (vml && state == null) ? 0 : bounds.y;
		var sx = bounds.width / this.w0;
		var sy = bounds.height / this.h0;

		// Stores current location inside path
		this.lastMoveX = 0;
		this.lastMoveY = 0;
		
		if (inverse)
		{
			sy = bounds.width / this.h0;
			sx = bounds.height / this.w0;
			
			var delta = (bounds.width - bounds.height) / 2;
			
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
				x0 += (bounds.height - this.w0 * sx) / 2;
				y0 += (bounds.width - this.h0 * sy) / 2;
			}
			else
			{
				x0 += (bounds.width - this.w0 * sx) / 2;
				y0 += (bounds.height - this.h0 * sy) / 2;
			}
		}
		
		// Workaround to improve VML rendering precision.
		if (vml)
		{
			sx *= vmlScale;
			sy *= vmlScale;
			x0 *= vmlScale;
			y0 *= vmlScale;
		}
		
		var minScale = Math.min(sx, sy);

		// Stack of states for save/restore ops
		var stack = [];
		
		var currentState = (state != null) ? state :
		{
			fillColorAssigned: false,
			fill: shape.fill,
			stroke: shape.stroke,
			strokeWidth: (this.strokewidth == 'inherit') ?
				Number(shape.strokewidth) * shape.scale :
				Number(this.strokewidth) * minScale / ((vml) ? vmlScale : 1),
			dashed: shape.isDashed,
			dashpattern: [3, 3],
			alpha: shape.opacity,
			linejoin: 'miter',
			fontColor: '#000000',
			fontSize: mxConstants.DEFAULT_FONTSIZE,
			fontFamily: mxConstants.DEFAULT_FONTFAMILY,
			fontStyle: 0
		};

		var currentPath = null;
		var currentPoints = null;
		
		var configurePath = function(path, state)
		{
			var sw = Math.max(1, state.strokeWidth);
			
			if (vml)
			{
				path.strokeweight = Math.round(sw) + 'px';
				
				if (state.fill != null)
				{
					// Gradient in foregrounds not supported because special gradients
					// with bounds must be created for each element in graphics-canvases
					var gradient = (!state.fillColorAssigned) ? shape.gradient : null;
					var fill = document.createElement('v:fill');
					shape.updateVmlFill(fill, state.fill, gradient, shape.gradientDirection, state.alpha);
					path.appendChild(fill);
				}
				else
				{
					path.filled = 'false';
				}
				
				if (state.stroke != null)
				{
					path.stroked = 'true';
					path.strokecolor = state.stroke;
				}
				else
				{
					path.stroked = 'false';
				}
				
				path.style.position = 'absolute';
			}
			else
			{
				path.setAttribute('stroke-width', sw);
	
				if (state.fill != null && state.fillColorAssigned)
				{
					path.setAttribute('fill', state.fill);
				}
				
				if (state.stroke != null)
				{
					path.setAttribute('stroke', state.stroke);
				}
			}
		};
		
		var addToPath = function(s)
		{
			if (currentPath != null && currentPoints != null)
			{
				currentPoints.push(s);
			}
		};
		
		var round = function(value)
		{
			return (vml) ? Math.round(value) : value;
		};

		// Will be moved to a hook later for example to set text values
		var renderNode = function(node)
		{
			var name = node.nodeName;
			
			var fillOp = name == 'fill';
			var strokeOp = name == 'stroke';
			var fillStrokeOp = name == 'fillstroke';
			
			if (name == 'save')
			{
				stack.push(currentState);
				currentState = mxUtils.clone(currentState);
			}
			else if (name == 'restore')
			{
				currentState = stack.pop();
			}
			else if (name == 'path')
			{
				currentPoints = [];
				
				if (vml)
				{
					currentPath = document.createElement('v:shape');
					configurePath.call(this, currentPath, currentState);
					var w = Math.round(bounds.width) * vmlScale;
					var h = Math.round(bounds.height) * vmlScale;
					currentPath.style.width = w + 'px';
					currentPath.style.height = h + 'px';
					currentPath.coordsize = w + ',' + h;
				}
				else
				{
					currentPath = document.createElementNS(mxConstants.NS_SVG, 'path');
					configurePath.call(this, currentPath, currentState);
					
					if (svgTransform.length > 0)
					{
						currentPath.setAttribute('transform', svgTransform);
					}
					
					if (node.getAttribute('crisp') == '1')
					{
						currentPath.setAttribute('shape-rendering', 'crispEdges');
					}
				}
				
				// Renders the elements inside the given path
				var childNode = node.firstChild;
				
				while (childNode != null)
				{
					if (childNode.nodeType == mxConstants.NODETYPE_ELEMENT)
					{
						renderNode.call(this, childNode);
					}
					
					childNode = childNode.nextSibling;
				}
				
				// Ends the current path
				if (vml)
				{
					addToPath('e');
					currentPath.path = currentPoints.join('');
				}
				else
				{
					currentPath.setAttribute('d', currentPoints.join(''));
				}
			}
			else if (name == 'move')
			{
				var op = (vml) ? 'm' : 'M';
				this.lastMoveX = round(x0 + Number(node.getAttribute('x')) * sx);
				this.lastMoveY = round(y0 + Number(node.getAttribute('y')) * sy);
				addToPath(op + ' ' + this.lastMoveX + ' ' + this.lastMoveY);
			}
			else if (name == 'line')
			{
				var op = (vml) ? 'l' : 'L';
				this.lastMoveX = round(x0 + Number(node.getAttribute('x')) * sx);
				this.lastMoveY = round(y0 + Number(node.getAttribute('y')) * sy);
				addToPath(op + ' ' + this.lastMoveX + ' ' +	this.lastMoveY);
			}
			else if (name == 'quad')
			{
				if (vml)
				{
					var cpx0 = this.lastMoveX;
					var cpy0 = this.lastMoveY;
					var qpx1 = x0 + Number(node.getAttribute('x1')) * sx;
					var qpy1 = y0 + Number(node.getAttribute('y1')) * sy;
					var cpx3 = x0 + Number(node.getAttribute('x2')) * sx;
					var cpy3 = y0 + Number(node.getAttribute('y2')) * sy;
					
					var cpx1 = cpx0 + 2/3 * (qpx1 - cpx0);
					var cpy1 = cpy0 + 2/3 * (qpy1 - cpy0);
					
					var cpx2 = cpx3 + 2/3 * (qpx1 - cpx3);
					var cpy2 = cpy3 + 2/3 * (qpy1 - cpy3);
					
					addToPath('c ' + Math.round(cpx1) + ' ' + Math.round(cpy1) + ' ' +
							Math.round(cpx2) + ' ' + Math.round(cpy2) + ' ' +
							Math.round(cpx3) + ' ' + Math.round(cpy3));
					
					this.lastMoveX = cpx3;
					this.lastMoveY = cpy3;
				}
				else
				{
					this.lastMoveX = x0 + Number(node.getAttribute('x2')) * sx;
					this.lastMoveY = y0 + Number(node.getAttribute('y2')) * sy;

					addToPath('Q ' + (x0 + Number(node.getAttribute('x1')) * sx) + ' ' +
							(y0 + Number(node.getAttribute('y1')) * sy) + ' ' +
							this.lastMoveX + ' ' + this.lastMoveY);
				}
			}
			else if (name == 'curve')
			{
				var op = (vml) ? 'c' : 'C';
				this.lastMoveX = round(x0 + Number(node.getAttribute('x3')) * sx);
				this.lastMoveY = round(y0 + Number(node.getAttribute('y3')) * sy);

				addToPath(op + ' ' + round(x0 + Number(node.getAttribute('x1')) * sx) + ' ' +
						round(y0 + Number(node.getAttribute('y1')) * sy) + ' ' +
						round(x0 + Number(node.getAttribute('x2')) * sx) + ' ' +
						round(y0 + Number(node.getAttribute('y2')) * sy) + ' ' +
						this.lastMoveX + ' ' + this.lastMoveY);
			}
			else if (name == 'close')
			{
				addToPath((vml) ? 'x' : 'Z');
			}
			else if (name == 'rect' || name == 'roundrect')
			{
				var rounded = name == 'roundrect';
				var x = round(x0 + Number(node.getAttribute('x')) * sx);
				var y = round(y0 + Number(node.getAttribute('y')) * sy);
				var w = round(Number(node.getAttribute('w')) * sx);
				var h = round(Number(node.getAttribute('h')) * sy);
				
				var arcsize = node.getAttribute('arcsize');
				
				if (arcsize == 0)
				{
					arcsize = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;
				}
				
				if (vml)
				{
					// LATER: Use HTML for non-rounded, gradientless rectangles
					currentPath = document.createElement((rounded) ? 'v:roundrect' : 'v:rect');
					currentPath.style.left = x + 'px';
					currentPath.style.top = y + 'px';
					currentPath.style.width = w + 'px';
					currentPath.style.height = h + 'px';
					
					if (rounded)
					{
						currentPath.setAttribute('arcsize', String(arcsize) + '%');
					}
				}
				else
				{
					currentPath = document.createElementNS(mxConstants.NS_SVG, 'rect');
					currentPath.setAttribute('x', x);
					currentPath.setAttribute('y', y);
					currentPath.setAttribute('width', w);
					currentPath.setAttribute('height', h);
					
					if (rounded)
					{
						var factor = Number(arcsize) / 100;
						var r = Math.min(w * factor, h * factor);
						currentPath.setAttribute('rx', r);
						currentPath.setAttribute('ry', r);
					}
					
					if (svgTransform.length > 0)
					{
						currentPath.setAttribute('transform', svgTransform);
					}
					
					if (node.getAttribute('crisp') == '1')
					{
						currentPath.setAttribute('shape-rendering', 'crispEdges');
					}
				}
				
				configurePath.call(this, currentPath, currentState);
			}
			else if (name == 'ellipse')
			{
				var x = round(x0 + Number(node.getAttribute('x')) * sx);
				var y = round(y0 + Number(node.getAttribute('y')) * sy);
				var w = round(Number(node.getAttribute('w')) * sx);
				var h = round(Number(node.getAttribute('h')) * sy);
				
				if (vml)
				{
					currentPath = document.createElement('v:arc');
					currentPath.startangle = '0';
					currentPath.endangle = '360';
					currentPath.style.left = x + 'px';
					currentPath.style.top = y + 'px';
					currentPath.style.width = w + 'px';
					currentPath.style.height = h + 'px';
				}
				else
				{
					currentPath = document.createElementNS(mxConstants.NS_SVG, 'ellipse');
					currentPath.setAttribute('cx', x + w / 2);
					currentPath.setAttribute('cy', y + h / 2);
					currentPath.setAttribute('rx', w / 2);
					currentPath.setAttribute('ry', h / 2);
					
					if (svgTransform.length > 0)
					{
						currentPath.setAttribute('transform', svgTransform);
					}
				}
				
				configurePath.call(this, currentPath, currentState);
			}
			else if (name == 'arc')
			{
				var r1 = Number(node.getAttribute('rx')) * sx;
				var r2 = Number(node.getAttribute('ry')) * sy;
				var angle = Number(node.getAttribute('x-axis-rotation'));
				var largeArcFlag = Number(node.getAttribute('large-arc-flag'));
				var sweepFlag = Number(node.getAttribute('sweep-flag'));
				var x = x0 + Number(node.getAttribute('x')) * sx;
				var y = y0 + Number(node.getAttribute('y')) * sy;
				
				if (vml)
				{
					var curves = mxUtils.arcToCurves(this.lastMoveX, this.lastMoveY, r1, r2, angle, largeArcFlag, sweepFlag, x, y);
					
		            for (var i = 0; i < curves.length; i += 6) 
		            {
                        addToPath('c' + ' ' + Math.round(curves[i]) + ' ' + Math.round(curves[i + 1]) + ' ' +
								Math.round(curves[i + 2]) + ' ' + Math.round(curves[i + 3]) + ' ' +
								Math.round(curves[i + 4]) + ' ' + Math.round(curves[i + 5]));
		                
						this.lastMoveX = curves[i + 4];
						this.lastMoveY = curves[i + 5]; 
		            }
				}
				else
				{
					addToPath('A ' + r1 + ',' + r2 + ' ' + angle + ' ' + largeArcFlag + ',' + sweepFlag + ' ' + x + ',' + y);
					this.lastMoveX = x0 + x;
					this.lastMoveY = y0 + y;
				}
			}
			else if (name == 'image')
			{
				var src = this.evaluateAttribute(node, 'src', shape.state);

				if (src != null)
				{
					var x = round(x0 + Number(node.getAttribute('x')) * sx);
					var y = round(y0 + Number(node.getAttribute('y')) * sy);
					var w = round(Number(node.getAttribute('w')) * sx);
					var h = round(Number(node.getAttribute('h')) * sy);
					
					// TODO: _Not_ providing an aspect in the shapes format has the advantage
					// of not needing a callback to adjust the image in VML. Since the shape
					// developer can specify the aspect via width and height this should OK.
					//var aspect = node.getAttribute('aspect') != '0';
					var aspect = false;
					var flipH = node.getAttribute('flipH') == '1';
					var flipV = node.getAttribute('flipV') == '1';
					
					if (vml)
					{
						currentPath = document.createElement('v:image');
						currentPath.style.filter = 'alpha(opacity=' + currentState.alpha + ')';
						currentPath.style.left = x + 'px';
						currentPath.style.top = y + 'px';
						currentPath.style.width = w + 'px';
						currentPath.style.height = h + 'px';
						currentPath.src = src;
						
						if (flipH && flipV)
						{
							currentPath.style.rotation = '180';
						}
						else if (flipH)
						{
							currentPath.style.flip = 'x';
						}
						else if (flipV)
						{
							currentPath.style.flip = 'y';
						}
					}
					else
					{
						currentPath = document.createElementNS(mxConstants.NS_SVG, 'image');
						currentPath.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', src);
						currentPath.setAttribute('opacity', currentState.alpha / 100);
						currentPath.setAttribute('x', x);
						currentPath.setAttribute('y', y);
						currentPath.setAttribute('width', w);
						currentPath.setAttribute('height', h);
	
						if (!aspect)
						{
							currentPath.setAttribute('preserveAspectRatio', 'none');
						}
						
						if (flipH || flipV)
						{
							var scx = 1;
							var scy = 1;
							var dx = 0;
							var dy = 0;
							
							if (flipH)
							{
								scx = -1;
								dx = -w - 2 * x;
							}
							
							if (flipV)
							{
								scy = -1;
								dy = -h - 2 * y;
							}
							
							currentPath.setAttribute('transform', svgTransform + 'scale(' + scx + ' ' + scy + ')' +
									' translate('+dx+' '+dy+') ');
						}
						else
						{
							currentPath.setAttribute('transform', svgTransform);
						}
					}
					
					parentNode.appendChild(currentPath);
				}
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
					
					stencil.renderDom(shape, new mxRectangle(x, y, w, h), parentNode, currentState);
				}
			}
			// Additional labels are currently disabled. Needs fixing of VML
			// text positon, SVG text rotation and ignored baseline in FF
			else if (name == 'text')
			{
				var str = this.evaluateAttribute(node, 'str', shape.state);

				if (str != null)
				{
					var x = round(x0 + Number(node.getAttribute('x')) * sx);
					var y = round(y0 + Number(node.getAttribute('y')) * sy);
					var align = node.getAttribute('align') || 'left';
					var valign = node.getAttribute('valign') || 'top';
					
					if (vml)
					{
						// Renders a single line of text with full rotation support
						currentPath = document.createElement('v:shape');
						currentPath.style.position = 'absolute';
						currentPath.style.width = '1px';
						currentPath.style.height = '1px';
						currentPath.style.left = x + 'px';
						currentPath.style.top = y + 'px';
						
						var fill = document.createElement('v:fill');
						fill.color = currentState.fontColor;
						fill.on = 'true';
						currentPath.appendChild(fill);
						
						var stroke = document.createElement('v:stroke');
						stroke.on = 'false';
						currentPath.appendChild(stroke);
						
						var path = document.createElement('v:path');
						path.textpathok = 'true';
						path.v = 'm ' + x + ' ' + y + ' l ' + (x + 1) + ' ' + y;
						
						currentPath.appendChild(path);
						
						var tp = document.createElement('v:textpath');
						tp.style.cssText = 'v-text-align:' + align;
						tp.style.fontSize = Math.round(currentState.fontSize / vmlScale) + 'px';
						
						// FIXME: Font-family seems to be ignored for textpath
						tp.style.fontFamily = currentState.fontFamily;
						tp.string = str;
						tp.on = 'true';
						
						// Bold
						if ((currentState.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
						{
							tp.style.fontWeight = 'bold';
						}
						
						// Italic
						if ((currentState.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
						{
							tp.style.fontStyle = 'italic';
						}

						// FIXME: Text decoration not supported in textpath
						if ((currentState.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
						{
							tp.style.textDecoration = 'underline';
						}
						
						// LATER: Find vertical center for div via CSS if possible
						if (valign == 'top')
						{
							currentPath.style.top = (y + currentState.fontSize / 2) + 'px';
						}
						else if (valign == 'bottom')
						{
							currentPath.style.top = (y - currentState.fontSize / 3) + 'px';
						}
						
						currentPath.appendChild(tp);
					}
					else
					{
						currentPath = document.createElementNS(mxConstants.NS_SVG, 'text');
						currentPath.setAttribute('fill', currentState.fontColor);
						currentPath.setAttribute('font-family', currentState.fontFamily);
						currentPath.setAttribute('font-size', currentState.fontSize);
						currentPath.setAttribute('stroke', 'none');
						currentPath.setAttribute('x', x);
						currentPath.appendChild(document.createTextNode(str));
						
						// Bold
						if ((currentState.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
						{
							currentPath.setAttribute('font-weight', 'bold');
						}
						
						// Italic
						if ((currentState.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
						{
							currentPath.setAttribute('font-style', 'italic');
						}

						// Underline
						if ((currentState.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
						{
							currentPath.setAttribute('text-decoration', uline);
						}

						// Horizontal alignment
						if (align == 'left')
						{
							align = 'start';
						}
						else if (align == 'center')
						{
							align = 'middle';
						}
						else if (align == 'right')
						{
							align = 'end';
						}

						currentPath.setAttribute('text-anchor', align);

						// Vertical alignment
						// Uses dy because FF ignores alignment-baseline
						if (valign == 'top')
						{
							currentPath.setAttribute('y', y + currentState.fontSize / 5);
							currentPath.setAttribute('dy', '1ex');
						}
						else if (valign == 'middle')
						{
							currentPath.setAttribute('y', y + currentState.fontSize / 8);
							currentPath.setAttribute('dy', '0.5ex');
						}
						else
						{
							currentPath.setAttribute('y', y);
						}

						if (svgTransform.length > 0)
						{
							currentPath.setAttribute('transform', svgTransform);
						}
					}

					parentNode.appendChild(currentPath);
				}
			}
			else if (fillOp || strokeOp || fillStrokeOp)
			{
				if (currentPath != null)
				{
					var pattern = null;
					
					if (currentState.dashed)
					{
						var f = (vml) ? minScale : Number(currentPath.getAttribute('stroke-width'));
						var pat = [];
						
						for (var i = 0; i < currentState.dashpattern.length; i++)
						{
							pat.push(Math.max(1, Math.round(Number(currentState.dashpattern[i]) * f)));
						}
						
						pattern = pat.join(' ');
					}
					
					if (strokeOp || fillStrokeOp)
					{
						if (vml)
						{
							var stroke = document.createElement('v:stroke');
							stroke.endcap = currentState.linecap || 'flat';
							stroke.joinstyle = currentState.linejoin || 'miter';
							stroke.miterlimit = currentState.miterlimit || '10';
							currentPath.appendChild(stroke);
							
							// TODO: Dashpattern support in VML is limited, we should
							// map this to VML or allow for a separate VML dashstyle.
							if (pattern != null)
							{
								stroke.dashstyle = pattern;
							}
						}
						else
						{
							if (currentState.linejoin != null)
							{
								currentPath.setAttribute('stroke-linejoin', currentState.linejoin);
							}
							
							if (currentState.linecap != null)
							{
								// flat is called butt in SVG
								var value = currentState.linecap;
								
								if (value == 'flat')
								{
									value = 'butt';
								}
								
								currentPath.setAttribute('stroke-linecap', value);
							}
							
							if (currentState.miterlimit != null)
							{
								currentPath.setAttribute('stroke-miterlimit', currentState.miterlimit);
							}

							// Handles dash pattern
							if (pattern != null)
							{
								currentPath.setAttribute('stroke-dasharray', pattern);
							}
						}
					}
					
					// Adds the shadow
					if (background && shape.isShadow)
					{
						var dx = mxConstants.SHADOW_OFFSET_X * shape.scale;
						var dy = mxConstants.SHADOW_OFFSET_Y * shape.scale;
						
						// Adds the shadow
						if (vml)
						{
							var shadow = document.createElement('v:shadow');
							shadow.setAttribute('on', 'true');
							shadow.setAttribute('color', mxConstants.SHADOWCOLOR);
							shadow.setAttribute('offset', Math.round(dx) + 'px,' + Math.round(dy) + 'px');
							shadow.setAttribute('opacity', (mxConstants.SHADOW_OPACITY * 100) + '%');
							
							var stroke = document.createElement('v:stroke');
							stroke.endcap = currentState.linecap || 'flat';
							stroke.joinstyle = currentState.linejoin || 'miter';
							stroke.miterlimit = currentState.miterlimit || '10';
							
							if (pattern != null)
							{
								stroke.dashstyle = pattern;
							}
							
							shadow.appendChild(stroke);
							currentPath.appendChild(shadow);
						}
						else
						{
							var shadow = currentPath.cloneNode(true);
							shadow.setAttribute('stroke', mxConstants.SHADOWCOLOR);
							
							if (currentState.fill != null && (fillOp || fillStrokeOp))
							{
								shadow.setAttribute('fill', mxConstants.SHADOWCOLOR);
							}
							else
							{
								shadow.setAttribute('fill', 'none');
							}
							
							shadow.setAttribute('transform', 'translate(' + dx + ' ' + dy + ') ' +
									(shadow.getAttribute('transform') || ''));
							shadow.setAttribute('opacity', mxConstants.SHADOW_OPACITY);
							parentNode.appendChild(shadow);
						}
					}

					if (fillOp)
					{
						if (vml)
						{
							currentPath.stroked = 'false';
						}
						else
						{
							currentPath.setAttribute('stroke', 'none');
						}
					}
					else if (strokeOp)
					{
						if (vml)
						{
							currentPath.filled = 'false';
						}
						else
						{
							currentPath.setAttribute('fill', 'none');
						}
					}
					
					parentNode.appendChild(currentPath);
				}
				
				// Background was painted
				if (background)
				{
					background = false;
				}
			}
			else if (name == 'linecap')
			{
				currentState.linecap = node.getAttribute('cap');
			}
			else if (name == 'linejoin')
			{
				currentState.linejoin = node.getAttribute('join');
			}
			else if (name == 'miterlimit')
			{
				currentState.miterlimit = node.getAttribute('limit');
			}
			else if (name == 'dashed')
			{
				currentState.dashed = node.getAttribute('dashed') == '1';
			}
			else if (name == 'dashpattern')
			{
				var value = node.getAttribute('pattern');
				
				if (value != null && value.length > 0)
				{
					currentState.dashpattern = value.split(' ');
				}
			}
			else if (name == 'strokewidth')
			{
				currentState.strokeWidth = node.getAttribute('width') * minScale;
				
				if (vml)
				{
					currentState.strokeWidth /= vmlScale;
				}
			}
			else if (name == 'strokecolor')
			{
				currentState.stroke = node.getAttribute('color');
			}
			else if (name == 'fillcolor')
			{
				currentState.fill = node.getAttribute('color');
				currentState.fillColorAssigned = true;
			}
			else if (name == 'alpha')
			{
				currentState.alpha = Number(node.getAttribute('alpha'));
			}
			else if (name == 'fontcolor')
			{
				currentState.fontColor = node.getAttribute('color');
			}
			else if (name == 'fontsize')
			{
				currentState.fontSize = Number(node.getAttribute('size')) * minScale;
			}
			else if (name == 'fontfamily')
			{
				currentState.fontFamily = node.getAttribute('family');
			}
			else if (name == 'fontstyle')
			{
				currentState.fontStyle = Number(node.getAttribute('style'));
			}
		};

		// Adds a transparent rectangle in the background for hit-detection in SVG
		if (!vml)
		{
			var rect = document.createElementNS(mxConstants.NS_SVG, 'rect');
			rect.setAttribute('x', bounds.x);
			rect.setAttribute('y', bounds.y);
			rect.setAttribute('width', bounds.width);
			rect.setAttribute('height', bounds.height);
			rect.setAttribute('fill', 'none');
			rect.setAttribute('stroke', 'none');
			parentNode.appendChild(rect);
		}
		
		// Background switches to false after fill/stroke of the background
		if (this.bgNode != null)
		{
			var tmp = this.bgNode.firstChild;
			
			while (tmp != null)
			{
				if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT)
				{
					renderNode.call(this, tmp);
				}
				
				tmp = tmp.nextSibling;
			}
		}
		else
		{
			background = false;
		}
		
		if (this.fgNode != null)
		{
			var tmp = this.fgNode.firstChild;
			
			while (tmp != null)
			{
				if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT)
				{
					renderNode.call(this, tmp);
				}
				
				tmp = tmp.nextSibling;
			}
		}
	}
};

/**
 * Function: drawShape
 *
 * Draws this stencil inside the given bounds.
 */
mxStencil.prototype.drawShape = function(canvas, state, bounds, background)
{
	// TODO: Unify with renderDom, check performance of pluggable shape,
	// internal structure (array of special structs?), relative and absolute
	// coordinates (eg. note shape, process vs star, actor etc.), text rendering
	// and non-proportional scaling, how to implement pluggable edge shapes
	// (start, segment, end blocks), pluggable markers, how to implement
	// swimlanes (title area) with this API, add icon, horizontal/vertical
	// label, indicator for all shapes, rotation
	var node = (background) ? this.bgNode : this.fgNode;
	
	if (node != null)
	{
		var direction = mxUtils.getValue(state.style, mxConstants.STYLE_DIRECTION, null);
		var aspect = this.computeAspect(state, bounds, direction);
		var minScale = Math.min(aspect.width, aspect.height);
		var sw = (this.strokewidth == 'inherit') ?
				Number(mxUtils.getNumber(state.style, mxConstants.STYLE_STROKEWIDTH, 1)) * state.view.scale :
				Number(this.strokewidth) * minScale;
		this.lastMoveX = 0;
		this.lastMoveY = 0;
		canvas.setStrokeWidth(sw);

		var tmp = node.firstChild;
		
		while (tmp != null)
		{
			if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				this.drawNode(canvas, state, tmp, aspect);
			}
			
			tmp = tmp.nextSibling;
		}
		
		return true;
	}
	
	return false;
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
 * state - <mxCellState> for which the shape should be drawn.
 * bounds - <mxRectangle> that should contain the stencil.
 * direction - Optional direction of the shape to be darwn.
 */
mxStencil.prototype.computeAspect = function(state, bounds, direction)
{
	var x0 = bounds.x;
	var y0 = bounds.y;
	var sx = bounds.width / this.w0;
	var sy = bounds.height / this.h0;
	
	var inverse = (direction == 'north' || direction == 'south');

	if (inverse)
	{
		sy = bounds.width / this.h0;
		sx = bounds.height / this.w0;
		
		var delta = (bounds.width - bounds.height) / 2;

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
			x0 += (bounds.height - this.w0 * sx) / 2;
			y0 += (bounds.width - this.h0 * sy) / 2;
		}
		else
		{
			x0 += (bounds.width - this.w0 * sx) / 2;
			y0 += (bounds.height - this.h0 * sy) / 2;
		}
	}

	return new mxRectangle(x0, y0, sx, sy);
};

/**
 * Function: drawNode
 *
 * Draws this stencil inside the given bounds.
 */
mxStencil.prototype.drawNode = function(canvas, state, node, aspect)
{
	var name = node.nodeName;
	var x0 = aspect.x;
	var y0 = aspect.y;
	var sx = aspect.width;
	var sy = aspect.height;
	var minScale = Math.min(sx, sy);

	// LATER: Move to lookup table
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
				this.drawNode(canvas, state, childNode, aspect);
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
		this.lastMoveX = x0 + Number(node.getAttribute('x')) * sx;
		this.lastMoveY = y0 + Number(node.getAttribute('y')) * sy;
		canvas.moveTo(this.lastMoveX, this.lastMoveY);
	}
	else if (name == 'line')
	{
		this.lastMoveX = x0 + Number(node.getAttribute('x')) * sx;
		this.lastMoveY = y0 + Number(node.getAttribute('y')) * sy;
		canvas.lineTo(this.lastMoveX, this.lastMoveY);
	}
	else if (name == 'quad')
	{
		this.lastMoveX = x0 + Number(node.getAttribute('x2')) * sx;
		this.lastMoveY = y0 + Number(node.getAttribute('y2')) * sy;
		canvas.quadTo(x0 + Number(node.getAttribute('x1')) * sx,
				y0 + Number(node.getAttribute('y1')) * sy,
				this.lastMoveX, this.lastMoveY);
	}
	else if (name == 'curve')
	{
		this.lastMoveX = x0 + Number(node.getAttribute('x3')) * sx;
		this.lastMoveY = y0 + Number(node.getAttribute('y3')) * sy;
		canvas.curveTo(x0 + Number(node.getAttribute('x1')) * sx,
				y0 + Number(node.getAttribute('y1')) * sy,
				x0 + Number(node.getAttribute('x2')) * sx,
				y0 + Number(node.getAttribute('y2')) * sy,
				this.lastMoveX, this.lastMoveY);
	}
	else if (name == 'arc')
	{
		// Arc from stencil is turned into curves in image output
		var r1 = Number(node.getAttribute('rx')) * sx;
		var r2 = Number(node.getAttribute('ry')) * sy;
		var angle = Number(node.getAttribute('x-axis-rotation'));
		var largeArcFlag = Number(node.getAttribute('large-arc-flag'));
		var sweepFlag = Number(node.getAttribute('sweep-flag'));
		var x = x0 + Number(node.getAttribute('x')) * sx;
		var y = y0 + Number(node.getAttribute('y')) * sy;
		
		var curves = mxUtils.arcToCurves(this.lastMoveX, this.lastMoveY, r1, r2, angle, largeArcFlag, sweepFlag, x, y);
		
        for (var i = 0; i < curves.length; i += 6) 
        {
        	canvas.curveTo(curves[i], curves[i + 1], curves[i + 2],
        		curves[i + 3], curves[i + 4], curves[i + 5]);
            
			this.lastMoveX = curves[i + 4];
			this.lastMoveY = curves[i + 5]; 
        }
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
		var src = this.evaluateAttribute(node, 'src', state);
		
		canvas.image(x0 + Number(node.getAttribute('x')) * sx,
			y0 + Number(node.getAttribute('y')) * sy,
			Number(node.getAttribute('w')) * sx,
			Number(node.getAttribute('h')) * sy,
			src, false, node.getAttribute('flipH') == '1',
			node.getAttribute('flipV') == '1');
	}
	else if (name == 'text')
	{
		var str = this.evaluateAttribute(node, 'str', state);
		
		canvas.text(x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy,
				0, 0, str, node.getAttribute('align'),
				node.getAttribute('valign'),
				node.getAttribute('vertical'));
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
			
			var tmp = new mxRectangle(x, y, w, h);
			stencil.drawShape(canvas, state, tmp, true);
			stencil.drawShape(canvas, state, tmp, false);
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
		canvas.setStrokeWidth(Number(node.getAttribute('width')) * minScale);
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
};
