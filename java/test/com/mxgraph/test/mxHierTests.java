package com.mxgraph.test;

import javax.swing.JFrame;

import com.mxgraph.layout.hierarchical.mxHierarchicalLayout;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.swing.handler.mxRubberband;
import com.mxgraph.swing.util.mxMorphing;
import com.mxgraph.util.mxEvent;
import com.mxgraph.util.mxEventObject;
import com.mxgraph.util.mxEventSource.mxIEventListener;
import com.mxgraph.util.mxPoint;
import com.mxgraph.view.mxGraph;


@SuppressWarnings("serial")
public class mxHierTests extends JFrame {


public mxHierTests() {
    super("Hierarchical Tests");

    final mxGraph graph = new mxGraph();
    final Object parent = graph.getDefaultParent();
    final mxHierarchicalLayout layout = new mxHierarchicalLayout(graph);
    layout.setResizeParent(true);
    layout.setFineTuning(true);
    layout.setParentBorder(20);
    layout.setMoveParent(true);

    populate1(graph, parent, layout);

    final mxGraphComponent graphComponent = new mxGraphComponent(graph);
    
    new mxRubberband(graphComponent);

    mxIEventListener listener = new mxIEventListener() {

        public void invoke(Object pSender, mxEventObject pEvt) {
            graph.getModel().beginUpdate();
            layout.execute(parent);
            mxMorphing morph = new mxMorphing(graphComponent, 3,
                    1.5, 20);
            morph.addListener(mxEvent.DONE, new mxIEventListener()
            {
                public void invoke(Object sender, mxEventObject evt)
                {
                    graph.getModel().endUpdate();
                }
            });
            morph.startAnimation();
        }
    };

    graph.addListener(mxEvent.CELLS_FOLDED, listener);
    graph.getView().setTranslate(new mxPoint(50, 50));
    getContentPane().add(graphComponent);
}

private void populate1(final mxGraph graph, final Object parent,
		final mxHierarchicalLayout layout)
{
	final Object gr;
	graph.getModel().beginUpdate();
    try
    {
        Object v1 = graph.insertVertex(parent, null, "V1", 0, 0, 80,
                30);
        Object v2 = graph.insertVertex(parent, null, "V2", 70, 70,
                80, 30);
        Object v3 = graph.insertVertex(parent, null, "V3", 140, 140,
                80, 30);
        Object v4 = graph.insertVertex(parent, null, "V4", 15, 15,
                80, 30);
        Object v5 = graph.insertVertex(parent, null, "V5", 70, 70,
                80, 30);
        Object v6 = graph.insertVertex(parent, null, "V6", 140, 140,
                80, 30);
        gr = graph.insertVertex(parent, null, "Group", 210, 210,
                80, 30);
        graph.groupCells( gr, 15, new Object[] { v4, v5, v6 });
        Object v7 = graph.insertVertex(parent, null, "V7", 420, 420,
                80, 30);
        graph.insertEdge(parent, null, "Edge12", v1, v2);
        graph.insertEdge(parent, null, "Edge23", v2, v3);
        graph.insertEdge(parent, null, "Edge34", v3, v4);
        graph.insertEdge(parent, null, "Edge37", v3, v7);
        graph.insertEdge(parent, null, "Edge45", v4, v5);
        graph.insertEdge(parent, null, "Edge56", v5, v6);
        graph.insertEdge(parent, null, "Edge67", v6, v7);

        layout.execute(gr);
        layout.execute(parent);
    }
    finally
    {
        graph.getModel().endUpdate();
    }
}

@SuppressWarnings("unused")
private void populate2(final mxGraph graph, final Object parent,
		final mxHierarchicalLayout layout)
{
	final Object gr;
	graph.getModel().beginUpdate();
    try
    {
        Object v1 = graph.insertVertex(parent, null, "V1", 0, 0, 80,
                30);
        Object v2 = graph.insertVertex(parent, null, "V2", 70, 70,
                80, 30);
        Object v3 = graph.insertVertex(parent, null, "V3", 140, 140,
                80, 30);
        Object v4 = graph.insertVertex(parent, null, "V4", 15, 15,
                80, 30);
        Object v41 = graph.insertVertex(parent, null, "V41", 15, 15,
                80, 30);
        Object v5 = graph.insertVertex(parent, null, "V5", 70, 70,
                80, 30);
        Object v6 = graph.insertVertex(parent, null, "V6", 140, 140,
                80, 30);
        gr = graph.insertVertex(parent, null, "Group", 210, 210,
                80, 30);
        graph.groupCells( gr, 15, new Object[] { v4, v41, v5, v6 });
        Object v7 = graph.insertVertex(parent, null, "V7", 420, 420,
                80, 30);
        graph.insertEdge(parent, null, "Edge12", v1, v2);
        graph.insertEdge(parent, null, "Edge23", v2, v3);
        graph.insertEdge(parent, null, "Edge34", v3, gr);
        graph.insertEdge(parent, null, "Edge37", v3, v7);
        graph.insertEdge(parent, null, "Edge45", v4, v5);
        graph.insertEdge(parent, null, "Edge56", v5, v6);
        graph.insertEdge(parent, null, "Edge67", gr, v7);

        layout.execute(gr);
        layout.execute(parent);
    }
    finally
    {
        graph.getModel().endUpdate();
    }
}

@SuppressWarnings("unused")
private void populate3(final mxGraph graph, final Object parent,
		final mxHierarchicalLayout layout)
{
	final Object gr;
	graph.getModel().beginUpdate();
    try
    {
        Object v1 = graph.insertVertex(parent, null, "V1", 0, 0, 80,
                30);
        Object v2 = graph.insertVertex(parent, null, "V2", 70, 70,
                80, 30);
        Object v3 = graph.insertVertex(parent, null, "V3", 140, 140,
                80, 30);
        Object v4 = graph.insertVertex(parent, null, "V4", 15, 15,
                80, 30);
        Object v5 = graph.insertVertex(parent, null, "V5", 70, 70,
                80, 30);
        Object v6 = graph.insertVertex(parent, null, "V6", 140, 140,
                80, 30);

        gr = graph.insertVertex(parent, null, "Group", 210, 210,
                80, 30, "shape=swimlane");
        graph.groupCells( gr, 15, new Object[] { v4, v5, v6 });

        Object v7 = graph.insertVertex(parent, null, "V7", 420, 420,
                80, 30);
        graph.insertEdge(parent, null, "Edge12", v1, v2);
        graph.insertEdge(parent, null, "Edge23", v2, v3);
        graph.insertEdge(parent, null, "Edge3GR", v3, gr);
        graph.insertEdge(parent, null, "Edge37", v3, v7);
        graph.insertEdge(parent, null, "Edge45", v4, v5);
        graph.insertEdge(parent, null, "Edge56", v5, v6);
        graph.insertEdge(parent, null, "EdgeGR7", gr, v7);
        graph.insertEdge(parent, null, "Edge72", v7, v2);

        layout.setFineTuning(true);
        layout.execute(parent);

    }
    finally
    {
        graph.getModel().endUpdate();
    }
}

@SuppressWarnings("unused")
private void populate4(final mxGraph graph, final Object parent,
		final mxHierarchicalLayout layout)
{
	final Object gr;
	graph.getModel().beginUpdate();
    try
    {
        Object v1 = graph.insertVertex(parent, null, "V1", 0, 0, 80,
                30);
        Object v2 = graph.insertVertex(parent, null, "V2", 70, 70,
                80, 30);
        Object v3 = graph.insertVertex(parent, null, "V3", 140, 140,
                80, 30);
        Object v4 = graph.insertVertex(parent, null, "V4", 15, 15,
                80, 30);
        Object v5 = graph.insertVertex(parent, null, "V5", 70, 70,
                80, 30);
        Object v6 = graph.insertVertex(parent, null, "V6", 140, 140,
                80, 30);
        /*gr = graph.insertVertex(parent, null, "Group", 210, 210,
                80, 30);*/
        
        Object v11 = graph.insertVertex(parent, null, "V11", 0, 0, 80,
                30);
        Object v21 = graph.insertVertex(parent, null, "V21", 70, 70,
                80, 30);
        Object v31 = graph.insertVertex(parent, null, "V31", 140, 140,
                80, 30);
        Object v41 = graph.insertVertex(parent, null, "V41", 15, 15,
                80, 30);
        
        //graph.groupCells( gr, 15, new Object[] { v4, v41, v5, v6, v21, v31 });
        Object v7 = graph.insertVertex(parent, null, "V7", 420, 420,
                80, 30);
        graph.insertEdge(parent, null, "Edge12", v1, v2);
        graph.insertEdge(parent, null, "Edge23", v2, v3);
        graph.insertEdge(parent, null, "Edge34", v3, v4);
        graph.insertEdge(parent, null, "Edge37", v3, v7);
        graph.insertEdge(parent, null, "Edge45", v4, v5);
        graph.insertEdge(parent, null, "Edge56", v5, v6);
        graph.insertEdge(parent, null, "Edge67", v6, v7);
        
        graph.insertEdge(parent, null, "Edge12", v11, v21);
        graph.insertEdge(parent, null, "Edge23", v21, v31);
        graph.insertEdge(parent, null, "Edge34", v31, v41);


        //layout.execute(gr);
        layout.execute(parent);
    }
    finally
    {
        graph.getModel().endUpdate();
    }
}

/**
 * http://forum.jgraph.com/questions/4319/bug-in-jgraphx-1101-mxhierarchicallayout-reproducible
 * @param graph
 * @param parent
 * @param layout
 */
@SuppressWarnings("unused")
private void populate5(final mxGraph graph, final Object parent,
		final mxHierarchicalLayout layout)
{
	graph.getModel().beginUpdate();

    Object v1 = graph.insertVertex(graph.getDefaultParent(), null, "A", 0, 0, 40, 40);
    Object v2 = graph.insertVertex(graph.getDefaultParent(), null, "B", 0, 0, 40, 40);
    Object v3 = graph.insertVertex(graph.getDefaultParent(), null, "C", 0, 0, 40, 40);
    Object v4 = graph.insertVertex(graph.getDefaultParent(), null, "D", 0, 0, 40, 40);

    graph.insertEdge(graph.getDefaultParent(), null, "", v1, v2);
    graph.insertEdge(graph.getDefaultParent(), null, "", v2, v3);
    graph.insertEdge(graph.getDefaultParent(), null, "", v3, v2);
    graph.insertEdge(graph.getDefaultParent(), null, "", v2, v4);

    layout.execute(graph.getDefaultParent());

    graph.getModel().endUpdate();
}

public static void main(String[] args) {
	mxHierTests frame = new mxHierTests();
    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    frame.setSize(700, 700);
    frame.setVisible(true);
}

}
