/**
 * $Id: mxGraphView.js,v 1.194 2012-07-19 15:18:35 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxGraphView
 *
 * Extends <mxEventSource> to implement a view for a graph. This class is in
 * charge of computing the absolute coordinates for the relative child
 * geometries, the points for perimeters and edge styles and keeping them
 * cached in <mxCellStates> for faster retrieval. The states are updated
 * whenever the model or the view state (translate, scale) changes. The scale
 * and translate are honoured in the bounds.
 * 
 * Event: mxEvent.UNDO
 * 
 * Fires after the root was changed in <setCurrentRoot>. The <code>edit</code>
 * property contains the <mxUndoableEdit> which contains the
 * <mxCurrentRootChange>.
 * 
 * Event: mxEvent.SCALE_AND_TRANSLATE
 * 
 * Fires after the scale and translate have been changed in <scaleAndTranslate>.
 * The <code>scale</code>, <code>previousScale</code>, <code>translate</code>
 * and <code>previousTranslate</code> properties contain the new and previous
 * scale and translate, respectively.
 * 
 * Event: mxEvent.SCALE
 * 
 * Fires after the scale was changed in <setScale>. The <code>scale</code> and
 * <code>previousScale</code> properties contain the new and previous scale.
 * 
 * Event: mxEvent.TRANSLATE
 * 
 * Fires after the translate was changed in <setTranslate>. The
 * <code>translate</code> and <code>previousTranslate</code> properties contain
 * the new and previous value for translate.
 * 
 * Event: mxEvent.DOWN and mxEvent.UP
 * 
 * Fire if the current root is changed by executing an <mxCurrentRootChange>.
 * The event name depends on the location of the root in the cell hierarchy
 * with respect to the current root. The <code>root</code> and
 * <code>previous</code> properties contain the new and previous root,
 * respectively.
 * 
 * Constructor: mxGraphView
 *
 * Constructs a new view for the given <mxGraph>.
 * 
 * Parameters:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 */
function mxGraphView(graph)
{
	this.graph = graph;
	this.translate = new mxPoint();
	this.graphBounds = new mxRectangle();
	this.states = new mxDictionary();
};

/**
 * Extends mxEventSource.
 */
mxGraphView.prototype = new mxEventSource();
mxGraphView.prototype.constructor = mxGraphView;

/**
 *
 */
mxGraphView.prototype.EMPTY_POINT = new mxPoint();

/**
 * Variable: doneResource
 * 
 * Specifies the resource key for the status message after a long operation.
 * If the resource for this key does not exist then the value is used as
 * the status message. Default is 'done'.
 */
mxGraphView.prototype.doneResource = (mxClient.language != 'none') ? 'done' : '';

/**
 * Function: updatingDocumentResource
 *
 * Specifies the resource key for the status message while the document is
 * being updated. If the resource for this key does not exist then the
 * value is used as the status message. Default is 'updatingDocument'.
 */
mxGraphView.prototype.updatingDocumentResource = (mxClient.language != 'none') ? 'updatingDocument' : '';

/**
 * Variable: allowEval
 * 
 * Specifies if string values in cell styles should be evaluated using
 * <mxUtils.eval>. This will only be used if the string values can't be mapped
 * to objects using <mxStyleRegistry>. Default is false. NOTE: Enabling this
 * switch carries a possible security risk (see the section on security in
 * the manual).
 */
mxGraphView.prototype.allowEval = false;

/**
 * Variable: captureDocumentGesture
 * 
 * Specifies if a gesture should be captured when it goes outside of the
 * graph container. Default is true.
 */
mxGraphView.prototype.captureDocumentGesture = true;

/**
 * Variable: rendering
 * 
 * Specifies if shapes should be created, updated and destroyed using the
 * methods of <mxCellRenderer> in <graph>. Default is true.
 */
mxGraphView.prototype.rendering = true;

/**
 * Variable: graph
 *
 * Reference to the enclosing <mxGraph>.
 */
mxGraphView.prototype.graph = null;

/**
 * Variable: currentRoot
 *
 * <mxCell> that acts as the root of the displayed cell hierarchy.
 */
mxGraphView.prototype.currentRoot = null;

/**
 * Variable: graphBounds
 *
 * <mxRectangle> that caches the scales, translated bounds of the current view.
 */
mxGraphView.prototype.graphBounds = null;

/**
 * Variable: scale
 * 
 * Specifies the scale. Default is 1 (100%).
 */
mxGraphView.prototype.scale = 1;
	
/**
 * Variable: translate
 *
 * <mxPoint> that specifies the current translation. Default is a new
 * empty <mxPoint>.
 */
mxGraphView.prototype.translate = null;

/**
 * Variable: updateStyle
 * 
 * Specifies if the style should be updated in each validation step. If
 * this is false then the style is only updated if the state is created.
 * Default is false.
 */
mxGraphView.prototype.updateStyle = false;

/**
 * Function: getGraphBounds
 *
 * Returns <graphBounds>.
 */
mxGraphView.prototype.getGraphBounds = function()
{
	return this.graphBounds;
};

/**
 * Function: setGraphBounds
 *
 * Sets <graphBounds>.
 */
mxGraphView.prototype.setGraphBounds = function(value)
{
	this.graphBounds = value;
};

/**
 * Function: getBounds
 *
 * Returns the bounds (on the screen) for the given array of <mxCells>.
 *
 * Parameters:
 *
 * cells - Array of <mxCells> to return the bounds for.
 */
