/**
 * $Id: EditorUi.js,v 1.52 2014/02/13 09:08:32 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
EditorUi = function(editor, container)
{
	mxEventSource.call(this);
	
	this.editor = editor || new Editor();
	this.container = container || document.body;
	var graph = this.editor.graph;

	// Pre-fetches submenu image
	new Image().src = mxPopupMenu.prototype.submenuImage;

	// Pre-fetches connect image
	if (mxConnectionHandler.prototype.connectImage != null)
	{
		new Image().src = mxConnectionHandler.prototype.connectImage.src;
	}
	
    // Creates the user interface
	this.actions = new Actions(this);
	this.menus = new Menus(this);
	this.createDivs();
	this.createUi();
	this.refresh();
	
	// Disables HTML and text selection
	var textEditing =  mxUtils.bind(this, function(evt)
	{
		if (evt == null)
		{
			evt = window.event;
		}
		
		if (this.isSelectionAllowed(evt))
		{
			return true;
		}
		
		return graph.isEditing();
	});

	// Disables text selection while not editing and no dialog visible
	if (this.container == document.body)
	{
		this.menubarContainer.onselectstart = textEditing;
		this.menubarContainer.onmousedown = textEditing;
		this.toolbarContainer.onselectstart = textEditing;
		this.toolbarContainer.onmousedown = textEditing;
		this.diagramContainer.onselectstart = textEditing;
		this.diagramContainer.onmousedown = textEditing;
		this.sidebarContainer.onselectstart = textEditing;
		this.sidebarContainer.onmousedown = textEditing;
		this.footerContainer.onselectstart = textEditing;
		this.footerContainer.onmousedown = textEditing;
	}
	
	// And uses built-in context menu while editing
	if (mxClient.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
	{
		mxEvent.addListener(this.diagramContainer, 'contextmenu', textEditing);
	}
	else
	{
		// Allows browser context menu outside of diagram and sidebar
		this.diagramContainer.oncontextmenu = textEditing;
	}

	// Contains the main graph instance inside the given panel
	graph.init(this.diagramContainer);
	
	var textMode = false;
	var nodes = null;
	
	var updateToolbar = mxUtils.bind(this, function()
	{
		if (textMode != graph.cellEditor.isContentEditing())
		{
			var node = this.toolbar.container.firstChild;
			var newNodes = [];
			
			while (node != null)
			{
				var tmp = node.nextSibling;
				node.parentNode.removeChild(node);
				newNodes.push(node);
				node = tmp;
			}
			
			if (nodes == null)
			{
				this.toolbar.createTextToolbar();
			}
			else
			{
				for (var i = 0; i < nodes.length; i++)
				{
					this.toolbar.container.appendChild(nodes[i]);
				}
			}
			
			textMode = graph.cellEditor.isContentEditing();
			nodes = newNodes;
		}
	});

	// Control-enter applies editing value
	// FIXME: Fix for HTML editing
	var cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
	graph.cellEditor.isStopEditingEvent = function(evt)
	{
		return cellEditorIsStopEditingEvent.apply(this, arguments) ||
			(evt.keyCode == 13 && mxEvent.isControlDown(evt));
	};
	
	// Overrides cell editor to update toolbar
	var cellEditorStartEditing = graph.cellEditor.startEditing;
	graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		updateToolbar();
	};
	
	var cellEditorStopEditing = graph.cellEditor.stopEditing;
	graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		updateToolbar();
	};
	
    // Enables scrollbars and sets cursor style for the container
	graph.container.setAttribute('tabindex', '0');
   	graph.container.style.cursor = 'default';
    graph.container.style.backgroundImage = 'url(' + editor.gridImage + ')';
    graph.container.style.backgroundPosition = '-1px -1px';

	var noBackground = (mxClient.IS_IE && document.documentMode >= 9) ? 'url(' + this.editor.transparentImage + ')' : 'none';
	graph.container.style.backgroundImage = noBackground;
	var bgImg = (!graph.pageVisible && graph.isGridEnabled()) ? 'url(' + this.editor.gridImage + ')' : noBackground;
	
	if (graph.view.canvas.ownerSVGElement != null)
	{
		graph.view.canvas.ownerSVGElement.style.backgroundImage = bgImg;
	}
	else
	{
		graph.view.canvas.style.backgroundImage = bgImg;
	}
    
    graph.container.focus();
   	
	// Overrides double click handling to add the tolerance
	var graphDblClick = graph.dblClick;
	graph.dblClick = function(evt, cell)
	{
		if (cell == null)
		{
			var pt = mxUtils.convertPoint(this.container,
				mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			cell = this.getCellAt(pt.x, pt.y);
		}

		graphDblClick.call(this, evt, cell);
	};

   	// Keeps graph container focused on mouse down
   	var graphFireMouseEvent = graph.fireMouseEvent;
   	graph.fireMouseEvent = function(evtName, me, sender)
   	{
   		if (evtName == mxEvent.MOUSE_DOWN)
   		{
   			this.container.focus();
   		}
   		
   		graphFireMouseEvent.apply(this, arguments);
   	};

   	// Configures automatic expand on mouseover
	graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
	graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function(menu, cell, evt)
	{
		this.menus.createPopupMenu(menu, cell, evt);
	});
	
	// Hides context menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		graph.popupMenuHandler.hideMenu();
	}));

    // Create handler for key events
	this.keyHandler = this.createKeyHandler(editor);
    
	// Getter for key handler
	this.getKeyHandler = function()
	{
		return keyHandler;
	};
	
	// Stores the current selection for fontfamily, size and alignment and assigns it to new cells
	var currentStyle = {};
	var currentEdgeStyle = {};
	var styles = ['fontFamily', 'fontSize', 'align'];
	
	// Edge style interferes with set default edge feature, need to cleanup
	// edge insert, default edge, connect process and make it more consistent
	var edgeStyles = []; //['startArrow', 'endFill', 'endSize', 'startFill', 'startSize', 'endArrow', 'edgeStyle'];
	
	// Implements a stateful toolbar where the current values for fontFamily,
	// fontSize and alignment are applied to all new cells
	var insertHandler = function(cells, connect)
	{
		if (cells != null && cells.length == 1)
		{
			var value = graph.convertValueToString(cells[0]);
			
			// Only applies current style to cells with no value
			if (value == null || value.length == 0)
			{
				for (var j = 0; j < styles.length; j++)
				{
					var key = styles[j];
					var value = currentStyle[key];

					// Overrides existing and inherited styles
					if (value != null)
					{
						graph.setCellStyles(key, value, cells);
					}
				}
				
				if (connect && cells.length == 1 && graph.getModel().isEdge(cells[0]))
				{
					for (var j = 0; j < edgeStyles.length; j++)
					{
						var key = edgeStyles[j];
						var value = currentEdgeStyle[key];
						
						if (value != null)
						{
							graph.setCellStyles(key, value, cells);
						}
					}
				}
			}
		}
	};

	this.addListener('cellsInserted', function(sender, evt)
	{
		insertHandler(evt.getProperty('cells'), false);
	});
	
	graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
	{
		insertHandler([evt.getProperty('cell')], true);
	});
	
	this.addListener('styleChanged', function(sender, evt)
	{
		var keys = evt.getProperty('keys');
		var values = evt.getProperty('values');

		for (var i = 0; i < keys.length; i++)
		{
			if (mxUtils.indexOf(styles, keys[i]) >= 0)
			{
				currentStyle[keys[i]] = values[i];
			}
			else if (mxUtils.indexOf(edgeStyles, keys[i]) >= 0)
			{
				currentEdgeStyle[keys[i]] = values[i];
			}
		}
	});
	
	// Makes sure the current layer is visible when cells are added
	graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt)
	{
		var cells = evt.getProperty('cells');
		var parent = evt.getProperty('parent');
		
		if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length > 0)
		{
			graph.getModel().setVisible(parent, true);
		}
	});

	// Updates the editor UI after the window has been resized or the orientation changes
	// Timeout is workaround for old IE versions which have a delay for DOM client sizes.
	// Should not use delay > 0 to avoid handle multiple repaints during window resize
   	mxEvent.addListener(window, 'resize', mxUtils.bind(this, function()
   	{
   		window.setTimeout(mxUtils.bind(this, function()
   		{
   			this.refresh();
   		}), 0);
   	}));
   	
   	mxEvent.addListener(window, 'orientationchange', mxUtils.bind(this, function()
   	{
   		this.refresh();
   	}));
   	
	// Workaround for bug on iOS see
	// http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
	if (mxClient.IS_IOS && !window.navigator.standalone)
	{
	   	mxEvent.addListener(window, 'scroll', mxUtils.bind(this, function()
	   	{
	   		window.scrollTo(0, 0);
	   	}));
	}

	/**
	 * Sets the initial scrollbar locations after a file was loaded.
	 */
	this.editor.addListener('resetGraphView', mxUtils.bind(this, function()
	{
		// Timeout is a workaround for delay needed in older browsers and IE
		window.setTimeout(mxUtils.bind(this, function()
		{
			this.editor.resetScrollbars();
		}), 0);
	}));

   	// Resets UI, updates action and menu states
   	this.editor.resetGraph();
   	this.init();
   	this.open();
};

