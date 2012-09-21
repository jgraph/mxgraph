<%@ WebHandler Language="C#" Class="Config" %>

using System;
using System.Web;
using System.IO;
using System.Net;
using System.Text;

/// <summary>
/// Allows to provide a client with a backend specific configuration. See
/// javascript/examples/editors/config/diagrameditor.xml for more details.
/// </summary>
public class Config : IHttpHandler
{

    /// <summary>
    /// Loads the config via HTTP so we can use the virtual dir as path
    /// </summary>
    public void ProcessRequest (HttpContext context)
    {
        WebRequest wr = WebRequest.Create("http://localhost/mxgraph/dotnet/diagrameditor-backend.xml");
        context.Response.Write(new StreamReader(wr.GetResponse().GetResponseStream()).ReadToEnd());
    }

    /// <summary>
    /// Return false in case your Managed Handler cannot be reused for another request.
    /// This would be false in case you have some state information preserved per request.
    /// </summary>
    public bool IsReusable
    {
        get { return true; }
    }

}
