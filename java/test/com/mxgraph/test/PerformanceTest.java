package com.mxgraph.test;

import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.util.Random;

import javax.swing.JFrame;

import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxGeometry;
import com.mxgraph.model.mxICell;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.util.mxPoint;
import com.mxgraph.util.mxRectangle;
import com.mxgraph.view.mxGraph;

public class PerformanceTest extends JFrame
{
	/**
	 * 
	 */
	private static final long serialVersionUID = 6383140264262860886L;
	final mxGraph graph;

	public PerformanceTest()
	{
		super("JGraphX");
		setSize(640, 480);
		setDefaultCloseOperation(EXIT_ON_CLOSE);

		graph = new mxGraph();
		graph.setMinimumGraphSize(new mxRectangle(0, 0, 20000, 10000));

		final mxGraphComponent graphComponent = new mxGraphComponent(graph);

		// Use if no folding icons are needed
		graphComponent.setFoldingEnabled(false);

		// Use if no drop into cells or edge splitting are needed
		graphComponent.getGraphHandler().setMarkerEnabled(false);

		graphComponent.addMouseWheelListener(new MouseWheelListener()
		{
			public void mouseWheelMoved(MouseWheelEvent event)
			{
				if (event.getWheelRotation() < 0)
					graphComponent.zoomIn();
				else
					graphComponent.zoomOut();
			}
		});

		getContentPane().add(graphComponent);

		Random random = new Random();

		graph.getModel().beginUpdate();
		try
		{
			for (int i = 0; i < 5000; i++)
			{
				insertPart(random.nextInt(20000), random.nextInt(10000));
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}

	void insertPart(float x, float y)
	{
		mxICell part = (mxICell) graph.insertVertex(graph.getDefaultParent(),
				null, "NAME", x, y, 50, 30);

		mxPoint offset = new mxPoint(-2.5, -2.5);

		mxICell port = (mxICell) graph.insertVertex(part, null, null, 0.0, 0.5,
				5, 5);
		mxGeometry geometry = port.getGeometry();
		geometry.setRelative(true);
		geometry.setOffset(offset);

		port = (mxCell) graph.insertVertex(part, null, null, 1.0, 0.5, 5, 5);
		geometry = port.getGeometry();
		geometry.setRelative(true);
		geometry.setOffset(offset);
	}

	public static void main(String[] args)
	{
		(new PerformanceTest()).show();
	}
}