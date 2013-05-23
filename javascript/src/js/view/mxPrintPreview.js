/**
 * $Id: mxPrintPreview.js,v 1.6 2013/04/09 14:06:49 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxPrintPreview
 * 
 * Implements printing of a diagram across multiple pages. The following opens
 * a print preview for an existing graph:
 * 
 * (code)
 * var preview = new mxPrintPreview(graph);
 * preview.open();
 * (end)
 * 
 * Use <mxUtils.getScaleForPageCount> as follows in order to print the graph
 * across a given number of pages:
 * 
 * (code)
 * var pageCount = mxUtils.prompt('Enter page count', '1');
 * 
 * if (pageCount != null)
 * {
 *   var scale = mxUtils.getScaleForPageCount(pageCount, graph);
 *   var preview = new mxPrintPreview(graph, scale);
 *   preview.open();
 * }
 * (end)
 * 
 * Additional pages:
 * 
 * To add additional pages before and after the output, <getCoverPages> and
 * <getAppendices> can be used, respectively.
 * 
 * (code)
 * var preview = new mxPrintPreview(graph, 1);
 * 
 * preview.getCoverPages = function(w, h)
 * {
 *   return [this.renderPage(w, h, mxUtils.bind(this, function(div)
 *   {
 *     div.innerHTML = '<div style="position:relative;margin:4px;">Cover Page</p>'
 *   }))];
 * }
 * 
 * preview.getAppendices = function(w, h)
 * {
 *   return [this.renderPage(w, h, mxUtils.bind(this, function(div)
 *   {
 *     div.innerHTML = '<div style="position:relative;margin:4px;">Appendix</p>'
 *   }))];
 * }
 * 
 * preview.open();
 * (end)
 * 
 * Headers:
 * 
 * Apart from setting the title argument in the mxPrintPreview constructor you
 * can override <renderPage> as follows to add a header to any page:
 * 
 * (code)
 * var oldRenderPage = mxPrintPreview.prototype.renderPage;
 * mxPrintPreview.prototype.renderPage = function(w, h)
 * {
 *   var div = oldRenderPage.apply(this, arguments);
 *   
 *   var header = document.createElement('div');
 *   header.style.position = 'absolute';
 *   header.style.top = '0px';
 *   header.style.width = '100%';
 *   header.style.textAlign = 'right';
 *   mxUtils.write(header, 'Your header here');
 *   div.firstChild.appendChild(header);
 *   
 *   return div;
 * };
 * (end)
 * 
 * For adding page numbers to the graph output pages, implement a counter in
 * the above code or override <addGraphFragment> instead, where div corresponds
 * to div.firstChild in the above code.
 * 
 * Page Format:
 * 
 * For landscape printing, use <mxConstants.PAGE_FORMAT_A4_LANDSCAPE> as
 * the pageFormat in <mxUtils.getScaleForPageCount> and <mxPrintPreview>.
 * Keep in mind that one can not set the defaults for the print dialog
 * of the operating system from JavaScript so the user must manually choose
 * a page format that matches this setting.
 * 
 * You can try passing the following CSS directive to <open> to set the
 * page format in the print dialog to landscape. However, this CSS
 * directive seems to be ignored in most major browsers, including IE.
 * 
 * (code)
 * @page {
 *   size: landscape;
 * }
 * (end)
 * 
 * Note that the print preview behaves differently in IE when used from the
 * filesystem or via HTTP so printing should always be tested via HTTP.
 * 
 * If you are using a DOCTYPE in the source page you can override <getDoctype>
 * and provide the same DOCTYPE for the print preview if required. Here is
 * an example for IE8 standards mode.
 * 
 * (code)
 * var preview = new mxPrintPreview(graph);
 * preview.getDoctype = function()
 * {
 *   return '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=8" ><![endif]-->';
 * };
 * preview.open();
 * (end)
 * 
 * Constructor: mxPrintPreview
 *
 * Constructs a new print preview for the given parameters.
 * 
 * Parameters:
 * 
 * graph - <mxGraph> to be previewed.
 * scale - Optional scale of the output. Default is 1 / <mxGraph.pageScale>.
 * border - Border in pixels along each side of every page. Note that the
 * actual print function in the browser will add another border for
 * printing.
 * pageFormat - <mxRectangle> that specifies the page format (in pixels).
 * This should match the page format of the printer. Default uses the
 * <mxGraph.pageFormat> of the given graph.
 * x0 - Optional left offset of the output. Default is 0.
 * y0 - Optional top offset of the output. Default is 0.
 * borderColor - Optional color of the page border. Default is no border.
 * Note that a border is sometimes useful to highlight the printed page
 * border in the print preview of the browser.
 * title - Optional string that is used for the window title. Default
 * is 'Printer-friendly version'.
 * pageSelector - Optional boolean that specifies if the page selector
 * should appear in the window with the print preview. Default is true.
 */
