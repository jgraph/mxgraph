/**
 * $Id: mxCellHighlight.js,v 1.24 2012-07-28 19:17:40 gaudenz Exp $
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

		// Updates the marker if the graph changes
		this.repaintHandler = mxUtils.bind(this, function()
		{
			this.repaint();
		});

		this.graph.getView().addListener(mxEvent.SCALE, this.repaintHandler);
		this.graph.getView().addListener(mxEvent.TRANSLATE, this.repaintHandler);
		this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.repaintHandler);
		this.graph.getModel().addListener(mxEvent.CHANGE, this.repaintHandler);
		
		// Hides the marker if the current root changes
		this.resetHandler = mxUtils.bind(this, function()
		{
			this.hide();
		});

		this.graph.getView().addListener(mxEvent.DOWN, this.resetHandler);
		this.graph.getView().addListener(mxEvent.UP, this.resetHandler);
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
			this.shape.node.strokecolor = color;
		}
	}
};

/**
 * Function: drawHighlight
 * 
 * Creates and returns the highlight shape for the given state.
 */
mxCellHighlight.prototype.drawHighlight = function()
{
	this.shape = this.createShape();
	this.repaint();

	if (!this.keepOnTop && this.shape.node.parentNode.firstChild != this.shape.node)
	{
		this.shape.node.parentNode.insertBefore(this.shape.node, this.shape.node.parentNode.firstChild);
	}

	// Workaround to force a repaint in AppleWebKit
	if (this.graph.model.isEdge(this.state.cell))
	{
		mxUtils.repaintGraph(this.graph, this.shape.points[0]);
	}
};

/**
 * Function: createShape
 * 
 * Creates and returns the highlight shape for the given state.
 */
mxCellHighlight.prototype.createShape = function()
{
	var shape = null;
	
	if (this.graph.model.isEdge(this.state.cell))
	{
		shape = new mxPolyline(this.state.absolutePoints,
			this.highlightColor, this.strokeWidth);
	}
	else
	{
		shape = new mxRectangleShape( new mxRectangle(),
			null, this.highlightColor, this.strokeWidth);
	}
	
	shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
			mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
	shape.init(this.graph.getView().getOverlayPane());
	mxEvent.redirectMouseEvents(shape.node, this.graph, this.state);
	
	return shape;
};


/**
 * Function: repaint
 * 
 * Updates the highlight after a change of the model or view.
 */
mxCellHighlight.prototype.repaint = function()
{
	if (this.state != null && this.shape != null)
	{
		if (this.graph.model.isEdge(this.state.cell))
		{
			this.shape.points = this.state.absolutePoints;
		}
		else
		{
			this.shape.bounds = new mxRectangle(this.state.x - this.spacing, this.state.y - this.spacing,
					this.state.width + 2 * this.spacing, this.state.height + 2 * this.spacing);
		}
		
		this.shape.redraw();

		// Uses cursor from shape in highlight
		if (this.state.shape != null)
		{
			this.shape.setCursor(this.state.shape.getCursor());
		}
	
		var alpha = (!this.graph.model.isEdge(this.state.cell)) ? Number(this.state.style[mxConstants.STYLE_ROTATION] || '0') : 0;
		
		// Event-transparency
		if (this.shape.dialect == mxConstants.DIALECT_SVG)
		{
			this.shape.node.setAttribute('style', 'pointer-events:none;');
	
			if (alpha != 0)
			{
				var cx = state.getCenterX();
				var cy = state.getCenterY();
				var transform = 'rotate(' + alpha + ' ' + cx + ' ' + cy + ')';
				
				this.shape.node.setAttribute('transform', transform);
			}
		}
		else
		{
			this.shape.node.style.background = '';
			
			if (alpha != 0)
			{
				this.shape.node.rotation = alpha;
			}
		}
	}
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

		this.state = state;
		
		if (this.state != null)
		{
			this.drawHighlight();
		}
	}
};

/**
 * Function: destroy
 * 
 * Destroys the handler and all its resources and DOM nodes.
 */
mxCellHighlight.prototype.destroy = function()
{
	this.graph.getView().removeListener(this.repaintHandler);
	this.graph.getModel().removeListener(this.repaintHandler);
	
	this.graph.getView().removeListener(this.resetHandler);
	this.graph.getModel().removeListener(this.resetHandler);
	
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
};
