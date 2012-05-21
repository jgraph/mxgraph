/**
 * $Id: Toolbar.js,v 1.9 2012-03-30 07:54:40 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new toolbar for the given editor.
 */
function Toolbar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();

	// Global handler to hide the current menu
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	mxEvent.addListener(document, md, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.init = function()
{
	this.addItems(['print', 'undo', 'redo', 'delete', '-', 'actualSize', 'zoomIn', 'zoomOut', '-']);
	var fontElt = this.addMenu('Helvetica', mxResources.get('fontFamily'), true, 'fontFamily');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	fontElt.style.width = '70px';
	this.addSeparator();
	var sizeElt = this.addMenu('12', mxResources.get('fontSize'), true, 'fontSize');
	fontElt.style.whiteSpace = 'nowrap';
	sizeElt.style.overflow = 'hidden';
	sizeElt.style.width = '30px';

	this.addItems(['-', 'bold', 'italic', 'underline']);
	var align = this.addMenuFunction('sprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'icon sprite sprite-left', null).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'icon sprite sprite-center', null).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'icon sprite sprite-right', null).setAttribute('title', mxResources.get('right'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], 'icon sprite sprite-top', null).setAttribute('title', mxResources.get('top'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], 'icon sprite sprite-middle', null).setAttribute('title', mxResources.get('middle'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], 'icon sprite sprite-bottom', null).setAttribute('title', mxResources.get('bottom'));
	}));
	this.addItems(['fontColor', '-', 'strokeColor', 'image', 'fillColor']);
	this.addItem('sprite-gradientcolor', 'gradientColor').setAttribute('title', mxResources.get('gradient'));
	this.addItems(['shadow']);
	
	var graph = this.editorUi.editor.graph;

	// Update font size and font family labels
	var update = mxUtils.bind(this, function()
	{
		var ff = 'Helvetica';
		var fs = '12';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		ff = state.style[mxConstants.STYLE_FONTFAMILY] || ff;
    		fs = state.style[mxConstants.STYLE_FONTSIZE] || fs;
    		
    		if (ff.length > 10)
    		{
    			ff = ff.substring(0, 8) + '...';
    		}
    		
    		fontElt.innerHTML = ff;
    		sizeElt.innerHTML = fs;
    	}
	});
	
    graph.getSelectionModel().addListener(mxEvent.CHANGE, update);
    graph.getModel().addListener(mxEvent.CHANGE, update);
	
	// Updates button states
	this.addSelectionHandler([align]);
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.hideMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
		this.currentMenu.destroy();
		this.currentMenu = null;
	}
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name)
{
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, menu.funct);
	
	menu.addListener('stateChanged', function()
	{
		elt.setEnabled(menu.enabled);
	});

	return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct)
{
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function()
{
	var elt = document.createElement('div');
	elt.className = 'separator';
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function(keys)
{
	for (var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		
		if (key == '-')
		{
			this.addSeparator();
		}
		else
		{
			this.addItem('sprite-' + key.toLowerCase(), key);
		}
	}
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function(sprite, key)
{
	var action = this.editorUi.actions.get(key);
	var elt = null;
	
	if (action != null)
	{
		elt = this.addButton(sprite, action.label, action.funct);
		elt.setEnabled(action.enabled);
		
		action.addListener('stateChanged', function()
		{
			elt.setEnabled(action.enabled);
		});
	}
	
	return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function(classname, tooltip, funct)
{
	var elt = this.createButton(classname);
	
	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
Toolbar.prototype.addSelectionHandler = function(items)
{
	var graph = this.editorUi.editor.graph;
	
	var selectionListener = function()
    {
    	var selected = !graph.isSelectionEmpty();
    	
    	for (var i = 0; i < items.length; i++)
    	{
    		items[i].setEnabled(selected);
    	}
    };
	    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);
    selectionListener();
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function(elt, tooltip)
{
	elt.setAttribute('tabindex', '0');
	
	// Adds tooltip
	if (tooltip != null)
	{
		elt.setAttribute('title', tooltip);
	}

	this.addEnabledState(elt);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addEnabledState = function(elt)
{
	var classname = elt.className;
	
	elt.setEnabled = function(value)
	{
		elt.enabled = value;
		
		if (value)
		{
			elt.className = classname;
		}
		else
		{
			elt.className = classname + ' disabled';
		}
	};
	
	elt.setEnabled(true);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addClickHandler = function(elt, funct)
{
	if (funct != null)
	{
		mxEvent.addListener(elt, 'click', function(evt)
		{
			if (elt.enabled)
			{
				funct(evt);
			}
			
			mxEvent.consume(evt);
		});
	}
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function(classname)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'button';

	var inner = document.createElement('div');
	inner.className = 'sprite ' + classname;
	elt.appendChild(inner);
	
	return elt;
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createLabel = function(label, tooltip)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'label';
	mxUtils.write(elt, label);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.addMenuHandler = function(elt, showLabels, funct, showAll)
{
	if (funct != null)
	{
		var graph = this.editorUi.editor.graph;
		var menu = null;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			if (elt.enabled == null || elt.enabled)
			{
				graph.panningHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' toolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;

				menu.popup(elt.offsetLeft, elt.offsetTop + elt.offsetHeight + 34, null, evt);
				this.currentMenu = menu;
			}
			
			mxEvent.consume(evt);
		}));
	}
};
