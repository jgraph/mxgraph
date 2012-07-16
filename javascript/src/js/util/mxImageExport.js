/**
 * $Id: mxImageExport.js,v 1.45 2012-07-16 11:54:20 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxImageExport
 * 
 * Creates a new image export instance to be used with an export canvas. Here
 * is an example that uses this class to create an image via a backend using
 * <mxXmlExportCanvas>.
 * 
 * (code)
 * var xmlDoc = mxUtils.createXmlDocument();
 * var root = xmlDoc.createElement('output');
 * xmlDoc.appendChild(root);
 * 
 * var xmlCanvas = new mxXmlCanvas2D(root);
 * var imgExport = new mxImageExport();
 * imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
 * 
 * var bounds = graph.getGraphBounds();
 * var w = Math.ceil(bounds.x + bounds.width);
 * var h = Math.ceil(bounds.y + bounds.height);
 * 
 * var xml = mxUtils.getXml(root);
 * new mxXmlRequest('export', 'format=png&w=' + w +
 * 		'&h=' + h + '&bg=#F9F7ED&xml=' + encodeURIComponent(xml))
 * 		.simulate(document, '_blank');
 * (end)
 * 
 * In order to export images for a graph whose container is not visible or not
 * part of the DOM, the following workaround can be used to compute the size of
 * the labels.
 * 
 * (code)
 * mxText.prototype.getTableSize = function(table)
 * {
 *   var oldParent = table.parentNode;
 *   
 *   document.body.appendChild(table);
 *   var size = new mxRectangle(0, 0, table.offsetWidth, table.offsetHeight);
 *   oldParent.appendChild(table);
 *   
 *   return size;
 * };
 * (end) 
 * 
 * Constructor: mxImageExport
 * 
 * Constructs a new image export.
 */
function mxImageExport()
{
	this.initShapes();
	this.initMarkers();
};

/**
 * Variable: includeOverlays
 * 
 * Specifies if overlays should be included in the export. Default is false.
 */
mxImageExport.prototype.includeOverlays = false;

/**
 * Variable: glassSize
 * 
 * Reference to the thread while the animation is running.
 */
mxImageExport.prototype.glassSize = 0.4;

/**
 * Variable: shapes
 * 
 * Holds implementations for the built-in shapes.
 */
mxImageExport.prototype.shapes = null;

/**
 * Variable: markers
 * 
 * Holds implementations for the built-in markers.
 */
mxImageExport.prototype.markers = null;

/**
 * Function: drawState
 * 
 * Draws the given state and all its descendants to the given canvas.
 */
mxImageExport.prototype.drawState = function(state, canvas)
{
	if (state != null)
	{
		if (state.shape != null)
		{
			var shape = (state.shape.stencil != null) ?
				state.shape.stencil :
				this.shapes[state.style[mxConstants.STYLE_SHAPE]];

			if (shape == null)
			{
				// Checks if there is a custom shape
				if (typeof(state.shape.redrawPath) == 'function')
				{
					shape = this.createShape(state, canvas);
				}
				// Uses a rectangle for all vertices where no shape can be found
				else if (state.view.graph.getModel().isVertex(state.cell))
				{
					shape = this.shapes['rectangle'];
				}
			}
			
			if (shape != null)
			{
				this.drawShape(state, canvas, shape);

				if (this.includeOverlays)
				{
					this.drawOverlays(state, canvas);
				}
			}
		}
		
		var graph = state.view.graph;
		var childCount = graph.model.getChildCount(state.cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var childState = graph.view.getState(graph.model.getChildAt(state.cell, i));
			this.drawState(childState, canvas);
		}
	}
};

/**
 * Function: createShape
 * 
 * Creates a shape wrapper for the custom shape in the given cell state and
 * links its output to the given canvas.
 */
mxImageExport.prototype.createShape = function(state, canvas)
{
	return {
		drawShape: function(canvas, state, bounds, background)
		{
			var path =
			{
				translate: new mxPoint(bounds.x, bounds.y),
				moveTo: function(x, y)
				{
					canvas.moveTo(this.translate.x + x, this.translate.y + y);
				},
				lineTo: function(x, y)
				{
					canvas.lineTo(this.translate.x + x, this.translate.y + y);
				},
				quadTo: function(x1, y1, x, y)
				{
					canvas.quadTo(this.translate.x + x1, this.translate.y + y1, this.translate.x + x, this.translate.y + y);
				},
				curveTo: function(x1, y1, x2, y2, x, y)
				{
					canvas.curveTo(this.translate.x + x1, this.translate.y + y1, this.translate.x + x2, this.translate.y + y2, this.translate.x + x, this.translate.y + y);
				},
				end: function()
				{
					// do nothing
				},
				close: function()
				{
					canvas.close();
				}
			};
			
			if (!background)
			{
				canvas.fillAndStroke();
			}
			
			// LATER: Remove empty path if shape does not implement foreground, add shadow/clipping
			canvas.begin();
			state.shape.redrawPath.call(state.shape, path, bounds.x, bounds.y, bounds.width, bounds.height, !background);
			
			if (!background)
			{
				canvas.fillAndStroke();
			}
			
			return true;
		}
	};
};

