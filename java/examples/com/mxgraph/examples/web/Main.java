package com.mxgraph.examples.web;

import java.io.IOException;

import javax.servlet.ServletException;
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

import com.mxgraph.util.mxUtils;

public class Main
{

	public static int PORT = 8080;

	public static void main(String[] args) throws Exception
	{
		Server server = new Server(PORT);
		
		// Static file handler
		Context fileContext = new Context(server, "/mxgraph", Context.SESSIONS);
		ResourceHandler fileHandler = new ResourceHandler();
		fileHandler.setResourceBase(".");
		fileContext.setHandler(fileHandler);

		// Servlets
		Context context = new Context(server, "/", Context.SESSIONS);
		context.addServlet(new ServletHolder(new Roundtrip()), "/Roundtrip");
		context.addServlet(new ServletHolder(new ServerView()), "/ServerView");
		context.addServlet(new ServletHolder(new ExportServlet()), "/Export");
		context.addServlet(new ServletHolder(new EchoServlet()), "/Echo");
		context.addServlet(new ServletHolder(new Deploy()), "/Deploy");
		context.addServlet(new ServletHolder(new Link()), "/Link");
		context.addServlet(new ServletHolder(new EmbedImage()), "/EmbedImage");
		context.addServlet(new ServletHolder(new Backend()), "/Backend");

		HandlerList handlers = new HandlerList();
		handlers.setHandlers(new Handler[] { new RedirectHandler(),
				fileContext, context, new DefaultHandler() });
		server.setHandler(handlers);

		System.out.println("Go to http://localhost:" + PORT + "/");
		
		server.start();
		server.join();
	}

	/**
	 * Handles some special redirects for the Java server examples.
	 */
	public static class RedirectHandler extends AbstractHandler
	{

		public void handle(String target, HttpServletRequest request,
				HttpServletResponse response, int dispatch) throws IOException,
				ServletException
		{
			if (target.toLowerCase().endsWith(".xml"))
			{
				// Forces the browser to not cache any XML files
				response.setContentType("text/xml;charset=UTF-8");
				response.setHeader("Pragma", "no-cache"); // HTTP 1.0
				response.setHeader("Cache-control",
						"private, no-cache, no-store");
				response.setHeader("Expires", "0");
			}
			else if (target.equalsIgnoreCase("/")
					|| target.equalsIgnoreCase("/index.html"))
			{
				// Gets the file contents for the index.html file
				String filename = Main.class.getResource(
						"/com/mxgraph/examples/web/resources/index.html")
						.getPath();
				response.getWriter().write(mxUtils.readFile(filename));
				response.setStatus(HttpServletResponse.SC_OK);
				((Request) request).setHandled(true);
			}
			else if (target.equalsIgnoreCase("/export.html"))
			{
				// Gets the file contents for the index.html file
				String filename = Main.class.getResource(
						"/com/mxgraph/examples/web/resources/export.html")
						.getPath();
				response.getWriter().write(mxUtils.readFile(filename));
				response.setStatus(HttpServletResponse.SC_OK);
				((Request) request).setHandled(true);
			}
			else if (target.equalsIgnoreCase("/frontend.html"))
			{
				// Gets the file contents for the index.html file
				String filename = Main.class.getResource(
						"/com/mxgraph/examples/web/resources/frontend.html")
						.getPath();
				response.getWriter().write(mxUtils.readFile(filename));
				response.setStatus(HttpServletResponse.SC_OK);
				((Request) request).setHandled(true);
			}
		}

	}

}
