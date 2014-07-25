/**
 * $Id: Toolbar.js,v 1.10 2014/01/16 12:08:57 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new toolbar for the given editor.
 */
function Toolbar(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
	this.init();

	// Global handler to hide the current menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
	{
		this.hideMenu();
	}));
};

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.selectedBackground = '#d0d0d0';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.unselectedBackground = 'none';

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.init = function()
{
	this.addItems(['undo', 'redo', 'delete', '-', 'actualSize', 'zoomIn', 'zoomOut', '-']);
	var fontElt = this.addMenu('Helvetica', mxResources.get('fontFamily'), true, 'fontFamily');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	fontElt.style.width = (mxClient.IS_QUIRKS) ? '76px' : '56px';
	this.addSeparator();
	var sizeElt = this.addMenu('12', mxResources.get('fontSize'), true, 'fontSize');
	sizeElt.style.whiteSpace = 'nowrap';
	sizeElt.style.overflow = 'hidden';
	sizeElt.style.width = (mxClient.IS_QUIRKS) ? '42px' : '22px';

	this.addItems(['-', 'bold', 'italic', 'underline']);
	var align = this.addMenuFunction('geSprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'geIcon geSprite geSprite-left', null,
				function() { document.execCommand('justifyleft'); }).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'geIcon geSprite geSprite-center', null,
				function() { document.execCommand('justifycenter'); }).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'geIcon geSprite geSprite-right', null,
				function() { document.execCommand('justifyright'); }).setAttribute('title', mxResources.get('right'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], 'geIcon geSprite geSprite-top', null).setAttribute('title', mxResources.get('top'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], 'geIcon geSprite geSprite-middle', null).setAttribute('title', mxResources.get('middle'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], 'geIcon geSprite geSprite-bottom', null).setAttribute('title', mxResources.get('bottom'));
	}));
	this.addItems(['fontColor', '-']);
	var line = this.addMenuFunction('geSprite-straight', mxResources.get('line'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, 'noEdgeStyle'], [null, null], 'geIcon geSprite geSprite-straight', null).setAttribute('title', mxResources.get('straight'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, 'noEdgeStyle'], ['entityRelationEdgeStyle', null], 'geIcon geSprite geSprite-entity', null).setAttribute('title', mxResources.get('entityRelation'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, 'noEdgeStyle'], ['elbowEdgeStyle', 'horizontal', null], 'geIcon geSprite geSprite-helbow', null).setAttribute('title', mxResources.get('horizontal'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, 'noEdgeStyle'], ['elbowEdgeStyle', 'vertical', null], 'geIcon geSprite geSprite-velbow', null).setAttribute('title', mxResources.get('vertical'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, 'noEdgeStyle'], ['segmentEdgeStyle', null], 'geIcon geSprite geSprite-segment', null).setAttribute('title', mxResources.get('manual'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_EDGE, 'noEdgeStyle'], ['orthogonalEdgeStyle', null], 'geIcon geSprite geSprite-orthogonal', null).setAttribute('title', mxResources.get('automatic'));
	}));
	var linestart = this.addMenuFunction('geSprite-startclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null).setAttribute('title', mxResources.get('none'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-startclassic', null).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-startopen', null).setAttribute('title', mxResources.get('openArrow'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-startblock', null).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-startoval', null).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-startdiamond', null).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-startthindiamond', null).setAttribute('title', mxResources.get('diamondThin'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-startclassictrans', null).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-startblocktrans', null).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-startovaltrans', null).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-startdiamondtrans', null).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_STARTARROW, 'startFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-startthindiamondtrans', null).setAttribute('title', mxResources.get('diamondThin'));
	}));
	var lineend = this.addMenuFunction('geSprite-endclassic', mxResources.get('lineend'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.NONE, 0], 'geIcon geSprite geSprite-noarrow', null).setAttribute('title', mxResources.get('none'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-endclassic', null).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OPEN, 1], 'geIcon geSprite geSprite-endopen', null).setAttribute('title', mxResources.get('openArrow'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-endblock', null).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-endoval', null).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-enddiamond', null).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-endthindiamond', null).setAttribute('title', mxResources.get('diamondThin'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-endclassictrans', null).setAttribute('title', mxResources.get('classic'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-endblocktrans', null).setAttribute('title', mxResources.get('block'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-endovaltrans', null).setAttribute('title', mxResources.get('oval'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-enddiamondtrans', null).setAttribute('title', mxResources.get('diamond'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ENDARROW, 'endFill'], [mxConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-endthindiamondtrans', null).setAttribute('title', mxResources.get('diamondThin'));
	}));
	this.addItems(['-', 'image', 'link', '-', 'strokeColor', 'fillColor']);
	this.addItem('geSprite-gradientcolor', 'gradientColor').setAttribute('title', mxResources.get('gradient'));
	this.addItems(['shadow']);
	var items = this.addItems(['-', 'grid', 'guides']);
	
	var ucolor = this.unselectedBackground;
	var scolor = this.selectedBackground;
	
	// Syncs grid & guides button states
	this.editorUi.addListener('gridEnabledChanged', mxUtils.bind(this, function()
	{
		items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
	}));
	
	this.editorUi.addListener('guidesEnabledChanged', mxUtils.bind(this, function()
	{
		items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;
	}));
	
	this.editorUi.editor.addListener('updateGraphComponents', mxUtils.bind(this, function()
	{
		items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
		items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;
	}));
	
	items[1].style.background = (this.editorUi.actions.get('grid').selectedCallback()) ? scolor : ucolor;
	items[2].style.background = (this.editorUi.actions.get('guides').selectedCallback()) ? scolor : ucolor;
	
	var graph = this.editorUi.editor.graph;

	// Update font size and font family labels
	var update = mxUtils.bind(this, function()
	{
		var ff = 'Helvetica';
		var fs = '12';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		ff = state.style[mxConstants.STYLE_FONTFAMILY] || ff;
    		fs = state.style[mxConstants.STYLE_FONTSIZE] || fs;
    		
    		if (ff.length > 10)
    		{
    			ff = ff.substring(0, 8) + '...';
    		}
    		
    		fontElt.innerHTML = ff;
    		sizeElt.innerHTML = fs;
    	}
	});
	
    graph.getSelectionModel().addListener(mxEvent.CHANGE, update);
    graph.getModel().addListener(mxEvent.CHANGE, update);
	
	// Updates button states
    this.addEdgeSelectionHandler([line, linestart, lineend]);
	this.addSelectionHandler([align]);
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.createTextToolbar = function()
{
	var graph = this.editorUi.editor.graph;
	this.addItems(['undo', 'redo', '-']);
	
	var fontElt = this.addMenu(mxResources.get('style'), mxResources.get('style'), true, 'formatBlock');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	
	var fontElt = this.addMenu('Helvetica', mxResources.get('fontFamily'), true, 'fontFamily');
	fontElt.style.whiteSpace = 'nowrap';
	fontElt.style.overflow = 'hidden';
	fontElt.style.width = (mxClient.IS_QUIRKS) ? '76px' : '56px';
	
	this.addSeparator();
	
	var sizeElt = this.addMenu('12', mxResources.get('fontSize'), true, 'fontSize');
	sizeElt.style.whiteSpace = 'nowrap';
	sizeElt.style.overflow = 'hidden';
	sizeElt.style.width = (mxClient.IS_QUIRKS) ? '42px' : '22px';
	
	this.addItems(['-', 'bold', 'italic', 'underline']);

	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	this.addMenuFunction('geSprite-left', mxResources.get('align'), false, mxUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], 'geIcon geSprite geSprite-left', null,
				function() { document.execCommand('justifyleft'); }).setAttribute('title', mxResources.get('left'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], 'geIcon geSprite geSprite-center', null,
				function() { document.execCommand('justifycenter'); }).setAttribute('title', mxResources.get('center'));
		this.editorUi.menus.styleChange(menu, '', [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], 'geIcon geSprite geSprite-right', null,
				function() { document.execCommand('justifyright'); }).setAttribute('title', mxResources.get('right'));
	}));

	this.addMenuFunction('geSprite-fontcolor', mxResources.get('more') + '...', false, mxUtils.bind(this, function(menu)
	{
		// KNOWN: IE+FF don't return keyboard focus after color dialog (calling focus doesn't help)
		elt = menu.addItem('', null, this.editorUi.actions.get('fontColor').funct, null, 'geIcon geSprite geSprite-fontcolor');
		elt.setAttribute('title', mxResources.get('fontColor'));
		
		elt = menu.addItem('', null, this.editorUi.actions.get('backgroundColor').funct, null, 'geIcon geSprite geSprite-fontbackground');
		elt.setAttribute('title', mxResources.get('backgroundColor'));

		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('superscript');
		}), null, 'geIcon geSprite geSprite-superscript');
		elt.setAttribute('title', mxResources.get('superscript'));
		
		elt = menu.addItem('', null, mxUtils.bind(this, function()
		{
			document.execCommand('subscript');
		}), null, 'geIcon geSprite geSprite-subscript');
		elt.setAttribute('title', mxResources.get('subscript'));
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-orderedlist', mxResources.get('numberedList'), function()
	{
		document.execCommand('insertorderedlist');
	});
	
	this.addButton('geIcon geSprite geSprite-unorderedlist', mxResources.get('bulletedList'), function()
	{
		document.execCommand('insertunorderedlist');
	});
	
	this.addButton('geIcon geSprite geSprite-outdent', mxResources.get('decreaseIndent'), function()
	{
		document.execCommand('outdent');
	});
	
	this.addButton('geIcon geSprite geSprite-indent', mxResources.get('increaseIndent'), function()
	{
		document.execCommand('indent');
	});
	
	this.addSeparator();
	
	function getSelectedElement(name)
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
		
    	while (node != null)
    	{
    		if (node.nodeName == name)
    		{
    			return node;
    		}
    		
    		node = node.parentNode;
    	}
		
		return node;
	};
	
	function getParentElement(node, name)
	{
    	var result = node;
    	
    	while (result != null)
    	{
    		if (result.nodeName == name)
    		{
    			break;
    		}
    		
    		result = result.parentNode;
    	}
    	
    	return result;
	};
	
	function getSelectedCell()
	{
		return getSelectedElement('TD');
	};

	function getSelectedRow()
	{
		return getSelectedElement('TR');
	};

	function getParentTable(node)
	{
		return getParentElement(node, 'TABLE');
	};

	function selectNode(node)
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
	
	function pasteHtmlAtCaret(html)
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
	
	// TODO: Disable toolbar button for HTML code view
	this.addButton('geIcon geSprite geSprite-link', mxResources.get('insertLink'), mxUtils.bind(this, function()
	{
		if (graph.cellEditor.isContentEditing())
		{
			var link = getSelectedElement('A');
			var oldValue = '';
			
			if (link != null)
			{
				oldValue = link.getAttribute('href');
			}
			
			var selState = graph.cellEditor.saveSelection();
			
			this.editorUi.showLinkDialog(oldValue, mxResources.get('apply'), mxUtils.bind(this, function(value)
			{
	    		graph.cellEditor.restoreSelection(selState);
				
				// To find the new link, we create a list of all existing links first
	    		// LATER: Refactor for reuse with code for finding inserted image below
				var tmp = graph.cellEditor.text2.getElementsByTagName('a');
				var oldLinks = [];
				
				for (var i = 0; i < tmp.length; i++)
				{
					oldLinks.push(tmp[i]);
				}
	
				if (value != null && value.length > 0)
				{
					document.execCommand('createlink', false, mxUtils.trim(value));
					
					// Adds target="_blank" for the new link
					var newLinks = graph.cellEditor.text2.getElementsByTagName('a');
					
					if (newLinks.length == oldLinks.length + 1)
					{
						// Inverse order in favor of appended links
						for (var i = newLinks.length - 1; i >= 0; i--)
						{
							if (i == 0 || newLinks[i] != oldLinks[i - 1])
							{
								newLinks[i].setAttribute('target', '_blank');
								break;
							}
						}
					}
				}
			}));
		}
	}));
	
	// TODO: Disable toolbar button for HTML code view
	this.addItems(['image']);

	this.addButton('geIcon geSprite geSprite-horizontalrule', mxResources.get('insertHorizontalRule'), function()
	{
		document.execCommand('inserthorizontalrule');
	});
	
	// KNOWN: All table stuff does not work with undo/redo
	// KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
	// to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
	var elt = this.addMenuFunction('geIcon geSprite geSprite-table', mxResources.get('table'), false, mxUtils.bind(this, function(menu)
	{
		var cell = getSelectedCell();
		var row = getSelectedRow();

		if (row == null)
    	{
			function createTable(rows, cols)
			{
				var html = ['<table>'];
				
				for (var i = 0; i < rows; i++)
				{
					html.push('<tr>');
					
					for (var j = 0; j < cols; j++)
					{
						html.push('<td><br></td>');
					}
					
					html.push('</tr>');
				}
				
				html.push('</table>');
				
				return html.join('');
			};
			
			// Show table size dialog
			var elt2 = menu.addItem('', null, mxUtils.bind(this, function(evt)
			{
				var td = getParentElement(mxEvent.getSource(evt), 'TD');
				
				if (td != null)
				{
					var row2 = getParentElement(td, 'TR');
					
					// To find the new link, we create a list of all existing links first
		    		// LATER: Refactor for reuse with code for finding inserted image below
					var tmp = graph.cellEditor.text2.getElementsByTagName('table');
					var oldTables = [];
					
					for (var i = 0; i < tmp.length; i++)
					{
						oldTables.push(tmp[i]);
					}
					
					// Finding the new table will work with insertHTML, but IE does not support that
					pasteHtmlAtCaret(createTable(row2.sectionRowIndex + 1, td.cellIndex + 1));
					
					// Moves cursor to first table cell
					var newTables = graph.cellEditor.text2.getElementsByTagName('table');
					
					if (newTables.length == oldTables.length + 1)
					{
						// Inverse order in favor of appended tables
						for (var i = newTables.length - 1; i >= 0; i--)
						{
							if (i == 0 || newTables[i] != oldTables[i - 1])
							{
								selectNode(newTables[i].rows[0].cells[0]);
								break;
							}
						}
					}
				}
			}));
			
			// Quirks mode does not add cell padding if cell is empty, needs good old spacer solution
			var quirksCellHtml = '<img src="' + mxClient.imageBasePath + '/transparent.gif' + '" width="16" height="16"/>';

			function createPicker(rows, cols)
			{
				var table2 = document.createElement('table');
				table2.setAttribute('border', '1');
				table2.style.borderCollapse = 'collapse';

				if (!mxClient.IS_QUIRKS)
				{
					table2.setAttribute('cellPadding', '8');
				}
				
				for (var i = 0; i < rows; i++)
				{
					var row = table2.insertRow(i);
					
					for (var j = 0; j < cols; j++)
					{
						var cell = row.insertCell(-1);
						
						if (mxClient.IS_QUIRKS)
						{
							cell.innerHTML = quirksCellHtml;
						}
					}
				}
				
				return table2;
			};

			function extendPicker(picker, rows, cols)
			{
				for (var i = picker.rows.length; i < rows; i++)
				{
					var row = picker.insertRow(i);
					
					for (var j = 0; j < picker.rows[0].cells.length; j++)
					{
						var cell = row.insertCell(-1);
						
						if (mxClient.IS_QUIRKS)
						{
							cell.innerHTML = quirksCellHtml;
						}
					}
				}
				
				for (var i = 0; i < picker.rows.length; i++)
				{
					var row = picker.rows[i];
					
					for (var j = row.cells.length; j < cols; j++)
					{
						var cell = row.insertCell(-1);
						
						if (mxClient.IS_QUIRKS)
						{
							cell.innerHTML = quirksCellHtml;
						}
					}
				}
			};
			
			elt2.firstChild.innerHTML = '';
			var picker = createPicker(5, 5);
			elt2.firstChild.appendChild(picker);
			
			var label = document.createElement('div');
			label.style.padding = '4px';
			label.style.fontSize = '12px';
			label.innerHTML = '1x1';
			elt2.firstChild.appendChild(label);
			
			mxEvent.addListener(picker, 'mouseover', function(e)
			{
				var td = getParentElement(mxEvent.getSource(e), 'TD');
				
				if (td != null)
				{
					var row2 = getParentElement(td, 'TR');
					extendPicker(picker, Math.min(20, row2.sectionRowIndex + 2), Math.min(20, td.cellIndex + 2));
					label.innerHTML = (td.cellIndex + 1) + 'x' + (row2.sectionRowIndex + 1);
					
					for (var i = 0; i < picker.rows.length; i++)
					{
						var r = picker.rows[i];
						
						for (var j = 0; j < r.cells.length; j++)
						{
							var cell = r.cells[j];
							
							if (i <= row2.sectionRowIndex && j <= td.cellIndex)
							{
								cell.style.backgroundColor = 'blue';
							}
							else
							{
								cell.style.backgroundColor = 'white';
							}
						}
					}
					
					mxEvent.consume(e);
				}
			});
    	}
		else
    	{
			var table = getParentTable(row);

			function insertRow(index)
			{
				var tblBodyObj = table.tBodies[0];
				var colCount = (tblBodyObj.rows.length > 0) ? tblBodyObj.rows[0].cells.length : 1;
				var newRow = tblBodyObj.insertRow(index);
				
				for (var i = 0; i < colCount; i++)
				{
					var newCell = newRow.insertCell(-1);
					mxUtils.br(newCell);
				}

				selectNode(newRow.cells[0]);
			}

			function deleteColumn(index)
			{
				var tblBodyObj = table.tBodies[0];
				var allRows = tblBodyObj.rows;
				
				for (var i = 0; i < allRows.length; i++)
				{
					if (allRows[i].cells.length > index)
					{
						allRows[i].deleteCell(index);
					}
				}
			};

			function insertColumn(index)
			{
				var tblHeadObj = table.tHead;
				
				if (tblHeadObj != null)
				{
					// TODO: use colIndex
					for (var h = 0; h < tblHeadObj.rows.length; h++)
					{
						var newTH = document.createElement('th');
						tblHeadObj.rows[h].appendChild(newTH);
						mxUtils.br(newTH);
					}
				}

				var tblBodyObj = table.tBodies[0];
				
				for (var i = 0; i < tblBodyObj.rows.length; i++)
				{
					var newCell = tblBodyObj.rows[i].insertCell(index);
					mxUtils.br(newCell);
				}
				
				selectNode(tblBodyObj.rows[0].cells[(index >= 0) ? index : tblBodyObj.rows[0].cells.length - 1]);
			};
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				insertColumn((cell != null) ? cell.cellIndex : 0);
			}), null, 'geIcon geSprite geSprite-insertcolumnbefore');
			elt.setAttribute('title', mxResources.get('insertColumnBefore'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				insertColumn((cell != null) ? cell.cellIndex + 1 : -1);
			}), null, 'geIcon geSprite geSprite-insertcolumnafter');
			elt.setAttribute('title', mxResources.get('insertColumnAfter'));

			elt = menu.addItem('Delete column', null, mxUtils.bind(this, function()
			{
				if (cell != null)
				{
					deleteColumn(cell.cellIndex);
				}
			}), null, 'geIcon geSprite geSprite-deletecolumn');
			elt.setAttribute('title', mxResources.get('deleteColumn'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				insertRow(row.sectionRowIndex);
			}), null, 'geIcon geSprite geSprite-insertrowbefore');
			elt.setAttribute('title', mxResources.get('insertRowBefore'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				insertRow(row.sectionRowIndex + 1);
			}), null, 'geIcon geSprite geSprite-insertrowafter');
			elt.setAttribute('title', mxResources.get('insertRowAfter'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				var tblBodyObj = table.tBodies[0];
				tblBodyObj.deleteRow(row.sectionRowIndex);
			}), null, 'geIcon geSprite geSprite-deleterow');
			elt.setAttribute('title', mxResources.get('deleteRow'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				var colorValue = table.style.borderColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });

				var selState = graph.cellEditor.saveSelection();
				
				var dlg = new ColorDialog(this.editorUi, colorValue || 'none', mxUtils.bind(this, function(color)
				{
					graph.cellEditor.restoreSelection(selState);
					
					if (color == null || color == mxConstants.NONE)
					{
						table.removeAttribute('border');
						table.style.border = '';
						table.style.borderCollapse = '';
					}
					else
					{
						table.setAttribute('border', '1');
						table.style.border = '1px solid ' + color;
						table.style.borderCollapse = 'collapse';
					}
				}), function()
				{
					graph.cellEditor.restoreSelection(selState);
				});
				this.editorUi.showDialog(dlg.container, 220, 400, true, false);
				dlg.init();
			}), null, 'geIcon geSprite geSprite-strokecolor');
			elt.setAttribute('title', mxResources.get('borderColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				// Converts rgb(r,g,b) values
				var colorValue = table.style.backgroundColor.replace(
					    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
					    function($0, $1, $2, $3) {
					        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
					    });
	
				var selState = graph.cellEditor.saveSelection();
				
				var dlg = new ColorDialog(this.editorUi, colorValue || 'none', mxUtils.bind(this, function(color)
				{
					graph.cellEditor.restoreSelection(selState);
					
					if (color == null || color == mxConstants.NONE)
					{
						table.style.backgroundColor = '';
					}
					else
					{
						table.style.backgroundColor = color;
					}
				}), function()
				{
					graph.cellEditor.restoreSelection(selState);
				});
				this.editorUi.showDialog(dlg.container, 220, 400, true, false);
				dlg.init();
			}), null, 'geIcon geSprite geSprite-fillcolor');
			elt.setAttribute('title', mxResources.get('backgroundColor'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				var value = table.getAttribute('cellPadding') || 0;
				
				var dlg = new FilenameDialog(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue)
				{
					if (newValue != null && newValue.length > 0)
					{
						table.setAttribute('cellPadding', newValue);
					}
					else
					{
						table.removeAttribute('cellPadding');
					}
				}), mxResources.get('spacing'));
				this.editorUi.showDialog(dlg.container, 300, 80, true, true);
				dlg.init();
			}), null, 'geIcon geSprite geSprite-fit');
			elt.setAttribute('title', mxResources.get('spacing'));
			
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'left');
			}), null, 'geIcon geSprite geSprite-left');
			elt.setAttribute('title', mxResources.get('left'));

			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'center');
			}), null, 'geIcon geSprite geSprite-center');
			elt.setAttribute('title', mxResources.get('center'));
				
			elt = menu.addItem('', null, mxUtils.bind(this, function()
			{
				table.setAttribute('align', 'right');
			}), null, 'geIcon geSprite geSprite-right');
			elt.setAttribute('title', mxResources.get('right'));
			
    	}
	}));
	
	this.addSeparator();
	
	this.addButton('geIcon geSprite geSprite-removeformat', mxResources.get('removeFormat'), function()
	{
		document.execCommand('removeformat');
	});
	
	this.addButton('geIcon geSprite geSprite-code', mxResources.get('html'), function()
	{
		graph.cellEditor.toggleViewMode();
	});
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.hideMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
		this.currentMenu.destroy();
		this.currentMenu = null;
	}
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function(label, tooltip, showLabels, name)
{
	var menu = this.editorUi.menus.get(name);
	var elt = this.addMenuFunction(label, tooltip, showLabels, menu.funct);
	
	menu.addListener('stateChanged', function()
	{
		elt.setEnabled(menu.enabled);
	});

	return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function(label, tooltip, showLabels, funct)
{
	var elt = (showLabels) ? this.createLabel(label) : this.createButton(label);
	this.initElement(elt, tooltip);
	this.addMenuHandler(elt, showLabels, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function()
{
	var elt = document.createElement('div');
	elt.className = 'geSeparator';
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function(keys)
{
	var items = [];
	
	for (var i = 0; i < keys.length; i++)
	{
		var key = keys[i];
		
		if (key == '-')
		{
			items.push(this.addSeparator());
		}
		else
		{
			items.push(this.addItem('geSprite-' + key.toLowerCase(), key));
		}
	}
	
	return items;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function(sprite, key)
{
	var action = this.editorUi.actions.get(key);
	var elt = null;
	
	if (action != null)
	{
		elt = this.addButton(sprite, action.label, action.funct);
		elt.setEnabled(action.enabled);
		
		action.addListener('stateChanged', function()
		{
			elt.setEnabled(action.enabled);
		});
	}
	
	return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function(classname, tooltip, funct)
{
	var elt = this.createButton(classname);
	
	this.initElement(elt, tooltip);
	this.addClickHandler(elt, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
Toolbar.prototype.addSelectionHandler = function(items)
{
	var graph = this.editorUi.editor.graph;
	
	var selectionListener = function()
    {
    	var selected = !graph.isSelectionEmpty();
    	
    	for (var i = 0; i < items.length; i++)
    	{
    		items[i].setEnabled(selected);
    	}
    };
	    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);
    selectionListener();
};

/**
 * Updates the states of the given toolbar items based on the selection.
 */
Toolbar.prototype.addEdgeSelectionHandler = function(items)
{
	var graph = this.editorUi.editor.graph;
	
	var selectionListener = function()
    {
		var edgeSelected = false;
		
		if (!graph.isSelectionEmpty())
		{
			var cells = graph.getSelectionCells();
			
			for (var i = 0; i < cells.length; i++)
			{
				if (graph.getModel().isEdge(cells[i]))
				{
					edgeSelected = true;
					break;
				}
			}
		}
		
    	for (var i = 0; i < items.length; i++)
    	{
    		items[i].setEnabled(edgeSelected);
    	}
    };
	    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);
    selectionListener();
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function(elt, tooltip)
{
	// Adds tooltip
	if (tooltip != null)
	{
		elt.setAttribute('title', tooltip);
	}

	this.addEnabledState(elt);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addEnabledState = function(elt)
{
	var classname = elt.className;
	
	elt.setEnabled = function(value)
	{
		elt.enabled = value;
		
		if (value)
		{
			elt.className = classname;
			//elt.style.display = '';
		}
		else
		{
			elt.className = classname + ' mxDisabled';
			//elt.style.display = 'none';
		}
	};
	
	elt.setEnabled(true);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addClickHandler = function(elt, funct)
{
	if (funct != null)
	{
		mxEvent.addListener(elt, 'click', function(evt)
		{
			if (elt.enabled)
			{
				funct(evt);
			}
			
			mxEvent.consume(evt);
		});
		
		if (document.documentMode != null && document.documentMode >= 9)
		{
			// Prevents focus
			mxEvent.addListener(elt, 'mousedown', function(evt)
			{
				evt.preventDefault();
			});
		}
	}
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function(classname)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geButton';

	var inner = document.createElement('div');
	
	if (classname != null)
	{
		inner.className = 'geSprite ' + classname;
	}
	
	elt.appendChild(inner);
	
	return elt;
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createLabel = function(label, tooltip)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geLabel';
	mxUtils.write(elt, label);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.addMenuHandler = function(elt, showLabels, funct, showAll)
{
	if (funct != null)
	{
		var graph = this.editorUi.editor.graph;
		var menu = null;

		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt)
		{
			if (elt.enabled == null || elt.enabled)
			{
				graph.popupMenuHandler.hideMenu();
				menu = new mxPopupMenu(funct);
				menu.div.className += ' geToolbarMenu';
				menu.showDisabled = showAll;
				menu.labels = showLabels;
				menu.autoExpand = true;

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.currentMenu = menu;
			}
			
			mxEvent.consume(evt);
		}));
		
		if (document.documentMode != null && document.documentMode >= 9)
		{
			// Prevents focus
			mxEvent.addListener(elt, 'mousedown', function(evt)
			{
				evt.preventDefault();
			});
		}
	}
};
