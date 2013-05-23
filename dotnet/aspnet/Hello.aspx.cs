using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using com.mxgraph;

namespace aspnet
{
    public partial class _Hello : System.Web.UI.Page
    {
        protected string xml;

        protected void Page_Load(object sender, EventArgs e)
        {
            // Creates an instance of a graph to add vertices and edges. The instance can
            // then be used to create the corresponding XML using a codec. Note that this
            // is only required if a graph is programmatically created. If the XML for the
            // graph is already at hand, it can be sent directly here.
            mxGraph graph = new mxGraph();
            Object parent = graph.GetDefaultParent();

            // Adds vertices and edges to the graph.
            graph.Model.BeginUpdate();
            try
            {
                Object v1 = graph.InsertVertex(parent, null, "Hello,", 20, 20, 80, 30);
                Object v2 = graph.InsertVertex(parent, null, "World!", 200, 150, 80, 30);
                Object e1 = graph.InsertEdge(parent, null, "Edge", v1, v2);
            }
            finally
            {
                graph.Model.EndUpdate();
            }

            // Encodes the model into XML and passes the resulting XML string into a page
            // variable, so it can be read when the page is rendered on the server. Note
            // that the page instance is destroyed after the page was sent to the client.
            mxCodec codec = new mxCodec();
            Xml = mxUtils.GetXml(codec.Encode(graph.Model));
        }

        // Getter and setter for the XML variable.
        public string Xml
        {
            get { return xml; }
            set { xml = value; }
        }

    }
}
