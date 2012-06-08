/**
 * $Id: mxCellRenderer.js,v 1.184 2012-05-23 11:18:13 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxCellRenderer
 * 
 * Renders cells into a document object model. The <defaultShapes> is a global
 * map of shapename, constructor pairs that is used in all instances. You can
 * get a list of all available shape names using the following code.
 * 
 * In general the cell renderer is in charge of creating, redrawing and
 * destroying the shape and label associated with a cell state, as well as
 * some other graphical objects, namely controls and overlays. The shape
 * hieararchy in the display (ie. the hierarchy in which the DOM nodes
 * appear in the document) does not reflect the cell hierarchy. The shapes
 * are a (flat) sequence of shapes and labels inside the draw pane of the
 * graph view, with some exceptions, namely the HTML labels being placed
 * directly inside the graph container for certain browsers.
 * 
 * (code)
 * mxLog.show();
 * for (var i in mxCellRenderer.prototype.defaultShapes)
 * {
 *   mxLog.debug(i);
 * }
 * (end)
 *
 * Constructor: mxCellRenderer
 * 
 * Constructs a new cell renderer with the following built-in shapes:
 * arrow, rectangle, ellipse, rhombus, image, line, label, cylinder,
 * swimlane, connector, actor and cloud.
 */
function mxCellRenderer()
{
	this.shapes = mxUtils.clone(this.defaultShapes);
};

/**
 * Variable: shapes
 * 
 * Array that maps from shape names to shape constructors. All entries
 * in <defaultShapes> are added to this array.
 */
mxCellRenderer.prototype.shapes = null;

/**
 * Variable: defaultEdgeShape
 * 
 * Defines the default shape for edges. Default is <mxConnector>.
 */
mxCellRenderer.prototype.defaultEdgeShape = mxConnector;

/**
 * Variable: defaultVertexShape
 * 
 * Defines the default shape for vertices. Default is <mxRectangleShape>.
 */
mxCellRenderer.prototype.defaultVertexShape = mxRectangleShape;

/**
 * Variable: defaultShapes
 * 
 * Static array that contains the globally registered shapes which are
 * known to all instances of this class. For adding instance-specific
 * shapes you should use <registerShape> on the instance. For adding
 * a shape to this array you can use the following code:
 * 
 * (code)
 * mxCellRenderer.prototype.defaultShapes['myshape'] = myShape;
 * (end)
 * 
 * Where 'myshape' is the key under which the shape is to be registered
 * and myShape is the name of the constructor function.
 */
mxCellRenderer.prototype.defaultShapes = new Object();

// Adds default shapes into the default shapes array
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ARROW] = mxArrow;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_RECTANGLE] = mxRectangleShape;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ELLIPSE] = mxEllipse;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_DOUBLE_ELLIPSE] = mxDoubleEllipse;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_RHOMBUS] = mxRhombus;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_IMAGE] = mxImageShape;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_LINE] = mxLine;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_LABEL] = mxLabel;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CYLINDER] = mxCylinder;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_SWIMLANE] = mxSwimlane;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CONNECTOR] = mxConnector;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ACTOR] = mxActor;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CLOUD] = mxCloud;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_TRIANGLE] = mxTriangle;
mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_HEXAGON] = mxHexagon;

/**
 * Function: registerShape
 * 
 * Registers the given constructor under the specified key in this instance
 * of the renderer.
 * 
 * Example:
 * 
 * (code)
 * this.registerShape(mxConstants.SHAPE_RECTANGLE, mxRectangleShape);
 * (end)
 * 
 * Parameters:
 * 
 * key - String representing the shape name.
 * shape - Constructor of the <mxShape> subclass.
 */
mxCellRenderer.prototype.registerShape = function(key, shape)
{
	this.shapes[key] = shape;	
};

/**
 * Function: initialize
 * 
 * Initializes the display for the given cell state. This is required once
 * after the cell state has been created. This is invoked in
 * mxGraphView.createState.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the display should be initialized.
 * rendering - Optional boolean that specifies if the cell should actually
 * be initialized for any given DOM node. If this is false then init
 * will not be called on the shape.
 */
mxCellRenderer.prototype.initialize = function(state, rendering)
{
	var model = state.view.graph.getModel();
	
	if (state.view.graph.container != null && state.shape == null &&
		state.cell != state.view.currentRoot &&
		(model.isVertex(state.cell) || model.isEdge(state.cell)))
	{
		this.createShape(state);
		
		if (state.shape != null && (rendering == null || rendering))
		{
			this.initializeShape(state);

			// Maintains the model order in the DOM
			if (state.view.graph.ordered || model.isEdge(state.cell))
			{
				//state.orderChanged = true;
				state.invalidOrder = true;
			}
			else if (state.view.graph.keepEdgesInForeground && this.firstEdge != null)
			{
				if (this.firstEdge.parentNode == state.shape.node.parentNode)
				{
					this.insertState(state, this.firstEdge);
				}
				else
				{
					this.firstEdge = null;
				}
			}
			
			state.shape.scale = state.view.scale;
			
			this.createCellOverlays(state);
			this.installListeners(state);
		}
	}
};

