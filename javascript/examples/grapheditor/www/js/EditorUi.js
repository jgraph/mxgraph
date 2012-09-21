/**
 * $Id: EditorUi.js,v 1.54 2012-09-14 08:16:18 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
EditorUi = function(editor, container)
{
	this.editor = editor || new Editor();
	this.container = container || document.body;
	var graph = editor.graph;

	// Disables scrollbars
	this.container.style.overflow = 'hidden';

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
		
		return graph.isEditing() || this.dialog != null;
	});

	// Disables text selection while not editing and no dialog visible
	if (this.container == document.body)
	{
		document.onselectstart = textEditing;
		document.onmousedown = textEditing;
	}
	
	// And uses built-in context menu while editing
	if (mxClient.IS_IE && document.documentMode != 9)
	{
		mxEvent.addListener(this.container, 'contextmenu', textEditing);
	}
	else
	{
		this.container.oncontextmenu = textEditing;
	}

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
	this.refresh();
	this.createUi();

	// Contains the main graph instance inside the given panel
	graph.init(this.diagramContainer);
	graph.refresh();
    
    // Enables scrollbars and sets cursor style for the container
	graph.container.setAttribute('tabindex', '0');
   	graph.container.style.overflow = (touchStyle) ? 'hidden' : 'auto';
   	graph.container.style.cursor = 'default';
    graph.container.style.backgroundImage = 'url(' + IMAGE_PATH + '/grid.gif)';
   	graph.container.focus();
   	
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
	graph.panningHandler.autoExpand = true;

    // Installs context menu
	graph.panningHandler.factoryMethod = mxUtils.bind(this, function(menu, cell, evt)
	{
		this.menus.createPopupMenu(menu, cell, evt);
	});
	
	// Initializes the outline
	editor.outline.init(this.outlineContainer);
	
	// Hides context menu
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	mxEvent.addListener(document, md, mxUtils.bind(this, function(evt)
	{
		graph.panningHandler.hideMenu();
	}));

	// Adds gesture handling (pinch to zoom)
	if (mxClient.IS_TOUCH)
	{
		mxEvent.addListener(graph.container, 'gesturechange',
			mxUtils.bind(this, function(evt)
			{
				graph.view.getDrawPane().setAttribute('transform', 'scale(' + evt.scale + ')');
				graph.view.getOverlayPane().style.visibility = 'hidden';
			})
		);
	
		mxEvent.addListener(graph.container, 'gestureend',
			mxUtils.bind(this, function(evt)
			{
				graph.view.getDrawPane().removeAttribute('transform');
				graph.zoomToCenter = true;
				graph.zoom(evt.scale);
				graph.view.getOverlayPane().style.visibility = 'visible';
			})
		);
	}
	
    // Create handler for key events
	var keyHandler = this.createKeyHandler(editor);
    
	// Getter for key handler
	this.getKeyHandler = function()
	{
		return keyHandler;
	};

	// Shows dialog if changes are lost
	window.onbeforeunload = function()
	{
		if (editor.modified)
		{
			return mxResources.get('allChangesLost');
		}
	};

	// Updates the editor UI after the window has been resized
   	mxEvent.addListener(window, 'resize', mxUtils.bind(this, function()
   	{
   		this.refresh();
   		graph.sizeDidChange();
   		this.editor.outline.update(false);
   		this.editor.outline.outline.sizeDidChange();
   	}));

	// Updates action and menu states
   	this.init();
   	this.open();
};

/**
 * Specifies the size of the split bar.
 */
EditorUi.prototype.splitSize = (mxClient.IS_TOUCH) ? 16 : 8;

/**
 * Specifies the height of the menubar. Default is 34.
 */
EditorUi.prototype.menubarHeight = 34;

/**
 * Specifies the height of the toolbar. Default is 46.
 */
EditorUi.prototype.toolbarHeight = 46;

/**
 * Specifies the height of the footer. Default is 28.
 */
EditorUi.prototype.footerHeight = 28;

/**
 * Specifies the position of the horizontal split bar. Default is 190.
 */
EditorUi.prototype.hsplitPosition = 190;

/**
 * Specifies the position of the vertical split bar. Default is 190.
 */
EditorUi.prototype.vsplitPosition = 190;

/**
 * Installs the listeners to update the action states.
 */
