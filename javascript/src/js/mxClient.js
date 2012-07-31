/**
 * $Id: mxClient.js,v 1.203 2012-07-19 15:19:07 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
var mxClient =
{

	/**
	 * Class: mxClient
	 *
	 * Bootstrapping mechanism for the mxGraph thin client. The production version
	 * of this file contains all code required to run the mxGraph thin client, as
	 * well as global constants to identify the browser and operating system in
	 * use. You may have to load chrome://global/content/contentAreaUtils.js in
	 * your page to disable certain security restrictions in Mozilla.
	 * 
	 * Variable: VERSION
	 *
	 * Contains the current version of the mxGraph library. The strings that
	 * communicate versions of mxGraph use the following format.
	 * 
	 * versionMajor.versionMinor.buildNumber.revisionNumber
	 * 
	 * Current version is 1.10.2.1.
	 */
	VERSION: '1.10.2.1',

	/**
	 * Variable: IS_IE
	 *
	 * True if the current browser is Internet Explorer.
	 */
	IS_IE: navigator.userAgent.indexOf('MSIE') >= 0,

	/**
	 * Variable: IS_IE6
	 *
	 * True if the current browser is Internet Explorer 6.x.
	 */
	IS_IE6: navigator.userAgent.indexOf('MSIE 6') >= 0,

	/**
	 * Variable: IS_QUIRKS
	 *
	 * True if the current browser is Internet Explorer and it is in quirks mode.
	 */
	IS_QUIRKS: navigator.userAgent.indexOf('MSIE') >= 0 && (document.documentMode == null || document.documentMode == 5),

	/**
	 * Variable: IS_NS
	 *
	 * True if the current browser is Netscape (including Firefox).
	 */
  	IS_NS: navigator.userAgent.indexOf('Mozilla/') >= 0 &&
  		navigator.userAgent.indexOf('MSIE') < 0,

	/**
	 * Variable: IS_OP
	 *
	 * True if the current browser is Opera.
	 */
  	IS_OP: navigator.userAgent.indexOf('Opera/') >= 0,

	/**
	 * Variable: IS_OT
	 *
	 * True if -o-transform is available as a CSS style. This is the case
	 * for Opera browsers that use Presto/2.5 and later.
	 */
  	IS_OT: navigator.userAgent.indexOf('Presto/2.4.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.3.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.2.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.1.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.0.') < 0 &&
  		navigator.userAgent.indexOf('Presto/1.') < 0,
  	
	/**
	 * Variable: IS_SF
	 *
	 * True if the current browser is Safari.
	 */
  	IS_SF: navigator.userAgent.indexOf('AppleWebKit/') >= 0 &&
  		navigator.userAgent.indexOf('Chrome/') < 0,
  	
	/**
	 * Variable: IS_GC
	 *
	 * True if the current browser is Google Chrome.
	 */
  	IS_GC: navigator.userAgent.indexOf('Chrome/') >= 0,
  	
	/**
	 * Variable: IS_MT
	 *
	 * True if -moz-transform is available as a CSS style. This is the case
	 * for all Firefox-based browsers newer than or equal 3, such as Camino,
	 * Iceweasel, Seamonkey and Iceape.
	 */
  	IS_MT: (navigator.userAgent.indexOf('Firefox/') >= 0 &&
		navigator.userAgent.indexOf('Firefox/1.') < 0 &&
  		navigator.userAgent.indexOf('Firefox/2.') < 0) ||
  		(navigator.userAgent.indexOf('Iceweasel/') >= 0 &&
  		navigator.userAgent.indexOf('Iceweasel/1.') < 0 &&
  		navigator.userAgent.indexOf('Iceweasel/2.') < 0) ||
  		(navigator.userAgent.indexOf('SeaMonkey/') >= 0 &&
  		navigator.userAgent.indexOf('SeaMonkey/1.') < 0) ||
  		(navigator.userAgent.indexOf('Iceape/') >= 0 &&
  		navigator.userAgent.indexOf('Iceape/1.') < 0),

	/**
	 * Variable: IS_SVG
	 *
	 * True if the browser supports SVG.
	 */
  	IS_SVG: navigator.userAgent.indexOf('Firefox/') >= 0 || // FF and Camino
	  	navigator.userAgent.indexOf('Iceweasel/') >= 0 || // Firefox on Debian
	  	navigator.userAgent.indexOf('Seamonkey/') >= 0 || // Firefox-based
	  	navigator.userAgent.indexOf('Iceape/') >= 0 || // Seamonkey on Debian
	  	navigator.userAgent.indexOf('Galeon/') >= 0 || // Gnome Browser (old)
	  	navigator.userAgent.indexOf('Epiphany/') >= 0 || // Gnome Browser (new)
	  	navigator.userAgent.indexOf('AppleWebKit/') >= 0 || // Safari/Google Chrome
	  	navigator.userAgent.indexOf('Gecko/') >= 0 || // Netscape/Gecko
	  	navigator.userAgent.indexOf('Opera/') >= 0,
	  	
  	 
	/**
	 * Variable: NO_FO
	 *
	 * True if foreignObject support is not available. This is the case for
	 * Opera and older SVG-based browsers. IE does not require this type
	 * of tag.
	 */
  	NO_FO: navigator.userAgent.indexOf('Firefox/1.') >= 0 ||
  		navigator.userAgent.indexOf('Iceweasel/1.') >= 0 ||
  		navigator.userAgent.indexOf('Firefox/2.') >= 0 ||
	  	navigator.userAgent.indexOf('Iceweasel/2.') >= 0 ||
	  	navigator.userAgent.indexOf('SeaMonkey/1.') >= 0 ||
	  	navigator.userAgent.indexOf('Iceape/1.') >= 0 ||
	  	navigator.userAgent.indexOf('Camino/1.') >= 0 ||
	  	navigator.userAgent.indexOf('Epiphany/2.') >= 0 ||
	  	navigator.userAgent.indexOf('Opera/') >= 0 ||
	  	navigator.userAgent.indexOf('MSIE') >= 0 ||
	  	navigator.userAgent.indexOf('Mozilla/2.') >= 0, // Safari/Google Chrome

	/**
	 * Variable: IS_VML
	 *
	 * True if the browser supports VML.
	 */
  	IS_VML: navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER',

	/**
	 * Variable: IS_MAC
	 *
	 * True if the client is a Mac.
	 */
  	IS_MAC: navigator.userAgent.toUpperCase().indexOf('MACINTOSH') > 0,

	/**
	 * Variable: IS_TOUCH
	 *
	 * True if this client uses a touch interface (no mouse). Currently this
	 * detects IPads, IPods, IPhones and Android devices.
	 */
  	IS_TOUCH: navigator.userAgent.toUpperCase().indexOf('IPAD') > 0 ||
  			  navigator.userAgent.toUpperCase().indexOf('IPOD') > 0 ||
  			  navigator.userAgent.toUpperCase().indexOf('IPHONE') > 0 ||
  			  navigator.userAgent.toUpperCase().indexOf('ANDROID') > 0,

	/**
	 * Variable: IS_LOCAL
	 *
	 * True if the documents location does not start with http:// or https://.
	 */
  	IS_LOCAL: document.location.href.indexOf('http://') < 0 &&
  			  document.location.href.indexOf('https://') < 0,

	/**
	 * Function: isBrowserSupported
	 *
	 * Returns true if the current browser is supported, that is, if
	 * <mxClient.IS_VML> or <mxClient.IS_SVG> is true.
	 * 
	 * Example:
	 * 
	 * (code)
	 * if (!mxClient.isBrowserSupported())
	 * {
	 *   mxUtils.error('Browser is not supported!', 200, false);
	 * }
	 * (end)
	 */
	isBrowserSupported: function()
	{
		return mxClient.IS_VML || mxClient.IS_SVG;
	},

	/**
	 * Function: link
	 *
	 * Adds a link node to the head of the document. Use this
	 * to add a stylesheet to the page as follows:
	 *
	 * (code)
	 * mxClient.link('stylesheet', filename);
	 * (end)
	 *
	 * where filename is the (relative) URL of the stylesheet. The charset
	 * is hardcoded to ISO-8859-1 and the type is text/css.
	 * 
	 * Parameters:
	 * 
	 * rel - String that represents the rel attribute of the link node.
	 * href - String that represents the href attribute of the link node.
	 * doc - Optional parent document of the link node.
	 */
	link: function(rel, href, doc)
	{
		doc = doc || document;

		// Workaround for Operation Aborted in IE6 if base tag is used in head
		if (mxClient.IS_IE6)
		{
			doc.write('<link rel="'+rel+'" href="'+href+'" charset="ISO-8859-1" type="text/css"/>');
		}
		else
		{	
			var link = doc.createElement('link');
			
			link.setAttribute('rel', rel);
			link.setAttribute('href', href);
			link.setAttribute('charset', 'ISO-8859-1');
			link.setAttribute('type', 'text/css');
			
			var head = doc.getElementsByTagName('head')[0];
	   		head.appendChild(link);
		}
	},
	
	/**
	 * Function: include
	 *
	 * Dynamically adds a script node to the document header.
	 * 
	 * In production environments, the includes are resolved in the mxClient.js
	 * file to reduce the number of requests required for client startup. This
	 * function should only be used in development environments, but not in
	 * production systems.
	 */
	include: function(src)
	{
		document.write('<script src="'+src+'"></script>');
	},
	
	/**
	 * Function: dispose
	 * 
	 * Frees up memory in IE by resolving cyclic dependencies between the DOM
	 * and the JavaScript objects. This is always invoked in IE when the page
	 * unloads.
	 */
	dispose: function()
	{
		// Cleans all objects where listeners have been added
		for (var i = 0; i < mxEvent.objects.length; i++)
		{
			if (mxEvent.objects[i].mxListenerList != null)
			{
				mxEvent.removeAllListeners(mxEvent.objects[i]);
			}
		}
	}

};