/**
 * Function: initializeShape
 * 
 * Initializes the shape in the given state by calling its init method with
 * the correct container.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shape should be initialized.
 */
mxCellRenderer.prototype.initializeShape = function(state)
{
	state.shape.init(state.view.getDrawPane());
};

/**
 * Returns the previous state that has a shape inside the given parent.
 */
mxCellRenderer.prototype.getPreviousStateInContainer = function(state, container)
{
	var result = null;
	var graph = state.view.graph;
	var model = graph.getModel();
	var child = state.cell;
	var p = model.getParent(child);
	
	while (p != null && result == null)
	{
		result = this.findPreviousStateInContainer(graph, p, child, container);
		child = p;
		p = model.getParent(child);
	}
	
	return result;
};

/**
 * Returns the previous state that has a shape inside the given parent.
 */
mxCellRenderer.prototype.findPreviousStateInContainer = function(graph, cell, stop, container)
{
	// Recurse first
	var result = null;
	var model = graph.getModel();
	
	if (stop != null)
	{
		var start = cell.getIndex(stop);
		
		for (var i = start - 1; i >= 0 && result == null; i--)
		{
			result = this.findPreviousStateInContainer(graph, model.getChildAt(cell, i), null, container);
		}
	}
	else
	{
		var childCount = model.getChildCount(cell);

		for (var i = childCount - 1; i >= 0 && result == null; i--)
		{
			result = this.findPreviousStateInContainer(graph, model.getChildAt(cell, i), null, container);
		}
	}
	
	if (result == null)
	{
		result = graph.view.getState(cell);

		if (result != null && (result.shape == null || result.shape.node == null ||
			result.shape.node.parentNode != container))
		{
			result = null;
		}
	}
	
	return result;
};

/**
 * Function: order
 * 
 * Orders the DOM node of the shape for the given state according to the
 * position of the corresponding cell in the graph model.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose shape's DOM node should be ordered.
 */
mxCellRenderer.prototype.order = function(state)
{
	var container = state.shape.node.parentNode;
	var previous = this.getPreviousStateInContainer(state, container);
	var nextNode = container.firstChild;
	
	if (previous != null)
	{
		nextNode = previous.shape.node;
		
		if (previous.text != null && previous.text.node != null &&
			previous.text.node.parentNode == container)
		{
			nextNode = previous.text.node;
		}
		
		nextNode = nextNode.nextSibling;
	}
	
	this.insertState(state, nextNode);
};

/**
 * Function: orderEdge
 * 
 * Orders the DOM node of the shape for the given edge's state according to
 * the <mxGraph.keepEdgesInBackground> and <mxGraph.keepEdgesInBackground>
 * rules. 
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose shape's DOM node should be ordered.
 */
mxCellRenderer.prototype.orderEdge = function(state)
{
	var view = state.view;
	var model = view.graph.getModel();
	
	// Moves edges to the foreground/background
	if (view.graph.keepEdgesInForeground)
	{
		if (this.firstEdge == null || this.firstEdge.parentNode == null ||
		  	this.firstEdge.parentNode != state.shape.node.parentNode)
		{
			this.firstEdge = state.shape.node;
		}
	}
	else if (view.graph.keepEdgesInBackground)
	{
		var node = state.shape.node;
		var parent = node.parentNode;
		
		// Keeps the DOM node in front of its parent
		var pcell = model.getParent(state.cell);
		var pstate = view.getState(pcell);

		if (pstate != null && pstate.shape != null && pstate.shape.node != null)
		{
			var child = pstate.shape.node.nextSibling;
			
			if (child != null && child != node)
			{
				this.insertState(state, child);
			}
		}
		else
		{
			var child = parent.firstChild;
			
			if (child != null && child != node)
			{
				this.insertState(state, child);
			}
		}
	}
};

/**
 * Function: insertState
 * 
 * Inserts the given state before the given node into its parent.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shape should be created.
 */
mxCellRenderer.prototype.insertState = function(state, nextNode)
{
	state.shape.node.parentNode.insertBefore(state.shape.node, nextNode);
	
	if (state.text != null && state.text.node != null &&
		state.text.node.parentNode == state.shape.node.parentNode)
	{
		state.shape.node.parentNode.insertBefore(state.text.node, state.shape.node.nextSibling);
	}
};

/**
 * Function: createShape
 * 
 * Creates the shape for the given cell state. The shape is configured
 * using <configureShape>.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shape should be created.
 */
