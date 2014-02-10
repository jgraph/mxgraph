/**
 * $Id: mxVertexHandler.js,v 1.41 2014/02/10 12:18:30 gaudenz Exp $
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxVertexHandler
 * 
 * Event handler for resizing cells. This handler is automatically created in
 * <mxGraph.createHandler>.
 * 
 * Constructor: mxVertexHandler
 * 
 * Constructs an event handler that allows to resize vertices
 * and groups.
 * 
 * Parameters:
 * 
 * state - <mxCellState> of the cell to be resized.
 */
function mxVertexHandler(state)
{
	if (state != null)
	{
		this.state = state;
		this.init();
	}
};

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxVertexHandler.prototype.graph = null;

/**
 * Variable: state
 * 
 * Reference to the <mxCellState> being modified.
 */
mxVertexHandler.prototype.state = null;

/**
 * Variable: singleSizer
 * 
 * Specifies if only one sizer handle at the bottom, right corner should be
 * used. Default is false.
 */
mxVertexHandler.prototype.singleSizer = false;

/**
 * Variable: index
 * 
 * Holds the index of the current handle.
 */
mxVertexHandler.prototype.index = null;

/**
 * Variable: allowHandleBoundsCheck
 * 
 * Specifies if the bounds of handles should be used for hit-detection in IE or
 * if <tolerance> > 0. Default is true.
 */
mxVertexHandler.prototype.allowHandleBoundsCheck = true;

/**
 * Variable: handleImage
 * 
 * Optional <mxImage> to be used as handles. Default is null.
 */
mxVertexHandler.prototype.handleImage = null;

/**
 * Variable: tolerance
 * 
 * Optional tolerance for hit-detection in <getHandleForEvent>. Default is 0.
 */
mxVertexHandler.prototype.tolerance = 0;

/**
 * Variable: rotationEnabled
 * 
 * Specifies if a rotation handle should be visible. Default is false.
 */
mxVertexHandler.prototype.rotationEnabled = false;

/**
 * Variable: rotationRaster
 * 
 * Specifies if rotation steps should be "rasterized" depening on the distance
 * to the handle. Default is true.
 */
mxVertexHandler.prototype.rotationRaster = true;

/**
 * Variable: livePreview
 * 
 * Specifies if resize should change the cell in-place. This is an experimental
 * feature for non-touch devices. Default is false.
 */
mxVertexHandler.prototype.livePreview = false;

/**
 * Variable: manageSizers
 * 
 * Specifies if sizers should be hidden and spaced if the vertex is small.
 * Default is false.
 */
mxVertexHandler.prototype.manageSizers = false;

/**
 * Variable: constrainGroupByChildren
 * 
 * Specifies if the size of groups should be constrained by the children.
 * Default is false.
 */
mxVertexHandler.prototype.constrainGroupByChildren = false;

/**
 * Function: init
 * 
 * Initializes the shapes required for this vertex handler.
 */
mxVertexHandler.prototype.init = function()
{
	this.graph = this.state.view.graph;
	this.selectionBounds = this.getSelectionBounds(this.state);
	this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
	this.selectionBorder = this.createSelectionShape(this.bounds);
	// VML dialect required here for event transparency in IE
	this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
	this.selectionBorder.pointerEvents = false;
	this.selectionBorder.init(this.graph.getView().getOverlayPane());
	mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);
	
	if (this.graph.isCellMovable(this.state.cell))
	{
		this.selectionBorder.node.style.cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
	}

	// Adds the sizer handles
	if (mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells)
	{
		var resizable = this.graph.isCellResizable(this.state.cell);
		this.sizers = [];

		if (resizable || (this.graph.isLabelMovable(this.state.cell) &&
			this.state.width >= 2 && this.state.height >= 2))
		{
			var i = 0;
			
			if (resizable)
			{
				if (!this.singleSizer)
				{
					this.sizers.push(this.createSizer('nw-resize', i++));
					this.sizers.push(this.createSizer('n-resize', i++));
					this.sizers.push(this.createSizer('ne-resize', i++));
					this.sizers.push(this.createSizer('w-resize', i++));
					this.sizers.push(this.createSizer('e-resize', i++));
					this.sizers.push(this.createSizer('sw-resize', i++));
					this.sizers.push(this.createSizer('s-resize', i++));
				}
				
				this.sizers.push(this.createSizer('se-resize', i++));
			}
			
			var geo = this.graph.model.getGeometry(this.state.cell);
			
			if (geo != null && !geo.relative && !this.graph.isSwimlane(this.state.cell) &&
				this.graph.isLabelMovable(this.state.cell))
			{
				// Marks this as the label handle for getHandleForEvent
				this.labelShape = this.createSizer(mxConstants.CURSOR_LABEL_HANDLE, mxEvent.LABEL_HANDLE, mxConstants.LABEL_HANDLE_SIZE, mxConstants.LABEL_HANDLE_FILLCOLOR);
				this.sizers.push(this.labelShape);
			}
		}
		else if (this.graph.isCellMovable(this.state.cell) && !this.graph.isCellResizable(this.state.cell) &&
			this.state.width < 2 && this.state.height < 2)
		{
			this.labelShape = this.createSizer(mxConstants.CURSOR_MOVABLE_VERTEX,
				null, null, mxConstants.LABEL_HANDLE_FILLCOLOR);
			this.sizers.push(this.labelShape);
		}
	}
	
	// Adds the rotation handler
	if (this.rotationEnabled && this.graph.isCellRotatable(this.state.cell) &&
		(mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells) &&
		this.state.width > 2 && this.state.height > 2)
	{
		this.rotationShape = this.createSizer('pointer', mxEvent.ROTATION_HANDLE,
			mxConstants.HANDLE_SIZE + 3, mxConstants.HANDLE_FILLCOLOR);
		this.sizers.push(this.rotationShape);
	}

	this.redraw();
	
	if (this.constrainGroupByChildren)
	{
		this.updateMinBounds();
	}
};

