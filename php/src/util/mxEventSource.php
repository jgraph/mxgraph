<?php
/**
 * $Id: mxEventSource.php,v 1.8 2010-06-30 11:03:50 gaudenz Exp $
 * Copyright (c) 2006-2010, Gaudenz Alder
 */
class mxEventSource
{

	/**
	 * Class: mxEventSource
	 *
	 * Base class for all event sources.
	 * 
	 * Variable: eventListeners
	 *
	 * Holds the registered listeners.
	 */
	var $eventListeners;

	/**
	 * Function: addListener
	 *
	 * Adds a listener for the given event name. Note that the method of the
	 * listener object must have the same name as the event it's being added
	 * for. This is different from other language implementations of this
	 * class.
	 */
	function addListener($name, $listener)
	{
	 	if ($this->eventListeners == null)
	 	{
	 		$this->eventListeners = array();
	 	}
	 	
	 	array_push($this->eventListeners, $name);
	 	array_push($this->eventListeners, $listener);
	}

	/**
	 * Function: fireEvent
	 *
	 * Fires the event for the specified name.
	 */
	function fireEvent($event)
	{
	 	if ($this->eventListeners != null)
	 	{
	 		$name = $event->getName();
	 		
	 		for ($i = 0; $i < sizeof($this->eventListeners); $i += 2)
	 		{
	 			if ($this->eventListeners[$i] == $name)
	 			{
		 			$this->eventListeners[$i+1]->$name($event);
	 			}
	 		}
	 	}
	}

}

?>
