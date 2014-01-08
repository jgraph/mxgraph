/**
 * $Id: Backend.java,v 1.4 2014/01/03 12:24:27 gaudenz Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.IOException;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Request;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.AbstractHandler;
import org.mortbay.jetty.handler.DefaultHandler;
import org.mortbay.jetty.handler.HandlerList;
import org.mortbay.jetty.handler.ResourceHandler;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.ServletHolder;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

/**
 *
 */
public class Backend extends HttpServlet
{

	/**
	 * Handles save request and prints XML.
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String id = URLDecoder.decode(request.getParameter("id"), "UTF-8");
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8");

		System.out.println("Received id=" + id + " xml=" + xml);
	}

	/**
	 * Handles open request and returns XML.
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		response.setContentType("text/xml;charset=UTF-8");
		response.setHeader("Pragma", "no-cache"); // HTTP 1.0
		response.setHeader("Cache-control", "private, no-cache, no-store");
		response.setHeader("Expires", "0");

		response.getWriter().println(createGraph(request));
		response.setStatus(HttpServletResponse.SC_OK);
	}

	/**
	 * Creates a graph using the API and returns the XML.
	 */
	protected String createGraph(HttpServletRequest request) throws IOException
	{
		String id = URLDecoder.decode(request.getParameter("id"), "UTF-8");
		System.out.println("Requested id=" + id);

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

		return mxXmlUtils.getXml(codec.encode(graph.getModel()));
	}

}
