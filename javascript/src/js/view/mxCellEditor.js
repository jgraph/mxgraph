/**
 * $Id: mxCellEditor.js,v 1.61 2012-06-20 16:54:30 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxCellEditor
 *
 * In-place editor for the graph. To control this editor, use
 * <mxGraph.invokesStopCellEditing>, <mxGraph.enterStopsCellEditing> and
 * <mxGraph.escapeEnabled>. If <mxGraph.enterStopsCellEditing> is true then
 * ctrl-enter or shift-enter can be used to create a linefeed. The F2 and
 * escape keys can always be used to stop editing. To customize the location
 * of the textbox in the graph, override <getEditorBounds> as follows:
 * 
 * (code)
 * graph.cellEditor.getEditorBounds = function(state)
 * {
 *   var result = mxCellEditor.prototype.getEditorBounds.apply(this, arguments);
 *   
 *   if (this.graph.getModel().isEdge(state.cell))
 *   {
 *     result.x = state.getCenterX() - result.width / 2;
 *     result.y = state.getCenterY() - result.height / 2;
 *   }
 *   
 *   return result;
 * };
 * (end)
 * 
 * The textarea uses the mxCellEditor CSS class. You can modify this class in
 * your custom CSS. Note: You should modify the CSS after loading the client
 * in the page.
 *
 * Example:
 * 
 * To only allow numeric input in the in-place editor, use the following code.
 *
 * (code)
 * var text = graph.cellEditor.textarea;
 * 
 * mxEvent.addListener(text, 'keydown', function (evt)
 * {
 *   if (!(evt.keyCode >= 48 && evt.keyCode <= 57) &&
 *       !(evt.keyCode >= 96 && evt.keyCode <= 105))
 *   {
 *     mxEvent.consume(evt);
 *   }
 * }); 
 * (end)
 * 
 * Initial values:
 * 
 * To implement an initial value for cells without a label, use the
 * <emptyLabelText> variable.
 * 
 * Resize in Chrome:
 * 
 * Resize of the textarea is disabled by default. If you want to enable
 * this feature extend <init> and set this.textarea.style.resize = ''.
 *
 * Constructor: mxCellEditor
 *
 * Constructs a new in-place editor for the specified graph.
 * 
 * Parameters:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 */
function mxCellEditor(graph)
{
	this.graph = graph;
};

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxCellEditor.prototype.graph = null;

/**
 * Variable: textarea
 *
 * Holds the input textarea. Note that this may be null before the first
 * edit. Instantiated in <init>.
 */
mxCellEditor.prototype.textarea = null;

/**
 * Variable: editingCell
 * 
 * Reference to the <mxCell> that is currently being edited.
 */
mxCellEditor.prototype.editingCell = null;

/**
 * Variable: trigger
 * 
 * Reference to the event that was used to start editing.
 */
mxCellEditor.prototype.trigger = null;

/**
 * Variable: modified
 * 
 * Specifies if the label has been modified.
 */
mxCellEditor.prototype.modified = false;

/**
 * Variable: emptyLabelText
 * 
 * Text to be displayed for empty labels. Default is ''. This can be set
 * to eg. "[Type Here]" to easier visualize editing of empty labels. The
 * value is only displayed before the first keystroke and is never used
 * as the actual editin value.
 */
mxCellEditor.prototype.emptyLabelText = '';

/**
 * Variable: textNode
 * 
 * Reference to the label DOM node that has been hidden.
 */
mxCellEditor.prototype.textNode = '';

/**
 * Function: init
 *
 * Creates the <textarea> and installs the event listeners. The key handler
 * updates the <modified> state.
 */
mxCellEditor.prototype.init = function ()
{
	this.textarea = document.createElement('textarea');

	this.textarea.className = 'mxCellEditor';
	this.textarea.style.position = 'absolute';
	this.textarea.style.overflow = 'visible';

	this.textarea.setAttribute('cols', '20');
	this.textarea.setAttribute('rows', '4');

	if (mxClient.IS_GC)
	{
		this.textarea.style.resize = 'none';
	}
	
	mxEvent.addListener(this.textarea, 'blur', mxUtils.bind(this, function(evt)
	{
		this.focusLost();
	}));
	
	mxEvent.addListener(this.textarea, 'keydown', mxUtils.bind(this, function(evt)
	{
		if (!mxEvent.isConsumed(evt))
		{
			if (evt.keyCode == 113 /* F2 */ || (this.graph.isEnterStopsCellEditing() &&
				evt.keyCode == 13 /* Enter */ && !mxEvent.isControlDown(evt) &&
				!mxEvent.isShiftDown(evt)))
			{
				this.graph.stopEditing(false);
				mxEvent.consume(evt);
			}
			else if (evt.keyCode == 27 /* Escape */)
			{
				this.graph.stopEditing(true);
				mxEvent.consume(evt);
			}
			else
			{
				// Clears the initial empty label on the first keystroke
				if (this.clearOnChange)
				{
					this.clearOnChange = false;
					this.textarea.value = '';
				}
				
				// Updates the modified flag for storing the value
				this.setModified(true);
			}
		}
	}));
};

