/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph instance. Note that the constructor does not take a
 * container because the graph instance is needed for creating the UI, which
 * in turn will create the container for the graph. Hence, the container is
 * assigned later in EditorUi.
 */
// Makes the shadow brighter
mxConstants.SHADOWCOLOR = '#d0d0d0';

// Changes some default colors
mxConstants.HANDLE_FILLCOLOR = '#99ccff';
mxConstants.HANDLE_STROKECOLOR = '#0088cf';
mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';
mxConstants.OUTLINE_COLOR = '#00a8ff';
mxConstants.OUTLINE_HANDLE_FILLCOLOR = '#99ccff';
mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#00a8ff';
mxConstants.CONNECT_HANDLE_FILLCOLOR = '#cee7ff';
mxConstants.EDGE_SELECTION_COLOR = '#00a8ff';
mxConstants.DEFAULT_VALID_COLOR = '#00a8ff';
mxConstants.LABEL_HANDLE_FILLCOLOR = '#cee7ff';
mxConstants.GUIDE_COLOR = '#0088cf';

mxGraph.prototype.pageBreakColor = '#c0c0c0';
mxGraph.prototype.pageScale = 1;

// Matches label positions of mxGraph 1.x
mxText.prototype.baseSpacingTop = 5;
mxText.prototype.baseSpacingBottom = 1;

// Enables caching for HTML labels
mxText.prototype.cacheEnabled = true;

/**
 * Adds custom stencils defined via shape=stencil(value) style. The value is a base64 encoded, compressed and
 * URL encoded XML definition of the shape according to the stencil definition language of mxGraph.
 */
var mxCellRendererCreateShape = mxCellRenderer.prototype.createShape;
mxCellRenderer.prototype.createShape = function(state)
{
	if (state.style != null && typeof(Zlib) !== 'undefined')
	{
    	var shape = mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null);

    	// Extracts and decodes stencil XML if shape has the form shape=stencil(value)
    	if (shape != null && shape.substring(0, 8) == 'stencil(')
    	{
    		try
    		{
    			var stencil = shape.substring(8, shape.length - 1);
    			var doc = mxUtils.parseXml(decodeURIComponent(RawDeflate.inflate((window.atob) ? atob(stencil) : Base64.decode(stencil, true))));
    			
    			return new mxShape(new mxStencil(doc.documentElement));
    		}
    		catch (e)
    		{
    			console.log('Error in shape: ' + e);
    		}
    	}
	}
	
	return mxCellRendererCreateShape.apply(this, arguments);
};

/**
 * Defines graph class.
 */
Graph = function(container, model, renderHint, stylesheet)
{
	mxGraph.call(this, container, model, renderHint, stylesheet);

    // Adds support for HTML labels via style. Note: Currently, only the Java
    // backend supports HTML labels but CSS support is limited to the following:
    // http://docs.oracle.com/javase/6/docs/api/index.html?javax/swing/text/html/CSS.html
	this.isHtmlLabel = function(cell)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		return style['html'] == '1' || style[mxConstants.STYLE_WHITE_SPACE] == 'wrap';
	};
	
	// HTML entities are displayed as plain text in wrapped plain text labels
	this.cellRenderer.getLabelValue = function(state)
	{
		var result = mxCellRenderer.prototype.getLabelValue.apply(this, arguments);
		
		if (state.view.graph.isHtmlLabel(state.cell))
		{
			if (state.style['html'] != 1)
			{
				result = mxUtils.htmlEntities(result, false);
			}
			else
			{
				result = state.view.graph.sanitizeHtml(result);
			}
		}
		
		return result;
	};
	
	// All code below not available and not needed in embed mode
	if (typeof mxVertexHandler !== 'undefined')
	{
		this.setConnectable(true);
		this.setDropEnabled(true);
		this.setPanning(true);
		this.setTooltips(true);
		this.setAllowLoops(true);
		this.allowAutoPanning = true;
		this.resetEdgesOnConnect = false;
		this.constrainChildren = false;
		
		// Do not scroll after moving cells
		this.graphHandler.scrollOnMove = false;
		this.graphHandler.scaleGrid = true;

		// Enables cloning of connection sources by default
		this.connectionHandler.setCreateTarget(true);
		
		// Disables built-in connection starts except shift is pressed when hovering the cell
		this.connectionHandler.isValidSource = function(cell, me)
		{
			return mxConnectionHandler.prototype.isValidSource.apply(this, arguments) &&
				((urlParams['connect'] != '2' && urlParams['connect'] != null) ||
				(!this.graph.isCellSelected(cell) && mxEvent.isControlDown(me.getEvent())));
		};

		// Sets the style to be used when an elbow edge is double clicked
		this.alternateEdgeStyle = 'vertical';

		if (stylesheet == null)
		{
			this.loadStylesheet();
		}
		
		// Changes color of move preview for black backgrounds
		this.graphHandler.createPreviewShape = function(bounds)
		{
			this.previewColor = (this.graph.background == '#000000') ? 'white' : mxGraphHandler.prototype.previewColor;
			
			return mxGraphHandler.prototype.createPreviewShape.apply(this, arguments);
		};
		
		// Handles parts of cells by checking if part=1 is in the style and returning the parent
		// if the parent is not already in the list of cells. container style is used to disable
		// step into swimlanes and dropTarget style is used to disable acting as a drop target.
		// LATER: Handle recursive parts
		this.graphHandler.getCells = function(initialCell)
		{
		    var cells = mxGraphHandler.prototype.getCells.apply(this, arguments);
		    var newCells = [];

		    for (var i = 0; i < cells.length; i++)
		    {
				var state = this.graph.view.getState(cells[i]);
				var style = (state != null) ? state.style : this.graph.getCellStyle(cells[i]);
		    	
				if (mxUtils.getValue(style, 'part', '0') == '1')
				{
			        var parent = this.graph.model.getParent(cells[i]);
		
			        if (this.graph.model.isVertex(parent) && mxUtils.indexOf(cells, parent) < 0)
			        {
			            newCells.push(parent);
			        }
				}
				else
				{
					newCells.push(cells[i]);
				}
		    }

		    return newCells;
		};

		// Handles parts of cells when cloning the source for new connections
		this.connectionHandler.createTargetVertex = function(evt, source)
		{
			if (mxEvent.isControlDown(evt))
			{
				return null;
			}
			else
			{
				var state = this.graph.view.getState(source);
				var style = (state != null) ? state.style : this.graph.getCellStyle(source);
		    	
				if (mxUtils.getValue(style, 'part', false))
				{
			        var parent = this.graph.model.getParent(source);
	
			        if (this.graph.model.isVertex(parent))
			        {
			        	source = parent;
			        }
				}
				
				return mxConnectionHandler.prototype.createTargetVertex.apply(this, arguments);
			}
		};
		
	    var rubberband = new mxRubberband(this);
	    
	    this.getRubberband = function()
	    {
	    	return rubberband;
	    };
	    
	    // Timer-based activation of outline connect in connection handler
	    var startTime = new Date().getTime();
	    var timeOnTarget = 0;
	    
	    var connectionHandlerMouseMove = this.connectionHandler.mouseMove;
	    
	    this.connectionHandler.mouseMove = function()
	    {
	    	var prev = this.currentState;
	    	connectionHandlerMouseMove.apply(this, arguments);
	    	
	    	if (prev != this.currentState)
	    	{
	    		startTime = new Date().getTime();
	    		timeOnTarget = 0;
	    	}
	    	else
	    	{
		    	timeOnTarget = new Date().getTime() - startTime;
	    	}
	    };

	    // Activates outline connect after 500ms or if alt is pressed
	    var connectionHandleIsOutlineConnectEvent = this.connectionHandler.isOutlineConnectEvent;
	    
	    this.connectionHandler.isOutlineConnectEvent = function(me)
	    {
	    	return timeOnTarget > 1500 || ((mxEvent.isAltDown(me.getEvent()) || timeOnTarget > 500) &&
	    		connectionHandleIsOutlineConnectEvent.apply(this, arguments));
	    };
	    
	    // Workaround for Firefox where first mouse down is received
	    // after tap and hold if scrollbars are visible, which means
	    // start rubberband immediately if no cell is under mouse.
	    var isForceRubberBandEvent = rubberband.isForceRubberbandEvent;
	    rubberband.isForceRubberbandEvent = function(me)
	    {
	    	return isForceRubberBandEvent.apply(this, arguments) ||
	    		(mxUtils.hasScrollbars(this.graph.container) && mxClient.IS_FF &&
	    		mxClient.IS_WIN && me.getState() == null && mxEvent.isTouchEvent(me.getEvent()));
	    };
	    
	    // Shows hand cursor while panning
		this.panningHandler.addListener(mxEvent.PAN_START, mxUtils.bind(this, function()
		{
			this.container.style.cursor = 'move';
		}));
			
		this.panningHandler.addListener(mxEvent.PAN_END, mxUtils.bind(this, function()
		{
			this.container.style.cursor = 'default';
		}));
	    
	    // Forces panning for middle and right mouse buttons
		var panningHandlerIsForcePanningEvent = this.panningHandler.isForcePanningEvent;
		this.panningHandler.isForcePanningEvent = function(me)
		{
			return panningHandlerIsForcePanningEvent.apply(this, arguments) ||
				(mxEvent.isMouseEvent(me.getEvent()) && (mxEvent.isRightMouseButton(me.getEvent()) ||
				mxEvent.isMiddleMouseButton(me.getEvent())));
		};
	
		this.popupMenuHandler.autoExpand = true;
		
		this.popupMenuHandler.isSelectOnPopup = function(me)
		{
			return mxEvent.isMouseEvent(me.getEvent());
		};
	
		// Enables links if graph is "disabled" (ie. read-only)
		var click = this.click;
		this.click = function(me)
		{
			if (!this.isEnabled())
			{
				var cell = me.getCell();
				
				if (cell != null)
				{
					var link = this.getLinkForCell(cell);
					
					if (link != null)
					{
						window.open(link);
					}
				}
			}
			else
			{
				return click.apply(this, arguments);
			}
		};
		
		// Shows pointer cursor for clickable cells with links
		// ie. if the graph is disabled and cells cannot be selected
		var getCursorForCell = this.getCursorForCell;
		this.getCursorForCell = function(cell)
		{
			if (!this.isEnabled())
			{
				var link = this.getLinkForCell(cell);
				
				if (link != null)
				{
					return 'pointer';
				}
			}
			else
			{
				return getCursorForCell.apply(this, arguments);
			}
		};
		
		// Changes rubberband selection to be recursive
		this.selectRegion = function(rect, evt)
		{
			var cells = this.getAllCells(rect.x, rect.y, rect.width, rect.height);
			this.selectCellsForEvent(cells, evt);
			
			return cells;
		};
		
		// Recursive implementation for rubberband selection
		this.getAllCells = function(x, y, width, height, parent, result)
		{
			result = (result != null) ? result : [];
			
			if (width > 0 || height > 0)
			{
				var model = this.getModel();
				var right = x + width;
				var bottom = y + height;
	
				if (parent == null)
				{
					parent = this.getCurrentRoot();
					
					if (parent == null)
					{
						parent = model.getRoot();
					}
				}
				
				if (parent != null)
				{
					var childCount = model.getChildCount(parent);
					
					for (var i = 0; i < childCount; i++)
					{
						var cell = model.getChildAt(parent, i);
						var state = this.view.getState(cell);
						
						if (state != null && this.isCellVisible(cell))
						{
							var deg = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0;
							var box = state;
							
							if (deg != 0)
							{
								box = mxUtils.getBoundingBox(box, deg);
							}
							
							if ((model.isEdge(cell) || model.isVertex(cell)) &&
								box.x >= x && box.y + box.height <= bottom &&
								box.y >= y && box.x + box.width <= right)
							{
								result.push(cell);
							}
	
							this.getAllCells(x, y, width, height, cell, result);
						}
					}
				}
			}
			
			return result;
		};
		
		// Never removes cells from parents that are being moved
		var graphHandlerShouldRemoveCellsFromParent = this.graphHandler.shouldRemoveCellsFromParent;
		this.graphHandler.shouldRemoveCellsFromParent = function(parent, cells, evt)
		{
			if (this.graph.isCellSelected(parent))
			{
				return false;
			}
			
			return graphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
		};
		
		// Splitting edges is disabled
		this.setSplitEnabled(false);

		// Unlocks all cells
		this.isCellLocked = function(cell)
		{
			return false;
		};
		
		// Tap and hold on background starts rubberband for multiple selected
		// cells the cell associated with the event is deselected
		this.addListener(mxEvent.TAP_AND_HOLD, mxUtils.bind(this, function(sender, evt)
		{
			if (!mxEvent.isMultiTouchEvent(evt))
			{
				var me = evt.getProperty('event');
				var cell = evt.getProperty('cell');
				
				if (cell == null)
				{
					var pt = mxUtils.convertPoint(this.container,
							mxEvent.getClientX(me), mxEvent.getClientY(me));
					rubberband.start(pt.x, pt.y);
				}
				else if (this.getSelectionCount() > 1 && this.isCellSelected(cell))
				{
					this.removeSelectionCell(cell);
				}
				
				// Blocks further processing of the event
				evt.consume();
			}
		}));
	
		// On connect the target is selected and we clone the cell of the preview edge for insert
		this.connectionHandler.selectCells = function(edge, target)
		{
			this.graph.setSelectionCell(target || edge);
		};
		
		// Shows connection points only if cell not selected
		this.connectionHandler.constraintHandler.isStateIgnored = function(state, source)
		{
			return source && state.view.graph.isCellSelected(state.cell);
		};
		
		// Updates constraint handler if the selection changes
		this.selectionModel.addListener(mxEvent.CHANGE, mxUtils.bind(this, function()
		{
			var ch = this.connectionHandler.constraintHandler;
			
			if (ch.currentFocus != null && ch.isStateIgnored(ch.currentFocus, true))
			{
				ch.currentFocus = null;
				ch.constraints = null;
				ch.destroyIcons();
			}
			
			ch.destroyFocusHighlight();
		}));
		
		// Initializes touch interface
		if (touchStyle)
		{
			this.initTouch();
		}
	}
};

// Graph inherits from mxGraph
mxUtils.extend(Graph, mxGraph);

/**
 * Allows to all values in fit.
 */
Graph.prototype.minFitScale = null;

/**
 * Allows to all values in fit.
 */
Graph.prototype.maxFitScale = null;

/**
 * Sets the default target for all links in cells.
 */
Graph.prototype.linkTarget = '_blank';

/**
 * Installs child layout styles.
 */
