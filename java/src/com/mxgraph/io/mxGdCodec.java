/**
 * $Id: mxGdCodec.java,v 1.1 2010-08-25 08:36:59 gaudenz Exp $
 * Copyright (c) 2010, Gaudenz Alder, David Benson
 */
package com.mxgraph.io;

import com.mxgraph.io.gd.mxGdDocument;
import com.mxgraph.io.gd.mxGdEdge;
import com.mxgraph.io.gd.mxGdNode;
import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxGeometry;
import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxPoint;
import com.mxgraph.view.mxGraph;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Parses a GD .txt file and imports it in the given graph.<br/>
 * This class depends from the classes contained in
 * com.mxgraph.io.gd.
 */
public class mxGdCodec
{
	/**
	 * Map with the vertex cells added in the addNode method.
	 */
	private static HashMap<String, Object> cellsMap = new HashMap<String, Object>();

	/**
	 * Returns the coordinates of the left top corner of the node.
	 * @param node Node
	 * @return mxPoint that represent the coordinates.
	 */
	private static mxPoint getOriginPoint(mxGdNode node)
	{
		mxPoint coord = node.getCoordinates();
		mxPoint dim = node.getDimentions();

		double x = coord.getX() - dim.getX() / 2;
		double y = coord.getY() - dim.getY() / 2;

		return new mxPoint(x, y);
	}

	/**
	 * Adds a new vertex to the graph.
	 * @param graph Graph where the vertex is added.
	 * @param parent Parent of the vertex to add.
	 * @param node Node
	 * @return Returns the vertex added.
	 */
	private static mxCell addNode(mxGraph graph, Object parent, mxGdNode node)
	{

		mxPoint cordenates = getOriginPoint(node);
		mxPoint dimentions = node.getDimentions();

		//Set the node name as label.
		String label = node.getName();

		//Set the node name as ID.
		String id = node.getName();

		//Insert a new vertex in the graph
		mxCell v1 = (mxCell) graph.insertVertex(parent, id, label,
				cordenates.getX(), cordenates.getY(), dimentions.getX(),
				dimentions.getY());

		cellsMap.put(node.getName(), v1);

		return v1;
	}

	/**
	 * Returns the string that represents the content of a given style map.
	 * @param styleMap Map with the styles values
	 * @return string that represents the style.
	 */
	private static String getStyleString(Map<String, Object> styleMap,
			String asig)
	{
		String style = "";
		Iterator<Object> it = styleMap.values().iterator();
		Iterator<String> kit = styleMap.keySet().iterator();

		while (kit.hasNext())
		{
			String key = kit.next();
			Object value = it.next();
			style = style + key + asig + value + ";";
		}
		return style;
	}

	/**
	 * Analizes a edge shape and returns a string with the style.
	 * @return style read from the edge shape.
	 */
	private static String getEdgeStyle()
	{
		Hashtable<String, Object> styleMap = new Hashtable<String, Object>();

		//Defines Edge Style
		//Defines if line is rounding
		styleMap.put(mxConstants.STYLE_ROUNDED, false);

		return getStyleString(styleMap, "=");
	}

	/**
	 * Adds a new edge to the graph.
	 * @param graph Graph where the edge is added.
	 * @param parent Parent of the edge to add.
	 * @param node Node
	 * @return Returns the edge added.
	 */
	private static mxCell addEdge(mxGraph graph, Object parent, mxGdEdge edge)
	{

		//Get source and target vertex
		Object source = cellsMap.get(edge.getSourceName());
		Object target = cellsMap.get(edge.getTargetName());

		//Defines style of the edge.
		String style = getEdgeStyle();

		//Insert new edge and set constraints.
		mxCell e = (mxCell) graph.insertEdge(parent, null, "", source, target,
				style);

		return e;
	}

	/**
	 * Recieves a mxGDDocument document and parses it generating a new graph that is inserted in graph.
	 * @param document GD to be parsed
	 * @param graph Graph where the parsed graph is included.
	 */
	public static void decode(mxGdDocument document, mxGraph graph)
	{

		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();

		//Add nodes.
		List<mxGdNode> nodes = document.getNodes();

		for (mxGdNode node : nodes)
		{
			addNode(graph, parent, node);
		}

		//Add Edges.
		List<mxGdEdge> edges = document.getEdges();

		for (mxGdEdge edge : edges)
		{
			addEdge(graph, parent, edge);
		}

		graph.getModel().endUpdate();

	}

	/**
	 * Returns a GD document with the data of the vertexes and edges in the graph.
	 * @param document GD document where the elements are put.
	 * @param parent Parent cell of the vertexes and edges to be added.
	 * @param graph Graph that contains the vertexes and edges.
	 * @return Returns the document with the elements added.
	 */
	private static mxGdDocument encodeNodesAndEdges(mxGdDocument document,
			Object parent, mxGraph graph, mxPoint parentCoord)
	{
		Object[] vertexes = graph.getChildVertices(parent);

		List<mxGdEdge> GDedges = document.getEdges();
		GDedges = encodeEdges(GDedges, parent, graph);
		document.setEdges(GDedges);

		for (Object vertex : vertexes)
		{
			List<mxGdNode> GDnodes = document.getNodes();

			mxCell v = (mxCell) vertex;
			mxGeometry geom = v.getGeometry();

			String id = v.getId();

			mxPoint coord = new mxPoint(parentCoord.getX() + geom.getCenterX(),
					parentCoord.getY() + geom.getCenterY());
			mxPoint dim = new mxPoint(geom.getWidth(), geom.getHeight());

			mxPoint cornerCoord = new mxPoint(parentCoord.getX() + geom.getX(),
					parentCoord.getY() + geom.getY());

			mxGdNode GDnode = new mxGdNode(id, coord, dim);
			GDnodes.add(GDnode);
			document.setNodes(GDnodes);

			document = encodeNodesAndEdges(document, vertex, graph, cornerCoord);
		}
		return document;
	}

	/**
	 * Returns a list of mxGDEdge with the data of the edges in the graph.
	 * @param GDedges List where the elements are put.
	 * @param parent Parent cell of the edges to be added.
	 * @param graph Graph that contains the edges.
	 * @return Returns the list GDedges with the elements added.
	 */
	private static List<mxGdEdge> encodeEdges(List<mxGdEdge> GDedges,
			Object parent, mxGraph graph)
	{
		Object[] edges = graph.getChildEdges(parent);
		for (Object edge : edges)
		{
			mxCell e = (mxCell) edge;
			mxCell source = (mxCell) e.getSource();
			mxCell target = (mxCell) e.getTarget();

			String sourceName = "";
			String targetName = "";

			sourceName = source.getId();

			targetName = target.getId();

			mxGdEdge GDedge = new mxGdEdge(sourceName, targetName);

			GDedges.add(GDedge);
		}
		return GDedges;
	}

	/**
	 * Generates a GD document with the cells in the graph.
	 * The actual implementation only uses the cells located in the first level.
	 * @param graph Graph with the cells.
	 * @return The GD document generated.
	 */
	public static mxGdDocument encode(mxGraph graph)
	{
		Object parent = graph.getDefaultParent();
		mxGdDocument document = new mxGdDocument();

		//Adds Nodes and Edges.
		document = encodeNodesAndEdges(document, parent, graph, new mxPoint(0,
				0));

		return document;
	}
}
