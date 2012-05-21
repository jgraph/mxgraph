/**
 * $Id: mxEdgeSegmentHandler.js,v 1.13 2012-03-09 07:42:54 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
function mxEdgeSegmentHandler(state)
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
mxEdgeSegmentHandler.prototype = new mxElbowEdgeHandler();
mxEdgeSegmentHandler.prototype.constructor = mxEdgeSegmentHandler;

/**
 * Function: getPreviewPoints
 * 
 * Updates the given preview state taking into account the state of the constraint handler.
 */
mxEdgeSegmentHandler.prototype.getPreviewPoints = function(point)
{
	if (this.isSource || this.isTarget)
	{
		return mxElbowEdgeHandler.prototype.getPreviewPoints.apply(this, arguments);
	}
	else
	{
		this.convertPoint(point, false);
		var pts = this.state.absolutePoints;
		var last = pts[0].clone();
		this.convertPoint(last, false);
		var result = [];

		for (var i = 1; i < pts.length; i++)
		{
			var pt = pts[i].clone();
			this.convertPoint(pt, false);
			
			if (i == this.index)
			{
				if (last.x == pt.x)
		 		{
					last.x = point.x;
					pt.x = point.x;
		 		}
		 		else
		 		{
		 			last.y = point.y;
					pt.y = point.y;
		 		}
			}
			
			if (i < pts.length - 1)
			{
				result.push(pt);
			}
			
			last = pt;
		}
		
		if (result.length == 1)
		{
			var view = this.state.view;
			var source = this.state.getVisibleTerminalState(true);
			var target = this.state.getVisibleTerminalState(false);
			
			if (target != null & source != null)
			{
				if (mxUtils.contains(target, result[0].x, result[0].y))
				{
					if (pts[1].y == pts[2].y)
					{
						result[0].y = view.getRoutingCenterY(source);
					}
					else
					{
						result[0].x = view.getRoutingCenterX(source);
					}
				}
				else if (mxUtils.contains(source, result[0].x, result[0].y))
				{
					if (pts[1].y == pts[0].y)
					{
						result[0].y = view.getRoutingCenterY(target);
					}
					else
					{
						result[0].x = view.getRoutingCenterX(target);
					}
				}
			}
		}
		else if (result.length == 0)
		{
			result = [point];
		}

		return result;
	}
};

/**
 * Function: createBends
 * 
 * Adds custom bends for the center of each segment.
 */
mxEdgeSegmentHandler.prototype.createBends = function()
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

	var pts = this.state.absolutePoints;

	// Waypoints (segment handles)
	if (this.graph.isCellBendable(this.state.cell))
	{
		if (this.points == null)
		{
			this.points = [];
		}
		
		for (var i = 0; i < pts.length - 1; i++)
		{
			var bend = this.createVirtualBend();
			bends.push(bend);
			var horizontal = pts[i].x - pts[i + 1].x == 0;
			bend.node.style.cursor = (horizontal) ? 'col-resize' : 'row-resize';
			this.points.push(new mxPoint(0,0));
			
			if (mxClient.IS_TOUCH)
			{
				bend.node.setAttribute('pointer-events', 'none');
			}
		}
	}

	// Target
	var bend = this.createHandleShape(pts.length);

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
 * Function: redrawInnerBends
 * 
 * Updates the position of the custom bends.
 */
mxEdgeSegmentHandler.prototype.redrawInnerBends = function(p0, pe)
{
	if (this.graph.isCellBendable(this.state.cell))
	{
		var s = mxConstants.HANDLE_SIZE;
		var pts = this.state.absolutePoints;
		
		if (pts != null && pts.length > 1)
		{
			for (var i = 0; i < this.state.absolutePoints.length - 1; i++)
			{
				if (this.bends[i + 1] != null)
				{
		 			var p0 = pts[i];
	 				var pe = pts[i + 1];
			 		var pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
			 		this.bends[i+1].bounds = new mxRectangle(pt.x - s / 2, pt.y - s / 2, s, s);
				 	this.bends[i+1].reconfigure();
				 	this.bends[i+1].redraw();
				}
			}
		}
	}
};

/**
 * Function: connect
 * 
 * Calls <refresh> after <mxEdgeHandler.connect>.
 */
mxEdgeSegmentHandler.prototype.connect = function(edge, terminal, isSource, isClone, me)
{
	mxEdgeHandler.prototype.connect.apply(this, arguments);
	this.refresh();
};

/**
 * Function: changeTerminalPoint
 * 
 * Calls <refresh> after <mxEdgeHandler.changeTerminalPoint>.
 */
mxEdgeSegmentHandler.prototype.changeTerminalPoint = function(edge, point, isSource)
{
	mxEdgeHandler.prototype.changeTerminalPoint.apply(this, arguments);
	this.refresh();
};

/**
 * Function: changePoints
 * 
 * Changes the points of the given edge to reflect the current state of the handler.
 */
mxEdgeSegmentHandler.prototype.changePoints = function(edge, points)
{
	points = [];
	var pts = this.abspoints;
	
	if (pts.length > 1)
	{
		var pt0 = pts[0];
		var pt1 = pts[1];
		
		for (var i = 2; i < pts.length; i++)
		{
			var pt2 = pts[i];
			
			if ((Math.round(pt0.x) != Math.round(pt1.x) || 
					Math.round(pt1.x) != Math.round(pt2.x)) &&
				(Math.round(pt0.y) != Math.round(pt1.y) || 
						Math.round(pt1.y) != Math.round(pt2.y)))
			{
				pt0 = pt1;
				pt1 = pt1.clone();
				this.convertPoint(pt1, false);
				points.push(pt1);
			}
			
			pt1 = pt2;
		}
	}
	
	mxElbowEdgeHandler.prototype.changePoints.apply(this, arguments);
	this.refresh();
};

/**
 * Function: refresh
 * 
 * Refreshes the bends of this handler.
 */
mxEdgeSegmentHandler.prototype.refresh = function()
{
	if (this.bends != null)
	{
		for (var i = 0; i < this.bends.length; i++)
		{
			if (this.bends[i] != null)
			{
				this.bends[i].destroy();
				this.bends[i] = null;
			}
		}
		
		this.bends = this.createBends();
	}
};
