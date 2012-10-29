/**
 * $Id: mxResources.js,v 1.32 2012-10-26 13:36:50 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
var mxResources =
{
	/**
	 * Class: mxResources
	 * 
	 * Implements internationalization. You can provide any number of 
	 * resource files on the server using the following format for the 
	 * filename: name[-en].properties. The en stands for any lowercase 
	 * 2-character language shortcut (eg. de for german, fr for french).
	 *
	 * If the optional language extension is omitted, then the file is used as a 
	 * default resource which is loaded in all cases. If a properties file for a 
	 * specific language exists, then it is used to override the settings in the 
	 * default resource. All entries in the file are of the form key=value. The
	 * values may then be accessed in code via <get>. Lines without 
	 * equal signs in the properties files are ignored.
	 *
	 * Resource files may either be added programmatically using
	 * <add> or via a resource tag in the UI section of the 
	 * editor configuration file, eg:
	 * 
	 * (code)
	 * <mxEditor>
	 *   <ui>
	 *     <resource basename="examples/resources/mxWorkflow"/>
	 * (end)
	 * 
	 * The above element will load examples/resources/mxWorkflow.properties as well
	 * as the language specific file for the current language, if it exists.
	 * 
	 * Values may contain placeholders of the form {1}...{n} where each placeholder
	 * is replaced with the value of the corresponding array element in the params
	 * argument passed to <mxResources.get>. The placeholder {1} maps to the first
	 * element in the array (at index 0).
	 * 
	 * See <mxClient.language> for more information on specifying the default
	 * language or disabling all loading of resources.
	 * 
	 * Lines that start with a # sign will be ignored.
	 * 
	 * Special characters
	 * 
	 * To use unicode characters, use the standard notation (eg. \u8fd1) or %u as a
	 * prefix (eg. %u20AC will display a Euro sign). For normal hex encoded strings,
	 * use % as a prefix, eg. %F6 will display a � (&ouml;).
	 * 
	 * See <resourcesEncoded> to disable this. If you disable this, make sure that
	 * your files are UTF-8 encoded.
	 * 
	 * Variable: resources
	 * 
	 * Associative array that maps from keys to values.
	 */
	resources: [],

	/**
	 * Variable: extension
	 * 
	 * Specifies the extension used for language files. Default is '.properties'.
	 */
	extension: '.properties',

	/**
	 * Variable: resourcesEncoded
	 * 
	 * Specifies whether or not values in resource files are encoded with \u or
	 * percentage. Default is true.
	 */
	resourcesEncoded: true,

	/**
	 * Variable: loadDefaultBundle
	 * 
	 * Specifies if the default file for a given basename should be loaded.
	 * Default is true.
	 */
	loadDefaultBundle: true,

	/**
	 * Variable: loadDefaultBundle
	 * 
	 * Specifies if the specific language file file for a given basename should
	 * be loaded. Default is true.
	 */
	loadSpecialBundle: true,

	/**
	 * Function: isBundleSupported
	 * 
	 * Hook for subclassers to disable support for a given language. This
	 * implementation always returns true.
	 * 
	 * Parameters:
	 * 
	 * basename - The basename for which the file should be loaded.
	 * lan - The current language.
	 */
	isLanguageSupported: function(lan)
	{
		if (mxClient.languages != null)
		{
			return mxUtils.indexOf(mxClient.languages, lan) >= 0;
		}
		
		return true;
	},

	/**
	 * Function: getDefaultBundle
	 * 
	 * Hook for subclassers to return the URL for the special bundle. This
	 * implementation returns basename + <extension> or null if
	 * <loadDefaultBundle> is false.
	 * 
	 * Parameters:
	 * 
	 * basename - The basename for which the file should be loaded.
	 * lan - The current language.
	 */
	getDefaultBundle: function(basename, lan)
	{
		if (mxResources.loadDefaultBundle || !mxResources.isLanguageSupported(lan))
		{
			return basename + mxResources.extension;
		}
		else
		{
			return null;
		}
	},

	/**
	 * Function: getSpecialBundle
	 * 
	 * Hook for subclassers to return the URL for the special bundle. This
	 * implementation returns basename + '_' + lan + <extension> or null if
	 * <loadSpecialBundle> is false or lan equals <mxClient.defaultLanguage>.
	 * 
	 * If <mxResources.languages> is not null and <mxClient.language> contains
	 * a dash, then this method checks if <isLanguageSupported> returns true
	 * for the full language (including the dash). If that returns false the
	 * first part of the language (up to the dash) will be tried as an extension.
	 * 
	 * If <mxResources.language> is null then the first part of the language is
	 * used to maintain backwards compatibility.
	 * 
	 * Parameters:
	 * 
	 * basename - The basename for which the file should be loaded.
	 * lan - The language for which the file should be loaded.
	 */
	getSpecialBundle: function(basename, lan)
	{
		if (mxClient.languages == null || !this.isLanguageSupported(lan))
		{
			var dash = lan.indexOf('-');
			
			if (dash > 0)
			{
				lan = lan.substring(0, dash);
			}
		}

		if (mxResources.loadSpecialBundle && mxResources.isLanguageSupported(lan) && lan != mxClient.defaultLanguage)
		{
			return basename + '_' + lan + mxResources.extension;
		}
		else
		{
			return null;
		}
	},

	/**
	 * Function: add
	 * 
	 * Adds the default and current language properties
	 * file for the specified basename. Existing keys
	 * are overridden as new files are added.
	 *
	 * Example:
	 * 
	 * At application startup, additional resources may be 
	 * added using the following code:
	 * 
	 * (code)
	 * mxResources.add('resources/editor');
	 * (end)
	 */
	add: function(basename, lan)
	{
		lan = (lan != null) ? lan : mxClient.language.toLowerCase();
		
		if (lan != mxConstants.NONE)
		{
			// Loads the common language file (no extension)
			var defaultBundle = mxResources.getDefaultBundle(basename, lan);
			
			if (defaultBundle != null)
			{
				try
				{
			   		var req = mxUtils.load(defaultBundle);
			   		
			   		if (req.isReady())
			   		{
			 	   		mxResources.parse(req.getText());
			   		}
			  	}
			  	catch (e)
			  	{
			  		// ignore
			  	}
			}
	
			// Overlays the language specific file (_lan-extension)
			var specialBundle = mxResources.getSpecialBundle(basename, lan);
			
			if (specialBundle != null)
			{
				try
				{
			   		var req = mxUtils.load(specialBundle);
			   		
			   		if (req.isReady())
			   		{
			 	   		mxResources.parse(req.getText());
			   		}
		   		}
		   		catch (e)
		   		{
		   			// ignore
			   	}
			}
		}
	},

	/**
	 * Function: parse
	 * 
	 * Parses the key, value pairs in the specified
	 * text and stores them as local resources.
	 */
	parse: function(text)
	{
		if (text != null)
		{
			var lines = text.split('\n');
			
			for (var i = 0; i < lines.length; i++)
			{
				if (lines[i].charAt(0) != '#')
				{
					var index = lines[i].indexOf('=');
					
					if (index > 0)
					{
						var key = lines[i].substring(0, index);
						var idx = lines[i].length;
						
						if (lines[i].charCodeAt(idx - 1) == 13)
						{
							idx--;
						}
						
						var value = lines[i].substring(index + 1, idx);
						
						if (this.resourcesEncoded)
						{
							value = value.replace(/\\(?=u[a-fA-F\d]{4})/g,"%");
							mxResources.resources[key] = unescape(value);
						}
						else
						{
							mxResources.resources[key] = value;	
						}
					}
				}
			}
		}
	},

	/**
	 * Function: get
	 * 
	 * Returns the value for the specified resource key.
	 *
	 * Example:
	 * To read the value for 'welomeMessage', use the following:
	 * (code)
	 * var result = mxResources.get('welcomeMessage') || '';
	 * (end)
	 *
	 * This would require an entry of the following form in
	 * one of the English language resource files:
	 * (code)
	 * welcomeMessage=Welcome to mxGraph!
	 * (end)
	 * 
	 * The part behind the || is the string value to be used if the given
	 * resource is not available.
	 * 
	 * Parameters:
	 * 
	 * key - String that represents the key of the resource to be returned.
	 * params - Array of the values for the placeholders of the form {1}...{n}
	 * to be replaced with in the resulting string.
	 * defaultValue - Optional string that specifies the default return value.
	 */
	get: function(key, params, defaultValue)
	{
		var value = mxResources.resources[key];
		
		// Applies the default value if no resource was found
		if (value == null)
		{
			value = defaultValue;
		}
		
		// Replaces the placeholders with the values in the array
		if (value != null &&
			params != null)
		{
			var result = [];
			var index = null;
			
			for (var i = 0; i < value.length; i++)
			{
				var c = value.charAt(i);

				if (c == '{')
				{
					index = '';
				}
				else if (index != null && 	c == '}')
				{
					index = parseInt(index)-1;
					
					if (index >= 0 && index < params.length)
					{
						result.push(params[index]);
					}
					
					index = null;
				}
				else if (index != null)
				{
					index += c;
				}
				else
				{
					result.push(c);
				}
			}
			
			value = result.join('');
		}
		
		return value;
	}

};
