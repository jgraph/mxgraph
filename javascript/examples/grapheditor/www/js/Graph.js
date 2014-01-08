/**
 * $Id: Graph.js,v 1.35 2014/01/08 10:50:55 gaudenz Exp $
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

	// Enables cloning of connection sources by default
	this.connectionHandler.setCreateTarget(true);
	
	// Disables built-in connection starts
	this.connectionHandler.isValidSource = function()
	{
		return mxConnectionHandler.prototype.isValidSource.apply(this, arguments) && urlParams['connect'] != '2' && urlParams['connect'] != null;
	};

	// Sets the style to be used when an elbow edge is double clicked
	this.alternateEdgeStyle = 'vertical';

	if (stylesheet == null)
	{
		this.loadStylesheet();
	}
	
	// Creates rubberband selection
    var rubberband = new mxRubberband(this);
    
    this.getRubberband = function()
    {
    	return rubberband;
    };
    
    // Shows hand cursor while panning
	this.panningHandler.addListener(mxEvent.PAN_START, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'pointer';
	}));
		
	this.panningHandler.addListener(mxEvent.PAN_END, mxUtils.bind(this, function()
	{
		this.container.style.cursor = 'default';
	}));

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
		var href = this.getLinkForCell(cell);
		
		return style['html'] == '1' || style['whiteSpace'] == 'wrap' || href != null;
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
	
			var href = state.view.graph.getLinkForCell(state.cell);
			
			if (href != null)
			{
				result = '<a style="color:inherit;text-decoration:inherit;" href="' + href + '" target="_blank">' + result + '</a>';
			}
		}
		
		return result;
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
 * Loads the stylesheet for this graph.
 */
