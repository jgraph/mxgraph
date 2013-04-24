/**
 * $Id: mxMarker.js,v 1.2 2012/11/20 20:09:47 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
var mxMarker =
{
	/**
	 * Class: mxMarker
	 * 
	 * A static class that implements all markers for VML and SVG using a
	 * registry. NOTE: The signatures in this class will change.
	 * 
	 * Variable: markers
	 * 
	 * Maps from markers names to functions to paint the markers.
	 */
	markers: [],
	
	/**
	 * Function: addMarker
	 * 
	 * Adds a factory method that updates a given endpoint and returns a
	 * function to paint the marker onto the given canvas.
	 */
	addMarker: function(type, funct)
	{
		mxMarker.markers[type] = funct;
	},
	
	/**
	 * Function: createMarker
	 * 
	 * Returns a function to paint the given marker.
	 */
	createMarker: function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var funct = mxMarker.markers[type];
		
		return (funct != null) ? funct(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) : null;
	}

};

/**
 * Adds the classic and block marker factory method.
 */
(function()
{
	function arrow(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = unitX * sw * 1.118;
		var endOffsetY = unitY * sw * 1.118;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);

		var pt = pe.clone();
		pt.x -= endOffsetX;
		pt.y -= endOffsetY;
		
		var f = (type != mxConstants.ARROW_CLASSIC) ? 1 : 3 / 4;
		pe.x += -unitX * f - endOffsetX;
		pe.y += -unitY * f - endOffsetY;

		return function()
		{
			canvas.begin();
			canvas.moveTo(pt.x, pt.y);
			canvas.lineTo(pt.x - unitX - unitY / 2, pt.y - unitY + unitX / 2);
		
			if (type == mxConstants.ARROW_CLASSIC)
			{
				canvas.lineTo(pt.x - unitX * 3 / 4, pt.y - unitY * 3 / 4);
			}
		
			canvas.lineTo(pt.x + unitY / 2 - unitX, pt.y - unitY - unitX / 2);
			canvas.close();

			if (filled)
			{
				canvas.fillAndStroke();
			}
			else
			{
				canvas.stroke();
			}
		};
	}
	
	mxMarker.addMarker('classic', arrow);
	mxMarker.addMarker('block', arrow);
	
	mxMarker.addMarker('open', function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = unitX * sw * 1.118;
		var endOffsetY = unitY * sw * 1.118;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);
		
		var pt = pe.clone();
		pt.x -= endOffsetX;
		pt.y -= endOffsetY;
		
		pe.x += -endOffsetX * 2;
		pe.y += -endOffsetY * 2;

		return function()
		{
			canvas.begin();
			canvas.moveTo(pt.x - unitX - unitY / 2, pt.y - unitY + unitX / 2);
			canvas.lineTo(pt.x, pt.y);
			canvas.lineTo(pt.x + unitY / 2 - unitX, pt.y - unitY - unitX / 2);
			canvas.stroke();
		};
	});
	
	mxMarker.addMarker('oval', function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var a = size / 2;
		
		var pt = pe.clone();
		pe.x -= unitX * a;
		pe.y -= unitY * a;

		return function()
		{
			canvas.ellipse(pt.x - a, pt.y - a, size, size);
						
			if (filled)
			{
				canvas.fillAndStroke();
			}
			else
			{
				canvas.stroke();
			}
		};
	});

	function diamond(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 45 degrees, 1/sin(45) = 1.4142 / 2 = 0.7071 ( / 2 allows for
		// only half the strokewidth is processed ). Or 0.9862 for thin diamond.
		// Note these values and the tk variable below are dependent, update
		// both together (saves trig hard coding it).
		var swFactor = (type == mxConstants.ARROW_DIAMOND) ?  0.7071 : 0.9862;
		var endOffsetX = unitX * sw * swFactor;
		var endOffsetY = unitY * sw * swFactor;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);
		
		var pt = pe.clone();
		pt.x -= endOffsetX;
		pt.y -= endOffsetY;
		
		pe.x += -unitX - endOffsetX;
		pe.y += -unitY - endOffsetY;
		
		// thickness factor for diamond
		var tk = ((type == mxConstants.ARROW_DIAMOND) ?  2 : 3.4);
		
		return function()
		{
			canvas.begin();
			canvas.moveTo(pt.x, pt.y);
			canvas.lineTo(pt.x - unitX / 2 - unitY / tk, pt.y + unitX / tk - unitY / 2);
			canvas.lineTo(pt.x - unitX, pt.y - unitY);
			canvas.lineTo(pt.x - unitX / 2 + unitY / tk, pt.y - unitY / 2 - unitX / tk);
			canvas.close();
			
			if (filled)
			{
				canvas.fillAndStroke();
			}
			else
			{
				canvas.stroke();
			}
		};
	};

	mxMarker.addMarker('diamond', diamond);
	mxMarker.addMarker('diamondThin', diamond);
})();
