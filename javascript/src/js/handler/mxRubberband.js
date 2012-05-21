/**
 * $Id: mxRubberband.js,v 1.48 2012-04-13 12:53:30 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxRubberband
 * 
 * Event handler that selects rectangular regions. This is not built-into
 * <mxGraph>. To enable rubberband selection in a graph, use the following code.
 * 
 * Example:
 * 
 * (code)
 * var rubberband = new mxRubberband(graph);
 * (end)
 * 
 * Constructor: mxRubberband
 * 
 * Constructs an event handler that selects rectangular regions in the graph
 * using rubberband selection.
 */
function mxRubberband(graph)
{
	if (graph != null)
	{
		this.graph = graph;
		this.graph.addMouseListener(this);
		
		// Repaints the marquee after autoscroll
		this.panHandler = mxUtils.bind(this, function()
		{
			this.repaint();
		});
		
		this.graph.addListener(mxEvent.PAN, this.panHandler);

		// Automatic deallocation of memory
		if (mxClient.IS_IE)
		{
			mxEvent.addListener(window, 'unload',
				mxUtils.bind(this, function()
				{
					this.destroy();
				})
			);
		}
	}
};

/**
 * Variable: defaultOpacity
 * 
 * Specifies the default opacity to be used for the rubberband div. Default
 * is 20.
 */
mxRubberband.prototype.defaultOpacity = 20;

/**
 * Variable: enabled
 * 
 * Specifies if events are handled. Default is true.
 */
mxRubberband.prototype.enabled = true;

/**
 * Variable: div
 * 
 * Holds the DIV element which is currently visible.
 */
mxRubberband.prototype.div = null;

/**
 * Variable: sharedDiv
 * 
 * Holds the DIV element which is used to display the rubberband.
 */
mxRubberband.prototype.sharedDiv = null;

/**
 * Variable: currentX
 * 
 * Holds the value of the x argument in the last call to <update>.
 */
mxRubberband.prototype.currentX = 0;

/**
 * Variable: currentY
 * 
 * Holds the value of the y argument in the last call to <update>.
 */
mxRubberband.prototype.currentY = 0;

/**
 * Function: isEnabled
 * 
 * Returns true if events are handled. This implementation returns
 * <enabled>.
 */
mxRubberband.prototype.isEnabled = function()
{
	return this.enabled;
};
		
/**
 * Function: setEnabled
 * 
 * Enables or disables event handling. This implementation updates
 * <enabled>.
 */
mxRubberband.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

/**
 * Function: mouseDown
 * 
 * Handles the event by initiating a rubberband selection. By consuming the
 * event all subsequent events of the gesture are redirected to this
 * handler.
 */
mxRubberband.prototype.mouseDown = function(sender, me)
{
	if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled() &&
		(this.graph.isForceMarqueeEvent(me.getEvent()) || me.getState() == null))
	{
		var offset = mxUtils.getOffset(this.graph.container);
		var origin = mxUtils.getScrollOrigin(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		this.start(me.getX() + origin.x, me.getY() + origin.y);

		// Workaround for rubberband stopping if the mouse leaves the
		// graph container in Firefox.
		if (mxClient.IS_NS && !mxClient.IS_SF && !mxClient.IS_GC)
		{
			var container = this.graph.container;
			
			function createMouseEvent(evt)
			{
				var me = new mxMouseEvent(evt);
				var pt = mxUtils.convertPoint(container, me.getX(), me.getY());
				
				me.graphX = pt.x;
				me.graphY = pt.y;
				
				return me;
			};
			
			this.dragHandler = mxUtils.bind(this, function(evt)
			{
				this.mouseMove(this.graph, createMouseEvent(evt));
			});

			this.dropHandler = mxUtils.bind(this, function(evt)
			{
				this.mouseUp(this.graph, createMouseEvent(evt));
			});

			mxEvent.addListener(document, 'mousemove', this.dragHandler);
			mxEvent.addListener(document, 'mouseup', this.dropHandler);
		}
		
		// Does not prevent the default for this event so that the
		// event processing chain is still executed even if we start
		// rubberbanding. This is required eg. in ExtJs to hide the
		// current context menu. In mouseMove we'll make sure we're
		// not selecting anything while we're rubberbanding.
		me.consume(false);
	}
};

/**
 * Function: start
 * 
 * Sets the start point for the rubberband selection.
 */
