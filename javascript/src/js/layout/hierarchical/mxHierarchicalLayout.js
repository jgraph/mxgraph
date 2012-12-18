/**
 * $Id: mxHierarchicalLayout.js,v 1.30 2012-12-18 12:41:06 david Exp $
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
	else
	{
		this.roots = roots;
	}
	
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
};

/**
 * Function: findRoots
 * 
 * Returns all visible children in the given parent which do not have
 * incoming edges. If the result is empty then the children with the
 * maximum difference between incoming and outgoing edges are returned.
 * This takes into account edges that are being promoted to the given
 * root due to invisible children or collapsed cells.
 * 
 * Parameters:
 * 
 * parent - <mxCell> whose children should be checked.
 * vertices - array of vertices to limit search to
 */
mxHierarchicalLayout.prototype.findRoots = function(parent, vertices)
{
	var roots = [];
	
	if (parent != null && vertices != null)
	{
		var model = this.graph.model;
		var best = null;
		var maxDiff = -100000;
		
		for (var i in vertices)
		{
			var cell = vertices[i];

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

				var diff = fanOut - fanIn;

				if (diff > maxDiff)
				{
					maxDiff = diff;
					best = cell;
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
	var allVertexSet = [];

	if (this.roots == null && parent != null)
	{
		var filledVertexSet = this.filterDescendants(parent);

		this.roots = [];
		var filledVertexSetEmpty = true;

		// Poor man's isSetEmpty
		for (var key in filledVertexSet)
		{
			if (filledVertexSet[key] != null)
			{
				filledVertexSetEmpty = false;
				break;
			}
		}

		while (!filledVertexSetEmpty)
		{
			var candidateRoots = this.findRoots(parent, filledVertexSet);

			for (var i = 0; i < candidateRoots.length; i++)
			{
				var vertexSet = [];
				hierarchyVertices.push(vertexSet);

				this.traverse(candidateRoots[i], true, null, allVertexSet, vertexSet,
						hierarchyVertices, filledVertexSet);
			}

			for (var i = 0; i < candidateRoots.length; i++)
			{
				this.roots.push(candidateRoots[i]);
			}
			
			filledVertexSetEmpty = true;
			
			// Poor man's isSetEmpty
			for (var key in filledVertexSet)
			{
				if (filledVertexSet[key] != null)
				{
					filledVertexSetEmpty = false;
					break;
				}
			}
		}
	}
	else
	{
		// Find vertex set as directed traversal from roots

		for (var i = 0; i < roots.length; i++)
		{
			var vertexSet = [];
			hierarchyVertices.push(vertexSet);

			traverse(roots.get(i), true, null, allVertexSet, vertexSet,
					hierarchyVertices, null);
		}
	}

	// Iterate through the result removing parents who have children in this layout
	
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
			parent, this.tightenToSource);

		this.cycleStage(parent);
		this.layeringStage();
		
		this.crossingStage(parent);
		initialX = this.placementStage(initialX, parent);
	}
};

/**
 * Function: filterDescendants
 * 
 * Creates an array of descendant cells
 */
mxHierarchicalLayout.prototype.filterDescendants = function(cell)
{
	var model = this.graph.model;
	var result = [];

	if (model.isVertex(cell) && cell != this.parent && this.graph.isCellVisible(cell))
	{
		result.push(cell);
	}

	if (this.traverseAncestors || cell == this.parent
			&& this.graph.isCellVisible(cell))
	{
		var childCount = model.getChildCount(cell);

		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			var children = this.filterDescendants(child);
			
			for (var j = 0; j < children.length; j++)
			{
				result[mxCellPath.create(children[j])] = children[j];
			}
		}
	}

	return result;
};

/**
 * Traverses the (directed) graph invoking the given function for each
 * visited vertex and edge. The function is invoked with the current vertex
 * and the incoming edge as a parameter. This implementation makes sure
 * each vertex is only visited once. The function may return false if the
 * traversal should stop at the given vertex.
 * 
 * Parameters:
 * 
 * vertex - <mxCell> that represents the vertex where the traversal starts.
 * directed - boolean indicating if edges should only be traversed
 * from source to target. Default is true.
 * edge - Optional <mxCell> that represents the incoming edge. This is
 * null for the first step of the traversal.
 * allVertices - Array of cell paths for the visited cells.
 */
mxHierarchicalLayout.prototype.traverse = function(vertex, directed, edge, allVertices, currentComp,
											hierarchyVertices, filledVertexSet)
{
	var view = this.graph.view;
	var model = this.graph.model;

	if (vertex != null && allVertices != null)
	{
		// Has this vertex been seen before in any traversal
		// And if the filled vertex set is populated, only 
		// process vertices in that it contains
		var vertexID = mxCellPath.create(vertex);
		
		if ((allVertices[vertexID] == null)
				&& (filledVertexSet == null ? true : filledVertexSet[vertexID] != null))
		{
			if (currentComp[vertexID] == null)
			{
				currentComp[vertexID] = vertex;
			}
			if (allVertices[vertexID] == null)
			{
				allVertices[vertexID] = vertex;
			}

			delete filledVertexSet[vertexID];

			var edgeCount = model.getEdgeCount(vertex);

			if (edgeCount > 0)
			{
				for (var i = 0; i < edgeCount; i++)
				{
					var e = model.getEdgeAt(vertex, i);
					var isSource = view.getVisibleTerminal(e, true) == vertex;

					if (!directed || isSource)
					{
						var next = view.getVisibleTerminal(e, !isSource);
						currentComp = this.traverse(next, directed, e, allVertices,
								currentComp, hierarchyVertices,
								filledVertexSet);
					}
				}
			}
		}
		else
		{
			if (currentComp[vertexID] == null)
			{
				// We've seen this vertex before, but not in the current component
				// This component and the one it's in need to be merged

				for (var i = 0; i < hierarchyVertices.length; i++)
				{
					var comp = hierarchyVertices[i];

					if (comp[vertexID] != null)
					{
						for (var key in currentComp)
						{
							comp[key] = currentComp[key];
						}
						
						// Remove the current component from the hierarchy set
						hierarchyVertices.pop();
						return comp;
					}
				}
			}
		}
	}
	
	return currentComp;
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
