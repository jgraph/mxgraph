<%@ WebHandler Language="C#" Class="Save" %>

using System;
using System.Web;

public class Save : IHttpHandler
{

    public void ProcessRequest (HttpContext context)
    {
        string filename = context.Request.Params["filename"];
        string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);

        if (filename != null)
		{
            filename = HttpUtility.UrlDecode(filename);
		}
		else
		{
			filename = "export";
		}
        
        if (xml != null && xml.Length > 0)
        {
            string format = context.Request.Params["format"];
            
			if (format == null)
			{
				format = "xml";
			}

			if (!filename.ToLower().EndsWith("." + format))
			{
				filename += "." + format;
			}
            
            context.Response.ContentType = "application/xml";
            context.Response.AddHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            context.Response.StatusCode = 200; /* OK */
            
            context.Response.Write(xml);
		}
		else
		{
            context.Response.StatusCode = 400; /* Bad Request */
		}
    }

    public bool IsReusable
    {
        // Return false in case your Managed Handler cannot be reused for another request.
        // Usually this would be false in case you have some state information preserved per request.
        get { return true; }
    }

}
