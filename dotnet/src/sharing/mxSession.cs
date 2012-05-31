// $Id: mxSession.cs,v 1.13 2010-09-30 09:34:09 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Threading;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a session that may be attached to a shared diagram.
    /// </summary>
    public class mxSession
    {
        /// <summary>
        /// Default timeout is 10000 ms.
        /// </summary>
        public static int DEFAULT_TIMEOUT = 10000;

        /// <summary>
        /// Holds the session ID.
        /// </summary>
        protected string id;

        /// <summary>
        /// Reference to the shared diagram.
        /// </summary>
        protected mxSharedDiagram diagram;

        /// <summary>
        /// Holds the send buffer for this session.
        /// </summary>
        protected StringBuilder buffer = new StringBuilder();

        /// <summary>
        /// Holds the last active time millis.
        /// </summary>
        protected long lastTimeMillis = 0;

        /// <summary>
        /// Constructs a new session with the given ID.
        /// </summary>
        /// <param name="id">Specifies the session ID to be used.</param>
        /// <param name="diagram">Reference to the shared diagram.</param>
        public mxSession(string id, mxSharedDiagram diagram)
        {
            this.id = id;
            this.diagram = diagram;
            this.diagram.DiagramChange += new mxDiagramChangeEventHandler(DiagramChanged);

            lastTimeMillis = System.DateTime.Now.Millisecond;
        }

        /// <summary>
        /// Returns the session ID.
        /// </summary>
        public string Id
        {
            get { return id; }
        }

        /// <summary>
        /// Initializes the session buffer and returns a string that represents the
        /// state of the session.
        /// </summary>
        /// <returns>Returns the initial state of the session.</returns>
        public string Init()
        {
            Monitor.Enter(this);
            buffer = new StringBuilder();
            Monitor.Pulse(this);
            Monitor.Exit(this);

            return GetInitialMessage();
        }

        /// <summary>
        /// Returns an XML string that represents the current state of the session
        /// and the shared diagram. A globally unique ID is used as the session's
        /// namespace, which is used on the client side to prefix IDs of newly
        /// created cells.
        /// </summary>
        public string GetInitialMessage()
        {
            String ns = Guid.NewGuid().ToString();

            StringBuilder result = new StringBuilder("<message namespace=\"" + ns + "\">");
            result.Append("<state>");
            result.Append(diagram.State);
            result.Append("</state>");
            result.Append("<delta>");
            result.Append(diagram.GetDelta());
            result.Append("</delta>");
            result.Append("</message>");

            return result.ToString();
        }

        /// <summary>
        /// Posts the change represented by the given XML string to the shared diagram.
        /// </summary>
        /// <param name="xml">XML string that represents the change.</param>
        public void Receive(XmlNode message)
        {
            XmlNode child = message.FirstChild;

		    while (child != null)
		    {
			    if (child.Name.Equals("delta"))
			    {
				    diagram.ProcessDelta(this, child);
			    }

			    child = child.NextSibling;
		    }
        }

        /// <summary>
        /// Returns the changes received by other sessions for the shared diagram.
        /// The method returns an empty XML node if no change was received within
        /// 10 seconds.
        /// </summary>
        /// <returns>Returns a string representing the changes to the shared diagram.</returns>
        public string Poll()
        {
            return Poll(DEFAULT_TIMEOUT);
        }

        /// <summary>
        /// Returns the changes received by other sessions for the shared diagram.
        /// The method returns an empty XML node if no change was received within
        /// the given timeout.
        /// </summary>
        /// <param name="timeout">Time in milliseconds to wait for changes.</param>
        /// <returns>Returns a string representing the changes to the shared diagram.</returns>
        public string Poll(int timeout)
        {
            lastTimeMillis = System.DateTime.Now.Millisecond;
            StringBuilder result = new StringBuilder("<message>");

            Monitor.Enter(this);

            if (buffer.Length == 0)
            {
                Monitor.Wait(this, timeout);
            }

            if (buffer.Length > 0)
            {
                result.Append("<delta>");
                result.Append(buffer.ToString());
                result.Append("</delta>");

                buffer = new StringBuilder();
            }

            Monitor.Pulse(this);
            Monitor.Exit(this);

            result.Append("</message>");

            return result.ToString();
        }

        /// <summary>
        /// Invoked when the shared diagram has changed.
        /// </summary>
        /// <param name="sender">Session where the change was received from.</param>
        /// <param name="xml">XML string that represents the change.</param>
        public void DiagramChanged(Object sender, string xml)
        {
            // FIXME: Check if sender != this can be used here
            if (sender is mxSession && !((mxSession)sender).Id.Equals(Id))
            {
                Monitor.Enter(this);
                buffer.Append(xml);
                Monitor.Pulse(this);
                Monitor.Exit(this);
            }
        }

        /// <summary>
        /// Returns the number of milliseconds this session has been inactive.
        /// </summary>
        public long InactiveTimeMillis()
        {
            return System.DateTime.Now.Millisecond - lastTimeMillis;
        }

        /// <summary>
        /// Destroys the session and removes its listener from the shared diagram.
        /// </summary>
        public void Destroy()
        {
            this.diagram.DiagramChange -= new mxDiagramChangeEventHandler(DiagramChanged);
        }

    }
}
