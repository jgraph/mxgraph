/**
 * $Id: mxImageExport.js,v 1.3 2013/01/05 14:18:32 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxImageExport
 * 
 * Creates a new image export instance to be used with an export canvas. Here
 * is an example that uses this class to create an image via a backend using
 * <mxXmlExportCanvas>.
 * 
 * (code)
 * var xmlDoc = mxUtils.createXmlDocument();
 * var root = xmlDoc.createElement('output');
 * xmlDoc.appendChild(root);
 * 
 * var xmlCanvas = new mxXmlCanvas2D(root);
 * var imgExport = new mxImageExport();
 * imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
 * 
 * var bounds = graph.getGraphBounds();
 * var w = Math.ceil(bounds.x + bounds.width);
 * var h = Math.ceil(bounds.y + bounds.height);
 * 
 * var xml = mxUtils.getXml(root);
 * new mxXmlRequest('export', 'format=png&w=' + w +
 * 		'&h=' + h + '&bg=#F9F7ED&xml=' + encodeURIComponent(xml))
 * 		.simulate(document, '_blank');
 * (end)
 * 
 * Constructor: mxImageExport
 * 
 * Constructs a new image export.
 */
function mxImageExport() { };

/**
 * Variable: includeOverlays
 * 
 * Specifies if overlays should be included in the export. Default is false.
 */
mxImageExport.prototype.includeOverlays = false;

/**
 * Function: drawState
 * 
 * Draws the given state and all its descendants to the given canvas.
 */
mxImageExport.prototype.drawState = function(state, canvas)
{
	if (state != null)
	{
		this.visitStatesRecursive(state, canvas, this.drawCellState);
				
		// Paints the overlays
		if (this.includeOverlays)
		{
			this.visitStatesRecursive(state, canvas, this.drawOverlays);
		}
	}
};

/**
 * Function: drawState
 * 
 * Draws the given state and all its descendants to the given canvas.
 */
mxImageExport.prototype.visitStatesRecursive = function(state, canvas, visitor)
{
	if (state != null)
	{
		visitor(state, canvas);
		
		var graph = state.view.graph;
		var childCount = graph.model.getChildCount(state.cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var childState = graph.view.getState(graph.model.getChildAt(state.cell, i));
			this.visitStatesRecursive(childState, canvas, visitor);
		}
	}
};

/**
 * Function: drawShape
 * 
 * Draws the given state to the given canvas.
 */
mxImageExport.prototype.drawCellState = function(state, canvas)
{
	// Paints the shape
	if (state.shape instanceof mxShape)
	{
		canvas.save();
		state.shape.paint(canvas);
		canvas.restore();
	}
	
	// Paints the label
	if (state.text != null)
	{
		canvas.save();
		state.text.paint(canvas);
		canvas.restore();
	}
};

/**
 * Function: drawOverlays
 * 
 * Draws the overlays for the given state. This is called if <includeOverlays>
 * is true.
 */
mxImageExport.prototype.drawOverlays = function(state, canvas)
{
	if (state.overlays != null)
	{
		state.overlays.visit(function(id, shape)
		{
			if (shape instanceof mxShape)
			{
				shape.paint(canvas);
			}
		});
	}
};

