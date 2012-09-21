/**
 * $Id: Sidebar.js,v 1.67 2012-07-19 19:09:23 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new sidebar for the given editor.
 */
function Sidebar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.palettes = new Object();
	this.showTooltips = true;
	this.graph = new Graph(document.createElement('div'), null, null, this.editorUi.editor.graph.getStylesheet());
	this.graph.foldingEnabled = false;
	this.graph.autoScroll = false;
	this.graph.setTooltips(false);
	this.graph.setConnectable(false);
	this.graph.resetViewOnRootChange = false;
	this.graph.view.setTranslate(this.thumbBorder, this.thumbBorder);
	this.graph.setEnabled(false);

	// Workaround for VML rendering in IE8 standards mode where the container must be in the DOM
	// so that VML references can be restored via document.getElementById in mxShape.init.
	if (document.documentMode == 8)
	{
		document.body.appendChild(this.graph.container);
	}
	
	// Workaround for no rendering in 0 coordinate in FF 10
	if (this.shiftThumbs)
	{
		this.graph.view.canvas.setAttribute('transform', 'translate(1, 1)');
	}
	
	if (!mxClient.IS_TOUCH)
	{
		mxEvent.addListener(document, 'mouseup', mxUtils.bind(this, function()
		{
			this.showTooltips = true;
		}));
	
		// Enables tooltips after scroll
		mxEvent.addListener(container, 'scroll', mxUtils.bind(this, function()
		{
			this.showTooltips = true;
		}));
		
		mxEvent.addListener(document, 'mousedown', mxUtils.bind(this, function()
		{
			this.showTooltips = false;
			this.hideTooltip();
		}));

		mxEvent.addListener(document, 'mousemove', mxUtils.bind(this, function(evt)
		{
			var src = mxEvent.getSource(evt);
			
			while (src != null)
			{
				if (src == this.currentElt)
				{
					return;
				}
				
				src = src.parentNode;
			}
			
			this.hideTooltip();
		}));

		// Handles mouse leaving the window
		mxEvent.addListener(document, 'mouseout', mxUtils.bind(this, function(evt)
		{
			if (evt.toElement == null && evt.relatedTarget == null)
			{
				this.hideTooltip();
			}
		}));
	}
	
	this.init();
	
	// Pre-fetches tooltip image
	new Image().src = IMAGE_PATH + '/tooltip.png';
};

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.init = function()
{
	var dir = STENCIL_PATH;
	
	this.addGeneralPalette(true);
	this.addUmlPalette(false);
	this.addBpmnPalette(dir, false);
	this.addStencilPalette('flowchart', 'Flowchart', dir + '/flowchart.xml',
		';fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addStencilPalette('basic', mxResources.get('basic'), dir + '/basic.xml',
		';fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addStencilPalette('arrows', mxResources.get('arrows'), dir + '/arrows.xml',
		';fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addImagePalette('clipart', mxResources.get('clipart'), dir + '/clipart/', '_128x128.png',
		['Earth_globe', 'Empty_Folder', 'Full_Folder', 'Gear', 'Lock', 'Software', 'Virus', 'Email',
		 'Database', 'Router_Icon', 'iPad', 'iMac', 'Laptop', 'MacBook', 'Monitor_Tower', 'Printer',
		 'Server_Tower', 'Workstation', 'Firewall_02', 'Wireless_Router_N', 'Credit_Card',
		 'Piggy_Bank', 'Graph', 'Safe', 'Shopping_Cart', 'Suit1', 'Suit2', 'Suit3', 'Pilot1',
		 'Worker1', 'Soldier1', 'Doctor1', 'Tech1', 'Security1', 'Telesales1']);
};

/**
 * Specifies if tooltips should be visible. Default is true.
 */
Sidebar.prototype.enableTooltips = !mxClient.IS_TOUCH;

/**
 * Shifts the thumbnail by 1 px.
 */
Sidebar.prototype.shiftThumbs = mxClient.IS_SVG || document.documentMode == 8;

/**
 * Specifies the delay for the tooltip. Default is 16 px.
 */
Sidebar.prototype.tooltipBorder = 16;

/**
 * Specifies the delay for the tooltip. Default is 2 px.
 */
Sidebar.prototype.thumbBorder = 2;

/**
 * Specifies the delay for the tooltip. Default is 300 ms.
 */
