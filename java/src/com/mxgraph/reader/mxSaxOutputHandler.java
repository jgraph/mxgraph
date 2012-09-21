package com.mxgraph.reader;

import java.util.Hashtable;
import java.util.Map;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import com.mxgraph.canvas.mxICanvas2D;

/**
	XMLReader reader = SAXParserFactory.newInstance().newSAXParser()
			.getXMLReader();
	reader.setContentHandler(new mxSaxExportHandler(
			new mxGraphicsExportCanvas(g2)));
	reader.parse(new InputSource(new StringReader(xml)));
 */
public class mxSaxOutputHandler extends DefaultHandler
{
	/**
	 * 
	 */
	protected mxICanvas2D canvas;

	/**
	 * 
	 */
	protected transient Map<String, IElementHandler> handlers = new Hashtable<String, IElementHandler>();

	/**
	 * 
	 */
	public mxSaxOutputHandler(mxICanvas2D canvas)
	{
		setCanvas(canvas);
		initHandlers();
	}

	/**
	 * Sets the canvas for rendering.
	 */
	public void setCanvas(mxICanvas2D value)
	{
		canvas = value;
	}

	/**
	 * Returns the canvas for rendering.
	 */
	public mxICanvas2D getCanvas()
	{
		return canvas;
	}

	/**
	 * 
	 */
	public void startElement(String uri, String localName, String qName,
			Attributes atts) throws SAXException
	{
		IElementHandler handler = handlers.get(qName.toLowerCase());

		if (handler != null)
		{
			handler.parseElement(atts);
		}
	}

	/**
	 * 
	 */
	protected void initHandlers()
	{
		handlers.put("save", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.save();
			}
		});

		handlers.put("restore", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.restore();
			}
		});

		handlers.put("scale", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.scale(Double.parseDouble(atts.getValue("scale")));
			}
		});

		handlers.put("translate", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.translate(Double.parseDouble(atts.getValue("dx")),
						Double.parseDouble(atts.getValue("dy")));
			}
		});

		handlers.put("rotate", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.rotate(Double.parseDouble(atts.getValue("theta")), atts
						.getValue("flipH").equals("1"), atts.getValue("flipV")
						.equals("1"), Double.parseDouble(atts.getValue("cx")),
						Double.parseDouble(atts.getValue("cy")));
			}
		});

		handlers.put("strokewidth", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setStrokeWidth(Double.parseDouble(atts.getValue("width")));
			}
		});

		handlers.put("strokecolor", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setStrokeColor(atts.getValue("color"));
			}
		});

		handlers.put("dashed", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setDashed(atts.getValue("dashed").equals("1"));
			}
		});

		handlers.put("dashpattern", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setDashPattern(atts.getValue("pattern"));
			}
		});

		handlers.put("linecap", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setLineCap(atts.getValue("cap"));
			}
		});

		handlers.put("linejoin", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setLineJoin(atts.getValue("join"));
			}
		});

		handlers.put("miterlimit", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setMiterLimit(Double.parseDouble(atts.getValue("limit")));
			}
		});

		handlers.put("fontsize", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setFontSize(Double.parseDouble(atts.getValue("size")));
			}
		});

		handlers.put("fontcolor", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setFontColor(atts.getValue("color"));
			}
		});

		handlers.put("fontfamily", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setFontFamily(atts.getValue("family"));
			}
		});

		handlers.put("fontstyle", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setFontStyle(Integer.parseInt(atts.getValue("style")));
			}
		});

		handlers.put("alpha", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setAlpha(Double.parseDouble(atts.getValue("alpha")));
			}
		});

		handlers.put("fillcolor", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setFillColor(atts.getValue("color"));
			}
		});

		handlers.put("gradient", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setGradient(atts.getValue("c1"), atts.getValue("c2"),
						Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")),
						atts.getValue("direction"));
			}
		});

		handlers.put("glass", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.setGlassGradient(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")));
			}
		});

		handlers.put("rect", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.rect(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")));
			}
		});

		handlers.put("roundrect", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.roundrect(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")),
						Double.parseDouble(atts.getValue("dx")),
						Double.parseDouble(atts.getValue("dy")));
			}
		});

		handlers.put("ellipse", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.ellipse(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")));
			}
		});

		handlers.put("image", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.image(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")),
						Double.parseDouble(atts.getValue("w")),
						Double.parseDouble(atts.getValue("h")),
						atts.getValue("src"),
						atts.getValue("aspect").equals("1"),
						atts.getValue("flipH").equals("1"),
						atts.getValue("flipV").equals("1"));
			}
		});

		handlers.put("text", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.text(Double.parseDouble(atts.getValue("x")), Double
						.parseDouble(atts.getValue("y")), Double
						.parseDouble(atts.getValue("w")), Double
						.parseDouble(atts.getValue("h")), atts.getValue("str"),
						atts.getValue("align"), atts.getValue("valign"), atts
								.getValue("vertical").equals("1"),
						getValue(atts, "wrap", "").equals("1"), atts
								.getValue("format"));
			}
		});

		handlers.put("begin", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.begin();
			}
		});

		handlers.put("move", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.moveTo(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")));
			}
		});

		handlers.put("line", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.lineTo(Double.parseDouble(atts.getValue("x")),
						Double.parseDouble(atts.getValue("y")));
			}
		});

		handlers.put("quad", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.quadTo(Double.parseDouble(atts.getValue("x1")),
						Double.parseDouble(atts.getValue("y1")),
						Double.parseDouble(atts.getValue("x2")),
						Double.parseDouble(atts.getValue("y2")));
			}
		});

		handlers.put("curve", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.curveTo(Double.parseDouble(atts.getValue("x1")),
						Double.parseDouble(atts.getValue("y1")),
						Double.parseDouble(atts.getValue("x2")),
						Double.parseDouble(atts.getValue("y2")),
						Double.parseDouble(atts.getValue("x3")),
						Double.parseDouble(atts.getValue("y3")));
			}
		});

		handlers.put("close", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.close();
			}
		});

		handlers.put("stroke", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.stroke();
			}
		});

		handlers.put("fill", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.fill();
			}
		});

		handlers.put("fillstroke", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.fillAndStroke();
			}
		});

		handlers.put("shadow", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.shadow(atts.getValue("value"),
						getValue(atts, "filled", "1").equals("1"));
			}
		});

		handlers.put("clip", new IElementHandler()
		{
			public void parseElement(Attributes atts)
			{
				canvas.clip();
			}
		});
	}

	/**
	 * Returns the given attribute value or an empty string.
	 */
	protected String getValue(Attributes atts, String name, String defaultValue)
	{
		String value = atts.getValue(name);

		if (value == null)
		{
			value = defaultValue;
		}

		return value;
	};

	/**
	 * 
	 */
	protected interface IElementHandler
	{
		void parseElement(Attributes atts);
	}

}
