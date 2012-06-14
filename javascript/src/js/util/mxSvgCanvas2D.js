/**
 * $Id: mxSvgCanvas2D.js,v 1.15 2012-06-08 12:45:41 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 *
 * Class: mxSvgCanvas2D
 * 
 * Implements a canvas to be used with <mxImageExport>. This canvas writes all
 * calls as SVG output to the given SVG root node.
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
 * root.setAttribute('version', '1.1');
 * 
 * svgDoc.appendChild(root);
 * 
 * var svgCanvas = new mxSvgCanvas2D(root);
 * (end)
 * 
 * Constructor: mxSvgCanvas2D
 * 
 * Constructs an SVG canvas.
 * 
 * Parameters:
 * 
 * root - SVG container for the output.
 * styleEnabled - Optional boolean that specifies if a style section should be
 * added. The style section sets the default font-size, font-family and
 * stroke-miterlimit globally. Default is false.
 */
var mxSvgCanvas2D = function(root, styleEnabled)
{
	styleEnabled = (styleEnabled != null) ? styleEnabled : false;

	/**
	 * Variable: converter
	 * 
	 * Holds the <mxUrlConverter> to convert image URLs.
	 */
	var converter = new mxUrlConverter();
	
	/**
	 * Variable: autoAntiAlias
	 * 
	 * Specifies if anti aliasing should be disabled for rectangles
	 * and orthogonal paths. Default is true.
	 */
	var autoAntiAlias = true;
	
	/**
	 * Variable: textEnabled
	 * 
	 * Specifies if text output should be enabled. Default is true.
	 */
	var textEnabled = true;
	
	/**
	 * Variable: foEnabled
	 * 
	 * Specifies if use of foreignObject for HTML markup is allowed. Default is true.
	 */
	var foEnabled = true;

	// Private helper function to create SVG elements
	var create = function(tagName, namespace)
	{
		if (root.ownerDocument.createElementNS != null)
		{
			return root.ownerDocument.createElementNS(namespace || mxConstants.NS_SVG, tagName);
		}
		else
		{
			var elt = root.ownerDocument.createElement(tagName);
			
			if (namespace != null)
			{
				elt.setAttribute('xmlns', namespace);
			}
			
			return elt;
		}
	};

	// Defs section contains optional style and gradients
	var defs = create('defs');
	
	// Creates defs section with optional global style
	if (styleEnabled)
	{
		var style = create('style');
		style.setAttribute('type', 'text/css');
		mxUtils.write(style, 'svg{font-family:' + mxConstants.DEFAULT_FONTFAMILY +
				';font-size:' + mxConstants.DEFAULT_FONTSIZE +
				';fill:none;stroke-miterlimit:10}');
		
		if (autoAntiAlias)
		{
			mxUtils.write(style, 'rect{shape-rendering:crispEdges}');
		}
	
		// Appends style to defs and defs to SVG container
		defs.appendChild(style);
	}

	root.appendChild(defs);
	
	// Defines the current state
	var currentState =
	{
			dx: 0,
			dy: 0,
			scale: 1,
			transform: '',
			fill: null,
			gradient: null,
			stroke: null,
			strokeWidth: 1,
			dashed: false,
			dashpattern: '3 3',
			alpha: 1,
			linecap: 'flat',
			linejoin: 'miter',
			miterlimit: 10,
			fontColor: '#000000',
			fontSize: mxConstants.DEFAULT_FONTSIZE,
			fontFamily: mxConstants.DEFAULT_FONTFAMILY,
			fontStyle: 0
	};
	
	// Local variables
	var currentPathIsOrthogonal = true;
	var glassGradient = null;
	var currentNode = null;
	var currentPath = null;
	var lastPoint = null;
	var gradients = [];
	var refCount = 0;
	var stack = [];

	// Other private helper methods
	var createGradientId = function(start, end, direction)
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
		
		return start+'-'+end+'-'+dir;
	};
	
	var createHtmlBody = function(str, align, valign)
	{
		var style = 'margin:0px;font-size:' + Math.floor(currentState.fontSize) + 'px;' +
			'font-family:' + currentState.fontFamily + ';color:' + currentState.fontColor+ ';';
		
		if ((currentState.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
		{
			style += 'font-weight:bold;';
		}

		if ((currentState.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
		{
			style += 'font-style:italic;';
		}
		
		if ((currentState.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
		{
			style += 'font-decoration:underline;';
		}
		
		if (align == mxConstants.ALIGN_CENTER)
		{
			style += 'text-align:center;';
		}
		else if (align == mxConstants.ALIGN_RIGHT)
		{
			style += 'text-align:right;';
		}

		// LATER: Add vertical align support via table
		var body = create('body', 'http://www.w3.org/1999/xhtml');
		body.setAttribute('style', style);
		
		// Convert HTML entities to XML entities
		str = str.replace(/&nbsp;/g, '&#160;');
		
		// Adds surrounding DIV to guarantee one root element, adds xmlns to workaround empty NS in IE9 standards
		var node = mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml">' + str + '</div>').documentElement; 
		
		if (body.ownerDocument.importNode != null)
		{
			node = body.ownerDocument.importNode(node, true);
		}
			
		body.appendChild(node);
		
		return body;
	};

	var getSvgGradient = function(start, end, direction)
	{
		var id = createGradientId(start, end, direction);
		var gradient = gradients[id];
		
		if (gradient == null)
		{
			gradient = create('linearGradient');
			gradient.setAttribute('id', ++refCount);
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
			
			var stop = create('stop');
			stop.setAttribute('offset', '0%');
			stop.setAttribute('style', 'stop-color:'+start);
			gradient.appendChild(stop);
			
			stop = create('stop');
			stop.setAttribute('offset', '100%');
			stop.setAttribute('style', 'stop-color:'+end);
			gradient.appendChild(stop);
			
			defs.appendChild(gradient);
			gradients[id] = gradient;
		}

		return gradient.getAttribute('id');
	};
	
	var appendNode = function(node, state, filled, stroked)
	{
		if (node != null)
		{
			if (state.clip != null)
			{
				node.setAttribute('clip-path', 'url(#' + state.clip + ')');
				state.clip = null;
			}
			
			if (currentPath != null)
			{
				node.setAttribute('d', currentPath.join(' '));
				currentPath = null;
				
				if (autoAntiAlias && currentPathIsOrthogonal)
				{
					node.setAttribute('shape-rendering', 'crispEdges');
					state.strokeWidth = Math.max(1, state.strokeWidth);
				}
			}
			
			if (state.alpha < 1)
			{
				// LATER: Check if using fill/stroke-opacity here is faster
				node.setAttribute('opacity', state.alpha);
				//node.setAttribute('fill-opacity', state.alpha);
				//node.setAttribute('stroke-opacity', state.alpha);
			}
			
			if (filled && (state.fill != null || state.gradient != null))
			{
				if (state.gradient != null)
				{
					node.setAttribute('fill', 'url(#' + state.gradient + ')');
				}
				else
				{
					node.setAttribute('fill', state.fill.toLowerCase());
				}
			}
			else if (!styleEnabled)
			{
				node.setAttribute('fill', 'none');
			}
			
			if (stroked && state.stroke != null)
			{
				node.setAttribute('stroke', state.stroke.toLowerCase());
				
				// Sets the stroke properties (1 is default is SVG)
				if (state.strokeWidth != 1)
				{
					if (node.nodeName == 'rect' && autoAntiAlias)
					{
						state.strokeWidth = Math.max(1, state.strokeWidth);
					}
					
					node.setAttribute('stroke-width', state.strokeWidth);
				}
				
				if (node.nodeName == 'path')
				{
					// Linejoin miter is default in SVG
					if (state.linejoin != null && state.linejoin != 'miter')
					{
						node.setAttribute('stroke-linejoin', state.linejoin);
					}
					
					if (state.linecap != null)
					{
						// flat is called butt in SVG
						var value = state.linecap;
						
						if (value == 'flat')
						{
							value = 'butt';
						}
						
						// Linecap butt is default in SVG
						if (value != 'butt')
						{
							node.setAttribute('stroke-linecap', value);
						}
					}
					
					// Miterlimit 10 is default in our document
					if (state.miterlimit != null && (!styleEnabled || state.miterlimit != 10))
					{
						node.setAttribute('stroke-miterlimit', state.miterlimit);
					}
				}
				
				if (state.dashed)
				{
					var dash = state.dashpattern.split(' ');
					
					if (dash.length > 0)
					{
						var pat = [];
						
						for (var i = 0; i < dash.length; i++)
						{
							pat[i] = Number(dash[i]) * currentState.strokeWidth;
						}
					
					
						node.setAttribute('stroke-dasharray', pat.join(' '));
					}
				}
			}
			
			if (state.transform.length > 0)
			{
				node.setAttribute('transform', state.transform);
			}
			
			root.appendChild(node);
		}
	};
	
	// Private helper function to format a number
	var f2 = function(x)
	{
		return Math.round(parseFloat(x) * 100) / 100;
	};
	
	// Returns public interface
	return {

		/**
		 * Function: getConverter
		 * 
		 * Returns <converter>.
		 */
		getConverter: function()
		{
			return converter;
		},

		/**
		 * Function: isAutoAntiAlias
		 * 
		 * Returns <autoAntiAlias>.
		 */
		isAutoAntiAlias: function()
		{
			return autoAntiAlias;
		},

		/**
		 * Function: setAutoAntiAlias
		 * 
		 * Sets <autoAntiAlias>.
		 */
		setAutoAntiAlias: function(value)
		{
			autoAntiAlias = value;
		},

		/**
		 * Function: isTextEnabled
		 * 
		 * Returns <textEnabled>.
		 */
		isTextEnabled: function()
		{
			return textEnabled;
		},

		/**
		 * Function: setTextEnabled
		 * 
		 * Sets <textEnabled>.
		 */
		setTextEnabled: function(value)
		{
			textEnabled = value;
		},

		/**
		 * Function: isFoEnabled
		 * 
		 * Returns <foEnabled>.
		 */
		isFoEnabled: function()
		{
			return foEnabled;
		},

		/**
		 * Function: setFoEnabled
		 * 
		 * Sets <foEnabled>.
		 */
		setFoEnabled: function(value)
		{
			foEnabled = value;
		},

		/**
		 * Function: save
		 * 
		 * Saves the state of the graphics object.
		 */
		save: function()
		{
			stack.push(currentState);
			currentState = mxUtils.clone(currentState);
		},
		
		/**
		 * Function: restore
		 * 
		 * Restores the state of the graphics object.
		 */
		restore: function()
		{
			currentState = stack.pop();
		},
		
		/**
		 * Function: scale
		 * 
		 * Scales the current graphics object.
		 */
		scale: function(value)
		{
			currentState.scale *= value;
			currentState.strokeWidth *= value;
		},
		
		/**
		 * Function: translate
		 * 
		 * Translates the current graphics object.
		 */
		translate: function(dx, dy)
		{
			currentState.dx += dx;
			currentState.dy += dy;
		},
		
		/**
		 * Function: rotate
		 * 
		 * Rotates and/or flips the current graphics object.
		 */
		rotate: function(theta, flipH, flipV, cx, cy)
		{
			cx += currentState.dx;
			cy += currentState.dy;

			cx *= currentState.scale;
			cy *= currentState.scale;

			// This implementation uses custom scale/translate and built-in rotation
			// Rotation state is part of the AffineTransform in state.transform
			if (flipH ^ flipV)
			{
				var tx = (flipH) ? cx : 0;
				var sx = (flipH) ? -1 : 1;

				var ty = (flipV) ? cy : 0;
				var sy = (flipV) ? -1 : 1;

				currentState.transform += 'translate(' + f2(tx) + ',' + f2(ty) + ')';
				currentState.transform += 'scale(' + f2(sx) + ',' + f2(sy) + ')';
				currentState.transform += 'translate(' + f2(-tx) + ' ' + f2(-ty) + ')';
			}
			
			currentState.transform += 'rotate(' + f2(theta) + ',' + f2(cx) + ',' + f2(cy) + ')';
		},
		
		/**
		 * Function: setStrokeWidth
		 * 
		 * Sets the stroke width.
		 */
		setStrokeWidth: function(value)
		{
			currentState.strokeWidth = value * currentState.scale;
		},
		
		/**
		 * Function: setStrokeColor
		 * 
		 * Sets the stroke color.
		 */
		setStrokeColor: function(value)
		{
			currentState.stroke = value;
		},
		
		/**
		 * Function: setDashed
		 * 
		 * Sets the dashed state to true or false.
		 */
		setDashed: function(value)
		{
			currentState.dashed = value;
		},
		
		/**
		 * Function: setDashPattern
		 * 
		 * Sets the dashed pattern to the given space separated list of numbers.
		 */
		setDashPattern: function(value)
		{
			currentState.dashpattern = value;
		},
		
		/**
		 * Function: setLineCap
		 * 
		 * Sets the linecap.
		 */
		setLineCap: function(value)
		{
			currentState.linecap = value;
		},
		
		/**
		 * Function: setLineJoin
		 * 
		 * Sets the linejoin.
		 */
		setLineJoin: function(value)
		{
			currentState.linejoin = value;
		},
		
		/**
		 * Function: setMiterLimit
		 * 
		 * Sets the miterlimit.
		 */
		setMiterLimit: function(value)
		{
			currentState.miterlimit = value;
		},
		
		/**
		 * Function: setFontSize
		 * 
		 * Sets the fontsize.
		 */
		setFontSize: function(value)
		{
			currentState.fontSize = value;
		},
		
		/**
		 * Function: setFontColor
		 * 
		 * Sets the fontcolor.
		 */
		setFontColor: function(value)
		{
			currentState.fontColor = value;
		},
		
		/**
		 * Function: setFontFamily
		 * 
		 * Sets the fontfamily.
		 */
		setFontFamily: function(value)
		{
			currentState.fontFamily = value;
		},
		
		/**
		 * Function: setFontStyle
		 * 
		 * Sets the fontstyle.
		 */
		setFontStyle: function(value)
		{
			currentState.fontStyle = value;
		},
		
		/**
		 * Function: setAlpha
		 * 
		 * Sets the current alpha.
		 */
		setAlpha: function(alpha)
		{
			currentState.alpha = alpha;
		},
		
		/**
		 * Function: setFillColor
		 * 
		 * Sets the fillcolor.
		 */
		setFillColor: function(value)
		{
			currentState.fill = value;
			currentState.gradient = null;
		},
		
		/**
		 * Function: setGradient
		 * 
		 * Sets the gradient color.
		 */
		setGradient: function(color1, color2, x, y, w, h, direction)
		{
			if (color1 != null && color2 != null)
			{
				currentState.gradient = getSvgGradient(color1, color2, direction);
				currentState.fill = color1;
			}
		},
		
		/**
		 * Function: setGlassGradient
		 * 
		 * Sets the glass gradient.
		 */
		setGlassGradient: function(x, y, w, h)
		{
			// Creates glass overlay gradient
			if (glassGradient == null)
			{
				glassGradient = create('linearGradient');
				glassGradient.setAttribute('id', '0');
				glassGradient.setAttribute('x1', '0%');
				glassGradient.setAttribute('y1', '0%');
				glassGradient.setAttribute('x2', '0%');
				glassGradient.setAttribute('y2', '100%');
				
				var stop1 = create('stop');
				stop1.setAttribute('offset', '0%');
				stop1.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.9');
				glassGradient.appendChild(stop1);
				
				var stop2 = create('stop');
				stop2.setAttribute('offset', '100%');
				stop2.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.1');
				glassGradient.appendChild(stop2);
			
				// Makes it the first entry of all gradients in defs
				if (defs.firstChild.nextSibling != null)
				{
					defs.insertBefore(glassGradient, defs.firstChild.nextSibling);
				}
				else
				{
					defs.appendChild(glassGradient);
				}
			}
			
			// Glass gradient has hardcoded ID (see above)
			currentState.gradient = '0';
		},
		
		/**
		 * Function: rect
		 * 
		 * Sets the current path to a rectangle.
		 */
		rect: function(x, y, w, h)
		{
			x += currentState.dx;
			y += currentState.dy;
			
			currentNode = create('rect');
			currentNode.setAttribute('x', f2(x * currentState.scale));
			currentNode.setAttribute('y', f2(y * currentState.scale));
			currentNode.setAttribute('width', f2(w * currentState.scale));
			currentNode.setAttribute('height', f2(h * currentState.scale));
			
			if (!styleEnabled && autoAntiAlias)
			{
				currentNode.setAttribute('shape-rendering', 'crispEdges');
			}
		},
		
		/**
		 * Function: roundrect
		 * 
		 * Sets the current path to a rounded rectangle.
		 */
		roundrect: function(x, y, w, h, dx, dy)
		{
			x += currentState.dx;
			y += currentState.dy;
			
			currentNode = create('rect');
			currentNode.setAttribute('x', f2(x * currentState.scale));
			currentNode.setAttribute('y', f2(y * currentState.scale));
			currentNode.setAttribute('width', f2(w * currentState.scale));
			currentNode.setAttribute('height', f2(h * currentState.scale));
			
			if (dx > 0)
			{
				currentNode.setAttribute('rx', f2(dx * currentState.scale));
			}
			
			if (dy > 0)
			{
				currentNode.setAttribute('ry', f2(dy * currentState.scale));
			}
			
			if (!styleEnabled && autoAntiAlias)
			{
				currentNode.setAttribute('shape-rendering', 'crispEdges');
			}
		},
		
		/**
		 * Function: ellipse
		 * 
		 * Sets the current path to an ellipse.
		 */
		ellipse: function(x, y, w, h)
		{
			x += currentState.dx;
			y += currentState.dy;
			
			currentNode = create('ellipse');
			currentNode.setAttribute('cx', f2((x + w / 2) * currentState.scale));
			currentNode.setAttribute('cy', f2((y + h / 2) * currentState.scale));
			currentNode.setAttribute('rx', f2(w / 2 * currentState.scale));
			currentNode.setAttribute('ry', f2(h / 2 * currentState.scale));
		},
		
		/**
		 * Function: image
		 * 
		 * Paints an image.
		 */
		image: function(x, y, w, h, src, aspect, flipH, flipV)
		{
			src = converter.convert(src);
			
			// TODO: Add option for embedded images as base64. Current
			// known issues are binary loading of cross-domain images.
			aspect = (aspect != null) ? aspect : true;
			flipH = (flipH != null) ? flipH : false;
			flipV = (flipV != null) ? flipV : false;
			x += currentState.dx;
			y += currentState.dy;
			
			var node = create('image');
			node.setAttribute('x', f2(x * currentState.scale));
			node.setAttribute('y', f2(y * currentState.scale));
			node.setAttribute('width', f2(w * currentState.scale));
			node.setAttribute('height', f2(h * currentState.scale));
			
			if (mxClient.IS_VML)
			{
				node.setAttribute('xlink:href', src);
			}
			else
			{
				node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', src);
			}
			
			if (!aspect)
			{
				node.setAttribute('preserveAspectRatio', 'none');
			}
			
			if (currentState.alpha < 1)
			{
				node.setAttribute('opacity', currentState.alpha);
			}
			

			var tr = currentState.transform;
			
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
				
				// Adds image tansformation to existing transforms
				tr += 'scale(' + sx + ',' + sy + ')translate(' + dx + ',' + dy + ')';
			}
			
			if (tr.length > 0)
			{
				node.setAttribute('transform', tr);
			}
			
			root.appendChild(node);
		},
		
		/**
		 * Function: text
		 * 
		 * Paints the given text. Possible values for format are empty string for
		 * plain text and html for HTML markup.
		 */
		text: function(x, y, w, h, str, align, valign, vertical, wrap, format)
		{
			if (textEnabled)
			{
				x += currentState.dx;
				y += currentState.dy;
				
				if (foEnabled && format == 'html')
				{
					var node = create('g');
					node.setAttribute('transform', currentState.transform + 'scale(' + currentState.scale + ',' + currentState.scale + ')');
					
					if (currentState.alpha < 1)
					{
						node.setAttribute('opacity', currentState.alpha);
					}
					
					var fo = create('foreignObject');
					fo.setAttribute('x', Math.round(x));
					fo.setAttribute('y', Math.round(y));
					fo.setAttribute('width', Math.round(w));
					fo.setAttribute('height', Math.round(h));
					fo.appendChild(createHtmlBody(str, align, valign));
					node.appendChild(fo);
					root.appendChild(node);
				}
				else
				{
					var size = Math.floor(currentState.fontSize);
					var node = create('g');
					var tr = currentState.transform;
					
					if (vertical)
					{
						var cx = x + w / 2;
						var cy = y + h / 2;
						tr += 'rotate(-90,' + f2(cx * currentState.scale) + ',' + f2(cy * currentState.scale) + ')';
					}
					
					if (tr.length > 0)
					{
						node.setAttribute('transform', tr);
					}
					
					if (currentState.alpha < 1)
					{
						node.setAttribute('opacity', currentState.alpha);
					}
	
					// Default is left
					var anchor = (align == mxConstants.ALIGN_RIGHT) ? 'end' :
									(align == mxConstants.ALIGN_CENTER) ? 'middle' :
									'start';
					
					if (anchor == 'end')
					{
						x += Math.max(0, w - 2);
					}
					else if (anchor == 'middle')
					{
						x += w / 2;
					}
					else
					{
						x += (w > 0) ? 2 : 0;
					}
					
					if ((currentState.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
					{
						node.setAttribute('font-weight', 'bold');
					}
	
					if ((currentState.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
					{
						node.setAttribute('font-style', 'italic');
					}
					
					if ((currentState.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
					{
						node.setAttribute('text-decoration', 'underline');
					}
	
					// Text-anchor start is default in SVG
					if (anchor != 'start')
					{
						node.setAttribute('text-anchor', anchor);
					}
					
					if (!styleEnabled || size != mxConstants.DEFAULT_FONTSIZE)
					{
						node.setAttribute('font-size', Math.floor(size * currentState.scale) + 'px');
					}
					
					if (!styleEnabled || currentState.fontFamily != mxConstants.DEFAULT_FONTFAMILY)
					{
						node.setAttribute('font-family', currentState.fontFamily);
					}
					
					node.setAttribute('fill', currentState.fontColor);
	
					var lines = str.split('\n');
					
					var lineHeight = size * 1.25;
					var textHeight = (h > 0) ? size + (lines.length - 1) * lineHeight : lines.length * lineHeight - 1;
					var dy = h - textHeight;
	
					// Top is default
					if (valign == null || valign == mxConstants.ALIGN_TOP)
					{
						y = Math.max(y - 3 * currentState.scale, y + dy / 2 + ((h > 0) ? lineHeight / 2 - 8 : 0));
					}
					else if (valign == mxConstants.ALIGN_MIDDLE)
					{
						y = y + dy / 2;
					}
					else if (valign == mxConstants.ALIGN_BOTTOM)
					{
						y = Math.min(y, y + dy + 2 * currentState.scale);
					}
	
					y += size;
	
					for (var i = 0; i < lines.length; i++)
					{
						var text = create('text');
						text.setAttribute('x', f2(x * currentState.scale));
						text.setAttribute('y', f2(y * currentState.scale));
						
						mxUtils.write(text, lines[i]);
						node.appendChild(text);
						y += size * 1.3;
					}
					
					root.appendChild(node);
				}
			}
		},
		
		/**
		 * Function: begin
		 * 
		 * Starts a new path.
		 */
		begin: function()
		{
			currentNode = create('path');
			currentPath = [];
			lastPoint = null;
			currentPathIsOrthogonal = true;
		},
		
		/**
		 * Function: moveTo
		 * 
		 * Moves the current path the given coordinates.
		 */
		moveTo: function(x, y)
		{
			if (currentPath != null)
			{
				x += currentState.dx;
				y += currentState.dy;
				currentPath.push('M ' + f2(x * currentState.scale) + ' ' + f2(y * currentState.scale));
				
				if (autoAntiAlias)
				{
					lastPoint = new mxPoint(x, y);
				}
			}
		},
		
		/**
		 * Function: lineTo
		 * 
		 * Adds a line to the current path.
		 */
		lineTo: function(x, y)
		{
			if (currentPath != null)
			{
				x += currentState.dx;
				y += currentState.dy;
				currentPath.push('L ' + f2(x * currentState.scale) + ' ' + f2(y * currentState.scale));
				
				if (autoAntiAlias)
				{
					if (lastPoint != null && currentPathIsOrthogonal && x != lastPoint.x && y != lastPoint.y)
					{
						currentPathIsOrthogonal = false;
					}
					
					lastPoint = new mxPoint(x, y);
				}
			}
		},
		
		/**
		 * Function: quadTo
		 * 
		 * Adds a quadratic curve to the current path.
		 */
		quadTo: function(x1, y1, x2, y2)
		{
			if (currentPath != null)
			{
				x1 += currentState.dx;
				y1 += currentState.dy;
				x2 += currentState.dx;
				y2 += currentState.dy;
				currentPath.push('Q ' + f2(x1 * currentState.scale) + ' ' + f2(y1 * currentState.scale) +
					' ' + f2(x2 * currentState.scale) + ' ' + f2(y2 * currentState.scale));
				currentPathIsOrthogonal = false;
			}
		},
		
		/**
		 * Function: curveTo
		 * 
		 * Adds a bezier curve to the current path.
		 */
		curveTo: function(x1, y1, x2, y2, x3, y3)
		{
			if (currentPath != null)
			{
				x1 += currentState.dx;
				y1 += currentState.dy;
				x2 += currentState.dx;
				y2 += currentState.dy;
				x3 += currentState.dx;
				y3 += currentState.dy;
				currentPath.push('C ' + f2(x1 * currentState.scale) + ' ' + f2(y1 * currentState.scale) +
					' ' + f2(x2 * currentState.scale) + ' ' + f2(y2 * currentState.scale) +' ' +
					f2(x3 * currentState.scale) + ' ' + f2(y3 * currentState.scale));
				currentPathIsOrthogonal = false;
			}
		},

		/**
		 * Function: close
		 * 
		 * Closes the current path.
		 */
		close: function()
		{
			if (currentPath != null)
			{
				currentPath.push('Z');
			}
		},
		
		/**
		 * Function: stroke
		 * 
		 * Paints the outline of the current path.
		 */
		stroke: function()
		{
			appendNode(currentNode, currentState, false, true);
		},
		
		/**
		 * Function: fill
		 * 
		 * Fills the current path.
		 */
		fill: function()
		{
			appendNode(currentNode, currentState, true, false);
		},
		
		/**
		 * Function: fillstroke
		 * 
		 * Fills and paints the outline of the current path.
		 */
		fillAndStroke: function()
		{
			appendNode(currentNode, currentState, true, true);
		},
		
		/**
		 * Function: shadow
		 * 
		 * Paints the current path as a shadow of the given color.
		 */
		shadow: function(value, filled)
		{
			this.save();
			this.setStrokeColor(value);
			
			if (filled)
			{
				this.setFillColor(value);
				this.fillAndStroke();
			}
			else
			{
				this.stroke();
			}
			
			this.restore();
		},
		
		/**
		 * Function: clip
		 * 
		 * Uses the current path for clipping.
		 */
		clip: function()
		{
			if (currentNode != null)
			{
				if (currentPath != null)
				{
					currentNode.setAttribute('d', currentPath.join(' '));
					currentPath = null;
				}
				
				var id = ++refCount;
				var clip = create('clipPath');
				clip.setAttribute('id', id);
				clip.appendChild(currentNode);
				defs.appendChild(clip);
				currentState.clip = id;
			}
		}
	};

};