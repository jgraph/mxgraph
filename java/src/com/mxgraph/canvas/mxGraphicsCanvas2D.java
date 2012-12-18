package com.mxgraph.canvas;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.Paint;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.Stroke;
import java.awt.font.TextAttribute;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.geom.GeneralPath;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.text.AttributedString;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Stack;

import javax.swing.CellRendererPane;
import javax.swing.JLabel;

import com.mxgraph.util.mxConstants;
import com.mxgraph.util.mxLightweightLabel;
import com.mxgraph.util.mxUtils;

/**
 * Used for exporting images. To render to an image from a given XML string,
 * graph size and background color, the following code is used:
 * 
 * <code>
 * BufferedImage image = mxUtils.createBufferedImage(width, height, background);
 * Graphics2D g2 = image.createGraphics();
 * mxUtils.setAntiAlias(g2, true, true);
 * XMLReader reader = SAXParserFactory.newInstance().newSAXParser().getXMLReader();
 * reader.setContentHandler(new mxSaxOutputHandler(new mxGraphicsCanvas2D(g2)));
 * reader.parse(new InputSource(new StringReader(xml)));
 * </code>
 * 
 * Text rendering is available for plain text and HTML markup, the latter with optional
 * word wrapping. CSS support is limited to the following:
 * http://docs.oracle.com/javase/6/docs/api/index.html?javax/swing/text/html/CSS.html
 */
public class mxGraphicsCanvas2D implements mxICanvas2D
{

	/**
	 * Specifies the image scaling quality. Default is Image.SCALE_SMOOTH.
	 * See {@link #scaleImage(Image, int, int)}
	 */
	public static int IMAGE_SCALING = Image.SCALE_SMOOTH;

	/**
	 * Specifies the size of the cache used to store parsed colors
	 */
	public static int COLOR_CACHE_SIZE = 100;

	/**
	 * Reference to the graphics instance for painting.
	 */
	protected Graphics2D graphics;

	/**
	 * Specifies if anti aliasing should be disabled for rectangles
	 * and orthogonal paths. Default is true.
	 */
	protected boolean autoAntiAlias = true;

	/**
	 * Represents the current state of the canvas.
	 */
	protected transient CanvasState state = new CanvasState();

	/**
	 * Stack of states for save/restore.
	 */
	protected transient Stack<CanvasState> stack = new Stack<CanvasState>();

	/**
	 * Holds the current path.
	 */
	protected transient GeneralPath currentPath;

	/**
	 * Holds the current state for crisp rendering. This should be true while
	 * a subsequent stroke operation should be rendering without anti aliasing.
	 */
	protected transient boolean currentPathIsOrthogonal = true;

	/**
	 * Holds the last point of a moveTo or lineTo operation to determine if the
	 * current path is orthogonal.
	 */
	protected transient Point2D lastPoint;

	/**
	 * Holds the current stroke.
	 */
	protected transient Stroke currentStroke;

	/**
	 * Holds the current font.
	 */
	protected transient Font currentFont;

	/**
	 * Holds the current value for the shadow color. This is used to hold the
	 * input value of a shadow operation. The parsing result of this value is
	 * cached in the global scope as it should be repeating.
	 */
	protected transient String currentShadowValue;

	/**
	 * Holds the current parsed shadow color. This holds the result of parsing
	 * the currentShadowValue, which is an expensive operation.
	 */
	protected transient Color currentShadowColor;

	/**
	 * Optional renderer pane to be used for HTML label rendering.
	 */
	protected CellRendererPane rendererPane;