mxGraphView.prototype.getBounds = function(cells)
{
	var result = null;
	
	if (cells != null && cells.length > 0)
	{
		var model = this.graph.getModel();
		
		for (var i = 0; i < cells.length; i++)
		{
			if (model.isVertex(cells[i]) || model.isEdge(cells[i]))
			{
				var state = this.getState(cells[i]);
			
				if (state != null)
				{
					if (result == null)
					{
						result = new mxRectangle(state.x, state.y,
							state.width, state.height);
					}
					else
					{
						result.add(state);
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Function: setCurrentRoot
 *
 * Sets and returns the current root and fires an <undo> event before
 * calling <mxGraph.sizeDidChange>.
 *
 * Parameters:
 *
 * root - <mxCell> that specifies the root of the displayed cell hierarchy.
 */
mxGraphView.prototype.setCurrentRoot = function(root)
{
	if (this.currentRoot != root)
	{
		var change = new mxCurrentRootChange(this, root);
		change.execute();
		var edit = new mxUndoableEdit(this, false);
		edit.add(change);
		this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
		this.graph.sizeDidChange();
	}
	
	return root;
};

/**
 * Function: scaleAndTranslate
 *
 * Sets the scale and translation and fires a <scale> and <translate> event
 * before calling <revalidate> followed by <mxGraph.sizeDidChange>.
 *
 * Parameters:
 *
 * scale - Decimal value that specifies the new scale (1 is 100%).
 * dx - X-coordinate of the translation.
 * dy - Y-coordinate of the translation.
 */
mxGraphView.prototype.scaleAndTranslate = function(scale, dx, dy)
{
	var previousScale = this.scale;
	var previousTranslate = new mxPoint(this.translate.x, this.translate.y);
	
	if (this.scale != scale || this.translate.x != dx || this.translate.y != dy)
	{
		this.scale = scale;
		
		this.translate.x = dx;
		this.translate.y = dy;

		if (this.isEventsEnabled())
		{
			this.revalidate();
			this.graph.sizeDidChange();
		}
	}
	
	this.fireEvent(new mxEventObject(mxEvent.SCALE_AND_TRANSLATE,
		'scale', scale, 'previousScale', previousScale,
		'translate', this.translate, 'previousTranslate', previousTranslate));
};

/**
 * Function: getScale
 * 
 * Returns the <scale>.
 */
mxGraphView.prototype.getScale = function()
{
	return this.scale;
};

/**
 * Function: setScale
 *
 * Sets the scale and fires a <scale> event before calling <revalidate> followed
 * by <mxGraph.sizeDidChange>.
 *
 * Parameters:
 *
 * value - Decimal value that specifies the new scale (1 is 100%).
 */
mxGraphView.prototype.setScale = function(value)
{
	var previousScale = this.scale;
	
	if (this.scale != value)
	{
		this.scale = value;

		if (this.isEventsEnabled())
		{
			this.revalidate();
			this.graph.sizeDidChange();
		}
	}
	
	this.fireEvent(new mxEventObject(mxEvent.SCALE,
		'scale', value, 'previousScale', previousScale));
};

/**
 * Function: getTranslate
 * 
 * Returns the <translate>.
 */
mxGraphView.prototype.getTranslate = function()
{
	return this.translate;
};

/**
 * Function: setTranslate
 *
 * Sets the translation and fires a <translate> event before calling
 * <revalidate> followed by <mxGraph.sizeDidChange>. The translation is the
 * negative of the origin.
 *
 * Parameters:
 *
 * dx - X-coordinate of the translation.
 * dy - Y-coordinate of the translation.
 */
mxGraphView.prototype.setTranslate = function(dx, dy)
{
	var previousTranslate = new mxPoint(this.translate.x, this.translate.y);
	
	if (this.translate.x != dx || this.translate.y != dy)
	{
		this.translate.x = dx;
		this.translate.y = dy;

		if (this.isEventsEnabled())
		{
			this.revalidate();
			this.graph.sizeDidChange();
		}
	}
	
	this.fireEvent(new mxEventObject(mxEvent.TRANSLATE,
		'translate', this.translate, 'previousTranslate', previousTranslate));
};

/**
 * Function: refresh
 *
 * Clears the view if <currentRoot> is not null and revalidates.
 */
mxGraphView.prototype.refresh = function()
{
	if (this.currentRoot != null)
	{
		this.clear();
	}
	
	this.revalidate();
};

/**
 * Function: revalidate
 *
 * Revalidates the complete view with all cell states.
 */
mxGraphView.prototype.revalidate = function()
{
	this.invalidate();
	this.validate();
};

/**
 * Function: clear
 *
 * Removes the state of the given cell and all descendants if the given
 * cell is not the current root.
 * 
 * Parameters:
 * 
 * cell - Optional <mxCell> for which the state should be removed. Default
 * is the root of the model.
 * force - Boolean indicating if the current root should be ignored for
 * recursion.
 */
mxGraphView.prototype.clear = function(cell, force, recurse)
{
	var model = this.graph.getModel();
	cell = cell || model.getRoot();
	force = (force != null) ? force : false;
	recurse = (recurse != null) ? recurse : true;
	
	this.removeState(cell);
	
	if (recurse && (force || cell != this.currentRoot))
	{
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			this.clear(model.getChildAt(cell, i), force);
		}
	}
	else
	{
		this.invalidate(cell);
	}
};

/**
 * Function: invalidate
 * 
 * Invalidates the state of the given cell, all its descendants and
 * connected edges.
 * 
 * Parameters:
 * 
 * cell - Optional <mxCell> to be invalidated. Default is the root of the
 * model.
 */
mxGraphView.prototype.invalidate = function(cell, recurse, includeEdges, orderChanged)
{
	var model = this.graph.getModel();
	cell = cell || model.getRoot();
	recurse = (recurse != null) ? recurse : true;
	includeEdges = (includeEdges != null) ? includeEdges : true;
	orderChanged = (orderChanged != null) ? orderChanged : false;
	
	var state = this.getState(cell);

	if (state != null)
	{
		state.invalid = true;
		
		if (orderChanged)
		{
			state.orderChanged = true;
		}
	}
	
	// Recursively invalidates all descendants
	if (recurse)
	{
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			this.invalidate(child, recurse, includeEdges, orderChanged);
		}
	}
	
	// Propagates invalidation to all connected edges
	if (includeEdges)
	{
		var edgeCount = model.getEdgeCount(cell);
		
		for (var i = 0; i < edgeCount; i++)
		{
			this.invalidate(model.getEdgeAt(cell, i), recurse, includeEdges);
		}
	}
};

/**
 * Function: validate
 *
 * First validates all bounds and then validates all points recursively on
 * all visible cells starting at the given cell. Finally the background
 * is validated using <validateBackground>.
 * 
 * Parameters:
 * 
 * cell - Optional <mxCell> to be used as the root of the validation.
 * Default is <currentRoot> or the root of the model.
 */
mxGraphView.prototype.validate = function(cell)
{
	var t0 = mxLog.enter('mxGraphView.validate');
	window.status = mxResources.get(this.updatingDocumentResource) ||
		this.updatingDocumentResource;
	
	cell = cell || ((this.currentRoot != null) ?
			this.currentRoot :
				this.graph.getModel().getRoot());
	this.validateBounds(null, cell);
	var graphBounds = this.validatePoints(null, cell);
	
	if (graphBounds == null)
	{
		graphBounds = new mxRectangle();
	}

	this.setGraphBounds(graphBounds);
	this.validateBackground();
	
	window.status = mxResources.get(this.doneResource) ||
		this.doneResource;
	mxLog.leave('mxGraphView.validate', t0);
};

/**
 * Function: createBackgroundPageShape
 *
 * Creates and returns the shape used as the background page.
 * 
 * Parameters:
 * 
 * bounds - <mxRectangle> that represents the bounds of the shape.
 */
mxGraphView.prototype.createBackgroundPageShape = function(bounds)
{
	return new mxRectangleShape(bounds, 'white', 'black');
};

/**
 * Function: validateBackground
 *
 * Validates the background image.
 */
mxGraphView.prototype.validateBackground = function()
{
	var bg = this.graph.getBackgroundImage();
	
	if (bg != null)
	{
		if (this.backgroundImage == null || this.backgroundImage.image != bg.src)
		{
			if (this.backgroundImage != null)
			{
				this.backgroundImage.destroy();
			}
			
			var bounds = new mxRectangle(0, 0, 1, 1);
			
			this.backgroundImage = new mxImageShape(bounds, bg.src);
			this.backgroundImage.dialect = this.graph.dialect;
			this.backgroundImage.init(this.backgroundPane);
			this.backgroundImage.redraw();
		}
		
		this.redrawBackgroundImage(this.backgroundImage, bg);
	}
	else if (this.backgroundImage != null)
	{
		this.backgroundImage.destroy();
		this.backgroundImage = null;
	}
	
	if (this.graph.pageVisible)
	{
		var bounds = this.getBackgroundPageBounds();
		
		if (this.backgroundPageShape == null)
		{
			this.backgroundPageShape = this.createBackgroundPageShape(bounds);
			this.backgroundPageShape.scale = this.scale;
			this.backgroundPageShape.isShadow = true;
			this.backgroundPageShape.dialect = this.graph.dialect;
			this.backgroundPageShape.init(this.backgroundPane);
			this.backgroundPageShape.redraw();
			
			// Adds listener for double click handling on background
			mxEvent.addListener(this.backgroundPageShape.node, 'dblclick',
				mxUtils.bind(this, function(evt)
				{
					this.graph.dblClick(evt);
				})
			);
			
			var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
			var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
			var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';

			// Adds basic listeners for graph event dispatching outside of the
			// container and finishing the handling of a single gesture
			mxEvent.addListener(this.backgroundPageShape.node, md,
				mxUtils.bind(this, function(evt)
				{
					this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
				})
			);
			mxEvent.addListener(this.backgroundPageShape.node, mm,
				mxUtils.bind(this, function(evt)
				{
					// Hides the tooltip if mouse is outside container
					if (this.graph.tooltipHandler != null &&
							this.graph.tooltipHandler.isHideOnHover())
					{
						this.graph.tooltipHandler.hide();
					}
					
					if (this.graph.isMouseDown &&
						!mxEvent.isConsumed(evt))
					{
						this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
							new mxMouseEvent(evt));
					}
				})
			);
			mxEvent.addListener(this.backgroundPageShape.node, mu,
				mxUtils.bind(this, function(evt)
				{
					this.graph.fireMouseEvent(mxEvent.MOUSE_UP,
							new mxMouseEvent(evt));
				})
			);
		}
		else
		{
			this.backgroundPageShape.scale = this.scale;
			this.backgroundPageShape.bounds = bounds;
			this.backgroundPageShape.redraw();
		}
	}
	else if (this.backgroundPageShape != null)
	{
		this.backgroundPageShape.destroy();
		this.backgroundPageShape = null;
	}
};

/**
 * Function: getBackgroundPageBounds
 * 
 * Returns the bounds for the background page.
 */
mxGraphView.prototype.getBackgroundPageBounds = function()
{
	var fmt = this.graph.pageFormat;
	var ps = this.scale * this.graph.pageScale;
	var bounds = new mxRectangle(this.scale * this.translate.x, this.scale * this.translate.y,
			fmt.width * ps, fmt.height * ps);
	
	return bounds;
};

/**
 * Function: redrawBackgroundImage
 *
 * Updates the bounds and redraws the background image.
 * 
 * Example:
 * 
 * If the background image should not be scaled, this can be replaced with
 * the following.
 * 
 * (code)
 * mxGraphView.prototype.redrawBackground = function(backgroundImage, bg)
 * {
 *   backgroundImage.bounds.x = this.translate.x;
 *   backgroundImage.bounds.y = this.translate.y;
 *   backgroundImage.bounds.width = bg.width;
 *   backgroundImage.bounds.height = bg.height;
 *
 *   backgroundImage.redraw();
 * };
 * (end)
 * 
 * Parameters:
 * 
 * backgroundImage - <mxImageShape> that represents the background image.
 * bg - <mxImage> that specifies the image and its dimensions.
 */
mxGraphView.prototype.redrawBackgroundImage = function(backgroundImage, bg)
{
	backgroundImage.scale = this.scale;
	backgroundImage.bounds.x = this.scale * this.translate.x;
	backgroundImage.bounds.y = this.scale * this.translate.y;
	backgroundImage.bounds.width = this.scale * bg.width;
	backgroundImage.bounds.height = this.scale * bg.height;

	backgroundImage.redraw();
};

/**
 * Function: validateBounds
 *
 * Validates the bounds of the given parent's child using the given parent
 * state as the origin for the child. The validation is carried out
 * recursively for all non-collapsed descendants.
 * 
 * Parameters:
 * 
 * parentState - <mxCellState> for the given parent.
 * cell - <mxCell> for which the bounds in the state should be updated.
 */
mxGraphView.prototype.validateBounds = function(parentState, cell)
{
	var model = this.graph.getModel();
	var state = this.getState(cell, true);

	if (state != null && state.invalid)
	{
		if (!this.graph.isCellVisible(cell))
		{
			this.removeState(cell);
		}
		
		// Updates the cell state's origin
		else if (cell != this.currentRoot && parentState != null)
		{
			state.absoluteOffset.x = 0;
			state.absoluteOffset.y = 0;
			state.origin.x = parentState.origin.x;
			state.origin.y = parentState.origin.y;
			var geo = this.graph.getCellGeometry(cell);				

			if (geo != null)
			{
				if (!model.isEdge(cell))
				{
					var offset = geo.offset || this.EMPTY_POINT;

					if (geo.relative)
					{
						state.origin.x += geo.x * parentState.width / 
							this.scale + offset.x;
						state.origin.y += geo.y * parentState.height /
							this.scale + offset.y;
					}
					else
					{
						state.absoluteOffset.x = this.scale * offset.x;
						state.absoluteOffset.y = this.scale * offset.y;
						state.origin.x += geo.x;
						state.origin.y += geo.y;
					}
				}

				// Updates cell state's bounds
				state.x = this.scale * (this.translate.x + state.origin.x);
				state.y = this.scale * (this.translate.y + state.origin.y);
				state.width = this.scale * geo.width;
				state.height = this.scale * geo.height;

				if (model.isVertex(cell))
				{
					this.updateVertexLabelOffset(state);
				}
			}
		}
						
		// Applies child offset to origin
		var offset = this.graph.getChildOffsetForCell(cell);
		
		if (offset != null)
		{
			state.origin.x += offset.x;
			state.origin.y += offset.y;
		}
	}

	// Recursively validates the child bounds
	if (state != null && (!this.graph.isCellCollapsed(cell) ||
		cell == this.currentRoot))
	{
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			this.validateBounds(state, child);
		}
	}
};

/**
 * Function: updateVertexLabelOffset
 * 
 * Updates the absoluteOffset of the given vertex cell state. This takes
 * into account the label position styles.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose absolute offset should be updated.
 */
mxGraphView.prototype.updateVertexLabelOffset = function(state)
{
	var horizontal = mxUtils.getValue(state.style,
			mxConstants.STYLE_LABEL_POSITION,
			mxConstants.ALIGN_CENTER);
	
	if (horizontal == mxConstants.ALIGN_LEFT)
	{
		state.absoluteOffset.x -= state.width;
	}
	else if (horizontal == mxConstants.ALIGN_RIGHT)
	{
		state.absoluteOffset.x += state.width;
	}
	
	var vertical = mxUtils.getValue(state.style,
			mxConstants.STYLE_VERTICAL_LABEL_POSITION,
			mxConstants.ALIGN_MIDDLE);
	
	if (vertical == mxConstants.ALIGN_TOP)
	{
		state.absoluteOffset.y -= state.height;
	}
	else if (vertical == mxConstants.ALIGN_BOTTOM)
	{
		state.absoluteOffset.y += state.height;
	}
};

/**
 * Function: validatePoints
 * 
 * Validates the points for the state of the given cell recursively if the
 * cell is not collapsed and returns the bounding box of all visited states
 * as an <mxRectangle>.
 * 
 * Parameters:
 * 
 * parentState - <mxCellState> for the parent cell.
 * cell - <mxCell> whose points in the state should be updated.
 */
mxGraphView.prototype.validatePoints = function(parentState, cell)
{
	var model = this.graph.getModel();
	var state = this.getState(cell);
	var bbox = null;
	
	if (state != null)
	{
		if (state.invalid)
		{
			var geo = this.graph.getCellGeometry(cell);

			if (geo != null && model.isEdge(cell))
			{
				// Updates the points on the source terminal if its an edge
				var source = this.getState(this.getVisibleTerminal(cell, true));
				state.setVisibleTerminalState(source, true);
				
				if (source != null && model.isEdge(source.cell) &&
					!model.isAncestor(source.cell, cell))
				{
					var tmp = this.getState(model.getParent(source.cell));
					this.validatePoints(tmp, source.cell);
				}
				
				// Updates the points on the target terminal if its an edge
				var target = this.getState(this.getVisibleTerminal(cell, false));
				state.setVisibleTerminalState(target, false);
				
				if (target != null && model.isEdge(target.cell) &&
					!model.isAncestor(target.cell, cell))
				{
					var tmp = this.getState(model.getParent(target.cell));
					this.validatePoints(tmp, target.cell);
				}

				this.updateFixedTerminalPoints(state, source, target);
				this.updatePoints(state, geo.points, source, target);
				this.updateFloatingTerminalPoints(state, source, target);
				this.updateEdgeBounds(state);
				this.updateEdgeLabelOffset(state);
			}
			else if (geo != null && geo.relative && parentState != null &&
				model.isEdge(parentState.cell))
			{
				var origin = this.getPoint(parentState, geo);
				
				if (origin != null)
				{
					state.x = origin.x;
					state.y = origin.y;
					
					origin.x = (origin.x / this.scale) - this.translate.x;
					origin.y = (origin.y / this.scale) - this.translate.y;
					state.origin = origin;
					
					this.childMoved(parentState, state);
				}
			}
			
			state.invalid = false;

			if (cell != this.currentRoot)
			{
				// NOTE: Label bounds currently ignored if rendering is false
				this.graph.cellRenderer.redraw(state, false, this.isRendering());
			}
		}
		
		if (model.isEdge(cell) || model.isVertex(cell))
		{
			if (state.shape != null && state.shape.boundingBox != null)
			{
				bbox = state.shape.boundingBox.clone();
			}
			
			if (state.text != null && !this.graph.isLabelClipped(state.cell))
			{
				// Adds label bounding box to graph bounds
				if (state.text.boundingBox != null)
				{
					if (bbox != null)
					{
						bbox.add(state.text.boundingBox);
					}
					else
					{
						bbox = state.text.boundingBox.clone();
					}
				}
			}
		}
	}

	if (state != null && (!this.graph.isCellCollapsed(cell) ||
		cell == this.currentRoot))
	{
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			var bounds = this.validatePoints(state, child);
			
			if (bounds != null)
			{
				if (bbox == null)
				{
					bbox = bounds;
				}
				else
				{
					bbox.add(bounds);
				}
			}
		}
	}
	
	return bbox;
};

/**
 * Function: childMoved
 *
 * Invoked when a child state was moved as a result of late evaluation
 * of its position. This is invoked for relative edge children whose
 * position can only be determined after the points of the parent edge
 * are updated in validatePoints, and validates the bounds of all
 * descendants of the child using validateBounds.
 * 
 * Parameters:
 * 
 * parent - <mxCellState> that represents the parent state.
 * child - <mxCellState> that represents the child state.
 */
mxGraphView.prototype.childMoved = function(parent, child)
{
	var cell = child.cell;
	
	// Children of relative edge children need to validate
	// their bounds after their parent state was updated
	if (!this.graph.isCellCollapsed(cell) || cell == this.currentRoot)
	{
		var model = this.graph.getModel();
		var childCount = model.getChildCount(cell);

		for (var i = 0; i < childCount; i++)
		{
			this.validateBounds(child, model.getChildAt(cell, i));
		}
	}
};

/**
 * Function: updateFixedTerminalPoints
 *
 * Sets the initial absolute terminal points in the given state before the edge
 * style is computed.
 * 
 * Parameters:
 * 
 * edge - <mxCellState> whose initial terminal points should be updated.
 * source - <mxCellState> which represents the source terminal.
 * target - <mxCellState> which represents the target terminal.
 */
mxGraphView.prototype.updateFixedTerminalPoints = function(edge, source, target)
{
	this.updateFixedTerminalPoint(edge, source, true,
		this.graph.getConnectionConstraint(edge, source, true));
	this.updateFixedTerminalPoint(edge, target, false,
		this.graph.getConnectionConstraint(edge, target, false));
};

/**
 * Function: updateFixedTerminalPoint
 *
 * Sets the fixed source or target terminal point on the given edge.
 * 
 * Parameters:
 * 
 * edge - <mxCellState> whose terminal point should be updated.
 * terminal - <mxCellState> which represents the actual terminal.
 * source - Boolean that specifies if the terminal is the source.
 * constraint - <mxConnectionConstraint> that specifies the connection.
 */
mxGraphView.prototype.updateFixedTerminalPoint = function(edge, terminal, source, constraint)
{
	var pt = null;
	
	if (constraint != null)
	{
		pt = this.graph.getConnectionPoint(terminal, constraint);
	}
	
	if (pt == null && terminal == null)
	{
		var s = this.scale;
		var tr = this.translate;
		var orig = edge.origin;
		var geo = this.graph.getCellGeometry(edge.cell);
		pt = geo.getTerminalPoint(source);
		
		if (pt != null)
		{
			pt = new mxPoint(s * (tr.x + pt.x + orig.x),
							 s * (tr.y + pt.y + orig.y));
		}
	}

	edge.setAbsoluteTerminalPoint(pt, source);
};

/**
 * Function: updatePoints
 *
 * Updates the absolute points in the given state using the specified array
 * of <mxPoints> as the relative points.
 * 
 * Parameters:
 * 
 * edge - <mxCellState> whose absolute points should be updated.
 * points - Array of <mxPoints> that constitute the relative points.
 * source - <mxCellState> that represents the source terminal.
 * target - <mxCellState> that represents the target terminal.
 */
mxGraphView.prototype.updatePoints = function(edge, points, source, target)
{
	if (edge != null)
	{
		var pts = [];
		pts.push(edge.absolutePoints[0]);
		var edgeStyle = this.getEdgeStyle(edge, points, source, target);
		
		if (edgeStyle != null)
		{
			var src = this.getTerminalPort(edge, source, true);
			var trg = this.getTerminalPort(edge, target, false);
			
			edgeStyle(edge, src, trg, points, pts);
		}
		else if (points != null)
		{
			for (var i = 0; i < points.length; i++)
			{
				if (points[i] != null)
				{
					var pt = mxUtils.clone(points[i]);
					pts.push(this.transformControlPoint(edge, pt));
				}
			}
		}
		
		var tmp = edge.absolutePoints;
		pts.push(tmp[tmp.length-1]);

		edge.absolutePoints = pts;
	}
};

/**
 * Function: transformControlPoint
 *
 * Transforms the given control point to an absolute point.
 */
mxGraphView.prototype.transformControlPoint = function(state, pt)
{
	var orig = state.origin;
	
    return new mxPoint(this.scale * (pt.x + this.translate.x + orig.x),
    	this.scale * (pt.y + this.translate.y + orig.y));
};

/**
 * Function: getEdgeStyle
 * 
 * Returns the edge style function to be used to render the given edge
 * state.
 */
mxGraphView.prototype.getEdgeStyle = function(edge, points, source, target)
{
	var edgeStyle = (source != null && source == target) ?
			mxUtils.getValue(edge.style, mxConstants.STYLE_LOOP,
					this.graph.defaultLoopStyle) :
						(!mxUtils.getValue(edge.style,
								mxConstants.STYLE_NOEDGESTYLE, false) ?
										edge.style[mxConstants.STYLE_EDGE] :
											null);

	// Converts string values to objects
	if (typeof(edgeStyle) == "string")
	{
		var tmp = mxStyleRegistry.getValue(edgeStyle);
		
		if (tmp == null && this.isAllowEval())
		{
 			tmp = mxUtils.eval(edgeStyle);
		}
		
		edgeStyle = tmp;
	}
	
	if (typeof(edgeStyle) == "function")
	{
		return edgeStyle;
	}
	
	return null;
};

/**
 * Function: updateFloatingTerminalPoints
 *
 * Updates the terminal points in the given state after the edge style was
 * computed for the edge.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose terminal points should be updated.
 * source - <mxCellState> that represents the source terminal.
 * target - <mxCellState> that represents the target terminal.
 */
mxGraphView.prototype.updateFloatingTerminalPoints = function(state, source, target)
{
	var pts = state.absolutePoints;
	var p0 = pts[0];
	var pe = pts[pts.length - 1];

	if (pe == null && target != null)
	{
		this.updateFloatingTerminalPoint(state, target, source, false);
	}
	
	if (p0 == null && source != null)
	{
		this.updateFloatingTerminalPoint(state, source, target, true);
	}
};

/**
 * Function: updateFloatingTerminalPoint
 *
 * Updates the absolute terminal point in the given state for the given
 * start and end state, where start is the source if source is true.
 * 
 * Parameters:
 * 
 * edge - <mxCellState> whose terminal point should be updated.
 * start - <mxCellState> for the terminal on "this" side of the edge.
 * end - <mxCellState> for the terminal on the other side of the edge.
 * source - Boolean indicating if start is the source terminal state.
 */
mxGraphView.prototype.updateFloatingTerminalPoint = function(edge, start, end, source)
{
	start = this.getTerminalPort(edge, start, source);
	var next = this.getNextPoint(edge, end, source);
	
	var alpha = mxUtils.toRadians(Number(start.style[mxConstants.STYLE_ROTATION] || '0'));
	var center = new mxPoint(start.getCenterX(), start.getCenterY());
	
	if (alpha != 0)
	{
		var cos = Math.cos(-alpha);
		var sin = Math.sin(-alpha);
		next = mxUtils.getRotatedPoint(next, cos, sin, center);
	}
	
	var border = parseFloat(edge.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
	border += parseFloat(edge.style[(source) ?
		mxConstants.STYLE_SOURCE_PERIMETER_SPACING :
		mxConstants.STYLE_TARGET_PERIMETER_SPACING] || 0);
	var pt = this.getPerimeterPoint(start, next, this.graph.isOrthogonal(edge), border);

	if (alpha != 0)
	{
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		pt = mxUtils.getRotatedPoint(pt, cos, sin, center);
	}
	
	edge.setAbsoluteTerminalPoint(pt, source);
};

/**
 * Function: getTerminalPort
 * 
 * Returns an <mxCellState> that represents the source or target terminal or
 * port for the given edge.
 * 
 * Parameters:
 * 
 * state - <mxCellState> that represents the state of the edge.
 * terminal - <mxCellState> that represents the terminal.
 * source - Boolean indicating if the given terminal is the source terminal.
 */
mxGraphView.prototype.getTerminalPort = function(state, terminal, source)
{
	var key = (source) ? mxConstants.STYLE_SOURCE_PORT :
		mxConstants.STYLE_TARGET_PORT;
	var id = mxUtils.getValue(state.style, key);
	
	if (id != null)
	{
		var tmp = this.getState(this.graph.getModel().getCell(id));
		
		// Only uses ports where a cell state exists
		if (tmp != null)
		{
			terminal = tmp;
		}
	}
	
	return terminal;
};

/**
 * Function: getPerimeterPoint
 *
 * Returns an <mxPoint> that defines the location of the intersection point between
 * the perimeter and the line between the center of the shape and the given point.
 * 
 * Parameters:
 * 
 * terminal - <mxCellState> for the source or target terminal.
 * next - <mxPoint> that lies outside of the given terminal.
 * orthogonal - Boolean that specifies if the orthogonal projection onto
 * the perimeter should be returned. If this is false then the intersection
 * of the perimeter and the line between the next and the center point is
 * returned.
 * border - Optional border between the perimeter and the shape.
 */
mxGraphView.prototype.getPerimeterPoint = function(terminal, next, orthogonal, border)
{
	var point = null;
	
	if (terminal != null)
	{
		var perimeter = this.getPerimeterFunction(terminal);
		
		if (perimeter != null && next != null)
		{
			var bounds = this.getPerimeterBounds(terminal, border);
			
			if (bounds.width > 0 || bounds.height > 0)
			{
				point = perimeter(bounds, terminal, next, orthogonal);
			}
		}
		
		if (point == null)
		{
			point = this.getPoint(terminal);
		}
	}
	
	return point;
};

/**
 * Function: getRoutingCenterX
 * 
 * Returns the x-coordinate of the center point for automatic routing.
 */
mxGraphView.prototype.getRoutingCenterX = function (state)
{
	var f = (state.style != null) ? parseFloat(state.style
		[mxConstants.STYLE_ROUTING_CENTER_X]) || 0 : 0;

	return state.getCenterX() + f * state.width;
};

/**
 * Function: getRoutingCenterY
 * 
 * Returns the y-coordinate of the center point for automatic routing.
 */
mxGraphView.prototype.getRoutingCenterY = function (state)
{
	var f = (state.style != null) ? parseFloat(state.style
		[mxConstants.STYLE_ROUTING_CENTER_Y]) || 0 : 0;

	return state.getCenterY() + f * state.height;
};

/**
 * Function: getPerimeterBounds
 *
 * Returns the perimeter bounds for the given terminal, edge pair as an
 * <mxRectangle>.
 * 
 * If you have a model where each terminal has a relative child that should
 * act as the graphical endpoint for a connection from/to the terminal, then
 * this method can be replaced as follows:
 * 
 * (code)
 * var oldGetPerimeterBounds = mxGraphView.prototype.getPerimeterBounds;
 * mxGraphView.prototype.getPerimeterBounds = function(terminal, edge, isSource)
 * {
 *   var model = this.graph.getModel();
 *   var childCount = model.getChildCount(terminal.cell);
 * 
 *   if (childCount > 0)
 *   {
 *     var child = model.getChildAt(terminal.cell, 0);
 *     var geo = model.getGeometry(child);
 *
 *     if (geo != null &&
 *         geo.relative)
 *     {
 *       var state = this.getState(child);
 *       
 *       if (state != null)
 *       {
 *         terminal = state;
 *       }
 *     }
 *   }
 *   
 *   return oldGetPerimeterBounds.apply(this, arguments);
 * };
 * (end)
 * 
 * Parameters:
 * 
 * terminal - <mxCellState> that represents the terminal.
 * border - Number that adds a border between the shape and the perimeter.
 */
mxGraphView.prototype.getPerimeterBounds = function(terminal, border)
{
	border = (border != null) ? border : 0;

	if (terminal != null)
	{
		border += parseFloat(terminal.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
	}

	return terminal.getPerimeterBounds(border * this.scale);
};

/**
 * Function: getPerimeterFunction
 *
 * Returns the perimeter function for the given state.
 */
mxGraphView.prototype.getPerimeterFunction = function(state)
{
	var perimeter = state.style[mxConstants.STYLE_PERIMETER];

	// Converts string values to objects
	if (typeof(perimeter) == "string")
	{
		var tmp = mxStyleRegistry.getValue(perimeter);
		
		if (tmp == null && this.isAllowEval())
		{
 			tmp = mxUtils.eval(perimeter);
		}

		perimeter = tmp;
	}
	
	if (typeof(perimeter) == "function")
	{
		return perimeter;
	}
	
	return null;
};

/**
 * Function: getNextPoint
 *
 * Returns the nearest point in the list of absolute points or the center
 * of the opposite terminal.
 * 
 * Parameters:
 * 
 * edge - <mxCellState> that represents the edge.
 * opposite - <mxCellState> that represents the opposite terminal.
 * source - Boolean indicating if the next point for the source or target
 * should be returned.
 */
mxGraphView.prototype.getNextPoint = function(edge, opposite, source)
{
	var pts = edge.absolutePoints;
	var point = null;
	
	if (pts != null && (source || pts.length > 2 || opposite == null))
	{
		var count = pts.length;
		point = pts[(source) ? Math.min(1, count - 1) : Math.max(0, count - 2)];
	}
	
	if (point == null && opposite != null)
	{
		point = new mxPoint(opposite.getCenterX(), opposite.getCenterY());
	}
	
	return point;
};

/**
 * Function: getVisibleTerminal
 *
 * Returns the nearest ancestor terminal that is visible. The edge appears
 * to be connected to this terminal on the display. The result of this method
 * is cached in <mxCellState.getVisibleTerminalState>.
 * 
 * Parameters:
 * 
 * edge - <mxCell> whose visible terminal should be returned.
 * source - Boolean that specifies if the source or target terminal
 * should be returned.
 */
mxGraphView.prototype.getVisibleTerminal = function(edge, source)
{
	var model = this.graph.getModel();
	var result = model.getTerminal(edge, source);
	var best = result;
	
	while (result != null && result != this.currentRoot)
	{
		if (!this.graph.isCellVisible(best) || this.graph.isCellCollapsed(result))
		{
			best = result;
		}
		
		result = model.getParent(result);
	}

	// Checks if the result is not a layer
	if (model.getParent(best) == model.getRoot())
	{
		best = null;
	}
	
	return best;
};

/**
 * Function: updateEdgeBounds
 *
 * Updates the given state using the bounding box of the absolute points.
 * Also updates <mxCellState.terminalDistance>, <mxCellState.length> and
 * <mxCellState.segments>.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose bounds should be updated.
 */
mxGraphView.prototype.updateEdgeBounds = function(state)
{
	var points = state.absolutePoints;
	state.length = 0;
	
	if (points != null && points.length > 0)
	{
		var p0 = points[0];
		var pe = points[points.length - 1];
		
		if (p0 == null || pe == null)
		{
			// Drops the edge state if the edge is not the root
			if (state.cell != this.currentRoot)
			{
				// Note: This condition normally occurs if a connected edge has a
				// null-terminal, ie. edge.source == null or edge.target == null,
				// and no corresponding terminal point defined, which happens for
				// example if the terminal-id was not resolved at cell decoding time.
				this.clear(state.cell, true);
			}
		}
		else
		{
			if (p0.x != pe.x || p0.y != pe.y)
			{
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
			}
			else
			{
				state.terminalDistance = 0;
			}
			
			var length = 0;
			var segments = [];
			var pt = p0;
			
			if (pt != null)
			{
				var minX = pt.x;
				var minY = pt.y;
				var maxX = minX;
				var maxY = minY;
				
				for (var i = 1; i < points.length; i++)
				{
					var tmp = points[i];
					
					if (tmp != null)
					{
						var dx = pt.x - tmp.x;
						var dy = pt.y - tmp.y;
						
						var segment = Math.sqrt(dx * dx + dy * dy);
						segments.push(segment);
						length += segment;
						
						pt = tmp;
						
						minX = Math.min(pt.x, minX);
						minY = Math.min(pt.y, minY);
						maxX = Math.max(pt.x, maxX);
						maxY = Math.max(pt.y, maxY);
					}
				}
				
				state.length = length;
				state.segments = segments;
				
				var markerSize = 1; // TODO: include marker size
				
				state.x = minX;
				state.y = minY;
				state.width = Math.max(markerSize, maxX - minX);
				state.height = Math.max(markerSize, maxY - minY);
			}
		}
	}
};

/**
 * Function: getPoint
 *
 * Returns the absolute point on the edge for the given relative
 * <mxGeometry> as an <mxPoint>. The edge is represented by the given
 * <mxCellState>.
 * 
 * Parameters:
 * 
 * state - <mxCellState> that represents the state of the parent edge.
 * geometry - <mxGeometry> that represents the relative location.
 */
mxGraphView.prototype.getPoint = function(state, geometry)
{
	var x = state.getCenterX();
	var y = state.getCenterY();
	
	if (state.segments != null && (geometry == null || geometry.relative))
	{
		var gx = (geometry != null) ? geometry.x / 2 : 0;
		var pointCount = state.absolutePoints.length;
		var dist = (gx + 0.5) * state.length;
		var segment = state.segments[0];
		var length = 0;				
		var index = 1;

		while (dist > length + segment && index < pointCount-1)
		{
			length += segment;
			segment = state.segments[index++];
		}

		var factor = (segment == 0) ? 0 : (dist - length) / segment;
		var p0 = state.absolutePoints[index-1];
		var pe = state.absolutePoints[index];

		if (p0 != null && pe != null)
		{
			var gy = 0;
			var offsetX = 0;
			var offsetY = 0;

			if (geometry != null)
			{
				gy = geometry.y;
				var offset = geometry.offset;
				
				if (offset != null)
				{
					offsetX = offset.x;
					offsetY = offset.y;
				}
			}

			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			var nx = (segment == 0) ? 0 : dy / segment;
			var ny = (segment == 0) ? 0 : dx / segment;
			
			x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
			y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
		}
	}
	else if (geometry != null)
	{
		var offset = geometry.offset;
		
		if (offset != null)
		{
			x += offset.x;
			y += offset.y;
		}
	}
	
	return new mxPoint(x, y);		
};

/**
 * Function: getRelativePoint
 *
 * Gets the relative point that describes the given, absolute label
 * position for the given edge state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> that represents the state of the parent edge.
 * x - Specifies the x-coordinate of the absolute label location.
 * y - Specifies the y-coordinate of the absolute label location.
 */
mxGraphView.prototype.getRelativePoint = function(edgeState, x, y)
{
	var model = this.graph.getModel();
	var geometry = model.getGeometry(edgeState.cell);
	
	if (geometry != null)
	{
		var pointCount = edgeState.absolutePoints.length;
		
		if (geometry.relative && pointCount > 1)
		{
			var totalLength = edgeState.length;
			var segments = edgeState.segments;

			// Works which line segment the point of the label is closest to
			var p0 = edgeState.absolutePoints[0];
			var pe = edgeState.absolutePoints[1];
			var minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

			var index = 0;
			var tmp = 0;
			var length = 0;
			
			for (var i = 2; i < pointCount; i++)
			{
				tmp += segments[i - 2];
				pe = edgeState.absolutePoints[i];
				var dist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

				if (dist <= minDist)
				{
					minDist = dist;
					index = i - 1;
					length = tmp;
				}
				
				p0 = pe;
			}
			
			var seg = segments[index];
			p0 = edgeState.absolutePoints[index];
			pe = edgeState.absolutePoints[index + 1];
			
			var x2 = p0.x;
			var y2 = p0.y;
			
			var x1 = pe.x;
			var y1 = pe.y;
			
			var px = x;
			var py = y;
			
			var xSegment = x2 - x1;
			var ySegment = y2 - y1;
			
			px -= x1;
			py -= y1;
			var projlenSq = 0;
			
			px = xSegment - px;
			py = ySegment - py;
			var dotprod = px * xSegment + py * ySegment;

			if (dotprod <= 0.0)
			{
				projlenSq = 0;
			}
			else
			{
				projlenSq = dotprod * dotprod
						/ (xSegment * xSegment + ySegment * ySegment);
			}

			var projlen = Math.sqrt(projlenSq);

			if (projlen > seg)
			{
				projlen = seg;
			}

			var yDistance = Math.sqrt(mxUtils.ptSegDistSq(p0.x, p0.y, pe
					.x, pe.y, x, y));
			var direction = mxUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x, y);

			if (direction == -1)
			{
				yDistance = -yDistance;
			}

			// Constructs the relative point for the label
			return new mxPoint(((totalLength / 2 - length - projlen) / totalLength) * -2,
						yDistance / this.scale);
		}
	}
	
	return new mxPoint();
};

/**
 * Function: updateEdgeLabelOffset
 *
 * Updates <mxCellState.absoluteOffset> for the given state. The absolute
 * offset is normally used for the position of the edge label. Is is
 * calculated from the geometry as an absolute offset from the center
 * between the two endpoints if the geometry is absolute, or as the
 * relative distance between the center along the line and the absolute
 * orthogonal distance if the geometry is relative.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose absolute offset should be updated.
 */
mxGraphView.prototype.updateEdgeLabelOffset = function(state)
{
	var points = state.absolutePoints;
	
	state.absoluteOffset.x = state.getCenterX();
	state.absoluteOffset.y = state.getCenterY();

	if (points != null && points.length > 0 && state.segments != null)
	{
		var geometry = this.graph.getCellGeometry(state.cell);
		
		if (geometry.relative)
		{
			var offset = this.getPoint(state, geometry);
			
			if (offset != null)
			{
				state.absoluteOffset = offset;
			}
		}
		else
		{
			var p0 = points[0];
			var pe = points[points.length - 1];
			
			if (p0 != null && pe != null)
			{
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				var x0 = 0;
				var y0 = 0;

				var off = geometry.offset;
				
				if (off != null)
				{
					x0 = off.x;
					y0 = off.y;
				}
				
				var x = p0.x + dx / 2 + x0 * this.scale;
				var y = p0.y + dy / 2 + y0 * this.scale;
				
				state.absoluteOffset.x = x;
				state.absoluteOffset.y = y;
			}
		}
	}
};

/**
 * Function: getState
 *
 * Returns the <mxCellState> for the given cell. If create is true, then
 * the state is created if it does not yet exist.
 * 
 * Parameters:
 * 
 * cell - <mxCell> for which the <mxCellState> should be returned.
 * create - Optional boolean indicating if a new state should be created
 * if it does not yet exist. Default is false.
 */
mxGraphView.prototype.getState = function(cell, create)
{
	create = create || false;
	var state = null;
	
	if (cell != null)
	{
		state = this.states.get(cell);
		
		if (this.graph.isCellVisible(cell))
		{
			if (state == null && create && this.graph.isCellVisible(cell))
			{
				state = this.createState(cell);
				this.states.put(cell, state);
			}
			else if (create && state != null && this.updateStyle)
			{
				state.style = this.graph.getCellStyle(cell);
			}
		}
	}

	return state;
};

/**
 * Function: isRendering
 *
 * Returns <rendering>.
 */
mxGraphView.prototype.isRendering = function()
{
	return this.rendering;
};

/**
 * Function: setRendering
 *
 * Sets <rendering>.
 */
mxGraphView.prototype.setRendering = function(value)
{
	this.rendering = value;
};

/**
 * Function: isAllowEval
 *
 * Returns <allowEval>.
 */
mxGraphView.prototype.isAllowEval = function()
{
	return this.allowEval;
};

/**
 * Function: setAllowEval
 *
 * Sets <allowEval>.
 */
mxGraphView.prototype.setAllowEval = function(value)
{
	this.allowEval = value;
};

/**
 * Function: getStates
 *
 * Returns <states>.
 */
mxGraphView.prototype.getStates = function()
{
	return this.states;
};

/**
 * Function: setStates
 *
 * Sets <states>.
 */
mxGraphView.prototype.setStates = function(value)
{
	this.states = value;
};

/**
 * Function: getCellStates
 *
 * Returns the <mxCellStates> for the given array of <mxCells>. The array
 * contains all states that are not null, that is, the returned array may
 * have less elements than the given array. If no argument is given, then
 * this returns <states>.
 */
mxGraphView.prototype.getCellStates = function(cells)
{
	if (cells == null)
	{
		return this.states;
	}
	else
	{
		var result = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			var state = this.getState(cells[i]);
			
			if (state != null)
			{
				result.push(state);
			}
		}
		
		return result;
	}
};

/**
 * Function: removeState
 *
 * Removes and returns the <mxCellState> for the given cell.
 * 
 * Parameters:
 * 
 * cell - <mxCell> for which the <mxCellState> should be removed.
 */
mxGraphView.prototype.removeState = function(cell)
{
	var state = null;
	
	if (cell != null)
	{
		state = this.states.remove(cell);
		
		if (state != null)
		{
			this.graph.cellRenderer.destroy(state);
			state.destroy();
		}
	}
	
	return state;
};

/**
 * Function: createState
 *
 * Creates and returns an <mxCellState> for the given cell and initializes
 * it using <mxCellRenderer.initialize>.
 * 
 * Parameters:
 * 
 * cell - <mxCell> for which a new <mxCellState> should be created.
 */
mxGraphView.prototype.createState = function(cell)
{
	var style = this.graph.getCellStyle(cell);
	var state = new mxCellState(this, cell, style);
	this.graph.cellRenderer.initialize(state, this.isRendering());

	return state;
};
	
/**
 * Function: getCanvas
 *
 * Returns the DOM node that contains the background-, draw- and
 * overlaypane.
 */
mxGraphView.prototype.getCanvas = function()
{
	return this.canvas;
};

/**
 * Function: getBackgroundPane
 *
 * Returns the DOM node that represents the background layer.
 */
mxGraphView.prototype.getBackgroundPane = function()
{
	return this.backgroundPane;
};

/**
 * Function: getDrawPane
 *
 * Returns the DOM node that represents the main drawing layer.
 */
mxGraphView.prototype.getDrawPane = function()
{
	return this.drawPane;
};

/**
 * Function: getOverlayPane
 *
 * Returns the DOM node that represents the topmost drawing layer.
 */
mxGraphView.prototype.getOverlayPane = function()
{
	return this.overlayPane;
};

/**
 * Function: isContainerEvent
 * 
 * Returns true if the event origin is one of the drawing panes or
 * containers of the view.
 */
mxGraphView.prototype.isContainerEvent = function(evt)
{
	var source = mxEvent.getSource(evt);

	return (source == this.graph.container ||
		source.parentNode == this.backgroundPane ||
		(source.parentNode != null &&
		source.parentNode.parentNode == this.backgroundPane) ||
		source == this.canvas.parentNode ||
		source == this.canvas ||
		source == this.backgroundPane ||
		source == this.drawPane ||
		source == this.overlayPane);
};

/**
 * Function: isScrollEvent
 * 
 * Returns true if the event origin is one of the scrollbars of the
 * container in IE. Such events are ignored.
 */
 mxGraphView.prototype.isScrollEvent = function(evt)
{
	var offset = mxUtils.getOffset(this.graph.container);
	var pt = new mxPoint(evt.clientX - offset.x, evt.clientY - offset.y);

	var outWidth = this.graph.container.offsetWidth;
	var inWidth = this.graph.container.clientWidth;

	if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth)
	{
		return true;
	}

	var outHeight = this.graph.container.offsetHeight;
	var inHeight = this.graph.container.clientHeight;
	
	if (outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight)
	{
		return true;
	}
	
	return false;
};

