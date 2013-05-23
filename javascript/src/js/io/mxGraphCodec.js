/**
 * $Id: mxGraphCodec.js,v 1.1 2012/11/15 13:26:43 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
mxCodecRegistry.register(function()
{
	/**
	 * Class: mxGraphCodec
	 *
	 * Codec for <mxGraph>s. This class is created and registered
	 * dynamically at load time and used implicitely via <mxCodec>
	 * and the <mxCodecRegistry>.
	 *
	 * Transient Fields:
	 *
	 * - graphListeners
	 * - eventListeners
	 * - view
	 * - container
	 * - cellRenderer
	 * - editor
	 * - selection
	 */
	return new mxObjectCodec(new mxGraph(),
		['graphListeners', 'eventListeners', 'view', 'container',
		'cellRenderer', 'editor', 'selection']);

}());
