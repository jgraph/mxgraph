/**
 * $Id: Menus.js,v 1.59 2013-01-16 08:40:17 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
Menus = function(editorUi)
{
	this.editorUi = editorUi;
	this.menus = new Object();
	this.init();
	
	// Pre-fetches checkmark image
	new Image().src = IMAGE_PATH + '/checkmark.gif';
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
	
	this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var fonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
		             'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'];

		for (var i = 0; i < fonts.length; i++)
		{
			var tr = this.styleChange(menu, fonts[i], [mxConstants.STYLE_FONTFAMILY], [fonts[i]], null, parent);
			tr.firstChild.nextSibling.style.fontFamily = fonts[i];
		}
		
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('custom'), '', mxConstants.DEFAULT_FONTFAMILY, mxConstants.STYLE_FONTFAMILY, parent);
	})));
	this.put('fontSize', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var sizes = [6, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72];
		
		for (var i = 0; i < sizes.length; i++)
		{
			this.styleChange(menu, sizes[i], [mxConstants.STYLE_FONTSIZE], [sizes[i]], null, parent);
		}

		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('custom'), '(pt)', '12', mxConstants.STYLE_FONTSIZE, parent);
	})));
	this.put('linewidth', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var sizes = [1, 2, 3, 4, 8, 12, 16, 24];
		
		for (var i = 0; i < sizes.length; i++)
		{
			this.styleChange(menu, sizes[i] + 'px', [mxConstants.STYLE_STROKEWIDTH], [sizes[i]], null, parent);
		}
		
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('custom'), '(px)', '1', mxConstants.STYLE_STROKEWIDTH, parent);
	})));
	this.put('line', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('straight'), [mxConstants.STYLE_EDGE], [null], null, parent);
		this.styleChange(menu, mxResources.get('entityRelation'), [mxConstants.STYLE_EDGE], ['entityRelationEdgeStyle'], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('horizontal'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW], ['elbowEdgeStyle', 'horizontal'], null, parent);
		this.styleChange(menu, mxResources.get('vertical'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW], ['elbowEdgeStyle', 'vertical'], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('plain'), [mxConstants.STYLE_EDGE], ['segmentEdgeStyle'], null, parent);
		this.styleChange(menu, mxResources.get('orthogonal'), [mxConstants.STYLE_EDGE], ['orthogonalEdgeStyle'], null, parent);
	})));
	this.put('lineend', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('classic'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_CLASSIC], null, parent);
		this.styleChange(menu, mxResources.get('openArrow'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_OPEN], null, parent);
		this.styleChange(menu, mxResources.get('block') , [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_BLOCK], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('oval'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_OVAL], null, parent);
		this.styleChange(menu, mxResources.get('diamond'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_DIAMOND], null, parent);
		this.styleChange(menu, mxResources.get('diamondThin'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_DIAMOND_THIN], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('none'), [mxConstants.STYLE_ENDARROW], [mxConstants.NONE], null, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('transparent'), null, function() { graph.toggleCellStyles('endFill', true); }, parent, null, true);
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('size'), '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_ENDSIZE, parent);
	})));
	this.put('linestart', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('classic'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_CLASSIC], null, parent);
		this.styleChange(menu, mxResources.get('openArrow'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_OPEN], null, parent);
		this.styleChange(menu, mxResources.get('block'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_BLOCK], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('oval'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_OVAL], null, parent);
		this.styleChange(menu, mxResources.get('diamond'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_DIAMOND], null, parent);
		this.styleChange(menu, mxResources.get('diamondThin'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_DIAMOND_THIN], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('none'), [mxConstants.STYLE_STARTARROW], [mxConstants.NONE], null, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('transparent'), null, function() { graph.toggleCellStyles('startFill', true); }, parent, null, true);
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('size'), '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_STARTSIZE, parent);
	})));
	this.put('spacing', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		// Uses shadow action and line menu to analyze selection
		var vertexSelected = this.editorUi.actions.get('shadow').enabled;
		var edgeSelected = this.get('line').enabled;
		
		if (vertexSelected || menu.showDisabled)
		{
			this.promptChange(menu, mxResources.get('top'), '(px)', '0', mxConstants.STYLE_SPACING_TOP, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('right'), '(px)', '0', mxConstants.STYLE_SPACING_RIGHT, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('bottom'), '(px)', '0', mxConstants.STYLE_SPACING_BOTTOM, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('left'), '(px)', '0', mxConstants.STYLE_SPACING_LEFT, parent, vertexSelected);
			menu.addSeparator(parent);
			this.promptChange(menu, mxResources.get('global'), '(px)', '0', mxConstants.STYLE_SPACING, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('perimeter'), '(px)', '0', mxConstants.STYLE_PERIMETER_SPACING, parent, vertexSelected);
		}

		if (edgeSelected || menu.showDisabled)
		{
			menu.addSeparator(parent);
			this.promptChange(menu, mxResources.get('sourceSpacing'), '(px)', '0', mxConstants.STYLE_SOURCE_PERIMETER_SPACING, parent, edgeSelected);
			this.promptChange(menu, mxResources.get('targetSpacing'), '(px)', '0', mxConstants.STYLE_TARGET_PERIMETER_SPACING, parent, edgeSelected);
		}
	})));
	this.put('format', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addSubmenu('spacing', menu, parent);
		this.addMenuItems(menu, ['-', 'fillColor'], parent);
		this.addSubmenu('gradient', menu, parent);
		this.addMenuItems(menu, ['-', 'shadow'], parent);
		this.promptChange(menu, mxResources.get('opacity'), '(%)', '100', mxConstants.STYLE_OPACITY, parent, this.get('format').enabled);
		this.addMenuItems(menu, ['-', 'curved', 'rounded', 'dashed', '-', 'strokeColor'], parent);
		this.addSubmenu('linewidth', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('line', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('linestart', menu, parent);
		this.addSubmenu('lineend', menu, parent);
		menu.addSeparator(parent);
		this.addMenuItem(menu, 'style', parent);
	})));
	this.put('gradient', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['gradientColor', '-'], parent);
		this.styleChange(menu, mxResources.get('north'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_NORTH], null, parent);
		this.styleChange(menu, mxResources.get('east'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_EAST], null, parent);
		this.styleChange(menu, mxResources.get('south'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_SOUTH], null, parent);
		this.styleChange(menu, mxResources.get('west'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_WEST], null, parent);
	})));
	this.put('text', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItem(menu, 'fontColor', parent);
		menu.addSeparator(parent);
		this.addSubmenu('fontFamily', menu, parent);
		this.addSubmenu('fontSize', menu, parent);
		
		this.addMenuItems(menu, ['-', 'bold', 'italic', 'underline', '-'], parent);
	    this.addSubmenu('alignment', menu, parent);
	    this.addSubmenu('position', menu, parent);
		this.addMenuItems(menu, ['-', 'backgroundColor', 'borderColor', '-'], parent);
		
		var enabled = this.get('text').enabled;
		this.promptChange(menu, mxResources.get('textOpacity'), '(%)', '100', mxConstants.STYLE_TEXT_OPACITY, parent, enabled);
		menu.addItem(mxResources.get('hide'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_NOLABEL, false); }, parent, null, enabled);
		menu.addItem(mxResources.get('rotate'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_HORIZONTAL, true); }, parent, null, enabled);
	})));
	this.put('alignment', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('leftAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], null, parent);
		this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], null, parent);
		this.styleChange(menu, mxResources.get('rightAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('topAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], null, parent);
		this.styleChange(menu, mxResources.get('middle'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottomAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], null, parent);
	})));
	this.put('position', new Menu(mxUtils.bind(this, function(menu, parent)
	{
	    this.styleChange(menu, mxResources.get('left'), [mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_RIGHT], null, parent);
	    this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER], null, parent);
	    this.styleChange(menu, mxResources.get('right'), [mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_LEFT], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('top'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP, mxConstants.ALIGN_BOTTOM], null, parent);
		this.styleChange(menu, mxResources.get('middle'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottom'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_TOP], null, parent);
	})));
	this.put('direction', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('north'), [mxConstants.STYLE_DIRECTION], [mxConstants.DIRECTION_NORTH], null, parent);
		this.styleChange(menu, mxResources.get('east'), [mxConstants.STYLE_DIRECTION], [mxConstants.DIRECTION_EAST], null, parent);
		this.styleChange(menu, mxResources.get('south'), [mxConstants.STYLE_DIRECTION], [mxConstants.DIRECTION_SOUTH], null, parent);
		this.styleChange(menu, mxResources.get('west'), [mxConstants.STYLE_DIRECTION], [mxConstants.DIRECTION_WEST], null, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('flipH'), null, function()
		{
			graph.getModel().beginUpdate();
			try
			{
				graph.toggleCellStyles(mxConstants.STYLE_STENCIL_FLIPH, false);
				graph.toggleCellStyles(mxConstants.STYLE_IMAGE_FLIPH, false);
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}, parent);
		menu.addItem(mxResources.get('flipV'), null, function()
		{
			graph.getModel().beginUpdate();
			try
			{
				graph.toggleCellStyles(mxConstants.STYLE_STENCIL_FLIPV, false);
				graph.toggleCellStyles(mxConstants.STYLE_IMAGE_FLIPV, false);
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}, parent);
		this.addMenuItem(menu, 'rotation', parent);
	})));
	this.put('align', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('leftAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_LEFT); }, parent);
		menu.addItem(mxResources.get('center'), null, function() { graph.alignCells(mxConstants.ALIGN_CENTER); }, parent);
		menu.addItem(mxResources.get('rightAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_RIGHT); }, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('topAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_TOP); }, parent);
		menu.addItem(mxResources.get('middle'), null, function() { graph.alignCells(mxConstants.ALIGN_MIDDLE); }, parent);
		menu.addItem(mxResources.get('bottomAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_BOTTOM); }, parent);
	})));
	this.put('layout', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('horizontalTree'), null, mxUtils.bind(this, function()
		{
			if (!graph.isSelectionEmpty())
			{
				var layout = new mxCompactTreeLayout(graph, true);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(layout, true, true);
			}
		}), parent);
		menu.addItem(mxResources.get('verticalTree'), null, mxUtils.bind(this, function()
		{
			if (!graph.isSelectionEmpty())
			{
				var layout = new mxCompactTreeLayout(graph, false);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(layout, true, true);
			}
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('horizontalFlow'), null, mxUtils.bind(this, function()
		{
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
			this.editorUi.executeLayout(layout, true, true);
		}), parent);
		menu.addItem(mxResources.get('verticalFlow'), null, mxUtils.bind(this, function()
		{
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
			this.editorUi.executeLayout(layout, true, true);
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('organic'), null, mxUtils.bind(this, function()
		{
			var layout = new mxFastOrganicLayout(graph);
    		this.editorUi.executeLayout(layout, true, true);
		}), parent);
		menu.addItem(mxResources.get('circle'), null, mxUtils.bind(this, function()
		{
			var layout = new mxCircleLayout(graph);
    		this.editorUi.executeLayout(layout, true, true, graph.getSelectionCells());
		}), parent);
	})));
	this.put('navigation', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['home', '-', 'exitGroup', 'enterGroup', '-', 'expand', 'collapse'], parent);
	})));
	this.put('arrange', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['toFront', 'toBack', '-'], parent);
		this.addSubmenu('direction', menu, parent);
		this.addSubmenu('layout', menu, parent);
		this.addSubmenu('align', menu, parent);
		menu.addSeparator(parent);
		this.addSubmenu('navigation', menu, parent);
		this.addMenuItems(menu, ['-', 'group', 'ungroup', 'removeFromGroup', '-', 'autosize', 'rotate'], parent);
	})));
	this.put('view', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['actualSize'], parent);
		menu.addSeparator();
		var scales = [0.25, 0.5, 0.75, 1, 2, 4];
		
		for (var i = 0; i < scales.length; i++)
		{
			(function(scale)
			{
				menu.addItem((scale * 100) + '%', null, function()
				{
					graph.zoomTo(scale);
				}, parent);
			})(scales[i]);
		}
		
		this.addMenuItems(menu, ['-', 'zoomIn', 'zoomOut', '-', 'fitWindow', 'customZoom', '-', 'fitPage', 'fitPageWidth'], parent);
	})));
	this.put('file', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['new', 'open', '-', 'save', 'saveAs', '-', 'import', 'export', '-', 'editFile', 'pageSetup', '-', 'print'], parent);
	})));
	this.put('edit', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste', 'delete', '-', 'duplicate', '-',
		                         'editLink', 'openLink', '-',
		                         'selectVertices', 'selectEdges', 'selectAll', '-', 'setAsDefaultEdge']);
	})));
	this.put('options', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['grid', 'guides', 'tooltips', '-', 'connect', 'copyConnect', 'navigation',
		                         'scrollbars', '-', 'pageView', '-', 'pageBackgroundColor']);
	})));
	this.put('help', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['help', '-', 'about']);
	})));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.put = function(name, menu)
{
	this.menus[name] = menu;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.get = function(name)
{
	return this.menus[name];
};

/**
 * Adds the given submenu.
 */
