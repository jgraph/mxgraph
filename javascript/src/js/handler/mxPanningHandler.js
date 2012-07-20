/**
 * $Id: mxPanningHandler.js,v 1.79 2012-07-17 14:37:41 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPanningHandler
 * 
 * Event handler that pans and creates popupmenus. To use the left
 * mousebutton for panning without interfering with cell moving and
 * resizing, use <isUseLeftButton> and <isIgnoreCell>. For grid size
 * steps while panning, use <useGrid>. This handler is built-into
 * <mxGraph.panningHandler> and enabled using <mxGraph.setPanning>.
 * 
 * Constructor: mxPanningHandler
 * 
 * Constructs an event handler that creates a <mxPopupMenu>
 * and pans the graph.
 *
 * Event: mxEvent.PAN_START
 *
 * Fires when the panning handler changes its <active> state to true. The
 * <code>event</code> property contains the corresponding <mxMouseEvent>.
 *
 * Event: mxEvent.PAN
 *
 * Fires while handle is processing events. The <code>event</code> property contains
 * the corresponding <mxMouseEvent>.
 *
 * Event: mxEvent.PAN_END
 *
 * Fires when the panning handler changes its <active> state to false. The
 * <code>event</code> property contains the corresponding <mxMouseEvent>.
 */
function mxPanningHandler(graph, factoryMethod)
{
	if (graph != null)
	{
		this.graph = graph;
		this.factoryMethod = factoryMethod;
		this.graph.addMouseListener(this);
		this.init();
	}
};

/**
 * Extends mxPopupMenu.
 */
mxPanningHandler.prototype = new mxPopupMenu();
mxPanningHandler.prototype.constructor = mxPanningHandler;

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxPanningHandler.prototype.graph = null;

/**
 * Variable: usePopupTrigger
 * 
 * Specifies if the <isPopupTrigger> should also be used for panning. To
 * avoid conflicts, the panning is only activated if the mouse was moved
 * more than <mxGraph.tolerance>, otherwise, a single click is assumed
 * and the popupmenu is displayed. Default is true.
 */
mxPanningHandler.prototype.usePopupTrigger = true;

/**
 * Variable: useLeftButtonForPanning
 * 
 * Specifies if panning should be active for the left mouse button.
 * Setting this to true may conflict with <mxRubberband>. Default is false.
 */
mxPanningHandler.prototype.useLeftButtonForPanning = false;

/**
 * Variable: selectOnPopup
 * 
 * Specifies if cells should be selected if a popupmenu is displayed for
 * them. Default is true.
 */
mxPanningHandler.prototype.selectOnPopup = true;

/**
 * Variable: clearSelectionOnBackground
 * 
 * Specifies if cells should be deselected if a popupmenu is displayed for
 * the diagram background. Default is true.
 */
mxPanningHandler.prototype.clearSelectionOnBackground = true;

/**
 * Variable: ignoreCell
 * 
 * Specifies if panning should be active even if there is a cell under the
 * mousepointer. Default is false.
 */
mxPanningHandler.prototype.ignoreCell = false;

/**
 * Variable: previewEnabled
 * 
 * Specifies if the panning should be previewed. Default is true.
 */
mxPanningHandler.prototype.previewEnabled = true;

/**
 * Variable: useGrid
 * 
 * Specifies if the panning steps should be aligned to the grid size.
 * Default is false.
 */
mxPanningHandler.prototype.useGrid = false;

/**
 * Variable: panningEnabled
 * 
 * Specifies if panning should be enabled. Default is true.
 */
mxPanningHandler.prototype.panningEnabled = true;

/**
 * Function: isPanningEnabled
 * 
 * Returns <panningEnabled>.
 */
mxPanningHandler.prototype.isPanningEnabled = function()
{
	return this.panningEnabled;
};

/**
 * Function: setPanningEnabled
 * 
 * Sets <panningEnabled>.
 */
mxPanningHandler.prototype.setPanningEnabled = function(value)
{
	this.panningEnabled = value;
};

/**
 * Function: init
 * 
 * Initializes the shapes required for this vertex handler.
 */