/**
 * Function: init
 *
 * Initializes the graph event dispatch loop for the specified container
 * and invokes <create> to create the required DOM nodes for the display.
 */
mxGraphView.prototype.init = function()
{
	this.installListeners();
	
	// Creates the DOM nodes for the respective display dialect
	var graph = this.graph;
	
	if (graph.dialect == mxConstants.DIALECT_SVG)
	{
		this.createSvg();
	}
	else if (graph.dialect == mxConstants.DIALECT_VML)
	{
		this.createVml();
	}
	else
	{
		this.createHtml();
	}
};

/**
 * Function: installListeners
 *
 * Installs the required listeners in the container.
 */
mxGraphView.prototype.installListeners = function()
{
	var graph = this.graph;
	var container = graph.container;
	
	if (container != null)
	{
		var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
		var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
		var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';
		
		// Adds basic listeners for graph event dispatching
		mxEvent.addListener(container, md,
			mxUtils.bind(this, function(evt)
			{
				// Workaround for touch-based device not transferring
				// the focus while editing with virtual keyboard
				if (mxClient.IS_TOUCH && graph.isEditing())
				{
					graph.stopEditing(!graph.isInvokesStopCellEditing());
				}
				
				// Condition to avoid scrollbar events starting a rubberband
				// selection
				if (this.isContainerEvent(evt) && ((!mxClient.IS_IE && 
					!mxClient.IS_GC && !mxClient.IS_OP && !mxClient.IS_SF) ||
					!this.isScrollEvent(evt)))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
						new mxMouseEvent(evt));
				}
			})
		);
		mxEvent.addListener(container, mm,
			mxUtils.bind(this, function(evt)
			{
				if (this.isContainerEvent(evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
						new mxMouseEvent(evt));
				}
			})
		);
		mxEvent.addListener(container, mu,
			mxUtils.bind(this, function(evt)
			{
				if (this.isContainerEvent(evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_UP,
						new mxMouseEvent(evt));
				}
			})
		);
		
		// Adds listener for double click handling on background
		mxEvent.addListener(container, 'dblclick',
			mxUtils.bind(this, function(evt)
			{
				graph.dblClick(evt);
			})
		);

		// Workaround for touch events which started on some DOM node
		// on top of the container, in which case the cells under the
		// mouse for the move and up events are not detected.
		var getState = function(evt)
		{
			var state = null;
			
			// Workaround for touch events which started on some DOM node
			// on top of the container, in which case the cells under the
			// mouse for the move and up events are not detected.
			if (mxClient.IS_TOUCH)
			{
				var x = mxEvent.getClientX(evt);
				var y = mxEvent.getClientY(evt);
				
				// Dispatches the drop event to the graph which
				// consumes and executes the source function
				var pt = mxUtils.convertPoint(container, x, y);
				state = graph.view.getState(graph.getCellAt(pt.x, pt.y));
			}
			
			return state;
		};	
					
		// Adds basic listeners for graph event dispatching outside of the
		// container and finishing the handling of a single gesture
		// Implemented via graph event dispatch loop to avoid duplicate events
		// in Firefox and Chrome
		graph.addMouseListener(
		{
			mouseDown: function(sender, me)
			{
				graph.panningHandler.hideMenu();
			},
			mouseMove: function() { },
			mouseUp: function() { }
		});
		mxEvent.addListener(document, mm,
			mxUtils.bind(this, function(evt)
			{
				// Hides the tooltip if mouse is outside container
				if (graph.tooltipHandler != null &&
					graph.tooltipHandler.isHideOnHover())
				{
					graph.tooltipHandler.hide();
				}
				
				if (this.captureDocumentGesture && graph.isMouseDown &&
					!mxEvent.isConsumed(evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
						new mxMouseEvent(evt, getState(evt)));
				}
			})
		);
		mxEvent.addListener(document, mu,
			mxUtils.bind(this, function(evt)
			{
				if (this.captureDocumentGesture)
				{
					graph.fireMouseEvent(mxEvent.MOUSE_UP,
						new mxMouseEvent(evt));
				}
			})
		);
	}
};