/**
 * Variable: mxLoadResources
 * 
 * Optional global config variable to toggle loading of the two resource files
 * in <mxGraph> and <mxEditor>. Default is true. NOTE: This is a global variable,
 * not a variable of mxClient.
 *
 * (code)
 * <script type="text/javascript">
 * 		var mxLoadResources = false;
 * </script>
 * <script type="text/javascript" src="/path/to/core/directory/js/mxClient.js"></script>
 * (end)
 */
if (typeof(mxLoadResources) == 'undefined')
{
	mxLoadResources = true;
}

/**
 * Variable: mxLoadStylesheets
 * 
 * Optional global config variable to toggle loading of the CSS files when
 * the library is initialized. Default is true. NOTE: This is a global variable,
 * not a variable of mxClient.
 *
 * (code)
 * <script type="text/javascript">
 * 		var mxLoadStylesheets = false;
 * </script>
 * <script type="text/javascript" src="/path/to/core/directory/js/mxClient.js"></script>
 * (end)
 */
if (typeof(mxLoadStylesheets) == 'undefined')
{
	mxLoadStylesheets = true;
}

/**
 * Variable: basePath
 *
 * Basepath for all URLs in the core without trailing slash. Default is '.'.
 * Set mxBasePath prior to loading the mxClient library as follows to override
 * this setting:
 *
 * (code)
 * <script type="text/javascript">
 * 		mxBasePath = '/path/to/core/directory';
 * </script>
 * <script type="text/javascript" src="/path/to/core/directory/js/mxClient.js"></script>
 * (end)
 * 
 * When using a relative path, the path is relative to the URL of the page that
 * contains the assignment. Trailing slashes are automatically removed.
 */
