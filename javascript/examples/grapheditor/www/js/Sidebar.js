/**
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
	this.graph.cellRenderer.antiAlias = false;
	this.graph.resetViewOnRootChange = false;
	this.graph.foldingEnabled = false;
	this.graph.setConnectable(false);
	this.graph.autoScroll = false;
	this.graph.setTooltips(false);
	this.graph.setEnabled(false);

	// Container must be in the DOM for correct HTML rendering
	this.graph.container.style.visibility = 'hidden';
	this.graph.container.style.position = 'absolute';
	document.body.appendChild(this.graph.container);

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'MSPointerUp' : 'mouseup', mxUtils.bind(this, function()
	{
		this.showTooltips = true;
	}));

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'MSPointerDown' : 'mousedown', mxUtils.bind(this, function()
	{
		this.showTooltips = false;
		this.hideTooltip();
	}));

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'MSPointerMove' : 'mousemove', mxUtils.bind(this, function(evt)
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
	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'MSPointerOut' : 'mouseout', mxUtils.bind(this, function(evt)
	{
		if (evt.toElement == null && evt.relatedTarget == null)
		{
			this.hideTooltip();
		}
	}));

	// Enables tooltips after scroll
	mxEvent.addListener(container, 'scroll', mxUtils.bind(this, function()
	{
		this.showTooltips = true;
	}));
	
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
	this.addConnectionPalette(false);
	this.addAdvancedPalette(true);
	this.addStencilPalette('basic', mxResources.get('basic'), dir + '/basic.xml',
		';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addStencilPalette('arrows', mxResources.get('arrows'), dir + '/arrows.xml',
		';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addUmlPalette(false);
	this.addBpmnPalette(dir, false);
	this.addStencilPalette('flowchart', 'Flowchart', dir + '/flowchart.xml',
		';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
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
Sidebar.prototype.enableTooltips = true;

/**
 * Specifies the delay for the tooltip. Default is 16 px.
 */
Sidebar.prototype.tooltipBorder = 16;

/**
 * Specifies the delay for the tooltip. Default is 300 ms.
 */
Sidebar.prototype.tooltipDelay = 300;

/**
 * Specifies the URL of the gear image.
 */
Sidebar.prototype.gearImage = STENCIL_PATH + '/clipart/Gear_128x128.png';

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbWidth = 36;

/**
 * Specifies the height of the thumbnails.
 */
Sidebar.prototype.thumbHeight = 36;

/**
 * Specifies the padding for the thumbnails. Default is 3.
 */
Sidebar.prototype.thumbPadding = (document.documentMode >= 5) ? 0 : 1;

/**
 * Specifies the delay for the tooltip. Default is 3 px.
 */
Sidebar.prototype.thumbBorder = 2;

/**
 * Specifies the size of the sidebar titles.
 */
Sidebar.prototype.sidebarTitleSize = 9;

/**
 * Specifies if titles in the sidebar should be enabled.
 */
Sidebar.prototype.sidebarTitles = false;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.tooltipTitles = true;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipWidth = 400;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipHeight = 400;

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.showTooltip = function(elt, cells, w, h, title, showLabel, dx, dy)
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
				// Lazy creation of the DOM nodes and graph instance
				if (this.tooltip == null)
				{
					this.tooltip = document.createElement('div');
					this.tooltip.className = 'geSidebarTooltip';
					document.body.appendChild(this.tooltip);
					
					this.graph2 = new Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
					this.graph2.resetViewOnRootChange = false;
					this.graph2.foldingEnabled = false;
					this.graph2.autoScroll = false;
					this.graph2.setTooltips(false);
					this.graph2.setConnectable(false);
					this.graph2.setEnabled(false);
					
					if (!mxClient.IS_SVG)
					{
						this.graph2.view.canvas.style.position = 'relative';
					}
					
					this.tooltipImage = mxUtils.createImage(IMAGE_PATH + '/tooltip.png');
					this.tooltipImage.className = 'geSidebarTooltipImage';
					this.tooltipImage.style.position = 'absolute';
					this.tooltipImage.style.width = '14px';
					this.tooltipImage.style.height = '27px';
					
					document.body.appendChild(this.tooltipImage);
				}
				
				this.graph2.model.clear();
				this.graph2.view.setTranslate(this.tooltipBorder + dx, this.tooltipBorder + dy);

				if (w > this.maxTooltipWidth || h > this.maxTooltipHeight)
				{
					this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
				}
				else
				{
					this.graph2.view.scale = 1;
				}
				
				this.tooltip.style.display = 'block';
				this.graph2.labelsVisible = (showLabel == null || showLabel);
				this.graph2.addCells(cells);
				
				var bounds = this.graph2.getGraphBounds();
				var width = bounds.width + 2 * this.tooltipBorder;
				var height = bounds.height + 2 * this.tooltipBorder;
				
				if (mxClient.IS_QUIRKS)
				{
					width += 4;
					height += 4;
					this.tooltip.style.overflow = 'hidden';
				}
				else
				{
					this.tooltip.style.overflow = 'visible';
				}

				this.tooltipImage.style.visibility = 'visible';
				this.tooltip.style.width = width + 'px';
				
				// Adds title for entry
				if (this.tooltipTitles && title != null && title.length > 0)
				{
					if (this.tooltipTitle == null)
					{
						this.tooltipTitle = document.createElement('div');
						this.tooltipTitle.style.borderTop = '1px solid gray';
						this.tooltipTitle.style.textAlign = 'center';
						this.tooltipTitle.style.width = '100%';
						
						// Oversize titles are cut-off currently. Should make tooltip wider later.
						this.tooltipTitle.style.overflow = 'hidden';
						
						if (mxClient.IS_SVG)
						{
							this.tooltipTitle.style.paddingTop = '2px';
						}
						else
						{
							this.tooltipTitle.style.position = 'absolute';
							this.tooltipTitle.style.paddingTop = '6px';							
						}

						this.tooltip.appendChild(this.tooltipTitle);
					}
					else
					{
						this.tooltipTitle.innerHTML = '';
					}
					
					this.tooltipTitle.style.display = '';
					mxUtils.write(this.tooltipTitle, title);
					
					var ddy = this.tooltipTitle.offsetHeight + 10;
					height += ddy;
					
					if (mxClient.IS_SVG)
					{
						this.tooltipTitle.style.marginTop = (-ddy) + 'px';
					}
					else
					{
						height -= 6;
						this.tooltipTitle.style.top = (height - ddy) + 'px';	
					}
				}
				else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null)
				{
					this.tooltipTitle.style.display = 'none';
				}
				
				this.tooltip.style.height = height + 'px';
				var x0 = -Math.min(0, Math.round(bounds.x - this.tooltipBorder));
				var y0 = -Math.min(0, Math.round(bounds.y - this.tooltipBorder));

				var left = this.container.clientWidth + this.editorUi.splitSize + 3;
				var top = Math.max(0, (this.container.offsetTop + elt.offsetTop - this.container.scrollTop - height / 2 + 16));
				
				if (mxClient.IS_SVG)
				{
					if (x0 != 0 || y0 != 0)
					{
						this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
					}
					else
					{
						this.graph2.view.canvas.removeAttribute('transform');
					}
				}
				else
				{
					this.graph2.view.drawPane.style.left = x0 + 'px';
					this.graph2.view.drawPane.style.top = y0 + 'px';
				}
		
				// Workaround for ignored position CSS style in IE9
				// (changes to relative without the following line)
				this.tooltip.style.position = 'absolute';
				this.tooltip.style.left = left + 'px';
				this.tooltip.style.top = top + 'px';
				this.tooltipImage.style.left = (left - 13) + 'px';
				this.tooltipImage.style.top = (top + height / 2 - 13) + 'px';
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
	// Rearranged based on usage data from
	// https://s3-eu-west-1.amazonaws.com/uploads-eu.hipchat.com/38308/267398/LpNxVqkMjKH61jP/shapefreq12hours.txt
	this.addPalette('general', mxResources.get('general'), (expand != null) ? expand : true, mxUtils.bind(this, function(content)
	{
		content.appendChild(this.createVertexTemplate('whiteSpace=wrap;html=1;', 120, 60, '', 'Rectangle', true));
	    content.appendChild(this.createVertexTemplate('rounded=1;whiteSpace=wrap;html=1;', 120, 60, '', 'Rounded Rectangle', true));
	    content.appendChild(this.createVertexTemplate('ellipse;whiteSpace=wrap;html=1;', 80, 80, '', 'Circle', true));
	    // Explicit strokecolor/fillcolor=none is a workaround to maintain transparent background regardless of current style
	    content.appendChild(this.createVertexTemplate('text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;overflow=hidden;',
	    		60, 30, 'Text', 'Text', true));
	    
	    content.appendChild(this.createVertexTemplate('shape=ext;double=1;whiteSpace=wrap;html=1;', 120, 60, '', 'Double Rectangle', true));
	    content.appendChild(this.createVertexTemplate('shape=ext;double=1;rounded=1;whiteSpace=wrap;html=1;', 120, 60, '', 'Double Rounded Rectangle', true));
	    content.appendChild(this.createVertexTemplate('ellipse;shape=doubleEllipse;whiteSpace=wrap;html=1;', 80, 80, '', 'Double Ellipse', true));
	    content.appendChild(this.createVertexTemplate('rhombus;whiteSpace=wrap;html=1;', 80, 80, '', 'Rhombus', true));

	    content.appendChild(this.createVertexTemplate('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;', 30, 60, '', 'Actor', true));
	    content.appendChild(this.createVertexTemplate('shape=curlyBracket;whiteSpace=wrap;html=1;rounded=1;', 20, 120, '', 'Curly Bracket', true));
	    content.appendChild(this.createVertexTemplate('line;html=1;', 160, 10, '', 'Horizontal Line', true));
	    content.appendChild(this.createVertexTemplate('line;direction=south;html=1;', 10, 160, '', 'Vertical Line', true));

	    content.appendChild(this.createVertexTemplate('shape=parallelogram;whiteSpace=wrap;html=1;', 120, 60, '', 'Parallelogram', true));
	    content.appendChild(this.createVertexTemplate('triangle;whiteSpace=wrap;html=1;', 60, 80, '', 'Triangle', true));
	    content.appendChild(this.createVertexTemplate('shape=cylinder;whiteSpace=wrap;html=1;', 60, 80, '', 'Cylinder', true));
	    content.appendChild(this.createVertexTemplate('shape=hexagon;perimeter=hexagonPerimeter;whiteSpace=wrap;html=1;', 120, 80, '', 'Hexagon', true));

	    content.appendChild(this.createVertexTemplate('shape=process;whiteSpace=wrap;html=1;', 120, 60, '', 'Process', true));
	    content.appendChild(this.createVertexTemplate('ellipse;shape=cloud;whiteSpace=wrap;html=1;', 120, 80, '', 'Cloud', true));
	    content.appendChild(this.createVertexTemplate('shape=document;whiteSpace=wrap;html=1;', 120, 80, '', 'Document', true));
	    content.appendChild(this.createVertexTemplate('shape=internalStorage;whiteSpace=wrap;html=1;', 80, 80, '', 'Internal Storage', true));

	    content.appendChild(this.createVertexTemplate('shape=cube;whiteSpace=wrap;html=1;', 120, 80, '', 'Cube', true));
	    content.appendChild(this.createVertexTemplate('shape=step;whiteSpace=wrap;html=1;', 120, 80, '', 'Step', true));
	    content.appendChild(this.createVertexTemplate('shape=trapezoid;whiteSpace=wrap;html=1;', 120, 60, '', 'Trapezoid', true));
	    content.appendChild(this.createVertexTemplate('shape=tape;whiteSpace=wrap;html=1;', 120, 100, '', 'Tape', true));

	    content.appendChild(this.createVertexTemplate('shape=note;whiteSpace=wrap;html=1;', 80, 100, '', 'Note', true));
	    content.appendChild(this.createVertexTemplate('shape=folder;whiteSpace=wrap;html=1;', 120, 120, '', 'Folder', true));
	    content.appendChild(this.createVertexTemplate('shape=message;whiteSpace=wrap;html=1;', 60, 40, '', 'Message', true));
	    content.appendChild(this.createVertexTemplate('shape=card;whiteSpace=wrap;html=1;', 80, 100, '', 'Card', true));

	    content.appendChild(this.createVertexTemplate('shape=singleArrow;direction=west;whiteSpace=wrap;html=1;', 100, 60, '', 'Arrow Left', true));
	    content.appendChild(this.createVertexTemplate('shape=singleArrow;whiteSpace=wrap;html=1;', 100, 60, '', 'Arrow Right', true));
	    content.appendChild(this.createVertexTemplate('shape=singleArrow;direction=north;whiteSpace=wrap;html=1;', 60, 100, '', 'Arrow Up', true));
	    content.appendChild(this.createVertexTemplate('shape=singleArrow;direction=south;whiteSpace=wrap;html=1;', 60, 100, '', 'Arrow Down', true));
	}));
};

