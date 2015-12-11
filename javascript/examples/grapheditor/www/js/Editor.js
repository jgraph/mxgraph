/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
// Specifies if local storage should be used (eg. on the iPad which has no filesystem)
var useLocalStorage = typeof(Storage) != 'undefined' && mxClient.IS_IOS;
var fileSupport = window.File != null && window.FileReader != null && window.FileList != null && urlParams['filesupport'] != '0';

// Workaround for allowing target="_blank" in HTML sanitizer
// see https://code.google.com/p/google-caja/issues/detail?can=2&q=&colspec=ID%20Type%20Status%20Priority%20Owner%20Summary&groupby=&sort=&id=1296
if (typeof html4 !== 'undefined')
{
	html4.ATTRIBS["a::target"] = 0;
}

// Specifies if the touch UI should be used (cannot detect touch in FF so always on for Windows/Linux)
var touchStyle = mxClient.IS_TOUCH || (mxClient.IS_FF && mxClient.IS_WIN) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || urlParams['touch'] == '1';

// Counts open editor tabs (must be global for cross-window access)
var counter = 0;

// Cross-domain window access is not allowed in FF, so if we
// were opened from another domain then this will fail. 
try
{
	var op = window;
	
	while (op.opener != null && !isNaN(op.opener.counter))
	{
		op = op.opener;
	}
	
	// Increments the counter in the first opener in the chain
	if (op != null)
	{
		op.counter++;
		counter = op.counter;
	}
}
catch (e)
{
	// ignore
}

/**
 * Sets global constants.
 */
// Changes default colors
mxConstants.SHADOW_OPACITY = 0.25;
mxConstants.SHADOWCOLOR = '#000000';
mxConstants.VML_SHADOWCOLOR = '#d0d0d0';
mxGraph.prototype.pageBreakColor = '#c0c0c0';
mxGraph.prototype.pageScale = 1;

//Matches label positions of mxGraph 1.x
mxText.prototype.baseSpacingTop = 5;
mxText.prototype.baseSpacingBottom = 1;

//Adds stylesheet for IE6
if (mxClient.IS_IE6)
{
	mxClient.link('stylesheet', CSS_PATH + '/grapheditor-ie6.css');
}

//Adds required resources (disables loading of fallback properties, this can only
//be used if we know that all keys are defined in the language specific file)
mxResources.loadDefaultBundle = false;
mxResources.add(RESOURCE_BASE);

/**
 * Editor constructor executed on page load.
 */
Editor = function(chromeless)
{
	mxEventSource.call(this);
	this.chromeless = (chromeless != null) ? chromeless : this.chromeless;
	this.init();
	this.initStencilRegistry();
	this.graph = this.createGraph();
	this.undoManager = this.createUndoManager();
	this.status = '';

	this.getOrCreateFilename = function()
	{
		return this.filename || mxResources.get('drawing', [counter]) + '.xml';
	};
	
	this.getFilename = function()
	{
		return this.filename;
	};
	
	// Sets the status and fires a statusChanged event
	this.setStatus = function(value)
	{
		this.status = value;
		this.fireEvent(new mxEventObject('statusChanged'));
	};
	
	// Returns the current status
	this.getStatus = function()
	{
		return this.status;
	};

	// Updates modified state if graph changes
	this.graphChangeListener = function() 
	{
		this.setModified(true);
	};
	
	this.graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		this.graphChangeListener.apply(this, arguments);
	}));

	// Sets persistent graph state defaults
	this.graph.resetViewOnRootChange = false;
};

// Editor inherits from mxEventSource
mxUtils.extend(Editor, mxEventSource);

/**
 * Specifies the image URL to be used for the grid.
 */
Editor.prototype.gridImage = (mxClient.IS_SVG) ? 'data:image/gif;base64,R0lGODlhCgAKAJEAAAAAAP///8zMzP///yH5BAEAAAMALAAAAAAKAAoAAAIJ1I6py+0Po2wFADs=' :
	IMAGE_PATH + '/grid.gif';

/**
 * Scrollbars are enabled on non-touch devices (not including Firefox because touch events
 * cannot be detected in Firefox, see above).
 */
Editor.prototype.defaultScrollbars = !mxClient.IS_IOS;

/**
 * Specifies if the page should be visible for new files. Default is true.
 */
Editor.prototype.defaultPageVisible = true;

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.prototype.transparentImage = (mxClient.IS_SVG) ? 'data:image/gif;base64,R0lGODlhMAAwAIAAAP///wAAACH5BAEAAAAALAAAAAAwADAAAAIxhI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+DwwKh8Si8egpAAA7' :
	IMAGE_PATH + '/transparent.gif';

