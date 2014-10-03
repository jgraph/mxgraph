// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Codec for mxCells. This class is created and registered
    /// dynamically at load time and used implicitely via mxCodec
    /// and the mxCodecRegistry.
    /// </summary>
    public class mxCellCodec : mxObjectCodec
    {
        /// <summary>
        /// Constructs a new cell codec.
        /// </summary>
        public mxCellCodec()
            : this(new mxCell(), new string[] { "children", "edges" }, new string[] { "parent", "source", "target" },
                    null) { }

        /// <summary>
        /// Constructs a new cell codec for the given template.
        /// </summary>
        public mxCellCodec(Object template) : this(template, null, null, null) { }

        /// <summary>
        /// Constructs a new cell codec for the given arguments.
        /// </summary>
        public mxCellCodec(Object template, string[] exclude, string[] idrefs,
                Dictionary<string, string> mapping)
            : base(template, exclude, idrefs, mapping) { }

        /// <summary>
        /// Excludes user objects that are XML nodes.
        /// </summary>
        public override bool IsExcluded(Object obj, string attr, Object value,
                bool isWrite)
        {
            return exclude.Contains(attr)
                    || (isWrite && attr.Equals("value") && value is XmlNode && ((XmlNode)value)
                            .NodeType == XmlNodeType.Element);
        }

        /// <summary>
        /// Encodes an mxCell and wraps the XML up inside the
        /// XML of the user object (inversion).
        /// </summary>
        public override XmlNode AfterEncode(mxCodec enc, Object obj, XmlNode node)
        {
            if (obj is mxCell && node is XmlElement)
            {
                mxCell cell = (mxCell)obj;

                if (cell.Value != null)
                {
                    if (cell.Value is XmlNode)
                    {
                        // Wraps the graphical annotation up in the
                        // user object (inversion) by putting the
                        // result of the default encoding into
                        // a clone of the user object (node type 1)
                        // and returning this cloned user object.
                        XmlElement tmp = (XmlElement)node;
                        node = enc.Document.ImportNode((XmlNode)cell.Value, true);
                        node.AppendChild(tmp);

                        // Moves the id attribute to the outermost
                        // XML node, namely the node which denotes
                        // the object boundaries in the file.
                        String id = tmp.GetAttribute("id");
                        ((XmlElement)node).SetAttribute("id", id);
                        tmp.RemoveAttribute("id");
                    }
                }
            }

            return node;
        }

        /// <summary>
        /// Decodes an mxCell and uses the enclosing XML node as
        /// the user object for the cell (inversion).
        /// </summary>
        public override XmlNode BeforeDecode(mxCodec dec, XmlNode node, Object obj)
        {
            XmlElement inner = (XmlElement)node;

            if (obj is mxCell)
            {
                mxCell cell = (mxCell)obj;
                String classname = GetName();

                if (!node.Name.Equals(classname))
                {
                    // Passes the inner graphical annotation node to the
                    // object codec for further processing of the cell.
                    XmlNode tmp = inner.GetElementsByTagName(classname)[0];

                    if (tmp != null && tmp.ParentNode == node)
                    {
                        inner = (XmlElement)tmp;

                        // Removes annotation and whitespace from node
                        XmlNode tmp2 = tmp.PreviousSibling;

                        while (tmp2 != null && tmp2.NodeType == XmlNodeType.Text)
                        {
                            XmlNode tmp3 = tmp2.PreviousSibling;

                            if (tmp2.Value.Trim().Length == 0)
                            {
                                tmp2.ParentNode.RemoveChild(tmp2);
                            }

                            tmp2 = tmp3;
                        }

                        // Removes more whitespace
                        tmp2 = tmp.NextSibling;

                        while (tmp2 != null && tmp2.NodeType == XmlNodeType.Text)
                        {
                            XmlNode tmp3 = tmp2.PreviousSibling;

                            if (tmp2.Value.Trim().Length == 0)
                            {
                                tmp2.ParentNode.RemoveChild(tmp2);
                            }

                            tmp2 = tmp3;
                        }

                        tmp.ParentNode.RemoveChild(tmp);
                    }
                    else
                    {
                        inner = null;
                    }

                    // Creates the user object out of the XML node
                    XmlElement value = (XmlElement)node.CloneNode(true);
                    cell.Value = value;
                    String id = value.GetAttribute("id");

                    if (id != null)
                    {
                        cell.Id = id;
                        value.RemoveAttribute("id");
                    }
                }
                else
                {
                    cell.Id = ((XmlElement)node).GetAttribute("id");
                }

                // Preprocesses and removes all Id-references
                // in order to use the correct encoder (this)
                // for the known references to cells (all).
                if (inner != null && idrefs != null)
                {
                    foreach (string attr in idrefs)
                    {
                        string rf = inner.GetAttribute(attr);

                        if (rf != null && rf.Length > 0)
                        {
                            inner.RemoveAttribute(attr);
                            Object tmp = (dec.Objects.ContainsKey(rf)) ? dec.Objects[rf] : null;

                            if (tmp == null)
                            {
                                tmp = dec.Lookup(rf);
                            }

                            if (tmp == null)
                            {
                                // Needs to decode forward reference
                                XmlNode element = dec.GetElementById(rf);

                                if (element != null)
                                {
                                    mxObjectCodec decoder = mxCodecRegistry
                                            .GetCodec(element.Name);

                                    if (decoder == null)
                                    {
                                        decoder = this;
                                    }

                                    tmp = decoder.Decode(dec, element);
                                }
                            }

                            SetFieldValue(obj, attr, tmp);
                        }
                    }
                }
            }

            return inner;
        }

    }

}
