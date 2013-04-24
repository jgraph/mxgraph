/**
 * $Id: mxVertexHandler.js,v 1.19 2013/04/12 16:30:44 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
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
 * Specifies if the bounds of handles should be used for hit-detection in IE
 * Default is true.
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
 * Function: init
 * 
 * Initializes the shapes required for this vertex handler.
 */
mxVertexHandler.prototype.init = function()
{
	this.graph = this.state.view.graph;
	this.selectionBounds = this.getSelectionBounds(this.state);
	this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y,
		this.selectionBounds.width, this.selectionBounds.height);
	this.selectionBorder = this.createSelectionShape(this.bounds);
	// VML dialect required here for event transparency in IE
	this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
	this.selectionBorder.pointerEvents = false;
	this.selectionBorder.init(this.graph.getView().getOverlayPane());
	
	if (this.graph.isCellMovable(this.state.cell))
	{
		this.selectionBorder.node.style.cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
	}

	mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);
	
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
		(mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells))
	{
		this.rotationShape = this.createSizer('pointer', mxEvent.ROTATION_HANDLE,
			mxConstants.HANDLE_SIZE + 3, mxConstants.HANDLE_FILLCOLOR);
		this.sizers.push(this.rotationShape);
	}

	this.redraw();
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
		bounds.width = this.handleImage.width;
		bounds.height = this.handleImage.height;
		
		return new mxImageShape(bounds, this.handleImage.src);
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
	if (me.isSource(this.rotationShape))
	{
		return mxEvent.ROTATION_HANDLE;
	}
	else if (me.isSource(this.labelShape))
	{
		return mxEvent.LABEL_HANDLE;
	}
	
	if (this.sizers != null)
	{
		// Connection highlight may consume events before they reach sizer handle
		var tol = this.tolerance;
		var hit = (this.allowHandleBoundsCheck && (mxClient.IS_IE || tol > 0)) ?
			new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;

		for (var i = 0; i < this.sizers.length; i++)
		{
			if (me.isSource(this.sizers[i]) || (hit != null &&
				mxUtils.intersects(this.sizers[i].bounds, hit)))
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
	if (!me.isConsumed() && this.graph.isEnabled() && !this.graph.isForceMarqueeEvent(me.getEvent()) &&
		(this.tolerance > 0 || me.getState() == this.state))
	{
		var handle = this.getHandleForEvent(me);

		if (handle != null)
		{
			this.start(me.getX(), me.getY(), handle);
			me.consume();
		}
	}
};

/**
 * Function: start
 * 
 * Starts the handling of the mouse gesture.
 */
mxVertexHandler.prototype.start = function(x, y, index)
{
	var pt = mxUtils.convertPoint(this.graph.container, x, y);
	this.startX = pt.x;
	this.startY = pt.y;
	this.index = index;
	
	// Creates a preview that can be on top of any HTML label
	this.selectionBorder.node.style.display = (index == mxEvent.ROTATION_HANDLE) ? 'inline' : 'none';
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
			me.consume();
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
			if (this.rotationRaster)
			{
				var dx = point.x - this.state.getCenterX();
				var dy = point.y - this.state.getCenterY();
				var dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - this.state.height / 2 - 20);
				var raster = Math.max(1, 5 * Math.min(3, Math.max(0, Math.round(80 / Math.abs(dist)))));
				
				this.currentAlpha = Math.round(this.currentAlpha / raster) * raster;
			}

			this.selectionBorder.rotation = this.currentAlpha;
			this.selectionBorder.redraw();

			me.consume();
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
			
			this.bounds = this.union(this.selectionBounds, dx, dy, this.index, gridEnabled, scale, tr);
	
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
			
			this.drawPreview();
			me.consume();
		}
	}
	// Workaround for disabling the connect highlight when over handle
	else if (this.getHandleForEvent(me) != null)
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
	if (!me.isConsumed() && this.index != null && this.state != null)
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
				this.resizeCell(this.state.cell, dx / s, dy / s, this.index, gridEnabled);
			}
		}
		finally
		{
			this.graph.getModel().endUpdate();
		}

		this.reset();
		me.consume();
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
	this.currentAlpha = null;
	this.index = null;
	
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
};

/**
 * Function: resizeCell
 * 
 * Uses the given vector to change the bounds of the given cell
 * in the graph using <mxGraph.resizeCell>.
 */
mxVertexHandler.prototype.resizeCell = function(cell, dx, dy, index, gridEnabled)
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
			var bounds = this.union(geo, dx, dy, index, gridEnabled, 1, new mxPoint(0, 0));
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
 * mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr)
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
 */
mxVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr)
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
		
		return new mxRectangle(left + tr.x * scale, top + tr.y * scale, width, height);
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
	this.bounds = new mxRectangle(this.state.x, this.state.y, this.state.width, this.state.height);
	var s = this.state;
	
	if (this.sizers != null)
	{
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
				var alpha = mxUtils.toRadians(s.style[mxConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
				
				var ct = new mxPoint(s.getCenterX(), s.getCenterY());
				var pt = mxUtils.getRotatedPoint(new mxPoint(s.x, s.y), cos, sin, ct);
				
				this.moveSizerTo(this.sizers[0], pt.x, pt.y);
				
				pt.x = cx;
				pt.y = s.y;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[1], pt.x, pt.y);
				
				pt.x = r;
				pt.y = s.y;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[2], pt.x, pt.y);
				
				pt.x = s.x;
				pt.y = cy;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[3], pt.x, pt.y);

				pt.x = r;
				pt.y = cy;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[4], pt.x, pt.y);

				pt.x = s.x;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[5], pt.x, pt.y);

				pt.x = cx;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[6], pt.x, pt.y);

				pt.x = r;
				pt.y = b;
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[7], pt.x, pt.y);
				this.moveSizerTo(this.sizers[8],
					cx + s.absoluteOffset.x,
					cy + s.absoluteOffset.y);
			}
			else if (this.state.width >= 2 && this.state.height >= 2)
			{
				this.moveSizerTo(this.sizers[0],
						cx + s.absoluteOffset.x,
						cy + s.absoluteOffset.y);
			}
			else
			{
				this.moveSizerTo(this.sizers[0], s.x, s.y);
			}
		}
	}
	
	if (this.rotationShape != null)
	{
		var alpha = mxUtils.toRadians(this.state.style[mxConstants.STYLE_ROTATION] || '0');
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		
		var ct = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
		var pt = mxUtils.getRotatedPoint(new mxPoint(s.x + s.width / 2, s.y - 16), cos, sin, ct);
		
		this.moveSizerTo(this.rotationShape, pt.x, pt.y);
	}
	
	this.selectionBorder.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
	this.drawPreview();
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
	}
};