/**
 * Function: isConstrainedEvent
 * 
 * Returns true if the aspect ratio if the cell should be maintained.
 */
mxVertexHandler.prototype.isConstrainedEvent = function(me)
{
	return mxEvent.isShiftDown(me.getEvent()) || this.state.style[mxConstants.STYLE_ASPECT] == 'fixed';
};

/**
 * Function: updateMinBounds
 * 
 * Initializes the shapes required for this vertex handler.
 */
mxVertexHandler.prototype.updateMinBounds = function()
{
	var children = this.graph.getChildCells(this.state.cell);
	
	if (children.length > 0)
	{
		this.minBounds = this.graph.view.getBounds(children);
		
		if (this.minBounds != null)
		{
			var s = this.state.view.scale;
			var t = this.state.view.translate;

			this.minBounds.x -= this.state.x;
			this.minBounds.y -= this.state.y;
			this.minBounds.x /= s;
			this.minBounds.y /= s;
			this.minBounds.width /= s;
			this.minBounds.height /= s;
			this.x0 = this.state.x / s - t.x;
			this.y0 = this.state.y / s - t.y;
		}
	}
};

/**
 * Function: getSelectionBounds
 * 
 * Returns the mxRectangle that defines the bounds of the selection
 * border.
 */
mxVertexHandler.prototype.getSelectionBounds = function(state)
{
	return new mxRectangle(Math.round(state.x), Math.round(state.y), Math.round(state.width), Math.round(state.height));
};

/**
 * Function: createSelectionShape
 * 
 * Creates the shape used to draw the selection border.
 */
mxVertexHandler.prototype.createSelectionShape = function(bounds)
{
	var shape = new mxRectangleShape(bounds, null, this.getSelectionColor());
	shape.strokewidth = this.getSelectionStrokeWidth();
	shape.isDashed = this.isSelectionDashed();
	
	return shape;
};

/**
 * Function: getSelectionColor
 * 
 * Returns <mxConstants.VERTEX_SELECTION_COLOR>.
 */
mxVertexHandler.prototype.getSelectionColor = function()
{
	return mxConstants.VERTEX_SELECTION_COLOR;
};

/**
 * Function: getSelectionStrokeWidth
 * 
 * Returns <mxConstants.VERTEX_SELECTION_STROKEWIDTH>.
 */
mxVertexHandler.prototype.getSelectionStrokeWidth = function()
{
	return mxConstants.VERTEX_SELECTION_STROKEWIDTH;
};

/**
 * Function: isSelectionDashed
 * 
 * Returns <mxConstants.VERTEX_SELECTION_DASHED>.
 */
mxVertexHandler.prototype.isSelectionDashed = function()
{
	return mxConstants.VERTEX_SELECTION_DASHED;
};

/**
 * Function: createSizer
 * 
 * Creates a sizer handle for the specified cursor and index and returns
 * the new <mxRectangleShape> that represents the handle.
 */
mxVertexHandler.prototype.createSizer = function(cursor, index, size, fillColor)
{
	size = size || mxConstants.HANDLE_SIZE;
	
	var bounds = new mxRectangle(0, 0, size, size);
	var sizer = this.createSizerShape(bounds, index, fillColor);

	if (sizer.isHtmlAllowed() && this.state.text != null && this.state.text.node.parentNode == this.graph.container)
	{
		sizer.bounds.height -= 1;
		sizer.bounds.width -= 1;
		sizer.dialect = mxConstants.DIALECT_STRICTHTML;
		sizer.init(this.graph.container);
	}
	else
	{
		sizer.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
				mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
		sizer.init(this.graph.getView().getOverlayPane());
	}

	mxEvent.redirectMouseEvents(sizer.node, this.graph, this.state);
	
	if (this.graph.isEnabled())
	{
		sizer.node.style.cursor = cursor;
	}
	
	if (!this.isSizerVisible(index))
	{
		sizer.node.style.visibility = 'hidden';
	}
	
	return sizer;
};

