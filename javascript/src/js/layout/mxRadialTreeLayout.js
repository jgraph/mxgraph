/**
 * $Id: mxRadialTreeLayout.js$
 * Copyright (c) 2006-2014, JGraph Ltd
 */
/**
 * Class: mxRadialTreeLayout
 * 
 * Extends <mxGraphLayout> to implement a radial tree algorithm. This
 * layout is suitable for graphs that have no cycles (trees). Vertices that are
 * not connected to the tree will be ignored by this layout.
 * 
 * Example:
 * 
 * (code)
 * var layout = new mxRadialTreeLayout(graph);
 * layout.execute(graph.getDefaultParent());
 * (end)
 * 
 * Constructor: mxRadialTreeLayout
 * 
 * Constructs a new radial tree layout for the specified graph
 */
function mxRadialTreeLayout(graph, invert)
{
	mxGraphLayout.call(this, graph);
	this.invert = (invert != null) ? invert : false;
};

/**
 * Extends mxGraphLayout.
 */
mxUtils.extend(mxRadialTreeLayout, mxGraphLayout);

/**
 * Variable: invert
 *
 * Specifies if edge directions should be inverted. Default is false.
 */
mxRadialTreeLayout.prototype.invert = null;	 

/**
 * Variable: angleOffset
 *
 * The initial offset to compute the angle position.
 */
mxRadialTreeLayout.prototype.angleOffset = 0.5;

/**
 * Variable: rootx
 *
 * The X co-ordinate of the root cell
 */
mxRadialTreeLayout.prototype.rootx = 0;

/**
 * Variable: rooty
 *
 * The Y co-ordinate of the root cell
 */
mxRadialTreeLayout.prototype.rooty = 0;

/**
 * Variable: levelDistance
 *
 * Holds the levelDistance. Default is 10.
 */
mxRadialTreeLayout.prototype.levelDistance = 10;

/**
 * Variable: nodeDistance
 *
 * Holds the nodeDistance. Default is 20.
 */
mxRadialTreeLayout.prototype.nodeDistance = 20;

/**
 * Variable: autoRadius
 * 
 * Specifies if the radios should be computed automatically
 */
mxRadialTreeLayout.prototype.autoRadius = false;

/**
 * Variable: minradiusx
 * 
 * The minimum radius of each level in x axis
 */
mxRadialTreeLayout.prototype.minradiusx = 80;

/**
 * Variable: minradiusy
 * 
 * The minimum radius of each level in y axis
 */
mxRadialTreeLayout.prototype.minradiusy = 80;

/**
 * Variable: maxradiusy
 * 
 * The maximum radius of each level in x axis
 */
mxRadialTreeLayout.prototype.maxradiusx = 1000;

/**
 * Variable: maxradiusy
 * 
 * The maximum radius of each level in y axis
 */
mxRadialTreeLayout.prototype.maxradiusy = 1000;

/**
 * Variable: radiusx
 * 
 * x-axis radius of each circle
 */
mxRadialTreeLayout.prototype.radiusx = 150;

/**
 * Variable: radiusy
 * 
 * y-axis radius of each circle
 */
mxRadialTreeLayout.prototype.radiusy = 150;

/**
 * Variable: sortEdges
 * 
 * Specifies if edges should be sorted according to the order of their
 * opposite terminal cell in the model.
 */
mxRadialTreeLayout.prototype.sortEdges = false;

/**
 * Function: isVertexIgnored
 * 
 * Returns a boolean indicating if the given <mxCell> should be ignored as a
 * vertex. This returns true if the cell has no connections.
 * 
 * Parameters:
 * 
 * vertex - <mxCell> whose ignored state should be returned.
 */
mxRadialTreeLayout.prototype.isVertexIgnored = function(vertex)
{
	return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments) ||
		this.graph.getConnections(vertex).length == 0;
};

/**
 * Function: execute
 * 
 * Implements <mxGraphLayout.execute>.
 * 
 * If the parent has any connected edges, then it is used as the root of
 * the tree. Else, <mxGraph.findTreeRoots> will be used to find a suitable
 * root node within the set of children of the given parent.
 * 
 * Parameters:
 * 
 * parent - <mxCell> whose children should be laid out.
 * root - Optional <mxCell> that will be used as the root of the tree.
 */
