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
import javax.xml.parsers.ParserConfigurationException;

import org.mortbay.jetty.Request;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.mxgraph.reader.mxGraphViewImageReader;

/**
 * This servlet may be used to create bitmap versions of the graphs
 * using a high-level description of the visual appearance so there
 * is no need to create an object representation of the model on
 * the server-side. The description even allows the server to create
 * the bitmaps using a SAX parser. A DOM parser is not required.
 * 
 * To integrate the image handler with a client application, the client
 * application must be setup to use this servlet. This can be done by
 * setting mxEditor.urlImage programmatically or using a config file.
 */
public class Export extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4951624126588618796L;

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8").replace("\n", "&#xa;");

		try
		{
			// Set the clip on the mxGraphViewImageReader or use
			// image.getSubimage to create multiple image files
			response.setContentType("image/png");
			response.setHeader("Content-Disposition",
					"attachment; filename=diagram.png");
			response.setStatus(HttpServletResponse.SC_OK);
			streamImage(Color.WHITE, xml, response.getOutputStream());

			((Request) request).setHandled(true);
		}
		catch (Exception e)
		{
			throw new ServletException(e);
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
	protected void streamImage(Color bg, String xml, OutputStream stream)
			throws ParserConfigurationException, SAXException, IOException
	{
		mxGraphViewImageReader reader = new mxGraphViewImageReader(bg, 4, true,
				true);
		InputSource inputSource = new InputSource(new StringReader(xml));
		BufferedImage image = mxGraphViewImageReader.convert(inputSource,
				reader);

		ImageIO.write(image, "png", stream);
	}

}
