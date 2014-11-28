/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
function mxEdgeSegmentHandler(state)
{
	mxEdgeHandler.call(this, state);
};

/**
 * Extends mxEdgeHandler.
 */
mxUtils.extend(mxEdgeSegmentHandler, mxEdgeHandler);

/**
 * Extends mxEdgeHandler.
 */
mxEdgeSegmentHandler.prototype = new mxElbowEdgeHandler();
mxEdgeSegmentHandler.prototype.constructor = mxEdgeSegmentHandler;

/**
 * Function: getCurrentPoints
 * 
 * Returns the current absolute points.
 */
mxEdgeSegmentHandler.prototype.getCurrentPoints = function()
{
	var pts = this.state.absolutePoints;
	
	if (pts != null)
	{
		// Special case for straight edge between routing centers with no
		// points in which case we add 2 segments and a middle handle
		if (pts.length == 2)
		{
			var cx = pts[0].x + (pts[1].x - pts[0].x) / 2;
			var cy = pts[0].y + (pts[1].y - pts[0].y) / 2;
			
			pts = [pts[0], new mxPoint(cx, cy), new mxPoint(cx, cy), pts[1]];
		}
	}
	
	return pts;
};

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
		var pts = this.getCurrentPoints();
		var last = pts[0].clone();
		this.convertPoint(last, false);
		point = point.clone();
		this.convertPoint(point, false);
		var result = [];

		for (var i = 1; i < pts.length; i++)
		{
			var pt = pts[i].clone();
			this.convertPoint(pt, false);
			
			if (i == this.index)
			{
				if (Math.round(last.x - pt.x) == 0 && Math.round(last.y - pt.y) == 0)
				{
					last.x = point.x;
					pt.x = point.x;
					last.y = point.y;
		 			pt.y = point.y;
				}
				else if (Math.round(last.x - pt.x) == 0)
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
		
		// Replaces single point that intersects with source or target
		if (result.length == 1)
		{
			var source = this.state.getVisibleTerminalState(true);
			var target = this.state.getVisibleTerminalState(false);
			var scale = this.state.view.getScale();
			var tr = this.state.view.getTranslate();
			
			var x = result[0].x * scale + tr.x;
			var y = result[0].y * scale + tr.y;
			
			if ((source != null && mxUtils.contains(source, x, y)) ||
				(target != null && mxUtils.contains(target, x, y)))
			{
				result = [point, point];
			}
		}

		return result;
	}
};

/**
 * Function: updatePreviewState
 * 
 * Overridden to perform optimization of the edge style result.
 */
mxEdgeSegmentHandler.prototype.updatePreviewState = function(edge, point, terminalState, me)
{
	mxEdgeHandler.prototype.updatePreviewState.apply(this, arguments);

	// Checks and corrects preview by running edge style again
	if (!this.isSource && !this.isTarget)
	{
		point = point.clone();
		this.convertPoint(point, false);
		var pts = edge.absolutePoints;
		var result = [];

		var pt0 = pts[0];
		var pt1 = pts[1];
		
		for (var i = 2; i < pts.length; i++)
		{
			var pt2 = pts[i];
		
			// Merges adjacent segments only if more than 2 to allow for straight edges
			if ((Math.round(pt0.x - pt1.x) != 0 || Math.round(pt1.x - pt2.x) != 0) &&
				(Math.round(pt0.y - pt1.y) != 0 || Math.round(pt1.y - pt2.y) != 0))
			{
				pt0 = pt1;
				pt1 = pt1.clone();
				this.convertPoint(pt1, false);
				result.push(pt1);
			}
			
			pt1 = pt2;
		}
		
		var source = this.state.getVisibleTerminalState(true);
		var target = this.state.getVisibleTerminalState(false);
		
		// A straight line is represented by 3 handles
		if (result.length == 0 && (Math.round(pts[0].x - pts[pts.length - 1].x) == 0 ||
			Math.round(pts[0].y - pts[pts.length - 1].y) == 0))
		{
			result = [point, point];
		}
		// Hack to handle transitions from straight vertical to routed
		else if (pts.length == 6 && result.length <= 2 && source != null && target != null)
		{
			var pts = this.state.absolutePoints;
			
			if (Math.round(pts[0].x - pts[pts.length - 1].x) == 0)
			{
				var view = this.graph.getView();
				var scale = view.getScale();
				var tr = view.getTranslate();
				
				var y0 = view.getRoutingCenterY(source) / scale - tr.y;
				
				// Use fixed connection point y-coordinate if one exists
				var sc = this.graph.getConnectionConstraint(edge, source, true);
				
				if (sc != null)
				{
					var pt = this.graph.getConnectionPoint(source, sc);
					
					if (pt != null)
					{
						this.convertPoint(pt, false);
						y0 = pt.y;
					}
				}
				
				var ye = view.getRoutingCenterY(target) / scale - tr.y;
				
				// Use fixed connection point y-coordinate if one exists
				var tc = this.graph.getConnectionConstraint(edge, target, false);
				
				if (tc)
				{
					var pt = this.graph.getConnectionPoint(target, tc);
					
					if (pt != null)
					{
						this.convertPoint(pt, false);
						ye = pt.y;
					}
				}
				
				result = [new mxPoint(point.x, y0), new mxPoint(point.x, ye)];
			}
		}

		this.points = result;

		// LATER: Check if points and result are different
		edge.view.updateFixedTerminalPoints(edge, source, target);
		edge.view.updatePoints(edge, this.points, source, target);
		edge.view.updateFloatingTerminalPoints(edge, source, target);
	}
};

