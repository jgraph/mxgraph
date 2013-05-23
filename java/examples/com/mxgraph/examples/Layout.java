package com.mxgraph.examples;

import java.awt.BorderLayout;
import java.awt.Dimension;

import javax.swing.JFrame;
import javax.swing.JScrollPane;

import com.mxgraph.layout.mxFastOrganicLayout;
import com.mxgraph.layout.mxIGraphLayout;
import com.mxgraph.view.mxGraph;

public class Layout extends JFrame
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -578683911307318455L;

	private GraphControl graphControl;

	public Layout()
	{
		super("mxGraph");

		// Creates graph with model
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{
			int nodeCount = 100;
			int edgeCount = 100;

			Object[] nodes = new Object[nodeCount];
			Object[] edges = new Object[edgeCount];

			for (int i = 0; i < nodeCount; i++)
			{
				nodes[i] = graph.insertVertex(parent, null, "N" + i, 0, 0, 30,
						30);
			}

			for (int i = 0; i < edgeCount; i++)
			{
				int r1 = (int) (Math.random() * nodeCount);
				int r2 = (int) (Math.random() * nodeCount);
				edges[i] = graph.insertEdge(parent, null, r1 + "-" + r2,
						nodes[r1], nodes[r2]);
			}

			mxIGraphLayout layout = new mxFastOrganicLayout(graph);
			layout.execute(parent);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		graph.getView().setScale(0.2);

		// Creates a control in a scrollpane
		graphControl = new GraphControl(graph);
		JScrollPane scrollPane = new JScrollPane(graphControl);
		scrollPane.setAutoscrolls(true);

		// Puts the control into the frame
		getContentPane().setLayout(new BorderLayout());
		getContentPane().add(scrollPane, BorderLayout.CENTER);
		setSize(new Dimension(320, 200));
	}

	public static void main(String[] args)
	{
		Layout frame = new Layout();
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setVisible(true);
	}

}