Menus.prototype.addSubmenu = function(name, menu, parent)
{
	var enabled = this.get(name).enabled;
	
	if (menu.showDisabled || enabled)
	{
		var submenu = menu.addItem(mxResources.get(name), null, null, parent, null, enabled);
		this.addMenu(name, menu, submenu);
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.addMenu = function(name, popupMenu, parent)
{
	var menu = this.get(name);
	
	if (menu != null && (popupMenu.showDisabled || menu.enabled))
	{
		this.get(name).execute(popupMenu, parent);
	}
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.styleChange = function(menu, label, keys, values, sprite, parent)
{
	return menu.addItem(label, null, mxUtils.bind(this, function()
	{
		var graph = this.editorUi.editor.graph;
		
		graph.getModel().beginUpdate();
		try
		{
			for (var i = 0; i < keys.length; i++)
			{
				graph.setCellStyles(keys[i], values[i]);
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}), parent, sprite);
};

/**
 * Adds a style change item with a prompt to the given menu.
 */
Menus.prototype.promptChange = function(menu, label, hint, defaultValue, key, parent, enabled)
{
	return menu.addItem(label, null, mxUtils.bind(this, function()
	{
		var graph = this.editorUi.editor.graph;
		var value = defaultValue;
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		value = state.style[key] || value;
    	}
		
		value = mxUtils.prompt(mxResources.get('enterValue') + ((hint.length > 0) ? (' ' + hint) : ''), value);

    	if (value != null && value.length > 0)
    	{
        	graph.setCellStyles(key, value);
        }
	}), parent, null, enabled);
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.pickColor = function(key)
{
	if (this.colorDialog == null)
	{
		this.colorDialog = new ColorDialog(this.editorUi);
	}

	this.colorDialog.currentColorKey = key;
	var graph = this.editorUi.editor.graph;
	var state = graph.getView().getState(graph.getSelectionCell());
	var color = 'none';
	
	if (state != null)
	{
		color = state.style[key] || color;
	}
	
	if (color == 'none')
	{
		color = 'ffffff';
		this.colorDialog.picker.fromString('ffffff');
		this.colorDialog.colorInput.value = 'none';
	}
	else
	{
		this.colorDialog.picker.fromString(color);
	}

	this.editorUi.showDialog(this.colorDialog.container, 220, 400, true, false);
	
	if (!mxClient.IS_TOUCH)
	{
		this.colorDialog.colorInput.focus();
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItem = function(menu, key, parent)
{
	var action = this.editorUi.actions.get(key);

	if (action != null && (menu.showDisabled || action.enabled))
	{
		var item = menu.addItem(action.label, null, action.funct, parent, null, action.enabled);
		
		// Adds checkmark image
		if (action.toggleAction && action.isSelected())
		{
			this.addCheckmark(item);
		}

		this.addShortcut(item, action);
		
		return item;
	}
	
	return null;
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addShortcut = function(item, action)
{
	if (action.shortcut != null)
	{
		var td = item.firstChild.nextSibling.nextSibling;
		var span = document.createElement('span');
		span.style.color = 'gray';
		mxUtils.write(span, action.shortcut);
		td.appendChild(span);
	}
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addCheckmark = function(item)
{
	var td = item.firstChild.nextSibling;
	td.style.backgroundImage = 'url(' + IMAGE_PATH + '/checkmark.gif)';
	td.style.backgroundRepeat = 'no-repeat';
	td.style.backgroundPosition = '2px 50%';
	td.style.width = '20px';
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItems = function(menu, keys, parent)
{
	for (var i = 0; i < keys.length; i++)
	{
		if (keys[i] == '-')
		{
			menu.addSeparator(parent);
		}
		else
		{
			this.addMenuItem(menu, keys[i], parent);
		}
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createPopupMenu = function(menu, cell, evt)
{
	var graph = this.editorUi.editor.graph;
	menu.smartSeparators = true;
	
	if (graph.isSelectionEmpty())
	{
		this.addMenuItems(menu, ['undo', 'redo', '-', 'paste', '-']);	
	}
	else
	{
		this.addMenuItems(menu, ['delete', '-', 'cut', 'copy', '-', 'duplicate', '-']);	
	}
	
	if (graph.getSelectionCount() > 0)
	{		
		this.addMenuItems(menu, ['toFront', 'toBack', '-']);
		this.addSubmenu('linewidth', menu);

		if (graph.getModel().isEdge(graph.getSelectionCell()))
		{
			this.addSubmenu('line', menu);
			menu.addSeparator();
			this.addSubmenu('linestart', menu);
			this.addSubmenu('lineend', menu);
			menu.addSeparator();
			this.addMenuItems(menu, ['setAsDefaultEdge']);
		}
		else if (graph.getSelectionCount() > 1)	
		{
			menu.addSeparator();
			this.addMenuItems(menu, ['group']);
		}
		else
		{
			
			menu.addSeparator();
			this.addSubmenu('layout', menu);
		}
		
		menu.addSeparator();
		
		if (graph.getSelectionCount() == 1)
		{
			this.addMenuItems(menu, ['editLink']);
			
			var link = graph.getLinkForCell(graph.getSelectionCell());
			
			if (link != null)
			{
				this.addMenuItems(menu, ['openLink']);
			}
		}
	}
	else
	{
		this.addMenuItems(menu, ['-', 'selectVertices', 'selectEdges', '-', 'selectAll']);
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createMenubar = function(container)
{
	var menubar = new Menubar(this.editorUi, container);
	var menus = ['file', 'edit', 'view', 'format', 'text', 'arrange', 'options', 'help'];
	
	for (var i = 0; i < menus.length; i++)
	{
		menubar.addMenu(mxResources.get(menus[i]), this.get(menus[i]).funct);
	}

	return menubar;
};

/**
 * Construcs a new menubar for the given editor.
 */
function Menubar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	
	// Global handler to hide the current menu
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	mxEvent.addListener(document, md, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Adds the menubar elements.
 */
Menubar.prototype.hideMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
	}
};

/**
 * Adds a submenu to this menubar.
 */
Menubar.prototype.addMenu = function(label, funct)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	mxUtils.write(elt, label);

	this.addMenuHandler(elt, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menubar.prototype.addMenuHandler = function(elt, funct)
{
	if (funct != null)
	{
		var show = true;
		
		var clickHandler = mxUtils.bind(this, function(evt)
		{
			if (show && elt.enabled == null || elt.enabled)
			{
				this.editorUi.editor.graph.panningHandler.hideMenu();
				var menu = new mxPopupMenu(funct);
				menu.div.className += ' geMenubarMenu';
				menu.smartSeparators = true;
				menu.showDisabled = true;
				menu.autoExpand = true;
				
				// Disables autoexpand and destroys menu when hidden
				menu.hideMenu = mxUtils.bind(this, function()
				{
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					menu.destroy();
					this.currentMenu = null;
					this.currentElt = null;
				});

				menu.popup(elt.offsetLeft + 4, elt.offsetTop + elt.offsetHeight + 4, null, evt);
				this.currentMenu = menu;
				this.currentElt = elt;
			}
			
			show = true;
			mxEvent.consume(evt);
		});
		
		// Shows menu automatically while in expanded state
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt)
		{
			if (this.currentMenu != null && this.currentElt != elt)
			{
				this.hideMenu();
				clickHandler(evt);
			}
		}));

		// Hides menu if already showing
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function()
		{
			show = this.currentElt != elt;
		}));
		
		mxEvent.addListener(elt, 'click', clickHandler);
	}
};

/**
 * Constructs a new action for the given parameters.
 */
function Menu(funct, enabled)
{
	mxEventSource.call(this);
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
};

// Menu inherits from mxEventSource
mxUtils.extend(Menu, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.execute = function(menu, parent)
{
	this.funct(menu, parent);
};
