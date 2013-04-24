<%@ WebHandler Language="C#" Class="Share" %>

using System;
using System.Text;
using System.Web;
using System.Web.SessionState;
using System.Threading;
using System.Collections.Generic;
using System.Xml;
using com.mxgraph;

/// <summary>
/// This handler demonstrates the sharing of diagrams across a number of
/// clients. The handler itself does not have an object representation of the
/// graph in memory, it only serves as a dispatcher for the XML among the
/// clients.
/// 
/// To integrate sharing with a client application, an mxSession must be created
/// and configured to handle cell identities and more. This is all done in the
/// mxEditor.connect method, which returns the session object being used to
/// connect the model to the backend. Note that it is possible to attach
/// multiple sessions to one editor and graph model.
/// 
/// When the graph model is changed in a shared client, the changes are encoded
/// into XML and then sent to the server in a POST request. The server then gets
/// a list of clients which are connected to the same diagram, and sends the
/// encoded changes to those clients. (Note that the sender will not get
/// notified of his own changes in the default mode.)
/// 
/// When the client receives such a set of changes, it decodes them and executes
/// them on its local model, bypassing the command history of local changes.
/// This means the client immediately sees the changes, but pressing undo will
/// only undo the last local change of that specific client.
/// 
/// To use the example, the respective session URLs must be assigned in the
/// mxEditor either programmatically or by use of the same config file as above.
/// Note that it is possible to integrate both, image creating and diagram
/// sharing into the same client by assigning the respective attributes in the
/// mxEditor node in the config file. For diagram sharing, the following
/// member variables are used: mxEditor.urlInit, mxEditor.urlPoll and
/// mxEditor.urlNotify.
/// </summary>
public class Share : IHttpHandler
{
    /// <summary>
    /// Defines the name of the session cookie.
    /// </summary>
    protected static string SESSION_ID = "MXSESSIONID";

    /// <summary>
    /// Holds the global shared diagram (initial state and sequence of changes).
    /// </summary>
    public static mxSharedDiagram globalState= new mxSharedDiagram("<mxGraphModel><root><Workflow label=\"Diagram\" id=\"0\"></Workflow><Layer " +
                        "label=\"Default Layer\" id=\"1\"><mxCell parent=\"0\" /></Layer></root></mxGraphModel>");

    /// <summary>
    /// Maps from session IDs to sessions.
    /// </summary>
    public Dictionary<string, mxSession> sessions = new Dictionary<string, mxSession>();

    /// <summary>
    /// Main entry point for a client request. Notifications for changes are always posted,
    /// the get requests may be an initial, polling or reset request (see below).
    /// </summary>
    /// <param name="context"></param>
    public void ProcessRequest(HttpContext context)
    {
        mxSession session = GetSession(context);

        if (context.Request.RequestType.Equals("POST"))
        {
            ProcessPostRequest(context, session);
        }
        else
        {
            ProcessGetRequest(context, session);
        }
    }
    
    /// <summary>
    /// Adds a set of changes to the global shared diagram.
    /// </summary>
    /// <param name="context"></param>
    /// <param name="session"></param>
    protected void ProcessPostRequest(HttpContext context, mxSession session)
    {
        string xml = HttpUtility.UrlDecode(context.Request.Params["xml"]);

        XmlDocument doc = mxUtils.ParseXml(xml);
        session.Receive(doc.DocumentElement);
        context.Response.Write("OK");
    }

    /// <summary>
    /// Handles various GET requests to start sharing, reset the global shared diagram and
    /// request the initial state or listen to changes.
    /// </summary>
    /// <param name="context"></param>
    /// <param name="session"></param>
    protected void ProcessGetRequest(HttpContext context, mxSession session)
    {
        string target = context.Request.Url.ToString().ToLower();
        HttpResponse res = context.Response;

        // Redirects the client to the actual static diagram editor. The diagram editor
        // loads the configuration which contains one hook to request more configuration
        // data at the server. This request is implemented in Config.ashx to deliver the
        // configuration required to access this servlet for sharing and Export.ashx for
        // creating images.
        if (target.EndsWith("start"))
        {
            res.Redirect("/mxgraph/javascript/examples/editors/diagrameditor.html", true);
        }
        else if (target.EndsWith("reset"))
        {
            globalState.ResetDelta();
            res.Write("Diagram reset");
        }
        else
        {
            res.AddHeader("Content-type", "text/xml");
            res.AddHeader("Pragma", "no-cache"); // HTTP 1.0
            res.AddHeader("Cache-control", "private, no-cache, no-store");
            res.AddHeader("Expires", "0");
            string xml = "";

            if (target.EndsWith("init"))
            {
                xml = session.Init();
            }
            else
            {
                xml = session.Poll();
            }

            res.Write(xml);
        }

        res.StatusCode = 200; /* OK */
    }
    
    /// <summary>
    /// Returns the session for the given context.
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    protected mxSession GetSession(HttpContext context)
    {
        HttpCookie cookie = context.Request.Cookies[SESSION_ID];

        if (cookie == null)
        {
            cookie = new HttpCookie(SESSION_ID);
            cookie.Value = Guid.NewGuid().ToString();
            context.Response.Cookies.Add(cookie);
        }

        // Gets or creates the mxSession associated with the client
        mxSession session = null;

        lock (sessions)
        {
            string sid = cookie.Value;
            sessions.TryGetValue(sid, out session);

            if (session == null)
            {
                session = new mxSession(sid, globalState);
                sessions[sid] = session;
            }
        }

        return session;
    }
    
    public bool IsReusable
    {
        // Return false in case your Managed Handler cannot be reused for another request.
        // Usually this would be false in case you have some state information preserved per request.
        get { return true; }
    }

}
