<%@ WebHandler Language="C#" Class="Share" %>

using System;
using System.Text;
using System.Web;
using System.Web.SessionState;
using System.Threading;
using System.Collections.Generic;
using System.Xml;
using com.mxgraph;

public class Share : IHttpHandler
{

    /// <summary>
    /// Handles save request and prints XML.
    /// </summary>
    protected void DoPost(HttpContext context)
    {
        string id = context.Request.Params["id"];
        string xml = context.Request.Params["xml"];

        Console.WriteLine("Received id=" + id + " xml=" + xml);
    }

    /// <summary>
    /// Handles open request and returns XML.
    /// </summary>
    protected void DoGet(HttpContext context)
    {
        HttpResponse res = context.Response;

        res.AddHeader("Content-type", "text/xml;charset=UTF-8");
        res.AddHeader("Pragma", "no-cache"); // HTTP 1.0
        res.AddHeader("Cache-control", "private, no-cache, no-store");
        res.AddHeader("Expires", "0");

        res.Write(CreateGraph(context));
        res.StatusCode = 200; /* OK */
    }
    
    /// <summary>
    /// Creates a graph using the API and returns the XML.
    /// </summary>
    protected string CreateGraph(HttpContext context)
    {
        string id = context.Request.Params["id"];
        Console.WriteLine("Requested id=" + id);
        
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
      
        return mxUtils.GetXml(codec.Encode(graph.Model));
    }
    
    /// <summary>
    /// Dispatches the GET and POST requests for open and save, respectively.
    /// </summary>
    public void ProcessRequest(HttpContext context)
    {
        if (context.Request.RequestType.Equals("POST"))
        {
            DoPost(context);
        }
        else
        {
            DoGet(context);
        }
    }
    
    public bool IsReusable
    {
        get { return true; }
    }

}