	/**
	 * Caches parsed colors.
	 */
	@SuppressWarnings("serial")
	protected transient LinkedHashMap<String, Color> colorCache = new LinkedHashMap<String, Color>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Color> eldest) {
                return size() > COLOR_CACHE_SIZE;
        }
	};

	/**
	 * Constructs a new graphics export canvas.
	 */
	public mxGraphicsCanvas2D(Graphics2D g)
	{
		setGraphics(g);
		state.g = g;

		// Initializes the cell renderer pane for drawing HTML markup
		try
		{
			rendererPane = new CellRendererPane();
		}
		catch (Exception e)
		{
			// ignore
		}
	}

	/**
	 * Sets the graphics instance.
	 */
	public void setGraphics(Graphics2D value)
	{
		graphics = value;
	}

	/**
	 * Returns the graphics instance.
	 */
	public Graphics2D getGraphics()
	{
		return graphics;
	}

	/**
	 * Returns true if automatic anti aliasing is enabled.
	 */
	public boolean isAutoAntiAlias()
	{
		return autoAntiAlias;
	}

	/**
	 * Disabled or enabled automatic anti aliasing.
	 */
	public void setAutoAntiAlias(boolean value)
	{
		autoAntiAlias = value;
	}

	/**
	 * Saves the current canvas state.
	 */
	public void save()
	{
		stack.push(state);
		state = cloneState(state);
		state.g = (Graphics2D) state.g.create();
	}

	/**
	 * Restores the last canvas state.
	 */
	public void restore()
	{
		state = stack.pop();

		// TODO: Check if stroke is part of graphics state
		currentStroke = state.g.getStroke();
		currentFont = null;
	}

	/**
	 * Returns a clone of thec given state.
	 */
	protected CanvasState cloneState(CanvasState state)
	{
		try
		{
			return (CanvasState) state.clone();
		}
		catch (CloneNotSupportedException e)
		{
			e.printStackTrace();
		}

		return null;
	}

	/**
	 * 
	 */
	public void scale(double value)
	{
		// This implementation uses custom scale/translate and built-in rotation
		state.scale = state.scale * value;
		state.strokeWidth *= value;
	}

	/**
	 * 
	 */
	public void translate(double dx, double dy)
	{
		// This implementation uses custom scale/translate and built-in rotation
		state.dx += dx;
		state.dy += dy;
	}

	/**
	 * 
	 */
	public void rotate(double theta, boolean flipH, boolean flipV, double cx,
			double cy)
	{
		cx *= state.scale;
		cy *= state.scale;

		// This is a special case where the rotation center is scaled so dx/dy,
		// which are also scaled, must be applied after scaling the center.
		cx += state.dx;
		cy += state.dy;
		
		// This implementation uses custom scale/translate and built-in rotation
		// Rotation state is part of the AffineTransform in state.transform
		if (flipH ^ flipV)
		{
			double tx = (flipH) ? cx : 0;
			int sx = (flipH) ? -1 : 1;

			double ty = (flipV) ? cy : 0;
			int sy = (flipV) ? -1 : 1;

			state.g.translate(tx, ty);
			state.g.scale(sx, sy);
			state.g.translate(-tx, -ty);
		}

		state.g.rotate(Math.toRadians(theta), cx, cy);
	}

	/**
	 * 
	 */
	public void setStrokeWidth(double value)
	{
		// Lazy and cached instantiation strategy for all stroke properties
		if (value * state.scale != state.strokeWidth)
		{
			state.strokeWidth = value * state.scale;

			// Invalidates cached stroke
			currentStroke = null;
		}
	}

	/**
	 * Caches color conversion as it is expensive.
	 */
	public void setStrokeColor(String value)
	{
		// Lazy and cached instantiation strategy for all stroke properties
		if (!state.strokeColorValue.equals(value))
		{
			state.strokeColorValue = value;
			state.strokeColor = null;
		}
	}

	/**
	 * 
	 */
	public void setDashed(boolean value)
	{
		// Lazy and cached instantiation strategy for all stroke properties
		if (value != state.dashed)
		{
			state.dashed = value;

			// Invalidates cached stroke
			currentStroke = null;
		}
	}

	/**
	 * 
	 */
	public void setDashPattern(String value)
	{
		if (value != null && !state.dashPattern.equals(value) && value.length() > 0)
		{
			String[] tokens = value.split(" ");
			float[] dashpattern = new float[tokens.length];

			for (int i = 0; i < tokens.length; i++)
			{
				dashpattern[i] = (float) (Float.parseFloat(tokens[i]));
			}

			state.dashPattern = dashpattern;
			currentStroke = null;
		}
	}

	/**
	 * 
	 */
	public void setLineCap(String value)
	{
		if (!state.lineCap.equals(value))
		{
			state.lineCap = value;
			currentStroke = null;
		}
	}

	/**
	 * 
	 */
	public void setLineJoin(String value)
	{
		if (!state.lineJoin.equals(value))
		{
			state.lineJoin = value;
			currentStroke = null;
		}
	}

	/**
	 * 
	 */
	public void setMiterLimit(double value)
	{
		if (value != state.miterLimit)
		{
			state.miterLimit = value;
			currentStroke = null;
		}
	}

	/**
	 * 
	 */
	public void setFontSize(double value)
	{
		if (value != state.fontSize)
		{
			state.fontSize = value * state.scale;
			currentFont = null;
		}
	}

	/**
	 * 
	 */
	public void setFontColor(String value)
	{
		if (!state.fontColorValue.equals(value))
		{
			state.fontColorValue = value;
			state.fontColor = null;
		}
	}

	/**
	 * 
	 */
	public void setFontFamily(String value)
	{
		if (!state.fontFamily.equals(value))
		{
			state.fontFamily = value;
			currentFont = null;
		}
	}

	/**
	 * 
	 */
	public void setFontStyle(int value)
	{
		if (value != state.fontStyle)
		{
			state.fontStyle = value;
			currentFont = null;
		}
	}

	/**
	 * 
	 */
	public void setAlpha(double value)
	{
		if (state.alpha != value)
		{
			state.g.setComposite(AlphaComposite.getInstance(
					AlphaComposite.SRC_OVER, (float) (value)));
			state.alpha = value;
		}
	}

	/**
	 * 
	 */
	public void setFillColor(String value)
	{
		if (!state.fillColorValue.equals(value))
		{
			state.fillColorValue = value;
			state.fillColor = null;

			// Setting fill color resets paint color
			state.paint = null;
		}
	}

	/**
	 * 
	 */
	public void setGradient(String color1, String color2, double x, double y,
			double w, double h, String direction)
	{
		// LATER: Add lazy instantiation and check if paint already created
		float x1 = (float) (state.dx + x * state.scale);
		float y1 = (float) (state.dy + y * state.scale);
		float x2 = (float) x1;
		float y2 = (float) y1;
		h *= state.scale;
		w *= state.scale;

		if (direction == null || direction.length() == 0
				|| direction.equals(mxConstants.DIRECTION_SOUTH))
		{
			y2 = (float) (y1 + h);
		}
		else if (direction.equals(mxConstants.DIRECTION_EAST))
		{
			x2 = (float) (x1 + w);
		}
		else if (direction.equals(mxConstants.DIRECTION_NORTH))
		{
			y1 = (float) (y1 + h);
		}
		else if (direction.equals(mxConstants.DIRECTION_WEST))
		{
			x1 = (float) (x1 + w);
		}

		state.paint = new GradientPaint(x1, y1, parseColor(color1), x2, y2,
				parseColor(color2), true);
	}

	/**
	 * Helper method that uses {@link mxUtils#parseColor(String)}.
	 */
	protected Color parseColor(String hex)
	{
		Color result = colorCache.get(hex);
		
		if (result == null)
		{
			result = mxUtils.parseColor(hex);
			colorCache.put(hex, result);
		}
		
		return result;
	}

	/**
	 * 
	 */
	public void setGlassGradient(double x, double y, double w, double h)
	{
		double size = 0.4;
		x = state.dx + x * state.scale;
		y = state.dy + y * state.scale;
		h *= state.scale;
		w *= state.scale;

		state.paint = new GradientPaint((float) x, (float) y, new Color(1, 1,
				1, 0.9f), (float) (x), (float) (y + h * size), new Color(1, 1,
				1, 0.3f));
	}

	/**
	 *
	 */
	public void rect(double x, double y, double w, double h)
	{
		currentPath = new GeneralPath();
		currentPath.append(new Rectangle2D.Double(state.dx + x * state.scale,
				state.dy + y * state.scale, w * state.scale, h * state.scale),
				false);
	}

	/**
	 * Implements a rounded rectangle using a path.
	 */
	public void roundrect(double x, double y, double w, double h, double dx,
			double dy)
	{
		begin();
		moveTo(x + dx, y);
		lineTo(x + w - dx, y);
		quadTo(x + w, y, x + w, y + dy);
		lineTo(x + w, y + h - dy);
		quadTo(x + w, y + h, x + w - dx, y + h);
		lineTo(x + dx, y + h);
		quadTo(x, y + h, x, y + h - dy);
		lineTo(x, y + dy);
		quadTo(x, y, x + dx, y);
	}

	/**
	 * 
	 */
	public void ellipse(double x, double y, double w, double h)
	{
		currentPath = new GeneralPath();
		currentPath.append(new Ellipse2D.Double(state.dx + x * state.scale,
				state.dy + y * state.scale, w * state.scale, h * state.scale),
				false);
		currentPathIsOrthogonal = false;
	}

	/**
	 * 
	 */
	public void image(double x, double y, double w, double h, String src,
			boolean aspect, boolean flipH, boolean flipV)
	{
		if (src != null && w > 0 && h > 0)
		{
			Image img = loadImage(src);

			if (img != null)
			{
				Rectangle bounds = getImageBounds(img, x, y, w, h, aspect);
				img = scaleImage(img, bounds.width, bounds.height);

				if (img != null)
				{
					drawImage(
							createImageGraphics(bounds.x, bounds.y,
									bounds.width, bounds.height, flipH, flipV),
							img, bounds.x, bounds.y);
				}
			}
		}
	}

	/**
	 * 
	 */
	protected void drawImage(Graphics2D graphics, Image image, int x, int y)
	{
		graphics.drawImage(image, x, y, null);
	}

	/**
	 * Hook for image caching.
	 */
	protected Image loadImage(String src)
	{
		return mxUtils.loadImage(src);
	}

	/**
	 * 
	 */
	protected final Rectangle getImageBounds(Image img, double x, double y,
			double w, double h, boolean aspect)
	{
		x = state.dx + x * state.scale;
		y = state.dy + y * state.scale;
		w *= state.scale;
		h *= state.scale;

		if (aspect)
		{
			Dimension size = getImageSize(img);
			double s = Math.min(w / size.width, h / size.height);
			int sw = (int) Math.round(size.width * s);
			int sh = (int) Math.round(size.height * s);
			x += (w - sw) / 2;
			y += (h - sh) / 2;
			w = sw;
			h = sh;
		}
		else
		{
			w = Math.round(w);
			h = Math.round(h);
		}

		return new Rectangle((int) x, (int) y, (int) w, (int) h);
	}

	/**
	 * Returns the size for the given image.
	 */
	protected Dimension getImageSize(Image image)
	{
		return new Dimension(image.getWidth(null), image.getHeight(null));
	}

	/**
	 * Uses {@link #IMAGE_SCALING} to scale the given image.
	 */
	protected Image scaleImage(Image img, int w, int h)
	{
		Dimension size = getImageSize(img);

		if (w == size.width && h == size.height)
		{
			return img;
		}
		else
		{
			return img.getScaledInstance(w, h, IMAGE_SCALING);
		}
	}

	/**
	 * Creates a graphic instance for rendering an image.
	 */
	protected final Graphics2D createImageGraphics(double x, double y,
			double w, double h, boolean flipH, boolean flipV)
	{
		Graphics2D g2 = state.g;

		if (flipH || flipV)
		{
			g2 = (Graphics2D) g2.create();
			int sx = 1;
			int sy = 1;
			int dx = 0;
			int dy = 0;

			if (flipH)
			{
				sx = -1;
				dx = (int) (-w - 2 * x);
			}

			if (flipV)
			{
				sy = -1;
				dy = (int) (-h - 2 * y);
			}

			g2.scale(sx, sy);
			g2.translate(dx, dy);
		}

		return g2;
	}

	/**
	 * Creates a HTML document around the given markup.
	 */
	protected String createHtmlDocument(String text, String align,
			String valign, int w, int h)
	{
		StringBuffer css = new StringBuffer();
		css.append("font-family:" + state.fontFamily + ";");
		css.append("font-size:" + Math.floor(state.fontSize / state.scale) + " pt;");
		css.append("color:" + state.fontColorValue + ";");

		if ((state.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
		{
			css.append("font-weight:bold;");
		}

		if ((state.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
		{
			css.append("font-style:italic;");
		}

		if ((state.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
		{
			css.append("text-decoration:underline;");
		}

		if (align != null)
		{
			if (align.equals(mxConstants.ALIGN_CENTER))
			{
				css.append("text-align:center;");
			}
			else if (align.equals(mxConstants.ALIGN_RIGHT))
			{
				css.append("text-align:right;");
			}
		}

		return "<html><div style=\"width:" + w + "px;height:" + h + "px;"
				+ css.toString() + "\">" + text + "</div></html>";
	}
	
	/**
	 * Hook to return the renderer for HTML formatted text. This implementation returns
	 * the shared instance of mxLighweightLabel.
	 */
	protected JLabel getTextRenderer()
	{
		return mxLightweightLabel.getSharedInstance();
	}

	/**
	 * Draws the given text.
	 */
	public void text(double x, double y, double w, double h, String str,
			String align, String valign, boolean vertical, boolean wrap,
			String format)
	{
		if (!state.fontColorValue.equals(mxConstants.NONE))
		{
			if (format != null && format.equals("html"))
			{
				x += state.dx / state.scale;
				y += state.dy / state.scale;
				
				JLabel textRenderer = getTextRenderer();

				if (textRenderer != null && rendererPane != null)
				{
					// Use native scaling for HTML
					AffineTransform previous = state.g.getTransform();
					state.g.scale(state.scale, state.scale);
					
					// Renders the scaled text with a correction factor of
					// PX_PER_PIXEL for px in HTML vs pixels in the bitmap
					str = createHtmlDocument(str, align, valign,
							(int) Math.round(w * mxConstants.PX_PER_PIXEL),
							(int) Math.round(h * mxConstants.PX_PER_PIXEL));
					textRenderer.setText(str);
					rendererPane.paintComponent(state.g, textRenderer,
							rendererPane, (int) Math.round(x),
							(int) Math.round(y), (int) Math.round(w),
							(int) Math.round(h), true);
					state.g.setTransform(previous);
				}
			}
			else
			{
				x = state.dx + x * state.scale;
				y = state.dy + y * state.scale;
				w *= state.scale;
				h *= state.scale;

				// Font-metrics needed below this line
				Graphics2D g2 = createTextGraphics(x, y, w, h, vertical);
				FontMetrics fm = g2.getFontMetrics();
				String[] lines = str.split("\n");

				y = getVerticalTextPosition(x, y, w, h, align, valign,
						vertical, fm, lines);
				x = getHorizontalTextPosition(x, y, w, h, align, valign,
						vertical, fm, lines);

				for (int i = 0; i < lines.length; i++)
				{
					double dx = 0;

					if (align != null)
					{
						if (align.equals(mxConstants.ALIGN_CENTER))
						{
							int sw = fm.stringWidth(lines[i]);
							dx = (w - sw) / 2;
						}
						else if (align.equals(mxConstants.ALIGN_RIGHT))
						{
							int sw = fm.stringWidth(lines[i]);
							dx = w - sw;
						}
					}

					// Adds support for underlined text via attributed character iterator
					if ((state.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
					{
						AttributedString as = new AttributedString(lines[i]);
						as.addAttribute(TextAttribute.FONT, g2.getFont());
						as.addAttribute(TextAttribute.UNDERLINE,
								TextAttribute.UNDERLINE_ON);

						g2.drawString(as.getIterator(),
								(int) Math.round(x + dx), (int) Math.round(y));
					}
					else
					{
						g2.drawString(lines[i], (int) Math.round(x + dx),
								(int) Math.round(y));
					}

					y += fm.getHeight() + mxConstants.LINESPACING;
				}
			}
		}
	}

	/**
	 * Returns a new graphics instance with the correct color and font for
	 * text rendering.
	 */
	protected final Graphics2D createTextGraphics(double x, double y, double w,
			double h, boolean vertical)
	{
		Graphics2D g2 = state.g;
		updateFont();

		if (vertical)
		{
			g2 = (Graphics2D) state.g.create();
			g2.rotate(-Math.PI / 2, x + w / 2, y + h / 2);
		}

		if (state.fontColor == null)
		{
			state.fontColor = parseColor(state.fontColorValue);
		}

		g2.setColor(state.fontColor);

		return g2;
	}

	/**
	 * 
	 */
	protected double getVerticalTextPosition(double x, double y, double w,
			double h, String align, String valign, boolean vertical,
			FontMetrics fm, String[] lines)
	{
		double lineHeight = fm.getHeight() + mxConstants.LINESPACING;
		double textHeight = lines.length * lineHeight;
		double dy = h - textHeight;

		// Top is default
		if (valign == null || valign.equals(mxConstants.ALIGN_TOP))
		{
			y = Math.max(y - 2 * state.scale, y + dy / 2);
		}
		else if (valign.equals(mxConstants.ALIGN_MIDDLE))
		{
			y = y + dy / 2;
		}
		else if (valign.equals(mxConstants.ALIGN_BOTTOM))
		{
			y = Math.min(y, y + dy);
		}

		return y + fm.getHeight() * 0.75;
	}

	/**
	 * This implementation returns x.
	 */
	protected double getHorizontalTextPosition(double x, double y, double w,
			double h, String align, String valign, boolean vertical,
			FontMetrics fm, String[] lines)
	{
		if (align == null || align.equals(mxConstants.ALIGN_LEFT))
		{
			x += 2 * state.scale;
		}

		return x;
	}

	/**
	 * 
	 */
	public void begin()
	{
		currentPath = new GeneralPath();
		currentPathIsOrthogonal = true;
		lastPoint = null;
	}

	/**
	 * 
	 */
	public void moveTo(double x, double y)
	{
		if (currentPath != null)
		{
			currentPath.moveTo((float) (state.dx + x * state.scale),
					(float) (state.dy + y * state.scale));

			if (isAutoAntiAlias())
			{
				lastPoint = new Point2D.Double(x, y);
			}
		}
	}

	/**
	 * 
	 */
	public void lineTo(double x, double y)
	{
		if (currentPath != null)
		{
			currentPath.lineTo((float) (state.dx + x * state.scale),
					(float) (state.dy + y * state.scale));

			if (isAutoAntiAlias())
			{
				if (lastPoint != null && currentPathIsOrthogonal
						&& x != lastPoint.getX() && y != lastPoint.getY())
				{
					currentPathIsOrthogonal = false;
				}

				lastPoint = new Point2D.Double(x, y);
			}
		}
	}

	/**
	 * 
	 */
	public void quadTo(double x1, double y1, double x2, double y2)
	{
		if (currentPath != null)
		{
			currentPath.quadTo((float) (state.dx + x1 * state.scale),
					(float) (state.dy + y1 * state.scale),
					(float) (state.dx + x2 * state.scale),
					(float) (state.dy + y2 * state.scale));
			currentPathIsOrthogonal = false;
		}
	}

	/**
	 * 
	 */
	public void curveTo(double x1, double y1, double x2, double y2, double x3,
			double y3)
	{
		if (currentPath != null)
		{
			currentPath.curveTo((float) (state.dx + x1 * state.scale),
					(float) (state.dy + y1 * state.scale),
					(float) (state.dx + x2 * state.scale),
					(float) (state.dy + y2 * state.scale),
					(float) (state.dx + x3 * state.scale),
					(float) (state.dy + y3 * state.scale));
			currentPathIsOrthogonal = false;
		}
	}

	/**
	 * Closes the current path.
	 */
	public void close()
	{
		if (currentPath != null)
		{
			currentPath.closePath();
		}
	}

	/**
	 * 
	 */
	public void stroke()
	{
		if (currentPath != null
				&& !state.strokeColorValue.equals(mxConstants.NONE))
		{
			if (state.strokeColor == null)
			{
				state.strokeColor = parseColor(state.strokeColorValue);
			}

			updateStroke();
			state.g.setColor(state.strokeColor);

			Object previousHint = null;

			if (isAutoAntiAlias() && currentPathIsOrthogonal)
			{
				previousHint = state.g
						.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
				state.g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
						RenderingHints.VALUE_ANTIALIAS_OFF);
			}

			state.g.draw(currentPath);

			if (previousHint != null)
			{
				state.g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
						previousHint);
			}
		}
	}

	/**
	 * 
	 */
	public void fill()
	{
		if (currentPath != null
				&& (!state.fillColorValue.equals(mxConstants.NONE) || state.paint != null))
		{
			if (state.paint != null)
			{
				state.g.setPaint(state.paint);
			}
			else
			{
				if (state.fillColor == null)
				{
					state.fillColor = parseColor(state.fillColorValue);
				}

				state.g.setColor(state.fillColor);
				state.g.setPaint(null);
			}

			state.g.fill(currentPath);
		}
	}

	/**
	 * 
	 */
	public void fillAndStroke()
	{
		fill();
		stroke();
	}

	/**
	 * 
	 */
	public void shadow(String value, boolean filled)
	{
		if (value != null && currentPath != null)
		{
			if (currentShadowColor == null || currentShadowValue == null
					|| !currentShadowValue.equals(value))
			{
				currentShadowColor = parseColor(value);
				currentShadowValue = value;
			}

			updateStroke();
			state.g.setColor(currentShadowColor);
			
			if (filled)
			{
				state.g.fill(currentPath);
			}
			
			state.g.draw(currentPath);
		}
	}

	/**
	 * 
	 */
	public void clip()
	{
		if (currentPath != null)
		{
			state.g.clip(currentPath);
		}
	}

	/**
	 * 
	 */
	protected void updateFont()
	{
		// LATER: Make currentFont part of state
		if (currentFont == null)
		{
			int size = (int) Math.floor(state.fontSize);

			int style = ((state.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) ? Font.BOLD
					: Font.PLAIN;
			style += ((state.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) ? Font.ITALIC
					: Font.PLAIN;

			currentFont = createFont(state.fontFamily, style, size);
			state.g.setFont(currentFont);
		}
	}

	/**
	 * Hook for subclassers to implement font caching.
	 */
	protected Font createFont(String family, int style, int size)
	{
		return new Font(getFontName(family), style, size);
	}

	/**
	 * Returns a font name for the given font family.
	 */
	protected String getFontName(String family)
	{
		if (family != null)
		{
			int comma = family.indexOf(',');
			
			if (comma >= 0)
			{
				family = family.substring(0, comma);
			}
		}
		
		return family;
	}

	/**
	 * 
	 */
	protected void updateStroke()
	{
		if (currentStroke == null)
		{
			int cap = BasicStroke.CAP_BUTT;

			if (state.lineCap.equals("round"))
			{
				cap = BasicStroke.CAP_ROUND;
			}
			else if (state.lineCap.equals("square"))
			{
				cap = BasicStroke.CAP_SQUARE;
			}

			int join = BasicStroke.JOIN_MITER;

			if (state.lineJoin.equals("round"))
			{
				join = BasicStroke.JOIN_ROUND;
			}
			else if (state.lineJoin.equals("bevel"))
			{
				join = BasicStroke.JOIN_BEVEL;
			}

			float miterlimit = (float) state.miterLimit;
			float[] dash = null;
			
			if (state.dashed)
			{
				dash = new float[state.dashPattern.length];
				
				for (int i = 0; i < dash.length; i++)
				{
					dash[i] = (float) (state.dashPattern[i] * state.strokeWidth);
				}
			}

			currentStroke = new BasicStroke((float) state.strokeWidth, cap,
					join, miterlimit, dash, 0);
			state.g.setStroke(currentStroke);
		}
	}

	/**
	 * 
	 */
	protected class CanvasState implements Cloneable
	{
		/**
		 * 
		 */
		protected double alpha = 1;

		/**
		 * 
		 */
		protected double scale = 1;

		/**
		 * 
		 */
		protected double dx = 0;

		/**
		 * 
		 */
		protected double dy = 0;

		/**
		 * 
		 */
		protected double miterLimit = 10;

		/**
		 * 
		 */
		protected int fontStyle = 0;

		/**
		 * 
		 */
		protected double fontSize = mxConstants.DEFAULT_FONTSIZE;

		/**
		 * 
		 */
		protected String fontFamily = mxConstants.DEFAULT_FONTFAMILIES;

		/**
		 * 
		 */
		protected String fontColorValue = "#000000";

		/**
		 * 
		 */
		protected Color fontColor;

		/**
		 * 
		 */
		protected String lineCap = "flat";

		/**
		 * 
		 */
		protected String lineJoin = "miter";

		/**
		 * 
		 */
		protected double strokeWidth = 1;

		/**
		 * 
		 */
		protected String strokeColorValue = mxConstants.NONE;

		/**
		 * 
		 */
		protected Color strokeColor;

		/**
		 * 
		 */
		protected String fillColorValue = mxConstants.NONE;

		/**
		 * 
		 */
		protected Color fillColor;

		/**
		 * 
		 */
		protected Paint paint;

		/**
		 * 
		 */
		protected boolean dashed = false;

		/**
		 * 
		 */
		protected float[] dashPattern = { 3, 3 };

		/**
		 * Stores the actual state.
		 */
		protected transient Graphics2D g;

		/**
		 * 
		 */
		public Object clone() throws CloneNotSupportedException
		{
			return super.clone();
		}

	}

}
