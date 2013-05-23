/**
 * $Id: mxUrlConverter.js,v 1.2 2013/01/29 12:34:44 gaudenz Exp $
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
		 * Function: isRelativeUrl
		 * 
		 * Returns true if the given URL is relative.
		 */
		isRelativeUrl: function(url)
		{
			return url.substring(0, 7) != 'http://' && url.substring(0, 8) != 'https://' && url.substring(0, 10) != 'data:image';
		},
		
		/**
		 * Function: convert
		 * 
		 * Converts the given URL to an absolute URL with protol and domain.
		 * Relative URLs are first converted to absolute URLs.
		 */
		convert: function(url)
		{
			if (enabled && this.isRelativeUrl(url))
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