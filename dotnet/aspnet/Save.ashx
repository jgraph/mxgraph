<%@ WebHandler Language="C#" Class="Save" %>

using System;
using System.Web;

public class Save : IHttpHandler
{

    public void ProcessRequest (HttpContext context)
    {
        // Response is always returned as text/plain
        context.Response.ContentType = "text/plain";
        string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);

        if (xml != null && xml.Length > 0)
        {
            context.Response.Write("Request received: " + xml);
        }
        else
        {
            context.Response.Write("Empty or missing request parameter.");
        }
    }

    public bool IsReusable
    {
        // Return false in case your Managed Handler cannot be reused for another request.
        // Usually this would be false in case you have some state information preserved per request.
        get { return true; }
    }

}
