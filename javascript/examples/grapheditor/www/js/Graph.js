/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph instance. Note that the constructor does not take a
 * container because the graph instance is needed for creating the UI, which
 * in turn will create the container for the graph. Hence, the container is
 * assigned later in EditorUi.
 */
Graph = function(container, model, renderHint, stylesheet)
{
	mxGraph.call(this, container, model, renderHint, stylesheet);
	
	this.setConnectable(true);
	this.setDropEnabled(true);
	this.setPanning(true);
	this.setTooltips(true);
	this.setAllowLoops(true);
	this.allowAutoPanning = true;
	this.resetEdgesOnConnect = false;
	this.constrainChildren = false;
	
	// Do not scroll after moving cells
	this.graphHandler.scrollOnMove = false;
	this.graphHandler.scaleGrid = true;

	// Enables cloning of connection sources by default
	this.connectionHandler.setCreateTarget(true);
	
	// Disables built-in connection starts except shift is pressed when hovering the cell
	this.connectionHandler.isValidSource = function(cell, me)
	{
		return mxConnectionHandler.prototype.isValidSource.apply(this, arguments) &&
			((urlParams['connect'] != '2' && urlParams['connect'] != null) ||
			(!this.graph.isCellSelected(cell) && mxEvent.isControlDown(me.getEvent())));
	};

	// Sets the style to be used when an elbow edge is double clicked
	this.alternateEdgeStyle = 'vertical';

	if (stylesheet == null)
	{
		this.loadStylesheet();
	}
	
	// Changes color of move preview for black backgrounds
	this.graphHandler.createPreviewShape = function(bounds)
	{
		this.previewColor = (this.graph.background == '#000000') ? 'white' : mxGraphHandler.prototype.previewColor;
		
		return mxGraphHandler.prototype.createPreviewShape.apply(this, arguments);
	};
	
	// Handles parts of cells by checking if part=1 is in the style and returning the parent
	// LATER: Handle recursive parts
	this.graphHandler.getCells = function(initialCell)
	{
	    var cells = mxGraphHandler.prototype.getCells.apply(this, arguments);

	    for (var i = 0; i < cells.length; i++)
	    {
			var state = this.graph.view.getState(cells[i]);
			var style = (state != null) ? state.style : this.graph.getCellStyle(cells[i]);
	    	
			if (mxUtils.getValue(style, 'part', '0') == '1')
			{
		        var parent = this.graph.model.getParent(cells[i]);
	
		        if (this.graph.model.isVertex(parent))
		        {
		            cells[i] = parent;
		        }
			}
	    }

	    return cells;
	};
	
	// Handles parts of cells when cloning the source for new connections
	this.connectionHandler.createTargetVertex = function(evt, source)
	{
		var state = this.graph.view.getState(source);
		var style = (state != null) ? state.style : this.graph.getCellStyle(source);
    	
		if (mxUtils.getValue(style, 'part', false))
		{
	        var parent = this.graph.model.getParent(source);

	        if (this.graph.model.isVertex(parent))
	        {
	        	source = parent;
	        }
		}
		
		return mxConnectionHandler.prototype.createTargetVertex.apply(this, arguments);
	};

	// Creates rubberband selection
    var rubberband = new mxRubberband(this);
    
    this.getRubberband = function()
    {
    	return rubberband;
    };
    
    // Workaround for Firefox where first mouse down is received
    // after tap and hold if scrollbars are visible, which means
    // start rubberband immediately if no cell is under mouse.
    var isForceRubberBandEvent = rubberband.isForceRubberbandEvent;
    rubberband.isForceRubberbandEvent = function(me)
    {
    	return isForceRubberBandEvent.apply(this, arguments) ||
    		(mxUtils.hasScrollbars(this.graph.container) && mxClient.IS_FF &&
    		mxClient.IS_WIN && me.getState() == null && mxEvent.isTouchEvent(me.getEvent()));
    };
    
    // Shows hand cursor while panning
	this.panningHandler.addListener(mxEvent.PAN_START, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'move';
	}));
		
	this.panningHandler.addListener(mxEvent.PAN_END, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'default';
	}));
    
    // Forces panning for middle and right mouse buttons
	var panningHandlerIsForcePanningEvent = this.panningHandler.isForcePanningEvent;
	this.panningHandler.isForcePanningEvent = function(me)
	{
		return panningHandlerIsForcePanningEvent.apply(this, arguments) ||
			(mxEvent.isMouseEvent(me.getEvent()) && (mxEvent.isRightMouseButton(me.getEvent()) ||
			mxEvent.isMiddleMouseButton(me.getEvent())));
	};

	this.popupMenuHandler.autoExpand = true;
	
	this.popupMenuHandler.isSelectOnPopup = function(me)
	{
		return mxEvent.isMouseEvent(me.getEvent());
	};

    // Adds support for HTML labels via style. Note: Currently, only the Java
    // backend supports HTML labels but CSS support is limited to the following:
    // http://docs.oracle.com/javase/6/docs/api/index.html?javax/swing/text/html/CSS.html
	this.isHtmlLabel = function(cell)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		return style['html'] == '1' || style['whiteSpace'] == 'wrap';
	};
	
	// HTML entities are displayed as plain text in wrapped plain text labels
	this.cellRenderer.getLabelValue = function(state)
	{
		var result = mxCellRenderer.prototype.getLabelValue.apply(this, arguments);
		
		if (state.view.graph.isHtmlLabel(state.cell))
		{
			if (state.style['html'] != 1)
			{
				result = mxUtils.htmlEntities(result, false);
			}
			else
			{
				result = state.view.graph.sanitizeHtml(result);
			}
		}
		
		return result;
	};
	
	// Enables links if graph is "disabled" (ie. read-only)
	var click = this.click;
	this.click = function(me)
	{
		if (!this.isEnabled())
		{
			var cell = me.getCell();
			
			if (cell != null)
			{
				var link = this.getLinkForCell(cell);
				
				if (link != null)
				{
					window.open(link);
				}
			}
		}
		else
		{
			return click.apply(this, arguments);
		}
	};
	
	var getCursorForCell = this.getCursorForCell;
	this.getCursorForCell = function(cell)
	{
		if (!this.isEnabled())
		{
			var link = this.getLinkForCell(cell);
			
			if (link != null)
			{
				return 'pointer';
			}
		}
		else
		{
			return getCursorForCell.apply(this, arguments);
		}
	};
	
	// Allows all events through
	this.isEventSourceIgnored2 = function(evtName, me)
	{
		return false;
	};
	
	// Unlocks all cells
	this.isCellLocked = function(cell)
	{
		return false;
	};
	
	// Tap and hold on background starts rubberband for multiple selected
	// cells the cell associated with the event is deselected
	this.addListener(mxEvent.TAP_AND_HOLD, mxUtils.bind(this, function(sender, evt)
	{
		if (!mxEvent.isMultiTouchEvent(evt))
		{
			var me = evt.getProperty('event');
			var cell = evt.getProperty('cell');
			
			if (cell == null)
			{
				var pt = mxUtils.convertPoint(this.container,
						mxEvent.getClientX(me), mxEvent.getClientY(me));
				rubberband.start(pt.x, pt.y);
			}
			else if (this.getSelectionCount() > 1 && this.isCellSelected(cell))
			{
				this.removeSelectionCell(cell);
			}
			
			// Blocks further processing of the event
			evt.consume();
		}
	}));

	// On connect the target is selected and we clone the cell of the preview edge for insert
	this.connectionHandler.selectCells = function(edge, target)
	{
		this.graph.setSelectionCell(target || edge);
	};
	
	// Shows connection points only if cell not selected
	this.connectionHandler.constraintHandler.isStateIgnored = function(state, source)
	{
		return source && state.view.graph.isCellSelected(state.cell);
	};
	
	// Updates constraint handler if the selection changes
	this.selectionModel.addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		var ch = this.connectionHandler.constraintHandler;
		
		if (ch.currentFocus != null && ch.isStateIgnored(ch.currentFocus, true))
		{
			ch.currentFocus = null;
			ch.constraints = null;
			ch.destroyIcons();
		}
		
		ch.destroyFocusHighlight();
	}));

	if (touchStyle)
	{
		this.initTouch();
	}
};

// Graph inherits from mxGraph
mxUtils.extend(Graph, mxGraph);

/**
 * Allows to all values in fit.
 */
Graph.prototype.minFitScale = null;

/**
 * Allows to all values in fit.
 */
Graph.prototype.maxFitScale = null;

/**
 * Sets the default target for all links in cells.
 */
Graph.prototype.linkTarget = '_blank';

/**
 * Sanitizes the given HTML markup.
 */
