/**
 * $Id: mxSpaceManager.js,v 1.9 2010-01-02 09:45:15 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxSpaceManager
 * 
 * In charge of moving cells after a resize.
 * 
 * Constructor: mxSpaceManager
 *
 * Constructs a new automatic layout for the given graph.
 *
 * Arguments:
 * 
 * graph - Reference to the enclosing graph. 
 */
function mxSpaceManager(graph, shiftRightwards, shiftDownwards, extendParents)
{
	this.resizeHandler = mxUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.cellsResized(evt.getProperty('cells'));
		}
	});

	this.foldHandler = mxUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.cellsResized(evt.getProperty('cells'));
		}
	});
	
	this.shiftRightwards = (shiftRightwards != null) ? shiftRightwards : true;
	this.shiftDownwards = (shiftDownwards != null) ? shiftDownwards : true;
	this.extendParents = (extendParents != null) ? extendParents : true;
	this.setGraph(graph);
};

/**
 * Extends mxEventSource.
 */
mxSpaceManager.prototype = new mxEventSource();
mxSpaceManager.prototype.constructor = mxSpaceManager;

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxSpaceManager.prototype.graph = null;

/**
 * Variable: enabled
 * 
 * Specifies if event handling is enabled. Default is true.
 */
mxSpaceManager.prototype.enabled = true;

/**
 * Variable: shiftRightwards
 * 
 * Specifies if event handling is enabled. Default is true.
 */
mxSpaceManager.prototype.shiftRightwards = true;

/**
 * Variable: shiftDownwards
 * 
 * Specifies if event handling is enabled. Default is true.
 */
mxSpaceManager.prototype.shiftDownwards = true;

/**
 * Variable: extendParents
 * 
 * Specifies if event handling is enabled. Default is true.
 */
mxSpaceManager.prototype.extendParents = true;

/**
 * Variable: resizeHandler
 * 
 * Holds the function that handles the move event.
 */
mxSpaceManager.prototype.resizeHandler = null;

/**
 * Variable: foldHandler
 * 
 * Holds the function that handles the fold event.
 */
mxSpaceManager.prototype.foldHandler = null;

/**
 * Function: isCellIgnored
 * 
 * Sets the graph that the layouts operate on.
 */
mxSpaceManager.prototype.isCellIgnored = function(cell)
{
	return !this.getGraph().getModel().isVertex(cell);
};

/**
 * Function: isCellShiftable
 * 
 * Sets the graph that the layouts operate on.
 */
mxSpaceManager.prototype.isCellShiftable = function(cell)
{
	return this.getGraph().getModel().isVertex(cell) &&
		this.getGraph().isCellMovable(cell);
};

/**
 * Function: isEnabled
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxSpaceManager.prototype.isEnabled = function()
{
	return this.enabled;
};

/**
 * Function: setEnabled
 * 
 * Enables or disables event handling. This implementation
 * updates <enabled>.
 * 
 * Parameters:
 * 
 * enabled - Boolean that specifies the new enabled state.
 */
mxSpaceManager.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

/**
 * Function: isShiftRightwards
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxSpaceManager.prototype.isShiftRightwards = function()
{
	return this.shiftRightwards;
};

/**
 * Function: setShiftRightwards
 * 
 * Enables or disables event handling. This implementation
 * updates <enabled>.
 * 
 * Parameters:
 * 
 * enabled - Boolean that specifies the new enabled state.
 */
mxSpaceManager.prototype.setShiftRightwards = function(value)
{
	this.shiftRightwards = value;
};

/**
 * Function: isShiftDownwards
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxSpaceManager.prototype.isShiftDownwards = function()
{
	return this.shiftDownwards;
};

/**
 * Function: setShiftDownwards
 * 
 * Enables or disables event handling. This implementation
 * updates <enabled>.
 * 
 * Parameters:
 * 
 * enabled - Boolean that specifies the new enabled state.
 */
mxSpaceManager.prototype.setShiftDownwards = function(value)
{
	this.shiftDownwards = value;
};

/**
 * Function: isExtendParents
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxSpaceManager.prototype.isExtendParents = function()
{
	return this.extendParents;
};

/**
 * Function: setShiftDownwards
 * 
 * Enables or disables event handling. This implementation
 * updates <enabled>.
 * 
 * Parameters:
 * 
 * enabled - Boolean that specifies the new enabled state.
 */
mxSpaceManager.prototype.setExtendParents = function(value)
{
	this.extendParents = value;
};

/**
 * Function: getGraph
 * 
 * Returns the graph that this layout operates on.
 */
mxSpaceManager.prototype.getGraph = function()
{
	return this.graph;
};

/**
 * Function: setGraph
 * 
 * Sets the graph that the layouts operate on.
 */
