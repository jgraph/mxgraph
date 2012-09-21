/**
 * $Id: mxXmlCanvas2D.js,v 1.9 2012-04-24 13:56:56 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 *
 * Class: mxXmlCanvas2D
 * 
 * Implements a canvas to be used with <mxImageExport>. This canvas writes all
 * calls as child nodes to the given root XML node.
 * 
 * (code)
 * var xmlDoc = mxUtils.createXmlDocument();
 * var root = xmlDoc.createElement('output');
 * xmlDoc.appendChild(root);
 * var xmlCanvas = new mxXmlCanvas2D(root);
 * (end)
 * 
 * Constructor: mxXmlCanvas2D
 * 
 * Constructs a XML canvas.
 * 
 * Parameters:
 * 
 * root - XML node for adding child nodes.
 */
var mxXmlCanvas2D = function(root)
{
	/**
	 * Variable: converter
	 * 
	 * Holds the <mxUrlConverter> to convert image URLs.
	 */
	var converter = new mxUrlConverter();

	/**
	 * Variable: compressed
	 * 
	 * Specifies if the output should be compressed by removing redundant calls.
	 * Default is true.
	 */
	var compressed = true;

	/**
	 * Variable: textEnabled
	 * 
	 * Specifies if text output should be enabled. Default is true.
	 */
	var textEnabled = true;

	// Private reference to the owner document
	var doc = root.ownerDocument;

	// Implements stack for save/restore
	var stack = [];
	
	// Implements state for redundancy checks
	var state =
	{
		alpha: 1,
		dashed: false,
		strokewidth: 1,
		fontsize: mxConstants.DEFAULT_FONTSIZE,
		fontfamily: mxConstants.DEFAULT_FONTFAMILY,
		fontcolor: '#000000'
	};
	
	// Private helper function set set precision to 2
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
		 * Function: isCompressed
		 * 
		 * Returns <compressed>.
		 */
		isCompressed: function()
		{
			return compressed;
		},

		/**
		 * Function: setCompressed
		 * 
		 * Sets <compressed>.
		 */
		setCompressed: function(value)
		{
			compressed = value;
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
		 * Function: getDocument
		 * 
		 * Returns the owner document of the root element.
		 */
		getDocument: function()
		{
			return doc;
		},
		
		/**
		 * Function: save
		 * 
		 * Saves the state of the graphics object.
		 */
		save: function()
		{
			if (compressed)
			{
				stack.push(state);
				state = mxUtils.clone(state);
			}
			
			root.appendChild(doc.createElement('save'));
		},
		
		/**
		 * Function: restore
		 * 
		 * Restores the state of the graphics object.
		 */
		restore: function()
		{
			if (compressed)
			{
				state = stack.pop();
			}
			
			root.appendChild(doc.createElement('restore'));
		},
		
		/**
		 * Function: scale
		 * 
		 * Scales the current graphics object.
		 */
		scale: function(value)
		{
			var elem = doc.createElement('scale');
			elem.setAttribute('scale', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: translate
		 * 
		 * Translates the current graphics object.
		 */
		translate: function(dx, dy)
		{
			var elem = doc.createElement('translate');
			elem.setAttribute('dx', f2(dx));
			elem.setAttribute('dy', f2(dy));
			root.appendChild(elem);
		},
		
		/**
		 * Function: rotate
		 * 
		 * Rotates and/or flips the current graphics object.
		 */
		rotate: function(theta, flipH, flipV, cx, cy)
		{
			var elem = doc.createElement('rotate');
			elem.setAttribute('theta', f2(theta));
			elem.setAttribute('flipH', (flipH) ? '1' : '0');
			elem.setAttribute('flipV', (flipV) ? '1' : '0');
			elem.setAttribute('cx', f2(cx));
			elem.setAttribute('cy', f2(cy));
			root.appendChild(elem);
		},
		
		/**
		 * Function: setStrokeWidth
		 * 
		 * Sets the stroke width.
		 */
		setStrokeWidth: function(value)
		{
			if (compressed)
			{
				if (state.strokewidth == value)
				{
					return;
				}
				
				state.strokewidth = value;
			}
			
			var elem = doc.createElement('strokewidth');
			elem.setAttribute('width', f2(value));
			root.appendChild(elem);
		},
		
		/**
		 * Function: setStrokeColor
		 * 
		 * Sets the stroke color.
		 */
		setStrokeColor: function(value)
		{
			var elem = doc.createElement('strokecolor');
			elem.setAttribute('color', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setDashed
		 * 
		 * Sets the dashed state to true or false.
		 */
		setDashed: function(value)
		{
			if (compressed)
			{
				if (state.dashed == value)
				{
					return;
				}
				
				state.dashed = value;
			}
			
			var elem = doc.createElement('dashed');
			elem.setAttribute('dashed', (value) ? '1' : '0');
			root.appendChild(elem);
		},
		
		/**
		 * Function: setDashPattern
		 * 
		 * Sets the dashed pattern to the given space separated list of numbers.
		 */
		setDashPattern: function(value)
		{
			var elem = doc.createElement('dashpattern');
			elem.setAttribute('pattern', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setLineCap
		 * 
		 * Sets the linecap.
		 */
		setLineCap: function(value)
		{
			var elem = doc.createElement('linecap');
			elem.setAttribute('cap', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setLineJoin
		 * 
		 * Sets the linejoin.
		 */
		setLineJoin: function(value)
		{
			var elem = doc.createElement('linejoin');
			elem.setAttribute('join', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setMiterLimit
		 * 
		 * Sets the miterlimit.
		 */
		setMiterLimit: function(value)
		{
			var elem = doc.createElement('miterlimit');
			elem.setAttribute('limit', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setFontSize
		 * 
		 * Sets the fontsize.
		 */
		setFontSize: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontsize == value)
					{
						return;
					}
					
					state.fontsize = value;
				}
				
				var elem = doc.createElement('fontsize');
				elem.setAttribute('size', value);
				root.appendChild(elem);
			}
		},
		
		/**
		 * Function: setFontColor
		 * 
		 * Sets the fontcolor.
		 */
		setFontColor: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontcolor == value)
					{
						return;
					}
					
					state.fontcolor = value;
				}
				
				var elem = doc.createElement('fontcolor');
				elem.setAttribute('color', value);
				root.appendChild(elem);
			}
		},
		
		/**
		 * Function: setFontFamily
		 * 
		 * Sets the fontfamily.
		 */
		setFontFamily: function(value)
		{
			if (textEnabled)
			{
				if (compressed)
				{
					if (state.fontfamily == value)
					{
						return;
					}
					
					state.fontfamily = value;
				}
				
				var elem = doc.createElement('fontfamily');
				elem.setAttribute('family', value);
				root.appendChild(elem);
			}
		},
		
		/**
		 * Function: setFontStyle
		 * 
		 * Sets the fontstyle.
		 */
		setFontStyle: function(value)
		{
			if (textEnabled)
			{
				var elem = doc.createElement('fontstyle');
				elem.setAttribute('style', value);
				root.appendChild(elem);
			}
		},
		
		/**
		 * Function: setAlpha
		 * 
		 * Sets the current alpha.
		 */
		setAlpha: function(alpha)
		{
			if (compressed)
			{
				if (state.alpha == alpha)
				{
					return;
				}
				
				state.alpha = alpha;
			}
			
			var elem = doc.createElement('alpha');
			elem.setAttribute('alpha', f2(alpha));
			root.appendChild(elem);
		},
		
		/**
		 * Function: setFillColor
		 * 
		 * Sets the fillcolor.
		 */
		setFillColor: function(value)
		{
			var elem = doc.createElement('fillcolor');
			elem.setAttribute('color', value);
			root.appendChild(elem);
		},
		
		/**
		 * Function: setGradient
		 * 
		 * Sets the gradient color.
		 */
		setGradient: function(color1, color2, x, y, w, h, direction)
		{
			var elem = doc.createElement('gradient');
			elem.setAttribute('c1', color1);
			elem.setAttribute('c2', color2);
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			
			// Default direction is south
			if (direction != null)
			{
				elem.setAttribute('direction', direction);
			}
			
			root.appendChild(elem);
		},
		
		/**
		 * Function: setGlassGradient
		 * 
		 * Sets the glass gradient.
		 */
		setGlassGradient: function(x, y, w, h)
		{
			var elem = doc.createElement('glass');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			root.appendChild(elem);
		},
		
		/**
		 * Function: rect
		 * 
		 * Sets the current path to a rectangle.
		 */
		rect: function(x, y, w, h)
		{
			var elem = doc.createElement('rect');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			root.appendChild(elem);
		},
		
		/**
		 * Function: roundrect
		 * 
		 * Sets the current path to a rounded rectangle.
		 */
		roundrect: function(x, y, w, h, dx, dy)
		{
			var elem = doc.createElement('roundrect');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			elem.setAttribute('dx', f2(dx));
			elem.setAttribute('dy', f2(dy));
			root.appendChild(elem);
		},
		
		/**
		 * Function: ellipse
		 * 
		 * Sets the current path to an ellipse.
		 */
		ellipse: function(x, y, w, h)
		{
			var elem = doc.createElement('ellipse');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			root.appendChild(elem);
		},
		
		/**
		 * Function: image
		 * 
		 * Paints an image.
		 */
		image: function(x, y, w, h, src, aspect, flipH, flipV)
		{
			src = converter.convert(src);
			
			// TODO: Add option for embedding images as base64
			var elem = doc.createElement('image');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			elem.setAttribute('w', f2(w));
			elem.setAttribute('h', f2(h));
			elem.setAttribute('src', src);
			elem.setAttribute('aspect', (aspect) ? '1' : '0');
			elem.setAttribute('flipH', (flipH) ? '1' : '0');
			elem.setAttribute('flipV', (flipV) ? '1' : '0');
			root.appendChild(elem);
		},
		
		/**
		 * Function: text
		 * 
		 * Paints the given text.
		 */
		text: function(x, y, w, h, str, align, valign, vertical, wrap, format)
		{
			if (textEnabled)
			{
				var elem = doc.createElement('text');
				elem.setAttribute('x', f2(x));
				elem.setAttribute('y', f2(y));
				elem.setAttribute('w', f2(w));
				elem.setAttribute('h', f2(h));
				elem.setAttribute('str', str);
				
				if (align != null)
				{
					elem.setAttribute('align', align);
				}
				
				if (valign != null)
				{
					elem.setAttribute('valign', valign);
				}
				
				elem.setAttribute('vertical', (vertical) ? '1' : '0');
				elem.setAttribute('wrap', (wrap) ? '1' : '0');
				elem.setAttribute('format', format);
				root.appendChild(elem);
			}
		},
		
		/**
		 * Function: begin
		 * 
		 * Starts a new path.
		 */
		begin: function()
		{
			root.appendChild(doc.createElement('begin'));
		},
		
		/**
		 * Function: moveTo
		 * 
		 * Moves the current path the given coordinates.
		 */
		moveTo: function(x, y)
		{
			var elem = doc.createElement('move');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			root.appendChild(elem);
		},
		
		/**
		 * Function: lineTo
		 * 
		 * Adds a line to the current path.
		 */
		lineTo: function(x, y)
		{
			var elem = doc.createElement('line');
			elem.setAttribute('x', f2(x));
			elem.setAttribute('y', f2(y));
			root.appendChild(elem);
		},
		
		/**
		 * Function: quadTo
		 * 
		 * Adds a quadratic curve to the current path.
		 */
		quadTo: function(x1, y1, x2, y2)
		{
			var elem = doc.createElement('quad');
			elem.setAttribute('x1', f2(x1));
			elem.setAttribute('y1', f2(y1));
			elem.setAttribute('x2', f2(x2));
			elem.setAttribute('y2', f2(y2));
			root.appendChild(elem);
		},
		
		/**
		 * Function: curveTo
		 * 
		 * Adds a bezier curve to the current path.
		 */
		curveTo: function(x1, y1, x2, y2, x3, y3)
		{
			var elem = doc.createElement('curve');
			elem.setAttribute('x1', f2(x1));
			elem.setAttribute('y1', f2(y1));
			elem.setAttribute('x2', f2(x2));
			elem.setAttribute('y2', f2(y2));
			elem.setAttribute('x3', f2(x3));
			elem.setAttribute('y3', f2(y3));
			root.appendChild(elem);
		},

		/**
		 * Function: close
		 * 
		 * Closes the current path.
		 */
		close: function()
		{
			root.appendChild(doc.createElement('close'));
		},
		
		/**
		 * Function: stroke
		 * 
		 * Paints the outline of the current path.
		 */
		stroke: function()
		{
			root.appendChild(doc.createElement('stroke'));
		},
		
		/**
		 * Function: fill
		 * 
		 * Fills the current path.
		 */
		fill: function()
		{
			root.appendChild(doc.createElement('fill'));
		},
		
		/**
		 * Function: fillstroke
		 * 
		 * Fills and paints the outline of the current path.
		 */
		fillAndStroke: function()
		{
			root.appendChild(doc.createElement('fillstroke'));
		},
		
		/**
		 * Function: shadow
		 * 
		 * Paints the current path as a shadow of the given color.
		 */
		shadow: function(value, filled)
		{
			var elem = doc.createElement('shadow');
			elem.setAttribute('value', value);
			
			if (filled != null)
			{
				elem.setAttribute('filled', (filled) ? '1' : '0');
			}
			
			root.appendChild(elem);
		},
		
		/**
		 * Function: clip
		 * 
		 * Uses the current path for clipping.
		 */
		clip: function()
		{
			root.appendChild(doc.createElement('clip'));
		}
	};

};