/**
 * Function: isSizerVisible
 * 
 * Returns true if the sizer for the given index is visible.
 * This returns true for all given indices.
 */
mxVertexHandler.prototype.isSizerVisible = function(index)
{
	return true;
};

/**
 * Function: createSizerShape
 * 
 * Creates the shape used for the sizer handle for the specified bounds and
 * index.
 */
mxVertexHandler.prototype.createSizerShape = function(bounds, index, fillColor)
{
	if (this.handleImage != null)
	{
		bounds = new mxRectangle(bounds.x, bounds.y, this.handleImage.width, this.handleImage.height);
		var shape = new mxImageShape(bounds, this.handleImage.src);
		
		// Allows HTML rendering of the images
		shape.preserveImageAspect = false;

		return shape;
	}
	else if (index == mxEvent.ROTATION_HANDLE)
	{
		return new mxEllipse(bounds, fillColor || mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
	}
	else
	{
		return new mxRectangleShape(bounds, fillColor || mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
	}
};

/**
 * Function: createBounds
 * 
 * Helper method to create an <mxRectangle> around the given centerpoint
 * with a width and height of 2*s or 6, if no s is given.
 */
mxVertexHandler.prototype.moveSizerTo = function(shape, x, y)
{
	if (shape != null)
	{
		shape.bounds.x = Math.round(x - shape.bounds.width / 2);
		shape.bounds.y = Math.round(y - shape.bounds.height / 2);
		shape.redraw();
	}
};

/**
 * Function: getHandleForEvent
 * 
 * Returns the index of the handle for the given event. This returns the index
 * of the sizer from where the event originated or <mxEvent.LABEL_INDEX>.
 */
mxVertexHandler.prototype.getHandleForEvent = function(me)
{
	// Connection highlight may consume events before they reach sizer handle
	var tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 1;
	var hit = (this.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ?
		new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
	var minDistSq = null;
	
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
	
	if (checkShape(this.rotationShape))
	{
		return mxEvent.ROTATION_HANDLE;
	}
	else if (checkShape(this.labelShape))
	{
		return mxEvent.LABEL_HANDLE;
	}
	
	if (this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			if (checkShape(this.sizers[i]))
			{
				return i;
			}
		}
	}

	return null;
};

/**
 * Function: mouseDown
 * 
 * Handles the event if a handle has been clicked. By consuming the
 * event all subsequent events of the gesture are redirected to this
 * handler.
 */
mxVertexHandler.prototype.mouseDown = function(sender, me)
{
	var tol = (!mxEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 0;
	
	if (!me.isConsumed() && this.graph.isEnabled() && (tol > 0 || me.getState() == this.state))
	{
		var handle = this.getHandleForEvent(me);

		if (handle != null)
		{
			this.start(me.getGraphX(), me.getGraphY(), handle);
			me.consume();
		}
	}
};

/**
 * Function: isLivePreviewBorder
 * 
 * Called if <livePreview> is enabled to check if a border should be painted.
 * This implementation returns true if the shape is transparent.
 */
mxVertexHandler.prototype.isLivePreviewBorder = function()
{
	return this.state.shape != null && this.state.shape.fill == null && this.state.shape.stroke == null;
};

/**
 * Function: start
 * 
 * Starts the handling of the mouse gesture.
 */
mxVertexHandler.prototype.start = function(x, y, index)
{
	this.inTolerance = true;
	this.index = index;
	this.startX = x;
	this.startY = y;
	
	// Creates a preview that can be on top of any HTML label
	this.selectionBorder.node.style.display = (index == mxEvent.ROTATION_HANDLE) ? 'inline' : 'none';
	
	// Creates the border that represents the new bounds
	if (!this.livePreview || this.isLivePreviewBorder())
	{
		this.preview = this.createSelectionShape(this.bounds);
		
		if (!(mxClient.IS_SVG && Number(this.state.style[mxConstants.STYLE_ROTATION] || '0') != 0) &&
			this.state.text != null && this.state.text.node.parentNode == this.graph.container)
		{
			this.preview.dialect = mxConstants.DIALECT_STRICTHTML;
			this.preview.init(this.graph.container);
		}
		else
		{
			this.preview.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
					mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
			this.preview.init(this.graph.view.getOverlayPane());
		}
	}
	
	// Prepares the handles for live preview
	if (this.livePreview)
	{
		this.hideSizers();
		
		if (index == mxEvent.ROTATION_HANDLE)
		{
			this.rotationShape.node.style.display = '';
		}
		else if (this.sizers[index] != null)
		{
			this.sizers[index].node.style.display = '';
		}
		
		// Gets the array of connected edge handlers for redrawing
		var edges = this.graph.getEdges(this.state.cell);
		this.edgeHandlers = [];
		
		for (var i = 0; i < edges.length; i++)
		{
			var handler = this.graph.selectionCellsHandler.getHandler(edges[i]);
			
			if (handler != null)
			{
				this.edgeHandlers.push(handler);
			}
		}
	}
};

/**
 * Function: hideSizers
 * 
 * Hides all sizers except.
 * 
 * Starts the handling of the mouse gesture.
 */
mxVertexHandler.prototype.hideSizers = function()
{
	for (var i = 0; i < this.sizers.length; i++)
	{
		this.sizers[i].node.style.display = 'none';
	}
};

/**
 * Function: checkTolerance
 * 
 * Checks if the coordinates for the given event are within the
 * <mxGraph.tolerance>. If the event is a mouse event then the tolerance is
 * ignored.
 */
mxVertexHandler.prototype.checkTolerance = function(me)
{
	if (this.inTolerance && this.startX != null && this.startY != null)
	{
		if (mxEvent.isMouseEvent(me.getEvent()) ||
			Math.abs(me.getGraphX() - this.startX) > this.graph.tolerance ||
			Math.abs(me.getGraphY() - this.startY) > this.graph.tolerance)
		{
			this.inTolerance = false;
		}
	}
};

/**
 * Function: mouseMove
 * 
 * Handles the event by updating the preview.
 */
mxVertexHandler.prototype.mouseMove = function(sender, me)
{
	if (!me.isConsumed() && this.index != null)
	{
		// Checks tolerance for ignoring single clicks
		this.checkTolerance(me);

		if (!this.inTolerance)
		{
			var point = new mxPoint(me.getGraphX(), me.getGraphY());
			var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
			var scale = this.graph.getView().scale;
			
			if (this.index == mxEvent.LABEL_HANDLE)
			{
				if (gridEnabled)
				{
					point.x = this.graph.snap(point.x / scale) * scale;
					point.y = this.graph.snap(point.y / scale) * scale;
				}
	
				this.moveSizerTo(this.sizers[this.sizers.length - 1], point.x, point.y);
			}
			else if (this.index == mxEvent.ROTATION_HANDLE)
			{
				var dx = this.state.x + this.state.width / 2 - point.x;
				var dy = this.state.y + this.state.height / 2 - point.y;
				
				this.currentAlpha = (dx != 0) ? Math.atan(dy / dx) * 180 / Math.PI + 90 : ((dy < 0) ? 180 : 0);
				
				if (dx > 0)
				{
					this.currentAlpha -= 180;
				}
	
				// Rotation raster
				if (this.rotationRaster && this.graph.isGridEnabledEvent(me.getEvent()))
				{
					var dx = point.x - this.state.getCenterX();
					var dy = point.y - this.state.getCenterY();
					var dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - this.state.height / 2 - 20);
					var raster = Math.max(1, 5 * Math.min(3, Math.max(0, Math.round(80 / Math.abs(dist)))));
					
					this.currentAlpha = Math.round(this.currentAlpha / raster) * raster;
				}
	
				this.selectionBorder.rotation = this.currentAlpha;
				this.selectionBorder.redraw();
				
				if (this.livePreview)
				{
					this.redrawHandles();
				}
			}
			else
			{
				var alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(-alpha);
				var sin = Math.sin(-alpha);
				
				var ct = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
				
				var dx = point.x - this.startX;
				var dy = point.y - this.startY;
				var tr = this.graph.view.translate;
				
				// Rotates vector for mouse gesture
				var tx = cos * dx - sin * dy;
				var ty = sin * dx + cos * dy;
				
				dx = tx;
				dy = ty;
				
				this.bounds = this.union(this.selectionBounds, dx, dy, this.index, gridEnabled, scale, tr, this.isConstrainedEvent(me));

				cos = Math.cos(alpha);
				sin = Math.sin(alpha);
				
				var c2 = new mxPoint(this.bounds.getCenterX(), this.bounds.getCenterY());
	
				var dx = c2.x - ct.x;
				var dy = c2.y - ct.y;
				
				var dx2 = cos * dx - sin * dy;
				var dy2 = sin * dx + cos * dy;
				
				var dx3 = dx2 - dx;
				var dy3 = dy2 - dy;
				
				this.bounds.x += dx3;
				this.bounds.y += dy3;
	
				if (this.livePreview)
				{
					// Saves current state
					var tmp = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
					var orig = this.state.origin;

					// Temporarily changes size and origin
					this.state.x = this.bounds.x;
					this.state.y = this.bounds.y;
					this.state.origin = new mxPoint(this.state.x / scale - tr.x, this.state.y / scale - tr.y);
					this.state.width = this.bounds.width;
					this.state.height = this.bounds.height;
					
					// Redraws cell and handles
					var off = this.state.absoluteOffset;
					off = new mxPoint(off.x, off.y);

					// Required to store and reset absolute offset for updating label position
					this.state.absoluteOffset.x = 0;
					this.state.absoluteOffset.y = 0;
					var geo = this.graph.getCellGeometry(this.state.cell);				
		
					if (geo != null)
					{
						var offset = geo.offset || this.EMPTY_POINT;
	
						if (offset != null && !geo.relative)
						{
							this.state.absoluteOffset.x = this.state.view.scale * offset.x;
							this.state.absoluteOffset.y = this.state.view.scale * offset.y;
						}
						
						this.state.view.updateVertexLabelOffset(this.state);
					}
					
					// Draws the live preview
					this.state.view.graph.cellRenderer.redraw(this.state, true);
					
					// Redraws connected edges
					this.state.view.invalidate(this.state.cell);
					this.state.invalid = false;
					this.state.view.validate();
					this.redrawHandles();
					
					// Restores current state
					this.state.x = tmp.x;
					this.state.y = tmp.y;
					this.state.width = tmp.width;
					this.state.height = tmp.height;
					this.state.origin = orig;
					this.state.absoluteOffset = off;
				}
				
				if (this.preview != null)
				{
					this.drawPreview();
				}
			}
		}
		
		me.consume();
	}
	// Workaround for disabling the connect highlight when over handle
	else if (!this.graph.isMouseDown && this.getHandleForEvent(me) != null)
	{
		me.consume(false);
	}
};

/**
 * Function: mouseUp
 * 
 * Handles the event by applying the changes to the geometry.
 */
mxVertexHandler.prototype.mouseUp = function(sender, me)
{
	if (this.index != null && this.state != null)
	{
		var point = new mxPoint(me.getGraphX(), me.getGraphY());

		this.graph.getModel().beginUpdate();
		try
		{
			if (this.index == mxEvent.ROTATION_HANDLE)
			{
				if (this.currentAlpha != null)
				{
					var delta = this.currentAlpha - (this.state.style[mxConstants.STYLE_ROTATION] || 0);
					
					if (delta != 0)
					{
						this.rotateCell(this.state.cell, delta);
					}
				}
			}
			else
			{
				var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
				var alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(-alpha);
				var sin = Math.sin(-alpha);
				
				var dx = point.x - this.startX;
				var dy = point.y - this.startY;
				
				// Rotates vector for mouse gesture
				var tx = cos * dx - sin * dy;
				var ty = sin * dx + cos * dy;
				
				dx = tx;
				dy = ty;
				
				var s = this.graph.view.scale;
				this.resizeCell(this.state.cell, dx / s, dy / s, this.index, gridEnabled, this.isConstrainedEvent(me));
			}
		}
		finally
		{
			this.graph.getModel().endUpdate();
		}

		me.consume();
		this.reset();
	}
};

/**
 * Function: rotateCell
 * 
 * Rotates the given cell to the given rotation.
 */
mxVertexHandler.prototype.rotateCell = function(cell, delta)
{
	var model = this.graph.getModel();

	// TODO: Rotate points in edges
	if (model.isVertex(cell))
	{
		var state = (cell == this.state) ? this.state : this.graph.view.getState(cell);
		
		if (state != null)
		{
			var theta = (state.style[mxConstants.STYLE_ROTATION] || 0) + delta;
			this.graph.setCellStyles(mxConstants.STYLE_ROTATION, theta, [cell]);
		}

		if (this.state.cell != cell)
		{
			var geo = this.graph.getCellGeometry(cell);
	
			if (geo != null && !geo.relative)
			{
				if (delta != 0)
				{
					// Rotates and moves child cell
					var parent = this.graph.getModel().getParent(cell);
					var pgeo = this.graph.getCellGeometry(parent);
					
					if (!geo.relative && pgeo != null)
					{
						var rad = mxUtils.toRadians(delta);
						var cos = Math.cos(rad);
						var sin = Math.sin(rad);
						
						var ct = new mxPoint(geo.getCenterX(), geo.getCenterY());
						var cx = new mxPoint(pgeo.width / 2, pgeo.height / 2);
						var pt = mxUtils.getRotatedPoint(ct, cos, sin, cx);
						
						geo = geo.clone();
						geo.x = pt.x - geo.width / 2;
						geo.y = pt.y - geo.height / 2;
						model.setGeometry(cell, geo);
					}
				}
			}
		}
		
		// Recursive handling of rotation
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			this.rotateCell(model.getChildAt(cell, i), delta);
		}
	}
};

/**
 * Function: reset
 * 
 * Resets the state of this handler.
 */
mxVertexHandler.prototype.reset = function()
{
	if (this.sizers != null && this.index != null && this.sizers[this.index] != null &&
		this.sizers[this.index].node.style.display == 'none')
	{
		this.sizers[this.index].node.style.display = '';
	}

	this.currentAlpha = null;
	this.inTolerance = null;
	this.index = null;

	// TODO: Reset and redraw cell states for live preview
	if (this.preview != null)
	{
		this.preview.destroy();
		this.preview = null;
	}
	
	// Checks if handler has been destroyed
	if (this.selectionBorder != null)
	{
		this.selectionBorder.node.style.display = 'inline';
		this.selectionBounds = this.getSelectionBounds(this.state);
		this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y,
			this.selectionBounds.width, this.selectionBounds.height);
		this.drawPreview();
	}

	if (this.livePreview && this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			if (this.sizers[i] != null)
			{
				this.sizers[i].node.style.display = '';
			}
		}
	}
	
	this.redrawHandles();
	this.edgeHandlers = null;
};

