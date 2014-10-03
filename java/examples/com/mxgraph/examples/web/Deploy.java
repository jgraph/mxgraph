/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

/**
 * Demonstrates the deployment of a graph which is created on the server side
 * and then deployed with the client library in a single response. This is done
 * by replacing the %graph% placeholder in the javascript/example/template.html
 * file with the XML representation of the graph that was created on the server.
 * 
 * Point your browser to http://localhost:8080/graph to fetch the HTML file.
 * 
 * This example returns an HTML page when the client issues a get request. The
 * readme in the java directory explains how to run this example.
 * 
 * The /javascript/examples/template.html file is used by this example. In
 * doGet a graph is created and the XML of the graph obtained by:
 * 
 *   mxCodec codec = new mxCodec();
 *   String xml = mxUtils.getXml(codec.encode(graph.getModel()));
 * 
 * The template.html is then loaded as a string and instances of %graph% are
 * replaced with the XML of the graph. In the template.html the following line
 * defines the page body:
 * 
 *   <body onload="main(document.getElementById('graphContainer'), '%graph%');">
 * 
 * So the XML string of the graph becomes the second parameter of the main
 * function. When the template.html page is loaded in the browser, the main
 * function is called and within that function these lines:
 * 
 *   var doc = mxUtils.parseXml(xml);
 *   var codec = new mxCodec(doc);
 *   codec.decode(doc.documentElement, graph.getModel());
 * 
 * insert the XML into the graph model and that graph will then display.
 */
public class Deploy extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -1046635303777463670L;

	protected String createGraph(HttpServletRequest request)
	{
		// Creates the graph on the server-side
		mxCodec codec = new mxCodec();
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{
			Object v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80,
					30);
			Object v2 = graph.insertVertex(parent, null, "World", 200, 150, 80,
					30);
			graph.insertEdge(parent, null, "", v1, v2);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		// Turns the graph into XML data
		return mxXmlUtils.getXml(codec.encode(graph.getModel()));
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		// Loads the static HTML page with the placeholder from the template
		String template = mxUtils.readFile("javascript/examples/template.html");
		String xml = createGraph(request);

		// Replaces the placeholder in the template with the XML data
		// which is then parsed into the graph model on the client.
		// In a production environment you should use a template engine.
		String page = template.replaceAll("%graph%", mxUtils.htmlEntities(xml));

		// Makes sure there is no caching on the client side
		response.setHeader("Pragma", "no-cache"); // HTTP 1.0
		response.setHeader("Cache-control", "private, no-cache, no-store");
		response.setHeader("Expires", "0");
		response.setStatus(HttpServletResponse.SC_OK);

		response.getWriter().println(page);
	}

}
