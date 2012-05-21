/**
 * $Id: mxUrlConverter.js,v 1.2 2012-05-18 14:27:52 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 *
 * Class: mxUrlConverter
 * 
 * Converts relative to absolute URLs.
 */
var mxUrlConverter = function(root)
{
	/**
	 * Variable: enabled
	 * 
	 * Specifies if the converter is enabled. Default is true.
	 */
	var enabled = true;

	/**
	 * Variable: baseUrl
	 * 
	 * Specifies the base URL to be used as a prefix for relative URLs.
	 */
	var baseUrl = null;
	
	// Private helper function to update the base URL
	var updateBaseUrl = function()
	{
		baseUrl = document.URL;
		var tmp = baseUrl.lastIndexOf('/');
		
		if (tmp > 0)
		{
			baseUrl = baseUrl.substring(0, tmp + 1);
		}
	};

	// Returns public interface
	return {

		/**
		 * Function: isEnabled
		 * 
		 * Returns <enabled>.
		 */
		isEnabled: function()
		{
			return enabled;
		},

		/**
		 * Function: setEnabled
		 * 
		 * Sets <enabled>.
		 */
		setEnabled: function(value)
		{
			enabled = value;
		},

		/**
		 * Function: getBaseUrl
		 * 
		 * Returns <baseUrl>.
		 */
		getBaseUrl: function()
		{
			return baseUrl;
		},

		/**
		 * Function: setBaseUrl
		 * 
		 * Sets <baseUrl>.
		 */
		setBaseUrl: function(value)
		{
			baseUrl = value;
		},

		/**
		 * Function: convert
		 * 
		 * Converts the given URL to an absolute URL.
		 */
		convert: function(url)
		{
			if (enabled && url.indexOf('http://') != 0 && url.indexOf('https://') != 0 && url.indexOf('data:image') != 0)
			{
				if (baseUrl == null)
				{
					updateBaseUrl();
				}
				
				url = baseUrl + url;
			}
			
			return url;
		}

	};

};