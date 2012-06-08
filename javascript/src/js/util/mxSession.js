/**
 * $Id: mxSession.js,v 1.45 2010-09-16 11:11:59 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
/**
 * Class: mxSession
 *
 * Session for sharing an <mxGraphModel> with other parties
 * via a backend that acts as a multicaster for all changes.
 * 
 * Diagram Sharing:
 * 
 * The diagram sharing is a mechanism where each atomic change of the model is
 * encoded into XML using <mxCodec> and then transmitted to the server by the
 * <mxSession> object. On the server, the XML data is dispatched to each
 * listener on the same diagram (except the sender), and the XML is decoded
 * back into atomic changes on the client side, which are then executed on the
 * model and stored in the command history.
 * 
 * The <mxSession.significantRemoteChanges> specifies how these changes are
 * treated with respect to undo: The default value (true) will undo the last
 * change regardless of whether it was a remote or a local change. If the
 * switch is false, then an undo will go back until the last local change,
 * silently undoing all remote changes up to that point. Note that these
 * changes will be added as new remote changes to the history of the other
 * clients.
 * 
 * Event: mxEvent.CONNECT
 *
 * Fires after the session has been started, that is, after the response to the
 * initial request was received and the session goes into polling mode. This
 * event has no properties.
 *
 * Event: mxEvent.SUSPEND
 *
 * Fires after <suspend> was called an the session was not already in suspended
 * state. This event has no properties.
 *
 * Event: mxEvent.RESUME
 *
 * Fires after the session was resumed in <resume>. This event has no
 * properties.
 *
 * Event: mxEvent.DISCONNECT
 *
 * Fires after the session was stopped in <stop>. The <code>reason</code>
 * property contains the optional exception that was passed to the stop method.
 *
 * Event: mxEvent.NOTIFY
 *
 * Fires after a notification was sent in <notify>. The <code>url</code>
 * property contains the URL and the <code>xml</code> property contains the XML
 * data of the request.
 *
 * Event: mxEvent.GET
 *
 * Fires after a response was received in <get>. The <code>url</code> property
 * contains the URL and the <code>request</code> is the <mxXmlRequest> that
 * contains the response.
 *
 * Event: mxEvent.FIRED
 * 
 * Fires after an array of edits has been executed on the model. The
 * <code>changes</code> property contains the array of changes.
 * 
 * Event: mxEvent.RECEIVE
 *
 * Fires after an XML node was received in <receive>. The <code>node</code>
 * property contains the node that was received.
 * 
 * Constructor: mxSession
 * 
 * Constructs a new session using the given <mxGraphModel> and URLs to
 * communicate with the backend.
 * 
 * Parameters:
 * 
 * model - <mxGraphModel> that contains the data.
 * urlInit - URL to be used for initializing the session.
 * urlPoll - URL to be used for polling the backend.
 * urlNotify - URL to be used for sending changes to the backend.
 */
function mxSession(model, urlInit, urlPoll, urlNotify)
{
	this.model = model;
	this.urlInit = urlInit;
	this.urlPoll = urlPoll;
	this.urlNotify = urlNotify;

	// Resolves cells by id using the model
	if (model != null)
	{
		this.codec = new mxCodec();
		
		this.codec.lookup = function(id)
		{
			return model.getCell(id);
		};
	}
	
	// Adds the listener for notifying the backend of any
	// changes in the model
	model.addListener(mxEvent.NOTIFY,
		mxUtils.bind(this, function(sender, evt)
		{
			var edit = evt.getProperty('edit');
			
			if (edit != null && this.debug ||
				(this.connected && !this.suspended))
			{
				this.notify('<edit>'+this.encodeChanges(edit.changes, edit.undone)+'</edit>');
			}
		})
	);
};

/**
 * Extends mxEventSource.
 */
mxSession.prototype = new mxEventSource();
mxSession.prototype.constructor = mxSession;

/**
 * Variable: model
 * 
 * Reference to the enclosing <mxGraphModel>.
 */
mxSession.prototype.model = null;

/**
 * Variable: urlInit
 * 
 * URL to initialize the session.
 */