/**
 * Function: drawOverlays
 * 
 * Draws the overlays for the given state.
 */
mxImageExport.prototype.drawOverlays = function(state, canvas)
{
	if (state.overlays != null)
	{
		for (var i = 0; i < state.overlays.length; i++)
		{
			if (state.overlays[i].bounds != null)
			{
				var bounds = state.overlays[i].bounds;
				canvas.image(bounds.x, bounds.y, bounds.width, bounds.height, state.overlays[i].image);
			}
		}
	}
};

/**
 * Function: drawShape
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawShape = function(state, canvas, shape)
{
	var rotation = mxUtils.getNumber(state.style, mxConstants.STYLE_ROTATION, 0);
	var direction = mxUtils.getValue(state.style, mxConstants.STYLE_DIRECTION, null);

	// New styles for shape flipping the stencil
	var flipH = state.style[mxConstants.STYLE_STENCIL_FLIPH];
	var flipV = state.style[mxConstants.STYLE_STENCIL_FLIPV];
	
	if (flipH ? !flipV : flipV)
	{
		rotation *= -1;
	}
	
	// Default direction is east (ignored if rotation exists)
	if (direction != null)
	{
		if (direction == 'north')
		{
			rotation += 270;
		}
		else if (direction == 'west')
		{
			rotation += 180;
		}
		else if (direction == 'south')
		{
			rotation += 90;
		}
	}

	if (flipH && flipV)
	{
		rotation += 180;
		flipH = false;
		flipV = false;
	}

	// Saves the global state for each cell
	canvas.save();

	// Adds rotation and horizontal/vertical flipping
	// FIXME: Rotation and stencil flip only supported for stencil shapes
	rotation = rotation % 360;

	if (rotation != 0 || flipH || flipV)
	{
		canvas.rotate(rotation, flipH, flipV, state.getCenterX(), state.getCenterY());
	}

	// Note: Overwritten in mxStencil.paintShape (can depend on aspect)
	var scale = state.view.scale;
	var sw = mxUtils.getNumber(state.style, mxConstants.STYLE_STROKEWIDTH, 1) * scale;
	canvas.setStrokeWidth(sw);

	var sw2 = sw / 2;
	var bg = this.getBackgroundBounds(state);
	
	// Stencils will rotate the bounds as required
	if (state.shape.stencil == null && (direction == 'south' || direction == 'north'))
	{
		var dx = (bg.width - bg.height) / 2;
		bg.x += dx;
		bg.y += -dx;
		var tmp = bg.width;
		bg.width = bg.height;
		bg.height = tmp;
	}
	
	var bb = new mxRectangle(bg.x - sw2, bg.y - sw2, bg.width + sw, bg.height + sw);
	var alpha = mxUtils.getValue(state.style, mxConstants.STYLE_OPACITY, 100) / 100;

	var shp = state.style[mxConstants.STYLE_SHAPE];
	var imageShape = shp == mxConstants.SHAPE_IMAGE;
	var gradientColor = (imageShape) ? null : mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR);
	
	// Converts colors with special keyword none to null
	if (gradientColor == mxConstants.NONE)
	{
		gradientColor = null;
	}

	var fcKey = (imageShape) ? mxConstants.STYLE_IMAGE_BACKGROUND : mxConstants.STYLE_FILLCOLOR; 
	var fillColor = mxUtils.getValue(state.style, fcKey, null);
	
	if (fillColor == mxConstants.NONE)
	{
		fillColor = null;
	}

	var scKey = (imageShape) ? mxConstants.STYLE_IMAGE_BORDER : mxConstants.STYLE_STROKECOLOR; 
	var strokeColor = mxUtils.getValue(state.style, scKey, null);
	
	if (strokeColor == mxConstants.NONE)
	{
		strokeColor = null;
	}

	var glass = (fillColor != null && (shp == mxConstants.SHAPE_LABEL || shp == mxConstants.SHAPE_RECTANGLE));
	
	// Draws the shadow if the fillColor is not transparent
	if (mxUtils.getValue(state.style, mxConstants.STYLE_SHADOW, false))
	{
		this.drawShadow(canvas, state, shape, rotation, flipH, flipV, bg, alpha, fillColor != null);
	}
	
	canvas.setAlpha(alpha);
	
	// Sets the dashed state
	if (mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') == '1')
	{
		canvas.setDashed(true);
		
		// Supports custom dash patterns
		var dash = state.style['dashPattern'];
		
		if (dash != null)
		{
			canvas.setDashPattern(dash);
		}
	}

	// Draws background and foreground
	if (strokeColor != null || fillColor != null)
	{
		if (strokeColor != null)
		{
			canvas.setStrokeColor(strokeColor);
		}
		
		if (fillColor != null)
		{
			if (gradientColor != null && gradientColor != 'transparent')
			{
				canvas.setGradient(fillColor, gradientColor, bg.x, bg.y, bg.width, bg.height, direction);
			}
			else 
			{
				canvas.setFillColor(fillColor);
			}
		}
		
		// Draws background and foreground of shape
		glass = shape.drawShape(canvas, state, bg, true, false) && glass;
		shape.drawShape(canvas, state, bg, false, false);
	}

	// Draws the glass effect
	// Requires background in generic shape for clipping
	if (glass && mxUtils.getValue(state.style, mxConstants.STYLE_GLASS, 0) == 1)
	{
		this.drawGlass(state, canvas, bb, shape, this.glassSize);
	}
	
	// Draws the image (currently disabled for everything but image and label shapes)
	if (imageShape || shp == mxConstants.SHAPE_LABEL)
	{
		var src = state.view.graph.getImage(state);
		
		if (src != null)
		{
			var imgBounds = this.getImageBounds(state);
			
			if (imgBounds != null)
			{
				this.drawImage(state, canvas, imgBounds, src);
			}
		}
	}

	// Restores canvas state
	canvas.restore();

	// Draws the label (label has separate rotation)
	var txt = state.text;
	
	// Does not use mxCellRenderer.getLabelValue to avoid conversion of HTML entities for VML
	var label = state.view.graph.getLabel(state.cell);
	
	if (txt != null && label != null && label.length > 0)
	{
		canvas.save();
		canvas.setAlpha(mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_OPACITY, 100) / 100);
		var bounds = new mxRectangle(txt.boundingBox.x, txt.boundingBox.y, txt.boundingBox.width, txt.boundingBox.height);
		var vert = mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL, 1) == 0;
		
		// Vertical error offset
		bounds.y += 2;

		if (vert)
		{
			if (txt.dialect != mxConstants.DIALECT_SVG)
			{
				var cx = bounds.x + bounds.width / 2;
				var cy = bounds.y + bounds.height / 2;
				var tmp = bounds.width;
				bounds.width = bounds.height;
				bounds.height = tmp;
				bounds.x = cx - bounds.width / 2;
				bounds.y = cy - bounds.height / 2;
			}
			else if (txt.dialect == mxConstants.DIALECT_SVG)
			{
				// Workarounds for different label bounding boxes (mostly ignoring rotation).
				// LATER: Fix in mxText so that the bounding box is consistent and rotated.
				// TODO: Check non-center/middle-aligned vertical labels in VML for IE8.
				var b = state.y + state.height;
				var cx = bounds.getCenterX() - state.x;
				var cy = bounds.getCenterY() - state.y;
				
				var y = b - cx - bounds.height / 2;
				bounds.x = state.x + cy - bounds.width / 2;
				bounds.y = y;
				//bounds.x -= state.height / 2 - state.width / 2;
				//bounds.y -= state.width / 2 - state.height / 2;
			}
		}
		
		this.drawLabelBackground(state, canvas, bounds, vert);
		this.drawLabel(state, canvas, bounds, vert, label);
		canvas.restore();
	}
};

/**
 * Function: drawGlass
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawShadow = function(canvas, state, shape, rotation, flipH, flipV, bounds, alpha, filled)
{
	// Requires background in generic shape for shadow, looks like only one
	// fillAndStroke is allowed per current path, try working around that
	// Computes rotated shadow offset
	var rad = rotation * Math.PI / 180;
	var cos = Math.cos(-rad);
	var sin = Math.sin(-rad);
	var offset = mxUtils.getRotatedPoint(new mxPoint(mxConstants.SHADOW_OFFSET_X, mxConstants.SHADOW_OFFSET_Y), cos, sin);
	
	if (flipH)
	{
		offset.x *= -1;
	}
	
	if (flipV)
	{
		offset.y *= -1;
	}
	
	// TODO: Use save/restore instead of negative offset to restore (requires fix for HTML canvas)
	canvas.translate(offset.x, offset.y);
	
	// Returns true if a shadow has been painted (path has been created)
	if (shape.drawShape(canvas, state, bounds, true, true))
	{
		canvas.setAlpha(mxConstants.SHADOW_OPACITY * alpha);
		canvas.shadow(mxConstants.SHADOWCOLOR, filled);
	}

	canvas.translate(-offset.x, -offset.y);
};

/**
 * Function: drawGlass
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawGlass = function(state, canvas, bounds, shape, size)
{
	// LATER: Clipping region should include stroke
	if (shape.drawShape(canvas, state, bounds, true, false))
	{
		canvas.save();
		canvas.clip();
		canvas.setGlassGradient(bounds.x, bounds.y, bounds.width, bounds.height);
	
		canvas.begin();
		canvas.moveTo(bounds.x, bounds.y);
		canvas.lineTo(bounds.x, (bounds.y + bounds.height * size));
		canvas.quadTo((bounds.x + bounds.width * 0.5),
				(bounds.y + bounds.height * 0.7), bounds.x + bounds.width,
				(bounds.y + bounds.height * size));
		canvas.lineTo(bounds.x + bounds.width, bounds.y);
		canvas.close();

		canvas.fill();
		canvas.restore();
	}
};

/**
 * Function: drawImage
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawImage = function(state, canvas, bounds, image)
{
	var aspect = mxUtils.getValue(state.style, mxConstants.STYLE_IMAGE_ASPECT, 1) == 1;
	var flipH = mxUtils.getValue(state.style, mxConstants.STYLE_IMAGE_FLIPH, 0) == 1;
	var flipV = mxUtils.getValue(state.style, mxConstants.STYLE_IMAGE_FLIPV, 0) == 1;
	
	canvas.image(bounds.x, bounds.y, bounds.width, bounds.height, image, aspect, flipH, flipV);
};

/**
 * Function: drawLabelBackground
 * 
 * Draws background for the label of the given state to the given canvas.
 */
