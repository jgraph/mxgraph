/**
 * $Id: mxTerminalChangeCodec.js,v 1.7 2010-09-13 15:58:36 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
mxCodecRegistry.register(function()
{
	/**
	 * Class: mxTerminalChangeCodec
	 *
	 * Codec for <mxTerminalChange>s. This class is created and registered
	 * dynamically at load time and used implicitely via <mxCodec> and
	 * the <mxCodecRegistry>.
	 *
	 * Transient Fields:
	 *
	 * - model
	 * - previous
	 *
	 * Reference Fields:
	 *
	 * - cell
	 * - terminal
	 */
	var codec = new mxObjectCodec(new mxTerminalChange(),
		['model', 'previous'], ['cell', 'terminal']);

	/**
	 * Function: afterDecode
	 *
	 * Restores the state by assigning the previous value.
	 */
	codec.afterDecode = function(dec, node, obj)
	{
		obj.previous = obj.terminal;
		
		return obj;
	};

	// Returns the codec into the registry
	return codec;

}());