mxCellRenderer.prototype.createShape = function(state)
{
	if (state.style != null)
	{
		// Checks if there is a stencil for the name and creates
		// a shape instance for the stencil if one exists
		var key = state.style[mxConstants.STYLE_SHAPE];
		var stencil = mxStencilRegistry.getStencil(key);
		
		if (stencil != null)
		{
			state.shape = new mxStencilShape(stencil);
		}
		else
		{
			var ctor = this.getShapeConstructor(state);
			state.shape = new ctor();
		}

		// Sets the initial bounds and points (will be updated in redraw)
		state.shape.points = state.absolutePoints;
		state.shape.bounds = new mxRectangle(
			state.x, state.y, state.width, state.height);
		state.shape.dialect = state.view.graph.dialect;

		this.configureShape(state);
	}
};

/**
 * Function: getShapeConstructor
 * 
 * Returns the constructor to be used for creating the shape.
 */
mxCellRenderer.prototype.getShapeConstructor = function(state)
{
	var key = state.style[mxConstants.STYLE_SHAPE];
	var ctor = (key != null) ? this.shapes[key] : null;
	
	if (ctor == null)
	{
		ctor = (state.view.graph.getModel().isEdge(state.cell)) ?
			this.defaultEdgeShape : this.defaultVertexShape;
	}
	
	return ctor;
};

/**
 * Function: configureShape
 * 
 * Configures the shape for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shape should be configured.
 */
mxCellRenderer.prototype.configureShape = function(state)
{
	state.shape.apply(state);
	var image = state.view.graph.getImage(state);
	
	if (image != null)
	{
		state.shape.image = image;
	}
	
	var indicator = state.view.graph.getIndicatorColor(state);
	var key = state.view.graph.getIndicatorShape(state);
	var ctor = (key != null) ? this.shapes[key] : null;
	
	// Configures the indicator shape or image
	if (indicator != null)
	{
		state.shape.indicatorShape = ctor;
		state.shape.indicatorColor = indicator;
		state.shape.indicatorGradientColor =
			state.view.graph.getIndicatorGradientColor(state);
		state.shape.indicatorDirection =
			state.style[mxConstants.STYLE_INDICATOR_DIRECTION];
	}
	else
	{
		var indicator = state.view.graph.getIndicatorImage(state);
		
		if (indicator != null)
		{
			state.shape.indicatorImage = indicator;
		}
	}
	
	this.postConfigureShape(state);
};

/**
 * Function: postConfigureShape
 * 
 * Replaces any reserved words used for attributes, eg. inherit,
 * indicated or swimlane for colors in the shape for the given state.
 * This implementation resolves these keywords on the fill, stroke
 * and gradient color keys.
 */
mxCellRenderer.prototype.postConfigureShape = function(state)
{
	if (state.shape != null)
	{
		this.resolveColor(state, 'indicatorColor', mxConstants.STYLE_FILLCOLOR);
		this.resolveColor(state, 'indicatorGradientColor', mxConstants.STYLE_GRADIENTCOLOR);
		this.resolveColor(state, 'fill', mxConstants.STYLE_FILLCOLOR);
		this.resolveColor(state, 'stroke', mxConstants.STYLE_STROKECOLOR);
		this.resolveColor(state, 'gradient', mxConstants.STYLE_GRADIENTCOLOR);
	}
};

/**
 * Function: resolveColor
 * 
 * Resolves special keywords 'inherit', 'indicated' and 'swimlane' and sets
 * the respective color on the shape.
 */
mxCellRenderer.prototype.resolveColor = function(state, field, key)
{
	var value = state.shape[field];
	var graph = state.view.graph;
	var referenced = null;
	
	if (value == 'inherit')
	{
		referenced = graph.model.getParent(state.cell);
	}
	else if (value == 'swimlane')
	{
		if (graph.model.getTerminal(state.cell, false) != null)
		{
			referenced = graph.model.getTerminal(state.cell, false);
		}
		else
		{
			referenced = state.cell;
		}
		
		referenced = graph.getSwimlane(referenced);
		key = graph.swimlaneIndicatorColorAttribute;
	}
	else if (value == 'indicated')
	{
		state.shape[field] = state.shape.indicatorColor;
	}
	
	if (referenced != null)
	{
		var rstate = graph.getView().getState(referenced);
		state.shape[field] = null;

		if (rstate != null)
		{
			if (rstate.shape != null && field != 'indicatorColor')
			{
				state.shape[field] = rstate.shape[field];
			}
			else
			{
				state.shape[field] = rstate.style[key];
			}
		}
	}
};

/**
 * Function: getLabelValue
 * 
 * Returns the value to be used for the label.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the label should be created.
 */
