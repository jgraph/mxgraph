// $Id: mxSharedState.cs,v 1.1 2010-09-20 06:21:37 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Defines the requirementns for an object that listens to changes on the
    /// shared diagram.
    /// </summary>
    public delegate void mxDiagramChangeEventHandler(Object sender, string xml);

    /// <summary>
    /// Implements a diagram that may be shared among multiple sessions.
    /// </summary>
    public class mxSharedDiagram
    {
        /// <summary>
        /// Fires when the diagram was changed.
        /// </summary>
        public event mxDiagramChangeEventHandler DiagramChange;

        /// <summary>
        /// Holds the initial state of the diagram.
        /// </summary>
        protected string state;

        /// <summary>
        /// Holds the delta of all changes of initial state.
        /// </summary>
        protected StringBuilder delta = new StringBuilder();

        /// <summary>
        /// Constructs a new diagram with the given initial state.
        /// </summary>
        /// <param name="state">Initial state of the diagram.</param>
        public mxSharedDiagram(string state)
        {
            this.state = state;
        }

        /// <summary>
        /// Returns the initial state of the diagram.
        /// </summary>
        public string State
        {
            get { return state; }
        }

        /// <summary>
        /// Returns the delta of all changes as a string.
        /// </summary>
        public string GetDelta()
        {
            Monitor.Enter(this);
            string tmp = delta.ToString();
            Monitor.Exit(this);

            return tmp;
        }

        /// <summary>
        /// Appends the given string to the history and dispatches the change to all
        /// sessions that are listening to this shared diagram.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="delta"></param>
        public void ProcessDelta(Object sender, XmlNode delta)
	    {
            StringBuilder edits = new StringBuilder();

            Monitor.Enter(this);
            XmlNode edit = delta.FirstChild;

		    while (edit != null)
		    {
			    if (edit.Name.Equals("edit"))
			    {
				    edits.Append(ProcessEdit(edit));
			    }

			    edit = edit.NextSibling;
		    }
            Monitor.Exit(this);

            string xml = edits.ToString();
		    AddDelta(xml);
		    DiagramChange(sender, xml);
	    }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="node"></param>
        /// <returns></returns>
        public string ProcessEdit(XmlNode node)
        {
            return mxUtils.GetXml(node);
        }

        /// <summary>
        /// Clears the delta of all changes.
        /// </summary>
        public void AddDelta(String xml)
        {
            Monitor.Enter(this);
            delta.Append(xml);
            Monitor.Exit(this);
        }

        /// <summary>
        /// Clears the delta of all changes.
        /// </summary>
        public void ResetDelta()
        {
            Monitor.Enter(this);
            delta = new StringBuilder();
            Monitor.Exit(this);
        }

    }

}