if (typeof(mxBasePath) != 'undefined' && mxBasePath.length > 0)
{
	// Adds a trailing slash if required
	if (mxBasePath.substring(mxBasePath.length - 1) == '/')
	{
		mxBasePath = mxBasePath.substring(0, mxBasePath.length - 1);
	}

	mxClient.basePath = mxBasePath;
}
else
{
	mxClient.basePath = '.';
}

/**
 * Variable: imageBasePath
 *
 * Basepath for all images URLs in the core without trailing slash. Default is
 * <mxClient.basePath> + '/images'. Set mxImageBasePath prior to loading the
 * mxClient library as follows to override this setting:
 *
 * (code)
 * <script type="text/javascript">
 * 		mxImageBasePath = '/path/to/image/directory';
 * </script>
 * <script type="text/javascript" src="/path/to/core/directory/js/mxClient.js"></script>
 * (end)
 * 
 * When using a relative path, the path is relative to the URL of the page that
 * contains the assignment. Trailing slashes are automatically removed.
 */
if (typeof(mxImageBasePath) != 'undefined' && mxImageBasePath.length > 0)
{
	// Adds a trailing slash if required
	if (mxImageBasePath.substring(mxImageBasePath.length - 1) == '/')
	{
		mxImageBasePath = mxImageBasePath.substring(0, mxImageBasePath.length - 1);
	}

	mxClient.imageBasePath = mxImageBasePath;
}
else
{
	mxClient.imageBasePath = mxClient.basePath + '/images';	
}