/**
 * Specifies if the canvas should be extended in all directions. Default is true.
 */
Editor.prototype.extendCanvas = true;

/**
 * Specifies if the app should run in chromeless mode. Default is false.
 * This default is only used if the contructor argument is null.
 */
Editor.prototype.chromeless = false;

/**
 * Specifies the order of OK/Cancel buttons in dialogs. Default is true.
 * Cancel first is used on Macs, Windows/Confluence uses cancel last.
 */
Editor.prototype.cancelFirst = true;

/**
 * Specifies if the editor is enabled. Default is true.
 */
Editor.prototype.enabled = true;

/**
 * Contains the name which was used for the last save. Default value is null.
 */
Editor.prototype.filename = null;

/**
 * Contains the current modified state of the diagram. This is false for
 * new diagrams and after the diagram was saved.
 */
Editor.prototype.modified = false;

/**
 * Specifies if the diagram should be saved automatically if possible. Default
 * is true.
 */
Editor.prototype.autosave = true;

/**
 * Specifies the top spacing for the initial page view. Default is 0.
 */
Editor.prototype.initialTopSpacing = 0;

/**
 * 
 */
Editor.prototype.defaultGraphBackground = '#ffffff';

/**
 * Specifies the app name. Default is document.title.
 */
Editor.prototype.appName = document.title;

/**
 * Initializes the environment.
 */