mxCellRenderer.prototype.getLabelValue = function(state)
{
	var graph = state.view.graph;
	var value = graph.getLabel(state.cell);

	if (!graph.isHtmlLabel(state.cell) && !mxUtils.isNode(value) &&
		graph.dialect != mxConstants.DIALECT_SVG && value != null)
	{
		value = mxUtils.htmlEntities(value, false);
	}
	
	return value;
};

/**
 * Function: createLabel
 * 
 * Creates the label for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the label should be created.
 */
mxCellRenderer.prototype.createLabel = function(state, value)
{
	var graph = state.view.graph;
	var isEdge = graph.getModel().isEdge(state.cell);
	
	if (state.style[mxConstants.STYLE_FONTSIZE] > 0 ||
		state.style[mxConstants.STYLE_FONTSIZE] == null)
	{
		// Avoids using DOM node for empty labels
		var isForceHtml = (graph.isHtmlLabel(state.cell) ||
			(value != null && mxUtils.isNode(value))) &&
			graph.dialect == mxConstants.DIALECT_SVG;

		state.text = new mxText(value, new mxRectangle(),
				(state.style[mxConstants.STYLE_ALIGN] ||
					mxConstants.ALIGN_CENTER),
				graph.getVerticalAlign(state),
				state.style[mxConstants.STYLE_FONTCOLOR],
				state.style[mxConstants.STYLE_FONTFAMILY],
				state.style[mxConstants.STYLE_FONTSIZE],
				state.style[mxConstants.STYLE_FONTSTYLE],
				state.style[mxConstants.STYLE_SPACING],
				state.style[mxConstants.STYLE_SPACING_TOP],
				state.style[mxConstants.STYLE_SPACING_RIGHT],
				state.style[mxConstants.STYLE_SPACING_BOTTOM],
				state.style[mxConstants.STYLE_SPACING_LEFT],
				state.style[mxConstants.STYLE_HORIZONTAL],
				state.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR],
				state.style[mxConstants.STYLE_LABEL_BORDERCOLOR],
				graph.isWrapping(state.cell) && graph.isHtmlLabel(state.cell),
				graph.isLabelClipped(state.cell),
				state.style[mxConstants.STYLE_OVERFLOW],
				state.style[mxConstants.STYLE_LABEL_PADDING]);
		state.text.opacity = state.style[mxConstants.STYLE_TEXT_OPACITY];

		state.text.dialect = (isForceHtml) ?
			mxConstants.DIALECT_STRICTHTML :
			state.view.graph.dialect;
		this.initializeLabel(state);
		
		// Workaround for touch devices routing all events for a mouse
		// gesture (down, move, up) via the initial DOM node. IE is even
		// worse in that it redirects the event via the initial DOM node
		// but the event source is the node under the mouse, so we need
		// to check if this is the case and force getCellAt for the
		// subsequent mouseMoves and the final mouseUp.
		var forceGetCell = false;
		
		var getState = function(evt)
		{
			var result = state;

			if (mxClient.IS_TOUCH || forceGetCell)
			{
				var x = mxEvent.getClientX(evt);
				var y = mxEvent.getClientY(evt);
				
				// Dispatches the drop event to the graph which
				// consumes and executes the source function
				var pt = mxUtils.convertPoint(graph.container, x, y);
				result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
			}
			
			return result;
		};
		
		// TODO: Add handling for gestures
		var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
		var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
		var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';

		mxEvent.addListener(state.text.node, md,
			mxUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
						new mxMouseEvent(evt, state));
					forceGetCell = graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG';
				}
			})
		);
		
		mxEvent.addListener(state.text.node, mm,
			mxUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
						new mxMouseEvent(evt, getState(evt)));
				}
			})
		);
		
		mxEvent.addListener(state.text.node, mu,
			mxUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(mxEvent.MOUSE_UP,
						new mxMouseEvent(evt, getState(evt)));
					forceGetCell = false;
				}
			})
		);

		mxEvent.addListener(state.text.node, 'dblclick',
			mxUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.dblClick(evt, state.cell);
					mxEvent.consume(evt);
				}
			})
		);
	}
};

/**
 * Function: initializeLabel
 * 
 * Initiailzes the label with a suitable container.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose label should be initialized.
 */
mxCellRenderer.prototype.initializeLabel = function(state)
{
	var graph = state.view.graph;

	if (state.text.dialect != mxConstants.DIALECT_SVG)
	{
		// Adds the text to the container if the dialect is not SVG and we
		// have an SVG-based browser which doesn't support foreignObjects
		if (mxClient.IS_SVG && mxClient.NO_FO)
		{
			state.text.init(graph.container);
		}
		else if (mxUtils.isVml(state.view.getDrawPane()))
		{
			if (state.shape.label != null)
			{
				state.text.init(state.shape.label);
			}
			else 
			{
				state.text.init(state.shape.node);
			}
		}
	}

	if (state.text.node == null)
	{
		state.text.init(state.view.getDrawPane());
		
		if (state.shape != null && state.text != null)
		{
			state.shape.node.parentNode.insertBefore(
				state.text.node, state.shape.node.nextSibling);
		}
	}
};

