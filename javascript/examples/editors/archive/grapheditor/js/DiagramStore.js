/**
 * $Id: DiagramStore.js,v 1.1 2012-03-06 12:36:45 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 *
 * Class: DiagramStore
 * 
 * A class for storing diagrams. This implementation uses Google Gears, HTML 5
 * (disabled) or a local variable. 
 */
var DiagramStore =
{
	/**
	 * Variable: useLocalStorage
	 * 
	 * Uses localStorage object in HTML 5. The support in browsers for this
	 * feature is still shaky so it's disabled.
	 */
	useLocalStorage: false,
		
	/**
	 * Variable: diagrams
	 * 
	 * Array for in-memory storage of the diagrams. This is not persistent
	 * across multiplace invocations and is only used as a fallback if no
	 * client- or server-side storage is available.
	 */
	diagrams: new Object(),

	/**
	 * Variable: diagrams
	 * 
	 * Array for in-memory storage of the diagrams. This is not persistent
	 * across multiplace invocations and is only used as a fallback if no
	 * client- or server-side storage is available.
	 */
	eventSource: new mxEventSource(this),
	
	/**
	 * Function: isAvailable
	 * 
	 * Returns true if any of the storage mechanisms for driving the diagram
	 * store is available. Currently supported mechanisms are Google Gears
	 * and HTML 5 local storage.
	 */
	isAvailable: function()
	{
		return (DiagramStore.useLocalStorage &&
			typeof(localStorage) != 'undefined') ||
			(window.google &&
			google.gears);
	},

	/**
	 * Function: init
	 * 
	 * Initializes the diagram store. This is invoked at class creation time
	 * and returns the db instance to operate on.
	 */
	db: function()
	{
		var db = null;
		
		try
		{					
			db = google.gears.factory.create('beta.database', '1.0');
			db.open('mxGraphEditor');
			db.execute('CREATE TABLE IF NOT EXISTS Diagrams ('+
				'NAME PRIMARY KEY,'+
				'XML TEXT' +
				');');
			
			return db;
		}
		catch (e)
		{
			// ignore
		}
		
		return db;
	}(),
	
	/**
	 * Function: addListener
	 */
	addListener: function(name, funct)
	{
		DiagramStore.eventSource.addListener(name, funct);
	},

	/**
	 * Function: removeListener
	 */
	removeListener: function(funct)
	{
		DiagramStore.eventSource.removeListener(funct);
	},

	/**
	 * Function: put
	 * 
	 * Puts the given diagram into the store, replacing any existing diagram
	 * for the given name.
	 */
	put: function(name, xml)
	{
		if (DiagramStore.useLocalStorage &&
			typeof(localStorage) != 'undefined')
		{
			return localStorage.setItem(name, xml);
		}
		else if (DiagramStore.db != null)
		{
			DiagramStore.db.execute('DELETE FROM Diagrams WHERE name = ?;', [name]);
			DiagramStore.db.execute('INSERT INTO Diagrams (NAME, XML) VALUES (?, ?);', [name, xml]);
		}
		else
		{
			DiagramStore.diagrams[name] = xml;
		}
		
		DiagramStore.eventSource.fireEvent(new mxEventObject('put'));
	},

	/**
	 * Function: remove
	 * 
	 * Removes the given diagram from the store and returns
	 */
	remove: function(name)
	{
		if (DiagramStore.useLocalStorage &&
			typeof(localStorage) != 'undefined')
		{
			localStorage.removeItem(name);
		}
		else if (DiagramStore.db != null)
		{
			DiagramStore.db.execute('DELETE FROM Diagrams WHERE name = ?;', [name]);
		}
		else
		{
			delete DiagramStore.diagrams[name];
		}

		DiagramStore.eventSource.fireEvent(new mxEventObject('remove'));
	},

	/**
	 * Function: get
	 * 
	 * Returns the given diagram from the store or null of no such diagram
	 * can be found.
	 */
	get: function(name)
	{
		var xml = null;
		
		if (DiagramStore.useLocalStorage &&
			typeof(localStorage) != 'undefined')
		{
			xml = localStorage.getItem(name);
		}
		else if (DiagramStore.db != null)
		{
			var rs = DiagramStore.db.execute('SELECT xml FROM Diagrams WHERE NAME = ?;', [name]);
			
			if (rs.isValidRow())
			{
				xml = rs.field(0);
			}
			
			rs.close();
		}
		else
		{
			xml = DiagramStore.diagrams[name];
		}
		
		return xml; 
	},

	/**
	 * Function: getNames
	 * 
	 * Returns all diagram names in the store as an array.
	 */
	getNames: function()
	{
		var names = [];
		
		if (DiagramStore.useLocalStorage &&
			typeof(localStorage) != 'undefined')
		{
			for (var i = 0; i < localStorage.length; i++)
			{
				names.push(localStorage.key(i));
			}
		}
		else if (DiagramStore.db != null)
		{
			var rs = DiagramStore.db.execute('SELECT name FROM Diagrams;');
	
			while (rs.isValidRow())
			{
				names.push(rs.field(0));
				rs.next();
			}
			
			rs.close();
		}
		else
		{
		    for (var name in DiagramStore.diagrams)
		    {
		    	names.push(name);
		    }
		}
	    
	    return names;
	}

};
