/**
 * $Id: mxUrlConverter.js,v 1.3 2012-08-24 17:10:41 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 *
 * Class: mxUrlConverter
 * 
 * Converts relative and absolute URLs to absolute URLs with protocol and domain.
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

	/**
	 * Variable: baseDomain
	 * 
	 * Specifies the base domain to be used as a prefix for absolute URLs.
	 */
	var baseDomain = null;
	
	// Private helper function to update the base URL
	var updateBaseUrl = function()
	{
		baseDomain = location.protocol + '//' + location.host;
		baseUrl = baseDomain + location.pathname;
		var tmp = baseUrl.lastIndexOf('/');
		
		// Strips filename etc
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
		 * Function: getBaseDomain
		 * 
		 * Returns <baseDomain>.
		 */
		getBaseDomain: function()
		{
			return baseUrl;
		},

		/**
		 * Function: setBaseDomain
		 * 
		 * Sets <baseDomain>.
		 */
		setBaseDomain: function(value)
		{
			baseUrl = value;
		},

		/**
		 * Function: convert
		 * 
		 * Converts the given URL to an absolute URL with protol and domain.
		 * Relative URLs are first converted to absolute URLs.
		 */
		convert: function(url)
		{
			if (enabled && url.indexOf('http://') != 0 && url.indexOf('https://') != 0 && url.indexOf('data:image') != 0)
			{
				if (baseUrl == null)
				{
					updateBaseUrl();
				}
				
				if (url.charAt(0) == '/')
				{
					url = baseDomain + url;
				}
				else
				{
					url = baseUrl + url;
				}
			}
			
			return url;
		}

	};

};