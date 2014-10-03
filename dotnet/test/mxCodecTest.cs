// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.Threading;
using com.mxgraph;

namespace test
{
    public class mxCodecTest
    {

        public static void Main()
        {
            // Creates graph with model
            mxGraph graph = new mxGraph();

            // Adds cells into the model
            Object parent = graph.GetDefaultParent();
            graph.Model.BeginUpdate();
            Object v1, v2, e1;
            try
            {
                v1 = graph.InsertVertex(parent, null, "Hello", 20, 20, 80, 30);
                v2 = graph.InsertVertex(parent, null, "World!", 200, 150, 80, 30);
                e1 = graph.InsertEdge(parent, null, "e1", v1, v2);
            }
            finally
            {
                graph.Model.EndUpdate();
            }

            mxCodec codec = new mxCodec();
            XmlNode node = codec.Encode(graph.Model);
            string xml1 = mxUtils.GetPrettyXml(node);

            codec = new mxCodec();
            Object model = codec.Decode(node);

            codec = new mxCodec();
            node = codec.Encode(model);
            string xml2 = mxUtils.GetPrettyXml(node);

            Console.WriteLine("mxCodecTest Passed: "+(xml1.Equals(xml2)));
            Thread.Sleep(100000);
        }

    }

}
