package com.mxgraph.examples;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.util.Map;

import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;

import com.mxgraph.layout.mxIGraphLayout;
import com.mxgraph.layout.hierarchical.mxHierarchicalLayout;
import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.util.mxConstants;
import com.mxgraph.view.mxGraph;

public class Image
{

	public static void main(String[] args)
	{
		// Creates graph with model
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();
		
		// Sets the default vertex style
		Map<String, Object> style = graph.getStylesheet().getDefaultVertexStyle();
		style.put(mxConstants.STYLE_GRADIENTCOLOR, "#FFFFFF");
		style.put(mxConstants.STYLE_ROUNDED, true);
		style.put(mxConstants.STYLE_SHADOW, true);

		graph.getModel().beginUpdate();
		try
		{
			Object v1 = graph.insertVertex(parent, null, "v1", 0, 0, 40, 20);
			Object v2 = graph.insertVertex(parent, null, "v2", 0, 0, 40, 20);
			Object v3 = graph.insertVertex(parent, null, "v3", 0, 0, 40, 20);
			Object v4 = graph.insertVertex(parent, null, "v4", 0, 0, 40, 20);
			Object v5 = graph.insertVertex(parent, null, "v5", 0, 0, 40, 20);
			Object v6 = graph.insertVertex(parent, null, "v6", 0, 0, 40, 20);
			Object v7 = graph.insertVertex(parent, null, "v7", 0, 0, 40, 20);
			Object v8 = graph.insertVertex(parent, null, "v8", 0, 0, 40, 20);
			Object v9 = graph.insertVertex(parent, null, "v8", 0, 0, 40, 20);

			graph.insertEdge(parent, null, "e1", v1, v2);
			graph.insertEdge(parent, null, "e2", v2, v3);
			graph.insertEdge(parent, null, "e3", v3, v4);
			graph.insertEdge(parent, null, "e4", v1, v4);
			graph.insertEdge(parent, null, "e5", v4, v5);
			graph.insertEdge(parent, null, "e6", v5, v6);
			graph.insertEdge(parent, null, "e7", v5, v7);
			graph.insertEdge(parent, null, "e8", v5, v8);
			graph.insertEdge(parent, null, "e9", v6, v9);
			graph.insertEdge(parent, null, "e10", v7, v9);
			graph.insertEdge(parent, null, "e11", v8, v9);

			mxIGraphLayout layout = new mxHierarchicalLayout(graph);
			layout.execute(parent);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		// Creates an image than can be saved using ImageIO
		BufferedImage image = mxCellRenderer.createBufferedImage(graph, null,
				1, Color.WHITE, true, null);

		// For the sake of this example we display the image in a window
		JFrame frame = new JFrame("Graph image");
		frame.getContentPane().add(new JLabel(new ImageIcon(image)));
		frame.pack();
		frame.setVisible(true);
	}

}