Sidebar.prototype.tooltipDelay = 300;

/**
 * Specifies if edges should be used as templates if clicked. Default is true.
 */
Sidebar.prototype.installEdges = true;

/**
 * Specifies the URL of the gear image.
 */
Sidebar.prototype.gearImage = STENCIL_PATH + '/clipart/Gear_128x128.png';

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbWidth = 26;

/**
 * Specifies the height of the thumbnails.
 */
Sidebar.prototype.thumbHeight = 26;

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.showTooltip = function(elt, cells)
{
	if (this.enableTooltips && this.showTooltips)
	{
		if (this.currentElt != elt)
		{
			if (this.thread != null)
			{
				window.clearTimeout(this.thread);
				this.thread = null;
			}
			
			var show = mxUtils.bind(this, function()
			{
				// Workaround for off-screen text rendering in IE
				var old = mxText.prototype.getTableSize;
				
				if (this.graph.dialect != mxConstants.DIALECT_SVG)
				{
					mxText.prototype.getTableSize = function(table)
					{
						var oldParent = table.parentNode;
						
						document.body.appendChild(table);
						var size = new mxRectangle(0, 0, table.offsetWidth, table.offsetHeight);
						oldParent.appendChild(table);
						
						return size;
					};
				}
				
				// Lazy creation of the DOM nodes and graph instance
				if (this.tooltip == null)
				{
					this.tooltip = document.createElement('div');
					this.tooltip.className = 'geSidebarTooltip';
					document.body.appendChild(this.tooltip);
					
					this.graph2 = new Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
					this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);
					this.graph2.resetViewOnRootChange = false;
					this.graph2.foldingEnabled = false;
					this.graph2.autoScroll = false;
					this.graph2.setTooltips(false);
					this.graph2.setConnectable(false);
					this.graph2.setEnabled(false);
					
					this.tooltipImage = mxUtils.createImage(IMAGE_PATH + '/tooltip.png');
					this.tooltipImage.style.position = 'absolute';
					this.tooltipImage.style.width = '14px';
					this.tooltipImage.style.height = '27px';
					
					document.body.appendChild(this.tooltipImage);				
				}
				
				this.graph2.model.clear();
				this.graph2.addCells(cells);
				
				var bounds = this.graph2.getGraphBounds();
				var width = bounds.x + bounds.width + this.tooltipBorder;
				var height = bounds.y + bounds.height + this.tooltipBorder;
				
				if (mxClient.IS_QUIRKS)
				{
					width += 4;
					height += 4;
				}
				
				this.tooltip.style.display = 'block';
				this.tooltip.style.overflow = 'visible';
				this.tooltipImage.style.visibility = 'visible';
				this.tooltip.style.width = width + 'px';
				this.tooltip.style.height = height + 'px';
		
				var left = this.container.clientWidth + this.editorUi.splitSize + 3;
				var top = Math.max(0, (this.container.offsetTop + elt.offsetTop - this.container.scrollTop - height / 2 + 16));

				// Workaround for ignored position CSS style in IE9
				// (changes to relative without the following line)
				this.tooltip.style.position = 'absolute';
				this.tooltip.style.left = left + 'px';
				this.tooltip.style.top = top + 'px';
				this.tooltipImage.style.left = (left - 13) + 'px';
				this.tooltipImage.style.top = (top + height / 2 - 13) + 'px';
				
				mxText.prototype.getTableSize = old;
			});

			if (this.tooltip != null && this.tooltip.style.display != 'none')
			{
				show();
			}
			else
			{
				this.thread = window.setTimeout(show, this.tooltipDelay);
			}

			this.currentElt = elt;
		}
	}
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.hideTooltip = function()
{
	if (this.thread != null)
	{
		window.clearTimeout(this.thread);
		this.thread = null;
	}
	
	if (this.tooltip != null)
	{
		this.tooltip.style.display = 'none';
		this.tooltipImage.style.visibility = 'hidden';
		this.currentElt = null;
	}
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addGeneralPalette = function(expand)
{
	this.addPalette('general', mxResources.get('general'), expand || true, mxUtils.bind(this, function(content)
	{
		content.appendChild(this.createVertexTemplate('swimlane', 200, 200, 'Container'));
		content.appendChild(this.createVertexTemplate('swimlane;horizontal=0', 200, 200, 'Pool'));
	    content.appendChild(this.createVertexTemplate('text', 40, 26, 'Text'));
	    content.appendChild(this.createVertexTemplate('icon;image=' + this.gearImage, 60, 60, 'Image'));
	    content.appendChild(this.createVertexTemplate('label;image=' + this.gearImage, 140, 60, 'Label'));
	    content.appendChild(this.createVertexTemplate(null, 120, 60));
	    content.appendChild(this.createVertexTemplate('rounded=1', 120, 60));
	    content.appendChild(this.createVertexTemplate('ellipse', 80, 80));
	    content.appendChild(this.createVertexTemplate('ellipse;shape=doubleEllipse', 80, 80));
	    content.appendChild(this.createVertexTemplate('triangle', 60, 80));
	    content.appendChild(this.createVertexTemplate('rhombus', 80, 80));
	    content.appendChild(this.createVertexTemplate('shape=hexagon', 120, 80));
	    content.appendChild(this.createVertexTemplate('shape=actor;verticalLabelPosition=bottom;verticalAlign=top', 40, 60));
	    content.appendChild(this.createVertexTemplate('ellipse;shape=cloud', 120, 80));
	    content.appendChild(this.createVertexTemplate('shape=cylinder', 60, 80));
	    content.appendChild(this.createVertexTemplate('line', 160, 10));
	    content.appendChild(this.createVertexTemplate('line;direction=south', 10, 160));
	    content.appendChild(this.createVertexTemplate('shape=xor', 60, 80));
	    content.appendChild(this.createVertexTemplate('shape=or', 60, 80));
	    content.appendChild(this.createVertexTemplate('shape=step', 120, 80));
	    content.appendChild(this.createVertexTemplate('shape=tape', 120, 100));
	    content.appendChild(this.createVertexTemplate('shape=cube', 120, 80));
	    content.appendChild(this.createVertexTemplate('shape=note', 80, 100));
	    content.appendChild(this.createVertexTemplate('shape=folder', 120, 120));
	    content.appendChild(this.createVertexTemplate('shape=card', 60, 80));
	    content.appendChild(this.createVertexTemplate('shape=plus', 20, 20));

	    content.appendChild(this.createEdgeTemplate('edgeStyle=none;endArrow=none;', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=none', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=elbowEdgeStyle;elbow=horizontal', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=elbowEdgeStyle;elbow=vertical', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=entityRelationEdgeStyle', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=segmentEdgeStyle', 100, 100));
	    content.appendChild(this.createEdgeTemplate('edgeStyle=orthogonalEdgeStyle', 100, 100));
	    content.appendChild(this.createEdgeTemplate('shape=link', 100, 100));
	    content.appendChild(this.createEdgeTemplate('arrow', 100, 100));
	}));
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addUmlPalette = function(expand)
{
	this.addPalette('uml', 'UML', expand || false, mxUtils.bind(this, function(content)
	{
	    content.appendChild(this.createVertexTemplate('', 110, 50, 'Object'));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<b>Class</b></p>' +
				'<hr/><div style="height:2px;"></div><hr/>', new mxGeometry(0, 0, 140, 60),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 140, 60));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<b>Class</b></p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">+ field: Type</p><hr/>' +
				'<p style="margin:0px;margin-left:4px;">+ method(): Type</p>', new mxGeometry(0, 0, 160, 90),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 160, 90));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<i>&lt;&lt;Interface&gt;&gt;</i><br/><b>Interface</b></p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">+ field1: Type<br/>' +
				'+ field2: Type</p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">' +
				'+ method1(Type): Type<br/>' +
				'+ method2(Type, Type): Type</p>', new mxGeometry(0, 0, 190, 140),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 190, 140));

		var classCell = new mxCell('Module', new mxGeometry(0, 0, 120, 60),
	    	'shape=component;align=left;spacingLeft=36');
    	classCell.vertex = true;

    	content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 60));

	    var classCell = new mxCell('&lt;&lt;component&gt;&gt;<br/><b>Component</b>', new mxGeometry(0, 0, 180, 90),
	    	'overflow=fill;html=1');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
		classCell1.vertex = true;
		classCell1.connectable = false;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-30, 10);
		classCell.insert(classCell1);
	
		content.appendChild(this.createVertexTemplateFromCells([classCell], 180, 90));

	    var classCell = new mxCell('<p style="margin:0px;margin-top:6px;text-align:center;"><b>Component</b></p>' +
				'<hr/><p style="margin:0px;margin-left:8px;">+ Attribute1: Type<br/>+ Attribute2: Type</p>', new mxGeometry(0, 0, 180, 90),
	    	'verticalAlign=top;align=left;overflow=fill;html=1');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
		classCell1.vertex = true;
		classCell1.connectable = false;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-23, 3);
		classCell.insert(classCell1);

		content.appendChild(this.createVertexTemplateFromCells([classCell], 180, 90));

		content.appendChild(this.createVertexTemplate('shape=lollipop;direction=south;', 30, 10));

    	var cardCell = new mxCell('Block', new mxGeometry(0, 0, 180, 120),
    			'verticalAlign=top;align=left;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;');
    	cardCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([cardCell], 180, 120));

	    content.appendChild(this.createVertexTemplate('shape=folder;fontStyle=1;spacingTop=10;tabWidth=40;tabHeight=14;tabPosition=left;', 70, 50,
	    	'package'));

	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;text-decoration:underline;">' +
    			'<b>Object:Type</b></p><hr/>' +
				'<p style="margin:0px;margin-left:8px;">field1 = value1<br/>field2 = value2<br>field3 = value3</p>',
				new mxGeometry(0, 0, 160, 90),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 160, 90));

    	var tableCell = new mxCell('<table cellpadding="5" style="font-size:9pt;border:none;border-collapse:collapse;width:100%;">' +
    			'<tr><td colspan="2" style="border:1px solid gray;background:#e4e4e4;">Tablename</td></tr>' +
				'<tr><td style="border:1px solid gray;">PK</td><td style="border:1px solid gray;">uniqueId</td></tr>' +
				'<tr><td style="border:1px solid gray;">FK1</td><td style="border:1px solid gray;">foreignKey</td></tr>' +
				'<tr><td style="border:1px solid gray;"></td><td style="border:1px solid gray;">fieldname</td></tr>' +
				'</table>', new mxGeometry(0, 0, 180, 99), 'verticalAlign=top;align=left;overflow=fill;html=1');
    	tableCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([tableCell], 180, 99));
    	
    	content.appendChild(this.createVertexTemplate('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top', 40, 80, 'Actor'));
	    content.appendChild(this.createVertexTemplate('ellipse', 140, 70, 'Use Case'));

    	var cardCell = new mxCell('', new mxGeometry(0, 0, 30, 30),
    		'ellipse;shape=startState;fillColor=#000000;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(15, 70), false);
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
    	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 30, 30));
	    
    	var cardCell = new mxCell('Activity', new mxGeometry(0, 0, 120, 40),
    		'rounded=1;arcSize=40;fillColor=#ffffc0;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(60, 80), false);
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
    	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 120, 40));
    	
    	var cardCell = new mxCell('<div style="margin-top:8px;"><b>Composite State</b><hr/>Subtitle</div>', new mxGeometry(0, 0, 160, 60),
			'rounded=1;arcSize=40;overflow=fill;html=1;verticalAlign=top;fillColor=#ffffc0;strokeColor=#ff0000;');
		cardCell.vertex = true;
		
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(80, 100), false);
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
		
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 160, 60));
		
    	var cardCell = new mxCell('Condition', new mxGeometry(0, 0, 80, 40),
    		'rhombus;fillColor=#ffffc0;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc1 = new mxCell('no', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;align=left;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc1.geometry.setTerminalPoint(new mxPoint(120, 20), false);
		assoc1.geometry.relative = true;
		assoc1.geometry.x = -1;
		assoc1.edge = true;
		
		cardCell.insertEdge(assoc1, true);
    	
		var assoc2 = new mxCell('yes', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;align=left;verticalAlign=top;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(40, 80), false);
		assoc2.geometry.relative = true;
		assoc2.geometry.x = -1;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
		
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc1, assoc2], 80, 40));
	    
    	var cardCell = new mxCell('', new mxGeometry(0, 0, 200, 10),
			'shape=line;strokeWidth=6;strokeColor=#ff0000;');
		cardCell.vertex = true;
		
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(100, 50), false);
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 200, 10));

		content.appendChild(this.createVertexTemplate('ellipse;shape=endState;fillColor=#000000;strokeColor=#ff0000', 30, 30));
	    
    	var classCell1 = new mxCell(':Object', new mxGeometry(0, 0, 100, 50));
     	classCell1.vertex = true;
     	
     	var classCell2 = new mxCell('', new mxGeometry(40, 50, 20, 240), 'shape=line;direction=north;dashed=1');
     	classCell2.vertex = true;
     	
    	content.appendChild(this.createVertexTemplateFromCells([classCell1, classCell2], 100, 290));
    	
    	var classCell1 = new mxCell('', new mxGeometry(100, 0, 20, 70));
     	classCell1.vertex = true;

		var assoc1 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;verticalAlign=bottom;endArrow=block;');
		assoc1.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc1.edge = true;
		
		classCell1.insertEdge(assoc1, false);

    	content.appendChild(this.createVertexTemplateFromCells([classCell1, assoc1], 120, 70));
    	
     	var classCell1 = new mxCell('', new mxGeometry(100, 0, 20, 70));
     	classCell1.vertex = true;

		var assoc1 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;verticalAlign=bottom;endArrow=block;');
		assoc1.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc1.edge = true;
		
		classCell1.insertEdge(assoc1, false);
		
		var assoc2 = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;verticalAlign=bottom;dashed=1;endArrow=open;endSize=8;');
		assoc2.geometry.setTerminalPoint(new mxPoint(0, 70), false);
		assoc2.edge = true;
		
		classCell1.insertEdge(assoc2, true);
		
		var assoc3 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;align=left;endArrow=open;');
		assoc3.edge = true;
		
		classCell1.insertEdge(assoc3, true);
		classCell1.insertEdge(assoc3, false);
		
    	content.appendChild(this.createVertexTemplateFromCells([classCell1, assoc1, assoc2, assoc3], 120, 70));
    	
		var assoc = new mxCell('name', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=top;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.geometry.x = -1;
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('1', new mxGeometry(-1, 0, 0, 0), 'resizable=0;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=none;edgeStyle=orthogonalEdgeStyle;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('parent', new mxGeometry(-1, 0, 0, 0), 'resizable=0;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
		
    	var targetLabel = new mxCell('child', new mxGeometry(1, 0, 0, 0), 'resizable=0;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10');
    	targetLabel.geometry.relative = true;
    	targetLabel.setConnectable(false);
    	targetLabel.vertex = true;
    	assoc.insert(targetLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
    	
		var assoc = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.geometry.x = -1;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		
		var assoc = new mxCell('Relation', new mxGeometry(0, 0, 0, 0), 'endArrow=open;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('0..n', new mxGeometry(-1, 0, 0, 0), 'resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
		
    	var targetLabel = new mxCell('1', new mxGeometry(1, 0, 0, 0), 'resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10');
    	targetLabel.geometry.relative = true;
    	targetLabel.setConnectable(false);
    	targetLabel.vertex = true;
    	assoc.insert(targetLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		
		var assoc = new mxCell('Use', new mxGeometry(0, 0, 0, 0), 'endArrow=open;endSize=12;dashed=1');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		
		var assoc = new mxCell('Extends', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endSize=16;endFill=0;dashed=1');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=block;startArrow=block;endFill=1;startFill=1');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
	}));
};

/**
 * Adds the BPMN library to the sidebar.
 */
Sidebar.prototype.addBpmnPalette = function(dir, expand)
{
	this.addStencilPalette('bpmn', 'BPMN', dir + '/bpmn.xml',
		';fillColor=#ffffff;strokeColor=#000000;perimeter=ellipsePerimeter;',
		['Cancel', 'Error', 'Link', 'Message', 'Compensation', 'Multiple', 'Rule', 'Timer'],
		function(content)
		{
			content.appendChild(this.createVertexTemplate('swimlane;horizontal=0;', 300, 160, 'Pool'));
		
			var classCell = new mxCell('Process', new mxGeometry(0, 0, 140, 60),
		    	'rounded=1');
			classCell.vertex = true;
			var classCell1 = new mxCell('', new mxGeometry(1, 1, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;');
			classCell1.vertex = true;
			classCell1.geometry.relative = true;
			classCell1.geometry.offset = new mxPoint(-40, -15);
			classCell.insert(classCell1);
			
			content.appendChild(this.createVertexTemplateFromCells([classCell], 140, 60));
			
			var classCell = new mxCell('Process', new mxGeometry(0, 0, 140, 60),
		    	'rounded=1');
			classCell.vertex = true;
			var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 12, 12), 'shape=plus');
			classCell1.vertex = true;
			classCell1.connectable = false;
			classCell1.geometry.relative = true;
			classCell1.geometry.offset = new mxPoint(-6, -12);
			classCell.insert(classCell1);
			
			content.appendChild(this.createVertexTemplateFromCells([classCell], 140, 60));
			
			var classCell = new mxCell('Process', new mxGeometry(0, 0, 140, 60),
		    	'rounded=1');
			classCell.vertex = true;
			var classCell1 = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message');
			classCell1.vertex = true;
			classCell1.connectable = false;
			classCell1.geometry.relative = true;
			classCell1.geometry.offset = new mxPoint(5, 5);
			classCell.insert(classCell1);
			
			content.appendChild(this.createVertexTemplateFromCells([classCell], 140, 60));
			
		    var classCell = new mxCell('', new mxGeometry(0, 0, 60, 40), 'shape=message');
	    	classCell.vertex = true;
	
			content.appendChild(this.createEdgeTemplateFromCells([classCell], 60, 40));
	
			var assoc = new mxCell('Sequence', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;endSize=6');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
	
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
			
			var assoc = new mxCell('Default', new mxGeometry(0, 0, 0, 0), 'startArrow=dash;startSize=8;endArrow=block;endFill=1;endSize=6');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
			
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
			
			var assoc = new mxCell('Conditional', new mxGeometry(0, 0, 0, 0), 'startArrow=diamondThin;startFill=0;startSize=14;endArrow=block;endFill=1;endSize=6');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
			
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
			
			var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
	
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
	
			var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
			
	    	var sourceLabel = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message');
	    	sourceLabel.geometry.relative = true;
	    	sourceLabel.setConnectable(false);
	    	sourceLabel.vertex = true;
	    	sourceLabel.geometry.offset = new mxPoint(-10, -7);
	    	assoc.insert(sourceLabel);
	
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
			
			var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'shape=link');
			assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			assoc.edge = true;
	
			content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0));
		}, 0.5);
};