/**
 * Function: createCellOverlays
 * 
 * Creates the actual shape for showing the overlay for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the overlay should be created.
 */
mxCellRenderer.prototype.createCellOverlays = function(state)
{
	var graph = state.view.graph;
	var overlays = graph.getCellOverlays(state.cell);
	
	if (overlays != null)
	{
		if (state.overlays == null)
		{
			state.overlays = [];
		}
		
		for (var i = 0; i < overlays.length; i++)
		{
			if (state.overlays[i] == null)
			{
				var tmp = new mxImageShape(new mxRectangle(),
					overlays[i].image.src);
				tmp.dialect = state.view.graph.dialect;
				tmp.overlay = overlays[i];
				this.initializeOverlay(state, tmp);
				this.installCellOverlayListeners(state, overlays[i], tmp);
	
				if (overlays[i].cursor != null)
				{
					tmp.node.style.cursor = overlays[i].cursor;
				}
				
				state.overlays[i] = tmp;
			}
		}
	}
};

/**
 * Function: initializeOverlay
 * 
 * Initializes the given overlay.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the overlay should be created.
 * overlay - <mxImageShape> that represents the overlay.
 */
mxCellRenderer.prototype.initializeOverlay = function(state, overlay)
{
	overlay.init(state.view.getOverlayPane());
};

/**
 * Function: installOverlayListeners
 * 
 * Installs the listeners for the given <mxCellState>, <mxCellOverlay> and
 * <mxShape> that represents the overlay.
 */
mxCellRenderer.prototype.installCellOverlayListeners = function(state, overlay, shape)
{
	var graph  = state.view.graph;
	
	mxEvent.addListener(shape.node, 'click', function (evt)
	{
		if (graph.isEditing())
		{
			graph.stopEditing(!graph.isInvokesStopCellEditing());
		}
		
		overlay.fireEvent(new mxEventObject(mxEvent.CLICK,
				'event', evt, 'cell', state.cell));
	});
	
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
	
	mxEvent.addListener(shape.node, md, function (evt)
	{
		mxEvent.consume(evt);
	});
	
	mxEvent.addListener(shape.node, mm, function (evt)
	{
		graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
			new mxMouseEvent(evt, state));
	});
	
	if (mxClient.IS_TOUCH)
	{
		mxEvent.addListener(shape.node, 'touchend', function (evt)
		{
			overlay.fireEvent(new mxEventObject(mxEvent.CLICK,
					'event', evt, 'cell', state.cell));
		});
	}
};

/**
 * Function: createControl
 * 
 * Creates the control for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the control should be created.
 */
mxCellRenderer.prototype.createControl = function(state)
{
	var graph = state.view.graph;
	var image = graph.getFoldingImage(state);
	
	if (graph.foldingEnabled && image != null)
	{
		if (state.control == null)
		{
			var b = new mxRectangle(0, 0, image.width, image.height);
			state.control = new mxImageShape(b, image.src);
			state.control.dialect = graph.dialect;
			state.control.preserveImageAspect = false;
			
			this.initControl(state, state.control, true, function (evt)
			{
				if (graph.isEnabled())
				{
					var collapse = !graph.isCellCollapsed(state.cell);
					graph.foldCells(collapse, false, [state.cell]);
					mxEvent.consume(evt);
				}
			});
		}
	}
	else if (state.control != null)
	{
		state.control.destroy();
		state.control = null;
	}
};

/**
 * Function: initControl
 * 
 * Initializes the given control and returns the corresponding DOM node.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the control should be initialized.
 * control - <mxShape> to be initialized.
 * handleEvents - Boolean indicating if mousedown and mousemove should fire events via the graph.
 * clickHandler - Optional function to implement clicks on the control.
 */
mxCellRenderer.prototype.initControl = function(state, control, handleEvents, clickHandler)
{
	var graph = state.view.graph;
	
	// In the special case where the label is in HTML and the display is SVG the image
	// should go into the graph container directly in order to be clickable. Otherwise
	// it is obscured by the HTML label that overlaps the cell.
	var isForceHtml = graph.isHtmlLabel(state.cell) &&
		mxClient.NO_FO &&
		graph.dialect == mxConstants.DIALECT_SVG;

	if (isForceHtml)
	{
		control.dialect = mxConstants.DIALECT_PREFERHTML;
		control.init(graph.container);
		control.node.style.zIndex = 1;
	}
	else
	{
		control.init(state.view.getOverlayPane());
	}

	var node = control.innerNode || control.node;
	
	if (clickHandler)
	{
		if (graph.isEnabled())
		{
			node.style.cursor = 'pointer';
		}
		
		mxEvent.addListener(node, 'click', clickHandler);
	}
	
	if (handleEvents)
	{
		var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
		var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
		
		mxEvent.addListener(node, md, function (evt)
		{
			graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
			mxEvent.consume(evt);
		});
	
		mxEvent.addListener(node, mm, function (evt)
		{
			graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, state));
		});
	}
	
	return node;
};