mxRadialTreeLayout.prototype.execute = function(parent, root)
{
	this.parent = parent;
	var model = this.graph.getModel();
	
	if (root == null)
	{
		// Takes the parent as the root if it has outgoing edges
		if (this.graph.getEdges(parent, model.getParent(parent),
			this.invert, !this.invert, false).length > 0)
		{
			root = parent;
		}
		
		// Tries to find a suitable root in the parent's
		// children
		else
		{
			var roots = this.graph.findTreeRoots(parent, true, this.invert);
			
			if (roots.length > 0)
			{
				for (var i = 0; i < roots.length; i++)
				{
					if (!this.isVertexIgnored(roots[i]) &&
						this.graph.getEdges(roots[i], null,
							this.invert, !this.invert, false).length > 0)
					{
						root = roots[i];
						break;
					}
				}
			}
		}
	}
	
	if (root != null)
	{
		model.beginUpdate();
		
		try
		{
			this.depth = 0;
			var node = this.dfs(root, 0);
			
			this.rootx = node.x;
			this.rooty = node.y;
			
			if (this.autoRadius)
			{
				this.radiusx = Math.min(this.maxradiusx, Math.max(this.minradiusx, this.rootx / this.depth));
				this.radiusy = Math.min(this.maxradiusx, Math.max(this.minradiusy, this.rooty / this.depth));
			}

			if (node != null)
			{
				this.layout(1, [node]);

				// Iterate through all edges setting their positions
				//this.localEdgeProcessing(node);
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

/**
 * Function: moveNode
 * 
 * Moves the specified node and all of its children by the given amount.
 */
mxRadialTreeLayout.prototype.moveNode = function(node, dx, dy)
{
	node.x += dx;
	node.y += dy;
	this.apply(node);
	
	var child = node.child;
	
	while (child != null)
	{
		this.moveNode(child, dx, dy);
		child = child.next;
	}
};


/**
 * Function: sortOutgoingEdges
 * 
 * Called if <sortEdges> is true to sort the array of outgoing edges in place.
 */
mxRadialTreeLayout.prototype.sortOutgoingEdges = function(source, edges)
{
	var lookup = new mxDictionary();
	
	edges.sort(function(e1, e2)
	{
		var end1 = e1.getTerminal(e1.getTerminal(false) == source);
		var p1 = lookup.get(end1);
		
		if (p1 == null)
		{
			p1 = mxCellPath.create(end1).split(mxCellPath.PATH_SEPARATOR);
			lookup.put(end1, p1);
		}

		var end2 = e2.getTerminal(e2.getTerminal(false) == source);
		var p2 = lookup.get(end2);
		
		if (p2 == null)
		{
			p2 = mxCellPath.create(end2).split(mxCellPath.PATH_SEPARATOR);
			lookup.put(end2, p2);
		}

		return mxCellPath.compare(p1, p2);
	});
};

/**
 * Function: dfs
 * 
 * Does a depth first search starting at the specified cell.
 * Makes sure the specified parent is never left by the
 * algorithm.
 */
mxRadialTreeLayout.prototype.dfs = function(cell, level, treeParent, graphParent, visited)
{
	visited = (visited != null) ? visited : [];
	
	var id = mxCellPath.create(cell);
	var node = null;
	
	level++;
	
	if (level > this.depth)
	{
		this.depth = level;
	}
	
	if (cell != null && visited[id] == null && !this.isVertexIgnored(cell))
	{
		visited[id] = cell;
		node = this.createNode(cell, treeParent);

		var model = this.graph.getModel();
		var prev = null;
		var out = this.graph.getEdges(cell, graphParent, this.invert, !this.invert, false, true);
		var view = this.graph.getView();
		
		if (this.sortEdges)
		{
			this.sortOutgoingEdges(cell, out);
		}

		for (var i = 0; i < out.length; i++)
		{
			var edge = out[i];
			
			if (!this.isEdgeIgnored(edge))
			{
				// Resets the points on the traversed edge
				if (this.resetEdges)
				{
					this.setEdgePoints(edge, null);
				}
				
				if (this.edgeRouting)
				{
					this.setEdgeStyleEnabled(edge, false);
					this.setEdgePoints(edge, null);
				}
				
				// Checks if terminal in same swimlane
				var state = view.getState(edge);
				var target = (state != null) ? state.getVisibleTerminal(this.invert) : view.getVisibleTerminal(edge, this.invert);
				var tmp = this.dfs(target, level, node, graphParent, visited);
				
				if (tmp != null && model.getGeometry(target) != null)
				{
					if (prev == null)
					{
						node.child = tmp;
					}
					else
					{
						prev.next = tmp;
					}
					
					prev = tmp;
				}
			}
		}
	}
	
	return node;
};

/**
 * Function: layout
 * 
 * Starts the actual compact tree layout algorithm
 * at the given node.
 */
mxRadialTreeLayout.prototype.layout = function(level, nodes)
{
	var prevAngle = 0.0;
	var firstParent = null;
	var prevParent = null;
	var parentNodes = [];

	for (var i = 0; i < nodes.length; i++)
	{
		var parent = nodes[i];

		var children = parent.children;
		var rightLimit = Math.max(parent.rightBisector, parent.rightTangent);
		var leftLimit = Math.min(parent.leftBisector, parent.leftTangent);
		var angleSpace = (leftLimit - rightLimit) / children.length;
		var j = 0;

		for (var angle = this.angleOffset; j < parent.children.length; j++, angle++)
		{
			var node = parent.children[j];
			node.angle = rightLimit + (angle * angleSpace);

			if (this.moveRoot || level > 0)
			{
				node.x = this.rootx + ((level * this.radiusx) * Math.cos(node.angle));
				node.y = this.rooty + ((level * this.radiusy) * Math.sin(node.angle));
				this.apply(node);
			}

			if (node.children.length > 0)
			{
				parentNodes.push(node);

				if (null == firstParent)
				{
					firstParent = node;
				}

				// right bisector limit
				var prevGap = node.angle - prevAngle;
				node.rightBisector = node.angle - (prevGap / 2.0);

				if (null != prevParent)
				{
					prevParent.leftBisector = node.rightBisector;
				}

				var arcAngle = level / (level + 1.0);
				var arc = 2.0 * Math.asin(arcAngle);

				node.leftTangent = node.angle + arc;
				node.rightTangent = node.angle - arc;

				prevAngle = node.angle;
				prevParent = node;
			}
		}
	}

	if (null != firstParent)
	{
		var remaningAngle = Math.PI * 2 - prevParent.angle;
		firstParent.rightBisector = (firstParent.angle - remaningAngle) / 2.0;

		if (firstParent.rightBisector < 0)
		{
			prevParent.leftBisector = firstParent.rightBisector + Math.PI * 4;
		}
		else
		{
			prevParent.leftBisector = firstParent.rightBisector + Math.PI * 2;
		}
	}

	if (parentNodes.length > 0)
	{
		this.layout(level + 1, parentNodes);
	}
};

/**
 * Function: createNode
 */
mxRadialTreeLayout.prototype.createNode = function(cell, treeParent)
{
	var node = new Object();
	node.cell = cell;
	node.geo = this.getVertexBounds(cell);
	
	node.x = 0;
	node.y = 0;
	node.width = 0;
	node.height = 0;
	
	var geo = this.getVertexBounds(cell);
	
	if (geo != null)
	{
		node.width = geo.width;
		node.height = geo.height;
		node.x = geo.x + geo.width / 2.0;
		node.y = geo.y + geo.height / 2.0;
	}

	node.rightBisector = 0;
	node.rightTangent = 0;
	node.leftBisector = Math.PI * 2.0;
	node.leftTangent = Math.PI * 2.0;
	
	node.children = [];
	
	if (treeParent != null)
	{
		treeParent.children.push(node);
	}

	return node;
};

/**
 * Function: localEdgeProcessing
 *
 * Moves the specified node and all of its children by the given amount.
 */
mxRadialTreeLayout.prototype.localEdgeProcessing = function(node)
{
	this.processNodeOutgoing(node);
	var child = node.child;

	while (child != null)
	{
		this.localEdgeProcessing(child);
		child = child.next;
	}
};

/**
 * Function: localEdgeProcessing
 *
 * Separates the x position of edges as they connect to vertices
 */
mxRadialTreeLayout.prototype.processNodeOutgoing = function(node)
{
	var child = node.child;
	var parentCell = node.cell;

	var childCount = 0;
	var sortedCells = [];

	while (child != null)
	{
		childCount++;

		var sortingCriterion = child.x;

		if (this.horizontal)
		{
			sortingCriterion = child.y;
		}

		sortedCells.push(new WeightedCellSorter(child, sortingCriterion));
		child = child.next;
	}

	sortedCells.sort(WeightedCellSorter.prototype.compare);

	var availableWidth = node.width;

	var requiredWidth = (childCount + 1) * this.prefHozEdgeSep;

	// Add a buffer on the edges of the vertex if the edge count allows
	if (availableWidth > requiredWidth + (2 * this.prefHozEdgeSep))
	{
		availableWidth -= 2 * this.prefHozEdgeSep;
	}

	var edgeSpacing = availableWidth / childCount;

	var currentXOffset = edgeSpacing / 2.0;

	if (availableWidth > requiredWidth + (2 * this.prefHozEdgeSep))
	{
		currentXOffset += this.prefHozEdgeSep;
	}

	var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
	var maxYOffset = 0;

	var parentBounds = this.getVertexBounds(parentCell);
	child = node.child;

	for (var j = 0; j < sortedCells.length; j++)
	{
		var childCell = sortedCells[j].cell.cell;
		var childBounds = this.getVertexBounds(childCell);

		var edges = this.graph.getEdgesBetween(parentCell,
				childCell, false);
		
		var newPoints = [];
		var x = 0;
		var y = 0;

		for (var i = 0; i < edges.length; i++)
		{
			if (this.horizontal)
			{
				// Use opposite co-ords, calculation was done for 
				// 
				x = parentBounds.x + parentBounds.width;
				y = parentBounds.y + currentXOffset;
				newPoints.push(new mxPoint(x, y));
				x = parentBounds.x + parentBounds.width
						+ currentYOffset;
				newPoints.push(new mxPoint(x, y));
				y = childBounds.y + childBounds.height / 2.0;
				newPoints.push(new mxPoint(x, y));
				this.setEdgePoints(edges[i], newPoints);
			}
			else
			{
				x = parentBounds.x + currentXOffset;
				y = parentBounds.y + parentBounds.height;
				newPoints.push(new mxPoint(x, y));
				y = parentBounds.y + parentBounds.height
						+ currentYOffset;
				newPoints.push(new mxPoint(x, y));
				x = childBounds.x + childBounds.width / 2.0;
				newPoints.push(new mxPoint(x, y));
				this.setEdgePoints(edges[i], newPoints);
			}
		}

		if (j < childCount / 2)
		{
			currentYOffset += this.prefVertEdgeOff;
		}
		else if (j > childCount / 2)
		{
			currentYOffset -= this.prefVertEdgeOff;
		}
		// Ignore the case if equals, this means the second of 2
		// jettys with the same y (even number of edges)

		//								pos[k * 2] = currentX;
		currentXOffset += edgeSpacing;
		//								pos[k * 2 + 1] = currentYOffset;

		maxYOffset = Math.max(maxYOffset, currentYOffset);
	}
};

/**
 * Function: apply
 */
mxRadialTreeLayout.prototype.apply = function(node)
{
	var model = this.graph.getModel();
	var cell = node.cell;
	var g = model.getGeometry(cell);

	if (cell != null && g != null && this.isVertexMovable(cell))
	{
		g = this.setVertexLocation(cell, node.x - node.width / 2, node.y - node.height / 2);
	}
};


/**
 * Class: WeightedCellSorter
 * 
 * A utility class used to track cells whilst sorting occurs on the weighted
 * sum of their connected edges. Does not violate (x.compareTo(y)==0) ==
 * (x.equals(y))
 *
 * Constructor: WeightedCellSorter
 * 
 * Constructs a new weighted cell sorted for the given cell and weight.
 */
function WeightedCellSorter(cell, weightedValue)
{
	this.cell = cell;
	this.weightedValue = weightedValue;
};

/**
 * Variable: weightedValue
 * 
 * The weighted value of the cell stored.
 */
WeightedCellSorter.prototype.weightedValue = 0;

/**
 * Variable: nudge
 * 
 * Whether or not to flip equal weight values.
 */
WeightedCellSorter.prototype.nudge = false;

/**
 * Variable: visited
 * 
 * Whether or not this cell has been visited in the current assignment.
 */
WeightedCellSorter.prototype.visited = false;

/**
 * Variable: rankIndex
 * 
 * The index this cell is in the model rank.
 */
WeightedCellSorter.prototype.rankIndex = null;

/**
 * Variable: cell
 * 
 * The cell whose median value is being calculated.
 */
WeightedCellSorter.prototype.cell = null;

/**
 * Function: compare
 * 
 * Compares two WeightedCellSorters.
 */
WeightedCellSorter.prototype.compare = function(a, b)
{
	if (a != null && b != null)
	{
		if (b.weightedValue > a.weightedValue)
		{
			return 1;
		}
		else if (b.weightedValue < a.weightedValue)
		{
			return -1;
		}
		else
		{
			if (b.nudge)
			{
				return 1;
			}
			else
			{
				return -1;
			}
		}
	}
	else
	{
		return 0;
	}
};