/**
 * $Id: Actions.js,v 1.36 2012-07-26 19:11:58 gaudenz Exp $
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

	// File actions
	this.addAction('new', function() { window.open(ui.getUrl()); });
	this.addAction('open', function()
	{
		window.openNew = true;
		window.openKey = 'open';
		
		ui.openFile();
	});
	this.addAction('import', function()
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
	});
	this.addAction('save', function() { ui.saveFile(false); }, null, null, 'Ctrl+S');
	this.addAction('saveAs', function() { ui.saveFile(true); }, null, null, 'Ctrl+Shift-S');
	this.addAction('export', function() { ui.showDialog(new ExportDialog(ui).container, 300, 200, true, true); }, null, null, 'Ctrl+E');
	this.put('editFile', new Action(mxResources.get('edit'), mxUtils.bind(this, function()
	{
		this.editorUi.showDialog(new EditFileDialog(ui).container, 620, 420, true, true);
	})));
	this.addAction('pageSetup', function() { ui.showDialog(new PageSetupDialog(ui).container, 300, 200, true, true); });
	this.addAction('print', function() { ui.showDialog(new PrintDialog(ui).container, 300, 200, true, true); }, null, 'sprite-print', 'Ctrl+P');
	this.addAction('preview', function() { mxUtils.show(graph, null, 10, 10); });
	
	// Edit actions
	this.addAction('undo', function() { editor.undoManager.undo(); }, null, 'sprite-undo', 'Ctrl+Z');
	this.addAction('redo', function() { editor.undoManager.redo(); }, null, 'sprite-redo', 'Ctrl+Y');
	this.addAction('cut', function() { mxClipboard.cut(graph); }, null, 'sprite-cut', 'Ctrl+X');
	this.addAction('copy', function() { mxClipboard.copy(graph); }, null, 'sprite-copy', 'Ctrl+C');
	this.addAction('paste', function() { mxClipboard.paste(graph); }, false, 'sprite-paste', 'Ctrl+V');
	this.addAction('delete', function() { graph.removeCells(); }, null, null, 'Delete');
	this.addAction('duplicate', function()
    {
		var s = graph.gridSize;
		graph.setSelectionCells(graph.moveCells(graph.getSelectionCells(), s, s, true));
    }, null, null, 'Ctrl+D');
	this.addAction('selectVertices', function() { graph.selectVertices(); }, null, null, 'Ctrl+Shift+V');
	this.addAction('selectEdges', function() { graph.selectEdges(); }, null, null, 'Ctrl+Shift+E');
	this.addAction('selectAll', function() { graph.selectAll(); }, null, null, 'Ctrl+A');

	// Navigation actions
	this.addAction('home', function() { graph.home(); }, null, null, 'Home');
	this.addAction('exitGroup', function() { graph.exitGroup(); }, null, null, 'Page Up');
	this.addAction('enterGroup', function() { graph.enterGroup(); }, null, null, 'Page Down');
	this.addAction('expand', function() { graph.foldCells(false); }, null, null, 'Enter');
	this.addAction('collapse', function() { graph.foldCells(true); }, null, null, 'Backspace');

	// Arrange actions
	this.addAction('toFront', function() { graph.orderCells(false); }, null, null, 'Ctrl+F');
	this.addAction('toBack', function() { graph.orderCells(true); }, null, null, 'Ctrl+B');
	this.addAction('group', function() { graph.setSelectionCell(graph.groupCells(null, 0)); }, null, null, 'Ctrl+G');
	this.addAction('ungroup', function() { graph.setSelectionCells(graph.ungroupCells()); }, null, null, 'Ctrl+U');
	this.addAction('removeFromGroup', function() { graph.removeCellsFromParent(); });
	this.addAction('editLink', function()
	{
		var cell = graph.getSelectionCell();
		var link = graph.getLinkForCell(cell);
		
		if (link == null)
		{
			link = '';
		}
		
		link = mxUtils.prompt(mxResources.get('enterValue'), link);
		
		if (link != null)
		{
			graph.setLinkForCell(cell, link);
		}
	});
	this.addAction('openLink', function()
	{
		var cell = graph.getSelectionCell();
		var link = graph.getLinkForCell(cell);
		
		if (link != null)
		{
			window.open(link);
		}
	});
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
	this.addAction('rotation', function()
	{
		var value = '0';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		value = state.style[mxConstants.STYLE_ROTATION] || value;
    	}

		value = mxUtils.prompt(mxResources.get('enterValue') + ' (' +
				mxResources.get('rotation') + ' 0-360)', value);
        	
    	if (value != null)
    	{
        	graph.setCellStyles(mxConstants.STYLE_ROTATION, value);
        }
	});
	this.addAction('rotate', function()
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
					
					if (graph.getModel().isVertex(cell) && graph.getModel().getChildCount(cell) == 0)
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
						}
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	}, null, null, 'Ctrl+R');
	
	// View actions
	this.addAction('actualSize', function()
	{
		graph.zoomTo(1);
	});
	this.addAction('zoomIn', function() { graph.zoomIn(); }, null, null, 'Add');
	this.addAction('zoomOut', function() { graph.zoomOut(); }, null, null, 'Subtract');
	this.addAction('fitWindow', function() { graph.fit(); });

	this.addAction('fitPage', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 20;
		var ch = graph.container.clientHeight - 20;
		
		var scale = Math.floor(100 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 100;
		graph.zoomTo(scale);
		
		graph.container.scrollLeft = Math.round(graph.view.translate.x * scale - Math.max(10, (graph.container.clientWidth - fmt.width * ps * scale) / 2));
		graph.container.scrollTop = Math.round(graph.view.translate.y * scale - Math.max(10, (graph.container.clientHeight - fmt.height * ps * scale) / 2));
	}));
	this.addAction('fitPageWidth', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 20;
		
		var scale = Math.floor(100 * cw / fmt.width / ps) / 100;
		graph.zoomTo(scale);
		
		graph.container.scrollLeft = Math.round(graph.view.translate.x * scale - Math.max(10, (graph.container.clientWidth - fmt.width * ps * scale) / 2));
		graph.container.scrollTop = Math.round(graph.view.translate.y * scale - Math.max(10, (graph.container.clientHeight - fmt.height * ps * scale) / 2));
	}));
	this.put('customZoom', new Action(mxResources.get('custom'), function()
	{
    	var value = mxUtils.prompt(mxResources.get('enterValue') + ' (%)', parseInt(graph.getView().getScale() * 100));
    	
    	if (value != null && value.length > 0 && !isNaN(parseInt(value)))
    	{
    		graph.zoomTo(parseInt(value) / 100);
        }
	}));
	
	// Option actions
	var action = null;
	action = this.addAction('grid', function()
	{
		graph.setGridEnabled(!graph.isGridEnabled());
		editor.updateGraphComponents();
	}, null, null, 'Ctrl+Shift+G');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.isGridEnabled(); });
	action = this.addAction('guides', function() { graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled; });
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.graphHandler.guidesEnabled; });
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
		graph.scrollbars = !graph.scrollbars;
		editor.updateGraphComponents();

		if (!graph.scrollbars)
		{
			var t = graph.view.translate;
			graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
			graph.container.scrollLeft = 0;
			graph.container.scrollTop = 0;
			graph.sizeDidChange();
		}
		else
		{
			var dx = graph.view.translate.x;
			var dy = graph.view.translate.y;

			graph.view.translate.x = 0;
			graph.view.translate.y = 0;
			graph.sizeDidChange();
			graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
			graph.container.scrollTop -= Math.round(dy * graph.view.scale);
		}
	}, !mxClient.IS_TOUCH);
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.container.style.overflow == 'auto'; });
	action = this.addAction('pageView', mxUtils.bind(this, function()
	{
		graph.pageVisible = !graph.pageVisible;
		graph.pageBreaksVisible = graph.pageVisible; 
		graph.preferPageSize = graph.pageBreaksVisible;
		graph.view.validate();
		graph.sizeDidChange();
		
		editor.updateGraphComponents();
		editor.outline.update();
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			if (graph.pageVisible)
			{
				graph.container.scrollLeft -= 20;
				graph.container.scrollTop -= 20;
			}
			else
			{
				graph.container.scrollLeft += 20;
				graph.container.scrollTop += 20;
			}
		}
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.pageVisible; });
	this.put('pageBackgroundColor', new Action(mxResources.get('backgroundColor'), function()
	{
		var apply = function(color)
		{
			graph.background = color;
			editor.updateGraphComponents();
		};

		var cd = new ColorDialog(ui, graph.background || 'none', apply);
		ui.showDialog(cd.container, 220, 360, true, false);
		
		if (!mxClient.IS_TOUCH)
		{
			cd.colorInput.focus();
		}
	}));
	action = this.addAction('connect', function()
	{
		graph.setConnectable(!graph.connectionHandler.isEnabled());
	}, null, null, 'Ctrl+Q');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isEnabled(); });
	
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
	this.put('about', new Action(mxResources.get('about') + ' Graph Editor', function()
	{
		ui.showDialog(new AboutDialog(ui).container, 320, 280, true, true);
	}, null, null, 'F1'));
	
	// Font style actions
	var toggleFontStyle = mxUtils.bind(this, function(key, style)
	{
		this.addAction(key, function()
		{
			graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);
		});
	});
	
	toggleFontStyle('bold', mxConstants.FONT_BOLD);
	toggleFontStyle('italic', mxConstants.FONT_ITALIC);
	toggleFontStyle('underline', mxConstants.FONT_UNDERLINE);
	
	// Color actions
	this.addAction('fontColor', function() { ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR); });
	this.addAction('strokeColor', function() { ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR); });
	this.addAction('fillColor', function() { ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR); });
	this.addAction('gradientColor', function() { ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR); });
	this.addAction('backgroundColor', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR); });
	this.addAction('borderColor', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR); });
	
	// Format actions
	this.addAction('shadow', function() { graph.toggleCellStyles(mxConstants.STYLE_SHADOW); });
	this.addAction('dashed', function() { graph.toggleCellStyles(mxConstants.STYLE_DASHED); });
	this.addAction('rounded', function() { graph.toggleCellStyles(mxConstants.STYLE_ROUNDED); });
	this.addAction('style', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null && cells.length > 0)
		{
			var model = graph.getModel();
			var style = mxUtils.prompt(mxResources.get('enterValue')+ ' (' + mxResources.get('style') + ')',
					model.getStyle(cells[0]) || '');

			if (style != null)
			{
				graph.setCellStyle(style, cells);
			}
		}
	});
	this.addAction('setAsDefaultEdge', function()
	{
		var cell = graph.getSelectionCell();
		
		if (cell != null && graph.getModel().isEdge(cell))
		{
			// Take a snapshot of the cell at the moment of calling
			var proto = graph.getModel().cloneCells([cell])[0];
			
			// Delete entry-/exitXY styles
			var style = proto.getStyle();
			style = mxUtils.setStyle(style, mxConstants.STYLE_ENTRY_X, '');
			style = mxUtils.setStyle(style, mxConstants.STYLE_ENTRY_Y, '');
			style = mxUtils.setStyle(style, mxConstants.STYLE_EXIT_X, '');
			style = mxUtils.setStyle(style, mxConstants.STYLE_EXIT_Y, '');
			proto.setStyle(style);
			
			// Uses edge template for connect preview
			graph.connectionHandler.createEdgeState = function(me)
			{
	    		return graph.view.createState(proto);
		    };
	
		    // Creates new connections from edge template
		    graph.connectionHandler.factoryMethod = function()
		    {
	    		return graph.cloneCells([proto])[0];
		    };
		}
	});
	this.addAction('image', function()
	{
		function updateImage(value, w, h)
		{
			var select = null;
			var cells = graph.getSelectionCells();
			
			graph.getModel().beginUpdate();
        	try
        	{
        		// Inserts new cell if no cell is selected
    			if (cells.length == 0)
    			{
    				var gs = graph.getGridSize();
    				cells = [graph.insertVertex(graph.getDefaultParent(), null, '', gs, gs, w, h)];
    				select = cells;
    			}
    			
        		graph.setCellStyles(mxConstants.STYLE_IMAGE, value, cells);
	        	graph.setCellStyles(mxConstants.STYLE_SHAPE, 'image', cells);
	        	
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
		};

    	var value = '';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		value = state.style[mxConstants.STYLE_IMAGE] || value;
    	}

    	value = mxUtils.prompt(mxResources.get('enterValue') + ' (' + mxResources.get('url') + ')', value);

    	if (value != null)
    	{
    		if (value.length > 0)
    		{
	    		var img = new Image();
	    		
	    		img.onload = function()
	    		{
	    			updateImage(value, img.width, img.height);
	    		};
	    		img.onerror = function()
	    		{
	    			mxUtils.alert(mxResources.get('fileNotFound'));
	    		};
	    		
	    		img.src = value;
    		}
        }
	});
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{
	return this.put(key, new Action(mxResources.get(key), funct, enabled, iconCls, shortcut));
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