/**
 * Function: isShapeEvent
 * 
 * Returns true if the event is for the shape of the given state. This
 * implementation always returns true.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose shape fired the event.
 * evt - Mouse event which was fired.
 */
mxCellRenderer.prototype.isShapeEvent = function(state, evt)
{
	return true;
};

/**
 * Function: isLabelEvent
 * 
 * Returns true if the event is for the label of the given state. This
 * implementation always returns true.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose label fired the event.
 * evt - Mouse event which was fired.
 */
mxCellRenderer.prototype.isLabelEvent = function(state, evt)
{
	return true;
};

/**
 * Function: installListeners
 * 
 * Installs the event listeners for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the event listeners should be isntalled.
 */
mxCellRenderer.prototype.installListeners = function(state)
{
	var graph = state.view.graph;
	
	// Receives events from transparent backgrounds
	if (graph.dialect == mxConstants.DIALECT_SVG)
	{
		var events = 'all';

		// Disabled fill-events on non-filled edges
		if (graph.getModel().isEdge(state.cell) && state.shape.stroke != null &&
			(state.shape.fill == null || state.shape.fill == mxConstants.NONE))
		{
			events = 'visibleStroke';
		}

		// Specifies the event-processing on the shape
		if (state.shape.innerNode != null)
		{
			state.shape.innerNode.setAttribute('pointer-events', events);
		}
		else
		{
			state.shape.node.setAttribute('pointer-events', events);
		}
	}
	
	// Workaround for touch devices routing all events for a mouse
	// gesture (down, move, up) via the initial DOM node. Same for
	// HTML images in all IE versions (VML images are working).
	var getState = function(evt)
	{
		var result = state;
		
		if ((graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG') || mxClient.IS_TOUCH)
		{
			var x = mxEvent.getClientX(evt);
			var y = mxEvent.getClientY(evt);
			
			// Dispatches the drop event to the graph which
			// consumes and executes the source function
			var pt = mxUtils.convertPoint(graph.container, x, y);
			result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
		}
		
		return result;
	};
	
	// Experimental support for two-finger pinch to resize cells
	var gestureInProgress = false;
	
	mxEvent.addListener(state.shape.node, 'gesturestart',
		mxUtils.bind(this, function(evt)
		{
			// FIXME: Breaks encapsulation to reset the double
			// tap event handling when gestures take place
			graph.lastTouchTime = 0;

			gestureInProgress = true;
			mxEvent.consume(evt);
		})
	);
	
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	var mm = (mxClient.IS_TOUCH) ? 'touchmove' : 'mousemove';
	var mu = (mxClient.IS_TOUCH) ? 'touchend' : 'mouseup';

	mxEvent.addListener(state.shape.node, md,
		mxUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt) && !gestureInProgress)
			{
				// Redirects events from the "event-transparent" region of
				// a swimlane to the graph. This is only required in HTML,
				// SVG and VML do not fire mouse events on transparent
				// backgrounds.
				graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
					new mxMouseEvent(evt, (state.shape != null &&
					mxEvent.getSource(evt) == state.shape.content) ?
						null : state));
			}
			else if (gestureInProgress)
			{
				mxEvent.consume(evt);
			}
		})
	);
	
	mxEvent.addListener(state.shape.node, mm,
		mxUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt) && !gestureInProgress)
			{
				graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
					new mxMouseEvent(evt, (state.shape != null &&
					mxEvent.getSource(evt) == state.shape.content) ?
						null : getState(evt)));
			}
			else if (gestureInProgress)
			{
				mxEvent.consume(evt);
			}
		})
	);
	
	mxEvent.addListener(state.shape.node, mu,
		mxUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt) && !gestureInProgress)
			{
				graph.fireMouseEvent(mxEvent.MOUSE_UP,
					new mxMouseEvent(evt, (state.shape != null &&
					mxEvent.getSource(evt) == state.shape.content) ?
						null : getState(evt)));
			}
			else if (gestureInProgress)
			{
				mxEvent.consume(evt);
			}
		})
	);
	
	// Experimental handling for gestures. Double-tap handling is implemented
	// in mxGraph.fireMouseEvent.
	var dc = (mxClient.IS_TOUCH) ? 'gestureend' : 'dblclick';
	
	mxEvent.addListener(state.shape.node, dc,
		mxUtils.bind(this, function(evt)
		{
			gestureInProgress = false;
			
			if (dc == 'gestureend')
			{
				// FIXME: Breaks encapsulation to reset the double
				// tap event handling when gestures take place
				graph.lastTouchTime = 0;
				
				if (graph.gestureEnabled)
				{
					graph.handleGesture(state, evt);
					mxEvent.consume(evt);
				}
			}
			else if (this.isShapeEvent(state, evt))
			{
				graph.dblClick(evt, (state.shape != null &&
					mxEvent.getSource(evt) == state.shape.content) ?
						null : state.cell);
				mxEvent.consume(evt);
			}
		})
	);
};

