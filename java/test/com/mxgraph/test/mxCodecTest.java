/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
package com.mxgraph.test;

import java.util.Hashtable;
import java.util.Map;

import junit.framework.TestCase;
import junit.framework.TestSuite;
import junit.textui.TestRunner;

import org.w3c.dom.Document;
import org.w3c.dom.Node;

import com.mxgraph.io.mxCodec;
import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxDomUtils;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

public class mxCodecTest extends TestCase
{

	/**
	 * Constructs a new test case for the specified name.
	 * 
	 * @param name
	 *            The name of the test case to be constructed.
	 */
	public mxCodecTest(String name)
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
		Object v1, v2;

		graph.getModel().beginUpdate();
		try
		{
			v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80, 30);
			v2 = graph.insertVertex(parent, null, "World!", 200, 150, 80, 30);
			graph.insertEdge(parent, null, "e1", v1, v2);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		mxCodec codec = new mxCodec();
		Node node = codec.encode(graph.getModel());
		String xml1 = mxXmlUtils.getXml(node);

		System.out.println("xml=" + mxUtils.getPrettyXml(node));

		Document doc = mxDomUtils.createDocument();
		doc.appendChild(doc.importNode(node, true));
		codec = new mxCodec(doc);
		Object model = codec.decode(node);

		codec = new mxCodec();
		node = codec.encode(model);
		String xml2 = mxXmlUtils.getXml(node);

		assertEquals(xml1, xml2);
	}

	/**
	 *
	 */
	@SuppressWarnings("unchecked")
	public void test2() throws Exception
	{
		Map<String, Object> map = new Hashtable<String, Object>();
		map.put("a", "b");
		map.put("b", new mxCell("Hello, World!"));

		mxCodec codec = new mxCodec();
		Node node = codec.encode(map);
		String xml1 = mxXmlUtils.getXml(node);

		codec = new mxCodec();
		Map<String, Object> map2 = (Hashtable<String, Object>) codec
				.decode(node);

		codec = new mxCodec();
		node = codec.encode(map2);
		String xml2 = mxXmlUtils.getXml(node);

		assertEquals(xml1, xml2);
		assertEquals(map.size(), map2.size());
		assertEquals(map.get("a"), map2.get("a"));
	}

	/**
	 * The main method of the template test suite.
	 * 
	 * @param args
	 *            The array of runtime arguments.
	 */
	public static void main(String[] args)
	{
		TestRunner.runAndWait(new TestSuite(mxCodecTest.class));
	}

}
