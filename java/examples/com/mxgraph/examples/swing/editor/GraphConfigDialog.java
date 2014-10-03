/**
 * Copyright (c) 2012, JGraph Ltd
 */

package com.mxgraph.examples.swing.editor;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.awt.Frame;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.border.EmptyBorder;

import com.mxgraph.analysis.StructuralException;
import com.mxgraph.analysis.mxAnalysisGraph;
import com.mxgraph.analysis.mxGraphGenerator;
import com.mxgraph.analysis.mxTraversal;
import com.mxgraph.analysis.mxGraphProperties;
import com.mxgraph.analysis.mxGraphProperties.GraphType;
import com.mxgraph.analysis.mxGraphStructure;
import com.mxgraph.layout.mxCircleLayout;
import com.mxgraph.layout.mxCompactTreeLayout;
import com.mxgraph.layout.mxOrganicLayout;
import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;
import com.mxgraph.view.mxGraph.mxICellVisitor;
import com.mxgraph.view.mxGraphView;
import com.mxgraph.costfunction.mxCostFunction;
import com.mxgraph.costfunction.mxDoubleValCostFunction;

public class GraphConfigDialog extends JDialog
{
	/**
	 * Number of nodes
	 */
	protected int numNodes = 6;

	/**
	 * Number of edges
	 */
	protected int numEdges = 6;

	/**
	 * Valence
	 */
	protected int valence = 2;

	/**
	 * Number of rows for a grid graph
	 */
	protected int numRows = 8;

	protected int numVertexesInBranch = 3;

	public int getNumVertexesInBranch()
	{
		return numVertexesInBranch;
	}

	public void setNumVertexesInBranch(int numVertexesInBranch)
	{
		this.numVertexesInBranch = numVertexesInBranch;
	}

	/**
	 * Number of columns for a grid graph
	 */
	protected int numColumns = 8;

	protected int minWeight = 1;

	public int getMinWeight()
	{
		return minWeight;
	}

	public void setMinWeight(int minWeight)
	{
		this.minWeight = minWeight;
	}

	public int getMaxWeight()
	{
		return maxWeight;
	}

	public void setMaxWeight(int maxWeight)
	{
		this.maxWeight = maxWeight;
	}

	protected int maxWeight = 10;

	/**
	 * Number of vertexes for the left group in a bipartite graph
	 */
	protected int numVertexesLeft = 5;

	/**
	 * Number of vertexes for the right group in a bipartite graph
	 */
	protected int numVertexesRight = 5;

	/**
	 * The start vertex (by value) for various algorithms
	 */
	protected int startVertexValue = 0;

	/**
	 * The end vertex (by value) for various algorithms (mostly pathfinding)
	 */
	protected int endVertexValue = 0;

	protected int numBranches = 4;

	public int getNumBranches()
	{
		return numBranches;
	}

	public void setNumBranches(int numBranches)
	{
		this.numBranches = numBranches;
	}

	/**
	 * If set, arrowheads are drawn
	 */
	protected boolean arrows = false;

	protected boolean weighted = false;

	/**
	 * If set, self-loops are allowed during graph generation
	 */
	protected boolean allowSelfLoops = false;

	/**
	 * If set, parallel edges are allowed during graph generation
	 */
	protected boolean allowMultipleEdges = false;

	/**
	 * If set, the generated graph will be always connected
	 */
	protected boolean forceConnected = false;

	/**
	 * Spacing for groups in a bipartite graph
	 */
	protected float groupSpacing = 200;

	/**
	 * Grid spacing for a grid graph
	 */
	protected float gridSpacing = 80;

	private static final long serialVersionUID = 1535851135077957959L;

	protected boolean insertGraph = false;

	protected mxGraph graph;

	protected mxAnalysisGraph aGraph;

	protected GraphType graphType;

	protected JTextField maxTreeNodeChildren = new JTextField();

	protected JTextField numNodesField = new JTextField();

	protected JTextField numEdgesField = new JTextField();

	protected JTextField valenceField = new JTextField();

	protected JTextField numRowsField = new JTextField();

	protected JTextField numColumnsField = new JTextField();

	protected JTextField gridSpacingField = new JTextField();

	protected JTextField numVertexesLeftField = new JTextField();

	protected JTextField numVertexesRightField = new JTextField();

	protected JTextField groupSpacingField = new JTextField();

	protected JCheckBox arrowsBox = new JCheckBox();

	protected JTextField startVertexValueField = new JTextField();