Graph.prototype.sanitizeHtml = function(value)
{
	// Uses https://code.google.com/p/google-caja/wiki/JsHtmlSanitizer
	// TODO: Add MathML to whitelisted tags
	function urlX(url) { if(/^https?:\/\//.test(url)) { return url }}
    function idX(id) { return id }
	
	return html_sanitize(value, urlX, idX);
};

/**
 * Hook for subclassers.
 */
Graph.prototype.getPagePadding = function()
{
	return new mxPoint(0, 0);
};

/**
 * Loads the stylesheet for this graph.
 */
Graph.prototype.loadStylesheet = function()
{
    var node = mxUtils.load(STYLE_PATH + '/default.xml').getDocumentElement();
	var dec = new mxCodec(node.ownerDocument);
	dec.decode(node, this.getStylesheet());
};

/**
 * Overrides method to provide connection constraints for shapes.
 */
Graph.prototype.getAllConnectionConstraints = function(terminal, source)
{
	if (terminal != null)
	{
		var constraints = mxUtils.getValue(terminal.style, 'points', null);
		
		if (constraints != null)
		{
			// Requires an array of arrays with x, y (0..1) and an optional
			// perimeter (0 or 1), eg. points=[[0,0,1],[0,1,0],[1,1]]
			var result = [];
			
			try
			{
				var c = JSON.parse(constraints);
				
				for (var i = 0; i < c.length; i++)
				{
					var tmp = c[i];
					result.push(new mxConnectionConstraint(new mxPoint(tmp[0], tmp[1]), (tmp.length > 2) ? tmp[2] != '0' : true));
				}
			}
			catch (e)
			{
				// ignore
			}
			
			return result;
		}
		else
		{
			if (terminal.shape != null)
			{
				if (terminal.shape.stencil != null)
				{
					if (terminal.shape.stencil != null)
					{
						return terminal.shape.stencil.constraints;
					}
				}
				else if (terminal.shape.constraints != null)
				{
					return terminal.shape.constraints;
				}
			}
		}
	}

	return null;
};

/**
 * Inverts the elbow edge style without removing existing styles.
 */
Graph.prototype.flipEdge = function(edge)
{
	if (edge != null)
	{
		var state = this.view.getState(edge);
		var style = (state != null) ? state.style : this.getCellStyle(edge);
		
		if (style != null)
		{
			var elbow = mxUtils.getValue(style, mxConstants.STYLE_ELBOW,
				mxConstants.ELBOW_HORIZONTAL);
			var value = (elbow == mxConstants.ELBOW_HORIZONTAL) ?
				mxConstants.ELBOW_VERTICAL : mxConstants.ELBOW_HORIZONTAL;
			this.setCellStyles(mxConstants.STYLE_ELBOW, value, [edge]);
		}
	}
};

/**
 * Disables folding for non-swimlanes.
 */
Graph.prototype.isCellFoldable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.foldingEnabled && this.isContainer(cell) && style['collapsible'] != '0';
};

/**
 * Disables drill-down for non-swimlanes.
 */
Graph.prototype.isValidRoot = function(cell)
{
	return this.isContainer(cell);
};

/**
 * Disables drill-down for non-swimlanes.
 */
Graph.prototype.isValidDropTarget = function(cell)
{
	return this.isContainer(cell) || mxGraph.prototype.isValidDropTarget.apply(this, arguments);
};

/**
 * Disables drill-down for non-swimlanes.
 */
Graph.prototype.isContainer = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	if (this.isSwimlane(cell))
	{
		return style['container'] != '0';
	}
	else
	{
		return style['container'] == '1';
	}
};

/**
 * Overrides createGroupCell to set the group style for new groups to 'group'.
 */
Graph.prototype.createGroupCell = function()
{
	var group = mxGraph.prototype.createGroupCell.apply(this, arguments);
	group.setStyle('group');
	
	return group;
};

/**
 * Overrides tooltips to show custom tooltip or metadata.
 */
Graph.prototype.getTooltipForCell = function(cell)
{
	var tip = '';
	
	if (mxUtils.isNode(cell.value))
	{
		var tmp = cell.value.getAttribute('tooltip');
		
		if (tmp != null)
		{
			tip = this.sanitizeHtml(tmp);
		}
		else
		{
			var ignored = ['label', 'tooltip'];
			var attrs = cell.value.attributes;
			
			// Hides links in edit mode
			if (this.isEnabled())
			{
				ignored.push('link');
			}
			
			for (var i = 0; i < attrs.length; i++)
			{
				if (mxUtils.indexOf(ignored, attrs[i].nodeName) < 0 && attrs[i].nodeValue.length > 0)
				{
					var key = attrs[i].nodeName.substring(0, 1).toUpperCase() + attrs[i].nodeName.substring(1);
					tip += key + ': ' + mxUtils.htmlEntities(attrs[i].nodeValue) + '\n';
				}
			}
			
			if (tip.length > 0)
			{
				tip = tip.substring(0, tip.length - 1);
			}
		}
	}
	
	return tip;
};

/**
 * Returns the label for the given cell.
 */
Graph.prototype.convertValueToString = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		return cell.value.getAttribute('label');
	}
	
	return mxGraph.prototype.convertValueToString.apply(this, arguments);
};

/**
 * Removes all illegal control characters with ASCII code <32 except TAB, LF
 * and CR.
 */
Graph.prototype.zapGremlins = function(text)
{
	var checked = [];
	
	for (var i = 0; i < text.length; i++)
	{
		var code = text.charCodeAt(i);
		
		// Removes all control chars except TAB, LF and CR
		if (code >= 32 || code == 9 || code == 10 || code == 13)
		{
			checked.push(text.charAt(i));
		}
	}
	
	return checked.join('');
};

/**
 * Handles label changes for XML user objects.
 */
Graph.prototype.cellLabelChanged = function(cell, value, autoSize)
{
	// Removes all illegal control characters in user input
	value = this.zapGremlins(value);
	
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		var tmp = cell.value.cloneNode(true);
		tmp.setAttribute('label', value);
		value = tmp;
	}
	
	mxGraph.prototype.cellLabelChanged.apply(this, arguments);
};

/**
 * Sets the link for the given cell.
 */
Graph.prototype.setLinkForCell = function(cell, link)
{
	this.setAttributeForCell(cell, 'link', link);
};

/**
 * Sets the link for the given cell.
 */
Graph.prototype.setTooltipForCell = function(cell, link)
{
	this.setAttributeForCell(cell, 'tooltip', link);
};

/**
 * Sets the link for the given cell.
 */
Graph.prototype.setAttributeForCell = function(cell, attributeName, attributeValue)
{
	var value = null;
	
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		value = cell.value.cloneNode(true);
	}
	else
	{
		var doc = mxUtils.createXmlDocument();
		
		value = doc.createElement('UserObject');
		value.setAttribute('label', cell.value || '');
	}
	
	if (attributeValue != null && attributeValue.length > 0)
	{
		value.setAttribute(attributeName, attributeValue);
	}
	else
	{
		value.removeAttribute(attributeName);
	}
	
	this.model.setValue(cell, value);
};

/**
 * Returns the link for the given cell.
 */
Graph.prototype.getLinkForCell = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		return cell.value.getAttribute('link');
	}
	
	return null;
};

/**
 * Overrides double click handling to add the tolerance.
 */