function mxPrintPreview(graph, scale, pageFormat, border, x0, y0, borderColor, title, pageSelector)
{
	this.graph = graph;
	this.scale = (scale != null) ? scale : 1 / graph.pageScale;
	this.border = (border != null) ? border : 0;
	this.pageFormat = (pageFormat != null) ? pageFormat : graph.pageFormat;
	this.title = (title != null) ? title : 'Printer-friendly version';
	this.x0 = (x0 != null) ? x0 : 0;
	this.y0 = (y0 != null) ? y0 : 0;
	this.borderColor = borderColor;
	this.pageSelector = (pageSelector != null) ? pageSelector : true;
};

/**
 * Variable: graph
 * 
 * Reference to the <mxGraph> that should be previewed.
 */
mxPrintPreview.prototype.graph = null;

/**
 * Variable: pageFormat
 *
 * Holds the <mxRectangle> that defines the page format.
 */
mxPrintPreview.prototype.pageFormat = null;

/**
 * Variable: scale
 * 
 * Holds the scale of the print preview.
 */
mxPrintPreview.prototype.scale = null;

/**
 * Variable: border
 * 
 * The border inset around each side of every page in the preview. This is set
 * to 0 if autoOrigin is false.
 */
mxPrintPreview.prototype.border = 0;

/**
/**
 * Variable: x0
 * 
 * Holds the horizontal offset of the output.
 */
mxPrintPreview.prototype.x0 = 0;

/**
 * Variable: y0
 *
 * Holds the vertical offset of the output.
 */
mxPrintPreview.prototype.y0 = 0;

/**
 * Variable: autoOrigin
 * 
 * Specifies if the origin should be automatically computed based on the top,
 * left corner of the actual diagram contents. If this is set to false then the
 * values for <x0> and <y0> will be overridden in <open>. Default is true.
 */
mxPrintPreview.prototype.autoOrigin = true;

/**
 * Variable: printOverlays
 * 
 * Specifies if overlays should be printed. Default is false.
 */
mxPrintPreview.prototype.printOverlays = false;

/**
 * Variable: borderColor
 * 
 * Holds the color value for the page border.
 */
mxPrintPreview.prototype.borderColor = null;

/**
 * Variable: title
 * 
 * Holds the title of the preview window.
 */
mxPrintPreview.prototype.title = null;

/**
 * Variable: pageSelector
 * 
 * Boolean that specifies if the page selector should be
 * displayed. Default is true.
 */
mxPrintPreview.prototype.pageSelector = null;

/**
 * Variable: wnd
 * 
 * Reference to the preview window.
 */
mxPrintPreview.prototype.wnd = null;

/**
 * Variable: pageCount
 * 
 * Holds the actual number of pages in the preview.
 */
mxPrintPreview.prototype.pageCount = 0;

/**
 * Function: getWindow
 * 
 * Returns <wnd>.
 */
mxPrintPreview.prototype.getWindow = function()
{
	return this.wnd;
};

