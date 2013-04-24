package com.mxgraph.view;

import com.mxgraph.model.mxGeometry;
import com.mxgraph.model.mxIGraphModel;
import com.mxgraph.util.mxEvent;
import com.mxgraph.util.mxEventObject;
import com.mxgraph.util.mxEventSource;
import com.mxgraph.util.mxPoint;

public class mxSpaceManager extends mxEventSource
{

	/**
	 * Defines the type of the source or target terminal. The type is a string
	 * passed to mxCell.is to check if the rule applies to a cell.
	 */
	protected mxGraph graph;

	/**
	 * Optional string that specifies the value of the attribute to be passed
	 * to mxCell.is to check if the rule applies to a cell.
	 */
	protected boolean enabled;

	/**
	 * Optional string that specifies the attributename to be passed to
	 * mxCell.is to check if the rule applies to a cell.
	 */
	protected boolean shiftRightwards;

	/**
	 * Optional string that specifies the attributename to be passed to
	 * mxCell.is to check if the rule applies to a cell.
	 */
	protected boolean shiftDownwards;

	/**
	 * Optional string that specifies the attributename to be passed to
	 * mxCell.is to check if the rule applies to a cell.
	 */
	protected boolean extendParents;

	/**
	 * 
	 */
	protected mxIEventListener resizeHandler = new mxIEventListener()
	{
		public void invoke(Object source, mxEventObject evt)
		{
			if (isEnabled())
			{
				cellsResized((Object[]) evt.getProperty("cells"));
			}
		}
	};

	/**
	 * 
	 */
	public mxSpaceManager(mxGraph graph)
	{
		setGraph(graph);
	}

	/**
	 * 
	 */
	public boolean isCellIgnored(Object cell)
	{
		return !getGraph().getModel().isVertex(cell);
	}

	/**
	 * 
	 */
	public boolean isCellShiftable(Object cell)
	{
		return getGraph().getModel().isVertex(cell)
				&& getGraph().isCellMovable(cell);
	}

	/**
	 * @return the enabled
	 */
	public boolean isEnabled()
	{
		return enabled;
	}

	/**
	 * @param value the enabled to set
	 */
	public void setEnabled(boolean value)
	{
		enabled = value;
	}

	/**
	 * @return the shiftRightwards
	 */
	public boolean isShiftRightwards()
	{
		return shiftRightwards;
	}

	/**
	 * @param shiftRightwards the shiftRightwards to set
	 */
	public void setShiftRightwards(boolean shiftRightwards)
	{
		this.shiftRightwards = shiftRightwards;
	}

	/**
	 * @return the shiftDownwards
	 */
	public boolean isShiftDownwards()
	{
		return shiftDownwards;
	}

	/**
	 * @param shiftDownwards the shiftDownwards to set
	 */
	public void setShiftDownwards(boolean shiftDownwards)
	{
		this.shiftDownwards = shiftDownwards;
	}

	/**
	 * @return the extendParents
	 */
	public boolean isExtendParents()
	{
		return extendParents;
	}

	/**
	 * @param extendParents the extendParents to set
	 */
	public void setExtendParents(boolean extendParents)
	{
		this.extendParents = extendParents;
	}

	/**
	 * @return the graph
	 */
	public mxGraph getGraph()
	{
		return graph;
	}

	/**
	 * @param graph the graph to set
	 */
	public void setGraph(mxGraph graph)
	{
		if (this.graph != null)
		{
			this.graph.removeListener(resizeHandler);
		}

		this.graph = graph;

		if (this.graph != null)
		{
			this.graph.addListener(mxEvent.RESIZE_CELLS, resizeHandler);
			this.graph.addListener(mxEvent.FOLD_CELLS, resizeHandler);
		}
	}

