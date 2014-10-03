/**
 * Copyright (c) 2007-2012, JGraph Ltd
 */
package com.mxgraph.examples;

import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxXmlUtils;

public class Codec
{

	protected boolean test = false;

	public Codec()
	{
		// empty
	}

	public boolean isTest()
	{
		return test;
	}

	public void setTest(boolean test)
	{
		this.test = test;
	}

	public static void main(String[] args)
	{
		// mxCodec wants simple class names, so packages must be known
		//mxCodecRegistry.addPackage("com.mxgraph.examples");

		mxCodec codec = new mxCodec();

		Codec obj = new Codec();
		obj.setTest(true);

		String xml = mxXmlUtils.getXml(codec.encode(obj));
		System.out.println("encoded: " + xml);

		Document doc = mxXmlUtils.parseXml(xml);

		codec = new mxCodec(doc);
		obj = (Codec) codec.decode(doc.getDocumentElement());

		System.out.println("decoded: " + obj);

		xml = mxXmlUtils.getXml(codec.encode(obj));
		System.out.println("encoded: " + xml);
	}

}