/**
 * Function: getDocType
 * 
 * Returns the string that should go before the HTML tag in the print preview
 * page. This implementation returns an empty string.
 */
mxPrintPreview.prototype.getDoctype = function()
{
	var dt = '';
	
	if (document.documentMode == 8)
	{
		dt = '<meta http-equiv="X-UA-Compatible" content="IE=8">';
	}
	
	return dt;
};

/**
 * Function: open
 * 
 * Shows the print preview window. The window is created here if it does
 * not exist.
 * 
 * Parameters:
 * 
 * css - Optional CSS string to be used in the new page's head section.
 */
mxPrintPreview.prototype.open = function(css)
{
	// Closing the window while the page is being rendered may cause an
	// exception in IE. This and any other exceptions are simply ignored.
	var previousInitializeOverlay = this.graph.cellRenderer.initializeOverlay;
	var div = null;

	try
	{
		// Temporarily overrides the method to redirect rendering of overlays
		// to the draw pane so that they are visible in the printout
		if (this.printOverlays)
		{
			this.graph.cellRenderer.initializeOverlay = function(state, overlay)
			{
				overlay.init(state.view.getDrawPane());
			};
		}
		
		if (this.wnd == null)
		{
			this.wnd = window.open();
			var doc = this.wnd.document;
			var dt = this.getDoctype();
			
			if (dt != null && dt.length > 0)
			{
				doc.writeln(dt);
			}
			
			doc.writeln('<html>');
			doc.writeln('<head>');
			this.writeHead(doc, css);
			doc.writeln('</head>');
			doc.writeln('<body class="mxPage">');
	
			// Adds all required stylesheets and namespaces
			mxClient.link('stylesheet', mxClient.basePath + '/css/common.css', doc);

			if (mxClient.IS_VML)
			{
				doc.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
				doc.namespaces.add('o', 'urn:schemas-microsoft-com:office:office');
		        var ss = doc.createStyleSheet();
		        ss.cssText = 'v\\:*{behavior:url(#default#VML)}o\\:*{behavior:url(#default#VML)}';
		        mxClient.link('stylesheet', mxClient.basePath + '/css/explorer.css', doc);
			}

			// Computes the horizontal and vertical page count
			var bounds = this.graph.getGraphBounds().clone();
			var currentScale = this.graph.getView().getScale();
			var sc = currentScale / this.scale;
			var tr = this.graph.getView().getTranslate();
			
			// Uses the absolute origin with no offset for all printing
			if (!this.autoOrigin)
			{
				this.x0 = -tr.x * this.scale;
				this.y0 = -tr.y * this.scale;
				bounds.width += bounds.x;
				bounds.height += bounds.y;
				bounds.x = 0;
				bounds.y = 0;
				this.border = 0;
			}

			// Compute the unscaled, untranslated bounds to find
			// the number of vertical and horizontal pages
			bounds.width /= sc;
			bounds.height /= sc;
			
			// Store the available page area
			var availableWidth = this.pageFormat.width - (this.border * 2);
			var availableHeight = this.pageFormat.height - (this.border * 2);
		
			var hpages = Math.max(1, Math.ceil((bounds.width + this.x0) / availableWidth));
			var vpages = Math.max(1, Math.ceil((bounds.height + this.y0) / availableHeight));
			this.pageCount = hpages * vpages;
			
			var writePageSelector = mxUtils.bind(this, function()
			{
				if (this.pageSelector && (vpages > 1 || hpages > 1))
				{
					var table = this.createPageSelector(vpages, hpages);
					doc.body.appendChild(table);
					
					// Workaround for position: fixed which isn't working in IE
					if (mxClient.IS_IE)
					{
						table.style.position = 'absolute';
						
						var update = function()
						{
							table.style.top = (doc.body.scrollTop + 10) + 'px';
						};
						
						mxEvent.addListener(this.wnd, 'scroll', function(evt)
						{
							update();
						});
						
						mxEvent.addListener(this.wnd, 'resize', function(evt)
						{
							update();
						});
					}
				}
			});
			
			function addPage(div, addBreak)
			{
				// Border of the DIV (aka page) inside the document
				if (this.borderColor != null)
				{
					div.style.borderColor = this.borderColor;
					div.style.borderStyle = 'solid';
					div.style.borderWidth = '1px';
				}
				
				// Needs to be assigned directly because IE doesn't support
				// child selectors, eg. body > div { background: white; }
				div.style.background = 'white';
				
				if (addBreak)
				{
					div.style.pageBreakAfter = 'always';
				}

				// NOTE: We are dealing with cross-window DOM here, which
				// is a problem in IE, so we copy the HTML markup instead.
				// The underlying problem is that the graph display markup
				// creation (in mxShape, mxGraphView) is hardwired to using
				// document.createElement and hence we must use document
				// to create the complete page and then copy it over to the
				// new window.document. This can be fixed later by using the
				// ownerDocument of the container in mxShape and mxGraphView.
				if (mxClient.IS_IE)
				{
					// For some obscure reason, removing the DIV from the
					// parent before fetching its outerHTML has missing
					// fillcolor properties and fill children, so the div
					// must be removed afterwards to keep the fillcolors.
					doc.writeln(div.outerHTML);
					div.parentNode.removeChild(div);
				}
				else
				{
					div.parentNode.removeChild(div);
					doc.body.appendChild(div);
				}

				if (addBreak)
				{
					var hr = doc.createElement('hr');
					hr.className = 'mxPageBreak';
					doc.body.appendChild(hr);
				}
			};
			
			var cov = this.getCoverPages(this.pageFormat.width, this.pageFormat.height);
			
			if (cov != null)
			{
				for (var i = 0; i < cov.length; i++)
				{
					addPage(cov[i], true);
				}
			}
			
			var apx = this.getAppendices(this.pageFormat.width, this.pageFormat.height);
			
			// Appends each page to the page output for printing, making
			// sure there will be a page break after each page (ie. div)
			for (var i = 0; i < vpages; i++)
			{
				var dy = i * availableHeight / this.scale - this.y0 / this.scale +
						(bounds.y - tr.y * currentScale) / currentScale;
				
				for (var j = 0; j < hpages; j++)
				{
					if (this.wnd == null)
					{
						return null;
					}
					
					var dx = j * availableWidth / this.scale - this.x0 / this.scale +
							(bounds.x - tr.x * currentScale) / currentScale;
					var pageNum = i * hpages + j + 1;
					div = this.renderPage(this.pageFormat.width, this.pageFormat.height, mxUtils.bind(this, function(div)
					{
						this.addGraphFragment(-dx, -dy, this.scale, pageNum, div);
					}));

					// Gives the page a unique ID for later accessing the page
					div.setAttribute('id', 'mxPage-'+pageNum);
					
					addPage(div, apx != null || i < vpages - 1 || j < hpages - 1);
				}
			}

			if (apx != null)
			{
				for (var i = 0; i < apx.length; i++)
				{
					addPage(apx[i], i < apx.length);
				}
			}

			doc.writeln('</body>');
			doc.writeln('</html>');
			doc.close();
			
			// Marks the printing complete for async handling
			writePageSelector();
			
			// Removes all event handlers in the print output
			mxEvent.release(doc.body);
		}
		
		this.wnd.focus();
	}
	catch (e)
	{
		// Removes the DIV from the document in case of an error
		if (div != null && div.parentNode != null)
		{
			div.parentNode.removeChild(div);
		}
	}
	finally
	{
		this.graph.cellRenderer.initializeOverlay = previousInitializeOverlay;
	}

	return this.wnd;
};

