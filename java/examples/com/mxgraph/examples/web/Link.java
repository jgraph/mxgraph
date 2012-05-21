package com.mxgraph.examples.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.mortbay.jetty.Request;
import org.w3c.dom.Document;

import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.view.mxGraph;

public class Link extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 6372620357515370122L;

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		// Creates graph with model
		mxGraph graph = new mxGraph()
		{
			public String getLinkForCell(Object cell)
			{
				return "http://www.mxgraph.com";
			}

			public String getTargetForCell(Object cell)
			{
				return "_blank";
			}
		};

		// Adds cells into the model
		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{
			Object v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80,
					30);
			Object v2 = graph.insertVertex(parent, null, "World!", 240, 150,
					80, 30, "shape=cloud");
			graph.insertEdge(parent, null, "e1", v1, v2,
					"labelBackgroundColor=white;labelBorderColor=green;");
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		Document doc = null;
		String agent = request.getHeader("User-Agent");

		// Creates VML or SVG depending on the User-Agent
		if (agent != null && agent.contains("Gecko"))
		{
			doc = mxCellRenderer.createSvgDocument(graph, null, 1, null, null);
		}
		else if (agent != null && agent.contains("MSIE"))
		{
			doc = mxCellRenderer.createVmlDocument(graph, null, 1, null, null);
		}
		else
		{
			doc = mxCellRenderer.createHtmlDocument(graph, null, 1, null, null);
		}

		try
		{
			TransformerFactory.newInstance().newTransformer().transform(
					new DOMSource(doc),
					new StreamResult(response.getOutputStream()));
		}
		catch (Exception e)
		{
			throw new ServletException(e);
		}

		response.setStatus(HttpServletResponse.SC_OK);
		((Request) request).setHandled(true);
	}

}