/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.addConnectionPalette = function(dir, expand)
{
	this.addPalette('connections', mxResources.get('connection'), (expand != null) ? expand : false, mxUtils.bind(this, function(content)
	{
		this.addConnectionShapes(dir, content);
	}));
};

/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.addConnectionShapes = function(dir, content)
{
    content.appendChild(this.createEdgeTemplate('endArrow=none;html=1;', 100, 100, '', 'Line', true));
    content.appendChild(this.createEdgeTemplate('endArrow=none;dashed=1;html=1;', 100, 100, '', 'Dashed Line', true));
    content.appendChild(this.createEdgeTemplate('endArrow=none;html=1;dashed=1;dashPattern=1 4', 100, 100, '', 'Dotted Line', true));
    content.appendChild(this.createEdgeTemplate('endArrow=classic;html=1;', 100, 100, '', 'Connection', true));

	var cells = [new mxCell('', new mxGeometry(0, 0, 100, 100), 'curved=1;endArrow=classic;html=1;')];
	cells[0].geometry.setTerminalPoint(new mxPoint(0, 100), true);
	cells[0].geometry.setTerminalPoint(new mxPoint(100, 0), false);
	cells[0].geometry.points = [new mxPoint(100, 100), new mxPoint(0, 0)];
	cells[0].geometry.relative = true;
	cells[0].edge = true;
    content.appendChild(this.createEdgeTemplateFromCells(cells, 100, 100, 'Curve', true));
    
    content.appendChild(this.createEdgeTemplate('edgeStyle=elbowEdgeStyle;elbow=horizontal;endArrow=classic;html=1;', 100, 100, '', 'Horizontal Elbow', true));
    content.appendChild(this.createEdgeTemplate('edgeStyle=elbowEdgeStyle;elbow=vertical;endArrow=classic;html=1;', 100, 100, '', 'Vertical Elbow', true));
    content.appendChild(this.createEdgeTemplate('edgeStyle=entityRelationEdgeStyle;endArrow=classic;html=1;', 100, 100, '', 'Entity Relation', true));
    content.appendChild(this.createEdgeTemplate('edgeStyle=segmentEdgeStyle;endArrow=classic;html=1;', 100, 100, '', 'Manual Line', true));

	var cells = [new mxCell('', new mxGeometry(0, 0, 100, 100), 'edgeStyle=orthogonalEdgeStyle;endArrow=classic;html=1;')];
	cells[0].geometry.setTerminalPoint(new mxPoint(0, 100), true);
	cells[0].geometry.setTerminalPoint(new mxPoint(100, 0), false);
	cells[0].geometry.points = [new mxPoint(30, 100), new mxPoint(30, 50), new mxPoint(70, 50), new mxPoint(70, 0)];
	cells[0].geometry.relative = true;
	cells[0].edge = true;
	
	content.appendChild(this.createEdgeTemplateFromCells(cells, 100, 100, 'Automatic Line', true));
    
    content.appendChild(this.createEdgeTemplate('shape=link;html=1;', 100, 100, '', 'Link', true));
    content.appendChild(this.createEdgeTemplate('arrow;html=1;', 100, 100, '', 'Arrow', true));
};

/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.addAdvancedPalette = function(dir, expand)
{
	this.addPalette('advanced', mxResources.get('advanced'), (expand != null) ? expand : false, mxUtils.bind(this, function(content)
	{
		this.addAdvancedShapes(dir, content);
	}));
};