mxSession.prototype.urlInit = null;

/**
 * Variable: urlPoll
 * 
 * URL for polling the backend.
 */
mxSession.prototype.urlPoll = null;

/**
 * Variable: urlNotify
 * 
 * URL to send changes to the backend.
 */
mxSession.prototype.urlNotify = null;

/**
 * Variable: codec
 * 
 * Reference to the <mxCodec> used to encoding and decoding changes.
 */
mxSession.prototype.codec = null;

/**
 * Variable: linefeed
 * 
 * Used for encoding linefeeds. Default is '&#xa;'.
 */
mxSession.prototype.linefeed = '&#xa;';

/**
 * Variable: escapePostData
 * 
 * Specifies if the data in the post request sent in <notify>
 * should be converted using encodeURIComponent. Default is true.
 */
mxSession.prototype.escapePostData = true;

/**
 * Variable: significantRemoteChanges
 * 
 * Whether remote changes should be significant in the
 * local command history. Default is true.
 */
mxSession.prototype.significantRemoteChanges = true;

/**
 * Variable: sent
 * 
 * Total number of sent bytes.
 */
mxSession.prototype.sent = 0;

/**
 * Variable: received
 * 
 * Total number of received bytes.
 */
mxSession.prototype.received = 0;

/**
 * Variable: debug
 * 
 * Specifies if the session should run in debug mode. In this mode, no
 * connection is established. The data is written to the console instead.
 * Default is false.
 */
mxSession.prototype.debug = false;

/**
 * Variable: connected
 */
mxSession.prototype.connected = false;
	
/**
 * Variable: send
 */
mxSession.prototype.suspended = false;
	
/**
 * Variable: polling
 */
mxSession.prototype.polling = false;

/**
 * Function: start
 */
mxSession.prototype.start = function()
{
	if (this.debug)
	{
		this.connected = true;
		this.fireEvent(new mxEventObject(mxEvent.CONNECT));
	}
	else if (!this.connected)
	{
		this.get(this.urlInit, mxUtils.bind(this, function(req)
		{
			this.connected = true;
			this.fireEvent(new mxEventObject(mxEvent.CONNECT));
			this.poll();
		}));
	}
};

/**
 * Function: suspend
 * 
 * Suspends the polling. Use <resume> to reactive the session. Fires a
 * suspend event.
 */
mxSession.prototype.suspend = function()
{
	if (this.connected && !this.suspended)
	{
		this.suspended = true;
		this.fireEvent(new mxEventObject(mxEvent.SUSPEND));
	}
};
	
/**
 * Function: resume
 * 
 * Resumes the session if it has been suspended. Fires a resume-event
 * before starting the polling.
 */
mxSession.prototype.resume = function(type, attr, value)
{
	if (this.connected &&
		this.suspended)
	{
		this.suspended = false;
		this.fireEvent(new mxEventObject(mxEvent.RESUME));
		
		if (!this.polling)
		{
			this.poll();
		}
	}
};
		
/**
 * Function: stop
 * 
 * Stops the session and fires a disconnect event. The given reason is
 * passed to the disconnect event listener as the second argument.
 */
mxSession.prototype.stop = function(reason)
{
	if (this.connected)
	{
		this.connected = false;
	}
	
	this.fireEvent(new mxEventObject(mxEvent.DISCONNECT,
			'reason', reason));
};

/**
 * Function: poll
 * 
 * Sends an asynchronous GET request to <urlPoll>.
 */
mxSession.prototype.poll = function()
{
	if (this.connected &&
		!this.suspended &&
		this.urlPoll != null)
	{
		this.polling = true;

		this.get(this.urlPoll, mxUtils.bind(this, function()
		{
			this.poll();
		}));
	}
	else
	{
		this.polling = false;
	}
};

/**
 * Function: notify
 * 
 * Sends out the specified XML to <urlNotify> and fires a <notify> event.
 */
