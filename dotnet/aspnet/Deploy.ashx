<%@ WebHandler Language="C#" Class="Deploy" %>

using System;
using System.Web;
using System.IO;
using System.Net;
using System.Text;
using com.mxgraph;

public class Deploy : IHttpHandler
{
    /// <summary>
    /// Creates the Xml for the graph to be deployed.
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    protected string CreateGraph(HttpContext context)
    {
        // Creates the graph on the server-side
        mxCodec codec = new mxCodec();
        mxGraph graph = new mxGraph();
        Object parent = graph.GetDefaultParent();

        graph.Model.BeginUpdate();
        try
        {
            Object v1 = graph.InsertVertex(parent, null, "Hello", 20,
                    20, 80, 30);
            Object v2 = graph.InsertVertex(parent, null, "World", 200, 150, 80, 30);
            graph.InsertEdge(parent, null, "", v1, v2);
        }
        finally
        {
            graph.Model.EndUpdate();
        }

        // Turns the graph into XML data        
        return mxUtils.GetXml(codec.Encode(graph.Model));
    }

    /// <summary>
    /// Demonstrates the deployment of a graph which is created on the
    /// server side and then deployed with the client library in a single
    /// response. This is done by replacing the %graph% placeholder in the
    /// javascript/example/template.html file with the XML representation
    /// of the graph that was created on the server.
    /// 
    /// This example returns an HTML page when the client issues a get
    /// request. The readme in the dotnet directory explains how to run
    /// this example.
    /// 
    /// The /javascript/examples/template.html file is used by this
    /// example. In ProcessRequest a graph is created and the XML of the
    /// graph obtained by:
    /// 
    ///   mxCodec codec = new mxCodec();
    ///   String xml = mxUtils.GetXml(codec.Encode(graph.Model));
    ///
    /// The template.html is then loaded as a string and instances of
    /// %graph% are replaced with the XML of the graph. In the
    /// template.html the following line defines the page body:
    /// 
    ///   <body onload="main(document.getElementById('graphContainer'), '%graph%');">
    /// 
    /// So the XML string of the graph becomes the second parameter of the
    /// main function. When the template.html page is loaded in the browser,
    /// the main function is called and within that function these lines:
    /// 
    ///   var doc = mxUtils.parseXml(xml);
    ///   var codec = new mxCodec(doc);
    ///   codec.decode(doc.documentElement, graph.getModel());
    ///
    /// insert the XML into the graph model and that graph will then display. 
    /// </summary>
    /// <param name="context"></param>
    public void ProcessRequest(HttpContext context)
    {
        // Loads the template into a single string
        try
        {
            // Loads the template via HTTP so we can use the virtual dir as path
            WebRequest wr = WebRequest.Create("http://localhost/mxgraph/javascript/examples/template.html");
            string template = new StreamReader(wr.GetResponse().GetResponseStream()).ReadToEnd();
            string xml = CreateGraph(context);

            // Replaces the placeholder in the template with the XML data
            // which is then parsed into the graph model. Note: In a production
            // environment you should use a template engine instead.
            String page = template.Replace("%graph%", mxUtils.HtmlEntities(xml));

            // Makes sure there is no caching on the client side
            HttpResponse res = context.Response;
            res.AddHeader("Pragma", "no-cache"); // HTTP 1.0
            res.AddHeader("Cache-control", "private, no-cache, no-store");
            res.AddHeader("Expires", "0");

            res.Write(page);
        }
        catch (Exception e)
        {
            context.Response.StatusCode = 500;
            Console.Error.WriteLine(e);
        }
    }

    public bool IsReusable
    {
        // Return false in case your Managed Handler cannot be reused for another request.
        // Usually this would be false in case you have some state information preserved per request.
        get { return true; }
    }

}
