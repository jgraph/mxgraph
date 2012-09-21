/**
 * $Id: mxSharedState.java,v 1.3 2012-01-13 12:35:44 david Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.sharing;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.w3c.dom.Node;

import com.mxgraph.util.mxEventSource;
import com.mxgraph.util.mxXmlUtils;

/**
 * Implements a diagram that may be shared among multiple sessions. This
 * implementation is based only on string, it does not have a model instance.
 * The diagram is represented by its initial state and the sequence of edits
 * as applied to the diagram.
 */
public class mxSharedState extends mxEventSource
{

	/**
	 * Defines the requirements for an object that listens to changes on the
	 * shared diagram.
	 */
	public interface mxDiagramChangeListener
	{

		/**
		 * Fires when the shared diagram was changed.
		 * 
		 * @param sender Session where the change was received from.
		 * @param edits String that represents the edits.
		 */
		void diagramChanged(Object sender, String edits);
	}

	/**
	 * Holds a list of diagram change listeners.
	 */
	protected List<mxDiagramChangeListener> diagramChangeListeners;

	/**
	 * Holds the initial state of the diagram.
	 */
	protected String state;

	/**
	 * Holds the history of all changes of initial state.
	 */
	protected StringBuffer delta = new StringBuffer();

	/**
	 * Constructs a new diagram with the given state.
	 * 
	 * @param state Initial state of the diagram.
	 */
	public mxSharedState(String state)
	{
		this.state = state;
	}

	/**
	 * Returns the initial state of the diagram.
	 */
	public String getState()
	{
		return state;
	}

	/**
	 * Returns the history of all changes as a string.
	 */
	public synchronized String getDelta()
	{
		return delta.toString();
	}

	/**
	 * Appends the given string to the history and dispatches the change to all
	 * sessions that are listening to this shared diagram.
	 * 
	 * @param sender Session where the change originated from.
	 * @param delta XML that represents the change.
	 */
	public void processDelta(Object sender, Node delta)
	{
		StringBuffer edits = new StringBuffer();

		synchronized (this)
		{
			Node edit = delta.getFirstChild();

			while (edit != null)
			{
				if (edit.getNodeName().equals("edit"))
				{
					edits.append(processEdit(edit));
				}

				edit = edit.getNextSibling();
			}
		}

		String xml = edits.toString();
		addDelta(xml);
		dispatchDiagramChangeEvent(sender, xml);
	}

	/**
	 * 
	 */
	protected String processEdit(Node node)
	{
		return mxXmlUtils.getXml(node);
	}

	/**
	 * 
	 */
	public synchronized void addDelta(String xml)
	{
		// TODO: Clear delta if xml contains mxRootChange
		delta.append(xml);
	}

	/**
	 * Clears the history of all changes.
	 */
	public synchronized void resetDelta()
	{
		delta = new StringBuffer();
	}

	/**
	 * Adds the given listener to the list of diagram change listeners.
	 * 
	 * @param listener Diagram change listener to be added.
	 */
	public void addDiagramChangeListener(mxDiagramChangeListener listener)
	{
		if (diagramChangeListeners == null)
		{
			diagramChangeListeners = new ArrayList<mxDiagramChangeListener>();
		}

		diagramChangeListeners.add(listener);
	}

	/**
	 * Removes the given listener from the list of diagram change listeners.
	 * 
	 * @param listener Diagram change listener to be removed.
	 */
	public void removeDiagramChangeListener(mxDiagramChangeListener listener)
	{
		if (diagramChangeListeners != null)
		{
			diagramChangeListeners.remove(listener);
		}
	}

	/**
	 * Dispatches the given event information to all diagram change listeners.
	 * 
	 * @param sender Session where the change was received from.
	 * @param xml XML string that represents the change.
	 */
	void dispatchDiagramChangeEvent(Object sender, String edits)
	{
		if (diagramChangeListeners != null)
		{
			Iterator<mxDiagramChangeListener> it = diagramChangeListeners
					.iterator();

			while (it.hasNext())
			{
				mxDiagramChangeListener listener = it.next();
				listener.diagramChanged(sender, edits);
			}
		}
	}

}
