// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace com.mxgraph
{
    /// <summary>
    /// Codec for mxStylesheets. This class is created and registered
    /// dynamically at load time and used implicitely via mxCodec
    /// and the mxCodecRegistry.
    /// </summary>
    public class mxStylesheetCodec : mxObjectCodec
    {

        /// <summary>
        /// Constructs a new stylesheet codec.
        /// </summary>
        public mxStylesheetCodec() : this(new mxStylesheet(), null, null, null) { }

        /// <summary>
        /// Constructs a new stylesheet codec for the given template.
        /// </summary>
        public mxStylesheetCodec(Object template) : this(template, null, null, null) { }

        /// <summary>
        /// Constructs a new stylesheet codec for the given arguments.
        /// </summary>
        public mxStylesheetCodec(Object template, String[] exclude, String[] idrefs,
                Dictionary<string, string> mapping)
            : base(template, exclude, idrefs, mapping) { }

        /// <summary>
        /// Encode the given mxStylesheet.
        /// </summary>
        public override XmlNode Encode(mxCodec enc, Object obj)
        {
            XmlElement node = enc.Document.CreateElement(GetName());
    		
		    if (obj is mxStylesheet)
		    {
			    mxStylesheet stylesheet = (mxStylesheet) obj;

                foreach (KeyValuePair<string, Dictionary<string, Object>> entry in stylesheet.Styles)
                {
                    XmlElement styleNode = enc.Document.CreateElement("add");
                    styleNode.SetAttribute("as", entry.Key);

                    foreach (KeyValuePair<string, Object> entry2 in entry.Value)
                    {
                        XmlElement entryNode = enc.Document.CreateElement("add");
					    entryNode.SetAttribute("as", entry2.Key);
                        entryNode.SetAttribute("value", getStringValue(entry2));
					    styleNode.AppendChild(entryNode);
                    }

				    if (styleNode.ChildNodes.Count > 0)
				    {
					    node.AppendChild(styleNode);
				    }
			    }
		    }
    		
		    return node;
        }

        /// <summary>
        /// Returns the string for encoding the given value.
        /// </summary>
        protected string getStringValue(KeyValuePair<string, Object> entry)
        {
            if (entry.Value is Boolean)
            {
                return ((Boolean)entry.Value) ? "1" : "0";
            }

            return entry.Value.ToString();
        }

        /// <summary>
        /// Decodes the given mxStylesheet.
        /// </summary>
        public override Object Decode(mxCodec dec, XmlNode node, Object into)
        {
            Object obj = null;

            if (node is XmlElement)
            {
                string id = ((XmlElement)node).GetAttribute("id");
                obj = (dec.Objects.ContainsKey(id)) ? dec.Objects[id] : null;

                if (obj == null)
                {
                    obj = into;

                    if (obj == null)
                    {
                        obj = CloneTemplate(node);
                    }

                    if (id != null && id.Length > 0)
                    {
                        dec.PutObject(id, obj);
                    }
                }

                node = node.FirstChild;

                while (node != null)
                {
                    if (!ProcessInclude(dec, node, obj) && node.Name.Equals("add") && node is XmlElement)
                    {
                        string name = ((XmlElement) node).GetAttribute("as");

                        if (name != null && name.Length > 0)
                        {
                            string extend = ((XmlElement) node).GetAttribute("extend");
                            Dictionary<string, Object> style = (extend != null && ((mxStylesheet)obj).Styles.ContainsKey(extend)) ?
                                    ((mxStylesheet)obj).Styles[extend] : null;

                            if (style == null)
                            {
                                style = new Dictionary<string, Object>();
                            }
                            else
                            {
                                style = new Dictionary<string, Object>(style);
                            }

                            XmlNode entry = node.FirstChild;

                            while (entry != null)
                            {
                                if (entry is XmlElement)
                                {
                                    XmlElement entryElement = (XmlElement)entry;
                                    string key = entryElement.GetAttribute("as");

                                    if (entry.Name.Equals("add"))
                                    {
                                        string text = entryElement.Value;
                                        Object value = null;

                                        if (text != null && text.Length > 0)
                                        {
                                            value = mxUtils.Eval(text);
                                        }
                                        else
                                        {
                                            value = entryElement.GetAttribute("value");
                                        }

                                        if (value != null)
                                        {
                                            style[key] = value;
                                        }
                                    }
                                    else if (entry.Name.Equals("remove"))
                                    {
                                        style.Remove(key);
                                    }
                                }

                                entry = entry.NextSibling;
                            }

                            ((mxStylesheet) obj).PutCellStyle(name, style);
                        }
                    }

                    node = node.NextSibling;
                }
            }

            return obj;
        }
    }

}
