// $Id: Layout.cs,v 1.1 2009-11-14 14:56:03 gaudenz Exp $
// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Windows.Forms;
using System.Drawing;
using System.Threading;
using com.mxgraph;

namespace examples
{

    public class LayoutForm : Form
    {

        private GraphControl graphControl;

        public LayoutForm()
        {
            mxGraph graph = new mxGraph();
            Object parent = graph.GetDefaultParent();

            graph.Model.BeginUpdate();
            try
            {
                int nodeCount = 100;
                int edgeCount = 100;

                Object[] nodes = new Object[nodeCount];

                for (int i = 0; i < nodeCount; i++)
                {
                    nodes[i] = graph.InsertVertex(parent, null, 'N' + i, 0, 0, 30, 30);
                }

                Random r = new Random();

                for (int i = 0; i < edgeCount; i++)
                {
                    int r1 = (int)(r.NextDouble() * nodeCount);
                    int r2 = (int)(r.NextDouble() * nodeCount);
                    graph.InsertEdge(parent, null, r1 + '-' + r2,
                            nodes[r1], nodes[r2]);
                }

                mxIGraphLayout layout = new mxFastOrganicLayout(graph);
                layout.execute(parent);
            }
            finally
            {
                graph.Model.EndUpdate();
            }

            graph.View.Scale = 0.2;

            graphControl = new GraphControl(graph);
            graphControl.Dock = DockStyle.Fill;
            Controls.Add(graphControl);
            Size = new Size(320, 200);
        }

    }
}
