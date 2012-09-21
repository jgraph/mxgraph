/*
 * $Id: GraphEditor.js,v 1.3 2012-03-22 09:22:39 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
GraphEditor = {};

function main()
{
    Ext.QuickTips.init();

	// Disables browser context menu
	mxEvent.disableContextMenu(document.body);	
	
	// Makes the connection hotspot smaller
	mxConstants.DEFAULT_HOTSPOT = 0.3;
	
	// Makes the shadow brighter
	mxConstants.SHADOWCOLOR = '#C0C0C0';
    
	// Creates the graph and loads the default stylesheet
    var graph = new mxGraph();
    
    // Inverts the elbow edge style without removing existing styles
    graph.flipEdge = function(edge)
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
    
    // Creates the command history (undo/redo)
    var history = new mxUndoManager();

    // Loads the default stylesheet into the graph
    var node = mxUtils.load('resources/default-style.xml').getDocumentElement();
		var dec = new mxCodec(node.ownerDocument);
		dec.decode(node, graph.getStylesheet());
	
	// Sets the style to be used when an elbow edge is double clicked
	graph.alternateEdgeStyle = 'vertical';
	
	// Creates the main containers
	var mainPanel = new MainPanel(graph, history);
	var library = new LibraryPanel();
	
	var store = new Ext.data.ArrayStore({
	    fields: ['name']
	});
    store.loadData([['test'], ['test2']]);
    
    var updateHandler = function()
    {
		var data = [];
		var names = DiagramStore.getNames();
		
		for (var i = 0; i < names.length; i++)
		{
			data.push([names[i]]);
		}
		
		store.loadData(data);
    };
    
    DiagramStore.addListener('put', updateHandler);
    DiagramStore.addListener('remove', updateHandler);
    updateHandler();
    
	var diagramPanel = new DiagramPanel(store, mainPanel);
	
	diagramPanel.on('dblclick', function(view, index, node, e)
	{
		var name = store.getAt(index).get('name');
		mainPanel.openDiagram(name);
	});
	
	var tabItems = (DiagramStore.isAvailable()) ? [library, diagramPanel] : [library];
	
    // Creates the container for the outline
	var tabPanel = new Ext.TabPanel(
	{
		id: 'tabPanel',
		region: 'center',
		activeTab: 0,
		width: 180,
		items: tabItems
    });

	
    // Creates the container for the outline
	var mainTabPanel = new Ext.TabPanel(
	{
		id: 'mainTabPanel',
		region: 'center',
		activeTab: 0,
		items: [mainPanel]
    });
	
    // Creates the container for the outline
	var outlinePanel = new Ext.Panel(
	{
		id: 'outlinePanel',
		layout: 'fit',
		split: true,
		height: 200,
        region:'south'
    });

	// Creates the enclosing viewport
    var viewport = new Ext.Viewport(
    {
    	layout:'border',
    	items:
        [{
	        xtype: 'panel',
	       	margins: '5 5 5 5',
	        region: 'center',
	        layout: 'border',
	        border: false,
        	items:
        	[
	            new Ext.Panel(
	            {
			        region: 'west',
			        layout: 'border',
			        split: true,
			        width: 180,
			        border: false,
			        items:
			        [
			         	tabPanel,
			        	outlinePanel
					]
		    	}),
		    	mainTabPanel
        	]
       	  } // end master panel
       	] // end viewport items
    }); // end of new Viewport

    // Enables scrollbars for the graph container to make it more
    // native looking, this will affect the panning to use the
    // scrollbars rather than moving the container contents inline
   	mainPanel.graphPanel.body.dom.style.overflow = 'auto';

    // Installs the command history after the initial graph
    // has been created
	var listener = function(sender, evt)
	{
		history.undoableEditHappened(evt.getProperty('edit'));
	};
	
	graph.getModel().addListener(mxEvent.UNDO, listener);
	graph.getView().addListener(mxEvent.UNDO, listener);

	// Keeps the selection in sync with the history
	var undoHandler = function(sender, evt)
	{
		var changes = evt.getProperty('edit').changes;
		graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
	};
	
	history.addListener(mxEvent.UNDO, undoHandler);
	history.addListener(mxEvent.REDO, undoHandler);

	// Initializes the graph as the DOM for the panel has now been created	
    graph.init(mainPanel.graphPanel.body.dom);
    
    if (mxClient.IS_GC || mxClient.IS_SF)
    {
    	graph.container.style.background = '-webkit-gradient(linear, 0% 0%, 100% 0%, from(#FFFFFF), to(#FFFFEE))';
    }
    else if (mxClient.IS_NS)
    {
    	graph.container.style.background = '-moz-linear-gradient(left, #FFFFFF, #FFFFEE)';  
    }
    else if (mxClient.IS_IE)
    {
    	graph.container.style.filter = 'progid:DXImageTransform.Microsoft.Gradient('+
                'StartColorStr=\'#FFFFFF\', EndColorStr=\'#FFFFEE\', GradientType=1)';
    }
    
    graph.setConnectable(true);
	graph.setDropEnabled(true);
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.connectionHandler.setCreateTarget(true);
    
    // Sets the cursor
    graph.container.style.cursor = 'default';

	// Creates rubberband selection
    var rubberband = new mxRubberband(graph);

	// Adds some example cells into the graph
	mainPanel.newDiagram();
    var parent = graph.getDefaultParent();
	graph.getModel().beginUpdate();
	try
	{
		var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 40, 'rounded=1');
		var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 40, 'rounded=1');
		var e1 = graph.insertEdge(parent, null, 'Hello, World!', v1, v2);
	}
	finally
	{
		// Updates the display
		graph.getModel().endUpdate();
	}

	// Toolbar object for updating buttons in listeners
	var toolbarItems = mainPanel.graphPanel.getTopToolbar().items;
	
	// Hides the buttons which are only used if we have client-side storage
	if (!DiagramStore.isAvailable())
	{
		toolbarItems.get('saveButton').setVisible(false);
		toolbarItems.get('saveAsButton').setVisible(false);
	}
	
    // Updates the states of all buttons that require a selection
    var selectionListener = function()
    {
    	var selected = !graph.isSelectionEmpty();
    	
    	toolbarItems.get('cut').setDisabled(!selected);
    	toolbarItems.get('copy').setDisabled(!selected);
    	toolbarItems.get('delete').setDisabled(!selected);
    	toolbarItems.get('italic').setDisabled(!selected);
    	toolbarItems.get('bold').setDisabled(!selected);
    	toolbarItems.get('underline').setDisabled(!selected);
    	toolbarItems.get('fillcolor').setDisabled(!selected);
    	toolbarItems.get('fontcolor').setDisabled(!selected);
    	toolbarItems.get('linecolor').setDisabled(!selected);
    	toolbarItems.get('align').setDisabled(!selected);
    };
    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);

    // Updates the states of the undo/redo buttons in the toolbar
    var historyListener = function()
    {
    	toolbarItems.get('undo').setDisabled(!history.canUndo());
    	toolbarItems.get('redo').setDisabled(!history.canRedo());
    };

	history.addListener(mxEvent.ADD, historyListener);
	history.addListener(mxEvent.UNDO, historyListener);
	history.addListener(mxEvent.REDO, historyListener);
	
	// Updates the button states once
	selectionListener();
	historyListener();
	
    // Installs outline in outlinePanel
	var outline = new mxOutline(graph, outlinePanel.body.dom);
	outlinePanel.body.dom.style.cursor = 'move';
	
    // Adds the entries into the library
    insertVertexTemplate(library, graph, 'Container', '../../images/swimlane.gif', 'swimlane', 200, 200, 'Container');
    insertVertexTemplate(library, graph, 'Icon', '../../images/rounded.gif', 'icon;image=../../images/wrench.png', 70, 70, "Icon");
    insertVertexTemplate(library, graph, 'Label', '../../images/rounded.gif', 'label;image=../../images/gear.png', 130, 50, "Label");
    insertVertexTemplate(library, graph, 'Rectangle', '../../images/rectangle.gif', null, 120, 50);
    insertVertexTemplate(library, graph, 'Rounded Rectangle', '../../images/rounded.gif', 'rounded=1', 120, 50);
    insertVertexTemplate(library, graph, 'Ellipse', '../../images/ellipse.gif', 'ellipse', 50, 50);
    insertVertexTemplate(library, graph, 'Double Ellipse', '../../images/doubleellipse.gif', 'ellipse;shape=doubleEllipse', 50, 50);
    insertVertexTemplate(library, graph, 'Triangle', '../../images/triangle.gif', 'triangle', 50, 70);
    insertVertexTemplate(library, graph, 'Rhombus', '../../images/rhombus.gif', 'rhombus', 50, 50);
	insertVertexTemplate(library, graph, 'Horizontal Line', '../../images/hline.gif', 'line', 120, 10);
    insertVertexTemplate(library, graph, 'Hexagon', '../../images/hexagon.gif', 'shape=hexagon', 90, 70);
    insertVertexTemplate(library, graph, 'Cylinder', '../../images/cylinder.gif', 'shape=cylinder', 70, 90);
    insertVertexTemplate(library, graph, 'Actor', '../../images/actor.gif', 'shape=actor', 70, 90);
    insertVertexTemplate(library, graph, 'Cloud', '../../images/cloud.gif', 'ellipse;shape=cloud', 90, 70);

    insertImageTemplate(library, graph, 'Bell', '../../images/bell.png', false);
    insertImageTemplate(library, graph, 'Box', '../../images/box.png', false);
    insertImageTemplate(library, graph, 'Cube', '../../images/cube_green.png', false);
    insertImageTemplate(library, graph, 'User', '../../images/dude3.png', true);
    insertImageTemplate(library, graph, 'Earth', '../../images/earth.png', true);
    insertImageTemplate(library, graph, 'Gear', '../../images/gear.png', true);
    insertImageTemplate(library, graph, 'Home', '../../images/house.png', false);
    insertImageTemplate(library, graph, 'Package', '../../images/package.png', false);
    insertImageTemplate(library, graph, 'Printer', '../../images/printer.png', false);
    insertImageTemplate(library, graph, 'Server', '../../images/server.png', false);
    insertImageTemplate(library, graph, 'Workplace', '../../images/workplace.png', false);
    insertImageTemplate(library, graph, 'Wrench', '../../images/wrench.png', true);

    insertSymbolTemplate(library, graph, 'Cancel', '../../images/symbols/cancel_end.png', false);
    insertSymbolTemplate(library, graph, 'Error', '../../images/symbols/error.png', false);
    insertSymbolTemplate(library, graph, 'Event', '../../images/symbols/event.png', false);
    insertSymbolTemplate(library, graph, 'Fork', '../../images/symbols/fork.png', true);
    insertSymbolTemplate(library, graph, 'Inclusive', '../../images/symbols/inclusive.png', true);
    insertSymbolTemplate(library, graph, 'Link', '../../images/symbols/link.png', false);
    insertSymbolTemplate(library, graph, 'Merge', '../../images/symbols/merge.png', true);
    insertSymbolTemplate(library, graph, 'Message', '../../images/symbols/message.png', false);
    insertSymbolTemplate(library, graph, 'Multiple', '../../images/symbols/multiple.png', false);
    insertSymbolTemplate(library, graph, 'Rule', '../../images/symbols/rule.png', false);
    insertSymbolTemplate(library, graph, 'Terminate', '../../images/symbols/terminate.png', false);
    insertSymbolTemplate(library, graph, 'Timer', '../../images/symbols/timer.png', false);

	insertEdgeTemplate(library, graph, 'Straight', '../../images/straight.gif', 'straight', 100, 100);
	insertEdgeTemplate(library, graph, 'Horizontal Connector', '../../images/connect.gif', null, 100, 100);
    insertEdgeTemplate(library, graph, 'Vertical Connector', '../../images/vertical.gif', 'vertical', 100, 100);
    insertEdgeTemplate(library, graph, 'Entity Relation', '../../images/entity.gif', 'entity', 100, 100);
	insertEdgeTemplate(library, graph, 'Arrow', '../../images/arrow.gif', 'arrow', 100, 100);

    // Overrides createGroupCell to set the group style for new groups to 'group'
    var previousCreateGroupCell = graph.createGroupCell;
    
    graph.createGroupCell = function()
    {
    	var group = previousCreateGroupCell.apply(this, arguments);
    	group.setStyle('group');
    	
    	return group;
    };
    
    
    // Connect preview
    graph.connectionHandler.createEdgeState = function(me)
	{
    	if (GraphEditor.edgeTemplate != null)
    	{
    		return graph.view.createState(GraphEditor.edgeTemplate);
    	}
    	
    	return null;
    };

    graph.connectionHandler.factoryMethod = function()
    {
		if (GraphEditor.edgeTemplate != null)
		{
    		return graph.cloneCells([GraphEditor.edgeTemplate])[0];
    	}
		
		return null;
    };

    // Uses the selected edge in the library as a template for new edges
    library.getSelectionModel().on('selectionchange', function(sm, node)
    {
    	if (node != null &&
    		node.attributes.cells != null)
    	{
    		var cell = node.attributes.cells[0];
    		
    		if (cell != null &&
    			graph.getModel().isEdge(cell))
    		{
    			GraphEditor.edgeTemplate = cell;
    		}
    	}
    });

    // Updates the document title if the current root changes (drilling)
	var drillHandler = function(sender)
	{
		var model = graph.getModel();
		var cell = graph.getCurrentRoot();
		var title = '';
		
		while (cell != null &&
			  model.getParent(model.getParent(cell)) != null)
		{
			// Append each label of a valid root
			if (graph.isValidRoot(cell))
			{
				title = ' > ' +
				graph.convertValueToString(cell) + title;
			}
			
			cell = graph.getModel().getParent(cell);
		}
		
		document.title = 'Graph Editor' + title;
	};
		
	graph.getView().addListener(mxEvent.DOWN, drillHandler);
	graph.getView().addListener(mxEvent.UP, drillHandler);

	// Transfer initial focus to graph container for keystroke handling
	graph.container.focus();
	    
    // Handles keystroke events
    var keyHandler = new mxKeyHandler(graph);
    
    // Ignores enter keystroke. Remove this line if you want the
    // enter keystroke to stop editing
    keyHandler.enter = function() {};
    
    keyHandler.bindKey(8, function()
    {
    	graph.foldCells(true);
    });
    
    keyHandler.bindKey(13, function()
    {
    	graph.foldCells(false);
    });
    
    keyHandler.bindKey(33, function()
    {
    	graph.exitGroup();
    });
    
    keyHandler.bindKey(34, function()
    {
    	graph.enterGroup();
    });
    
    keyHandler.bindKey(36, function()
    {
    	graph.home();
    });

    keyHandler.bindKey(35, function()
    {
    	graph.refresh();
    });
    
    keyHandler.bindKey(37, function()
    {
    	graph.selectPreviousCell();
    });
        
    keyHandler.bindKey(38, function()
    {
    	graph.selectParentCell();
    });

    keyHandler.bindKey(39, function()
    {
    	graph.selectNextCell();
    });
    
    keyHandler.bindKey(40, function()
    {
    	graph.selectChildCell();
    });
    
    keyHandler.bindKey(46, function()
    {
    	graph.removeCells();
    });
    
    keyHandler.bindKey(107, function()
    {
    	graph.zoomIn();
    });
    
    keyHandler.bindKey(109, function()
    {
    	graph.zoomOut();
    });
    
    keyHandler.bindKey(113, function()
    {
    	graph.startEditingAtCell();
    });
  
    keyHandler.bindControlKey(65, function()
    {
    	graph.selectAll();
    });

    keyHandler.bindControlKey(89, function()
    {
    	history.redo();
    });
    
    keyHandler.bindControlKey(90, function()
    {
    	history.undo();
    });
    
    keyHandler.bindControlKey(88, function()
    {
    	mxClipboard.cut(graph);
    });
    
    keyHandler.bindControlKey(67, function()
    {
    	mxClipboard.copy(graph);
    });
    
    keyHandler.bindControlKey(86, function()
    {
    	mxClipboard.paste(graph);
    });
    
    keyHandler.bindControlKey(71, function()
    {
    	graph.setSelectionCell(graph.groupCells(null, 20));
    });
    
    keyHandler.bindControlKey(85, function()
    {
    	graph.setSelectionCells(graph.ungroupCells());
    });
}; // end of main

function insertSymbolTemplate(panel, graph, name, icon, rhombus)
{
    var imagesNode = panel.symbols;
    var style = (rhombus) ? 'rhombusImage' : 'roundImage';
    return insertVertexTemplate(panel, graph, name, icon, style+';image='+icon, 50, 50, '', imagesNode);
};

function insertImageTemplate(panel, graph, name, icon, round)
{
    var imagesNode = panel.images;
    var style = (round) ? 'roundImage' : 'image';
    return insertVertexTemplate(panel, graph, name, icon, style+';image='+icon, 50, 50, name, imagesNode);
};

function insertVertexTemplate(panel, graph, name, icon, style, width, height, value, parentNode)
{
		var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
		cells[0].vertex = true;
		
		var funct = function(graph, evt, target, x, y)
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				var validDropTarget = (target != null) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;
				
				if (target != null &&
					!validDropTarget &&
					graph.getModel().getChildCount(target) == 0 &&
					graph.getModel().isVertex(target) == cells[0].vertex)
				{
					graph.getModel().setStyle(target, style);
					select = [target];
				}
				else
				{
					if (target != null &&
						!validDropTarget)
					{
						target = null;
					}
					
					// Splits the target edge or inserts into target group
					if (graph.isSplitEnabled() && graph.isSplitTarget(target, cells, evt))
					{
						graph.splitEdge(target, cells, null, x, y);
						select = cells;
					}
					else
					{
						cells = graph.getImportableCells(cells);
						
						if (cells.length > 0)
						{
							select = graph.importCells(cells, x, y, target);
						}
					}
				}
				
				if (select != null && select.length > 0)
				{
					graph.scrollCellToVisible(select[0]);
					graph.setSelectionCells(select);
				}
			}
		};
		
		// Small hack to install the drag listener on the node's DOM element
		// after it has been created. The DOM node does not exist if the parent
		// is not expanded.
		var node = panel.addTemplate(name, icon, parentNode, cells);
		var installDrag = function(expandedNode)
		{
			if (node.ui.elNode != null)
			{
				// Creates the element that is being shown while the drag is in progress
				var dragPreview = document.createElement('div');
				dragPreview.style.border = 'dashed black 1px';
				dragPreview.style.width = width+'px';
				dragPreview.style.height = height+'px';
				
				var ds = mxUtils.makeDraggable(node.ui.elNode, graph, funct, dragPreview, 0, 0,
						graph.autoscroll, true);
				ds.isGuidesEnabled = function()
				{
					return graph.graphHandler.guidesEnabled;
				};
			}
		};
		
		if (!node.parentNode.isExpanded())
		{
			panel.on('expandnode', installDrag);
		}
		else
		{
			installDrag(node.parentNode);
		}
		
		return node;
};

function insertEdgeTemplate(panel, graph, name, icon, style, width, height, value, parentNode)
{
		var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
		cells[0].geometry.setTerminalPoint(new mxPoint(0, height), true);
		cells[0].geometry.setTerminalPoint(new mxPoint(width, 0), false);
		cells[0].edge = true;
		
		var funct = function(graph, evt, target)
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				var validDropTarget = (target != null) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;
				
				if (target != null &&
					!validDropTarget)
				{
					target = null;
				}
				
				var pt = graph.getPointForEvent(evt);
				var scale = graph.view.scale;
				
				pt.x -= graph.snap(width / 2);
				pt.y -= graph.snap(height / 2);
				
				select = graph.importCells(cells, pt.x, pt.y, target);
				
				// Uses this new cell as a template for all new edges
				GraphEditor.edgeTemplate = select[0];
				
				graph.scrollCellToVisible(select[0]);
				graph.setSelectionCells(select);
			}
		};
		
		// Small hack to install the drag listener on the node's DOM element
		// after it has been created. The DOM node does not exist if the parent
		// is not expanded.
		var node = panel.addTemplate(name, icon, parentNode, cells);
		var installDrag = function(expandedNode)
		{
			if (node.ui.elNode != null)
			{
				// Creates the element that is being shown while the drag is in progress
				var dragPreview = document.createElement('div');
				dragPreview.style.border = 'dashed black 1px';
				dragPreview.style.width = width+'px';
				dragPreview.style.height = height+'px';
				
				mxUtils.makeDraggable(node.ui.elNode, graph, funct, dragPreview, -width / 2, -height / 2,
						graph.autoscroll, true);
			}
		};
		
		if (!node.parentNode.isExpanded())
		{
			panel.on('expandnode', installDrag);
		}
		else
		{
			installDrag(node.parentNode);
		}
		
		return node;
};

// Defines a global functionality for displaying short information messages
Ext.example = function(){
    var msgCt;

    function createBox(t, s){
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.DomHelper.append(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.slideIn('t').pause(1).ghost("t", {remove:true});
        }
    };
}();
