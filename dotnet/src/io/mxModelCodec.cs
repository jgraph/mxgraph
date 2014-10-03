// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Codec for mxGraphModels. This class is created and registered
    /// dynamically at load time and used implicitely via mxCodec
    /// and the mxCodecRegistry.
    /// </summary>
    public class mxModelCodec : mxObjectCodec
    {

        /// <summary>
        /// Constructs a new model codec.
        /// </summary>
        public mxModelCodec() : this(new mxGraphModel(), null, null, null) { }

        /// <summary>
        /// Constructs a new model codec for the given template.
        /// </summary>
        public mxModelCodec(Object template) : this(template, null, null, null) { }

        /// <summary>
        /// Constructs a new model codec for the given arguments.
        /// </summary>
        public mxModelCodec(Object template, String[] exclude, String[] idrefs,
                Dictionary<string, string> mapping)
            : base(template, exclude, idrefs, mapping) { }

        /// <summary>
        /// Encodes the given mxGraphModel by writing a (flat) XML sequence
        /// of cell nodes as produced by the mxCellCodec. The sequence is
        /// wrapped-up in a node with the name root.
        /// </summary>
        protected override void EncodeObject(mxCodec enc, Object obj, XmlNode node)
        {
            if (obj is mxGraphModel)
            {
                XmlNode rootNode = enc.Document.CreateElement("root");
                mxGraphModel model = (mxGraphModel)obj;
                enc.EncodeCell((mxICell)model.Root, rootNode, true);
                node.AppendChild(rootNode);
            }
        }

        /// <summary>
        /// Reads the cells into the graph model. All cells are children of the root
        /// element in the node.
        /// </summary>
        public override XmlNode BeforeDecode(mxCodec dec, XmlNode node, Object into)
        {
            if (node is XmlElement)
            {
                XmlElement elt = (XmlElement)node;
                mxGraphModel model = null;

                if (into is mxGraphModel)
                {
                    model = (mxGraphModel)into;
                }
                else
                {
                    model = new mxGraphModel();
                }

                // Reads the cells into the graph model. All cells
                // are children of the root element in the node.
                XmlNode root = elt.GetElementsByTagName("root")[0];
                mxICell rootCell = null;

                if (root != null)
                {
                    XmlNode tmp = root.FirstChild;

                    while (tmp != null)
                    {
                        mxICell cell = dec.DecodeCell(tmp, true);

                        if (cell != null && cell.Parent == null)
                        {
                            rootCell = cell;
                        }

                        tmp = tmp.NextSibling;
                    }

                    root.ParentNode.RemoveChild(root);
                }

                // Sets the root on the model if one has been decoded
                if (rootCell != null)
                {
                    model.Root = rootCell;
                }
            }

            return node;
        }

    }

}
