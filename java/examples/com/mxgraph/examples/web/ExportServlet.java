/**
 * Copyright (c) 2011-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Hashtable;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfWriter;
import com.mxgraph.canvas.mxGraphicsCanvas2D;
import com.mxgraph.canvas.mxICanvas2D;
import com.mxgraph.reader.mxSaxOutputHandler;
import com.mxgraph.util.mxUtils;

/**
 * Servlet implementation class ImageServlet.
 */
public class ExportServlet extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -5040708166131034515L;

	/**
	 * 
	 */
	private transient SAXParserFactory parserFactory = SAXParserFactory.newInstance();

	/**
	 * Cache for all images.
	 */
	protected transient Hashtable<String, Image> imageCache = new Hashtable<String, Image>();

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public ExportServlet()
	{
		super();
	}

	/**
	 * Handles exceptions and the output stream buffer.
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		try
		{
			if (request.getContentLength() < Constants.MAX_REQUEST_SIZE)
			{
				long t0 = System.currentTimeMillis();

				handleRequest(request, response);

				long mem = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
				long dt = System.currentTimeMillis() - t0;

				System.out.println("export: ip=" + request.getRemoteAddr() + " ref=\"" + request.getHeader("Referer") + "\" length="
						+ request.getContentLength() + " mem=" + mem + " dt=" + dt);
			}
			else
			{
				response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
			}
		}
		catch (OutOfMemoryError e)
		{
			e.printStackTrace();
			final Runtime r = Runtime.getRuntime();
			System.out.println("r.freeMemory() = " + r.freeMemory() / 1024.0 / 1024);
			System.out.println("r.totalMemory() = " + r.totalMemory() / 1024.0 / 1024);
			System.out.println("r.maxMemory() = " + r.maxMemory() / 1024.0 / 1024);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		finally
		{
			response.getOutputStream().flush();
			response.getOutputStream().close();
		}
	}

	/**
	 * Gets the parameters and logs the request.
	 * 
	 * @throws ParserConfigurationException 
	 * @throws SAXException 
	 * @throws DocumentException 
	 */
	protected void handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception
	{
		// Parses parameters
		String format = request.getParameter("format");
		String fname = request.getParameter("filename");
		int w = Integer.parseInt(request.getParameter("w"));
		int h = Integer.parseInt(request.getParameter("h"));
		String tmp = request.getParameter("bg");
		String xml = getRequestXml(request);

		Color bg = (tmp != null) ? mxUtils.parseColor(tmp) : null;

		// Checks parameters
		if (w > 0 && h > 0 && w * h < Constants.MAX_AREA && format != null && xml != null && xml.length() > 0)
		{
			// Allows transparent backgrounds only for PNG
			if (bg == null && !format.equals("png"))
			{
				bg = Color.WHITE;
			}

			if (fname != null && fname.toLowerCase().endsWith(".xml"))
			{
				fname = fname.substring(0, fname.length() - 4) + format;
			}

			String url = request.getRequestURL().toString();

			// Writes response
			if (format.equals("pdf"))
			{
				writePdf(url, fname, w, h, bg, xml, response);
			}
			else
			{
				writeImage(url, format, fname, w, h, bg, xml, response);
			}

			response.setStatus(HttpServletResponse.SC_OK);
		}
		else
		{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}

	/**
	 * Gets the XML request parameter.
	 */
	protected String getRequestXml(HttpServletRequest request) throws IOException, UnsupportedEncodingException
	{
		String xml = request.getParameter("xml");
		
		// Decoding is optional (no plain text values allowed)
		if (xml != null && xml.startsWith("%3C"))
		{
			xml = URLDecoder.decode(xml, "UTF-8");
		}

		return xml;
	}

	/**
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 * 
	 */
	protected void writeImage(String url, String format, String fname, int w, int h, Color bg, String xml, HttpServletResponse response)
			throws IOException, SAXException, ParserConfigurationException
	{
		BufferedImage image = mxUtils.createBufferedImage(w, h, bg);

		if (image != null)
		{
			Graphics2D g2 = image.createGraphics();
			mxUtils.setAntiAlias(g2, true, true);
			renderXml(xml, createCanvas(url, g2));

			if (fname != null)
			{
				response.setContentType("application/x-unknown");
				response.setHeader("Content-Disposition", "attachment; filename=\"" + fname + "\"; filename*=UTF-8''" + fname);
			}
			else if (format != null)
			{
				response.setContentType("image/" + format.toLowerCase());
			}

			ImageIO.write(image, format, response.getOutputStream());
		}
	}

	/**
	 * Creates and returns the canvas for rendering.
	 * @throws IOException 
	 * @throws DocumentException 
	 * @throws ParserConfigurationException 
	 * @throws SAXException 
	 */
	protected void writePdf(String url, String fname, int w, int h, Color bg, String xml, HttpServletResponse response)
			throws DocumentException, IOException, SAXException, ParserConfigurationException
	{
		response.setContentType("application/pdf");

		if (fname != null)
		{
			response.setHeader("Content-Disposition", "attachment; filename=\"" + fname + "\"; filename*=UTF-8''" + fname);
		}

		// Fixes PDF offset
		w += 1;
		h += 1;

		Document document = new Document(new Rectangle(w, h));
		PdfWriter writer = PdfWriter.getInstance(document, response.getOutputStream());
		document.open();

		mxGraphicsCanvas2D gc = createCanvas(url, writer.getDirectContent().createGraphics(w, h));

		// Fixes PDF offset
		gc.translate(1, 1);

		renderXml(xml, gc);
		gc.getGraphics().dispose();
		document.close();
		writer.flush();
		writer.close();
	}

	/**
	 * Renders the XML to the given canvas.
	 */
	protected void renderXml(String xml, mxICanvas2D canvas) throws SAXException, ParserConfigurationException, IOException
	{
		XMLReader reader = parserFactory.newSAXParser().getXMLReader();
		reader.setContentHandler(new mxSaxOutputHandler(canvas));
		reader.parse(new InputSource(new StringReader(xml)));
	}

	/**
	 * Creates a graphics canvas with an image cache.
	 */
	protected mxGraphicsCanvas2D createCanvas(String url, Graphics2D g2)
	{
		// Caches custom images for the time of the request
		final Hashtable<String, Image> shortCache = new Hashtable<String, Image>();
		final String domain = url.substring(0, url.lastIndexOf("/"));

		mxGraphicsCanvas2D g2c = new mxGraphicsCanvas2D(g2)
		{
			public Image loadImage(String src)
			{
				// Uses local image cache by default
				Hashtable<String, Image> cache = shortCache;

				// Uses global image cache for local images
				if (src.startsWith(domain))
				{
					cache = imageCache;
				}

				Image image = cache.get(src);

				if (image == null)
				{
					image = super.loadImage(src);

					if (image != null)
					{
						cache.put(src, image);
					}
					else
					{
						cache.put(src, Constants.EMPTY_IMAGE);
					}
				}
				else if (image == Constants.EMPTY_IMAGE)
				{
					image = null;
				}

				return image;
			}
		};

		return g2c;
	}

}
