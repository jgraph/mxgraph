/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
Format = function(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();
};

/**
 * Returns information about the current selection.
 */
Format.prototype.labelIndex = 0;

/**
 * Returns information about the current selection.
 */
Format.prototype.currentIndex = 0;

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	this.update = mxUtils.bind(this, function(sender, evt)
	{
		this.clearSelectionState();
		this.refresh();
	});
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, this.update);
	graph.addListener(mxEvent.EDITING_STARTED, this.update);
	graph.addListener(mxEvent.EDITING_STOPPED, this.update);
	graph.getModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
	{
		this.clearSelectionState();
	}));
	
	this.refresh();
};

/**
 * Returns information about the current selection.
 */
Format.prototype.clearSelectionState = function()
{
	this.selectionState = null;
};

/**
 * Returns information about the current selection.
 */
Format.prototype.getSelectionState = function()
{
	if (this.selectionState == null)
	{
		this.selectionState = this.createSelectionState();
	}
	
	return this.selectionState;
};

/**
 * Returns information about the current selection.
 */
Format.prototype.createSelectionState = function()
{
	var cells = this.editorUi.editor.graph.getSelectionCells();
	var result = this.initSelectionState();
	
	for (var i = 0; i < cells.length; i++)
	{
		this.updateSelectionStateForCell(result, cells[i], cells);
	}
	
	return result;
};

/**
 * Returns information about the current selection.
 */
Format.prototype.initSelectionState = function()
{
	return {vertices: [], edges: [], x: null, y: null, width: null, height: null, style: {},
		containsImage: false, containsLabel: false, fill: true, glass: true, rounded: true,
		image: true, shadow: true};
};

/**
 * Returns information about the current selection.
 */
Format.prototype.updateSelectionStateForCell = function(result, cell, cells)
{
	var graph = this.editorUi.editor.graph;
	
	if (graph.getModel().isVertex(cell))
	{
		result.vertices.push(cell);
		var geo = graph.getCellGeometry(cell);
		
		if (geo != null)
		{
			if (geo.width > 0)
			{
				if (result.width == null)
				{
					result.width = geo.width;
				}
				else if (result.width != geo.width)
				{
					result.width = '';
				}
			}
			else
			{
				result.containsLabel = true;
			}
			
			if (geo.height > 0)
			{
				if (result.height == null)
				{
					result.height = geo.height;
				}
				else if (result.height != geo.height)
				{
					result.height = '';
				}
			}
			else
			{
				result.containsLabel = true;
			}
			
			if (!geo.relative || geo.offset != null)
			{
				var x = (geo.relative) ? geo.offset.x : geo.x;
				var y = (geo.relative) ? geo.offset.y : geo.y;
				
				if (result.x == null)
				{
					result.x = x;
				}
				else if (result.x != x)
				{
					result.x = '';
				}
				
				if (result.y == null)
				{
					result.y = y;
				}
				else if (result.y != y)
				{
					result.y = '';
				}
			}
		}
	}
	else if (graph.getModel().isEdge(cell))
	{
		result.edges.push(cell);
	}

	var state = graph.view.getState(cell);
	
	if (state != null)
	{
		result.glass = result.glass && this.isGlassState(state);
		result.rounded = result.rounded && this.isRoundedState(state);
		result.image = result.image && this.isImageState(state);
		result.shadow = result.shadow && this.isShadowState(state);
		result.fill = result.fill && this.isFillState(state);
		
		var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
		result.containsImage = result.containsImage || shape == 'image';
		
		for (var key in state.style)
		{
			var value = state.style[key];
			
			if (value != null)
			{
				if (result.style[key] == null)
				{
					result.style[key] = value;
				}
				else if (result.style[key] != value)
				{
					result.style[key] = '';
				}
			}
		}
	}
};

/**
 * Returns information about the current selection.
 */
Format.prototype.isFillState = function(state)
{
	return state.view.graph.model.isVertex(state.cell) ||
		mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) == 'arrow';
};

/**
 * Returns information about the current selection.
 */
Format.prototype.isGlassState = function(state)
{
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	return (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' ||
			shape == 'ext' || shape == 'swimlane');
};

/**
 * Returns information about the current selection.
 */
Format.prototype.isRoundedState = function(state)
{
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	return (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' || shape == 'corner' ||
			shape == 'parallelogram' || shape == 'swimlane' || shape == 'step' || shape == 'trapezoid' ||
			shape == 'ext' || shape == 'triangle' || shape == 'hexagon' || shape == 'process' ||
			shape == 'rhombus' || shape == 'offPageConnector' || shape == 'loopLimit' || shape == 'tee' ||
			shape == 'manualInput' || shape == 'card' || shape == 'curlyBracket');
};

/**
 * Returns information about the current selection.
 */
Format.prototype.isImageState = function(state)
{
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	return (shape == 'label' || shape == 'image');
};

/**
 * Returns information about the current selection.
 */
Format.prototype.isShadowState = function(state)
{
	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
	
	return (shape != 'image');
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.clear = function()
{
	this.container.innerHTML = '';
	
	// Destroy existing panels
	if (this.panels != null)
	{
		for (var i = 0; i < this.panels.length; i++)
		{
			this.panels[i].destroy();
		}
	}
	
	this.panels = [];
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Format.prototype.refresh = function()
{
	this.clear();
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var div = document.createElement('div');
	div.style.whiteSpace = 'nowrap';
	div.style.color = 'rgb(112, 112, 112)';
	div.style.textAlign = 'left';
	div.style.cursor = 'default';
	
	var label = document.createElement('div');
	label.style.border = '1px solid #c0c0c0';
	label.style.borderWidth = '0px 0px 1px 0px';
	label.style.textAlign = 'center';
	label.style.fontWeight = 'bold';
	label.style.overflow = 'hidden';
	label.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
	label.style.paddingTop = '8px';
	label.style.height = (mxClient.IS_QUIRKS) ? '34px' : '25px';
	label.style.width = '100%';
	this.container.appendChild(div);
	
	if (graph.isSelectionEmpty())
	{
		mxUtils.write(label, mxResources.get('diagram'));
		div.appendChild(label);
		this.panels.push(new DiagramFormatPanel(this, ui, div));
	}
	else if (graph.isEditing())
	{
		mxUtils.write(label, mxResources.get('text'));
		div.appendChild(label);
		this.panels.push(new TextFormatPanel(this, ui, div));
	}
	else
	{
		var containsLabel = this.getSelectionState().containsLabel;
		var currentLabel = null;
		var currentPanel = null;
		
		var addClickHandler = mxUtils.bind(this, function(elt, panel, index)
		{
			mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
			{
				if (currentLabel != elt)
				{
					if (containsLabel)
					{
						this.labelIndex = index;
					}
					else
					{
						this.currentIndex = index;
					}
					
					if (currentLabel != null)
					{
						currentLabel.style.backgroundColor = '#d7d7d7';
						currentLabel.style.borderBottomWidth = '1px';
					}
	
					currentLabel = elt;
					currentLabel.style.backgroundColor = '';
					currentLabel.style.borderBottomWidth = '0px';
					
					if (currentPanel != panel)
					{
						if (currentPanel != null)
						{
							currentPanel.style.display = 'none';
						}
						
						currentPanel = panel;
						currentPanel.style.display = '';
					}
				}
			}));
			
			if (index == ((containsLabel) ? this.labelIndex : this.currentIndex))
			{
				elt.click();
			}
		});
		
		var idx = 0;

		label.style.backgroundColor = '#d7d7d7';
		label.style.borderLeftWidth = '1px';
		label.style.width = (containsLabel) ? '50%' : '33.3%';
		label.style.width = (containsLabel) ? '50%' : '33.3%';
		var label2 = label.cloneNode(false);
		var label3 = label2.cloneNode(false);

		// Workaround for ignored background in IE
		label2.style.backgroundColor = '#d7d7d7';
		label3.style.backgroundColor = '#d7d7d7';
		
		// Style
		if (containsLabel)
		{
			label2.style.borderLeftWidth = '0px';
		}
		else
		{
			label.style.borderLeftWidth = '0px';
			mxUtils.write(label, mxResources.get('style'));
			div.appendChild(label);
			
			var stylePanel = div.cloneNode(false);
			stylePanel.style.display = 'none';
			this.panels.push(new StyleFormatPanel(this, ui, stylePanel));
			this.container.appendChild(stylePanel);

			addClickHandler(label, stylePanel, idx++);
		}
		
		// Text
		mxUtils.write(label2, mxResources.get('text'));
		div.appendChild(label2);

		var textPanel = div.cloneNode(false);
		textPanel.style.display = 'none';
		this.panels.push(new TextFormatPanel(this, ui, textPanel));
		this.container.appendChild(textPanel);
		
		// Arrange
		
		mxUtils.write(label3, mxResources.get('arrange'));
		div.appendChild(label3);

		var arrangePanel = div.cloneNode(false);
		arrangePanel.style.display = 'none';
		this.panels.push(new ArrangePanel(this, ui, arrangePanel));
		this.container.appendChild(arrangePanel);
		
		addClickHandler(label2, textPanel, idx++);
		addClickHandler(label3, arrangePanel, idx++);
	}
};

/**
 * Base class for format panels.
 */
BaseFormatPanel = function(format, editorUi, container)
{
	this.format = format;
	this.editorUi = editorUi;
	this.container = container;
	this.listeners = [];
};

/**
 * Adds the given color option.
 */
BaseFormatPanel.prototype.getSelectionState = function()
{
	var graph = this.editorUi.editor.graph;
	var cells = graph.getSelectionCells();
	var shape = null;

	for (var i = 0; i < cells.length; i++)
	{
		var state = graph.view.getState(cells[i]);
		
		if (state != null)
		{
			var tmp = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);
			
			if (tmp != null)
			{
				if (shape == null)
				{
					shape = tmp;
				}
				else if (shape != tmp)
				{
					return null;
				}
			}
			
		}
	}
	
	return shape;
};

/**
 * Install input handler.
 */
BaseFormatPanel.prototype.installInputHandler = function(input, key, defaultValue, min, max, unit, textEditFallback)
{
	unit = (unit != null) ? unit : '';
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	min = (min != null) ? min : 1;
	max = (max != null) ? max : 999;
	
	var selState = null;
	var updating = false;
	
	var update = mxUtils.bind(this, function(evt)
	{
		var value = parseInt(input.value);
		
		// Special case: angle mod 360
		if (!isNaN(value) && key == mxConstants.STYLE_ROTATION)
		{
			value = mxUtils.mod(value, 360);
		}
		
		value = Math.min(max, Math.max(min, (isNaN(value)) ? defaultValue : value));
		
		if (graph.cellEditor.isContentEditing() && textEditFallback)
		{
			if (!updating)
			{
				updating = true;
				
				if (selState != null)
				{
					graph.cellEditor.restoreSelection(selState);
					selState = null;
				}
				
				textEditFallback(value);
				input.value = value + unit;
	
				// Restore focus and selection in input
				updating = false;
			}
		}
		else if (value != mxUtils.getValue(this.format.getSelectionState().style, key, defaultValue))
		{
			if (graph.isEditing())
			{
				graph.stopEditing(true);
			}
			
			graph.setCellStyles(key, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [key],
					'values', [value], 'cells', graph.getSelectionCells()));
		}
		
		input.value = value + unit;
		mxEvent.consume(evt);
	});

	if (textEditFallback && graph.cellEditor.isContentEditing())
	{
		// KNOWN: Arrow up/down clear selection text in quirks/IE 8
		// Text size via arrow button limites to 16 in IE11. Why?
		mxEvent.addListener(input, 'mousedown', function()
		{
			selState = graph.cellEditor.saveSelection();
		});
		
		mxEvent.addListener(input, 'touchstart', function()
		{
			selState = graph.cellEditor.saveSelection();
		});
	}
	
	mxEvent.addListener(input, 'change', update);
	mxEvent.addListener(input, 'blur', update);
	
	return update;
};

/**
 * Adds the given option.
 */
BaseFormatPanel.prototype.createPanel = function()
{
	var div = document.createElement('div');
	div.style.padding = '12px 0px 12px 18px';
	div.style.borderBottom = '1px solid #c0c0c0';
	
	return div;
};