// Extends mxEventSource
mxUtils.extend(EditorUi, mxEventSource);

/**
 * Specifies the size of the split bar.
 */
EditorUi.prototype.splitSize = (mxClient.IS_TOUCH || mxClient.IS_POINTER) ? 12 : 8;

/**
 * Specifies the height of the menubar. Default is 34.
 */
EditorUi.prototype.menubarHeight = 30;

/**
 * Specifies the height of the toolbar. Default is 36.
 */
EditorUi.prototype.toolbarHeight = 34;

/**
 * Specifies the height of the footer. Default is 28.
 */
EditorUi.prototype.footerHeight = 28;

/**
 * Specifies the height of the optional sidebarFooterContainer. Default is 34.
 */
EditorUi.prototype.sidebarFooterHeight = 34;

/**
 * Specifies the height of the horizontal split bar. Default is 212.
 */
EditorUi.prototype.hsplitPosition = 204;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
EditorUi.prototype.allowAnimation = true;

/**
 * Installs the listeners to update the action states.
 */
EditorUi.prototype.init = function()
{
	// Updates action states
	this.addUndoListener();
	this.addBeforeUnloadListener();
	
	this.editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		this.updateActionStates();
	}));
	
	this.updateActionStates();
	
	// Overrides clipboard to update paste action state
	var paste = this.actions.get('paste');
	
	var updatePaste = mxUtils.bind(this, function()
	{
		paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || !mxClipboard.isEmpty());
	});
	
	var mxClipboardCut = mxClipboard.cut;
	mxClipboard.cut = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('cut');
		}
		else
		{
			mxClipboardCut.apply(this, arguments);
		}
		
		updatePaste();
	};
	
	var mxClipboardCopy = mxClipboard.copy;
	mxClipboard.copy = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('copy');
		}
		else
		{
			mxClipboardCopy.apply(this, arguments);
		}
		
		updatePaste();
	};
	
	var mxClipboardPaste = mxClipboard.paste;
	mxClipboard.paste = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('paste');
		}
		else
		{
			mxClipboardPaste.apply(this, arguments);
		}
		
		updatePaste();
	};

	// Overrides cell editor to update paste action state
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		updatePaste();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		updatePaste();
	};
	
	updatePaste();
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.isSelectionAllowed = function(evt)
{
	return mxEvent.getSource(evt).nodeName == 'SELECT';
};