Graph.prototype.dblClick = function(evt, cell)
{
	var pt = mxUtils.convertPoint(this.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
	
	if (cell == null)
	{
		cell = this.getCellAt(pt.x, pt.y);
	}

	// Automatically adds new child cells to edges on double click
	if (evt != null && this.model.isEdge(cell))
	{
		var state = this.view.getState(cell);
		
		if (state != null && (state.text == null || state.text.node == null || (!mxUtils.contains(state.text.boundingBox, pt.x, pt.y) &&
			!mxUtils.isAncestorNode(state.text.node, mxEvent.getSource(evt)))))
		{
			cell = this.addEdgeLabelAt(state, pt.x, pt.y);
		}
	}

	mxGraph.prototype.dblClick.call(this, evt, cell);
};

/**
 * Overridden to stop moving edge labels between cells.
 */
Graph.prototype.getDropTarget = function(cells, evt, cell, clone)
{
	var model = this.getModel();
	
	// Disables drop into group if alt is pressed
	if (mxEvent.isAltDown(evt))
	{
		return null;
	}
	
	// Disables dragging edge labels out of edges
	for (var i = 0; i < cells.length; i++)
	{
		if (this.model.isEdge(this.model.getParent(cells[i])))
		{
			return null;
		}
	}
	
	return mxGraph.prototype.getDropTarget.apply(this, arguments);
};

/**
 * Adds a new edge label at the given position and returns the new cell.
 */
Graph.prototype.addEdgeLabelAt = function(state, x, y)
{
	// Creates a new edge label with a predefined text
	var label = new mxCell();
	label.value = 'Text';
	label.style = 'text;html=1;resizable=0;align=center;verticalAlign=middle;labelBackgroundColor=#ffffff;'
	label.geometry = new mxGeometry(0, 0, 0, 0);
	label.geometry.relative = true;
	label.connectable = false;
	label.vertex = true;
	
	// Resets the relative location stored inside the geometry
	var pt2 = this.view.getRelativePoint(state, x, y);
	label.geometry.x = Math.round(pt2.x * 10000) / 10000;
	label.geometry.y = Math.round(pt2.y);
	
	// Resets the offset inside the geometry to find the offset from the resulting point
	label.geometry.offset = new mxPoint(0, 0);
	pt2 = this.view.getPoint(state, label.geometry);

	var scale = this.view.scale;
	label.geometry.offset = new mxPoint(Math.round((x - pt2.x) / scale), Math.round((y - pt2.y) / scale));
	
	this.getModel().beginUpdate();
	try
	{
		this.addCells([label], state.cell);
		this.fireEvent(new mxEventObject('cellsInserted', 'cells', [label]));
	}
	finally
	{
		this.getModel().endUpdate();
	}
	
	return label;
};

/**
 * Function: alignCells
 * 
 * Aligns the given cells vertically or horizontally according to the given
 * alignment using the optional parameter as the coordinate.
 * 
 * Parameters:
 * 
 * horizontal - Boolean that specifies the direction of the distribution.
 * cells - Optional array of <mxCells> to be distributed. Edges are ignored.
 */
Graph.prototype.distributeCells = function(horizontal, cells)
{
	if (cells == null)
	{
		cells = this.getSelectionCells();
	}
	
	if (cells != null && cells.length > 1)
	{
		var vertices = [];
		var max = null;
		var min = null;
		
		for (var i = 0; i < cells.length; i++)
		{
			if (this.getModel().isVertex(cells[i]))
			{
				var state = this.view.getState(cells[i]);
				
				if (state != null)
				{
					var tmp = (horizontal) ? state.getCenterX() : state.getCenterY();
					max = (max != null) ? Math.max(max, tmp) : tmp;
					min = (min != null) ? Math.min(min, tmp) : tmp;
					
					vertices.push(state);
				}
			}
		}
		
		if (vertices.length > 2)
		{
			vertices.sort(function(a, b)
			{
				return (horizontal) ? a.x - b.x : a.y - b.y;
			});

			var t = this.view.translate;
			var s = this.view.scale;
			
			min = min / s - ((horizontal) ? t.x : t.y);
			max = max / s - ((horizontal) ? t.x : t.y);
			
			this.getModel().beginUpdate();
			try
			{
				var dt = (max - min) / (vertices.length - 1);
				var t0 = min;
				
				for (var i = 1; i < vertices.length - 1; i++)
				{
					var geo = this.getCellGeometry(vertices[i].cell);
					t0 += dt;
					
					if (geo != null)
					{
						geo = geo.clone();
						
						if (horizontal)
						{
							geo.x = Math.round(t0 - geo.width / 2);
						}
						else
						{
							geo.y = Math.round(t0 - geo.height / 2);
						}
						
						this.getModel().setGeometry(vertices[i].cell, geo);
					}
				}
			}
			finally
			{
				this.getModel().endUpdate();
			}
		}
	}
	
	return cells;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
Graph.prototype.getSvg = function(background, scale, border, nocrop, crisp)
{
	scale = (scale != null) ? scale : 1;
	border = (border != null) ? border : 1;
	crisp = (crisp != null) ? crisp : true;

	var imgExport = new mxImageExport();
	var bounds = (nocrop) ? this.view.getBackgroundPageBounds() : this.getGraphBounds();
	var vs = this.view.scale;

	// Prepares SVG document that holds the output
	var svgDoc = mxUtils.createXmlDocument();
	var root = (svgDoc.createElementNS != null) ?
    		svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
    
	if (background != null)
	{
		if (root.style != null)
		{
			root.style.backgroundColor = background;
		}
		else
		{
			root.setAttribute('style', 'background-color:' + background);
		}
	}
    
	if (svgDoc.createElementNS == null)
	{
    	root.setAttribute('xmlns', mxConstants.NS_SVG);
    	root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
	}
	else
	{
		// KNOWN: Ignored in IE9-11, adds namespace for each image element instead. No workaround.
		root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
	}
	
	root.setAttribute('width', (Math.ceil(bounds.width * scale / vs) + 2 * border) + 'px');
	root.setAttribute('height', (Math.ceil(bounds.height * scale / vs) + 2 * border) + 'px');
	root.setAttribute('version', '1.1');
	
    // Adds group for anti-aliasing via transform
	var node = root;
	
	if (crisp)
	{
		var group = (svgDoc.createElementNS != null) ?
				svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
		group.setAttribute('transform', 'translate(0.5,0.5)');
		root.appendChild(group);
		svgDoc.appendChild(root);
		node = group;
	}
	else
	{
		svgDoc.appendChild(root);
	}

    // Renders graph. Offset will be multiplied with state's scale when painting state.
	var svgCanvas = new mxSvgCanvas2D(node);
	svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs), Math.floor((border / scale - bounds.y) / vs));
	svgCanvas.scale(scale / vs);
	
	// Adds hyperlinks (experimental)
	imgExport.getLinkForCellState = mxUtils.bind(this, function(state, canvas)
	{
		return this.getLinkForCell(state.cell);
	});
	
	// Paints background image
	var bgImg = this.backgroundImage;
	
	if (bgImg != null)
	{
		var tr = this.view.translate;
		svgCanvas.image(tr.x, tr.y, bgImg.width * vs / scale, bgImg.height * vs / scale, bgImg.src, false);
	}
	
	imgExport.drawState(this.getView().getState(this.model.root), svgCanvas);

	return root;
};

/**
 * Returns the first ancestor of the current selection with the given name.
 */
Graph.prototype.getSelectedElement = function()
{
	var node = null;
	
	if (window.getSelection)
	{
		var sel = window.getSelection();
		
	    if (sel.getRangeAt && sel.rangeCount)
	    {
	        var range = sel.getRangeAt(0);
	        node = range.commonAncestorContainer;
	    }
	}
	else if (document.selection)
	{
		node = document.selection.createRange().parentElement();
	}
	
	return node;
};

/**
 * Returns the first ancestor of the current selection with the given name.
 */
Graph.prototype.getParentByName = function(node, name, stopAt)
{
	while (node != null)
	{
		if (node.nodeName == name)
		{
			return node;
		}

		if (node == stopAt)
		{
			return null;
		}
		
		node = node.parentNode;
	}
	
	return node;
};

/**
 * Selects the given node.
 */
