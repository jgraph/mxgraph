/**
 * $Id: mxTraversal.java,v 1.5 2012-10-11 10:50:30 david Exp $
 * Copyright (c) 2011-2012, JGraph Ltd
 */
package com.mxgraph.analysis;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Set;

import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;
import com.mxgraph.view.mxGraph.mxICellVisitor;

/**
 * Implements a collection of utility methods for traversing the
 * graph structure. This does not include tree traversal methods.
 */
public class mxTraversal
{
	
	/**
	 * Implements a recursive depth first search starting from the specified
	 * cell. Process on the cell is performing by the visitor class passed in.
	 * The visitor has access to the current cell and the edge traversed to
	 * find this cell. Every cell is processed once only.
	 * <pre>
	 * mxTraversal.bfs(graph, startVertex, new mxICellVisitor()
	 * {
	 * 	public boolean visit(Object vertex, Object edge)
	 * 	{
	 * 		// perform your processing on each cell here
	 *		return false;
	 *	}
	 * });
	 * </pre>
	 * @param graph the graph 
	 * @param cell
	 * @param edge
	 * @param seen
	 * @param visitor
	 */
	public static void dfs(mxGraph graph, Object cell, Object edge, Set<Object> seen, mxICellVisitor visitor, Map<String, Object> properties)
	{
		if (cell != null)
		{
			// We only process each cell once
			if (!seen.contains(cell))
			{
				// The visitor receives the current cell and the edge traversed
				// to get to this cell.
				visitor.visit(cell, edge);
				seen.add(cell);

				// Copy the connects as source list so that visitors
				// can change the original for edge direction inversions
				final Object[] outgoingEdges = mxAnalysisUtils.getEdges(graph, cell, null, false, true, false, false, properties);

				for (int i = 0; i < outgoingEdges.length; i++)
				{
					// Root check is O(|roots|)
					dfs(graph, mxAnalysisUtils.getTerminal(graph, outgoingEdges[i], false, properties), outgoingEdges[i], seen, visitor , properties);
				}
			}
		}
	}

	/**
	 * 
	 * @param graph
	 * @param cell
	 * @param visitor
	 */
	//TODO add visibility option
	public static void bfs(mxGraph graph, Object cell, mxICellVisitor visitor, Map<String, Object> properties)
	{
		if (graph != null && cell != null && visitor != null)
		{
			Set<Object> queued = new HashSet<Object>();
			LinkedList<Object[]> queue = new LinkedList<Object[]>();
			Object[] q = { cell, null };
			queue.addLast(q);
			queued.add(cell);

			bfsRec(graph, queued, queue, visitor, properties);
		}
	}

	/**
	 * 
	 * @param graph
	 * @param queued
	 * @param queue
	 * @param visitor
	 */
	private static void bfsRec(mxGraph graph, Set<Object> queued, LinkedList<Object[]> queue, mxICellVisitor visitor, Map<String, Object> properties)
	{
		if (queue.size() > 0)
		{
			Object[] q = queue.removeFirst();
			Object cell = q[0];
			Object incomingEdge = q[1];
			
			visitor.visit(cell, incomingEdge);

			final Object[] outgoingEdges = mxAnalysisUtils.getEdges(graph, cell, null, false, true, false, false, properties);

			for (int i = 0; i < outgoingEdges.length; i++)
			{
				mxCell currEdge = (mxCell) outgoingEdges[i];
				Object target = currEdge.getTarget();
				
				if (!queued.contains(target))
				{
					Object[] current = { target, outgoingEdges[i] };
					queue.addLast(current);
					queued.add(target);
				}
			}

			bfsRec(graph, queued, queue, visitor, properties);
		}
	}
}