/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.addAdvancedShapes = function(dir, content)
{
    content.appendChild(this.createVertexTemplate('text;html=1;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;', 190, 120,
    	'<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>', 'Textbox', true));
    content.appendChild(this.createVertexTemplate('text;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;', 100, 80,
	    	'<ul><li>Value 1</li><li>Value 2</li><li>Value 3</li></ul>', 'Unordered list', true));
    content.appendChild(this.createVertexTemplate('text;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;', 100, 80,
        	'<ol><li>Value 1</li><li>Value 2</li><li>Value 3</li></ol>', 'Ordered list', true));
	content.appendChild(this.createVertexTemplate('text;html=1;strokeColor=#c0c0c0;overflow=fill;', 180, 180,
        	'<table border="0" width="100%" height="100%" style="width:100%;height:100%;border-collapse:collapse;">' +
        	'<tr><td align="center">Value 1</td><td align="center">Value 2</td><td align="center">Value 3</td></tr>' +
        	'<tr><td align="center">Value 4</td><td align="center">Value 5</td><td align="center">Value 6</td></tr>' +
        	'<tr><td align="center">Value 7</td><td align="center">Value 8</td><td align="center">Value 9</td></tr></table>', 'Table 1', true));
    
    content.appendChild(this.createVertexTemplate('text;html=1;overflow=fill;', 180, 180,
        	'<table border="1" width="100%" height="100%" style="width:100%;height:100%;border-collapse:collapse;">' +
        	'<tr><td align="center">Value 1</td><td align="center">Value 2</td><td align="center">Value 3</td></tr>' +
        	'<tr><td align="center">Value 4</td><td align="center">Value 5</td><td align="center">Value 6</td></tr>' +
        	'<tr><td align="center">Value 7</td><td align="center">Value 8</td><td align="center">Value 9</td></tr></table>', 'Table 2', true));
    content.appendChild(this.createVertexTemplate('text;html=1;overflow=fill;', 160, 180,
        	'<table border="1" width="100%" height="100%" cellpadding="4" style="width:100%;height:100%;border-collapse:collapse;">' +
        	'<tr><th align="center"><b>Title</b></th></tr>' +
        	'<tr><td align="center">Section 1.1\nSection 1.2\nSection 1.3</td></tr>' +
        	'<tr><td align="center">Section 2.1\nSection 2.2\nSection 2.3</td></tr></table>', 'Table 3', true));
    
    // For fun: Bootstrap template, Problem: Text flow in jumbotron paragraph
    /*content.appendChild(this.createVertexTemplate('text;html=1;overflow=fill;', 100, 100,
        	'<html><head><link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"><link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">' +
        	'</head><body><div class="jumbotron"><div class="container"><h1>Bootstrap starter template</h1>' +
        	'<p>This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.</p>' +
        	'<p><a class="btn btn-primary btn-lg" role="button">Learn more &raquo;</a></p></div></div>' +
        	'<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script><script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script></body></html>', 'IFrame', true));*/
    
    var linkCell = new mxCell('Link', new mxGeometry(0, 0, 60, 40), 'text;html=1;whiteSpace=wrap;align=center;verticalAlign=middle;fontColor=#0000EE;fontStyle=4;');
    linkCell.vertex = true;
    this.graph.setLinkForCell(linkCell, 'https://www.draw.io');
	content.appendChild(this.createVertexTemplateFromCells([linkCell], 60, 40, 'Link', true));
    content.appendChild(this.createVertexTemplate('shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=1;aspect=fixed;image=' + this.gearImage, 52, 61, '', 'Fixed Image', false));

    content.appendChild(this.createVertexTemplate('shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=' + this.gearImage, 50, 60, '', 'Stretched Image', false));
	content.appendChild(this.createVertexTemplate('icon;html=1;image=' + this.gearImage, 60, 60, 'Icon', 'Icon', false));
	content.appendChild(this.createVertexTemplate('whiteSpace=wrap;html=1;label;image=' + this.gearImage, 140, 60, 'Label', 'Label', true));
    content.appendChild(this.createVertexTemplate('shape=xor;whiteSpace=wrap;html=1;', 60, 80, '', 'Exclusive Or', true));

    content.appendChild(this.createVertexTemplate('shape=or;whiteSpace=wrap;html=1;', 60, 80, '', 'Or', true));
    content.appendChild(this.createVertexTemplate('shape=dataStorage;whiteSpace=wrap;html=1;', 100, 80, '', 'Data Storage', true));    
    content.appendChild(this.createVertexTemplate('shape=tapeData;whiteSpace=wrap;html=1;perimeter=ellipsePerimeter;', 80, 80, '', 'Tape Data', true));
    content.appendChild(this.createVertexTemplate('shape=manualInput;whiteSpace=wrap;html=1;', 80, 80, '', 'Manual Input', true));

    content.appendChild(this.createVertexTemplate('shape=loopLimit;whiteSpace=wrap;html=1;', 100, 80, '', 'Loop Limit', true));
    content.appendChild(this.createVertexTemplate('shape=offPageConnector;whiteSpace=wrap;html=1;', 80, 80, '', 'Off Page Connector', true));
    content.appendChild(this.createVertexTemplate('shape=delay;whiteSpace=wrap;html=1;', 80, 40, '', 'Delay', true));
    content.appendChild(this.createVertexTemplate('shape=display;whiteSpace=wrap;html=1;', 80, 40, '', 'Display', true));
    
    content.appendChild(this.createVertexTemplate('shape=doubleArrow;whiteSpace=wrap;html=1;', 100, 60, '', 'Double Arrow', true));
    content.appendChild(this.createVertexTemplate('shape=doubleArrow;direction=south;whiteSpace=wrap;html=1;', 60, 100, '', 'Double Arrow Vertical', true));
    content.appendChild(this.createVertexTemplate('shape=actor;whiteSpace=wrap;html=1;', 40, 60, '', 'User', true));
    content.appendChild(this.createVertexTemplate('shape=cross;whiteSpace=wrap;html=1;', 80, 80, '', 'Cross', true));

    content.appendChild(this.createVertexTemplate('shape=corner;whiteSpace=wrap;html=1;', 80, 80, '', 'Corner', true));
    content.appendChild(this.createVertexTemplate('shape=tee;whiteSpace=wrap;html=1;', 80, 80, '', 'Tee', true));
    content.appendChild(this.createVertexTemplate('shape=datastore;whiteSpace=wrap;html=1;', 60, 60, '', 'Data Store', true));
    content.appendChild(this.createVertexTemplate('shape=switch;whiteSpace=wrap;html=1;', 60, 60, '', 'Switch', true));
    
    content.appendChild(this.createVertexTemplate('swimlane;whiteSpace=wrap;html=1;', 200, 200, 'Container', 'Container', true));
	content.appendChild(this.createVertexTemplate('swimlane;swimlaneLine=0;whiteSpace=wrap;html=1;', 200, 200, 'Container', 'Container w/o Separator', true));
	content.appendChild(this.createVertexTemplate('swimlane;swimlaneFillColor=#ffffff;whiteSpace=wrap;html=1;', 200, 200, 'Container', 'Filled Container', true));
	content.appendChild(this.createVertexTemplate('swimlane;swimlaneLine=0;swimlaneFillColor=#ffffff;whiteSpace=wrap;html=1;', 200, 200, 'Container', 'Filled Container w/o Separator', true));
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addUmlPalette = function(expand)
{
	this.addPalette('uml', 'UML', expand || false, mxUtils.bind(this, function(content)
	{
	    content.appendChild(this.createVertexTemplate('html=1;', 110, 50, 'Object', 'Object', true));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<b>Class</b></p>' +
				'<hr/><div style="height:2px;"></div><hr/>', new mxGeometry(0, 0, 140, 60),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 140, 60, 'Class 1', true));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<b>Class</b></p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">+ field: Type</p><hr/>' +
				'<p style="margin:0px;margin-left:4px;">+ method(): Type</p>', new mxGeometry(0, 0, 160, 90),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 160, 90, 'Class 2', true));
    	
	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
    			'<i>&lt;&lt;Interface&gt;&gt;</i><br/><b>Interface</b></p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">+ field1: Type<br/>' +
				'+ field2: Type</p>' +
				'<hr/><p style="margin:0px;margin-left:4px;">' +
				'+ method1(Type): Type<br/>' +
				'+ method2(Type, Type): Type</p>', new mxGeometry(0, 0, 190, 140),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 190, 140, 'Interface', true));

		var classCell = new mxCell('Module', new mxGeometry(0, 0, 120, 60),
	    	'shape=component;align=left;spacingLeft=36');
    	classCell.vertex = true;

    	content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 60, 'Module', true));

		var classCell = new mxCell('&lt;&lt;component&gt;&gt;<br/><b>Component</b>', new mxGeometry(0, 0, 180, 90), 'overflow=fill;html=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-27, 7);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 180, 90, 'Component', true));

		var classCell = new mxCell('<p style="margin:0px;margin-top:6px;text-align:center;"><b>Component</b></p>' +
				'<hr/><p style="margin:0px;margin-left:8px;">+ Attribute1: Type<br/>+ Attribute2: Type</p>', new mxGeometry(0, 0, 180, 90),
				'align=left;overflow=fill;html=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;html=1;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-23, 3);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 180, 90, 'Component with Attributes', true));

    	var cardCell = new mxCell('Block', new mxGeometry(0, 0, 180, 120),
    			'verticalAlign=top;align=left;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;');
    	cardCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([cardCell], 180, 120, 'Block', true));

	    content.appendChild(this.createVertexTemplate('shape=folder;fontStyle=1;spacingTop=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;', 70, 50,
	    	'package', 'Package', true));

	    var classCell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;text-decoration:underline;">' +
    			'<b>Object:Type</b></p><hr/>' +
				'<p style="margin:0px;margin-left:8px;">field1 = value1<br/>field2 = value2<br>field3 = value3</p>',
				new mxGeometry(0, 0, 160, 90),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;');
    	classCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([classCell], 160, 90, 'Object', true));
    	
		content.appendChild(this.createVertexTemplate('shape=lollipop;direction=south;html=1;', 30, 10, '', 'Provided Interface', true));
		content.appendChild(this.createVertexTemplate('shape=requires;direction=north;html=1;', 30, 20, '', 'Required Interface', true));
		
    	var tableCell = new mxCell('<div style="box-sizing:border-box;width:100%;background:#e4e4e4;margin:1px;padding:2px;">Tablename</div><table style="width:100%;">' +
				'<tr><td>PK</td><td style="padding:2px;">uniqueId</td></tr>' +
				'<tr><td>FK1</td><td style="padding:2px;">foreignKey</td></tr>' +
				'<tr><td></td><td style="padding:2px;">fieldname</td></tr>' +
				'</table>', new mxGeometry(0, 0, 180, 90), 'verticalAlign=top;align=left;overflow=fill;html=1;');
    	tableCell.vertex = true;
    	content.appendChild(this.createVertexTemplateFromCells([tableCell], 180, 90, 'Entity', true));

    	content.appendChild(this.createVertexTemplate('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;', 40, 80, 'Actor', 'Actor', false));
	    content.appendChild(this.createVertexTemplate('ellipse;whiteSpace=wrap;html=1;', 140, 70, 'Use Case', 'Use Case', true));

    	var cardCell = new mxCell('', new mxGeometry(0, 0, 30, 30),
    		'ellipse;html=1;shape=startState;fillColor=#000000;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(15, 80), false);
		assoc2.geometry.relative = true;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
    	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 30, 90, 'Start', true));
	    
    	var cardCell = new mxCell('Activity', new mxGeometry(0, 0, 120, 40),
    		'rounded=1;whiteSpace=wrap;html=1;arcSize=40;fillColor=#ffffc0;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(60, 80), false);
		assoc2.geometry.relative = true;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
    	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 120, 90, 'Activity', true));
    	
    	var cardCell = new mxCell('<div style="margin-top:8px;"><b>Composite State</b><hr/>Subtitle</div>', new mxGeometry(0, 0, 160, 60),
			'rounded=1;arcSize=40;overflow=fill;whiteSpace=wrap;html=1;verticalAlign=top;fillColor=#ffffc0;strokeColor=#ff0000;');
		cardCell.vertex = true;
		
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(80, 100), false);
		assoc2.geometry.relative = true;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
		
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 160, 110, 'Composite State', true));
		
    	var cardCell = new mxCell('Condition', new mxGeometry(0, 0, 80, 40),
    		'rhombus;whiteSpace=wrap;html=1;fillColor=#ffffc0;strokeColor=#ff0000;');
    	cardCell.vertex = true;
    	
		var assoc1 = new mxCell('no', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;align=left;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc1.geometry.setTerminalPoint(new mxPoint(120, 20), false);
		assoc1.geometry.relative = true;
		assoc1.geometry.x = -1;
		assoc1.edge = true;
		
		cardCell.insertEdge(assoc1, true);
    	
		var assoc2 = new mxCell('yes', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;align=left;verticalAlign=top;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(40, 80), false);
		assoc2.geometry.relative = true;
		assoc2.geometry.x = -1;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
		
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc1, assoc2], 120, 90, 'Condition', true));
	    
    	var cardCell = new mxCell('', new mxGeometry(0, 0, 200, 10),
			'shape=line;html=1;strokeWidth=6;strokeColor=#ff0000;');
		cardCell.vertex = true;
		
		var assoc2 = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=horizontal;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
		assoc2.geometry.setTerminalPoint(new mxPoint(100, 50), false);
		assoc2.geometry.relative = true;
		assoc2.edge = true;
		
		cardCell.insertEdge(assoc2, true);
	
		content.appendChild(this.createVertexTemplateFromCells([cardCell, assoc2], 200, 60, 'Fork/Join', true));

		content.appendChild(this.createVertexTemplate('ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#ff0000', 30, 30, '', 'End', true));

		var umlLifeline = new mxCell(':Object', new mxGeometry(0, 0, 100, 300), 'shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;');
		umlLifeline.vertex = true;
     	
    	content.appendChild(this.createVertexTemplateFromCells([umlLifeline], 100, 300, 'Lifeline', true));
    	
    	var classCell1 = new mxCell('', new mxGeometry(100, 0, 20, 70), 'html=1;');
     	classCell1.vertex = true;

		var assoc1 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;html=1;verticalAlign=bottom;endArrow=block;');
		assoc1.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc1.geometry.relative = true;
		assoc1.edge = true;
		
		classCell1.insertEdge(assoc1, false);

    	content.appendChild(this.createVertexTemplateFromCells([classCell1, assoc1], 120, 70, 'Invocation', true));
    	
     	var classCell1 = new mxCell('', new mxGeometry(100, 0, 20, 70), 'html=1;');
     	classCell1.vertex = true;

		var assoc1 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;html=1;verticalAlign=bottom;endArrow=block;');
		assoc1.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc1.geometry.relative = true;
		assoc1.edge = true;
		
		classCell1.insertEdge(assoc1, false);
		
		var assoc2 = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;html=1;verticalAlign=bottom;dashed=1;endArrow=open;endSize=8;');
		assoc2.geometry.setTerminalPoint(new mxPoint(0, 70), false);
		assoc2.geometry.relative = true;
		assoc2.edge = true;
		
		classCell1.insertEdge(assoc2, true);
		
		var assoc3 = new mxCell('invoke', new mxGeometry(0, 0, 0, 0), 'edgeStyle=elbowEdgeStyle;elbow=vertical;html=1;align=left;endArrow=open;');
		assoc3.geometry.relative = true;
		assoc3.edge = true;
		
		classCell1.insertEdge(assoc3, true);
		classCell1.insertEdge(assoc3, false);
		
    	content.appendChild(this.createVertexTemplateFromCells([classCell1, assoc1, assoc2, assoc3], 120, 70, 'Synchronous Invocation', true));
    	
		var assoc = new mxCell('name', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;html=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=top;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.geometry.x = -1;
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('1', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Relation', true));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=none;html=1;edgeStyle=orthogonalEdgeStyle;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('parent', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
		
    	var targetLabel = new mxCell('child', new mxGeometry(1, 0, 0, 0), 'resizable=0;html=1;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;');
    	targetLabel.geometry.relative = true;
    	targetLabel.setConnectable(false);
    	targetLabel.vertex = true;
    	assoc.insert(targetLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Association 1', true));
    	
		var assoc = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.geometry.x = -1;
		assoc.edge = true;
	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Aggregation', true));

		var assoc = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.geometry.x = -1;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Composition', true));
		
		var assoc = new mxCell('Relation', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('0..n', new mxGeometry(-1, 0, 0, 0), 'resizable=0;html=1;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	assoc.insert(sourceLabel);
		
    	var targetLabel = new mxCell('1', new mxGeometry(1, 0, 0, 0), 'resizable=0;html=1;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;');
    	targetLabel.geometry.relative = true;
    	targetLabel.setConnectable(false);
    	targetLabel.vertex = true;
    	assoc.insert(targetLabel);
    	
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Relation', true));
		
		var assoc = new mxCell('Use', new mxGeometry(0, 0, 0, 0), 'endArrow=open;endSize=12;dashed=1;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Dependency', true));
		
		var assoc = new mxCell('Extends', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endSize=16;endFill=0;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Generalization'));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=block;startArrow=block;endFill=1;startFill=1;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(160, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 160, 0, 'Association 2'));
	}));
};

/**
 * Adds the BPMN library to the sidebar.
 */
Sidebar.prototype.addBpmnPalette = function(dir, expand)
{
	this.addPalette('bpmn', 'BPMN ' + mxResources.get('general'), false, mxUtils.bind(this, function(content)
	{
		content.appendChild(this.createVertexTemplate('shape=ext;rounded=1;html=1;whiteSpace=wrap;', 120, 80, 'Task', 'Process', true));
		content.appendChild(this.createVertexTemplate('shape=ext;rounded=1;html=1;whiteSpace=wrap;double=1;', 120, 80, 'Transaction', 'Transaction', true));
		content.appendChild(this.createVertexTemplate('shape=ext;rounded=1;html=1;whiteSpace=wrap;dashed=1;dashPattern=1 4;', 120, 80, 'Event\nSub-Process', 'Event Sub-Process', true));
		content.appendChild(this.createVertexTemplate('shape=ext;rounded=1;html=1;whiteSpace=wrap;strokeWidth=3;', 120, 80, 'Call Activity', 'Call Activity', true));

		var classCell = new mxCell('Sub-Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-7, -14);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 80, 'Sub-Process', true));
	
		var classCell = new mxCell('Looped\nSub-Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=mxgraph.bpmn.loop;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-15, -14);
		classCell.insert(classCell1);
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(1, -14);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 80, 'Sub-Process', true));
		
		var classCell = new mxCell('Receive', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0, 0, 20, 14), 'html=1;shape=message;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(7, 7);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 80, 'Receive Task', true));
		
		var classCell = new mxCell('User', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=1;shape=mxgraph.bpmn.user_task;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(7, 7);
		classCell.insert(classCell1);
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-7, -14);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 80, 'User Task', true));
		
		var classCell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 1, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-40, -15);
		classCell.insert(classCell1);

		content.appendChild(this.createVertexTemplateFromCells([classCell], 120, 95, 'Attached Timer Event 1 ', true));
		
		var classCell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=1;whiteSpace=wrap;rounded=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(1, 0, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-15, 10);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 135, 80, 'Attached Timer Event 2', true));

		content.appendChild(this.createVertexTemplate('swimlane;html=1;horizontal=0;startSize=20', 320, 240, 'Pool', 'Pool', true));
		content.appendChild(this.createVertexTemplate('swimlane;html=1;horizontal=0;swimlaneFillColor=white;swimlaneLine=0;', 300, 120, 'Lane', 'Lane', true));
		
		content.appendChild(this.createVertexTemplate('shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;', 60, 50, '', 'Conversation', true));
		content.appendChild(this.createVertexTemplate('shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;strokeWidth=4', 60, 50, '', 'Call Conversation', true));

		var classCell = new mxCell('', new mxGeometry(0, 0, 60, 50), 'shape=hexagon;whiteSpace=wrap;html=1;perimeter=hexagonPerimeter;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;shape=plus;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-7, -14);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 60, 50, 'Sub-Conversation', true));
		
		var classCell = new mxCell('', new mxGeometry(0, 0, 40, 60), 'shape=note;whiteSpace=wrap;size=16;html=1;');
		classCell.vertex = true;
		var classCell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=1;shape=singleArrow;arrowWidth=0.4;arrowSize=0.4;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(2, 2);
		classCell.insert(classCell1);
		var classCell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=1;whiteSpace=wrap;shape=parallelMarker;');
		classCell1.vertex = true;
		classCell1.geometry.relative = true;
		classCell1.geometry.offset = new mxPoint(-7, -14);
		classCell.insert(classCell1);
		
		content.appendChild(this.createVertexTemplateFromCells([classCell], 40, 60, 'Data Object', true));

		content.appendChild(this.createVertexTemplate('shape=datastore;whiteSpace=wrap;html=1;', 60, 60, '', 'Data Store', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=plus;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Sub-Process Marker', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.loop;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Loop Marker', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=parallelMarker;html=1;');
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Parallel MI Marker', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=parallelMarker;direction=south;html=1;');
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Sequential MI Marker', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.ad_hoc;fillColor=#000000;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Ad Hoc Marker', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.compensation;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Compensation Marker', true));
		
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 40, 30), 'shape=message;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#ffffff;strokeWidth=2;');
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 40, 30, 'Send Task', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 40, 30), 'shape=message;whiteSpace=wrap;html=1;');
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 40, 30, 'Receive Task', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.user_task;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'User Task', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.manual_task;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Manual Task', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.business_rule_task;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Business Rule Task', true));
		
	    var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.service_task;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Service Task', true));
	    
		var classCell = new mxCell('', new mxGeometry(0, 0, 14, 14), 'shape=mxgraph.bpmn.script_task;html=1;');
	    classCell.connectable = false;
    	classCell.vertex = true;

		content.appendChild(this.createVertexTemplateFromCells([classCell], 14, 14, 'Script Task', true));

		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;endSize=6;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;

		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Sequence Flow', true));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=dash;startSize=8;endArrow=block;endFill=1;endSize=6;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Default Flow', true));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=diamondThin;startFill=0;startSize=14;endArrow=block;endFill=1;endSize=6;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Conditional Flow', true));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;

		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Message Flow 1'));

		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;
		
    	var sourceLabel = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message;html=1;');
    	sourceLabel.geometry.relative = true;
    	sourceLabel.setConnectable(false);
    	sourceLabel.vertex = true;
    	sourceLabel.geometry.offset = new mxPoint(-10, -7);
    	assoc.insert(sourceLabel);

		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Message Flow 2', true));
		
		var assoc = new mxCell('', new mxGeometry(0, 0, 0, 0), 'shape=link;html=1;');
		assoc.geometry.setTerminalPoint(new mxPoint(0, 0), true);
		assoc.geometry.setTerminalPoint(new mxPoint(100, 0), false);
		assoc.geometry.relative = true;
		assoc.edge = true;

		content.appendChild(this.createEdgeTemplateFromCells([assoc], 100, 0, 'Link', true));
	}));
};

