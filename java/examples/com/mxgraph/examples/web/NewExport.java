/**
 * $Id: NewExport.java,v 1.3 2013/01/09 12:10:00 gaudenz Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.net.URLDecoder;
import java.util.zip.Inflater;
import java.util.zip.InflaterInputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.SAXParserFactory;

import org.mortbay.jetty.Request;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.mxgraph.canvas.mxGraphicsCanvas2D;
import com.mxgraph.reader.mxSaxOutputHandler;
import com.mxgraph.util.mxUtils;

/**
 * Creates a bitmap image of the diagram based on generic XML.
 */
public class NewExport extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4951624126588618796L;

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		try
		{
			String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8");
			String width = request.getParameter("w");
			String height = request.getParameter("h");
			String bgParam = request.getParameter("bg");
			String filename = request.getParameter("filename");
			String format = request.getParameter("format");

			Color bg = mxUtils.parseColor(bgParam);

			if (xml != null && width != null && height != null && filename != null && format != null)
			{
				BufferedImage image = mxUtils.createBufferedImage(Integer.parseInt(width), Integer.parseInt(height), bg);
				Graphics2D g2 = image.createGraphics();
				mxUtils.setAntiAlias(g2, true, true);
				XMLReader reader = SAXParserFactory.newInstance().newSAXParser().getXMLReader();
				reader.setContentHandler(new mxSaxOutputHandler(new mxGraphicsCanvas2D(g2)));
				reader.parse(new InputSource(new StringReader(xml)));
				
				if (filename == null || filename.length() == 0)
				{
					filename = "export." + format;
				}

				response.setContentType("image/" + format);
				response.setHeader("Content-Disposition", "attachment; filename=" + filename);
				ImageIO.write(image, format, response.getOutputStream());

				response.setStatus(HttpServletResponse.SC_OK);
			}
			else
			{
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}

			((Request) request).setHandled(true);
		}
		catch (Exception e)
		{
			throw new ServletException(e);
		}
	}

	/**
	 * Encoding for the deflated input stream.
	 */
	protected static final String ENCODING = "ISO-8859-1";

	/**
	 * Returns the given parameter after decoding it as an URL, base 64 decoding and
	 * inflating it to a UTF-8 String.
	 * 
	 * This code is not for production use!
	 */
	public static String inflate(byte[] binary) throws IOException
	{
		StringBuffer buffer = new StringBuffer();
		try
		{
			Reader in = new BufferedReader(new InputStreamReader(new InflaterInputStream(new ByteArrayInputStream(binary), new Inflater(
					true)), ENCODING));
			int ch;

			while ((ch = in.read()) > -1)
			{
				buffer.append((char) ch);
			}

			in.close();

			return buffer.toString();
		}
		catch (IOException e)
		{
			e.printStackTrace();

			return null;
		}
	}

}