/**
 * Function: redrawLabel
 * 
 * Redraws the label for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose label should be redrawn.
 */
mxCellRenderer.prototype.redrawLabel = function(state)
{
	var value = this.getLabelValue(state);
	
	// FIXME: Add label always if HTML label and NO_FO
	if (state.text == null && value != null && (mxUtils.isNode(value) || value.length > 0))
	{
		this.createLabel(state, value);
	}
	else if (state.text != null && (value == null || value.length == 0))
	{
		state.text.destroy();
		state.text = null;
	}

	if (state.text != null)
	{
		var graph = state.view.graph;
		var wrapping = graph.isWrapping(state.cell);
		var clipping = graph.isLabelClipped(state.cell);
		var bounds = this.getLabelBounds(state);

		if (state.text.value != value || state.text.isWrapping != wrapping ||
			state.text.isClipping != clipping || state.text.scale != state.view.scale ||
			!state.text.bounds.equals(bounds))
		{
			state.text.value = value;
			state.text.bounds = bounds;
			state.text.scale = this.getTextScale(state);
			state.text.isWrapping = wrapping;
			state.text.isClipping = clipping;
			
			state.text.redraw();
		}
	}
};

/**
 * Function: getTextScale
 * 
 * Returns the scaling used for the label of the given state
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose label scale should be returned.
 */
mxCellRenderer.prototype.getTextScale = function(state)
{
	return state.view.scale;
};

/**
 * Function: getLabelBounds
 * 
 * Returns the bounds to be used to draw the label of the given state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose label bounds should be returned.
 */
mxCellRenderer.prototype.getLabelBounds = function(state)
{
	var graph = state.view.graph;
	var isEdge = graph.getModel().isEdge(state.cell);
	var bounds = new mxRectangle(state.absoluteOffset.x, state.absoluteOffset.y);
		
	if (!isEdge)
	{
		bounds.x += state.x;
		bounds.y += state.y;
		
		// Minimum of 1 fixes alignment bug in HTML labels
		bounds.width = Math.max(1, state.width);
		bounds.height = Math.max(1, state.height);
		
		if (graph.isSwimlane(state.cell))
		{
			var scale = graph.view.scale;
			var size = graph.getStartSize(state.cell);
			
			if (size.width > 0)
			{
				bounds.width = size.width * scale;
			}
			else if (size.height > 0)
			{
				bounds.height = size.height * scale;
			}
		}
	}
	
	return bounds;
};

/**
 * Function: redrawCellOverlays
 * 
 * Redraws the overlays for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose overlays should be redrawn.
 */
mxCellRenderer.prototype.redrawCellOverlays = function(state)
{
	var overlays = state.view.graph.getCellOverlays(state.cell);
	var oldCount = (state.overlays != null) ? state.overlays.length : 0;
	var newCount = (overlays != null) ? overlays.length : 0;
	
	// Checks if the overlays need an update - this assumes a
	// maximum of one change to cell.overlays between each call
	if (oldCount != newCount)
	{
		if (oldCount > 0)
		{
			var newOverlayShapes = [];
			
			for (var i = 0; i < state.overlays.length; i++)
			{
				var index = mxUtils.indexOf(overlays, state.overlays[i].overlay);
				
				if (index >= 0)
				{
					newOverlayShapes[index] = state.overlays[i];
				}
				else
				{
					state.overlays[i].destroy();
				}
			}
			
			state.overlays = newOverlayShapes;
		}
		
		if (newCount > 0)
		{
			this.createCellOverlays(state);
		}
		else
		{
			state.overlays = null;
		}
	}
	
	if (state.overlays != null)
	{
		for (var i = 0; i < overlays.length; i++)
		{
			var bounds = overlays[i].getBounds(state);

			if (state.overlays[i].bounds == null ||
				state.overlays[i].scale != state.view.scale ||
				!state.overlays[i].bounds.equals(bounds))
			{
				state.overlays[i].bounds = bounds;
				state.overlays[i].scale = state.view.scale;
				state.overlays[i].redraw();
			}
		}
	}
};

