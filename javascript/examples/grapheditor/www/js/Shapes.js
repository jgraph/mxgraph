/**
 * $Id: Shapes.js,v 1.3 2012-09-12 14:37:44 gaudenz Exp $
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
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size) * this.scale));

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
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size) * this.scale));

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
		var dx = Math.min(w, tw * this.scale);
		var dy = Math.min(h, th * this.scale);

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
		var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size) * this.scale));

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

	// Tape Shape, supports size style
	function PlusShape() { };
	PlusShape.prototype = new mxCylinder();
	PlusShape.prototype.constructor = PlusShape;
	PlusShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var border = Math.min(w / 5, h / 5) + 1;
		
		if (isForeground)
		{
			path.moveTo(w / 2, border);
			path.lineTo(w / 2, h - border);
			path.moveTo(border, h / 2);
			path.lineTo(w - border, h / 2);
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

	mxCellRenderer.prototype.defaultShapes['plus'] = PlusShape;

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
		var ss = this.scale * mxUtils.getValue(this.style, 'size', this.size);
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
		var jw = mxUtils.getValue(this.style, 'jettyWidth', this.jettyWidth);
		var jh = mxUtils.getValue(this.style, 'jettyHeight', this.jettyHeight);
		var dx = jw * this.scale;
		var dy = jh * this.scale;
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
	StateShape.prototype.createSvg = function()
	{
		var g = mxDoubleEllipse.prototype.createSvg.apply(this, arguments);
		this.foreground.setAttribute('fill', this.innerNode.getAttribute('fill'));
		this.foreground.setAttribute('stroke', this.stroke);
		this.innerNode.setAttribute('fill', 'none');
		this.innerNode.setAttribute('stroke', (this.outerStroke) ? this.stroke : 'none');
		
		return g;
	};
	StateShape.prototype.redrawSvg = function()
	{
		mxDoubleEllipse.prototype.redrawSvg.apply(this, arguments);
		
		// Workaround for visible background
		this.innerNode.setAttribute('fill', 'none');
		
		if (this.shadowNode != null)
		{
			this.shadowNode.setAttribute('cx', this.foreground.getAttribute('cx'));
			this.shadowNode.setAttribute('cy', this.foreground.getAttribute('cy'));
			this.shadowNode.setAttribute('rx', this.foreground.getAttribute('rx'));
			this.shadowNode.setAttribute('ry', this.foreground.getAttribute('ry'));
		}
	};
	StateShape.prototype.createVml = function()
	{
		var result = mxDoubleEllipse.prototype.createVml.apply(this, arguments);
		
		if (this.fillNode != null)
		{
			this.foreground.appendChild(this.fillNode);
			this.foreground.filled = 'true';
		}
		
		this.background.filled = 'false';
		this.background.stroked = (this.outerStroke) ? 'true' : 'false';
		
		if (this.shadowNode != null)
		{
			this.foreground.appendChild(this.shadowNode);
		}
		
		return result;
	};
	StateShape.prototype.reconfigure = function()
	{
		mxShape.prototype.reconfigure.apply(this, arguments);
		
		if (this.dialect == mxConstants.DIALECT_SVG)
		{
			this.innerNode.setAttribute('fill', 'none');
		}
		else if (mxUtils.isVml(this.node))
		{
			this.background.filled = 'false';
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

	// Custom edge shape
	function LinkShape() { };
	LinkShape.prototype = new mxArrow();
	LinkShape.prototype.constructor = LinkShape;
	LinkShape.prototype.enableFill = false;
	LinkShape.prototype.addPipe = true;

	LinkShape.prototype.augmentBoundingBox = function(bbox)
	{
		bbox.grow(10 * this.scale);
		
		mxShape.prototype.augmentBoundingBox.apply(this, arguments);
	};

	LinkShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		// All points are offset
		path.translate.x -= x;
		path.translate.y -= y;

		// Geometry of arrow
		var width = 10 * this.scale;

		// Base vector (between end points)
		var p0 = this.points[0];
		var pe = this.points[this.points.length - 1];
		
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
		// p4 not needed
		var p5x = p3x - 3 * floorx;
		var p5y = p3y - 3 * floory;
		
		// LATER: Add support for n points
		path.moveTo(p1x, p1y);
		path.lineTo(p2x, p2y);
		path.moveTo(p5x + floorx, p5y + floory);
		path.lineTo(p0x, p0y);
		path.end();
	};

	mxCellRenderer.prototype.defaultShapes['link'] = LinkShape;
	
	// Defines custom marker
	mxMarker.markers['dash'] = function(node, type, pe, nx, ny, strokewidth, size, scale, isVml)
	{
		nx = nx * (size + strokewidth);
		ny = ny * (size + strokewidth);
		
		if (isVml)
		{
			node.setAttribute('path', 'm' + Math.floor(pe.x - nx / 2- ny / 2) + ' ' + Math.floor(pe.y - ny / 2 + nx / 2) +
				' l ' + Math.floor(pe.x + ny / 2 - 3 * nx / 2) + ' ' + Math.floor(pe.y - 3 * ny / 2 - nx / 2) +
				' e');
		}
		else
		{
			node.setAttribute('d', 'M ' + (pe.x - nx / 2 - ny / 2) + ' ' + (pe.y - ny / 2 + nx / 2) +
					' L ' + (pe.x + ny / 2 - 3 * nx / 2) + ' ' + (pe.y - 3 * ny / 2 - nx / 2) +
					' z');
		}
		
		// Returns the offset for the edge
		return new mxPoint(0, 0);
	};

	// Registers the marker in mxImageExport
	var mxImageExportInitMarkers = mxImageExport.prototype.initMarkers;
	mxImageExport.prototype.initMarkers = function()
	{
		mxImageExportInitMarkers.apply(this, arguments);
		
		this.markers['dash'] = function(canvas, state, type, pe, unitX, unitY, size, source, sw)
		{
			nx = unitX * (size + sw);
			ny = unitY * (size + sw);
			
			canvas.begin();
			canvas.moveTo(pe.x - nx / 2 - ny / 2, pe.y - ny / 2 + nx / 2);
			canvas.lineTo(pe.x + ny / 2 - 3 * nx / 2, pe.y - 3 * ny / 2 - nx / 2);
			canvas.stroke();
			
			// Returns the offset for the edge
			return new mxPoint(0, 0);
		};
	};

	// Enables crisp rendering in SVG except for connectors, actors, cylinder,
	// ellipses must be enabled after rendering the sidebar items
	mxShape.prototype.crisp = true;
	mxShape.prototype.roundedCrispSvg = false;
	mxActor.prototype.crisp = false;
	mxCylinder.prototype.crisp = false;
	mxEllipse.prototype.crisp = false;
	mxDoubleEllipse.prototype.crisp = false;
	mxConnector.prototype.crisp = false;
	FolderShape.prototype.crisp = true;
	ComponentShape.prototype.crisp = true;
	
	// Implements custom handlers
	var SPECIAL_HANDLE_INDEX = -99;

	// Handlers are only added if mxVertexHandler is defined (ie. not in embedded graph)
	if (typeof(mxVertexHandler) != 'undefined')
	{
		// Swimlane handler
		function mxSwimlaneHandler(state)
		{
			mxVertexHandler.call(this, state);
		};
	
		mxUtils.extend(mxSwimlaneHandler, mxVertexHandler);
	
		mxSwimlaneHandler.prototype.useGridForSpecialHandle = false;
		
		mxSwimlaneHandler.prototype.init = function()
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
				this.specialHandle.crisp = this.crisp;
			}
			
			this.specialHandle.dialect = (graph.dialect != mxConstants.DIALECT_SVG) ?
					mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
			this.specialHandle.init(graph.getView().getOverlayPane());
			this.specialHandle.node.style.cursor = this.getSpecialHandleCursor();
	
			mxEvent.redirectMouseEvents(this.specialHandle.node, graph, this.state);
			mxVertexHandler.prototype.init.apply(this, arguments);
		};
		
		mxSwimlaneHandler.prototype.getSpecialHandleCursor = function()
		{
			return (this.horizontal) ? 'n-resize' : 'w-resize';
		};
		
		mxSwimlaneHandler.prototype.redraw = function()
		{
			mxVertexHandler.prototype.redraw.apply(this, arguments);
	
			var size = this.specialHandle.bounds.width;
			this.specialHandle.bounds = this.getSpecialHandleBounds(size);
			this.specialHandle.redraw();
		};
		
		mxSwimlaneHandler.prototype.getSpecialHandleBounds = function(size)
		{
			var scale = this.graph.getView().scale;
			var start = this.state.view.graph.getStartSize(this.state.cell);
			
			if (this.horizontal)
			{
				return new mxRectangle(this.state.x + (this.state.width - size) / 2,
					this.state.y + start.height * scale - size / 2, size, size);
			}
			else
			{
				return new mxRectangle(this.state.x + start.width * scale - size / 2,
						this.state.y + (this.state.height - size) / 2, size, size);
			}
		};
		
		mxSwimlaneHandler.prototype.destroy = function()
		{
			mxVertexHandler.prototype.destroy.apply(this, arguments);
			
			if (this.specialHandle != null)
			{
				this.specialHandle.destroy();
				this.specialHandle = null;
			}
		};
		
		mxSwimlaneHandler.prototype.getHandleForEvent = function(me)
		{
			if (me.isSource(this.specialHandle))
			{
				return SPECIAL_HANDLE_INDEX;
			}
			
			return mxVertexHandler.prototype.getHandleForEvent.apply(this, arguments);
		};
		
		mxSwimlaneHandler.prototype.constrainPoint = function(point)
		{
			point.x = Math.max(this.state.x, Math.min(this.state.x + this.state.width, point.x));
			point.y = Math.max(this.state.y, Math.min(this.state.y + this.state.height, point.y));
		};
		
		mxSwimlaneHandler.prototype.mouseMove = function(sender, me)
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
		
		mxSwimlaneHandler.prototype.updateStyle = function(point)
		{
			var startSize = 0;
	
			if (this.horizontal)
			{
				point.x = this.state.x + this.state.width / 2;
				startSize = point.y - this.state.y;
			}
			else
			{
				point.y = this.state.y + this.state.height / 2;
				startSize = point.x - this.state.x;
			}
	
			var scale = this.graph.getView().scale;
			this.state.style['startSize'] = Math.round(Math.max(1, startSize) / scale);
		};
		
		mxSwimlaneHandler.prototype.mouseUp = function(sender, me)
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
		
		mxSwimlaneHandler.prototype.applyStyle = function()
		{
			this.state.view.graph.setCellStyles('startSize', this.state.style['startSize'], [this.state.cell]);
		};
		
		// Folder Handler
		function mxFolderHandler(state)
		{
			mxSwimlaneHandler.call(this, state);
		};
	
		mxUtils.extend(mxFolderHandler, mxSwimlaneHandler);
		
		mxFolderHandler.prototype.getSpecialHandleCursor = function()
		{
			return 'default';
		};
	
		mxFolderHandler.prototype.getSpecialHandleBounds = function(size)
		{
			var rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
			var direction = mxUtils.getValue(this.state.style, 'direction', 'east');
			
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
			
			var alpha = mxUtils.toRadians(rotation);
			var cos = Math.cos(alpha);
			var sin = Math.sin(alpha);
			
			var bounds = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
			
			if (direction == 'south' || direction == 'north')
			{
				bounds.x += (bounds.width - bounds.height) / 2;
				bounds.y += (bounds.height - bounds.width) / 2;
				var tmp = bounds.width;
				bounds.width = bounds.height;
				bounds.height = tmp;
			}
	
			var pt = this.getSpecialHandlePoint(bounds);
			pt = mxUtils.getRotatedPoint(pt, cos, sin,
				new mxPoint(this.state.getCenterX(), this.state.getCenterY()));
	
			return new mxRectangle(pt.x - size / 2, pt.y - size / 2, size, size);
		};
	
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
			var direction = mxUtils.getValue(this.state.style, 'direction', 'east');
			var rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
			
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
			
			var alpha = mxUtils.toRadians(rotation);
			var cos = Math.cos(-alpha);
			var sin = Math.sin(-alpha);
			
			var bounds = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
			
			if (direction == 'south' || direction == 'north')
			{
				bounds.x += (bounds.width - bounds.height) / 2;
				bounds.y += (bounds.height - bounds.width) / 2;
				var tmp = bounds.width;
				bounds.width = bounds.height;
				bounds.height = tmp;
			}
	
			var pt = new mxPoint(point.x, point.y);
			pt = mxUtils.getRotatedPoint(pt, cos, sin,
				new mxPoint(this.state.getCenterX(), this.state.getCenterY()));
			
			var result = this.updateStyleUnrotated(pt, bounds);
			
			// Modifies point to use rotated coordinates of return value
			if (result != null)
			{
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
			var size = Math.min(Math.min(bounds.width / this.scaleFactor, pt.x - bounds.x),
					Math.min(bounds.height / this.scaleFactor, pt.y - bounds.y));
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
			var size = Math.min(Math.min(bounds.width / this.scaleFactor, pt.x - bounds.x + bounds.width),
					Math.min(bounds.height / this.scaleFactor, pt.y - bounds.y));
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
			var size = Math.min(1, ((pt.y - bounds.y) / bounds.height) * 2);
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
			if (terminal.shape instanceof mxStencilShape)
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
	UmlActorShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
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