/**
 * Function: create
 *
 * Creates the DOM nodes for the HTML display.
 */
mxGraphView.prototype.createHtml = function()
{
	var container = this.graph.container;
	
	if (container != null)
	{
		this.canvas = this.createHtmlPane('100%', '100%');
	
		// Uses minimal size for inner DIVs on Canvas. This is required
		// for correct event processing in IE. If we have an overlapping
		// DIV then the events on the cells are only fired for labels.
		this.backgroundPane = this.createHtmlPane('1px', '1px');
		this.drawPane = this.createHtmlPane('1px', '1px');
		this.overlayPane = this.createHtmlPane('1px', '1px');
		
		this.canvas.appendChild(this.backgroundPane);
		this.canvas.appendChild(this.drawPane);
		this.canvas.appendChild(this.overlayPane);

		container.appendChild(this.canvas);
		
		// Implements minWidth/minHeight in quirks mode
		if (mxClient.IS_QUIRKS)
		{
			var onResize = mxUtils.bind(this, function(evt)
			{
				var bounds = this.getGraphBounds();
				var width = bounds.x + bounds.width + this.graph.border;
				var height = bounds.y + bounds.height + this.graph.border;
				
				this.updateHtmlCanvasSize(width, height);
			});
			
			mxEvent.addListener(window, 'resize', onResize);
		}
	}
};