/**
 * Creates and returns the given title element.
 */
Sidebar.prototype.createTitle = function(label)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geTitle';
	mxUtils.write(elt, label);

	return elt;
};

/**
 * Creates a thumbnail for the given cells.
 */
Sidebar.prototype.createThumb = function(cells, width, height, parent)
{
	// Workaround for off-screen text rendering in IE
	var old = mxText.prototype.getTableSize;
	
	if (this.graph.dialect != mxConstants.DIALECT_SVG)
	{
		mxText.prototype.getTableSize = function(table)
		{
			var oldParent = table.parentNode;
			
			document.body.appendChild(table);
			var size = new mxRectangle(0, 0, table.offsetWidth, table.offsetHeight);
			oldParent.appendChild(table);
			
			return size;
		};
	}
	
	var prev = mxImageShape.prototype.preserveImageAspect;
	mxImageShape.prototype.preserveImageAspect = false;
	
	this.graph.view.rendering = false;
	this.graph.view.setScale(1);
	this.graph.addCells(cells);
	var bounds = this.graph.getGraphBounds();

	var corr = (this.shiftThumbs) ? this.thumbBorder + 1 : this.thumbBorder;
	var s = Math.min((width - 1) / (bounds.x + bounds.width + corr),
		(height - 1) / (bounds.y + bounds.height + corr));
	this.graph.view.setScale(s);
	this.graph.view.rendering = true;
	this.graph.refresh();
	mxImageShape.prototype.preserveImageAspect = prev;

	bounds = this.graph.getGraphBounds();
	var dx = Math.max(0, Math.floor((width - bounds.width) / 2));
	var dy = Math.max(0, Math.floor((height - bounds.height) / 2));
	
	var node = null;
	
	// For supporting HTML labels in IE9 standards mode the container is cloned instead
	if (this.graph.dialect == mxConstants.DIALECT_SVG && !mxClient.IS_IE)
	{
		node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
	}
	// Workaround for VML rendering in IE8 standards mode
	else if (document.documentMode == 8)
	{
		node = this.graph.container.cloneNode(false);
		node.innerHTML = this.graph.container.innerHTML;
	}
	else
	{
		node = this.graph.container.cloneNode(true);
	}
	
	this.graph.getModel().clear();
	
	// Outer dimension is (32, 32)
	var dd = (this.shiftThumbs) ? 2 : 3;
	node.style.position = 'relative';
	node.style.overflow = 'visible';
	node.style.cursor = 'pointer';
	node.style.left = (dx + dd) + 'px';
	node.style.top = (dy + dd) + 'px';
	node.style.width = width + 'px';
	node.style.height = height + 'px';
	
	parent.appendChild(node);
	mxText.prototype.getTableSize = old;
};

