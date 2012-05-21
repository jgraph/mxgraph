/**
 * $Id: mxGdDocument.java,v 1.2 2011-01-31 12:13:34 david Exp $
 * Copyright (c) 2010, Gaudenz Alder, David Benson
 */
package com.mxgraph.io.gd;

import com.mxgraph.util.mxPoint;
import java.io.BufferedReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * This class is a representation of a GD file.<br/>
 * Allows access to the nodes and edges of the graph.
 */
public class mxGdDocument
{
	/**
	 * Represents the different states in the parse of a file.
	 */
	public enum mxGDParseState
	{
		START, PARSING_NODES, PARSING_EDGES
	}

	private List<mxGdNode> nodes = new ArrayList<mxGdNode>();

	private List<mxGdEdge> edges = new ArrayList<mxGdEdge>();

	/**
	 * @return Returns the list of edges.
	 */
	public List<mxGdEdge> getEdges()
	{
		return edges;
	}

	/**
	 * @return Returns the list of nodes.
	 */
	public List<mxGdNode> getNodes()
	{
		return nodes;
	}

	public void setEdges(List<mxGdEdge> edges)
	{
		this.edges = edges;
	}

	public void setNodes(List<mxGdNode> nodes)
	{
		this.nodes = nodes;
	}

	/**
	 * Parses the String with the file content and loads into the document,
	 * the data of nodes and edges.
	 * @param gd String with the file content.
	 */
	public void parse(String gd)
	{
		gd = gd.trim();
		BufferedReader br = new BufferedReader(new StringReader(gd));
		mxGDParseState state = mxGDParseState.START;
		try
		{
			String line = br.readLine();
			while (line != null)
			{
				switch (state)
				{
					case START:
					{
						if (line.startsWith("# Nodes"))
						{
							state = mxGDParseState.PARSING_NODES;
						}
						else
						{
							throw new Exception("Error in parsing");
						}
						break;
					}
					case PARSING_NODES:
					{
						if (line.startsWith("# Edges"))
						{
							state = mxGDParseState.PARSING_EDGES;
						}
						else if (!line.equals(""))
						{
							String[] items = line.split(",");
							if (items.length != 5)
							{
								throw new Exception("Error in parsing");
							}
							else
							{
								double x = Double.valueOf(items[1]);
								double y = Double.valueOf(items[2]);
								double width = Double.valueOf(items[3]);
								double height = Double.valueOf(items[4]);
								mxGdNode node = new mxGdNode(items[0],
										new mxPoint(x, y), new mxPoint(width,
												height));
								nodes.add(node);
							}
						}
						break;
					}
					case PARSING_EDGES:
					{
						if (!line.equals(""))
						{
							String[] items = line.split(",");
							if (items.length != 2)
							{
								throw new Exception("Error in parsing");
							}
							else
							{
								String source = items[0];
								String target = items[1];
								mxGdEdge edge = new mxGdEdge(source, target);
								edges.add(edge);
							}
						}
						break;
					}
				}

				line = br.readLine();
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	/**
	 * @return Returns the String representation of the document.
	 */
	public String getDocumentString()
	{
		StringBuilder buf = new StringBuilder("# Nodes\n");

		for (mxGdNode node : nodes)
		{
			buf.append(node.getNodeString());
			buf.append("\n");
		}
		
		buf.append("# Edges\n");
		
		for (mxGdEdge edge : edges)
		{
			buf.append(edge.getEdgeString());
			buf.append("\n");
		}
		
		return buf.toString();
	}

}