/**
 * Function: updateHtmlCanvasSize
 * 
 * Updates the size of the HTML canvas.
 */
mxGraphView.prototype.updateHtmlCanvasSize = function(width, height)
{
	if (this.graph.container != null)
	{
		var ow = this.graph.container.offsetWidth;
		var oh = this.graph.container.offsetHeight;

		if (ow < width)
		{
			this.canvas.style.width = width + 'px';
		}
		else
		{
			this.canvas.style.width = '100%';
		}

		if (oh < height)
		{
			this.canvas.style.height = height + 'px';
		}
		else
		{
			this.canvas.style.height = '100%';
		}
	}
};

/**
 * Function: createHtmlPane
 * 
 * Creates and returns a drawing pane in HTML (DIV).
 */
mxGraphView.prototype.createHtmlPane = function(width, height)
{
	var pane = document.createElement('DIV');
	
	if (width != null && height != null)
	{
		pane.style.position = 'absolute';
		pane.style.left = '0px';
		pane.style.top = '0px';

		pane.style.width = width;
		pane.style.height = height;
	}
	else
	{
		pane.style.position = 'relative';
	}
	
	return pane;
};

/**
 * Function: create
 *
 * Creates the DOM nodes for the VML display.
 */
mxGraphView.prototype.createVml = function()
{
	var container = this.graph.container;

	if (container != null)
	{
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		this.canvas = this.createVmlPane(width, height);
		
		this.backgroundPane = this.createVmlPane(width, height);
		this.drawPane = this.createVmlPane(width, height);
		this.overlayPane = this.createVmlPane(width, height);
		
		this.canvas.appendChild(this.backgroundPane);
		this.canvas.appendChild(this.drawPane);
		this.canvas.appendChild(this.overlayPane);
		
		container.appendChild(this.canvas);
	}
};

