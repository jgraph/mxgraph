/**
 * $Id: mxSharedGraphModel.java,v 1.3 2012-01-13 12:35:04 david Exp $
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.sharing;

import java.util.LinkedList;

import org.w3c.dom.Node;

import com.mxgraph.io.mxCodec;
import com.mxgraph.model.mxGraphModel;
import com.mxgraph.model.mxGraphModel.mxChildChange;
import com.mxgraph.model.mxICell;
import com.mxgraph.model.mxIGraphModel.mxAtomicGraphModelChange;
import com.mxgraph.util.mxEvent;
import com.mxgraph.util.mxEventObject;
import com.mxgraph.util.mxUndoableEdit;
import com.mxgraph.util.mxXmlUtils;

/**
 * Implements a diagram that may be shared among multiple sessions.
 */
public class mxSharedGraphModel extends mxSharedState
{

	/**
	 * 
	 */
	protected mxGraphModel model;

	/**
	 * 
	 */
	protected mxCodec codec = new mxCodec()
	{
		public Object lookup(String id)
		{
			return model.getCell(id);
		}
	};

	/**
	 * Whether remote changes should be significant in the
	 * local command history. Default is true.
	 */
	protected boolean significantRemoteChanges = true;

	/**
	 * Constructs a new diagram with the given model.
	 * 
	 * @param model Initial model of the diagram.
	 */
	public mxSharedGraphModel(mxGraphModel model)
	{
		super(null); // Overrides getState
		this.model = model;
	}

	/**
	 * @return the model
	 */
	public mxGraphModel getModel()
	{
		return model;
	}

	/**
	 * @return the significantRemoteChanges
	 */
	public boolean isSignificantRemoteChanges()
	{
		return significantRemoteChanges;
	}

	/**
	 * @param significantRemoteChanges the significantRemoteChanges to set
	 */
	public void setSignificantRemoteChanges(boolean significantRemoteChanges)
	{
		this.significantRemoteChanges = significantRemoteChanges;
	}

	/**
	 * Returns the initial state of the diagram.
	 */
	public String getState()
	{
		return mxXmlUtils.getXml(codec.encode(model));
	}

	/**
	 * 
	 */
	public synchronized void addDelta(String edits)
	{
		// Edits are not added to the history. They are sent straight out to
		// all sessions and the model is updated so the next session will get
		// these edits via the new state of the model in getState.
	}

	/**
	 * 
	 */
	protected String processEdit(Node node)
	{
		mxAtomicGraphModelChange[] changes = decodeChanges(node.getFirstChild());

		if (changes.length > 0)
		{
			mxUndoableEdit edit = createUndoableEdit(changes);

			// No notify event here to avoid the edit from being encoded and transmitted
			// LATER: Remove changes property (deprecated)
			model.fireEvent(new mxEventObject(mxEvent.CHANGE, "edit", edit,
					"changes", changes));
			model.fireEvent(new mxEventObject(mxEvent.UNDO, "edit", edit));
			fireEvent(new mxEventObject(mxEvent.FIRED, "edit", edit));
		}

		return super.processEdit(node);
	}

	/**
	 * Creates a new mxUndoableEdit that implements the notify function to fire
	 * a change and notify event via the model.
	 */
	protected mxUndoableEdit createUndoableEdit(
			mxAtomicGraphModelChange[] changes)
	{
		mxUndoableEdit edit = new mxUndoableEdit(this, significantRemoteChanges)
		{
			public void dispatch()
			{
				// LATER: Remove changes property (deprecated)
				((mxGraphModel) source).fireEvent(new mxEventObject(
						mxEvent.CHANGE, "edit", this, "changes", changes));
				((mxGraphModel) source).fireEvent(new mxEventObject(
						mxEvent.NOTIFY, "edit", this, "changes", changes));
			}
		};

		for (int i = 0; i < changes.length; i++)
		{
			edit.add(changes[i]);
		}

		return edit;
	}

	/**
	 * Adds removed cells to the codec object lookup for references to the removed
	 * cells after this point in time.
	 */
	protected mxAtomicGraphModelChange[] decodeChanges(Node node)
	{
		// Updates the document in the existing codec
		codec.setDocument(node.getOwnerDocument());

		LinkedList<mxAtomicGraphModelChange> changes = new LinkedList<mxAtomicGraphModelChange>();

		while (node != null)
		{
			Object change;

			if (node.getNodeName().equals("mxRootChange"))
			{
				// Handles the special case were no ids should be
				// resolved in the existing model. This change will
				// replace all registered ids and cells from the
				// model and insert a new cell hierarchy instead.
				mxCodec tmp = new mxCodec(node.getOwnerDocument());
				change = tmp.decode(node);
			}
			else
			{
				change = codec.decode(node);
			}

			if (change instanceof mxAtomicGraphModelChange)
			{
				mxAtomicGraphModelChange ac = (mxAtomicGraphModelChange) change;

				ac.setModel(model);
				ac.execute();

				// Workaround for references not being resolved if cells have
				// been removed from the model prior to being referenced. This
				// adds removed cells in the codec object lookup table.
				if (ac instanceof mxChildChange
						&& ((mxChildChange) ac).getParent() == null)
				{
					cellRemoved(((mxChildChange) ac).getChild());
				}

				changes.add(ac);
			}

			node = node.getNextSibling();
		}

		return changes.toArray(new mxAtomicGraphModelChange[changes.size()]);
	}

	/**
	 * Adds removed cells to the codec object lookup for references to the removed
	 * cells after this point in time.
	 */
	public void cellRemoved(Object cell)
	{
		codec.putObject(((mxICell) cell).getId(), cell);

		int childCount = model.getChildCount(cell);

		for (int i = 0; i < childCount; i++)
		{
			cellRemoved(model.getChildAt(cell, i));
		}
	}

}