mxSpaceManager.prototype.setGraph = function(graph)
{
	if (this.graph != null)
	{
		this.graph.removeListener(this.resizeHandler);
		this.graph.removeListener(this.foldHandler);
	}
	
	this.graph = graph;
	
	if (this.graph != null)
	{
		this.graph.addListener(mxEvent.RESIZE_CELLS, this.resizeHandler);
		this.graph.addListener(mxEvent.FOLD_CELLS, this.foldHandler);
	}
};

/**
 * Function: cellsResized
 * 
 * Called from <moveCellsIntoParent> to invoke the <move> hook in the
 * automatic layout of each modified cell's parent. The event is used to
 * define the x- and y-coordinates passed to the move function.
 * 
 * Parameters:
 * 
 * cell - Array of <mxCells> that have been resized.
 */
mxSpaceManager.prototype.cellsResized = function(cells)
{
	if (cells != null)
	{
		var model = this.graph.getModel();
		
		// Raising the update level should not be required
		// since only one call is made below
		model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				if (!this.isCellIgnored(cells[i]))
				{
					this.cellResized(cells[i]);
					break;
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

/**
 * Function: cellResized
 * 
 * Called from <moveCellsIntoParent> to invoke the <move> hook in the
 * automatic layout of each modified cell's parent. The event is used to
 * define the x- and y-coordinates passed to the move function.
 * 
 * Parameters:
 * 
 * cell - <mxCell> that has been resized.
 */
mxSpaceManager.prototype.cellResized = function(cell)
{
	var graph = this.getGraph();
	var view = graph.getView();
	var model = graph.getModel();
	
	var state = view.getState(cell);
	var pstate = view.getState(model.getParent(cell));

	if (state != null &&
		pstate != null)
	{
		var cells = this.getCellsToShift(state);
		var geo = model.getGeometry(cell);
		
		if (cells != null &&
			geo != null)
		{
			var tr = view.translate;
			var scale = view.scale;
			
			var x0 = state.x - pstate.origin.x - tr.x * scale;
			var y0 = state.y - pstate.origin.y - tr.y * scale;
			var right = state.x + state.width;
			var bottom = state.y + state.height;
			
			var dx = state.width - geo.width * scale + x0 - geo.x * scale;
			var dy = state.height - geo.height * scale + y0 - geo.y * scale;
				
			var fx = 1 - geo.width * scale / state.width;
			var fy = 1 - geo.height * scale / state.height;
			
			model.beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					if (cells[i] != cell &&
						this.isCellShiftable(cells[i]))
					{
						this.shiftCell(cells[i], dx, dy, x0, y0, right, bottom, fx, fy,
								this.isExtendParents() &&
								graph.isExtendParent(cells[i]));
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
		}
	}
};

/**
 * Function: shiftCell
 * 
 * Called from <moveCellsIntoParent> to invoke the <move> hook in the
 * automatic layout of each modified cell's parent. The event is used to
 * define the x- and y-coordinates passed to the move function.
 * 
 * Parameters:
 * 
 * cell - Array of <mxCells> that have been moved.
 * evt - Mouse event that represents the mousedown.
 */
mxSpaceManager.prototype.shiftCell = function(cell, dx, dy, Ox0, y0, right,
		bottom, fx, fy, extendParent)
{
	var graph = this.getGraph();
	var state = graph.getView().getState(cell);
	
	if (state != null)
	{
		var model = graph.getModel();
		var geo = model.getGeometry(cell);
		
		if (geo != null)
		{
			model.beginUpdate();
			try
			{
				if (this.isShiftRightwards())
				{
					if (state.x >= right)
					{
						geo = geo.clone();
						geo.translate(-dx, 0);
					}
					else
					{
						var tmpDx = Math.max(0, state.x - x0);
						geo = geo.clone();
						geo.translate(-fx * tmpDx, 0);
					}
				}
				
				if (this.isShiftDownwards())
				{
					if (state.y >= bottom)
					{
						geo = geo.clone();
						geo.translate(0, -dy);
					}
					else
					{
						var tmpDy = Math.max(0, state.y - y0);
						geo = geo.clone();
						geo.translate(0, -fy * tmpDy);
					}
				}
				
				if (geo != model.getGeometry(cell))
				{
					model.setGeometry(cell, geo);
					
					// Parent size might need to be updated if this
					// is seen as part of the resize
					if (extendParent)
					{
						graph.extendParent(cell);
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
		}
	}
};

/**
 * Function: getCellsToShift
 * 
 * Returns the cells to shift after a resize of the
 * specified <mxCellState>.
 */
mxSpaceManager.prototype.getCellsToShift = function(state)
{
	var graph = this.getGraph();
	var parent = graph.getModel().getParent(state.cell);
	var down = this.isShiftDownwards();
	var right = this.isShiftRightwards();
	
	return graph.getCellsBeyond(state.x + ((down) ? 0 : state.width),
		state.y + ((down && right) ? 0 : state.height), parent, right, down);
};

/**
 * Function: destroy
 * 
 * Removes all handlers from the <graph> and deletes the reference to it.
 */
mxSpaceManager.prototype.destroy = function()
{
	this.setGraph(null);
};
