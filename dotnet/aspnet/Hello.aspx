<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Hello.aspx.cs" Inherits="aspnet._Hello" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<!-- --------------------------------------------------------------------------------------------
     Use mxGraph with the above or no DOCTYPE.
     -------------------------------------------------------------------------------------------- -->
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Hello, World!</title>
<!-- --------------------------------------------------------------------------------------------
     Any static HTML page in /javascript/examples can be turned into an ASP.NET page in a few
     simple steps as shown below. When using mxGraph in ASP.NET one must keep in mind that it
     consists of a client-side part (JavaScript), which runs in the browser, and a server-side
     part, in C#, which runs in the server (IIS). The server-side code can be used to create,
     read, write, and layout graphs. The client is used to modify graphs interactively, but it
     doesn't require a server while the graph is being modifed. It only exchanges data with the
     server at load- and save-time and to create images. All data is exchanged in XML.
     Hence there are three different approaches for turning a static HTML page with mxGraph into
     an ASP.NET page, one of which is keeping the static page and handling all XHR requests in
     separate ASP.NET handlers. The second approach is to create a so-called AJAX Client Control,
     which in our case is a simple wrapper that creates the mxGraph instance and adds methods.
     This solution allows for easier integration into an ASP.NET page or Web User Control. The
     third approach is creating a ASP.NET Ajax Server control. This uses the same client-side
     but adds the code for creating the control instance on the client, and some server-side code
     for emitting the required HTML tags for the control. Since mxGraph is almost only a client-
     side functionality this last approach is typically application-specific and not used here.
     -------------------------------------------------------------------------------------------- -->
</head>
<body>
    <form id="form1" runat="server">
<!-- --------------------------------------------------------------------------------------------
     Loads the mx client library. You can move this into the page or keep it in the HEAD. If the
     client is required multiple times in the page then it should only be loaded once. The global
     mxBasePath variable is required for loading the language files and images in the client. You
     should create a virtual directory pointing to mxgraph/javascript on your server and update
     the base path and URL of mxClient.js accordingly. Note that you should always load the page
     and the client from the same server to avoid cross-domain restrictions when loading files.
     In this example, the virtual directory is expected to point to the top-leve directory.
     -------------------------------------------------------------------------------------------- -->
	<script type="text/javascript">
	    mxBasePath = '/mxgraph/javascript/src';
	</script>
	<script type="text/javascript" src="/mxgraph/javascript/src/js/mxClient.js"></script>
<!-- --------------------------------------------------------------------------------------------
     Uses script manager to load the AJAX Client Control. This is the standard way of loading an
     an external script file and the script defines a leightweight ASP.NET wrapper for mxGraph
     that adds methods for reading and writing graphs in XML.
     -------------------------------------------------------------------------------------------- -->
    <asp:ScriptManager ID="ScriptManager1" runat="server">
        <scripts>
           <asp:ScriptReference Path="GraphControl.js" />
        </scripts>
    </asp:ScriptManager>
<!-- --------------------------------------------------------------------------------------------
     The following static markup is used (via the ID) as the container of the graph. This doesn't
     need to be changed to work with ASP.NET. The button is used to implement the save function,
     which posts the current graph as XML to an ASP.NET handler. Note that the button and the
     graph are wired up later, after the graph instance was created, using the unique ID of the
     button to add its click handler which takes care of the encoding and posting.
     -------------------------------------------------------------------------------------------- -->
    <div id="graphContainer"
	    style="overflow:hidden;width:322px; height:289px; background:url('/mxgraph/javascript/examples/editors/images/grid.gif')">
    </div>
    <button type="button" id="saveButton">Save</button>
<!-- --------------------------------------------------------------------------------------------
     The following is the standard way of creating an AJAX Client Control instance. The main from
     the static page corresponds to this function. Its invocation was moved from the pages onload
     event to the applications init event, which fires after all scripts have been loaded.
     Alternatively the load event can be used, which fires after all controls have been created.
     -------------------------------------------------------------------------------------------- -->
    <script type="text/javascript">
        var app = Sys.Application;
        app.add_init(function(sender, args) {
            // Program starts here. Gets the DOM elements for the respective IDs so things can be
            // created and wired-up.
            var graphContainer = $get('graphContainer');
            var saveButton = $get('saveButton');

            if (!mxClient.isBrowserSupported()) {
                // Displays an error message if the browser is not supported.
                mxUtils.error('Browser is not supported!', 200, false);
            }
            else {
                // Creates an instance of the graph control, passing the graphContainer element to the
                // mxGraph constructor. The $create function is part of ASP.NET. It can take an ID for
                // creating objects so the new instances can later be found using the $find function.
                var graphControl = $create(aspnet.GraphControl, null, null, null, graphContainer);

                // Saves graph by posting the XML to the generic handler SaveHandler.ashx. This code
                // only registers the event handler in the static button, which in turn invokes the
                // method to post the XML on the client control, passing the URL and param name.
                mxEvent.addListener(saveButton, 'click', function(evt) {
                    // Posts the XML representation for the graph model to the given URL under the
                    // given request parameter and prints the server response to the console.
                    var xml = encodeURIComponent(mxUtils.getXml(graphControl.encode()));
                    mxUtils.post('Save.ashx', 'xml=' + xml,
                    // Asynchronous callback for successfull requests. Depending on the application
                    // you may have to parse a custom response such as a new or modified graph.
                        function(req) {
                            mxLog.show();
                            mxLog.debug(req.getText());
                        }
                    );
                });

                // Reads the initial graph from a member variable in the page. The variable is an XML
                // string which is replaced on the server-side using the expression below. The string
                // is then parsed using mxUtils.parseXml on the client-side and the resulting DOM is
                // passed to the decode method for reading the graph into the current graph model.
                var doc = mxUtils.parseXml('<% = Xml %>');
                graphControl.decode(doc.documentElement);
            }
        });
    </script>
    </form>
</body>
</html>