/**
 * Adds the given option.
 */
BaseFormatPanel.prototype.createTitle = function(title)
{
	var div = document.createElement('div');
	div.style.padding = '0px 0px 6px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '200px';
	div.style.fontWeight = 'bold';
	mxUtils.write(div, title);
	
	return div;
};

/**
 * 
 */
BaseFormatPanel.prototype.createStepper = function(input, update, step, height, disableFocus)
{
	step = (step != null) ? step : 1;
	height = (height != null) ? height : 8;
	
	if (mxClient.IS_QUIRKS)
	{
		height = height - 2;
	}
	else if (mxClient.IS_MT || document.documentMode >= 8)
	{
		height = height + 1;
	} 
	
	var stepper = document.createElement('div');
	mxUtils.setPrefixedStyle(stepper.style, 'borderRadius', '3px');
	stepper.style.border = '1px solid rgb(192, 192, 192)';
	stepper.style.position = 'absolute';
	
	var up = document.createElement('div');
	up.style.borderBottom = '1px solid rgb(192, 192, 192)';
	up.style.position = 'relative';
	up.style.height = height + 'px';
	up.style.width = '10px';
	up.className = 'geBtnUp';
	stepper.appendChild(up);
	
	var down = up.cloneNode(false);
	down.style.border = 'none';
	down.style.height = height + 'px';
	down.className = 'geBtnDown';
	stepper.appendChild(down);

	mxEvent.addListener(down, 'click', function(evt)
	{
		input.value = (parseInt(input.value) - step);
		
		if (update != null)
		{
			update(evt);
		}
		
		mxEvent.consume(evt);
	});
	
	mxEvent.addListener(up, 'click', function(evt)
	{
		input.value = (parseInt(input.value) + step);
		
		if (update != null)
		{
			update(evt);
		}
		
		mxEvent.consume(evt);
	});
	
	// Disables transfer of focus to DIV but also active state
	// so it's only used for fontSize where the focus should
	// stay on the selected text, but not for any other input.
	if (disableFocus)
	{
		mxEvent.addListener(down, 'mousedown', function(evt)
		{
			mxEvent.consume(evt);
		});
		
		mxEvent.addListener(up, 'mousedown', function(evt)
		{
			mxEvent.consume(evt);
		});
	}
	
	return stepper;
};

/**
 * Adds the given option.
 */
BaseFormatPanel.prototype.createOption = function(label, isCheckedFn, setCheckedFn, listener)
{
	var div = document.createElement('div');
	div.style.padding = '6px 0px 1px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '200px';
	div.style.height = (mxClient.IS_QUIRKS) ? '27px' : '18px';
	
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px 6px 0px 0px';
	div.appendChild(cb);

	var span = document.createElement('span');
	mxUtils.write(span, label);
	div.appendChild(span);

	var applying = false;
	var value = isCheckedFn();
	
	var apply = function(newValue)
	{
		if (!applying)
		{
			applying = true;
			
			if (newValue)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
			
			if (value != newValue)
			{
				value = newValue;
				
				// Checks if the color value needs to be updated in the model
				if (isCheckedFn() != value)
				{
					setCheckedFn(value);
				}
			}
			
			applying = false;
		}
	};

	mxEvent.addListener(div, 'click', function(evt)
	{
		// Toggles checkbox state for click on label
		if (mxEvent.getSource(evt) != cb)
		{
			cb.checked = !cb.checked;
		}
		
		apply(cb.checked);
	});
	
	apply(value);
	
	if (listener != null)
	{
		listener.install(apply);
		this.listeners.push(listener);
	}

	return div;
};

/**
 * The string 'null' means use null in values.
 */
BaseFormatPanel.prototype.createCellOption = function(label, key, defaultValue, enabledValue, disabledValue)
{
	enabledValue = (enabledValue != null) ? ((enabledValue == 'null') ? null : enabledValue) : '1';
	disabledValue = (disabledValue != null) ? ((disabledValue == 'null') ? null : disabledValue) : '0';
	
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.createOption(label, function()
	{
		return mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != disabledValue;
	}, function(checked)
	{
		graph.getModel().beginUpdate();
		try
		{
			var value = (checked) ? enabledValue : disabledValue;
			graph.setCellStyles(key, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [key],
				'values', [value], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, defaultValue) != disabledValue);
			};
			
			graph.getModel().addListener(mxEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	});
};

/**
 * Adds the given color option.
 */
BaseFormatPanel.prototype.createColorOption = function(label, getColorFn, setColorFn, defaultColor, listener, callbackFn, hideCheckbox)
{
	var div = document.createElement('div');
	div.style.padding = '6px 0px 1px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '200px';
	div.style.height = (mxClient.IS_QUIRKS) ? '27px' : '18px';
	
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px 6px 0px 0px';
	
	if (!hideCheckbox)
	{
		div.appendChild(cb);	
	}

	var span = document.createElement('span');
	mxUtils.write(span, label);
	div.appendChild(span);
	
	var applying = false;
	var value = getColorFn();

	var btn = null;

	var apply = function(color, disableUpdate)
	{
		if (!applying)
		{
			applying = true;
			btn.innerHTML = '<div style="width:' + ((mxClient.IS_QUIRKS) ? '30' : '36') + 'px;height:12px;margin:3px;border:1px solid black;background-color:' +
				((color != null && color != mxConstants.NONE) ? color : defaultColor) + ';"></div>';
			
			// Fine-tuning in Firefox, quirks mode and IE8 standards
			if (mxClient.IS_MT || mxClient.IS_QUIRKS || document.documentMode == 8)
			{
				btn.firstChild.style.margin = '0px';
			}
			
			if (color != null && color != mxConstants.NONE)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
	
			btn.style.display = (cb.checked || hideCheckbox) ? '' : 'none';

			if (callbackFn != null)
			{
				callbackFn(color);
			}

			if (!disableUpdate)
			{
				if (hideCheckbox || value != color)
				{
					value = color;
					
					// Checks if the color value needs to be updated in the model
					if (hideCheckbox || getColorFn() != value)
					{
						setColorFn(value);
					}
				}
			}
			
			applying = false;
		}
	};

	btn = mxUtils.button('', mxUtils.bind(this, function(evt)
	{
		this.editorUi.pickColor(value, apply);
		mxEvent.consume(evt);
	}));
	
	btn.style.position = 'absolute';
	btn.style.marginTop = '-4px';
	btn.style.right = (mxClient.IS_QUIRKS) ? '0px' : '20px';
	btn.style.height = '22px';
	btn.className = 'geColorBtn';
	btn.style.display = (cb.checked || hideCheckbox) ? '' : 'none';
	div.appendChild(btn);

	mxEvent.addListener(div, 'click', function(evt)
	{
		// Toggles checkbox state for click on label
		if (mxEvent.getSource(evt) != cb)
		{
			cb.checked = !cb.checked;
		}

		// Overrides default value with current value to make it easier
		// to restore previous value if the checkbox is clicked twice
		if (!cb.checked && value != null && value != mxConstants.NONE &&
			defaultColor != mxConstants.NONE)
		{
			defaultColor = value;
		}
		
		apply((cb.checked) ? defaultColor : mxConstants.NONE);
	});
	
	apply(value, true);
	
	if (listener != null)
	{
		listener.install((hideCheckbox) ? function(color) { apply(color, true) } : apply);
		this.listeners.push(listener);
	}
	
	return div;
};

/**
 * 
 */
BaseFormatPanel.prototype.createCellColorOption = function(label, colorKey, defaultColor, callbackFn, setStyleFn)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.createColorOption(label, function()
	{
		return mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, colorKey, null);
	}, function(color)
	{
		graph.getModel().beginUpdate();
		try
		{
			if (setStyleFn != null)
			{
				setStyleFn(color);
			}
			
			graph.setCellStyles(colorKey, color, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [colorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}, defaultColor || mxConstants.NONE,
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, colorKey, null));
			};
			
			graph.getModel().addListener(mxEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	}, callbackFn);
};

/**
 * 
 */
BaseFormatPanel.prototype.addArrow = function(elt, height)
{
	height = (height != null) ? height : 10;
	
	var arrow = document.createElement('div');
	arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
	arrow.style.padding = '6px';
	arrow.style.paddingRight = '4px';
	
	var m = (10 - height);
	
	if (m > 0)
	{
		arrow.style.paddingTop = (6 - m) + 'px';
	}
	else
	{
		arrow.style.marginTop = '-2px';
	}
	
	arrow.style.height = height + 'px';
	arrow.style.borderLeft = '1px solid #a0a0a0';
	arrow.innerHTML = '<img border="0" src="' + IMAGE_PATH + '/dropdown.png" style="margin-bottom:4px;">';
	mxUtils.setOpacity(arrow, 70);
	
	var symbol = elt.getElementsByTagName('div')[0];
	
	if (symbol != null)
	{
		symbol.style.paddingRight = '6px';
		symbol.style.marginLeft = '4px';
		symbol.style.marginTop = '-1px';
		symbol.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		mxUtils.setOpacity(symbol, 60);
	}

	mxUtils.setOpacity(elt, 100);
	elt.style.border = '1px solid #a0a0a0';
	elt.style.backgroundColor = 'white';
	elt.style.backgroundImage = 'none';
	elt.style.width = 'auto';
	elt.className += ' geColorBtn';
	mxUtils.setPrefixedStyle(elt.style, 'borderRadius', '3px');
	
	elt.appendChild(arrow);
	
	return symbol;
};

/**
 * 
 */
BaseFormatPanel.prototype.addUnitInput = function(container, unit, right, width, update, step, marginTop)
{
	marginTop = (marginTop != null) ? marginTop : 0;
	
	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.marginTop = '-2px';
	input.style.right = (right + 12) + 'px';
	input.style.width = width + 'px';
	container.appendChild(input);
	
	var stepper = this.createStepper(input, update, step);
	stepper.style.marginTop = (marginTop - 2) + 'px';
	stepper.style.right = right + 'px';
	container.appendChild(stepper);

	return input;
};

/**
 * 
 */
BaseFormatPanel.prototype.createRelativeOption = function(label, key)
{
	var graph = this.editorUi.editor.graph;
	var div = this.createPanel();
	mxUtils.write(div, label);
	div.style.fontWeight = 'bold';
	
	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.min(100, Math.max(0, (isNaN(value)) ? 100 : value));
		
		if (value != mxUtils.getValue(graph.view.getState(graph.getSelectionCell()).style, key, 100))
		{
			// Removes entry in style (assumes 100 is default for relative values)
			if (value == 100)
			{
				value = null;
			}
			
			graph.setCellStyles(key, value, graph.getSelectionCells());
		}

		input.value = ((value != null) ? value : '100') + ' %';
		mxEvent.consume(evt);
	};

	var input = this.addUnitInput(div, '%', 20, 40, update, 10, -15);

	var listener = mxUtils.bind(this, function(sender, evt, force)
	{
		if (force || input != document.activeElement)
		{
			var ss = this.format.getSelectionState();
			var tmp = parseInt(mxUtils.getValue(ss.style, key, 100));
			input.value = (isNaN(tmp)) ? '' : tmp + ' %';
		}
	});
	
	mxEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			listener(null, null, true);
			graph.container.focus();
			mxEvent.consume(e);
		}
	});
	
	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'change', update);

	return div;
};

/**
 * 
 */
BaseFormatPanel.prototype.addLabel = function(div, title, right, width)
{
	width = (width != null) ? width : 61;
	
	var label = document.createElement('div');
	mxUtils.write(label, title);
	label.style.position = 'absolute';
	label.style.right = right + 'px';
	label.style.width = width + 'px';
	label.style.marginTop = '6px';
	label.style.textAlign = 'center';
	div.appendChild(label);
};

/**
 * 
 */
BaseFormatPanel.prototype.addKeyHandler = function(input, listener)
{
	mxEvent.addListener(input, 'keydown', mxUtils.bind(this, function(e)
	{
		if (e.keyCode == 13)
		{
			this.editorUi.editor.graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			if (listener != null)
			{
				listener(null, null, true);				
			}

			this.editorUi.editor.graph.container.focus();
			mxEvent.consume(e);
		}
	}));
};

/**
 * 
 */