	protected JTextField endVertexValueField = new JTextField();

	protected JCheckBox selfLoopBox = new JCheckBox();

	protected JCheckBox multipleEdgeBox = new JCheckBox();

	protected JCheckBox forceConnectedBox = new JCheckBox();

	protected JCheckBox weightedBox = new JCheckBox();

	protected JTextField maxWeightField = new JTextField();

	protected JTextField minWeightField = new JTextField();

	protected JTextField numBranchesField = new JTextField();

	protected JTextField numVertexesInBranchField = new JTextField();

	public GraphConfigDialog(final GraphType graphType2, String dialogText)
	{

		super((Frame) null, dialogText, true);
		if ((graphType2 == GraphType.NULL) || (graphType2 == GraphType.SIMPLE_RANDOM_TREE))
		{
			JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
			panel.add(new JLabel("Number of nodes"));
			panel.add(numNodesField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int nodeCount = Integer.parseInt(numNodesField.getText());
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					if (graphType2 == GraphType.NULL)
					{
						mxGraphGenerator generator = new mxGraphGenerator(null, new mxDoubleValCostFunction());
						Map<String, Object> props = new HashMap<String, Object>();
						mxGraphProperties.setDirected(props, false);
						configAnalysisGraph(graph, generator, props);

						generator.getNullGraph(aGraph, nodeCount);

						mxGraphStructure.setDefaultGraphStyle(aGraph, false);
						mxCircleLayout layout = new mxCircleLayout(graph);
						layout.execute(graph.getDefaultParent());
					}
					else if (graphType2 == GraphType.SIMPLE_RANDOM_TREE)
					{
						graph.getModel().beginUpdate();

						mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, false, 0, 10),
								new mxDoubleValCostFunction());
						Map<String, Object> props = new HashMap<String, Object>();
						mxGraphProperties.setDirected(props, false);
						configAnalysisGraph(graph, generator, props);

						generator.getSimpleRandomTree(aGraph, nodeCount);

						mxGraphProperties.setDirected(props, true);
						mxGraphStructure.setDefaultGraphStyle(aGraph, false);
						setVisible(false);
						mxCompactTreeLayout layout = new mxCompactTreeLayout(graph, false);
						layout.execute(graph.getDefaultParent());
						graph.getModel().endUpdate();
					}

					graph.getModel().endUpdate();
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.COMPLETE)
		{
			JPanel panel = new JPanel(new GridLayout(5, 1, 4, 4));
			panel.add(new JLabel("Number of nodes"));
			panel.add(numNodesField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int vertexNumParam = Integer.parseInt(numNodesField.getText());
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					graph.getModel().beginUpdate();

					graph.selectAll();
					graph.removeCells();
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					configAnalysisGraph(graph, generator, props);

					generator.getCompleteGraph(aGraph, vertexNumParam);

					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					mxCircleLayout layout = new mxCircleLayout(graph);
					layout.execute(graph.getDefaultParent());
					graph.getModel().endUpdate();
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.FULL_WINDMILL || graphType2 == GraphType.FRIENDSHIP_WINDMILL)
		{
			JPanel panel = new JPanel(new GridLayout(6, 1, 4, 4));
			panel.add(new JLabel("Number of branches"));
			panel.add(numBranchesField);
			panel.add(new JLabel("Number of vertexes per branch"));
			panel.add(numVertexesInBranchField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					graph.selectAll();
					graph.removeCells();
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					int numBranchesParam = Integer.parseInt(numBranchesField.getText());
					int numVertexesInBranchParam = Integer.parseInt(numVertexesInBranchField.getText());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					configAnalysisGraph(graph, generator, props);

					if (graphType2 == GraphType.FRIENDSHIP_WINDMILL)
					{
						generator.getFriendshipWindmillGraph(aGraph, numBranchesParam, numVertexesInBranchParam);
					}
					else if (graphType2 == GraphType.FULL_WINDMILL)
					{
						generator.getWindmillGraph(aGraph, numBranchesParam, numVertexesInBranchParam);
					}

					generator.setWindmillGraphLayout(aGraph, numBranchesParam, numVertexesInBranchParam, 1000);
					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if ((graphType2 == GraphType.WHEEL) || (graphType2 == GraphType.STAR) || (graphType2 == GraphType.PATH))
		{
			JPanel panel = new JPanel(new GridLayout(5, 1, 4, 4));
			panel.add(new JLabel("Number of nodes"));
			panel.add(numNodesField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int numNodesParam = Integer.parseInt(numNodesField.getText());
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					if (graphType2 == GraphType.WHEEL)
					{
						generator.getWheelGraph(aGraph, numNodesParam);
						generator.setStarGraphLayout(aGraph, 400);
					}
					else if (graphType2 == GraphType.STAR)
					{
						generator.getStarGraph(aGraph, numNodesParam);
						generator.setStarGraphLayout(aGraph, 400);
					}
					else if (graphType2 == GraphType.PATH)
					{
						generator.getPathGraph(aGraph, numNodesParam);
						generator.setPathGraphSpacing(aGraph, 80);
					}

					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					graph.getModel().endUpdate();
				}
			});

			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.PETERSEN)
		{
			JPanel panel = new JPanel(new GridLayout(4, 1, 4, 4));
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					generator.getPetersenGraph(aGraph);
					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					mxCircleLayout layout = new mxCircleLayout(graph);
					layout.execute(graph.getDefaultParent());

					graph.getModel().endUpdate();
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.GRID)
		{
			JPanel panel = new JPanel(new GridLayout(3, 2, 4, 4));
			panel.add(new JLabel("Number of rows"));
			panel.add(numRowsField);
			panel.add(new JLabel("Number of columns"));
			panel.add(numColumnsField);
			panel.add(new JLabel("Grid spacing"));
			panel.add(gridSpacingField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int yDim = Integer.parseInt(numRowsField.getText());
					int xDim = Integer.parseInt(numColumnsField.getText());
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					float spacing = Float.parseFloat(gridSpacingField.getText());
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					configAnalysisGraph(graph, generator, props);

					generator.getGridGraph(aGraph, xDim, yDim);
					generator.setGridGraphSpacing(aGraph, spacing, spacing, xDim, yDim);

					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					graph.getModel().endUpdate();
				}
			});

			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if ((graphType2 == GraphType.KNIGHT) || (graphType2 == GraphType.KING))
		{
			JPanel panel = new JPanel(new GridLayout(5, 2, 4, 4));
			panel.add(new JLabel("Number of rows"));
			panel.add(numRowsField);
			panel.add(new JLabel("Number of columns"));
			panel.add(numColumnsField);
			panel.add(new JLabel("Grid spacing"));
			panel.add(gridSpacingField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int yDim = Integer.parseInt(numRowsField.getText());
					int xDim = Integer.parseInt(numColumnsField.getText());
					float spacing = Float.parseFloat(gridSpacingField.getText());

					mxGraphGenerator generator = new mxGraphGenerator(null, new mxDoubleValCostFunction());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					if (graphType2 == GraphType.KNIGHT)
					{
						generator.getKnightGraph(aGraph, xDim, yDim);
					}
					else if (graphType2 == GraphType.KING)
					{
						generator.getKingGraph(aGraph, xDim, yDim);
					}

					generator.setGridGraphSpacing(aGraph, spacing, spacing, xDim, yDim);
					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					graph.getModel().endUpdate();
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.KNIGHT_TOUR)
		{
			JPanel panel = new JPanel(new GridLayout(4, 2, 4, 4));
			panel.add(new JLabel("Starting node"));
			panel.add(startVertexValueField);
			panel.add(new JLabel("X dimension of chessboard"));
			panel.add(numColumnsField);
			panel.add(new JLabel("Y dimension of chessboard"));
			panel.add(numRowsField);
			panel.add(new JLabel("Grid spacing"));
			panel.add(gridSpacingField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int yDim = Integer.parseInt(numRowsField.getText());
					int xDim = Integer.parseInt(numColumnsField.getText());
					int value = Integer.parseInt(startVertexValueField.getText());
					float spacing = Float.parseFloat(gridSpacingField.getText());
					mxGraphGenerator generator = new mxGraphGenerator(null, new mxDoubleValCostFunction());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, true);
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					try
					{
						generator.getKnightTour(aGraph, xDim, yDim, value);
					}
					catch (StructuralException e1)
					{
						System.out.println(e1);
					}

					generator.setGridGraphSpacing(aGraph, spacing, spacing, xDim, yDim);
					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					graph.getModel().endUpdate();
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if ((graphType2 == GraphType.BIPARTITE) || (graphType2 == GraphType.COMPLETE_BIPARTITE))
		{
			JPanel panel = new JPanel(new GridLayout(3, 2, 4, 4));
			panel.add(new JLabel("Number of vertexes in group 1"));
			panel.add(numVertexesLeftField);
			panel.add(new JLabel("Number of vertexes in group 2"));
			panel.add(numVertexesRightField);
			panel.add(new JLabel("Group spacing"));
			panel.add(groupSpacingField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);

			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int leftNodeCount = Integer.parseInt(numVertexesLeftField.getText());
					int rightNodeCount = Integer.parseInt(numVertexesRightField.getText());
					float spacing = Float.parseFloat(groupSpacingField.getText());
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					if (graphType2 == GraphType.BIPARTITE)
					{
						generator.getBipartiteGraph(aGraph, leftNodeCount, rightNodeCount);
					}
					else if (graphType2 == GraphType.COMPLETE_BIPARTITE)
					{
						generator.getCompleteBipartiteGraph(aGraph, leftNodeCount, rightNodeCount);
					}

					generator.setBipartiteGraphSpacing(aGraph, leftNodeCount, rightNodeCount, spacing, spacing * 2);
					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					setVisible(false);
					graph.getModel().endUpdate();
				}
			});

			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if (graphType2 == GraphType.SIMPLE_RANDOM)
		{
			JPanel panel = new JPanel(new GridLayout(15, 2, 4, 4));
			panel.add(new JLabel("Number of nodes"));
			panel.add(numNodesField);
			panel.add(new JLabel("Number of edges"));
			panel.add(numEdgesField);
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);
			panel.add(selfLoopBox = new JCheckBox("Allow self-loops", false));
			panel.add(multipleEdgeBox = new JCheckBox("Allow multiple edges", false));
			panel.add(forceConnectedBox = new JCheckBox("Always connected (edge count may be inaccurate)", false));
			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int nodeCount = Integer.parseInt(numNodesField.getText());
					int edgeCount = Integer.parseInt(numEdgesField.getText());
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					Map<String, Object> props = new HashMap<String, Object>();
					mxGraphProperties.setDirected(props, arrows);
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();
					graph.selectAll();
					graph.removeCells();