mxSession.prototype.notify = function(xml, onLoad, onError)
{
	if (xml != null &&
		xml.length > 0)
	{
		if (this.urlNotify != null)
		{
			if (this.debug)
			{
				mxLog.show();
				mxLog.debug('mxSession.notify: '+this.urlNotify+' xml='+xml);			
			}
			else
			{
				xml = '<message><delta>'+xml+'</delta></message>';
				
				if (this.escapePostData)
				{
					xml = encodeURIComponent(xml);
				}
				
				mxUtils.post(this.urlNotify, 'xml='+xml, onLoad, onError);
			}
		}
		
		this.sent += xml.length;
		this.fireEvent(new mxEventObject(mxEvent.NOTIFY,
				'url', this.urlNotify, 'xml', xml));
	}
};

/**
 * Function: get
 * 
 * Sends an asynchronous get request to the given URL, fires a <get> event
 * and invokes the given onLoad function when a response is received.
 */
mxSession.prototype.get = function(url, onLoad, onError)
{
	// Response after browser refresh has no global scope
	// defined. This response is ignored and the session
	// stops implicitely.
	if (typeof(mxUtils) != 'undefined')
	{
		var onErrorWrapper = mxUtils.bind(this, function(ex)
		{
			if (onError != null)
			{
				onError(ex);
			}
			else
			{
				this.stop(ex);
			}
		});

		// Handles a successful response for
		// the above request.
		var req = mxUtils.get(url,
			mxUtils.bind(this, function(req)
			{
				if (typeof(mxUtils) != 'undefined')
				{
					//try
					{
		    			if (req.isReady() &&
		    				req.getStatus() != 404)
		    			{
		    				this.received += req.getText().length;
							this.fireEvent(new mxEventObject(mxEvent.GET,
									'url', url, 'request', req));

							if (this.isValidResponse(req))
							{
				    			if (req.getText().length > 0)
				    			{
									var node = req.getDocumentElement();
									
									if (node == null)
									{
										onErrorWrapper('Invalid response: '+req.getText());
									}
									else
									{
										this.receive(node);
									}
								}
				    			
				    			if (onLoad != null)
				    			{
									onLoad(req);
								}
							}
						}
						else
						{
							onErrorWrapper('Response not ready');
						}
					}
					/*catch (ex)
					{
						onErrorWrapper(ex);
						throw ex; // debugging
					}*/
				}
			}),
			
			// Handles a transmission error for the
			// above request
			function(req)
			{
				onErrorWrapper('Transmission error');
			}
		);
	}
};

/**
 * Function: isValidResponse
 * 
 * Returns true if the response data in the given <mxXmlRequest> is valid.
 */
mxSession.prototype.isValidResponse = function(req)
{
	// TODO: Find condition to check if response
	// contains valid XML (not eg. the PHP code).
	return req.getText().indexOf('<?php') < 0;
};

/**
 * Function: encodeChanges
 * 
 * Returns the XML representation for the given array of changes.
 */
mxSession.prototype.encodeChanges = function(changes, invert)
{
	// TODO: Use array for string concatenation
	var xml = '';
	var step = (invert) ? -1 : 1;
	var i0 = (invert) ? changes.length - 1 : 0;

	for (var i = i0; i >= 0 && i < changes.length; i += step)
	{	
		// Newlines must be kept, they will be converted
		// to &#xa; when the server sends data to the
		// client
		var node = this.codec.encode(changes[i]);
		xml += mxUtils.getXml(node, this.linefeed);
	}
	
	return xml;
};

/**
 * Function: receive
 * 
 * Processes the given node by applying the changes to the model. If the nodename
 * is state, then the namespace is used as a prefix for creating Ids in the model,
 * and the child nodes are visited recursively. If the nodename is delta, then the
 * changes encoded in the child nodes are applied to the model. Each call to the
 * receive function fires a <receive> event with the given node as the second argument
 * after processing. If changes are processed, then the function additionally fires
 * a <mxEvent.FIRED> event before the <mxEvent.RECEIVE> event.
 */
