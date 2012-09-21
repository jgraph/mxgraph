/**
 * $Id: mxConnector.js,v 1.80 2012-05-24 12:00:45 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxConnector
 * 
 * Extends <mxShape> to implement a connector shape. The connector
 * shape allows for arrow heads on either side.
 * 
 * This shape is registered under <mxConstants.SHAPE_CONNECTOR> in
 * <mxCellRenderer>.
 * 
 * Constructor: mxConnector
 * 
 * Constructs a new connector shape.
 * 
 * Parameters:
 * 
 * points - Array of <mxPoints> that define the points. This is stored in
 * <mxShape.points>.
 * stroke - String that defines the stroke color. This is stored in <stroke>.
 * Default is 'black'.
 * strokewidth - Optional integer that defines the stroke width. Default is
 * 1. This is stored in <strokewidth>.
 */
function mxConnector(points, stroke, strokewidth)
{
	this.points = points;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
 * Extends mxShape.
 */
mxConnector.prototype = new mxShape();
mxConnector.prototype.constructor = mxConnector;

/**
 * Variable: vmlNodes
 *
 * Adds local references to <mxShape.vmlNodes>.
 */
mxConnector.prototype.vmlNodes = mxConnector.prototype.vmlNodes.concat([
  'shapeNode', 'start', 'end', 'startStroke', 'endStroke', 'startFill', 'endFill']);

/**
 * Variable: mixedModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw in VML in mixed Html mode.
 */
mxConnector.prototype.mixedModeHtml = false;

/**
 * Variable: preferModeHtml
 *
 * Overrides the parent value with false, meaning it will
 * draw as VML in prefer Html mode.
 */
mxConnector.prototype.preferModeHtml = false;

/**
 * Variable: allowCrispMarkers
 *
 * Specifies if <mxShape.crisp> should be allowed for markers. Default is false.
 */
mxConnector.prototype.allowCrispMarkers = false;

/**
 * Variable: addPipe
 *
 * Specifies if a SVG path should be created around any path to increase the
 * tolerance for mouse events. Default is false since this shape is filled.
 */
mxConnector.prototype.addPipe = true;

/**
 * Function: configureHtmlShape
 *
 * Overrides <mxShape.configureHtmlShape> to clear the border and background.
 */
mxConnector.prototype.configureHtmlShape = function(node)
{
	mxShape.prototype.configureHtmlShape.apply(this, arguments);
	node.style.borderStyle = '';
	node.style.background = '';
};

/**
 * Function: createVml
 *
 * Creates and returns the VML node to represent this shape.
 */
mxConnector.prototype.createVml = function()
{
	var node = document.createElement('v:group');
	node.style.position = 'absolute';
	this.shapeNode = document.createElement('v:shape');
	this.updateVmlStrokeColor(this.shapeNode);
	this.updateVmlStrokeNode(this.shapeNode);
	node.appendChild(this.shapeNode);
	this.shapeNode.filled = 'false';

	if (this.isShadow)
	{
		this.createVmlShadow(this.shapeNode);
	}
	
	// Creates the start arrow as an additional child path		
	if (this.startArrow != null)
	{
		this.start = document.createElement('v:shape');
		this.start.style.position = 'absolute';
		
		// Only required for opacity and joinstyle
		this.startStroke = document.createElement('v:stroke');
		this.startStroke.joinstyle = 'miter';
		this.start.appendChild(this.startStroke);
		
		this.startFill = document.createElement('v:fill');
		this.start.appendChild(this.startFill);

		node.appendChild(this.start);
	}

	// Creates the end arrows as an additional child path
	if (this.endArrow != null)
	{
		this.end = document.createElement('v:shape');
		this.end.style.position = 'absolute';
		
		// Only required for opacity and joinstyle
		this.endStroke = document.createElement('v:stroke');
		this.endStroke.joinstyle = 'miter';
		this.end.appendChild(this.endStroke);
		
		this.endFill = document.createElement('v:fill');
		this.end.appendChild(this.endFill);

		node.appendChild(this.end);
	}
	
	this.updateVmlMarkerOpacity();
	
	return node;
};

/**
 * Function: updateVmlMarkerOpacity
 *
 * Updates the opacity for the markers in VML.
 */
mxConnector.prototype.updateVmlMarkerOpacity = function()
{
	var op = (this.opacity != null) ? (this.opacity + '%') : '100%';

	if (this.start != null)
	{
		this.startFill.opacity = op;
		this.startStroke.opacity = op;
	}

	if (this.end != null)
	{
		this.endFill.opacity = op;
		this.endStroke.opacity = op;
	}
};

/**
 * Function: redrawVml
 *
 * Redraws this VML shape by invoking <updateVmlShape> on this.node.
 */
mxConnector.prototype.reconfigure = function()
{
	// Never fill a connector
	this.fill = null;
	
	if (mxUtils.isVml(this.node))
	{
		// Updates the style of the given shape
		// LATER: Check if this can be replaced with redrawVml and
		// updating the color, dash pattern and shadow.
		this.node.style.visibility = 'hidden';
		this.configureVmlShape(this.shapeNode);
		this.updateVmlMarkerOpacity();
		this.node.style.visibility = 'visible';
	}
	else
	{
		mxShape.prototype.reconfigure.apply(this, arguments);
	}
};

/**
 * Function: redrawVml
 *
 * Redraws this VML shape by invoking <updateVmlShape> on this.node.
 */
mxConnector.prototype.redrawVml = function()
{
	if (this.node != null && this.points != null && this.bounds != null &&
		!isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
		!isNaN(this.bounds.width) && !isNaN(this.bounds.height))
	{
		var w = Math.max(0, Math.round(this.bounds.width));
		var h = Math.max(0, Math.round(this.bounds.height));
		var cs = w + ',' + h;
		w += 'px';
		h += 'px';
		
		// Computes the marker paths before the main path is updated so
		// that offsets can be taken into account
		if (this.start != null)
		{
			this.start.style.width = w;
			this.start.style.height = h;
			this.start.coordsize = cs;
			
			var p0 = this.points[1];
			var pe = this.points[0];
			
			var size = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE);
			this.startOffset = this.redrawMarker(this.start, this.startArrow, p0, pe, this.stroke, size);
		}
		
		if (this.end != null)
		{
			this.end.style.width = w;
			this.end.style.height = h;
			this.end.coordsize = cs;
			
			var n = this.points.length;
			var p0 = this.points[n - 2];
			var pe = this.points[n - 1];
			
			var size = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE);
			this.endOffset = this.redrawMarker(this.end, this.endArrow, p0, pe, this.stroke, size);
		}
		
		this.updateVmlShape(this.node);
		this.updateVmlShape(this.shapeNode);
		this.shapeNode.filled = 'false';

		// Adds custom dash pattern
		if (this.isDashed)
		{
			var pat = mxUtils.getValue(this.style, 'dashStyle', null);
			
			if (pat != null)
			{
				this.strokeNode.dashstyle = pat;
			}

			if (this.shadowStrokeNode != null)
			{
				this.shadowStrokeNode.dashstyle = this.strokeNode.dashstyle;
			}
		}
	}
};

