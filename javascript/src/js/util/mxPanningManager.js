/**
 * $Id: mxPanningManager.js,v 1.4 2012-04-23 18:59:36 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPanningManager
 *
 * Implements a handler for panning.
 */
function mxPanningManager(graph)
{
	this.thread = null;
	this.active = false;
	this.tdx = 0;
	this.tdy = 0;
	this.t0x = 0;
	this.t0y = 0;
	this.dx = 0;
	this.dy = 0;
	
	this.mouseListener =
	{
	    mouseDown: function(sender, me) { },
	    mouseMove: function(sender, me) { },
	    mouseUp: mxUtils.bind(this, function(sender, me)
	    {
	    	if (this.active)
	    	{
	    		this.stop();
	    	}
	    })
	};
	
	graph.addMouseListener(this.mouseListener);
	
	var createThread = mxUtils.bind(this, function()
	{
		return window.setInterval(mxUtils.bind(this, function()
		{
			this.tdx -= this.dx;
			this.tdy -= this.dy;
			graph.panGraph(this.getDx(), this.getDy());
		}), this.delay);
	});
	
	this.isActive = function()
	{
		return active;
	};
	
	this.getDx = function()
	{
		return Math.round(this.tdx);
	};
	
	this.getDy = function()
	{
		return Math.round(this.tdy);
	};
	
	this.start = function()
	{
		this.t0x = graph.view.translate.x;
		this.t0y = graph.view.translate.y;
		this.active = true;
	};
	
	this.panTo = function(x, y, w, h)
	{
		if (!this.active)
		{
			this.start();
		}
		
		w = (w != null) ? w : 0;
		h = (h != null) ? h : 0;
		
		var c = graph.container;
		this.dx = x + w - c.scrollLeft - c.clientWidth;
		
		if (this.dx < 0 && Math.abs(this.dx) < this.border)
		{
			this.dx = this.border + this.dx;
		}
		else if (this.handleMouseOut)
		{
			this.dx = Math.max(this.dx, 0);
		}
		else
		{
			this.dx = 0;
		}
		
		if (this.dx == 0)
		{
			this.dx = x - c.scrollLeft;
			
			if (this.dx > 0 && this.dx < this.border)
			{
				this.dx = this.dx - this.border;
			}
			else if (this.handleMouseOut)
			{
				this.dx = Math.min(0, this.dx);
			}
			else
			{
				this.dx = 0;
			}
		}
		
		this.dy = y + h - c.scrollTop - c.clientHeight;

		if (this.dy < 0 && Math.abs(this.dy) < this.border)
		{
			this.dy = this.border + this.dy;
		}
		else if (this.handleMouseOut)
		{
			this.dy = Math.max(this.dy, 0);
		}
		else
		{
			this.dy = 0;
		}
		
		if (this.dy == 0)
		{
			this.dy = y - c.scrollTop;
			
			if (this.dy > 0 && this.dy < this.border)
			{
				this.dy = this.dy - this.border;
			}
			else if (this.handleMouseOut)
			{
				this.dy = Math.min(0, this.dy);
			} 
			else
			{
				this.dy = 0;
			}
		}
		
		if (this.dx != 0 || this.dy != 0)
		{
			this.dx *= this.damper;
			this.dy *= this.damper;
			
			if (this.thread == null)
			{
				this.thread = createThread();
			}
		}
		else if (this.thread != null)
		{
			window.clearInterval(this.thread);
			this.thread = null;
		}
	};
	
	this.stop = function()
	{
		if (this.active)
		{
			this.active = false;
			var px = graph.panDx;
			var py = graph.panDy;
	    	
	    	if (this.thread != null)
	    	{
				window.clearInterval(this.thread);
				this.thread = null;
	    	}
	    	
	    	if (px != 0 || py != 0)
	    	{
	    		graph.panGraph(0, 0);
		    	graph.view.setTranslate(this.t0x + px / graph.view.scale, this.t0y + py / graph.view.scale);
				this.tdx = 0;
				this.tdy = 0;
	    	}
		}
	};
	
	this.destroy = function()
	{
		graph.removeMouseListener(this.mouseListener);
	};
};

/**
 * Variable: damper
 * 
 * Damper value for the panning. Default is 1/6.
 */
mxPanningManager.prototype.damper = 1/6;

/**
 * Variable: delay
 * 
 * Delay in milliseconds for the panning. Default is 10.
 */
mxPanningManager.prototype.delay = 10;

/**
 * Variable: handleMouseOut
 * 
 * Specifies if mouse events outside of the component should be handled. Default is true. 
 */
mxPanningManager.prototype.handleMouseOut = true;

/**
 * Variable: border
 * 
 * Border to handle automatic panning inside the component. Default is 0 (disabled).
 */
mxPanningManager.prototype.border = 0;
