/**
 * $Id: mxGdEdge.java,v 1.1 2010-08-25 08:36:59 gaudenz Exp $
 * Copyright (c) 2010, Gaudenz Alder, David Benson
 */
package com.mxgraph.io.gd;

/**
 * Represents an Edge entry in the file.
 */
public class mxGdEdge
{
	/**
	 * Name of the source node.
	 */
	private String sourceName;

	/**
	 * Name of the target node.
	 */
	private String targetName;

	/**
	 * 
	 */
	public mxGdEdge(String sourceName, String targetName)
	{
		this.sourceName = sourceName;
		this.targetName = targetName;
	}

	/**
	 * 
	 */
	public String getSourceName()
	{
		return sourceName;
	}

	/**
	 * 
	 */
	public void setSourceName(String sourceName)
	{
		this.sourceName = sourceName;
	}

	/**
	 * 
	 */
	public String getTargetName()
	{
		return targetName;
	}

	/**
	 * 
	 */
	public void setTargetName(String targetName)
	{
		this.targetName = targetName;
	}

	/**
	 * 
	 */
	public String getEdgeString()
	{
		return sourceName + "," + targetName;

	}

}
