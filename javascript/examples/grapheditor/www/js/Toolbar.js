/**
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
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.selectedBackground = '#d0d0d0';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.unselectedBackground = 'none';

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.init = function()
{
	this.addItems(['undo', 'redo', 'delete', '-', 'actualSize', 'zoomIn', 'zoomOut', '-']);
	this.fontMenu = this.addMenu(Menus.prototype.defaultFont, mxResources.get('fontFamily'), true, 'fontFamily');
	this.fontMenu.style.whiteSpace = 'nowrap';
	this.fontMenu.style.overflow = 'hidden';
	this.fontMenu.style.width = (mxClient.IS_QUIRKS) ? '76px' : '56px';
	this.addSeparator();
	this.sizeMenu = this.addMenu(Menus.prototype.defaultFontSize, mxResources.get('fontSize'), true, 'fontSize');
	this.sizeMenu.style.whiteSpace = 'nowrap';
	this.sizeMenu.style.overflow = 'hidden';
	this.sizeMenu.style.width = (mxClient.IS_QUIRKS) ? '42px' : '22px';

	this.addItems(['-', 'bold', 'italic', 'underline']);
	var align = this.addMenuFunction('geSprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'geIcon geSprite geSprite-left', null,
				function() { document.execCommand('justifyleft'); }).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'geIcon geSprite geSprite-center', null,
				function() { document.execCommand('justifycenter'); }).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'geIcon geSprite geSprite-right', null,
				function() { document.execCommand('justifyright'); }).setAttribute('title', mxResources.get('right'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], 'geIcon geSprite geSprite-top', null).setAttribute('title', mxResources.get('top'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], 'geIcon geSprite geSprite-middle', null).setAttribute('title', mxResources.get('middle'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], 'geIcon geSprite geSprite-bottom', null).setAttribute('title', mxResources.get('bottom'));
	}));
	this.addItems(['fontColor', '-']);
	this.edgeStyleMenu = this.addMenuFunction('geSprite-orthogonal', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', mxResources.get('straight'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', mxResources.get('orthogonal'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', mxResources.get('curved'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'entityRelationEdgeStyle', null, null], 'geIcon geSprite geSprite-entity', null, true).setAttribute('title', mxResources.get('entityRelation'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['arrow', null, null, null], 'geIcon geSprite geSprite-arrow', null, true).setAttribute('title', mxResources.get('arrow'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['link', null, null, null], 'geIcon geSprite geSprite-linkedge', null, true).setAttribute('title', mxResources.get('link'));
	}));
	var linestart = this.addMenuFunction('geSprite-startclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null, false).setAttribute('title', mxResources.get('none'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-startclassic', null, false).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-startopen', null, false).setAttribute('title', mxResources.get('openArrow'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-startblock', null, false).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-startoval', null, false).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-startdiamond', null, false).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-startthindiamond', null, false).setAttribute('title', mxResources.get('diamondThin'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-startclassictrans', null, false).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-startblocktrans', null, false).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-startovaltrans', null, false).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-startdiamondtrans', null, false).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-startthindiamondtrans', null, false).setAttribute('title', mxResources.get('diamondThin'));
	}));
	var lineend = this.addMenuFunction('geSprite-endclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null, false).setAttribute('title', mxResources.get('none'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-endclassic', null, false).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-endopen', null, false).setAttribute('title', mxResources.get('openArrow'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-endblock', null, false).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-endoval', null, false).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-enddiamond', null, false).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-endthindiamond', null, false).setAttribute('title', mxResources.get('diamondThin'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-endclassictrans', null, false).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-endblocktrans', null, false).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-endovaltrans', null, false).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-enddiamondtrans', null, false).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-endthindiamondtrans', null, false).setAttribute('title', mxResources.get('diamondThin'));
	}));
	this.addItems(['-', 'image', 'link', '-', 'strokeColor', 'fillColor']);
	this.addItem('geSprite-gradientcolor', 'gradientColor').setAttribute('title', mxResources.get('gradient'));
	this.addItems(['shadow']);
	var items = this.addItems(['-', 'grid', 'guides'].concat((this.editorUi.format != null) ? ['-', 'formatPanel'] : []));
	
	var ucolor = this.unselectedBackground;
	var scolor = this.selectedBackground;
	
	// Syncs grid & guides button states
	this.editorUi.addListener('gridEnabledChanged', mxUtils.bind(this, function()
	{
		items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
	}));
	
	this.editorUi.addListener('guidesEnabledChanged', mxUtils.bind(this, function()
	{
		items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;
	}));
	
	if (items.length > 3)
	{
		this.editorUi.addListener('formatWidthChanged', mxUtils.bind(this, function()
		{
			items[4].style.background = (this.editorUi.actions.get('formatPanel').selectedCallback()) ? scolor : ucolor;
		}));
	}

	this.editorUi.editor.addListener('updateGraphComponents', mxUtils.bind(this, function()
	{
		items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
		items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;
		
		if (items.length > 3)
		{
			items[4].style.background = (this.editorUi.actions.get('formatPanel').selectedCallback()) ? scolor : ucolor;
		}
	}));
	
	items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
	items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;

	if (items.length > 3)
	{
		items[4].style.background = (this.editorUi.actions.get('formatPanel').selectedCallback()) ? scolor : ucolor;
	}
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.createTextToolbar = function()
{
	var graph = this.editorUi.editor.graph;
	this.addItems(['undo', 'redo', '-']);
	
	var fontElt = this.addMenu(mxResources.get('style'), mxResources.get('style'), true, 'formatBlock');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	
	var fontElt = this.addMenu(Menus.prototype.defaultFont, mxResources.get('fontFamily'), true, 'fontFamily');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	fontElt.style.width = (mxClient.IS_QUIRKS) ? '76px' : '56px';
	
	this.addSeparator();
	
	var sizeElt = this.addMenu(Menus.prototype.defaultFontSize, mxResources.get('fontSize'), true, 'fontSize');
	sizeElt.style.whiteSpace = 'nowrap';
	sizeElt.style.overflow = 'hidden';
	sizeElt.style.width = (mxClient.IS_QUIRKS) ? '42px' : '22px';
	
	this.addItems(['-', 'bold', 'italic', 'underline']);

	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	this.addMenuFunction('geSprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'geIcon geSprite geSprite-left', null,
				function() { document.execCommand('justifyleft'); }).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'geIcon geSprite geSprite-center', null,
				function() { document.execCommand('justifycenter'); }).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'geIcon geSprite geSprite-right', null,
				function() { document.execCommand('justifyright'); }).setAttribute('title', mxResources.get('right'));
	}));

	this.addMenuFunction('geSprite-fontcolor', mxResources.get('more') + '...', false, mxUtils.bind(this, function(menu)
	{
		// KNOWN: IE+FF don't return keyboard focus after color dialog (calling focus doesn't help)
		elt = menu.addItem('', null, this.editorUi.actions.get('fontColor').funct, null, 'geIcon geSprite geSprite-fontcolor');
		elt.setAttribute('title', mxResources.get('fontColor'));
		
		elt = menu.addItem('', null, this.editorUi.actions.get('backgroundColor').funct, null, 'geIcon geSprite geSprite-fontbackground');
		elt.setAttribute('title', mxResources.get('backgroundColor'));

		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('superscript');
		}), null, 'geIcon geSprite geSprite-superscript');
		elt.setAttribute('title', mxResources.get('superscript'));
		
		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('subscript');
		}), null, 'geIcon geSprite geSprite-subscript');
		elt.setAttribute('title', mxResources.get('subscript'));
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-orderedlist', mxResources.get('numberedList'), function()
	{
		document.execCommand('insertorderedlist');
	});
	
	this.addButton('geIcon geSprite geSprite-unorderedlist', mxResources.get('bulletedList'), function()
	{
		document.execCommand('insertunorderedlist');
	});
	
	this.addButton('geIcon geSprite geSprite-outdent', mxResources.get('decreaseIndent'), function()
	{
		document.execCommand('outdent');
	});
	
	this.addButton('geIcon geSprite geSprite-indent', mxResources.get('increaseIndent'), function()
	{
		document.execCommand('indent');
	});
	
	this.addSeparator();
	this.addItems(['link', 'image']);

	this.addButton('geIcon geSprite geSprite-horizontalrule', mxResources.get('insertHorizontalRule'), function()
	{
		document.execCommand('inserthorizontalrule');
	});
	
	// KNOWN: All table stuff does not work with undo/redo
	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	var elt = this.addMenuFunction('geIcon geSprite geSprite-table', mxResources.get('table'), false, mxUtils.bind(this, function(menu)
	{
		var elt = graph.getSelectedElement();
		var cell = graph.getParentByName(elt, 'TD', graph.cellEditor.text2);
		var row = graph.getParentByName(elt, 'TR', graph.cellEditor.text2);

		if (row == null)
    	{
			this.editorUi.menus.addInsertTableItem(menu);
    	}
		else
    	{
			var table = graph.getParentByName(row, 'TABLE', graph.cellEditor.text2);

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertColumn(table, (cell != null) ? cell.cellIndex : 0));
			}), null, 'geIcon geSprite geSprite-insertcolumnbefore');
			elt.setAttribute('title', mxResources.get('insertColumnBefore'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertColumn(table, (cell != null) ? cell.cellIndex + 1 : -1));
			}), null, 'geIcon geSprite geSprite-insertcolumnafter');
			elt.setAttribute('title', mxResources.get('insertColumnAfter'));

			elt = menu.addItem('Delete column', null, mxUtils.bind(this, function()
			{
				if (cell != null)
				{
					graph.deleteColumn(table, cell.cellIndex);
				}
			}), null, 'geIcon geSprite geSprite-deletecolumn');
			elt.setAttribute('title', mxResources.get('deleteColumn'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertRow(table, row.sectionRowIndex));
			}), null, 'geIcon geSprite geSprite-insertrowbefore');
			elt.setAttribute('title', mxResources.get('insertRowBefore'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.selectNode(graph.insertRow(table, row.sectionRowIndex + 1));
			}), null, 'geIcon geSprite geSprite-insertrowafter');
			elt.setAttribute('title', mxResources.get('insertRowAfter'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				graph.deleteRow(table, row.sectionRowIndex);
			}), null, 'geIcon geSprite geSprite-deleterow');
			elt.setAttribute('title', mxResources.get('deleteRow'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				// Converts rgb(r,g,b) values
				var color = table.style.borderColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });
				this.editorUi.pickColor(color, function(newColor)
				{
					if (newColor == null || newColor == mxConstants.NONE)
					{
						table.removeAttribute('border');
						table.style.border = '';
						table.style.borderCollapse = '';
					}
					else
					{
						table.setAttribute('border', '1');
						table.style.border = '1px solid ' + newColor;
						table.style.borderCollapse = 'collapse';
					}
				});
			}), null, 'geIcon geSprite geSprite-strokecolor');
			elt.setAttribute('title', mxResources.get('borderColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				// Converts rgb(r,g,b) values
				var color = table.style.backgroundColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });
				this.editorUi.pickColor(color, function(newColor)
				{
					if (newColor == null || newColor == mxConstants.NONE)
					{
						table.style.backgroundColor = '';
					}
					else
					{
						table.style.backgroundColor = newColor;
					}
				});
			}), null, 'geIcon geSprite geSprite-fillcolor');
			elt.setAttribute('title', mxResources.get('backgroundColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				var value = table.getAttribute('cellPadding') || 0;
				
				var dlg = new FilenameDialog(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue)
				{
					if (newValue != null && newValue.length > 0)
					{
						table.setAttribute('cellPadding', newValue);
					}
					else
					{
						table.removeAttribute('cellPadding');
					}
				}), mxResources.get('spacing'));
				this.editorUi.showDialog(dlg.container, 300, 80, true, true);
				dlg.init();
			}), null, 'geIcon geSprite geSprite-fit');
			elt.setAttribute('title', mxResources.get('spacing'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'left');
			}), null, 'geIcon geSprite geSprite-left');
			elt.setAttribute('title', mxResources.get('left'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'center');
			}), null, 'geIcon geSprite geSprite-center');
			elt.setAttribute('title', mxResources.get('center'));
				
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'right');
			}), null, 'geIcon geSprite geSprite-right');
			elt.setAttribute('title', mxResources.get('right'));
    	}
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-removeformat', mxResources.get('removeFormat'), function()
	{
		document.execCommand('removeformat');
	});
	
	this.addButton('geIcon geSprite geSprite-code', mxResources.get('html'), function()
	{
		graph.cellEditor.toggleViewMode();
	});
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
	}
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name, c)
{
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, menu.funct, c);
	
	menu.addListener('stateChanged', function()
	{
		elt.setEnabled(menu.enabled);
	});

	return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct, c)
{
	return this.addMenuFunctionInContainer((c != null) ? c : this.container, label, tooltip, showLabels, funct);
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunctionInContainer = function(container, label, tooltip, showLabels, funct)
{
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct);
	container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function(c)
{
	c = (c != null) ? c : this.container;
	var elt = document.createElement('div');
	elt.className = 'geSeparator';
	c.appendChild(elt);
	
	return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function(keys, c, ignoreDisabled)
{
	var items = [];
	
	for (var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		
		if (key == '-')
		{
			items.push(this.addSeparator(c));
		}
		else
		{
			items.push(this.addItem('geSprite-' + key.toLowerCase(), key, c, ignoreDisabled));
		}
	}
	
	return items;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function(sprite, key, c, ignoreDisabled)
{
	var action = this.editorUi.actions.get(key);
	var elt = null;
	
	if (action != null)
	{
		elt = this.addButton(sprite, action.label, action.funct, c);

		if (!ignoreDisabled)
		{
			elt.setEnabled(action.enabled);
			
			action.addListener('stateChanged', function()
			{
				elt.setEnabled(action.enabled);
			});
		}
	}
	
	return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function(classname, tooltip, funct, c)
{
	var elt = this.createButton(classname);
	c = (c != null) ? c : this.container;
	
	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	c.appendChild(elt);
	
	return elt;
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function(elt, tooltip)
{
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
			elt.className = classname + ' mxDisabled';
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
		
		if (document.documentMode != null && document.documentMode >= 9)
		{
			// Prevents focus
			mxEvent.addListener(elt, 'mousedown', function(evt)
			{
				evt.preventDefault();
			});
		}
	}
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function(classname)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geButton';

	var inner = document.createElement('div');
	
	if (classname != null)
	{
		inner.className = 'geSprite ' + classname;
	}
	
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
	elt.className = 'geLabel';
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
		var show = true;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			if (show && (elt.enabled == null || elt.enabled))
			{
				graph.popupMenuHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' geToolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;
				
				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.currentMenu = menu;
				this.currentElt = elt;
				
				// Extends destroy to reset global state
				menu.addListener(mxEvent.EVENT_HIDE, mxUtils.bind(this, function()
				{
					this.currentElt = null;
				}));
			}
			
			show = true;
			mxEvent.consume(evt);
		}));

		// Hides menu if already showing
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function(evt)
		{
			show = this.currentElt != elt;
			
			// Prevents focus
			if (document.documentMode != null && document.documentMode >= 9)
			{
				evt.preventDefault();
			}
		}));
	}
};