mxSession.prototype.receive = function(node)
{
	if (node != null &&
		node.nodeType == mxConstants.NODETYPE_ELEMENT)
	{
		// Uses the namespace in the model
		var ns = node.getAttribute('namespace');
		
		if (ns != null)
		{
			this.model.prefix = ns + '-';
		}
		
		var child = node.firstChild;
		
		while (child != null)
		{
			var name = child.nodeName.toLowerCase();
			
			if (name == 'state')
			{
				this.processState(child);
			}
			else if (name == 'delta')
			{
				this.processDelta(child);	
			}
			
			child = child.nextSibling;
		}
		
		// Fires receive event
		this.fireEvent(new mxEventObject(mxEvent.RECEIVE, 'node', node));
	}
};

/**
 * Function: processState
 * 
 * Processes the given state node which contains the current state of the
 * remote model.
 */
mxSession.prototype.processState = function(node)
{
	var dec = new mxCodec(node.ownerDocument);
	dec.decode(node.firstChild, this.model);
};

/**
 * Function: processDelta
 * 
 * Processes the given delta node which contains a sequence of edits which in
 * turn map to one transaction on the remote model each.
 */
mxSession.prototype.processDelta = function(node)
{
	var edit = node.firstChild;
	
	while (edit != null)
	{
		if (edit.nodeName == 'edit')
		{
			this.processEdit(edit);
		}
		
		edit = edit.nextSibling;
	}
};

/**
 * Function: processEdit
 * 
 * Processes the given edit by executing its changes and firing the required
 * events via the model.
 */
mxSession.prototype.processEdit = function(node)
{
	var changes = this.decodeChanges(node);
	
	if (changes.length > 0)
	{
		var edit = this.createUndoableEdit(changes);
		
		// No notify event here to avoid the edit from being encoded and transmitted
		// LATER: Remove changes property (deprecated)
		this.model.fireEvent(new mxEventObject(mxEvent.CHANGE,
			'edit', edit, 'changes', changes));
		this.model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
		this.fireEvent(new mxEventObject(mxEvent.FIRED, 'edit', edit));
	}
};

/**
 * Function: createUndoableEdit
 * 
 * Creates a new <mxUndoableEdit> that implements the notify function to fire a
 * <change> and <notify> event via the model.
 */
mxSession.prototype.createUndoableEdit = function(changes)
{
	var edit = new mxUndoableEdit(this.model, this.significantRemoteChanges);
	edit.changes = changes;
	
	edit.notify = function()
	{
		// LATER: Remove changes property (deprecated)
		edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
			'edit', edit, 'changes', edit.changes));
		edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
			'edit', edit, 'changes', edit.changes));
	};
	
	return edit;
};

/**
 * Function: decodeChanges
 * 
 * Decodes and executes the changes represented by the children in the
 * given node. Returns an array that contains all changes.
 */
mxSession.prototype.decodeChanges = function(node)
{
	// Updates the document in the existing codec
	this.codec.document = node.ownerDocument;

	// Parses and executes the changes on the model
	var changes = [];
	node = node.firstChild;
	
	while (node != null)
	{
		if (node.nodeType == mxConstants.NODETYPE_ELEMENT)
		{
			var change = null;
			
			if (node.nodeName == 'mxRootChange')
			{
				// Handles the special case were no ids should be
				// resolved in the existing model. This change will
				// replace all registered ids and cells from the
				// model and insert a new cell hierarchy instead.
				var tmp = new mxCodec(node.ownerDocument);
				change = tmp.decode(node);
			}
			else
			{
				change = this.codec.decode(node);
			}
			
			if (change != null)
			{
				change.model = this.model;
				change.execute();
				
				// Workaround for references not being resolved if cells have
				// been removed from the model prior to being referenced. This
				// adds removed cells in the codec object lookup table.
				if (node.nodeName == 'mxChildChange' &&
					change.parent == null)
				{
					this.cellRemoved(change.child);
				}
				
				changes.push(change);
			}
		}
		
		node = node.nextSibling;
	}
	
	return changes;
};

/**
 * Function: cellRemoved
 * 
 * Adds removed cells to the codec object lookup for references to the removed
 * cells after this point in time.
 */
mxSession.prototype.cellRemoved = function(cell, codec)
{
	this.codec.putObject(cell.getId(), cell);
	
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		this.cellRemoved(this.model.getChildAt(cell, i));
	}
};
