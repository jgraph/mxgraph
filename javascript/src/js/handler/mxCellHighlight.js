/**
 * $Id: mxCellHighlight.js,v 1.21 2012-03-19 10:47:08 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxCellHighlight
 * 
 * A helper class to highlight cells. Here is an example for a given cell.
 * 
 * (code)
 * var highlight = new mxCellHighlight(graph, '#ff0000', 2);
 * highlight.highlight(graph.view.getState(cell)));
 * (end)
 * 
 * Constructor: mxCellHighlight
 * 
 * Constructs a cell highlight.
 */
function mxCellHighlight(graph, highlightColor, strokeWidth)
{
	if (graph != null)
	{
		this.graph = graph;
		this.highlightColor = (highlightColor != null) ? highlightColor : mxConstants.DEFAULT_VALID_COLOR;
		this.strokeWidth = (strokeWidth != null) ? strokeWidth : mxConstants.HIGHLIGHT_STROKEWIDTH;

		// Hides the marker if the graph changes
		this.resetHandler = mxUtils.bind(this, function(sender)
		{
			this.hide();
		});

		this.graph.getView().addListener(mxEvent.SCALE, this.resetHandler);
		this.graph.getView().addListener(mxEvent.TRANSLATE, this.resetHandler);
		this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.resetHandler);
		this.graph.getView().addListener(mxEvent.DOWN, this.resetHandler);
		this.graph.getView().addListener(mxEvent.UP, this.resetHandler);
		this.graph.getModel().addListener(mxEvent.CHANGE, this.resetHandler);
	}
};

/**
 * Variable: keepOnTop
 * 
 * Specifies if the highlights should appear on top of everything
 * else in the overlay pane. Default is false.
 */
mxCellHighlight.prototype.keepOnTop = false;

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxCellHighlight.prototype.graph = true;

/**
 * Variable: state
 * 
 * Reference to the <mxCellState>.
 */
mxCellHighlight.prototype.state = null;

/**
 * Variable: spacing
 * 
 * Specifies the spacing between the highlight for vertices and the vertex.
 * Default is 2.
 */
mxCellHighlight.prototype.spacing = 2;

/**
 * Variable: resetHandler
 * 
 * Holds the handler that automatically invokes reset if the highlight
 * should be hidden.
 */
mxCellHighlight.prototype.resetHandler = null;

/**
 * Function: setHighlightColor
 * 
 * Sets the color of the rectangle used to highlight drop targets.
 * 
 * Parameters:
 * 
 * color - String that represents the new highlight color.
 */
mxCellHighlight.prototype.setHighlightColor = function(color)
{
	this.highlightColor = color;
	
	if (this.shape != null)
	{
		if (this.shape.dialect == mxConstants.DIALECT_SVG)
		{
			this.shape.innerNode.setAttribute('stroke', color);
		}
		else if (this.shape.dialect == mxConstants.DIALECT_VML)
		{
			this.shape.node.setAttribute('strokecolor', color);
		}
	}
};

/**
 * Function: drawHighlight
 * 
 * Creates and returns the highlight shape for the given state.
 */
mxCellHighlight.prototype.drawHighlight = function(state)
{
	var shape = this.createShape(state);
	shape.redraw();

	if (!this.keepOnTop && shape.node.parentNode.firstChild != shape.node)
	{
		shape.node.parentNode.insertBefore(shape.node, shape.node.parentNode.firstChild);
	}

	// Workaround to force a repaint in AppleWebKit
	if (this.graph.model.isEdge(state.cell))
	{
		mxUtils.repaintGraph(this.graph, shape.points[0]);
	}
	
	return shape;
};

/**
 * Function: createShape
 * 
 * Creates and returns the highlight shape for the given state.
 */
mxCellHighlight.prototype.createShape = function(state)
{
	var shape = null;
	
	if (this.graph.model.isEdge(state.cell))
	{
		shape = new mxPolyline(state.absolutePoints,
			this.highlightColor, this.strokeWidth);
	}
	else
	{
		shape = new mxRectangleShape(
			new mxRectangle(state.x - this.spacing, state.y - this.spacing,
				state.width + 2 * this.spacing, state.height + 2 * this.spacing),
			null, this.highlightColor, this.strokeWidth);
	}
	
	shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
			mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
	shape.init(this.graph.getView().getOverlayPane());
	mxEvent.redirectMouseEvents(shape.node, this.graph, state);
	
	// Uses cursor from shape in highlight
	if (state.shape != null)
	{
		shape.setCursor(state.shape.getCursor());
	}
	
	// Event-transparency
	if (shape.dialect == mxConstants.DIALECT_SVG)
	{
		shape.node.setAttribute('style', 'pointer-events:none;');
	}
	else
	{
		shape.node.style.background = '';
	}
	
	return shape;
};

/**
 * Function: hide
 * 
 * Resets the state of the cell marker.
 */
mxCellHighlight.prototype.hide = function()
{
	this.highlight(null);
};

/**
 * Function: mark
 * 
 * Marks the <markedState> and fires a <mark> event.
 */
mxCellHighlight.prototype.highlight = function(state)
{
	if (this.state != state)
	{
		if (this.shape != null)
		{
			this.shape.destroy();
			this.shape = null;
		}

		if (state != null)
		{
			this.shape = this.drawHighlight(state);
		}

		this.state = state;
	}
};

/**
 * Function: destroy
 * 
 * Destroys the handler and all its resources and DOM nodes.
 */
mxCellHighlight.prototype.destroy = function()
{
	this.graph.getView().removeListener(this.resetHandler);
	this.graph.getModel().removeListener(this.resetHandler);
	
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
};
