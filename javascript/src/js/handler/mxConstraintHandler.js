/**
 * Copyright (c) 2006-2013, JGraph Ltd
 */
/**
 * Class: mxConstraintHandler
 *
 * Handles constraints on connection targets. This class is in charge of
 * showing fixed points when the mouse is over a vertex and handles constraints
 * to establish new connections.
 *
 * Constructor: mxConstraintHandler
 *
 * Constructs an new constraint handler.
 * 
 * Parameters:
 * 
 * graph - Reference to the enclosing <mxGraph>.
 * factoryMethod - Optional function to create the edge. The function takes
 * the source and target <mxCell> as the first and second argument and
 * returns the <mxCell> that represents the new edge.
 */
function mxConstraintHandler(graph)
{
	this.graph = graph;
};

/**
 * Variable: pointImage
 * 
 * <mxImage> to be used as the image for fixed connection points.
 */
mxConstraintHandler.prototype.pointImage = new mxImage(mxClient.imageBasePath + '/point.gif', 5, 5);

/**
 * Variable: graph
 * 
 * Reference to the enclosing <mxGraph>.
 */
mxConstraintHandler.prototype.graph = null;

/**
 * Variable: enabled
 * 
 * Specifies if events are handled. Default is true.
 */
mxConstraintHandler.prototype.enabled = true;

/**
 * Variable: highlightColor
 * 
 * Specifies the color for the highlight. Default is <mxConstants.DEFAULT_VALID_COLOR>.
 */
mxConstraintHandler.prototype.highlightColor = mxConstants.DEFAULT_VALID_COLOR;

/**
 * Function: isEnabled
 * 
 * Returns true if events are handled. This implementation
 * returns <enabled>.
 */
mxConstraintHandler.prototype.isEnabled = function()
{
	return this.enabled;
};
	
/**
 * Function: setEnabled
 * 
 * Enables or disables event handling. This implementation
 * updates <enabled>.
 * 
 * Parameters:
 * 
 * enabled - Boolean that specifies the new enabled state.
 */
mxConstraintHandler.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

/**
 * Function: reset
 * 
 * Resets the state of this handler.
 */
mxConstraintHandler.prototype.reset = function()
{
	if (this.focusIcons != null)
	{
		for (var i = 0; i < this.focusIcons.length; i++)
		{
			this.focusIcons[i].destroy();
		}
		
		this.focusIcons = null;
	}
	
	if (this.focusHighlight != null)
	{
		this.focusHighlight.destroy();
		this.focusHighlight = null;
	}
	
	this.currentConstraint = null;
	this.currentFocusArea = null;
	this.currentPoint = null;
	this.currentFocus = null;
	this.focusPoints = null;
};

/**
 * Function: getTolerance
 * 
 * Returns the tolerance to be used for intersecting connection points. This
 * implementation returns <mxGraph.tolerance>.
 * 
 * Parameters:
 * 
 * me - <mxMouseEvent> whose tolerance should be returned.
 */
mxConstraintHandler.prototype.getTolerance = function(me)
{
	return this.graph.getTolerance();
};

/**
 * Function: getImageForConstraint
 * 
 * Returns the tolerance to be used for intersecting connection points.
 */
mxConstraintHandler.prototype.getImageForConstraint = function(state, constraint, point)
{
	return this.pointImage;
};

/**
 * Function: isEventIgnored
 * 
 * Returns true if the given <mxMouseEvent> should be ignored in <update>. This
 * implementation always returns false.
 */
mxConstraintHandler.prototype.isEventIgnored = function(me, source)
{
	return false;
};

/**
 * Function: isStateIgnored
 * 
 * Returns true if the given state should be ignored. This always returns false.
 */
mxConstraintHandler.prototype.isStateIgnored = function(state, source)
{
	return false;
};

/**
 * Function: destroyIcons
 * 
 * Destroys the <focusIcons> if they exist.
 */
mxConstraintHandler.prototype.destroyIcons = function()
{
	if (this.focusIcons != null)
	{
		for (var i = 0; i < this.focusIcons.length; i++)
		{
			this.focusIcons[i].destroy();
		}
		
		this.focusIcons = null;
		this.focusPoints = null;
	}
};

/**
 * Function: destroyFocusHighlight
 * 
 * Destroys the <focusHighlight> if one exists.
 */
mxConstraintHandler.prototype.destroyFocusHighlight = function()
{
	if (this.focusHighlight != null)
	{
		this.focusHighlight.destroy();
		this.focusHighlight = null;
	}
};

/**
 * Function: update
 * 
 * Updates the state of this handler based on the given <mxMouseEvent>.
 * Source is a boolean indicating if the cell is a source or target.
 */
