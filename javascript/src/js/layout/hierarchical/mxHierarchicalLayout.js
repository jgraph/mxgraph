/**
 * $Id: mxHierarchicalLayout.js,v 1.29 2012-06-12 20:22:18 david Exp $
 * Copyright (c) 2005-2012, JGraph Ltd
 */
/**
 * Class: mxHierarchicalLayout
 * 
 * A hierarchical layout algorithm.
 * 
 * Constructor: mxHierarchicalLayout
 *
 * Constructs a new hierarchical layout algorithm.
 *
 * Arguments:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 * orientation - Optional constant that defines the orientation of this
 * layout.
 * deterministic - Optional boolean that specifies if this layout should be
 * deterministic. Default is true.
 */
function mxHierarchicalLayout(graph, orientation, deterministic)
{
	mxGraphLayout.call(this, graph);
	this.orientation = (orientation != null) ? orientation : mxConstants.DIRECTION_NORTH;
	this.deterministic = (deterministic != null) ? deterministic : true;
};

/**
 * Extends mxGraphLayout.
 */
mxHierarchicalLayout.prototype = new mxGraphLayout();
mxHierarchicalLayout.prototype.constructor = mxHierarchicalLayout;

/**
 * Variable: roots
 * 
 * Holds the array of <mxGraphLayouts> that this layout contains.
 */
mxHierarchicalLayout.prototype.roots = null;

/**
 * Variable: resizeParent
 * 
 * Specifies if the parent should be resized after the layout so that it
 * contains all the child cells. Default is false. See also <parentBorder>.
 */
mxHierarchicalLayout.prototype.resizeParent = false;

/**
 * Variable: moveParent
 * 
 * Specifies if the parent should be moved if <resizeParent> is enabled.
 * Default is false.
 */
mxHierarchicalLayout.prototype.moveParent = false;

/**
 * Variable: parentBorder
 * 
 * The border to be added around the children if the parent is to be
 * resized using <resizeParent>. Default is 0.
 */
mxHierarchicalLayout.prototype.parentBorder = 0;

/**
 * Variable: intraCellSpacing
 * 
 * The spacing buffer added between cells on the same layer. Default is 30.
 */
mxHierarchicalLayout.prototype.intraCellSpacing = 30;

/**
 * Variable: interRankCellSpacing
 * 
 * The spacing buffer added between cell on adjacent layers. Default is 50.
 */
mxHierarchicalLayout.prototype.interRankCellSpacing = 50;

/**
 * Variable: interHierarchySpacing
 * 
 * The spacing buffer between unconnected hierarchies. Default is 60.
 */
mxHierarchicalLayout.prototype.interHierarchySpacing = 60;

/**
 * Variable: parallelEdgeSpacing
 * 
 * The distance between each parallel edge on each ranks for long edges
 */
mxHierarchicalLayout.prototype.parallelEdgeSpacing = 10;

/**
 * Variable: orientation
 * 
 * The position of the root node(s) relative to the laid out graph in.
 * Default is <mxConstants.DIRECTION_NORTH>.
 */
mxHierarchicalLayout.prototype.orientation = mxConstants.DIRECTION_NORTH;

/**
 * Variable: fineTuning
 * 
 * Whether or not to perform local optimisations and iterate multiple times
 * through the algorithm. Default is true.
 */
mxHierarchicalLayout.prototype.fineTuning = true;

/**
 * Variable: deterministic
 * 
 * Whether or not cells are ordered according to the order in the graph
 * model. Defaults to false since sorting usually produces quadratic
 * performance. Note that since mxGraph returns edges in a deterministic
 * order, it might be that this layout is always deterministic using that
 * JGraph regardless of this flag setting (i.e. leave it false in that
 * case). Default is true.
 */
mxHierarchicalLayout.prototype.deterministic;

