/**
 * $Id: mxObjectIdentity.js,v 1.8 2010-01-02 09:45:14 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
var mxObjectIdentity =
{
	/**
	 * Class: mxObjectIdentity
	 * 
	 * Identity for JavaScript objects. This is implemented using a simple
	 * incremeting counter which is stored in each object under <ID_NAME>.
	 * 
	 * The identity for an object does not change during its lifecycle.
	 * 
	 * Variable: FIELD_NAME
	 * 
	 * Name of the field to be used to store the object ID. Default is
	 * '_mxObjectId'.
	 */
	FIELD_NAME: 'mxObjectId',

	/**
	 * Variable: counter
	 * 
	 * Current counter for objects.
	 */
	counter: 0,

	/**
	 * Function: get
	 * 
	 * Returns the object id for the given object.
	 */
	get: function(obj)
	{
		if (typeof(obj) == 'object' &&
			obj[mxObjectIdentity.FIELD_NAME] == null)
		{
			var ctor = mxUtils.getFunctionName(obj.constructor);
			obj[mxObjectIdentity.FIELD_NAME] = ctor+'#'+mxObjectIdentity.counter++;
		}
		
		return obj[mxObjectIdentity.FIELD_NAME];
	},

	/**
	 * Function: clear
	 * 
	 * Removes the object id from the given object.
	 */
	clear: function(obj)
	{
		if (typeof(obj) == 'object')
		{
			delete obj[mxObjectIdentity.FIELD_NAME];
		}
	}

};