mxImageExport.prototype.drawLabelBackground = function(state, canvas, bounds, vert)
{
	var stroke = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_BORDERCOLOR);
	var fill = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR);
	
	if (stroke == mxConstants.NONE)
	{
		stroke = null;
	}
	
	if (fill == mxConstants.NONE)
	{
		fill = null;
	}
	
	if (stroke != null || fill != null)
	{
		var x = bounds.x;
		var y = bounds.y - mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_PADDING, 0);
		var w = bounds.width;
		var h = bounds.height;
		
		if (vert)
		{
			x += (w - h) / 2;
			y += (h - w) / 2;
			var tmp = w;
			w = h;
			h = tmp;
		}
		
		if (fill != null)
		{
			canvas.setFillColor(fill);
		}
		
		if (stroke != null)
		{
			canvas.setStrokeColor(stroke);
			canvas.setStrokeWidth(1);
			canvas.setDashed(false);
		}
		
		canvas.rect(x, y, w, h);

		if (fill != null && stroke != null)
		{
			canvas.fillAndStroke();
		}
		else if (fill != null)
		{
			canvas.fill();
		}
		else if (stroke != null)
		{
			canvas.stroke();
		}
	}
};

/**
 * Function: drawLabel
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawLabel = function(state, canvas, bounds, vert, str)
{
	var scale = state.view.scale;
	
	// Applies color
	canvas.setFontColor(mxUtils.getValue(state.style, mxConstants.STYLE_FONTCOLOR, '#000000'));
	
	// Applies font settings
	canvas.setFontFamily(mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY,
			mxConstants.DEFAULT_FONTFAMILY));
	canvas.setFontStyle(mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0));
	canvas.setFontSize(mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE,
			mxConstants.DEFAULT_FONTSIZE) * scale);
	
	var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
	
	// Uses null alignment for default values (valign default is 'top' which is fine)
	if (align == 'left')
	{
		align = null;
	}
		
	var y = bounds.y - mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_PADDING, 0);
	var wrap = state.view.graph.isWrapping(state.cell);
	var html = state.view.graph.isHtmlLabel(state.cell);
	
	// Replaces linefeeds in HTML markup to match the display output
	if (html && mxText.prototype.replaceLinefeeds)
	{
		str = str.replace(/\n/g, '<br/>');
	}
	
	canvas.text(bounds.x, y, bounds.width, bounds.height, str, align, null, vert, wrap, (html) ? 'html' : '');
};

/**
 * Function: getBackgroundBounds
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.getBackgroundBounds = function(state)
{
	if (state.style[mxConstants.STYLE_SHAPE] == mxConstants.SHAPE_SWIMLANE)
	{
		var scale = state.view.scale;
		var start = mxUtils.getValue(state.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE) * scale;
		var w = state.width;
		var h = state.height;
		
		if (mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL, true))
		{
			h = start;
		}
		else
		{
			w = start;
		}
		
		return new mxRectangle(state.x, state.y, Math.min(state.width, w), Math.min(state.height, h));
	}
	else
	{
		return new mxRectangle(state.x, state.y, state.width, state.height);
	}
};

/**
 * Function: getImageBounds
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.getImageBounds = function(state)
{
	var bounds = new mxRectangle(state.x, state.y, state.width, state.height);
	var style = state.style;
	
	if (mxUtils.getValue(style, mxConstants.STYLE_SHAPE) != mxConstants.SHAPE_IMAGE)
	{
		var imgAlign = mxUtils.getValue(style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
		var imgValign = mxUtils.getValue(style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
		var imgWidth = mxUtils.getValue(style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE);
		var imgHeight = mxUtils.getValue(style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE);
		var spacing = mxUtils.getValue(style, mxConstants.STYLE_SPACING, 2);

		if (imgAlign == mxConstants.ALIGN_CENTER)
		{
			bounds.x += (bounds.width - imgWidth) / 2;
		}
		else if (imgAlign == mxConstants.ALIGN_RIGHT)
		{
			bounds.x += bounds.width - imgWidth - spacing - 2;
		}
		else
		// LEFT
		{
			bounds.x += spacing + 4;
		}
	
		if (imgValign == mxConstants.ALIGN_TOP)
		{
			bounds.y += spacing;
		}
		else if (imgValign == mxConstants.ALIGN_BOTTOM)
		{
			bounds.y += bounds.height - imgHeight - spacing;
		}
		else
		// MIDDLE
		{
			bounds.y += (bounds.height - imgHeight) / 2;
		}
	
		bounds.width = imgWidth;
		bounds.height = imgHeight;
	}
	
	return bounds;
};

/**
 * Function: drawMarker
 * 
 * Initializes the built-in shapes.
 */
