/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
package com.mxgraph.test;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.StringReader;

import javax.imageio.ImageIO;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;

import junit.framework.TestCase;
import junit.framework.TestSuite;
import junit.textui.TestRunner;

import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;

import com.mxpdf.text.Document;
import com.mxpdf.text.Rectangle;
import com.mxpdf.text.pdf.PdfWriter;
import com.mxgraph.canvas.mxGraphicsCanvas2D;
import com.mxgraph.canvas.mxICanvas2D;
import com.mxgraph.reader.mxDomOutputParser;
import com.mxgraph.reader.mxSaxOutputHandler;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;

public class mxImageExportTest extends TestCase
{

	/**
	 * Constructs a new test case for the specified name.
	 * 
	 * @param name
	 *            The name of the test case to be constructed.
	 */
	public mxImageExportTest(String name)
	{
		super(name);
	}

	/**
	 *
	 */
	public void test1() throws Exception
	{
		String xml = mxUtils.readFile(mxImageExportTest.class.getResource(
				"/com/mxgraph/test/imageoutput.xml").getPath());
		int w = 704;
		int h = 685;

		long t0 = System.currentTimeMillis();
		BufferedImage image = mxUtils.createBufferedImage(w, h, Color.WHITE);

		// Creates handle and configures anti-aliasing
		Graphics2D g2 = image.createGraphics();
		mxUtils.setAntiAlias(g2, true, true);
		long t1 = System.currentTimeMillis();

		// Parses request into graphics canvas
		mxGraphicsCanvas2D gc2 = new mxGraphicsCanvas2D(g2);
		parseXmlSax(xml, gc2);
		long t2 = System.currentTimeMillis();

		ImageIO.write(image, "png", new File("imageexport.png"));
		long t3 = System.currentTimeMillis();

		// For PDF export using iText from http://www.lowagie.com/iText/
		Document document = new Document(new Rectangle((float) w, (float) h));
		PdfWriter writer = PdfWriter.getInstance(document,
				new FileOutputStream("example.pdf"));
		document.open();
		gc2 = new mxGraphicsCanvas2D(writer.getDirectContent().createGraphics(w, h));
		parseXmlSax(xml, gc2);

		gc2.getGraphics().dispose();
		document.close();

		System.out.println("Create img: " + (t1 - t0) + " ms, Parse XML: "
				+ (t2 - t1) + " ms, Write File: " + (t3 - t2));
	}

	/**
	 * Creates and returns the image for the given request.
	 * 
	 * @param request
	 * @return
	 * @throws SAXException
	 * @throws ParserConfigurationException
	 * @throws IOException
	 */
	protected void parseXmlDom(String xml, mxICanvas2D canvas)
	{
		new mxDomOutputParser(canvas).read(mxXmlUtils.parseXml(xml)
				.getDocumentElement().getFirstChild());
	}

	/**
	 * Creates and returns the image for the given request.
	 * 
	 * @param request
	 * @return
	 * @throws SAXException
	 * @throws ParserConfigurationException
	 * @throws IOException
	 */
	protected void parseXmlSax(String xml, mxICanvas2D canvas)
			throws SAXException, ParserConfigurationException, IOException
	{
		// Creates SAX handler for drawing to graphics handle
		mxSaxOutputHandler handler = new mxSaxOutputHandler(canvas);

		// Creates SAX parser for handler
		XMLReader reader = SAXParserFactory.newInstance().newSAXParser()
				.getXMLReader();
		reader.setContentHandler(handler);

		// Renders XML data into image
		reader.parse(new InputSource(new StringReader(xml)));
	}

	/**
	 * The main method of the template test suite.
	 * 
	 * @param args
	 *            The array of runtime arguments.
	 */
	public static void main(String[] args)
	{
		TestRunner.run(new TestSuite(mxImageExportTest.class));
	}

}