/**
 * Creates and returns a new palette item for the given image.
 */
Sidebar.prototype.createItem = function(cells)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	
	// Blocks default click action
	mxEvent.addListener(elt, 'click', function(evt)
	{
		mxEvent.consume(evt);
	});

	this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt);
	
	return elt;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createDropHandler = function(cells, allowSplit)
{
	return function(graph, evt, target, x, y)
	{
		cells = graph.getImportableCells(cells);
		
		if (cells.length > 0)
		{
			var validDropTarget = (target != null) ?
				graph.isValidDropTarget(target, cells, evt) : false;
			var select = null;
			
			if (target != null && !validDropTarget)
			{
				target = null;
			}
			
			// Splits the target edge or inserts into target group
			if (allowSplit && graph.isSplitEnabled() && graph.isSplitTarget(target, cells, evt))
			{
				graph.splitEdge(target, cells, null, x, y);
				select = cells;
			}
			else if (cells.length > 0)
			{
				select = graph.importCells(cells, x, y, target);
			}
			
			if (select != null && select.length > 0)
			{
				graph.scrollCellToVisible(select[0]);
				graph.setSelectionCells(select);
			}
		}
	};
};

/**
 * Creates and returns a preview element for the given width and height.
 */
Sidebar.prototype.createDragPreview = function(width, height)
{
	var elt = document.createElement('div');
	elt.style.border = '1px dashed black';
	elt.style.width = width + 'px';
	elt.style.height = height + 'px';
	
	return elt;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.createDragSource = function(elt, dropHandler, preview)
{
	var dragSource = mxUtils.makeDraggable(elt, this.editorUi.editor.graph, dropHandler,
		preview, 0, 0, this.editorUi.editor.graph.autoscroll, true, true);

	// Allows drop into cell only if target is a valid root
	dragSource.getDropTarget = function(graph, x, y)
	{
		var target = mxDragSource.prototype.getDropTarget.apply(this, arguments);
		
		if (!graph.isValidRoot(target))
		{
			target = null;
		}
		
		return target;
	};
	
	return dragSource;
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.addClickHandler = function(elt, ds)
{
	var graph = this.editorUi.editor.graph;
	var first = null;
	
	var md = (mxClient.IS_TOUCH) ? 'touchstart' : 'mousedown';
	mxEvent.addListener(elt, md, function(evt)
	{
		first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
	});
	
	var oldMouseUp = ds.mouseUp;
	ds.mouseUp = function(evt)
	{
		if (!mxEvent.isPopupTrigger(evt) && this.currentGraph == null && first != null)
		{
			var tol = graph.tolerance;
			
			if (Math.abs(first.x - mxEvent.getClientX(evt)) <= tol &&
				Math.abs(first.y - mxEvent.getClientY(evt)) <= tol)
			{
				var gs = graph.getGridSize();
				ds.drop(graph, evt, null, gs, gs);
			}
		}

		oldMouseUp.apply(this, arguments);
		first = null;
	};
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplate = function(style, width, height, value)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	
	return this.createVertexTemplateFromCells(cells, width, height);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromCells = function(cells, width, height)
{
	var elt = this.createItem(cells);
	var ds = this.createDragSource(elt, this.createDropHandler(cells, true), this.createDragPreview(width, height));
	this.addClickHandler(elt, ds);

	// Uses guides for vertices only if enabled in graph
	ds.isGuidesEnabled = mxUtils.bind(this, function()
	{
		return this.editorUi.editor.graph.graphHandler.guidesEnabled;
	});

	// Shows a tooltip with the rendered cell
	if (!touchStyle)
	{
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt)
		{
			this.showTooltip(elt, cells);
		}));
	}
	
	return elt;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplate = function(style, width, height, value)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].geometry.setTerminalPoint(new mxPoint(0, height), true);
	cells[0].geometry.setTerminalPoint(new mxPoint(width, 0), false);
	cells[0].edge = true;
	
	return this.createEdgeTemplateFromCells(cells, width, height);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplateFromCells = function(cells, width, height)
{
	var elt = this.createItem(cells);
	this.createDragSource(elt, this.createDropHandler(cells, false), this.createDragPreview(width, height));

	// Installs the default edge
	var graph = this.editorUi.editor.graph;
	mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
	{
		if (this.installEdges)
		{
			// Uses edge template for connect preview
			graph.connectionHandler.createEdgeState = function(me)
			{
	    		return graph.view.createState(cells[0]);
		    };
	
		    // Creates new connections from edge template
		    graph.connectionHandler.factoryMethod = function()
		    {
	    		return graph.cloneCells([cells[0]])[0];
		    };
		}
		
		// Highlights the entry for 200ms
		elt.style.backgroundColor = '#ffffff';
		
		window.setTimeout(function()
		{
			elt.style.backgroundColor = '';
		}, 200);
	    
	    mxEvent.consume(evt);
	}));

	// Shows a tooltip with the rendered cell
	if (!touchStyle)
	{
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt)
		{
			this.showTooltip(elt, cells);
		}));
	}
	
	return elt;
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPalette = function(id, title, expanded, onInit)
{
	var elt = this.createTitle(title);
	this.container.appendChild(elt);
	
	var div = document.createElement('div');
	div.className = 'geSidebar';
	
	if (expanded)
	{
		onInit(div);
		onInit = null;
	}
	else
	{
		div.style.display = 'none';
	}
	
    this.addFoldingHandler(elt, div, onInit);
	
	var outer = document.createElement('div');
    outer.appendChild(div);
    this.container.appendChild(outer);
    
    // Keeps references to the DOM nodes
    if (id != null)
    {
    	this.palettes[id] = [elt, outer];
    }
};

