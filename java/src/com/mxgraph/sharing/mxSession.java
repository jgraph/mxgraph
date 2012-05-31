/**
 * $Id: mxSession.java,v 1.15 2012-01-13 11:07:37 david Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.sharing;

import org.w3c.dom.Node;

import com.mxgraph.sharing.mxSharedState.mxDiagramChangeListener;
import com.mxgraph.util.mxUtils;

/**
 * Implements a session that may be attached to a shared diagram. The session
 * contains a synchronized buffer which is used to hold the pending edits which
 * are to be sent to a specific client. The update mechnism between the server
 * and the client uses HTTP requests (polling). The request is kept on the server
 * for an amount of time or wakes up / returns immediately if the buffer is no
 * longer empty.
 */
public class mxSession implements mxDiagramChangeListener
{
	/**
	 * Default timeout is 10000 ms.
	 */
	public static int DEFAULT_TIMEOUT = 10000;

	/**
	 * Holds the session ID.
	 */
	protected String id;

	/**
	 * Reference to the shared diagram.
	 */
	protected mxSharedState diagram;

	/**
	 * Holds the send buffer for this session.
	 */
	protected StringBuffer buffer = new StringBuffer();

	/**
	 * Holds the last active time millis.
	 */
	protected long lastTimeMillis = 0;

	/**
	 * Constructs a new session with the given ID.
	 * 
	 * @param id Specifies the session ID to be used.
	 * @param diagram Reference to the shared diagram.
	 */
	public mxSession(String id, mxSharedState diagram)
	{
		this.id = id;
		this.diagram = diagram;
		this.diagram.addDiagramChangeListener(this);

		lastTimeMillis = System.currentTimeMillis();
	}

	/**
	 * Returns the session ID.
	 */
	public String getId()
	{
		return id;
	}

	/**
	 * Initializes the session buffer and returns a string that represents the
	 * state of the session.
	 *
	 * @return Returns the initial state of the session.
	 */
	public synchronized String init()
	{
		synchronized (this)
		{
			buffer = new StringBuffer();
			notify();
		}

		return getInitialMessage();
	}

	/**
	 * Returns an XML string that represents the current state of the session
	 * and the shared diagram. A globally unique ID is used as the session's
	 * namespace, which is used on the client side to prefix IDs of newly
	 * created cells.
	 */
	public String getInitialMessage()
	{
		String ns = mxUtils.getMd5Hash(id);

		StringBuffer result = new StringBuffer("<message namespace=\"" + ns
				+ "\">");
		result.append("<state>");
		result.append(diagram.getState());
		result.append("</state>");
		result.append("<delta>");
		result.append(diagram.getDelta());
		result.append("</delta>");
		result.append("</message>");

		return result.toString();
	}

	/**
	 * Posts the change represented by the given XML string to the shared diagram.
	 * 
	 * @param message XML that represents the change.
	 */
	public void receive(Node message)
	{
		//System.out.println(getId() + ": " + mxUtils.getPrettyXml(message));
		Node child = message.getFirstChild();

		while (child != null)
		{
			if (child.getNodeName().equals("delta"))
			{
				diagram.processDelta(this, child);
			}

			child = child.getNextSibling();
		}
		/*System.out.println(mxUtils.getPrettyXml(new mxCodec()
				.encode(((mxSharedGraphModel) diagram).getModel())));*/
	}

	/**
	 * Returns the changes received by other sessions for the shared diagram.
	 * The method returns an empty XML node if no change was received within
	 * 10 seconds.
	 * 
	 * @return Returns a string representing the changes to the shared diagram.
	 */
	public String poll() throws InterruptedException
	{
		return poll(DEFAULT_TIMEOUT);
	}

	/**
	 * Returns the changes received by other sessions for the shared diagram.
	 * The method returns an empty XML node if no change was received within
	 * the given timeout.
	 * 
	 * @param timeout Time in milliseconds to wait for changes.
	 * @return Returns a string representing the changes to the shared diagram.
	 */
	public String poll(long timeout) throws InterruptedException
	{
		lastTimeMillis = System.currentTimeMillis();
		StringBuffer result = new StringBuffer("<message>");

		synchronized (this)
		{
			if (buffer.length() == 0)
			{
				wait(timeout);
			}

			if (buffer.length() > 0)
			{
				result.append("<delta>");
				result.append(buffer.toString());
				result.append("</delta>");
				
				buffer = new StringBuffer();
			}

			notify();
		}

		result.append("</message>");

		return result.toString();
	}

	/*
	 * (non-Javadoc)
	 * @see com.mxgraph.sharing.mxSharedDiagram.mxDiagramChangeListener#diagramChanged(java.lang.Object, org.w3c.dom.Node)
	 */
	public synchronized void diagramChanged(Object sender, String edits)
	{
		if (sender != this)
		{
			synchronized (this)
			{
				buffer.append(edits);
				notify();
			}
		}
	}

	/**
	 * Returns the number of milliseconds this session has been inactive.
	 */
	public long inactiveTimeMillis()
	{
		return System.currentTimeMillis() - lastTimeMillis;
	}

	/**
	 * Destroys the session and removes its listener from the shared diagram.
	 */
	public void destroy()
	{
		diagram.removeDiagramChangeListener(this);
	}

}