/**
 * Creates and returns the given title element.
 */
Sidebar.prototype.createTitle = function(label)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.setAttribute('title', label);
	elt.className = 'geTitle';
	mxUtils.write(elt, label);

	return elt;
};

/**
 * Creates a thumbnail for the given cells.
 */
Sidebar.prototype.createThumb = function(cells, width, height, parent, title, showLabel, showTitle)
{
	this.graph.labelsVisible = (showLabel == null || showLabel);
	this.graph.view.scaleAndTranslate(1, 0, 0);
	this.graph.addCells(cells);
	var bounds = this.graph.getGraphBounds();
	var s = Math.floor(Math.min((width - 2 * this.thumbBorder) / bounds.width, (height - 2 * this.thumbBorder)
		/ bounds.height) * 100) / 100;
	this.graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
			Math.floor((height - bounds.height * s) / 2 / s - bounds.y));
	var node = null;
	
	// For supporting HTML labels in IE9 standards mode the container is cloned instead
	if (this.graph.dialect == mxConstants.DIALECT_SVG && !mxClient.NO_FO)
	{
		node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
	}
	// LATER: Check if deep clone can be used for quirks if container in DOM
	else
	{
		node = this.graph.container.cloneNode(false);
		node.innerHTML = this.graph.container.innerHTML;
	}
	
	this.graph.getModel().clear();
	
	// Catch-all event handling
	if (mxClient.IS_IE6)
	{
		parent.style.backgroundImage = 'url(' + this.editorUi.editor.transparentImage + ')';
	}
	
	node.style.position = 'relative';
	node.style.overflow = 'hidden';
	node.style.cursor = 'pointer';
	node.style.left = this.thumbBorder + 'px';
	node.style.top = this.thumbBorder + 'px';
	node.style.width = width + 'px';
	node.style.height = height + 'px';
	node.style.visibility = '';
	node.style.minWidth = '';
	node.style.minHeight = '';
	
	parent.appendChild(node);
	
	// Adds title for sidebar entries
	if (this.sidebarTitles && title != null && showTitle != false)
	{
		var border = (mxClient.IS_QUIRKS) ? 2 * this.thumbPadding + 2: 0;
		parent.style.height = (this.thumbHeight + border + this.sidebarTitleSize + 8) + 'px';
		
		var div = document.createElement('div');
		div.style.fontSize = this.sidebarTitleSize + 'px';
		div.style.color = '#303030';
		div.style.textAlign = 'center';
		div.style.whiteSpace = 'nowrap';
		
		if (mxClient.IS_IE)
		{
			div.style.height = (this.sidebarTitleSize + 12) + 'px';
		}

		div.style.paddingTop = '4px';
		mxUtils.write(div, title);
		parent.appendChild(div);
	}

	return bounds;
};