Graph.prototype.loadStylesheet = function()
{
    var node = mxUtils.load(STYLE_PATH + '/default.xml').getDocumentElement();
	var dec = new mxCodec(node.ownerDocument);
	dec.decode(node, this.getStylesheet());
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
 * Sets the default edge for future connections.
 */
Graph.prototype.setDefaultEdge = function(cell)
{
	if (cell != null && this.getModel().isEdge(cell))
	{
		// Take a snapshot of the cell at the moment of calling
		var proto = this.getModel().cloneCell(cell);
		
		// Delete existing points
		if (proto.geometry != null)
		{
			proto.geometry.points = null;
		}
		
		// Delete entry-/exitXY styles
		var style = proto.getStyle();
		style = mxUtils.setStyle(style, mxConstants.STYLE_ENTRY_X, null);
		style = mxUtils.setStyle(style, mxConstants.STYLE_ENTRY_Y, null);
		style = mxUtils.setStyle(style, mxConstants.STYLE_EXIT_X, null);
		style = mxUtils.setStyle(style, mxConstants.STYLE_EXIT_Y, null);
		proto.setStyle(style);
		
		// Uses edge template for connect preview
		this.connectionHandler.createEdgeState = function(me)
		{
    		return this.graph.view.createState(proto);
	    };

	    // Creates new connections from edge template
	    this.connectionHandler.factoryMethod = function()
	    {
    		return this.graph.cloneCells([proto])[0];
	    };
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
	if (this.isSwimlane(cell))
	{
		return true;
	}
	else
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
	
		return style['container'] == '1';
	}
	
	return false;
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
 * Overrides tooltips to show position and size
 */
Graph.prototype.getTooltipForCell = function(cell)
{
	var tip = '';
	
	if (this.getModel().isVertex(cell))
	{
		var geo = this.getCellGeometry(cell);
		
		var f2 = function(x)
		{
			return Math.round(parseFloat(x) * 100) / 100;
		};
		
		if (geo != null)
		{
			if (tip == null)
			{
				tip = '';
			}
			else if (tip.length > 0)
			{
				tip += '\n';
			}
			
			tip += 'X/Y: ' + f2(geo.x) + '/' + f2(geo.y) + '\nWxH: ' + f2(geo.width) + 'x' + f2(geo.height);
		}
	}
	else if (this.getModel().isEdge(cell))
	{
		tip = mxGraph.prototype.getTooltipForCell.apply(this, arguments);
	}
	
	// Adds metadata
	if (mxUtils.isNode(cell.value))
	{
		var attrs = cell.value.attributes;
		
		for (var i = 0; i < attrs.length; i++)
		{
			if (attrs[i].nodeName != 'label' && attrs[i].nodeValue.length > 0)
			{
				tip += '\n' + attrs[i].nodeName + ': ' + attrs[i].nodeValue;
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
 * Handles label changes for XML user objects.
 */
Graph.prototype.cellLabelChanged = function(cell, value, autoSize)
{
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
	var value = null;
	
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		value = cell.value.cloneNode(true);
	}
	else
	{
		var doc = mxUtils.createXmlDocument();
		
		value = doc.createElement('UserObject');
		value.setAttribute('label', cell.value);
	}
	
	if (link != null && link.length > 0)
	{
		value.setAttribute('link', link);
	}
	else
	{
		value.removeAttribute('link');
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

		if (me.getState() == null)
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
		this.popupMenuHandler.popupTrigger = !this.isEditing() && (this.popupMenuHandler.popupTrigger  ||
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
			var tmp = this.saveSelection();
			
			if (this.textarea.style.display == 'none')
			{
				var content = this.text2.innerHTML.replace(/\n/g, '');
				
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
				var content = this.textarea.value.replace(/\n/g, '<br/>');
				
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

	if ('contentEditable' in document.documentElement)
	{
		/**
		 * HTML in-place editor
		 */
		var mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
		mxCellEditor.prototype.startEditing = function(cell, trigger)
		{
			this.switchSelectionState = null;
			
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
	
			if (this.textarea.style.display == 'none')
			{			
				this.text2 = document.createElement('div');
				this.text2.innerHTML = this.textarea.value.replace(/\n/g, '<br/>');
				var style = this.text2.style;
								
				// Required to catch all events on the background in IE
				style.backgroundImage = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';

				style.cursor = 'text';
				style.outline = 'none';
				style.position = 'absolute';
				style.width = parseInt(this.textarea.style.width) + 'px';
				style.height = (parseInt(this.textarea.style.height) - 4) + 'px';
				style.left = parseInt(this.textarea.style.left) + 'px';
				style.top = parseInt(this.textarea.style.top) + 'px';
				style.fontSize = this.textarea.style.fontSize;
				style.fontFamily = this.textarea.style.fontFamily;
				style.textAlign = this.textarea.style.textAlign;
				style.fontWeight = this.textarea.style.fontWeight;
				style.color = this.textarea.style.color;
				
				var size = parseInt(this.textarea.style.fontSize);
				style.lineHeight = Math.round(size * mxConstants.LINE_HEIGHT) + 'px';
				
				this.graph.container.appendChild(this.text2);
				this.text2.contentEditable = true;
				this.text2.focus();

				document.execCommand('selectall');
			}
			else
			{
				this.textarea.focus();
				this.textarea.select();
			}
		};

		var mxCellEditorStopEditing = mxCellEditor.prototype.stopEditing;
		mxCellEditor.prototype.stopEditing = function(cancel)
		{
			if (this.text2 != null)
			{
				var content = this.text2.innerHTML;
				
				// Modified state also updated in code view action
				// TODO: Roundtrip for linefeeds in quirks/IE8
				if (this.text2.style.display != 'none' && this.textarea.value != content)
				{
					this.textarea.value = content.replace(/\n/g, '');
					this.setModified(true);
				}
				
				this.text2.parentNode.removeChild(this.text2);
				this.text2 = null;
			}
			
			mxCellEditorStopEditing.apply(this, arguments);
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

	/**
	 * Implements touch style
	 */
	if (touchStyle)
	{
		// Sets constants for touch style
		mxConstants.HANDLE_SIZE = 16;
		mxConstants.LABEL_HANDLE_SIZE = 7;
		
		// Larger tolerance and grid for real touch devices
		if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
		{
			mxShape.prototype.svgStrokeTolerance = 18;
			mxVertexHandler.prototype.tolerance = 12;
			mxEdgeHandler.prototype.tolerance = 12;
			Graph.prototype.tolerance = 12;
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

			if (this.graph.isCellSelected(me.getCell()) && this.graph.getSelectionCount() > 1)
			{
				this.delayedSelection = false;
			}
		};

		// Rounded edge and vertex handles
		var touchHandle = new mxImage(IMAGE_PATH + '/touch-handle.png', 16, 16);
		var rotationHandle = new mxImage(IMAGE_PATH + '/touch-handle-orange.png', 16, 16);
		var edgeHandle = new mxImage(IMAGE_PATH + '/touch-handle.png', 16, 16);
		mxVertexHandler.prototype.handleImage = touchHandle;
		mxEdgeHandler.prototype.handleImage = edgeHandle;
		mxOutline.prototype.sizerImage = touchHandle;
		
		// Pre-fetches touch handle
		new Image().src = touchHandle.src;
		
		var vertexHandlerCreateSizerShape = mxVertexHandler.prototype.createSizerShape;
		mxVertexHandler.prototype.createSizerShape = function(bounds, index, fillColor)
		{
			this.handleImage = (index == mxEvent.ROTATION_HANDLE) ? rotationHandle : mxVertexHandler.prototype.handleImage;
			return vertexHandlerCreateSizerShape.apply(this, arguments);
		};
		
		// Installs locked and connect handles
		// Problem is condition for source and target in segment handler before creating bends array
		/*var edgeHandlerCreateHandleShape = mxEdgeHandler.prototype.createHandleShape;
		mxEdgeHandler.prototype.createHandleShape = function(index)
		{
			if (index == 0 || index == this.abspoints.length - 1)
			{
				this.handleImage = connectHandle;
			}
			else
			{
				this.handleImage = touchHandle;
			}
			
			return edgeHandlerCreateHandleShape.apply(this, arguments);
		};*/
		
		// Adds connect icon to selected vertices
		var connectorSrc = IMAGE_PATH + '/touch-connector.png';
		
		// TODO: Merge with code below
		var vertexHandlerInit = mxVertexHandler.prototype.init;
		mxVertexHandler.prototype.init = function()
		{
			vertexHandlerInit.apply(this, arguments);

			// Only show connector image on one cell and do not show on containers
			if (showConnectorImg && this.graph.connectionHandler.isEnabled() &&
				this.graph.isCellConnectable(this.state.cell) &&
				!this.graph.isValidRoot(this.state.cell) &&
				this.graph.getSelectionCount() == 1)
			{
				this.connectorImg = mxUtils.createImage(connectorSrc);
				this.connectorImg.style.cursor = 'pointer';
				this.connectorImg.style.width = '29px';
				this.connectorImg.style.height = '29px';
				this.connectorImg.style.position = 'absolute';
				
				if (!(mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
				{
					this.connectorImg.setAttribute('title', mxResources.get('connect'));
					mxEvent.redirectMouseEvents(this.connectorImg, this.graph, this.state);
				}

				// Starts connecting on touch/mouse down
				mxEvent.addGestureListeners(this.connectorImg,
					mxUtils.bind(this, function(evt)
					{
						this.graph.popupMenuHandler.hideMenu();
						this.graph.stopEditing(false);
						
						var pt = mxUtils.convertPoint(this.graph.container,
								mxEvent.getClientX(evt), mxEvent.getClientY(evt));
						this.graph.connectionHandler.start(this.state, pt.x, pt.y);
						this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
						this.graph.isMouseDown = true;
						mxEvent.consume(evt);
					})
				);

				this.graph.container.appendChild(this.connectorImg);
			}

			this.redrawHandles();
		};

		// Pre-fetches touch connector
		new Image().src = connectorSrc;
	}
	else // not touchStyle
	{
		var img = new mxImage(IMAGE_PATH + '/connector.png', 15, 15);
		mxConnectionHandler.prototype.connectImage = img;

		// Pre-fetches img
		new Image().src = img.src;
		
		if (urlParams['connect'] == null || urlParams['connect'] == '2')
		{
			var img = new mxImage(IMAGE_PATH + '/connector.png', 15, 15);
					
			var vertexHandlerInit = mxVertexHandler.prototype.init;
			mxVertexHandler.prototype.init = function()
			{
				vertexHandlerInit.apply(this, arguments);

				// Only show connector image on one cell and do not show on containers
				if (showConnectorImg && this.graph.connectionHandler.isEnabled() &&
					this.graph.isCellConnectable(this.state.cell) &&
					!this.graph.isValidRoot(this.state.cell) &&
					this.graph.getSelectionCount() == 1)
				{
					// Workaround for event redirection via image tag in quirks and IE8
					if (mxClient.IS_IE && !mxClient.IS_SVG)
					{
						this.connectorImg = document.createElement('div');
						this.connectorImg.style.backgroundImage = 'url(' + img.src + ')';
						this.connectorImg.style.backgroundPosition = 'center';
						this.connectorImg.style.backgroundRepeat = 'no-repeat';
						this.connectorImg.style.width = (img.width + 4) + 'px';
						this.connectorImg.style.height = (img.height + 4) + 'px';
						this.connectorImg.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
					}
					else
					{
						this.connectorImg = mxUtils.createImage(img.src);
						this.connectorImg.style.width = img.width + 'px';
						this.connectorImg.style.height = img.height + 'px';
					}
					
					this.connectorImg.style.cursor = 'pointer';
					this.connectorImg.style.position = 'absolute';
					this.connectorImg.setAttribute('title', mxResources.get('connect'));
					mxEvent.redirectMouseEvents(this.connectorImg, this.graph, this.state);
					
					// Starts connecting on touch/mouse down
					// Starts connecting on touch/mouse down
					mxEvent.addGestureListeners(this.connectorImg,
						mxUtils.bind(this, function(evt)
						{
							this.graph.popupMenuHandler.hideMenu();
							this.graph.stopEditing(false);
							
							var pt = mxUtils.convertPoint(this.graph.container,
									mxEvent.getClientX(evt), mxEvent.getClientY(evt));
							this.graph.connectionHandler.start(this.state, pt.x, pt.y);
							this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
							this.graph.isMouseDown = true;
							mxEvent.consume(evt);
						})
					);
	
					this.graph.container.appendChild(this.connectorImg);
					this.redrawHandles();
				}
			};
		}
	}

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
				pt.x = s.x + s.width + mxConstants.HANDLE_SIZE / 2 + 4 + this.connectorImg.offsetWidth / 2;
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
			
			this.connectorImg.style.left = (pt.x - this.connectorImg.offsetWidth / 2) + 'px';
			this.connectorImg.style.top = (pt.y - this.connectorImg.offsetHeight / 2) + 'px';
		}
	};
	
	var vertexHandlerHideSizers = mxVertexHandler.prototype.hideSizers;
	mxVertexHandler.prototype.hideSizers = function()
	{
		vertexHandlerHideSizers.apply(this, arguments);
		
		if (this.connectorImg != null)
		{
			this.connectorImg.style.visibility = 'hidden';
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
	};
	
	var vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
	mxVertexHandler.prototype.destroy = function(sender, me)
	{
		vertexHandlerDestroy.apply(this, arguments);

		if (this.connectorImg != null)
		{
			this.connectorImg.parentNode.removeChild(this.connectorImg);
			this.connectorImg = null;
		}
	};
})();