BaseFormatPanel.prototype.styleButtons = function(elts)
{
	for (var i = 0; i < elts.length; i++)
	{
		mxUtils.setPrefixedStyle(elts[i].style, 'borderRadius', '3px');
		mxUtils.setOpacity(elts[i], 100);
		elts[i].style.border = '1px solid #a0a0a0';
		elts[i].style.padding = '4px';
		elts[i].style.paddingTop = '3px';
		elts[i].style.paddingRight = '1px';
		elts[i].style.margin = '1px';
		elts[i].style.width = '24px';
		elts[i].style.height = '20px';
		elts[i].className += ' geColorBtn';
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BaseFormatPanel.prototype.destroy = function()
{
	if (this.listeners != null)
	{
		for (var i = 0; i < this.listeners.length; i++)
		{
			this.listeners[i].destroy();
		}
		
		this.listeners = null;
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
ArrangePanel = function(format, editorUi, container)
{
	BaseFormatPanel.call(this, format, editorUi, container);
	this.init();
};

mxUtils.extend(ArrangePanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
ArrangePanel.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
	var ss = this.format.getSelectionState();

	this.container.appendChild(this.addLayerOps(this.createPanel()));
	// Special case that adds two panels
	this.addGeometry(this.container);
	this.container.appendChild(this.addAngle(this.createPanel()));
	
	if (!ss.containsLabel)
	{
		this.container.appendChild(this.addFlip(this.createPanel()));
	}

	if (graph.getSelectionCount() > 1)
	{
		this.container.appendChild(this.addAlign(this.createPanel()));
		this.container.appendChild(this.addDistribute(this.createPanel()));
	}
	
	this.container.appendChild(this.addGroupOps(this.createPanel()));
};

/**
 * 
 */
ArrangePanel.prototype.addLayerOps = function(div)
{
	var ui = this.editorUi;
	
	var btn = mxUtils.button(mxResources.get('toFront'), function(evt)
	{
		ui.actions.get('toFront').funct();
	})
	
	btn.setAttribute('title', 'Ctrl+Shift+F');
	btn.style.width = '100px';
	btn.style.marginRight = '2px';
	div.appendChild(btn);
	
	var btn = mxUtils.button(mxResources.get('toBack'), function(evt)
	{
		ui.actions.get('toBack').funct();
	})
	
	btn.setAttribute('title', 'Ctrl+Shift+B');
	btn.style.width = '100px';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addGroupOps = function(div)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var cell = graph.getSelectionCell();
	var count = 0;

	if (graph.getSelectionCount() > 1)
	{
		var btn = mxUtils.button(mxResources.get('group'), function(evt)
		{
			ui.actions.get('group').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+G');
		btn.style.width = '202px';
		div.appendChild(btn);
		mxUtils.br(div);
		count++;
	}
	else if (graph.getSelectionCount() == 1 && !graph.getModel().isEdge(cell) && !graph.isSwimlane(cell) &&
			graph.getModel().getChildCount(cell) > 0)
	{
		var btn = mxUtils.button(mxResources.get('ungroup'), function(evt)
		{
			ui.actions.get('ungroup').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+Shift+G');
		btn.style.width = '202px';
		div.appendChild(btn);
		mxUtils.br(div);
		count++;
	}
	
	if (graph.getSelectionCount() == 1 && graph.getModel().isVertex(cell) &&
   		graph.getModel().isVertex(graph.getModel().getParent(cell)))
	{
		var btn = mxUtils.button(mxResources.get('removeFromGroup'), function(evt)
		{
			ui.actions.get('removeFromGroup').funct();
		})
		
		if (count > 0)
		{
			btn.style.marginTop = '8px';
		}
		
		btn.style.width = '202px';
		div.appendChild(btn);
		count++;
	}
	
	if (count == 0)
	{
		div.style.display = 'none';
	}
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addAlign = function(div)
{
	var graph = this.editorUi.editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '12px';
	div.appendChild(this.createTitle(mxResources.get('align')));
	
	var stylePanel = document.createElement('div');
	stylePanel.style.position = 'relative';
	stylePanel.style.paddingLeft = '0px';
	stylePanel.style.borderWidth = '0px';
	stylePanel.className = 'geToolbarContainer';
	
	if (mxClient.IS_QUIRKS)
	{
		div.style.height = '60px';
	}
	
	var left = this.editorUi.toolbar.addButton('geSprite-alignleft', mxResources.get('left'),
		function() { graph.alignCells(mxConstants.ALIGN_LEFT); }, stylePanel);
	var center = this.editorUi.toolbar.addButton('geSprite-aligncenter', mxResources.get('center'),
		function() { graph.alignCells(mxConstants.ALIGN_CENTER); }, stylePanel);
	var right = this.editorUi.toolbar.addButton('geSprite-alignright', mxResources.get('right'),
		function() { graph.alignCells(mxConstants.ALIGN_RIGHT); }, stylePanel);

	var top = this.editorUi.toolbar.addButton('geSprite-aligntop', mxResources.get('top'),
		function() { graph.alignCells(mxConstants.ALIGN_TOP); }, stylePanel);
	var middle = this.editorUi.toolbar.addButton('geSprite-alignmiddle', mxResources.get('middle'),
		function() { graph.alignCells(mxConstants.ALIGN_MIDDLE); }, stylePanel);
	var bottom = this.editorUi.toolbar.addButton('geSprite-alignbottom', mxResources.get('bottom'),
		function() { graph.alignCells(mxConstants.ALIGN_BOTTOM); }, stylePanel);
	
	this.styleButtons([left, center, right, top, middle, bottom]);
	right.style.marginRight = '6px';
	div.appendChild(stylePanel);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addFlip = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '12px';

	var span = document.createElement('div');
	span.style.marginTop = '2px';
	span.style.marginBottom = '8px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('flip'));
	div.appendChild(span);
	
	var btn = mxUtils.button(mxResources.get('horizontal'), function(evt)
	{
		graph.toggleCellStyles(mxConstants.STYLE_FLIPH, false);
	})
	
	btn.style.width = '100px';
	btn.style.marginRight = '2px';
	div.appendChild(btn);
	
	var btn = mxUtils.button(mxResources.get('vertical'), function(evt)
	{
		graph.toggleCellStyles(mxConstants.STYLE_FLIPV, false);
	})
	
	btn.style.width = '100px';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addDistribute = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '12px';
	
	div.appendChild(this.createTitle(mxResources.get('distribute')));

	var btn = mxUtils.button(mxResources.get('horizontal'), function(evt)
	{
		graph.distributeCells(true);
	})
	
	btn.style.width = '100px';
	btn.style.marginRight = '2px';
	div.appendChild(btn);
	
	var btn = mxUtils.button(mxResources.get('vertical'), function(evt)
	{
		graph.distributeCells(false);
	})
	
	btn.style.width = '100px';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addAngle = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();

	div.style.paddingBottom = '28px';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('angle'));
	div.appendChild(span);
	
	var update = null;
	var input = this.addUnitInput(div, '°', 84, 44, function()
	{
		update.apply(this, arguments);
	});

	if (!ss.containsLabel)
	{
		var btn = mxUtils.button(mxResources.get('turn'), function(evt)
		{
			ui.actions.get('turn').funct();
		})
		
		btn.setAttribute('title', 'Ctrl+R');
		btn.style.position = 'absolute';
		btn.style.marginTop = '-2px';
		btn.style.right = '20px';
		btn.style.width = '61px';
		div.appendChild(btn);
	}

	var listener = mxUtils.bind(this, function(sender, evt, force)
	{
		if (force || document.activeElement != input)
		{
			ss = this.format.getSelectionState();
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_ROTATION, 0));
			input.value = (isNaN(tmp)) ? '' : tmp  + '°';
		}
	});

	update = this.installInputHandler(input, mxConstants.STYLE_ROTATION, 0, 0, 360, '°');
	this.addKeyHandler(input, listener);

	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addGeometry = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var rect = this.format.getSelectionState();
	
	var div = this.createPanel();
	div.style.paddingBottom = '8px';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('size'));
	div.appendChild(span);
	
	var widthUpdate, heightUpdate, leftUpdate, topUpdate;
	var width = this.addUnitInput(div, 'pt', 84, 44, function()
	{
		widthUpdate.apply(this, arguments);
	});
	var height = this.addUnitInput(div, 'pt', 20, 44, function()
	{
		heightUpdate.apply(this, arguments);
	});

	mxUtils.br(div);
	this.addLabel(div, mxResources.get('width'), 84);
	this.addLabel(div, mxResources.get('height'), 20);
	mxUtils.br(div);
	
	var wrapper = document.createElement('div');
	wrapper.style.paddingTop = '8px';
	wrapper.style.paddingRight = '20px';
	wrapper.style.whiteSpace = 'nowrap';
	wrapper.style.textAlign = 'right';
	var opt = this.createCellOption(mxResources.get('constrainProportions'),
		mxConstants.STYLE_ASPECT, null, 'fixed', 'null');
	opt.style.width = '100%';
	wrapper.appendChild(opt);
	div.appendChild(wrapper);
	
	this.addKeyHandler(width, listener);
	this.addKeyHandler(height, listener);

	widthUpdate = this.addGeometryHandler(width, function(geo, value)
	{
		if (geo.width > 0)
		{
			geo.width = Math.max(1, value);
		}
	});
	heightUpdate = this.addGeometryHandler(height, function(geo, value)
	{
		if (geo.height > 0)
		{
			geo.height = Math.max(1, value);
		}
	});
	
	container.appendChild(div);
	
	var div2 = this.createPanel();
	div2.style.paddingBottom = '30px';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('position'));
	div2.appendChild(span);
	
	var left = this.addUnitInput(div2, 'pt', 84, 44, function()
	{
		leftUpdate.apply(this, arguments);
	});
	var top = this.addUnitInput(div2, 'pt', 20, 44, function()
	{
		topUpdate.apply(this, arguments);
	});

	mxUtils.br(div2);
	this.addLabel(div2, mxResources.get('left'), 84);
	this.addLabel(div2, mxResources.get('top'), 20);
	
	var listener = mxUtils.bind(this, function(sender, evt, force)
	{
		rect = this.format.getSelectionState();

		if (!rect.containsLabel && rect.vertices.length == graph.getSelectionCount() &&
			rect.width != null && rect.height != null)
		{
			div.style.display = '';
			
			if (force || document.activeElement != width)
			{
				width.value = rect.width + ((rect.width == '') ? '' : ' pt');
			}
			
			if (force || document.activeElement != height)
			{
				height.value = rect.height + ((rect.height == '') ? '' : ' pt');
			}
		}
		else
		{
			div.style.display = 'none';
		}
		
		if (rect.vertices.length == graph.getSelectionCount() &&
			rect.x != null && rect.y != null)
		{
			div2.style.display = '';
			
			if (force || document.activeElement != left)
			{
				left.value = rect.x  + ((rect.x == '') ? '' : ' pt');
			}
			
			if (force || document.activeElement != top)
			{
				top.value = rect.y + ((rect.y == '') ? '' : ' pt');
			}
		}
		else
		{
			div2.style.display = 'none';
		}
	});

	this.addKeyHandler(left, listener);
	this.addKeyHandler(top, listener);

	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
	
	leftUpdate = this.addGeometryHandler(left, function(geo, value)
	{
		if (geo.relative)
		{
			geo.offset.x = value;
		}
		else
		{
			geo.x = value;
		}
	});
	topUpdate = this.addGeometryHandler(top, function(geo, value)
	{
		if (geo.relative)
		{
			geo.offset.y = value;
		}
		else
		{
			geo.y = value;
		}
	});

	container.appendChild(div2);
};

/**
 * 
 */
ArrangePanel.prototype.addGeometryHandler = function(input, fn)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var initialValue = null;
	
	function update(evt)
	{
		if (input.value != '')
		{
			var value = parseInt(input.value);

			if (value != initialValue)
			{
				graph.getModel().beginUpdate();
				try
				{
					var cells = graph.getSelectionCells();
					
					for (var i = 0; i < cells.length; i++)
					{
						if (graph.getModel().isVertex(cells[i]))
						{
							var geo = graph.getCellGeometry(cells[i]);
							
							if (geo != null)
							{
								geo = geo.clone();
								fn(geo, value);
								
								graph.getModel().setGeometry(cells[i], geo);
							}
						}
					}
				}
				finally
				{
					graph.getModel().endUpdate();
				}
				
				initialValue = value;
				input.value = value + ' pt';
			}
			else if (isNaN(value)) 
			{
				input.value = initialValue + ' pt';
			}
		}
		
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'focus', function()
	{
		initialValue = input.value;
	});
	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'change', update);
	
	return update;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel = function(format, editorUi, container)
{
	BaseFormatPanel.call(this, format, editorUi, container);
	this.init();
};

mxUtils.extend(TextFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel.prototype.init = function()
{
	this.container.style.borderBottom = 'none';
	this.addFont(this.container);
};

/**
 * Adds the label menu items to the given menu and parent.
 */
TextFormatPanel.prototype.addFont = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
	
	var title = this.createTitle(mxResources.get('font'));
	title.style.paddingLeft = '18px';
	title.style.paddingTop = '10px';
	title.style.paddingBottom = '6px';
	container.appendChild(title);

	var stylePanel = this.createPanel();
	stylePanel.style.paddingTop = '2px';
	stylePanel.style.paddingBottom = '2px';
	stylePanel.style.position = 'relative';
	stylePanel.style.marginLeft = '-2px';
	stylePanel.style.borderWidth = '0px';
	stylePanel.className = 'geToolbarContainer';
	
	if (mxClient.IS_QUIRKS)
	{
		stylePanel.style.display = 'block';
	}

	if (graph.cellEditor.isContentEditing())
	{
		var cssPanel = stylePanel.cloneNode();
		
		var cssMenu = this.editorUi.toolbar.addMenu(mxResources.get('style'),
			mxResources.get('style'), true, 'formatBlock', cssPanel);
		cssMenu.style.color = 'rgb(112, 112, 112)';
		cssMenu.style.whiteSpace = 'nowrap';
		cssMenu.style.overflow = 'hidden';
		cssMenu.style.margin = '0px';
		this.addArrow(cssMenu);
		cssMenu.style.width = '192px';
		cssMenu.style.height = '15px';
		
		var arrow = cssMenu.getElementsByTagName('div')[0];
		arrow.style.cssFloat = 'right';
		container.appendChild(cssPanel);
	}
	
	container.appendChild(stylePanel);
	
	var colorPanel = this.createPanel();
	colorPanel.style.marginTop = '10px';
	colorPanel.style.borderTop = '1px solid #c0c0c0';
	colorPanel.style.paddingTop = '10px';
	colorPanel.style.paddingBottom = '10px';

	var fontMenu = this.editorUi.toolbar.addMenu('Helvetica', mxResources.get('fontFamily'), true, 'fontFamily', stylePanel);
	fontMenu.style.color = 'rgb(112, 112, 112)';
	fontMenu.style.whiteSpace = 'nowrap';
	fontMenu.style.overflow = 'hidden';
	fontMenu.style.margin = '0px';
	
	this.addArrow(fontMenu);
	fontMenu.style.width = '192px';
	fontMenu.style.height = '15px';
	
	var stylePanel2 = stylePanel.cloneNode(false);
	stylePanel2.style.marginLeft = '-3px';
	var fontStyleItems = this.editorUi.toolbar.addItems(['bold', 'italic', 'underline'], stylePanel2, true);
	container.appendChild(stylePanel2);

	this.styleButtons(fontStyleItems);
	
	var stylePanel3 = stylePanel.cloneNode(false);
	stylePanel3.style.marginLeft = '-3px';
	stylePanel3.style.paddingBottom = '0px';
	
	var left = this.editorUi.toolbar.addButton('geSprite-left', mxResources.get('left'),
			(graph.cellEditor.isContentEditing()) ?
			function()
			{
				document.execCommand('justifyleft');
			} : this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT]), stylePanel3);
	var center = this.editorUi.toolbar.addButton('geSprite-center', mxResources.get('center'),
			(graph.cellEditor.isContentEditing()) ?
			function()
			{
				document.execCommand('justifycenter');
			} : this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER]), stylePanel3);
	var right = this.editorUi.toolbar.addButton('geSprite-right', mxResources.get('right'),
			(graph.cellEditor.isContentEditing()) ?
			function()
			{
				document.execCommand('justifyright');
			} : this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT]), stylePanel3);

	this.styleButtons([left, center, right]);

	if (graph.cellEditor.isContentEditing())
	{
		var clear = this.editorUi.toolbar.addButton('geSprite-removeformat', mxResources.get('removeFormat'),
			function()
			{
				document.execCommand('removeformat');
			}, stylePanel2);
		this.styleButtons([clear]);
	}
	
	var top = this.editorUi.toolbar.addButton('geSprite-top', mxResources.get('top'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP]), stylePanel3);
	var middle = this.editorUi.toolbar.addButton('geSprite-middle', mxResources.get('middle'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE]), stylePanel3);
	var bottom = this.editorUi.toolbar.addButton('geSprite-bottom', mxResources.get('bottom'),
		this.editorUi.menus.createStyleChangeFunction([mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM]), stylePanel3);
	
	this.styleButtons([top, middle, bottom]);
	container.appendChild(stylePanel3);
	
	// Hack for updating UI state below based on current text selection
	// currentTable is the current selected DOM table updated below
	var sub, sup, full, tableWrapper, currentTable, tableCell, tableRow;
	
	if (graph.cellEditor.isContentEditing())
	{
		top.style.display = 'none';
		middle.style.display = 'none';
		bottom.style.display = 'none';
		
		full = this.editorUi.toolbar.addButton('geSprite-justifyfull', null,
			function()
			{
				document.execCommand('justifyfull');
			}, stylePanel3);
		this.styleButtons([full,
       		sup = this.editorUi.toolbar.addButton('geSprite-superscript', mxResources.get('superscript'),
			function()
			{
				document.execCommand('superscript');
			}, stylePanel3), sub = this.editorUi.toolbar.addButton('geSprite-subscript', mxResources.get('subscript'),
			function()
			{
				document.execCommand('subscript');
			}, stylePanel3)]);
		full.style.marginRight = '9px';
		
		var tmp = stylePanel3.cloneNode(false);
		tmp.style.paddingTop = '4px';
		var btns = [this.editorUi.toolbar.addButton('geSprite-orderedlist', mxResources.get('numberelist'),
				function()
				{
					document.execCommand('insertorderedlist');
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-unorderedlist', mxResources.get('bulletedlist'),
				function()
				{
					document.execCommand('insertunorderedlist');
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-outdent', mxResources.get('decreaseIndent'),
					function()
					{
						document.execCommand('outdent');
					}, tmp),
			this.editorUi.toolbar.addButton('geSprite-indent', mxResources.get('increaseIndent'),
				function()
				{
					document.execCommand('indent');
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-code', mxResources.get('html'),
				function()
				{
					graph.cellEditor.toggleViewMode();
				}, tmp)];
		this.styleButtons(btns);
		btns[btns.length - 1].style.marginLeft = '9px';
		container.appendChild(tmp);
	}
	else
	{
		right.style.marginRight = '9px';
	}
	
	var stylePanel4 = stylePanel.cloneNode(false);
	stylePanel4.style.marginLeft = '0px';
	stylePanel4.style.paddingTop = '8px';
	stylePanel4.style.paddingBottom = '4px';
	stylePanel4.style.fontWeight = 'normal';
	
	mxUtils.write(stylePanel4, mxResources.get('position'));
	
	// Adds gradient direction option
	var positionSelect = document.createElement('select');
	positionSelect.style.position = 'absolute';
	positionSelect.style.right = '20px';
	positionSelect.style.width = '97px';
	positionSelect.style.marginTop = '-2px';
	
	var directions = ['center', 'top', 'right', 'bottom', 'left'];
	var lset = {'center': [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE],
			'top': [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM],
			'right': [mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE],
			'bottom': [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP],
			'left': [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE]};

	for (var i = 0; i < directions.length; i++)
	{
		var positionOption = document.createElement('option');
		positionOption.setAttribute('value', directions[i]);
		mxUtils.write(positionOption, mxResources.get(directions[i]));
		positionSelect.appendChild(positionOption);
	}

	stylePanel4.appendChild(positionSelect);
	
	if (!graph.cellEditor.isContentEditing())
	{
		container.appendChild(stylePanel4);
		
		mxEvent.addListener(positionSelect, 'change', function(evt)
		{
			graph.getModel().beginUpdate();
			try
			{
				var vals = lset[positionSelect.value];
				
				if (vals != null)
				{
					graph.setCellStyles(mxConstants.STYLE_LABEL_POSITION, vals[0], graph.getSelectionCells());
					graph.setCellStyles(mxConstants.STYLE_VERTICAL_LABEL_POSITION, vals[1], graph.getSelectionCells());
					graph.setCellStyles(mxConstants.STYLE_ALIGN, vals[2], graph.getSelectionCells());
					graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, vals[3], graph.getSelectionCells());
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
			
			mxEvent.consume(evt);
		});
	}

	// Font size
	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.marginTop = '4px';
	input.style.right = '32px';
	input.style.width = '47px';
	input.style.height = '17px';
	stylePanel2.appendChild(input);

	var inputUpdate = this.installInputHandler(input, mxConstants.STYLE_FONTSIZE, Menus.prototype.defaultFontSize, 1, 999, ' pt',
	function(fontsize)
	{
		// Creates an element with arbitrary size 3
		document.execCommand('fontSize', false, '3');
		
		// Changes the css font size of the first font element inside the in-place editor with size 3
		// hopefully the above element that we've just created. LATER: Check for new element using
		// previous result of getElementsByTagName (see other actions)
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
	
	var stepper = this.createStepper(input, inputUpdate, 1, 10, true);
	stepper.style.display = input.style.display;
	stepper.style.marginTop = '4px';
	stepper.style.right = '20px';
	stylePanel2.appendChild(stepper);
	
	var arrow = fontMenu.getElementsByTagName('div')[0];
	arrow.style.cssFloat = 'right';
	
	var bgColorApply = null;
	var currentBgColor = '#ffffff';
	
	var fontColorApply = null;
	var currentFontColor = '#000000';
		
	var bgPanel = (graph.cellEditor.isContentEditing()) ? this.createColorOption(mxResources.get('backgroundColor'), function()
	{
		return currentBgColor;
	}, function(color)
	{
		document.execCommand('backcolor', false, (color != mxConstants.NONE) ? color : 'transparent');
	}, '#ffffff',
	{
		install: function(apply) { bgColorApply = apply; },
		destroy: function() { bgColorApply = null; }
	}, null, true) : this.createCellColorOption(mxResources.get('backgroundColor'), mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, '#ffffff');
	bgPanel.style.fontWeight = 'bold';

	var borderPanel = this.createCellColorOption(mxResources.get('borderColor'), mxConstants.STYLE_LABEL_BORDERCOLOR, '#000000');
	borderPanel.style.fontWeight = 'bold';
	
	var panel = (graph.cellEditor.isContentEditing()) ? this.createColorOption(mxResources.get('fontColor'), function()
	{
		return currentFontColor
	}, function(color)
	{
		document.execCommand('forecolor', false, (color != mxConstants.NONE) ? color : 'transparent');
	}, '#000000',
	{
		install: function(apply) { fontColorApply = apply; },
		destroy: function() { fontColorApply = null; }
	}, null, true) : this.createCellColorOption(mxResources.get('fontColor'), mxConstants.STYLE_FONTCOLOR, '#000000', function(color)
	{
		if (color == null || color == mxConstants.NONE)
		{
			bgPanel.style.display = 'none';
		}
		else
		{
			bgPanel.style.display = '';
		}
		
		borderPanel.style.display = bgPanel.style.display;
	}, function(color)
	{
		if (color == null || color == mxConstants.NONE)
		{
			graph.setCellStyles(mxConstants.STYLE_NOLABEL, '1', graph.getSelectionCells());
		}
		else
		{
			graph.setCellStyles(mxConstants.STYLE_NOLABEL, null, graph.getSelectionCells());
		}
	});
	panel.style.fontWeight = 'bold';
	
	colorPanel.appendChild(panel);
	colorPanel.appendChild(bgPanel);
	
	if (!graph.cellEditor.isContentEditing())
	{
		colorPanel.appendChild(borderPanel);
	}
	
	container.appendChild(colorPanel);

	var extraPanel = this.createPanel();
	extraPanel.style.paddingTop = '10px';
	extraPanel.style.paddingBottom = '10px';
	
	// LATER: Fix toggle using '' instead of 'null'
	var wwOpt = this.createCellOption(mxResources.get('wordWrap'), mxConstants.STYLE_WHITE_SPACE, null, 'wrap', 'null');
	wwOpt.style.fontWeight = 'bold';
	
	// Word wrap in edge labels only supported via labelWidth style
	if (!ss.containsLabel)
	{
		extraPanel.appendChild(wwOpt);
	}
	
	var htmlOpt = this.createCellOption(mxResources.get('formattedText'), 'html', '0');
	htmlOpt.style.fontWeight = 'bold';
	extraPanel.appendChild(htmlOpt);
	
	var spacingPanel = this.createPanel();
	spacingPanel.style.paddingBottom = '32px';
	spacingPanel.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	mxUtils.write(span, mxResources.get('spacing'));
	spacingPanel.appendChild(span);

	var topUpdate, globalUpdate, leftUpdate, bottomUpdate, rightUpdate;
	var topSpacing = this.addUnitInput(spacingPanel, 'pt', 91, 44, function()
	{
		topUpdate.apply(this, arguments);
	});
	var globalSpacing = this.addUnitInput(spacingPanel, 'pt', 20, 44, function()
	{
		globalUpdate.apply(this, arguments);
	});

	mxUtils.br(spacingPanel);
	this.addLabel(spacingPanel, mxResources.get('top'), 91);
	this.addLabel(spacingPanel, mxResources.get('global'), 20);
	mxUtils.br(spacingPanel);
	mxUtils.br(spacingPanel);

	var leftSpacing = this.addUnitInput(spacingPanel, 'pt', 162, 44, function()
	{
		leftUpdate.apply(this, arguments);
	});
	var bottomSpacing = this.addUnitInput(spacingPanel, 'pt', 91, 44, function()
	{
		bottomUpdate.apply(this, arguments);
	});
	var rightSpacing = this.addUnitInput(spacingPanel, 'pt', 20, 44, function()
	{
		rightUpdate.apply(this, arguments);
	});

	mxUtils.br(spacingPanel);
	this.addLabel(spacingPanel, mxResources.get('left'), 162);
	this.addLabel(spacingPanel, mxResources.get('bottom'), 91);
	this.addLabel(spacingPanel, mxResources.get('right'), 20);
	
	if (!graph.cellEditor.isContentEditing())
	{
		container.appendChild(extraPanel);
		container.appendChild(this.createRelativeOption(mxResources.get('opacity'), mxConstants.STYLE_TEXT_OPACITY));
		container.appendChild(spacingPanel);
	}
	else
	{
		var insertPanel = stylePanel.cloneNode(false);
		insertPanel.style.paddingLeft = '0px';
		var inserBtns = this.editorUi.toolbar.addItems(['link', 'image'], insertPanel, true);
		
		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-horizontalrule', mxResources.get('insertHorizontalRule'),
				function()
				{
					document.execCommand('inserthorizontalrule');
				}, insertPanel),				
				this.editorUi.toolbar.addMenuFunctionInContainer(insertPanel, 'geSprite-table', mxResources.get('table'), false, mxUtils.bind(this, function(menu)
				{
					this.editorUi.menus.addInsertTableItem(menu);
				}))];
		this.styleButtons(inserBtns);
		this.styleButtons(btns);
		
		var wrapper2 = this.createPanel();
		wrapper2.style.paddingTop = '10px';
		wrapper2.style.paddingBottom = '10px';
		wrapper2.appendChild(this.createTitle(mxResources.get('insert')));
		wrapper2.appendChild(insertPanel);
		container.appendChild(wrapper2);
		
		var tablePanel = stylePanel.cloneNode(false);
		tablePanel.style.paddingLeft = '0px';
		
		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-insertcolumnbefore', mxResources.get('insertColumnBefore'),
				function()
				{
		        	if (currentTable != null)
		        	{
		        		graph.selectNode(graph.insertColumn(currentTable, (tableCell != null) ? tableCell.cellIndex : 0));
		        	}
				}, tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertcolumnafter', mxResources.get('insertColumnAfter'),
				function()
				{
					if (currentTable != null)
		        	{
						graph.selectNode(graph.insertColumn(currentTable, (tableCell != null) ? tableCell.cellIndex + 1 : -1));
		        	}
				}, tablePanel),
				this.editorUi.toolbar.addButton('geSprite-deletecolumn', mxResources.get('deleteColumn'),
				function()
				{
					if (currentTable != null && tableCell != null)
					{
						graph.deleteColumn(currentTable, tableCell.cellIndex);
					}
				}, tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertrowbefore', mxResources.get('insertRowBefore'),
				function()
				{
					if (currentTable != null && tableRow != null)
					{
						graph.selectNode(graph.insertRow(currentTable, tableRow.sectionRowIndex));
					}
				}, tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertrowafter', mxResources.get('insertRowAfter'),
				function()
				{
					if (currentTable != null && tableRow != null)
					{
						graph.selectNode(graph.insertRow(currentTable, tableRow.sectionRowIndex + 1));
					}
				}, tablePanel),
				this.editorUi.toolbar.addButton('geSprite-deleterow', mxResources.get('deleteRow'),
				function()
				{
					if (currentTable != null && tableRow != null)
					{
						graph.deleteRow(currentTable, tableRow.sectionRowIndex);
					}
				}, tablePanel)];
		this.styleButtons(btns);
		btns[2].style.marginRight = '9px';
		
		var wrapper3 = this.createPanel();
		wrapper3.style.paddingTop = '10px';
		wrapper3.style.paddingBottom = '10px';
		wrapper3.appendChild(this.createTitle(mxResources.get('table')));
		wrapper3.appendChild(tablePanel);

		var tablePanel2 = stylePanel.cloneNode(false);
		tablePanel2.style.paddingLeft = '0px';
		
		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-strokecolor', mxResources.get('borderColor'),
				mxUtils.bind(this, function()
				{
					if (currentTable != null)
					{
						// Converts rgb(r,g,b) values
						var color = currentTable.style.borderColor.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						this.editorUi.pickColor(color, function(newColor)
						{
							if (newColor == null || newColor == mxConstants.NONE)
							{
								currentTable.removeAttribute('border');
								currentTable.style.border = '';
								currentTable.style.borderCollapse = '';
							}
							else
							{
								currentTable.setAttribute('border', '1');
								currentTable.style.border = '1px solid ' + newColor;
								currentTable.style.borderCollapse = 'collapse';
							}
						});
					}
				}), tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-fillcolor', mxResources.get('backgroundColor'),
				mxUtils.bind(this, function()
				{
					// Converts rgb(r,g,b) values
					if (currentTable != null)
					{
						var color = currentTable.style.backgroundColor.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						this.editorUi.pickColor(color, function(newColor)
						{
							if (newColor == null || newColor == mxConstants.NONE)
							{
								currentTable.style.backgroundColor = '';
							}
							else
							{
								currentTable.style.backgroundColor = newColor;
							}
						});
					}
				}), tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-fit', mxResources.get('spacing'),
				function()
				{
					if (currentTable != null)
					{
						var value = currentTable.getAttribute('cellPadding') || 0;
						
						var dlg = new FilenameDialog(ui, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue)
						{
							if (newValue != null && newValue.length > 0)
							{
								currentTable.setAttribute('cellPadding', newValue);
							}
							else
							{
								currentTable.removeAttribute('cellPadding');
							}
						}), mxResources.get('spacing'));
						ui.showDialog(dlg.container, 300, 80, true, true);
						dlg.init();
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-left', mxResources.get('left'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'left');
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-center', mxResources.get('center'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'center');
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-right', mxResources.get('right'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'right');
					}
				}, tablePanel2)];
		this.styleButtons(btns);
		btns[2].style.marginRight = '9px';
		wrapper3.appendChild(tablePanel2);
		container.appendChild(wrapper3);
		
		tableWrapper = wrapper3;
	}
	
	function setSelected(elt, selected)
	{
		if (mxClient.IS_IE && (mxClient.IS_QUIRKS || document.documentMode < 10))
		{
			elt.style.filter = (selected) ? 'progid:DXImageTransform.Microsoft.Gradient('+
            	'StartColorStr=\'#c5ecff\', EndColorStr=\'#87d4fb\', GradientType=0)' : '';
		}
		else
		{
			elt.style.backgroundImage = (selected) ? 'linear-gradient(#c5ecff 0px,#87d4fb 100%)' : '';
		}
	};
	
	var listener = mxUtils.bind(this, function(sender, evt, force)
	{
		ss = this.format.getSelectionState();
		var fontStyle = mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSTYLE, 0);
		setSelected(fontStyleItems[0], (fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD);
		setSelected(fontStyleItems[1], (fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC);
		setSelected(fontStyleItems[2], (fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE);
		fontMenu.firstChild.nodeValue = mxUtils.htmlEntities(mxUtils.getValue(ss.style, mxConstants.STYLE_FONTFAMILY, Menus.prototype.defaultFont));
		
		if (force || document.activeElement != input)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSIZE, Menus.prototype.defaultFontSize));
			input.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		var align = mxUtils.getValue(ss.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
		setSelected(left, align == mxConstants.ALIGN_LEFT);
		setSelected(center, align == mxConstants.ALIGN_CENTER);
		setSelected(right, align == mxConstants.ALIGN_RIGHT);
		
		var valign = mxUtils.getValue(ss.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
		setSelected(top, valign == mxConstants.ALIGN_TOP);
		setSelected(middle, valign == mxConstants.ALIGN_MIDDLE);
		setSelected(bottom, valign == mxConstants.ALIGN_BOTTOM);
		
		var pos = mxUtils.getValue(ss.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
		var vpos =  mxUtils.getValue(ss.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
		
		if (vpos == mxConstants.ALIGN_TOP)
		{
			positionSelect.value = 'top';
		}
		else if (vpos == mxConstants.ALIGN_BOTTOM)
		{
			positionSelect.value = 'bottom';
		}
		else if (pos == mxConstants.ALIGN_LEFT)
		{
			positionSelect.value = 'left';
		}
		else if (pos == mxConstants.ALIGN_RIGHT)
		{
			positionSelect.value = 'right';
		}
		else
		{
			positionSelect.value = 'center';
		}
		
		if (force || document.activeElement != globalSpacing)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING, 2));
			globalSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}

		if (force || document.activeElement != topSpacing)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_TOP, 0));
			topSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != rightSpacing)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_RIGHT, 0));
			rightSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != bottomSpacing)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_BOTTOM, 0));
			bottomSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != leftSpacing)
		{
			var tmp = parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_LEFT, 0));
			leftSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
	});

	globalUpdate = this.installInputHandler(globalSpacing, mxConstants.STYLE_SPACING, 2, 0, 999, ' pt');
	topUpdate = this.installInputHandler(topSpacing, mxConstants.STYLE_SPACING_TOP, 0, 0, 999, ' pt');
	rightUpdate = this.installInputHandler(rightSpacing, mxConstants.STYLE_SPACING_RIGHT, 0, 0, 999, ' pt');
	bottomUpdate = this.installInputHandler(bottomSpacing, mxConstants.STYLE_SPACING_BOTTOM, 0, 0, 999, ' pt');
	leftUpdate = this.installInputHandler(leftSpacing, mxConstants.STYLE_SPACING_LEFT, 0, 0, 999, ' pt');

	this.addKeyHandler(input, listener);
	this.addKeyHandler(globalSpacing, listener);
	this.addKeyHandler(topSpacing, listener);
	this.addKeyHandler(rightSpacing, listener);
	this.addKeyHandler(bottomSpacing, listener);
	this.addKeyHandler(leftSpacing, listener);

	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
	
	if (graph.cellEditor.isContentEditing())
	{
		var updating = false;
		
		var updateCssHandler = function()
		{
			if (!updating)
			{
				updating = true;
			
				window.setTimeout(function()
				{
					var selectedElement = graph.getSelectedElement();
					var node = selectedElement;
					
					while (node != null && node.nodeType != mxConstants.NODETYPE_ELEMENT)
					{
						node = node.parentNode;
					}
					
					if (node != null)
					{
						var css = mxUtils.getCurrentStyle(node);
						
						setSelected(fontStyleItems[0], css.fontWeight == 'bold' || graph.getParentByName(node, 'B', graph.cellEditor.text2) != null);
						setSelected(fontStyleItems[1], css.fontStyle == 'italic' || graph.getParentByName(node, 'I', graph.cellEditor.text2) != null);
						setSelected(fontStyleItems[2], graph.getParentByName(node, 'U', graph.cellEditor.text2) != null);
						setSelected(left, css.textAlign == 'left');
						setSelected(center, css.textAlign == 'center');
						setSelected(right, css.textAlign == 'right');
						setSelected(full, css.textAlign == 'justify');
						setSelected(sup, graph.getParentByName(node, 'SUP', graph.cellEditor.text2) != null);
						setSelected(sub, graph.getParentByName(node, 'SUB', graph.cellEditor.text2) != null);
						
						currentTable = graph.getParentByName(node, 'TABLE', graph.cellEditor.text2);
						tableRow = (currentTable == null) ? null : graph.getParentByName(node, 'TR', currentTable);
						tableCell = (currentTable == null) ? null : graph.getParentByName(node, 'TD', currentTable);
						tableWrapper.style.display = (currentTable != null) ? '' : 'none';
						
						if (document.activeElement != input)
						{
							input.value = parseInt(css.fontSize) + ' pt';
						}
						
						// Converts rgb(r,g,b) values
						var color = css.color.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						var color2 = css.backgroundColor.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						
						// Updates the color picker for the current font
						if (fontColorApply != null && color.charAt(0) == '#')
						{
							if (color.charAt(0) == '#')
							{
								currentFontColor = color;
							}
							else
							{
								currentFontColor = '#000000';
							}
							
							fontColorApply(currentFontColor);
						}
						
						if (bgColorApply != null)
						{
							if (color2.charAt(0) == '#')
							{
								currentBgColor = color2;
							}
							else
							{
								currentBgColor = null;
							}
							
							bgColorApply(currentBgColor);
						}
						
						// Strips leading and trailing quotes
						var ff = css.fontFamily;
						
						if (ff.charAt(0) == '\'')
						{
							ff = ff.substring(1);
						}
						
						if (ff.charAt(ff.length - 1) == '\'')
						{
							ff = ff.substring(0, ff.length - 1);
						}
						
						fontMenu.firstChild.nodeValue = ff;
					}
					
					updating = false;
				}, 0);
			}
		};
		
		mxEvent.addListener(graph.cellEditor.text2, 'input', updateCssHandler)
		mxEvent.addListener(graph.cellEditor.text2, 'touchend', updateCssHandler);
		mxEvent.addListener(graph.cellEditor.text2, 'mouseup', updateCssHandler);
		mxEvent.addListener(graph.cellEditor.text2, 'keyup', updateCssHandler);
		this.listeners.push({destroy: function()
		{
			// text2 is destroyed
		}});
		updateCssHandler();
	}

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel = function(format, editorUi, container)
{
	BaseFormatPanel.call(this, format, editorUi, container);
	this.init();
};