/**
 * Function: resizeCell
 * 
 * Uses the given vector to change the bounds of the given cell
 * in the graph using <mxGraph.resizeCell>.
 */
mxVertexHandler.prototype.resizeCell = function(cell, dx, dy, index, gridEnabled, constrained)
{
	var geo = this.graph.model.getGeometry(cell);
	
	if (geo != null)
	{
		if (index == mxEvent.LABEL_HANDLE)
		{
			var scale = this.graph.view.scale;
			dx = (this.labelShape.bounds.getCenterX() - this.startX) / scale;
			dy = (this.labelShape.bounds.getCenterY() - this.startY) / scale;
			
			geo = geo.clone();
			
			if (geo.offset == null)
			{
				geo.offset = new mxPoint(dx, dy);
			}
			else
			{
				geo.offset.x += dx;
				geo.offset.y += dy;
			}
			
			this.graph.model.setGeometry(cell, geo);
		}
		else
		{
			var bounds = this.union(geo, dx, dy, index, gridEnabled, 1, new mxPoint(0, 0), constrained);
			var alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
			
			if (alpha != 0)
			{
				var dx = bounds.getCenterX() - geo.getCenterX();
				var dy = bounds.getCenterY() - geo.getCenterY();
	
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
	
				var dx2 = cos * dx - sin * dy;
				var dy2 = sin * dx + cos * dy;
				
				var dx3 = dx2 - dx;
				var dy3 = dy2 - dy;
				
				var dx4 = bounds.x - geo.x;
				var dy4 = bounds.y - geo.y;
				
				var dx5 = cos * dx4 - sin * dy4;
				var dy5 = sin * dx4 + cos * dy4;
				
				bounds.x += dx3;
				bounds.y += dy3;
	
				// Shifts the children according to parent offset
				if (!this.graph.isCellCollapsed(cell) && (dx3 != 0 || dy3 != 0))
				{
					var dx4 = geo.x - bounds.x + dx5;
					var dy4 = geo.y - bounds.y + dy5;
					
					this.moveChildren(cell, dx4, dy4);
				}
			}
			
			this.graph.resizeCell(cell, bounds);
		}
	}
};

