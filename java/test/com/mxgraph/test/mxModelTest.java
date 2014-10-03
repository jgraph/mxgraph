/**
 * Copyright (c) 2006, Gaudenz Alder
 */
package com.mxgraph.test;

import junit.framework.TestCase;
import junit.framework.TestSuite;
import junit.textui.TestRunner;

import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.view.mxGraph;

public class mxModelTest extends TestCase
{

	/**
	 * Constructs a new test case for the specified name.
	 * 
	 * @param name
	 *            The name of the test case to be constructed.
	 */
	public mxModelTest(String name)
	{
		super(name);
	}

	/**
	 *
	 */
	public void test1() throws Exception
	{

		// Creates graph with model
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();
		Object v1, v2, e1;

		graph.getModel().beginUpdate();
		try
		{
			v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80, 30);
			v2 = graph.insertVertex(parent, null, "World!", 200, 150, 80, 30);
			e1 = graph.insertEdge(parent, null, "e1", v1, v2);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		mxIGraphModel model = graph.getModel();
		assertEquals(model.getTerminal(e1, true), v1);
		assertEquals(model.getTerminal(e1, false), v2);
		assertEquals(model.getParent(v1), model.getParent(v2));
		assertEquals(model.getChildCount(parent), 3);
	}

	/**
	 * The main method of the template test suite.
	 * 
	 * @param args
	 *            The array of runtime arguments.
	 */
	public static void main(String[] args)
	{
		TestRunner.runAndWait(new TestSuite(mxModelTest.class));
	}

}
