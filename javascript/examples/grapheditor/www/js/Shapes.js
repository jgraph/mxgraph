/**
 * $Id: Shapes.js,v 1.13 2013/02/02 06:44:30 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */

/**
 * Registers shapes.
 */
(function()
{
	// Cube Shape, supports size style
	function CubeShape() { };
	CubeShape.prototype = new mxCylinder();
	CubeShape.prototype.constructor = CubeShape;
	CubeShape.prototype.size = 20;
	CubeShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

		if (isForeground)
		{
			path.moveTo(s, h);
			path.lineTo(s, s);
			path.lineTo(0, 0);
			path.moveTo(s, s);
			path.lineTo(w, s);
			path.end();
		}
		else
		{
			path.moveTo(0, 0);
			path.lineTo(w - s, 0);
			path.lineTo(w, s);
			path.lineTo(w, h);
			path.lineTo(s, h);
			path.lineTo(0, h - s);
			path.lineTo(0, 0);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['cube'] = CubeShape;

	// Note Shape, supports size style
	function NoteShape() { };
	NoteShape.prototype = new mxCylinder();
	NoteShape.prototype.constructor = NoteShape;
	NoteShape.prototype.size = 30;
	NoteShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

		if (isForeground)
		{
			path.moveTo(w - s, 0);
			path.lineTo(w - s, s);
			path.lineTo(w, s);
			path.end();
		}
		else
		{
			path.moveTo(0, 0);
			path.lineTo(w - s, 0);
			path.lineTo(w, s);
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.lineTo(0, 0);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['note'] = NoteShape;

	// Folder Shape, supports tabWidth, tabHeight styles
	function FolderShape() { };
	FolderShape.prototype = new mxCylinder();
	FolderShape.prototype.constructor = FolderShape;
	FolderShape.prototype.tabWidth = 60;
	FolderShape.prototype.tabHeight = 20;
	FolderShape.prototype.tabPosition = 'right';
	FolderShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var tw = mxUtils.getValue(this.style, 'tabWidth', this.tabWidth);
		var th = mxUtils.getValue(this.style, 'tabHeight', this.tabHeight);
		var tp = mxUtils.getValue(this.style, 'tabPosition', this.tabPosition);
		var dx = Math.min(w, tw);
		var dy = Math.min(h, th);

		if (isForeground)
		{
			if (tp == 'left')
			{
				path.moveTo(0, dy);
				path.lineTo(dx, dy);
			}
			// Right is default
			else
			{
				path.moveTo(w - dx, dy);
				path.lineTo(w, dy);
			}
			
			path.end();
		}
		else
		{
			if (tp == 'left')
			{
				path.moveTo(0, 0);
				path.lineTo(dx, 0);
				path.lineTo(dx, dy);
				path.lineTo(w, dy);
			}
			// Right is default
			else
			{
				path.moveTo(0, dy);
				path.lineTo(w - dx, dy);
				path.lineTo(w - dx, 0);
				path.lineTo(w, 0);
			}
			
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.lineTo(0, dy);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['folder'] = FolderShape;

	// Card Shape, supports size style
	function CardShape() { };
	CardShape.prototype = new mxCylinder();
	CardShape.prototype.constructor = CardShape;
	CardShape.prototype.size = 30;
	CardShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

		if (!isForeground)
		{
			path.moveTo(s, 0);
			path.lineTo(w, 0);
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.lineTo(0, s);
			path.lineTo(s, 0);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['card'] = CardShape;

	// Tape Shape, supports size style
	function TapeShape() { };
	TapeShape.prototype = new mxCylinder();
	TapeShape.prototype.constructor = TapeShape;
	TapeShape.prototype.size = 0.4;
	TapeShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s = mxUtils.getValue(this.style, 'size', this.size);
		var dy = h * s;
		var fy = 1.4;

		if (!isForeground)
		{
			path.moveTo(0, dy / 2);
			path.quadTo(w / 4, dy * fy, w / 2, dy / 2);
			path.quadTo(w * 3 / 4, dy * (1 - fy), w, dy / 2);
			path.lineTo(w, h - dy / 2);
			path.quadTo(w * 3 / 4, h - dy * fy, w / 2, h - dy / 2);
			path.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
			path.lineTo(0, dy / 2);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['tape'] = TapeShape;

	// Tape Shape, supports size style
	function StepShape() { };
	StepShape.prototype = new mxCylinder();
	StepShape.prototype.constructor = StepShape;
	StepShape.prototype.size = 0.2;
	StepShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s =  w * mxUtils.getValue(this.style, 'size', this.size);

		if (!isForeground)
		{
			path.moveTo(0, 0);
			path.lineTo(w - s, 0);
			path.lineTo(w, h / 2);
			path.lineTo(w - s, h);
			path.lineTo(0, h);
			path.lineTo(s, h / 2);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['step'] = StepShape;

	// Plus Shape
	function PlusShape()
	{
		mxRectangleShape.call(this);
	};
	mxUtils.extend(PlusShape, mxRectangleShape);
	PlusShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	PlusShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		var border = Math.min(w / 5, h / 5) + 1;
		
		c.begin();
		c.moveTo(x + w / 2, y + border);
		c.lineTo(x + w / 2, y + h - border);
		c.moveTo(x + border, y + h / 2);
		c.lineTo(x + w - border, y + h / 2);
		c.end();
		c.stroke();
		mxRectangleShape.prototype.paintForeground.apply(this, arguments);
	};

	mxCellRenderer.prototype.defaultShapes['plus'] = PlusShape;

	// CompositeShape
	function ExtendedShape()
	{
		mxRectangleShape.call(this);
	};
	mxUtils.extend(ExtendedShape, mxRectangleShape);
	ExtendedShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	ExtendedShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		if (this.style != null)
		{
			if (this.style['double'] == 1)
			{
				var inset = Math.max(2, this.strokewidth + 1);
	
				mxRectangleShape.prototype.paintBackground.call(this, c, x + inset, y + inset, w - 2 * inset, h - 2 * inset);
				mxRectangleShape.prototype.paintForeground.apply(this, arguments);
				
				x += inset;
				y += inset;
				w -= 2 * inset;
				h -= 2 * inset;
			}
			
			c.setDashed(false);
			
			// Draws the symbols defined in the style. The symbols are
			// numbered from 1...n. Possible postfixes are align,
			// verticalAlign, spacing, arcSpacing, width, height
			var counter = 0;
			var shape = null;
			
			do
			{
				shape = mxCellRenderer.prototype.defaultShapes[this.style['symbol' + counter]];
				
				if (shape != null)
				{
					var align = this.style['symbol' + counter + 'Align'];
					var valign = this.style['symbol' + counter + 'VerticalAlign'];
					var width = this.style['symbol' + counter + 'Width'];
					var height = this.style['symbol' + counter + 'Height'];
					var spacing = this.style['symbol' + counter + 'Spacing'] || 0;
					var arcspacing = this.style['symbol' + counter + 'ArcSpacing'];
					
					if (arcspacing != null)
					{
						spacing += this.getArcSize(w + this.strokewidth, h + this.strokewidth) * arcspacing;
					}
					
					var x2 = x;
					var y2 = y;
					
					if (align == mxConstants.ALIGN_CENTER)
					{
						x2 += (w - width) / 2;
					}
					else if (align == mxConstants.ALIGN_RIGHT)
					{
						x2 += w - width - spacing;
					}
					else
					{
						x2 += spacing;
					}
					
					if (valign == mxConstants.ALIGN_MIDDLE)
					{
						y2 += (h - height) / 2;
					}
					else if (valign == mxConstants.ALIGN_BOTTOM)
					{
						y2 += h - height - spacing;
					}
					else
					{
						y2 += spacing;
					}
					
					c.save();
					
					// Small hack to pass style along into subshape
					var tmp = new shape();
					// TODO: Clone style and override settings (eg. strokewidth)
					tmp.style = this.style;
					shape.prototype.paintVertexShape.call(tmp, c, x2, y2, width, height);
					c.restore();
				}
				
				counter++;
			}
			while (shape != null);
		}
	};

	mxCellRenderer.prototype.defaultShapes['ext'] = ExtendedShape;
	
	// Tape Shape, supports size style
	function MessageShape() { };
	MessageShape.prototype = new mxCylinder();
	MessageShape.prototype.constructor = MessageShape;
	MessageShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		if (isForeground)
		{
			path.moveTo(0, 0);
			path.lineTo(w / 2, h / 2);
			path.lineTo(w, 0);
			path.end();
		}
		else
		{
			path.moveTo(0, 0);
			path.lineTo(w, 0);
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.close();
		}
	};

	mxCellRenderer.prototype.defaultShapes['message'] = MessageShape;
	
	// New Actor Shape
	function UmlActorShape() { };
	UmlActorShape.prototype = new mxCylinder();
	UmlActorShape.prototype.constructor = UmlActorShape;
	UmlActorShape.prototype.addPipe = true;
	UmlActorShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var width = w / 3;
		var height = h / 4;
		
		if (!isForeground)
		{
			path.moveTo(w / 2, height);
			path.curveTo(w / 2 - width, height, w / 2 - width, 0, w / 2, 0);
			path.curveTo(w / 2 + width, 0, w / 2 + width, height, w / 2, height);
			path.close();

			path.moveTo(w / 2, height);
			path.lineTo(w / 2, 2 * h / 3);
			
			// Arms
			path.moveTo(w / 2, h / 3);
			path.lineTo(0, h / 3);
			path.moveTo(w / 2, h / 3);
			path.lineTo(w, h / 3);
			
			// Legs
			path.moveTo(w / 2, 2 * h / 3);
			path.lineTo(0, h);
			path.moveTo(w / 2, 2 * h / 3);
			path.lineTo(w, h);
			path.end();
		}
	};

	// Replaces existing actor shape
	mxCellRenderer.prototype.defaultShapes['umlActor'] = UmlActorShape;

	// New Actor Shape
	function LollipopShape() { };
	LollipopShape.prototype = new mxCylinder();
	LollipopShape.prototype.constructor = LollipopShape;
	LollipopShape.prototype.size = 10;
	LollipopShape.prototype.addPipe = true;
	LollipopShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var ss = mxUtils.getValue(this.style, 'size', this.size);
		var width = ss * 2 / 3;
		var height = ss;
		
		if (!isForeground)
		{
			path.moveTo(w / 2, height);
			path.curveTo(w / 2 - width, height, w / 2 - width, 0, w / 2, 0);
			path.curveTo(w / 2 + width, 0, w / 2 + width, height, w / 2, height);
			path.close();

			path.moveTo(w / 2, height);
			path.lineTo(w / 2, h);
			path.end();
		}
	};

	// Replaces existing actor shape
	mxCellRenderer.prototype.defaultShapes['lollipop'] = LollipopShape;
	
	// Folder Shape, supports tabWidth, tabHeight styles
	function ComponentShape() { };
	ComponentShape.prototype = new mxCylinder();
	ComponentShape.prototype.constructor = ComponentShape;
	ComponentShape.prototype.jettyWidth = 32;
	ComponentShape.prototype.jettyHeight = 12;
	ComponentShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var dx = mxUtils.getValue(this.style, 'jettyWidth', this.jettyWidth);
		var dy = mxUtils.getValue(this.style, 'jettyHeight', this.jettyHeight);
		var x0 = dx / 2;
		var x1 = x0 + dx / 2;
		var y0 = 0.3 * h - dy / 2;
		var y1 = 0.7 * h - dy / 2;

		if (isForeground)
		{
			path.moveTo(x0, y0);
			path.lineTo(x1, y0);
			path.lineTo(x1, y0 + dy);
			path.lineTo(x0, y0 + dy);
			path.moveTo(x0, y1);
			path.lineTo(x1, y1);
			path.lineTo(x1, y1 + dy);
			path.lineTo(x0, y1 + dy);
			path.end();
		}
		else
		{
			path.moveTo(x0, 0);
			path.lineTo(w, 0);
			path.lineTo(w, h);
			path.lineTo(x0, h);
			path.lineTo(x0, y1 + dy);
			path.lineTo(0, y1 + dy);
			path.lineTo(0, y1);
			path.lineTo(x0, y1);
			path.lineTo(x0, y0 + dy);
			path.lineTo(0, y0 + dy);
			path.lineTo(0, y0);
			path.lineTo(x0, y0);
			path.close();
			path.end();
		}
	};

	mxCellRenderer.prototype.defaultShapes['component'] = ComponentShape;
	
	// State Shapes derives from double ellipse
	function StateShape() { };
	StateShape.prototype = new mxDoubleEllipse();
	StateShape.prototype.constructor = StateShape;
	StateShape.prototype.outerStroke = true;
	StateShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		var inset = Math.min(4, Math.min(w / 5, h / 5));
		
		if (w > 0 && h > 0)
		{
			c.ellipse(x + inset, y + inset, w - 2 * inset, h - 2 * inset);
			c.fillAndStroke();
		}
		
		c.setShadow(false);

		if (this.outerStroke)
		{
			c.ellipse(x, y, w, h);
			c.stroke();			
		}
	};

	mxCellRenderer.prototype.defaultShapes['endState'] = StateShape;

	function StartStateShape() { };
	StartStateShape.prototype = new StateShape();
	StartStateShape.prototype.constructor = StartStateShape;
	StartStateShape.prototype.outerStroke = false;
	
	mxCellRenderer.prototype.defaultShapes['startState'] = StartStateShape;

	// Image export for state shapes
	var imageExportInitShapes = mxImageExport.prototype.initShapes;
	mxImageExport.prototype.initShapes = function()
	{
		imageExportInitShapes.apply(this, arguments);

		function createStateShape(outerStroke)
		{
			return {
				drawShape: function(canvas, state, bounds, background)
				{
					var x = bounds.x;
					var y = bounds.y;
					var w = bounds.width;
					var h = bounds.height;
					
					if (background)
					{
						var inset = Math.min(4, Math.min(w / 5, h / 5));
						x += inset;
						y += inset;
						w -= 2 * inset;
						h -= 2 * inset;
						
						if (w > 0 && h > 0)
						{
							canvas.ellipse(x, y, w, h);
						}
						
						return true;
					}
					else
					{
						canvas.fillAndStroke();
		
						if (outerStroke)
						{
							canvas.ellipse(x, y, w, h);
							canvas.stroke();
						}
					}
				}
			};
		};
		
		this.shapes['endState'] = createStateShape(true);
		this.shapes['startState'] = createStateShape(false);
	};

	// Defines custom edge shape
	function LinkShape()
	{
		mxArrow.call(this);
	};
	mxUtils.extend(LinkShape, mxArrow);
	LinkShape.prototype.paintEdgeShape = function(c, pts)
	{
		var width = 10;

		// Base vector (between end points)
		var p0 = pts[0];
		var pe = pts[pts.length - 1];
		
		var dx = pe.x - p0.x;
		var dy = pe.y - p0.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var length = dist;
		
		// Computes the norm and the inverse norm
		var nx = dx / dist;
		var ny = dy / dist;
		var basex = length * nx;
		var basey = length * ny;
		var floorx = width * ny/3;
		var floory = -width * nx/3;
		
		// Computes points
		var p0x = p0.x - floorx / 2;
		var p0y = p0.y - floory / 2;
		var p1x = p0x + floorx;
		var p1y = p0y + floory;
		var p2x = p1x + basex;
		var p2y = p1y + basey;
		var p3x = p2x + floorx;
		var p3y = p2y + floory;
		// p4 not necessary
		var p5x = p3x - 3 * floorx;
		var p5y = p3y - 3 * floory;
		
		c.begin();
		c.moveTo(p1x, p1y);
		c.lineTo(p2x, p2y);
		c.moveTo(p5x + floorx, p5y + floory);
		c.lineTo(p0x, p0y);
		c.stroke();
	};

	// Registers the link shape
	mxCellRenderer.prototype.defaultShapes['link'] = LinkShape;

	// Registers and defines the custom marker
	mxMarker.addMarker('dash', function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var nx = unitX * (size + sw + 1);
		var ny = unitY * (size + sw + 1);

		return function()
		{
			canvas.begin();
			canvas.moveTo(pe.x - nx / 2 - ny / 2, pe.y - ny / 2 + nx / 2);
			canvas.lineTo(pe.x + ny / 2 - 3 * nx / 2, pe.y - 3 * ny / 2 - nx / 2);
			canvas.stroke();
		};
	});

	// Implements custom handlers
	var SPECIAL_HANDLE_INDEX = -99;

	// Handlers are only added if mxVertexHandler is defined (ie. not in embedded graph)
	if (typeof(mxVertexHandler) != 'undefined')
	{
		function mxExtVertexHandler(state)
		{
			mxVertexHandler.call(this, state);
		};
	
		mxUtils.extend(mxExtVertexHandler, mxVertexHandler);
	
		mxExtVertexHandler.prototype.useGridForSpecialHandle = false;
		
		mxExtVertexHandler.prototype.init = function()
		{
			this.horizontal = mxUtils.getValue(this.state.style, mxConstants.STYLE_HORIZONTAL, true);
			var graph = this.state.view.graph;
	
			if (this.handleImage != null)
			{
				var bounds = new mxRectangle(0, 0, this.handleImage.width, this.handleImage.height);
				this.specialHandle = new mxImageShape(bounds, this.handleImage.src);
			}
			else
			{
				var size = 10;
				var bounds = new mxRectangle(0, 0, size, size);
				this.specialHandle = new mxRhombus(bounds, mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
			}
			
			this.specialHandle.dialect = (graph.dialect != mxConstants.DIALECT_SVG) ?
					mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
			this.specialHandle.init(graph.getView().getOverlayPane());
			this.specialHandle.node.style.cursor = this.getSpecialHandleCursor();
	
			mxEvent.redirectMouseEvents(this.specialHandle.node, graph, this.state);
			mxVertexHandler.prototype.init.apply(this, arguments);
		};
		
		mxExtVertexHandler.prototype.getSpecialHandleCursor = function()
		{
			return 'default';
		};
		
		mxExtVertexHandler.prototype.redraw = function()
		{
			mxVertexHandler.prototype.redraw.apply(this, arguments);
	
			var size = this.specialHandle.bounds.width;
			this.specialHandle.bounds = this.getSpecialHandleBounds(size);
			this.specialHandle.redraw();
		};

		mxExtVertexHandler.prototype.destroy = function()
		{
			mxVertexHandler.prototype.destroy.apply(this, arguments);
			
			if (this.specialHandle != null)
			{
				this.specialHandle.destroy();
				this.specialHandle = null;
			}
		};
		
		mxExtVertexHandler.prototype.getHandleForEvent = function(me)
		{
			if (me.isSource(this.specialHandle))
			{
				return SPECIAL_HANDLE_INDEX;
			}
			
			return mxVertexHandler.prototype.getHandleForEvent.apply(this, arguments);
		};

		mxExtVertexHandler.prototype.mouseMove = function(sender, me)
		{
			if (!me.isConsumed() && this.index == SPECIAL_HANDLE_INDEX)
			{
				var point = new mxPoint(me.getGraphX(), me.getGraphY());
				this.constrainPoint(point);
				var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
				var scale = this.graph.getView().scale;
				
				if (gridEnabled && this.useGridForSpecialHandle)
				{
					point.x = this.graph.snap(point.x / scale) * scale;
					point.y = this.graph.snap(point.y / scale) * scale;
				}
				
				this.updateStyle(point);			
				this.moveSizerTo(this.specialHandle, point.x, point.y);
				this.state.view.graph.cellRenderer.redraw(this.state, true);
				me.consume();
			}
			else
			{
				mxVertexHandler.prototype.mouseMove.apply(this, arguments);
			}
		};

		mxExtVertexHandler.prototype.mouseUp = function(sender, me)
		{
			if (!me.isConsumed() && this.index == SPECIAL_HANDLE_INDEX)
			{
				this.applyStyle();
				this.reset();
				me.consume();
			}
			else
			{
				mxVertexHandler.prototype.mouseUp.apply(this, arguments);
			}
		};

		mxExtVertexHandler.prototype.getSpecialHandleBounds = function(size)
		{
			var rotation = this.state.shape.getShapeRotation();
			var alpha = mxUtils.toRadians(rotation);
			var cos = Math.cos(alpha);
			var sin = Math.sin(alpha);
			
			var bounds = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
			
			if (this.state.shape.isPaintBoundsInverted())
			{
				var t = (bounds.width - bounds.height) / 2;
				bounds.x += t;
				bounds.y -= t;
				var tmp = bounds.width;
				bounds.width = bounds.height;
				bounds.height = tmp;
			}
	
			var pt = this.getSpecialHandlePoint(bounds);

			if (this.state.shape.flipH)
			{
				pt.x = 2 * bounds.x + bounds.width - pt.x;
			}
			
			if (this.state.shape.flipV)
			{
				pt.y = 2 * bounds.y + bounds.height - pt.y;
			}
			
			pt = mxUtils.getRotatedPoint(pt, cos, sin,
				new mxPoint(this.state.getCenterX(), this.state.getCenterY()));

			return new mxRectangle(pt.x - size / 2, pt.y - size / 2, size, size);
		};
		
		mxExtVertexHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			// Hook for subclassers
			return null;
		};
	
		mxExtVertexHandler.prototype.updateStyle = function(point)
		{
			// Hook for subclassers
		};
		
		mxExtVertexHandler.prototype.constrainPoint = function(point)
		{
			point.x = Math.max(this.state.x, Math.min(this.state.x + this.state.width, point.x));
			point.y = Math.max(this.state.y, Math.min(this.state.y + this.state.height, point.y));
		};
		
		mxExtVertexHandler.prototype.applyStyle = function()
		{
			// Hook for subclassers
		};

		// Folder Handler
		function mxFolderHandler(state)
		{
			mxExtVertexHandler.call(this, state);
		};
	
		mxUtils.extend(mxFolderHandler, mxExtVertexHandler);

		mxFolderHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var scale = this.graph.getView().scale;
			var tw = Math.min(bounds.width, mxUtils.getValue(this.state.style, 'tabWidth', 60) * scale);
			var th = Math.min(bounds.height, mxUtils.getValue(this.state.style, 'tabHeight', 20) * scale);
			
			var tp = mxUtils.getValue(this.state.style, 'tabPosition', 'right');
			var x = (tp == 'left') ? bounds.x + tw : bounds.x + bounds.width - tw;
	
			return new mxPoint(x, bounds.y + th);
		};
		
		mxFolderHandler.prototype.updateStyle = function(point)
		{
			var rotation = this.state.shape.getShapeRotation();
			var alpha = mxUtils.toRadians(rotation);
			var cos = Math.cos(-alpha);
			var sin = Math.sin(-alpha);

			var bounds = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
			
			if (this.state.shape.isPaintBoundsInverted())
			{
				var t = (bounds.width - bounds.height) / 2;
				bounds.x += t;
				bounds.y -= t;
				var tmp = bounds.width;
				bounds.width = bounds.height;
				bounds.height = tmp;
			}
	
			var pt = new mxPoint(point.x, point.y);
			pt = mxUtils.getRotatedPoint(pt, cos, sin,
				new mxPoint(this.state.getCenterX(), this.state.getCenterY()));

			if (this.state.shape.flipH)
			{
				pt.x = 2 * bounds.x + bounds.width - pt.x;
			}
			
			if (this.state.shape.flipV)
			{
				pt.y = 2 * bounds.y + bounds.height - pt.y;
			}
			
			var result = this.updateStyleUnrotated(pt, bounds);
		
			// Modifies point to use rotated coordinates of return value
			if (result != null)
			{
				if (this.state.shape.flipH)
				{
					result.x = 2 * bounds.x + bounds.width - result.x;
				}
				
				if (this.state.shape.flipV)
				{
					result.y = 2 * bounds.y + bounds.height - result.y;
				}
				
				cos = Math.cos(alpha);
				sin = Math.sin(alpha);
				result = mxUtils.getRotatedPoint(result, cos, sin,
						new mxPoint(this.state.getCenterX(), this.state.getCenterY()));
				point.x = result.x;
				point.y = result.y;
			}
		};
		
		mxFolderHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var tp = mxUtils.getValue(this.state.style, 'tabPosition', 'right');
			var tw = (tp == 'left') ? pt.x - bounds.x : bounds.x + bounds.width - pt.x;
			var th = pt.y - bounds.y;
			
			var scale = this.graph.getView().scale;
			this.state.style['tabWidth'] = Math.round(Math.max(1, tw) / scale);
			this.state.style['tabHeight'] =  Math.round(Math.max(1, th) / scale);
		};
		
		mxFolderHandler.prototype.applyStyle = function()
		{
			var model = this.graph.getModel();
			model.beginUpdate();
			try
			{
				this.state.view.graph.setCellStyles('tabWidth', this.state.style['tabWidth'], [this.state.cell]);
				this.state.view.graph.setCellStyles('tabHeight', this.state.style['tabHeight'], [this.state.cell]);
			}
			finally
			{
				model.endUpdate();
			}
		};
		
		// Swimlane Handler
		function mxSwimlaneHandler(state)
		{
			mxFolderHandler.call(this, state);
		};
		
		mxUtils.extend(mxSwimlaneHandler, mxFolderHandler);
		
		mxSwimlaneHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var scale = this.graph.getView().scale;
			var startSize = mxUtils.getValue(this.state.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE);

			return new mxPoint(bounds.x + bounds.width / 2, bounds.y + Math.min(bounds.height, startSize * scale));
		};
		
		mxSwimlaneHandler.prototype.updateStyleUnrotated = function(point, bounds)
		{
			point.x = bounds.x + bounds.width / 2;
			startSize = point.y - bounds.y;
			var scale = this.graph.getView().scale;
			this.state.style['startSize'] = Math.round(Math.max(1, startSize) / scale);
			
			return point;
		};
		
		mxSwimlaneHandler.prototype.applyStyle = function()
		{
			this.state.view.graph.setCellStyles('startSize', this.state.style['startSize'], [this.state.cell]);
		};

		// Cube Handler
		function mxCubeHandler(state)
		{
			mxFolderHandler.call(this, state);
		};
	
		mxUtils.extend(mxCubeHandler, mxFolderHandler);
		
		mxCubeHandler.prototype.defaultValue = 20;
	
		mxCubeHandler.prototype.scaleFactor = 1;
		
		mxCubeHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var scale = this.graph.getView().scale;
			var sz = Math.min(bounds.width, Math.min(bounds.height,
				mxUtils.getValue(this.state.style, 'size', this.defaultValue) * scale / this.scaleFactor));
			
			return new mxPoint(bounds.x + sz, bounds.y + sz);
		};
	
		mxCubeHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(Math.min(bounds.width / this.scaleFactor, pt.x - bounds.x),
					Math.min(bounds.height / this.scaleFactor, pt.y - bounds.y)));
			var scale = this.graph.getView().scale;
			this.state.style['size'] = Math.round(Math.max(1, size) / scale) * this.scaleFactor;
			
			// Stays on the diagonal
			return new mxPoint(bounds.x + size, bounds.y + size);
		};
		
		mxCubeHandler.prototype.applyStyle = function()
		{
			this.state.view.graph.setCellStyles('size', this.state.style['size'], [this.state.cell]);
		};
		
		// Card Handler
		function mxCardHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxCardHandler, mxCubeHandler);
		
		mxCardHandler.prototype.defaultValue = 30;
	
		mxCardHandler.prototype.scaleFactor = 2;
		
		// Note Handler
		function mxNoteHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxNoteHandler, mxCubeHandler);
		
		mxNoteHandler.prototype.defaultValue = 30;
	
		mxNoteHandler.prototype.scaleFactor = 1;
		
		mxNoteHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var scale = this.graph.getView().scale;
			var sz = Math.min(bounds.width, Math.min(bounds.height,
					mxUtils.getValue(this.state.style, 'size', this.defaultValue) * scale / this.scaleFactor));
			
			return new mxPoint(bounds.x + bounds.width - sz, bounds.y + sz);
		};
		
		mxNoteHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(Math.min(bounds.width / this.scaleFactor, pt.x - bounds.x + bounds.width),
					Math.min(bounds.height / this.scaleFactor, pt.y - bounds.y)));
			var scale = this.graph.getView().scale;
			this.state.style['size'] = Math.round(Math.max(1, size) / scale) * this.scaleFactor;
			
			// Stays on the diagonal
			return new mxPoint(bounds.x + bounds.width - size, bounds.y + size);
		};
		
		// Step Handler
		function mxStepHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxStepHandler, mxCubeHandler);
		
		mxStepHandler.prototype.defaultValue = 0.2;
	
		mxStepHandler.prototype.scaleFactor = 1;
		
		mxStepHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var sz = mxUtils.getValue(this.state.style, 'size', this.defaultValue);
			
			return new mxPoint(bounds.x + bounds.width * sz, bounds.y + bounds.height / 2);
		};
	
		mxStepHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.min(1, (pt.x - bounds.x) / bounds.width);
			this.state.style['size'] = size;
			
			return new mxPoint(bounds.x + size * bounds.width, bounds.y + bounds.height / 2);
		};
		
		// Tape Handler
		function mxTapeHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxTapeHandler, mxCubeHandler);
		
		mxTapeHandler.prototype.defaultValue = 0.4;
	
		mxTapeHandler.prototype.scaleFactor = 1;
		
		mxTapeHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var sz = mxUtils.getValue(this.state.style, 'size', this.defaultValue);
	
			return new mxPoint(bounds.x + bounds.width / 2, bounds.y + sz * bounds.height / 2);
		};
	
		mxTapeHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(1, ((pt.y - bounds.y) / bounds.height) * 2));
			this.state.style['size'] = size;
			
			return new mxPoint(bounds.x + bounds.width / 2, bounds.y + size * bounds.height / 2);
		};
		
		var handlers = {'swimlane': mxSwimlaneHandler, 'folder': mxFolderHandler, 'cube': mxCubeHandler,
				'card': mxCardHandler, 'note': mxNoteHandler, 'step': mxStepHandler, 'tape': mxTapeHandler};

		var mxGraphCreateHandler = mxGraph.prototype.createHandler;
		mxGraph.prototype.createHandler = function(state)
		{
			if (state != null)
			{
				var ctor = handlers[state.style['shape']];

				if (ctor != null)
				{
					return new ctor(state);
				}
			}
			
			return mxGraphCreateHandler.apply(this, arguments);
		};
	}
	
	// Constraints
	mxGraph.prototype.getAllConnectionConstraints = function(terminal, source)
	{
		if (terminal != null && terminal.shape != null)
		{
			if (terminal.shape.stencil != null)
			{
				if (terminal.shape.stencil != null)
				{
					return terminal.shape.stencil.constraints;
				}
			}
			else if (terminal.shape.constraints != null)
			{
				return terminal.shape.constraints;
			}
		}

		return null;
	};

	mxRectangleShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.5, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.75, 0), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.25), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
	mxLabel.prototype.constraints = mxRectangleShape.prototype.constraints;
	mxImageShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	mxSwimlane.prototype.constraints = mxRectangleShape.prototype.constraints;
	PlusShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	NoteShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	CardShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	CubeShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	FolderShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	mxCylinder.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.15, 0.05), false),
                                        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                        new mxConnectionConstraint(new mxPoint(0.85, 0.05), false),
      	              		 new mxConnectionConstraint(new mxPoint(0, 0.3), true),
      	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
      	              		 new mxConnectionConstraint(new mxPoint(0, 0.7), true),
      	            		 new mxConnectionConstraint(new mxPoint(1, 0.3), true),
      	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
      	            		 new mxConnectionConstraint(new mxPoint(1, 0.7), true),
      	            		 new mxConnectionConstraint(new mxPoint(0.15, 0.95), false),
      	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
      	            		 new mxConnectionConstraint(new mxPoint(0.85, 0.95), false)];
	UmlActorShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0.1), false),
	                                          new mxConnectionConstraint(new mxPoint(0.5, 0), false),
	                                          new mxConnectionConstraint(new mxPoint(0.75, 0.1), false),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 1/3), false),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 1), false),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 1/3), false),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 1), false),
	        	            		 new mxConnectionConstraint(new mxPoint(0.5, 0.5), false)];
	ComponentShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.5, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.75, 0), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.3), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.7), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	        	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
	mxActor.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.5, 0), true),
   	              		 new mxConnectionConstraint(new mxPoint(0.25, 0.2), false),
   	              		 new mxConnectionConstraint(new mxPoint(0.1, 0.5), false),
   	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
   	            		 new mxConnectionConstraint(new mxPoint(0.75, 0.25), false),
   	            		 new mxConnectionConstraint(new mxPoint(0.9, 0.5), false),
   	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
   	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
   	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
   	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
	TapeShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.35), false),
	                                   new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	                                   new mxConnectionConstraint(new mxPoint(0, 0.65), false),
	                                   new mxConnectionConstraint(new mxPoint(1, 0.35), false),
		                                new mxConnectionConstraint(new mxPoint(1, 0.5), false),
		                                new mxConnectionConstraint(new mxPoint(1, 0.65), false),
										new mxConnectionConstraint(new mxPoint(0.25, 1), false),
										new mxConnectionConstraint(new mxPoint(0.75, 0), false)];
	// TODO: Relative ports
	StepShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
                                       new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                       new mxConnectionConstraint(new mxPoint(0.75, 0), true),
                                       new mxConnectionConstraint(new mxPoint(0.25, 1), true),
  	        	            		 	new mxConnectionConstraint(new mxPoint(0.5, 1), true),
  	        	            		 	new mxConnectionConstraint(new mxPoint(0.75, 1), true),
	                                   new mxConnectionConstraint(new mxPoint(0.1, 0.25), false),
	                                   new mxConnectionConstraint(new mxPoint(0.2, 0.5), false),
	                                   new mxConnectionConstraint(new mxPoint(0.1, 0.75), false),
	                                   new mxConnectionConstraint(new mxPoint(0.9, 0.25), false),
		                                new mxConnectionConstraint(new mxPoint(1, 0.5), false),
		                                new mxConnectionConstraint(new mxPoint(0.9, 0.75), false)];
	mxLine.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	                                new mxConnectionConstraint(new mxPoint(0.25, 0.5), false),
	                                new mxConnectionConstraint(new mxPoint(0.75, 0.5), false),
									new mxConnectionConstraint(new mxPoint(1, 0.5), false)];
	LollipopShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.5, 0), false),
										new mxConnectionConstraint(new mxPoint(0.5, 1), false)];
	mxEllipse.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), true), new mxConnectionConstraint(new mxPoint(1, 0), true),
	                                   new mxConnectionConstraint(new mxPoint(0, 1), true), new mxConnectionConstraint(new mxPoint(1, 1), true),
	                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true), new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	          	              		   new mxConnectionConstraint(new mxPoint(0, 0.5), true), new mxConnectionConstraint(new mxPoint(1, 0.5))];
	mxDoubleEllipse.prototype.constraints = mxEllipse.prototype.constraints;
	mxRhombus.prototype.constraints = mxEllipse.prototype.constraints;
	mxTriangle.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.25), true),
	                                    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
	                                   new mxConnectionConstraint(new mxPoint(0, 0.75), true),
	                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
	                                   new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	                                   new mxConnectionConstraint(new mxPoint(1, 0.5), true)];
	mxHexagon.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.375, 0), true),
	                                    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
	                                   new mxConnectionConstraint(new mxPoint(0.625, 0), true),
	                                   new mxConnectionConstraint(new mxPoint(0.125, 0.25), false),
	                                   new mxConnectionConstraint(new mxPoint(0, 0.5), true),
	                                   new mxConnectionConstraint(new mxPoint(0.125, 0.75), false),
	                                   new mxConnectionConstraint(new mxPoint(0.875, 0.25), false),
	                                   new mxConnectionConstraint(new mxPoint(0, 0.5), true),
	                                   new mxConnectionConstraint(new mxPoint(1, 0.5), true),
	                                   new mxConnectionConstraint(new mxPoint(0.875, 0.75), false),
	                                   new mxConnectionConstraint(new mxPoint(0.375, 1), true),
	                                    new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	                                   new mxConnectionConstraint(new mxPoint(0.625, 1), true)];
	mxCloud.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0.25), false),
	                                 new mxConnectionConstraint(new mxPoint(0.4, 0.1), false),
	                                 new mxConnectionConstraint(new mxPoint(0.16, 0.55), false),
	                                 new mxConnectionConstraint(new mxPoint(0.07, 0.4), false),
	                                 new mxConnectionConstraint(new mxPoint(0.31, 0.8), false),
	                                 new mxConnectionConstraint(new mxPoint(0.13, 0.77), false),
	                                 new mxConnectionConstraint(new mxPoint(0.8, 0.8), false),
	                                 new mxConnectionConstraint(new mxPoint(0.55, 0.95), false),
	                                 new mxConnectionConstraint(new mxPoint(0.875, 0.5), false),
	                                 new mxConnectionConstraint(new mxPoint(0.96, 0.7), false),
	                                 new mxConnectionConstraint(new mxPoint(0.625, 0.2), false),
	                                 new mxConnectionConstraint(new mxPoint(0.88, 0.25), false)];
	mxArrow.prototype.constraints = null;
})();
