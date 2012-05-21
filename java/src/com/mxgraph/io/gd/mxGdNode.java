/**
 * $Id: mxGdNode.java,v 1.1 2010-08-25 08:36:59 gaudenz Exp $
 * Copyright (c) 2010, Gaudenz Alder, David Benson
 */
package com.mxgraph.io.gd;

import com.mxgraph.util.mxPoint;

/**
 * Represents a Node entry in the file.
 */
public class mxGdNode
{
	/**
	 * Name of the node.
	 */
	private String name;

	/**
	 * Coordinates (x,y) of the Node.
	 */
	private mxPoint coordinates;

	/**
	 * Dimensions (width, height) of the Node.
	 */
	private mxPoint dimentions;

	/**
	 * 
	 */
	public mxGdNode(String name, mxPoint coordinates, mxPoint dimentions)
	{
		this.name = name;
		this.coordinates = coordinates;
		this.dimentions = dimentions;
	}

	/**
	 * 
	 */
	public mxPoint getCoordinates()
	{
		return coordinates;
	}

	/**
	 * 
	 */
	public void setCoordinates(mxPoint coordinates)
	{
		this.coordinates = coordinates;
	}

	/**
	 * 
	 */
	public mxPoint getDimentions()
	{
		return dimentions;
	}

	/**
	 * 
	 */
	public void setDimentions(mxPoint dimentions)
	{
		this.dimentions = dimentions;
	}

	/**
	 * 
	 */
	public String getName()
	{
		return name;
	}

	/**
	 * 
	 */
	public void setName(String name)
	{
		this.name = name;
	}

	/**
	 * 
	 */
	public String getNodeString()
	{
		return name + "," + (int) coordinates.getX() + ","
				+ (int) coordinates.getY() + "," + (int) dimentions.getX()
				+ "," + (int) dimentions.getY();

	}

}