/**
 * Variable: fixRoots
 * 
 * Whether or not to fix the position of the root cells. Keep in mind to
 * turn off features such as move to origin when fixing the roots, move
 * to origin usually overrides this flag (in JGraph it does). Default is
 * false.
 */
mxHierarchicalLayout.prototype.fixRoots = false;

/**
 * 
 * Variable: layoutFromSinks
 * 
 * Whether or not the initial scan of the graph to determine the layer
 * assigned to each vertex starts from the sinks or source (the sinks
 * being vertices with the fewest, preferable zero, outgoing edges and
 * sources same with incoming edges). Starting from either direction
 * can tight the layout up and also produce better results for certain
 * types of graphs. If the result for the default is not good enough
 * try a few sample layouts with the value false to see if they improve
 */
mxHierarchicalLayout.prototype.layoutFromSinks = true;

/**
 * 
 * Variable: tightenToSource
 * 
 * Whether or not to tighten the assigned ranks of vertices up towards
 * the source cells.
 */
mxHierarchicalLayout.prototype.tightenToSource = true;

/**
 * Variable: disableEdgeStyle
 * 
 * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
 * modified by the result. Default is true.
 */
mxHierarchicalLayout.prototype.disableEdgeStyle = true;

/**
 * Variable: promoteEdges
 * 
 * Whether or not to promote edges that terminate on vertices with
 * different but common ancestry to appear connected to the highest
 * siblings in the ancestry chains
 */
mxHierarchicalLayout.prototype.promoteEdges = true;

/**
 * Variable: traverseAncestors
 * 
 * Whether or not to navigate edges whose terminal vertices 
 * have different parents but are in the same ancestry chain
 */
mxHierarchicalLayout.prototype.traverseAncestors = true;

/**
 * Variable: model
 * 
 * The internal <mxGraphHierarchyModel> formed of the layout.
 */
mxHierarchicalLayout.prototype.model = null;

/**
 * Function: getModel
 * 
 * Returns the internal <mxGraphHierarchyModel> for this layout algorithm.
 */
mxHierarchicalLayout.prototype.getModel = function()
{
	return this.model;
};

/**
 * Function: execute
 * 
 * Executes the layout for the children of the specified parent.
 * 
 * Parameters:
 * 
 * parent - Parent <mxCell> that contains the children to be laid out.
 * roots - Optional starting roots of the layout.
 */
