/**
 * $Id: mxMouseEvent.js,v 1.20 2011-03-02 17:24:39 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxMouseEvent
 * 
 * Base class for all mouse events in mxGraph. A listener for this event should
 * implement the following methods:
 * 
 * (code)
 * graph.addMouseListener(
 * {
 *   mouseDown: function(sender, evt)
 *   {
 *     mxLog.debug('mouseDown');
 *   },
 *   mouseMove: function(sender, evt)
 *   {
 *     mxLog.debug('mouseMove');
 *   },
 *   mouseUp: function(sender, evt)
 *   {
 *     mxLog.debug('mouseUp');
 *   }
 * });
 * (end)
 * 
 * Constructor: mxMouseEvent
 *
 * Constructs a new event object for the given arguments.
 * 
 * Parameters:
 * 
 * evt - Native mouse event.
 * state - Optional <mxCellState> under the mouse.
 * 
 */
function mxMouseEvent(evt, state)
{
	this.evt = evt;
	this.state = state;
};

/**
 * Variable: consumed
 *
 * Holds the consumed state of this event.
 */
mxMouseEvent.prototype.consumed = false;

/**
 * Variable: evt
 *
 * Holds the inner event object.
 */
mxMouseEvent.prototype.evt = null;

/**
 * Variable: graphX
 *
 * Holds the x-coordinate of the event in the graph. This value is set in
 * <mxGraph.fireMouseEvent>.
 */
mxMouseEvent.prototype.graphX = null;

/**
 * Variable: graphY
 *
 * Holds the y-coordinate of the event in the graph. This value is set in
 * <mxGraph.fireMouseEvent>.
 */
mxMouseEvent.prototype.graphY = null;

/**
 * Variable: state
 *
 * Holds the optional <mxCellState> associated with this event.
 */
mxMouseEvent.prototype.state = null;

/**
 * Function: getEvent
 * 
 * Returns <evt>.
 */
mxMouseEvent.prototype.getEvent = function()
{
	return this.evt;
};

/**
 * Function: getSource
 * 
 * Returns the target DOM element using <mxEvent.getSource> for <evt>.
 */
mxMouseEvent.prototype.getSource = function()
{
	return mxEvent.getSource(this.evt);
};

/**
 * Function: isSource
 * 
 * Returns true if the given <mxShape> is the source of <evt>.
 */
mxMouseEvent.prototype.isSource = function(shape)
{
	if (shape != null)
	{
		var source = this.getSource();
		
		while (source != null)
		{
			if (source == shape.node)
			{
				return true;
			}
	
			source = source.parentNode;
		}
	}
	
	return false;
};

/**
 * Function: getX
 * 
 * Returns <evt.clientX>.
 */
mxMouseEvent.prototype.getX = function()
{
	return mxEvent.getClientX(this.getEvent());
};

/**
 * Function: getY
 * 
 * Returns <evt.clientY>.
 */
mxMouseEvent.prototype.getY = function()
{
	return mxEvent.getClientY(this.getEvent());
};

/**
 * Function: getGraphX
 * 
 * Returns <graphX>.
 */
mxMouseEvent.prototype.getGraphX = function()
{
	return this.graphX;
};

/**
 * Function: getGraphY
 * 
 * Returns <graphY>.
 */
mxMouseEvent.prototype.getGraphY = function()
{
	return this.graphY;
};

/**
 * Function: getState
 * 
 * Returns <state>.
 */
mxMouseEvent.prototype.getState = function()
{
	return this.state;
};

/**
 * Function: getCell
 * 
 * Returns the <mxCell> in <state> is not null.
 */
mxMouseEvent.prototype.getCell = function()
{
	var state = this.getState();
	
	if (state != null)
	{
		return state.cell;
	}
	
	return null;
};

/**
 * Function: isPopupTrigger
 *
 * Returns true if the event is a popup trigger.
 */
mxMouseEvent.prototype.isPopupTrigger = function()
{
	return mxEvent.isPopupTrigger(this.getEvent());
};

/**
 * Function: isConsumed
 *
 * Returns <consumed>.
 */
mxMouseEvent.prototype.isConsumed = function()
{
	return this.consumed;
};

/**
 * Function: consume
 *
 * Sets <consumed> to true and invokes preventDefault on the native event
 * if such a method is defined. This is used mainly to avoid the cursor from
 * being changed to a text cursor in Webkit. You can use the preventDefault
 * flag to disable this functionality.
 * 
 * Parameters:
 * 
 * preventDefault - Specifies if the native event should be canceled. Default
 * is true.
 */
mxMouseEvent.prototype.consume = function(preventDefault)
{
	preventDefault = (preventDefault != null) ? preventDefault : true;
	
	if (preventDefault && this.evt.preventDefault)
	{
		this.evt.preventDefault();
	}

	// Workaround for images being dragged in IE
	this.evt.returnValue = false;
	
	// Sets local consumed state
	this.consumed = true;
};
