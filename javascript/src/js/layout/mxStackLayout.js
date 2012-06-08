/**
 * $Id: mxStackLayout.js,v 1.46 2011-12-01 15:21:17 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxStackLayout
 * 
 * Extends <mxGraphLayout> to create a horizontal or vertical stack of the
 * child vertices. The children do not need to be connected for this layout
 * to work.
 * 
 * Example:
 * 
 * (code)
 * var layout = new mxStackLayout(graph, true);
 * layout.execute(graph.getDefaultParent());
 * (end)
 * 
 * Constructor: mxStackLayout
 * 
 * Constructs a new stack layout layout for the specified graph,
 * spacing, orientation and offset.
 */
function mxStackLayout(graph, horizontal, spacing, x0, y0, border)
{
	mxGraphLayout.call(this, graph);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.spacing = (spacing != null) ? spacing : 0;
	this.x0 = (x0 != null) ? x0 : 0;
	this.y0 = (y0 != null) ? y0 : 0;
	this.border = (border != null) ? border : 0;
};

/**
 * Extends mxGraphLayout.
 */
mxStackLayout.prototype = new mxGraphLayout();
mxStackLayout.prototype.constructor = mxStackLayout;

/**
 * Variable: horizontal
 *
 * Specifies the orientation of the layout. Default is true.
 */
mxStackLayout.prototype.horizontal = null;

/**
 * Variable: spacing
 *
 * Specifies the spacing between the cells. Default is 0.
 */
mxStackLayout.prototype.spacing = null;

/**
 * Variable: x0
 *
 * Specifies the horizontal origin of the layout. Default is 0.
 */
mxStackLayout.prototype.x0 = null;

/**
 * Variable: y0
 *
 * Specifies the vertical origin of the layout. Default is 0.
 */
mxStackLayout.prototype.y0 = null;

/**
 * Variable: border
 *
 * Border to be added if fill is true. Default is 0.
 */
mxStackLayout.prototype.border = 0;

/**
 * Variable: keepFirstLocation
 * 
 * Boolean indicating if the location of the first cell should be
 * kept, that is, it will not be moved to x0 or y0.
 */
mxStackLayout.prototype.keepFirstLocation = false;

/**
 * Variable: fill
 * 
 * Boolean indicating if dimension should be changed to fill out the parent
 * cell. Default is false.
 */
mxStackLayout.prototype.fill = false;
	
/**
 * Variable: resizeParent
 * 
 * If the parent should be resized to match the width/height of the
 * stack. Default is false.
 */
mxStackLayout.prototype.resizeParent = false;

/**
 * Variable: resizeLast
 * 
 * If the last element should be resized to fill out the parent. Default is
 * false. If <resizeParent> is true then this is ignored.
 */
mxStackLayout.prototype.resizeLast = false;

/**
 * Variable: wrap
 * 
 * Value at which a new column or row should be created. Default is null.
 */
mxStackLayout.prototype.wrap = null;

/**
 * Function: isHorizontal
 * 
 * Returns <horizontal>.
 */
mxStackLayout.prototype.isHorizontal = function()
{
	return this.horizontal;
};

/**
 * Function: moveCell
 * 
 * Implements <mxGraphLayout.moveCell>.
 */
mxStackLayout.prototype.moveCell = function(cell, x, y)
{
	var model = this.graph.getModel();
	var parent = model.getParent(cell);
	var horizontal = this.isHorizontal();
	
	if (cell != null && parent != null)
	{
		var i = 0;
		var last = 0;
		var childCount = model.getChildCount(parent);
		var value = (horizontal) ? x : y;
		var pstate = this.graph.getView().getState(parent);

		if (pstate != null)
		{
			value -= (horizontal) ? pstate.x : pstate.y;
		}
		
		for (i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(parent, i);
			
			if (child != cell)
			{
				var bounds = model.getGeometry(child);
				
				if (bounds != null)
				{
					var tmp = (horizontal) ?
						bounds.x + bounds.width / 2 :
						bounds.y + bounds.height / 2;
					
					if (last < value && tmp > value)
					{
						break;
					}
					
					last = tmp;
				}
			}
		}

		// Changes child order in parent
		var idx = parent.getIndex(cell);
		idx = Math.max(0, i - ((i > idx) ? 1 : 0));

		model.add(parent, cell, idx);
	}
};