mxHierarchicalLayout.prototype.execute = function(parent, roots)
{
	this.parent = parent;
	var model = this.graph.model;

	// If the roots are set and the parent is set, only
	// use the roots that are some dependent of the that
	// parent.
	// If just the root are set, use them as-is
	// If just the parent is set use it's immediate
	// children as the initial set

	if (roots == null && parent == null)
	{
		// TODO indicate the problem
		return;
	}

	if (roots != null && parent != null)
	{
		var rootsCopy = [];

		for (var i = 0; i < roots.length; i++)
		{

			if (model.isAncestor(parent, roots[i]))
			{
				rootsCopy.push(roots[i]);
			}
		}

		this.roots = rootsCopy;
	}
	else if (roots == null)
	{
		this.roots = this.findTreeRoots(parent);
	}
	else
	{
		this.roots = roots;
	}
	
	if (this.roots != null)
	{
		model = this.graph.getModel();

		model.beginUpdate();
		try
		{
			this.run(parent);
			
			if (this.resizeParent &&
				!this.graph.isCellCollapsed(parent))
			{
				this.graph.updateGroupBounds([parent],
					this.parentBorder, this.moveParent);
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

/**
 * Function: findTreeRoots
 * 
 * Returns all children in the given parent which do not have incoming
 * edges. If the result is empty then the with the greatest difference
 * between incoming and outgoing edges is returned.
 * 
 * Parameters:
 * 
 * parent - <mxCell> whose children should be checked.
 */
mxHierarchicalLayout.prototype.findTreeRoots = function(parent)
{
	var roots = [];
	
	if (parent != null)
	{
		var model = this.graph.model;
		var childCount = model.getChildCount(parent);
		var best = null;
		var maxDiff = 0;
		
		for (var i = 0; i < childCount; i++)
		{
			var cell = model.getChildAt(parent, i);
			var cells = [];

			if (this.traverseAncestors)
			{
				cells = model.getDescendants(cell);
			}
			else
			{
				cells.push(cell);
			}

			for (var j = 0; j < cells.length; j++)
			{
				cell = cells[j];

				if (model.isVertex(cell) && this.graph.isCellVisible(cell))
				{
					var conns = this.getEdges(cell);
					var fanOut = 0;
					var fanIn = 0;

					for (var k = 0; k < conns.length; k++)
					{
						var src = this.graph.view.getVisibleTerminal(conns[k], true);

						if (src == cell)
						{
							fanOut++;
						}
						else
						{
							fanIn++;
						}
					}

					if (fanIn == 0 && fanOut > 0)
					{
						roots.push(cell);
					}

					var diff = fanIn - fanOut;

					if (diff > maxDiff)
					{
						maxDiff = diff;
						best = cell;
					}
				}
			}
		}
		
		if (roots.length == 0 && best != null)
		{
			roots.push(best);
		}
	}
	
	return roots;
};

/**
 * Function: getEdges
 * 
 * Returns the connected edges for the given cell.
 * 
 * Parameters:
 * 
 * cell - <mxCell> whose edges should be returned.
 */
mxHierarchicalLayout.prototype.getEdges = function(cell)
{
	var model = this.graph.model;
	var edges = [];
	var isCollapsed = this.graph.isCellCollapsed(cell);
	var childCount = model.getChildCount(cell);

	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(cell, i);

		if (isCollapsed || !this.graph.isCellVisible(child))
		{
			edges = edges.concat(model.getEdges(child, true, true));
		}
	}

	edges = edges.concat(model.getEdges(cell, true, true));
	var result = [];
	
	for (var i = 0; i < edges.length; i++)
	{
		var state = this.graph.view.getState(edges[i]);
		
		var source = (state != null) ? state.getVisibleTerminal(true) : this.graph.view.getVisibleTerminal(edges[i], true);
		var target = (state != null) ? state.getVisibleTerminal(false) : this.graph.view.getVisibleTerminal(edges[i], false);

		if ((source == target) || ((source != target) && ((target == cell && (this.parent == null || this.graph.isValidAncestor(source, this.parent, this.traverseAncestors))) ||
			(source == cell && (this.parent == null ||
					this.graph.isValidAncestor(target, this.parent, this.traverseAncestors))))))
		{
			result.push(edges[i]);
		}
	}

	return result;
};

/**
 * Function: run
 * 
 * The API method used to exercise the layout upon the graph description
 * and produce a separate description of the vertex position and edge
 * routing changes made. It runs each stage of the layout that has been
 * created.
 */
mxHierarchicalLayout.prototype.run = function(parent)
{
	// Separate out unconnected hierarchies
	var hierarchyVertices = [];
	
	// Keep track of one root in each hierarchy in case it's fixed position
	var fixedRoots = null;
	var rootLocations = null;
	var affectedEdges = null;

	if (this.fixRoots)
	{
		fixedRoots = [];
		rootLocations = [];
		affectedEdges = [];
	}

	for (var i = 0; i < this.roots.length; i++)
	{
		// First check if this root appears in any of the previous vertex
		// sets
		var newHierarchy = true;
		
		for (var j = 0; newHierarchy && j < hierarchyVertices.length; j++)
		{
			var rootId = mxCellPath.create(this.roots[i]);
			
			if (hierarchyVertices[j][rootId] != null)
			{
				newHierarchy = false;
			}
		}

		if (newHierarchy)
		{
			// Obtains set of vertices connected to this root
			var cellsStack = [];
			cellsStack.push(this.roots[i]);
			var edgeSet = null;

			if (this.fixRoots)
			{
				fixedRoots.push(this.roots[i]);
				var location = this.getVertexBounds(this.roots[i]).getPoint();
				rootLocations.push(location);
				edgeSet = [];
			}

			var vertexSet = new Object();

			while (cellsStack.length > 0)
			{
				var cell = cellsStack.shift();
				var cellId = mxCellPath.create(cell);

				if (vertexSet[cellId] == null)
				{
					vertexSet[cellId] = cell;

					if (this.fixRoots)
					{
						var tmp = this.graph.getIncomingEdges(cell, parent);
						
						for (var k = 0; k < tmp.length; k++)
						{
							edgeSet.push(tmp[k]);
						}
					}

					var conns = this.getEdges(cell);
					var cells = this.graph.getOpposites(conns, cell);

					for (var k = 0; k < cells.length; k++)
					{
						var tmpId = mxCellPath.create(cells[k]);
						
						if (vertexSet[tmpId] == null)
						{
							cellsStack.push(cells[k]);
						}
					}
				}
			}

			hierarchyVertices.push(vertexSet);

			if (this.fixRoots)
			{
				affectedEdges.push(edgeSet);
			}
		}
	}

	// Perform a layout for each seperate hierarchy
	// Track initial coordinate x-positioning
	var initialX = 0;

	for (var i = 0; i < hierarchyVertices.length; i++)
	{
		var vertexSet = hierarchyVertices[i];
		var tmp = [];
		
		for (var key in vertexSet)
		{
			tmp.push(vertexSet[key]);
		}
		
		this.model = new mxGraphHierarchyModel(this, tmp, this.roots,
			parent, this.deterministic , this.tightenToSource, this.layoutFromSinks);

		this.cycleStage(parent);
		this.layeringStage();
		
		this.crossingStage(parent);
		initialX = this.placementStage(initialX, parent);
		
		if (this.fixRoots)
		{
			// Reposition roots and their hierarchies using their bounds
			// stored earlier
			var root = fixedRoots[i];
			var oldLocation = rootLocations[i];
			var newLocation = this.getVertexBounds(root).getPoint();

			var diffX = oldLocation.x - newLocation.x;
			var diffY = oldLocation.y - newLocation.y;
			this.graph.moveCells(vertexSet, diffX, diffY);

			// Also translate connected edges
			var connectedEdges = affectedEdges[i+1];
			this.graph.moveCells(connectedEdges, diffX, diffY);
		}
	}
};

/**
 * Function: cycleStage
 * 
 * Executes the cycle stage using mxMinimumCycleRemover.
 */
mxHierarchicalLayout.prototype.cycleStage = function(parent)
{
	var cycleStage = new mxMinimumCycleRemover(this);
	cycleStage.execute(parent);
};

/**
 * Function: layeringStage
 * 
 * Implements first stage of a Sugiyama layout.
 */
mxHierarchicalLayout.prototype.layeringStage = function()
{
	this.model.initialRank();
	this.model.fixRanks();
};

/**
 * Function: crossingStage
 * 
 * Executes the crossing stage using mxMedianHybridCrossingReduction.
 */
mxHierarchicalLayout.prototype.crossingStage = function(parent)
{
	var crossingStage = new mxMedianHybridCrossingReduction(this);
	crossingStage.execute(parent);
};

/**
 * Function: placementStage
 * 
 * Executes the placement stage using mxCoordinateAssignment.
 */
mxHierarchicalLayout.prototype.placementStage = function(initialX, parent)
{
	var placementStage = new mxCoordinateAssignment(this, this.intraCellSpacing,
			this.interRankCellSpacing, this.orientation, initialX,
			this.parallelEdgeSpacing);
	placementStage.fineTuning = this.fineTuning;
	placementStage.execute(parent);
	
	return placementStage.limitX + this.interHierarchySpacing;
};
