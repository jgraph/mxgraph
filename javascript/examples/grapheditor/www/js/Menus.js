/**
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
Menus.prototype.defaultFonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
           		             'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'];

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
	var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

	this.customFonts = [];
	this.customFontSizes = [];

	this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var addItem = mxUtils.bind(this, function(fontname)
		{
			var tr = this.styleChange(menu, fontname, [mxConstants.STYLE_FONTFAMILY], [fontname], null, parent, function()
			{
				document.execCommand('fontname', false, fontname);
			});
			tr.firstChild.nextSibling.style.fontFamily = fontname;
		});
		
		for (var i = 0; i < this.defaultFonts.length; i++)
		{
			addItem(this.defaultFonts[i]);
		}

		menu.addSeparator(parent);
		
		if (this.customFonts.length > 0)
		{
			for (var i = 0; i < this.customFonts.length; i++)
			{
				addItem(this.customFonts[i]);
			}
			
			menu.addSeparator(parent);
			
			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function()
			{
				this.customFonts = [];
			}), parent);
			
			menu.addSeparator(parent);
		}
		
		this.promptChange(menu, mxResources.get('custom') + '...', '', mxConstants.DEFAULT_FONTFAMILY, mxConstants.STYLE_FONTFAMILY, parent, true, mxUtils.bind(this, function(newValue)
		{
			this.customFonts.push(newValue);
		}));
	})));
	this.put('formatBlock', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		function addItem(label, tag)
		{
			return menu.addItem(label, null, mxUtils.bind(this, function()
			{
				// TODO: Check if visible
				graph.cellEditor.text2.focus();
	      		document.execCommand('formatBlock', false, '<' + tag + '>');
			}), parent);
		};
		
		addItem(mxResources.get('normal'), 'p');
		
		addItem('', 'h1').firstChild.nextSibling.innerHTML = '<h1 style="margin:0px;">' + mxResources.get('heading') + ' 1</h1>';
		addItem('', 'h2').firstChild.nextSibling.innerHTML = '<h2 style="margin:0px;">' + mxResources.get('heading') + ' 2</h2>';
		addItem('', 'h3').firstChild.nextSibling.innerHTML = '<h3 style="margin:0px;">' + mxResources.get('heading') + ' 3</h3>';
		addItem('', 'h4').firstChild.nextSibling.innerHTML = '<h4 style="margin:0px;">' + mxResources.get('heading') + ' 4</h4>';
		addItem('', 'h5').firstChild.nextSibling.innerHTML = '<h5 style="margin:0px;">' + mxResources.get('heading') + ' 5</h5>';
		addItem('', 'h6').firstChild.nextSibling.innerHTML = '<h6 style="margin:0px;">' + mxResources.get('heading') + ' 6</h6>';
		
		addItem('', 'pre').firstChild.nextSibling.innerHTML = '<pre style="margin:0px;">' + mxResources.get('formatted') + '</pre>';
		addItem('', 'blockquote').firstChild.nextSibling.innerHTML = '<blockquote style="margin-top:0px;margin-bottom:0px;">' + mxResources.get('blockquote') + '</blockquote>';
	})));
	this.put('fontSize', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var sizes = [6, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72];
		
		var addItem = mxUtils.bind(this, function(fontsize)
		{
			this.styleChange(menu, fontsize, [mxConstants.STYLE_FONTSIZE], [fontsize], null, parent, function()
			{
				document.execCommand('fontSize', false, '3');
				
				// Changes the css font size of the first font element inside the in-place editor with size 3
				var elts = graph.cellEditor.text2.getElementsByTagName('font');
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].getAttribute('size') == '3')
					{
						elts[i].removeAttribute('size');
						elts[i].style.fontSize = fontsize + 'px';
						
						break;
					}
				}
			});
		});
		
		for (var i = 0; i < sizes.length; i++)
		{
			addItem(sizes[i]);
		}

		menu.addSeparator(parent);
		
		if (this.customFontSizes.length > 0)
		{
			for (var i = 0; i < this.customFontSizes.length; i++)
			{
				addItem(this.customFontSizes[i]);
			}
			
			menu.addSeparator(parent);
			
			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function()
			{
				this.customFontSizes = [];
			}), parent);
			
			menu.addSeparator(parent);
		}
		
		this.promptChange(menu, mxResources.get('custom') + '...', '(pt)', '12', mxConstants.STYLE_FONTSIZE, parent, true, mxUtils.bind(this, function(newValue)
		{
			this.customFontSizes.push(newValue);
		}));
	})));
	this.put('linewidth', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		var sizes = [1, 2, 3, 4, 8, 12, 16, 24];
		
		for (var i = 0; i < sizes.length; i++)
		{
			this.styleChange(menu, sizes[i] + 'px', [mxConstants.STYLE_STROKEWIDTH], [sizes[i]], null, parent);
		}
		
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('custom') + '...', '(px)', '1', mxConstants.STYLE_STROKEWIDTH, parent);
	})));
	this.put('line', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.edgeStyleChange(menu, mxResources.get('straight'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], [null, null, null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('orthogonal'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], [null, 'orthogonalEdgeStyle', null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('curved'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], [null, 'orthogonalEdgeStyle', '1', null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('entityRelation'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], [null, 'entityRelationEdgeStyle', null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('arrow'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], ['arrow', null, null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('link'), [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noEdgeStyle'], ['link', null, null, null], null, parent, true);
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
		this.promptChange(menu, mxResources.get('targetSpacing') + '...', '(px)', '0', mxConstants.STYLE_TARGET_PERIMETER_SPACING, parent);
		this.promptChange(menu, mxResources.get('size') + '...', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_ENDSIZE, parent);
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
		this.promptChange(menu, mxResources.get('sourceSpacing') + '...', '(px)', '0', mxConstants.STYLE_SOURCE_PERIMETER_SPACING, parent);
		this.promptChange(menu, mxResources.get('size') + '...', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_STARTSIZE, parent);
	})));
	this.put('spacing', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		// Uses shadow action and line menu to analyze selection
		var vertexSelected = this.editorUi.actions.get('shadow').enabled;
		
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
	})));
	this.put('format', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['fillColor'], parent);
		this.addSubmenu('gradient', menu, parent);
		this.addMenuItems(menu, ['image', '-', 'shadow'], parent);
		this.promptChange(menu, mxResources.get('opacity'), '(%)', '100', mxConstants.STYLE_OPACITY, parent, this.get('format').enabled);
		this.addMenuItems(menu, ['-', 'plain', 'dashed', 'dotted', '-', 'straight', 'rounded', 'curved', '-', 'strokeColor'], parent);
		this.addSubmenu('linewidth', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('line', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('linestart', menu, parent);
		this.addSubmenu('lineend', menu, parent);
		this.addMenuItems(menu, ['-', 'setAsDefaultStyle', 'resetDefaultStyle', '-', 'style'], parent);
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
		var enabled = this.get('text').enabled;
		menu.addSeparator(parent);
		this.addMenuItem(menu, 'fontColor', parent);
		this.addMenuItems(menu, ['backgroundColor', 'borderColor', '-'], parent);
		this.addSubmenu('fontFamily', menu, parent);
		this.addSubmenu('fontSize', menu, parent);
		this.addMenuItems(menu, ['-', 'bold', 'italic', 'underline', '-'], parent);
	    this.addSubmenu('alignment', menu, parent);
	    this.addSubmenu('position', menu, parent);
		this.addSubmenu('spacing', menu, parent);
	    menu.addSeparator(parent);
		this.addMenuItem(menu, 'formattedText', parent);
		this.addMenuItem(menu, 'wordWrap', parent);
		this.promptChange(menu, mxResources.get('textOpacity'), '(%)', '100', mxConstants.STYLE_TEXT_OPACITY, parent, enabled);
		menu.addItem(mxResources.get('hide'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_NOLABEL, false); }, parent, null, enabled);
	})));
	this.put('alignment', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('leftAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], null, parent,
				function() { document.execCommand('justifyleft'); });
		this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], null, parent,
				function() { document.execCommand('justifycenter'); });
		this.styleChange(menu, mxResources.get('rightAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], null, parent,
				function() { document.execCommand('justifyright'); });
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('topAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], null, parent);
		this.styleChange(menu, mxResources.get('middle'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottomAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], null, parent);
		menu.addSeparator(parent);
		var enabled = this.get('text').enabled;
		menu.addItem(mxResources.get('vertical'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_HORIZONTAL, true); }, parent, null, enabled);
	})));
	this.put('position', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.styleChange(menu, mxResources.get('top'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_TOP, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM], null, parent);
		this.styleChange(menu, mxResources.get('right'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottom'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP], null, parent);
		this.styleChange(menu, mxResources.get('left'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE], null, parent);
	})));
	this.put('direction', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('flipH'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_FLIPH, false); }, parent);
		menu.addItem(mxResources.get('flipV'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_FLIPV, false); }, parent);
		this.addMenuItems(menu, ['-', 'rotation'], parent);
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
	this.put('distribute', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('horizontal'), null, function() { graph.distributeCells(true); }, parent);
		menu.addItem(mxResources.get('vertical'), null, function() { graph.distributeCells(false); }, parent);
	})));
	this.put('layout', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		menu.addItem(mxResources.get('horizontalFlow'), null, mxUtils.bind(this, function()
		{
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
    		this.editorUi.executeLayout(function()
    		{
    			var selectionCells = graph.getSelectionCells();
    			layout.execute(graph.getDefaultParent(), selectionCells.length == 0 ? null : selectionCells);
    		}, true);
		}), parent);
		menu.addItem(mxResources.get('verticalFlow'), null, mxUtils.bind(this, function()
		{
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
    		this.editorUi.executeLayout(function()
    		{
    			var selectionCells = graph.getSelectionCells();
    			layout.execute(graph.getDefaultParent(), selectionCells.length == 0 ? null : selectionCells);
    		}, true);
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('horizontalTree'), null, mxUtils.bind(this, function()
		{
			if (!graph.isSelectionEmpty())
			{
				var layout = new mxCompactTreeLayout(graph, true);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(function()
	    		{
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addItem(mxResources.get('verticalTree'), null, mxUtils.bind(this, function()
		{
			if (!graph.isSelectionEmpty())
			{
				var layout = new mxCompactTreeLayout(graph, false);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(function()
	    		{
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addItem(mxResources.get('radialTree'), null, mxUtils.bind(this, function()
		{
			if (!graph.isSelectionEmpty())
			{
				var layout = new mxRadialTreeLayout(graph, false);
	    		this.editorUi.executeLayout(function()
	    		{
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('organic'), null, mxUtils.bind(this, function()
		{
			var layout = new mxFastOrganicLayout(graph);
			
			// Tries to find good force constant by averaging cell width
			var count = 0;
			var sum = 0;
			
			for (var key in graph.getModel().cells)
			{
				var tmp = graph.getModel().getCell(key);
				
				if (graph.getModel().isVertex(tmp))
				{
					var geo = graph.getModel().getGeometry(tmp);

					if (geo != null)
					{
						sum += geo.width;
						count++;
					}
				}
			}
			
			layout.forceConstant = (sum / count) * 1.1;
			
    		this.editorUi.executeLayout(function()
    		{
    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
    		}, true);
		}), parent);
		menu.addItem(mxResources.get('circle'), null, mxUtils.bind(this, function()
		{
			var layout = new mxCircleLayout(graph);
    		this.editorUi.executeLayout(function()
    		{
    			layout.execute(graph.getDefaultParent());
    		}, true);
		}), parent);
	}))).isEnabled = isGraphEnabled;
	this.put('navigation', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['home', '-', 'exitGroup', 'enterGroup', '-', 'expand', 'collapse', '-', 'collapsible'], parent);
	})));
	this.put('arrange', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['toFront', 'toBack', '-'], parent);
		this.addSubmenu('direction', menu, parent);
		this.addMenuItems(menu, ['switchDirection', '-'], parent);
		this.addSubmenu('align', menu, parent);
		this.addSubmenu('distribute', menu, parent);
		this.addMenuItems(menu, ['layers'], parent);
		menu.addSeparator(parent);
		this.addSubmenu('navigation', menu, parent);
		this.addSubmenu('insert', menu, parent);
		this.addSubmenu('layout', menu, parent);
		this.addMenuItems(menu, ['-', 'group', 'ungroup', 'removeFromGroup', '-', 'autosize'], parent);
	}))).isEnabled = isGraphEnabled;
	this.put('insert', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['insertLink'], parent);
		this.addMenuItem(menu, 'image', parent).firstChild.nextSibling.innerHTML = mxResources.get('insertImage');
	})));

	this.put('view', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['outline'], parent);
		menu.addSeparator();
		var scales = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];
		
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
		
		this.addMenuItems(menu, ['-', 'actualSize', 'zoomIn', 'zoomOut', '-', 'fitWindow', 'fitPageWidth', 'fitPage', 'fitTwoPages', '-', 'customZoom'], parent);
	})));
	this.put('file', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['new', 'open', '-', 'save', 'saveAs', '-', 'import', 'export', '-', 'editFile', '-', 'pageSetup', 'print'], parent);
	})));
	this.put('edit', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste', 'delete', '-', 'duplicate', '-',
		                         'editData', 'editLink', 'openLink', 'editTooltip', '-', 'selectVertices',
		                         'selectEdges', 'selectAll', '-', 'lockUnlock']);
	})));
	this.put('options', new Menu(mxUtils.bind(this, function(menu, parent)
	{
		this.addMenuItems(menu, ['pageView', '-', 'grid', 'guides', '-', 'scrollbars', 'tooltips', '-',
 		                         'connectionPoints', 'copyConnect', 'navigation', '-', 'pageBackgroundColor', 'autosave']);
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
	
	return menu;
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
	var enabled = this.get(name).isEnabled();
	
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
	
	if (menu != null && (popupMenu.showDisabled || menu.isEnabled()))
	{
		this.get(name).execute(popupMenu, parent);
	}
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.edgeStyleChange = function(menu, label, keys, values, sprite, parent, reset)
{
	return menu.addItem(label, null, mxUtils.bind(this, function()
	{
		var graph = this.editorUi.editor.graph;
		graph.stopEditing(false);
		
		graph.getModel().beginUpdate();
		try
		{
			var cells = graph.getSelectionCells();
			var edges = [];
			
			for (var i = 0; i < cells.length; i++)
			{
				var cell = cells[i];
				
				if (graph.getModel().isEdge(cell))
				{
					if (reset)
					{
						var geo = graph.getCellGeometry(cell);
			
						// Resets all edge points
						if (geo != null)
						{
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}
					
					for (var j = 0; j < keys.length; j++)
					{
						graph.setCellStyles(keys[j], values[j], [cell]);
					}
					
					edges.push(cell);
				}
			}
			
			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', edges));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}), parent, sprite);
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.styleChange = function(menu, label, keys, values, sprite, parent, fn)
{
	return menu.addItem(label, null, mxUtils.bind(this, function()
	{
		var graph = this.editorUi.editor.graph;
		
		if (fn != null && graph.cellEditor.isContentEditing())
		{
			fn();
		}
		else
		{
			graph.stopEditing(false);
			
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < keys.length; i++)
				{
					graph.setCellStyles(keys[i], values[i]);
				}
				
				this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values,
					'cells', graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	}), parent, sprite);
};

/**
 * Adds a style change item with a prompt to the given menu.
 */