/**
 * Function: writeHead
 * 
 * Writes the HEAD section into the given document, without the opening
 * and closing HEAD tags.
 */
mxPrintPreview.prototype.writeHead = function(doc, css)
{
	if (this.title != null)
	{
		doc.writeln('<title>' + this.title + '</title>');
	}

	// Makes sure no horizontal rulers are printed
	doc.writeln('<style type="text/css">');
	doc.writeln('@media print {');
	doc.writeln('  table.mxPageSelector { display: none; }');
	doc.writeln('  hr.mxPageBreak { display: none; }');
	doc.writeln('}');
	doc.writeln('@media screen {');
	
	// NOTE: position: fixed is not supported in IE, so the page selector
	// position (absolute) needs to be updated in IE (see below)
	doc.writeln('  table.mxPageSelector { position: fixed; right: 10px; top: 10px;' +
			'font-family: Arial; font-size:10pt; border: solid 1px darkgray;' +
			'background: white; border-collapse:collapse; }');
	doc.writeln('  table.mxPageSelector td { border: solid 1px gray; padding:4px; }');
	doc.writeln('  body.mxPage { background: gray; }');
	doc.writeln('}');
	
	if (css != null)
	{
		doc.writeln(css);
	}
	
	doc.writeln('</style>');
};

/**
 * Function: createPageSelector
 * 
 * Creates the page selector table.
 */
