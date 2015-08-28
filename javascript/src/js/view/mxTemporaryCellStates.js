/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxTemporaryCellStates
 *
 * Extends <mxPoint> to implement a 2-dimensional rectangle with double
 * precision coordinates.
 * 
 * Constructor: mxRectangle
 *
 * Constructs a new rectangle for the optional parameters. If no parameters
 * are given then the respective default values are used.
 */
function mxTemporaryCellStates(view, scale, cells, isCellVisibleFn)
{
	scale = (scale != null) ? scale : 1;
	this.view = view;
	
	// Stores the previous state
	this.oldValidateCellState = view.validateCellState;
	this.oldBounds = view.getGraphBounds();
	this.oldStates = view.getStates();
	this.oldScale = view.getScale();
	
	// Overrides validateCellState to ignore invisible cells
	var self = this;
	
	view.validateCellState = function(cell, resurse)
	{
		if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell))
		{
			return self.oldValidateCellState.apply(view, arguments);
		}
		
		return null;
	};
	
	// Creates space for new states
	view.setStates(new mxDictionary());
	view.setScale(scale);
	
	if (cells != null)
	{
		view.resetValidationState();
		var bbox = null;

		// Validates the vertices and edges without adding them to
		// the model so that the original cells are not modified
		for (var i = 0; i < cells.length; i++)
		{
			var bounds = view.getBoundingBox(view.validateCellState(view.validateCell(cells[i])));
			
			if (bbox == null)
			{
				bbox = bounds;
			}
			else
			{
				bbox.add(bounds);
			}
		}

		view.setGraphBounds(bbox || new mxRectangle());
	}
};

/**
 * Variable: view
 *
 * Holds the width of the rectangle. Default is 0.
 */
mxTemporaryCellStates.prototype.view = null;

/**
 * Variable: oldStates
 *
 * Holds the height of the rectangle. Default is 0.
 */
mxTemporaryCellStates.prototype.oldStates = null;

/**
 * Variable: oldBounds
 *
 * Holds the height of the rectangle. Default is 0.
 */
mxTemporaryCellStates.prototype.oldBounds = null;

/**
 * Variable: oldScale
 *
 * Holds the height of the rectangle. Default is 0.
 */
mxTemporaryCellStates.prototype.oldScale = null;

/**
 * Function: destroy
 * 
 * Returns the top, left corner as a new <mxPoint>.
 */
mxTemporaryCellStates.prototype.destroy = function()
{
	this.view.setScale(this.oldScale);
	this.view.setStates(this.oldStates);
	this.view.setGraphBounds(this.oldBounds);
	this.view.validateCellState = this.oldValidateCellState;
};