/**
 * Function: createSvg
 *
 * Creates and returns the SVG node to represent this shape.
 */
mxConnector.prototype.createSvg = function()
{
	this.fill = null;
	var g = this.createSvgGroup('path');
	
	// Creates the start arrow as an additional child path		
	if (this.startArrow != null)
	{
		this.start = document.createElementNS(mxConstants.NS_SVG, 'path');
		g.appendChild(this.start);
	}

	// Creates the end arrows as an additional child path
	if (this.endArrow != null)
	{
		this.end = document.createElementNS(mxConstants.NS_SVG, 'path');
		g.appendChild(this.end);
	}
	
	// Creates an invisible shape around the path for easier
	// selection with the mouse. Note: Firefox does not ignore
	// the value of the stroke attribute for pointer-events: stroke,
	// it does, however, ignore the visibility attribute.
	if (this.addPipe)
	{
		this.pipe = this.createSvgPipe();
		g.appendChild(this.pipe);
	}
	
	return g;
};

/**
 * Function: redrawSvg
 *
 * Updates the SVG node(s) to reflect the latest bounds and scale.
 */
mxConnector.prototype.redrawSvg = function()
{
	// Computes the markers first which modifies the coordinates of the
	// endpoints to not overlap with the painted marker then updates the actual
	// shape for the edge to take the modified endpoints into account.
	if (this.points != null && this.points[0] != null)
	{
		var color = this.innerNode.getAttribute('stroke');
		
		// Draws the start marker
		if (this.start != null)
		{
			var p0 = this.points[1];
			var pe = this.points[0];
			
			var size = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE,
					mxConstants.DEFAULT_MARKERSIZE);
			this.startOffset = this.redrawMarker(this.start,
				this.startArrow, p0, pe, color, size);
			
			if (this.allowCrispMarkers && this.crisp)
			{
				this.start.setAttribute('shape-rendering', 'crispEdges');
			}
			else
			{
				this.start.removeAttribute('shape-rendering');
			}
		}
		
		// Draws the end marker
		if (this.end != null)
		{
			var n = this.points.length;
			
			var p0 = this.points[n - 2];
			var pe = this.points[n - 1];

			var size = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE,
					mxConstants.DEFAULT_MARKERSIZE);
			this.endOffset = this.redrawMarker(this.end,
				this.endArrow, p0, pe, color, size);
			
			if (this.allowCrispMarkers && this.crisp)
			{
				this.end.setAttribute('shape-rendering', 'crispEdges');
			}
			else
			{
				this.end.removeAttribute('shape-rendering');
			}
		}
	}

	this.updateSvgShape(this.innerNode);
	var d = this.innerNode.getAttribute('d');
	
	if (d != null)
	{
		var strokeWidth = Math.round(this.strokewidth * this.scale);
		
		// Updates the tolerance of the invisible shape for event handling
		if (this.pipe != null)
		{
			this.pipe.setAttribute('d', this.innerNode.getAttribute('d'));
			this.pipe.setAttribute('stroke-width', strokeWidth + mxShape.prototype.SVG_STROKE_TOLERANCE);
		}
		
		// Updates the shadow
		if (this.shadowNode != null)
		{
			this.shadowNode.setAttribute('transform',  this.getSvgShadowTransform());
			this.shadowNode.setAttribute('d',  d);
			this.shadowNode.setAttribute('stroke-width', strokeWidth);
		}
	}

	// Adds custom dash pattern
	if (this.isDashed)
	{
		var pat = this.createDashPattern(this.scale * this.strokewidth);
		
		if (pat != null)
		{
			this.innerNode.setAttribute('stroke-dasharray', pat);
		}
	}

	// Updates the shadow
	if (this.shadowNode != null)
	{
		var pat = this.innerNode.getAttribute('stroke-dasharray');
		
		if (pat != null)
		{
			this.shadowNode.setAttribute('stroke-dasharray', pat);
		}
	}
};

/**
 * Function: createDashPattern
 *
 * Creates a dash pattern for the given factor.
 */
mxConnector.prototype.createDashPattern = function(factor)
{
	var value = mxUtils.getValue(this.style, 'dashPattern', null);
	
	if (value != null)
	{
		var tmp = value.split(' ');
		var pat = [];
		
		for (var i = 0; i < tmp.length; i++)
		{
			if (tmp[i].length > 0)
			{
				pat.push(Math.round(Number(tmp[i]) * factor));
			}
		}
		
		return pat.join(' ');
	}
	
	return null;
};

/**
 * Function: redrawMarker
 *
 * Updates the given SVG or VML marker.
 */
mxConnector.prototype.redrawMarker = function(node, type, p0, pe, color, size)
{
	return mxMarker.paintMarker(node, type, p0, pe, color, this.strokewidth,
			size, this.scale, this.bounds.x, this.bounds.y, this.start == node,
			this.style);
};
