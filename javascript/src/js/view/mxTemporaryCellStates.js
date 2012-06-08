/**
 * $Id: mxTemporaryCellStates.js,v 1.10 2010-04-20 14:43:12 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
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
function mxTemporaryCellStates(view, scale, cells)
{
	this.view = view;
	scale = (scale != null) ? scale : 1;
	
	// Stores the previous state
	this.oldBounds = view.getGraphBounds();
	this.oldStates = view.getStates();
	this.oldScale = view.getScale();
	
	// Creates space for new states
	view.setStates(new mxDictionary());
	view.setScale(scale);
	
	if (cells != null)
	{
		// Creates virtual parent state for validation
		var state = view.createState(new mxCell());

		// Validates the vertices and edges without adding them to
		// the model so that the original cells are not modified
		for (var i = 0; i < cells.length; i++)
		{
			view.validateBounds(state, cells[i]);
		}
		
		var bbox = null;
		
		for (var i = 0; i < cells.length; i++)
		{
			var bounds = view.validatePoints(state, cells[i]);
			
			if (bbox == null)
			{
				bbox = bounds;
			}
			else
			{
				bbox.add(bounds);
			}
		}
		
		if (bbox == null)
		{
			bbox = new mxRectangle();
		}
		
		view.setGraphBounds(bbox);
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
};
