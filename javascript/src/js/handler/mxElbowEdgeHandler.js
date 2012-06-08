/**
 * $Id: mxElbowEdgeHandler.js,v 1.43 2012-01-06 13:06:01 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxElbowEdgeHandler
 *
 * Graph event handler that reconnects edges and modifies control points and
 * the edge label location. Uses <mxTerminalMarker> for finding and
 * highlighting new source and target vertices. This handler is automatically
 * created in <mxGraph.createHandler>. It extends <mxEdgeHandler>.
 * 
 * Constructor: mxEdgeHandler
 *
 * Constructs an edge handler for the specified <mxCellState>.
 * 
 * Parameters:
 * 
 * state - <mxCellState> of the cell to be modified.
 */
function mxElbowEdgeHandler(state)
{
	if (state != null)
	{
		this.state = state;
		this.init();
	}
};

/**
 * Extends mxEdgeHandler.
 */
mxElbowEdgeHandler.prototype = new mxEdgeHandler();
mxElbowEdgeHandler.prototype.constructor = mxElbowEdgeHandler;

/**
 * Specifies if a double click on the middle handle should call
 * <mxGraph.flipEdge>. Default is true.
 */
mxElbowEdgeHandler.prototype.flipEnabled = true;

/**
 * Variable: doubleClickOrientationResource
 * 
 * Specifies the resource key for the tooltip to be displayed on the single
 * control point for routed edges. If the resource for this key does not
 * exist then the value is used as the error message. Default is
 * 'doubleClickOrientation'.
 */
mxElbowEdgeHandler.prototype.doubleClickOrientationResource =
	(mxClient.language != 'none') ? 'doubleClickOrientation' : '';

/**
 * Function: createBends
 * 
 * Overrides <mxEdgeHandler.createBends> to create custom bends.
 */
 mxElbowEdgeHandler.prototype.createBends = function()
 {
	var bends = [];
	
	// Source
	var bend = this.createHandleShape(0);

	this.initBend(bend);
	bend.node.style.cursor = mxConstants.CURSOR_BEND_HANDLE;
	mxEvent.redirectMouseEvents(bend.node, this.graph, this.state);
	bends.push(bend);
	
	if (mxClient.IS_TOUCH)
	{
		bend.node.setAttribute('pointer-events', 'none');
	}

	// Virtual
	bends.push(this.createVirtualBend());
	this.points.push(new mxPoint(0,0));

	// Target
	bend = this.createHandleShape(2);

	this.initBend(bend);
	bend.node.style.cursor = mxConstants.CURSOR_BEND_HANDLE;
	mxEvent.redirectMouseEvents(bend.node, this.graph, this.state);
	bends.push(bend);

	if (mxClient.IS_TOUCH)
	{
		bend.node.setAttribute('pointer-events', 'none');
	}
	
	return bends;
 };

/**
 * Function: createVirtualBend
 * 
 * Creates a virtual bend that supports double clicking and calls
 * <mxGraph.flipEdge>.
 */
mxElbowEdgeHandler.prototype.createVirtualBend = function()
{
	var bend = this.createHandleShape();
	this.initBend(bend);

	var crs = this.getCursorForBend();
	bend.node.style.cursor = crs;
	
	// Double-click changes edge style
	var dblClick = mxUtils.bind(this, function(evt)
	{
		if (!mxEvent.isConsumed(evt) &&
			this.flipEnabled)
		{
			this.graph.flipEdge(this.state.cell, evt);
			mxEvent.consume(evt);
		}
	});
	
	mxEvent.redirectMouseEvents(bend.node, this.graph, this.state,
		null, null, null, dblClick);
	
	if (!this.graph.isCellBendable(this.state.cell))
	{
		bend.node.style.visibility = 'hidden';
	}

	return bend;
};

/**
 * Function: getCursorForBend
 * 
 * Returns the cursor to be used for the bend.
 */
mxElbowEdgeHandler.prototype.getCursorForBend = function()
{
	return (this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.TopToBottom ||
		this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_TOPTOBOTTOM ||
		((this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.ElbowConnector ||
		this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_ELBOW)&&
		this.state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL)) ? 
		'row-resize' : 'col-resize';
};

/**
 * Function: getTooltipForNode
 * 
 * Returns the tooltip for the given node.
 */
mxElbowEdgeHandler.prototype.getTooltipForNode = function(node)
{
	var tip = null;
	
	if (this.bends != null &&
		this.bends[1] != null &&
		(node == this.bends[1].node ||
		node.parentNode == this.bends[1].node))
	{
		tip = this.doubleClickOrientationResource;
		tip = mxResources.get(tip) || tip; // translate
	}

	return tip;
};

/**
 * Function: convertPoint
 * 
 * Converts the given point in-place from screen to unscaled, untranslated
 * graph coordinates and applies the grid.
 * 
 * Parameters:
 * 
 * point - <mxPoint> to be converted.
 * gridEnabled - Boolean that specifies if the grid should be applied.
 */
mxElbowEdgeHandler.prototype.convertPoint = function(point, gridEnabled)
{
	var scale = this.graph.getView().getScale();
	var tr = this.graph.getView().getTranslate();
	var origin = this.state.origin;
	
	if (gridEnabled)
	{
		point.x = this.graph.snap(point.x);
		point.y = this.graph.snap(point.y);
	}
	
	point.x = Math.round(point.x / scale - tr.x - origin.x);
	point.y = Math.round(point.y / scale - tr.y - origin.y);
};

/**
 * Function: redrawInnerBends
 * 
 * Updates and redraws the inner bends.
 * 
 * Parameters:
 * 
 * p0 - <mxPoint> that represents the location of the first point.
 * pe - <mxPoint> that represents the location of the last point.
 */
mxElbowEdgeHandler.prototype.redrawInnerBends = function(p0, pe)
{
	var g = this.graph.getModel().getGeometry(this.state.cell);
	var pts = g.points;

	var pt = (pts != null) ? pts[0] : null;
	
	if (pt == null)
	{
		pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
	}
	else
	{
		pt = new mxPoint(this.graph.getView().scale*(pt.x +
				 this.graph.getView().translate.x + this.state.origin.x),
				 this.graph.getView().scale*(pt.y + this.graph.getView().translate.y +
								 this.state.origin.y));
	}

	// Makes handle slightly bigger if the yellow  label handle
	// exists and intersects this green handle
	var b = this.bends[1].bounds;
	var w = b.width;
	var h = b.height;

	if (this.handleImage == null)
	{
		w = mxConstants.HANDLE_SIZE;
		h = mxConstants.HANDLE_SIZE;
	}
	
	var bounds = new mxRectangle(pt.x - w / 2, pt.y - h / 2, w, h);

	if (this.handleImage == null && this.labelShape.node.style.visibility != 'hidden' &&
		mxUtils.intersects(bounds, this.labelShape.bounds))
	{
		w += 3;
		h += 3;
		bounds = new mxRectangle(pt.x - w / 2, pt.y - h / 2, w, h);
	}
	
	this.bends[1].bounds = bounds; 
	this.bends[1].reconfigure();
	this.bends[1].redraw();
};
