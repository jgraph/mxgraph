package com.mxgraph.analysis;

import java.util.Map;

import com.mxgraph.util.mxUtils;

/**
 * Constants for graph structure properties
 */
public class mxGraphProperties
{

	/**
	 * Whether or not to navigate the graph raw graph structure or 
	 * the visible structure. The value associated with this key
	 * should evaluate as a string to <code>1</code> or 
	 * <code>0</code>
	 */
	public static String TRAVERSE_VISIBLE = "traverseVisible";
	
	public static boolean DEFAULT_TRAVERSE_VISIBLE = false;

	/**
	 * Whether or not to take into account the direction on edges. 
	 * The value associated with this key should evaluate as a 
	 * string to <code>1</code> or <code>0</code>
	 */
	public static String DIRECTED = "directed";
	
	public static boolean DEFAULT_DIRECTED = false;

	/**
	 * 
	 * @param properties
	 * @return
	 */
	public static boolean isTraverseVisible(Map<String, Object> properties, boolean defaultValue)
	{
		if (properties != null)
		{
			return mxUtils.isTrue(properties, TRAVERSE_VISIBLE, defaultValue);
		}

		return false;
	}

	/**
	 * 
	 * @param properties
	 * @param isTraverseVisible
	 */
	public static void setTraverseVisible(Map<String, Object> properties,
			boolean isTraverseVisible)
	{
		if (properties != null)
		{
			properties.put(TRAVERSE_VISIBLE, isTraverseVisible);
		}
	}

	/**
	 * 
	 * @param properties
	 * @return
	 */
	public static boolean isDirected(Map<String, Object> properties, boolean defaultValue)
	{
		if (properties != null)
		{
			return mxUtils.isTrue(properties, DIRECTED, defaultValue);
		}

		return false;
	}

	/**
	 * 
	 * @param properties
	 * @param isTraverseVisible
	 */
	public static void setDirected(Map<String, Object> properties,
			boolean isDirected)
	{
		if (properties != null)
		{
			properties.put(DIRECTED, isDirected);
		}
	}

}