mxUtils.extend(StyleFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();

	if (!ss.containsImage || ss.style.shape == 'image')
	{
		this.container.appendChild(this.addFill(this.createPanel()));
	}

	this.container.appendChild(this.addStroke(this.createPanel()));

	if (ss.image)
	{
		this.container.appendChild(this.addImageOps(this.createPanel()));
	}
	
	this.container.appendChild(this.createRelativeOption(mxResources.get('opacity'), mxConstants.STYLE_OPACITY));
	this.container.appendChild(this.addEffects(this.createPanel()));
	this.container.appendChild(this.addStyleOps(this.createPanel()));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addImageOps = function(div)
{
	var btn = mxUtils.button(mxResources.get('editImage'), mxUtils.bind(this, function(evt)
	{
		this.editorUi.actions.get('image').funct();
	}));
	
	btn.style.width = '202px';
	div.appendChild(btn);
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addFill = function(container)
{
	var graph = this.editorUi.editor.graph;
	var ss = this.format.getSelectionState();
	container.style.paddingTop = '8px';
	container.style.paddingBottom = '8px';

	// Adds gradient direction option
	var gradientSelect = document.createElement('select');
	gradientSelect.style.position = 'absolute';
	gradientSelect.style.marginTop = '-2px';
	gradientSelect.style.right = (mxClient.IS_QUIRKS) ? '52px' : '72px';
	gradientSelect.style.width = '70px';
	
	// Stops events from bubbling to color option event handler
	mxEvent.addListener(gradientSelect, 'click', function(evt)
	{
		mxEvent.consume(evt);
	});

	var gradientPanel = this.createCellColorOption(mxResources.get('gradient'), mxConstants.STYLE_GRADIENTCOLOR, '#ffffff', function(color)
	{
		if (color == null || color == mxConstants.NONE)
		{
			gradientSelect.style.display = 'none';
		}
		else
		{
			gradientSelect.style.display = '';
		}
	});

	var fillKey = (ss.style.shape == 'image') ? mxConstants.STYLE_IMAGE_BACKGROUND : mxConstants.STYLE_FILLCOLOR;
	
	var fillPanel = this.createCellColorOption(mxResources.get('fill'), fillKey, '#ffffff', function(color)
	{
		if (!ss.fill || ss.containsImage || color == null || color == mxConstants.NONE)
		{
			gradientPanel.style.display = 'none';
		}
		else
		{
			gradientPanel.style.display = '';
		}
	});
	fillPanel.style.fontWeight = 'bold';

	gradientPanel.style.display = (ss.fill && ss.style.shape != 'image') ? '' : 'none';

	var directions = [mxConstants.DIRECTION_NORTH, mxConstants.DIRECTION_EAST,
	                  mxConstants.DIRECTION_SOUTH, mxConstants.DIRECTION_WEST];

	for (var i = 0; i < directions.length; i++)
	{
		var gradientOption = document.createElement('option');
		gradientOption.setAttribute('value', directions[i]);
		mxUtils.write(gradientOption, mxResources.get(directions[i]));
		gradientSelect.appendChild(gradientOption);
	}
	
	gradientPanel.appendChild(gradientSelect);
	
	var listener = mxUtils.bind(this, function()
	{
		ss = this.format.getSelectionState();
		var value = mxUtils.getValue(ss.style, mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH);
		
		// Handles empty string which is not allowed as a value
		if (value == '')
		{
			value = mxConstants.DIRECTION_SOUTH;
		}
		
		gradientSelect.value = value;
		container.style.display = (ss.fill) ? '' : 'none';
	});
	
	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	mxEvent.addListener(gradientSelect, 'change', function(evt)
	{
		graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, gradientSelect.value, graph.getSelectionCells());
		mxEvent.consume(evt);
	});
	
	container.appendChild(fillPanel);
	container.appendChild(gradientPanel);

	if (ss.style.shape == 'swimlane')
	{
		container.appendChild(this.createCellColorOption(mxResources.get('laneColor'), 'swimlaneFillColor', '#ffffff'));
	}

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addStroke = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var ss = this.format.getSelectionState();
	
	container.style.paddingTop = '8px';
	container.style.paddingBottom = '8px';
	container.style.whiteSpace = 'normal';
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';
	
	// Adds gradient direction option
	var styleSelect = document.createElement('select');
	styleSelect.style.position = 'absolute';
	styleSelect.style.marginTop = '-2px';
	styleSelect.style.right = '72px';
	styleSelect.style.width = '80px';

	var styles = ['sharp', 'rounded', 'curved'];

	for (var i = 0; i < styles.length; i++)
	{
		var styleOption = document.createElement('option');
		styleOption.setAttribute('value', styles[i]);
		mxUtils.write(styleOption, mxResources.get(styles[i]));
		styleSelect.appendChild(styleOption);
	}
	
	mxEvent.addListener(styleSelect, 'change', function(evt)
	{
		graph.getModel().beginUpdate();
		try
		{
			var keys = [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED];
			// Default for rounded is 1
			var values = ['0', null];
			
			if (styleSelect.value == 'rounded')
			{
				values = ['1', null];
			}
			else if (styleSelect.value == 'curved')
			{
				values = [null, '1'];
			}
			
			for (var i = 0; i < keys.length; i++)
			{
				graph.setCellStyles(keys[i], values[i], graph.getSelectionCells());
			}
			
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
		
		mxEvent.consume(evt);
	});
	
	// Stops events from bubbling to color option event handler
	mxEvent.addListener(styleSelect, 'click', function(evt)
	{
		mxEvent.consume(evt);
	});

	var stylePanel = colorPanel.cloneNode(false);
	stylePanel.style.fontWeight = 'normal';
	stylePanel.style.whiteSpace = 'nowrap';
	stylePanel.style.position = 'relative';
	stylePanel.style.paddingLeft = '16px'
	stylePanel.style.marginBottom = '2px';
	stylePanel.style.marginTop = '2px';
	stylePanel.className = 'geToolbarContainer';

	var stylePanel2 = stylePanel.cloneNode(false);

	// Stroke width
	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.marginTop = '2px';
	input.style.right = '32px';
	input.style.width = '41px';
	input.style.height = '15px';
	stylePanel.appendChild(input);

	var strokeKey = (ss.style.shape == 'image') ? mxConstants.STYLE_IMAGE_BORDER : mxConstants.STYLE_STROKECOLOR;
	
	var lineColor = this.createCellColorOption(mxResources.get('line'), strokeKey, '#000000');
	lineColor.appendChild(styleSelect);
	colorPanel.appendChild(lineColor);

	function update(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(input.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != mxUtils.getValue(ss.style, mxConstants.STYLE_STROKEWIDTH, 1))
		{
			graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, value, graph.getSelectionCells());
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_STROKEWIDTH],
					'values', [value], 'cells', graph.getSelectionCells()));
		}

		input.value = value + ' pt';
		mxEvent.consume(evt);
	};

	var stepper = this.createStepper(input, update, 1, 9);
	stepper.style.display = input.style.display;
	stepper.style.marginTop = '2px';
	stepper.style.right = '20px';
	stylePanel.appendChild(stepper);
	
	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'change', update);
	
	var pattern = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel, 'geSprite-orthogonal', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		var addItem = mxUtils.bind(this, function(cssName, keys, values)
		{
			var item = this.editorUi.menus.styleChange(menu, '', keys, values, 'geIcon', null);
		
			var pat = document.createElement('div');
			pat.style.width = '70px';
			pat.style.height = '1px';
			pat.style.borderBottom = '1px ' + cssName + ' black';
			pat.style.paddingTop = '6px';
	
			item.firstChild.firstChild.style.padding = '0px 4px 0px 4px';
			item.firstChild.firstChild.style.width = '70px';
			item.firstChild.firstChild.appendChild(pat);
		});

		addItem('solid', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], [null, null]);
		addItem('dashed', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', null]);
		addItem('dotted', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], ['1', '1 4']);
	}));
	var edgeStyle = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-orthogonal', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', mxResources.get('straight'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', mxResources.get('orthogonal'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', mxResources.get('curved'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], [null, 'entityRelationEdgeStyle', null, null], 'geIcon geSprite geSprite-entity', null, true).setAttribute('title', mxResources.get('entityRelation'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['arrow', null, null, null], 'geIcon geSprite geSprite-arrow', null, true).setAttribute('title', mxResources.get('arrow'));
		this.editorUi.menus.edgeStyleChange(menu, '', [mxConstants.STYLE_SHAPE, mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, 'noedgestyle'], ['link', null, null, null], 'geIcon geSprite geSprite-linkedge', null, true).setAttribute('title', mxResources.get('link'));
	}));
	var lineStart = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-startclassic', mxResources.get('linestart'), false, mxUtils.bind(this, function(menu)
	{
		if (ss.style.shape == 'connector')
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
		}
	}));
	var lineEnd = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-endclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		if (ss.style.shape == 'connector')
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
		}
	}));

	this.addArrow(edgeStyle);
	this.addArrow(lineStart);
	this.addArrow(lineEnd);
	
	var symbol = this.addArrow(pattern, 9);
	symbol.className = 'geIcon';
	symbol.style.width = '83px';
	
	var solid = document.createElement('div');
	solid.style.width = '80px';
	solid.style.height = '1px';
	solid.style.borderBottom = '1px solid black';
	solid.style.marginBottom = '9px';
	symbol.appendChild(solid);
	
	pattern.style.height = '15px';
	edgeStyle.style.height = '17px';
	lineStart.style.marginLeft = '3px';
	lineStart.style.height = '17px';
	lineEnd.style.marginLeft = '3px';
	lineEnd.style.height = '17px';

	container.appendChild(colorPanel);
	container.appendChild(stylePanel);

	var arrowPanel = stylePanel.cloneNode(false);
	arrowPanel.style.paddingBottom = '8px';
	arrowPanel.style.paddingTop = '6px';
	arrowPanel.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.marginLeft = '3px';
	span.style.marginBottom = '12px';
	span.style.marginTop = '2px';
	span.style.fontWeight = 'normal';
	span.style.width = '76px';
	mxUtils.write(span, mxResources.get('linestart'));
	arrowPanel.appendChild(span);
	
	var startSpacingUpdate, startSizeUpdate;
	var startSpacing = this.addUnitInput(arrowPanel, 'pt', 74, 33, function()
	{
		startSpacingUpdate.apply(this, arguments);
	});
	var startSize = this.addUnitInput(arrowPanel, 'pt', 20, 33, function()
	{
		startSizeUpdate.apply(this, arguments);
	});

	mxUtils.br(arrowPanel);
	
	var spacer = document.createElement('div');
	spacer.style.height = '8px';
	arrowPanel.appendChild(spacer);
	
	span = span.cloneNode(false);
	mxUtils.write(span, mxResources.get('lineend'));
	arrowPanel.appendChild(span);
	
	var endSpacingUpdate, endSizeUpdate;
	var endSpacing = this.addUnitInput(arrowPanel, 'pt', 74, 33, function()
	{
		endSpacingUpdate.apply(this, arguments);
	});
	var endSize = this.addUnitInput(arrowPanel, 'pt', 20, 33, function()
	{
		endSizeUpdate.apply(this, arguments);
	});

	mxUtils.br(arrowPanel);
	this.addLabel(arrowPanel, mxResources.get('spacing'), 74, 50);
	this.addLabel(arrowPanel, mxResources.get('size'), 20, 50);
	mxUtils.br(arrowPanel);
	
	var perimeterPanel = colorPanel.cloneNode(false);
	perimeterPanel.style.fontWeight = 'normal';
	perimeterPanel.style.position = 'relative';
	perimeterPanel.style.paddingLeft = '16px'
	perimeterPanel.style.marginBottom = '2px';
	perimeterPanel.style.marginTop = '6px';
	perimeterPanel.style.borderWidth = '0px';
	perimeterPanel.style.paddingBottom = '18px';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.marginLeft = '3px';
	span.style.marginBottom = '12px';
	span.style.marginTop = '1px';
	span.style.fontWeight = 'normal';
	span.style.width = '120px';
	mxUtils.write(span, mxResources.get('perimeter'));
	perimeterPanel.appendChild(span);
	
	var perimeterUpdate;
	var perimeterSpacing = this.addUnitInput(perimeterPanel, 'pt', 20, 41, function()
	{
		perimeterUpdate.apply(this, arguments);
	});

	if (ss.edges.length == graph.getSelectionCount())
	{
		container.appendChild(stylePanel2);
		container.appendChild(arrowPanel);
	}
	else if (ss.vertices.length == graph.getSelectionCount())
	{
		container.appendChild(perimeterPanel);
	}
	
	var listener = mxUtils.bind(this, function(sender, evt, force)
	{
		ss = this.format.getSelectionState();
		var color = mxUtils.getValue(ss.style, strokeKey, null);
		
		if (ss.style.shape != 'arrow' && (color == null || color == mxConstants.NONE))
		{
			stylePanel.style.display = 'none';
		}
		else
		{
			stylePanel.style.display = '';
		}
		
		stylePanel2.style.display = stylePanel.style.display;
		styleSelect.style.display = stylePanel.style.display;
		
		if (force || document.activeElement != input)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_STROKEWIDTH, 1));
			input.value = (isNaN(tmp)) ? '' : tmp + ' pt';
		}
		
		styleSelect.style.visibility = (ss.style.shape == 'connector') ? '' : 'hidden';
		
		if (mxUtils.getValue(ss.style, mxConstants.STYLE_CURVED, null) == '1')
		{
			styleSelect.value = 'curved';
		}
		else if (mxUtils.getValue(ss.style, mxConstants.STYLE_ROUNDED, null) == '1')
		{
			styleSelect.value = 'rounded';
		}
		
		if (mxUtils.getValue(ss.style, mxConstants.STYLE_DASHED, null) == '1')
		{
			if (mxUtils.getValue(ss.style, mxConstants.STYLE_DASH_PATTERN, null) == null)
			{
				solid.style.borderBottom = '1px dashed black';
			}
			else
			{
				solid.style.borderBottom = '1px dotted black';
			}
		}
		else
		{
			solid.style.borderBottom = '1px solid black';
		}
		
		// Updates toolbar icon for edge style
		var edgeStyleDiv = edgeStyle.getElementsByTagName('div')[0];
		var es = mxUtils.getValue(ss.style, mxConstants.STYLE_EDGE, null);

		if (ss.style.shape == 'arrow')
		{
			edgeStyleDiv.className = 'geSprite geSprite-arrow';
		}
		else if (ss.style.shape == 'link')
		{
			edgeStyleDiv.className = 'geSprite geSprite-linkedge';
		}
		else if (es == 'orthogonalEdgeStyle' && mxUtils.getValue(ss.style, mxConstants.STYLE_CURVED, null) == '1')
		{
			edgeStyleDiv.className = 'geSprite geSprite-curved';
		}
		else if (es == 'straight' || es == 'none' || es == null)
		{
			edgeStyleDiv.className = 'geSprite geSprite-straight';
		}
		else if (es == 'entityRelationEdgeStyle')
		{
			edgeStyleDiv.className = 'geSprite geSprite-entity';
		}
		else
		{
			edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
		}
		
		function updateArrow(marker, fill, elt, prefix)
		{
			var markerDiv = elt.getElementsByTagName('div')[0];

			if (marker == mxConstants.ARROW_CLASSIC)
			{
				markerDiv.className = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
			}
			else if (marker == mxConstants.ARROW_OPEN)
			{
				markerDiv.className = 'geSprite geSprite-' + prefix + 'open';
			}
			else if (marker == mxConstants.ARROW_BLOCK)
			{
				markerDiv.className = (fill == '1') ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
			}
			else if (marker == mxConstants.ARROW_OVAL)
			{
				markerDiv.className = (fill == '1') ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
			}
			else if (marker == mxConstants.ARROW_DIAMOND)
			{
				markerDiv.className = (fill == '1') ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
			}
			else if (marker == mxConstants.ARROW_DIAMOND_THIN)
			{
				markerDiv.className = (fill == '1') ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
			}
			else
			{
				markerDiv.className = 'geSprite geSprite-noarrow';
			}
			
			return markerDiv;
		};
		
		var sourceDiv = updateArrow(mxUtils.getValue(ss.style, mxConstants.STYLE_STARTARROW, null),
				mxUtils.getValue(ss.style, 'startFill', '0'), lineStart, 'start');
		var targetDiv = updateArrow(mxUtils.getValue(ss.style, mxConstants.STYLE_ENDARROW, null),
				mxUtils.getValue(ss.style, 'endFill', '0'), lineEnd, 'end');

		// Special cases for markers
		if (ss.style.shape == 'arrow')
		{
			sourceDiv.className = 'geSprite geSprite-noarrow';
			targetDiv.className = 'geSprite geSprite-endblocktrans';
		}
		else if (ss.style.shape == 'link')
		{
			sourceDiv.className = 'geSprite geSprite-noarrow';
			targetDiv.className = 'geSprite geSprite-noarrow';
		}
		
		if (ss.style.shape == 'arrow' || ss.style.shape == 'link')
		{
			mxUtils.setOpacity(lineStart, 30);
			mxUtils.setOpacity(lineEnd, 30);
		}
		else
		{
			mxUtils.setOpacity(lineStart, 100);
			mxUtils.setOpacity(lineEnd, 100);
		}

		if (force || document.activeElement != startSize)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE));
			startSize.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != startSpacing)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_SOURCE_PERIMETER_SPACING, 0));
			startSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}

		if (force || document.activeElement != endSize)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE));
			endSize.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != startSpacing)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_TARGET_PERIMETER_SPACING, 0));
			endSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != perimeterSpacing)
		{
			var tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_PERIMETER_SPACING, 0));
			perimeterSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
	});
	
	startSizeUpdate = this.installInputHandler(startSize, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE, 0, 999, ' pt');
	startSpacingUpdate = this.installInputHandler(startSpacing, mxConstants.STYLE_SOURCE_PERIMETER_SPACING, 0, 0, 999, ' pt');
	endSizeUpdate = this.installInputHandler(endSize, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE, 0, 999, ' pt');
	endSpacingUpdate = this.installInputHandler(endSpacing, mxConstants.STYLE_TARGET_PERIMETER_SPACING, 0, 0, 999, ' pt');
	perimeterUpdate = this.installInputHandler(perimeterSpacing, mxConstants.STYLE_PERIMETER_SPACING, 0, 0, 999, ' pt');

	this.addKeyHandler(input, listener);
	this.addKeyHandler(startSize, listener);
	this.addKeyHandler(startSpacing, listener);
	this.addKeyHandler(endSize, listener);
	this.addKeyHandler(endSpacing, listener);
	this.addKeyHandler(perimeterSpacing, listener);

	graph.getModel().addListener(mxEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addEffects = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
	
	div.style.paddingTop = '4px';
	div.style.paddingBottom = '4px';

	var table = document.createElement('table');

	if (mxClient.IS_QUIRKS)
	{
		table.style.fontSize = '1em';
	}

	table.style.width = '100%';
	table.style.fontWeight = 'bold';
	table.style.paddingRight = '20px';
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	var left = document.createElement('td');
	left.style.width = '50%';
	left.setAttribute('valign', 'top');
	
	var right = left.cloneNode(true);
	right.style.paddingLeft = '8px';
	row.appendChild(left);
	row.appendChild(right);
	tbody.appendChild(row);
	table.appendChild(tbody);
	div.appendChild(table);

	var current = left;
	var count = 0;
	
	var addOption = mxUtils.bind(this, function(label, key, defaultValue)
	{
		var opt = this.createCellOption(label, key, defaultValue);
		opt.style.width = '100%';
		current.appendChild(opt);
		current = (current == left) ? right : left;
		count++;
	});
	
	if (ss.rounded)
	{
		addOption(mxResources.get('rounded'), mxConstants.STYLE_ROUNDED, 0);
	}

	if (ss.style.shape == 'swimlane')
	{
		addOption(mxResources.get('divider'), 'swimlaneLine', 1);
	}

	if (!ss.containsImage)
	{
		addOption(mxResources.get('shadow'), mxConstants.STYLE_SHADOW, 0);
	}
	
	if (ss.glass)
	{
		addOption(mxResources.get('glass'), mxConstants.STYLE_GLASS, 0);
	}
	
	if (count == 0)
	{
		div.style.display = 'none';
	}

	return div;
}

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleFormatPanel.prototype.addStyleOps = function(div)
{
	var btn = mxUtils.button(mxResources.get('setAsDefaultStyle'), mxUtils.bind(this, function(evt)
	{
		this.editorUi.actions.get('setAsDefaultStyle').funct();
	}));
	
	btn.setAttribute('title', 'Ctrl+Shift+D');
	btn.style.width = '202px';
	div.appendChild(btn);

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel = function(format, editorUi, container)
{
	BaseFormatPanel.call(this, format, editorUi, container);
	this.init();
};

mxUtils.extend(DiagramFormatPanel, BaseFormatPanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;

	this.container.appendChild(this.addOptions(this.createPanel()));
	this.container.appendChild(this.addDocumentProperties(this.createPanel()));
	this.container.appendChild(this.addPaperSize(this.createPanel()));
	this.container.appendChild(this.addStyleOps(this.createPanel()));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addOptions = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(mxResources.get('options')));	
	this.addGridOption(div);

	// Guides
	div.appendChild(this.createOption(mxResources.get('guides'), function()
	{
		return graph.graphHandler.guidesEnabled;
	}, function(checked)
	{
		ui.actions.get('guides').funct();
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(graph.graphHandler.guidesEnabled);
			};
			
			ui.addListener('guidesEnabledChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	}));

	// Connection points
	div.appendChild(this.createOption(mxResources.get('connectionPoints'), function()
	{
		return graph.connectionHandler.isEnabled();
	}, function(checked)
	{
		graph.setConnectable(checked);
	}));

	// Copy connect
	div.appendChild(this.createOption(mxResources.get('copyConnect'), function()
	{
		return graph.connectionHandler.isCreateTarget();
	}, function(checked)
	{
		graph.connectionHandler.setCreateTarget(checked);
	}));
	
	// Navigation
	div.appendChild(this.createOption(mxResources.get('navigation'), function()
	{
		return graph.foldingEnabled;
	}, function(checked)
	{
		graph.foldingEnabled = checked;
		graph.view.revalidate();
	}));
	
	// Scrollbars
	div.appendChild(this.createOption(mxResources.get('scrollbars'), function()
	{
		return ui.hasScrollbars();
	}, function(checked)
	{
		ui.setScrollbars(checked);
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(ui.hasScrollbars());
			};
			
			ui.addListener('scrollbarsChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	}));
	
	return div;
};

/**
 * 
 */
DiagramFormatPanel.prototype.addGridOption = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;

	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.marginTop = '2px';
	input.style.right = '32px';
	input.style.width = '46px';
	input.value = graph.getGridSize() + ' pt';

	mxEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			mxEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			input.value = graph.getGridSize();
			graph.container.focus();
			mxEvent.consume(e);
		}
	});
	
	container.appendChild(input);

	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.max(0, (isNaN(value)) ? 10 : value);
		
		if (value != graph.getGridSize())
		{
			graph.setGridSize(value)
		}

		input.value = value + ' pt';
		mxEvent.consume(evt);
	};

	mxEvent.addListener(input, 'blur', update);
	mxEvent.addListener(input, 'change', update);
	
	var stepper = this.createStepper(input, update);
	input.style.display = (graph.isGridEnabled()) ? '' : 'none';
	stepper.style.display = input.style.display;
	stepper.style.marginTop = '2px';
	stepper.style.right = '20px';
	container.appendChild(stepper);
	
	container.appendChild(this.createOption(mxResources.get('grid'), function()
	{
		return graph.isGridEnabled();
	}, function(checked)
	{
		graph.setGridEnabled(checked);
		ui.editor.updateGraphComponents();
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				input.style.display = (graph.isGridEnabled()) ? '' : 'none';
				stepper.style.display = input.style.display;
				
				apply(graph.isGridEnabled());
			};
			
			ui.addListener('gridEnabledChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	}));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addDocumentProperties = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(mxResources.get('documentProperties')));

	// Page view
	// LATER: Add pageViewChanged event
	div.appendChild(this.createOption(mxResources.get('pageView'), function()
	{
		return graph.pageVisible;
	}, function(checked)
	{
		ui.actions.get('pageView').funct();
	}));
	
	var bg = this.createColorOption(mxResources.get('background'), function()
	{
		return graph.background;
	}, function(color)
	{
		ui.setBackgroundColor(color);
	}, '#ffffff',
	{
		install: function(apply)
		{
			this.listener = function()
			{
				apply(graph.background);
			};
			
			ui.addListener('backgroundColorChanged', this.listener);
		},
		destroy: function()
		{
			ui.removeListener(this.listener);
		}
	});
	
	var btn = mxUtils.button(mxResources.get('image'), function(evt)
	{
		var dlg = new BackgroundImageDialog(ui, function(image)
		{
			ui.setBackgroundImage(image);
		});
		ui.showDialog(dlg.container, 360, 200, true, true);
		dlg.init();
		
		mxEvent.consume(evt);
	})

	btn.style.position = 'absolute';
	btn.className = 'geColorBtn';
	btn.style.marginTop = '-4px';
	btn.style.paddingBottom = (document.documentMode == 11 || mxClient.IS_MT) ? '0px' : '2px';
	btn.style.height = '22px';
	btn.style.right = (mxClient.IS_QUIRKS) ? '52px' : '72px';
	btn.style.width = '56px';

	bg.appendChild(btn);
	div.appendChild(bg);
	
	if (typeof(MathJax) !== 'undefined')
	{
		var opt = this.createOption(mxResources.get('mathematicalTypesetting'), function()
		{
			return graph.mathEnabled;
		}, function(checked)
		{
			ui.setMathEnabled(checked);
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.mathEnabled);
				};
				
				ui.addListener('mathEnabledChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		});
		div.appendChild(opt);

		// Offline check not needed since math is only available in online mode
		var link = document.createElement('a');
		link.setAttribute('href', 'https://support.draw.io/questions/2949135/how-to-use-mathematical-typesetting');
		link.setAttribute('title', mxResources.get('help'));
		link.setAttribute('target', '_blank');
		link.style.cssText = 'color:blue;text-decoration:underline;position:absolute;right:20px;';
		mxUtils.write(link, '?');
		opt.appendChild(link);
	}

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addPaperSize = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(mxResources.get('paperSize')));
	
	var portraitCheckBox = document.createElement('input');
	portraitCheckBox.setAttribute('name', 'format');
	portraitCheckBox.setAttribute('type', 'radio');
	portraitCheckBox.setAttribute('value', 'portrait');
	
	var landscapeCheckBox = document.createElement('input');
	landscapeCheckBox.setAttribute('name', 'format');
	landscapeCheckBox.setAttribute('type', 'radio');
	landscapeCheckBox.setAttribute('value', 'landscape');
	
	var paperSizeSelect = document.createElement('select');
	paperSizeSelect.style.marginBottom = '8px';
	paperSizeSelect.style.width = '202px';

	var formatDiv = document.createElement('div');
	formatDiv.style.marginLeft = '4px';
	formatDiv.style.width = '210px';
	formatDiv.style.height = '24px';

	portraitCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(portraitCheckBox);
	
	var span = document.createElement('span');
	span.style.maxWidth = '100px';
	mxUtils.write(span, mxResources.get('portrait'));
	formatDiv.appendChild(span);
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		portraitCheckBox.checked = true;
		mxEvent.consume(evt);
	});
	
	landscapeCheckBox.style.marginLeft = '10px';
	landscapeCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(landscapeCheckBox);
	
	var span = document.createElement('span');
	span.style.width = '100px';
	mxUtils.write(span, mxResources.get('landscape'));
	formatDiv.appendChild(span)
	
	mxEvent.addListener(span, 'click', function(evt)
	{
		landscapeCheckBox.checked = true;
		mxEvent.consume(evt);
	});
	
	var customDiv = document.createElement('div');
	customDiv.style.marginLeft = '4px';
	customDiv.style.width = '210px';
	customDiv.style.height = '24px';
	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('size', '6');
	widthInput.setAttribute('value', graph.pageFormat.width);
	customDiv.appendChild(widthInput);
	mxUtils.write(customDiv, ' x ');
	
	var heightInput = document.createElement('input');
	heightInput.setAttribute('size', '6');
	heightInput.setAttribute('value', graph.pageFormat.height);
	customDiv.appendChild(heightInput);
	mxUtils.write(customDiv, ' Pixel');

	formatDiv.style.display = 'none';
	customDiv.style.display = 'none';
	
	var pf = new Object();
	var formats = PageSetupDialog.getFormats();
	
	for (var i = 0; i < formats.length; i++)
	{
		var f = formats[i];
		pf[f.key] = f;

		var paperSizeOption = document.createElement('option');
		paperSizeOption.setAttribute('value', f.key);
		mxUtils.write(paperSizeOption, f.title);
		paperSizeSelect.appendChild(paperSizeOption);
	}
	
	function listener(sender, evt, force)
	{
		if (force || (widthInput != document.activeElement && heightInput != document.activeElement))
		{
			var detected = false;
			
			for (var i = 0; i < formats.length; i++)
			{
				var f = formats[i];
	
				if (f.format != null)
				{
					if (graph.pageFormat.width == f.format.width && graph.pageFormat.height == f.format.height)
					{
						paperSizeSelect.value = f.key;
						portraitCheckBox.setAttribute('checked', 'checked');
						portraitCheckBox.defaultChecked = true;
						portraitCheckBox.checked = true;
						landscapeCheckBox.removeAttribute('checked');
						landscapeCheckBox.defaultChecked = false;
						landscapeCheckBox.checked = false;
						detected = true;
					}
					else if (graph.pageFormat.width == f.format.height && graph.pageFormat.height == f.format.width)
					{
						paperSizeSelect.value = f.key;
						portraitCheckBox.removeAttribute('checked');
						portraitCheckBox.defaultChecked = false;
						portraitCheckBox.checked = false;
						landscapeCheckBox.setAttribute('checked', 'checked');
						landscapeCheckBox.defaultChecked = true;
						landscapeCheckBox.checked = true;
						detected = true;
					}
				}
			}
			
			// Selects custom format which is last in list
			if (!detected)
			{
				widthInput.value = graph.pageFormat.width;
				heightInput.value = graph.pageFormat.height;
				paperSizeOption.setAttribute('selected', 'selected');
				portraitCheckBox.setAttribute('checked', 'checked');
				portraitCheckBox.defaultChecked = true;
				formatDiv.style.display = 'none';
				customDiv.style.display = '';
			}
			else
			{
				formatDiv.style.display = '';
				customDiv.style.display = 'none';
			}
		}
	};
	listener();

	div.appendChild(paperSizeSelect);
	mxUtils.br(div);

	div.appendChild(formatDiv);
	div.appendChild(customDiv);
	
	var update = function()
	{
		var f = pf[paperSizeSelect.value];
		
		if (f.format != null)
		{
			widthInput.value = f.format.width;
			heightInput.value = f.format.height;
			customDiv.style.display = 'none';
			formatDiv.style.display = '';
		}
		else
		{
			formatDiv.style.display = 'none';
			customDiv.style.display = '';
		}
		
		var size = new mxRectangle(0, 0, parseInt(widthInput.value), parseInt(heightInput.value));
		
		if (paperSizeSelect.value != 'custom' && landscapeCheckBox.checked)
		{
			size = new mxRectangle(0, 0, size.height, size.width);
		}
		
		if (graph.pageFormat == null || graph.pageFormat.width != size.width || graph.pageFormat.height != size.height)
		{
			ui.setPageFormat(size);
		}
	};

	this.addKeyHandler(widthInput, listener);
	this.addKeyHandler(heightInput, listener);
	
	mxEvent.addListener(widthInput, 'blur', update);
	mxEvent.addListener(widthInput, 'click', update);
	mxEvent.addListener(heightInput, 'blur', update);
	mxEvent.addListener(heightInput, 'click', update);
	mxEvent.addListener(landscapeCheckBox, 'change', update);
	mxEvent.addListener(portraitCheckBox, 'change', update);
	mxEvent.addListener(paperSizeSelect, 'change', update);
	ui.addListener('pageFormatChanged', listener);
	update();
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.addStyleOps = function(div)
{
	var btn = mxUtils.button(mxResources.get('clearDefaultStyle'), mxUtils.bind(this, function(evt)
	{
		this.editorUi.actions.get('clearDefaultStyle').funct();
	}));
	
	btn.setAttribute('title', 'Ctrl+Shift+R');
	btn.style.width = '202px';
	div.appendChild(btn);

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramFormatPanel.prototype.destroy = function()
{
	BaseFormatPanel.prototype.destroy.apply(this, arguments);
	
	if (this.gridEnabledListener)
	{
		this.editorUi.removeListener(this.gridEnabledListener);
		this.gridEnabledListener = null;
	}
};
