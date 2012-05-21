/**
 * $Id: Share.java,v 1.9 2012-01-13 12:40:38 david Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;

import org.mortbay.jetty.Request;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.mxgraph.io.mxCodecRegistry;
import com.mxgraph.model.mxGraphModel;
import com.mxgraph.model.mxICell;
import com.mxgraph.sharing.mxSession;
import com.mxgraph.sharing.mxSharedGraphModel;
import com.mxgraph.sharing.mxSharedState;
import com.mxgraph.util.mxXmlUtils;

/**
 * This servlet demonstrates the sharing of diagrams across a number of
 * clients. The servlet itself does not have an object representation of the
 * graph in memory, it only serves as a dispatcher for the XML among the
 * clients.
 * 
 * To integrate sharing with a client application, an mxSession must be created
 * and configured to handle cell identities and more. This is all done in the
 * mxEditor.connect method, which returns the session object being used to
 * connect the model to the backend. Note that it is possible to attach
 * multiple sessions to one editor and graph model.
 * 
 * When the graph model is changed in a shared client, the changes are encoded
 * into XML and then sent to the server in a POST request. The server then gets
 * a list of clients which are connected to the same diagram, and sends the
 * encoded changes to those clients. (Note that the sender will not get
 * notified of his own changes in the default mode.)
 * 
 * When the client receives such a set of changes, it decodes them and executes
 * them on its local model, bypassing the command history of local changes.
 * This means the client immediately sees the changes, but pressing undo will
 * only undo the last local change of that specific client.
 * 
 * To use the example, the respective session URLs must be assigned in the
 * mxEditor either programmatically or by use of the same config file as above.
 * Note that it is possible to integrate both, image creating and diagram
 * sharing into the same client by assigning the respective attributes in the
 * mxEditor node in the config file. For diagram sharing, the following
 * member variables are used: mxEditor.urlInit, mxEditor.urlPoll and
 * mxEditor.urlNotify.
 */
public class Share extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -3367340615965785051L;

	/**
	 * 
	 */
	protected static String SESSION_ID = "MXSESSIONID";

	/**
	 * Set this to true to create a model instance on the server side and keep
	 * it in sync with the client's model. If this is false then the server
	 * stores the initial state and all deltas separately without having a
	 * synced server-side model instance.
	 */
	protected static boolean useSharedModel = false;

	/**
	 * 
	 */
	protected static mxSharedState sharedResource = (useSharedModel) ? new mxSharedGraphModel(
			new mxGraphModel()
			{
				protected Object valueForCellChanged(Object cell, Object value)
				{
					Object previous = ((mxICell) cell).getValue();

					if (!(value instanceof Node) && previous instanceof Element)
					{
						Object tmp = ((Element) previous).getAttribute("label");

						if (value == null)
						{
							((Element) previous).removeAttribute("label");
						}
						else
						{
							((Element) previous).setAttribute("label",
									String.valueOf(value));
						}

						previous = tmp;
					}
					else
					{
						((mxICell) cell).setValue(value);
					}

					return previous;
				}
			})
			: new mxSharedState(
					"<mxGraphModel><root><Workflow label=\"Diagram\" id=\"0\"></Workflow><Layer "
							+ "label=\"Default Layer\" id=\"1\"><mxCell parent=\"0\" /></Layer></root></mxGraphModel>");

	// Associates the graph model codec with the above anonymous class
	static
	{
		mxCodecRegistry.addAlias("com.mxgraph.examples.web.Share$1",
				"mxGraphModel");
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8");
		mxSession session = getSession(request);

		Document doc = mxXmlUtils.parseXml(xml);
		session.receive(doc.getDocumentElement());

		response.setStatus(HttpServletResponse.SC_OK);
		//System.out.println(session.getId() + " post xml=" + xml);
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		mxSession session = getSession(request);
		PrintWriter res = response.getWriter();
		String query = getQueryString(request);

		// Redirects the client to the actual static diagram editor. The diagram editor
		// loads the configuration which contains one hook to request more configuration
		// data at the server. This request is implemented in Config.java to deliver the
		// configuration required to access this servlet for sharing and Export.java for
		// creating images.
		if (query.equalsIgnoreCase("start"))
		{
			response.sendRedirect("/mxgraph/javascript/examples/editors/diagrameditor.html");
			((Request) request).setHandled(true);
		}
		else if (query.equalsIgnoreCase("reset"))
		{
			sharedResource.resetDelta();
			res.println("Diagram reset");
		}
		else
		{
			response.setContentType("text/xml;charset=UTF-8");
			response.setHeader("Pragma", "no-cache"); // HTTP 1.0
			response.setHeader("Cache-control", "private, no-cache, no-store");
			response.setHeader("Expires", "0");

			if (query.equalsIgnoreCase("init"))
			{
				String xml = session.init();
				//System.out
				//		.println("session " + session.getId() + " xml=" + xml);
				res.println(xml);
			}
			else
			{
				try
				{
					String xml = session.poll();
					//System.out.println("session " + session.getId() + " xml="
					//		+ xml);
					res.println(xml);
				}
				catch (InterruptedException e)
				{
					throw new ServletException(e);
				}
			}
		}

		response.setStatus(HttpServletResponse.SC_OK);
	}

	/**
	 * Helper method that never returns null. If there is no query in the given
	 * request then an empty string will be returned.
	 */
	protected String getQueryString(HttpServletRequest request)
	{
		String query = request.getQueryString();

		if (query == null)
		{
			query = "";
		}

		return query;
	}

	/**
	 * Returns the session for the given request.
	 */
	protected mxSession getSession(HttpServletRequest req)
	{
		HttpSession httpSession = req.getSession(true);
		mxSession session = (mxSession) httpSession.getAttribute(SESSION_ID);

		if (session == null)
		{
			session = new mxBoundSession(httpSession.getId(), sharedResource);
			httpSession.setAttribute(SESSION_ID, session);
			httpSession.setMaxInactiveInterval(20);
		}

		return session;
	}

	/**
	 * Implements a session with some lifecycle debugging output.
	 */
	public class mxBoundSession extends mxSession implements
			HttpSessionBindingListener
	{

		public mxBoundSession(String id, mxSharedState diagram)
		{
			super(id, diagram);
		}

		public void valueBound(HttpSessionBindingEvent arg0)
		{
			//System.out.println("session " + id + " created");
		}

		public void valueUnbound(HttpSessionBindingEvent arg0)
		{
			//System.out.println("session " + id + " destroyed");
			destroy();
		}

	}

}