Menus.prototype.promptChange = function(menu, label, hint, defaultValue, key, parent, enabled, fn)
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
    	
		var dlg = new FilenameDialog(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			if (newValue != null && newValue.length > 0)
			{
				graph.getModel().beginUpdate();
				try
				{
					graph.stopEditing(false);
					graph.setCellStyles(key, newValue);
				}
				finally
				{
					graph.getModel().endUpdate();
				}
				
				if (fn != null)
				{
					fn(newValue);
				}
			}
		}), mxResources.get('enterValue') + ((hint.length > 0) ? (' ' + hint) : ''));
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}), parent, null, enabled);
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.pickColor = function(key, cmd, defaultValue)
{
	var graph = this.editorUi.editor.graph;
	
	if (cmd != null && graph.cellEditor.isContentEditing())
	{
		var selState = graph.cellEditor.saveSelection();
		
		var dlg = new ColorDialog(this.editorUi, defaultValue || '000000', mxUtils.bind(this, function(color)
		{
			graph.cellEditor.restoreSelection(selState);
			document.execCommand(cmd, false, (color != mxConstants.NONE) ? color : 'transparent');
		}), function()
		{
			graph.cellEditor.restoreSelection(selState);
		});
		this.editorUi.showDialog(dlg.container, 220, 400, true, false);
		dlg.init();
	}
	else
	{
		if (this.colorDialog == null)
		{
			this.colorDialog = new ColorDialog(this.editorUi);
		}
	
		this.colorDialog.currentColorKey = key;
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
		this.colorDialog.init();
	}
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.toggleStyle = function(key)
{
	var graph = this.editorUi.editor.graph;
	var value = graph.toggleCellStyles(key);
	this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [value],
			'cells', graph.getSelectionCells()));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItem = function(menu, key, parent, trigger, sprite)
{
	var action = this.editorUi.actions.get(key);

	if (action != null && (menu.showDisabled || action.isEnabled()) && action.visible)
	{
		var item = menu.addItem(action.label, null, function()
		{
			action.funct(trigger);
		}, parent, sprite, action.isEnabled());
		
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
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItems = function(menu, keys, parent, trigger, sprites)
{
	for (var i = 0; i < keys.length; i++)
	{
		if (keys[i] == '-')
		{
			menu.addSeparator(parent);
		}
		else
		{
			this.addMenuItem(menu, keys[i], parent, trigger, (sprites != null) ? sprites[i] : null);
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
		this.addMenuItems(menu, ['undo', 'redo', '-', 'paste'], null, evt);	
	}
	else
	{
		this.addMenuItems(menu, ['delete', '-', 'cut', 'copy', '-', 'duplicate'], null, evt);

	}

	if (graph.getSelectionCount() == 1)
	{
		this.addMenuItems(menu, ['setAsDefaultStyle'], null, evt);
	}
	
	menu.addSeparator();
	
	if (graph.getSelectionCount() > 0)
	{
		var cell = graph.getSelectionCell();
		var state = graph.view.getState(cell);
		
		if (state != null)
		{
			this.addMenuItems(menu, ['toFront', 'toBack', '-'], null, evt);
	
			if (graph.getModel().isEdge(cell) && mxUtils.getValue(state.style, mxConstants.STYLE_EDGE, null) != 'entityRelationEdgeStyle' &&
				mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) != 'arrow' &&
				mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) != 'link')
			{
				var handler = graph.selectionCellsHandler.getHandler(cell);
				var isWaypoint = false;
				
				if (handler instanceof mxEdgeHandler && handler.bends != null && handler.bends.length > 2)
				{
					var index = handler.getHandleForEvent(graph.updateMouseEvent(new mxMouseEvent(evt)));
					
					// Configures removeWaypoint action before execution
					// Using trigger parameter is cleaner but have to find waypoint here anyway.
					var rmWaypointAction = this.editorUi.actions.get('removeWaypoint');
					rmWaypointAction.handler = handler;
					rmWaypointAction.index = index;

					isWaypoint = index > 0 && index < handler.bends.length - 1;
				}
				
				this.addMenuItems(menu, ['-', (isWaypoint) ? 'removeWaypoint' : 'addWaypoint'], null, evt);
	
				// Adds reset waypoints option if waypoints exist
				var geo = graph.getModel().getGeometry(cell);
				
				if (geo != null && geo.points != null && geo.points.length > 0)
				{
					this.addMenuItems(menu, ['resetWaypoints'], null, evt);	
				}
			}
			
			if (graph.getSelectionCount() > 1)	
			{
				menu.addSeparator();
				this.addMenuItems(menu, ['group'], null, evt);
			}
			else (graph.getSelectionCount() == 1 && graph.getModel().getChildCount(graph.getSelectionCell()) > 0)
			{
				menu.addSeparator();
				this.addMenuItems(menu, ['ungroup'], null, evt);
			}
			
			if (graph.getSelectionCount() == 1)
			{
				menu.addSeparator();
				this.addMenuItems(menu, ['editLink'], null, evt);

				// Shows edit image action if there is an image in the style
				if (graph.getModel().isVertex(cell) && mxUtils.getValue(state.style, mxConstants.STYLE_IMAGE, null) != null)
				{
					menu.addSeparator();
					this.addMenuItem(menu, 'image', null, evt).firstChild.nextSibling.innerHTML = mxResources.get('editImage') + '...';
				}
			}
		}
	}
	else
	{
		this.addMenuItems(menu, ['-', 'selectVertices', 'selectEdges', '-', 'selectAll'], null, evt);
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
		(function(menu)
		{
			var elt = menubar.addMenu(mxResources.get(menus[i]), menu.funct);
			
			if (elt != null)
			{
				menu.addListener('stateChanged', function()
				{
					elt.enabled = menu.enabled;
					
					if (!menu.enabled)
					{
						elt.className = 'geItem mxDisabled';
						
						if (document.documentMode == 8)
						{
							elt.style.color = '#c3c3c3';
						}
					}
					else
					{
						elt.className = 'geItem';
						
						if (document.documentMode == 8)
						{
							elt.style.color = '';
						}
					}
				});
			}
		})(this.get(menus[i]));
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
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div)
		{
			this.hideMenu();
		}
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
				this.editorUi.editor.graph.popupMenuHandler.hideMenu();
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

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
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
Menu.prototype.isEnabled = function()
{
	return this.enabled;
};

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
