// $Id: mxCodec.cs,v 1.26 2010-09-20 06:21:37 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// XML codec for .NET object graphs. In order to resolve forward references
    /// when reading files the XML document that contains the data must be passed
    /// to the constructor.
    /// </summary>
    public class mxCodec
    {

        /// <summary>
        /// Holds the owner document of the codec.
        /// </summary>
        protected XmlDocument document;

        /// <summary>
        /// Maps from IDs to objects.
        /// </summary>
        protected Dictionary<string, object> objects = new Dictionary<string, Object>();

        /// <summary>
        /// Specifies if default values should be encoded. Default is false.
        /// </summary>
        protected bool encodeDefaults = false;

        /// <summary>
        /// Constructs an XML encoder/decoder with a new owner document.
        /// </summary>
        public mxCodec() : this(mxUtils.CreateDocument()) { }

        /// <summary>
        /// Constructs an XML encoder/decoder for the specified owner document. The document is
        /// required to resolve forward ID references. This means if you parse a graphmodel that
        /// is represented in XML you must also pass the document that contains the XML to the
        /// constructor, otherwise forward references will not be resolved.
        /// </summary>
        /// <param name="document">Optional XML document that contains the data. If no document
        /// is specified then a new document is created using mxUtils.createDocument</param>
        public mxCodec(XmlDocument document)
        {
            if (document == null)
            {
                document = mxUtils.CreateDocument();
            }

            this.document = document;
        }

        /// <summary>
        /// Sets or returns the owner document of the codec.
        /// </summary>
        /// <returns>Returns the owner document.</returns>
        public XmlDocument Document
        {
            get { return document; }
            set { document = value; }
        }

        /// <summary>
        /// Sets or returns if default values of member variables should be encoded.
        /// </summary>
        public bool IsEncodeDefaults
        {
            get { return encodeDefaults; }
            set { encodeDefaults = value; }
        }

        /// <summary>
        /// Returns the object lookup table.
        /// </summary>
        public Dictionary<string, object> Objects
        {
            get { return objects; }
        }

        /// <summary>
        /// Assoiates the given object with the given ID.
        /// </summary>
        /// <param name="id">ID for the object to be associated with.</param>
        /// <param name="obj">Object to be associated with the ID.</param>
        /// <returns>Returns the given object.</returns>
        public Object PutObject(string id, Object obj)
        {
            return objects[id] = obj;
        }

        /// <summary>
        /// Returns the decoded object for the element with the specified ID in
        /// document. If the object is not known then lookup is used to find an
        /// object. If no object is found, then the element with the respective ID
        /// from the document is parsed using decode.
        /// </summary>
        /// <param name="id">ID of the object to be returned.</param>
        /// <returns>Returns the object for the given ID.</returns>
        public Object GetObject(string id)
        {
            Object obj = null;

            if (id != null)
            {
                obj = (objects.ContainsKey(id)) ? objects[id] : null;

                if (obj == null)
                {
                    obj = Lookup(id);

                    if (obj == null)
                    {
                        XmlNode node = GetElementById(id);

                        if (node != null)
                        {
                            obj = Decode(node);
                        }
                    }
                }
            }

            return obj;
        }

        /// <summary>
        /// Hook for subclassers to implement a custom lookup mechanism for cell IDs.
        /// This implementation always returns null.
        /// </summary>
        /// <param name="id">ID of the object to be returned.</param>
        /// <returns>Returns the object for the given ID.</returns>
        public Object Lookup(string id)
        {
            return null;
        }

        /// <summary>
        /// Returns the element with the given ID from the document.
        /// </summary>
        /// <param name="id">ID of the element to be returned.</param>
        /// <returns>Returns the element for the given ID.</returns>
        public XmlNode GetElementById(string id)
        {
            return GetElementById(id, null);
        }

        /// <summary>
        /// Returns the element with the given ID from document. The optional attr
        /// argument specifies the name of the ID attribute. Default is id. The
        /// XPath expression used to find the element is //*[\@id='arg'] where id
        /// is the name of the ID attribute (attributeName) and arg is the given id.
        /// </summary>
        /// <param name="id">ID of the element to be returned.</param>
        /// <param name="attributeName">Optional string for the attributename. Default is id.</param>
        /// <returns>Returns the element for the given ID.</returns>
        public XmlNode GetElementById(string id, string attributeName)
        {
            if (attributeName == null)
            {
                attributeName = "id";
            }

            string expr = "//*[@" + attributeName + "='" + id + "']";

            return mxUtils.SelectSingleNode(document, expr);
        }

        /// <summary>
        /// Returns the ID of the specified object. This implementation calls
        /// reference first and if that returns null handles the object as an
        /// mxCell by returning their IDs using mxCell.getId. If no ID exists for
        /// the given cell, then an on-the-fly ID is generated using
        /// mxCellPath.create.
        /// </summary>
        /// <param name="obj">Object to return the ID for.</param>
        /// <returns>Returns the ID for the given object.</returns>
        public string GetId(Object obj)
        {
            string id = null;

            if (obj != null)
            {
                id = Reference(obj);

                if (id == null && obj is mxICell)
                {
                    id = ((mxICell)obj).Id;

                    if (id == null)
                    {
                        // Uses an on-the-fly Id
                        id = mxCellPath.Create((mxICell)obj);

                        if (id.Length == 0)
                        {
                            id = "root";
                        }
                    }
                }
            }

            return id;
        }

        /// <summary>
        /// Hook for subclassers to implement a custom method for retrieving IDs from
        /// objects. This implementation always returns null.
        /// </summary>
        /// <param name="obj">Object whose ID should be returned.</param>
        /// <returns>Returns the ID for the given object.</returns>
        public string Reference(Object obj)
        {
            return null;
        }

        /// <summary>
        /// Encodes the specified object and returns the resulting XML node.
        /// </summary>
        /// <param name="obj">Object to be encoded.</param>
        /// <returns>Returns an XML node that represents the given object.</returns>
        public XmlNode Encode(Object obj)
        {
            XmlNode node = null;

            if (obj != null)
            {
                string name = mxCodecRegistry.GetName(obj);
                mxObjectCodec enc = mxCodecRegistry.GetCodec(name);

                if (enc != null)
                {
                    node = enc.Encode(this, obj);
                }
                else
                {
                    if (obj is XmlNode)
                    {
                        node = ((XmlNode)obj).CloneNode(true);
                    }
                    else
                    {
                        Console.WriteLine("No codec for " + name);
                    }
                }
            }

            return node;
        }

        /// <summary>
        /// Decodes the given XML node using decode(XmlNode, Object).
        /// </summary>
        /// <param name="node">XML node to be decoded.</param>
        /// <returns>Returns an object that represents the given node.</returns>
        public Object Decode(XmlNode node)
        {
            return Decode(node, null);
        }

        /// <summary>
        /// Decodes the given XML node. The optional "into" argument specifies an
        /// existing object to be used. If no object is given, then a new
        /// instance is created using the constructor from the codec.
        /// The function returns the passed in object or the new instance if no
        /// object was given.
        /// </summary>
        /// <param name="node">XML node to be decoded.</param>
        /// <param name="into">Optional object to be decodec into.</param>
        /// <returns>Returns an object that represents the given node.</returns>
        public Object Decode(XmlNode node, Object into)
        {
            Object obj = null;

            if (node != null && node.NodeType == XmlNodeType.Element)
            {
                mxObjectCodec codec = mxCodecRegistry.GetCodec(node.Name);

                try
                {
                    if (codec != null)
                    {
                        obj = codec.Decode(this, node, into);
                    }
                    else
                    {
                        obj = node.CloneNode(true);
                        ((XmlElement)obj).RemoveAttribute("as");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("Cannot decode " + node.Name + ": "
                            + e.Message);
                }
            }

            return obj;
        }

        /// <summary>
        /// Encoding of cell hierarchies is built-into the core, but is a
        /// higher-level function that needs to be explicitely used by the
        /// respective object encoders (eg. mxModelCodec, mxChildChangeCodec
        /// and mxRootChangeCodec). This implementation writes the given cell
        /// and its children as a (flat) sequence into the given node. The
        /// children are not encoded if the optional includeChildren is false.
        /// The function is in charge of adding the result into the given node
        /// and has no return value.
        /// </summary>
        /// <param name="cell">mxCell to be encoded.</param>
        /// <param name="node">Parent XML node to add the encoded cell into.</param>
        /// <param name="includeChildren">Boolean indicating if the method should
        /// include all descendents</param>
        public void EncodeCell(mxICell cell, XmlNode node, bool includeChildren)
        {
            node.AppendChild(Encode(cell));

            if (includeChildren)
            {
                int childCount = cell.ChildCount();

                for (int i = 0; i < childCount; i++)
                {
                    EncodeCell(cell.GetChildAt(i), node, includeChildren);
                }
            }
        }

        /// <summary>
        /// Decodes cells that have been encoded using inversion, ie. where the
        /// user object is the enclosing node in the XML, and restores the group
        /// and graph structure in the cells. Returns a new mxCell instance
        /// that represents the given node.
        /// </summary>
        /// <param name="node">XML node that contains the cell data.</param>
        /// <param name="restoreStructures">Boolean indicating whether the graph
        /// structure should be restored by calling insert and insertEdge on the
        /// parent and terminals, respectively.
        /// </param>
        /// <returns>Graph cell that represents the given node.</returns>
        public mxICell DecodeCell(XmlNode node, bool restoreStructures)
        {
            mxICell cell = null;

            if (node != null &&
                node.NodeType == XmlNodeType.Element)
            {
			    // Tries to find a codec for the given node name. If that does
			    // not return a codec then the node is the user object (an XML node
			    // that contains the mxCell, aka inversion).
			    mxObjectCodec decoder = mxCodecRegistry.GetCodec(node.Name);

                // Tries to find the codec for the cell inside the user object.
                // This assumes all node names inside the user object are either
                // not registered or they correspond to a class for cells.
                if (decoder == null)
			    {
                    XmlNode child = node.FirstChild;
					
					while (child != null &&
						!(decoder is mxCellCodec))
					{
						decoder = mxCodecRegistry.GetCodec(child.Name);
						child = child.NextSibling;
					}
			    }

                if (!(decoder is mxCellCodec))
                {
                    decoder = mxCodecRegistry.GetCodec("mxCell");
                }

                cell = (mxICell)decoder.Decode(this, node);

                if (restoreStructures)
                {
                    InsertIntoGraph(cell);
                }
            }

            return cell;
        }

        /// <summary>
        /// Inserts the given cell into its parent and terminal cells.
        /// </summary>
        /// <param name="cell"></param>
        public void InsertIntoGraph(mxICell cell)
        {
            mxICell parent = cell.Parent;
            mxICell source = cell.GetTerminal(true);
            mxICell target = cell.GetTerminal(false);

            // Fixes possible inconsistencies during insert into graph
            cell.SetTerminal(null, false);
            cell.SetTerminal(null, true);
            cell.Parent = null;

            if (parent != null)
            {
                parent.Insert(cell);
            }

            if (source != null)
            {
                source.InsertEdge(cell, true);
            }

            if (target != null)
            {
                target.InsertEdge(cell, false);
            }
        }

        /// <summary>
        /// Sets the attribute on the specified node to value. This is a
        /// helper method that makes sure the attribute and value arguments
        /// are not null.
        /// </summary>
        /// <param name="node">XML node to set the attribute for.</param>
        /// <param name="attribute">Attributename to be set.</param>
        /// <param name="value">New value of the attribute.</param>
        public static void SetAttribute(XmlNode node, string attribute, Object value)
        {
            if (node.NodeType == XmlNodeType.Element && attribute != null
                    && value != null)
            {
                ((XmlElement)node).SetAttribute(attribute, value.ToString());
            }
        }

    }

}