EditorUi.prototype.init = function()
{
	// Updates action states
	this.addUndoListener();
	this.addSelectionListener();

	// Overrides clipboard to update paste action state
	var paste = this.actions.get('paste');
	
	var updatePaste = function()
	{
		paste.setEnabled(!mxClipboard.isEmpty());
	};
	
	var mxClipboardCut = mxClipboard.cut;
	mxClipboard.cut = function()
	{
		mxClipboardCut.apply(this, arguments);
		updatePaste();
	};
	
	var mxClipboardCopy = mxClipboard.copy;
	mxClipboard.copy = function()
	{
		mxClipboardCopy.apply(this, arguments);
		updatePaste();
	};
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
EditorUi.prototype.isSelectionAllowed = function(evt)
{
	return false;
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
					this.editor.modified = false;
					this.editor.undoManager.clear();
					
					if (filename != null)
					{
						this.editor.filename = filename;
					}
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
				this.editor.setStatus(mxResources.get('saved'));
			}
			else
			{
				if (xml.length < MAX_REQUEST_SIZE)
				{
					xml = encodeURIComponent(xml);
					new mxXmlRequest(SAVE_URL, 'filename=' + name + '&xml=' + xml).simulate(document, "_blank");
				}
				else
				{
					mxUtils.alert(mxResources.get('drawingTooLarge'));
					mxUtils.popup(xml);
					
					return;
				}
			}

			this.editor.filename = name;
			this.editor.modified = false;
		}
		catch (e)
		{
			this.editor.setStatus('Error saving file');
		}
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
EditorUi.prototype.getUrl = function(pathname)
{
	var href = (pathname != null) ? pathname : window.location.pathname;
	var parms = (pathname.indexOf('?') > 0) ? 1 : 0;
	
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
 * Updates the states of the given undo/redo items.
 */
EditorUi.prototype.addUndoListener = function()
{
	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');
	
	var undoMgr = this.editor.undoManager;
	
    var undoListener = function()
    {
    	undo.setEnabled(undoMgr.canUndo());
    	redo.setEnabled(undoMgr.canRedo());
    };

    undoMgr.addListener(mxEvent.ADD, undoListener);
    undoMgr.addListener(mxEvent.UNDO, undoListener);
    undoMgr.addListener(mxEvent.REDO, undoListener);
    undoMgr.addListener(mxEvent.CLEAR, undoListener);
	
	// Updates the button states once
    undoListener();
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
EditorUi.prototype.addSelectionListener = function()
{
	var selectionListener = mxUtils.bind(this, function()
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
		var actions = ['cut', 'copy', 'delete', 'duplicate', 'bold', 'italic', 'style', 'fillColor',
		               'gradientColor', 'underline', 'fontColor', 'strokeColor', 'backgroundColor',
		               'borderColor', 'toFront', 'toBack', 'dashed', 'rounded', 'shadow', 'rotate',
		               'autosize'];
    	
    	for (var i = 0; i < actions.length; i++)
    	{
    		this.actions.get(actions[i]).setEnabled(selected);
    	}
    	
    	this.actions.get('rotation').setEnabled(vertexSelected);
       	this.actions.get('group').setEnabled(graph.getSelectionCount() > 1);
       	this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 &&
       			graph.getModel().getChildCount(graph.getSelectionCell()) > 0);
       	var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
       	this.actions.get('removeFromGroup').setEnabled(oneVertexSelected &&
       			graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

    	// Updates menu states
    	var menus = ['fontFamily', 'fontSize', 'alignment', 'position', 'text', 'format',
    	    'arrange', 'linewidth', 'spacing', 'gradient'];

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
        	
        this.menus.get('align').setEnabled(graph.getSelectionCount() > 1);
        this.menus.get('direction').setEnabled(vertexSelected || (edgeSelected &&
        		graph.isLoop(graph.view.getState(graph.getSelectionCell()))));
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
    });
	    
    this.editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);
    selectionListener();
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
	
	var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));
	var effVsplitPosition = Math.max(0, Math.min(this.vsplitPosition, h - this.menubarHeight - this.toolbarHeight - this.footerHeight - this.splitSize - 1));
	
	this.menubarContainer.style.height = this.menubarHeight + 'px';
	this.toolbarContainer.style.top = this.menubarHeight + 'px';
	this.toolbarContainer.style.height = this.toolbarHeight + 'px';
	this.sidebarContainer.style.top = (this.menubarHeight + this.toolbarHeight) + 'px';
	this.sidebarContainer.style.width = effHsplitPosition + 'px';
	this.outlineContainer.style.width = effHsplitPosition + 'px';
	this.outlineContainer.style.height = effVsplitPosition + 'px';
	this.outlineContainer.style.bottom = this.footerHeight + 'px';
	this.diagramContainer.style.left = (effHsplitPosition + this.splitSize) + 'px';
	this.diagramContainer.style.top = this.sidebarContainer.style.top;
	this.footerContainer.style.height = this.footerHeight + 'px';
	this.hsplit.style.top = this.sidebarContainer.style.top;
	this.hsplit.style.bottom = this.outlineContainer.style.bottom;
	this.hsplit.style.left = effHsplitPosition + 'px';
	this.vsplit.style.width = this.sidebarContainer.style.width;
	this.vsplit.style.bottom = (effVsplitPosition + this.footerHeight) + 'px';
	
	if (quirks)
	{
		this.menubarContainer.style.width = w + 'px';
		this.toolbarContainer.style.width = this.menubarContainer.style.width;
		var sidebarHeight = (h - effVsplitPosition - this.splitSize - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.sidebarContainer.style.height = sidebarHeight + 'px';
		this.diagramContainer.style.width = (w - effHsplitPosition - this.splitSize) + 'px';
		var diagramHeight = (h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.diagramContainer.style.height = diagramHeight + 'px';
		this.footerContainer.style.width = this.menubarContainer.style.width;
		this.hsplit.style.height = diagramHeight + 'px';
	}
	else
	{
		this.sidebarContainer.style.bottom = (effVsplitPosition + this.splitSize + this.footerHeight) + 'px';
		this.diagramContainer.style.bottom = this.outlineContainer.style.bottom;
	}
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createDivs = function()
{
	this.menubarContainer = this.createDiv('geMenubarContainer');
	this.toolbarContainer = this.createDiv('geToolbarContainer');
	this.sidebarContainer = this.createDiv('geSidebarContainer');
	this.outlineContainer = this.createDiv('geOutlineContainer');
	this.diagramContainer = this.createDiv('geDiagramContainer');
	this.footerContainer = this.createDiv('geFooterContainer');
	this.hsplit = this.createDiv('geHsplit');
	this.vsplit = this.createDiv('geVsplit');

	// Sets static style for containers
	this.menubarContainer.style.top = '0px';
	this.menubarContainer.style.left = '0px';
	this.menubarContainer.style.right = '0px';
	this.toolbarContainer.style.left = '0px';
	this.toolbarContainer.style.right = '0px';
	this.sidebarContainer.style.left = '0px';
	this.outlineContainer.style.left = '0px';
	this.diagramContainer.style.right = '0px';
	this.footerContainer.style.left = '0px';
	this.footerContainer.style.right = '0px';
	this.footerContainer.style.bottom = '0px';
	this.vsplit.style.left = '0px';
	this.vsplit.style.height = this.splitSize + 'px';
	this.hsplit.style.width = this.splitSize + 'px';
};

/**
 * Creates the required containers.
 */
EditorUi.prototype.createUi = function()
{
	// Creates menubar
	this.menubar = this.menus.createMenubar(this.createDiv('geMenubar'));
	this.menubarContainer.appendChild(this.menubar.container);
	
	// Creates toolbar
	this.toolbar = this.createToolbar(this.createDiv('geToolbar'));
	this.toolbarContainer.appendChild(this.toolbar.container);
	
	// Creates the sidebar
	this.sidebar = this.createSidebar(this.sidebarContainer);

	// Creates the footer
	this.footerContainer.appendChild(this.createFooter());

	// Adds status bar in menubar
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
	this.container.appendChild(this.toolbarContainer);
	this.container.appendChild(this.sidebarContainer);
	this.container.appendChild(this.outlineContainer);
	this.container.appendChild(this.diagramContainer);
	this.container.appendChild(this.footerContainer);
	this.container.appendChild(this.hsplit);
	this.container.appendChild(this.vsplit);
	
	// HSplit
	this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function(value)
	{
		this.hsplitPosition = value;
		this.refresh();
		this.editor.graph.sizeDidChange();
		this.editor.outline.update(false);
		this.editor.outline.outline.sizeDidChange();
	}));

	// VSplit
	this.addSplitHandler(this.vsplit, false, this.footerHeight, mxUtils.bind(this, function(value)
	{
		this.vsplitPosition = value;
		this.refresh();
		this.editor.outline.update(false);
		this.editor.outline.outline.sizeDidChange();
	}));
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
	
	function getValue()
	{
		return parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
	}

	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
	var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';
	
	mxEvent.addListener(elt, md, function(evt)
	{
		start = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		initial = getValue();
		mxEvent.consume(evt);
	});
	
	function moveHandler(evt)
	{
		if (start != null)
		{
			var pt = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
			onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
			mxEvent.consume(evt);
		}
	}
	
	mxEvent.addListener(document, mm, moveHandler);
	
	mxEvent.addListener(document, mu, function(evt)
	{
		moveHandler(evt);
		start = null;
		initial = null;
	});
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose)
{
	this.hideDialog();
	this.dialog = new Dialog(this, elt, w, (mxClient.IS_VML) ? h - 12 : h, modal, closable, onClose);
};