/**
 * Creates and returns a new palette item for the given image.
 */
Sidebar.prototype.createItem = function(cells, title, showLabel, showTitle, width, height)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	elt.style.overflow = 'hidden';
	var border = (mxClient.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;
	elt.style.width = (this.thumbWidth + border) + 'px';
	elt.style.height = (this.thumbHeight + border) + 'px';
	elt.style.padding = this.thumbPadding + 'px';
	
	// Blocks default click action
	mxEvent.addListener(elt, 'click', function(evt)
	{
		mxEvent.consume(evt);
	});

	var bounds = this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt, title, showLabel, showTitle);
	var dx = 0;
	var dy = 0;
	
	if (cells.length > 1 || cells[0].vertex)
	{
		dx = (bounds.width - width - 1) / 2;
		dy = (bounds.height - height - 1) / 2;
		
		var ds = this.createDragSource(elt, this.createDropHandler(cells, true, dx, dy),
				this.createDragPreview(bounds.width - 1, bounds.height - 1), cells);
		this.addClickHandler(elt, ds, cells);
	
		// Uses guides for vertices only if enabled in graph
		ds.isGuidesEnabled = mxUtils.bind(this, function()
		{
			return this.editorUi.editor.graph.graphHandler.guidesEnabled;
		});
	}
	else if (cells[0] != null && cells[0].edge)
	{
		var ds = this.createDragSource(elt, this.createDropHandler(cells, false, dx, dy),
			this.createDragPreview(width, height), cells);
		this.addClickHandler(elt, ds, cells);
	}
	
	// Shows a tooltip with the rendered cell
	if (!mxClient.IS_IOS)
	{
		mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function(evt)
		{
			if (mxEvent.isMouseEvent(evt))
			{
				this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel, dx, dy);
			}
		}));
	}
	
	return elt;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.updateShapes = function(source, targets)
{
	var graph = this.editorUi.editor.graph;
	var result = [];
	
	graph.model.beginUpdate();
	try
	{
		var cellStyle = graph.getModel().getStyle(source);

		// Lists the styles to carry over from the existing shape
		var styles = ['shadow', 'dashed', 'dashPattern', 'fontFamily', 'fontSize', 'fontColor', 'align', 'startArrow',
		              'startFill', 'startSize', 'endArrow', 'endFill', 'endSize', 'strokeColor', 'strokeWidth',
		              'fillColor', 'gradientColor', 'html', 'part', 'childLayout'];

		for (var i = 0; i < targets.length; i++)
		{
			var targetCell = targets[i];
			
			if ((graph.getModel().isVertex(targetCell) == graph.getModel().isVertex(source)) ||
				(graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source)))
			{
				var state = graph.view.getState(targetCell);
				var style = (state != null) ? state.style : graph.getCellStyle(targets[i]);
				
				graph.getModel().setStyle(targetCell, cellStyle);

				if (style != null)
				{
					for (var j = 0; j < styles.length; j++)
					{
						var value = style[styles[j]];
						
						if (value != null)
						{
							graph.setCellStyles(styles[j], value, [targetCell]);
						}
					}
				}
				
				// Removes existing edge points if edge is source for update
				if (graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source))
				{
					var geo = graph.getCellGeometry(targetCell);
					
					// Resets all edge points
					if (geo != null)
					{
						geo = geo.clone();
						geo.points = null;
						graph.getModel().setGeometry(targetCell, geo);
					}
				}
				
				result.push(targetCell);
			}
		}
	}
	finally
	{
		graph.model.endUpdate();
	}
	
	return result;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createDropHandler = function(cells, allowSplit, dx, dy)
{
	return mxUtils.bind(this, function(graph, evt, target, x, y)
	{
		if (graph.isEnabled())
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				var validDropTarget = (target != null) ? graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;

				if (target != null && !validDropTarget)
				{
					target = null;
				}

				graph.model.beginUpdate();
				try
				{
					x = Math.round(x + dx);
					y = Math.round(y + dy);
					
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

					graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
				}
				finally
				{
					graph.model.endUpdate();
				}

				if (select != null && select.length > 0)
				{
					graph.scrollCellToVisible(select[0]);
					graph.setSelectionCells(select);
				}
			}
			
			mxEvent.consume(evt);
		}
	});
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
Sidebar.prototype.dropAndConnect = function(source, targets, direction, dropCellIndex)
{
	var geo = this.getDropAndConnectGeometry(source, targets[dropCellIndex], direction, targets.length > 1);
	
	if (geo != null)
	{
		var graph = this.editorUi.editor.graph;
		
		// Targets without the new edge for selection
		var tmp = [];
		
		graph.model.beginUpdate();
		try
		{
			var sourceGeo = graph.getCellGeometry(source);
			var geo2 = graph.getCellGeometry(targets[dropCellIndex]);
			targets = graph.importCells(targets, geo.x - geo2.x, geo.y - geo2.y, (graph.model.isEdge(source) ||
					(sourceGeo != null && !sourceGeo.relative)) ? graph.model.getParent(source) : null);
			tmp = targets;
			
			if (graph.model.isEdge(source))
			{
				// Adds new terminal to edge
				// LATER: Push new terminal out radially from edge start point
				graph.model.setTerminal(source, targets[dropCellIndex], direction == mxConstants.DIRECTION_NORTH);
			}
			else if (graph.model.isEdge(targets[dropCellIndex]))
			{
				// Adds new outgoing connection to vertex and clears points
				graph.model.setTerminal(targets[dropCellIndex], source, true);
				geo2 = graph.getCellGeometry(targets[dropCellIndex]);
				geo2.setTerminalPoint(geo.getTerminalPoint(false), false);
				geo2.points = null;
			}
			else
			{
				geo2 = graph.getCellGeometry(targets[dropCellIndex]);
				var dx = geo.x - geo2.x;
				var dy = geo.y - geo2.y;
				geo.x = geo2.x;
				geo.y = geo2.y;
				graph.model.setGeometry(targets[dropCellIndex], geo);
				graph.cellsMoved(targets, dx, dy, null, null, true);
				tmp = targets.slice();
				targets.push(graph.insertEdge(null, null, '', source, targets[dropCellIndex],
						this.editorUi.createCurrentEdgeStyle()));
			}
			
			graph.fireEvent(new mxEventObject('cellsInserted', 'cells', targets));
		}
		finally
		{
			graph.model.endUpdate();
		}
		
		graph.setSelectionCells(tmp);
	}
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.getDropAndConnectGeometry = function(source, target, direction, keepSize)
{
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var geo = graph.getCellGeometry(source);
	var geo2 = graph.getCellGeometry(target);
	
	if (geo != null && geo2 != null)
	{
		geo2 = geo2.clone();
	
		if (graph.model.isEdge(source))
		{
			var state = graph.view.getState(source);
			var pts = state.absolutePoints;
			var p0 = pts[0];
			var pe = pts[pts.length - 1];
			
			if (direction == mxConstants.DIRECTION_NORTH)
			{
				geo2.x = (p0.x - view.translate.x) / view.scale - geo2.width / 2;
				geo2.y = (p0.y - view.translate.y) / view.scale - geo2.height / 2;
			}
			else
			{
				geo2.x = (pe.x - view.translate.x) / view.scale - geo2.width / 2;
				geo2.y = (pe.y - view.translate.y) / view.scale - geo2.height / 2;
			}
		}
		else
		{
			if (geo.relative)
			{
				var state = graph.view.getState(source);
				geo = geo.clone();
				geo.x = (state.x - view.translate.x) / view.scale;
				geo.y = (state.y - view.translate.y) / view.scale;
			}
			
			var length = Math.min(80, geo.height);
			
			// Maintains edge length
			if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && geo2.getTerminalPoint(false) != null)
			{
				var p0 = geo2.getTerminalPoint(true);
				var pe = geo2.getTerminalPoint(false);
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				
				length = Math.sqrt(dx * dx + dy * dy);
				
				geo2.x = geo.getCenterX();
				geo2.y = geo.getCenterY();
				geo2.width = 1;
				geo2.height = 1;
				
				if (direction == mxConstants.DIRECTION_NORTH)
				{
					geo2.height = length
					geo2.y = geo.y - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_EAST)
				{
					geo2.width = length
					geo2.x = geo.x + geo.width;
					geo2.setTerminalPoint(new mxPoint(geo2.x + geo2.width, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_SOUTH)
				{
					geo2.height = length
					geo2.y = geo.y + geo.height;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y + geo2.height), false);
				}
				else if (direction == mxConstants.DIRECTION_WEST)
				{
					geo2.width = length
					geo2.x = geo.x - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
			}
			else
			{
				// Try match size or ignore if width or height < 45 which
				// is considered special enough to be ignored here
				if (!keepSize && geo2.width > 45 && geo2.height > 45)
				{
					geo2.width = geo2.width * (geo.height / geo2.height);
					geo2.height = geo.height;
				}
				
				geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
				geo2.y = geo.y + geo.height / 2 - geo2.height / 2;
				
				if (direction == mxConstants.DIRECTION_NORTH)
				{
					geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
				}
				else if (direction == mxConstants.DIRECTION_EAST)
				{
					geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_SOUTH)
				{
					geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_WEST)
				{
					geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
				}
			}
		}
	}
	
	return geo2;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.createDragSource = function(elt, dropHandler, preview, cells)
{
	// Checks if the cells contain any vertices
	var freeSourceEdge = null;
	var firstVertex = null;
	
	for (var i = 0; i < cells.length; i++)
	{
		if (firstVertex == null && this.editorUi.editor.graph.model.isVertex(cells[i]))
		{
			firstVertex = i;
		}
		else if (freeSourceEdge == null && this.editorUi.editor.graph.model.isEdge(cells[i]) &&
				this.editorUi.editor.graph.model.getTerminal(cells[i], true) == null)
		{
			freeSourceEdge = i;
		}
		
		if (firstVertex != null && freeSourceEdge != null)
		{
			break;
		}
	}
	
	var dragSource = mxUtils.makeDraggable(elt, this.editorUi.editor.graph, mxUtils.bind(this, function(graph, evt, target, x, y)
	{
		if (cells != null && currentStyleTarget != null && activeArrow == styleTarget)
		{
			var tmp = graph.isCellSelected(currentStyleTarget.cell) ? graph.getSelectionCells() : [currentStyleTarget.cell];
			var updatedCells = this.updateShapes((graph.model.isEdge(currentStyleTarget.cell)) ? cells[0] : cells[firstVertex], tmp);
			graph.setSelectionCells(updatedCells);
		}
		else if (cells != null && activeArrow != null && currentTargetState != null && activeArrow != styleTarget)
		{
			var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
			this.dropAndConnect(currentTargetState.cell, cells, direction, index);
		}
		else
		{
			dropHandler.apply(this, arguments);
		}
	}),
	preview, 0, 0, this.editorUi.editor.graph.autoscroll, true, true);
	
	// Stops dragging if cancel is pressed
	this.editorUi.editor.graph.addListener(mxEvent.ESCAPE, function(sender, evt)
	{
		if (dragSource.isActive())
		{
			dragSource.reset();
		}
	});

	// Overrides mouseDown to ignore popup triggers
	var mouseDown = dragSource.mouseDown;
	
	dragSource.mouseDown = function(evt)
	{
		if (!mxEvent.isPopupTrigger(evt) && !mxEvent.isMultiTouchEvent(evt))
		{
			mouseDown.apply(this, arguments);
		}
	};

	// Workaround for event redirection via image tag in quirks and IE8
	function createArrow(img)
	{
		var arrow = null;
		
		if (mxClient.IS_IE && !mxClient.IS_SVG)
		{
			// Workaround for PNG images in IE6
			if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat')
			{
				arrow = document.createElement(mxClient.VML_PREFIX + ':image');
				arrow.setAttribute('src', img.src);
				arrow.style.borderStyle = 'none';
			}
			else
			{
				arrow = document.createElement('div');
				arrow.style.backgroundImage = 'url(' + img.src + ')';
				arrow.style.backgroundPosition = 'center';
				arrow.style.backgroundRepeat = 'no-repeat';
			}
			
			arrow.style.width = (img.width + 4) + 'px';
			arrow.style.height = (img.height + 4) + 'px';
			arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		}
		else
		{
			arrow = mxUtils.createImage(img.src);
			
			if (touchStyle)
			{
				arrow.style.width = '29px';
				arrow.style.height = '29px';
			}
			else
			{
				arrow.style.width = img.width + 'px';
				arrow.style.height = img.height + 'px';
			}
		}
		
		mxUtils.setOpacity(arrow, (img == this.refreshTarget) ? 30 : 20);
		arrow.style.position = 'absolute';
		arrow.style.cursor = 'crosshair';
		
		return arrow;
	};

	var currentTargetState = null;
	var currentStateHandle = null;
	var currentStyleTarget = null;
	var activeTarget = false;
	
	var arrowUp = createArrow(this.triangleUp);
	var arrowRight = createArrow(this.triangleRight);
	var arrowDown = createArrow(this.triangleDown);
	var arrowLeft = createArrow(this.triangleLeft);
	var styleTarget = createArrow(this.refreshTarget);
	var roundSource = createArrow(this.roundDrop);
	var roundTarget = createArrow(this.roundDrop);
	var arrowSpacing = 4;
	var direction = mxConstants.DIRECTION_NORTH;
	var activeArrow = null;
	
	function checkArrow(x, y, bounds, arrow)
	{
		if (mxUtils.contains(bounds, x, y))
		{
			mxUtils.setOpacity(arrow, 100);
			activeArrow = arrow;
		}
		else
		{
			mxUtils.setOpacity(arrow, (arrow == styleTarget) ? 30 : 20);
		}
		
		return bounds;
	};
	
	// Hides guides and preview if target is active
	var sidebar = this;
	var dsCreatePreviewElement = dragSource.createPreviewElement;
	
	// Stores initial size of preview element
	dragSource.createPreviewElement = function(graph)
	{
		var elt = dsCreatePreviewElement.apply(this, arguments);
		
		this.previewElementWidth = elt.style.width;
		this.previewElementHeight = elt.style.height;
		
		return elt;
	};
	
	dragSource.dragOver = function(graph, evt)
	{
		mxDragSource.prototype.dragOver.apply(this, arguments);
		
		if (this.currentGuide != null && activeArrow != null)
		{
			this.currentGuide.hide();
		}

		if (this.previewElement != null)
		{
			if (currentStyleTarget != null && activeArrow == styleTarget)
			{
				this.previewElement.style.display = (graph.model.isEdge(currentStyleTarget.cell)) ? 'none' : '';
				
				this.previewElement.style.left = currentStyleTarget.x + 'px';
				this.previewElement.style.top = currentStyleTarget.y + 'px';
				this.previewElement.style.width = currentStyleTarget.width + 'px';
				this.previewElement.style.height = currentStyleTarget.height + 'px';
			}
			else if (currentTargetState != null && activeArrow != null)
			{
				var graph = sidebar.editorUi.editor.graph;
				var view = graph.view;
				var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
				var geo = sidebar.getDropAndConnectGeometry(currentTargetState.cell, cells[index], direction, cells.length > 1);
				var geo2 = (!graph.model.isEdge(currentTargetState.cell)) ? graph.getCellGeometry(currentTargetState.cell) : null;
				var geo3 = graph.getCellGeometry(cells[index]);
				var parent = graph.model.getParent(currentTargetState.cell);
				var dx = view.translate.x * view.scale;
				var dy = view.translate.y * view.scale;
				
				if (geo2 != null && !geo2.relative && graph.model.isVertex(parent))
				{
					var pState = view.getState(parent);
					dx = pState.x;
					dy = pState.y;
				}
				
				// Shows preview at drop location
				this.previewElement.style.left = ((geo.x - geo3.x) * view.scale + dx) + 'px';
				this.previewElement.style.top = ((geo.y - geo3.y) * view.scale + dy) + 'px';
				
				if (cells.length == 1)
				{
					this.previewElement.style.width = (geo.width * view.scale) + 'px';
					this.previewElement.style.height = (geo.height * view.scale) + 'px';
				}
				
				this.previewElement.style.display = '';
			}
			else
			{
				this.previewElement.style.width = this.previewElementWidth;
				this.previewElement.style.height = this.previewElementHeight;
				this.previewElement.style.display = '';
			}
		}
	};
	
	// Allows drop into cell only if target is a valid root
	dragSource.getDropTarget = mxUtils.bind(this, function(graph, x, y, evt)
	{
		// Alt means no targets at all
		// LATER: Show preview where result will go
		var cell = (!mxEvent.isAltDown(evt) && cells != null) ? graph.getCellAt(x, y) : null;
		var state = graph.view.getState(cell);
		activeArrow = null;
		var bbox = null;

		// Shift means no style targets - containers are ignored to simplify the UX
		if (state != null && (graph.isContainer(state.cell) == mxEvent.isShiftDown(evt)) &&
			((graph.model.isVertex(state.cell) && firstVertex != null) ||
			(graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0]))))
		{
			currentStyleTarget = state;
			var tmp = (graph.model.isEdge(state.cell)) ? graph.view.getPoint(state) :
				new mxPoint(state.getCenterX(), state.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			
			styleTarget.style.left = Math.floor(tmp.x) + 'px';
			styleTarget.style.top = Math.floor(tmp.y) + 'px';
			
			if (styleTarget.parentNode == null)
			{
				graph.container.appendChild(styleTarget);
			}
			
			checkArrow(x, y, tmp, styleTarget);
		}
		// Does not reset on ignored edges
		else if (currentStyleTarget == null || !mxUtils.contains(currentStyleTarget, x, y))
		{
			currentStyleTarget = null;
			
			if (styleTarget.parentNode != null)
			{
				styleTarget.parentNode.removeChild(styleTarget);
			}
		}
		else if (currentStyleTarget != null && styleTarget.parentNode != null)
		{
			// Sets active Arrow as side effect
			var tmp = (graph.model.isEdge(currentStyleTarget.cell)) ? graph.view.getPoint(currentStyleTarget) : new mxPoint(currentStyleTarget.getCenterX(), currentStyleTarget.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			checkArrow(x, y, tmp, styleTarget);
		}
		
		// Checks if inside bounds
		if (activeTarget && currentTargetState != null && !mxEvent.isAltDown(evt) && activeArrow == null)
		{
			// LATER: Use hit-detection for edges
			bbox = mxRectangle.fromRectangle(currentTargetState);
			
			if (graph.model.isEdge(currentTargetState.cell))
			{
				var pts = currentTargetState.absolutePoints;
				
				if (roundSource.parentNode != null)
				{
					var p0 = pts[0];
					bbox.add(checkArrow(x, y, new mxRectangle(p0.x - this.roundDrop.width / 2,
						p0.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundSource));
				}
				
				if (roundTarget.parentNode != null)
				{
					var pe = pts[pts.length - 1];
					bbox.add(checkArrow(x, y, new mxRectangle(pe.x - this.roundDrop.width / 2,
						pe.y - this.roundDrop.height / 2,
						this.roundDrop.width, this.roundDrop.height), roundTarget));
				}
			}
			else
			{
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleUp.width / 2,
					currentTargetState.y - this.triangleUp.height - arrowSpacing, this.triangleUp.width, this.triangleUp.height), arrowUp));
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.x + currentTargetState.width + arrowSpacing,
					currentTargetState.getCenterY() - this.triangleRight.height / 2,
					this.triangleRight.width, this.triangleRight.height), arrowRight));
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleDown.width / 2,
						currentTargetState.y + currentTargetState.height + arrowSpacing,
						this.triangleDown.width, this.triangleDown.height), arrowDown));
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.x - this.triangleLeft.width - arrowSpacing,
						currentTargetState.getCenterY() - this.triangleLeft.height / 2,
						this.triangleLeft.width, this.triangleLeft.height), arrowLeft));
			}
			
			// Adds tolerance
			if (bbox != null)
			{
				bbox.grow(10);
			}
		}
		
		direction = mxConstants.DIRECTION_NORTH;
		
		if (activeArrow == arrowRight)
		{
			direction = mxConstants.DIRECTION_EAST;
		}
		else if (activeArrow == arrowDown || activeArrow == roundTarget)
		{
			direction = mxConstants.DIRECTION_SOUTH;
		}
		else if (activeArrow == arrowLeft)
		{
			direction = mxConstants.DIRECTION_WEST;
		}
		
		if (currentStyleTarget != null && activeArrow == styleTarget)
		{
			state = currentStyleTarget;
		}
		
		if (currentTargetState != state && (bbox == null || !mxUtils.contains(bbox, x, y)))
		{
			activeTarget = false;
			currentTargetState = state;

			// Containers could be enabled here but it just makes the UX even more complex
			var validTarget = (graph.model.isEdge(cell) && firstVertex != null) || (graph.model.isVertex(cell) &&
				graph.isCellConnectable(cell) && !graph.isContainer(cell));
			
			if (currentTargetState != null && validTarget)
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
				
				if (graph.model.isEdge(cell))
				{
					var pts = state.absolutePoints;
					
					if (pts != null)
					{
						var p0 = pts[0];
						var pe = pts[pts.length - 1];
						var tol = graph.tolerance;
						var box = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
						
						roundSource.style.left = Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
						roundSource.style.top = Math.floor(p0.y - this.roundDrop.height / 2) + 'px';
						
						roundTarget.style.left = Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
						roundTarget.style.top = Math.floor(pe.y - this.roundDrop.height / 2) + 'px';
						
						if (graph.model.getTerminal(cell, true) == null)
						{
							graph.container.appendChild(roundSource);
						}
						
						if (graph.model.getTerminal(cell, false) == null)
						{
							graph.container.appendChild(roundTarget);
						}
					}
				}
				else
				{
					arrowUp.style.left = Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
					arrowUp.style.top = Math.floor(state.y - this.triangleUp.height - arrowSpacing) + 'px';
					
					arrowRight.style.left = Math.floor(state.x + state.width + arrowSpacing) + 'px';
					arrowRight.style.top = Math.floor(state.getCenterY() - this.triangleRight.height / 2) + 'px';
					
					arrowDown.style.left = arrowUp.style.left
					arrowDown.style.top = Math.floor(state.y + state.height + arrowSpacing) + 'px';
					
					arrowLeft.style.left = Math.floor(state.x - this.triangleLeft.width - arrowSpacing) + 'px';
					arrowLeft.style.top = arrowRight.style.top;
					
					graph.container.appendChild(arrowUp);
					graph.container.appendChild(arrowRight);
					graph.container.appendChild(arrowDown);
					graph.container.appendChild(arrowLeft);
				}
				
				// Hides handle for cell under mouse
				if (state != null)
				{
					currentStateHandle = graph.selectionCellsHandler.getHandler(state.cell);
					
					if (currentStateHandle != null && currentStateHandle.setHandlesVisible != null)
					{
						currentStateHandle.setHandlesVisible(false);
					}
				}
				
				activeTarget = true;
			}
			else
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
			}
		}

		if (!activeTarget && currentStateHandle != null)
		{
			currentStateHandle.setHandlesVisible(true);
		}
		
		// Handles drop target
		var target = (!activeTarget && !mxEvent.isAltDown(evt) && !(currentStyleTarget != null && activeArrow == styleTarget)) ?
				mxDragSource.prototype.getDropTarget.apply(this, arguments) : null;

		if (target != null)
		{
			// Selects parent group as drop target
			var model = graph.getModel();
			
			if (!graph.isValidRoot(target) && model.isVertex(model.getParent(target)))
			{
				target = model.getParent(target);
			}
			
			if (graph.view.currentRoot == target || (!graph.isValidRoot(target) &&
				graph.getModel().getChildCount(target) == 0))
			{
				target = null;
			}
		}
		
		return target;
	});
	
	dragSource.stopDrag = function()
	{
		mxDragSource.prototype.stopDrag.apply(this, arguments);
		
		var elts = [roundSource, roundTarget, styleTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
		
		for (var i = 0; i < elts.length; i++)
		{
			if (elts[i].parentNode != null)
			{
				elts[i].parentNode.removeChild(elts[i]);
			}
		}
		
		if (currentTargetState != null && currentStateHandle != null)
		{
			currentStateHandle.reset();
		}
		
		currentStateHandle = null;
		currentTargetState = null;
		currentStyleTarget = null;
		activeArrow = null;
	};
	
	return dragSource;
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.itemClicked = function(cells, ds, evt, elt)
{
	var graph = this.editorUi.editor.graph;
	
	if (mxEvent.isAltDown(evt))
	{
		if (!graph.isSelectionEmpty())
		{
			graph.setSelectionCells(this.updateShapes(cells[0], graph.getSelectionCells()));
		}
	}
	else
	{
		var gs = graph.getGridSize();
		var dx = graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
		var dy = graph.container.scrollTop / graph.view.scale - graph.view.translate.y;
	
		ds.drop(graph, evt, null, graph.snap(dx + gs), graph.snap(dy + gs));
	}
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.addClickHandler = function(elt, ds, cells)
{
	var graph = this.editorUi.editor.graph;
	var oldMouseUp = ds.mouseUp;
	var first = null;
	
	mxEvent.addGestureListeners(elt, function(evt)
	{
		first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
	});
	
	ds.mouseUp = mxUtils.bind(this, function(evt)
	{
		if (!mxEvent.isPopupTrigger(evt) && this.currentGraph == null && first != null)
		{
			var tol = graph.tolerance;
			
			if (Math.abs(first.x - mxEvent.getClientX(evt)) <= tol &&
				Math.abs(first.y - mxEvent.getClientY(evt)) <= tol)
			{
				this.itemClicked(cells, ds, evt, elt);
			}
		}

		oldMouseUp.apply(ds, arguments);
		first = null;
		
		// Blocks tooltips on this element after single click
		this.currentElt = elt;
	});
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	
	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromCells = function(cells, width, height, title, showLabel, showTitle)
{
	return this.createItem(cells, title, showLabel, showTitle, width, height);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplate = function(style, width, height, value, title, showLabel)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].geometry.setTerminalPoint(new mxPoint(0, height), true);
	cells[0].geometry.setTerminalPoint(new mxPoint(width, 0), false);
	cells[0].geometry.relative = true;
	cells[0].edge = true;
	
	return this.createEdgeTemplateFromCells(cells, width, height, title, showLabel);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplateFromCells = function(cells, width, height, title, showLabel)
{	
	return this.createItem(cells, title, showLabel, true, width, height);
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
    
    return div;
};

/**
 * Create the given title element.
 */
Sidebar.prototype.addFoldingHandler = function(title, content, funct)
{
	var initialized = false;

	// Avoids mixed content warning in IE6-8
	if (!mxClient.IS_IE || document.documentMode >= 8)
	{
		title.style.backgroundImage = (content.style.display == 'none') ?
			'url(' + IMAGE_PATH + '/collapsed.gif)' : 'url(' + IMAGE_PATH + '/expanded.gif)';
	}
	
	title.style.backgroundRepeat = 'no-repeat';
	title.style.backgroundPosition = '0% 50%';
	
	mxEvent.addListener(title, 'click', function(evt)
	{
		if (content.style.display == 'none')
		{
			if (!initialized)
			{
				initialized = true;
				
				if (funct != null)
				{
					// Wait cursor does not show up on Mac
					title.style.cursor = 'wait';
					var prev = title.innerHTML;
					title.innerHTML = mxResources.get('loading') + '...';
					
					window.setTimeout(function()
					{
						funct(content);
						title.style.cursor = '';
						title.innerHTML = prev;
					}, 0);
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
Sidebar.prototype.addImagePalette = function(id, title, prefix, postfix, items, titles)
{
	this.addPalette(id, title, false, mxUtils.bind(this, function(content)
    {
		var showTitles = titles != null;
		
    	for (var i = 0; i < items.length; i++)
		{
			var icon = prefix + items[i] + postfix;
			content.appendChild(this.createVertexTemplate('image;html=1;image=' + icon, 80, 80, '', (showTitles) ? titles[i] : null, showTitles));
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
					Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), true));
			}
		}), true);
    }));
};