mxPrintPreview.prototype.createPageSelector = function(vpages, hpages)
{
	var doc = this.wnd.document;
	var table = doc.createElement('table');
	table.className = 'mxPageSelector';
	table.setAttribute('border', '0');

	var tbody = doc.createElement('tbody');
	
	for (var i = 0; i < vpages; i++)
	{
		var row = doc.createElement('tr');
		
		for (var j = 0; j < hpages; j++)
		{
			var pageNum = i * hpages + j + 1;
			var cell = doc.createElement('td');
			
			// Needs anchor for all browers to work without JavaScript
			// LATER: Does not work in Firefox because the generated document
			// has the URL of the opening document, the anchor is appended
			// to that URL and the full URL is loaded on click.
			if (!mxClient.IS_NS || mxClient.IS_SF || mxClient.IS_GC)
			{
				var a = doc.createElement('a');
				a.setAttribute('href', '#mxPage-' + pageNum);
				mxUtils.write(a, pageNum, doc);
				cell.appendChild(a);
			}
			else
			{
				mxUtils.write(cell, pageNum, doc);
			}

			row.appendChild(cell);
		}
		
		tbody.appendChild(row);
	}
	
	table.appendChild(tbody);
	
	return table;
};

/**
 * Function: renderPage
 * 
 * Creates a DIV that prints a single page of the given
 * graph using the given scale and returns the DIV that
 * represents the page.
 * 
 * Parameters:
 * 
 * w - Width of the page in pixels.
 * h - Height of the page in pixels.
 * content - Callback that adds the HTML content to the inner div of a page.
 * Takes the inner div as the argument.
 */
mxPrintPreview.prototype.renderPage = function(w, h, content)
{
	var div = document.createElement('div');
	
	try
	{
		div.style.width = w + 'px';
		div.style.height = h + 'px';
		div.style.overflow = 'hidden';
		div.style.pageBreakInside = 'avoid';
		div.style.position = 'relative';
		
		var innerDiv = document.createElement('div');
		innerDiv.style.top = this.border + 'px';
		innerDiv.style.left = this.border + 'px';
		innerDiv.style.width = (w - 2 * this.border) + 'px';
		innerDiv.style.height = (h - 2 * this.border) + 'px';
		innerDiv.style.overflow = 'hidden';

		if (this.graph.dialect == mxConstants.DIALECT_VML)
		{
			innerDiv.style.position = 'absolute';
		}
		
		div.appendChild(innerDiv);
		document.body.appendChild(div);
		content(innerDiv);
	}
	catch (e)
	{
		div.parentNode.removeChild(div);
		div = null;
		
		throw e;
	}
	
	return div;
};

/**
 * Function: getRoot
 * 
 * Returns the root cell for painting the graph.
 */