/**
 * Function: createVmlPane
 * 
 * Creates a drawing pane in VML (group).
 */
mxGraphView.prototype.createVmlPane = function(width, height)
{
	var pane = document.createElement('v:group');
	
	// At this point the width and height are potentially
	// uninitialized. That's OK.
	pane.style.position = 'absolute';
	pane.style.left = '0px';
	pane.style.top = '0px';

	pane.style.width = width+'px';
	pane.style.height = height+'px';

	pane.setAttribute('coordsize', width+','+height);
	pane.setAttribute('coordorigin', '0,0');
	
	return pane;
};

/**
 * Function: create
 *
 * Creates and returns the DOM nodes for the SVG display.
 */
mxGraphView.prototype.createSvg = function()
{
	var container = this.graph.container;
	this.canvas = document.createElementNS(mxConstants.NS_SVG, 'g');
	
	// For background image
	this.backgroundPane = document.createElementNS(mxConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.backgroundPane);

	// Adds two layers (background is early feature)
	this.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.drawPane);

	this.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.overlayPane);
	
	var root = document.createElementNS(mxConstants.NS_SVG, 'svg');
	root.style.width = '100%';
	root.style.height = '100%';
	
	if (mxClient.IS_IE)
	{
		root.style.marginBottom = '-4px';
	}

	root.appendChild(this.canvas);
	
	if (container != null)
	{
		container.appendChild(root);
		
		// Workaround for offset of container
		var style = mxUtils.getCurrentStyle(container);
		
		if (style.position == 'static')
		{
			container.style.position = 'relative';
		}
	}
};