/**
 * Create the given title element.
 */
Sidebar.prototype.addFoldingHandler = function(title, content, funct)
{
	var initialized = false;

	title.style.backgroundImage = (content.style.display == 'none') ?
		'url(' + IMAGE_PATH + '/collapsed.gif)' : 'url(' + IMAGE_PATH + '/expanded.gif)';
	title.style.backgroundRepeat = 'no-repeat';
	title.style.backgroundPosition = '100% 50%';
	
	mxEvent.addListener(title, 'click', function(evt)
	{
		if (content.style.display == 'none')
		{
			if (!initialized)
			{
				initialized = true;
				
				if (funct != null)
				{
					funct(content);
				}
			}
			
			title.style.backgroundImage = 'url(' + IMAGE_PATH + '/expanded.gif)';
			content.style.display = 'block';
		}
		else
		{
			title.style.backgroundImage = 'url(' + IMAGE_PATH + '/collapsed.gif)';
			content.style.display = 'none';
		}
		
		mxEvent.consume(evt);
	});
};

/**
 * Removes the palette for the given ID.
 */
Sidebar.prototype.removePalette = function(id)
{
	var elts = this.palettes[id];
	
	if (elts != null)
	{
		this.palettes[id] = null;
		
		for (var i = 0; i < elts.length; i++)
		{
			this.container.removeChild(elts[i]);
		}
		
		return true;
	}
	
	return false;
};

/**
 * Adds the given image palette.
 */
Sidebar.prototype.addImagePalette = function(id, title, prefix, postfix, items)
{
	this.addPalette(id, title, false, mxUtils.bind(this, function(content)
    {
    	for (var i = 0; i < items.length; i++)
		{
			var icon = prefix + items[i] + postfix;
			content.appendChild(this.createVertexTemplate('image;image=' + icon, 80, 80, ''));
		}
    }));
};

/**
 * Adds the given stencil palette.
 */
Sidebar.prototype.addStencilPalette = function(id, title, stencilFile, style, ignore, onInit, scale)
{
	scale = (scale != null) ? scale : 1;
	
	this.addPalette(id, title, false, mxUtils.bind(this, function(content)
    {
		if (style == null)
		{
			style = '';
		}
		
		if (onInit != null)
		{
			onInit.call(this, content);
		}

		mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function(packageName, stencilName, displayName, w, h)
		{
			if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0)
			{
				content.appendChild(this.createVertexTemplate('shape=' + packageName + stencilName.toLowerCase() + style,
					Math.round(w * scale), Math.round(h * scale), ''));
			}
		}), true);
    }));
};