Graph.prototype.init = function()
{
	mxGraph.prototype.init.apply(this, arguments);
	var graph = this;

	this.layoutManager = new mxLayoutManager(this);

	this.layoutManager.getLayout = function(cell)
	{
		var state = this.graph.view.getState(cell);
		var style = (state != null) ? state.style : this.graph.getCellStyle(cell);
		
		if (style['childLayout'] == 'stackLayout')
		{
			var stackLayout = new mxStackLayout(this.graph, true);
			stackLayout.resizeParentMax = true;
			stackLayout.horizontal = mxUtils.getValue(style, 'horizontalStack', '1') == '1';
			stackLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			stackLayout.resizeLast = mxUtils.getValue(style, 'resizeLast', '0') == '1';
			stackLayout.marginLeft = style['marginLeft'] || 0;
			stackLayout.marginRight = style['marginRight'] || 0;
			stackLayout.marginTop = style['marginTop'] || 0;
			stackLayout.marginBottom = style['marginBottom'] || 0;
			stackLayout.fill = true;
			
			return stackLayout;
		}
		else if (style['childLayout'] == 'treeLayout')
		{
			var treeLayout = new mxCompactTreeLayout(this.graph);
			treeLayout.horizontal = mxUtils.getValue(style, 'horizontalTree', '1') == '1';
			treeLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			treeLayout.groupPadding = mxUtils.getValue(style, 'parentPadding', 20);
			treeLayout.levelDistance = mxUtils.getValue(style, 'treeLevelDistance', 30);
			treeLayout.maintainParentLocation = true;
			treeLayout.edgeRouting = false;
			treeLayout.resetEdges = false;
			
			return treeLayout;
		}
		else if (style['childLayout'] == 'flowLayout')
		{
			var flowLayout = new mxHierarchicalLayout(this.graph, mxUtils.getValue(style,
					'flowOrientation', mxConstants.DIRECTION_EAST));
			flowLayout.resizeParent = mxUtils.getValue(style, 'resizeParent', '1') == '1';
			flowLayout.parentBorder = mxUtils.getValue(style, 'parentPadding', 20);
			flowLayout.maintainParentLocation = true;
			
			// Special undocumented styles for changing the hierarchical
			flowLayout.intraCellSpacing = mxUtils.getValue(style, 'intraCellSpacing', mxHierarchicalLayout.prototype.intraCellSpacing);
			flowLayout.interRankCellSpacing = mxUtils.getValue(style, 'interRankCellSpacing', mxHierarchicalLayout.prototype.interRankCellSpacing);
			flowLayout.interHierarchySpacing = mxUtils.getValue(style, 'interHierarchySpacing', mxHierarchicalLayout.prototype.interHierarchySpacing);
			flowLayout.parallelEdgeSpacing = mxUtils.getValue(style, 'parallelEdgeSpacing', mxHierarchicalLayout.prototype.parallelEdgeSpacing);
			
			return flowLayout;
		}
		
		return null;
	};
};

/**
 * Sanitizes the given HTML markup.
 */
Graph.prototype.sanitizeHtml = function(value)
{
	// Uses https://code.google.com/p/google-caja/wiki/JsHtmlSanitizer
	// TODO: Add MathML to whitelisted tags
	function urlX(url) { if(/^https?:\/\//.test(url)) { return url }}
    function idX(id) { return id }
	
	return html_sanitize(value, urlX, idX);
};

/**
 * Returns the label for the given cell.
 */
Graph.prototype.convertValueToString = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		return cell.value.getAttribute('label');
	}
	
	return mxGraph.prototype.convertValueToString.apply(this, arguments);
};

/**
 * Returns the link for the given cell.
 */
Graph.prototype.getLinkForCell = function(cell)
{
	if (cell.value != null && typeof(cell.value) == 'object')
	{
		return cell.value.getAttribute('link');
	}
	
	return null;
};

/**
 * Overrides label orientation for collapsed swimlanes inside stack.
 */
Graph.prototype.getCellStyle = function(cell)
{
	var style = mxGraph.prototype.getCellStyle.apply(this, arguments);
	
	if (cell != null && this.layoutManager != null)
	{
		var parent = this.model.getParent(cell);
		
		if (this.model.isVertex(parent) && this.isCellCollapsed(cell))
		{
			var layout = this.layoutManager.getLayout(parent);
			
			if (layout != null && layout.constructor == mxStackLayout)
			{
				style[mxConstants.STYLE_HORIZONTAL] = !layout.horizontal;
			}
		}
	}
	
	return style;
};

/**
 * Disables alternate width persistence for stack layout parents
 */
Graph.prototype.updateAlternateBounds = function(cell, geo, willCollapse)
{
	if (cell != null && geo != null && this.layoutManager != null && geo.alternateBounds != null)
	{
		var layout = this.layoutManager.getLayout(this.model.getParent(cell));
		
		if (layout != null && layout.constructor == mxStackLayout)
		{
			if (layout.horizontal)
			{
				geo.alternateBounds.height = 0;
			}
			else
			{
				geo.alternateBounds.width = 0;
			}
		}
	}
	
	mxGraph.prototype.updateAlternateBounds.apply(this, arguments);
};

/**
 * Adds Shift+collapse/expand and size management for folding inside stack
 */
Graph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable, evt)
{
	recurse = (recurse != null) ? recurse : false;
	
	if (cells == null)
	{
		cells = this.getFoldableCells(this.getSelectionCells(), collapse);
	}
	
	if (cells != null)
	{
		this.model.beginUpdate();
		
		try
		{
			mxGraph.prototype.foldCells.apply(this, arguments);
			
			// Resizes all parent stacks if alt is not pressed
			if (this.layoutManager != null)
			{
				for (var i = 0; i < cells.length; i++)
				{
					var state = this.view.getState(cells[i]);
					var geo = this.getCellGeometry(cells[i]);
					
					if (state != null && geo != null)
					{
						var dx = Math.round(geo.width - state.width / this.view.scale);
						var dy = Math.round(geo.height - state.height / this.view.scale);
						
						if (dy != 0 || dx != 0)
						{
							var parent = this.model.getParent(cells[i]);
							var layout = this.layoutManager.getLayout(parent);
							
							if (layout == null)
							{
								// Moves cells to the right and down after collapse/expand
								if (evt != null && mxEvent.isShiftDown(evt))
								{
									this.moveSiblings(state, parent, dx, dy);
								} 
							}
							else if ((evt == null || !mxEvent.isAltDown(evt)) && layout.constructor == mxStackLayout && !layout.resizeLast)
							{
								this.resizeParentStacks(parent, layout, dx, dy);
							}
						}
					}
				}
			}
		}
		finally
		{
			this.model.endUpdate();
		}
		
		// Selects cells after folding
		if (this.isEnabled())
		{
			this.setSelectionCells(cells);
		}
	}
};

/**
 * Overrides label orientation for collapsed swimlanes inside stack.
 */
Graph.prototype.moveSiblings = function(state, parent, dx, dy)
{
	this.model.beginUpdate();
	try
	{
		var cells = this.getCellsBeyond(state.x, state.y, parent, true, true);
		
		for (var i = 0; i < cells.length; i++)
		{
			if (cells[i] != state.cell)
			{
				var tmp = this.view.getState(cells[i]);
				var geo = this.getCellGeometry(cells[i]);
				
				if (tmp != null && geo != null)
				{
					geo = geo.clone();
					geo.translate(Math.round(dx * Math.max(0, Math.min(1, (tmp.x - state.x) / state.width))),
						Math.round(dy * Math.max(0, Math.min(1, (tmp.y - state.y) / state.height))));
					this.model.setGeometry(cells[i], geo);
				}
			}
		}
	}
	finally
	{
		this.model.endUpdate();
	}
};

/**
 * Overrides label orientation for collapsed swimlanes inside stack.
 */