mxPrintPreview.prototype.getRoot = function()
{
	var root = this.graph.view.currentRoot;
	
	if (root == null)
	{
		root = this.graph.getModel().getRoot();
	}
	
	return root;
};

/**
 * Function: addGraphFragment
 * 
 * Adds a graph fragment to the given div.
 * 
 * Parameters:
 * 
 * dx - Horizontal translation for the diagram.
 * dy - Vertical translation for the diagram.
 * scale - Scale for the diagram.
 * pageNumber - Number of the page to be rendered.
 * div - Div that contains the output.
 */
mxPrintPreview.prototype.addGraphFragment = function(dx, dy, scale, pageNumber, div)
{
	var view = this.graph.getView();
	var previousContainer = this.graph.container;
	this.graph.container = div;
	
	var canvas = view.getCanvas();
	var backgroundPane = view.getBackgroundPane();
	var drawPane = view.getDrawPane();
	var overlayPane = view.getOverlayPane();

	if (this.graph.dialect == mxConstants.DIALECT_SVG)
	{
		view.createSvg();
	}
	else if (this.graph.dialect == mxConstants.DIALECT_VML)
	{
		view.createVml();
	}
	else
	{
		view.createHtml();
	}
	
	// Disables events on the view
	var eventsEnabled = view.isEventsEnabled();
	view.setEventsEnabled(false);
	
	// Disables the graph to avoid cursors
	var graphEnabled = this.graph.isEnabled();
	this.graph.setEnabled(false);

	// Resets the translation
	var translate = view.getTranslate();
	view.translate = new mxPoint(dx, dy);
	
	var temp = null;
	
	try
	{
		// Creates the temporary cell states in the view and
		// draws them onto the temporary DOM nodes in the view
		var cells = [this.getRoot()];
		temp = new mxTemporaryCellStates(view, scale, cells);
	}
	finally
	{
		// Removes overlay pane with selection handles
		// controls and icons from the print output
		if (mxClient.IS_IE)
		{
			view.overlayPane.innerHTML = '';
		}
		else
		{
			// Removes everything but the SVG node
			var tmp = div.firstChild;

			while (tmp != null)
			{
				var next = tmp.nextSibling;
				var name = tmp.nodeName.toLowerCase();

				// Note: Width and heigh are required in FF 11
				if (name == 'svg')
				{
					tmp.setAttribute('width', parseInt(div.style.width));
					tmp.setAttribute('height', parseInt(div.style.height));
				}
				// Tries to fetch all text labels and only text labels
				else if (tmp.style.cursor != 'default' && name != 'table')
				{
					tmp.parentNode.removeChild(tmp);
				}
				
				tmp = next;
			}
		}
		
		// Completely removes the overlay pane to remove more handles
		view.overlayPane.parentNode.removeChild(view.overlayPane);

		// Restores the state of the view
		this.graph.setEnabled(graphEnabled);
		this.graph.container = previousContainer;
		view.canvas = canvas;
		view.backgroundPane = backgroundPane;
		view.drawPane = drawPane;
		view.overlayPane = overlayPane;
		view.translate = translate;
		temp.destroy();
		view.setEventsEnabled(eventsEnabled);
	}
};

/**
 * Function: getCoverPages
 * 
 * Returns the pages to be added before the print output. This returns null.
 */
mxPrintPreview.prototype.getCoverPages = function()
{
	return null;
};

/**
 * Function: getAppendices
 * 
 * Returns the pages to be added after the print output. This returns null.
 */
mxPrintPreview.prototype.getAppendices = function()
{
	return null;
};

/**
 * Function: print
 * 
 * Opens the print preview and shows the print dialog.
 */
mxPrintPreview.prototype.print = function()
{
	var wnd = this.open();
	
	if (wnd != null)
	{
		wnd.print();
	}
};

/**
 * Function: close
 * 
 * Closes the print preview window.
 */
mxPrintPreview.prototype.close = function()
{
	if (this.wnd != null)
	{
		this.wnd.close();
		this.wnd = null;
	}
};
