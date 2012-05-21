/*
 * $Id: mxHierarchicalLayout.java,v 1.12 2010-12-01 18:08:40 david Exp $
 * Copyright (c) 2005-2010, David Benson, Gaudenz Alder
 */
package com.mxgraph.layout.hierarchical;

import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Stack;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.swing.SwingConstants;

import com.mxgraph.layout.mxGraphLayout;
import com.mxgraph.layout.hierarchical.model.mxGraphHierarchyModel;
import com.mxgraph.layout.hierarchical.stage.mxCoordinateAssignment;
import com.mxgraph.layout.hierarchical.stage.mxHierarchicalLayoutStage;
import com.mxgraph.layout.hierarchical.stage.mxMedianHybridCrossingReduction;
import com.mxgraph.layout.hierarchical.stage.mxMinimumCycleRemover;
import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.view.mxGraph;

/**
 * The top level compound layout of the hierarchical layout. The individual
 * elements of the layout are called in sequence.
 */
public class mxHierarchicalLayout extends mxGraphLayout/*,
JGraphLayout.Stoppable*/
{
	/** The root nodes of the layout */
	protected List<Object> roots = null;

	/**
	 * Specifies if the parent should be resized after the layout so that it
	 * contains all the child cells. Default is false. @See parentBorder.
	 */
	protected boolean resizeParent = false;

	/**
	 * Specifies if the parnent should be moved if resizeParent is enabled.
	 * Default is false. @See resizeParent.
	 */
	protected boolean moveParent = false;

	/**
	 * The border to be added around the children if the parent is to be
	 * resized using resizeParent. Default is 0. @See resizeParent.
	 */
	protected int parentBorder = 0;

	/**
	 * The spacing buffer added between cells on the same layer
	 */
	protected double intraCellSpacing = 30.0;

	/**
	 * The spacing buffer added between cell on adjacent layers
	 */
	protected double interRankCellSpacing = 50.0;

	/**
	 * The spacing buffer between unconnected hierarchies
	 */
	protected double interHierarchySpacing = 60.0;

	/**
	 * The distance between each parallel edge on each ranks for long edges
	 */
	protected double parallelEdgeSpacing = 10.0;

	/**
	 * The position of the root node(s) relative to the laid out graph in. 
	 * Default is <code>SwingConstants.NORTH</code>, i.e. top-down.
	 */
	protected int orientation = SwingConstants.NORTH;

	/**
	 *  Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
	 * modified by the result. Default is true.
	 */
	protected boolean disableEdgeStyle = true;

	/**
	 * Whether or not to perform local optimisations and iterate multiple times
	 * through the algorithm
	 */
	protected boolean fineTuning = true;

	/**
	 * Whether or not cells are ordered according to the order in the graph
	 * model. Defaults to false since sorting usually produces quadratic
	 * performance. Note that since mxGraph returns edges in a deterministic
	 * order, it might be that this layout is always deterministic using that
	 * JGraph regardless of this flag setting (i.e. leave it false in that
	 * case). Default is true.
	 */
	protected boolean deterministic;

	/**
	 * Whether or not to fix the position of the root cells. Keep in mind to
	 * turn off features such as move to origin when fixing the roots, move
	 * to origin usually overrides this flag (in JGraph it does).
	 */
	protected boolean fixRoots = false;

	/**
	 * Whether or not the initial scan of the graph to determine the layer
	 * assigned to each vertex starts from the sinks or source (the sinks
	 * being vertices with the fewest, preferable zero, outgoing edges and
	 * sources same with incoming edges). Starting from either direction
	 * can tight the layout up and also produce better results for certain
	 * types of graphs. If the result for the default is not good enough
	 * try a few sample layouts with the value false to see if they improve
	 */
	protected boolean layoutFromSinks = true;

	/**
	 * The internal model formed of the layout
	 */
	protected mxGraphHierarchyModel model = null;

	/**
	 * The layout progress bar
	 */
	//protected JGraphLayoutProgress progress = new JGraphLayoutProgress();
	/** The logger for this class */
	private static Logger logger = Logger
			.getLogger("com.jgraph.layout.hierarchical.JGraphHierarchicalLayout");

	/**
	 * Constructs a hierarchical layout
	 * @param graph the graph to lay out
	 * 
	 */
	public mxHierarchicalLayout(mxGraph graph)
	{
		this(graph, SwingConstants.NORTH);
	}

	/**
	 * Constructs a hierarchical layout
	 * @param graph the graph to lay out
	 * @param orientation <code>SwingConstants.NORTH, SwingConstants.EAST, SwingConstants.SOUTH</code> or <code> SwingConstants.WEST</code>
	 * 
	 */
	public mxHierarchicalLayout(mxGraph graph, int orientation)
	{
		super(graph);
		this.orientation = orientation;
	}

	/**
	 * Returns the model for this layout algorithm.
	 */
	public mxGraphHierarchyModel getModel()
	{
		return model;
	}

	/**
	 * Executes the layout for the children of the specified parent.
	 * 
	 * @param parent Parent cell that contains the children to be laid out.
	 */
	public void execute(Object parent)
	{
		execute(parent, null);
	}

	/**
	 * Executes the layout for the children of the specified parent.
	 * 
	 * @param parent Parent cell that contains the children to be laid out.
	 * @param roots the starting roots of the layout
	 */
	public void execute(Object parent, List<Object> roots)
	{
		if (roots == null)
		{
			roots = graph.findTreeRoots(parent);
		}

		this.roots = roots;
		mxIGraphModel model = graph.getModel();

		model.beginUpdate();
		try
		{
			run(parent);

			if (isResizeParent() && !graph.isCellCollapsed(parent))
			{
				graph.updateGroupBounds(new Object[] { parent },
						getParentBorder(), isMoveParent());
			}
		}
		finally
		{
			model.endUpdate();
		}
	}

	/**
	 * The API method used to exercise the layout upon the graph description
	 * and produce a separate description of the vertex position and edge
	 * routing changes made.
	 */
	public void run(Object parent)
	{
		// Separate out unconnected hierarchies
		List<Set<Object>> hierarchyVertices = new ArrayList<Set<Object>>();

		// Keep track of one root in each hierarchy in case it's fixed position
		List<Object> fixedRoots = null;
		List<Point2D> rootLocations = null;
		List<Set<Object>> affectedEdges = null;

		if (fixRoots)
		{
			fixedRoots = new ArrayList<Object>();
			rootLocations = new ArrayList<Point2D>();
			affectedEdges = new ArrayList<Set<Object>>();
		}

		for (int i = 0; i < roots.size(); i++)
		{
			// First check if this root appears in any of the previous vertex
			// sets
			boolean newHierarchy = true;
			Iterator<Set<Object>> iter = hierarchyVertices.iterator();

			while (newHierarchy && iter.hasNext())
			{
				if (iter.next().contains(roots.get(i)))
				{
					newHierarchy = false;
				}
			}

			if (newHierarchy)
			{
				// Obtains set of vertices connected to this root
				Stack<Object> cellsStack = new Stack<Object>();
				cellsStack.push(roots.get(i));
				Set<Object> edgeSet = null;

				if (fixRoots)
				{
					fixedRoots.add(roots.get(i));
					Point2D location = getVertexBounds(roots.get(i)).getPoint();
					rootLocations.add(location);
					edgeSet = new HashSet<Object>();
				}

				Set<Object> vertexSet = new HashSet<Object>();

				while (!cellsStack.isEmpty())
				{
					Object cell = cellsStack.pop();

					if (!vertexSet.contains(cell))
					{
						vertexSet.add(cell);

						if (fixRoots)
						{
							edgeSet.addAll(Arrays.asList(graph
									.getIncomingEdges(cell, parent)));
						}

						Object[] conns = graph.getConnections(cell, parent);
						Object[] cells = graph.getOpposites(conns, cell);

						for (int j = 0; j < cells.length; j++)
						{
							if (!vertexSet.contains(cells[j]))
							{
								cellsStack.push(cells[j]);
							}
						}
					}
				}

				hierarchyVertices.add(vertexSet);

				if (fixRoots)
				{
					affectedEdges.add(edgeSet);
				}
			}
		}

		// Perform a layout for each seperate hierarchy
		// Track initial coordinate x-positioning
		double initialX = 0;
		Iterator<Set<Object>> iter = hierarchyVertices.iterator();
		int i = 0;

		while (iter.hasNext())
		{
			Set<Object> vertexSet = iter.next();

			model = new mxGraphHierarchyModel(this, vertexSet.toArray(), roots,
					parent, false, deterministic, layoutFromSinks);

			cycleStage(parent);
			layeringStage();
			crossingStage(parent);
			initialX = placementStage(initialX, parent);

			if (fixRoots)
			{
				// Reposition roots and their hierarchies using their bounds
				// stored earlier
				Object root = fixedRoots.get(i);
				Point2D oldLocation = rootLocations.get(i);
				Point2D newLocation = graph.getModel().getGeometry(root)
						.getPoint();

				double diffX = oldLocation.getX() - newLocation.getX();
				double diffY = oldLocation.getY() - newLocation.getY();
				graph.moveCells(vertexSet.toArray(), diffX, diffY);

				// Also translate connected edges
				Set<Object> connectedEdges = affectedEdges.get(i++);
				graph.moveCells(connectedEdges.toArray(), diffX, diffY);
			}
		}
	}

	/**
	 * Executes the cycle stage. This implementation uses the
	 * mxMinimumCycleRemover.
	 */
	public void cycleStage(Object parent)
	{
		mxHierarchicalLayoutStage cycleStage = new mxMinimumCycleRemover(this);
		cycleStage.execute(parent);
	}

	/**
	 * Implements first stage of a Sugiyama layout.
	 */
	public void layeringStage()
	{
		model.initialRank();
		model.fixRanks();
	}

	/**
	 * Executes the crossing stage using mxMedianHybridCrossingReduction.
	 */
	public void crossingStage(Object parent)
	{
		mxHierarchicalLayoutStage crossingStage = new mxMedianHybridCrossingReduction(
				this);
		crossingStage.execute(parent);
	}

	/**
	 * Executes the placement stage using mxCoordinateAssignment.
	 */
	public double placementStage(double initialX, Object parent)
	{
		mxCoordinateAssignment placementStage = new mxCoordinateAssignment(
				this, intraCellSpacing, interRankCellSpacing, orientation,
				initialX, parallelEdgeSpacing);
		placementStage.setFineTuning(fineTuning);
		placementStage.execute(parent);

		return placementStage.getLimitX() + interHierarchySpacing;
	}

	/**
	 * Returns the resizeParent flag.
	 */
	public boolean isResizeParent()
	{
		return resizeParent;
	}

	/**
	 * Sets the resizeParent flag.
	 */
	public void setResizeParent(boolean value)
	{
		resizeParent = value;
	}

	/**
	 * Returns the moveParent flag.
	 */
	public boolean isMoveParent()
	{
		return moveParent;
	}

	/**
	 * Sets the moveParent flag.
	 */
	public void setMoveParent(boolean value)
	{
		moveParent = value;
	}

	/**
	 * Returns parentBorder.
	 */
	public int getParentBorder()
	{
		return parentBorder;
	}

	/**
	 * Sets parentBorder.
	 */
	public void setParentBorder(int value)
	{
		parentBorder = value;
	}

	/**
	 * @return Returns the intraCellSpacing.
	 */
	public double getIntraCellSpacing()
	{
		return intraCellSpacing;
	}

	/**
	 * @param intraCellSpacing
	 *            The intraCellSpacing to set.
	 */
	public void setIntraCellSpacing(double intraCellSpacing)
	{
		this.intraCellSpacing = intraCellSpacing;
	}

	/**
	 * @return Returns the interRankCellSpacing.
	 */
	public double getInterRankCellSpacing()
	{
		return interRankCellSpacing;
	}

	/**
	 * @param interRankCellSpacing
	 *            The interRankCellSpacing to set.
	 */
	public void setInterRankCellSpacing(double interRankCellSpacing)
	{
		this.interRankCellSpacing = interRankCellSpacing;
	}

	/**
	 * @return Returns the orientation.
	 */
	public int getOrientation()
	{
		return orientation;
	}

	/**
	 * @param orientation
	 *            The orientation to set.
	 */
	public void setOrientation(int orientation)
	{
		this.orientation = orientation;
	}

	/**
	 * @return Returns the interHierarchySpacing.
	 */
	public double getInterHierarchySpacing()
	{
		return interHierarchySpacing;
	}

	/**
	 * @param interHierarchySpacing
	 *            The interHierarchySpacing to set.
	 */
	public void setInterHierarchySpacing(double interHierarchySpacing)
	{
		this.interHierarchySpacing = interHierarchySpacing;
	}

	public double getParallelEdgeSpacing()
	{
		return parallelEdgeSpacing;
	}

	public void setParallelEdgeSpacing(double parallelEdgeSpacing)
	{
		this.parallelEdgeSpacing = parallelEdgeSpacing;
	}

	/**
	 * @return Returns the fineTuning.
	 */
	public boolean isFineTuning()
	{
		return fineTuning;
	}

	/**
	 * @param fineTuning
	 *            The fineTuning to set.
	 */
	public void setFineTuning(boolean fineTuning)
	{
		this.fineTuning = fineTuning;
	}

	/**
	 *
	 */
	public boolean isDisableEdgeStyle()
	{
		return disableEdgeStyle;
	}

	/**
	 * 
	 * @param disableEdgeStyle
	 */
	public void setDisableEdgeStyle(boolean disableEdgeStyle)
	{
		this.disableEdgeStyle = disableEdgeStyle;
	}

	/**
	 * @return Returns the deterministic.
	 */
	public boolean isDeterministic()
	{
		return deterministic;
	}

	/**
	 * @param deterministic The deterministic to set.
	 */
	public void setDeterministic(boolean deterministic)
	{
		this.deterministic = deterministic;
	}

	/**
	 * @return Returns the fixRoots.
	 */
	public boolean isFixRoots()
	{
		return fixRoots;
	}

	/**
	 * @param fixRoots The fixRoots to set.
	 */
	public void setFixRoots(boolean fixRoots)
	{
		this.fixRoots = fixRoots;
	}

	public boolean isLayoutFromSinks()
	{
		return layoutFromSinks;
	}

	public void setLayoutFromSinks(boolean layoutFromSinks)
	{
		this.layoutFromSinks = layoutFromSinks;
	}

	/**
	 * Sets the logging level of this class
	 * @param level the logging level to set
	 */
	public void setLoggerLevel(Level level)
	{
		try
		{
			logger.setLevel(level);
		}
		catch (SecurityException e)
		{
			// Probably running in an applet
		}
	}

	/**
	 * Returns <code>Hierarchical</code>, the name of this algorithm.
	 */
	public String toString()
	{
		return "Hierarchical";
	}

}
