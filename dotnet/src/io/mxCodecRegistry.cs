// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Diagnostics;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Static class that acts as a global registry for codecs. See mxCodec for
    /// an example of using this class.
    /// </summary>
    public class mxCodecRegistry
    {

        /// <summary>
        /// Maps from constructor names to codecs.
        /// </summary>
        protected static Dictionary<string, mxObjectCodec> codecs = new Dictionary<string, mxObjectCodec>();

        /// <summary>
        /// Maps from classnames to codecnames.
        /// </summary>
        protected static Dictionary<string, string> aliases = new Dictionary<string, string>();

        /// <summary>
        /// Holds the list of known namespaces. Packages are used to prefix short
        /// class names (eg. mxCell) in XML markup.
        /// </summary>
        protected static List<string> namespaces = new List<string>();

        // Registers the known codecs and package names
        static mxCodecRegistry()
        {
            AddNamespace("com.mxgraph");
            AddNamespace("System.Collections.Generic");

            Register(new mxObjectCodec(new ArrayList()));
            Register(new mxModelCodec());
            Register(new mxCellCodec());
            Register(new mxStylesheetCodec());
        }

        /// <summary>
        /// Registers a new codec and associates the name of the template constructor
        /// in the codec with the codec object. Automatically creates an alias if the
        /// codename and the classname are not equal.
        /// </summary>
        public static mxObjectCodec Register(mxObjectCodec codec)
        {
            if (codec != null)
            {
                string name = codec.GetName();
                codecs[name] = codec;

                string classname = GetName(codec.Template);

                if (!classname.Equals(name))
                {
                    AddAlias(classname, name);
                }
            }

            return codec;
        }

        /// <summary>
        /// Adds an alias for mapping a classname to a codecname.
        /// </summary>
        public static void AddAlias(string classname, string codecname)
        {
            aliases[classname] = codecname;
        }

        /// <summary>
        /// Returns a codec that handles the given object, which can be an object
        /// instance or an XML node.
        /// </summary>
        /// <param name="name">C# type name.</param>
        /// <returns></returns>
        public static mxObjectCodec GetCodec(String name)
        {
            if (aliases.ContainsKey(name))
            {
                name = aliases[name];
            }

            mxObjectCodec codec = (codecs.ContainsKey(name)) ? codecs[name] : null;

            if (codec == null)
            {
                Object instance = GetInstanceForName(name);

                if (instance != null)
                {
                    try
                    {
                        codec = new mxObjectCodec(instance);
                        Register(codec);
                    }
                    catch (Exception e)
                    {
                        Trace.WriteLine("mxCodecRegistry.GetCodec(" + name + "): " + e.Message);
                    }
                }
            }

            return codec;
        }

        /// <summary>
        /// Adds the given namespace to the list of known namespaces.
        /// </summary>
        /// <param name="ns">Name of the namespace to be added.</param>
        public static void AddNamespace(String ns)
        {
            namespaces.Add(ns);
        }

        /// <summary>
        /// Creates and returns a new instance for the given class name.
        /// </summary>
        /// <param name="name">Name of the class to be instantiated.</param>
        /// <returns>Returns a new instance of the given class.</returns>
        public static Object GetInstanceForName(String name)
        {
            Type type = GetTypeForName(name);

            if (type != null)
            {
                try
                {
                    return Activator.CreateInstance(type);
                }
                catch (Exception e)
                {
                    Trace.WriteLine("mxCodecRegistry.GetInstanceForName(" + name + "): " + e.Message);
                }
            }

            return null;
        }

        /// <summary>
        /// Returns a class that corresponds to the given name.
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static Type GetTypeForName(String name)
        {
            try
            {
                Type type = Type.GetType(name);

                if (type != null)
                {
                    return type;
                }
            }
            catch (Exception e)
            {
                Trace.WriteLine("mxCodecRegistry.GetTypeForName(" + name + "): " + e.Message);
            }

            foreach (string ns in namespaces)
            {
                try
                {
                    Type type = Type.GetType(ns + "." + name);

                    if (type != null)
                    {
                        return type;
                    }
                }
                catch (Exception e)
                {
                    Trace.WriteLine("mxCodecRegistry.GetTypeForName(" + ns + "." + name + "): " + e.Message);
                }
            }

            return null;
        }

        /// <summary>
        /// Returns the name that identifies the codec associated
        /// with the given instance.
        /// The I/O system uses unqualified classnames, eg. for a
        /// com.mxgraph.model.mxCell this returns mxCell.
        /// </summary>
        /// <param name="instance">Instance whose node name should be returned.</param>
        /// <returns>Returns a string that identifies the codec.</returns>
        public static String GetName(Object instance)
        {
            Type type = instance.GetType();

            if (type.IsArray || typeof(IEnumerable).IsAssignableFrom(type))
            {
                return "Array";
            }
            else
            {
                if (namespaces.Contains(type.Namespace))
                {
                    return type.Name;
                }
                else
                {
                    return type.FullName;
                }
            }
        }

    }

}
