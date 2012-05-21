/**
 * $Id: mxHierarchicalLayout.js,v 1.26 2011-07-04 08:31:56 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
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
	if (roots == null)
	{
		roots = this.graph.findTreeRoots(parent);
	}
	
	this.roots = roots;
	
	if (this.roots != null)
	{
		var model = this.graph.getModel();

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

					var conns = this.graph.getConnections(cell, parent);
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
			parent, false, this.deterministic , this.tightenToSource, this.layoutFromSinks);

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
