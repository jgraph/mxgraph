package com.mxgraph.test;

import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;

public class OldImageExportTest
{

	public static void main(String[] args) throws IOException
	{
		System.out.println("Parsing graphmodel.xml");
		Document doc = mxXmlUtils.parseXml(mxUtils.readFile(mxImageExportTest.class.getResource("/com/mxgraph/test/graphmodel.xml")
				.getPath()));

		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec(doc);
		codec.decode(doc.getDocumentElement(), graph.getModel());

		ImageIO.write(mxCellRenderer.createBufferedImage(graph, null, 1, null, true, null), "png", new File("oldimageexport.png"));
		
		System.out.println("Writing oldimageexport.png");
	}

}