/**
 * Function: isModified
 * 
 * Returns <modified>.
 */
mxCellEditor.prototype.isModified = function()
{
	return this.modified;
};

/**
 * Function: setModified
 * 
 * Sets <modified> to the specified boolean value.
 */
mxCellEditor.prototype.setModified = function(value)
{
	this.modified = value;
};

/**
 * Function: focusLost
 *
 * Called if the textarea has lost focus.
 */
mxCellEditor.prototype.focusLost = function()
{
	this.stopEditing(!this.graph.isInvokesStopCellEditing());
};

/**
 * Function: startEditing
 *
 * Starts the editor for the given cell.
 * 
 * Parameters:
 * 
 * cell - <mxCell> to start editing.
 * trigger - Optional mouse event that triggered the editor.
 */
mxCellEditor.prototype.startEditing = function(cell, trigger)
{
	// Lazy instantiates textarea to save memory in IE
	if (this.textarea == null)
	{
		this.init();
	}
	
	this.stopEditing(true);
	var state = this.graph.getView().getState(cell);
	
	if (state != null)
	{
		this.editingCell = cell;
		this.trigger = trigger;
		this.textNode = null;
				
		if (state.text != null && this.isHideLabel(state))
		{
			this.textNode = state.text.node;
			this.textNode.style.visibility = 'hidden';
		}
		
		// Configures the style of the in-place editor
		var scale = this.graph.getView().scale;
		var size = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE) * scale;
		var family = mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
		var color = mxUtils.getValue(state.style, mxConstants.STYLE_FONTCOLOR, 'black');
		var align = (this.graph.model.isEdge(state.cell)) ? mxConstants.ALIGN_LEFT :
			mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
		var bold = (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) &
				mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD;

		this.textarea.style.fontSize = size + 'px';
		this.textarea.style.fontFamily = family;
		this.textarea.style.textAlign = align;
		this.textarea.style.color = color;
		this.textarea.style.fontWeight = (bold) ? 'bold' : 'normal';

		// Specifies the bounds of the editor box
		var bounds = this.getEditorBounds(state);

		this.textarea.style.left = bounds.x + 'px';
		this.textarea.style.top = bounds.y + 'px';
		this.textarea.style.width = bounds.width + 'px';
		this.textarea.style.height = bounds.height + 'px';
		this.textarea.style.zIndex = 5;

		var value = this.getInitialValue(state, trigger);

		// Uses an optional text value for empty labels which is cleared
		// when the first keystroke appears. This makes it easier to see
		// that a label is being edited even if the label is empty.
		if (value == null || value.length == 0)
		{
			value = this.getEmptyLabelText();
			this.clearOnChange = true;
		}
		else
		{
			this.clearOnChange = false;
		}
		
		this.setModified(false);		
		this.textarea.value = value;
		this.graph.container.appendChild(this.textarea);
		
		if (this.textarea.style.display != 'none')
		{
			// FIXME: Doesn't bring up the virtual keyboard on iPad
			this.textarea.focus();
			this.textarea.select();
		}
	}
};

/**
 * Function: stopEditing
 *
 * Stops the editor and applies the value if cancel is false.
 */
mxCellEditor.prototype.stopEditing = function(cancel)
{
	cancel = cancel || false;
	
	if (this.editingCell != null)
	{
		if (this.textNode != null)
		{
			this.textNode.style.visibility = 'visible';
			this.textNode = null;
		}
		
		if (!cancel && this.isModified())
		{
			this.graph.labelChanged(this.editingCell, this.getCurrentValue(), this.trigger);
		}
		
		this.editingCell = null;
		this.trigger = null;
		this.textarea.blur();
		this.textarea.parentNode.removeChild(this.textarea);
	}
};

/**
 * Function: getInitialValue
 * 
 * Gets the initial editing value for the given cell.
 */
mxCellEditor.prototype.getInitialValue = function(state, trigger)
{
	 return this.graph.getEditingValue(state.cell, trigger);
};

/**
 * Function: getCurrentValue
 * 
 * Returns the current editing value.
 */