/**
 * Displays a print dialog.
 */
EditorUi.prototype.hideDialog = function()
{
	if (this.dialog != null)
	{
		this.dialog.close();
		this.dialog = null;
		this.editor.graph.container.focus();
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
EditorUi.prototype.openFile = function()
{
	// Closes dialog after open
	window.openFile = new OpenFile(mxUtils.bind(this, function()
	{
		this.hideDialog();
	}));

	// Removes openFile if dialog is closed
	this.showDialog(new OpenDialog(this).container, 300, 180, true, true, function()
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
		this.showDialog(new SaveDialog(this).container, 300, 100, true, true);
	}
};

/**
 * Executes the given layout.
 */
EditorUi.prototype.executeLayout = function(layout, animate, ignoreChildCount)
{
	var graph = this.editor.graph;
	var cell = graph.getSelectionCell();

	graph.getModel().beginUpdate();
	try
	{
		layout.execute(graph.getDefaultParent(), cell);
	}
	catch (e)
	{
		throw e;
	}
	finally
	{
		// Animates the changes in the graph model except
		// for Camino, where animation is too slow
		if (animate && navigator.userAgent.indexOf('Camino') < 0)
		{
			// New API for animating graph layout results asynchronously
			var morph = new mxMorphing(graph);
			morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
			{
				graph.getModel().endUpdate();
			}));
			
			morph.startAnimation();
		}
		else
		{
			graph.getModel().endUpdate();
		}
	}
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
    function nudge(keyCode)
    {
    	if (!graph.isSelectionEmpty())
		{
    		var dx = 0;
    		var dy = 0;
    		
    		if (keyCode == 37)
			{
    			dx = -1;
			}
    		else if (keyCode == 38)
    		{
    			dy = -1;
    		}
    		else if (keyCode == 39)
    		{
    			dx = 1;
    		}
    		else if (keyCode == 40)
    		{
    			dy = 1;
    		}
    		
    		graph.moveCells(graph.getSelectionCells(), dx, dy);
    		graph.scrollCellVisible(graph.getSelectionCell());
		}
    };

    // Binds keystrokes to actions
    var bindAction = mxUtils.bind(this, function(code, control, key, shift)
    {
    	var action = this.actions.get(key);
    	
    	if (action != null)
    	{
    		var f = function()
    		{
				if (action.enabled)
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
    keyHandler.bindKey(8, function() { graph.foldCells(true); }); // Backspace
    keyHandler.bindKey(13, function() { graph.foldCells(false); }); // Enter
    keyHandler.bindKey(33, function() { graph.exitGroup(); }); // Page Up
    keyHandler.bindKey(34, function() { graph.enterGroup(); }); // Page Down
    keyHandler.bindKey(36, function() { graph.home(); }); // Home
    keyHandler.bindKey(35, function() { graph.refresh(); }); // End
    keyHandler.bindKey(37, function() { nudge(37); }); // Left arrow
    keyHandler.bindKey(38, function() { nudge(38); }); // Up arrow
    keyHandler.bindKey(39, function() { nudge(39); }); // Right arrow
    keyHandler.bindKey(40, function() { nudge(40); }); // Down arrow
    keyHandler.bindKey(113, function() { graph.startEditingAtCell(); });
    bindAction(46, false, 'delete'); // Delete
    bindAction(82, true, 'rotate'); // Ctrl+R
    bindAction(83, true, 'save'); // Ctrl+S
    bindAction(83, true, 'saveAs', true); // Ctrl+Shift+S
    bindAction(107, false, 'zoomIn'); // Add
    bindAction(109, false, 'zoomOut'); // Subtract
    bindAction(65, true, 'selectAll'); // Ctrl+A
    bindAction(86, true, 'selectVertices', true); // Ctrl+Shift+V
    bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
    bindAction(69, true, 'export'); // Ctrl+Shift+E
    bindAction(66, true, 'toBack'); // Ctrl+B
    bindAction(70, true, 'toFront'); // Ctrl+F
    bindAction(68, true, 'duplicate'); // Ctrl+D
    bindAction(90, true, 'undo'); // Ctrl+Z
    bindAction(89, true, 'redo'); // Ctrl+Y
    bindAction(88, true, 'cut'); // Ctrl+X
    bindAction(67, true, 'copy'); // Ctrl+C
    bindAction(81, true, 'connect'); // Ctrl+Q
    bindAction(86, true, 'paste'); // Ctrl+V
    bindAction(71, true, 'group'); // Ctrl+G
    bindAction(71, true, 'grid', true); // Ctrl+Shift+G
    bindAction(85, true, 'ungroup'); // Ctrl+U
    bindAction(112, false, 'about'); // F1
    
    return keyHandler;
};
