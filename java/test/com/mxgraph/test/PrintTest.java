package com.mxgraph.test;

import java.awt.BorderLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.print.PageFormat;
import java.awt.print.Paper;
import java.awt.print.PrinterException;
import java.awt.print.PrinterJob;

import javax.swing.JButton;
import javax.swing.JFrame;

import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.view.mxGraph;

public class PrintTest extends JFrame
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -2707712944901661771L;

	public PrintTest()
	{
		super("Hello, World!");

		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();
		graph.insertVertex(parent, null, "", 20, 20, 80, 50,
				"shape=image;image=http://www.jgraph.com/images/mxgraph.gif");
		graph.insertVertex(parent, null, "", 120, 20, 160, 100,
				"shape=image;image=http://www.jgraph.com/images/mxgraph.gif");

		final mxGraphComponent graphComponent = new mxGraphComponent(graph);
		getContentPane().setLayout(new BorderLayout());
		getContentPane().add(graphComponent);
		JButton button = new JButton("Print");
		button.addMouseListener(new MouseAdapter()
		{
			public void mouseClicked(MouseEvent e)
			{
				PrinterJob pj = PrinterJob.getPrinterJob();

				if (pj.printDialog())
				{
					PageFormat pf = graphComponent.getPageFormat();
					Paper paper = new Paper();
					double margin = 36;
					paper.setImageableArea(margin, margin, paper.getWidth()
							- margin * 2, paper.getHeight() - margin * 2);
					pf.setPaper(paper);
					pj.setPrintable(graphComponent, pf);

					try
					{
						pj.print();
					}
					catch (PrinterException e2)
					{
						System.out.println(e2);
					}
				}
			}
		});
		getContentPane().add(button, BorderLayout.SOUTH);
	}

	public static void main(String[] args)
	{
		PrintTest frame = new PrintTest();
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setSize(400, 320);
		frame.setVisible(true);
	}

}
