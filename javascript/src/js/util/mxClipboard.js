/**
 * $Id: mxClipboard.js,v 1.29 2010-01-02 09:45:14 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
var mxClipboard =
{
	/**
	 * Class: mxClipboard
	 * 
	 * Singleton that implements a clipboard for graph cells.
	 *
	 * Example:
	 * 
	 * (code)
	 * mxClipboard.copy(graph);
	 * mxClipboard.paste(graph2);
	 * (end)
	 *
	 * This copies the selection cells from the graph to the
	 * clipboard and pastes them into graph2.
	 * 
	 * For fine-grained control of the clipboard data the <mxGraph.canExportCell>
	 * and <mxGraph.canImportCell> functions can be overridden.
	 * 
	 * Variable: STEPSIZE
	 * 
	 * Defines the step size to offset the cells
	 * after each paste operation. Default is 10.
	 */
	STEPSIZE: 10,

	/**
	 * Variable: insertCount
	 * 
	 * Counts the number of times the clipboard data has been inserted.
	 */
	insertCount: 1,

	/**
	 * Variable: cells
	 * 
	 * Holds the array of <mxCells> currently in the clipboard.
	 */
	cells: null,
	
	/**
	 * Function: isEmpty
	 * 
	 * Returns true if the clipboard currently has not data stored.
	 */
	isEmpty: function()
	{
		return mxClipboard.cells == null;
	},

	/**
	 * Function: cut
	 * 
	 * Cuts the given array of <mxCells> from the specified graph.
	 * If cells is null then the selection cells of the graph will
	 * be used. Returns the cells that have been cut from the graph.
	 *
	 * Parameters:
	 * 
	 * graph - <mxGraph> that contains the cells to be cut.
	 * cells - Optional array of <mxCells> to be cut.
	 */
	cut: function(graph, cells)
	{
		cells = mxClipboard.copy(graph, cells);
		mxClipboard.insertCount = 0;
		mxClipboard.removeCells(graph, cells);
		
		return cells;
	},

	/**
	 * Function: removeCells
	 * 
	 * Hook to remove the given cells from the given graph after
	 * a cut operation.
	 *
	 * Parameters:
	 * 
	 * graph - <mxGraph> that contains the cells to be cut.
	 * cells - Array of <mxCells> to be cut.
	 */
	removeCells: function(graph, cells)
	{
		graph.removeCells(cells);
	},

	/**
	 * Function: copy
	 * 
	 * Copies the given array of <mxCells> from the specified
	 * graph to <cells>.Returns the original array of cells that has
	 * been cloned.
	 * 
	 * Parameters:
	 * 
	 * graph - <mxGraph> that contains the cells to be copied.
	 * cells - Optional array of <mxCells> to be copied.
	 */
	copy: function(graph, cells)
	{
		cells = cells || graph.getSelectionCells();
		var result = graph.getExportableCells(cells);
		mxClipboard.insertCount = 1;
		mxClipboard.cells = graph.cloneCells(result);

		return result;
	},

	/**
	 * Function: paste
	 * 
	 * Pastes the <cells> into the specified graph restoring
	 * the relation to <parents>, if possible. If the parents
	 * are no longer in the graph or invisible then the
	 * cells are added to the graph's default or into the
	 * swimlane under the cell's new location if one exists.
	 * The cells are added to the graph using <mxGraph.importCells>.
	 * 
	 * Parameters:
	 * 
	 * graph - <mxGraph> to paste the <cells> into.
	 */
	paste: function(graph)
	{
		if (mxClipboard.cells != null)
		{
			var cells = graph.getImportableCells(mxClipboard.cells);
			var delta = mxClipboard.insertCount * mxClipboard.STEPSIZE;
			var parent = graph.getDefaultParent();
			cells = graph.importCells(cells, delta, delta, parent);
			
			// Increments the counter and selects the inserted cells
			mxClipboard.insertCount++;
			graph.setSelectionCells(cells);
		}
	}

};