/**
 * Function: redrawControl
 * 
 * Redraws the control for the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> whose control should be redrawn.
 */
mxCellRenderer.prototype.redrawControl = function(state)
{
	if (state.control != null)
	{
		var bounds = this.getControlBounds(state);
		var s = state.view.scale;
		
		if (state.control.scale != s || !state.control.bounds.equals(bounds))
		{
			state.control.bounds = bounds;
			state.control.scale = s;
			state.control.redraw();
		}
	}
};

/**
 * Function: getControlBounds
 * 
 * Returns the bounds to be used to draw the control (folding icon) of the
 * given state.
 */
mxCellRenderer.prototype.getControlBounds = function(state)
{
	if (state.control != null)
	{
		var oldScale = state.control.scale;
		var w = state.control.bounds.width / oldScale;
		var h = state.control.bounds.height / oldScale;
		var s = state.view.scale;			

		return (state.view.graph.getModel().isEdge(state.cell)) ? 
			new mxRectangle(
				state.x + state.width / 2 - w / 2 * s,
				state.y + state.height / 2 - h / 2 * s,
				w * s, h * s)
			: new mxRectangle(
				state.x + w / 2 * s,
				state.y + h / 2 * s,
				w * s, h * s);
	}
	
	return null;
};

/**
 * Function: redraw
 * 
 * Updates the bounds or points and scale of the shapes for the given cell
 * state. This is called in mxGraphView.validatePoints as the last step of
 * updating all cells.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shapes should be updated.
 * force - Optional boolean that specifies if the cell should be reconfiured
 * and redrawn without any additional checks.
 * rendering - Optional boolean that specifies if the cell should actually
 * be drawn into the DOM. If this is false then redraw and/or reconfigure
 * will not be called on the shape.
 */
mxCellRenderer.prototype.redraw = function(state, force, rendering)
{
	if (state.shape != null)
	{
		var model = state.view.graph.getModel();
		var isEdge = model.isEdge(state.cell);
		reconfigure = (force != null) ? force : false;
		
		// Handles changes of the collapse icon
		this.createControl(state);
		
		// Handles changes to the order in the DOM
		if (state.orderChanged || state.invalidOrder)
		{
			if (state.view.graph.ordered)
			{
				this.order(state);
			}
			else
			{
				// Assert state.cell is edge
				this.orderEdge(state);
			}
			
			// Required to update inherited styles
			reconfigure = state.orderChanged;
		}
		
		delete state.invalidOrder;
		delete state.orderChanged;
		
		// Checks if the style in the state is different from the style
		// in the shape and re-applies the style if required
		if (!reconfigure && !mxUtils.equalEntries(state.shape.style, state.style))
		{
			reconfigure = true;
		}

		// Reconfiures the shape after an order or style change
		if (reconfigure)
		{
			this.configureShape(state);
			state.shape.reconfigure();
		}
		
		// Redraws the cell if required
		if (force || state.shape.bounds == null || state.shape.scale != state.view.scale ||
			!state.shape.bounds.equals(state) ||
			!mxUtils.equalPoints(state.shape.points, state.absolutePoints))
		{
			// FIXME: Move indicator color update into shape.redraw
//				var indicator = state.view.graph.getIndicatorColor(state);
//				if (indicator != null)
//				{
//					state.shape.indicatorColor = indicator;
//				}
			
			if (state.absolutePoints != null)
			{
				state.shape.points = state.absolutePoints.slice();
			}
			else
			{
				state.shape.points = null;
			}
			
			state.shape.bounds = new mxRectangle(
				state.x, state.y, state.width, state.height);
			state.shape.scale = state.view.scale;
			
			if (rendering == null || rendering)
			{
				state.shape.redraw();
			}
			else
			{
				state.shape.updateBoundingBox();
			}
		}
		
		// Updates the text label, overlays and control
		if (rendering == null || rendering)
		{
			this.redrawLabel(state);
			this.redrawCellOverlays(state);
			this.redrawControl(state);
		}
	}
};

/**
 * Function: destroy
 * 
 * Destroys the shapes associated with the given cell state.
 * 
 * Parameters:
 * 
 * state - <mxCellState> for which the shapes should be destroyed.
 */
mxCellRenderer.prototype.destroy = function(state)
{
	if (state.shape != null)
	{
		if (state.text != null)
		{		
			state.text.destroy();
			state.text = null;
		}
		
		if (state.overlays != null)
		{
			for (var i=0; i<state.overlays.length; i++)
			{
				state.overlays[i].destroy();
			}
			
			state.overlays = null;
		}
		
		if (state.control != null)
		{
			state.control.destroy();
			state.control = null;
		}
		
		state.shape.destroy();
		state.shape = null;
	}
};
