/**
 * $Id: mxLayoutManager.js,v 1.21 2012-01-04 10:01:16 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxLayoutManager
 * 
 * Implements a layout manager that updates the layout for a given transaction.
 * 
 * Example:
 * 
 * (code)
 * var layoutMgr = new mxLayoutManager(graph);
 * layoutMgr.getLayout = function(cell)
 * {
 *   return layout;
 * };
 * (end)
 * 
 * Event: mxEvent.LAYOUT_CELLS
 * 
 * Fires between begin- and endUpdate after all cells have been layouted in
 * <layoutCells>. The <code>cells</code> property contains all cells that have
 * been passed to <layoutCells>.
 * 
 * Constructor: mxLayoutManager
 *
 * Constructs a new automatic layout for the given graph.
 *
 * Arguments:
 * 
 * graph - Reference to the enclosing graph. 
 */
function mxLayoutManager(graph)
{
	// Executes the layout before the changes are dispatched
	this.undoHandler = mxUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.beforeUndo(evt.getProperty('edit'));
		}
	});
	
	// Notifies the layout of a move operation inside a parent
	this.moveHandler = mxUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
		}
	});
	
	this.setGraph(graph);
};

/**
 * Extends mxEventSource.
 */
mxLayoutManager.prototype = new mxEventSource();
mxLayoutManager.prototype.constructor = mxLayoutManager;

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxLayoutManager.prototype.graph = null;

/**
 * Variable: bubbling
 * 
 * Specifies if the layout should bubble along
 * the cell hierarchy. Default is true.
 */
mxLayoutManager.prototype.bubbling = true;

/**
 * Variable: enabled
 * 
 * Specifies if event handling is enabled. Default is true.
 */
mxLayoutManager.prototype.enabled = true;

/**
 * Variable: updateHandler
 * 
 * Holds the function that handles the endUpdate event.
 */
mxLayoutManager.prototype.updateHandler = null;

/**
 * Variable: moveHandler
 * 
 * Holds the function that handles the move event.
 */
mxLayoutManager.prototype.moveHandler = null;

/**
 * Function: isEnabled
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxLayoutManager.prototype.isEnabled = function()
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
mxLayoutManager.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

/**
 * Function: isBubbling
 * 
 * Returns true if a layout should bubble, that is, if the parent layout
 * should be executed whenever a cell layout (layout of the children of
 * a cell) has been executed. This implementation returns <bubbling>.
 */
mxLayoutManager.prototype.isBubbling = function()
{
	return this.bubbling;
};

/**
 * Function: setBubbling
 * 
 * Sets <bubbling>.
 */
mxLayoutManager.prototype.setBubbling = function(value)
{
	this.bubbling = value;
};

/**
 * Function: getGraph
 * 
 * Returns the graph that this layout operates on.
 */
mxLayoutManager.prototype.getGraph = function()
{
	return this.graph;
};

/**
 * Function: setGraph
 * 
 * Sets the graph that the layouts operate on.
 */
mxLayoutManager.prototype.setGraph = function(graph)
{
	if (this.graph != null)
	{
		var model = this.graph.getModel();		
		model.removeListener(this.undoHandler);
		this.graph.removeListener(this.moveHandler);
	}
	
	this.graph = graph;
	
	if (this.graph != null)
	{
		var model = this.graph.getModel();	
		model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
		this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
	}
};

/**
 * Function: getLayout
 * 
 * Returns the layout to be executed for the given graph and parent.
 */
mxLayoutManager.prototype.getLayout = function(parent)
{
	return null;
};

/**
 * Function: beforeUndo
 * 
 * Called from the undoHandler.
 *
 * Parameters:
 * 
 * cell - Array of <mxCells> that have been moved.
 * evt - Mouse event that represents the mousedown.
 */
mxLayoutManager.prototype.beforeUndo = function(undoableEdit)
{
	var cells = this.getCellsForChanges(undoableEdit.changes);
	var model = this.getGraph().getModel();
	
	// Adds all parent ancestors
	if (this.isBubbling())
	{
		var tmp = model.getParents(cells);
		
		while (tmp.length > 0)
		{
			cells = cells.concat(tmp);
			tmp = model.getParents(tmp);
		}
	}
	
	this.layoutCells(mxUtils.sortCells(cells, false));
};

/**
 * Function: cellsMoved
 * 
 * Called from the moveHandler.
 *
 * Parameters:
 * 
 * cell - Array of <mxCells> that have been moved.
 * evt - Mouse event that represents the mousedown.
 */
mxLayoutManager.prototype.cellsMoved = function(cells, evt)
{
	if (cells != null &&
		evt != null)
	{
		var point = mxUtils.convertPoint(this.getGraph().container,
			mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		var model = this.getGraph().getModel();
		
		// Checks if a layout exists to take care of the moving
		for (var i = 0; i < cells.length; i++)
		{
			var layout = this.getLayout(model.getParent(cells[i]));

			if (layout != null)
			{
				layout.moveCell(cells[i], point.x, point.y);
			}
		}
	}
};

/**
 * Function: getCellsForEdit
 * 
 * Returns the cells to be layouted for the given sequence of changes.
 */
mxLayoutManager.prototype.getCellsForChanges = function(changes)
{
	var result = [];
	var hash = new Object();
	
	for (var i = 0; i < changes.length; i++)
	{
		var change = changes[i];
		
		if (change instanceof mxRootChange)
		{
			return [];
		}
		else
		{
			var cells = this.getCellsForChange(change);
			
			for (var j = 0; j < cells.length; j++)
			{
				if (cells[j] != null)
				{
					var id = mxCellPath.create(cells[j]);
					
					if (hash[id] == null)
					{
						hash[id] = cells[j];
						result.push(cells[j]);
					}
				}
			}
		}
	}
	
	return result;
};

/**
 * Function: getCellsForChange
 * 
 * Executes all layouts which have been scheduled during the
 * changes.
 */
mxLayoutManager.prototype.getCellsForChange = function(change)
{
	var model = this.getGraph().getModel();
	
	if (change instanceof mxChildChange)
	{
		return [change.child, change.previous, model.getParent(change.child)];
	}
	else if (change instanceof mxTerminalChange ||
			change instanceof mxGeometryChange)
	{
		return [change.cell, model.getParent(change.cell)];
	}
	
	return [];
};

/**
 * Function: layoutCells
 * 
 * Executes all layouts which have been scheduled during the
 * changes.
 */
mxLayoutManager.prototype.layoutCells = function(cells)
{
	if (cells.length > 0)
	{
		// Invokes the layouts while removing duplicates
		var model = this.getGraph().getModel();
		
		model.beginUpdate();
		try 
		{
			var last = null;
			
			for (var i = 0; i < cells.length; i++)
			{
				if (cells[i] != model.getRoot() &&
					cells[i] != last)
				{
					last = cells[i];
					this.executeLayout(this.getLayout(last), last);
				}
			}
			
			this.fireEvent(new mxEventObject(mxEvent.LAYOUT_CELLS, 'cells', cells));
		}
		finally
		{
			model.endUpdate();
		}
	}
};

/**
 * Function: executeLayout
 * 
 * Executes the given layout on the given parent.
 */
mxLayoutManager.prototype.executeLayout = function(layout, parent)
{
	if (layout != null && parent != null)
	{
		layout.execute(parent);
	}
};

/**
 * Function: destroy
 * 
 * Removes all handlers from the <graph> and deletes the reference to it.
 */
mxLayoutManager.prototype.destroy = function()
{
	this.setGraph(null);
};