Graph.prototype.selectNode = function(node)
{
	var sel = null;
	
    // IE9 and non-IE
	if (window.getSelection)
    {
    	sel = window.getSelection();
    	
        if (sel.getRangeAt && sel.rangeCount)
        {
        	var range = document.createRange();
            range.selectNode(node);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    // IE < 9
	else if ((sel = document.selection) && sel.type != 'Control')
    {
        var originalRange = sel.createRange();
        originalRange.collapse(true);
        range = sel.createRange();
        range.setEndPoint('StartToStart', originalRange);
        range.select();
    }
};

/**
 * Inserts a new row into the given table.
 */
Graph.prototype.insertRow = function(table, index)
{
	var bd = table.tBodies[0];
	var cols = (bd.rows.length > 0) ? bd.rows[0].cells.length : 1;
	var row = bd.insertRow(index);
	
	for (var i = 0; i < cols; i++)
	{
		mxUtils.br(row.insertCell(-1));
	}
	
	return row.cells[0];
};

/**
 * Deletes the given column.
 */
Graph.prototype.deleteRow = function(table, index)
{
	table.tBodies[0].deleteRow(index);
};

/**
 * Deletes the given column.
 */
Graph.prototype.insertColumn = function(table, index)
{
	var hd = table.tHead;
	
	if (hd != null)
	{
		// TODO: use colIndex
		for (var h = 0; h < hd.rows.length; h++)
		{
			var th = document.createElement('th');
			hd.rows[h].appendChild(th);
			mxUtils.br(th);
		}
	}

	var bd = table.tBodies[0];
	
	for (var i = 0; i < bd.rows.length; i++)
	{
		var cell = bd.rows[i].insertCell(index);
		mxUtils.br(cell);
	}
	
	return bd.rows[0].cells[(index >= 0) ? index : bd.rows[0].cells.length - 1];
};

/**
 * Deletes the given column.
 */
Graph.prototype.deleteColumn = function(table, index)
{
	var bd = table.tBodies[0];
	var rows = bd.rows;
	
	for (var i = 0; i < rows.length; i++)
	{
		if (rows[i].cells.length > index)
		{
			rows[i].deleteCell(index);
		}
	}
};

/**
 * Inserts the given HTML at the caret position (no undo).
 */
Graph.prototype.pasteHtmlAtCaret = function(html)
{
    var sel, range;

	// IE9 and non-IE
    if (window.getSelection)
    {
        sel = window.getSelection();
        
        if (sel.getRangeAt && sel.rangeCount)
        {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node;
            
            while ((node = el.firstChild))
            {
                lastNode = frag.appendChild(node);
            }
            
            range.insertNode(frag);
        }
    }
    // IE < 9
    else if ((sel = document.selection) && sel.type != "Control")
    {
    	// FIXME: Does not work if selection is empty
        sel.createRange().pasteHTML(html);
    }
};

/**
 * Customized graph for touch devices.
 */
Graph.prototype.initTouch = function()
{
	// Disables new connections via "hotspot"
	this.connectionHandler.marker.isEnabled = function()
	{
		return this.graph.connectionHandler.first != null;
	};

	// Hides menu when editing starts
	this.addListener(mxEvent.START_EDITING, function(sender, evt)
	{
		this.popupMenuHandler.hideMenu();
	});

	// Adds custom hit detection if native hit detection found no cell
	this.updateMouseEvent = function(me)
	{
		var me = mxGraph.prototype.updateMouseEvent.apply(this, arguments);

		if (mxEvent.isTouchEvent(me.getEvent()) && me.getState() == null)
		{
			var cell = this.getCellAt(me.graphX, me.graphY);

			if (cell != null && this.isSwimlane(cell) && this.hitsSwimlaneContent(cell, me.graphX, me.graphY))
			{
				cell = null;
			}
			else
			{
				me.state = this.view.getState(cell);
				
				if (me.state != null && me.state.shape != null)
				{
					this.container.style.cursor = me.state.shape.node.style.cursor;
				}
			}
		}
		
		if (me.getState() == null)
		{
			this.container.style.cursor = 'default';
		}
		
		return me;
	};

	// Context menu trigger implementation depending on current selection state
	// combined with support for normal popup trigger.
	var cellSelected = false;
	var selectionEmpty = false;
	var menuShowing = false;
	
	this.fireMouseEvent = function(evtName, me, sender)
	{
		if (evtName == mxEvent.MOUSE_DOWN)
		{
			// For hit detection on edges
			me = this.updateMouseEvent(me);
			
			cellSelected = this.isCellSelected(me.getCell());
			selectionEmpty = this.isSelectionEmpty();
			menuShowing = this.popupMenuHandler.isMenuShowing();
		}
		
		mxGraph.prototype.fireMouseEvent.apply(this, arguments);
	};
	
	// Shows popup menu if cell was selected or selection was empty and background was clicked
	// FIXME: Conflicts with mxPopupMenuHandler.prototype.getCellForPopupEvent in Editor.js by
	// selecting parent for selected children in groups before this check can be made.
	this.popupMenuHandler.mouseUp = mxUtils.bind(this, function(sender, me)
	{
		this.popupMenuHandler.popupTrigger = !this.isEditing() && (this.popupMenuHandler.popupTrigger ||
			(!menuShowing && !mxEvent.isMouseEvent(me.getEvent()) &&
			((selectionEmpty && me.getCell() == null && this.isSelectionEmpty()) ||
			(cellSelected && this.isCellSelected(me.getCell())))));
		mxPopupMenuHandler.prototype.mouseUp.apply(this.popupMenuHandler, arguments);
	});
};

(function()
{
	/**
	 * HTML in-place editor
	 */
	mxCellEditor.prototype.isContentEditing = function()
	{
		return this.text2 != null && this.text2.style.display != 'none';
	};
	
	/**
	 * HTML in-place editor
	 */
	mxCellEditor.prototype.toggleViewMode = function()
	{
		if (this.text2 != null)
		{
			var state = this.graph.view.getState(this.editingCell);
			var nl2Br = state != null && mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
			var tmp = this.saveSelection();
			
			if (this.textarea.style.display == 'none')
			{
				var content = this.graph.sanitizeHtml((nl2Br) ? this.text2.innerHTML.replace(/\n/g, '') : this.text2.innerHTML);
				
				if (this.textarea.value != content)
				{
					this.textarea.value = content;
					this.setModified(true);
				}
				
				this.textarea.style.display = 'block';
				this.text2.style.display = 'none';
				this.textarea.focus();
			}
			else
			{
				var content = this.graph.sanitizeHtml((nl2Br) ? this.textarea.value.replace(/\n/g, '<br/>') : this.textarea.value);
				
				if (this.text2.innerHTML != content)
				{
					this.text2.innerHTML = content;
					this.setModified(true);
				}
				
				this.text2.style.display = '';
				this.textarea.style.display = 'none';
				this.text2.focus();
			}
		
			if (this.switchSelectionState != null)
			{
				this.restoreSelection(this.switchSelectionState);
			}
			
			this.switchSelectionState = tmp;
			this.resize();
		}
	};
	
	var mxConstraintHandlerUpdate = mxConstraintHandler.prototype.update;
	mxConstraintHandler.prototype.update = function(me, source)
	{
		if (this.isKeepFocusEvent(me) || !mxEvent.isAltDown(me.getEvent()))
		{
			mxConstraintHandlerUpdate.apply(this, arguments);
		}
		else
		{
			this.reset();
		}
	};

	/**
	 * Creates the keyboard event handler for the current graph and history.
	 */
	mxCellEditor.prototype.saveSelection = function()
	{
	    if (window.getSelection)
	    {
	        sel = window.getSelection();
	        
	        if (sel.getRangeAt && sel.rangeCount)
	        {
	            var ranges = [];
	            
	            for (var i = 0, len = sel.rangeCount; i < len; ++i)
	            {
	                ranges.push(sel.getRangeAt(i));
	            }
	            
	            return ranges;
	        }
	    }
	    else if (document.selection && document.selection.createRange)
	    {
	        return document.selection.createRange();
	    }
	    
	    return null;
	};

	/**
	 * Creates the keyboard event handler for the current graph and history.
	 */
	mxCellEditor.prototype.restoreSelection = function(savedSel)
	{
		if (savedSel)
		{
			if (window.getSelection)
			{
				sel = window.getSelection();
				sel.removeAllRanges();

				for (var i = 0, len = savedSel.length; i < len; ++i)
				{
					sel.addRange(savedSel[i]);
				}
			}
			else if (document.selection && savedSel.select)
			{
				savedSel.select();
			}
		}
	};
	
	/**
	 * Handling of special nl2Br style for not converting newlines to breaks in HTML labels.
	 * NOTE: Since it's easier to set this when the label is created we assume that it does
	 * not change during the lifetime of the mxText instance.
	 */
	var mxCellRendererInitializeLabel = mxCellRenderer.prototype.initializeLabel;
	mxCellRenderer.prototype.initializeLabel = function(state)
	{
		if (state.text != null)
		{
			state.text.replaceLinefeeds = mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
		}
		
		mxCellRendererInitializeLabel.apply(this, arguments);
	};
	
	/**
	 * No dashed shapes.
	 */
	mxGuide.prototype.createGuideShape = function(horizontal)
	{
		var guide = new mxPolyline([], mxConstants.GUIDE_COLOR, mxConstants.GUIDE_STROKEWIDTH);
		
		return guide;
	};

	if ('contentEditable' in document.documentElement)
	{
		/**
		 * Keypress starts immediate editing on selection cell
		 */
		var editorUiInit = EditorUi.prototype.init;
		EditorUi.prototype.init = function()
		{
			editorUiInit.apply(this, arguments);

			mxEvent.addListener(this.editor.graph.container, 'keypress', mxUtils.bind(this, function(evt)
			{
				// KNOWN: Focus does not work if label is empty in quirks mode
				if (!this.editor.graph.isEditing() && !this.editor.graph.isSelectionEmpty() && evt.which !== 0 &&
					!mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
				{
					this.editor.graph.escape();
					this.editor.graph.startEditing();

					if (mxClient.IS_FF)
					{
						var ce = this.editor.graph.cellEditor;

						// Initial keystroke is lost in FF
						if (ce.textarea.style.display != 'none')
						{
							ce.textarea.value = String.fromCharCode(evt.which);
						}
						else if (ce.text2 != null)
						{
							ce.text2.innerHTML = String.fromCharCode(evt.which);
				            var range = document.createRange();
				            range.selectNodeContents(ce.text2);
				            range.collapse(false);
				            
				            var selection = window.getSelection();
				            selection.removeAllRanges();
				            selection.addRange(range);
						}
					}
				}
			}));
		};

		/**
		 * HTML in-place editor
		 */
		var mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
		mxCellEditor.prototype.startEditing = function(cell, trigger)
		{
			this.switchSelectionState = null;
			
			// Selects editing cell
			this.graph.setSelectionCell(cell);

			// First run cannot set display before supercall because textarea is lazy created
			// Lazy instantiates textarea to save memory in IE
			if (this.textarea == null)
			{
				this.init();
			}
			
			var state = this.graph.view.getState(cell);
	
			if (state != null && state.style['html'] == 1)
			{
				this.textarea.style.display = 'none';
			}
			else
			{
				this.textarea.style.display = 'block';
			}
	
			mxCellEditorStartEditing.apply(this, arguments);
			
			// Enables focus outline for edges and edge labels
			var parent = this.graph.getModel().getParent(cell);
			var geo = this.graph.getCellGeometry(cell);
			
			if ((this.graph.getModel().isEdge(parent) && geo != null && geo.relative) ||
				this.graph.getModel().isEdge(cell))
			{
				// Quirks does not support outline at all so use border instead
				if (mxClient.IS_QUIRKS)
				{
					this.textarea.style.border = 'gray dotted 1px';
				}
				// IE>8 and FF on Windows uses outline default of none
				else if (mxClient.IS_IE || mxClient.IS_IE11 || (mxClient.IS_FF && mxClient.IS_WIN))
				{
					this.textarea.style.outline = 'gray dotted 1px';
				}
				else
				{
					this.textarea.style.outline = '';
				}
			}
			else if (mxClient.IS_QUIRKS)
			{
				this.textarea.style.border = '';
			}
	
			if (this.textarea.style.display == 'none')
			{
				this.text2 = document.createElement('div');
				this.text2.className = 'geContentEditable';
				var nl2Br = mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
				this.text2.innerHTML = this.graph.sanitizeHtml((nl2Br) ? this.textarea.value.replace(/\n/g, '<br/>') : this.textarea.value);
				
				var evtName = (!mxClient.IS_IE11 && (!mxClient.IS_IE || document.documentMode >= 9)) ? 'input' : 'keypress';
				mxEvent.addListener(this.text2, evtName, mxUtils.bind(this, function(evt)
				{
					if (this.autoSize && !mxEvent.isConsumed(evt))
					{
						setTimeout(mxUtils.bind(this, function()
						{
							this.resize();
						}), 0);
					}
				}));
				
				// Invokes stop editing and escape hooks
				mxEvent.addListener(this.text2, 'keydown', mxUtils.bind(this, function(evt)
				{
					if (!mxEvent.isConsumed(evt))
					{
						if (this.isStopEditingEvent(evt))
						{
							this.graph.stopEditing(false);
							mxEvent.consume(evt);
						}
						else if (evt.keyCode == 27 /* Escape */)
						{
							this.graph.stopEditing(true);
							mxEvent.consume(evt);
						}
					}
				}));
				
				var style = this.text2.style;
								
				// Required to catch all events on the background in IE
				style.backgroundImage = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';

				style.cursor = 'text';
				style.position = 'absolute';
				style.border = this.textarea.style.border;
				style.outline = this.textarea.style.outline;
				style.width = parseInt(this.textarea.style.width) + 'px';
				style.height = (parseInt(this.textarea.style.height) - 4) + 'px';
				style.left = parseInt(this.textarea.style.left) + 'px';
				style.top = parseInt(this.textarea.style.top) + 'px';
				style.fontFamily = this.textarea.style.fontFamily;
				style.fontWeight = this.textarea.style.fontWeight;
				style.fontStyle = this.textarea.style.fontStyle;
				style.textAlign = this.textarea.style.textAlign;
				// FIXME: Use zoom, not font style for scaling (fix affected position)
				//style.zoom = Math.round(state.view.scale * 100) + '%';
				style.fontSize = this.textarea.style.fontSize;
				style.textDecoration = this.textarea.style.textDecoration;
				style.color = this.textarea.style.color;
				
				// Matches line height correctionFactor in embedded HTML output
				if (state.text != null && state.text.node != null && state.text.node.ownerSVGElement != null)
				{
					var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(parseInt(this.textarea.style.fontSize) * mxConstants.LINE_HEIGHT) + 'px' :
						(mxConstants.LINE_HEIGHT * mxSvgCanvas2D.prototype.lineHeightCorrection);
					style.lineHeight = lh;
				}
				else
				{
					style.lineHeight = this.textarea.style.lineHeight;
				}
				
				this.graph.container.appendChild(this.text2);
				
				if (this.autoSize)
				{
					this.textDiv = this.createTextDiv();
					document.body.appendChild(this.textDiv);
					this.resize();
				}
				
				this.text2.contentEditable = true;
				this.text2.focus();

				if (this.isSelectText() && this.text2.innerHTML.length > 0)
				{
					document.execCommand('selectAll');
				}
				
				// Hides handles on selected cell
				this.currentStateHandle = this.graph.selectionCellsHandler.getHandler(cell);
				
				if (this.currentStateHandle != null && this.currentStateHandle.setHandlesVisible != null)
				{
					this.currentStateHandle.setHandlesVisible(false);

					// Hides the bounding box while editing edge labels
					if (this.currentStateHandle.selectionBorder != null)
					{
						var model = this.graph.getModel();
						var parent = model.getParent(state.cell);
						var geo = this.graph.getCellGeometry(state.cell);
						
						if (model.isEdge(parent) && geo != null && geo.relative && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
						{
							this.currentStateHandle.selectionBorder.node.style.display = 'none';
						}
					}
				}
			}
		};

		var mxCellEditorResize = mxCellEditor.prototype.resize;
		mxCellEditor.prototype.resize = function()
		{
			// Shows in full size for HTML source mode
			if (this.text2 != null && this.textarea.style.display != 'none')
			{
				var state = this.graph.getView().getState(this.editingCell);
				
				if (state != null && this.graph.getModel().isVertex(state.cell))
				{
					var x = state.x;
					var y = state.y;
					var w = state.width;
					var h = state.height;
					
					if (w <= 1 && h <= 1)
					{
						w = Math.max(w, 120);
						h = Math.max(h, 40);
						var m = (state.text != null) ? state.text.margin : null;
						
						if (m == null)
						{
							var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
							var valign = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
					
							m = mxUtils.getAlignmentAsPoint(align, valign);
						}
						
						x += m.x * w;
						y += m.y * h;
					}
					
					this.textarea.style.left = Math.round(x) + 'px';
					this.textarea.style.top = Math.round(y) + 'px';
					this.textarea.style.width = Math.round(w) + 'px';
					this.textarea.style.height = Math.round(h) + 'px';
				}
			}
			else
			{
				mxCellEditorResize.apply(this, arguments);
				
				if (this.textarea.style.display == 'none' && this.text2 != null)
				{
					this.text2.style.top = parseInt(this.textarea.style.top) + 2 + 'px';
					this.text2.style.left = parseInt(this.textarea.style.left) + 1 + 'px';
					this.text2.style.width = this.textarea.style.width;
					this.text2.style.height = this.textarea.style.height;
				}				
			}
		};
		
		var mxCellEditorStopEditing = mxCellEditor.prototype.stopEditing;
		mxCellEditor.prototype.stopEditing = function(cancel)
		{
			// Hides handles on selected cell
			if (this.currentStateHandle != null)
			{
				if (this.currentStateHandle.setHandlesVisible != null)
				{
					this.currentStateHandle.setHandlesVisible(true);
					
					if (this.currentStateHandle.selectionBorder != null)
					{
						this.currentStateHandle.selectionBorder.node.style.display = '';
					}
				}
				
				this.currentStateHandle = null;
			}
			
			if (this.text2 != null)
			{
				var content = this.text2.innerHTML;
				
				// Modified state also updated in code view action
				if (this.text2.style.display != 'none' && this.textarea.value != content)
				{
					this.textarea.value = content.replace(/\r\n/g, '').replace(/\n/g, '');
					this.setModified(true);
				}
				else
				{
					var state = this.graph.view.getState(this.editingCell);
					var nl2Br = state != null && mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
					
					if (nl2Br)
					{
						this.textarea.value = this.textarea.value.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');
					}
				}
				
				this.textarea.value = this.graph.sanitizeHtml(this.textarea.value);
				this.text2.parentNode.removeChild(this.text2);
				this.text2 = null;
			}
			
			// Removes empty relative child labels in edges
			var cell = this.editingCell;
			this.graph.getModel().beginUpdate();
			
			try
			{
				mxCellEditorStopEditing.apply(this, arguments);

				var parent = this.graph.getModel().getParent(cell);
				var geo = this.graph.getCellGeometry(cell);
				
				if (this.textarea != null && mxUtils.trim(this.textarea.value) == '' &&
					this.graph.getModel().isEdge(parent) && geo != null && geo.relative)
				{
					this.graph.removeCells([cell]);
				}
			}
			finally
			{
				this.graph.getModel().endUpdate();
			}
		};
		
		// Allows resizing for current HTML value
		var mxCellEditorGetCurrentValue = mxCellEditor.prototype.getCurrentValue;
		mxCellEditor.prototype.getCurrentValue = function()
		{
			if (this.textarea.style.display == 'none' && this.text2 != null)
			{
				return this.text2.innerHTML;
			}
			else
			{
				return mxCellEditorGetCurrentValue.apply(this, arguments);
			}
		};
		
		mxCellEditor.prototype.getMinimumSize = function(state)
		{
			var scale = this.graph.getView().scale;
			
			return new mxRectangle(0, 0, (state.text == null) ? 30 :  state.text.size * scale + 20, 30);
		};
		
		var mxCellEditorGetCurrentHtmlValue = mxCellEditor.prototype.getCurrentHtmlValue;
		mxCellEditor.prototype.getCurrentHtmlValue = function()
		{
			if (this.textarea.style.display == 'none' && this.text2 != null)
			{
				return this.getCurrentValue();
			}
			else
			{
				return mxCellEditorGetCurrentHtmlValue.apply(this, arguments);
			}
		};

		// Workaround for focusLost calls stopEditing when in HTML view
		var mxCellEditorFocusLost = mxCellEditor.prototype.focusLost;
		mxCellEditor.prototype.focusLost = function(evt)
		{
			if (this.text2 == null)
			{
				mxCellEditorFocusLost.apply(this, arguments);
			}
		};
	}

	function createHint()
	{
		var hint = document.createElement('div');
		hint.className = 'geHint';
		hint.style.whiteSpace = 'nowrap';
		hint.style.position = 'absolute';
		
		return hint;
	};
	
	/**
	 * Updates the hint for the current operation.
	 */
	mxGraphHandler.prototype.updateHint = function(me)
	{
		if (this.shape != null)
		{
			if (this.hint == null)
			{
				this.hint = createHint();
				this.graph.container.appendChild(this.hint);
			}

			var t = this.graph.view.translate;
			var s = this.graph.view.scale;
			var x = this.roundLength((this.bounds.x + this.currentDx) / s - t.x);
			var y = this.roundLength((this.bounds.y + this.currentDy) / s - t.y);
			
			this.hint.innerHTML = x + ', ' + y;

			this.hint.style.left = (this.shape.bounds.x + Math.round((this.shape.bounds.width - this.hint.clientWidth) / 2)) + 'px';
			this.hint.style.top = (this.shape.bounds.y + this.shape.bounds.height + 12) + 'px';
		}
	};

	/**
	 * Updates the hint for the current operation.
	 */
	mxGraphHandler.prototype.removeHint = function()
	{
		if (this.hint != null)
		{
			this.hint.parentNode.removeChild(this.hint);
			this.hint = null;
		}
	};

	/**
	 * Enables recursive resize for groups.
	 */
	mxVertexHandler.prototype.isRecursiveResize = function(state, me)
	{
		return !this.graph.isSwimlane(state.cell) && this.graph.model.getChildCount(state.cell) > 0 &&
			!mxEvent.isControlDown(me.getEvent()) && !this.graph.isCellCollapsed(state.cell) &&
			mxUtils.getValue(state.style, 'childLayout', null) == null;
	};

	/**
	 * Updates the hint for the current operation.
	 */
	mxVertexHandler.prototype.updateHint = function(me)
	{
		if (this.index != mxEvent.LABEL_HANDLE)
		{
			if (this.hint == null)
			{
				this.hint = createHint();
				this.state.view.graph.container.appendChild(this.hint);
			}

			if (this.index == mxEvent.ROTATION_HANDLE)
			{
				this.hint.innerHTML = this.currentAlpha + '&deg;';
			}
			else
			{
				var s = this.state.view.scale;
				this.hint.innerHTML = this.roundLength(this.bounds.width / s) + ' x ' + this.roundLength(this.bounds.height / s);
			}
			
			var rot = (this.currentAlpha != null) ? this.currentAlpha : this.state.style[mxConstants.STYLE_ROTATION] || '0';
			var bb = mxUtils.getBoundingBox(this.bounds, rot);
			
			if (bb == null)
			{
				bb = this.bounds;
			}
			
			this.hint.style.left = bb.x + Math.round((bb.width - this.hint.clientWidth) / 2) + 'px';
			this.hint.style.top = (bb.y + bb.height + 12) + 'px';
		}
	};

	/**
	 * Updates the hint for the current operation.
	 */
	mxVertexHandler.prototype.removeHint = mxGraphHandler.prototype.removeHint;

	/**
	 * Updates the hint for the current operation.
	 */
	mxEdgeHandler.prototype.updateHint = function(me, point)
	{
		if (this.hint == null)
		{
			this.hint = createHint();
			this.state.view.graph.container.appendChild(this.hint);
		}

		var t = this.graph.view.translate;
		var s = this.graph.view.scale;
		var x = this.roundLength(point.x / s - t.x);
		var y = this.roundLength(point.y / s - t.y);
		
		this.hint.innerHTML = x + ', ' + y;
		this.hint.style.visibility = 'visible';
		
		if (this.isSource || this.isTarget)
		{
			if (this.constraintHandler.currentConstraint != null &&
				this.constraintHandler.currentFocus != null)
			{
				var pt = this.constraintHandler.currentConstraint.point;
				this.hint.innerHTML = '[' + Math.round(pt.x * 100) + '%, '+ Math.round(pt.y * 100) + '%]';
			}
			else if (this.marker.hasValidState())
			{
				this.hint.style.visibility = 'hidden';
			}
		}
		
		this.hint.style.left = Math.round(me.getGraphX() - this.hint.clientWidth / 2) + 'px';
		this.hint.style.top = (me.getGraphY() + 12) + 'px';
		
		if (this.hideEdgeHintThread != null)
		{
			window.clearTimeout(this.hideEdgeHintThread);
		}
		
		this.hideEdgeHintThread = window.setTimeout(mxUtils.bind(this, function()
		{
			if (this.hint != null)
			{
				this.hint.style.visibility = 'hidden';
			}
		}), 500);
	};

	/**
	 * Updates the hint for the current operation.
	 */
	mxEdgeHandler.prototype.removeHint = mxGraphHandler.prototype.removeHint;

	/**
	 * Defines the handles for the UI.
	 */
	var connectHandle = new mxImage(IMAGE_PATH + '/handle-connect.png', 26, 26);
	var mainHandle = new mxImage(IMAGE_PATH + '/handle-main.png', 17, 17);
	var fixedHandle = new mxImage(IMAGE_PATH + '/handle-fixed.png', 17, 17);
	var secondaryHandle = new mxImage(IMAGE_PATH + '/handle-secondary.png', 17, 17);
	var rotationHandle = new mxImage(IMAGE_PATH + '/handle-rotate.png', 19, 21);
	var triangleUp = new mxImage(IMAGE_PATH + '/triangle-up.png', 26, 26);
	var triangleRight = new mxImage(IMAGE_PATH + '/triangle-right.png', 26, 26);
	var triangleDown = new mxImage(IMAGE_PATH + '/triangle-down.png', 26, 26);
	var triangleLeft = new mxImage(IMAGE_PATH + '/triangle-left.png', 26, 26);
	var refreshTarget = new mxImage(IMAGE_PATH + '/refresh.png', 38, 38);
	var roundDrop = new mxImage(IMAGE_PATH + '/round-drop.png', 26, 26);
	
	// Pre-fetches images
	new Image().src = connectHandle.src;
	new Image().src = mainHandle.src;
	new Image().src = fixedHandle.src;
	new Image().src = secondaryHandle.src;
	new Image().src = rotationHandle.src;
	new Image().src = triangleUp.src;
	new Image().src = triangleRight.src;
	new Image().src = triangleDown.src;
	new Image().src = triangleLeft.src;
	new Image().src = roundDrop.src;
	
	mxConnectionHandler.prototype.connectImage = connectHandle;
	mxVertexHandler.prototype.handleImage = mainHandle;
	mxVertexHandler.prototype.secondaryHandleImage = secondaryHandle;
	mxEdgeHandler.prototype.handleImage = mainHandle;
	mxEdgeHandler.prototype.fixedHandleImage = fixedHandle;
	mxEdgeHandler.prototype.labelHandleImage = secondaryHandle;
	mxOutline.prototype.sizerImage = mainHandle;
	Sidebar.prototype.triangleUp = triangleUp;
	Sidebar.prototype.triangleRight = triangleRight;
	Sidebar.prototype.triangleDown = triangleDown;
	Sidebar.prototype.triangleLeft = triangleLeft;
	Sidebar.prototype.refreshTarget = refreshTarget;
	Sidebar.prototype.roundDrop = roundDrop;
	
	// Enables connections along the outline, virtual waypoints, parent highlight etc
	mxConnectionHandler.prototype.outlineConnect = true;
	mxCellHighlight.prototype.keepOnTop = true;
	mxVertexHandler.prototype.parentHighlightEnabled = true;
	mxVertexHandler.prototype.rotationHandleVSpacing = -20;
	
	mxEdgeHandler.prototype.parentHighlightEnabled = true;
	mxEdgeHandler.prototype.dblClickRemoveEnabled = true;
	mxEdgeHandler.prototype.virtualBendsEnabled = true;
	mxEdgeHandler.prototype.mergeRemoveEnabled = true;
	mxEdgeHandler.prototype.manageLabelHandle = true;
	mxEdgeHandler.prototype.outlineConnect = true;
	
	mxEdgeHandlerIsVirtualBendsEnabled = mxEdgeHandler.prototype.isVirtualBendsEnabled;
	mxEdgeHandler.prototype.isVirtualBendsEnabled = function()
	{
		return mxEdgeHandlerIsVirtualBendsEnabled.apply(this, arguments) &&
			mxUtils.getValue(this.state.style, mxConstants.STYLE_SHAPE, null) != 'link';
	};
	
	// Shows secondary handle for fixed connection points
	mxEdgeHandler.prototype.createHandleShape = function(index)
	{
		var source = index == 0;
		var c = (index == 0 || index >= this.state.absolutePoints.length - 1) ?
			this.graph.getConnectionConstraint(this.state, this.state.getVisibleTerminalState(source), source) : null;
		var pt = (c != null) ? this.graph.getConnectionPoint(this.state.getVisibleTerminalState(source), c) : null;
		var img = (pt != null) ? this.fixedHandleImage : this.handleImage;

		if (img != null)
		{
			var shape = new mxImageShape(new mxRectangle(0, 0, img.width, img.height), img.src);
			
			// Allows HTML rendering of the images
			shape.preserveImageAspect = false;

			return shape;
		}
		else
		{
			var s = mxConstants.HANDLE_SIZE;
			
			if (this.preferHtml)
			{
				s -= 1;
			}
			
			return new mxRectangleShape(new mxRectangle(0, 0, s, s), mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
		}
	};

	var vertexHandlerCreateSizerShape = mxVertexHandler.prototype.createSizerShape;
	mxVertexHandler.prototype.createSizerShape = function(bounds, index, fillColor)
	{
		this.handleImage = (index == mxEvent.ROTATION_HANDLE) ? rotationHandle : (index == mxEvent.LABEL_HANDLE) ? this.secondaryHandleImage : this.handleImage;
		return vertexHandlerCreateSizerShape.apply(this, arguments);
	};
	
	// Special case for single edge label handle moving in which case the text bounding box is used
	var mxGraphHandlerGetBoundingBox = mxGraphHandler.prototype.getBoundingBox;
	mxGraphHandler.prototype.getBoundingBox = function(cells)
	{
		if (cells != null && cells.length == 1)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(cells[0]);
			var geo = this.graph.getCellGeometry(cells[0]);
			
			if (model.isEdge(parent) && geo != null && geo.relative)
			{
				var state = this.graph.view.getState(cells[0]);
				
				if (state != null && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
				{
					return mxRectangle.fromRectangle(state.text.boundingBox);
				}
			}
		}
		
		return mxGraphHandlerGetBoundingBox.apply(this, arguments);
	};
	
	// Uses text bounding box for edge labels
	var mxVertexHandlerGetSelectionBounds = mxVertexHandler.prototype.getSelectionBounds;
	mxVertexHandler.prototype.getSelectionBounds = function(state)
	{
		var model = this.graph.getModel();
		var parent = model.getParent(state.cell);
		var geo = this.graph.getCellGeometry(state.cell);
		
		if (model.isEdge(parent) && geo != null && geo.relative && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
		{
			var bbox = state.text.boundingBox;
			
			return new mxRectangle(Math.round(bbox.x), Math.round(bbox.y), Math.round(bbox.width), Math.round(bbox.height));
		}
		else
		{
			return mxVertexHandlerGetSelectionBounds.apply(this, arguments);
		}
	};

	// Redirects moving of edge labels to mxGraphHandler by not starting here.
	// This will use the move preview of mxGraphHandler (see above).
	var mxVertexHandlerMouseDown = mxVertexHandler.prototype.mouseDown;
	mxVertexHandler.prototype.mouseDown = function(sender, me)
	{
		var model = this.graph.getModel();
		var parent = model.getParent(this.state.cell);
		var geo = this.graph.getCellGeometry(this.state.cell);
		
		if (!model.isEdge(parent) || geo == null || !geo.relative || this.state == null || this.state.width >= 2 || this.state.height >= 2)
		{
			mxVertexHandlerMouseDown.apply(this, arguments);
		}
	};

	// Requires callback to editorUi in edit link so override editorUi.init
	var editorUiInit3 = EditorUi.prototype.init;
	EditorUi.prototype.init = function()
	{
		editorUiInit3.apply(this, arguments);
		
		// Required for calling edit link action below
		var ui = this;
	
		/**
		 * Implements touch style
		 */
		if (touchStyle)
		{
			// Larger tolerance for real touch devices
			if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
			{
				mxShape.prototype.svgStrokeTolerance = 18;
				mxVertexHandler.prototype.tolerance = 12;
				mxEdgeHandler.prototype.tolerance = 12;
				Graph.prototype.tolerance = 12;
				
				mxVertexHandler.prototype.rotationHandleVSpacing = -24;
				
				// Implements a smaller tolerance for mouse events and a larger tolerance for touch
				// events on touch devices. The default tolerance (4px) is used for mouse events.
				mxConstraintHandler.prototype.getTolerance = function(me)
				{
					return (mxEvent.isMouseEvent(me.getEvent())) ? 4 : this.graph.getTolerance();
				};
			}
				
			// One finger pans (no rubberband selection) must start regardless of mouse button
			mxPanningHandler.prototype.isPanningTrigger = function(me)
			{
				var evt = me.getEvent();
				
			 	return (me.getState() == null && !mxEvent.isMouseEvent(evt)) ||
			 		(mxEvent.isPopupTrigger(evt) && (me.getState() == null ||
			 		mxEvent.isControlDown(evt) || mxEvent.isShiftDown(evt)));
			};
			
			// Don't clear selection if multiple cells selected
			var graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;
			mxGraphHandler.prototype.mouseDown = function(sender, me)
			{
				graphHandlerMouseDown.apply(this, arguments);
	
				if (mxEvent.isTouchEvent(me.getEvent()) && this.graph.isCellSelected(me.getCell()) &&
					this.graph.getSelectionCount() > 1)
				{
					this.delayedSelection = false;
				}
			};
		}
		
		var vertexHandlerMouseMove = mxVertexHandler.prototype.mouseMove;
		mxVertexHandler.prototype.mouseMove = function()
		{
			vertexHandlerMouseMove.apply(this, arguments);
			
			if (this.graph.graphHandler.first != null)
			{
				if (this.linkHint != null)
				{
					this.linkHint.style.display = 'none';
				}
				
				if (this.connectorImg != null)
				{
					this.connectorImg.style.display = 'none';
				}
				
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = 'none';
				}
			}
		};
		
		var vertexHandlerMouseUp = mxVertexHandler.prototype.mouseUp;
		mxVertexHandler.prototype.mouseUp = function()
		{
			vertexHandlerMouseUp.apply(this, arguments);
			
			if (this.connectorImg != null)
			{
				this.connectorImg.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
			
			if (this.linkHint != null)
			{
				this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
			
			// Shows rotation handle only if one vertex is selected
			if (this.rotationShape != null && this.rotationShape.node != null)
			{
				this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
		};
		
		var vertexHandlerReset = mxVertexHandler.prototype.reset;
		mxVertexHandler.prototype.reset = function()
		{
			vertexHandlerReset.apply(this, arguments);
			
			// Shows rotation handle only if one vertex is selected
			if (this.rotationShape != null && this.rotationShape.node != null)
			{
				this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
			}
		};
		
		var vertexHandlerInit = mxVertexHandler.prototype.init;
		mxVertexHandler.prototype.init = function()
		{
			vertexHandlerInit.apply(this, arguments);
			var redraw = false;
			
			var update = mxUtils.bind(this, function()
			{
				if (this.connectorImg != null)
				{
					this.connectorImg.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.linkHint != null)
				{
					this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}

				// Shows rotation handle only if one vertex is selected
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.specialHandle != null)
				{
					this.specialHandle.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
				}
				
				this.redrawHandles();
			});
			
			this.selectionHandler = mxUtils.bind(this, function(sender, evt)
			{
				update();
			});
			
			this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
			
			this.changeHandler = mxUtils.bind(this, function(sender, evt)
			{
				this.updateLinkHint(this.graph.getLinkForCell(this.state.cell));
				update();
			});
			
			this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);

			if (this.graph.isEnabled() && (touchStyle || urlParams['connect'] == null || urlParams['connect'] == '2'))
			{
				// Only show connector image on one cell and do not show on containers
				if (showConnectorImg && this.graph.isCellConnectable(this.state.cell))
				{
					// Workaround for event redirection via image tag in quirks and IE8
					if (mxClient.IS_IE && !mxClient.IS_SVG)
					{
						// Workaround for PNG images in IE6
						if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat')
						{
							this.connectorImg = document.createElement(mxClient.VML_PREFIX + ':image');
							this.connectorImg.setAttribute('src', connectHandle.src);
							this.connectorImg.style.borderStyle = 'none';
						}
						else
						{
							this.connectorImg = document.createElement('div');
							this.connectorImg.style.backgroundImage = 'url(' + connectHandle.src + ')';
							this.connectorImg.style.backgroundPosition = 'center';
							this.connectorImg.style.backgroundRepeat = 'no-repeat';
						}
						
						this.connectorImg.style.width = (connectHandle.width + 4) + 'px';
						this.connectorImg.style.height = (connectHandle.height + 4) + 'px';
						this.connectorImg.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
					}
					else
					{
						this.connectorImg = mxUtils.createImage(connectHandle.src);
						
						if (touchStyle)
						{
							this.connectorImg.style.width = '29px';
							this.connectorImg.style.height = '29px';
						}
						else
						{
							this.connectorImg.style.width = connectHandle.width + 'px';
							this.connectorImg.style.height = connectHandle.height + 'px';
						}
					}
					
					this.connectorImg.style.cursor = 'crosshair';
					this.connectorImg.style.position = 'absolute';
					this.connectorImg.setAttribute('title', mxResources.get('connect'));
					
					if (!(mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
					{
						mxEvent.redirectMouseEvents(this.connectorImg, this.graph, this.state);
					}
					
					// Starts connecting on touch/mouse down
					mxEvent.addGestureListeners(this.connectorImg,
						mxUtils.bind(this, function(evt)
						{
							// FIXME: Use native event in isForceRubberband, isForcePanningEvent
							if (!mxEvent.isAltDown(evt) && !mxEvent.isPopupTrigger(evt))
							{
								this.graph.popupMenuHandler.hideMenu();
								this.graph.stopEditing(false);
								
								var pt = mxUtils.convertPoint(this.graph.container,
										mxEvent.getClientX(evt), mxEvent.getClientY(evt));
								this.graph.connectionHandler.start(this.state, pt.x, pt.y);
								this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
								this.graph.isMouseDown = true;
								
								mxEvent.consume(evt);
							}
						})
					);
					
					mxEvent.addListener(this.connectorImg, 'click', function(evt)
					{
						if (mxClient.IS_IE || evt.detail < 2)
						{
							ui.actions.get('duplicate').funct();
							mxEvent.consume(evt);
						}
					});
	
					this.graph.container.appendChild(this.connectorImg);
					redraw = true;
				}
			}

			var link = this.graph.getLinkForCell(this.state.cell);
									
			if (link != null)
			{
				var label = link;
				var max = 60;
				var head = 36;
				var tail = 20;
				
				if (label.length > max)
				{
					label = label.substring(0, head) + '...' + label.substring(label.length - tail);
				}

				this.linkHint = createHint();
				this.linkHint.style.padding = '4px 10px 6px 10px';
				this.linkHint.style.fontSize = '90%';
				this.linkHint.style.opacity = '1';
				this.linkHint.style.filter = '';
				this.updateLinkHint(link);
				
				this.graph.container.appendChild(this.linkHint);
				redraw = true;
			}
			
			if (redraw)
			{
				this.redrawHandles();
			}
		};
		
		mxVertexHandler.prototype.updateLinkHint = function(link)
		{
			if (this.linkHint != null)
			{
				var label = link;
				var max = 60;
				var head = 36;
				var tail = 20;
				
				if (label.length > max)
				{
					label = label.substring(0, head) + '...' + label.substring(label.length - tail);
				}
				
				var a = document.createElement('a');
				a.setAttribute('href', link);
				a.setAttribute('title', link);
				
				if (this.graph.linkTarget != null)
				{
					a.setAttribute('target', this.graph.linkTarget);
				}
				
				mxUtils.write(a, label);
				
				this.linkHint.innerHTML = '';
				this.linkHint.appendChild(a);

				if (this.graph.isEnabled())
				{
					var changeLink = document.createElement('img');
					changeLink.setAttribute('src', IMAGE_PATH + '/edit.gif');
					changeLink.setAttribute('title', mxResources.get('editLink'));
					changeLink.setAttribute('width', '11');
					changeLink.setAttribute('height', '11');
					changeLink.style.marginLeft = '10px';
					changeLink.style.marginBottom = '-1px';
					changeLink.style.cursor = 'pointer';
					this.linkHint.appendChild(changeLink);
					
					mxEvent.addListener(changeLink, 'click', mxUtils.bind(this, function(evt)
					{
						this.graph.setSelectionCell(this.state.cell);
						ui.actions.get('editLink').funct();
						mxEvent.consume(evt);
					}));
				}
			}
		};
		
		mxEdgeHandler.prototype.updateLinkHint = mxVertexHandler.prototype.updateLinkHint;
		
		var edgeHandlerInit = mxEdgeHandler.prototype.init;
		mxEdgeHandler.prototype.init = function()
		{
			edgeHandlerInit.apply(this, arguments);
			
			// Disables connection points
			this.constraintHandler.isEnabled = mxUtils.bind(this, function()
			{
				return this.state.view.graph.connectionHandler.isEnabled();
			});
			
			var update = mxUtils.bind(this, function()
			{
				if (this.linkHint != null)
				{
					this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.labelShape != null)
				{
					this.labelShape.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
				}
			});

			this.selectionHandler = mxUtils.bind(this, function(sender, evt)
			{
				update();
			});
			
			this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
			
			this.changeHandler = mxUtils.bind(this, function(sender, evt)
			{
				this.updateLinkHint(this.graph.getLinkForCell(this.state.cell));
				update();
				this.redrawHandles();
			});
			
			this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);

			var link = this.graph.getLinkForCell(this.state.cell);
									
			if (link != null)
			{
				this.linkHint = createHint();
				this.linkHint.style.padding = '4px 10px 6px 10px';
				this.linkHint.style.fontSize = '90%';
				this.linkHint.style.opacity = '1';
				this.linkHint.style.filter = '';
				this.updateLinkHint(link);
				
				this.graph.container.appendChild(this.linkHint);
				this.redrawHandles();
			}
		};
	};
	
	// Disables connection points
	var connectionHandlerInit = mxConnectionHandler.prototype.init;
	
	mxConnectionHandler.prototype.init = function()
	{
		connectionHandlerInit.apply(this, arguments);
		
		this.constraintHandler.isEnabled = mxUtils.bind(this, function()
		{
			return this.graph.connectionHandler.isEnabled();
		});
	};

	var vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
	mxVertexHandler.prototype.redrawHandles = function()
	{
		vertexHandlerRedrawHandles.apply(this);

		if (this.state != null && this.connectorImg != null)
		{
			var pt = new mxPoint();
			var s = this.state;
			
			// Top right for single-sizer
			if (mxVertexHandler.prototype.singleSizer)
			{
				pt.x = s.x + s.width - this.connectorImg.offsetWidth / 2;
				pt.y = s.y - this.connectorImg.offsetHeight / 2;
			}
			else
			{
				var dx = (this.handleImage != null) ? this.handleImage.width : mxConstants.HANDLE_SIZE;
				pt.x = s.x + s.width + (dx + this.horizontalOffset + this.tolerance + this.connectorImg.offsetWidth) / 2;
				pt.y = s.y + s.height / 2;
			}
			
			var alpha = mxUtils.toRadians(mxUtils.getValue(s.style, mxConstants.STYLE_ROTATION, 0));
			
			if (alpha != 0)
			{
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
				
				var ct = new mxPoint(s.getCenterX(), s.getCenterY());
				pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
			}
			
			this.connectorImg.style.left = Math.round(pt.x - this.connectorImg.offsetWidth / 2) + 'px';
			this.connectorImg.style.top = Math.round(pt.y - this.connectorImg.offsetHeight / 2) + 'px';
		}
		
		if (this.state != null && this.linkHint != null)
		{
			var c = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
			var tmp = new mxRectangle(this.state.x, this.state.y - 22, this.state.width + 24, this.state.height + 22);
			var bb = mxUtils.getBoundingBox(tmp, this.state.style[mxConstants.STYLE_ROTATION] || '0', c);
			var rs = (bb != null) ? mxUtils.getBoundingBox(this.state, this.state.style[mxConstants.STYLE_ROTATION] || '0') : this.state;
			
			if (bb == null)
			{
				bb = this.state;
			}
			
			this.linkHint.style.left = Math.round(rs.x + (rs.width - this.linkHint.clientWidth) / 2) + 'px';
			this.linkHint.style.top = Math.round(bb.y + bb.height + this.verticalOffset / 2 +
					6 + this.state.view.graph.tolerance) + 'px';
		}
	};
	
	var vertexHandlerSetHandlesVisible = mxVertexHandler.prototype.setHandlesVisible;
	mxVertexHandler.prototype.setHandlesVisible = function(visible)
	{
		vertexHandlerSetHandlesVisible.apply(this, arguments);
		
		if (this.connectorImg != null)
		{
			this.connectorImg.style.visibility = (visible) ? '' : 'hidden';
		}
		
		if (this.linkHint != null)
		{
			this.linkHint.style.visibility = (visible) ? '' : 'hidden';
		}
	};
	
	var vertexHandlerReset = mxVertexHandler.prototype.reset;
	mxVertexHandler.prototype.reset = function()
	{
		vertexHandlerReset.apply(this, arguments);
		
		if (this.connectorImg != null)
		{
			this.connectorImg.style.visibility = '';
		}
		
		if (this.linkHint != null)
		{
			this.linkHint.style.visibility = '';
		}
	};
	
	var vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
	mxVertexHandler.prototype.destroy = function(sender, me)
	{
		vertexHandlerDestroy.apply(this, arguments);
		
		if (this.linkHint != null)
		{
			this.linkHint.parentNode.removeChild(this.linkHint);
			this.linkHint = null;
		}

		if (this.connectorImg != null)
		{
			this.connectorImg.parentNode.removeChild(this.connectorImg);
			this.connectorImg = null;
		}
		
		if (this.selectionHandler != null)
		{
			this.graph.getSelectionModel().removeListener(this.selectionHandler);
			this.selectionHandler = null;
		}
		
		if  (this.changeHandler != null)
		{
			this.graph.getModel().removeListener(this.changeHandler);
			this.changeHandler = null;
		}
	};
	
	var edgeHandlerRedrawHandles = mxEdgeHandler.prototype.redrawHandles;
	mxEdgeHandler.prototype.redrawHandles = function()
	{
		// Workaround for special case where handler
		// is reset before this which leads to a NPE
		if (this.marker != null)
		{
			edgeHandlerRedrawHandles.apply(this);
	
			if (this.state != null && this.linkHint != null)
			{
				var b = this.state;
				
				if (this.state.text != null && this.state.text.bounds != null)
				{
					b = new mxRectangle(b.x, b.y, b.width, b.height);
					b.add(this.state.text.bounds);
				}
				
				this.linkHint.style.left = Math.round(b.x + (b.width - this.linkHint.clientWidth) / 2) + 'px';
				this.linkHint.style.top = Math.round(b.y + b.height + 6 + this.state.view.graph.tolerance) + 'px';
			}
		}
	};

	var edgeHandlerReset = 	mxEdgeHandler.prototype.reset;
	mxEdgeHandler.prototype.reset = function()
	{
		edgeHandlerReset.apply(this, arguments);
		
		if (this.linkHint != null)
		{
			this.linkHint.style.visibility = '';
		}
	};
	
	var edgeHandlerDestroy = 	mxEdgeHandler.prototype.destroy;
	mxEdgeHandler.prototype.destroy = function(sender, me)
	{
		edgeHandlerDestroy.apply(this, arguments);
		
		if (this.linkHint != null)
		{
			this.linkHint.parentNode.removeChild(this.linkHint);
			this.linkHint = null;
		}

		if (this.selectionHandler != null)
		{
			this.graph.getSelectionModel().removeListener(this.selectionHandler);
			this.selectionHandler = null;
		}

		if  (this.changeHandler != null)
		{
			this.graph.getModel().removeListener(this.changeHandler);
			this.changeHandler = null;
		}
	};
})();
