/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi)
{
	this.editorUi = editorUi;
	this.actions = new Object();
	this.init();
};

/**
 * Adds the default actions.
 */
Actions.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

	// File actions
	this.addAction('new', function() { window.open(ui.getUrl()); });
	this.addAction('open...', function()
	{
		window.openNew = true;
		window.openKey = 'open';
		
		ui.openFile();
	});
	this.addAction('import...', function()
	{
		window.openNew = false;
		window.openKey = 'import';
		
		// Closes dialog after open
		window.openFile = new OpenFile(mxUtils.bind(this, function()
		{
			ui.hideDialog();
		}));
		
		window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
		{
			try
			{
				var doc = mxUtils.parseXml(xml);
				var model = new mxGraphModel();
				var codec = new mxCodec(doc);
				codec.decode(doc.documentElement, model);
				
				var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
				editor.graph.setSelectionCells(editor.graph.importCells(children));
			}
			catch (e)
			{
				mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
			}
		}));

		// Removes openFile if dialog is closed
		ui.showDialog(new OpenDialog(this).container, 300, 180, true, true, function()
		{
			window.openFile = null;
		});
	}).isEnabled = isGraphEnabled;
	this.addAction('save', function() { ui.saveFile(false); }, null, null, 'Ctrl+S').isEnabled = isGraphEnabled;
	this.addAction('saveAs...', function() { ui.saveFile(true); }, null, null, 'Ctrl+Shift+S').isEnabled = isGraphEnabled;
	this.addAction('export...', function() { ui.showDialog(new ExportDialog(ui).container, 300, 210, true, true); });
	this.put('editFile', new Action(mxResources.get('edit') + '...', function()
	{
		ui.showDialog(new EditFileDialog(ui).container, 620, 420, true, true);
	})).isEnabled = isGraphEnabled;
	this.addAction('pageSetup...', function() { ui.showDialog(new PageSetupDialog(ui).container, 320, 120, true, true); });
	this.addAction('print...', function() { ui.showDialog(new PrintDialog(ui).container, 300, 120, true, true); }, null, 'sprite-print', 'Ctrl+P');
	this.addAction('preview', function() { mxUtils.show(graph, null, 10, 10); });
	
	// Edit actions
	this.addAction('undo', function() { ui.undo(); }, null, 'sprite-undo', 'Ctrl+Z');
	this.addAction('redo', function() { ui.redo(); }, null, 'sprite-redo', 'Ctrl+Y');
	this.addAction('cut', function() { mxClipboard.cut(graph); }, null, 'sprite-cut', 'Ctrl+X');
	this.addAction('copy', function() { mxClipboard.copy(graph); }, null, 'sprite-copy', 'Ctrl+C');
	this.addAction('paste', function() { mxClipboard.paste(graph); }, false, 'sprite-paste', 'Ctrl+V');
	this.addAction('delete', function()
	{
		// Handles special case where delete is pressed while connecting
		if (graph.connectionHandler.isConnecting())
		{
			graph.connectionHandler.reset();
		}
		else
		{
			graph.removeCells();
		}
	}, null, null, 'Delete');
	this.addAction('duplicate', function()
	{
		var cells = graph.getSelectionCells();
		var s = graph.gridSize;
		var select = [];
		
		graph.getModel().beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				select.push(graph.moveCells([cells[i]], s, s, true, graph.getModel().getParent(cells[i]))[0]);
			}
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		graph.setSelectionCells(select);
	}, null, null, 'Ctrl+D');
	this.addAction('turn', function()
	{
		var cells = graph.getSelectionCells();
		var model = graph.getModel();
		var select = [];
		
		model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				var cell = cells[i];
				
				if (model.isEdge(cell))
				{
					var src = model.getTerminal(cell, true);
					var trg = model.getTerminal(cell, false);
					
					model.setTerminal(cell, trg, true);
					model.setTerminal(cell, src, false);
					
					var geo = model.getGeometry(cell);
					
					if (geo != null)
					{
						geo = geo.clone();
						
						if (geo.points != null)
						{
							geo.points.reverse();
						}
						
						var sp = geo.getTerminalPoint(true);
						var tp = geo.getTerminalPoint(false)
						
						geo.setTerminalPoint(sp, false);
						geo.setTerminalPoint(tp, true);
						model.setGeometry(cell, geo);
						
						// Inverts constraints
						var edgeState = graph.view.getState(cell);
						var sourceState = graph.view.getState(src);
						var targetState = graph.view.getState(trg);
						
						if (edgeState != null)
						{
							var sc = (sourceState != null) ? graph.getConnectionConstraint(edgeState, sourceState, true) : null;
							var tc = (targetState != null) ? graph.getConnectionConstraint(edgeState, targetState, false) : null;
							
							graph.setConnectionConstraint(cell, src, true, tc);
							graph.setConnectionConstraint(cell, trg, false, sc);
						}

						select.push(cell);
					}
				}
				else if (graph.getModel().isVertex(cell))
				{
					var geo = graph.getCellGeometry(cell);
		
					if (geo != null)
					{
						// Rotates the size and position in the geometry
						geo = geo.clone();
						geo.x += geo.width / 2 - geo.height / 2;
						geo.y += geo.height / 2 - geo.width / 2;
						var tmp = geo.width;
						geo.width = geo.height;
						geo.height = tmp;
						graph.getModel().setGeometry(cell, geo);
						
						// Reads the current direction and advances by 90 degrees
						var state = graph.view.getState(cell);
						
						if (state != null)
						{
							var dir = state.style[mxConstants.STYLE_DIRECTION] || 'east'/*default*/;
							
							if (dir == 'east')
							{
								dir = 'south';
							}
							else if (dir == 'south')
							{
								dir = 'west';
							}
							else if (dir == 'west')
							{
								dir = 'north';
							}
							else if (dir == 'north')
							{
								dir = 'east';
							}
							
							graph.setCellStyles(mxConstants.STYLE_DIRECTION, dir, [cell]);
						}

						select.push(cell);
					}
				}
			}
		}
		finally
		{
			model.endUpdate();
		}

		graph.setSelectionCells(select);
	}, null, null, 'Ctrl+R');
	this.addAction('selectVertices', function() { graph.selectVertices(); }, null, null, 'Ctrl+Shift+A').isEnabled = isGraphEnabled;
	this.addAction('selectEdges', function() { graph.selectEdges(); }, null, null, 'Ctrl+Shift+E').isEnabled = isGraphEnabled;
	this.addAction('selectAll', function() { graph.selectAll(); }, null, null, 'Ctrl+A').isEnabled = isGraphEnabled;
	this.addAction('lockUnlock', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, 1);
			graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, 1);
			graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, 1);
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}, null, null, 'Ctrl+L');

	// Navigation actions
	this.addAction('home', function() { graph.home(); }, null, null, 'Home');
	this.addAction('exitGroup', function() { graph.exitGroup(); }, null, null, 'Page Up');
	this.addAction('enterGroup', function() { graph.enterGroup(); }, null, null, 'Page Down');
	this.addAction('expand', function() { graph.foldCells(false); }, null, null, 'Ctrl+Enter');
	this.addAction('collapse', function() { graph.foldCells(true); }, null, null, 'Ctrl+Backspace');

	// Arrange actions
	this.addAction('toFront', function() { graph.orderCells(false); }, null, null, 'Ctrl+Shift+F');
	this.addAction('toBack', function() { graph.orderCells(true); }, null, null, 'Ctrl+B');
	this.addAction('group', function() { graph.setSelectionCell(graph.groupCells(null, 0)); }, null, null, 'Ctrl+G');
	this.addAction('ungroup', function() { graph.setSelectionCells(graph.ungroupCells()); }, null, null, 'Ctrl+U');
	this.addAction('removeFromGroup', function() { graph.removeCellsFromParent(); });
	// Adds action
	this.addAction('editData...', function()
	{
		var cell = graph.getSelectionCell() || graph.getModel().getRoot();
		
		if (cell != null)
		{
			ui.showDialog(new MetadataDialog(ui, cell).container, 300, 320, true, true);
		}
	}, null, null, 'Ctrl+M');
	this.addAction('editTooltip...', function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var cell = graph.getSelectionCell();
			var tooltip = '';
			
			if (mxUtils.isNode(cell.value))
			{
				var tmp = cell.value.getAttribute('tooltip');
				
				if (tmp != null)
				{
					tooltip = tmp;
				}
			}
			
	    	var dlg = new TextareaDialog(ui, mxResources.get('enterValue') + ':', tooltip, function(newValue)
			{
				graph.setTooltipForCell(cell, newValue);
			});
			ui.showDialog(dlg.container, 320, 200, true, true);
			dlg.init();
		}
	});
	this.addAction('openLink', function()
	{
		var link = graph.getLinkForCell(graph.getSelectionCell());
		
		if (link != null)
		{
			window.open(link);
		}
	});
	this.addAction('editLink...', function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var cell = graph.getSelectionCell();
			var value = graph.getLinkForCell(cell) || '';
			
			ui.showLinkDialog(value, mxResources.get('apply'), function(link)
			{
				link = mxUtils.trim(link);
				graph.getModel().beginUpdate();
				
				try
				{
			    	if (link.length > 0)
					{
		    			graph.setLinkForCell(cell, link);
		    			graph.setCellStyles('fontColor', '#0000EE', [cell]);
		    			graph.setCellStyles('fontStyle', '4', [cell]);
					}
			    	else
			    	{
			    		graph.setLinkForCell(cell, null);
			    		graph.setCellStyles('fontColor', null, [cell]);
		    			graph.setCellStyles('fontStyle', null, [cell]);
			    	}
				}
				finally
				{
					graph.getModel().endUpdate();
				}
			});
		}
	});
	this.addAction('link...', mxUtils.bind(this, function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled())
		{
			if (graph.cellEditor.isContentEditing())
			{
				var link = graph.getParentByName(graph.getSelectedElement(), 'A', graph.cellEditor.text2);
				var oldValue = '';
				
				if (link != null)
				{
					oldValue = link.getAttribute('href');
				}
				
				var selState = graph.cellEditor.saveSelection();
				
				ui.showLinkDialog(oldValue, mxResources.get('apply'), mxUtils.bind(this, function(value)
				{
		    		graph.cellEditor.restoreSelection(selState);
					
					// To find the new link, we create a list of all existing links first
		    		// LATER: Refactor for reuse with code for finding inserted image below
					var tmp = graph.cellEditor.text2.getElementsByTagName('a');
					var oldLinks = [];
					
					for (var i = 0; i < tmp.length; i++)
					{
						oldLinks.push(tmp[i]);
					}
		
					if (value != null && value.length > 0)
					{
						document.execCommand('createlink', false, mxUtils.trim(value));
						
						// Adds target="_blank" for the new link
						var newLinks = graph.cellEditor.text2.getElementsByTagName('a');
						
						if (newLinks.length == oldLinks.length + 1)
						{
							// Inverse order in favor of appended links
							for (var i = newLinks.length - 1; i >= 0; i--)
							{
								if (i == 0 || newLinks[i] != oldLinks[i - 1])
								{
									newLinks[i].setAttribute('target', '_blank');
									break;
								}
							}
						}
					}
				}));
			}
			else if (graph.isSelectionEmpty())
			{
				this.get('insertLink').funct();
			}
			else
			{
				this.get('editLink').funct();
			}
		}
	})).isEnabled = isGraphEnabled;
	this.addAction('autosize', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (graph.getModel().getChildCount(cell))
					{
						graph.updateGroupBounds([cell], 20);
					}
					else
					{
						graph.updateCellSize(cell);
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	});
	this.addAction('formattedText', function()
	{
    	var state = graph.getView().getState(graph.getSelectionCell());
    	var value = '1';
    	
		graph.getModel().beginUpdate();
		try
		{
	    	if (state != null && state.style['html'] == '1')
	    	{
	    		value = null;
	    	}
	    	else
	    	{
	    		// FIXME: HTML entities are converted in plain text labels if word wrap is on
	    		// TODO: Convert HTML entities? (Check for userobject!)
	    	}
	
	       	graph.setCellStyles('html', value);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['html'],
					'values', [(value != null) ? value : '0'], 'cells',
					graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('wordWrap', function()
	{
    	var state = graph.getView().getState(graph.getSelectionCell());
    	var value = 'wrap';
    	
    	if (state != null && state.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap')
    	{
    		value = null;
    	}

       	graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value);
	});
	this.addAction('rotation', function()
	{
		var value = '0';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		value = state.style[mxConstants.STYLE_ROTATION] || value;
    	}

		var dlg = new FilenameDialog(ui, value, mxResources.get('apply'), function(newValue)
		{
			if (newValue != null && newValue.length > 0)
			{
				graph.setCellStyles(mxConstants.STYLE_ROTATION, newValue);
			}
		}, mxResources.get('enterValue') + ' (' + mxResources.get('rotation') + ' 0-360)');
		
		ui.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	});
	// View actions
	this.addAction('actualSize', function()
	{
		graph.zoomTo(1);
		ui.resetScrollbars();
	});
	this.addAction('zoomIn', function()
	{
		graph.zoomIn();
	}, null, null, 'Ctrl +');
	this.addAction('zoomOut', function()
	{
		graph.zoomOut();
	}, null, null, 'Ctrl -');
	this.addAction('fitWindow', function() { graph.fit(); });
	this.addAction('fitPage', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		var scale = Math.floor(100 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 100;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = pad.y;
			graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}));
	this.addAction('fitTwoPages', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		
		var scale = Math.floor(100 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 100;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = Math.min(pad.y, (graph.container.scrollHeight - graph.container.clientHeight) / 2);
			graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}));
	this.addAction('fitPageWidth', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;

		var scale = Math.floor(100 * cw / fmt.width / ps) / 100;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = pad.y;
			graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}));
	this.put('customZoom', new Action(mxResources.get('custom') + '...', mxUtils.bind(this, function()
	{
		var dlg = new FilenameDialog(this.editorUi, parseInt(graph.getView().getScale() * 100), mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			if (newValue != null && newValue.length > 0)
			{
				graph.zoomTo(parseInt(newValue) / 100);
			}
		}), mxResources.get('enterValue') + ' (%)');
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	})));
	
	// Option actions
	var action = null;
	action = this.addAction('grid', function()
	{
		graph.setGridEnabled(!graph.isGridEnabled());
		editor.updateGraphComponents();
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	}, null, null, 'Ctrl+Shift+G');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.isGridEnabled(); });
	action.setEnabled(false);
	
	action = this.addAction('guides', function()
	{
		graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
		ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.graphHandler.guidesEnabled; });
	action.setEnabled(false);
	
	action = this.addAction('tooltips', function()
	{
		graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.tooltipHandler.isEnabled(); });
	
	action = this.addAction('navigation', function()
	{
		graph.foldingEnabled = !graph.foldingEnabled;
    	graph.view.revalidate();
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.foldingEnabled; });
	action = this.addAction('scrollbars', function()
	{
		ui.setScrollbars(!ui.hasScrollbars());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.scrollbars; });
	action = this.addAction('pageView', mxUtils.bind(this, function()
	{
		var hasScrollbars = mxUtils.hasScrollbars(graph.container);
		var tx = 0;
		var ty = 0;
		
		if (hasScrollbars)
		{
			tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
			ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
		}
		
		graph.pageVisible = !graph.pageVisible;
		graph.pageBreaksVisible = graph.pageVisible; 
		graph.preferPageSize = graph.pageBreaksVisible;
		editor.updateGraphComponents();

		// Removes background page
		graph.refresh();
		
		// Calls updatePageBreaks
		graph.sizeDidChange();
		
		if (hasScrollbars)
		{
			graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
			graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
		}
		
		ui.fireEvent(new mxEventObject('pageViewChanged'));
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.pageVisible; });
	this.put('pageBackgroundColor', new Action(mxResources.get('backgroundColor') + '...', function()
	{
		ui.pickColor(graph.background || 'none', function(color)
		{
			ui.setBackgroundColor(color);
		});
	}));
	action = this.addAction('connectionPoints', function()
	{
		graph.setConnectable(!graph.connectionHandler.isEnabled());
	}, null, null, 'Ctrl+Q');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isEnabled(); });
	action = this.addAction('copyConnect', function()
	{
		graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isCreateTarget(); });
	action = this.addAction('autosave', function()
	{
		ui.editor.autosave = !ui.editor.autosave;
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return ui.editor.autosave; });
	action.isEnabled = isGraphEnabled;
	action.visible = false;
	
	// Help actions
	this.addAction('help', function()
	{
		var ext = '';
		
		if (mxResources.isLanguageSupported(mxClient.language))
		{
			ext = '_' + mxClient.language;
		}
		
		window.open(RESOURCES_PATH + '/help' + ext + '.html');
	});
	this.put('about', new Action(mxResources.get('about') + ' Graph Editor...', function()
	{
		ui.showDialog(new AboutDialog(ui).container, 320, 280, true, true);
	}, null, null, 'F1'));
	
	// Font style actions
	var toggleFontStyle = mxUtils.bind(this, function(key, style, fn)
	{
		this.addAction(key, function()
		{
			if (fn != null && graph.cellEditor.isContentEditing())
			{
				fn();
			}
			else
			{
				graph.stopEditing(false);
				graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);
			}
		});
	});
	
	toggleFontStyle('bold', mxConstants.FONT_BOLD, function() { document.execCommand('bold'); });
	toggleFontStyle('italic', mxConstants.FONT_ITALIC, function() { document.execCommand('italic'); });
	toggleFontStyle('underline', mxConstants.FONT_UNDERLINE, function() { document.execCommand('underline'); });
	
	// Color actions
	this.addAction('fontColor...', function() { ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, 'forecolor', '000000'); });
	this.addAction('strokeColor...', function() { ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR); });
	this.addAction('fillColor...', function() { ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR); });
	this.addAction('gradientColor...', function() { ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR); });
	this.addAction('backgroundColor...', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, 'backcolor'); });
	this.addAction('borderColor...', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR); });
	
	// Format actions
	this.addAction('shadow', function() { ui.menus.toggleStyle(mxConstants.STYLE_SHADOW); });
	this.addAction('plain', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, null);
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', [null, null], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dashed', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', null], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dotted', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, '1 4');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', '1 4'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('sharp', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['0', '0'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('rounded', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '1');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['1', '0'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('curved', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '1');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['0', '1'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('collapsible', function() { ui.menus.toggleStyle('container'); });
	this.addAction('editStyle...', mxUtils.bind(this, function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null && cells.length > 0)
		{
			var model = graph.getModel();
			
	    	var dlg = new TextareaDialog(this.editorUi, mxResources.get('enterValue')+ ' (' + mxResources.get('style') + ')' + ':',
	    			model.getStyle(cells[0]) || '', function(newValue)
			{
	    		if (newValue != null)
				{
					graph.setCellStyle(mxUtils.trim(newValue), cells);
				}
			});
			this.editorUi.showDialog(dlg.container, 320, 200, true, true);
			dlg.init();
		}
	}), null, null, 'Ctrl+E');
	this.addAction('setAsDefaultStyle', function()
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			ui.setDefaultStyle(graph.getSelectionCell());
		}
	}, null, null, 'Ctrl+Shift+D');
	this.addAction('clearDefaultStyle', function()
	{
		if (graph.isEnabled())
		{
			ui.clearDefaultStyle();
		}
	}, null, null, 'Ctrl+Shift+R');
	this.addAction('addWaypoint', function()
	{
		var cell = graph.getSelectionCell();
		
		if (cell != null && graph.getModel().isEdge(cell))
		{
			var handler = editor.graph.selectionCellsHandler.getHandler(cell);
			
			if (handler instanceof mxEdgeHandler)
			{
				var t = graph.view.translate;
				var s = graph.view.scale;
				var dx = t.x;
				var dy = t.y;
				
				var parent = graph.getModel().getParent(cell);
				var pgeo = graph.getCellGeometry(parent);
				
				while (graph.getModel().isVertex(parent) && pgeo != null)
				{
					dx += pgeo.x;
					dy += pgeo.y;
					
					parent = graph.getModel().getParent(parent);
					pgeo = graph.getCellGeometry(parent);
				}
				
				var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
				var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));
				
				handler.addPointAt(handler.state, x, y);
			}
		}
	});
	this.addAction('removeWaypoint', function()
	{
		// TODO: Action should run with "this" set to action
		var rmWaypointAction = ui.actions.get('removeWaypoint');
		
		if (rmWaypointAction.handler != null)
		{
			// NOTE: Popupevent handled and action updated in Menus.createPopupMenu
			rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
		}
	});
	this.addAction('clearWaypoints', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (graph.getModel().isEdge(cell))
					{
						var geo = graph.getCellGeometry(cell);
			
						if (geo != null)
						{
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	});
	this.addAction('insertLink', function()
	{
		if (graph.isEnabled())
		{
			var dlg = new LinkDialog(ui, '', mxResources.get('insert'), function(link, docs)
			{
				link = mxUtils.trim(link);
				
				if (link.length > 0)
				{
					var title = link.substring(link.lastIndexOf('/') + 1);
					var icon = null;
					
					if (docs != null && docs.length > 0)
					{
						icon = docs[0].iconUrl;
						title = docs[0].name || docs[0].type;
						title = title.charAt(0).toUpperCase() + title.substring(1);
						
						if (title.length > 30)
						{
							title = title.substring(0, 30) + '...';
						}
					}
            		
					var gs = graph.getGridSize();
					var dx = graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
					var dy = graph.container.scrollTop / graph.view.scale - graph.view.translate.y;
					
            	    var linkCell = new mxCell(title, new mxGeometry(graph.snap(dx + gs), graph.snap(dy + gs), 100, 40),
            	    	'fontColor=#0000EE;fontStyle=4;rounded=1;overflow=hidden;' + ((icon != null) ?
            	    	'shape=label;imageWidth=16;imageHeight=16;spacingLeft=26;align=left;image=' + icon :
            	    	'spacing=10;'));
            	    linkCell.vertex = true;

            	    graph.setLinkForCell(linkCell, link);
            	    graph.cellSizeUpdated(linkCell, true);
            	    graph.setSelectionCell(graph.addCell(linkCell));
				}
			});
			
			ui.showDialog(dlg.container, 320, 90, true, true);
			dlg.init();
		}
	}).isEnabled = isGraphEnabled;
	this.addAction('image...', function()
	{
		if (graph.isEnabled())
		{
			var title = mxResources.get('image') + ' (' + mxResources.get('url') + '):';
	    	var state = graph.getView().getState(graph.getSelectionCell());
	    	var value = '';
	    	
	    	if (state != null)
	    	{
	    		value = state.style[mxConstants.STYLE_IMAGE] || value;
	    	}
	    	
	    	var selectionState = graph.cellEditor.saveSelection();
	    	
	    	ui.showImageDialog(title, value, function(newValue, w, h)
			{
	    		// Inserts image into HTML text
	    		if (graph.cellEditor.isContentEditing())
	    		{
	    			graph.cellEditor.restoreSelection(selectionState);
	    			
					// To find the new image, we create a list of all existing links first
	    			if (newValue != null)
	    			{
						var tmp = graph.cellEditor.text2.getElementsByTagName('img');
						var oldImages = [];
						
						for (var i = 0; i < tmp.length; i++)
						{
							oldImages.push(tmp[i]);
						}
				
						document.execCommand('insertimage', false, newValue);
						
						// Sets size of new image
						var newImages = graph.cellEditor.text2.getElementsByTagName('img');
						
						if (newImages.length == oldImages.length + 1)
						{
							// Inverse order in favor of appended images
							for (var i = newImages.length - 1; i >= 0; i--)
							{
								if (i == 0 || newImages[i] != oldImages[i - 1])
								{
									ui.loadImage(newValue, function(img)
						    		{
										newImages[i].style.width = img.width + 'px';
										newImages[i].style.height = img.height + 'px';
						    		});
									
									break;
								}
							}
						}
	    			}
	    		}
	    		else
	    		{
					var cells = graph.getSelectionCells();

					if (cells.length > 0 || newValue != null)
					{
						var select = null;
						
						graph.getModel().beginUpdate();
			        	try
			        	{
			        		// Inserts new cell if no cell is selected
			    			if (cells.length == 0)
			    			{
			    				var gs = graph.getGridSize();
								var dx = graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
								var dy = graph.container.scrollTop / graph.view.scale - graph.view.translate.y;
			    				
			    				cells = [graph.insertVertex(graph.getDefaultParent(), null, '',
			    						graph.snap(dx + gs), graph.snap(dy + gs), w, h,
			    						'shape=image;verticalLabelPosition=bottom;verticalAlign=top;')];
			    				select = cells;
			    			}
			    			
			        		graph.setCellStyles(mxConstants.STYLE_IMAGE, newValue, cells);
			        		
			        		// Sets shape only if not already shape with image (label or image)
			        		var state = graph.view.getState(cells[0]);
			        		var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);
			        		
			        		if (style[mxConstants.STYLE_SHAPE] != 'image' && style[mxConstants.STYLE_SHAPE] != 'label')
			        		{
			        			graph.setCellStyles(mxConstants.STYLE_SHAPE, 'image', cells);
			        		}
				        	
				        	if (graph.getSelectionCount() == 1)
				        	{
					        	if (w != null && h != null)
					        	{
					        		var cell = cells[0];
					        		var geo = graph.getModel().getGeometry(cell);
					        		
					        		if (geo != null)
					        		{
					        			geo = geo.clone();
						        		geo.width = w;
						        		geo.height = h;
						        		graph.getModel().setGeometry(cell, geo);
					        		}
					        	}
				        	}
			        	}
			        	finally
			        	{
			        		graph.getModel().endUpdate();
			        	}
			        	
			        	if (select != null)
			        	{
			        		graph.setSelectionCells(select);
			        		graph.scrollCellToVisible(select[0]);
			        	}
					}
	    		}
			}, graph.cellEditor.isContentEditing());
		}
	}).isEnabled = isGraphEnabled;
	action = this.addAction('layers', mxUtils.bind(this, function()
	{
		if (this.layersWindow == null)
		{
			// LATER: Check outline window for initial placement
			this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 180);
			this.layersWindow.window.setVisible(true);
		}
		else
		{
			this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
		}
	}), null, null, 'Ctrl+Shift+L');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.layersWindow != null && this.layersWindow.window.isVisible(); }));
	action = this.addAction('formatPanel', mxUtils.bind(this, function()
	{
		ui.formatWidth = (ui.formatWidth > 0) ? 0 : 240;
		ui.formatContainer.style.display = (ui.formatWidth > 0) ? '' : 'none';
		ui.refresh();
		ui.fireEvent(new mxEventObject('formatWidthChanged'));
	}), null, null, 'Ctrl+Shift+P');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return ui.formatWidth > 0; }));
	action = this.addAction('outline', mxUtils.bind(this, function()
	{
		if (this.outlineWindow == null)
		{
			// LATER: Check layers window for initial placement
			this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
			this.outlineWindow.window.setVisible(true);
		}
		else
		{
			this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
		}
	}), null, null, 'Ctrl+Shift+O');
	
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.scrollbars; });
	
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.outlineWindow != null && this.outlineWindow.window.isVisible(); }));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{
	var title;
	
	if (key.substring(key.length - 3) == '...')
	{
		key = key.substring(0, key.length - 3);
		title = mxResources.get(key) + '...';
	}
	else
	{
		title = mxResources.get(key);
	}
	
	return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function(name, action)
{
	this.actions[name] = action;
	
	return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function(name)
{
	return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut)
{
	mxEventSource.call(this);
	this.label = label;
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
	this.iconCls = iconCls;
	this.shortcut = shortcut;
	this.visible = true;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function(value)
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
Action.prototype.isEnabled = function()
{
	return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function(value)
{
	this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function(funct)
{
	this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function()
{
	return this.selectedCallback();
};
