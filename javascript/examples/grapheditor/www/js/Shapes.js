/**
 * $Id: Shapes.js,v 1.24 2013/11/11 18:20:04 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */

/**
 * Registers shapes.
 */
(function()
{
	// Cube Shape, supports size style
	function CubeShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(CubeShape, mxCylinder);
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
	function NoteShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(NoteShape, mxCylinder);
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
	function FolderShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(FolderShape, mxCylinder);
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

	// Card shape
	function CardShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(CardShape, mxActor);
	CardShape.prototype.size = 30;
	CardShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));
		c.moveTo(s, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h);
		c.lineTo(0, h);
		c.lineTo(0, s);
		c.lineTo(s, 0);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['card'] = CardShape;

	// Tape shape
	function TapeShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(TapeShape, mxActor);
	TapeShape.prototype.size = 0.4;
	TapeShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = mxUtils.getValue(this.style, 'size', this.size);
		var dy = h * s;
		var fy = 1.4;
		c.moveTo(0, dy / 2);
		c.quadTo(w / 4, dy * fy, w / 2, dy / 2);
		c.quadTo(w * 3 / 4, dy * (1 - fy), w, dy / 2);
		c.lineTo(w, h - dy / 2);
		c.quadTo(w * 3 / 4, h - dy * fy, w / 2, h - dy / 2);
		c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
		c.lineTo(0, dy / 2);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['tape'] = TapeShape;

	// Document shape
	function DocumentShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(DocumentShape, mxActor);
	DocumentShape.prototype.size = 0.3;
	DocumentShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = mxUtils.getValue(this.style, 'size', this.size);
		var dy = h * s;
		var fy = 1.4;
		c.moveTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h - dy / 2);
		c.quadTo(w * 3 / 4, h - dy * fy, w / 2, h - dy / 2);
		c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
		c.lineTo(0, dy / 2);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['document'] = DocumentShape;

	// Parallelogram shape
	function ParallelogramShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(ParallelogramShape, mxActor);
	ParallelogramShape.prototype.size = 0.2;
	ParallelogramShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, Math.min(w, mxUtils.getValue(this.style, 'size', this.size) * w));
		c.moveTo(0, h);
		c.lineTo(dx, 0);
		c.lineTo(w, 0);
		c.lineTo(w - dx, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['parallelogram'] = ParallelogramShape;

	// Trapezoid shape
	function TrapezoidShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(TrapezoidShape, mxActor);
	TrapezoidShape.prototype.size = 0.2;
	TrapezoidShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, Math.min(w, mxUtils.getValue(this.style, 'size', this.size) * w));
		c.moveTo(0, h);
		c.lineTo(dx, 0);
		c.lineTo(w - dx, 0);
		c.lineTo(w, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['trapezoid'] = TrapezoidShape;

	// Process Shape
	function ProcessShape()
	{
		mxRectangleShape.call(this);
	};
	mxUtils.extend(ProcessShape, mxRectangleShape);
	ProcessShape.prototype.size = 0.1;
	ProcessShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	ProcessShape.prototype.getLabelBounds = function(rect)
	{
		var w = rect.width;
		var h = rect.height;
		var r = new mxRectangle(rect.x, rect.y, w, h);

		var inset = Math.min(w, Math.min(w, mxUtils.getValue(this.style, 'size', this.size) * w) + this.strokewidth);

		if (this.isRounded)
		{
			var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
				mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
			inset = Math.max(inset, Math.min(w * f, h * f));
		}
		
		r.x += inset;
		r.width -= 2 * inset;
		
		return r;
	};
	ProcessShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		var inset = Math.min(w, Math.min(w, mxUtils.getValue(this.style, 'size', this.size) * w) + this.strokewidth);

		if (this.isRounded)
		{
			var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
				mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
			inset = Math.max(inset, Math.min(w * f, h * f));
		}
		
		c.begin();
		c.moveTo(x + inset, y);
		c.lineTo(x + inset, y + h);
		c.moveTo(x + w - inset, y);
		c.lineTo(x + w - inset, y + h);
		c.end();
		c.stroke();
		mxRectangleShape.prototype.paintForeground.apply(this, arguments);
	};

	mxCellRenderer.prototype.defaultShapes['process'] = ProcessShape;

	// Step shape
	function StepShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(StepShape, mxActor);
	StepShape.prototype.size = 0.2;
	StepShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s =  w * mxUtils.getValue(this.style, 'size', this.size);
		c.moveTo(0, 0);
		c.lineTo(w - s, 0);
		c.lineTo(w, h / 2);
		c.lineTo(w - s, h);
		c.lineTo(0, h);
		c.lineTo(s, h / 2);
		c.close();
		c.end();
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
				
				if (w - 2 * inset > 0 && h - 2 * inset > 0)
				{
					mxRectangleShape.prototype.paintBackground.call(this, c, x + inset, y + inset, w - 2 * inset, h - 2 * inset);
				}

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
	function MessageShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(MessageShape, mxCylinder);
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
	
	// UML Actor Shape
	function UmlActorShape()
	{
		mxShape.call(this);
	};
	mxUtils.extend(UmlActorShape, mxShape);
	UmlActorShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.translate(x, y);

		// Head
		c.ellipse(w / 4, 0, w / 2, h / 4);
		c.fillAndStroke();

		c.begin();
		c.moveTo(w / 2, h / 4);
		c.lineTo(w / 2, 2 * h / 3);
		
		// Arms
		c.moveTo(w / 2, h / 3);
		c.lineTo(0, h / 3);
		c.moveTo(w / 2, h / 3);
		c.lineTo(w, h / 3);
		
		// Legs
		c.moveTo(w / 2, 2 * h / 3);
		c.lineTo(0, h);
		c.moveTo(w / 2, 2 * h / 3);
		c.lineTo(w, h);
		c.end();
		
		c.stroke();
	};

	// Replaces existing actor shape
	mxCellRenderer.prototype.defaultShapes['umlActor'] = UmlActorShape;
	
	// UML Lifeline Shape
	function UmlLifeline()
	{
		mxRectangleShape.call(this);
	};
	mxUtils.extend(UmlLifeline, mxRectangleShape);
	UmlLifeline.prototype.size = 40;
	UmlLifeline.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	UmlLifeline.prototype.getLabelBounds = function(rect)
	{
		var size = mxUtils.getValue(this.style, 'size', this.size);
		
		return new mxRectangle(rect.x, rect.y, rect.width, size * this.scale);
	};
	UmlLifeline.prototype.paintBackground = function(c, x, y, w, h)
	{
		var size = mxUtils.getValue(this.style, 'size', this.size);
		mxRectangleShape.prototype.paintBackground.call(this, c, x, y, w, Math.min(h, size));
		
		if (size < h)
		{
			c.setDashed(true);
			c.begin();
			c.moveTo(x + w / 2, y + size);
			c.lineTo(x + w / 2, y + h);
			c.end();
			c.stroke();
		}
	};
	UmlLifeline.prototype.paintForeground = function(c, x, y, w, h)
	{
		var size = mxUtils.getValue(this.style, 'size', this.size);
		mxRectangleShape.prototype.paintForeground.call(this, c, x, y, w, Math.min(h, size));
	};

	mxCellRenderer.prototype.defaultShapes['umlLifeline'] = UmlLifeline;
	
	mxPerimeter.LifelinePerimeter = function (bounds, vertex, next, orthogonal)
	{
		var size = mxUtils.getValue(vertex.style, 'size', UmlLifeline.prototype.size) * vertex.view.scale;
		
		return new mxPoint(bounds.getCenterX(), Math.min(bounds.y + bounds.height,
				Math.max(bounds.y + size, next.y)));
	};
	
	mxStyleRegistry.putValue('lifelinePerimeter', mxPerimeter.LifelinePerimeter);

	// Lollipop Shape
	function LollipopShape()
	{
		mxShape.call(this);
	};
	mxUtils.extend(LollipopShape, mxShape);
	LollipopShape.prototype.size = 10;
	LollipopShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		var sz = mxUtils.getValue(this.style, 'size', this.size);
		c.translate(x, y);
		
		c.ellipse((w - sz) / 2, 0, sz, sz);
		c.fillAndStroke();

		c.begin();
		c.moveTo(w / 2, sz);
		c.lineTo(w / 2, h);
		c.end();
		c.stroke();
	};

	// Replaces existing actor shape
	mxCellRenderer.prototype.defaultShapes['lollipop'] = LollipopShape;
	
	// Component shape
	function ComponentShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(ComponentShape, mxCylinder);
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
	function StateShape()
	{
		mxDoubleEllipse.call(this);
	};
	mxUtils.extend(StateShape, mxDoubleEllipse);
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

	function StartStateShape()
	{
		StateShape.call(this);
	};
	mxUtils.extend(StartStateShape, StateShape);
	StartStateShape.prototype.outerStroke = false;
	
	mxCellRenderer.prototype.defaultShapes['startState'] = StartStateShape;

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

		// Installs custom image
		mxExtVertexHandler.prototype.specialHandleImage = new mxImage(IMAGE_PATH + '/touch-handle-orange.png', 16, 16);
		
		mxExtVertexHandler.prototype.init = function()
		{
			this.horizontal = mxUtils.getValue(this.state.style, mxConstants.STYLE_HORIZONTAL, true);
			var graph = this.state.view.graph;
	
			var size = 10;
			var bounds = new mxRectangle(0, 0, size, size);
			
			if (this.handleImage != null)
			{
				bounds = new mxRectangle(0, 0, this.specialHandleImage.width, this.specialHandleImage.height);
				this.specialHandle = new mxImageShape(bounds, this.specialHandleImage.src);
				this.specialHandle.preserveImageAspect = false;
			}
			
			if (this.state.text != null && this.state.text.node.parentNode == graph.container)
			{
				if (this.specialHandle == null)
				{
					this.specialHandle = new mxRectangleShape(bounds, mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
					this.specialHandle.bounds.height -= 4;
					this.specialHandle.bounds.width -= 4;
				}
				
				this.specialHandle.dialect = mxConstants.DIALECT_STRICTHTML;
				this.specialHandle.init(graph.container);
			}
			else
			{
				if (this.specialHandle == null)
				{
					this.specialHandle = new mxRhombus(bounds, mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
				}
				
				this.specialHandle.dialect = (graph.dialect != mxConstants.DIALECT_SVG) ?
					mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
				this.specialHandle.init(graph.getView().getOverlayPane());
			}

			mxEvent.redirectMouseEvents(this.specialHandle.node, graph, this.state);
			this.specialHandle.node.style.cursor = this.getSpecialHandleCursor();
			
			// Locked state is implemented via rotatable flag
			if (!graph.isCellRotatable(this.state.cell))
			{
				this.specialHandle.node.style.display = 'none';
			}
			
			mxVertexHandler.prototype.init.apply(this, arguments);
		};
		
		mxExtVertexHandler.prototype.getSpecialHandleCursor = function()
		{
			return 'default';
		};
		
		mxExtVertexHandler.prototype.hideSizers = function()
		{
			mxVertexHandler.prototype.hideSizers.apply(this, arguments);
			
			this.specialHandle.node.style.display = 'none';
		};
		
		mxExtVertexHandler.prototype.start = function(x, y, index)
		{
			mxVertexHandler.prototype.start.apply(this, arguments);
			
			if (this.livePreview && index == SPECIAL_HANDLE_INDEX)
			{
				this.specialHandle.node.style.display = '';
			}
		};
		
		mxExtVertexHandler.prototype.reset = function()
		{
			mxVertexHandler.prototype.reset.apply(this, arguments);
			
			if (this.specialHandle != null)
			{
				this.specialHandle.node.style.display = '';
			}
		};
		
		mxExtVertexHandler.prototype.redrawHandles = function()
		{
			mxVertexHandler.prototype.redrawHandles.apply(this, arguments);
	
			if (this.specialHandle != null)
			{
				var size = this.specialHandle.bounds.width;
				this.specialHandle.bounds = this.getSpecialHandleBounds(size);
				this.specialHandle.redraw();
				
				// Hides special handle if shape too small
				if (this.state.width < 2 * this.specialHandle.bounds.width && this.state.height < 2 * this.specialHandle.bounds.height)
				{
					this.specialHandle.node.style.visibility = 'hidden';
				}
			}
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
			// Connection highlight may consume events before they reach sizer handle
			var tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 0;
			var hit = (this.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ?
				new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
			
			function checkShape(shape)
			{
				if (shape != null && (me.isSource(shape) || (hit != null && mxUtils.intersects(shape.bounds, hit) &&
					shape.node.style.display != 'none' && shape.node.style.visibility != 'hidden')))
				{
					var dx = me.getGraphX() - shape.bounds.getCenterX();
					var dy = me.getGraphY() - shape.bounds.getCenterY();
					var tmp = dx * dx + dy * dy;

					if (minDistSq == null || tmp <= minDistSq)
					{
						minDistSq = tmp;
					
						return true;
					}
				}
				
				return false;
			}
			
			if ((me.isSource(this.specialHandle) || (hit != null &&
				mxUtils.intersects(this.specialHandle.bounds, hit))) &&
				this.specialHandle.node.style.display != 'none' &&
				this.specialHandle.node.style.visibility != 'hidden')
			{
				return SPECIAL_HANDLE_INDEX;
			}
			
			return mxVertexHandler.prototype.getHandleForEvent.apply(this, arguments);
		};

		mxExtVertexHandler.prototype.mouseMove = function(sender, me)
		{
			if (!me.isConsumed() && this.index == SPECIAL_HANDLE_INDEX)
			{
				// Checks tolerance for ignoring single clicks
				this.checkTolerance(me);

				if (!this.inTolerance)
				{
					var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
					var point = new mxPoint(me.getGraphX(), me.getGraphY());
					var scale = this.graph.getView().scale;
					
					this.constrainPoint(point);
					
					if (gridEnabled && this.useGridForSpecialHandle)
					{
						point.x = this.graph.snap(point.x / scale) * scale;
						point.y = this.graph.snap(point.y / scale) * scale;
					}
					
					this.updateStyle(point);
					this.state.view.graph.cellRenderer.redraw(this.state, true);
					
					this.moveSizerTo(this.specialHandle, point.x, point.y);
					me.consume();
				}
			}
			else
			{
				mxVertexHandler.prototype.mouseMove.apply(this, arguments);
			}
		};

		mxExtVertexHandler.prototype.mouseUp = function(sender, me)
		{
			if (!me.isConsumed() && !this.inTolerance && this.index == SPECIAL_HANDLE_INDEX)
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
		
		// Process Handler
		function mxProcessHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxProcessHandler, mxCubeHandler);
		
		mxProcessHandler.prototype.defaultValue = 0.1;
	
		mxProcessHandler.prototype.scaleFactor = 1;
		
		mxProcessHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var sz = mxUtils.getValue(this.state.style, 'size', this.defaultValue);
	
			return new mxPoint(bounds.x + sz * bounds.width, bounds.y + bounds.height / 4);
		};
	
		mxProcessHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width));
			this.state.style['size'] = size;
			
			return new mxPoint(bounds.x + size * bounds.width, bounds.y + bounds.height / 4);
		};
		
		// Lifeline Handler
		function mxLifelineHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxLifelineHandler, mxCubeHandler);
		
		mxLifelineHandler.prototype.defaultValue = UmlLifeline.prototype.size;
		
		mxLifelineHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var scale = this.graph.getView().scale;
			var sz = mxUtils.getValue(this.state.style, 'size', this.defaultValue) * scale;
			
			return new mxPoint(bounds.x + bounds.width / 2, Math.max(bounds.y,
					Math.min(bounds.y + bounds.height, bounds.y + sz)));
		};
	
		mxLifelineHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var scale = this.graph.getView().scale;
			var size = Math.max(0, Math.min(bounds.height, pt.y - bounds.y));
			this.state.style['size'] = size / scale;
			
			return new mxPoint(bounds.x + bounds.width / 2, bounds.y + size);
		};
		
		// Trapezoid Handler
		function mxTrapezoidHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxTrapezoidHandler, mxCubeHandler);
		
		mxTrapezoidHandler.prototype.defaultValue = 0.2;
	
		mxTrapezoidHandler.prototype.scaleFactor = 1;
		
		mxTrapezoidHandler.prototype.maxSize = 0.5;
		
		mxTrapezoidHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var size = mxUtils.getValue(this.state.style, 'size', this.defaultValue);
	
			return new mxPoint(bounds.x + size * bounds.width * 0.75, bounds.y + bounds.height / 4);
		};
	
		mxTrapezoidHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(this.maxSize, (pt.x - bounds.x) / (bounds.width * 0.75)));
			this.state.style['size'] = size;
			
			return new mxPoint(bounds.x + size * bounds.width * 0.75, bounds.y + bounds.height / 4);
		};
		
		// Parallelogram Handler
		function mxParallelogramHandler(state)
		{
			mxTrapezoidHandler.call(this, state);
		};
	
		mxUtils.extend(mxParallelogramHandler, mxTrapezoidHandler);
		
		mxParallelogramHandler.prototype.maxSize = 1;
		
		// Document Handler
		function mxDocumentHandler(state)
		{
			mxCubeHandler.call(this, state);
		};
	
		mxUtils.extend(mxDocumentHandler, mxCubeHandler);
		
		mxDocumentHandler.prototype.defaultValue = 0.3;
		
		mxDocumentHandler.prototype.fy = 1.4;
		
		mxDocumentHandler.prototype.scaleFactor = 1;
		
		mxDocumentHandler.prototype.getSpecialHandlePoint = function(bounds)
		{
			var dy = mxUtils.getValue(this.state.style, 'size', this.defaultValue) * bounds.height;
	
			return new mxPoint(bounds.x + 3 * bounds.width / 4, bounds.y + bounds.height - dy);
		};
	
		mxDocumentHandler.prototype.updateStyleUnrotated = function(pt, bounds)
		{
			var size = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
			this.state.style['size'] = size;
			
			return new mxPoint(bounds.x + 3 * bounds.width / 4, bounds.y + bounds.height - size * bounds.height);
		};
		
		var handlers = {'swimlane': mxSwimlaneHandler, 'folder': mxFolderHandler, 'cube': mxCubeHandler,
				'card': mxCardHandler, 'note': mxNoteHandler, 'step': mxStepHandler, 'tape': mxTapeHandler,
				'process': mxProcessHandler, 'document': mxDocumentHandler, 'trapezoid': mxTrapezoidHandler,
				'parallelogram': mxParallelogramHandler, 'umlLifeline': mxLifelineHandler};

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
	ParallelogramShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	TrapezoidShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	DocumentShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.5, 0), true),
	                                          new mxConnectionConstraint(new mxPoint(0.75, 0), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.25), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
	        	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
	        	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true)];
	mxArrow.prototype.constraints = null;
	UmlLifeline.prototype.constraints = null;
})();