/**
 * Function: getTooltipForNode
 * 
 * Returns no tooltips.
 */
mxEdgeSegmentHandler.prototype.getTooltipForNode = function(node)
{
	return null;
};

/**
 * Function: createBends
 * 
 * Adds custom bends for the center of each segment.
 */
mxEdgeSegmentHandler.prototype.start = function(x, y, index)
{
	mxEdgeHandler.prototype.start.apply(this, arguments);
	
	if (this.bends[index] != null && !this.isSource && !this.isTarget)
	{
		mxUtils.setOpacity(this.bends[index].node, 100);
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
	bend.setCursor(mxConstants.CURSOR_BEND_HANDLE);
	bends.push(bend);

	var pts = this.getCurrentPoints();

	// Waypoints (segment handles)
	if (this.graph.isCellBendable(this.state.cell))
	{
		if (this.points == null)
		{
			this.points = [];
		}

		for (var i = 0; i < pts.length - 1; i++)
		{
			bend = this.createVirtualBend();
			bends.push(bend);
			var horizontal = Math.round(pts[i].x - pts[i + 1].x) == 0;
			
			// Special case where dy is 0 as well
			if (Math.round(pts[i].y - pts[i + 1].y) == 0 && i < pts.length - 2)
			{
				horizontal = Math.round(pts[i].x - pts[i + 2].x) == 0;
			}
			
			bend.setCursor((horizontal) ? 'col-resize' : 'row-resize');
			this.points.push(new mxPoint(0,0));
		}
		
		// Special case where all three bends are in a orthogonal segment (straight line)
		if (pts.length == 4 && Math.round(pts[1].x - pts[2].x) == 0 && Math.round(pts[1].y - pts[2].y) == 0)
		{
			mxUtils.setOpacity(bends[1].node, 20);
			mxUtils.setOpacity(bends[3].node, 20);
		}
	}

	// Target
	var bend = this.createHandleShape(pts.length);
	this.initBend(bend);
	bend.setCursor(mxConstants.CURSOR_BEND_HANDLE);
	bends.push(bend);

	return bends;
};

/**
 * Function: redraw
 * 
 * Overridden to invoke <refresh> before the redraw.
 */
mxEdgeSegmentHandler.prototype.redraw = function()
{
	this.refresh();
	mxEdgeHandler.prototype.redraw.apply(this, arguments);
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
		var pts = this.getCurrentPoints();
		
		if (pts != null && pts.length > 1)
		{
			// Puts handle in the center of straight edges
			if (pts.length == 4 && Math.round(pts[1].x - pts[2].x) == 0 && Math.round(pts[1].y - pts[2].y) == 0)
			{
				if (Math.round(pts[0].y - pts[pts.length - 1].y) == 0)
				{
					var cx = pts[0].x + (pts[pts.length - 1].x - pts[0].x) / 2;
					pts[1] = new mxPoint(cx, pts[1].y);
					pts[2] = new mxPoint(cx, pts[2].y);
				}
				else
				{
					var cy = pts[0].y + (pts[pts.length - 1].y - pts[0].y) / 2;
					pts[1] = new mxPoint(pts[1].x, cy);
					pts[2] = new mxPoint(pts[2].x, cy);
				}
			}
			
			for (var i = 0; i < pts.length - 1; i++)
			{
				if (this.bends[i + 1] != null)
				{
		 			var p0 = pts[i];
	 				var pe = pts[i + 1];
			 		var pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
			 		var b = this.bends[i + 1].bounds;
			 		this.bends[i + 1].bounds = new mxRectangle(Math.round(pt.x - b.width / 2),
			 				Math.round(pt.y - b.height / 2), b.width, b.height);
				 	this.bends[i + 1].redraw();
				 	
				 	if (this.manageLabelHandle)
					{
						this.checkLabelHandle(this.bends[i + 1].bounds);
					}
				}
			}
		}
	}
};