mxImageExport.prototype.drawMarker = function(canvas, state, source)
{
	var offset = null;

	// Computes the norm and the inverse norm
	var pts = state.absolutePoints;
	var n = pts.length;
	
	var p0 = (source) ? pts[1] : pts[n - 2];
	var pe = (source) ? pts[0] : pts[n - 1];
	
	var dx = pe.x - p0.x;
	var dy = pe.y - p0.y;

	var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
	
	var unitX = dx / dist;
	var unitY = dy / dist;

	var size = mxUtils.getValue(state.style, (source) ?
			mxConstants.STYLE_STARTSIZE :
				mxConstants.STYLE_ENDSIZE,
				mxConstants.DEFAULT_MARKERSIZE);
	
	// Allow for stroke width in the end point used and the 
	// orthogonal vectors describing the direction of the marker
	// TODO: Should get strokewidth from canvas (same for strokecolor)
	var sw = mxUtils.getValue(state.style, mxConstants.STYLE_STROKEWIDTH, 1);
	
	pe = pe.clone();
	
	var type = mxUtils.getValue(state.style, (source) ?
			mxConstants.STYLE_STARTARROW :
				mxConstants.STYLE_ENDARROW);
	var f = this.markers[type];
	
	if (f != null)
	{
		offset = f(canvas, state, type, pe, unitX, unitY, size, source, sw);
	}

	return offset;
};