/**
 * Function: moveChildren
 * 
 * Moves the children of the given cell by the given vector.
 */
mxVertexHandler.prototype.moveChildren = function(cell, dx, dy)
{
	var model = this.graph.getModel();
	var childCount = model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(cell, i);
		
		// TODO: Move edge points
		if (model.isVertex(child))
		{
			var geo = this.graph.getCellGeometry(child);
	
			if (geo != null && !geo.relative)
			{
				geo = geo.clone();
				geo.x += dx;
				geo.y += dy;
				model.setGeometry(child, geo);
			}
		}
	}
};
/**
 * Function: union
 * 
 * Returns the union of the given bounds and location for the specified
 * handle index.
 * 
 * To override this to limit the size of vertex via a minWidth/-Height style,
 * the following code can be used.
 * 
 * (code)
 * var vertexHandlerUnion = mxVertexHandler.prototype.union;
 * mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
 * {
 *   var result = vertexHandlerUnion.apply(this, arguments);
 *   
 *   result.width = Math.max(result.width, mxUtils.getNumber(this.state.style, 'minWidth', 0));
 *   result.height = Math.max(result.height, mxUtils.getNumber(this.state.style, 'minHeight', 0));
 *   
 *   return result;
 * };
 * (end)
 * 
 * The minWidth/-Height style can then be used as follows:
 * 
 * (code)
 * graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'minWidth=100;minHeight=100;');
 * (end)
 * 
 * To override this to update the height for a wrapped text if the width of a vertex is
 * changed, the following can be used.
 * 
 * (code)
 * var mxVertexHandlerUnion = mxVertexHandler.prototype.union;
 * mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
 * {
 *   var result = mxVertexHandlerUnion.apply(this, arguments);
 *   var s = this.state;
 *   
 *   if (this.graph.isHtmlLabel(s.cell) && (index == 3 || index == 4) &&
 *       s.text != null && s.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap')
 *   {
 *     var label = this.graph.getLabel(s.cell);
 *     var fontSize = mxUtils.getNumber(s.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE);
 *     var ww = result.width / s.view.scale - s.text.spacingRight - s.text.spacingLeft
 *     
 *     result.height = mxUtils.getSizeForString(label, fontSize, s.style[mxConstants.STYLE_FONTFAMILY], ww).height;
 *   }
 *   
 *   return result;
 * };
 * (end)
 */
mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained)
{
	if (this.singleSizer)
	{
		var x = bounds.x + bounds.width + dx;
		var y = bounds.y + bounds.height + dy;
		
		if (gridEnabled)
		{
			x = this.graph.snap(x / scale) * scale;
			y = this.graph.snap(y / scale) * scale;
		}
		
		var rect = new mxRectangle(bounds.x, bounds.y, 0, 0);
		rect.add(new mxRectangle(x, y, 0, 0));
		
		return rect;
	}
	else
	{
		var left = bounds.x - tr.x * scale;
		var right = left + bounds.width;
		var top = bounds.y - tr.y * scale;
		var bottom = top + bounds.height;
		
		if (index > 4 /* Bottom Row */)
		{
			bottom = bottom + dy;
			
			if (gridEnabled)
			{
				bottom = this.graph.snap(bottom / scale) * scale;
			}
		}
		else if (index < 3 /* Top Row */)
		{
			top = top + dy;
			
			if (gridEnabled)
			{
				top = this.graph.snap(top / scale) * scale;
			}
		}
		
		if (index == 0 || index == 3 || index == 5 /* Left */)
		{
			left += dx;
			
			if (gridEnabled)
			{
				left = this.graph.snap(left / scale) * scale;
			}
		}
		else if (index == 2 || index == 4 || index == 7 /* Right */)
		{
			right += dx;
			
			if (gridEnabled)
			{
				right = this.graph.snap(right / scale) * scale;
			}
		}
		
		var width = right - left;
		var height = bottom - top;
		
		if (constrained)
		{
			var geo = this.graph.getCellGeometry(this.state.cell);

			if (geo != null)
			{
				var aspect = geo.width / geo.height;
				
				if (index== 1 || index== 2 || index == 7 || index == 6)
				{
					width = height * aspect;
				}
				else
				{
					height = width / aspect;
				}
				
				if (index == 0)
				{
					left = right - width;
					top = bottom - height;
				}
			}
		}
		
		// Flips over left side
		if (width < 0)
		{
			left += width;
			width = Math.abs(width);
		}
		
		// Flips over top side
		if (height < 0)
		{
			top += height;
			height = Math.abs(height);
		}

		var result = new mxRectangle(left + tr.x * scale, top + tr.y * scale, width, height);
		
		if (this.minBounds != null)
		{
			result.width = Math.max(result.width, this.minBounds.x * scale + this.minBounds.width * scale +
				Math.max(0, this.x0 * scale - result.x));
			result.height = Math.max(result.height, this.minBounds.y * scale + this.minBounds.height * scale +
				Math.max(0, this.y0 * scale - result.y));
		}
		
		return result;
	}
};

