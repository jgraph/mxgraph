/// <reference name="MicrosoftAjax.js"/>

Type.registerNamespace("aspnet");

aspnet.GraphControl = function(element) {
    aspnet.GraphControl.initializeBase(this, [element]);
}

aspnet.GraphControl.prototype = {
    initialize: function() {
        aspnet.GraphControl.callBaseMethod(this, 'initialize');
        
        // Constructs a graph instance for the given element
        this._graph = new mxGraph(this.get_element());

        // Enables rubberband selection
        this._rubberband = new mxRubberband(this._graph);
    },
    dispose: function() {
        this._graph.destroy();
        aspnet.GraphControl.callBaseMethod(this, 'dispose');
    },
    get_graph: function() {
        return this._graph;
    },
    decode: function(node) {
        // Decodes the given node into the graph model.
        var enc = new mxCodec(node.ownerDocument);
        enc.decode(node, this._graph.getModel());
    },
    encode: function() {
        // Returns the XML node that represents the graph model.
        var enc = new mxCodec();
        return enc.encode(this._graph.getModel());
    }
}
aspnet.GraphControl.registerClass('aspnet.GraphControl', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
