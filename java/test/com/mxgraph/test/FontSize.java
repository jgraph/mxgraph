package com.mxgraph.test;

import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.JFrame;

public class FontSize extends JFrame
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -582322953993029295L;

	public FontSize()
	{
		super("Hello, World!");
	}

	public void paint(Graphics g)
	{
		super.paint(g);

		g.setFont(g.getFont().deriveFont(15.5f));
		g.drawString("Hello, World", 50, 50);

		g.setFont(g.getFont().deriveFont(10f));
		((Graphics2D) g).scale(1.55, 1.55);
		g.drawString("Hello, World", (int) (50/1.55) + 1, (int) (50/1.55) + 1);
		
		System.out.println("Done");
	}

	public static void main(String[] args)
	{
		FontSize frame = new FontSize();
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setSize(400, 320);
		frame.setVisible(true);
	}

}
