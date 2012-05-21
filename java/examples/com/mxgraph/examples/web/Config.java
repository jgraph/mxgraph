package com.mxgraph.examples.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mxgraph.util.mxUtils;

/**
 * Allows to provide a client with a backend specific configuration. See
 * javascript/examples/editors/config/diagrameditor.xml for more details.
 */
public class Config extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 8570324879191595944L;

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String filename = Main.class
				.getResource(
						"/com/mxgraph/examples/web/resources/diagrameditor-backend.xml")
				.getPath();
		response.getWriter().print(mxUtils.readFile(filename));
	}

}