mxPanningHandler.prototype.init = function()
{
	// Supercall
	mxPopupMenu.prototype.init.apply(this);

	// Hides the tooltip if the mouse is over
	// the context menu
	mxEvent.addListener(this.div, (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove',
		mxUtils.bind(this, function(evt)
		{
			this.graph.tooltipHandler.hide();
		})
	);
};

/**
 * Function: isPanningTrigger
 * 
 * Returns true if the given event is a panning trigger for the optional
 * given cell. This returns true if control-shift is pressed or if
 * <usePopupTrigger> is true and the event is a popup trigger.
 */
mxPanningHandler.prototype.isPanningTrigger = function(me)
{
	var evt = me.getEvent();
	
	return (this.useLeftButtonForPanning && (this.ignoreCell || me.getState() == null) &&
			mxEvent.isLeftMouseButton(evt)) || (mxEvent.isControlDown(evt) &&
			mxEvent.isShiftDown(evt)) || (this.usePopupTrigger &&
		   	mxEvent.isPopupTrigger(evt));
};

/**
 * Function: mouseDown
 * 
 * Handles the event by initiating the panning. By consuming the event all
 * subsequent events of the gesture are redirected to this handler.
 */
mxPanningHandler.prototype.mouseDown = function(sender, me)
{
	if (!me.isConsumed() && this.isEnabled())
	{
		// Hides the popupmenu if is is being displayed
		this.hideMenu();

		this.dx0 = -this.graph.container.scrollLeft;
		this.dy0 = -this.graph.container.scrollTop;
		
		// Checks the event triggers to panning and popupmenu
		this.popupTrigger = this.isPopupTrigger(me);
		this.panningTrigger = this.isPanningEnabled() &&
			this.isPanningTrigger(me);

		// Stores the location of the trigger event
		this.startX = me.getX();
		this.startY = me.getY();
		
		// Displays popup menu on Mac after the mouse was released
		if (this.panningTrigger)
		{
			this.consumePanningTrigger(me);
		}
	}
};

/**
 * Function: consumePanningTrigger
 * 
 * Consumes the given <mxMouseEvent> if it was a panning trigger in
 * <mouseDown>. The default is to invoke <mxMouseEvent.consume>. Note that this
 * will block any further event processing. If you haven't disabled built-in
 * context menus and require immediate selection of the cell on mouseDown in
 * Safari and/or on the Mac, then use the following code:
 * 
 * (code)
 * mxPanningHandler.prototype.consumePanningTrigger = function(me)
 * {
 *   if (me.evt.preventDefault)
 *   {
 *     me.evt.preventDefault();
 *   }
 *   
 *   // Stops event processing in IE
 *   me.evt.returnValue = false;
 *   
 *   // Sets local consumed state
 *   if (!mxClient.IS_SF && !mxClient.IS_MAC)
 *   {
 *     me.consumed = true;
 *   }
 * };
 * (end)
 */
mxPanningHandler.prototype.consumePanningTrigger = function(me)
{
	me.consume();
};

/**
 * Function: mouseMove
 * 
 * Handles the event by updating the panning on the graph.
 */
mxPanningHandler.prototype.mouseMove = function(sender, me)
{
	var dx = me.getX() - this.startX;
	var dy = me.getY() - this.startY;
	
	if (this.active)
	{
		if (this.previewEnabled)
		{
			// Applies the grid to the panning steps
			if (this.useGrid)
			{
				dx = this.graph.snap(dx);
				dy = this.graph.snap(dy);
			}
			
			this.graph.panGraph(dx + this.dx0, dy + this.dy0);
		}

		this.fireEvent(new mxEventObject(mxEvent.PAN, 'event', me));
		me.consume();
	}
	else if (this.panningTrigger)
	{
		var tmp = this.active;

		// Panning is activated only if the mouse is moved
		// beyond the graph tolerance
		this.active = Math.abs(dx) > this.graph.tolerance ||
			Math.abs(dy) > this.graph.tolerance;

		if (!tmp && this.active)
		{
			this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
		}
	}
};

/**
 * Function: mouseUp
 * 
 * Handles the event by setting the translation on the view or showing the
 * popupmenu.
 */
mxPanningHandler.prototype.mouseUp = function(sender, me)
{
	// Shows popup menu if mouse was not moved
	var dx = Math.abs(me.getX() - this.startX);
	var dy = Math.abs(me.getY() - this.startY);

	if (this.active)
	{
		if (!this.graph.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.graph.container))
		{
			dx = me.getX() - this.startX;
			dy = me.getY() - this.startY;
			
			// Applies the grid to the panning steps
			if (this.useGrid)
			{
				dx = this.graph.snap(dx);
				dy = this.graph.snap(dy);
			}
			
			var scale = this.graph.getView().scale;
			var t = this.graph.getView().translate;
			
			this.graph.panGraph(0, 0);
			this.panGraph(t.x + dx / scale, t.y + dy / scale);
		}
		
		this.active = false;
		this.fireEvent(new mxEventObject(mxEvent.PAN_END, 'event', me));
		me.consume();
	}
	else if (this.popupTrigger)
	{
		if (dx < this.graph.tolerance && dy < this.graph.tolerance)
		{
			var cell = this.getCellForPopupEvent(me);
			
			// Selects the cell for which the context menu is being displayed
			if (this.graph.isEnabled() && this.selectOnPopup &&
				cell != null && !this.graph.isCellSelected(cell))
			{
				this.graph.setSelectionCell(cell);
			}
			else if (this.clearSelectionOnBackground && cell == null)
			{
				this.graph.clearSelection();
			}
			
			// Hides the tooltip if there is one
			this.graph.tooltipHandler.hide();
			var origin = mxUtils.getScrollOrigin();
			var point = new mxPoint(me.getX() + origin.x,
				me.getY() + origin.y);
			
			// Menu is shifted by 1 pixel so that the mouse up event
			// is routed via the underlying shape instead of the DIV
			this.popup(point.x + 1, point.y + 1, cell, me.getEvent());
			me.consume();
		}
	}
	
	this.panningTrigger = false;
	this.popupTrigger = false;
};

/**
 * Function: getCellForPopupEvent
 * 
 * Hook to return the cell for the mouse up popup trigger handling.
 */
mxPanningHandler.prototype.getCellForPopupEvent = function(me)
{
	return me.getCell();
};

/**
 * Function: panGraph
 * 
 * Pans <graph> by the given amount.
 */
mxPanningHandler.prototype.panGraph = function(dx, dy)
{
	this.graph.getView().setTranslate(dx, dy);
};

/**
 * Function: destroy
 * 
 * Destroys the handler and all its resources and DOM nodes.
 */
mxPanningHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	
	// Supercall
	mxPopupMenu.prototype.destroy.apply(this);
};