					generator.getSimpleRandomGraph(aGraph, nodeCount, edgeCount, allowSelfLoops, allowMultipleEdges, forceConnected);

					mxGraphStructure.setDefaultGraphStyle(aGraph, false);
					mxOrganicLayout layout = new mxOrganicLayout(graph);
					layout.execute(graph.getDefaultParent());
					graph.getModel().endUpdate();
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
		}
		else if (graphType2 == GraphType.RESET_STYLE)
		{
			JPanel panel = new JPanel(new GridLayout(4, 2, 4, 4));
			panel.add(arrowsBox = new JCheckBox("Directed", false));
			panel.add(weightedBox = new JCheckBox("Weighted", false));
			panel.add(new JLabel("Min. weight"));
			panel.add(minWeightField);
			panel.add(new JLabel("Max. weight"));
			panel.add(maxWeightField);
			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Generate");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int minWeightParam = Integer.parseInt(minWeightField.getText());
					int maxWeightParam = Integer.parseInt(maxWeightField.getText());
					Map<String, Object> props = aGraph.getProperties();
					mxGraphProperties.setDirected(props, arrows);
					mxGraphGenerator generator = new mxGraphGenerator(mxGraphGenerator.getGeneratorFunction(graph, weighted,
							minWeightParam, maxWeightParam), new mxDoubleValCostFunction());
					configAnalysisGraph(graph, generator, props);
					graph.getModel().beginUpdate();

					mxGraphStructure.setDefaultGraphStyle(aGraph, true);

					graph.getModel().endUpdate();
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if ((graphType2 == GraphType.BFS_DIR) || (graphType2 == GraphType.DFS_DIR) || (graphType2 == GraphType.BFS_UNDIR)
				|| (graphType2 == GraphType.DFS_UNDIR) || (graphType2 == GraphType.MAKE_TREE_DIRECTED)
				|| (graphType2 == GraphType.INDEGREE) || (graphType2 == GraphType.OUTDEGREE) || (graphType2 == GraphType.IS_CUT_VERTEX))
		{
			JPanel panel = new JPanel(new GridLayout(1, 2, 4, 4));
			panel.add(new JLabel("Starting vertex"));
			panel.add(startVertexValueField);
			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Start");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int value = Integer.parseInt(startVertexValueField.getText());
					Object startVertex = mxGraphStructure.getVertexWithValue(aGraph, value);

					if(startVertex == null)
					{
						System.out.println("The specified vertex is not in the graph.");
					}
					else if (graphType2 == GraphType.BFS_DIR)
					{
						boolean oldDir = mxGraphProperties.isDirected(aGraph.getProperties(), mxGraphProperties.DEFAULT_DIRECTED);
						mxGraphProperties.setDirected(aGraph.getProperties(), true);
						System.out.println("BFS test");

						mxTraversal.bfs(aGraph, startVertex, new mxICellVisitor()
						{
							@Override
							// simple visitor that prints current vertex
							public boolean visit(Object vertex, Object edge)
							{
								mxCell v = (mxCell) vertex;
								mxCell e = (mxCell) edge;

								if (e != null)
								{
									System.out.println("Vertex: " + v.getValue() + " edge: " + e.getValue());
								}
								else
								{
									System.out.println("Vertex: " + v.getValue() + " edge: N/A");
								}

								return false;
							}
						});
						
						mxGraphProperties.setDirected(aGraph.getProperties(), oldDir);
					}
					else if (graphType2 == GraphType.DFS_DIR)
					{
						boolean oldDir = mxGraphProperties.isDirected(aGraph.getProperties(), mxGraphProperties.DEFAULT_DIRECTED);
						mxGraphProperties.setDirected(aGraph.getProperties(), true);
						System.out.println("DFS test");

						mxTraversal.dfs(aGraph, startVertex, new mxICellVisitor()
						{
							@Override
							// simple visitor that prints current vertex
							public boolean visit(Object vertex, Object edge)
							{
								mxCell v = (mxCell) vertex;
								mxCell e = (mxCell) edge;

								if (e != null)
								{
									System.out.println("Vertex: " + v.getValue() + " edge: " + e.getValue());
								}
								else
								{
									System.out.println("Vertex: " + v.getValue() + " edge: N/A");
								}

								return false;
							}
						});

						mxGraphProperties.setDirected(aGraph.getProperties(), oldDir);
					}
					else if (graphType2 == GraphType.BFS_UNDIR)
					{
						boolean oldDir = mxGraphProperties.isDirected(aGraph.getProperties(), mxGraphProperties.DEFAULT_DIRECTED);
						mxGraphProperties.setDirected(aGraph.getProperties(), false);
						System.out.println("BFS test");

						mxTraversal.bfs(aGraph, startVertex, new mxICellVisitor()
						{
							@Override
							// simple visitor that prints current vertex
							public boolean visit(Object vertex, Object edge)
							{
								mxCell v = (mxCell) vertex;
								mxCell e = (mxCell) edge;

								if (e != null)
								{
									System.out.println("Vertex: " + v.getValue() + " edge: " + e.getValue());
								}
								else
								{
									System.out.println("Vertex: " + v.getValue() + " edge: N/A");
								}

								return false;
							}
						});
						
						mxGraphProperties.setDirected(aGraph.getProperties(), oldDir);
					}
					else if (graphType2 == GraphType.DFS_UNDIR)
					{
						boolean oldDir = mxGraphProperties.isDirected(aGraph.getProperties(), mxGraphProperties.DEFAULT_DIRECTED);
						mxGraphProperties.setDirected(aGraph.getProperties(), false);
						System.out.println("DFS test");

						mxTraversal.dfs(aGraph, startVertex, new mxICellVisitor()
						{
							@Override
							// simple visitor that prints current vertex
							public boolean visit(Object vertex, Object edge)
							{
								mxCell v = (mxCell) vertex;
								mxCell e = (mxCell) edge;

								if (e != null)
								{
									System.out.println("Vertex: " + v.getValue() + " edge: " + e.getValue());
								}
								else
								{
									System.out.println("Vertex: " + v.getValue() + " edge: N/A");
								}

								return false;
							}
						});

						mxGraphProperties.setDirected(aGraph.getProperties(), oldDir);
					}
					else if (graphType2 == GraphType.MAKE_TREE_DIRECTED)
					{
						try
						{
							graph.getModel().beginUpdate();
							mxGraphStructure.makeTreeDirected(aGraph, startVertex);
							graph.getModel().endUpdate();
							graph.getModel().beginUpdate();
							mxCompactTreeLayout layout = new mxCompactTreeLayout(graph);
							layout.setHorizontal(false);
							layout.execute(graph.getDefaultParent());
							graph.getModel().endUpdate();
						}
						catch (StructuralException e1)
						{
							System.out.println(e1);
						}
					}
					else if (graphType2 == GraphType.INDEGREE)
					{
						int indegree = mxGraphStructure.indegree(aGraph, startVertex);
						System.out.println("Indegree of " + aGraph.getGraph().getModel().getValue(startVertex) + " is " + indegree);
					}
					else if (graphType2 == GraphType.OUTDEGREE)
					{
						int outdegree = mxGraphStructure.outdegree(aGraph, startVertex);
						System.out.println("Outdegree of " + aGraph.getGraph().getModel().getValue(startVertex) + " is " + outdegree);
					}
					else if (graphType2 == GraphType.IS_CUT_VERTEX)
					{
						boolean isCutVertex = mxGraphStructure.isCutVertex(aGraph, startVertex);

						if (isCutVertex)
						{
							System.out.println("Vertex " + aGraph.getGraph().getModel().getValue(startVertex) + " is a cut vertex.");
						}
						else
						{
							System.out.println("Vertex " + aGraph.getGraph().getModel().getValue(startVertex) + " is not a cut vertex.");
						}
					}
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
		else if ((graphType2 == GraphType.DIJKSTRA) || (graphType2 == GraphType.BELLMAN_FORD))
		{
			JPanel panel = new JPanel(new GridLayout(2, 2, 4, 4));
			panel.add(new JLabel("Starting vertex"));
			panel.add(startVertexValueField);
			panel.add(new JLabel("End vertex"));
			panel.add(endVertexValueField);
			JPanel panelBorder = new JPanel();
			panelBorder.setBorder(new EmptyBorder(10, 10, 10, 10));
			panelBorder.add(panel);

			JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
			panel.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Color.GRAY),
					BorderFactory.createEmptyBorder(16, 8, 8, 8)));

			JButton applyButton = new JButton("Start");
			JButton closeButton = new JButton("Cancel");
			buttonPanel.add(closeButton);
			buttonPanel.add(applyButton);
			getRootPane().setDefaultButton(applyButton);

			applyButton.addActionListener(new ActionListener()
			{
				double distance = 0;

				public void actionPerformed(ActionEvent e)
				{
					applyValues();
					int startValue = Integer.parseInt(startVertexValueField.getText());
					int endValue = Integer.parseInt(endVertexValueField.getText());
					Object startVertex = mxGraphStructure.getVertexWithValue(aGraph, startValue);
					Object endVertex = mxGraphStructure.getVertexWithValue(aGraph, endValue);

					if (graphType2 == GraphType.DIJKSTRA)
					{
						System.out.println("Dijkstra test");

						try
						{
							mxTraversal.dijkstra(aGraph, startVertex, endVertex, new mxICellVisitor()
							{
								@Override
								// simple visitor that prints current vertex
								public boolean visit(Object vertex, Object edge)
								{
									mxCell v = (mxCell) vertex;
									mxCell e = (mxCell) edge;
									String eVal = "N/A";

									if (e != null)
									{
										if (e.getValue() == null)
										{
											eVal = "1.0";
										}
										else
										{
											eVal = e.getValue().toString();
										}
									}

									if (!eVal.equals("N/A"))
									{
										distance = distance + Double.parseDouble(eVal);
									}

									System.out.print("(v: " + v.getValue() + " e: " + eVal + ")");

									return false;
								}
							});

							System.out.println(".");
							System.out.println("Total minimal distance is: " + distance);
						}
						catch (StructuralException e1)
						{
							System.out.println(e1);
						}
					}
					if (graphType2 == GraphType.BELLMAN_FORD)
					{
						try
						{
							List<Map<Object, Object>> bellmanFord = mxTraversal.bellmanFord(aGraph, startVertex);

							Map<Object, Object> distanceMap = bellmanFord.get(0);
							Map<Object, Object> parentMap = bellmanFord.get(1);
							mxCostFunction costFunction = aGraph.getGenerator().getCostFunction();
							mxGraphView view = aGraph.getGraph().getView();

							System.out.println("Bellman-Ford traversal test");
							Object[] vertices = aGraph.getChildVertices(aGraph.getGraph().getDefaultParent());
							int vertexNum = vertices.length;

							System.out.print("Distances from " + costFunction.getCost(view.getState(startVertex)) + " to [ ");

							for (int i = 0; i < vertexNum; i++)
							{
								System.out.print(i + ":" + Math.round((Double) distanceMap.get(vertices[i]) * 100.0) / 100.0 + " ");
							}

							System.out.println("]");

							System.out.print("Parents are [ ");

							for (int i = 0; i < vertexNum; i++)
							{
								System.out.print(i + ":" + costFunction.getCost(view.getState(parentMap.get(vertices[i]))) + " ");
							}

							System.out.println("]");

							if ((Double) distanceMap.get(endVertex) != Double.MAX_VALUE)
							{
								System.out.println("The shortest distance from vertex " + costFunction.getCost(view.getState(startVertex))
										+ " to vertex " + (Double) costFunction.getCost(view.getState(endVertex)) + " is: "
										+ distanceMap.get(endVertex));
							}
							else
							{
								System.out.println("The selected vertices aren't connected.");
							}

						}
						catch (StructuralException e1)
						{
							System.out.println(e1);
						}
					}
					setVisible(false);
				}
			});
			closeButton.addActionListener(new ActionListener()
			{
				public void actionPerformed(ActionEvent e)
				{
					insertGraph = false;
					setVisible(false);
				}
			});

			getContentPane().add(panelBorder, BorderLayout.CENTER);
			getContentPane().add(buttonPanel, BorderLayout.SOUTH);
			pack();
			setResizable(false);
			// setLocationRelativeTo(parent);
		}
	}

	public void configAnalysisGraph(mxGraph graph, mxGraphGenerator generator, Map<String, Object> props)
	{
		this.aGraph.setGraph(graph);
		
		if (generator == null)
		{
			this.aGraph.setGenerator(new mxGraphGenerator(null, null));
		}
		else
		{
			this.aGraph.setGenerator(generator);
		}
		
		if(props == null)
		{
			Map<String, Object> properties = new HashMap<String, Object>();
			mxGraphProperties.setDirected(properties, false);
			this.aGraph.setProperties(properties);
		}
		else
		{
			this.aGraph.setProperties(props);
		}
	}

	/**
	 * 
	 */
	protected void applyValues()
	{
		setNumNodes(Integer.parseInt(this.numNodesField.getText()));
		setNumEdges(Integer.parseInt(this.numEdgesField.getText()));
		setValence(Integer.parseInt(this.valenceField.getText()));
		setNumRows(Integer.parseInt(this.numRowsField.getText()));
		setNumColumns(Integer.parseInt(this.numColumnsField.getText()));
		setGridSpacing(Float.parseFloat(this.gridSpacingField.getText()));
		setNumVertexesLeft(Integer.parseInt(this.numVertexesLeftField.getText()));
		setNumVertexesRight(Integer.parseInt(this.numVertexesRightField.getText()));
		setGroupSpacing(Float.parseFloat(this.groupSpacingField.getText()));
		setArrows(this.arrowsBox.isSelected());
		setWeighted(this.weightedBox.isSelected());
		setStartVertexValue(Integer.parseInt(this.startVertexValueField.getText()));
		setEndVertexValue(Integer.parseInt(this.endVertexValueField.getText()));
		setAllowSelfLoops(this.selfLoopBox.isSelected());
		setAllowMultipleEdges(this.multipleEdgeBox.isSelected());
		setForceConnected(this.forceConnectedBox.isSelected());
		setMaxWeight(Integer.parseInt(this.maxWeightField.getText()));
		setMinWeight(Integer.parseInt(this.minWeightField.getText()));
		setNumBranches(Integer.parseInt(this.numBranchesField.getText()));
		setNumVertexesInBranch(Integer.parseInt(this.numVertexesInBranchField.getText()));
	}

	public void configureLayout(mxGraph graph, GraphType graphType, mxAnalysisGraph aGraph)
	{
		this.graph = graph;
		this.graphType = graphType;
		this.aGraph = aGraph;

		this.numNodesField.setText(String.valueOf(getNumNodes()));
		this.numEdgesField.setText(String.valueOf(getNumEdges()));
		this.valenceField.setText(String.valueOf(getValence()));
		this.numRowsField.setText(String.valueOf(getNumRows()));
		this.numColumnsField.setText(String.valueOf(getNumColumns()));
		this.gridSpacingField.setText(String.valueOf(getGridSpacing()));
		this.numVertexesLeftField.setText(String.valueOf(getNumVertexesLeft()));
		this.numVertexesRightField.setText(String.valueOf(getNumVertexesRight()));
		this.groupSpacingField.setText(String.valueOf(getGroupSpacing()));
		this.arrowsBox.setSelected(arrows);
		this.startVertexValueField.setText(String.valueOf(getStartVertexValue()));
		this.endVertexValueField.setText(String.valueOf(getEndVertexValue()));
		this.selfLoopBox.setSelected(allowSelfLoops);
		this.multipleEdgeBox.setSelected(allowMultipleEdges);
		this.forceConnectedBox.setSelected(forceConnected);
		this.weightedBox.setSelected(weighted);
		this.maxWeightField.setText(String.valueOf(getMaxWeight()));
		this.minWeightField.setText(String.valueOf(getMinWeight()));
		this.numBranchesField.setText(String.valueOf(getNumBranches()));
		this.numVertexesInBranchField.setText(String.valueOf(getNumVertexesInBranch()));
	}

	public void setAllowMultipleEdges(boolean allowMultipleEdges)
	{
		this.allowMultipleEdges = allowMultipleEdges;
	}

	public void setAllowSelfLoops(boolean allowSelfLoops)
	{
		this.allowSelfLoops = allowSelfLoops;
	}

	public void setArrows(boolean arrows)
	{
		this.arrows = arrows;
	}

	public void setEndVertexValue(int endVertexValue)
	{
		this.endVertexValue = endVertexValue;
	}

	public void setForceConnected(boolean forceConnected)
	{
		this.forceConnected = forceConnected;
	}

	public void setGridSpacing(float gridSpacing)
	{
		if (gridSpacing < 1)
		{
			gridSpacing = 1;
		}
		this.gridSpacing = gridSpacing;
	}

	public void setGroupSpacing(float groupSpacing)
	{
		this.groupSpacing = groupSpacing;
	}

	/**
	 * @param insertIntoModel
	 *            The insertIntoModel to set.
	 */

	public void setNumColumns(int numColumns)
	{
		this.numColumns = numColumns;
	}

	/**
	 * @param numEdges
	 *            The numEdges to set.
	 */
	public void setNumEdges(int numEdges)
	{
		if (numEdges < 1)
		{
			numEdges = 1;
		}
		else if (numEdges > 2000000)
		{
			numEdges = 2000000;
		}
		this.numEdges = numEdges;
	}

	/**
	 * @param numNodes
	 *            The numNodes to set.
	 */
	public void setNumNodes(int numNodes)
	{
		if (numNodes < 1)
		{
			numNodes = 1;
		}
		else if (numNodes > 2000000)
		{
			numNodes = 2000000;
		}
		this.numNodes = numNodes;
	}

	public void setNumRows(int numRows)
	{
		this.numRows = numRows;
	}

	public void setNumVertexesLeft(int numVertexesLeft)
	{
		if (numVertexesLeft < 1)
		{
			numVertexesLeft = 1;
		}
		else if (numVertexesLeft > 300)
		{
			numVertexesLeft = 300;
		}
		this.numVertexesLeft = numVertexesLeft;
	}

	public void setNumVertexesRight(int numVertexesRight)
	{
		if (numVertexesRight < 1)
		{
			numVertexesRight = 1;
		}
		else if (numVertexesRight > 300)
		{
			numVertexesRight = 300;
		}
		this.numVertexesRight = numVertexesRight;
	}

	public void setStartVertexValue(int startVertexValue)
	{
		this.startVertexValue = startVertexValue;
	}

	public void setValence(int valence)
	{
		if (valence < 0)
		{
			valence = 0;
		}
		else if (valence > 100)
		{
			valence = 100;
		}
		this.valence = valence;
	}

	public int getEndVertexValue()
	{
		return endVertexValue;
	}

	public float getGridSpacing()
	{
		return gridSpacing;
	}

	public float getGroupSpacing()
	{
		return groupSpacing;
	}

	public int getNumColumns()
	{
		return numColumns;
	}

	public int getNumEdges()
	{
		return numEdges;
	}

	public int getNumNodes()
	{
		return numNodes;
	}

	public int getNumRows()
	{
		return numRows;
	}

	public int getNumVertexesLeft()
	{
		return numVertexesLeft;
	}

	public int getNumVertexesRight()
	{
		return numVertexesRight;
	}

	public int getStartVertexValue()
	{
		return startVertexValue;
	}

	public int getValence()
	{
		return valence;
	}

	public boolean isAllowMultipleEdges()
	{
		return allowMultipleEdges;
	}

	public boolean isAllowSelfLoops()
	{
		return allowSelfLoops;
	}

	public boolean isArrows()
	{
		return arrows;
	}

	public boolean isForceConnected()
	{
		return forceConnected;
	}

	public boolean isWeighted()
	{
		return weighted;
	}

	public void setWeighted(boolean weighted)
	{
		this.weighted = weighted;
	}
}
