/**
 * $Id: SvgExport.java,v 1.3 2012-01-13 11:37:33 david Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.IOException;
import java.io.StringReader;
import java.net.URLDecoder;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.mxgraph.canvas.mxICanvas;
import com.mxgraph.canvas.mxSvgCanvas;
import com.mxgraph.reader.mxGraphViewReader;
import com.mxgraph.util.mxDomUtils;
import com.mxgraph.util.mxUtils;

/**
 * This servlet may be used to create SVG versions of the graphs
 * using a high-level description of the visual appearance so there
 * is no need to create an object representation of the model on
 * the server-side.
 * 
 * To integrate this SVG export with a client application, the client
 * application must be setup to use this servlet. This can be done by
 * setting mxEditor.urlImage programmatically or using a config file.
 */
public class SvgExport extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4951624126588618796L;

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		String xml = URLDecoder.decode(request.getParameter("xml"), "UTF-8")
				.replace("\n", "&#xa;");

		try
		{
			InputSource inputSource = new InputSource(new StringReader(xml));

			mxGraphViewReader viewReader = new mxGraphViewReader()
			{
				public mxICanvas createCanvas(Map<String, Object> attrs)
				{
					int x = (int) Math.round(mxUtils.getDouble(attrs, "x"));
					int y = (int) Math.round(mxUtils.getDouble(attrs, "y"));
					int width = (int) (Math.round(mxUtils.getDouble(attrs,
							"width")) + x) + 3;
					int height = (int) (Math.round(mxUtils.getDouble(attrs,
							"height")) + y) + 3;

					return new mxSvgCanvas(mxDomUtils.createSvgDocument(width,
							height));
				}
			};

			SAXParser parser = SAXParserFactory.newInstance().newSAXParser();
			XMLReader reader = parser.getXMLReader();

			reader.setContentHandler(viewReader);
			reader.parse(inputSource);

			mxSvgCanvas svgCanvas = (mxSvgCanvas) viewReader.getCanvas();
			Document doc = svgCanvas.getDocument();

			try
			{
				response.setContentType("image/svg+xml");
				response.setHeader("Content-Disposition",
						"attachment; filename=diagram.svg");
				response.setStatus(HttpServletResponse.SC_OK);

				TransformerFactory
						.newInstance()
						.newTransformer()
						.transform(new DOMSource(doc),
								new StreamResult(response.getOutputStream()));
			}
			catch (Exception e)
			{
				throw new ServletException(e);
			}
		}
		catch (Exception e)
		{
			throw new ServletException(e);
		}
	}
}