	/**
	 * 
	 */
	protected void cellsResized(Object[] cells)
	{
		if (cells != null)
		{
			mxIGraphModel model = getGraph().getModel();

			model.beginUpdate();
			try
			{
				for (int i = 0; i < cells.length; i++)
				{
					if (!isCellIgnored(cells[i]))
					{
						cellResized(cells[i]);
						break;
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
		}
	}

	/**
	 * 
	 */
	protected void cellResized(Object cell)
	{
		mxGraph graph = getGraph();
		mxGraphView view = graph.getView();
		mxIGraphModel model = graph.getModel();

		mxCellState state = view.getState(cell);
		mxCellState pstate = view.getState(model.getParent(cell));

		if (state != null && pstate != null)
		{
			Object[] cells = getCellsToShift(state);
			mxGeometry geo = model.getGeometry(cell);

			if (cells != null && geo != null)
			{
				mxPoint tr = view.getTranslate();
				double scale = view.getScale();

				double x0 = state.getX() - pstate.getOrigin().getX()
						- tr.getX() * scale;
				double y0 = state.getY() - pstate.getOrigin().getY()
						- tr.getY() * scale;
				double right = state.getX() + state.getWidth();
				double bottom = state.getY() + state.getHeight();

				double dx = state.getWidth() - geo.getWidth() * scale + x0
						- geo.getX() * scale;
				double dy = state.getHeight() - geo.getHeight() * scale + y0
						- geo.getY() * scale;

				double fx = 1 - geo.getWidth() * scale / state.getWidth();
				double fy = 1 - geo.getHeight() * scale / state.getHeight();

				model.beginUpdate();
				try
				{
					for (int i = 0; i < cells.length; i++)
					{
						if (cells[i] != cell && isCellShiftable(cells[i]))
						{
							shiftCell(cells[i], dx, dy, x0, y0, right, bottom,
									fx, fy, isExtendParents()
											&& graph.isExtendParent(cells[i]));
						}
					}
				}
				finally
				{
					model.endUpdate();
				}
			}
		}
	}

	/**
	 * 
	 */
	protected void shiftCell(Object cell, double dx, double dy, double x0,
			double y0, double right, double bottom, double fx, double fy,
			boolean extendParent)
	{
		mxGraph graph = getGraph();
		mxCellState state = graph.getView().getState(cell);

		if (state != null)
		{
			mxIGraphModel model = graph.getModel();
			mxGeometry geo = model.getGeometry(cell);

			if (geo != null)
			{
				model.beginUpdate();
				try
				{
					if (isShiftRightwards())
					{
						if (state.getX() >= right)
						{
							geo = (mxGeometry) geo.clone();
							geo.translate(-dx, 0);
						}
						else
						{
							double tmpDx = Math.max(0, state.getX() - x0);
							geo = (mxGeometry) geo.clone();
							geo.translate(-fx * tmpDx, 0);
						}
					}

					if (isShiftDownwards())
					{
						if (state.getY() >= bottom)
						{
							geo = (mxGeometry) geo.clone();
							geo.translate(0, -dy);
						}
						else
						{
							double tmpDy = Math.max(0, state.getY() - y0);
							geo = (mxGeometry) geo.clone();
							geo.translate(0, -fy * tmpDy);
						}

						if (geo != model.getGeometry(cell))
						{
							model.setGeometry(cell, geo);

							// Parent size might need to be updated if this
							// is seen as part of the resize
							if (extendParent)
							{
								graph.extendParent(cell);
							}
						}
					}
				}
				finally
				{
					model.endUpdate();
				}
			}
		}
	}

	/**
	 * 
	 */
	protected Object[] getCellsToShift(mxCellState state)
	{
		mxGraph graph = this.getGraph();
		Object parent = graph.getModel().getParent(state.getCell());
		boolean down = isShiftDownwards();
		boolean right = isShiftRightwards();

		return graph.getCellsBeyond(state.getX()
				+ ((down) ? 0 : state.getWidth()), state.getY()
				+ ((down && right) ? 0 : state.getHeight()), parent, right,
				down);
	}

	/**
	 * 
	 */
	public void destroy()
	{
		setGraph(null);
	}

}
