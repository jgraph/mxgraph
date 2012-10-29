/**
 * $Id: mxAnalysisUtils.java,v 1.3 2012-10-11 10:33:43 david Exp $
 * Copyright (c) 2012, JGraph Ltd
 */
package com.mxgraph.analysis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.view.mxGraph;

/**
 * Implements a collection of utility methods abstracting the graph structure
 * taking into account graph properties such as visible/non-visible traversal
 */
public class mxAnalysisUtils
{
	public static final Map<String, Object> emptyProps = new HashMap<String, Object>();

	/**
	 * 
	 * @param graph
	 * @param cell
	 * @param parent
	 * @param incoming
	 * @param outgoing
	 * @param includeLoops
	 * @param recurse
	 * @param properties
	 * @return
	 */
	public static Object[] getEdges(mxGraph graph, Object cell, Object parent,
			boolean incoming, boolean outgoing, boolean includeLoops,
			boolean recurse, Map<String, Object> properties)
	{
		if (!mxGraphProperties.isTraverseVisible(properties, mxGraphProperties.DEFAULT_TRAVERSE_VISIBLE))
		{
			return graph.getEdges(cell, parent, incoming, outgoing,
					includeLoops, recurse);
		}
		else
		{
			Object[] edges = graph.getEdges(cell, parent, incoming, outgoing,
					includeLoops, recurse);
			mxIGraphModel model = graph.getModel();
			List<Object> result = new ArrayList<Object>(edges.length);

			for (int i = 0; i < edges.length; i++)
			{
				Object source = model.getTerminal(edges[i], true);
				Object target = model.getTerminal(edges[i], false);

				if (((includeLoops && source == target)
						|| ((source != target) && ((incoming && target == cell) || (outgoing && source == cell)))) && model.isVisible(edges[i]))
				{
					result.add(edges[i]);
				}
			}

			return result.toArray();
		}
	};

	/**
	 * 
	 * @param graph
	 * @param parent
	 * @param properties
	 * @return
	 */
	public static Object[] getChildVertices(mxGraph graph, Object parent, Map<String, Object>properties)
	{
		return graph.getChildVertices(parent);
	}
	
	/**
	 * 
	 * @param graph
	 * @param edge
	 * @param isSource
	 * @param properties
	 * @return
	 */
	public static Object getTerminal(mxGraph graph, Object edge, boolean isSource, Map<String, Object> properties)
	{
		return graph.getModel().getTerminal(edge, isSource);
	}
	
	/**
	 * Returns all distinct opposite cells for the specified terminal
	 * on the given edges.
	 * 
	 * @param edges Edges whose opposite terminals should be returned.
	 * @param terminal Terminal that specifies the end whose opposite should be
	 * returned.
	 * @param sources Specifies if source terminals should be included in the
	 * result.
	 * @param targets Specifies if target terminals should be included in the
	 * result.
	 * @return Returns the cells at the opposite ends of the given edges.
	 */
	public static Object[] getOpposites(mxGraph graph, Object[] edges, Object terminal,
			boolean sources, boolean targets, Map<String, Object> properties)
	{
		return graph.getOpposites(edges, terminal, sources, targets);
	}
}
