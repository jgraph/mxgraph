package com.mxgraph.examples;

public class MyData
{
	public enum MyEnum
	{
		ONE, TWO, THREE
	}
	
	private MyEnum enumValue;

	public MyData()
	{
	}

	public MyData(MyEnum enumValue)
	{
		setEnumValue(enumValue);
	}

	public MyEnum getEnumValue()
	{
		return enumValue;
	}

	public void setEnumValue(MyEnum enumValue)
	{
		this.enumValue = enumValue;
	}

}