Graph.prototype.resizeParentStacks = function(parent, layout, dx, dy)
{
	if (this.layoutManager != null && layout != null && layout.constructor == mxStackLayout && !layout.resizeLast)
	{
		this.model.beginUpdate();
		try
		{
			var dir = layout.horizontal;
			
			// Bubble resize up for all parent stack layouts with same orientation
			while (parent != null && layout != null && layout.constructor == mxStackLayout &&
				layout.horizontal == dir && !layout.resizeLast)
			{
				var pgeo = this.getCellGeometry(parent);
				var pstate = this.view.getState(parent);
				
				if (pstate != null && pgeo != null)
				{
					pgeo = pgeo.clone();
					
					if (layout.horizontal)
					{
						pgeo.width += dx + Math.min(0, pstate.width / this.view.scale - pgeo.width);									
					}
					else
					{
						pgeo.height += dy + Math.min(0, pstate.height / this.view.scale - pgeo.height);
					}
		
					this.model.setGeometry(parent, pgeo);
				}
				
				parent = this.model.getParent(parent);
				layout = this.layoutManager.getLayout(parent);
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

/**
 * Disables drill-down for non-swimlanes.
 */
Graph.prototype.isContainer = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	if (this.isSwimlane(cell))
	{
		return style['container'] != '0';
	}
	else
	{
		return style['container'] == '1';
	}
};

/**
 * Disables folding for non-swimlanes.
 */
Graph.prototype.isCellFoldable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.foldingEnabled && ((this.isContainer(cell) && style['collapsible'] != '0') ||
		(!this.isContainer(cell) && style['collapsible'] == '1'));
};

/**
 * Overridden to limit zoom to 20x.
 */
Graph.prototype.zoom = function(factor, center)
{
	factor = Math.min(this.view.scale * factor, 20) / this.view.scale;
	
	mxGraph.prototype.zoom.apply(this, arguments);
};

/**
 * These overrides only applied if  are only added if mxVertexHandler is defined (ie. not in embedded graph)
 */
if (typeof mxVertexHandler != 'undefined')
{	
	/**
	 * Hook for subclassers.
	 */
	Graph.prototype.getPagePadding = function()
	{
		return new mxPoint(0, 0);
	};
	
	/**
	 * Loads the stylesheet for this graph.
	 */
	Graph.prototype.loadStylesheet = function()
	{
	    var node = mxUtils.load(STYLE_PATH + '/default.xml').getDocumentElement();
		var dec = new mxCodec(node.ownerDocument);
		dec.decode(node, this.getStylesheet());
	};
	
	/**
	 * Overrides method to provide connection constraints for shapes.
	 */
	Graph.prototype.getAllConnectionConstraints = function(terminal, source)
	{
		if (terminal != null)
		{
			var constraints = mxUtils.getValue(terminal.style, 'points', null);
			
			if (constraints != null)
			{
				// Requires an array of arrays with x, y (0..1) and an optional
				// perimeter (0 or 1), eg. points=[[0,0,1],[0,1,0],[1,1]]
				var result = [];
				
				try
				{
					var c = JSON.parse(constraints);
					
					for (var i = 0; i < c.length; i++)
					{
						var tmp = c[i];
						result.push(new mxConnectionConstraint(new mxPoint(tmp[0], tmp[1]), (tmp.length > 2) ? tmp[2] != '0' : true));
					}
				}
				catch (e)
				{
					// ignore
				}
				
				return result;
			}
			else
			{
				if (terminal.shape != null)
				{
					if (terminal.shape.stencil != null)
					{
						if (terminal.shape.stencil != null)
						{
							return terminal.shape.stencil.constraints;
						}
					}
					else if (terminal.shape.constraints != null)
					{
						return terminal.shape.constraints;
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Inverts the elbow edge style without removing existing styles.
	 */
	Graph.prototype.flipEdge = function(edge)
	{
		if (edge != null)
		{
			var state = this.view.getState(edge);
			var style = (state != null) ? state.style : this.getCellStyle(edge);
			
			if (style != null)
			{
				var elbow = mxUtils.getValue(style, mxConstants.STYLE_ELBOW,
					mxConstants.ELBOW_HORIZONTAL);
				var value = (elbow == mxConstants.ELBOW_HORIZONTAL) ?
					mxConstants.ELBOW_VERTICAL : mxConstants.ELBOW_HORIZONTAL;
				this.setCellStyles(mxConstants.STYLE_ELBOW, value, [edge]);
			}
		}
	};

	/**
	 * Disables drill-down for non-swimlanes.
	 */
	Graph.prototype.isValidRoot = function(cell)
	{
		return this.isContainer(cell);
	};
	
	/**
	 * Disables drill-down for non-swimlanes.
	 */
	Graph.prototype.isValidDropTarget = function(cell)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
	
		return mxUtils.getValue(style, 'part', '0') != '1' && (this.isContainer(cell) ||
			(mxGraph.prototype.isValidDropTarget.apply(this, arguments) &&
			mxUtils.getValue(style, 'dropTarget', '1') != '0'));
	};

	/**
	 * Overrides createGroupCell to set the group style for new groups to 'group'.
	 */
	Graph.prototype.createGroupCell = function()
	{
		var group = mxGraph.prototype.createGroupCell.apply(this, arguments);
		group.setStyle('group');
		
		return group;
	};
	
	/**
	 * Disables extending parents with stack layouts on add
	 */
	Graph.prototype.isExtendParentsOnAdd = function(cell)
	{
		var result = mxGraph.prototype.isExtendParentsOnAdd.apply(this, arguments);
		
		if (result && cell != null && this.layoutManager != null)
		{
			var parent = this.model.getParent(cell);
			
			if (parent != null)
			{
				var layout = this.layoutManager.getLayout(parent);
				
				if (layout != null && layout.constructor == mxStackLayout)
				{
					result = false;
				}
			}
		}
		
		return result;
	};

	/**
	 * Overrides tooltips to show custom tooltip or metadata.
	 */
	Graph.prototype.getTooltipForCell = function(cell)
	{
		var tip = '';
		
		if (mxUtils.isNode(cell.value))
		{
			var tmp = cell.value.getAttribute('tooltip');
			
			if (tmp != null)
			{
				tip = this.sanitizeHtml(tmp);
			}
			else
			{
				var ignored = ['label', 'tooltip'];
				var attrs = cell.value.attributes;
				
				// Hides links in edit mode
				if (this.isEnabled())
				{
					ignored.push('link');
				}
				
				for (var i = 0; i < attrs.length; i++)
				{
					if (mxUtils.indexOf(ignored, attrs[i].nodeName) < 0 && attrs[i].nodeValue.length > 0)
					{
						var key = attrs[i].nodeName.substring(0, 1).toUpperCase() + attrs[i].nodeName.substring(1);
						tip += key + ': ' + mxUtils.htmlEntities(attrs[i].nodeValue) + '\n';
					}
				}
				
				if (tip.length > 0)
				{
					tip = tip.substring(0, tip.length - 1);
				}
			}
		}
		
		return tip;
	};
	
	/**
	 * Overrides autosize to add a border.
	 */
	Graph.prototype.getPreferredSizeForCell = function(cell)
	{
		var result = mxGraph.prototype.getPreferredSizeForCell.apply(this, arguments);
		
		// Adds buffer
		if (result != null)
		{
			result.width += 10;
			result.height += 4;
			
			if (this.gridEnabled)
			{
				result.width = this.snap(result.width);
				result.height = this.snap(result.height);
			}
		}
		
		return result;
	}
	
	/**
	 * Removes all illegal control characters with ASCII code <32 except TAB, LF
	 * and CR.
	 */
	Graph.prototype.zapGremlins = function(text)
	{
		var checked = [];
		
		for (var i = 0; i < text.length; i++)
		{
			var code = text.charCodeAt(i);
			
			// Removes all control chars except TAB, LF and CR
			if (code >= 32 || code == 9 || code == 10 || code == 13)
			{
				checked.push(text.charAt(i));
			}
		}
		
		return checked.join('');
	};
	
	/**
	 * Turns the given cells and returns the changed cells.
	 */
	Graph.prototype.turnShapes = function(cells)
	{
		var model = this.getModel();
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
						var edgeState = this.view.getState(cell);
						var sourceState = this.view.getState(src);
						var targetState = this.view.getState(trg);
						
						if (edgeState != null)
						{
							var sc = (sourceState != null) ? this.getConnectionConstraint(edgeState, sourceState, true) : null;
							var tc = (targetState != null) ? this.getConnectionConstraint(edgeState, targetState, false) : null;
							
							this.setConnectionConstraint(cell, src, true, tc);
							this.setConnectionConstraint(cell, trg, false, sc);
						}
	
						select.push(cell);
					}
				}
				else if (model.isVertex(cell))
				{
					var geo = this.getCellGeometry(cell);
		
					if (geo != null)
					{
						// Rotates the size and position in the geometry
						geo = geo.clone();
						geo.x += geo.width / 2 - geo.height / 2;
						geo.y += geo.height / 2 - geo.width / 2;
						var tmp = geo.width;
						geo.width = geo.height;
						geo.height = tmp;
						model.setGeometry(cell, geo);
						
						// Reads the current direction and advances by 90 degrees
						var state = this.view.getState(cell);
						
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
							
							this.setCellStyles(mxConstants.STYLE_DIRECTION, dir, [cell]);
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
		
		return select;
	};
	
	/**
	 * Handles label changes for XML user objects.
	 */
	Graph.prototype.cellLabelChanged = function(cell, value, autoSize)
	{
		// Removes all illegal control characters in user input
		value = this.zapGremlins(value);
		
		if (cell.value != null && typeof(cell.value) == 'object')
		{
			var tmp = cell.value.cloneNode(true);
			tmp.setAttribute('label', value);
			value = tmp;
		}
		
		mxGraph.prototype.cellLabelChanged.apply(this, arguments);
	};
	
	/**
	 * Sets the link for the given cell.
	 */
	Graph.prototype.setLinkForCell = function(cell, link)
	{
		this.setAttributeForCell(cell, 'link', link);
	};
	
	/**
	 * Sets the link for the given cell.
	 */
	Graph.prototype.setTooltipForCell = function(cell, link)
	{
		this.setAttributeForCell(cell, 'tooltip', link);
	};
	
	/**
	 * Sets the link for the given cell.
	 */
	Graph.prototype.setAttributeForCell = function(cell, attributeName, attributeValue)
	{
		var value = null;
		
		if (cell.value != null && typeof(cell.value) == 'object')
		{
			value = cell.value.cloneNode(true);
		}
		else
		{
			var doc = mxUtils.createXmlDocument();
			
			value = doc.createElement('UserObject');
			value.setAttribute('label', cell.value || '');
		}
		
		if (attributeValue != null && attributeValue.length > 0)
		{
			value.setAttribute(attributeName, attributeValue);
		}
		else
		{
			value.removeAttribute(attributeName);
		}
		
		this.model.setValue(cell, value);
	};
	
	/**
	 * Overridden to stop moving edge labels between cells.
	 */
	Graph.prototype.getDropTarget = function(cells, evt, cell, clone)
	{
		var model = this.getModel();
		
		// Disables drop into group if alt is pressed
		if (mxEvent.isAltDown(evt))
		{
			return null;
		}
		
		// Disables dragging edge labels out of edges
		for (var i = 0; i < cells.length; i++)
		{
			if (this.model.isEdge(this.model.getParent(cells[i])))
			{
				return null;
			}
		}
		
		return mxGraph.prototype.getDropTarget.apply(this, arguments);
	};
	
	/**
	 * Overrides double click handling to add the tolerance and inserting text.
	 */
	Graph.prototype.dblClick = function(evt, cell)
	{
		if (this.isEnabled())
		{
			var pt = mxUtils.convertPoint(this.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
	
			// Automatically adds new child cells to edges on double click
			if (evt != null && !this.model.isVertex(cell))
			{
				var state = (this.model.isEdge(cell)) ? this.view.getState(cell) : null;
				
				if (state == null || (state.text == null || state.text.node == null ||
					(!mxUtils.contains(state.text.boundingBox, pt.x, pt.y) &&
					!mxUtils.isAncestorNode(state.text.node, mxEvent.getSource(evt)))))
				{
					cell = this.addText(pt.x, pt.y, state);
				}
			}
		
			mxGraph.prototype.dblClick.call(this, evt, cell);
		}
	};
	
	/**
	 * Adds a new label at the given position and returns the new cell. State is
	 * an optional edge state to be used as the parent for the label. Vertices
	 * are not allowed currently as states.
	 */
	Graph.prototype.addText = function(x, y, state)
	{
		// Creates a new edge label with a predefined text
		var label = new mxCell();
		label.value = 'Text';
		label.style = 'text;html=1;resizable=0;'
		label.geometry = new mxGeometry(0, 0, 0, 0);
		label.connectable = false;
		label.vertex = true;
		
		if (state != null)
		{
			label.style += ';align=center;verticalAlign=middle;labelBackgroundColor=#ffffff;'
			label.geometry.relative = true;
			
			// Resets the relative location stored inside the geometry
			var pt2 = this.view.getRelativePoint(state, x, y);
			label.geometry.x = Math.round(pt2.x * 10000) / 10000;
			label.geometry.y = Math.round(pt2.y);
			
			// Resets the offset inside the geometry to find the offset from the resulting point
			label.geometry.offset = new mxPoint(0, 0);
			pt2 = this.view.getPoint(state, label.geometry);
		
			var scale = this.view.scale;
			label.geometry.offset = new mxPoint(Math.round((x - pt2.x) / scale), Math.round((y - pt2.y) / scale));
		}
		else
		{
			label.style += 'autosize=1;align=left;verticalAlign=top;spacingTop=-4;'
	
			var tr = this.view.translate;
			label.geometry.width = '40';
			label.geometry.height = '20';
			label.geometry.x = Math.round(x / this.view.scale) - tr.x;
			label.geometry.y = Math.round(y / this.view.scale) - tr.y;
		}
			
		this.getModel().beginUpdate();
		try
		{
			this.addCells([label], (state != null) ? state.cell : null);
			this.fireEvent(new mxEventObject('cellsInserted', 'cells', [label]));
		}
		finally
		{
			this.getModel().endUpdate();
		}
		
		return label;
	};
	
	/**
	 * Duplicates the given cells and returns the duplicates.
	 */
	Graph.prototype.duplicateCells = function(cells, append)
	{
		cells = (cells != null) ? cells : this.getSelectionCells();
		append = (append != null) ? append : true;
		
		cells = this.model.getTopmostCells(cells);
		
		var model = this.getModel();
		var s = this.gridSize;
		var select = [];
		
		model.beginUpdate();
		try
		{
			var clones = this.cloneCells(cells, false);
			
			for (var i = 0; i < cells.length; i++)
			{
				var parent = model.getParent(cells[i]);
				var child = this.moveCells([clones[i]], s, s, false, parent)[0]; 
				select.push(child);
				
				if (append)
				{
					model.add(parent, clones[i]);
				}
				else
				{
					// Maintains child index by inserting after cloned in parent
					var index = parent.getIndex(cells[i]);
					model.add(parent, clones[i], index + 1);
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
		
		return select;
	};
	
	/**
	 * Inserts the given image at the cursor in a content editable text box using
	 * the insertimage command on the document instance and updates the size.
	 */
	Graph.prototype.insertImage = function(newValue, w, h)
	{
		// To find the new image, we create a list of all existing links first
		if (newValue != null)
		{
			var tmp = this.cellEditor.text2.getElementsByTagName('img');
			var oldImages = [];
			
			for (var i = 0; i < tmp.length; i++)
			{
				oldImages.push(tmp[i]);
			}
	
			document.execCommand('insertimage', false, newValue);
			
			// Sets size of new image
			var newImages = this.cellEditor.text2.getElementsByTagName('img');
			
			if (newImages.length == oldImages.length + 1)
			{
				// Inverse order in favor of appended images
				for (var i = newImages.length - 1; i >= 0; i--)
				{
					if (i == 0 || newImages[i] != oldImages[i - 1])
					{
						newImages[i].style.width = w + 'px';
						newImages[i].style.height = h + 'px';
						
						break;
					}
				}
			}
		}
	};
	
	/**
	 * 
	 * @param cell
	 * @returns {Boolean}
	 */
	Graph.prototype.isCellResizable = function(cell)
	{
		var result = mxGraph.prototype.isCellResizable.apply(this, arguments);
	
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
			
		return result || (mxUtils.getValue(style, mxConstants.STYLE_RESIZABLE, '1') != '0' &&
			style[mxConstants.STYLE_WHITE_SPACE] == 'wrap');
	};
	
	/**
	 * Function: alignCells
	 * 
	 * Aligns the given cells vertically or horizontally according to the given
	 * alignment using the optional parameter as the coordinate.
	 * 
	 * Parameters:
	 * 
	 * horizontal - Boolean that specifies the direction of the distribution.
	 * cells - Optional array of <mxCells> to be distributed. Edges are ignored.
	 */
	Graph.prototype.distributeCells = function(horizontal, cells)
	{
		if (cells == null)
		{
			cells = this.getSelectionCells();
		}
		
		if (cells != null && cells.length > 1)
		{
			var vertices = [];
			var max = null;
			var min = null;
			
			for (var i = 0; i < cells.length; i++)
			{
				if (this.getModel().isVertex(cells[i]))
				{
					var state = this.view.getState(cells[i]);
					
					if (state != null)
					{
						var tmp = (horizontal) ? state.getCenterX() : state.getCenterY();
						max = (max != null) ? Math.max(max, tmp) : tmp;
						min = (min != null) ? Math.min(min, tmp) : tmp;
						
						vertices.push(state);
					}
				}
			}
			
			if (vertices.length > 2)
			{
				vertices.sort(function(a, b)
				{
					return (horizontal) ? a.x - b.x : a.y - b.y;
				});
	
				var t = this.view.translate;
				var s = this.view.scale;
				
				min = min / s - ((horizontal) ? t.x : t.y);
				max = max / s - ((horizontal) ? t.x : t.y);
				
				this.getModel().beginUpdate();
				try
				{
					var dt = (max - min) / (vertices.length - 1);
					var t0 = min;
					
					for (var i = 1; i < vertices.length - 1; i++)
					{
						var geo = this.getCellGeometry(vertices[i].cell);
						t0 += dt;
						
						if (geo != null)
						{
							geo = geo.clone();
							
							if (horizontal)
							{
								geo.x = Math.round(t0 - geo.width / 2);
							}
							else
							{
								geo.y = Math.round(t0 - geo.height / 2);
							}
							
							this.getModel().setGeometry(vertices[i].cell, geo);
						}
					}
				}
				finally
				{
					this.getModel().endUpdate();
				}
			}
		}
		
		return cells;
	};
	
	/**
	 * Translates this point by the given vector.
	 * 
	 * @param {number} dx X-coordinate of the translation.
	 * @param {number} dy Y-coordinate of the translation.
	 */
	Graph.prototype.getSvg = function(background, scale, border, nocrop, crisp, ignoreSelection, showText)
	{
		scale = (scale != null) ? scale : 1;
		border = (border != null) ? border : 1;
		crisp = (crisp != null) ? crisp : true;
		ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
		showText = (showText != null) ? showText : true;
		
		var imgExport = new mxImageExport();
		var bounds = (nocrop) ? this.view.getBackgroundPageBounds() : (ignoreSelection) ?
				this.getGraphBounds() : this.view.getBounds(this.getSelectionCells());
		var vs = this.view.scale;
	
		// Prepares SVG document that holds the output
		var svgDoc = mxUtils.createXmlDocument();
		var root = (svgDoc.createElementNS != null) ?
	    		svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
	    
		if (background != null)
		{
			if (root.style != null)
			{
				root.style.backgroundColor = background;
			}
			else
			{
				root.setAttribute('style', 'background-color:' + background);
			}
		}
	    
		if (svgDoc.createElementNS == null)
		{
	    	root.setAttribute('xmlns', mxConstants.NS_SVG);
	    	root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
		}
		else
		{
			// KNOWN: Ignored in IE9-11, adds namespace for each image element instead. No workaround.
			root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
		}
		
		root.setAttribute('width', (Math.ceil(bounds.width * scale / vs) + 2 * border) + 'px');
		root.setAttribute('height', (Math.ceil(bounds.height * scale / vs) + 2 * border) + 'px');
		root.setAttribute('version', '1.1');
		
	    // Adds group for anti-aliasing via transform
		var node = root;
		
		if (crisp)
		{
			var group = (svgDoc.createElementNS != null) ?
					svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
			group.setAttribute('transform', 'translate(0.5,0.5)');
			root.appendChild(group);
			svgDoc.appendChild(root);
			node = group;
		}
		else
		{
			svgDoc.appendChild(root);
		}
	
	    // Renders graph. Offset will be multiplied with state's scale when painting state.
		var svgCanvas = new mxSvgCanvas2D(node);
		svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs), Math.floor((border / scale - bounds.y) / vs));
		svgCanvas.scale(scale / vs);
		svgCanvas.textEnabled = showText;
		
		// Adds hyperlinks (experimental)
		imgExport.getLinkForCellState = mxUtils.bind(this, function(state, canvas)
		{
			return this.getLinkForCell(state.cell);
		});
		
		// Implements ignoreSelection flag
		imgExport.drawCellState = function(state, canvas)
		{
			if (ignoreSelection || state.view.graph.isCellSelected(state.cell))
			{
				mxImageExport.prototype.drawCellState.apply(this, arguments);
			}
		};
		
		// Paints background image
		var bgImg = this.backgroundImage;
		
		if (bgImg != null)
		{
			var tr = this.view.translate;
			svgCanvas.image(tr.x, tr.y, bgImg.width * vs / scale, bgImg.height * vs / scale, bgImg.src, false);
		}
		
		imgExport.drawState(this.getView().getState(this.model.root), svgCanvas);
	
		return root;
	};
	
	/**
	 * Returns the first ancestor of the current selection with the given name.
	 */
	Graph.prototype.getSelectedElement = function()
	{
		var node = null;
		
		if (window.getSelection)
		{
			var sel = window.getSelection();
			
		    if (sel.getRangeAt && sel.rangeCount)
		    {
		        var range = sel.getRangeAt(0);
		        node = range.commonAncestorContainer;
		    }
		}
		else if (document.selection)
		{
			node = document.selection.createRange().parentElement();
		}
		
		return node;
	};
	
	/**
	 * Returns the first ancestor of the current selection with the given name.
	 */
	Graph.prototype.getParentByName = function(node, name, stopAt)
	{
		while (node != null)
		{
			if (node.nodeName == name)
			{
				return node;
			}
	
			if (node == stopAt)
			{
				return null;
			}
			
			node = node.parentNode;
		}
		
		return node;
	};
	
	/**
	 * Selects the given node.
	 */
	Graph.prototype.selectNode = function(node)
	{
		var sel = null;
		
	    // IE9 and non-IE
		if (window.getSelection)
	    {
	    	sel = window.getSelection();
	    	
	        if (sel.getRangeAt && sel.rangeCount)
	        {
	        	var range = document.createRange();
	            range.selectNode(node);
	            sel.removeAllRanges();
	            sel.addRange(range);
	        }
	    }
	    // IE < 9
		else if ((sel = document.selection) && sel.type != 'Control')
	    {
	        var originalRange = sel.createRange();
	        originalRange.collapse(true);
	        range = sel.createRange();
	        range.setEndPoint('StartToStart', originalRange);
	        range.select();
	    }
	};
	
	/**
	 * Inserts a new row into the given table.
	 */
	Graph.prototype.insertRow = function(table, index)
	{
		var bd = table.tBodies[0];
		var cols = (bd.rows.length > 0) ? bd.rows[0].cells.length : 1;
		var row = bd.insertRow(index);
		
		for (var i = 0; i < cols; i++)
		{
			mxUtils.br(row.insertCell(-1));
		}
		
		return row.cells[0];
	};
	
	/**
	 * Deletes the given column.
	 */
	Graph.prototype.deleteRow = function(table, index)
	{
		table.tBodies[0].deleteRow(index);
	};
	
	/**
	 * Deletes the given column.
	 */
	Graph.prototype.insertColumn = function(table, index)
	{
		var hd = table.tHead;
		
		if (hd != null)
		{
			// TODO: use colIndex
			for (var h = 0; h < hd.rows.length; h++)
			{
				var th = document.createElement('th');
				hd.rows[h].appendChild(th);
				mxUtils.br(th);
			}
		}
	
		var bd = table.tBodies[0];
		
		for (var i = 0; i < bd.rows.length; i++)
		{
			var cell = bd.rows[i].insertCell(index);
			mxUtils.br(cell);
		}
		
		return bd.rows[0].cells[(index >= 0) ? index : bd.rows[0].cells.length - 1];
	};
	
	/**
	 * Deletes the given column.
	 */
	Graph.prototype.deleteColumn = function(table, index)
	{
		if (index >= 0)
		{
			var bd = table.tBodies[0];
			var rows = bd.rows;
			
			for (var i = 0; i < rows.length; i++)
			{
				if (rows[i].cells.length > index)
				{
					rows[i].deleteCell(index);
				}
			}
		}
	};
	
	/**
	 * Inserts the given HTML at the caret position (no undo).
	 */
	Graph.prototype.pasteHtmlAtCaret = function(html)
	{
	    var sel, range;
	
		// IE9 and non-IE
	    if (window.getSelection)
	    {
	        sel = window.getSelection();
	        
	        if (sel.getRangeAt && sel.rangeCount)
	        {
	            range = sel.getRangeAt(0);
	            range.deleteContents();
	
	            // Range.createContextualFragment() would be useful here but is
	            // only relatively recently standardized and is not supported in
	            // some browsers (IE9, for one)
	            var el = document.createElement("div");
	            el.innerHTML = html;
	            var frag = document.createDocumentFragment(), node;
	            
	            while ((node = el.firstChild))
	            {
	                lastNode = frag.appendChild(node);
	            }
	            
	            range.insertNode(frag);
	        }
	    }
	    // IE < 9
	    else if ((sel = document.selection) && sel.type != "Control")
	    {
	    	// FIXME: Does not work if selection is empty
	        sel.createRange().pasteHTML(html);
	    }
	};
	
	/**
	 * Customized graph for touch devices.
	 */
	Graph.prototype.initTouch = function()
	{
		// Disables new connections via "hotspot"
		this.connectionHandler.marker.isEnabled = function()
		{
			return this.graph.connectionHandler.first != null;
		};
	
		// Hides menu when editing starts
		this.addListener(mxEvent.START_EDITING, function(sender, evt)
		{
			this.popupMenuHandler.hideMenu();
		});
	
		// Adds custom hit detection if native hit detection found no cell
		this.updateMouseEvent = function(me)
		{
			var me = mxGraph.prototype.updateMouseEvent.apply(this, arguments);
	
			if (mxEvent.isTouchEvent(me.getEvent()) && me.getState() == null)
			{
				var cell = this.getCellAt(me.graphX, me.graphY);
	
				if (cell != null && this.isSwimlane(cell) && this.hitsSwimlaneContent(cell, me.graphX, me.graphY))
				{
					cell = null;
				}
				else
				{
					me.state = this.view.getState(cell);
					
					if (me.state != null && me.state.shape != null)
					{
						this.container.style.cursor = me.state.shape.node.style.cursor;
					}
				}
			}
			
			if (me.getState() == null)
			{
				this.container.style.cursor = 'default';
			}
			
			return me;
		};
	
		// Context menu trigger implementation depending on current selection state
		// combined with support for normal popup trigger.
		var cellSelected = false;
		var selectionEmpty = false;
		var menuShowing = false;
		
		this.fireMouseEvent = function(evtName, me, sender)
		{
			if (evtName == mxEvent.MOUSE_DOWN)
			{
				// For hit detection on edges
				me = this.updateMouseEvent(me);
				
				cellSelected = this.isCellSelected(me.getCell());
				selectionEmpty = this.isSelectionEmpty();
				menuShowing = this.popupMenuHandler.isMenuShowing();
			}
			
			mxGraph.prototype.fireMouseEvent.apply(this, arguments);
		};
		
		// Shows popup menu if cell was selected or selection was empty and background was clicked
		// FIXME: Conflicts with mxPopupMenuHandler.prototype.getCellForPopupEvent in Editor.js by
		// selecting parent for selected children in groups before this check can be made.
		this.popupMenuHandler.mouseUp = mxUtils.bind(this, function(sender, me)
		{
			this.popupMenuHandler.popupTrigger = !this.isEditing() && (this.popupMenuHandler.popupTrigger ||
				(!menuShowing && !mxEvent.isMouseEvent(me.getEvent()) &&
				((selectionEmpty && me.getCell() == null && this.isSelectionEmpty()) ||
				(cellSelected && this.isCellSelected(me.getCell())))));
			mxPopupMenuHandler.prototype.mouseUp.apply(this.popupMenuHandler, arguments);
		});
	};

	(function()
	{
		/**
		 * HTML in-place editor
		 */
		mxCellEditor.prototype.isContentEditing = function()
		{
			return this.text2 != null && this.text2.style.display != 'none';
		};
	
		/**
		 * Creates the keyboard event handler for the current graph and history.
		 */
		mxCellEditor.prototype.saveSelection = function()
		{
		    if (window.getSelection)
		    {
		        sel = window.getSelection();
		        
		        if (sel.getRangeAt && sel.rangeCount)
		        {
		            var ranges = [];
		            
		            for (var i = 0, len = sel.rangeCount; i < len; ++i)
		            {
		                ranges.push(sel.getRangeAt(i));
		            }
		            
		            return ranges;
		        }
		    }
		    else if (document.selection && document.selection.createRange)
		    {
		        return document.selection.createRange();
		    }
		    
		    return null;
		};
	
		/**
		 * Creates the keyboard event handler for the current graph and history.
		 */
		mxCellEditor.prototype.restoreSelection = function(savedSel)
		{
			if (savedSel)
			{
				if (window.getSelection)
				{
					sel = window.getSelection();
					sel.removeAllRanges();
	
					for (var i = 0, len = savedSel.length; i < len; ++i)
					{
						sel.addRange(savedSel[i]);
					}
				}
				else if (document.selection && savedSel.select)
				{
					savedSel.select();
				}
			}
		};
		
		/**
		 * Handling of special nl2Br style for not converting newlines to breaks in HTML labels.
		 * NOTE: Since it's easier to set this when the label is created we assume that it does
		 * not change during the lifetime of the mxText instance.
		 */
		var mxCellRendererInitializeLabel = mxCellRenderer.prototype.initializeLabel;
		mxCellRenderer.prototype.initializeLabel = function(state)
		{
			if (state.text != null)
			{
				state.text.replaceLinefeeds = mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
			}
			
			mxCellRendererInitializeLabel.apply(this, arguments);
		};

		/**
		 * HTML in-place editor
		 */
		mxCellEditor.prototype.toggleViewMode = function()
		{
			if (this.text2 != null)
			{
				var state = this.graph.view.getState(this.editingCell);
				var nl2Br = state != null && mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
				var tmp = this.saveSelection();
				
				if (this.textarea.style.display == 'none')
				{
					// Removes newlines from HTML and converts breaks to newlines
					// to match the HTML output in plain text
					var content = this.graph.sanitizeHtml((nl2Br) ? this.text2.innerHTML.replace(/\n/g, '').
						replace(/<br\s*.?>/g, '\n') : this.text2.innerHTML);
					
					if (this.textarea.value != content)
					{
						this.textarea.value = content;
						this.setModified(true);
					}
					
					this.textarea.style.display = 'block';
					this.text2.style.display = 'none';
					this.textarea.focus();
				}
				else
				{
					// Converts newlines in plain text to breaks in HTML
					// to match the plain text output
					var content = this.graph.sanitizeHtml((nl2Br) ? this.textarea.value.
						replace(/\n/g, '<br/>') : this.textarea.value);
					
					if (this.text2.innerHTML != content)
					{
						this.text2.innerHTML = content;
						this.setModified(true);
					}
					
					this.text2.style.display = '';
					this.textarea.style.display = 'none';
					this.text2.focus();
				}
			
				if (this.switchSelectionState != null)
				{
					this.restoreSelection(this.switchSelectionState);
				}
				
				this.switchSelectionState = tmp;
				this.resize();
			}
		};
		
		var mxConstraintHandlerUpdate = mxConstraintHandler.prototype.update;
		mxConstraintHandler.prototype.update = function(me, source)
		{
			if (this.isKeepFocusEvent(me) || !mxEvent.isAltDown(me.getEvent()))
			{
				mxConstraintHandlerUpdate.apply(this, arguments);
			}
			else
			{
				this.reset();
			}
		};

		/**
		 * No dashed shapes.
		 */
		mxGuide.prototype.createGuideShape = function(horizontal)
		{
			var guide = new mxPolyline([], mxConstants.GUIDE_COLOR, mxConstants.GUIDE_STROKEWIDTH);
			
			return guide;
		};
	
		if ('contentEditable' in document.documentElement)
		{
			/**
			 * Keypress starts immediate editing on selection cell
			 */
			var editorUiInit = EditorUi.prototype.init;
			EditorUi.prototype.init = function()
			{
				editorUiInit.apply(this, arguments);
	
				mxEvent.addListener(this.editor.graph.container, 'keypress', mxUtils.bind(this, function(evt)
				{
					// KNOWN: Focus does not work if label is empty in quirks mode
					if (!this.editor.graph.isEditing() && !this.editor.graph.isSelectionEmpty() && evt.which !== 0 &&
						!mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
					{
						this.editor.graph.escape();
						this.editor.graph.startEditing();
	
						if (mxClient.IS_FF)
						{
							var ce = this.editor.graph.cellEditor;
	
							// Initial keystroke is lost in FF
							if (ce.textarea.style.display != 'none')
							{
								ce.textarea.value = String.fromCharCode(evt.which);
							}
							else if (ce.text2 != null)
							{
								ce.text2.innerHTML = String.fromCharCode(evt.which);
					            var range = document.createRange();
					            range.selectNodeContents(ce.text2);
					            range.collapse(false);
					            
					            var selection = window.getSelection();
					            selection.removeAllRanges();
					            selection.addRange(range);
							}
						}
					}
				}));
			};
	
			/**
			 * HTML in-place editor
			 */
			var mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
			mxCellEditor.prototype.startEditing = function(cell, trigger)
			{
				this.graph.tooltipHandler.hideTooltip();
				this.switchSelectionState = null;
				
				// Selects editing cell
				this.graph.setSelectionCell(cell);
	
				// First run cannot set display before supercall because textarea is lazy created
				// Lazy instantiates textarea to save memory in IE
				if (this.textarea == null)
				{
					this.init();
				}
				
				var state = this.graph.view.getState(cell);
		
				if (state != null && state.style['html'] == 1)
				{
					this.textarea.style.display = 'none';
				}
				else
				{
					this.textarea.style.display = 'block';
				}
		
				mxCellEditorStartEditing.apply(this, arguments);
				
				// Enables focus outline for edges and edge labels
				var parent = this.graph.getModel().getParent(cell);
				var geo = this.graph.getCellGeometry(cell);
				
				if ((this.graph.getModel().isEdge(parent) && geo != null && geo.relative) ||
					this.graph.getModel().isEdge(cell))
				{
					// Quirks does not support outline at all so use border instead
					if (mxClient.IS_QUIRKS)
					{
						this.textarea.style.border = 'gray dotted 1px';
					}
					// IE>8 and FF on Windows uses outline default of none
					else if (mxClient.IS_IE || mxClient.IS_IE11 || (mxClient.IS_FF && mxClient.IS_WIN))
					{
						this.textarea.style.outline = 'gray dotted 1px';
					}
					else
					{
						this.textarea.style.outline = '';
					}
				}
				else if (mxClient.IS_QUIRKS)
				{
					this.textarea.style.border = '';
				}
		
				if (this.textarea.style.display == 'none')
				{
					this.text2 = document.createElement('div');
					this.text2.className = 'geContentEditable';
					var nl2Br = mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
					this.text2.innerHTML = this.graph.sanitizeHtml((nl2Br) ? this.textarea.value.replace(/\n/g, '<br/>') : this.textarea.value);
					
					var evtName = (!mxClient.IS_IE11 && (!mxClient.IS_IE || document.documentMode >= 9)) ? 'input' : 'keypress';
					mxEvent.addListener(this.text2, evtName, mxUtils.bind(this, function(evt)
					{
						if (this.autoSize && !mxEvent.isConsumed(evt))
						{
							setTimeout(mxUtils.bind(this, function()
							{
								this.resize();
							}), 0);
						}
					}));
					
					// Invokes stop editing and escape hooks
					mxEvent.addListener(this.text2, 'keydown', mxUtils.bind(this, function(evt)
					{
						if (!mxEvent.isConsumed(evt))
						{
							if (this.isStopEditingEvent(evt))
							{
								this.graph.stopEditing(false);
								mxEvent.consume(evt);
							}
							else if (evt.keyCode == 27 /* Escape */)
							{
								this.graph.stopEditing(true);
								mxEvent.consume(evt);
							}
						}
					}));
					
					var style = this.text2.style;
									
					// Required to catch all events on the background in IE
					style.backgroundImage = 'url(\'' + mxClient.imageBasePath + '/transparent.gif\')';
	
					style.cursor = 'text';
					style.position = 'absolute';
					style.border = this.textarea.style.border;
					style.outline = this.textarea.style.outline;
					style.width = parseInt(this.textarea.style.width) + 'px';
					style.height = (parseInt(this.textarea.style.height) - 4) + 'px';
					style.left = parseInt(this.textarea.style.left) + 'px';
					style.top = parseInt(this.textarea.style.top) + 'px';
					style.fontFamily = this.textarea.style.fontFamily;
					style.fontWeight = this.textarea.style.fontWeight;
					style.fontStyle = this.textarea.style.fontStyle;
					style.textAlign = this.textarea.style.textAlign;
					style.textDecoration = this.textarea.style.textDecoration;
					style.color = this.textarea.style.color;
					style.fontSize = this.textarea.style.fontSize;

					// TODO: Scale font sizes via transform
					// style.fontSize = Math.round(parseInt(this.textarea.style.fontSize) / state.view.scale) + 'px';
					// mxUtils.setPrefixedStyle(style, 'transform', 'scale(' + state.view.scale + ',' + state.view.scale + ')');
					
					var dir = this.textarea.getAttribute('dir');
					
					if (dir != null && dir.length > 0)
					{
						this.text2.setAttribute('dir', dir);
					}
					
					// Matches line height correctionFactor in embedded HTML output
					if (state.text != null && state.text.node != null && state.text.node.ownerSVGElement != null)
					{
						var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(parseInt(this.textarea.style.fontSize) * mxConstants.LINE_HEIGHT) + 'px' :
							(mxConstants.LINE_HEIGHT * mxSvgCanvas2D.prototype.lineHeightCorrection);
						style.lineHeight = lh;
					}
					else
					{
						style.lineHeight = this.textarea.style.lineHeight;
					}
					
					this.graph.container.appendChild(this.text2);
					
					if (this.autoSize)
					{
						this.textDiv = this.createTextDiv();
						document.body.appendChild(this.textDiv);
						this.resize();
					}
					
					this.text2.contentEditable = true;
					this.text2.focus();
	
					if (this.isSelectText() && this.text2.innerHTML.length > 0)
					{
						document.execCommand('selectAll', false, null);
					}
					
					// Hides handles on selected cell
					this.currentStateHandle = this.graph.selectionCellsHandler.getHandler(cell);
					
					if (this.currentStateHandle != null && this.currentStateHandle.setHandlesVisible != null)
					{
						this.currentStateHandle.setHandlesVisible(false);
	
						// Hides the bounding box while editing edge labels
						if (this.currentStateHandle.selectionBorder != null)
						{
							var model = this.graph.getModel();
							var parent = model.getParent(state.cell);
							var geo = this.graph.getCellGeometry(state.cell);
							
							if (model.isEdge(parent) && geo != null && geo.relative && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
							{
								this.currentStateHandle.selectionBorder.node.style.display = 'none';
							}
						}
					}
				}
			};
	
			var mxCellEditorResize = mxCellEditor.prototype.resize;
			mxCellEditor.prototype.resize = function()
			{
				// Shows in full size for HTML source mode
				if (this.text2 != null && this.textarea.style.display != 'none')
				{
					var state = this.graph.getView().getState(this.editingCell);
					
					if (state != null && this.graph.getModel().isVertex(state.cell))
					{
						var x = state.x;
						var y = state.y;
						var w = state.width;
						var h = state.height;
						
						if (w <= 1 && h <= 1)
						{
							w = Math.max(w, 120);
							h = Math.max(h, 40);
							var m = (state.text != null) ? state.text.margin : null;
							
							if (m == null)
							{
								var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
								var valign = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
						
								m = mxUtils.getAlignmentAsPoint(align, valign);
							}
							
							x += m.x * w;
							y += m.y * h;
						}
						
						this.textarea.style.left = Math.round(x) + 'px';
						this.textarea.style.top = Math.round(y) + 'px';
						this.textarea.style.width = Math.round(w) + 'px';
						this.textarea.style.height = Math.round(h) + 'px';
					}
				}
				else
				{
					mxCellEditorResize.apply(this, arguments);
					
					if (this.textarea.style.display == 'none' && this.text2 != null)
					{
						this.text2.style.top = parseInt(this.textarea.style.top) + 2 + 'px';
						this.text2.style.left = parseInt(this.textarea.style.left) + 1 + 'px';
						this.text2.style.width = this.textarea.style.width;
						this.text2.style.height = this.textarea.style.height;
					}				
				}
			};
			
			var mxCellEditorStopEditing = mxCellEditor.prototype.stopEditing;
			mxCellEditor.prototype.stopEditing = function(cancel)
			{
				// Hides handles on selected cell
				if (this.currentStateHandle != null)
				{
					if (this.currentStateHandle.setHandlesVisible != null)
					{
						this.currentStateHandle.setHandlesVisible(true);
						
						if (this.currentStateHandle.selectionBorder != null)
						{
							this.currentStateHandle.selectionBorder.node.style.display = '';
						}
					}
					
					this.currentStateHandle = null;
				}
				
				if (this.text2 != null)
				{
					var content = this.text2.innerHTML;
					
					// Modified state also updated in code view action
					if (this.text2.style.display != 'none' && this.textarea.value != content)
					{
						this.textarea.value = content.replace(/\r\n/g, '').replace(/\n/g, '');
						this.setModified(true);
					}
					else
					{
						var state = this.graph.view.getState(this.editingCell);
						var nl2Br = state != null && mxUtils.getValue(state.style, 'nl2Br', '1') != '0';
						
						if (nl2Br)
						{
							this.textarea.value = this.textarea.value.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');
						}
					}
					
					this.textarea.value = this.graph.sanitizeHtml(this.textarea.value);
					this.text2.parentNode.removeChild(this.text2);
					this.text2 = null;
				}
				
				// Removes empty relative child labels in edges
				var cell = this.editingCell;
				this.graph.getModel().beginUpdate();
				
				try
				{
					mxCellEditorStopEditing.apply(this, arguments);
	
					var parent = this.graph.getModel().getParent(cell);
					var geo = this.graph.getCellGeometry(cell);
					
					if (this.textarea != null && mxUtils.trim(this.textarea.value) == '' &&
						this.graph.getModel().isEdge(parent) && geo != null && geo.relative)
					{
						this.graph.removeCells([cell]);
					}
				}
				finally
				{
					this.graph.getModel().endUpdate();
				}
				
				this.graph.container.focus();
			};
			
			// Allows resizing for current HTML value
			var mxCellEditorGetCurrentValue = mxCellEditor.prototype.getCurrentValue;
			mxCellEditor.prototype.getCurrentValue = function()
			{
				if (this.textarea.style.display == 'none' && this.text2 != null)
				{
					return this.text2.innerHTML;
				}
				else
				{
					return mxCellEditorGetCurrentValue.apply(this, arguments);
				}
			};
			
			mxCellEditor.prototype.getMinimumSize = function(state)
			{
				var scale = this.graph.getView().scale;
				
				return new mxRectangle(0, 0, (state.text == null) ? 30 :  state.text.size * scale + 20, 30);
			};
			
			var mxCellEditorGetCurrentHtmlValue = mxCellEditor.prototype.getCurrentHtmlValue;
			mxCellEditor.prototype.getCurrentHtmlValue = function()
			{
				if (this.textarea.style.display == 'none' && this.text2 != null)
				{
					return this.getCurrentValue();
				}
				else
				{
					return mxCellEditorGetCurrentHtmlValue.apply(this, arguments);
				}
			};
	
			// Workaround for focusLost calls stopEditing when in HTML view
			var mxCellEditorFocusLost = mxCellEditor.prototype.focusLost;
			mxCellEditor.prototype.focusLost = function(evt)
			{
				if (this.text2 == null)
				{
					mxCellEditorFocusLost.apply(this, arguments);
				}
			};
		}
	
		function createHint()
		{
			var hint = document.createElement('div');
			hint.className = 'geHint';
			hint.style.whiteSpace = 'nowrap';
			hint.style.position = 'absolute';
			
			return hint;
		};
		
		/**
		 * Updates the hint for the current operation.
		 */
		mxGraphHandler.prototype.updateHint = function(me)
		{
			if (this.shape != null)
			{
				if (this.hint == null)
				{
					this.hint = createHint();
					this.graph.container.appendChild(this.hint);
				}
	
				var t = this.graph.view.translate;
				var s = this.graph.view.scale;
				var x = this.roundLength((this.bounds.x + this.currentDx) / s - t.x);
				var y = this.roundLength((this.bounds.y + this.currentDy) / s - t.y);
				
				this.hint.innerHTML = x + ', ' + y;
	
				this.hint.style.left = (this.shape.bounds.x + Math.round((this.shape.bounds.width - this.hint.clientWidth) / 2)) + 'px';
				this.hint.style.top = (this.shape.bounds.y + this.shape.bounds.height + 12) + 'px';
			}
		};
	
		/**
		 * Updates the hint for the current operation.
		 */
		mxGraphHandler.prototype.removeHint = function()
		{
			if (this.hint != null)
			{
				this.hint.parentNode.removeChild(this.hint);
				this.hint = null;
			}
		};

		/**
		 * Enables recursive resize for groups.
		 */
		mxVertexHandler.prototype.isRecursiveResize = function(state, me)
		{
			return !this.graph.isSwimlane(state.cell) && this.graph.model.getChildCount(state.cell) > 0 &&
				!mxEvent.isControlDown(me.getEvent()) && !this.graph.isCellCollapsed(state.cell) &&
				mxUtils.getValue(state.style, 'recursiveResize', '1') == '1' &&
				mxUtils.getValue(state.style, 'childLayout', null) == null;
		};
	
		/**
		 * Updates the hint for the current operation.
		 */
		mxVertexHandler.prototype.updateHint = function(me)
		{
			if (this.index != mxEvent.LABEL_HANDLE)
			{
				if (this.hint == null)
				{
					this.hint = createHint();
					this.state.view.graph.container.appendChild(this.hint);
				}
	
				if (this.index == mxEvent.ROTATION_HANDLE)
				{
					this.hint.innerHTML = this.currentAlpha + '&deg;';
				}
				else
				{
					var s = this.state.view.scale;
					this.hint.innerHTML = this.roundLength(this.bounds.width / s) + ' x ' + this.roundLength(this.bounds.height / s);
				}
				
				var rot = (this.currentAlpha != null) ? this.currentAlpha : this.state.style[mxConstants.STYLE_ROTATION] || '0';
				var bb = mxUtils.getBoundingBox(this.bounds, rot);
				
				if (bb == null)
				{
					bb = this.bounds;
				}
				
				this.hint.style.left = bb.x + Math.round((bb.width - this.hint.clientWidth) / 2) + 'px';
				this.hint.style.top = (bb.y + bb.height + 12) + 'px';
			}
		};
	
		/**
		 * Updates the hint for the current operation.
		 */
		mxVertexHandler.prototype.removeHint = mxGraphHandler.prototype.removeHint;
	
		/**
		 * Updates the hint for the current operation.
		 */
		mxEdgeHandler.prototype.updateHint = function(me, point)
		{
			if (this.hint == null)
			{
				this.hint = createHint();
				this.state.view.graph.container.appendChild(this.hint);
			}
	
			var t = this.graph.view.translate;
			var s = this.graph.view.scale;
			var x = this.roundLength(point.x / s - t.x);
			var y = this.roundLength(point.y / s - t.y);
			
			this.hint.innerHTML = x + ', ' + y;
			this.hint.style.visibility = 'visible';
			
			if (this.isSource || this.isTarget)
			{
				if (this.constraintHandler.currentConstraint != null &&
					this.constraintHandler.currentFocus != null)
				{
					var pt = this.constraintHandler.currentConstraint.point;
					this.hint.innerHTML = '[' + Math.round(pt.x * 100) + '%, '+ Math.round(pt.y * 100) + '%]';
				}
				else if (this.marker.hasValidState())
				{
					this.hint.style.visibility = 'hidden';
				}
			}
			
			this.hint.style.left = Math.round(me.getGraphX() - this.hint.clientWidth / 2) + 'px';
			this.hint.style.top = (me.getGraphY() + 12) + 'px';
			
			if (this.hideEdgeHintThread != null)
			{
				window.clearTimeout(this.hideEdgeHintThread);
			}
			
			this.hideEdgeHintThread = window.setTimeout(mxUtils.bind(this, function()
			{
				if (this.hint != null)
				{
					this.hint.style.visibility = 'hidden';
				}
			}), 500);
		};
	
		/**
		 * Updates the hint for the current operation.
		 */
		mxEdgeHandler.prototype.removeHint = mxGraphHandler.prototype.removeHint;
	
		/**
		 * Defines the handles for the UI. Uses data-URIs to speed-up loading time where supported.
		 */
		var connectHandle = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABLZJREFUeNqcVl1MHFUUPrPMsn8s7UItthFa/ImNRB7aIC0aWyQhpqZWTBMNkQc3PvjiQ4MR05honyQmpjE8mmw01EqMwQcIopYAdUNR0CYYsk37oMIGuru1rEt2Z3Zm7lzPnbl3dlgXqE5ysnfPved85++ecyW4v0/aaZPit6OwJO2oQOLkcf16XKBMuVlGFUG3AxK8Kk5eJLm/v39vNBo9UVtb20gIUTc2NpJDQ0MLsVhsE/d1JAOJcNoCyIAqgTCrq5GCSHVra2vvFQqFON3my+fzs8lk8jyejXAZr/CcYVWKqhskPDExcRyVXBcKVYPSpb8pnUqZNH7XpIkcpRopAaIx06Ojo0dRtobrcMDKk8w2ZCTf1NTUsc7Ozgl0ObCuAHyxSuD7eyYopmRLUFuyFiVO7/PAqw95oN6HMSMkPTs7e66rq+sGniiycDIj3DmSeD58k5OTrd3d3TO4Wf1j2oSLt3RQTVuz2yoMisPZI0tw8XEZjtV7GFhubGzsuZ6engRuaTxnVHJ5w2IbUhTlB7/ff3R6ncCFhMbNt21xwiAJ21gO7KWMzI+e8EJHgwwYxmuhUOgl3ClwMOouXW8qlXqbgfy5acIHSwUwNQOJcDKA6sSiEs+0/xcJaKoB7y+pkFFMCAaDz2KBRHkqqoQnjkdYul3sTyyhQL5ogIHKjSInzaafng9bZGg6JwOIbtM9RYfLN1VLYSQS6eFRsu6jAzQ8PNyE3jyVK5owvlqwFTDluuGsGYmPuHhu+ur3PCgGZV49PTAwEBHOOEAdHR0n2GIppYGKlglPSJEDqvZ/8elq6YybNhUDbv+lWWf6+vraBIYsXKupqTnEGGs5DRUTdrWtG81yfTPa+K9Lt/zaQWd9JLbqrhm4kzOgtcEH4XC4SVwhWRw2TdMyQ0YBDa21SouVlCTt2nE17qm4Yh6OilVKxBmZ71Es6xRj1PmlLSFim02Xbjnmrpx/zFo1XbpdKn1hFD+zL2BnJJvNJsUh4ZE5Pz8/19zcDK0HsV1h6HQmSLcfFHpRdzqEsIjh7ZE9cKQhYLFGRkYWRVcXxWD29vauoFcLdaEqONMYwEpDMCwCh4o2lYC28tmahfDlh4Pg90qAuuKDg4MbAsjxiMliE70WCATa3jq1H75ObGBvo+7hZrWc2gu/Wl5QUSxO05QgjK3ozZP7Rdi+46ODlrcg1nFDqqpO+3y+J6/E78Ab36zwyiv1OgolxaLfCXO+fOUwnG17gLWgeWxBLyArz2eV6XHlnKGry8vL7zJG7zMPwqdnG8FDsGtjGBVsNQWd/ZoWWWvkFzBkfkLg8rlDFghTuri4+A7v3kQUQ8UxgYVxsr29fYwxf/sjBx+PrcDniayrgG1RP3r7eute6H/xMDxyIGhxZ2ZmunDELHAgXYyJ8sFnjQo2+NCq0xjGhBhsa3dV+u1Cmn52dZVemU7SqzcyNJ0tOoMPk/9LPB4/xWS5ji2Dr9KUrRL5QqrPZDKfYMwXtxvlCPBzOp3+kJ3lMtWVRrm0y+tH5h3YOz4+/mhLS8txrMoDKKwh+Prc3Nx17GcrPOE6z4nJ3yb0/zy3PNxTaZfnFv0vz62dHo/l5+n9PCIZ0D8CDACEWhv+nM/wTwAAAABJRU5ErkJggg==' :
			IMAGE_PATH + '/handle-connect.png', 26, 26);
		var mainHandle = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAAAsTAAALEwEAmpwYAAABLUlEQVQ4y61US4rCQBBNeojiRrLSnbMOWWU3V1FPouARcgc9hyLOCSSbYZw5gRCIkM9KbevJaycS4zCOBY+iq6pf1y+xrNtiE6oEY/tVzMUXgSNoCJrUDu3qHpldutwSuIKOoEvt0m7I7DoCvNj2fb8XRdEojuN5lmVraJxhh59xFSLFF9phGL7lef6hRb63R73aHM8aAjv8JHJ47yqLlud5r0VRbHa51sPZQVuT/QU4ww4/4ljaJRubrC5SxouD6TWBQV/sEIkbs0eOIVGssSO1L5D6LQID+BHHZjdMSYpj7KZpun7/uk8CP5rNqTXLJP/OpNyTMWruP9CTP08nCILKdCp7gkCzJ8vPnz2BvW5PKhuLjJBykiQLaWIEjTP3o3Zjn/LtPO0rfvh/cgKu7z6wtPPltQAAAABJRU5ErkJggg==' :
			IMAGE_PATH + '/handle-main.png', 17, 17);
		var fixedHandle = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkE1NkU4Njk2QjI1MTFFNEFDMjFGQTcyODkzNTc3NkYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkE1NkU4NkE2QjI1MTFFNEFDMjFGQTcyODkzNTc3NkYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2QTU2RTg2NzZCMjUxMUU0QUMyMUZBNzI4OTM1Nzc2RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2QTU2RTg2ODZCMjUxMUU0QUMyMUZBNzI4OTM1Nzc2RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmuk6K8AAAGBSURBVHjarFRBSsNQEM3/atNs6qLowixcKELoqjuXoqfQeoF6BMEj9BCC1YIXcCGlV8hGLNZlBKWlCk1JSs13Xvw/nca6UDrwmMzMy8tk/iTCWmwi52Eq53+QeWwg2bXSSNi1WiRibgRWCTahwEQmhJgw1WJGML2BC6wQnEqlsuH7fr3f7zdHo9EdPGLkUdc8mX8TJNYIpUajsR+G4YMie3pNVKebpB6GPOrgab7kr5F24Hne9ng87r6HStUuP5V1Mc2AGHnUwWMdCck6sVut1onjOHtnt4nV7M0fAuI65VEnXk3PTFq5Eyi4rnvUe1PW9fO3QOdUzvkbyqNOvEM2dMEHK2zbLr98zJ5+cJWkAvDGUC8Wi2X28Gww6bnHcTzYWp+JGAHTCQz1KIoGfFckCyZBELR3N4V1vCOyTrhHHnXw9N5kQn8+nWq1Onc6C/cERLMn7cfZniD/257wbjDxEjqiDT0fDof3tLE+PGK9HyXNy7pYyrez9K/43/+TLwEGAMb7AY6w980DAAAAAElFTkSuQmCC' :
			IMAGE_PATH + '/handle-fixed.png', 17, 17);
		var secondaryHandle = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MEJBMUVERjNEMkZDMTFFM0I0Qzc5RkE1RTc2NjI0OUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MEJBMUVERjREMkZDMTFFM0I0Qzc5RkE1RTc2NjI0OUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowQkExRURGMUQyRkMxMUUzQjRDNzlGQTVFNzY2MjQ5QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowQkExRURGMkQyRkMxMUUzQjRDNzlGQTVFNzY2MjQ5QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvXDOj4AAAFqSURBVHjarFTNToNAEN5FLeiBmDRe7MGLF4IXbp71KapP4CPoO/QdvKiv4ME0PkAvJI2J0SueIHgAAk3b7XxkwSlgE38mmSwz8+3HsPMtUnSbbKww1VhbYB5XbrBnpX3JnlUXSbURvk1ukvcYyYy8IJ9rsoqw3MAJtsh3Xdc98H3/KgzDuyRJHrEiRh51jTOaX4LEDrk9Go1O0zR9UWTL9E0to+dyhSGPOnAab/DPKDtwHOcoy7LXz1SpxeRSzW9F7YiRRx041pGsSMC6Ty1f442LycUawRfRsOyIcDfA632ST6A3GAzOVfYu1PS+c+5q+iBQJ9wZO3TJD1aaptkX+YfYaFS3LKvPXl4fTDn3oigiYR1uJqF6nucR14rBglkQBGO5dyzkybBbxpRHHTitm5rox9PxPK81nZZOAKx1Eo5rnSD/nU54NzhxGx1hjHEcP5FifayItT5sjVvTyJ/vzr/f4l//T1YCDAC4VAdLL1OIRAAAAABJRU5ErkJggg==' :
			IMAGE_PATH + '/handle-secondary.png', 17, 17);
		var rotationHandle = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,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' :
			IMAGE_PATH + '/handle-rotate.png', 19, 21);
		var triangleUp = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDA3RjREMDM0NTVCMTFFNEIxOTZFRjE3NzRENjQ0RjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDA3RjREMDQ0NTVCMTFFNEIxOTZFRjE3NzRENjQ0RjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MDdGNEQwMTQ1NUIxMUU0QjE5NkVGMTc3NEQ2NDRGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0MDdGNEQwMjQ1NUIxMUU0QjE5NkVGMTc3NEQ2NDRGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpFdYkUAAAEsSURBVHjaYvz//z8DPQATA50AC+P6D6Tq0QViHiA+TpJFZDhuMhDzA7EhLYMuEIjtgdgAiJNJ0cjIsO49sWo5gfgqECtC+S+AWBWIv1DbR0VIloCABBA3UttHIENvQxMBMvgFxNpAfIdaPurFYgkIsAFxF7WCzgyIowgkEA9qWDSZSB8zU2JRMtRHhIAWEKeRmxh4oAlAgsh4fAdN7u9I9VEFCZaAgBAQt5DqIxVo5mQjseT4C8R6QHyNWB91kWEJAzRBTCA26JygSZZc4IpNPxMWF01moBxghAi6RWnQpEopAMVxPq7EIARNzkJUqlS/QJP7C3QftVDRElg+bEH3ESi4LhEqRsgEoJr4AhNSeUYLS0BgJqzNACrLRIH4Mo0sAtXM9ozDrl0HEGAAOt00sQRg5yAAAAAASUVORK5CYII=' :
			IMAGE_PATH + '/triangle-up.png', 26, 26);
		var triangleRight = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkQ3OEM2Nzg0NTVBMTFFNEIxOTZFRjE3NzRENjQ0RjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkQ3OEM2Nzk0NTVBMTFFNEIxOTZFRjE3NzRENjQ0RjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGRDc4QzY3NjQ1NUExMUU0QjE5NkVGMTc3NEQ2NDRGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGRDc4QzY3NzQ1NUExMUU0QjE5NkVGMTc3NEQ2NDRGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmADGesAAAE2SURBVHjatJaxSgNBFEU3iQhCQEllK1hFItjsB1jYr6WtgigIAcFGwSafIBaipa1pBRG0Eq0koI1+QCqxSCXIekbug2UhGJN5Fw7Dzi4c5s283a3keZ6EVLqfKcNTEjl5Nvc7Vgtz53ALzcQh1dL1KvTgFBqeopAa7MCbxpqXyNLQynpaqZvI0tTeXcGip8iSwQt0oO4pCpmGQ+3fpqfIMq92eITUU2RJJbuU3E1k2VA5Q1lnPEWJDkhHBybzFFkW1Ap30PIUWWaLbeAh6sMWrMCDTU5FFHzBCRzDoHwzlqgLB/A+7IFJRa+wD9deDfsBu7A8imScFX3DGRxJNnL+I7qBtsrl8pkIG7wOa+NK/hINdJKWdKomyrDSXWgf+rGarCwK/3Xb8Bz7dVEU7cG914vvR4ABAGCSNhcpqHjLAAAAAElFTkSuQmCC':
			IMAGE_PATH + '/triangle-right.png', 26, 26);
		var triangleDown = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkQ3OEM2N0M0NTVBMTFFNEIxOTZFRjE3NzRENjQ0RjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkQ3OEM2N0Q0NTVBMTFFNEIxOTZFRjE3NzRENjQ0RjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGRDc4QzY3QTQ1NUExMUU0QjE5NkVGMTc3NEQ2NDRGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGRDc4QzY3QjQ1NUExMUU0QjE5NkVGMTc3NEQ2NDRGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuktDIwAAAE0SURBVHjaYvz//z8DPQATA50AC+P6D/ZAejKN7UlhARIHgfg7EJvRyJJ9QHwKFnTpNLLkLxDnIsfRBSCeSwOLZgHxNRCDkWHde5igBBDfBmIeKlnyDohVoTRKqnsBxE1U9E0NzBJ0H4EAGxBfBWIVCi0BBZceNI6w5qNfQFxGBd/kIluCK8OuB+LdFFiyHpqkiSoZCtBdRCTAGSJMeMJ4FhkWdQPxHWwS6IkBGQhBk7sQkZa8gCbnL6QWqu+gSZSU5PyF3NIbnrMJgFOEShYmIsqqYiKTM8X10Q5oksUFlkF9RJWKrwyadNHBFyJ9TLRFoCQ7BYt4BzS1EQT4kjc64IEmdwko/z4Qa0MrTaq2Gb6gJfdiYi0h1UcwcB6IPwKxA0mNEzKKmSx8GROnj4Zduw4gwAC3tEnG5i1iXgAAAABJRU5ErkJggg==' :
			IMAGE_PATH + '/triangle-down.png', 26, 26);
		var triangleLeft = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDA3RjRDRkY0NTVCMTFFNEIxOTZFRjE3NzRENjQ0RjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDA3RjREMDA0NTVCMTFFNEIxOTZFRjE3NzRENjQ0RjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGRDc4QzY3RTQ1NUExMUU0QjE5NkVGMTc3NEQ2NDRGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0MDdGNENGRTQ1NUIxMUU0QjE5NkVGMTc3NEQ2NDRGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PquyPQ0AAAE+SURBVHjatJaxSgNBFEU3KoKQQqzyAdoohFSKlQERbGNrqVik8QeCVdIIgpVBMK2lW9oF0qYRFFMJtlZBQRAEWc/AHVklxE123oUDm+zA4b03s0whSZLIpRC/RgbZSmqLPfcwF9mkApewAGX3x0xgQQmu4A7W0y9CVTQPx3ACxVELQohqcArL4xblEa3COexkWTzNjJbgAu6zSiataBaOoCnZRMkq2oUztWuq/Nc6N+AbuM0jGScqqoJH7arcGdW6A82hFPIkp0Wb2k0Vi29SunXv8Gb07fsleoAq7MGzpcgnhjVoqEozkcsHtGAFri1FPi+wDxvQtxT59CU7lNxM5NNRO11bPy1F/hg0tGFiS5HPk47CNgwsRT5dXUDqMLQUuXxBW/Nr67eJyGeoysqqNPgt6G8Gmt3PletbgAEAmkYzZ9MOuCsAAAAASUVORK5CYII=' :
			IMAGE_PATH + '/triangle-left.png', 26, 26);
		var refreshTarget = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDQxNERDRTU1QjY1MTFFNDkzNTRFQTVEMTdGMTdBQjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDQxNERDRTY1QjY1MTFFNDkzNTRFQTVEMTdGMTdBQjciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0NDE0RENFMzVCNjUxMUU0OTM1NEVBNUQxN0YxN0FCNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0NDE0RENFNDVCNjUxMUU0OTM1NEVBNUQxN0YxN0FCNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsvuX50AAANaSURBVHja7FjRZ1tRGD9ZJ1NCyIQSwrivI4Q8hCpjlFDyFEoYfSp9Ko1QWnmo0If+BSXkIfo0QirTMUpeGo2EPfWllFYjZMLKLDJn53d3biU337m5J223bPbxk5t7v+/c3/2+73znO8fDOWezKM/YjMpz68Lj8ejY+QTeCCwLxOS9qPxtyN+6wAeBTwJ31CCO0cJDjXBGBN4LfIepSwykTUT1bgpuib0SONIgo8KRHOtRiCFcvUcgZeGrHPNBxLIyFPyRgTGz0xLbegJCdmzpElue5KlAIMDX19d5uVzm5+fnfDAYmMA17uEZdOx2Yvb/sHlu2S0xwymn5ufneTab5b1ej08S6EAXNrDd2dnhiUTim21MvMtwQ6yiIrWwsMDPzs64rsBmf3/fvM7n89TYlUnEllSkQqEQv7q64g+Vk5MTVXosORErU0Zer5f0FEIlw2N6MxwO82QyaXql2+2SxDqdjopYWUUsqEp45IldqtWq6UWVh/1+P7+8vCTJ4QMUJSRIEXuneoH96w8PDyeWAnhSJfCqwm6NIlaklFdXV0cGhRcQ2mlJQXK5nMq2YPEZbnteU1U2lUqN/D84OGD9fl+5fgnSrFarsUwmw0qlEru4uBjTicViTk3Cr27HSnxR+Doyz0ZE1CAWiUTusbu7y9rttlZv5fP5WDQavYfIMba4uEipfhF8XtqJoZXx/uH+sC/4vPg7OljZZQbsCmLtYzc3N6zRaJhotVrmfx0xDINtbm6athYUeXpHdbBNaqZUKpWxWXV7e2vex+xaWVnhc3NzjrPUXgexyCt0m67LBV7uJMITjqRE4o8tZeg8FPpFitgapYxiOC0poFgsji1jKNo6BZZckrAGUtJsNk1vqAihCBcKhTE7hNWhqw2qFnGy5UFOUYJVIJ1OjzSE+BCEilon0URavRmBqnbbQ00AXbm+vnZc9O1tj72OnQoc2+cwygRkb2+P1et17ZoEm3g87lRmjgWZ00kbXkNuse6/Bu2wlegIxfb2tuvWGroO4bO2c4bbzUh60mxDXm1sbJhhxkQYnhS4h2fUZoRAWnf7lv8N27f8P7Xhnekjgpk+VKGOoQbsiY+hhhtF3YO7twIJ+ULvUGv+GQ2fQEvWxI/THNx5/p/BaspPAQYAqStgiSQwCDoAAAAASUVORK5CYII=' :
			IMAGE_PATH + '/refresh.png', 38, 38);
		var roundDrop = new mxImage((mxClient.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTgxRjYzRTU1MDRFMTFFNEExQ0VFNDQwNDhGNzg2RDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTgxRjYzRTY1MDRFMTFFNEExQ0VFNDQwNDhGNzg2RDkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFODFGNjNFMzUwNEUxMUU0QTFDRUU0NDA0OEY3ODZEOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFODFGNjNFNDUwNEUxMUU0QTFDRUU0NDA0OEY3ODZEOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuJ657wAAAE0SURBVHjaYvz//z8DPQATA50AC4zBuP4DLjXaQOwMxJZArAfE8lDxh0B8CYiPA/FeIL6KTfP/QAFUi7AABSBOAOJoIFbBIq8FxRFAfAeIlwLxAiB+gNdHaMABiIuB2IfIkAE5pB6IjYG4F4gPEBNHIEtaSLAEGfhA9ToQskgB6hNrCuLdGmqGAj6LEsj0CTafJeCySBsa8dQC0VAzMSxyxpG6yAUqUDMxLLKkQT61xGaRHg0s0sNmkTwNLJKne1mHbNFDGpj/EJtFl2hg0SVsFh2ngUXHsVm0F1oKUwvcgZqJYdFVaFFPLbAUuY5CT3Wg+mQLFSzZAjULZ6H6AFqfHKXAkqNQMx4Qqo9AlVYNmT7bAtV7gNga9gDURWfxVOXoEY+3KmeENbdo3ThhHHbtOoAAAwDmEETshQ0fBAAAAABJRU5ErkJggg==' :
			IMAGE_PATH + '/round-drop.png', 26, 26);
		
		// Pre-fetches images (only needed for non data-uris)
		if (!mxClient.IS_SVG)
		{
			new Image().src = connectHandle.src;
			new Image().src = mainHandle.src;
			new Image().src = fixedHandle.src;
			new Image().src = secondaryHandle.src;
			new Image().src = rotationHandle.src;
			new Image().src = triangleUp.src;
			new Image().src = triangleRight.src;
			new Image().src = triangleDown.src;
			new Image().src = triangleLeft.src;
			new Image().src = roundDrop.src;
		}
		
		mxConnectionHandler.prototype.connectImage = connectHandle;
		mxVertexHandler.prototype.handleImage = mainHandle;
		mxVertexHandler.prototype.secondaryHandleImage = secondaryHandle;
		mxEdgeHandler.prototype.handleImage = mainHandle;
		mxEdgeHandler.prototype.fixedHandleImage = fixedHandle;
		mxEdgeHandler.prototype.labelHandleImage = secondaryHandle;
		mxOutline.prototype.sizerImage = mainHandle;
		Sidebar.prototype.triangleUp = triangleUp;
		Sidebar.prototype.triangleRight = triangleRight;
		Sidebar.prototype.triangleDown = triangleDown;
		Sidebar.prototype.triangleLeft = triangleLeft;
		Sidebar.prototype.refreshTarget = refreshTarget;
		Sidebar.prototype.roundDrop = roundDrop;

		// Adds rotation handle and live preview
		mxVertexHandler.prototype.rotationEnabled = true;
		mxVertexHandler.prototype.manageSizers = true;
		mxVertexHandler.prototype.livePreview = true;

		// Increases default rubberband opacity (default is 20)
		mxRubberband.prototype.defaultOpacity = 30;
		
		// Enables connections along the outline, virtual waypoints, parent highlight etc
		mxConnectionHandler.prototype.outlineConnect = true;
		mxCellHighlight.prototype.keepOnTop = true;
		mxVertexHandler.prototype.parentHighlightEnabled = true;
		mxVertexHandler.prototype.rotationHandleVSpacing = -20;
		
		mxEdgeHandler.prototype.parentHighlightEnabled = true;
		mxEdgeHandler.prototype.dblClickRemoveEnabled = true;
		mxEdgeHandler.prototype.straightRemoveEnabled = true;
		mxEdgeHandler.prototype.virtualBendsEnabled = true;
		mxEdgeHandler.prototype.mergeRemoveEnabled = true;
		mxEdgeHandler.prototype.manageLabelHandle = true;
		mxEdgeHandler.prototype.outlineConnect = true;
		
		// Disables adding waypoints if shift is pressed
		mxEdgeHandler.prototype.isAddVirtualBendEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};
	
		// Disables custom handles if shift is pressed
		mxEdgeHandler.prototype.isCustomHandleEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};

	    // Timer-based activation of outline connect in connection handler
	    var startTime = new Date().getTime();
	    var timeOnTarget = 0;
	    
		var mxEdgeHandlerUpdatePreviewState = mxEdgeHandler.prototype.updatePreviewState;
		
		mxEdgeHandler.prototype.updatePreviewState = function(edge, point, terminalState, me)
		{
			mxEdgeHandlerUpdatePreviewState.apply(this, arguments);
			
	    	if (terminalState != this.currentTerminalState)
	    	{
	    		startTime = new Date().getTime();
	    		timeOnTarget = 0;
	    	}
	    	else
	    	{
		    	timeOnTarget = new Date().getTime() - startTime;
	    	}
			
			this.currentTerminalState = terminalState;
		};

		// Timer-based outline connect
		var mxEdgeHandlerIsOutlineConnectEvent = mxEdgeHandler.prototype.isOutlineConnectEvent;
		
		mxEdgeHandler.prototype.isOutlineConnectEvent = function(me)
		{
			return timeOnTarget > 1500 || ((mxEvent.isAltDown(me.getEvent()) || timeOnTarget > 500) &&
    			mxEdgeHandlerIsOutlineConnectEvent.apply(this, arguments));
		};
		
		// Disables custom handles if shift is pressed
		mxVertexHandler.prototype.isCustomHandleEvent = function(me)
		{
			return !mxEvent.isShiftDown(me.getEvent());
		};
	
		// Shows secondary handle for fixed connection points
		mxEdgeHandler.prototype.createHandleShape = function(index)
		{
			var source = index == 0;
			var c = (index == 0 || index >= this.state.absolutePoints.length - 1) ?
				this.graph.getConnectionConstraint(this.state, this.state.getVisibleTerminalState(source), source) : null;
			var pt = (c != null) ? this.graph.getConnectionPoint(this.state.getVisibleTerminalState(source), c) : null;
			var img = (pt != null) ? this.fixedHandleImage : this.handleImage;
	
			if (img != null)
			{
				var shape = new mxImageShape(new mxRectangle(0, 0, img.width, img.height), img.src);
				
				// Allows HTML rendering of the images
				shape.preserveImageAspect = false;
	
				return shape;
			}
			else
			{
				var s = mxConstants.HANDLE_SIZE;
				
				if (this.preferHtml)
				{
					s -= 1;
				}
				
				return new mxRectangleShape(new mxRectangle(0, 0, s, s), mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
			}
		};
	
		var vertexHandlerCreateSizerShape = mxVertexHandler.prototype.createSizerShape;
		mxVertexHandler.prototype.createSizerShape = function(bounds, index, fillColor)
		{
			this.handleImage = (index == mxEvent.ROTATION_HANDLE) ? rotationHandle : (index == mxEvent.LABEL_HANDLE) ? this.secondaryHandleImage : this.handleImage;
			return vertexHandlerCreateSizerShape.apply(this, arguments);
		};
		
		// Special case for single edge label handle moving in which case the text bounding box is used
		var mxGraphHandlerGetBoundingBox = mxGraphHandler.prototype.getBoundingBox;
		mxGraphHandler.prototype.getBoundingBox = function(cells)
		{
			if (cells != null && cells.length == 1)
			{
				var model = this.graph.getModel();
				var parent = model.getParent(cells[0]);
				var geo = this.graph.getCellGeometry(cells[0]);
				
				if (model.isEdge(parent) && geo != null && geo.relative)
				{
					var state = this.graph.view.getState(cells[0]);
					
					if (state != null && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
					{
						return mxRectangle.fromRectangle(state.text.boundingBox);
					}
				}
			}
			
			return mxGraphHandlerGetBoundingBox.apply(this, arguments);
		};
		
		// Uses text bounding box for edge labels
		var mxVertexHandlerGetSelectionBounds = mxVertexHandler.prototype.getSelectionBounds;
		mxVertexHandler.prototype.getSelectionBounds = function(state)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(state.cell);
			var geo = this.graph.getCellGeometry(state.cell);
			
			if (model.isEdge(parent) && geo != null && geo.relative && state.width < 2 && state.height < 2 && state.text != null && state.text.boundingBox != null)
			{
				var bbox = state.text.unrotatedBoundingBox || state.text.boundingBox;
				
				return new mxRectangle(Math.round(bbox.x), Math.round(bbox.y), Math.round(bbox.width), Math.round(bbox.height));
			}
			else
			{
				return mxVertexHandlerGetSelectionBounds.apply(this, arguments);
			}
		};
	
		// Redirects moving of edge labels to mxGraphHandler by not starting here.
		// This will use the move preview of mxGraphHandler (see above).
		var mxVertexHandlerMouseDown = mxVertexHandler.prototype.mouseDown;
		mxVertexHandler.prototype.mouseDown = function(sender, me)
		{
			var model = this.graph.getModel();
			var parent = model.getParent(this.state.cell);
			var geo = this.graph.getCellGeometry(this.state.cell);
			
			// Lets rotation events through
			var handle = this.getHandleForEvent(me);
			
			if (handle == mxEvent.ROTATION_HANDLE || !model.isEdge(parent) || geo == null || !geo.relative ||
				this.state == null || this.state.width >= 2 || this.state.height >= 2)
			{
				mxVertexHandlerMouseDown.apply(this, arguments);
			}
		};
		
		// Shows rotation handle for edge labels.
		mxVertexHandler.prototype.isRotationHandleVisible = function()
		{
			return this.graph.isEnabled() && this.rotationEnabled && this.graph.isCellRotatable(this.state.cell) &&
				(mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells);
		};
	
		// Invokes turn on single click on rotation handle
		mxVertexHandler.prototype.rotateClick = function()
		{
			this.state.view.graph.turnShapes([this.state.cell]);
		};
	
		// Requires callback to editorUi in edit link so override editorUi.init
		var editorUiInit3 = EditorUi.prototype.init;
		EditorUi.prototype.init = function()
		{
			editorUiInit3.apply(this, arguments);
			
			// Required for calling edit link action below
			var ui = this;
		
			/**
			 * Implements touch style
			 */
			if (touchStyle)
			{
				// Larger tolerance for real touch devices
				if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
				{
					mxShape.prototype.svgStrokeTolerance = 18;
					mxVertexHandler.prototype.tolerance = 12;
					mxEdgeHandler.prototype.tolerance = 12;
					Graph.prototype.tolerance = 12;
					
					mxVertexHandler.prototype.rotationHandleVSpacing = -24;
					
					// Implements a smaller tolerance for mouse events and a larger tolerance for touch
					// events on touch devices. The default tolerance (4px) is used for mouse events.
					mxConstraintHandler.prototype.getTolerance = function(me)
					{
						return (mxEvent.isMouseEvent(me.getEvent())) ? 4 : this.graph.getTolerance();
					};
				}
					
				// One finger pans (no rubberband selection) must start regardless of mouse button
				mxPanningHandler.prototype.isPanningTrigger = function(me)
				{
					var evt = me.getEvent();
					
				 	return (me.getState() == null && !mxEvent.isMouseEvent(evt)) ||
				 		(mxEvent.isPopupTrigger(evt) && (me.getState() == null ||
				 		mxEvent.isControlDown(evt) || mxEvent.isShiftDown(evt)));
				};
				
				// Don't clear selection if multiple cells selected
				var graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;
				mxGraphHandler.prototype.mouseDown = function(sender, me)
				{
					graphHandlerMouseDown.apply(this, arguments);
		
					if (mxEvent.isTouchEvent(me.getEvent()) && this.graph.isCellSelected(me.getCell()) &&
						this.graph.getSelectionCount() > 1)
					{
						this.delayedSelection = false;
					}
				};
			}
			
			var vertexHandlerMouseMove = mxVertexHandler.prototype.mouseMove;
			mxVertexHandler.prototype.mouseMove = function()
			{
				vertexHandlerMouseMove.apply(this, arguments);
				
				if (this.graph.graphHandler.first != null)
				{
					if (this.linkHint != null)
					{
						this.linkHint.style.display = 'none';
					}
					
					if (this.connectorImg != null)
					{
						this.connectorImg.style.display = 'none';
					}
					
					if (this.rotationShape != null && this.rotationShape.node != null)
					{
						this.rotationShape.node.style.display = 'none';
					}
				}
			};
			
			var vertexHandlerMouseUp = mxVertexHandler.prototype.mouseUp;
			mxVertexHandler.prototype.mouseUp = function()
			{
				vertexHandlerMouseUp.apply(this, arguments);
				
				if (this.connectorImg != null)
				{
					this.connectorImg.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				if (this.linkHint != null)
				{
					this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
				
				// Shows rotation handle only if one vertex is selected
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
			};
			
			var vertexHandlerReset = mxVertexHandler.prototype.reset;
			mxVertexHandler.prototype.reset = function()
			{
				vertexHandlerReset.apply(this, arguments);
				
				// Shows rotation handle only if one vertex is selected
				if (this.rotationShape != null && this.rotationShape.node != null)
				{
					this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
				}
			};
			
			var vertexHandlerInit = mxVertexHandler.prototype.init;
			mxVertexHandler.prototype.init = function()
			{
				vertexHandlerInit.apply(this, arguments);
				var redraw = false;
				
				if (this.rotationShape != null)
				{
					this.rotationShape.node.setAttribute('title', mxResources.get('rotateTooltip'));
				}
				
				var update = mxUtils.bind(this, function()
				{
					if (this.connectorImg != null)
					{
						this.connectorImg.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
					}
					
					if (this.linkHint != null)
					{
						this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
					}
	
					// Shows rotation handle only if one vertex is selected
					if (this.rotationShape != null && this.rotationShape.node != null)
					{
						this.rotationShape.node.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
					}
					
					if (this.specialHandle != null)
					{
						this.specialHandle.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
					}
					
					this.redrawHandles();
				});
				
				this.selectionHandler = mxUtils.bind(this, function(sender, evt)
				{
					update();
				});
				
				this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
				
				this.changeHandler = mxUtils.bind(this, function(sender, evt)
				{
					this.updateLinkHint(this.graph.getLinkForCell(this.state.cell));
					update();
				});
				
				this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
	
				if (this.graph.isEnabled() && (touchStyle || urlParams['connect'] == null || urlParams['connect'] == '2'))
				{
					// Only show connector image on one cell and do not show on containers
					if (showConnectorImg && this.graph.isCellConnectable(this.state.cell))
					{
						// Workaround for event redirection via image tag in quirks and IE8
						if (mxClient.IS_IE && !mxClient.IS_SVG)
						{
							// Workaround for PNG images in IE6
							if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat')
							{
								this.connectorImg = document.createElement(mxClient.VML_PREFIX + ':image');
								this.connectorImg.setAttribute('src', connectHandle.src);
								this.connectorImg.style.borderStyle = 'none';
							}
							else
							{
								this.connectorImg = document.createElement('div');
								this.connectorImg.style.backgroundImage = 'url(' + connectHandle.src + ')';
								this.connectorImg.style.backgroundPosition = 'center';
								this.connectorImg.style.backgroundRepeat = 'no-repeat';
							}
							
							this.connectorImg.style.width = (connectHandle.width + 4) + 'px';
							this.connectorImg.style.height = (connectHandle.height + 4) + 'px';
							this.connectorImg.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
						}
						else
						{
							this.connectorImg = mxUtils.createImage(connectHandle.src);
							
							if (touchStyle)
							{
								this.connectorImg.style.width = '29px';
								this.connectorImg.style.height = '29px';
							}
							else
							{
								this.connectorImg.style.width = connectHandle.width + 'px';
								this.connectorImg.style.height = connectHandle.height + 'px';
							}
						}
						
						this.connectorImg.style.cursor = 'crosshair';
						this.connectorImg.style.position = 'absolute';
						this.connectorImg.setAttribute('title', mxResources.get('plusTooltip'));
						
						if (!(mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
						{
							mxEvent.redirectMouseEvents(this.connectorImg, this.graph, this.state);
						}
						
						var mousePoint = null;
						
						// Starts connecting on touch/mouse down
						mxEvent.addGestureListeners(this.connectorImg,
							mxUtils.bind(this, function(evt)
							{
								// FIXME: Use native event in isForceRubberband, isForcePanningEvent
								if (!mxEvent.isAltDown(evt) && !mxEvent.isPopupTrigger(evt))
								{
									this.graph.popupMenuHandler.hideMenu();
									this.graph.stopEditing(false);
									
									mousePoint = mxUtils.convertPoint(this.graph.container,
											mxEvent.getClientX(evt), mxEvent.getClientY(evt));
									this.graph.connectionHandler.start(this.state, mousePoint.x, mousePoint.y);
									this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
									this.graph.isMouseDown = true;
									
									mxEvent.consume(evt);
								}
							}),
							null,
							mxUtils.bind(this, function(evt)
							{
								if (mousePoint != null)
								{
									var pt = mxUtils.convertPoint(this.graph.container,
											mxEvent.getClientX(evt), mxEvent.getClientY(evt));
									var tol = this.graph.tolerance;
									
									if (Math.abs(pt.x - mousePoint.x) < tol && Math.abs(pt.y - mousePoint.y) < tol)
									{
										this.graph.model.beginUpdate();
										try
										{
											var dup = this.graph.duplicateCells([this.state.cell], false)[0];
											this.graph.setSelectionCell(dup);
											var layout = null;

											// Never connects children in stack layouts
											if (this.graph.layoutManager != null)
											{
												layout = this.graph.layoutManager.getLayout(this.graph.model.getParent(dup));
											}
											
											if (!mxEvent.isShiftDown(evt) && (layout == null || layout.constructor != mxStackLayout))
											{
												var geo = this.graph.getCellGeometry(dup);
												geo.x = this.state.cell.geometry.x + this.state.cell.geometry.width + 80;
												geo.y = this.state.cell.geometry.y;

												var edge = this.graph.insertEdge(null, null, '', this.state.cell, dup, ui.createCurrentEdgeStyle());
												this.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [edge]));
											}
										}
										finally
										{
											this.graph.model.endUpdate();
										}
										
										this.graph.isMouseDown = false;
										mxEvent.consume(evt);
									}
									
									mousePoint = null;
								}
							})
						);

						this.graph.container.appendChild(this.connectorImg);
						redraw = true;
					}
				}
				
				var link = this.graph.getLinkForCell(this.state.cell);
				this.updateLinkHint(link);
				
				if (link != null)
				{
					redraw = true;
				}
				
				if (redraw)
				{
					this.redrawHandles();
				}
			};
			
			mxVertexHandler.prototype.updateLinkHint = function(link)
			{
				if (link == null)
				{
					if (this.linkHint != null)
					{
						this.linkHint.parentNode.removeChild(this.linkHint);
						this.linkHint = null;
					}
				}
				else if (link != null)
				{
					if (this.linkHint == null)
					{
						this.linkHint = createHint();
						this.linkHint.style.padding = '4px 10px 6px 10px';
						this.linkHint.style.fontSize = '90%';
						this.linkHint.style.opacity = '1';
						this.linkHint.style.filter = '';
						this.updateLinkHint(link);
						
						this.graph.container.appendChild(this.linkHint);
					}
					
					var label = link;
					var max = 60;
					var head = 36;
					var tail = 20;
					
					if (label.length > max)
					{
						label = label.substring(0, head) + '...' + label.substring(label.length - tail);
					}
					
					var a = document.createElement('a');
					a.setAttribute('href', link);
					a.setAttribute('title', link);
					
					if (this.graph.linkTarget != null)
					{
						a.setAttribute('target', this.graph.linkTarget);
					}
					
					mxUtils.write(a, label);
					
					this.linkHint.innerHTML = '';
					this.linkHint.appendChild(a);
	
					if (this.graph.isEnabled())
					{
						var changeLink = document.createElement('img');
						changeLink.setAttribute('src', IMAGE_PATH + '/edit.gif');
						changeLink.setAttribute('title', mxResources.get('editLink'));
						changeLink.setAttribute('width', '11');
						changeLink.setAttribute('height', '11');
						changeLink.style.marginLeft = '10px';
						changeLink.style.marginBottom = '-1px';
						changeLink.style.cursor = 'pointer';
						this.linkHint.appendChild(changeLink);
						
						mxEvent.addListener(changeLink, 'click', mxUtils.bind(this, function(evt)
						{
							this.graph.setSelectionCell(this.state.cell);
							ui.actions.get('editLink').funct();
							mxEvent.consume(evt);
						}));
					}
				}
			};
			
			mxEdgeHandler.prototype.updateLinkHint = mxVertexHandler.prototype.updateLinkHint;
			
			var edgeHandlerInit = mxEdgeHandler.prototype.init;
			mxEdgeHandler.prototype.init = function()
			{
				edgeHandlerInit.apply(this, arguments);
				
				// Disables connection points
				this.constraintHandler.isEnabled = mxUtils.bind(this, function()
				{
					return this.state.view.graph.connectionHandler.isEnabled();
				});
				
				var update = mxUtils.bind(this, function()
				{
					if (this.linkHint != null)
					{
						this.linkHint.style.display = (this.graph.getSelectionCount() == 1) ? '' : 'none';
					}
					
					if (this.labelShape != null)
					{
						this.labelShape.node.style.display = (this.graph.isEnabled() && this.graph.getSelectionCount() < this.graph.graphHandler.maxCells) ? '' : 'none';
					}
				});
	
				this.selectionHandler = mxUtils.bind(this, function(sender, evt)
				{
					update();
				});
				
				this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.selectionHandler);
				
				this.changeHandler = mxUtils.bind(this, function(sender, evt)
				{
					this.updateLinkHint(this.graph.getLinkForCell(this.state.cell));
					update();
					this.redrawHandles();
				});
				
				this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
	
				var link = this.graph.getLinkForCell(this.state.cell);
										
				if (link != null)
				{
					this.updateLinkHint(link);
					this.redrawHandles();
				}
			};
		};
		
		// Disables connection points
		var connectionHandlerInit = mxConnectionHandler.prototype.init;
		
		mxConnectionHandler.prototype.init = function()
		{
			connectionHandlerInit.apply(this, arguments);
			
			this.constraintHandler.isEnabled = mxUtils.bind(this, function()
			{
				return this.graph.connectionHandler.isEnabled();
			});
		};
	
		var vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
		mxVertexHandler.prototype.redrawHandles = function()
		{
			vertexHandlerRedrawHandles.apply(this);
	
			if (this.state != null && this.connectorImg != null)
			{
				var pt = new mxPoint();
				var s = this.state;
				
				// Top right for single-sizer
				if (mxVertexHandler.prototype.singleSizer)
				{
					pt.x = s.x + s.width - this.connectorImg.offsetWidth / 2;
					pt.y = s.y - this.connectorImg.offsetHeight / 2;
				}
				else
				{
					var dx = (this.handleImage != null) ? this.handleImage.width : mxConstants.HANDLE_SIZE;
					pt.x = s.x + s.width + (dx + this.horizontalOffset + this.tolerance + this.connectorImg.offsetWidth) / 2;
					pt.y = s.y + s.height / 2;
				}
				
				var alpha = mxUtils.toRadians(mxUtils.getValue(s.style, mxConstants.STYLE_ROTATION, 0));
				
				if (alpha != 0)
				{
					var cos = Math.cos(alpha);
					var sin = Math.sin(alpha);
					
					var ct = new mxPoint(s.getCenterX(), s.getCenterY());
					pt = mxUtils.getRotatedPoint(pt, cos, sin, ct);
				}
				
				this.connectorImg.style.left = Math.round(pt.x - this.connectorImg.offsetWidth / 2) + 'px';
				this.connectorImg.style.top = Math.round(pt.y - this.connectorImg.offsetHeight / 2) + 'px';
			}
			
			if (this.state != null && this.linkHint != null)
			{
				var c = new mxPoint(this.state.getCenterX(), this.state.getCenterY());
				var tmp = new mxRectangle(this.state.x, this.state.y - 22, this.state.width + 24, this.state.height + 22);
				var bb = mxUtils.getBoundingBox(tmp, this.state.style[mxConstants.STYLE_ROTATION] || '0', c);
				var rs = (bb != null) ? mxUtils.getBoundingBox(this.state, this.state.style[mxConstants.STYLE_ROTATION] || '0') : this.state;
				
				if (bb == null)
				{
					bb = this.state;
				}
				
				this.linkHint.style.left = Math.round(rs.x + (rs.width - this.linkHint.clientWidth) / 2) + 'px';
				this.linkHint.style.top = Math.round(bb.y + bb.height + this.verticalOffset / 2 +
						6 + this.state.view.graph.tolerance) + 'px';
			}
		};
		
		var vertexHandlerSetHandlesVisible = mxVertexHandler.prototype.setHandlesVisible;
		mxVertexHandler.prototype.setHandlesVisible = function(visible)
		{
			vertexHandlerSetHandlesVisible.apply(this, arguments);
			
			if (this.connectorImg != null)
			{
				this.connectorImg.style.visibility = (visible) ? '' : 'hidden';
			}
			
			if (this.linkHint != null)
			{
				this.linkHint.style.visibility = (visible) ? '' : 'hidden';
			}
		};
		
		var vertexHandlerReset = mxVertexHandler.prototype.reset;
		mxVertexHandler.prototype.reset = function()
		{
			vertexHandlerReset.apply(this, arguments);
			
			if (this.connectorImg != null)
			{
				this.connectorImg.style.visibility = '';
			}
			
			if (this.linkHint != null)
			{
				this.linkHint.style.visibility = '';
			}
		};
		
		var vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
		mxVertexHandler.prototype.destroy = function(sender, me)
		{
			vertexHandlerDestroy.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.parentNode.removeChild(this.linkHint);
				this.linkHint = null;
			}
	
			if (this.connectorImg != null)
			{
				this.connectorImg.parentNode.removeChild(this.connectorImg);
				this.connectorImg = null;
			}
			
			if (this.selectionHandler != null)
			{
				this.graph.getSelectionModel().removeListener(this.selectionHandler);
				this.selectionHandler = null;
			}
			
			if  (this.changeHandler != null)
			{
				this.graph.getModel().removeListener(this.changeHandler);
				this.changeHandler = null;
			}
		};
		
		var edgeHandlerRedrawHandles = mxEdgeHandler.prototype.redrawHandles;
		mxEdgeHandler.prototype.redrawHandles = function()
		{
			// Workaround for special case where handler
			// is reset before this which leads to a NPE
			if (this.marker != null)
			{
				edgeHandlerRedrawHandles.apply(this);
		
				if (this.state != null && this.linkHint != null)
				{
					var b = this.state;
					
					if (this.state.text != null && this.state.text.bounds != null)
					{
						b = new mxRectangle(b.x, b.y, b.width, b.height);
						b.add(this.state.text.bounds);
					}
					
					this.linkHint.style.left = Math.round(b.x + (b.width - this.linkHint.clientWidth) / 2) + 'px';
					this.linkHint.style.top = Math.round(b.y + b.height + 6 + this.state.view.graph.tolerance) + 'px';
				}
			}
		};
	
		var edgeHandlerReset = 	mxEdgeHandler.prototype.reset;
		mxEdgeHandler.prototype.reset = function()
		{
			edgeHandlerReset.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.style.visibility = '';
			}
		};
		
		var edgeHandlerDestroy = 	mxEdgeHandler.prototype.destroy;
		mxEdgeHandler.prototype.destroy = function(sender, me)
		{
			edgeHandlerDestroy.apply(this, arguments);
			
			if (this.linkHint != null)
			{
				this.linkHint.parentNode.removeChild(this.linkHint);
				this.linkHint = null;
			}
	
			if (this.selectionHandler != null)
			{
				this.graph.getSelectionModel().removeListener(this.selectionHandler);
				this.selectionHandler = null;
			}
	
			if  (this.changeHandler != null)
			{
				this.graph.getModel().removeListener(this.changeHandler);
				this.changeHandler = null;
			}
		};
	})();
}
