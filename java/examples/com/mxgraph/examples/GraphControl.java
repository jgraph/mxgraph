package com.mxgraph.examples;

import java.awt.Dimension;
import java.awt.Graphics;

import javax.swing.Icon;
import javax.swing.ImageIcon;
import javax.swing.JComponent;

import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.util.mxEvent;
import com.mxgraph.util.mxEventObject;
import com.mxgraph.util.mxEventSource.mxIEventListener;
import com.mxgraph.view.mxGraph;

public class GraphControl extends JComponent
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -7470544285363165479L;

	mxGraph graph;

	Icon buffer;

	public GraphControl(mxGraph graph)
	{
		this.graph = graph;
		this.graph.getModel().addListener(mxEvent.CHANGE,
				new mxIEventListener()
				{
					public void invoke(Object source, mxEventObject evt)
					{
						GraphControl.this.graphModelChanged();
					}
				});
	}

	public mxGraph getGraph()
	{
		return graph;
	}

	public void paint(Graphics g)
	{
		super.paint(g);
		paintBuffer(g);

	}

	void paintBuffer(Graphics g)
	{
		Icon icon = getBuffer();
		icon.paintIcon(this, g, 0, 0);
	}

	public Icon getBuffer()
	{
		if (buffer == null)
		{
			updateBuffer();
		}
		return buffer;
	}

	protected void updateBuffer()
	{
		buffer = createBuffer();
		int width = buffer.getIconWidth() + 1;
		int height = buffer.getIconHeight() + 1;
		Dimension d = new Dimension(width, height);

		if (!getPreferredSize().equals(d))
		{
			setPreferredSize(d);
			revalidate();
		}
	}

	protected Icon createBuffer()
	{
		return new ImageIcon(mxCellRenderer.createBufferedImage(graph, null,
				graph.getView().getScale(), null, true, null));
	}

	protected void clearBuffer()
	{
		buffer = null;
	}

	public void refreshBuffer()
	{
		clearBuffer();
		repaint();
	}

	protected void graphModelChanged()
	{
		refreshBuffer();
	}

}
