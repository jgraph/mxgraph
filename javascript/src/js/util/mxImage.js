/**
 * $Id: mxImage.js,v 1.7 2010-01-02 09:45:14 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxImage
 *
 * Encapsulates the URL, width and height of an image.
 * 
 * Constructor: mxImage
 * 
 * Constructs a new image.
 */
function mxImage(src, width, height)
{
	this.src = src;
	this.width = width;
	this.height = height;
};

/**
 * Variable: src
 *
 * String that specifies the URL of the image.
 */
mxImage.prototype.src = null;

/**
 * Variable: width
 *
 * Integer that specifies the width of the image.
 */
mxImage.prototype.width = null;

/**
 * Variable: height
 *
 * Integer that specifies the height of the image.
 */
mxImage.prototype.height = null;