/**
 * Function: redraw
 * 
 * Redraws the handles and the preview.
 */
mxVertexHandler.prototype.redraw = function()
{
	this.selectionBounds = this.getSelectionBounds(this.state);
	this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
	
	this.redrawHandles();
	this.drawPreview();
};

/**
 * Function: redrawHandles
 * 
 * Redraws the handles. To hide certain handles the following code can be used.
 * 
 * (code)
 * mxVertexHandler.prototype.redrawHandles = function()
 * {
 *   mxVertexHandlerRedrawHandles.apply(this, arguments);
 *   
 *   if (this.sizers != null && this.sizers.length > 7)
 *   {
 *     this.sizers[1].node.style.display = 'none';
 *     this.sizers[6].node.style.display = 'none';
 *   }
 * };
 * (end)
 */
mxVertexHandler.prototype.redrawHandles = function()
{
	var s = this.bounds;

	if (this.sizers != null)
	{
		if (this.index == null && this.manageSizers && this.sizers.length > 1)
		{
			// KNOWN: Tolerance depends on event type (eg. 0 for mouse events)
			var tol = this.tolerance;
			
			if (s.width < 2 * this.sizers[0].bounds.width - 2 + 2 * tol)
			{
				this.sizers[1].node.style.display = 'none';
				this.sizers[6].node.style.display = 'none';
			}
			else
			{
				this.sizers[1].node.style.display = '';
				this.sizers[6].node.style.display = '';
			}
			
			if (s.height < 2 * this.sizers[0].bounds.height - 2 + 2 * tol)
			{
				this.sizers[3].node.style.display = 'none';
				this.sizers[4].node.style.display = 'none';
			}
			else
			{
				this.sizers[3].node.style.display = '';
				this.sizers[4].node.style.display = '';
			}
			
			if (s.width < 2 * this.sizers[0].bounds.width - 2 + 3 * tol ||
				s.height < 2 * this.sizers[0].bounds.height - 2 + 3 * tol)
			{
				s = new mxRectangle(s.x, s.y, s.width, s.height);
				tol /= 2;
				
				s.x -= (this.sizers[0].bounds.width + tol) / 2;
				s.width += this.sizers[0].bounds.width + tol;
				s.y -= (this.sizers[0].bounds.height + tol)  / 2;
				s.height += this.sizers[0].bounds.height + tol;
			}
		}

		var r = s.x + s.width;
		var b = s.y + s.height;
		
		if (this.singleSizer)
		{
			this.moveSizerTo(this.sizers[0], r, b);
		}
		else
		{
			var cx = s.x + s.width / 2;
			var cy = s.y + s.height / 2;
			
			if (this.sizers.length > 1)
			{
				var crs = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];
				
				var alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
				
				var da = Math.round(alpha * 4 / Math.PI);
				
				var ct = new mxPoint(s.getCenterX(), s.getCenterY());
				var pt = mxUtils.getRotatedPoint(new mxPoint(s.x, s.y), cos, sin, ct);
				
				this.moveSizerTo(this.sizers[0], pt.x, pt.y);
				this.sizers[0].node.style.cursor = crs[mxUtils.mod(0 + da, crs.length)];
				
				pt.x = cx;
				pt.y = s.y;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[1], pt.x, pt.y);
				this.sizers[1].node.style.cursor = crs[mxUtils.mod(1 + da, crs.length)];
				
				pt.x = r;
				pt.y = s.y;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[2], pt.x, pt.y);
				this.sizers[2].node.style.cursor = crs[mxUtils.mod(2 + da, crs.length)];
				
				pt.x = s.x;
				pt.y = cy;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[3], pt.x, pt.y);
				this.sizers[3].node.style.cursor = crs[mxUtils.mod(7 + da, crs.length)];

				pt.x = r;
				pt.y = cy;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[4], pt.x, pt.y);
				this.sizers[4].node.style.cursor = crs[mxUtils.mod(3 + da, crs.length)];

				pt.x = s.x;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[5], pt.x, pt.y);
				this.sizers[5].node.style.cursor = crs[mxUtils.mod(6 + da, crs.length)];

				pt.x = cx;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[6], pt.x, pt.y);
				this.sizers[6].node.style.cursor = crs[mxUtils.mod(5 + da, crs.length)];

				pt.x = r;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[7], pt.x, pt.y);
				this.sizers[7].node.style.cursor = crs[mxUtils.mod(4 + da, crs.length)];
				
				this.moveSizerTo(this.sizers[8], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
			}
			else if (this.state.width >= 2 && this.state.height >= 2)
			{
				this.moveSizerTo(this.sizers[0], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
			}
			else
			{
				this.moveSizerTo(this.sizers[0], s.x, s.y);
			}
		}
	}

	if (this.rotationShape != null)
	{
		var alpha = mxUtils.toRadians((this.currentAlpha != null) ? this.currentAlpha : this.state.style[mxConstants.STYLE_ROTATION] || '0');
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		
		var ct = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
		var pt = mxUtils.getRotatedPoint(new mxPoint(s.x + s.width / 2, s.y - 16), cos, sin, ct);

		if (this.rotationShape.node != null)
		{
			this.moveSizerTo(this.rotationShape, pt.x, pt.y);
		}
	}
	
	if (this.selectionBorder != null)
	{
		this.selectionBorder.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
	}
	
	if (this.edgeHandlers != null)
	{		
		for (var i = 0; i < this.edgeHandlers.length; i++)
		{
			this.edgeHandlers[i].redraw();
		}
	}
};

/**
 * Function: drawPreview
 * 
 * Redraws the preview.
 */
mxVertexHandler.prototype.drawPreview = function()
{
	if  (this.preview != null)
	{
		this.preview.bounds = this.bounds;
		
		if (this.preview.node.parentNode == this.graph.container)
		{
			this.preview.bounds.width = Math.max(0, this.preview.bounds.width - 1);
			this.preview.bounds.height = Math.max(0, this.preview.bounds.height - 1);
		}
	
		this.preview.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
		this.preview.redraw();
	}
	
	this.selectionBorder.bounds = this.bounds;
	this.selectionBorder.redraw();
};

/**
 * Function: destroy
 * 
 * Destroys the handler and all its resources and DOM nodes.
 */
mxVertexHandler.prototype.destroy = function()
{
	if (this.preview != null)
	{
		this.preview.destroy();
		this.preview = null;
	}
	
	this.selectionBorder.destroy();
	this.selectionBorder = null;
	this.labelShape = null;
	
	if (this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			this.sizers[i].destroy();
			this.sizers[i] = null;
		}
		
		this.sizers = null;
	}
};
