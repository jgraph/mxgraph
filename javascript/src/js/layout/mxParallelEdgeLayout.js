/**
 * $Id: mxParallelEdgeLayout.js,v 1.24 2012-03-27 15:03:34 david Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxParallelEdgeLayout
 * 
 * Extends <mxGraphLayout> for arranging parallel edges. This layout works
 * on edges for all pairs of vertices where there is more than one edge
 * connecting the latter.
 * 
 * Example:
 * 
 * (code)
 * var layout = new mxParallelEdgeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 * 
 * Constructor: mxCompactTreeLayout
 * 
 * Constructs a new fast organic layout for the specified graph.
 */
function mxParallelEdgeLayout(graph)
{
	mxGraphLayout.call(this, graph);
};

/**
 * Extends mxGraphLayout.
 */
mxParallelEdgeLayout.prototype = new mxGraphLayout();
mxParallelEdgeLayout.prototype.constructor = mxParallelEdgeLayout;

/**
 * Variable: spacing
 * 
 * Defines the spacing between the parallels. Default is 20.
 */
mxParallelEdgeLayout.prototype.spacing = 20;

/**
 * Function: execute
 * 
 * Implements <mxGraphLayout.execute>.
 */
mxParallelEdgeLayout.prototype.execute = function(parent)
{
	var lookup = this.findParallels(parent);
	
	this.graph.model.beginUpdate();	
	try
	{
		for (var i in lookup)
		{
			var parallels = lookup[i];

			if (parallels.length > 1)
			{
				this.layout(parallels);
			}
		}
	}
	finally
	{
		this.graph.model.endUpdate();
	}
};

/**
 * Function: findParallels
 * 
 * Finds the parallel edges in the given parent.
 */
mxParallelEdgeLayout.prototype.findParallels = function(parent)
{
	var model = this.graph.getModel();
	var lookup = [];
	var childCount = model.getChildCount(parent);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(parent, i);
		
		if (!this.isEdgeIgnored(child))
		{
			var id = this.getEdgeId(child);
			
			if (id != null)
			{
				if (lookup[id] == null)
				{
					lookup[id] = [];
				}
				
				lookup[id].push(child);
			}
		}
	}
	
	return lookup;
};

/**
 * Function: getEdgeId
 * 
 * Returns a unique ID for the given edge. The id is independent of the
 * edge direction and is built using the visible terminal of the given
 * edge.
 */
mxParallelEdgeLayout.prototype.getEdgeId = function(edge)
{
	var view = this.graph.getView();
	
	var state = view.getState(edge);
	
	var src = (state != null) ? state.getVisibleTerminal(true) : view.getVisibleTerminal(edge, true);
	var trg = (state != null) ? state.getVisibleTerminal(false) : view.getVisibleTerminal(edge, false);

	if (src != null && trg != null)
	{
		src = mxCellPath.create(src);
		trg = mxCellPath.create(trg);
		
		return (src > trg) ? trg+'-'+src : src+'-'+trg;
	}
	
	return null;
};

/**
 * Function: layout
 * 
 * Lays out the parallel edges in the given array.
 */
mxParallelEdgeLayout.prototype.layout = function(parallels)
{
	var edge = parallels[0];
	var model = this.graph.getModel();
	
	var src = model.getGeometry(model.getTerminal(edge, true));
	var trg = model.getGeometry(model.getTerminal(edge, false));
	
	// Routes multiple loops
	if (src == trg)
	{
		var x0 = src.x + src.width + this.spacing;
		var y0 = src.y + src.height / 2;

		for (var i = 0; i < parallels.length; i++)
		{
			this.route(parallels[i], x0, y0);
			x0 += this.spacing;
		}
	}
	else if (src != null && trg != null)
	{
		// Routes parallel edges
		var scx = src.x + src.width / 2;
		var scy = src.y + src.height / 2;
		
		var tcx = trg.x + trg.width / 2;
		var tcy = trg.y + trg.height / 2;
		
		var dx = tcx - scx;
		var dy = tcy - scy;

		var len = Math.sqrt(dx*dx+dy*dy);
		
		var x0 = scx + dx / 2;
		var y0 = scy + dy / 2;
		
		var nx = dy * this.spacing / len;
		var ny = dx * this.spacing / len;
		
		x0 += nx * (parallels.length - 1) / 2;
		y0 -= ny * (parallels.length - 1) / 2;

		for (var i = 0; i < parallels.length; i++)
		{
			this.route(parallels[i], x0, y0);
			x0 -= nx;
			y0 += ny;
		}
	}
};

/**
 * Function: route
 * 
 * Routes the given edge via the given point.
 */
mxParallelEdgeLayout.prototype.route = function(edge, x, y)
{
	if (this.graph.isCellMovable(edge))
	{
		this.setEdgePoints(edge, [new mxPoint(x, y)]);
	}
};
