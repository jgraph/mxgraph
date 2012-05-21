package com.mxgraph.test;

import javax.swing.JFrame;

import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.view.*;
import com.mxgraph.layout.*;

public class OrganicTest extends JFrame
{

   private static final long serialVersionUID = -2707712944901661771L;

    public OrganicTest()
    {
        super("Hello, World!");

        mxGraph graph = new mxGraph();
        Object parent = graph.getDefaultParent();
        Object[] vertices = new Object[3];
        
        graph.getModel().beginUpdate();
        try
        {
            for(int i = 0; i < 3; i++) {
            	vertices[i] = graph.insertVertex(parent, null, String.valueOf(i), 20+i*10, 20, 80,30);
            }
            
            graph.insertEdge(parent, null, "Edge1", vertices[0], vertices[1]);
            graph.insertEdge(parent, null, "Edge2", vertices[0], vertices[2]);
        }
        finally
        {
            graph.getModel().endUpdate();
        }

        mxGraphComponent graphComponent = new mxGraphComponent(graph);
        graphComponent.setConnectable(false);
        getContentPane().add(graphComponent);
        mxOrganicLayout organicLayout = new mxOrganicLayout(graph);
        organicLayout.execute(graph.getDefaultParent());
    }

    public static void main(String[] args)
    {
        OrganicTest frame = new OrganicTest();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 320);
        frame.setVisible(true);
    }

}