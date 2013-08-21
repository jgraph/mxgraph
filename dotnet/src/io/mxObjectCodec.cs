// $Id: mxObjectCodec.cs,v 1.3 2013/08/18 20:19:11 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Xml;
using System.Reflection;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Generic codec for C# objects. See below for a detailed description of
    /// the encoding/decoding scheme.
    /// Note: Since booleans are numbers in JavaScript, all boolean values are
    /// encoded into 1 for true and 0 for false.
    /// </summary>
    public class mxObjectCodec
    {
        /// <summary>
        /// Immutable empty set.
        /// </summary>
        private static List<string> EMPTY_SET = new List<string>();

        /// <summary>
        /// Holds the template object associated with this codec.
        /// </summary>
        protected Object template;

        /// <summary>
        /// Array containing the variable names that should be
        /// ignored by the codec.
        /// </summary>
        protected List<string> exclude;

        /// <summary>
        /// Array containing the variable names that should be
        /// turned into or converted from references. See
        /// mxCodec.getId and mxCodec.getObject.
        /// </summary>
        protected List<string> idrefs;

        /// <summary>
        /// Maps from from fieldnames to XML attribute names.
        /// </summary>
        protected Dictionary<string, string> mapping;

        /// <summary>
        /// Maps from from XML attribute names to fieldnames.
        /// </summary>
        protected Dictionary<string, string> reverse;

        /// <summary>
        /// Constructs a new codec for the specified template object.
        /// </summary>
        /// <param name="template">Prototypical instance of the object to be encoded/decoded.</param>
        public mxObjectCodec(Object template) : this(template, null, null, null) { }

        /// <summary>
        /// Constructs a new codec for the specified template object.
        /// The variables in the optional exclude array are ignored by
        /// the codec. Variables in the optional idrefs array are
        /// turned into references in the XML. The optional mapping
        /// may be used to map from variable names to XML attributes.
        /// </summary>
        /// <param name="template">Prototypical instance of the object to be encoded/decoded.</param>
        /// <param name="exclude">Optional array of fieldnames to be ignored.</param>
        /// <param name="idrefs">Optional array of fieldnames to be converted to/from references.</param>
        /// <param name="mapping">Optional mapping from field- to attributenames.</param>
        public mxObjectCodec(Object template, string[] exclude, string[] idrefs,
                Dictionary<string, string> mapping)
        {
            this.template = template;

            if (exclude != null)
            {
                this.exclude = new List<string>();
                foreach (string s in exclude)
                {
                    this.exclude.Add(s);
                }
            }
            else
            {
                this.exclude = EMPTY_SET;
            }

            if (idrefs != null)
            {
                this.idrefs = new List<String>();
                foreach (string s in idrefs)
                {
                    this.idrefs.Add(s);
                }
            }
            else
            {
                this.idrefs = EMPTY_SET;
            }

            if (mapping == null)
            {
                mapping = new Dictionary<string, string>();
            }
            this.mapping = mapping;
            reverse = new Dictionary<string, string>();

            foreach (KeyValuePair<string, string> entry in mapping)
            {
                reverse[entry.Value] = entry.Key;
            }
        }

        /// <summary>
        /// Returns the name used for the nodenames and lookup of the codec when
        /// classes are encoded and nodes are decoded. For classes to work with
        /// this the codec registry automatically adds an alias for the classname
        /// if that is different than what this returns. The default implementation
        /// returns the classname of the template class.
        /// </summary>
        public string GetName()
        {
            return mxCodecRegistry.GetName(Template);
        }

        /// <summary>
        /// Returns the template object associated with this codec.
        /// </summary>
        /// <returns>Returns the template object.</returns>
        public Object Template
        {
            get { return template; }
        }

        /// <summary>
        /// Returns a new instance of the template object for representing the given
        /// node.
        /// </summary>
        /// <param name="node">XML node that the object is going to represent.</param>
        /// <returns>Returns a new template instance.</returns>
        protected virtual Object CloneTemplate(XmlNode node)
        {
            Object obj = null;

            try
            {
                obj = Activator.CreateInstance(template.GetType());

                // Special case: Check if the collection
                // should be a map. This is if the first
                // child has an "as"-attribute. This
                // assumes that all childs will have
                // as attributes in this case. This is
                // required because in JavaScript, the
                // map and array object are the same.
                if (obj is ICollection)
                {
                    node = node.FirstChild;

                    if (node.Attributes["as"] != null)
                    {
                        obj = new Hashtable();
                    }
                }
            }
            catch (Exception e)
            {
                Trace.WriteLine(this + ".CloneTemplate(" + node + "): " + e.Message + " for " + template);
            }

            return obj;
        }

        /// <summary>
        /// Returns true if the given attribute is to be ignored
        /// by the codec. This implementation returns true if the
        /// given fieldname is in exclude.
        /// </summary>
        /// <param name="obj">Object instance that contains the field.</param>
        /// <param name="attr">Fieldname of the field.</param>
        /// <param name="value">Value of the field.</param>
        /// <param name="write">Boolean indicating if the field is being encoded or
        /// decoded. write is true if the field is being encoded, else it is
        /// being decoded.</param>
        /// <returns>Returns true if the given attribute should be ignored.</returns>
        public virtual bool IsExcluded(Object obj, string attr, Object value,
                bool write)
        {
            return exclude.Contains(attr);
        }

        /// <summary>
        /// Returns true if the given fieldname is to be treated
        /// as a textual reference (ID). This implementation returns
        /// true if the given fieldname is in idrefs.
        /// </summary>
        /// <param name="obj">Object instance that contains the field.</param>
        /// <param name="attr">Fieldname of the field.</param>
        /// <param name="value">Value of the field.</param>
        /// <param name="write">Boolean indicating if the field is being encoded or
        /// decoded. write is true if the field is being encoded, else it is being
        /// decoded.</param>
        /// <returns>Returns true if the given attribute should be handled as a
        /// reference.</returns>
        public virtual bool IsReference(Object obj, string attr, Object value,
                bool write)
        {
            return idrefs.Contains(attr);
        }

        /// <summary>
        /// Encodes the specified object and returns a node
        /// representing then given object. Calls beforeEncode
        /// after creating the node and afterEncode with the 
        /// resulting node after processing.
        /// Enc is a reference to the calling encoder. It is used
        /// to encode complex objects and create references.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object to be encoded.</param>
        /// <returns>Returns the resulting XML node that represents the given object.</returns>
        public virtual XmlNode Encode(mxCodec enc, Object obj)
        {
            XmlNode node = enc.Document.CreateElement(GetName());

            obj = BeforeEncode(enc, obj, node);
            EncodeObject(enc, obj, node);

            return AfterEncode(enc, obj, node);
        }

        /// <summary>
        ///  Encodes the value of each member in then given obj
        ///  into the given node using encodeFields and encodeElements.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object to be encoded.</param>
        /// <param name="node">XML node that contains the encoded object.</param>
        protected virtual void EncodeObject(mxCodec enc, Object obj, XmlNode node)
        {
            mxCodec.SetAttribute(node, "id", enc.GetId(obj));
            EncodeFields(enc, obj, node);
            EncodeElements(enc, obj, node);
        }

        /// <summary>
        /// Encodes the members of the given object into the given node.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object whose fields should be encoded.</param>
        /// <param name="node">XML node that contains the encoded object.</param>
        protected void EncodeFields(mxCodec enc, Object obj, XmlNode node)
        {
            Type type = obj.GetType();
            PropertyInfo[] properties = type.GetProperties();

            foreach (PropertyInfo property in properties)
            {
                if (property.CanRead && property.CanWrite)
                {
                    string name = property.Name;
                    Object value = GetFieldValue(obj, name);

                    // Removes Is-Prefix from bool properties
                    if (value is bool && name.StartsWith("Is"))
                    {
                        name = name.Substring(2);
                    }

                    name = name.Substring(0, 1).ToLower() + name.Substring(1);
                    EncodeValue(enc, obj, name, value, node);
                }
            }
        }

        /// <summary>
        /// Encodes the child objects of arrays, dictionaries and enumerables.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object whose child objects should be encoded.</param>
        /// <param name="node">XML node that contains the encoded object.</param>
        protected void EncodeElements(mxCodec enc, Object obj, XmlNode node)
        {
            if (obj.GetType().IsArray)
            {
                foreach (Object o in ((Object[])obj))
                {
                    EncodeValue(enc, obj, null, o, node);
                }
            }
            else if (obj is IDictionary)
            {
                foreach (KeyValuePair<string, string> entry in ((IDictionary)mapping))
                {
                    EncodeValue(enc, obj, entry.Key, entry.Value, node);
                }
            }
            else if (obj is IEnumerable)
            {
                foreach (Object value in ((IEnumerable)obj))
                {
                    EncodeValue(enc, obj, null, value, node);
                }
            }
        }

        /// <summary>
        /// Converts the given value according to the mappings and id-refs in
        /// this codec and uses writeAttribute to write the attribute into the
        /// given node.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object whose member is going to be encoded.</param>
        /// <param name="fieldname"></param>
        /// <param name="value">Value of the property to be encoded.</param>
        /// <param name="node">XML node that contains the encoded object.</param>
        protected void EncodeValue(mxCodec enc, Object obj, string fieldname,
                Object value, XmlNode node)
        {
            if (value != null && !IsExcluded(obj, fieldname, value, true))
            {
                if (IsReference(obj, fieldname, value, true))
                {
                    Object tmp = enc.GetId(value);

                    if (tmp == null)
                    {
                        Trace.WriteLine("mxObjectCodec.encode: No ID for " +
                            GetName() + "." + fieldname + "=" + value);
                        return; // exit
                    }

                    value = tmp;
                }

                Object defaultValue = GetFieldValue(template, fieldname);

                if (fieldname == null || enc.IsEncodeDefaults
                        || defaultValue == null || !defaultValue.Equals(value))
                {
                    WriteAttribute(enc, obj, GetAttributeName(fieldname), value,
                            node);
                }
            }
        }

        /// <summary>
        /// Returns true if the given object is a primitive value.
        /// </summary>
        /// <param name="value">Object that should be checked.</param>
        /// <returns>Returns true if the given object is a primitive value.</returns>
        protected bool IsPrimitiveValue(Object value)
        {
            return value is string || value is Boolean
                    || value is Char || value is Byte
                    || value is Int16 || value is Int32
                    || value is Int64 || value is Single
                    || value is Double || value.GetType().IsPrimitive;
        }

        /// <summary>
        /// Writes the given value into node using writePrimitiveAttribute
        /// or writeComplexAttribute depending on the type of the value.
        /// </summary>
        /// 
        protected void WriteAttribute(mxCodec enc, Object obj, string attr,
                Object value, XmlNode node)
        {
            value = ConvertValueToXml(value);

            if (IsPrimitiveValue(value))
            {
                WritePrimitiveAttribute(enc, obj, attr, value, node);
            }
            else
            {
                WriteComplexAttribute(enc, obj, attr, value, node);
            }
        }

        /// <summary>
        /// Writes the given value as an attribute of the given node.
        /// </summary>
        protected void WritePrimitiveAttribute(mxCodec enc, Object obj,
                string attr, Object value, XmlNode node)
        {
            if (attr == null || obj is IDictionary)
            {
                XmlNode child = enc.Document.CreateElement("add");

                if (attr != null)
                {
                    mxCodec.SetAttribute(child, "as", attr);
                }

                mxCodec.SetAttribute(child, "value", value);
                node.AppendChild(child);
            }
            else
            {
                mxCodec.SetAttribute(node, attr, value);
            }
        }

        /// <summary>
        /// Writes the given value as a child node of the given node.
        /// </summary>
        protected void WriteComplexAttribute(mxCodec enc, Object obj, string attr,
                Object value, XmlNode node)
        {
            XmlNode child = enc.Encode(value);

            if (child != null)
            {
                if (attr != null)
                {
                    mxCodec.SetAttribute(child, "as", attr);
                }

                node.AppendChild(child);
            }
            else
            {
                Trace.WriteLine("mxObjectCodec.encode: No node for " +
                    GetName() + "." + attr + ": " + value);
            }
        }

        /// <summary>
        /// Converts true to "1" and false to "0". All other values are ignored.
        /// </summary>
        protected virtual Object ConvertValueToXml(Object value)
        {
            if (value is Boolean)
            {
                value = ((bool)value) ? "1" : "0";
            }

            return value;
        }

        /// <summary>
        /// Converts XML attribute values to object of the given type.
        /// </summary>
        protected virtual Object ConvertValueFromXml(Type type, Object value)
        {
            // Special case: Booleans are stored as numeric values   
            if (type == true.GetType()) // TODO: static type reference
            {
                value = value.Equals("1");
            }
            else
            {
                TypeConverter tc = TypeDescriptor.GetConverter(type);

                if (tc.CanConvertFrom(value.GetType()))
                {
                    value = tc.ConvertFrom(value);
                }
            }

            return value;
        }

        /// <summary>
        /// Returns the XML node attribute name for the given C# field name.
        /// That is, it returns the mapping of the field name.
        /// </summary>
        protected string GetAttributeName(string fieldname)
        {
            if (fieldname != null)
            {
                string mapped = (mapping.ContainsKey(fieldname)) ? mapping[fieldname] : null;

                if (mapped != null)
                {
                    fieldname = mapped;
                }
            }

            return fieldname;
        }

        /// <summary>
        /// Returns the C# field name for the given XML attribute
        /// name. That is, it returns the reverse mapping of the
        /// attribute name.
        /// </summary>
        /// <param name="attributename">The attribute name to be mapped.</param>
        /// <returns>String that represents the mapped field name.</returns>
        protected string GetFieldName(string attributename)
        {
            if (attributename != null)
            {
                string mapped = (reverse.ContainsKey(attributename)) ? reverse[attributename] : null;

                if (mapped != null)
                {
                    attributename = mapped;
                }
            }

            return attributename;
        }

        /// <summary>
        /// Returns the value of the field with the specified name
        /// in the specified object instance.
        /// </summary>
        protected Object GetFieldValue(Object obj, string name)
        {
            Object value = null;

            if (obj != null && name != null && name.Length > 0)
            {
                name = name.Substring(0, 1).ToUpper() + name.Substring(1);
                PropertyInfo property = obj.GetType().GetProperty(name);

                // Gets a boolean property by adding Is-Prefix
                if (property == null)
                {
                    property = obj.GetType().GetProperty("Is"+name);
                }

                try
                {
                    value = property.GetValue(obj, null);
                }
                catch (Exception e)
                {
                    Trace.WriteLine(this + ".GetFieldValue(" + obj + ", " + name + "): " + e.Message);
                }
            }

            return value;
        }

        /// <summary>
        /// Sets the value of the field with the specified name
        /// in the specified object instance.
        /// </summary>
        protected void SetFieldValue(Object obj, string name, Object value)
        {
            try
            {
                name = name.Substring(0, 1).ToUpper() + name.Substring(1);
                PropertyInfo property = obj.GetType().GetProperty(name);

                // Finds a boolean property by adding Is-Prefix
                if (property == null)
                {
                    property = obj.GetType().GetProperty("Is"+name);

                    if ((!value.Equals("1") && !value.Equals("0")) ||
                        property.PropertyType != true.GetType())
                    {
                        property = null;
                    }
                }

                if (property != null)
                {
                    value = ConvertValueFromXml(property.PropertyType, value);

					// Converts collection to a typed array or typed list
                    if (value is ArrayList)
                    {
                        ArrayList list = (ArrayList)value;

                        if (property.PropertyType.IsArray)
                        {
                            value = list.ToArray(property.PropertyType.GetElementType());
                        }
                        else if (list.Count > 0 && property.PropertyType.IsAssignableFrom(typeof(List<>).MakeGenericType(list[0].GetType())))
                        {
                            IList newValue = (IList)Activator.CreateInstance(property.PropertyType);
                            Type targetType = property.PropertyType.GetGenericArguments()[0];

                            foreach (var elt in list)
                            {
                                if (targetType.IsAssignableFrom(elt.GetType()))
                                {
                                    newValue.Add(elt);
                                }
                            }

                            value = newValue;
                        }
                    }

                    property.SetValue(obj, value, null);
                }
                else
                {
                    Console.WriteLine("Cannot set field " + name);
                }
            }
            catch (Exception e)
            {
                Trace.WriteLine(this + ".SetFieldValue(" + obj + ", " + name + ", " + value + "): " + e.Message);
            }
        }

        /// <summary>
        /// Hook for subclassers to pre-process the object before
        /// encoding. This returns the input object. The return
        /// value of this function is used in encode to perform
        /// the default encoding into the given node.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object to be encoded.</param>
        /// <param name="node">XML node to encode the object into.</param>
        /// <returns>Returns the object to be encoded by the default encoding.</returns>
        public virtual Object BeforeEncode(mxCodec enc, Object obj, XmlNode node)
        {
            return obj;
        }

        /// <summary>
        /// Hook for subclassers to Receive-process the node
        /// for the given object after encoding and return the
        /// Receive-processed node. This implementation returns
        /// the input node. The return value of this method
        /// is returned to the encoder from encode.
        /// </summary>
        /// <param name="enc">Codec that controls the encoding process.</param>
        /// <param name="obj">Object to be encoded.</param>
        /// <param name="node">XML node that represents the default encoding.</param>
        /// <returns>Returns the resulting node of the encoding.</returns>
        public virtual XmlNode AfterEncode(mxCodec enc, Object obj, XmlNode node)
        {
            return node;
        }

        /// <summary>
        /// Parses the given node into the object or returns a new object
        /// representing the given node.
        /// </summary>
        /// <param name="dec">Codec that controls the encoding process.</param>
        /// <param name="node">XML node to be decoded.</param>
        /// <returns>Returns the resulting object that represents the given XML node.</returns>
        public virtual Object Decode(mxCodec dec, XmlNode node)
        {
            return Decode(dec, node, null);
        }

        /// <summary>
        /// Parses the given node into the object or returns a new object
        /// representing the given node.
        /// Dec is a reference to the calling decoder. It is used to decode
        /// complex objects and resolve references.
        /// If a node has an id attribute then the object cache is checked for the
        /// object. If the object is not yet in the cache then it is constructed
        /// using the constructor of template and cached in mxCodec.objects.
        /// This implementation decodes all attributes and childs of a node
        /// according to the following rules:
        /// - If the variable name is in exclude or if the attribute name is "id"
        /// or "as" then it is ignored.
        /// - If the variable name is in idrefs then mxCodec.getObject is used
        /// to replace the reference with an object.
        /// - The variable name is mapped using a reverse mapping.
        /// - If the value has a child node, then the codec is used to create a
        /// child object with the variable name taken from the "as" attribute.
        /// - If the object is an array and the variable name is empty then the
        /// value or child object is appended to the array.
        /// - If an add child has no value or the object is not an array then
        /// the child text content is evaluated using mxUtils.eval.
        /// If no object exists for an ID in idrefs a warning is issued
        /// using mxLog.warn.
        /// Returns the resulting object that represents the given XML
        /// node or the configured given object.
        /// </summary>
        /// <param name="dec">Codec that controls the encoding process.</param>
        /// <param name="node">XML node to be decoded.</param>
        /// <param name="into">Optional objec to encode the node into.</param>
        /// <returns>Returns the resulting object that represents the given XML node
        /// or the object given to the method as the into parameter.</returns>
        public virtual Object Decode(mxCodec dec, XmlNode node, Object into)
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

                node = BeforeDecode(dec, node, obj);
                DecodeNode(dec, node, obj);
                obj = AfterDecode(dec, node, obj);
            }

            return obj;
        }

        /// <summary>
        /// Calls decodeAttributes and decodeChildren for the given node.
        /// </summary>
        protected void DecodeNode(mxCodec dec, XmlNode node, Object obj)
        {
            if (node != null)
            {
                DecodeAttributes(dec, node, obj);
                DecodeChildren(dec, node, obj);
            }
        }

        /// <summary>
        /// Decodes all attributes of the given node using decodeAttribute.
        /// </summary>
        protected void DecodeAttributes(mxCodec dec, XmlNode node, Object obj)
        {
            XmlAttributeCollection attrs = node.Attributes;
            if (attrs != null)
            {
                foreach (XmlAttribute attr in attrs)
                {
                    DecodeAttribute(dec, attr, obj);
                }
            }
        }

        /// <summary>
        /// Reads the given attribute into the specified object.
        /// </summary>
        protected void DecodeAttribute(mxCodec dec, XmlNode attr, Object obj)
        {
            string name = attr.Name;

            if (!name.ToLower().Equals("as") &&
                !name.ToLower().Equals("id"))
            {
                Object value = attr.Value;
                string fieldname = GetFieldName(name);

                if (IsReference(obj, fieldname, value, false))
                {
                    Object tmp = dec.GetObject(value.ToString());

                    if (tmp == null)
                    {
                        Trace.WriteLine("mxObjectCodec.decode: No object for " +
                            GetName() + "." + fieldname + "=" + value);
                        return; // exit
                    }

                    value = tmp;
                }

                if (!IsExcluded(obj, fieldname, value, false))
                {
                    SetFieldValue(obj, fieldname, value);
                }
            }
        }

        /// <summary>
        /// Reads the given attribute into the specified object.
        /// </summary>
        protected void DecodeChildren(mxCodec dec, XmlNode node, Object obj)
        {
            XmlNode child = node.FirstChild;

            while (child != null)
            {
                if (child.NodeType == XmlNodeType.Element
                        && !ProcessInclude(dec, child, obj))
                {
                    DecodeChild(dec, child, obj);
                }

                child = child.NextSibling;
            }
        }

        /// <summary>
        /// Reads the specified child into the given object.
        /// </summary>
        protected void DecodeChild(mxCodec dec, XmlNode child, Object obj)
        {
            string fieldname = GetFieldName(((XmlElement)child).GetAttribute("as"));

            if (fieldname == null || !IsExcluded(obj, fieldname, child, false))
            {
                Object template = GetFieldTemplate(obj, fieldname, child);
                Object value = null;
                
                if (child.Name.Equals("add"))
                {
                    value = ((XmlElement)child).GetAttribute("value");

                    if (value == null)
                    {
                        value = child.InnerText;
                    }
                }
                else
                {
                    value = dec.Decode(child, template);
                }

                AddObjectValue(obj, fieldname, value, template);
            }
        }

        /// <summary>
        /// Returns the template instance for the given field. This returns the
        /// value of the field, null if the value is an array or an empty collection
        /// if the value is a collection. The value is then used to populate the
        /// field for a new instance. For strongly typed languages it may be
        /// required to override this to return the correct collection instance
        /// based on the encoded child.
        /// </summary>
        protected Object GetFieldTemplate(Object obj, String fieldname, XmlNode child)
	    {
		    Object template = GetFieldValue(obj, fieldname);

            // Arrays are replaced completely
            if (template != null && template.GetType().IsArray)
            {
                template = null;
            }
            // Collections are cleared
            else if (template is IList)
            {
                ((IList)template).Clear();
            }
    		
		    return template;
	    }

        /// <summary>
        /// Sets the decoded child node as a value of the given object. If the
        /// object is a map, then the value is added with the given fieldname as a
        /// key. If the fieldname is not empty, then setFieldValue is called or
        /// else, if the object is a collection, the value is added to the
        /// collection. For strongly typed languages it may be required to
        /// override this with the correct code to add an entry to an object.
        /// </summary>
        protected void AddObjectValue(Object obj, String fieldname, Object value, Object template)
	    {
            if (value != null && !value.Equals(template))
            {
                if (fieldname != null && obj is IDictionary)
                {
                    ((IDictionary)obj).Add(fieldname, value);
                }
                else if (fieldname != null && fieldname.Length > 0)
                {
                    SetFieldValue(obj, fieldname, value);
                }
                // Arrays are treated as collections and
                // converted in setFieldValue
                else if (obj is IList)
                {
                    ((IList)obj).Add(value);
                }
            }
	    }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="dec">Codec that controls the encoding/decoding process.</param>
        /// <param name="node">XML node to be checked.</param>
        /// <param name="into">Optional object to pass-thru to the codec.</param>
        /// <returns>Returns true if the given node was processed as an include.</returns>
        public bool ProcessInclude(mxCodec dec, XmlNode node, Object into)
        {
            if (node.NodeType == XmlNodeType.Element
                    && node.Name.ToLower().Equals("include"))
            {
                string name = ((XmlElement)node).GetAttribute("name");

                if (name != null)
                {
                    XmlNode xml = mxUtils.LoadDocument(name).DocumentElement;

                    if (xml != null)
                    {
                        dec.Decode(xml, into);
                    }
                }

                return true;
            }

            return false;
        }

        /// <summary>
        /// Hook for subclassers to pre-process the node for
        /// the specified object and return the node to be
        /// used for further processing by decode.
        /// The object is created based on the template in the
        /// calling method and is never null. This implementation
        /// returns the input node. The return value of this
        /// function is used in decode to perform
        /// the default decoding into the given object.
        /// </summary>
        /// <param name="dec">Codec that controls the decoding process.</param>
        /// <param name="node">XML node to be decoded.</param>
        /// <param name="obj">Object to encode the node into.</param>
        /// <returns>Returns the node used for the default decoding.</returns>
        public virtual XmlNode BeforeDecode(mxCodec dec, XmlNode node, Object obj)
        {
            return node;
        }

        /// <summary>
        /// Hook for subclassers to Receive-process the object after
        /// decoding. This implementation returns the given object
        /// without any changes. The return value of this method
        /// is returned to the decoder from decode.
        /// </summary>
        /// <param name="dec">Codec that controls the decoding process.</param>
        /// <param name="node">XML node to be decoded.</param>
        /// <param name="obj">Object that represents the default decoding.</param>
        /// <returns>Returns the result of the decoding process.</returns>
        public virtual Object AfterDecode(mxCodec dec, XmlNode node, Object obj)
        {
            return obj;
        }

    }

}