Editor.prototype.init = function() { };

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setAutosave = function(value)
{
	this.autosave = value;
	this.fireEvent(new mxEventObject('autosaveChanged'));
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.createGraph = function()
{
	return new Graph();
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.resetGraph = function()
{
	this.graph.gridEnabled = true;
	this.graph.graphHandler.guidesEnabled = true;
	this.graph.setTooltips(true);
	this.graph.setConnectable(true);
	this.graph.foldingEnabled = true;
	this.graph.scrollbars = this.defaultScrollbars;
	this.graph.pageVisible = this.defaultPageVisible;
	this.graph.pageBreaksVisible = this.graph.pageVisible; 
	this.graph.preferPageSize = this.graph.pageBreaksVisible;
	this.graph.background = this.defaultGraphBackground;
	this.graph.pageScale = mxGraph.prototype.pageScale;
	this.graph.pageFormat = mxGraph.prototype.pageFormat;
	this.updateGraphComponents();
	this.graph.view.setScale(1);
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.readGraphState = function(node)
{
	this.graph.gridEnabled = node.getAttribute('grid') != '0';
	this.graph.gridSize = parseFloat(node.getAttribute('gridSize')) || mxGraph.prototype.gridSize;
	this.graph.graphHandler.guidesEnabled = node.getAttribute('guides') != '0';
	this.graph.setTooltips(node.getAttribute('tooltips') != '0');
	this.graph.setConnectable(node.getAttribute('connect') != '0');
	this.graph.connectionArrowsEnabled = node.getAttribute('arrows') != '0';
	this.graph.foldingEnabled = node.getAttribute('fold') != '0';

	if (this.chromeless && this.graph.foldingEnabled)
	{
		this.graph.foldingEnabled = urlParams['nav'] == '1';
	}
	
	var ps = node.getAttribute('pageScale');
	
	if (ps != null)
	{
		this.graph.pageScale = ps;
	}
	else
	{
		this.graph.pageScale = mxGraph.prototype.pageScale;
	}
	
	var pv = node.getAttribute('page');
	
	if (pv != null)
	{
		this.graph.pageVisible = (pv == '1');
	}
	else
	{
		this.graph.pageVisible = this.defaultPageVisible;
	}
	
	this.graph.pageBreaksVisible = this.graph.pageVisible; 
	this.graph.preferPageSize = this.graph.pageBreaksVisible;
	
	var pw = node.getAttribute('pageWidth');
	var ph = node.getAttribute('pageHeight');
	
	if (pw != null && ph != null)
	{
		this.graph.pageFormat = new mxRectangle(0, 0, parseFloat(pw), parseFloat(ph));
	}

	// Loads the persistent state settings
	var bg = node.getAttribute('background');
	
	if (bg != null && bg.length > 0)
	{
		this.graph.background = bg;
	}
	else
	{
		this.graph.background = this.defaultGraphBackground;
	}
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setGraphXml = function(node)
{
	if (node != null)
	{
		var dec = new mxCodec(node.ownerDocument);
	
		if (node.nodeName == 'mxGraphModel')
		{
			this.graph.model.beginUpdate();
			
			try
			{
				this.graph.model.clear();
				this.graph.view.scale = 1;
				this.readGraphState(node);
				this.updateGraphComponents();
				dec.decode(node, this.graph.getModel());
			}
			finally
			{
				this.graph.model.endUpdate();
			}
	
			this.fireEvent(new mxEventObject('resetGraphView'));
		}
		else if (node.nodeName == 'root')
		{
			this.resetGraph();
			
			// Workaround for invalid XML output in Firefox 20 due to bug in mxUtils.getXml
			var wrapper = dec.document.createElement('mxGraphModel');
			wrapper.appendChild(node);
			
			dec.decode(wrapper, this.graph.getModel());
			this.updateGraphComponents();
			this.fireEvent(new mxEventObject('resetGraphView'));
		}
		else
		{
			throw { 
			    message: mxResources.get('cannotOpenFile'), 
			    node: node,
			    toString: function() { return this.message; }
			};
		}
	}
	else
	{
		this.resetGraph();
		this.graph.model.clear();
		this.fireEvent(new mxEventObject('resetGraphView'));
	}
};

/**
 * Returns the XML node that represents the current diagram.
 */
Editor.prototype.getGraphXml = function(ignoreSelection)
{
	ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
	var node = null;
	
	if (ignoreSelection)
	{
		var enc = new mxCodec(mxUtils.createXmlDocument());
		node = enc.encode(this.graph.getModel());
	}
	else
	{
		node = this.graph.encodeCells(this.graph.getSelectionCells());
	}

	if (this.graph.view.translate.x != 0 || this.graph.view.translate.y != 0)
	{
		node.setAttribute('dx', Math.round(this.graph.view.translate.x * 100) / 100);
		node.setAttribute('dy', Math.round(this.graph.view.translate.y * 100) / 100);
	}
	
	node.setAttribute('grid', (this.graph.isGridEnabled()) ? '1' : '0');
	node.setAttribute('gridSize', this.graph.gridSize);
	node.setAttribute('guides', (this.graph.graphHandler.guidesEnabled) ? '1' : '0');
	node.setAttribute('tooltips', (this.graph.tooltipHandler.isEnabled()) ? '1' : '0');
	node.setAttribute('connect', (this.graph.connectionHandler.isEnabled()) ? '1' : '0');
	node.setAttribute('arrows', (this.graph.connectionArrowsEnabled) ? '1' : '0');
	node.setAttribute('fold', (this.graph.foldingEnabled) ? '1' : '0');
	node.setAttribute('page', (this.graph.pageVisible) ? '1' : '0');
	node.setAttribute('pageScale', this.graph.pageScale);
	node.setAttribute('pageWidth', this.graph.pageFormat.width);
	node.setAttribute('pageHeight', this.graph.pageFormat.height);

	if (this.graph.background != null)
	{
		node.setAttribute('background', this.graph.background);
	}
	
	return node;
};

/**
 * Keeps the graph container in sync with the persistent graph state
 */
Editor.prototype.updateGraphComponents = function()
{
	var graph = this.graph;
	
	if (graph.container != null)
	{
		var bg = (graph.background == null || graph.background == 'none') ? '#ffffff' : graph.background;
		
		if (graph.view.backgroundPageShape != null)
		{
			graph.view.backgroundPageShape.fill = bg;
			graph.view.backgroundPageShape.redraw();
		}

		// Transparent.gif is a workaround for focus repaint problems in IE and clipping issues in webkit
		var noBackground = 'url(' + this.transparentImage + ')';
		var bgImg = (!graph.pageVisible && graph.isGridEnabled()) ? 'url(' + this.gridImage + ')' : noBackground;
		
		// Needed to align background position for grid
		if (graph.isGridEnabled())
		{
			graph.view.validateBackground();
		}

		if (graph.view.canvas.ownerSVGElement != null)
		{
			// FIXME: Initial background clipping bug if page view disabled in webkit
			graph.view.canvas.ownerSVGElement.style.backgroundImage = bgImg;
		}
		else
		{
			graph.view.canvas.style.backgroundImage = bgImg;
		}
		
		graph.container.style.backgroundImage = noBackground;
				
		if (graph.view.backgroundPageShape != null)
		{
			graph.view.backgroundPageShape.node.style.backgroundImage = (this.graph.isGridEnabled()) ? 'url(' + this.gridImage + ')' : 'none';
		}
		
		graph.container.style.backgroundColor = bg;

		if (graph.pageVisible)
		{
			graph.container.style.backgroundColor = '#ebebeb';
			graph.container.style.borderStyle = 'solid';
			graph.container.style.borderColor = '#e5e5e5';
			graph.container.style.borderTopWidth = '1px';
			graph.container.style.borderLeftWidth = '1px';
			graph.container.style.borderRightWidth = '0px';
			graph.container.style.borderBottomWidth = '0px';
		}
		else
		{
			graph.container.style.border = '';
		}

		graph.container.style.overflow = (graph.scrollbars) ? 'auto' : 'hidden';
		
		this.fireEvent(new mxEventObject('updateGraphComponents'));
	}
};

/**
 * Sets the modified flag.
 */
Editor.prototype.setModified = function(value)
{
	this.modified = value;
};

/**
 * Sets the filename.
 */
Editor.prototype.setFilename = function(value)
{
	this.filename = value;
};

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.createUndoManager = function()
{
	var graph = this.graph;
	var undoMgr = new mxUndoManager();

	this.undoListener = function(sender, evt)
	{
		undoMgr.undoableEditHappened(evt.getProperty('edit'));
	};
	
    // Installs the command history
	var listener = mxUtils.bind(this, function(sender, evt)
	{
		this.undoListener.apply(this, arguments);
	});
	
	graph.getModel().addListener(mxEvent.UNDO, listener);
	graph.getView().addListener(mxEvent.UNDO, listener);

	// Keeps the selection in sync with the history
	var undoHandler = function(sender, evt)
	{
		var cand = graph.getSelectionCellsForChanges(evt.getProperty('edit').changes);
		var model = graph.getModel();
		var cells = [];
		
		for (var i = 0; i < cand.length; i++)
		{
			if ((model.isVertex(cand[i]) || model.isEdge(cand[i])) && graph.view.getState(cand[i]) != null)
			{
				cells.push(cand[i]);
			}
		}
		
		graph.setSelectionCells(cells);
	};
	
	undoMgr.addListener(mxEvent.UNDO, undoHandler);
	undoMgr.addListener(mxEvent.REDO, undoHandler);

	return undoMgr;
};

/**
 * Adds basic stencil set (no namespace).
 */
Editor.prototype.initStencilRegistry = function() { };

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.destroy = function()
{
	if (this.graph != null)
	{
		this.graph.destroy();
		this.graph = null;
	}
};

/**
 * Class for asynchronously opening a new window and loading a file at the same
 * time. This acts as a bridge between the open dialog and the new editor.
 */
OpenFile = function(done)
{
	this.producer = null;
	this.consumer = null;
	this.done = done;
};

/**
 * Registers the editor from the new window.
 */
OpenFile.prototype.setConsumer = function(value)
{
	this.consumer = value;
	this.execute();
};

/**
 * Sets the data from the loaded file.
 */
OpenFile.prototype.setData = function(value, filename)
{
	this.data = value;
	this.filename = filename;
	this.execute();
};

/**
 * Displays an error message.
 */
OpenFile.prototype.error = function(msg)
{
	this.cancel(true);
	mxUtils.alert(msg);
};

/**
 * Consumes the data.
 */
OpenFile.prototype.execute = function()
{
	if (this.consumer != null && this.data != null)
	{
		this.cancel(false);
		this.consumer(this.data, this.filename);
	}
};

/**
 * Cancels the operation.
 */
OpenFile.prototype.cancel = function(cancel)
{
	if (this.done != null)
	{
		this.done((cancel != null) ? cancel : true);
	}
};

/**
 * Static overrides
 */
(function()
{
	// Uses HTML for background pages (to support grid background image)
	mxGraphView.prototype.validateBackground = function()
	{
		var bg = this.graph.getBackgroundImage();
		
		if (bg != null)
		{
			if (this.backgroundImage == null || this.backgroundImage.image != bg.src)
			{
				if (this.backgroundImage != null)
				{
					this.backgroundImage.destroy();
				}
				
				var bounds = new mxRectangle(0, 0, 1, 1);
				
				this.backgroundImage = new mxImageShape(bounds, bg.src);
				this.backgroundImage.dialect = this.graph.dialect;
				this.backgroundImage.init(this.backgroundPane);
				this.backgroundImage.redraw();
			}
			
			this.redrawBackgroundImage(this.backgroundImage, bg);
		}
		else if (this.backgroundImage != null)
		{
			this.backgroundImage.destroy();
			this.backgroundImage = null;
		}
		
		if (this.graph.pageVisible && this.graph.container != null)
		{
			var bounds = this.getBackgroundPageBounds();

			if (this.backgroundPageShape == null)
			{
				// Finds first child of type element
				var firstChild = this.graph.container.firstChild;
				
				while (firstChild != null && firstChild.nodeType != mxConstants.NODETYPE_ELEMENT)
				{
					firstChild = firstChild.nextSibling;
				}
				
				if (firstChild != null)
				{
					this.backgroundPageShape = this.createBackgroundPageShape(bounds);
					this.backgroundPageShape.scale = 1;
					
					// Shadow filter causes problems in outline window in quirks mode. IE8 standards
					// also has known rendering issues inside mxWindow but not using shadow is worse.
					this.backgroundPageShape.isShadow = !mxClient.IS_QUIRKS;
					this.backgroundPageShape.dialect = mxConstants.DIALECT_STRICTHTML;
					this.backgroundPageShape.init(this.graph.container);

					// Required for the browser to render the background page in correct order
					firstChild.style.position = 'absolute';
					this.graph.container.insertBefore(this.backgroundPageShape.node, firstChild);
					this.backgroundPageShape.redraw();
					
					this.backgroundPageShape.node.className = 'geBackgroundPage';
					
					// Adds listener for double click handling on background
					mxEvent.addListener(this.backgroundPageShape.node, 'dblclick',
						mxUtils.bind(this, function(evt)
						{
							this.graph.dblClick(evt);
						})
					);
					
					// Adds basic listeners for graph event dispatching outside of the
					// container and finishing the handling of a single gesture
					mxEvent.addGestureListeners(this.backgroundPageShape.node,
						mxUtils.bind(this, function(evt)
						{
							this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
						}),
						mxUtils.bind(this, function(evt)
						{
							// Hides the tooltip if mouse is outside container
							if (this.graph.tooltipHandler != null && this.graph.tooltipHandler.isHideOnHover())
							{
								this.graph.tooltipHandler.hide();
							}
							
							if (this.graph.isMouseDown && !mxEvent.isConsumed(evt))
							{
								this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
							}
						}),
						mxUtils.bind(this, function(evt)
						{
							this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
						})
					);
				}
			}
			else
			{
				this.backgroundPageShape.scale = 1;
				this.backgroundPageShape.bounds = bounds;
				this.backgroundPageShape.redraw();
				
				var bds = this.getBackgroundPageBounds();
				var gs = this.graph.gridSize * this.graph.view.scale;
				var tx = -1 + (gs - mxUtils.mod(bds.x / this.graph.view.scale - this.translate.x, gs) * this.graph.view.scale);
				var ty = -1 + (gs - mxUtils.mod(bds.y / this.graph.view.scale - this.translate.y, gs) * this.graph.view.scale);
				this.backgroundPageShape.node.style.backgroundPosition = Math.round(tx) + 'px ' + Math.round(ty) + 'px';
			}
			
			this.backgroundPageShape.node.style.backgroundImage = (this.graph.isGridEnabled()) ?
					'url(' + Editor.prototype.gridImage + ')' : 'none';
		}
		else if (this.backgroundPageShape != null)
		{
			this.backgroundPageShape.destroy();
			this.backgroundPageShape = null;
		}
	};
	
	// Draws page breaks only within the page
	mxGraph.prototype.updatePageBreaks = function(visible, width, height)
	{
		var scale = this.view.scale;
		var tr = this.view.translate;
		var fmt = this.pageFormat;
		var ps = scale * this.pageScale;

		var bounds2 = this.view.getBackgroundPageBounds();

		width = bounds2.width;
		height = bounds2.height;
		var bounds = new mxRectangle(scale * tr.x, scale * tr.y, fmt.width * ps, fmt.height * ps);

		// Does not show page breaks if the scale is too small
		visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

		var horizontalCount = (visible) ? Math.ceil(width / bounds.width) - 1 : 0;
		var verticalCount = (visible) ? Math.ceil(height / bounds.height) - 1 : 0;
		var right = bounds2.x + width;
		var bottom = bounds2.y + height;

		if (this.horizontalPageBreaks == null && horizontalCount > 0)
		{
			this.horizontalPageBreaks = [];
		}

		if (this.horizontalPageBreaks != null)
		{
			for (var i = 0; i <= horizontalCount; i++)
			{
				var pts = [new mxPoint(bounds2.x + (i + 1) * bounds.width, bounds2.y),
				           new mxPoint(bounds2.x + (i + 1) * bounds.width, bottom)];
				
				if (this.horizontalPageBreaks[i] != null)
				{
					this.horizontalPageBreaks[i].points = pts;
					this.horizontalPageBreaks[i].redraw();
				}
				else
				{
					var pageBreak = new mxPolyline(pts, this.pageBreakColor);
					pageBreak.dialect = this.dialect;
					pageBreak.isDashed = this.pageBreakDashed;
					pageBreak.pointerEvents = false;
					pageBreak.init(this.view.backgroundPane);
					pageBreak.redraw();
					
					this.horizontalPageBreaks[i] = pageBreak;
				}
			}
			
			for (var i = horizontalCount; i < this.horizontalPageBreaks.length; i++)
			{
				this.horizontalPageBreaks[i].destroy();
			}
			
			this.horizontalPageBreaks.splice(horizontalCount, this.horizontalPageBreaks.length - horizontalCount);
		}
		
		if (this.verticalPageBreaks == null && verticalCount > 0)
		{
			this.verticalPageBreaks = [];
		}
		
		if (this.verticalPageBreaks != null)
		{
			for (var i = 0; i <= verticalCount; i++)
			{
				var pts = [new mxPoint(bounds2.x, bounds2.y + (i + 1) * bounds.height),
				           new mxPoint(right, bounds2.y + (i + 1) * bounds.height)];
				
				if (this.verticalPageBreaks[i] != null)
				{
					this.verticalPageBreaks[i].points = pts;
					this.verticalPageBreaks[i].redraw();
				}
				else
				{
					var pageBreak = new mxPolyline(pts, this.pageBreakColor);
					pageBreak.dialect = this.dialect;
					pageBreak.isDashed = this.pageBreakDashed;
					pageBreak.pointerEvents = false;
					pageBreak.init(this.view.backgroundPane);
					pageBreak.redraw();
		
					this.verticalPageBreaks[i] = pageBreak;
				}
			}
			
			for (var i = verticalCount; i < this.verticalPageBreaks.length; i++)
			{
				this.verticalPageBreaks[i].destroy();
			}
			
			this.verticalPageBreaks.splice(verticalCount, this.verticalPageBreaks.length - verticalCount);
		}
	};
	
	// Disables removing relative children from parents
	var mxGraphHandlerShouldRemoveCellsFromParent = mxGraphHandler.prototype.shouldRemoveCellsFromParent;
	mxGraphHandler.prototype.shouldRemoveCellsFromParent = function(parent, cells, evt)
	{
		for (var i = 0; i < cells.length; i++)
		{
			if (this.graph.getModel().isVertex(cells[i]))
			{
				var geo = this.graph.getCellGeometry(cells[i]);
				
				if (geo != null && geo.relative)
				{
					return false;
				}
			}
		}
		
		return mxGraphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
	};

	// Overrides to ignore hotspot only for target terminal
	var mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
	mxConnectionHandler.prototype.createMarker = function()
	{
		var marker = mxConnectionHandlerCreateMarker.apply(this, arguments);
		
		marker.intersects = mxUtils.bind(this, function(state, evt)
		{
			if (this.isConnecting())
			{
				return true;
			}
			
			return mxCellMarker.prototype.intersects.apply(marker, arguments);
		});
		
		return marker;
	};

	// Changes border color of background page shape
	mxGraphView.prototype.createBackgroundPageShape = function(bounds)
	{
		var bg = (this.graph.background == null || this.graph.background == 'none') ? '#ffffff' : this.graph.background;
		
		return new mxRectangleShape(bounds, bg, '#cacaca');
	};

	// Fits the number of background pages to the graph
	mxGraphView.prototype.getBackgroundPageBounds = function()
	{
		var gb = this.getGraphBounds();
		
		// Computes unscaled, untranslated graph bounds
		var x = (gb.width > 0) ? gb.x / this.scale - this.translate.x : 0;
		var y = (gb.height > 0) ? gb.y / this.scale - this.translate.y : 0;
		var w = gb.width / this.scale;
		var h = gb.height / this.scale;
		
		var fmt = this.graph.pageFormat;
		var ps = this.graph.pageScale;

		var pw = fmt.width * ps;
		var ph = fmt.height * ps;

		var x0 = Math.floor(Math.min(0, x) / pw);
		var y0 = Math.floor(Math.min(0, y) / ph);
		var xe = Math.ceil(Math.max(1, x + w) / pw);
		var ye = Math.ceil(Math.max(1, y + h) / ph);
		
		var rows = xe - x0;
		var cols = ye - y0;

		var bounds = new mxRectangle(this.scale * (this.translate.x + x0 * pw), this.scale *
				(this.translate.y + y0 * ph), this.scale * rows * pw, this.scale * cols * ph);
		
		return bounds;
	};
	
	// Add panning for background page in VML
	var graphPanGraph = mxGraph.prototype.panGraph;
	mxGraph.prototype.panGraph = function(dx, dy)
	{
		graphPanGraph.apply(this, arguments);
		
		if ((this.dialect != mxConstants.DIALECT_SVG && this.view.backgroundPageShape != null) &&
			(!this.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.container)))
		{
			this.view.backgroundPageShape.node.style.marginLeft = dx + 'px';
			this.view.backgroundPageShape.node.style.marginTop = dy + 'px';
		}
	};

	/**
	 * Consumes click events for disabled menu items.
	 */
	var mxPopupMenuAddItem = mxPopupMenu.prototype.addItem;
	mxPopupMenu.prototype.addItem = function(title, image, funct, parent, iconCls, enabled)
	{
		var result = mxPopupMenuAddItem.apply(this, arguments);
		
		if (enabled != null && !enabled)
		{
			mxEvent.addListener(result, 'mousedown', function(evt)
			{
				mxEvent.consume(evt);
			});
		}
		
		return result;
	};

	// Selects ancestors before descendants
	var graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent;
	mxGraphHandler.prototype.getInitialCellForEvent = function(me)
	{
		var model = this.graph.getModel();
		var psel = model.getParent(this.graph.getSelectionCell());
		var cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
		var parent = model.getParent(cell);
		
		if (psel == null || (psel != cell && psel != parent))
		{
			while (!this.graph.isCellSelected(cell) && !this.graph.isCellSelected(parent) &&
				model.isVertex(parent) && !this.graph.isValidRoot(parent))
			{
				cell = parent;
				parent = this.graph.getModel().getParent(cell);
			}
		}
		
		return cell;
	};
	
	// Selection is delayed to mouseup if ancestor is selected
	var graphHandlerIsDelayedSelection = mxGraphHandler.prototype.isDelayedSelection;
	mxGraphHandler.prototype.isDelayedSelection = function(cell, me)
	{
		var result = graphHandlerIsDelayedSelection.apply(this, arguments);
		
		if (!result)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(cell);
			
			while (parent != null)
			{
				// Inconsistency for unselected parent swimlane is intended for easier moving
				// of stack layouts where the container title section is too far away
				if (this.graph.isCellSelected(parent) && model.isVertex(parent))
				{
					result = true;
					break;
				}
				
				parent = model.getParent(parent);
			}
		}
		
		return result;
	};
	
	// Delayed selection of parent group
	mxGraphHandler.prototype.selectDelayed = function(me)
	{
		if (!this.graph.popupMenuHandler.isPopupTrigger(me))
		{
			var cell = me.getCell();
			
			if (cell == null)
			{
				cell = this.cell;
			}

			// Selects folded cell for hit on folding icon
			var state = this.graph.view.getState(cell)
			
			if (state != null && me.isSource(state.control))
			{
				this.graph.selectCellForEvent(cell, me.getEvent());
			}
			else
			{
				var model = this.graph.getModel();
				var parent = model.getParent(cell);
				
				while (!this.graph.isCellSelected(parent) && model.isVertex(parent))
				{
					cell = parent;
					parent = model.getParent(cell);
				}
				
				this.graph.selectCellForEvent(cell, me.getEvent());
			}
		}
	};

	// Returns last selected ancestor
	mxPopupMenuHandler.prototype.getCellForPopupEvent = function(me)
	{
		var cell = me.getCell();
		var model = this.graph.getModel();
		var parent = model.getParent(cell);
		
		while (model.isVertex(parent) && !this.graph.isValidRoot(parent))
		{
			if (this.graph.isCellSelected(parent))
			{
				cell = parent;
			}
			
			parent = model.getParent(parent);
		}
		
		return cell;
	};
})();

(function()
{
	/**
	 * Adds custom stencils defined via shape=stencil(value) style. The value is a base64 encoded, compressed and
	 * URL encoded XML definition of the shape according to the stencil definition language of mxGraph.
	 */
	var mxCellRendererCreateShape = mxCellRenderer.prototype.createShape;
	mxCellRenderer.prototype.createShape = function(state)
	{
		if (state.style != null && typeof(Zlib) !== 'undefined')
		{
	    	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);

	    	// Extracts and decodes stencil XML if shape has the form shape=stencil(value)
	    	if (shape != null && shape.substring(0, 8) == 'stencil(')
	    	{
	    		try
	    		{
	    			var stencil = shape.substring(8, shape.length - 1);
	    			var doc = mxUtils.parseXml(decodeURIComponent(RawDeflate.inflate((window.atob) ? atob(stencil) : Base64.decode(stencil, true))));
	    			
	    			return new mxShape(new mxStencil(doc.documentElement));
	    		}
	    		catch (e)
	    		{
	    			if (window.console != null)
	    			{
	    				console.log('Error in shape: ' + e);
	    			}
	    		}
	    	}
		}
		
		return mxCellRendererCreateShape.apply(this, arguments);
	};

	/**
	 * Overrides stencil registry for dynamic loading of stencils.
	 */
	/**
	 * Maps from library names to an array of Javascript filenames,
	 * which are synchronously loaded. Currently only stencil files
	 * (.xml) and JS files (.js) are supported.
	 * IMPORTANT: For embedded diagrams to work entries must also
	 * be added in EmbedServlet.java.
	 */
	mxStencilRegistry.libraries = {};

	/**
	 * Stores all package names that have been dynamically loaded.
	 * Each package is only loaded once.
	 */
	mxStencilRegistry.packages = [];
	
	// Extends the default stencil registry to add dynamic loading
	mxStencilRegistry.getStencil = function(name)
	{
		var result = mxStencilRegistry.stencils[name];
		
		if (result == null && mxCellRenderer.prototype.defaultShapes[name] == null)
		{
			var basename = mxStencilRegistry.getBasenameForStencil(name);
			
			// Loads stencil files and tries again
			if (basename != null)
			{
				var libs = mxStencilRegistry.libraries[basename];

				if (libs != null)
				{
					if (mxStencilRegistry.packages[basename] == null)
					{
						mxStencilRegistry.packages[basename] = 1;
						
						for (var i = 0; i < libs.length; i++)
						{
							var fname = libs[i];
							
							if (fname.toLowerCase().substring(fname.length - 4, fname.length) == '.xml')
							{
								mxStencilRegistry.loadStencilSet(fname, null);
							}
							else if (fname.toLowerCase().substring(fname.length - 3, fname.length) == '.js')
							{
								try
								{
									var req = mxUtils.load(fname);
									
									if (req != null)
									{
										eval.call(window, req.getText());
									}
								}
								catch (e)
								{
									if (window.console != null)
									{
										console.log('error in getStencil:', fname, e);
									}
								}
							}
							else
							{
								// FIXME: This does not yet work as the loading is triggered after
								// the shape was used in the graph, at which point the keys have
								// typically been translated in the calling method.
								//mxResources.add(fname);
							}
						}
					}
				}
				else
				{
					// Replaces '_-_' with '_'
					basename = basename.replace('_-_', '_');
					mxStencilRegistry.loadStencilSet(STENCIL_PATH + '/' + basename + '.xml', null);
				}
				
				result = mxStencilRegistry.stencils[name];
			}
		}
		
		return result;
	};
	
	// Returns the basename for the given stencil or null if no file must be
	// loaded to render the given stencil.
	mxStencilRegistry.getBasenameForStencil = function(name)
	{
		var tmp = null;
		
		if (name != null)
		{
			var parts = name.split('.');
			
			if (parts.length > 0 && parts[0] == 'mxgraph')
			{
				tmp = parts[1];
				
				for (var i = 2; i < parts.length - 1; i++)
				{
					tmp += '/' + parts[i];
				}
			}
		}

		return tmp;
	};

	// Loads the given stencil set
	mxStencilRegistry.loadStencilSet = function(stencilFile, postStencilLoad, force)
	{
		force = (force != null) ? force : false;
		
		// Uses additional cache for detecting previous load attempts
		var xmlDoc = mxStencilRegistry.packages[stencilFile];
		
		if (force || xmlDoc == null)
		{
			var install = false;
			
			if (xmlDoc == null)
			{
				try
				{
					var req = mxUtils.load(stencilFile);
					xmlDoc = req.getXml();
					mxStencilRegistry.packages[stencilFile] = xmlDoc;
					install = true;
				}
				catch (e)
				{
					if (window.console != null)
					{
						console.log('error in loadStencilSet:', stencilFile);
					}
				}
			}
		
			if (xmlDoc != null && xmlDoc.documentElement != null)
			{
				mxStencilRegistry.parseStencilSet(xmlDoc.documentElement, postStencilLoad, install);
			}
		}
	};
	
	// Parses the given stencil set
	mxStencilRegistry.parseStencilSet = function(root, postStencilLoad, install)
	{
		install = (install != null) ? install : true;
		var shape = root.firstChild;
		var packageName = '';
		var name = root.getAttribute('name');
		
		if (name != null)
		{
			packageName = name + '.';
		}
		
		while (shape != null)
		{
			if (shape.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				name = shape.getAttribute('name');
				
				if (name != null)
				{
					packageName = packageName.toLowerCase();
					var stencilName = name.replace(/ /g,"_");
						
					if (install)
					{
						mxStencilRegistry.addStencil(packageName + stencilName.toLowerCase(), new mxStencil(shape));
					}
	
					if (postStencilLoad != null)
					{
						var w = shape.getAttribute('w');
						var h = shape.getAttribute('h');
						
						w = (w == null) ? 80 : parseInt(w, 10);
						h = (h == null) ? 80 : parseInt(h, 10);

						postStencilLoad(packageName, stencilName, name, w, h);
					}
				}
			}
			
			shape = shape.nextSibling;
		}
	};
})();
