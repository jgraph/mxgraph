/* 
 * $Id: DefaultFileFilter.java,v 1.1 2009/10/23 11:32:08 gaudenz Exp $
 * Copyright (c) 2001-2005, Gaudenz Alder
 * 
 * All rights reserved.
 * 
 * See LICENSE file for license details. If you are unable to locate
 * this file please contact info (at) jgraph (dot) com.
 */
package com.mxgraph.examples.swing.editor;

import java.io.File;

import javax.imageio.ImageIO;
import javax.swing.JFileChooser;
import javax.swing.filechooser.FileFilter;

/**
 * Filter for use in a {@link JFileChooser}.
 */
public class DefaultFileFilter extends FileFilter
{

	/**
	 * Extension of accepted files.
	 */
	protected String ext;

	/**
	 * Description of accepted files.
	 */
	protected String desc;

	/**
	 * Constructs a new filter for the specified extension and descpription.
	 * 
	 * @param extension
	 *            The extension to accept files with.
	 * @param description
	 *            The description of the file format.
	 */
	public DefaultFileFilter(String extension, String description)
	{
		ext = extension.toLowerCase();
		desc = description;
	}

	/**
	 * Returns true if <code>file</code> is a directory or ends with
	 * {@link #ext}.
	 * 
	 * @param file
	 *            The file to be checked.
	 * @return Returns true if the file is accepted.
	 */
	public boolean accept(File file)
	{
		return file.isDirectory() || file.getName().toLowerCase().endsWith(ext);
	}

	/**
	 * Returns the description for accepted files.
	 * 
	 * @return Returns the description.
	 */
	public String getDescription()
	{
		return desc;
	}

	/**
	 * Returns the extension for accepted files.
	 * 
	 * @return Returns the extension.
	 */
	public String getExtension()
	{
		return ext;
	}

	/**
	 * Sets the extension for accepted files.
	 * 
	 * @param extension
	 *            The extension to set.
	 */
	public void setExtension(String extension)
	{
		this.ext = extension;
	}

	/**
	 * Utility file filter to accept all image formats supported by image io.
	 * 
	 * @see ImageIO#getReaderFormatNames()
	 */
	public static class ImageFileFilter extends FileFilter
	{

		/**
		 * Holds the accepted file format extensions for images.
		 */
		protected static String[] imageFormats = ImageIO.getReaderFormatNames();

		/**
		 * Description of the filter.
		 */
		protected String desc;

		/**
		 * Constructs a new file filter for all supported image formats using
		 * the specified description.
		 * 
		 * @param description
		 *            The description to use for the file filter.
		 */
		public ImageFileFilter(String description)
		{
			desc = description;
		}

		/**
		 * Returns true if the file is a directory or ends with a known image
		 * extension.
		 * 
		 * @param file
		 *            The file to be checked.
		 * @return Returns true if the file is accepted.
		 */
		public boolean accept(File file)
		{
			if (file.isDirectory())
			{
				return true;
			}

			String filename = file.toString().toLowerCase();

			for (int j = 0; j < imageFormats.length; j++)
			{
				if (filename.endsWith("." + imageFormats[j].toLowerCase()))
				{
					return true;
				}
			}

			return false;
		}

		/**
		 * Returns the description.
		 * 
		 * @return Returns the description.
		 */
		public String getDescription()
		{
			return desc;
		}

	}

	/**
	 * Utility file filter to accept editor files, namely .xml and .xml.gz
	 * extensions.
	 * 
	 * @see ImageIO#getReaderFormatNames()
	 */
	public static class EditorFileFilter extends FileFilter
	{

		/**
		 * Description of the File format
		 */
		protected String desc;

		/**
		 * Constructs a new editor file filter using the specified description.
		 * 
		 * @param description
		 *            The description to use for the filter.
		 */
		public EditorFileFilter(String description)
		{
			desc = description;
		}

		/**
		 * Returns true if the file is a directory or has a .xml or .xml.gz
		 * extension.
		 * 
		 * @return Returns true if the file is accepted.
		 */
		public boolean accept(File file)
		{
			if (file.isDirectory())
			{
				return true;
			}

			String filename = file.getName().toLowerCase();

			return filename.endsWith(".xml") || filename.endsWith(".xml.gz");
		}

		/**
		 * Returns the description.
		 * 
		 * @return Returns the description.
		 */
		public String getDescription()
		{
			return desc;
		}

	}
}
