<%@ WebHandler Language="C#" Class="NewExport" %>

using System;
using System.Collections.Generic;
using System.Xml;
using System.Text;
using System.Web;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using com.mxgraph;

/// <summary>
/// Creates a bitmap image of the diagram based on generic XML.
/// </summary>
public class NewExport : IHttpHandler
{

    public void ProcessRequest (HttpContext context)
    {
        string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);
        string width = context.Request.Params["w"];
        string height = context.Request.Params["h"];
        string bg = context.Request.Params["bg"];
        string filename = context.Request.Params["filename"];
        string format = context.Request.Params["format"];

        if (xml != null && width != null && height != null && bg != null
                && filename != null && format != null)
        {
            Image image = mxUtils.CreateImage(int.Parse(width), int.Parse(height),
                ColorTranslator.FromHtml(bg));
            Graphics g = Graphics.FromImage(image);
            g.SmoothingMode = SmoothingMode.HighQuality;
            mxSaxOutputHandler handler = new mxSaxOutputHandler(new mxGdiCanvas2D(g));
            handler.Read(new XmlTextReader(new StringReader(xml)));

            context.Response.ContentType = "image/" + format;
            context.Response.AddHeader("Content-Disposition",
                    "attachment; filename=" + filename);

            MemoryStream memStream = new MemoryStream();
            image.Save(memStream, ImageFormat.Png);
            memStream.WriteTo(context.Response.OutputStream);

            context.Response.StatusCode = 200; /* OK */
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
