package com.mxgraph.examples;

import java.awt.BorderLayout;
import java.awt.Dimension;

import javax.swing.JFrame;
import javax.swing.JScrollPane;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxPoint;
import com.mxgraph.view.mxGraph;

/**
 * The frame example uses the graph model API to programmatically create
 * a graph image to be used as a background of a JComponent.
 */
public class Frame extends JFrame
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -578683911307318455L;

	/**
	 * 
	 */
	private GraphControl graphControl;

	/**
	 * 
	 */
	public Frame()
	{
		super("mxGraph");

		// Creates graph with model
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{

			Object v1 = graph.insertVertex(parent, null, "Hello", 20, 20, 80,
					30);
			mxCell v2 = (mxCell) graph.insertVertex(parent, null, "World!",
					240, 150, 80, 30);
			Object e1 = graph.insertEdge(parent, null, "e1", v1, v2);

			mxCell v3 = (mxCell) graph.insertVertex(e1, null, "v3", -0.5, 0,
					40, 40, "shape=triangle");
			v3.getGeometry().setRelative(true);
			v3.getGeometry().setOffset(new mxPoint(-20, -20));
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		// Creates a control in a scrollpane
		graphControl = new GraphControl(graph);
		JScrollPane scrollPane = new JScrollPane(graphControl);
		scrollPane.setAutoscrolls(true);

		// Puts the control into the frame
		getContentPane().setLayout(new BorderLayout());
		getContentPane().add(scrollPane, BorderLayout.CENTER);
		setSize(new Dimension(320, 200));
	}

	/**
	 * 
	 */
	public static void main(String[] args)
	{
		Frame frame = new Frame();
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setVisible(true);
	}

}
