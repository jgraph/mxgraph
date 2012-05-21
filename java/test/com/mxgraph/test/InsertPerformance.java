package com.mxgraph.test;

import java.io.IOException;

import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxICell;
import com.mxgraph.view.mxGraph;

public class InsertPerformance {

	public static long testStartTime = 0;
	
	public static void main(String[] args)
	{
		testStartTime = System.currentTimeMillis();
		System.out.println("================");

		// Creates graph with model
		mxGraph graph = new mxGraph();
		Object parent = graph.getDefaultParent();

		int nodeCount = 10000;
		int edgeCount = 2000000;
		
		System.out.println("Start time " + resourceStamp());
		
		graph.getModel().beginUpdate();
		//try
		{
			mxCell[] nodes = new mxCell[nodeCount];
			mxCell[] edges = new mxCell[edgeCount];

			mxICell dummyGroup = (mxCell) graph.createVertex(parent, null, "I iz a group", 0, 0, 30, 30, null);
			
			for (int i = 0; i < nodeCount; i++)
			{
				nodes[i] = new mxCell(null, null, null);
				nodes[i].setVertex(true);
				nodes[i].setConnectable(true);
			}

			for (int i = 0; i < edgeCount; i++)
			{
				int r1 = (int) (Math.random() * nodeCount);
				int r2 = (int) (Math.random() * nodeCount);
				edges[i] = new mxCell(null, null, null);
				edges[i].setEdge(true);

				nodes[r1].insertEdge(edges[i], true);
				nodes[r2].insertEdge(edges[i], false);
			}
			graph.addCell(dummyGroup, parent, null,null, null);
		}
		//finally
		{
			graph.getModel().endUpdate();
		}
		
		
//		try
//		{
//			Object[] nodes = new Object[nodeCount];
//			Object[] edges = new Object[edgeCount];
//
//			for (int i = 0; i < nodeCount; i++)
//			{
//				nodes[i] = graph.insertVertex(parent, null, "N" + i, 0, 0, 30,
//						30);
//			}
//
//			for (int i = 0; i < edgeCount; i++)
//			{
//				int r1 = (int) (Math.random() * nodeCount);
//				int r2 = (int) (Math.random() * nodeCount);
//				edges[i] = graph.insertEdge(parent, null, r1 + "-" + r2,
//						nodes[r1], nodes[r2]);
//			}
//		}
//		finally
//		{
//			graph.getModel().endUpdate();
//		}

		System.out.println("End update finished " + resourceStamp());
		System.out.println("Number of vertices = " + nodeCount);
		System.out.println("Number of edges = " + edgeCount);

        System.out.print("Paused, press any key to complete");

        try {
            System.in.read();
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Finished");
	}
	
    private static String resourceStamp()
    {
        double time = (System.currentTimeMillis() - testStartTime) / 1000.0;
        double mem = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())
            / (1024.0 * 1024.0);
        mem = Math.round(mem * 100) / 100.0;
        return new String(time + " sec, " + mem + "MB");
    }
}
