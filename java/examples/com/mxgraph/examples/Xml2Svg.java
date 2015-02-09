package com.mxgraph.examples;

import java.io.IOException;

import javax.swing.JFrame;

import org.w3c.dom.Document;

import com.mxgraph.canvas.mxICanvas;
import com.mxgraph.canvas.mxSvgCanvas;
import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.util.mxCellRenderer.CanvasFactory;
import com.mxgraph.util.mxDomUtils;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

/**
 * Usage: Xml2Svg infile outfile where infile is the path to the input XML file
 * (with an mxGraphModel) and outfile is the path to the output SVG file.
 */
public class Xml2Svg extends JFrame
{
	public static void main(String[] args)
	{
		if (args.length < 2)
		{
			System.out.println("Usage: Xml2Svg infile outfile");
		}
		else
		{
			try
			{
				mxGraph graph = new mxGraph();
	
				// Parses XML into graph
				Document doc = mxXmlUtils.parseXml(mxUtils.readFile(args[0]));
				mxCodec codec = new mxCodec(doc);
				codec.decode(doc.getDocumentElement(), graph.getModel());
	
				// Renders graph to SVG
				mxSvgCanvas canvas = (mxSvgCanvas) mxCellRenderer.drawCells(graph,
						null, 1, null, new CanvasFactory()
						{
							public mxICanvas createCanvas(int width, int height)
							{
								return new mxSvgCanvas(mxDomUtils
										.createSvgDocument(width, height));
							}
						});
	
				mxUtils.writeFile(mxXmlUtils.getXml(canvas.getDocument()), args[1]);
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}
	}
}