/**
 * Function: getParentSize
 * 
 * Returns the size for the parent container or the size of the graph
 * container if the parent is a layer or the root of the model.
 */
mxStackLayout.prototype.getParentSize = function(parent)
{
	var model = this.graph.getModel();			
	var pgeo = model.getGeometry(parent);
	
	// Handles special case where the parent is either a layer with no
	// geometry or the current root of the view in which case the size
	// of the graph's container will be used.
	if (this.graph.container != null && ((pgeo == null &&
		model.isLayer(parent)) || parent == this.graph.getView().currentRoot))
	{
		var width = this.graph.container.offsetWidth - 1;
		var height = this.graph.container.offsetHeight - 1;
		pgeo = new mxRectangle(0, 0, width, height);
	}
	
	return pgeo;
};

/**
 * Function: execute
 * 
 * Implements <mxGraphLayout.execute>.
 * 
 * Only children where <isVertexIgnored> returns false are taken into
 * account.
 */
mxStackLayout.prototype.execute = function(parent)
{
	if (parent != null)
	{
		var horizontal = this.isHorizontal();
		var model = this.graph.getModel();	
		var pgeo = this.getParentSize(parent);
					
		var fillValue = 0;
		
		if (pgeo != null)
		{
			fillValue = (horizontal) ? pgeo.height : pgeo.width;
		}
		
		fillValue -= 2 * this.spacing + 2 * this.border;

		// Handles swimlane start size
		var size = (this.graph.isSwimlane(parent)) ?
				this.graph.getStartSize(parent) :
				new mxRectangle();
		fillValue -= (horizontal) ? size.height : size.width;
		var x0 = this.x0 + size.width + this.border;
		var y0 = this.y0 + size.height + this.border;

		model.beginUpdate();
		try
		{
			var tmp = 0;
			var last = null;
			var childCount = model.getChildCount(parent);
			
			for (var i = 0; i < childCount; i++)
			{
				var child = model.getChildAt(parent, i);
				
				if (!this.isVertexIgnored(child) &&
					this.isVertexMovable(child))
				{
					var geo = model.getGeometry(child);
					
					if (geo != null)
					{
						geo = geo.clone();
						
						if (this.wrap != null &&
							last != null)
						{
							if ((horizontal && last.x + last.width +
								geo.width + 2 * this.spacing > this.wrap) ||
								(!horizontal && last.y + last.height +
								geo.height + 2 * this.spacing > this.wrap))
							{
								last = null;
								
								if (horizontal)
								{
									y0 += tmp + this.spacing;
								}
								else
								{
									x0 += tmp + this.spacing;
								}
								
								tmp = 0;
							}	
						}
						
						tmp = Math.max(tmp, (horizontal) ? geo.height : geo.width);
						
						if (last != null)
						{
							if (horizontal)
							{
								geo.x = last.x + last.width + this.spacing;
							}
							else
							{
								geo.y = last.y + last.height + this.spacing;
							}
						}
						else if (!this.keepFirstLocation)
						{
							if (horizontal)
							{
								geo.x = x0;
							}
							else
							{
								geo.y = y0;
							}
						}
						
						if (horizontal)
						{
							geo.y = y0;
						}
						else
						{
							geo.x = x0;
						}
						
						if (this.fill && fillValue > 0)
						{
							if (horizontal)
							{
								geo.height = fillValue;
							}
							else
							{
								geo.width = fillValue;									
							}
						}
						
						model.setGeometry(child, geo);
						last = geo;
					}
				}
			}
			
			if (this.resizeParent && pgeo != null && last != null &&
				!this.graph.isCellCollapsed(parent))
			{
				pgeo = pgeo.clone();
				
				if (horizontal)
				{
					pgeo.width = last.x + last.width + this.spacing;
				}
				else
				{
					pgeo.height = last.y + last.height + this.spacing;
				}
				
				model.setGeometry(parent, pgeo);					
			}
			else if (this.resizeLast && pgeo != null && last != null)
			{
				if (horizontal)
				{
					last.width = pgeo.width - last.x - this.spacing;
				}
				else
				{
					last.height = pgeo.height - last.y - this.spacing;
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};