mxConstraintHandler.prototype.update = function(me, source)
{
	if (this.isEnabled() && !this.isEventIgnored(me))
	{
		var tol = this.getTolerance(me);
		var mouse = new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol);
		var connectable = (me.getCell() != null) ? this.graph.isCellConnectable(me.getCell()) : false;

		if ((this.currentFocusArea == null || (!mxUtils.intersects(this.currentFocusArea, mouse) ||
			(me.getState() != null && this.currentFocus != null && connectable))))
		{
			this.currentFocusArea = null;
	
			if (me.getState() != this.currentFocus)
			{
				this.currentFocus = null;
				this.constraints = (me.getState() != null && connectable && !this.isStateIgnored(me.getState(), source)) ?
					this.graph.getAllConnectionConstraints(me.getState(), source) : null;
				
				// Only uses cells which have constraints
				if (this.constraints != null)
				{
					this.currentFocus = me.getState();
					this.currentFocusArea = new mxRectangle(me.getState().x, me.getState().y, me.getState().width, me.getState().height);
					
					if (this.focusIcons != null)
					{
						for (var i = 0; i < this.focusIcons.length; i++)
						{
							this.focusIcons[i].destroy();
						}
						
						this.focusIcons = null;
						this.focusPoints = null;
					}
					
					this.focusIcons = [];
					this.focusPoints = [];
					
					for (var i = 0; i < this.constraints.length; i++)
					{
						var cp = this.graph.getConnectionPoint(me.getState(), this.constraints[i]);
						var img = this.getImageForConstraint(me.getState(), this.constraints[i], cp);
	
						var src = img.src;
						var bounds = new mxRectangle(cp.x - img.width / 2,
							cp.y - img.height / 2, img.width, img.height);
						var icon = new mxImageShape(bounds, src);
						icon.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
								mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
						icon.preserveImageAspect = false;
						icon.init(this.graph.getView().getDecoratorPane());
						
						// Fixes lost event tracking for images in quirks / IE8 standards
						if (mxClient.IS_QUIRKS || document.documentMode == 8)
						{
							mxEvent.addListener(icon.node, 'dragstart', function(evt)
							{
								mxEvent.consume(evt);
								
								return false;
							});
						}
						
						// Move the icon behind all other overlays
						if (icon.node.previousSibling != null)
						{
							icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
						}
	
						var getState = mxUtils.bind(this, function()
						{
							return (this.currentFocus != null) ? this.currentFocus : me.getState();
						});
						
						icon.redraw();
	
						mxEvent.redirectMouseEvents(icon.node, this.graph, getState);
						this.currentFocusArea.add(icon.bounds);
						this.focusIcons.push(icon);
						this.focusPoints.push(cp);
					}
					
					this.currentFocusArea.grow(tol);
				}
				else
				{
					this.destroyIcons();
					this.destroyFocusHighlight();
				}
			}
		}

		this.currentConstraint = null;
		this.currentPoint = null;
		var minDistSq = null;
		
		if (this.focusIcons != null && this.constraints != null &&
			(me.getState() == null || this.currentFocus == me.getState()))
		{
			for (var i = 0; i < this.focusIcons.length; i++)
			{
				var dx = me.getGraphX() - this.focusIcons[i].bounds.getCenterX();
				var dy = me.getGraphY() - this.focusIcons[i].bounds.getCenterY();
				var tmp = dx * dx + dy * dy;
				
				if (mxUtils.intersects(this.focusIcons[i].bounds, mouse) && (minDistSq == null || tmp < minDistSq))
				{
					this.currentConstraint = this.constraints[i];
					this.currentPoint = this.focusPoints[i];
					minDistSq = tmp;
					
					var tmp = this.focusIcons[i].bounds.clone();
					tmp.grow((mxClient.IS_IE) ? 3 : 2);
					
					if (mxClient.IS_IE)
					{
						tmp.width -= 1;
						tmp.height -= 1;
					}
					
					if (this.focusHighlight == null)
					{
						var hl = new mxRectangleShape(tmp, null, this.highlightColor, 3);
						hl.pointerEvents = false;
						
						hl.dialect = (this.graph.dialect == mxConstants.DIALECT_SVG) ?
								mxConstants.DIALECT_SVG : mxConstants.DIALECT_VML;
						hl.init(this.graph.getView().getOverlayPane());
						this.focusHighlight = hl;
						
						var getState = mxUtils.bind(this, function()
						{
							return (this.currentFocus != null) ? this.currentFocus : me.getState();
						});
	
						mxEvent.redirectMouseEvents(hl.node, this.graph, getState);
					}
					else
					{
						this.focusHighlight.bounds = tmp;
						this.focusHighlight.redraw();
					}
				}
			}
		}
		
		if (this.currentConstraint == null)
		{
			this.destroyFocusHighlight();
		}
	}
	else
	{
		this.currentConstraint = null;
		this.currentFocus = null;
		this.currentPoint = null;
	}
};

/**
 * Function: destroy
 * 
 * Destroy this handler.
 */
mxConstraintHandler.prototype.destroy = function()
{
	this.reset();
};