mxRubberband.prototype.start = function(x, y)
{
	this.first = new mxPoint(x, y);
};

/**
 * Function: mouseMove
 * 
 * Handles the event by updating therubberband selection.
 */
mxRubberband.prototype.mouseMove = function(sender, me)
{
	if (!me.isConsumed() && this.first != null)
	{
		var origin = mxUtils.getScrollOrigin(this.graph.container);
		var offset = mxUtils.getOffset(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		var x = me.getX() + origin.x;
		var y = me.getY() + origin.y;
		var dx = this.first.x - x;
		var dy = this.first.y - y;
		var tol = this.graph.tolerance;
		
		if (this.div != null || Math.abs(dx) > tol ||  Math.abs(dy) > tol)
		{
			if (this.div == null)
			{
				this.div = this.createShape();
			}
			
			// Clears selection while rubberbanding. This is required because
			// the event is not consumed in mouseDown.
			mxUtils.clearSelection();
			
			this.update(x, y);
			me.consume();
		}
	}
};

/**
 * Function: createShape
 * 
 * Creates the rubberband selection shape.
 */
mxRubberband.prototype.createShape = function()
{
	if (this.sharedDiv == null)
	{
		this.sharedDiv = document.createElement('div');
		this.sharedDiv.className = 'mxRubberband';
		mxUtils.setOpacity(this.sharedDiv, this.defaultOpacity);
	}

	this.graph.container.appendChild(this.sharedDiv);
		
	return this.sharedDiv;
};

/**
 * Function: mouseUp
 * 
 * Handles the event by selecting the region of the rubberband using
 * <mxGraph.selectRegion>.
 */
mxRubberband.prototype.mouseUp = function(sender, me)
{
	var execute = this.div != null;
	this.reset();

	if (execute)
	{
		var rect = new mxRectangle(this.x, this.y, this.width, this.height);
		this.graph.selectRegion(rect, me.getEvent());
		me.consume();
	}
};

/**
 * Function: reset
 * 
 * Resets the state of the rubberband selection.
 */
mxRubberband.prototype.reset = function()
{
	if (this.div != null)
	{
		this.div.parentNode.removeChild(this.div);
	}

	if (this.dragHandler != null)
	{
		mxEvent.removeListener(document, 'mousemove', this.dragHandler);
		this.dragHandler = null;
	}
	
	if (this.dropHandler != null)
	{
		mxEvent.removeListener(document, 'mouseup', this.dropHandler);
		this.dropHandler = null;
	}
	
	this.currentX = 0;
	this.currentY = 0;
	this.first = null;
	this.div = null;
};

/**
 * Function: update
 * 
 * Sets <currentX> and <currentY> and calls <repaint>.
 */
mxRubberband.prototype.update = function(x, y)
{
	this.currentX = x;
	this.currentY = y;
	
	this.repaint();
};

/**
 * Function: repaint
 * 
 * Computes the bounding box and updates the style of the <div>.
 */
mxRubberband.prototype.repaint = function()
{
	if (this.div != null)
	{
		var x = this.currentX - this.graph.panDx;
		var y = this.currentY - this.graph.panDy;
		
		this.x = Math.min(this.first.x, x);
		this.y = Math.min(this.first.y, y);
		this.width = Math.max(this.first.x, x) - this.x;
		this.height =  Math.max(this.first.y, y) - this.y;

		var dx = (mxClient.IS_VML) ? this.graph.panDx : 0;
		var dy = (mxClient.IS_VML) ? this.graph.panDy : 0;
		
		this.div.style.left = (this.x + dx) + 'px';
		this.div.style.top = (this.y + dy) + 'px';
		this.div.style.width = Math.max(1, this.width) + 'px';
		this.div.style.height = Math.max(1, this.height) + 'px';
	}
};

/**
 * Function: destroy
 * 
 * Destroys the handler and all its resources and DOM nodes. This does
 * normally not need to be called, it is called automatically when the
 * window unloads.
 */
mxRubberband.prototype.destroy = function()
{
	if (!this.destroyed)
	{
		this.destroyed = true;
		this.graph.removeMouseListener(this);
		this.graph.removeListener(this.panHandler);
		this.reset();
		
		if (this.sharedDiv != null)
		{
			this.sharedDiv = null;
		}
	}
};