/**
 * Installs dialog if browser window is closed without saving
 * This must be disabled during save and image export.
 */
EditorUi.prototype.addBeforeUnloadListener = function()
{
	// Installs dialog if browser window is closed without saving
	// This must be disabled during save and image export
	window.onbeforeunload = mxUtils.bind(this, function()
	{
		return this.onBeforeUnload();
	});
};

/**
 * Sets the onbeforeunload for the application
 */
EditorUi.prototype.onBeforeUnload = function()
{
	if (this.editor.modified)
	{
		return mxResources.get('allChangesLost');
	}
};

/**
 * Opens the current diagram via the window.opener if one exists.
 */
EditorUi.prototype.open = function()
{
	// Cross-domain window access is not allowed in FF, so if we
	// were opened from another domain then this will fail.
	try
	{
		if (window.opener != null && window.opener.openFile != null)
		{
			window.opener.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
			{
				try
				{
					var doc = mxUtils.parseXml(xml); 
					this.editor.setGraphXml(doc.documentElement);
					this.editor.setModified(false);
					this.editor.undoManager.clear();
					
					if (filename != null)
					{
						this.editor.setFilename(filename);
						this.updateDocumentTitle();
					}
					
					return;
				}
				catch (e)
				{
					mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
				}
			}));
		}
	}
	catch(e)
	{
		// ignore
	}
	
	// Fires as the last step if no file was loaded
	this.editor.graph.view.validate();
	
	// Required only in special cases where an initial file is opened
	// and the minimumGraphSize changes and CSS must be updated.
	this.editor.graph.sizeDidChange();
	this.editor.fireEvent(new mxEventObject('resetGraphView'));
};

/**
 * Updates the document title.
 */
