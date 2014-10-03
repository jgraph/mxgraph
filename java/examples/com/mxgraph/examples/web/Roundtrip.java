/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.Hashtable;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.w3c.dom.Document;

import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;

/**
 *
 */
public class Roundtrip extends HttpServlet
{
	/**
	 * 
	 */
	private static final long serialVersionUID = -447458689300033712L;

	/**
	 * 
	 */
	private static int counter = 0;

	/**
	 * Defines the initial XML for a new, empty diagram. Note that the diagram
	 * node is an application-level entity which contains the transaction
	 * counter (TCN) and the diagram ID. The mxGraphModel is passed to the
	 * mxGraph core classes on the client-side.
	 */
	protected static String emptyDiagram = "<diagram><mxGraphModel>"
			+ "<root>"
			+ "<Workflow value=\"Diagram\" id=\"0\">"
			+ "<mxCell/>"
			+ "</Workflow>"
			+ "<Layer value=\"Default Layer\" id=\"1\">"
			+ "<mxCell parent=\"0\"/>"
			+ "</Layer>"
			+ "<mxCell vertex=\"1\" parent=\"1\" value=\"Hello, World!\">"
			+ "<mxGeometry x=\"120\" y=\"90\" width=\"80\" height=\"40\" as=\"geometry\"/>"
			+ "</mxCell>" + "</root>" + "</mxGraphModel></diagram>";

	/**
	 * 
	 */
	protected static Map<String, Document> diagrams = new Hashtable<String, Document>();

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8");
		Document current = mxXmlUtils.parseXml(xml);
		String tcn = current.getDocumentElement().getAttribute("tcn");
		String id = current.getDocumentElement().getAttribute("id");
		//System.out.println("POST: id=" + id + " tcn=" + tcn);

		if (id == null || id.length() == 0)
		{
			// Creates an ID and initializes the transaction counter (TCN)
			id = String.valueOf(counter++);
			tcn = "0";
		}
		else
		{
			// Saves an existing diagram for the given ID in the store. Note
			// that in production there would be a chec if the current user
			// has access to this diagram.
			Document stored = diagrams.get(id);
			String storedTcn = stored.getDocumentElement().getAttribute("tcn");

			// Handles conflicts "first come first serve" style. In production
			// you have to make sure to properly deal with critical sections here.
			if (Integer.parseInt(storedTcn) > Integer.parseInt(tcn))
			{
				response.setStatus(HttpServletResponse.SC_CONFLICT);
				response.getWriter().println(
						"Diagram was changed by another user.");

				return;
			}
			else
			{
				// Increments the TCN by one
				tcn = String.valueOf(Integer.parseInt(tcn) + 1);
			}
		}

		// Updates the TCN and ID in the diagram and puts it into the store
		current.getDocumentElement().setAttribute("tcn", tcn);
		current.getDocumentElement().setAttribute("id", id);
		diagrams.put(id, current);

		// Sends the possibly new ID and the incremented TCN to the client
		response.setStatus(HttpServletResponse.SC_OK);
		response.getWriter().println(
				"<result id=\"" + id + "\" tcn=\"" + tcn + "\"/>");
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String id = request.getParameter("id");

		if (id != null)
		{
			// Gets the diagram for the given ID from the store. All unexisting
			// IDs will create a new diagram where the ID is created after the
			// first save on the server-side. Note that in production there
			// would be a check if the current user has access to this diagram.
			Document diagram = diagrams.get(id);
			String xml = null;

			// Fetches the diagram for the given ID or delivers the
			// XML for a new, empty diagram
			if (diagram != null)
			{
				xml = mxXmlUtils.getXml(diagram.getDocumentElement());
			}
			else
			{
				xml = emptyDiagram;
			}

			// Loads the static HTML page with the placeholder from the template
			String template = mxUtils.readFile(Roundtrip.class.getResource(
					"/com/mxgraph/examples/web/resources/roundtrip.html")
					.getPath());
			
			// Replaces the placeholder in the template with the XML data
			// which is then parsed into the graph model on the client.
			// In a production environment you should use a template engine.
			String page = template.replaceAll("%graph%", mxUtils
					.htmlEntities(xml));

			// Makes sure there is no caching on the client side
			response.setHeader("Pragma", "no-cache"); // HTTP 1.0
			response.setHeader("Cache-control", "private, no-cache, no-store");
			response.setHeader("Expires", "0");
			response.setStatus(HttpServletResponse.SC_OK);

			response.getWriter().println(page);
		}
		else
		{
			response.getWriter().println(
					"<a href=\"?id=new\">Create diagram</a><br>");

			for (Document doc : diagrams.values())
			{
				String diagramId = doc.getDocumentElement().getAttribute("id");
				response.getWriter().println(
						"<a href=\"?id=" + diagramId + "\">Diagram "
								+ diagramId + "</a><br>");
			}
		}
	}
}