/**
 * Function: destroy
 * 
 * Destroys the view and all its resources.
 */
mxGraphView.prototype.destroy = function()
{
	var root = (this.canvas != null) ? this.canvas.ownerSVGElement : null;
	
	if (root == null)
	{
		root = this.canvas;
	}
	
	if (root != null && root.parentNode != null)
	{
		this.clear(this.currentRoot, true);
		mxEvent.removeAllListeners(document);
		mxEvent.release(this.graph.container);
		root.parentNode.removeChild(root);
		
		this.canvas = null;
		this.backgroundPane = null;
		this.drawPane = null;
		this.overlayPane = null;
	}
};

/**
 * Class: mxCurrentRootChange
 *
 * Action to change the current root in a view.
 *
 * Constructor: mxCurrentRootChange
 *
 * Constructs a change of the current root in the given view.
 */
function mxCurrentRootChange(view, root)
{
	this.view = view;
	this.root = root;
	this.previous = root;
	this.isUp = root == null;
	
	if (!this.isUp)
	{
		var tmp = this.view.currentRoot;
		var model = this.view.graph.getModel();
		
		while (tmp != null)
		{
			if (tmp == root)
			{
				this.isUp = true;
				break;
			}
			
			tmp = model.getParent(tmp);
		}
	}
};

/**
 * Function: execute
 *
 * Changes the current root of the view.
 */
mxCurrentRootChange.prototype.execute = function()
{
	var tmp = this.view.currentRoot;
	this.view.currentRoot = this.previous;
	this.previous = tmp;

	var translate = this.view.graph.getTranslateForRoot(this.view.currentRoot);
	
	if (translate != null)
	{
		this.view.translate = new mxPoint(-translate.x, -translate.y);
	}
			
	var name = (this.isUp) ? mxEvent.UP : mxEvent.DOWN;
	this.view.fireEvent(new mxEventObject(name,
		'root', this.view.currentRoot, 'previous', this.previous));
	
	if (this.isUp)
	{
		this.view.clear(this.view.currentRoot, true);
		this.view.validate();
	}
	else
	{
		this.view.refresh();
	}
	
	this.isUp = !this.isUp;
};