/**
 * Variable: language
 *
 * Defines the language of the client, eg. en for english, de for german etc.
 * The special value 'none' will disable all built-in internationalization and
 * resource loading. See <mxResources.getSpecialBundle> for handling identifiers
 * with and without a dash.
 * 
 * Set mxLanguage prior to loading the mxClient library as follows to override
 * this setting:
 *
 * (code)
 * <script type="text/javascript">
 * 		mxLanguage = 'en';
 * </script>
 * <script type="text/javascript" src="js/mxClient.js"></script>
 * (end)
 * 
 * If internationalization is disabled, then the following variables should be
 * overridden to reflect the current language of the system. These variables are
 * cleared when i18n is disabled.
 * <mxEditor.askZoomResource>, <mxEditor.lastSavedResource>,
 * <mxEditor.currentFileResource>, <mxEditor.propertiesResource>,
 * <mxEditor.tasksResource>, <mxEditor.helpResource>, <mxEditor.outlineResource>,
 * <mxElbowEdgeHandler.doubleClickOrientationResource>, <mxUtils.errorResource>,
 * <mxUtils.closeResource>, <mxGraphSelectionModel.doneResource>,
 * <mxGraphSelectionModel.updatingSelectionResource>, <mxGraphView.doneResource>,
 * <mxGraphView.updatingDocumentResource>, <mxCellRenderer.collapseExpandResource>,
 * <mxGraph.containsValidationErrorsResource> and
 * <mxGraph.alreadyConnectedResource>.
 */
if (typeof(mxLanguage) != 'undefined')
{
	mxClient.language = mxLanguage;
}
else
{
	mxClient.language = (mxClient.IS_IE) ? navigator.userLanguage : navigator.language;
}

/**
 * Variable: defaultLanguage
 * 
 * Defines the default language which is used in the common resource files. Any
 * resources for this language will only load the common resource file, but not
 * the language-specific resource file. Default is 'en'.
 * 
 * Set mxDefaultLanguage prior to loading the mxClient library as follows to override
 * this setting:
 *
 * (code)
 * <script type="text/javascript">
 * 		mxDefaultLanguage = 'de';
 * </script>
 * <script type="text/javascript" src="js/mxClient.js"></script>
 * (end)
 */
if (typeof(mxDefaultLanguage) != 'undefined')
{
	mxClient.defaultLanguage = mxDefaultLanguage;
}
else
{
	mxClient.defaultLanguage = 'en';
}

// Adds all required stylesheets and namespaces
if (mxLoadStylesheets)
{
	mxClient.link('stylesheet', mxClient.basePath + '/css/common.css');
}

/**
 * Variable: languages
 *
 * Defines the optional array of all supported language extensions. The default
 * language does not have to be part of this list. See
 * <mxResources.isLanguageSupported>.
 *
 * (code)
 * <script type="text/javascript">
 * 		mxLanguages = ['de', 'it', 'fr'];
 * </script>
 * <script type="text/javascript" src="js/mxClient.js"></script>
 * (end)
 * 
 * This is used to avoid unnecessary requests to language files, ie. if a 404
 * will be returned.
 */
if (typeof(mxLanguages) != 'undefined')
{
	mxClient.languages = mxLanguages;
}

if (mxClient.IS_IE)
{
	// IE9/10 standards mode uses SVG (VML is broken)
	if (document.documentMode >= 9)
	{
		mxClient.IS_VML = false;
		mxClient.IS_SVG = true;
	}
	else
	{
		// Enables support for IE8 standards mode. Note that this requires all attributes for VML
		// elements to be set using direct notation, ie. node.attr = value. The use of setAttribute
		// is not possible. See mxShape.init for more code to handle this specific document mode.
		if (document.documentMode == 8)
		{
			document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
			document.namespaces.add('o', 'urn:schemas-microsoft-com:office:office', '#default#VML');
		}
		else
		{
			document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
			document.namespaces.add('o', 'urn:schemas-microsoft-com:office:office');
		}
		
        var ss = document.createStyleSheet();
        ss.cssText = 'v\\:*{behavior:url(#default#VML)}o\\:*{behavior:url(#default#VML)}';
        
        if (mxLoadStylesheets)
        {
        	mxClient.link('stylesheet', mxClient.basePath + '/css/explorer.css');
        }
	}

	// Cleans up resources when the application terminates
	window.attachEvent('onunload', mxClient.dispose);
}