mxCellEditor.prototype.getCurrentValue = function()
{
	 return this.textarea.value.replace(/\r/g, '');
};

/**
 * Function: isHideLabel
 * 
 * Returns true if the label should be hidden while the cell is being
 * edited.
 */
mxCellEditor.prototype.isHideLabel = function(state)
{
	return true;
};

/**
 * Function: getMinimumSize
 * 
 * Returns the minimum width and height for editing the given state.
 */
mxCellEditor.prototype.getMinimumSize = function(state)
{
	var scale = this.graph.getView().scale;
	
	return new mxRectangle(0, 0, (state.text == null) ? 30 :  state.text.size * scale + 20,
			(this.textarea.style.textAlign == 'left') ? 120 : 40);
};

/**
 * Function: getEditorBounds
 * 
 * Returns the <mxRectangle> that defines the bounds of the editor.
 */
mxCellEditor.prototype.getEditorBounds = function(state)
{
	var isEdge = this.graph.getModel().isEdge(state.cell);
	var scale = this.graph.getView().scale;
	var minSize = this.getMinimumSize(state);
	var minWidth = minSize.width;
 	var minHeight = minSize.height;

	var spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 2) * scale;
	var spacingTop = (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0)) * scale + spacing;
	var spacingRight = (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0)) * scale + spacing;
	var spacingBottom = (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0)) * scale + spacing;
	var spacingLeft = (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0)) * scale + spacing;

 	var result = new mxRectangle(state.x, state.y,
 		 Math.max(minWidth, state.width - spacingLeft - spacingRight),
 		 Math.max(minHeight, state.height - spacingTop - spacingBottom));

	if (isEdge)
	{
		result.x = state.absoluteOffset.x;
		result.y = state.absoluteOffset.y;

		if (state.text != null && state.text.boundingBox != null)
		{
			// Workaround for label containing just spaces in which case
			// the bounding box location contains negative numbers 
			if (state.text.boundingBox.x > 0)
			{
				result.x = state.text.boundingBox.x;
			}
			
			if (state.text.boundingBox.y > 0)
			{
				result.y = state.text.boundingBox.y;
			}
		}
	}
	else if (state.text != null && state.text.boundingBox != null)
	{
		result.x = Math.min(result.x, state.text.boundingBox.x);
		result.y = Math.min(result.y, state.text.boundingBox.y);
	}

	result.x += spacingLeft;
	result.y += spacingTop;

	if (state.text != null && state.text.boundingBox != null)
	{
		if (!isEdge)
		{
			result.width = Math.max(result.width, state.text.boundingBox.width);
			result.height = Math.max(result.height, state.text.boundingBox.height);
		}
		else
		{
			result.width = Math.max(minWidth, state.text.boundingBox.width);
			result.height = Math.max(minHeight, state.text.boundingBox.height);
		}
	}
	
	// Applies the horizontal and vertical label positions
	if (this.graph.getModel().isVertex(state.cell))
	{
		var horizontal = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);

		if (horizontal == mxConstants.ALIGN_LEFT)
		{
			result.x -= state.width;
		}
		else if (horizontal == mxConstants.ALIGN_RIGHT)
		{
			result.x += state.width;
		}

		var vertical = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);

		if (vertical == mxConstants.ALIGN_TOP)
		{
			result.y -= state.height;
		}
		else if (vertical == mxConstants.ALIGN_BOTTOM)
		{
			result.y += state.height;
		}
	}
	
	return result;
};

/**
 * Function: getEmptyLabelText
 *
 * Returns the initial label value to be used of the label of the given
 * cell is empty. This label is displayed and cleared on the first keystroke.
 * This implementation returns <emptyLabelText>.
 * 
 * Parameters:
 * 
 * cell - <mxCell> for which a text for an empty editing box should be
 * returned.
 */
mxCellEditor.prototype.getEmptyLabelText = function (cell)
{
	return this.emptyLabelText;
};

/**
 * Function: getEditingCell
 *
 * Returns the cell that is currently being edited or null if no cell is
 * being edited.
 */
mxCellEditor.prototype.getEditingCell = function ()
{
	return this.editingCell;
};

/**
 * Function: destroy
 *
 * Destroys the editor and removes all associated resources.
 */
mxCellEditor.prototype.destroy = function ()
{
	if (this.textarea != null)
	{
		mxEvent.release(this.textarea);
		
		if (this.textarea.parentNode != null)
		{
			this.textarea.parentNode.removeChild(this.textarea);
		}
		
		this.textarea = null;
	}
};