/**
 * Function: initShapes
 * 
 * Initializes the built-in shapes.
 */
mxImageExport.prototype.initShapes = function()
{
	this.shapes = [];
	
	// Implements the rectangle and rounded rectangle shape
	this.shapes['rectangle'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				// Paints the shape
				if (mxUtils.getValue(state.style, mxConstants.STYLE_ROUNDED, false))
				{
					var f = mxUtils.getValue(state.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
					var r = Math.min(bounds.width * f, bounds.height * f);
					canvas.roundrect(bounds.x, bounds.y, bounds.width, bounds.height, r, r);
				}
				else
				{
					canvas.rect(bounds.x, bounds.y, bounds.width, bounds.height);
				}
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	// Implements the swimlane shape
	this.shapes['swimlane'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				if (mxUtils.getValue(state.style, mxConstants.STYLE_ROUNDED, false))
				{
					var r = Math.min(bounds.width * mxConstants.RECTANGLE_ROUNDING_FACTOR,
							bounds.height * mxConstants.RECTANGLE_ROUNDING_FACTOR);
					canvas.roundrect(bounds.x, bounds.y, bounds.width, bounds.height, r, r);
				}
				else
				{
					canvas.rect(bounds.x, bounds.y, bounds.width, bounds.height);
				}
			
				return true;
			}
			else
			{
				canvas.fillAndStroke();
				var x = state.x;
				var y = state.y;
				var w = state.width;
				var h = state.height;
				
				if (mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL, 1) == 0)
				{
					x += bounds.width;
					w -= bounds.width;
				}
				else
				{
					y += bounds.height;
					h -= bounds.height;
				}
				
				canvas.begin();
				canvas.moveTo(x, y);
				canvas.lineTo(x, y + h);
				canvas.lineTo(x + w, y + h);
				canvas.lineTo(x + w, y);
				canvas.stroke();
			}
		}
	};

	this.shapes['image'] = this.shapes['rectangle'];
	this.shapes['label'] = this.shapes['rectangle'];

	var imageExport = this;
	
	this.shapes['connector'] =
	{
		translatePoint: function(points, index, offset)
		{
			if (offset != null)
			{
				var pt = points[index].clone();
				pt.x += offset.x;
				pt.y += offset.y;
				points[index] = pt;
			}
		},
			
		drawShape: function(canvas, state, bounds, background, shadow)
		{
			if (background)
			{
				var rounded = mxUtils.getValue(state.style, mxConstants.STYLE_ROUNDED, false);
				var arcSize = mxConstants.LINE_ARCSIZE / 2;
				
				// Does not draw the markers in the shadow to match the display
				canvas.setFillColor((shadow) ? mxConstants.NONE : mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, "#000000"));
				canvas.setDashed(false);
				var pts = state.absolutePoints.slice();
				this.translatePoint(pts, 0, imageExport.drawMarker(canvas, state, true));
				this.translatePoint(pts, pts.length - 1, imageExport.drawMarker(canvas, state, false));
				canvas.setDashed(mxUtils.getValue(state.style, mxConstants.STYLE_DASHED, '0') == '1');
				
				var pt = pts[0];
				var pe = pts[pts.length - 1];
				canvas.begin();
				canvas.moveTo(pt.x, pt.y);
				
				// Draws the line segments
				for (var i = 1; i < pts.length - 1; i++)
				{
					var tmp = pts[i];
					var dx = pt.x - tmp.x;
					var dy = pt.y - tmp.y;
		
					if ((rounded && i < pts.length - 1) && (dx != 0 || dy != 0))
					{
						// Draws a line from the last point to the current
						// point with a spacing of size off the current point
						// into direction of the last point
						var dist = Math.sqrt(dx * dx + dy * dy);
						var nx1 = dx * Math.min(arcSize, dist / 2) / dist;
						var ny1 = dy * Math.min(arcSize, dist / 2) / dist;
		
						var x1 = tmp.x + nx1;
						var y1 = tmp.y + ny1;
						canvas.lineTo(x1, y1);
		
						// Draws a curve from the last point to the current
						// point with a spacing of size off the current point
						// into direction of the next point
						var next = pts[i + 1];
						dx = next.x - tmp.x;
						dy = next.y - tmp.y;
		
						dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
						var nx2 = dx * Math.min(arcSize, dist / 2) / dist;
						var ny2 = dy * Math.min(arcSize, dist / 2) / dist;
		
						var x2 = tmp.x + nx2;
						var y2 = tmp.y + ny2;
		
						canvas.curveTo(tmp.x, tmp.y, tmp.x, tmp.y, x2, y2);
						tmp = new mxPoint(x2, y2);
					}
					else
					{
						canvas.lineTo(tmp.x, tmp.y);
					}
		
					pt = tmp;
				}
		
				canvas.lineTo(pe.x, pe.y);
				canvas.stroke();
				
				return true;
			}
			else
			{
				// no foreground
			}
		}
	};

	this.shapes['arrow'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				// Geometry of arrow
				var spacing =  mxConstants.ARROW_SPACING;
				var width = mxConstants.ARROW_WIDTH;
				var arrow = mxConstants.ARROW_SIZE;

				// Base vector (between end points)
				var pts = state.absolutePoints;
				var p0 = pts[0];
				var pe = pts[pts.length - 1];
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				var dist = Math.sqrt(dx * dx + dy * dy);
				var length = dist - 2 * spacing - arrow;
				
				// Computes the norm and the inverse norm
				var nx = dx / dist;
				var ny = dy / dist;
				var basex = length * nx;
				var basey = length * ny;
				var floorx = width * ny/3;
				var floory = -width * nx/3;
				
				// Computes points
				var p0x = p0.x - floorx / 2 + spacing * nx;
				var p0y = p0.y - floory / 2 + spacing * ny;
				var p1x = p0x + floorx;
				var p1y = p0y + floory;
				var p2x = p1x + basex;
				var p2y = p1y + basey;
				var p3x = p2x + floorx;
				var p3y = p2y + floory;
				// p4 not necessary
				var p5x = p3x - 3 * floorx;
				var p5y = p3y - 3 * floory;
				
				canvas.begin();
				canvas.moveTo(p0x, p0y);
				canvas.lineTo(p1x, p1y);
				canvas.lineTo(p2x, p2y);
				canvas.lineTo(p3x, p3y);
				canvas.lineTo(pe.x - spacing * nx, pe.y - spacing * ny);
				canvas.lineTo(p5x, p5y);
				canvas.lineTo(p5x + floorx, p5y + floory);
				canvas.close();

				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	this.shapes['cylinder'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				return false;
			}
			else
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				var dy = Math.min(mxCylinder.prototype.maxHeight, Math.floor(h / 5));
		
				canvas.begin();
				canvas.moveTo(x, y + dy);
				canvas.curveTo(x, y - dy / 3, x + w, y - dy / 3, x + w, y + dy);
				canvas.lineTo(x + w, y + h - dy);
				canvas.curveTo(x + w, y + h + dy / 3, x, y + h + dy / 3, x, y + h - dy);
				canvas.close();
				canvas.fillAndStroke();
				
				canvas.begin();
				canvas.moveTo(x, y + dy);
				canvas.curveTo(x, y + 2 * dy, x + w, y + 2 * dy, x + w, y + dy);
				canvas.stroke();
			}
		}
	};

	this.shapes['line'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				return false;
			}
			else
			{
				canvas.begin();
				
				var mid = state.getCenterY();
				canvas.moveTo(bounds.x, mid);
				canvas.lineTo(bounds.x + bounds.width, mid);

				canvas.stroke();
			}
		}
	};

	this.shapes['ellipse'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				canvas.ellipse(bounds.x, bounds.y, bounds.width, bounds.height);
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	this.shapes['doubleEllipse'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			var x = bounds.x;
			var y = bounds.y;
			var w = bounds.width;
			var h = bounds.height;
			
			if (background)
			{
				canvas.ellipse(x, y, w, h);
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();

				var inset = Math.min(4, Math.min(w / 5, h / 5));
				x += inset;
				y += inset;
				w -= 2 * inset;
				h -= 2 * inset;
				
				if (w > 0 && h > 0)
				{
					canvas.ellipse(x, y, w, h);
				}
				
				canvas.stroke();
			}
		}
	};

	this.shapes['triangle'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				canvas.begin();
				canvas.moveTo(x, y);
				canvas.lineTo(x + w, y + h / 2);
				canvas.lineTo(x, y + h);
				canvas.close();
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	this.shapes['rhombus'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				var hw = w / 2;
				var hh = h / 2;

				canvas.begin();
				canvas.moveTo(x + hw, y);
				canvas.lineTo(x + w, y + hh);
				canvas.lineTo(x + hw, y + h);
				canvas.lineTo(x, y + hh);
				canvas.close();
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}

	};

	this.shapes['hexagon'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				
				canvas.begin();
				canvas.moveTo(x + 0.25 * w, y);
				canvas.lineTo(x + 0.75 * w, y);
				canvas.lineTo(x + w, y + 0.5 * h);
				canvas.lineTo(x + 0.75 * w, y + h);
				canvas.lineTo(x + 0.25 * w, y + h);
				canvas.lineTo(x, y + 0.5 * h);
				canvas.close();
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	this.shapes['actor'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				var width = w * 2 / 6;
				
				canvas.begin();
				canvas.moveTo(x, y + h);
				canvas.curveTo(x, y + 3 * h / 5, x, y + 2 * h / 5, x + w / 2, y + 2 * h
						/ 5);
				canvas.curveTo(x + w / 2 - width, y + 2 * h / 5, x + w / 2 - width, y, x
						+ w / 2, y);
				canvas.curveTo(x + w / 2 + width, y, x + w / 2 + width, y + 2 * h / 5, x
						+ w / 2, y + 2 * h / 5);
				canvas.curveTo(x + w, y + 2 * h / 5, x + w, y + 3 * h / 5, x + w, y + h);
				canvas.close();
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

	this.shapes['cloud'] =
	{
		drawShape: function(canvas, state, bounds, background)
		{
			if (background)
			{
				var x = bounds.x;
				var y = bounds.y;
				var w = bounds.width;
				var h = bounds.height;
				
				canvas.begin();
				canvas.moveTo(x + 0.25 * w, y + 0.25 * h);
				canvas.curveTo(x + 0.05 * w, y + 0.25 * h, x,
						y + 0.5 * h, x + 0.16 * w, y + 0.55 * h);
				canvas.curveTo(x, y + 0.66 * h, x + 0.18 * w,
						y + 0.9 * h, x + 0.31 * w, y + 0.8 * h);
				canvas.curveTo(x + 0.4 * w, y + h, x + 0.7 * w,
						y + h, x + 0.8 * w, y + 0.8 * h);
				canvas.curveTo(x + w, y + 0.8 * h, x + w,
						y + 0.6 * h, x + 0.875 * w, y + 0.5 * h);
				canvas.curveTo(x + w, y + 0.3 * h, x + 0.8 * w,
						y + 0.1 * h, x + 0.625 * w, y + 0.2 * h);
				canvas.curveTo(x + 0.5 * w, y + 0.05 * h,
						x + 0.3 * w, y + 0.05 * h,
						x + 0.25 * w, y + 0.25 * h);
				canvas.close();
				
				return true;
			}
			else
			{
				canvas.fillAndStroke();
			}
		}
	};

};

/**
 * Function: initMarkers
 * 
 * Initializes the built-in markers.
 */
mxImageExport.prototype.initMarkers = function()
{
	this.markers = [];

	var tmp = function(canvas, state, type, pe, unitX, unitY, size, source, sw)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = unitX * sw * 1.118;
		var endOffsetY = unitY * sw * 1.118;
		
		pe.x -= endOffsetX;
		pe.y -= endOffsetY;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);
		
		canvas.begin();
		canvas.moveTo(pe.x, pe.y);
		canvas.lineTo(pe.x - unitX - unitY / 2, pe.y - unitY + unitX / 2);

		if (type == mxConstants.ARROW_CLASSIC)
		{
			canvas.lineTo(pe.x - unitX * 3 / 4, pe.y - unitY * 3 / 4);
		}

		canvas.lineTo(pe.x + unitY / 2 - unitX, pe.y - unitY - unitX / 2);
		canvas.close();

		var key = (source) ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL;
		
		if (state.style[key] == 0)
		{
			canvas.stroke();
		}
		else
		{
			canvas.fillAndStroke();
		}

		var f = (type != mxConstants.ARROW_CLASSIC) ? 1 : 3 / 4;
		return new mxPoint(-unitX * f - endOffsetX, -unitY * f - endOffsetY);
	};

	this.markers['classic'] = tmp;
	this.markers['block'] = tmp;

	this.markers['open'] = function(canvas, state, type, pe, unitX, unitY, size, source, sw)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = unitX * sw * 1.118;
		var endOffsetY = unitY * sw * 1.118;
		
		pe.x -= endOffsetX;
		pe.y -= endOffsetY;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);

		canvas.begin();
		canvas.moveTo(pe.x - unitX - unitY / 2, pe.y - unitY + unitX / 2);
		canvas.lineTo(pe.x, pe.y);
		canvas.lineTo(pe.x + unitY / 2 - unitX, pe.y - unitY - unitX / 2);
		canvas.stroke();
		
		return new mxPoint(-endOffsetX * 2, -endOffsetY * 2);
	};

	this.markers['oval'] = function(canvas, state, type, pe, unitX, unitY, size, source, sw)
	{
		var a = size / 2;
		
		canvas.ellipse(pe.x - a, pe.y - a, size, size);
		
		var key = (source) ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL;
		
		if (state.style[key] == 0)
		{
			canvas.stroke();
		}
		else
		{
			canvas.fillAndStroke();
		}
		
		return new mxPoint(-unitX / 2, -unitY / 2);
	};

	var tmp_diamond = function(canvas, state, type, pe, unitX, unitY, size, source, sw)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 45 degrees, 1/sin(45) = 1.4142 / 2 = 0.7071 ( / 2 allows for
		// only half the strokewidth is processed ). Or 0.9862 for thin diamond.
		// Note these values and the tk variable below are dependent, update
		// both together (saves trig hard coding it).
		var swFactor = (type == mxConstants.ARROW_DIAMOND) ?  0.7071 : 0.9862;
		var endOffsetX = unitX * sw * swFactor;
		var endOffsetY = unitY * sw * swFactor;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);
		
		pe.x -= endOffsetX;
		pe.y -= endOffsetY;
		
		// thickness factor for diamond
		var tk = ((type == mxConstants.ARROW_DIAMOND) ?  2 : 3.4);
		
		canvas.begin();
		canvas.moveTo(pe.x, pe.y);
		canvas.lineTo(pe.x - unitX / 2 - unitY / tk, pe.y + unitX / tk - unitY / 2);
		canvas.lineTo(pe.x - unitX, pe.y - unitY);
		canvas.lineTo(pe.x - unitX / 2 + unitY / tk, pe.y - unitY / 2 - unitX / tk);
		canvas.close();

		var key = (source) ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL;
		
		if (state.style[key] == 0)
		{
			canvas.stroke();
		}
		else
		{
			canvas.fillAndStroke();
		}
		
		return new mxPoint(-endOffsetX - unitX, -endOffsetY - unitY);
	};

	this.markers['diamond'] = tmp_diamond;
	this.markers['diamondThin'] = tmp_diamond;
};