mxClient.include(mxClient.basePath+'/js/util/mxLog.js');
mxClient.include(mxClient.basePath+'/js/util/mxObjectIdentity.js');
mxClient.include(mxClient.basePath+'/js/util/mxDictionary.js');
mxClient.include(mxClient.basePath+'/js/util/mxResources.js');
mxClient.include(mxClient.basePath+'/js/util/mxPoint.js');
mxClient.include(mxClient.basePath+'/js/util/mxRectangle.js');
mxClient.include(mxClient.basePath+'/js/util/mxEffects.js');
mxClient.include(mxClient.basePath+'/js/util/mxUtils.js');
mxClient.include(mxClient.basePath+'/js/util/mxConstants.js');
mxClient.include(mxClient.basePath+'/js/util/mxEventObject.js');
mxClient.include(mxClient.basePath+'/js/util/mxMouseEvent.js');
mxClient.include(mxClient.basePath+'/js/util/mxEventSource.js');
mxClient.include(mxClient.basePath+'/js/util/mxEvent.js');
mxClient.include(mxClient.basePath+'/js/util/mxXmlRequest.js');
mxClient.include(mxClient.basePath+'/js/util/mxClipboard.js');
mxClient.include(mxClient.basePath+'/js/util/mxWindow.js');
mxClient.include(mxClient.basePath+'/js/util/mxForm.js');
mxClient.include(mxClient.basePath+'/js/util/mxImage.js');
mxClient.include(mxClient.basePath+'/js/util/mxDivResizer.js');
mxClient.include(mxClient.basePath+'/js/util/mxDragSource.js');
mxClient.include(mxClient.basePath+'/js/util/mxToolbar.js');
mxClient.include(mxClient.basePath+'/js/util/mxSession.js');
mxClient.include(mxClient.basePath+'/js/util/mxUndoableEdit.js');
mxClient.include(mxClient.basePath+'/js/util/mxUndoManager.js');
mxClient.include(mxClient.basePath+'/js/util/mxUrlConverter.js');
mxClient.include(mxClient.basePath+'/js/util/mxPanningManager.js');
mxClient.include(mxClient.basePath+'/js/util/mxPath.js');
mxClient.include(mxClient.basePath+'/js/util/mxPopupMenu.js');
mxClient.include(mxClient.basePath+'/js/util/mxAutoSaveManager.js');
mxClient.include(mxClient.basePath+'/js/util/mxAnimation.js');
mxClient.include(mxClient.basePath+'/js/util/mxMorphing.js');
mxClient.include(mxClient.basePath+'/js/util/mxImageBundle.js');
mxClient.include(mxClient.basePath+'/js/util/mxImageExport.js');
mxClient.include(mxClient.basePath+'/js/util/mxXmlCanvas2D.js');
mxClient.include(mxClient.basePath+'/js/util/mxSvgCanvas2D.js');
mxClient.include(mxClient.basePath+'/js/util/mxGuide.js');
mxClient.include(mxClient.basePath+'/js/shape/mxShape.js');
mxClient.include(mxClient.basePath+'/js/shape/mxStencil.js');
mxClient.include(mxClient.basePath+'/js/shape/mxStencilRegistry.js');
mxClient.include(mxClient.basePath+'/js/shape/mxStencilShape.js');
mxClient.include(mxClient.basePath+'/js/shape/mxMarker.js');
mxClient.include(mxClient.basePath+'/js/shape/mxActor.js');
mxClient.include(mxClient.basePath+'/js/shape/mxCloud.js');
mxClient.include(mxClient.basePath+'/js/shape/mxRectangleShape.js');
mxClient.include(mxClient.basePath+'/js/shape/mxEllipse.js');
mxClient.include(mxClient.basePath+'/js/shape/mxDoubleEllipse.js');
mxClient.include(mxClient.basePath+'/js/shape/mxRhombus.js');
mxClient.include(mxClient.basePath+'/js/shape/mxPolyline.js');
mxClient.include(mxClient.basePath+'/js/shape/mxArrow.js');
mxClient.include(mxClient.basePath+'/js/shape/mxText.js');
mxClient.include(mxClient.basePath+'/js/shape/mxTriangle.js');
mxClient.include(mxClient.basePath+'/js/shape/mxHexagon.js');
mxClient.include(mxClient.basePath+'/js/shape/mxLine.js');
mxClient.include(mxClient.basePath+'/js/shape/mxImageShape.js');
mxClient.include(mxClient.basePath+'/js/shape/mxLabel.js');
mxClient.include(mxClient.basePath+'/js/shape/mxCylinder.js');
mxClient.include(mxClient.basePath+'/js/shape/mxConnector.js');
mxClient.include(mxClient.basePath+'/js/shape/mxSwimlane.js');
mxClient.include(mxClient.basePath+'/js/layout/mxGraphLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxStackLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxPartitionLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxCompactTreeLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxFastOrganicLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxCircleLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxParallelEdgeLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxCompositeLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/mxEdgeLabelLayout.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/model/mxGraphAbstractHierarchyCell.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/model/mxGraphHierarchyNode.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/model/mxGraphHierarchyEdge.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/model/mxGraphHierarchyModel.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/stage/mxHierarchicalLayoutStage.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/stage/mxMedianHybridCrossingReduction.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/stage/mxMinimumCycleRemover.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/stage/mxCoordinateAssignment.js');
mxClient.include(mxClient.basePath+'/js/layout/hierarchical/mxHierarchicalLayout.js');
mxClient.include(mxClient.basePath+'/js/model/mxGraphModel.js');
mxClient.include(mxClient.basePath+'/js/model/mxCell.js');
mxClient.include(mxClient.basePath+'/js/model/mxGeometry.js');
mxClient.include(mxClient.basePath+'/js/model/mxCellPath.js');
mxClient.include(mxClient.basePath+'/js/view/mxPerimeter.js');
mxClient.include(mxClient.basePath+'/js/view/mxPrintPreview.js');
mxClient.include(mxClient.basePath+'/js/view/mxStylesheet.js');
mxClient.include(mxClient.basePath+'/js/view/mxCellState.js');
mxClient.include(mxClient.basePath+'/js/view/mxGraphSelectionModel.js');
mxClient.include(mxClient.basePath+'/js/view/mxCellEditor.js');
mxClient.include(mxClient.basePath+'/js/view/mxCellRenderer.js');
mxClient.include(mxClient.basePath+'/js/view/mxEdgeStyle.js');
mxClient.include(mxClient.basePath+'/js/view/mxStyleRegistry.js');
mxClient.include(mxClient.basePath+'/js/view/mxGraphView.js');
mxClient.include(mxClient.basePath+'/js/view/mxGraph.js');
mxClient.include(mxClient.basePath+'/js/view/mxCellOverlay.js');
mxClient.include(mxClient.basePath+'/js/view/mxOutline.js');
mxClient.include(mxClient.basePath+'/js/view/mxMultiplicity.js');
mxClient.include(mxClient.basePath+'/js/view/mxLayoutManager.js');
mxClient.include(mxClient.basePath+'/js/view/mxSpaceManager.js');
mxClient.include(mxClient.basePath+'/js/view/mxSwimlaneManager.js');
mxClient.include(mxClient.basePath+'/js/view/mxTemporaryCellStates.js');
mxClient.include(mxClient.basePath+'/js/view/mxCellStatePreview.js');
mxClient.include(mxClient.basePath+'/js/view/mxConnectionConstraint.js');
mxClient.include(mxClient.basePath+'/js/handler/mxGraphHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxPanningHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxCellMarker.js');
mxClient.include(mxClient.basePath+'/js/handler/mxSelectionCellsHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxConnectionHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxConstraintHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxRubberband.js');
mxClient.include(mxClient.basePath+'/js/handler/mxVertexHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxEdgeHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxElbowEdgeHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxEdgeSegmentHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxKeyHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxTooltipHandler.js');
mxClient.include(mxClient.basePath+'/js/handler/mxCellTracker.js');
mxClient.include(mxClient.basePath+'/js/handler/mxCellHighlight.js');
mxClient.include(mxClient.basePath+'/js/editor/mxDefaultKeyHandler.js');
mxClient.include(mxClient.basePath+'/js/editor/mxDefaultPopupMenu.js');
mxClient.include(mxClient.basePath+'/js/editor/mxDefaultToolbar.js');
mxClient.include(mxClient.basePath+'/js/editor/mxEditor.js');
mxClient.include(mxClient.basePath+'/js/io/mxCodecRegistry.js');
mxClient.include(mxClient.basePath+'/js/io/mxCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxObjectCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxCellCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxModelCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxRootChangeCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxChildChangeCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxTerminalChangeCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxGenericChangeCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxGraphCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxGraphViewCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxStylesheetCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxDefaultKeyHandlerCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxDefaultToolbarCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxDefaultPopupMenuCodec.js');
mxClient.include(mxClient.basePath+'/js/io/mxEditorCodec.js');
