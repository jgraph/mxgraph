/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples.swing;

import java.util.EventObject;

import javax.swing.JFrame;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.mxgraph.model.mxCell;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.util.mxDomUtils;
import com.mxgraph.view.mxGraph;

public class UserObject extends JFrame
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -708317745824467773L;

	public UserObject()
	{
		super("Hello, World!");

		// Defines the user objects, which are preferrably XML nodes that allow
		// storage of complex values as child nodes and string, number or
		// boolean properties as attributes.
		//
		// When using Java objects as user objects, make sure to add the
		// package name containg the class and register a codec for the user
		// object class as follows:
		//
		// mxCodecRegistry.addPackage("com.example"); 
		// mxCodecRegistry.register(new mxObjectCodec(
		//	new com.example.CustomUserObject()));
		//
		// Note that the object must have an empty constructor and a setter and
		// getter for each property to be persisted. The object must not have
		// a property called ID as this property is reserved for resolving cell
		// references and will cause problems when used inside the user object.
		//
		Document doc = mxDomUtils.createDocument();
		Element person1 = doc.createElement("Person");
		person1.setAttribute("firstName", "Daffy");
		person1.setAttribute("lastName", "Duck");

		Element person2 = doc.createElement("Person");
		person2.setAttribute("firstName", "Bugs");
		person2.setAttribute("lastName", "Bunny");

		Element relation = doc.createElement("Knows");
		relation.setAttribute("since", "1985");

		mxGraph graph = new mxGraph()
		{
			// Overrides method to disallow edge label editing
			public boolean isCellEditable(Object cell)
			{
				return !getModel().isEdge(cell);
			}

			// Overrides method to provide a cell label in the display
			public String convertValueToString(Object cell)
			{
				if (cell instanceof mxCell)
				{
					Object value = ((mxCell) cell).getValue();

					if (value instanceof Element)
					{
						Element elt = (Element) value;

						if (elt.getTagName().equalsIgnoreCase("person"))
						{
							String firstName = elt.getAttribute("firstName");
							String lastName = elt.getAttribute("lastName");

							if (lastName != null && lastName.length() > 0)
							{
								return lastName + ", " + firstName;
							}

							return firstName;
						}
						else if (elt.getTagName().equalsIgnoreCase("knows"))
						{
							return elt.getTagName() + " (Since "
									+ elt.getAttribute("since") + ")";
						}

					}
				}

				return super.convertValueToString(cell);
			}

			// Overrides method to store a cell label in the model
			public void cellLabelChanged(Object cell, Object newValue,
					boolean autoSize)
			{
				if (cell instanceof mxCell && newValue != null)
				{
					Object value = ((mxCell) cell).getValue();

					if (value instanceof Node)
					{
						String label = newValue.toString();
						Element elt = (Element) value;

						if (elt.getTagName().equalsIgnoreCase("person"))
						{
							int pos = label.indexOf(' ');

							String firstName = (pos > 0) ? label.substring(0,
									pos).trim() : label;
							String lastName = (pos > 0) ? label.substring(
									pos + 1, label.length()).trim() : "";

							// Clones the value for correct undo/redo
							elt = (Element) elt.cloneNode(true);

							elt.setAttribute("firstName", firstName);
							elt.setAttribute("lastName", lastName);

							newValue = elt;
						}
					}
				}

				super.cellLabelChanged(cell, newValue, autoSize);
			}
		};

		Object parent = graph.getDefaultParent();

		graph.getModel().beginUpdate();
		try
		{
			Object v1 = graph.insertVertex(parent, null, person1, 20, 20, 80,
					30);
			Object v2 = graph.insertVertex(parent, null, person2, 240, 150, 80,
					30);
			graph.insertEdge(parent, null, relation, v1, v2);
		}
		finally
		{
			graph.getModel().endUpdate();
		}

		// Overrides method to create the editing value
		mxGraphComponent graphComponent = new mxGraphComponent(graph)
		{
			/**
			 * 
			 */
			private static final long serialVersionUID = 6824440535661529806L;

			public String getEditingValue(Object cell, EventObject trigger)
			{
				if (cell instanceof mxCell)
				{
					Object value = ((mxCell) cell).getValue();

					if (value instanceof Element)
					{
						Element elt = (Element) value;

						if (elt.getTagName().equalsIgnoreCase("person"))
						{
							String firstName = elt.getAttribute("firstName");
							String lastName = elt.getAttribute("lastName");

							return firstName + " " + lastName;
						}
					}
				}

				return super.getEditingValue(cell, trigger);
			};

		};
		
		getContentPane().add(graphComponent);
		
		// Stops editing after enter has been pressed instead
		// of adding a newline to the current editing value
		graphComponent.setEnterStopsCellEditing(true);
	}

	public static void main(String[] args)
	{
		UserObject frame = new UserObject();
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setSize(400, 320);
		frame.setVisible(true);
	}

}
