package com.mxgraph.examples.web;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringReader;
import java.net.URLDecoder;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.xml.parsers.ParserConfigurationException;

import org.mortbay.jetty.Request;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.mxgraph.reader.mxGraphViewImageReader;

/**
 * This servlet is used to create bitmaps of graphs from a graph view
 * XML snapshot in a JavaScript client. This is used to speed up the
 * rendering process in older browsers, where the DOM-based rendering
 * takes more time than two requests to the server. The session is
 * required to associate the XML in the POST request with the subsequent
 * GET for the actual image.
 * 
 * We cannot use GET parameters for bundling the XML upload with the
 * image download in a single request since the size of the GET
 * parameters are too limited.
 * 
 * We can also not use a POST request to upload the XML and get the
 * image data in a single request because older browser do no support
 * Data-URLs for images.
 */
public class ServerView extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4951624126588618796L;

	/**
	 * 
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		HttpSession session = request.getSession();

		if (session != null)
		{
			Object xml = session.getAttribute("xml");
			String format = request.getParameter("format");
			
			// PNG seems to have the best compression ratio for images with a
			// lof of white space, as is the case with most graphs/diagrams.
			if (format == null)
			{
				format = "png";
			}

			if (xml != null)
			{
				try
				{
					response.setContentType("image/" + format);
					
					// Uses a white background color for browsers such as IE6, which
					// do not handle the transparent PNG background correctly.
					streamImage(Color.WHITE, String.valueOf(xml), format,
							response.getOutputStream());
					response.setStatus(HttpServletResponse.SC_OK);
					((Request) request).setHandled(true);
				}
				catch (Exception e)
				{
					throw new ServletException(e);
				}
			}
			else
			{
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		}
	}

	/**
	 * Streams the given XML string as a PNG image into the given stream.
	 * 
	 * @param xml
	 * @param stream
	 * @throws IOException 
	 * @throws SAXException 
	 * @throws ParserConfigurationException 
	 */
	protected void streamImage(Color bg, String xml, String format,
			OutputStream stream) throws ParserConfigurationException,
			SAXException, IOException
	{
		try
		{
			mxGraphViewImageReader reader = new mxGraphViewImageReader(bg, 4,
					true, true);
			InputSource inputSource = new InputSource(new StringReader(xml));
			BufferedImage image = mxGraphViewImageReader.convert(inputSource,
					reader);

			ImageIO.write(image, format, stream);
		}
		catch (OutOfMemoryError error)
		{
			error.printStackTrace();
		}
	}

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8");

		if (xml != null)
		{
			HttpSession session = request.getSession(true);

			try
			{
				session.setAttribute("xml", xml);
				response.setStatus(HttpServletResponse.SC_OK);
				((Request) request).setHandled(true);
			}
			catch (Exception e)
			{
				throw new ServletException(e);
			}
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}

}
