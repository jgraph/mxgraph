/*
 * $Id: ShadowBorder.java,v 1.2 2009/11/24 12:00:28 gaudenz Exp $
 * Copyright (c) 2001-2005, Gaudenz Alder
 * 
 * All rights reserved. 
 * 
 * This file is licensed under the JGraph software license, a copy of which
 * will have been provided to you in the file LICENSE at the root of your
 * installation directory. If you are unable to locate this file please
 * contact JGraph sales for another copy.
 */
package com.mxgraph.examples.swing.editor;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Insets;
import java.io.Serializable;

import javax.swing.border.Border;

/**
 * Border with a drop shadow.
 */
public class ShadowBorder implements Border, Serializable
{
	/**
	 * 
	 */
	private static final long serialVersionUID = 6854989457150641240L;

	private Insets insets;

	public static ShadowBorder sharedInstance = new ShadowBorder();

	private ShadowBorder()
	{
		insets = new Insets(0, 0, 2, 2);
	}

	public Insets getBorderInsets(Component c)
	{
		return insets;
	}

	public boolean isBorderOpaque()
	{
		return false;
	}

	public void paintBorder(Component c, Graphics g, int x, int y, int w, int h)
	{
		// choose which colors we want to use
		Color bg = c.getBackground();

		if (c.getParent() != null)
		{
			bg = c.getParent().getBackground();
		}

		if (bg != null)
		{
			Color mid = bg.darker();
			Color edge = average(mid, bg);

			g.setColor(bg);
			g.drawLine(0, h - 2, w, h - 2);
			g.drawLine(0, h - 1, w, h - 1);
			g.drawLine(w - 2, 0, w - 2, h);
			g.drawLine(w - 1, 0, w - 1, h);

			// draw the drop-shadow
			g.setColor(mid);
			g.drawLine(1, h - 2, w - 2, h - 2);
			g.drawLine(w - 2, 1, w - 2, h - 2);

			g.setColor(edge);
			g.drawLine(2, h - 1, w - 2, h - 1);
			g.drawLine(w - 1, 2, w - 1, h - 2);
		}
	}

	private static Color average(Color c1, Color c2)
	{
		int red = c1.getRed() + (c2.getRed() - c1.getRed()) / 2;
		int green = c1.getGreen() + (c2.getGreen() - c1.getGreen()) / 2;
		int blue = c1.getBlue() + (c2.getBlue() - c1.getBlue()) / 2;
		return new Color(red, green, blue);
	}

	public static ShadowBorder getSharedInstance()
	{
		return sharedInstance;
	}
}