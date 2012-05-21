/**
 * $Id: mxCellStatePreview.js,v 1.5 2011-01-20 11:01:26 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 *
 * Class: mxCellStatePreview
 * 
 * Implements a live preview for moving cells.
 * 
 * Constructor: mxCellStatePreview
 * 
 * Constructs a move preview for the given graph.
 * 
 * Parameters:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 */
function mxCellStatePreview(graph)
{
	this.graph = graph;
	this.deltas = new Object();
};

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxCellStatePreview.prototype.graph = null;

/**
 * Variable: deltas
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxCellStatePreview.prototype.deltas = null;

/**
 * Variable: count
 * 
 * Contains the number of entries in the map.
 */
mxCellStatePreview.prototype.count = 0;

/**
 * Function: isEmpty
 * 
 * Returns true if this contains no entries.
 */
mxCellStatePreview.prototype.isEmpty = function()
{
	return this.count == 0;
};

/**
 * Function: moveState
 */
mxCellStatePreview.prototype.moveState = function(state, dx, dy, add, includeEdges)
{
	add = (add != null) ? add : true;
	includeEdges = (includeEdges != null) ? includeEdges : true;
	var id = mxCellPath.create(state.cell);
	var delta = this.deltas[id];

	if (delta == null)
	{
		delta = new mxPoint(dx, dy);
		this.deltas[id] = delta;
		this.count++;
	}
	else
	{
		if (add)
		{
			delta.X += dx;
			delta.Y += dy;
		}
		else
		{
			delta.X = dx;
			delta.Y = dy;
		}
	}
	
	if (includeEdges)
	{
		this.addEdges(state);
	}
	
	return delta;
};

/**
 * Function: show
 */
mxCellStatePreview.prototype.show = function(visitor)
{
	var model = this.graph.getModel();
	var root = model.getRoot();
	
	// Translates the states in step
	for (var id in this.deltas)
	{
		var cell = mxCellPath.resolve(root, id);
		var state = this.graph.view.getState(cell);
		var delta = this.deltas[id];
		var parentState = this.graph.view.getState(
			model.getParent(cell));
		this.translateState(parentState, state, delta.x, delta.y);
	}
	
	// Revalidates the states in step
	for (var id in this.deltas)
	{
		var cell = mxCellPath.resolve(root, id);
		var state = this.graph.view.getState(cell);
		var delta = this.deltas[id];
		var parentState = this.graph.view.getState(
			model.getParent(cell));
		this.revalidateState(parentState, state, delta.x, delta.y, visitor);
	}
};

/**
 * Function: translateState
 */
mxCellStatePreview.prototype.translateState = function(parentState, state, dx, dy)
{
	if (state != null)
	{
		var model = this.graph.getModel();
		
		if (model.isVertex(state.cell))
		{
			// LATER: Use hashtable to store initial state bounds
			state.invalid = true;
			this.graph.view.validateBounds(parentState, state.cell);
			var geo = model.getGeometry(state.cell);
			var id = mxCellPath.create(state.cell);
	
			// Moves selection cells and non-relative vertices in
			// the first phase so that edge terminal points will
			// be updated in the second phase
			if ((dx != 0 || dy != 0) && geo != null &&
				(!geo.relative || this.deltas[id] != null))
			{
				state.x += dx;
				state.y += dy;
			}
		}
	    
	    var childCount = model.getChildCount(state.cell);
	    
	    for (var i = 0; i < childCount; i++)
	    {
	    	this.translateState(state, this.graph.view.getState(
	    		model.getChildAt(state.cell, i)), dx, dy);
	    }
	}
};

/**
 * Function: revalidateState
 */
mxCellStatePreview.prototype.revalidateState = function(parentState, state, dx, dy, visitor)
{
	if (state != null)
	{
		// Updates the edge terminal points and restores the
		// (relative) positions of any (relative) children
		state.invalid = true;
		this.graph.view.validatePoints(parentState, state.cell);
	
		// Moves selection vertices which are relative
		var id = mxCellPath.create(state.cell);
		var model = this.graph.getModel();
		var geo = this.graph.getCellGeometry(state.cell);
		
		if ((dx != 0 || dy != 0) && geo != null && geo.relative &&
			model.isVertex(state.cell) && (parentState == null ||
			model.isVertex(parentState.cell) || this.deltas[id] != null))
		{
			state.x += dx;
			state.y += dy;
	
			this.graph.view.updateLabelBounds(state);
			this.graph.cellRenderer.redraw(state);
		}
	
		// Invokes the visitor on the given state
		if (visitor != null)
		{
			visitor(state);
		}
						
	    var childCount = model.getChildCount(state.cell);
	    
	    for (var i = 0; i < childCount; i++)
	    {
	    	this.revalidateState(state, this.graph.view.getState(model.getChildAt(
	    		state.cell, i)), dx, dy, visitor);
	    }
	}
};

/**
 * Function: addEdges
 */
mxCellStatePreview.prototype.addEdges = function(state)
{
	var model = this.graph.getModel();
	var edgeCount = model.getEdgeCount(state.cell);

	for (var i = 0; i < edgeCount; i++)
	{
		var s = this.graph.view.getState(model.getEdgeAt(state.cell, i));

		if (s != null)
		{
			this.moveState(s, 0, 0);
		}
	}
};