EditorUi.prototype.updateDocumentTitle = function()
{
	var title = this.editor.getOrCreateFilename();
	
	if (this.editor.appName != null)
	{
		title += ' - ' + this.editor.appName;
	}
	
	document.title = title;
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.redo = function()
{
	if (this.editor.graph.cellEditor.isContentEditing())
	{
		document.execCommand('redo');
	}
	else
	{
		this.editor.graph.stopEditing(false);
		this.editor.undoManager.redo();
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.undo = function()
{
	if (this.editor.graph.cellEditor.isContentEditing())
	{
		document.execCommand('undo');
	}
	else
	{
		this.editor.graph.stopEditing(false);
		this.editor.undoManager.undo();
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canRedo = function()
{
	return this.editor.graph.cellEditor.isContentEditing() || this.editor.undoManager.canRedo();
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.canUndo = function()
{
	return this.editor.graph.cellEditor.isContentEditing() || this.editor.undoManager.canUndo();
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.getUrl = function(pathname)
{
	var href = (pathname != null) ? pathname : window.location.pathname;
	var parms = (href.indexOf('?') > 0) ? 1 : 0;
	
	// Removes template URL parameter for new blank diagram
	for (var key in urlParams)
	{
		if (parms == 0)
		{
			href += '?';
		}
		else
		{
			href += '&';
		}
	
		href += key + '=' + urlParams[key];
		parms++;
	}
	
	return href;
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setBackgroundColor = function(value)
{
	this.editor.graph.background = value;
	this.editor.updateGraphComponents();

	this.fireEvent(new mxEventObject('backgroundColorChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
EditorUi.prototype.setPageFormat = function(value)
{
	this.editor.graph.pageFormat = value;
	
	if (!this.editor.graph.pageVisible)
	{
		this.actions.get('pageView').funct();
	}
	else
	{
		this.editor.updateGraphComponents();
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new mxEventObject('pageFormatChanged'));
};


/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addUndoListener = function()
{
	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');
	
	var undoMgr = this.editor.undoManager;
	
    var undoListener = mxUtils.bind(this, function()
    {
    	undo.setEnabled(this.canUndo());
    	redo.setEnabled(this.canRedo());
    });

    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
	
	// Overrides cell editor to update action states
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		undoListener();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		undoListener();
	};
	
	// Updates the button states once
    undoListener();
};

/**
* Updates the states of the given toolbar items based on the selection.
*/
EditorUi.prototype.updateActionStates = function()
{
	var graph = this.editor.graph;
	var selected = !graph.isSelectionEmpty();
	var vertexSelected = false;
	var edgeSelected = false;

	var cells = graph.getSelectionCells();
	
	if (cells != null)
	{
    	for (var i = 0; i < cells.length; i++)
    	{
    		var cell = cells[i];
    		
    		if (graph.getModel().isEdge(cell))
    		{
    			edgeSelected = true;
    		}
    		
    		if (graph.getModel().isVertex(cell))
    		{
    			vertexSelected = true;
    		}
    		
    		if (edgeSelected && vertexSelected)
			{
				break;
			}
    	}
	}
	
	// Updates action states
	var actions = ['cut', 'copy', 'bold', 'italic', 'underline', 'fontColor',
	           'delete', 'duplicate', 'style', 'fillColor', 'gradientColor', 'strokeColor',
	           'backgroundColor', 'borderColor', 'toFront', 'toBack', 'dashed', 'rounded',
	           'shadow', 'tilt', 'autosize', 'collapsible', 'lockUnlock', 'editData'];
	
	for (var i = 0; i < actions.length; i++)
	{
		this.actions.get(actions[i]).setEnabled(selected);
	}
	
	this.actions.get('curved').setEnabled(edgeSelected);
	this.actions.get('rotation').setEnabled(vertexSelected);
	this.actions.get('wordWrap').setEnabled(vertexSelected);
   	this.actions.get('group').setEnabled(graph.getSelectionCount() > 1);
   	this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 &&
   			graph.getModel().getChildCount(graph.getSelectionCell()) > 0);
   	var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
   	this.actions.get('removeFromGroup').setEnabled(oneVertexSelected &&
   			graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

	// Updates menu states
	var menus = ['fontFamily', 'fontSize', 'alignment', 'position', 'text', 'format', 'linewidth',
	             'spacing', 'gradient'];

	for (var i = 0; i < menus.length; i++)
	{
		this.menus.get(menus[i]).setEnabled(selected);
	}
	
	menus = ['line', 'lineend', 'linestart'];

 	for (var i = 0; i < menus.length; i++)
 	{
 		this.menus.get(menus[i]).setEnabled(edgeSelected);
 	}
 	
   	this.actions.get('setAsDefaultEdge').setEnabled(edgeSelected);
   	var state = graph.view.getState(graph.getSelectionCell());
   	
    this.menus.get('align').setEnabled(graph.getSelectionCount() > 1);
    this.menus.get('distribute').setEnabled(graph.getSelectionCount() > 1);
    this.menus.get('direction').setEnabled(vertexSelected || (edgeSelected && state != null && graph.isLoop(state)));
    this.menus.get('navigation').setEnabled(graph.foldingEnabled && ((graph.view.currentRoot != null) ||
			(graph.getSelectionCount() == 1 && graph.isValidRoot(graph.getSelectionCell()))));
    this.actions.get('home').setEnabled(graph.view.currentRoot != null);
    this.actions.get('exitGroup').setEnabled(graph.view.currentRoot != null);
    var groupEnabled = graph.getSelectionCount() == 1 && graph.isValidRoot(graph.getSelectionCell());
    this.actions.get('enterGroup').setEnabled(groupEnabled);
    this.actions.get('expand').setEnabled(groupEnabled);
    this.actions.get('collapse').setEnabled(groupEnabled);
    this.actions.get('editLink').setEnabled(graph.getSelectionCount() == 1);
    this.actions.get('openLink').setEnabled(graph.getSelectionCount() == 1 &&
    		graph.getLinkForCell(graph.getSelectionCell()) != null);
    this.actions.get('guides').setEnabled(graph.isEnabled());
    this.actions.get('grid').setEnabled(graph.isEnabled());
};

/**
 * Refreshes the viewport.
 */
EditorUi.prototype.refresh = function()
{
	var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode == 5);
	var w = this.container.clientWidth;
	var h = this.container.clientHeight;

	if (this.container == document.body)
	{
		w = document.body.clientWidth || document.documentElement.clientWidth;
		h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
	}
	
	// Workaround for bug on iOS see
	// http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
	// FIXME: Fix if footer visible
	var off = 0;
	
	if (mxClient.IS_IOS && !window.navigator.standalone)
	{
		if (window.innerHeight != document.documentElement.clientHeight)
		{
			off = document.documentElement.clientHeight - window.innerHeight;
			window.scrollTo(0, 0);
		}
	}
	
	var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));

	var tmp = 0;
	
	if (this.menubar != null)
	{
		this.menubarContainer.style.height = this.menubarHeight + 'px';
		tmp += this.menubarHeight;
	}
	
	if (this.toolbar != null)
	{
		this.toolbarContainer.style.top = this.menubarHeight + 'px';
		this.toolbarContainer.style.height = this.toolbarHeight + 'px';
		tmp += this.toolbarHeight;
	}
	
	if (tmp > 0 && !mxClient.IS_QUIRKS)
	{
		tmp += 1;
	}
	
	var sidebarFooterHeight = 0;
	
	if (this.sidebarFooterContainer != null)
	{
		var bottom = this.footerHeight + off;
		sidebarFooterHeight = Math.max(0, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
		this.sidebarFooterContainer.style.width = effHsplitPosition + 'px';
		this.sidebarFooterContainer.style.height = sidebarFooterHeight + 'px';
		this.sidebarFooterContainer.style.bottom = bottom + 'px';
	}
	
	this.sidebarContainer.style.top = tmp + 'px';
	this.sidebarContainer.style.width = effHsplitPosition + 'px';
	
	this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + 'px' : '0px';
	this.diagramContainer.style.top = this.sidebarContainer.style.top;
	this.footerContainer.style.height = this.footerHeight + 'px';
	this.hsplit.style.top = this.sidebarContainer.style.top;
	this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
	this.hsplit.style.left = effHsplitPosition + 'px';
	
	if (quirks)
	{
		this.menubarContainer.style.width = w + 'px';
		this.toolbarContainer.style.width = this.menubarContainer.style.width;
		var sidebarHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) + 'px';
		this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(0, w - effHsplitPosition - this.splitSize) + 'px' : w + 'px';
		var diagramHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.diagramContainer.style.height = diagramHeight + 'px';
		this.footerContainer.style.width = this.menubarContainer.style.width;
		this.hsplit.style.height = diagramHeight + 'px';
	}
	else
	{
		if (this.footerHeight > 0)
		{
			this.footerContainer.style.bottom = off + 'px';
		}
		
		this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) + 'px';
		this.diagramContainer.style.bottom = (this.footerHeight + off) + 'px';
	}
	
	this.editor.graph.sizeDidChange();
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createDivs = function()
{
	this.menubarContainer = this.createDiv('geMenubarContainer');
	this.toolbarContainer = this.createDiv('geToolbarContainer');
	this.sidebarContainer = this.createDiv('geSidebarContainer');
	this.diagramContainer = this.createDiv('geDiagramContainer');
	this.footerContainer = this.createDiv('geFooterContainer');
	this.hsplit = this.createDiv('geHsplit');

	// Sets static style for containers
	this.menubarContainer.style.top = '0px';
	this.menubarContainer.style.left = '0px';
	this.menubarContainer.style.right = '0px';
	this.toolbarContainer.style.left = '0px';
	this.toolbarContainer.style.right = '0px';
	this.sidebarContainer.style.left = '0px';
	this.diagramContainer.style.right = '0px';
	this.footerContainer.style.left = '0px';
	this.footerContainer.style.right = '0px';
	this.footerContainer.style.bottom = '0px';
	this.hsplit.style.width = this.splitSize + 'px';
	
	this.sidebarFooterContainer = this.createSidebarFooterContainer();
	
	if (this.sidebarFooterContainer)
	{
		this.sidebarFooterContainer.style.left = '0px';
	}
};

/**
 * Hook for sidebar footer container. This implementation returns null.
 */
EditorUi.prototype.createSidebarFooterContainer = function()
{
	return null;
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createUi = function()
{
	// Creates menubar
	this.menubar = this.menus.createMenubar(this.createDiv('geMenubar'));
	
	if (this.menubar != null)
	{
		this.menubarContainer.appendChild(this.menubar.container);
	}
	
	// Adds status bar in menubar
	if (this.menubar != null)
	{
		this.statusContainer = this.createStatusContainer();
	
		// Connects the status bar to the editor status
		this.editor.addListener('statusChanged', mxUtils.bind(this, function()
		{
			this.setStatusText(this.editor.getStatus());
		}));
	
		this.setStatusText(this.editor.getStatus());
		this.menubar.container.appendChild(this.statusContainer);
		
		// Inserts into DOM
		this.container.appendChild(this.menubarContainer);
	}

	// Creates toolbar
	this.toolbar = this.createToolbar(this.createDiv('geToolbar'));
	
	if (this.toolbar != null)
	{
		this.toolbarContainer.appendChild(this.toolbar.container);
		this.container.appendChild(this.toolbarContainer);
	}

	// Creates the sidebar
	this.sidebar = this.createSidebar(this.sidebarContainer);
	
	if (this.sidebar != null)
	{
		this.container.appendChild(this.sidebarContainer);
	}
	
	// Creates the footer
	var footer = this.createFooter();
	
	if (footer != null)
	{
		this.footerContainer.appendChild(footer);
		this.container.appendChild(this.footerContainer);
	}

	if (this.sidebar != null && this.sidebarFooterContainer)
	{
		this.container.appendChild(this.sidebarFooterContainer);		
	}

	this.container.appendChild(this.diagramContainer);

	// HSplit
	if (this.sidebar != null)
	{
		this.container.appendChild(this.hsplit);
		
		this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function(value)
		{
			this.hsplitPosition = value;
			this.refresh();
		}));
	}
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.createStatusContainer = function()
{
	var container = document.createElement('a');
	container.className = 'geItem geStatus';
	
	return container;
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.setStatusText = function(value)
{
	this.statusContainer.innerHTML = value;
};

/**
 * Creates a new toolbar for the given container.
 */
EditorUi.prototype.createToolbar = function(container)
{
	return new Toolbar(this, container);
};

/**
 * Creates a new sidebar for the given container.
 */
EditorUi.prototype.createSidebar = function(container)
{
	return new Sidebar(this, container);
};

/**
 * Creates and returns a new footer.
 */
EditorUi.prototype.createFooter = function()
{
	return this.createDiv('geFooter');
};

/**
 * Creates the actual toolbar for the toolbar container.
 */
EditorUi.prototype.createDiv = function(classname)
{
	var elt = document.createElement('div');
	elt.className = classname;
	
	return elt;
};

/**
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addSplitHandler = function(elt, horizontal, dx, onChange)
{
	var start = null;
	var initial = null;
	var ignoreClick = true;
	var last = null;

	// Disables built-in pan and zoom in IE10 and later
	if (mxClient.IS_POINTER)
	{
		elt.style.msTouchAction = 'none';
	}
	
	var getValue = mxUtils.bind(this, function()
	{
		var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
	
		// Takes into account hidden footer
		if (!horizontal)
		{
			result = result + dx - this.footerHeight;
		}
		
		return result;
	});

	function moveHandler(evt)
	{
		if (start != null)
		{
			var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
			
			if (initial != getValue())
			{
				ignoreClick = true;
				last = null;
			}
		}
	};
	
	function dropHandler(evt)
	{
		moveHandler(evt);
		initial = null;
		start = null;
	};
	
	mxEvent.addGestureListeners(elt, function(evt)
	{
		start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		initial = getValue();
		ignoreClick = false;
		mxEvent.consume(evt);
	});
	
	mxEvent.addListener(elt, 'click', function(evt)
	{
		if (!ignoreClick)
		{
			var next = (last != null) ? last - dx : 0;
			last = getValue();
			onChange(next);
		}
	});

	mxEvent.addGestureListeners(document, null, moveHandler, dropHandler);
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose)
{
	this.editor.graph.tooltipHandler.hideTooltip();
	
	if (this.dialogs == null)
	{
		this.dialogs = [];
	}
	
	this.dialog = new Dialog(this, elt, w, h, modal, closable, onClose);
	this.dialogs.push(this.dialog);
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.hideDialog = function(cancel)
{
	if (this.dialogs != null && this.dialogs.length > 0)
	{
		var dlg = this.dialogs.pop();
		dlg.close(cancel);
		
		this.dialog = (this.dialogs.length > 0) ? this.dialogs[this.dialogs.length - 1] : null;

		if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden')
		{
			this.editor.graph.container.focus();
		}
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
EditorUi.prototype.openFile = function()
{
	// Closes dialog after open
	window.openFile = new OpenFile(mxUtils.bind(this, function(cancel)
	{
		this.hideDialog(cancel);
	}));

	// Removes openFile if dialog is closed
	this.showDialog(new OpenDialog(this).container, 360, 220, true, true, function()
	{
		window.openFile = null;
	});
};

/**
 * Adds the label menu items to the given menu and parent.
 */
EditorUi.prototype.saveFile = function(forceDialog)
{
	if (!forceDialog && this.editor.filename != null)
	{
		this.save(this.editor.getOrCreateFilename());
	}
	else
	{
		var dlg = new FilenameDialog(this, this.editor.getOrCreateFilename(), mxResources.get('save'), mxUtils.bind(this, function(name)
		{
			this.save(name, true);
		}), null, mxUtils.bind(this, function(name)
		{
			if (name != null && name.length > 0)
			{
				return true;
			}
			
			mxUtils.confirm(mxResources.get('invalidName'));
			
			return false;
		}));
		this.showDialog(dlg.container, 300, 100, true, true);
		dlg.init();
	}
};

/**
 * Saves the current graph under the given filename.
 */
EditorUi.prototype.save = function(name)
{
	if (name != null)
	{
		var xml = mxUtils.getXml(this.editor.getGraphXml());
		
		try
		{
			if (useLocalStorage)
			{
				if (localStorage.getItem(name) != null &&
					!mxUtils.confirm(mxResources.get('replace', [name])))
				{
					return;
				}

				localStorage.setItem(name, xml);
				this.editor.setStatus(mxResources.get('saved') + ' ' + new Date());
			}
			else
			{
				if (xml.length < MAX_REQUEST_SIZE)
				{
					xml = encodeURIComponent(xml);
					name = encodeURIComponent(name);
					new mxXmlRequest(SAVE_URL, 'filename=' + name + '&xml=' + xml).simulate(document, '_blank');
				}
				else
				{
					mxUtils.alert(mxResources.get('drawingTooLarge'));
					mxUtils.popup(xml);
					
					return;
				}
			}

			this.editor.setModified(false);
			this.editor.setFilename(name);
			this.updateDocumentTitle();
		}
		catch (e)
		{
			this.editor.setStatus('Error saving file');
		}
	}
};

/**
 * Executes the given layout.
 */
EditorUi.prototype.executeLayout = function(exec, animate, post)
{
	var graph = this.editor.graph;

	if (graph.isEnabled())
	{
		graph.getModel().beginUpdate();
		try
		{
			exec();
		}
		catch (e)
		{
			throw e;
		}
		finally
		{
			// Animates the changes in the graph model except
			// for Camino, where animation is too slow
			if (this.allowAnimation && animate && navigator.userAgent.indexOf('Camino') < 0)
			{
				// New API for animating graph layout results asynchronously
				var morph = new mxMorphing(graph);
				morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
				{
					graph.getModel().endUpdate();
					
					if (post != null)
					{
						post();
					}
				}));
				
				morph.startAnimation();
			}
			else
			{
				graph.getModel().endUpdate();
			}
		}
	}
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showImageDialog = function(title, value, fn)
{
	var cellEditor = this.editor.graph.cellEditor;
	var selState = cellEditor.saveSelection();
	var newValue = mxUtils.prompt(title, value);
	cellEditor.restoreSelection(selState);
	
	if (newValue != null && newValue.length > 0)
	{
		var img = new Image();
		
		img.onload = function()
		{
			fn(newValue, img.width, img.height);
		};
		img.onerror = function()
		{
			mxUtils.alert(mxResources.get('fileNotFound'));
		};
		
		img.src = newValue;
	}
};

/**
 * Hides the current menu.
 */
EditorUi.prototype.showLinkDialog = function(value, btnLabel, fn)
{
	var dlg = new LinkDialog(this, value, btnLabel, fn);
	this.showDialog(dlg.container, 320, 90, true, true);
	dlg.init();
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.confirm = function(msg, okFn, cancelFn)
{
	if (mxUtils.confirm(msg))
	{
		if (okFn != null)
		{
			okFn();
		}
	}
	else if (cancelFn != null)
	{
		cancelFn();
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createOutline = function(wnd)
{
	var outline = new mxOutline(this.editor.graph);
	outline.border = 20;

	mxEvent.addListener(window, 'resize', function()
	{
		outline.update();
	});

	return outline;
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createKeyHandler = function(editor)
{
	var graph = this.editor.graph;
    var keyHandler = new mxKeyHandler(graph);
    
    // Routes command-key to control-key on Mac
    keyHandler.isControlDown = function(evt)
    {
    	return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
    };
	
	// Helper function to move cells with the cursor keys
    function nudge(keyCode, stepSize)
    {
    	if (!graph.isSelectionEmpty() && graph.isEnabled())
		{
    		stepSize = (stepSize != null) ? stepSize : 1;
    		
    		var dx = 0;
    		var dy = 0;
    		
    		if (keyCode == 37)
			{
    			dx = -stepSize;
			}
    		else if (keyCode == 38)
    		{
    			dy = -stepSize;
    		}
    		else if (keyCode == 39)
    		{
    			dx = stepSize;
    		}
    		else if (keyCode == 40)
    		{
    			dy = stepSize;
    		}
    		
    		graph.moveCells(graph.getSelectionCells(), dx, dy);
    		graph.scrollCellToVisible(graph.getSelectionCell());
		}
    };

    // Binds keystrokes to actions
    keyHandler.bindAction = mxUtils.bind(this, function(code, control, key, shift)
    {
    	var action = this.actions.get(key);
    	
    	if (action != null)
    	{
    		var f = function()
    		{
				if (action.isEnabled())
				{
					action.funct();
				}
    		};
    		
    		if (control)
    		{
    			if (shift)
    			{
    				keyHandler.bindControlShiftKey(code, f);
    			}
    			else
    			{
    				keyHandler.bindControlKey(code, f);
    			}
    		}
    		else
    		{
    			if (shift)
    			{
    				keyHandler.bindShiftKey(code, f);
    			}
    			else
    			{
    				keyHandler.bindKey(code, f);
    			}
    		}
    	}
    });
    
    var ui = this;
    var keyHandleEscape = keyHandler.escape;
    keyHandler.escape = function(evt)
    {
    	ui.hideDialog();
    	keyHandleEscape.apply(this, arguments);
    };
    
    // Ignores enter keystroke. Remove this line if you want the
    // enter keystroke to stop editing.
    keyHandler.enter = function() {};
    keyHandler.bindControlKey(13, function() { graph.foldCells(false); }); // Ctrl+Enter
    keyHandler.bindControlKey(8, function() { graph.foldCells(true); }); // Ctrl+Backspace
    keyHandler.bindKey(33, function() { graph.exitGroup(); }); // Page Up
    keyHandler.bindKey(34, function() { graph.enterGroup(); }); // Page Down
    keyHandler.bindKey(36, function() { graph.home(); }); // Home
    keyHandler.bindKey(35, function() { graph.refresh(); }); // End
    keyHandler.bindKey(37, function() { nudge(37); }); // Left arrow
    keyHandler.bindKey(38, function() { nudge(38); }); // Up arrow
    keyHandler.bindKey(39, function() { nudge(39); }); // Right arrow
    keyHandler.bindKey(40, function() { nudge(40); }); // Down arrow
    keyHandler.bindShiftKey(37, function() { nudge(37, graph.gridSize); }); // Shift+Left arrow
    keyHandler.bindShiftKey(38, function() { nudge(38, graph.gridSize); }); // Shift+Up arrow
    keyHandler.bindShiftKey(39, function() { nudge(39, graph.gridSize); }); // Shift+Right arrow
    keyHandler.bindShiftKey(40, function() { nudge(40, graph.gridSize); }); // Shift+Down arrow
    keyHandler.bindAction(8, false, 'delete'); // Backspace
    keyHandler.bindAction(46, false, 'delete'); // Delete
    keyHandler.bindAction(82, true, 'tilt'); // Ctrl+R
    keyHandler.bindAction(83, true, 'save'); // Ctrl+S
    keyHandler.bindAction(83, true, 'saveAs', true); // Ctrl+Shift+S
    keyHandler.bindAction(107, false, 'zoomIn'); // Add
    keyHandler.bindAction(109, false, 'zoomOut'); // Subtract
    keyHandler.bindAction(65, true, 'selectAll'); // Ctrl+A
    keyHandler.bindAction(65, true, 'selectVertices', true); // Ctrl+Shift+A
    keyHandler.bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
    keyHandler.bindAction(69, true, 'style'); // Ctrl+E
    keyHandler.bindAction(66, true, 'toBack'); // Ctrl+B
    keyHandler.bindAction(70, true, 'toFront', true); // Ctrl+Shift+F
    keyHandler.bindAction(68, true, 'duplicate'); // Ctrl+D
    keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
    keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
    keyHandler.bindAction(88, true, 'cut'); // Ctrl+X
    keyHandler.bindAction(67, true, 'copy'); // Ctrl+C
    keyHandler.bindAction(81, true, 'connectionPoints'); // Ctrl+Q
    keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
    keyHandler.bindAction(71, true, 'group'); // Ctrl+G
    keyHandler.bindAction(77, true, 'editData'); // Ctrl+M
    keyHandler.bindAction(71, true, 'grid', true); // Ctrl+Shift+G
    keyHandler.bindAction(76, true, 'lockUnlock'); // Ctrl+L
    keyHandler.bindAction(76, true, 'layers', true); // Ctrl+Shift+L
    keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
    keyHandler.bindAction(80, true, 'print'); // Ctrl+P
    keyHandler.bindAction(85, true, 'ungroup'); // Ctrl+U
    keyHandler.bindAction(112, false, 'about'); // F1
    keyHandler.bindKey(113, function() { graph.startEditingAtCell(); }); // F2
    
    return keyHandler;
};
