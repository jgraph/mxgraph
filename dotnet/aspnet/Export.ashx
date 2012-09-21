<%@ WebHandler Language="C#" Class="Export" %>

using System;
using System.Collections.Generic;
using System.Xml;
using System.Text;
using System.Web;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using com.mxgraph;

/// <summary>
/// This handler may be used to create bitmap versions of the graphs
/// using a high-level description of the visual appearance so there
/// is no need to create an object representation of the model on
/// the server-side. The description even allows the server to create
/// the bitmaps using a SAX parser. A DOM parser is not required.
/// 
/// To integrate the image handler with a client application, the client
/// application must be setup to use this handler. This can be done by
/// setting mxEditor.urlImage programmatically or using a config file.
/// </summary>
public class Export : IHttpHandler
{

    public void ProcessRequest (HttpContext context)
    {
        string requestUrl = context.Request.Url.ToString();
        string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);

        if (xml != null)
        {
            context.Response.ContentType = "image/png";

            // NOTE: To create the XML in JavaScript, use the following code:
            // var xml = mxUtils.getXml(mxUtils.getViewXml(graph, 1), '\n');
            XmlTextReader xmlReader = new XmlTextReader(new StringReader(xml));
            mxGraphViewImageReader viewReader = new mxGraphViewImageReader(
                xmlReader, Color.White, 4, true, true);

            // Use Clip property on viewReader to render a subimage
            Image image = mxGraphViewImageReader.Convert(viewReader);

            // Displays a Save As... dialog on the client-side
            context.Response.AddHeader("Content-Disposition",
                    "attachment; filename=diagram.png");

            // Render BitMap Stream Back To Client
            MemoryStream memStream = new MemoryStream();
            image.Save(memStream, ImageFormat.Png);

            memStream.WriteTo(context.Response.OutputStream);
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
