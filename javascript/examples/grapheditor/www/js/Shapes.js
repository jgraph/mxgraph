/**
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
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size)))));

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
	
	// DataStore Shape, supports size style
	function DataStoreShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(DataStoreShape, mxCylinder);

	DataStoreShape.prototype.redrawPath = function(c, x, y, w, h, isForeground)
	{
		var dy = Math.min(h / 2, Math.round(h / 8) + this.strokewidth - 1);
		
		if ((isForeground && this.fill != null) || (!isForeground && this.fill == null))
		{
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, dy / 2);
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, dy / 2);
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, -dy);
		}
		
		if (!isForeground)
		{
			c.moveTo(0, dy);
			c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
			c.lineTo(w, h - dy);
			c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
			c.close();
		}
	};
	DataStoreShape.prototype.getLabelBounds = function(rect)
	{
		var dy = 2.5 * Math.min(rect.height / 2, Math.round(rect.height / 8) + this.strokewidth - 1);
		
		if (this.direction == null || this.direction == mxConstants.DIRECTION_EAST)
		{
			rect.y += dy;
			rect.height -= dy;
		}
		else if (this.direction == mxConstants.DIRECTION_SOUTH)
		{
			rect.width -= dy;
		}
		if (this.direction == mxConstants.DIRECTION_WEST)
		{
			rect.height -= dy;
		}
		if (this.direction == mxConstants.DIRECTION_NORTH)
		{
			rect.x += dy;
			rect.width -= dy;
		}
		
		return rect;
	};

	mxCellRenderer.prototype.defaultShapes['datastore'] = DataStoreShape;

	// Note Shape, supports size style
	function NoteShape()
	{
		mxCylinder.call(this);
	};
	mxUtils.extend(NoteShape, mxCylinder);
	NoteShape.prototype.size = 30;
	NoteShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size)))));

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

	// Note Shape, supports size style
	function SwitchShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(SwitchShape, mxActor);
	SwitchShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var curve = 0.5;
		c.moveTo(0, 0);
		c.quadTo(w / 2, h * curve,  w, 0);
		c.quadTo(w * (1 - curve), h / 2, w, h);
		c.quadTo(w / 2, h * (1 - curve), 0, h);
		c.quadTo(w * curve, h / 2, 0, 0);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['switch'] = SwitchShape;

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
		var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'tabWidth', this.tabWidth))));
		var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'tabHeight', this.tabHeight))));
		var tp = mxUtils.getValue(this.style, 'tabPosition', this.tabPosition);

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
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size)))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(s, 0), new mxPoint(w, 0), new mxPoint(w, h), new mxPoint(0, h), new mxPoint(0, s)],
				this.isRounded, arcSize, true);
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
		var dy = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
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
		var dy = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
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
		var dx = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, h), new mxPoint(dx, 0), new mxPoint(w, 0), new mxPoint(w - dx, h)],
				this.isRounded, arcSize, true);
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
		var dx = w * Math.max(0, Math.min(0.5, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, h), new mxPoint(dx, 0), new mxPoint(w - dx, 0), new mxPoint(w, h)],
				this.isRounded, arcSize, true);
	};

	mxCellRenderer.prototype.defaultShapes['trapezoid'] = TrapezoidShape;

	// Curly Bracket shape
	function CurlyBracketShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(CurlyBracketShape, mxActor);
	CurlyBracketShape.prototype.size = 0.5;
	CurlyBracketShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.setFillColor(null);
		var s = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(w, 0), new mxPoint(s, 0), new mxPoint(s, h / 2),
		                   new mxPoint(0, h / 2), new mxPoint(s, h / 2), new mxPoint(s, h),
		                   new mxPoint(w, h)], this.isRounded, arcSize, false);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['curlyBracket'] = CurlyBracketShape;

	// Parallel marker shape
	function ParallelMarkerShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(ParallelMarkerShape, mxActor);
	ParallelMarkerShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.setStrokeWidth(1);
		c.setFillColor(this.stroke);
		var w2 = w / 5;
		c.rect(0, 0, w2, h);
		c.fillAndStroke();
		c.rect(2 * w2, 0, w2, h);
		c.fillAndStroke();
		c.rect(4 * w2, 0, w2, h);
		c.fillAndStroke();
	};

	mxCellRenderer.prototype.defaultShapes['parallelMarker'] = ParallelMarkerShape;

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
		if (mxUtils.getValue(this.state.style, mxConstants.STYLE_HORIZONTAL, true) ==
			(this.direction == null ||
			this.direction == mxConstants.DIRECTION_EAST ||
			this.direction == mxConstants.DIRECTION_WEST))
		{
			var w = rect.width;
			var h = rect.height;
			var r = new mxRectangle(rect.x, rect.y, w, h);
	
			var inset = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
	
			if (this.isRounded)
			{
				var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
					mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
				inset = Math.max(inset, Math.min(w * f, h * f));
			}
			
			r.x += inset;
			r.width -= 2 * inset;
			
			return r;
		}
		
		return rect;
	};
	ProcessShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		var inset = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));

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
		var s =  w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w - s, 0), new mxPoint(w, h / 2), new mxPoint(w - s, h),
		                   new mxPoint(0, h), new mxPoint(s, h / 2)], this.isRounded, arcSize, true);
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
	
	// Overrides painting of rhombus shape to allow for double style
	var mxRhombusPaintVertexShape = mxRhombus.prototype.paintVertexShape;
	mxRhombus.prototype.getLabelBounds = function(rect)
	{
		if (this.style['double'] == 1)
		{
			var margin = (Math.max(2, this.strokewidth + 1) * 2 + parseFloat(this.style[mxConstants.STYLE_MARGIN] || 0)) * this.scale;
		
			return new mxRectangle(rect.x + margin, rect.y + margin, rect.width - 2 * margin, rect.height - 2 * margin);
		}
		
		return rect;
	};
	mxRhombus.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		mxRhombusPaintVertexShape.apply(this, arguments);

		if (!this.outline && this.style['double'] == 1)
		{
			var margin = Math.max(2, this.strokewidth + 1) * 2 + parseFloat(this.style[mxConstants.STYLE_MARGIN] || 0);
			x += margin;
			y += margin;
			w -= 2 * margin;
			h -= 2 * margin;
			
			if (w > 0 && h > 0)
			{
				c.setShadow(false);
				
				// Workaround for closure compiler bug where the lines with x and y above
				// are removed if arguments is used as second argument in call below.
				mxRhombusPaintVertexShape.apply(this, [c, x, y, w, h]);
			}
		}
	};

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
	ExtendedShape.prototype.getLabelBounds = function(rect)
	{
		if (this.style['double'] == 1)
		{
			var margin = (Math.max(2, this.strokewidth + 1) + parseFloat(this.style[mxConstants.STYLE_MARGIN] || 0)) * this.scale;
		
			return new mxRectangle(rect.x + margin, rect.y + margin, rect.width - 2 * margin, rect.height - 2 * margin);
		}
		
		return rect;
	};
	
	ExtendedShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		if (this.style != null)
		{
			if (!this.outline && this.style['double'] == 1)
			{
				var margin = Math.max(2, this.strokewidth + 1) + parseFloat(this.style[mxConstants.STYLE_MARGIN] || 0);
				x += margin;
				y += margin;
				w -= 2 * margin;
				h -= 2 * margin;
				
				if (w > 0 && h > 0)
				{
					mxRectangleShape.prototype.paintBackground.apply(this, arguments);
				}
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
		
		// Paints glass effect
		mxRectangleShape.prototype.paintForeground.apply(this, arguments);
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
		var size = Math.max(0, Math.min(rect.height, parseFloat(mxUtils.getValue(this.style, 'size', this.size)) * this.scale));
		
		return new mxRectangle(rect.x, rect.y, rect.width, size);
	};
	UmlLifeline.prototype.paintBackground = function(c, x, y, w, h)
	{
		var size = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		mxRectangleShape.prototype.paintBackground.call(this, c, x, y, w, size);
		
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
		var size = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
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
		var sz = parseFloat(mxUtils.getValue(this.style, 'size', this.size));
		c.translate(x, y);
		
		c.ellipse((w - sz) / 2, 0, sz, sz);
		c.fillAndStroke();

		c.begin();
		c.moveTo(w / 2, sz);
		c.lineTo(w / 2, h);
		c.end();
		c.stroke();
	};

	mxCellRenderer.prototype.defaultShapes['lollipop'] = LollipopShape;

	// Lollipop Shape
	function RequiresShape()
	{
		mxShape.call(this);
	};
	mxUtils.extend(RequiresShape, mxShape);
	RequiresShape.prototype.size = 10;
	RequiresShape.prototype.inset = 2;
	RequiresShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		var sz = parseFloat(mxUtils.getValue(this.style, 'size', this.size));
		var inset = parseFloat(mxUtils.getValue(this.style, 'inset', this.inset)) + this.strokewidth;
		c.translate(x, y);

		c.begin();
		c.moveTo(w / 2, sz + inset);
		c.lineTo(w / 2, h);
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo((w - sz) / 2 - inset, sz / 2);
		c.quadTo((w - sz) / 2 - inset, sz + inset, w / 2, sz + inset);
		c.quadTo((w + sz) / 2 + inset, sz + inset, (w + sz) / 2 + inset, sz / 2);
		c.end();
		c.stroke();
	};

	mxCellRenderer.prototype.defaultShapes['requires'] = RequiresShape;
	
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
		var dx = parseFloat(mxUtils.getValue(this.style, 'jettyWidth', this.jettyWidth));
		var dy = parseFloat(mxUtils.getValue(this.style, 'jettyHeight', this.jettyHeight));
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
		var width = 10 + Math.max(0, this.strokewidth - 1) * 4;

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

	// Manual Input shape
	function ManualInputShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(ManualInputShape, mxActor);
	ManualInputShape.prototype.size = 30;
	ManualInputShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size)));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, h), new mxPoint(0, s), new mxPoint(w, 0), new mxPoint(w, h)],
				this.isRounded, arcSize, true);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['manualInput'] = ManualInputShape;

	// Internal storage
	function InternalStorageShape()
	{
		mxRectangleShape.call(this);
	};
	mxUtils.extend(InternalStorageShape, mxRectangleShape);
	InternalStorageShape.prototype.dx = 20;
	InternalStorageShape.prototype.dy = 20;
	InternalStorageShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	InternalStorageShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		mxRectangleShape.prototype.paintForeground.apply(this, arguments);
		var inset = 0;
		
		if (this.isRounded)
		{
			var f = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE,
				mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
			inset = Math.max(inset, Math.min(w * f, h * f));
		}
		
		var dx = Math.max(inset, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(inset, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
		
		c.begin();
		c.moveTo(x, y + dy);
		c.lineTo(x + w, y + dy);
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo(x + dx, y);
		c.lineTo(x + dx, y + h);
		c.end();
		c.stroke();
	};

	mxCellRenderer.prototype.defaultShapes['internalStorage'] = InternalStorageShape;

	// Internal storage
	function CornerShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(CornerShape, mxActor);
	CornerShape.prototype.dx = 20;
	CornerShape.prototype.dy = 20;
	
	// Corner
	CornerShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
		
		var s = Math.min(w / 2, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0), new mxPoint(w, dy), new mxPoint(dx, dy),
		                   new mxPoint(dx, h), new mxPoint(0, h)], this.isRounded, arcSize, true);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['corner'] = CornerShape;

	// Internal storage
	function TeeShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(TeeShape, mxActor);
	TeeShape.prototype.dx = 20;
	TeeShape.prototype.dy = 20;
	
	// Corner
	TeeShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
		var w2 = Math.abs(w - dx) / 2;
		
		var s = Math.min(w / 2, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0), new mxPoint(w, dy), new mxPoint((w + dx) / 2, dy),
		                   new mxPoint((w + dx) / 2, h), new mxPoint((w - dx) / 2, h), new mxPoint((w - dx) / 2, dy),
		                   new mxPoint(0, dy)], this.isRounded, arcSize, true);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['tee'] = TeeShape;

	// Arrow
	function SingleArrowShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(SingleArrowShape, mxActor);
	SingleArrowShape.prototype.arrowWidth = 0.3;
	SingleArrowShape.prototype.arrowSize = 0.2;
	SingleArrowShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var aw = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arrowWidth', this.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arrowSize', this.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		c.moveTo(0, at);
		c.lineTo(w - as, at);
		c.lineTo(w - as, 0);
		c.lineTo(w, h / 2);
		c.lineTo(w - as, h);
		c.lineTo(w - as, ab);
		c.lineTo(0, ab);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['singleArrow'] = SingleArrowShape;

	// Arrow
	function DoubleArrowShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(DoubleArrowShape, mxActor);
	DoubleArrowShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var aw = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arrowSize', SingleArrowShape.prototype.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		c.moveTo(0, h / 2);
		c.lineTo(as, 0);
		c.lineTo(as, at);
		c.lineTo(w - as, at);
		c.lineTo(w - as, 0);
		c.lineTo(w, h / 2);
		c.lineTo(w - as, h);
		c.lineTo(w - as, ab);
		c.lineTo(as, ab);
		c.lineTo(as, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['doubleArrow'] = DoubleArrowShape;

	// Data storage
	function DataStorageShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(DataStorageShape, mxActor);
	DataStorageShape.prototype.size = 0.1;
	DataStorageShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));

		c.moveTo(s, 0);
		c.lineTo(w, 0);
		c.quadTo(w - s * 2, h / 2, w, h);
		c.lineTo(s, h);
		c.quadTo(s - s * 2, h / 2, s, 0);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['dataStorage'] = DataStorageShape;

	// Or
	function OrShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(OrShape, mxActor);
	OrShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.moveTo(0, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, 0, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['or'] = OrShape;

	// Xor
	function XorShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(XorShape, mxActor);
	XorShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.moveTo(0, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, 0, h);
		c.quadTo(w / 2, h / 2, 0, 0);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['xor'] = XorShape;

	// Loop limit
	function LoopLimitShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(LoopLimitShape, mxActor);
	LoopLimitShape.prototype.size = 20;
	LoopLimitShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.min(w / 2, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(s, 0), new mxPoint(w - s, 0), new mxPoint(w, s * 0.8), new mxPoint(w, h),
		                   new mxPoint(0, h), new mxPoint(0, s * 0.8)], this.isRounded, arcSize, true);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['loopLimit'] = LoopLimitShape;

	// Off page connector
	function OffPageConnectorShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(OffPageConnectorShape, mxActor);
	OffPageConnectorShape.prototype.size = 3 / 8;
	OffPageConnectorShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0), new mxPoint(w, h - s), new mxPoint(w / 2, h),
		                   new mxPoint(0, h - s)], this.isRounded, arcSize, true);
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['offPageConnector'] = OffPageConnectorShape;

	// Internal storage
	function TapeDataShape()
	{
		mxEllipse.call(this);
	};
	mxUtils.extend(TapeDataShape, mxEllipse);
	TapeDataShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		mxEllipse.prototype.paintVertexShape.apply(this, arguments);
		
		c.begin();
		c.moveTo(x + w / 2, y + h);
		c.lineTo(x + w, y + h);
		c.end();
		c.stroke();
	};

	mxCellRenderer.prototype.defaultShapes['tapeData'] = TapeDataShape;

	// Delay
	function DelayShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(DelayShape, mxActor);
	DelayShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, h / 2);
		c.moveTo(0, 0);
		c.lineTo(w - dx, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, w - dx, h);
		c.lineTo(0, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['delay'] = DelayShape;

	// Cross Shape
	function CrossShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(CrossShape, mxActor);
	CrossShape.prototype.size = 0.2;
	CrossShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var m = Math.min(h, w);
		var size = Math.max(0, Math.min(m, m * parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
		var t = (h - size) / 2;
		var b = t + size;
		var l = (w - size) / 2;
		var r = l + size;
		
		c.moveTo(0, t);
		c.lineTo(l, t);
		c.lineTo(l, 0);
		c.lineTo(r, 0);
		c.lineTo(r, t);
		c.lineTo(w, t);
		c.lineTo(w, b);
		c.lineTo(r, b);
		c.lineTo(r, h);
		c.lineTo(l, h);
		c.lineTo(l, b);
		c.lineTo(0, b);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['cross'] = CrossShape;

	// Display
	function DisplayShape()
	{
		mxActor.call(this);
	};
	mxUtils.extend(DisplayShape, mxActor);
	DisplayShape.prototype.size = 0.25;
	DisplayShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, h / 2);
		var s = Math.min(w - dx, Math.max(0, parseFloat(mxUtils.getValue(this.style, 'size', this.size))) * w);
		
		c.moveTo(0, h / 2);
		c.lineTo(s, 0);
		c.lineTo(w - dx, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, w - dx, h);
		c.lineTo(s, h);
		c.close();
		c.end();
	};

	mxCellRenderer.prototype.defaultShapes['display'] = DisplayShape;

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

	// Handlers are only added if mxVertexHandler is defined (ie. not in embedded graph)
	if (typeof(mxVertexHandler) != 'undefined')
	{
		function createHandle(state, keys, getPositionFn, setPositionFn, ignoreGrid)
		{
			var handle = new mxHandle(state, null, mxVertexHandler.prototype.secondaryHandleImage);
			
			handle.execute = function()
			{
				for (var i = 0; i < keys.length; i++)
				{	
					this.copyStyle(keys[i]);
				}
			};

			handle.getPosition = getPositionFn;
			handle.setPosition = setPositionFn;
			handle.ignoreGrid = (ignoreGrid != null) ? ignoreGrid : true;
			
			return handle;
		};
		
		function createTrapezoidHandleFunction(max)
		{
			return function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(max, parseFloat(mxUtils.getValue(this.state.style, 'size', TrapezoidShape.prototype.size))));
				
					return new mxPoint(bounds.x + size * bounds.width * 0.75, bounds.y + bounds.height / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(max, (pt.x - bounds.x) / (bounds.width * 0.75)));
				})];
			};
		};
		
		function createDisplayHandleFunction(defaultValue)
		{
			return function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = parseFloat(mxUtils.getValue(this.state.style, 'size', defaultValue));
	
					return new mxPoint(bounds.x + size * bounds.width, bounds.getCenterY());
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width));
				})];
			};
		};
		
		function createCubeHandleFunction(factor, defaultValue)
		{
			return function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.width, Math.min(bounds.height, parseFloat(
						mxUtils.getValue(this.state.style, 'size', defaultValue))))) * factor;
					
					return new mxPoint(bounds.x + size, bounds.y + size);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(Math.min(bounds.width, pt.x - bounds.x),
							Math.min(bounds.height, pt.y - bounds.y))) / factor);
				})];
			};
		};
		
		function createArrowHandleFunction(maxSize)
		{
			return function(state)
			{
				return [createHandle(state, ['arrowWidth', 'arrowSize'], function(bounds)
				{
					var aw = Math.max(0, Math.min(1, mxUtils.getValue(this.state.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth)));
					var as = Math.max(0, Math.min(maxSize, mxUtils.getValue(this.state.style, 'arrowSize', SingleArrowShape.prototype.arrowSize)));
					
					return new mxPoint(bounds.x + (1 - as) * bounds.width, bounds.y + (1 - aw) * bounds.height / 2);
				}, function(bounds, pt)
				{
					this.state.style['arrowWidth'] = Math.max(0, Math.min(1, Math.abs(bounds.y + bounds.height / 2 - pt.y) / bounds.height * 2));
					this.state.style['arrowSize'] = Math.max(0, Math.min(maxSize, (bounds.x + bounds.width - pt.x) / (bounds.width)));
				})];
			};
		};

		var handleFactory = {
			'swimlane': function(state)
			{
				return [createHandle(state, [mxConstants.STYLE_STARTSIZE], function(bounds)
				{
					var size = parseFloat(mxUtils.getValue(this.state.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
					
					if (mxUtils.getValue(this.state.style, mxConstants.STYLE_HORIZONTAL, 1) == 1)
					{
						return new mxPoint(bounds.getCenterX(), bounds.y + Math.max(0, Math.min(bounds.height, size)));
					}
					else
					{
						return new mxPoint(bounds.x + Math.max(0, Math.min(bounds.width, size)), bounds.getCenterY());
					}
				}, function(bounds, pt)
				{	
					this.state.style[mxConstants.STYLE_STARTSIZE] =
						(mxUtils.getValue(this.state.style, mxConstants.STYLE_HORIZONTAL, 1) == 1) ?
							Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y))) :
							Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
				})];
			},
			'umlLifeline': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'size', UmlLifeline.prototype.size))));
					
					return new mxPoint(bounds.getCenterX(), bounds.y + size);
				}, function(bounds, pt)
				{	
					this.state.style['size'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'process': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(0.5, parseFloat(mxUtils.getValue(this.state.style, 'size', ProcessShape.prototype.size))));

					return new mxPoint(bounds.x + bounds.width * size, bounds.y + bounds.height / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(0.5, (pt.x - bounds.x) / bounds.width));
				})];
			},
			'cross': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var m = Math.min(bounds.width, bounds.height);
					var size = Math.max(0, Math.min(1, mxUtils.getValue(this.state.style, 'size', CrossShape.prototype.size))) * m / 2;

					return new mxPoint(bounds.getCenterX() - size, bounds.getCenterY() - size);
				}, function(bounds, pt)
				{
					var m = Math.min(bounds.width, bounds.height);
					this.state.style['size'] = Math.max(0, Math.min(1, Math.min((Math.max(0, bounds.getCenterY() - pt.y) / m) * 2,
							(Math.max(0, bounds.getCenterX() - pt.x) / m) * 2)));
				})];
			},
			'note': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.width, Math.min(bounds.height, parseFloat(
						mxUtils.getValue(this.state.style, 'size', NoteShape.prototype.size)))));
					
					return new mxPoint(bounds.x + bounds.width - size, bounds.y + size);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(Math.min(bounds.width, bounds.x + bounds.width - pt.x),
							Math.min(bounds.height, pt.y - bounds.y))));
				})];
			},
			'manualInput': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, mxUtils.getValue(this.state.style, 'size', ManualInputShape.prototype.size)));
					
					return new mxPoint(bounds.x + bounds.width / 4, bounds.y + size * 3 / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(bounds.height, (pt.y - bounds.y) * 4 / 3)));
				})];
			},
			'dataStorage': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'size', DataStorageShape.prototype.size))));

					return new mxPoint(bounds.x + (1 - size) * bounds.width, bounds.getCenterY());
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.x + bounds.width - pt.x) / bounds.width));
				})];
			},
			'internalStorage': function(state)
			{
				return [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, mxUtils.getValue(this.state.style, 'dx', InternalStorageShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, mxUtils.getValue(this.state.style, 'dy', InternalStorageShape.prototype.dy)));

					return new mxPoint(bounds.x + dx, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'corner': function(state)
			{
				return [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, mxUtils.getValue(this.state.style, 'dx', CornerShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, mxUtils.getValue(this.state.style, 'dy', CornerShape.prototype.dy)));

					return new mxPoint(bounds.x + dx, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'tee': function(state)
			{
				return [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, mxUtils.getValue(this.state.style, 'dx', TeeShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, mxUtils.getValue(this.state.style, 'dy', TeeShape.prototype.dy)));

					return new mxPoint(bounds.x + (bounds.width + dx) / 2, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width / 2, (pt.x - bounds.x - bounds.width / 2)) * 2));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'singleArrow': createArrowHandleFunction(1),
			'doubleArrow': createArrowHandleFunction(0.5),			
			'folder': function(state)
			{
				return [createHandle(state, ['tabWidth', 'tabHeight'], function(bounds)
				{
					var tw = Math.max(0, Math.min(bounds.width, mxUtils.getValue(this.state.style, 'tabWidth', FolderShape.prototype.tabWidth)));
					var th = Math.max(0, Math.min(bounds.height, mxUtils.getValue(this.state.style, 'tabHeight', FolderShape.prototype.tabHeight)));
					
					if (mxUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) == mxConstants.ALIGN_RIGHT)
					{
						tw = bounds.width - tw;
					}
					
					return new mxPoint(bounds.x + tw, bounds.y + th);
				}, function(bounds, pt)
				{
					var tw = Math.max(0, Math.min(bounds.width, pt.x - bounds.x));
					
					if (mxUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) == mxConstants.ALIGN_RIGHT)
					{
						tw = bounds.width - tw;
					}
					
					this.state.style['tabWidth'] = Math.round(tw);
					this.state.style['tabHeight'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'document': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'size', DocumentShape.prototype.size))));

					return new mxPoint(bounds.x + 3 * bounds.width / 4, bounds.y + (1 - size) * bounds.height);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
				})];
			},
			'tape': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'size', TapeShape.prototype.size))));

					return new mxPoint(bounds.getCenterX(), bounds.y + size * bounds.height / 2);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, ((pt.y - bounds.y) / bounds.height) * 2));
				})];
			},
			'offPageConnector': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'size', OffPageConnectorShape.prototype.size))));

					return new mxPoint(bounds.getCenterX(), bounds.y + (1 - size) * bounds.height);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
				})];
			},
			'step': createDisplayHandleFunction(StepShape.prototype.size),
			'curlyBracket': createDisplayHandleFunction(CurlyBracketShape.prototype.size),
			'display': createDisplayHandleFunction(DisplayShape.prototype.size),
			'cube': createCubeHandleFunction(1, CubeShape.prototype.size),
			'card': createCubeHandleFunction(0.5, CardShape.prototype.size),
			'loopLimit': createCubeHandleFunction(0.5, LoopLimitShape.prototype.size),
			'trapezoid': createTrapezoidHandleFunction(0.5),
			'parallelogram': createTrapezoidHandleFunction(1)
		};

		mxVertexHandler.prototype.createCustomHandles = function()
		{
			// Not rotatable means locked
			if (this.graph.isCellRotatable(this.state.cell))
			{
				var fn = handleFactory[this.state.style['shape']];
			
				if (fn != null)
				{
					return fn(this.state);
				}
			}
			
			return null;
		};
	}

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
	mxEllipse.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), true), new mxConnectionConstraint(new mxPoint(1, 0), true),
	                                   new mxConnectionConstraint(new mxPoint(0, 1), true), new mxConnectionConstraint(new mxPoint(1, 1), true),
	                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true), new mxConnectionConstraint(new mxPoint(0.5, 1), true),
	          	              		   new mxConnectionConstraint(new mxPoint(0, 0.5), true), new mxConnectionConstraint(new mxPoint(1, 0.5))];
	mxLabel.prototype.constraints = mxRectangleShape.prototype.constraints;
	mxImageShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	mxSwimlane.prototype.constraints = mxRectangleShape.prototype.constraints;
	PlusShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	NoteShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	CardShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	CubeShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	FolderShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	InternalStorageShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	DataStorageShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	TapeDataShape.prototype.constraints = mxEllipse.prototype.constraints;
	ManualInputShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	DelayShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	DisplayShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	LoopLimitShape.prototype.constraints = mxRectangleShape.prototype.constraints;
	OffPageConnectorShape.prototype.constraints = mxRectangleShape.prototype.constraints;
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
	SwitchShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), false),
                                         new mxConnectionConstraint(new mxPoint(0.5, 0.25), false),
                                         new mxConnectionConstraint(new mxPoint(1, 0), false),
			       	              		 new mxConnectionConstraint(new mxPoint(0.25, 0.5), false),
			       	              		 new mxConnectionConstraint(new mxPoint(0.75, 0.5), false),
			       	              		 new mxConnectionConstraint(new mxPoint(0, 1), false),
			       	            		 new mxConnectionConstraint(new mxPoint(0.5, 0.75), false),
			       	            		 new mxConnectionConstraint(new mxPoint(1, 1), false)];
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
	SingleArrowShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	                                    new mxConnectionConstraint(new mxPoint(1, 0.5), false)];
	DoubleArrowShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	  	                                    new mxConnectionConstraint(new mxPoint(1, 0.5), false)];
	CrossShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	                                    new mxConnectionConstraint(new mxPoint(1, 0.5), false),
	                                    new mxConnectionConstraint(new mxPoint(0.5, 0), false),
	                                    new mxConnectionConstraint(new mxPoint(0.5, 1), false)];
	UmlLifeline.prototype.constraints = null;
	OrShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0.25), false),
	  	                             new mxConnectionConstraint(new mxPoint(0, 0.5), false),
	  	                             new mxConnectionConstraint(new mxPoint(0, 0.75), false),
	  	                             new mxConnectionConstraint(new mxPoint(1, 0.5), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.7, 0.1), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.7, 0.9), false)];
	XorShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.175, 0.25), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.25, 0.5), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.175, 0.75), false),
	  	                             new mxConnectionConstraint(new mxPoint(1, 0.5), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.7, 0.1), false),
	  	                             new mxConnectionConstraint(new mxPoint(0.7, 0.9), false)];
})();
