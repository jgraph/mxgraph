/**
 * $Id: mxMarker.js,v 1.19 2012-03-30 12:51:58 david Exp $
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
	 * Function: paintMarker
	 * 
	 * Paints the given marker.
	 */
	paintMarker: function(node, type, p0, pe, color, strokewidth, size, scale, x0, y0, source, style)
	{
		var marker = mxMarker.markers[type];
		var result = null;
		
		if (marker != null)
		{
			var isVml = mxUtils.isVml(node);

			// Computes the norm and the inverse norm
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			
			if (isNaN(dx) || isNaN(dy))
			{
				return;
			}

			var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
			var nx = dx * scale / dist;
			var ny = dy * scale / dist;
			
			pe = pe.clone();
			
			if (isVml)
			{
				pe.x -= x0;
				pe.y -= y0;
			}

			// Handles start-/endFill style
			var filled = true;
			var key = (source) ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL;
			
			if (style[key] == 0)
			{
				filled = false;
			}

			if (isVml)
			{
				// Opacity is updated in reconfigure, use nf in path for no fill
				node.strokecolor = color;
				
				if (filled)
				{
					node.fillcolor = color;
				}
				else
				{
					node.filled = 'false';
				}
			}
			else
			{
				node.setAttribute('stroke', color);
				
				var op = (style.opacity != null) ? style.opacity / 100 : 1;
				node.setAttribute('stroke-opacity', op);
				
				if (filled)
				{
					node.setAttribute('fill', color);
					node.setAttribute('fill-opacity', op);
				}
				else
				{
					node.setAttribute('fill', 'none');
				}
			}
			
			result = marker.call(this, node, type, pe, nx, ny, strokewidth, size, scale, isVml);
		}
		
		return result;
	}

};

(function()
{
	/**
	 * Drawing of the classic and block arrows. 
	 */
	var tmp = function(node, type, pe, nx, ny, strokewidth, size, scale, isVml)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = nx * strokewidth * 1.118;
		var endOffsetY = ny * strokewidth * 1.118;
		pe.x -= endOffsetX;
		pe.y -= endOffsetY;
		
		nx = nx * (size + strokewidth);
		ny = ny * (size + strokewidth);

		if (isVml)
		{
			node.path = 'm' + Math.round(pe.x) + ',' + Math.round(pe.y) +
				' l' + Math.round(pe.x - nx - ny / 2) + ' ' + Math.round(pe.y - ny + nx / 2) +
				((type != mxConstants.ARROW_CLASSIC) ? '' :
				' ' + Math.round(pe.x - nx * 3 / 4) + ' ' + Math.round(pe.y - ny * 3 / 4)) +
				' ' + Math.round(pe.x + ny / 2 - nx) + ' ' + Math.round(pe.y - ny - nx / 2) +
				' x e';
			node.setAttribute('strokeweight', (strokewidth * scale) + 'px');
		}
		else
		{
			node.setAttribute('d', 'M ' + pe.x + ' ' + pe.y +
				' L ' + (pe.x - nx - ny / 2) + ' ' + (pe.y - ny + nx / 2) +
				((type != mxConstants.ARROW_CLASSIC) ? '' :
				' L ' + (pe.x - nx * 3 / 4) + ' ' + (pe.y - ny * 3 / 4)) +
				' L ' + (pe.x + ny / 2 - nx) + ' ' + (pe.y - ny - nx / 2) +
				' z');
			node.setAttribute('stroke-width', strokewidth * scale);
		}
		
		var f = (type != mxConstants.ARROW_CLASSIC) ? 1 : 3 / 4;
		return new mxPoint(-nx * f - endOffsetX, -ny * f - endOffsetY);
	};

	mxMarker.markers[mxConstants.ARROW_CLASSIC] = tmp;
	mxMarker.markers[mxConstants.ARROW_BLOCK] = tmp;
}());

mxMarker.markers[mxConstants.ARROW_OPEN] = function(node, type, pe, nx, ny, strokewidth, size, scale, isVml)
{
	// The angle of the forward facing arrow sides against the x axis is
	// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
	// only half the strokewidth is processed ).
	var endOffsetX = nx * strokewidth * 1.118;
	var endOffsetY = ny * strokewidth * 1.118;
	pe.x -= endOffsetX;
	pe.y -= endOffsetY;
	
	nx = nx * (size + strokewidth);
	ny = ny * (size + strokewidth);

	if (isVml)
	{
		node.path = 'm' + Math.round(pe.x - nx - ny / 2) + ' ' + Math.round(pe.y - ny + nx / 2) +
			' l' + Math.round(pe.x) + ' ' + Math.round(pe.y) +
			' ' + Math.round(pe.x + ny / 2 - nx) + ' ' + Math.round(pe.y - ny - nx / 2) +
			' e nf';
		node.setAttribute('strokeweight', (strokewidth * scale) + 'px');
	}
	else
	{
		node.setAttribute('d', 'M ' + (pe.x - nx - ny / 2) + ' ' + (pe.y - ny + nx / 2) +
				' L ' + (pe.x) + ' ' + (pe.y) +
				' L ' + (pe.x + ny / 2 - nx) + ' ' + (pe.y - ny - nx / 2));
		node.setAttribute('stroke-width', strokewidth * scale);
		node.setAttribute('fill', 'none');
	}
	
	return new mxPoint(-endOffsetX * 2, -endOffsetY * 2);
};

mxMarker.markers[mxConstants.ARROW_OVAL] = function(node, type, pe, nx, ny, strokewidth, size, scale, isVml)
{
	nx *= size;
	ny *= size;
	
	nx *= 0.5 + strokewidth / 2;
	ny *= 0.5 + strokewidth / 2;
	
	var absSize = size * scale;
	var radius = absSize / 2;
	
	if (isVml)
	{
		node.path = 'm' + Math.round(pe.x + radius) + ' ' + Math.round(pe.y) +
			' at ' + Math.round(pe.x - radius) + ' ' + Math.round(pe.y - radius) +
			' ' + Math.round(pe.x + radius) + ' ' + Math.round(pe.y + radius) +
			' ' + Math.round(pe.x + radius) + ' ' + Math.round(pe.y) +
			' ' + Math.round(pe.x + radius) + ' ' + Math.round(pe.y) +
			' x e';
		
		node.setAttribute('strokeweight', (strokewidth * scale) + 'px');
	}
	else
	{
		node.setAttribute('d', 'M ' + (pe.x - radius) + ' ' + (pe.y) +
			' a ' + (radius) + ' ' + (radius) +
			' 0  1,1 ' + (absSize) + ' 0' +
			' a ' + (radius) + ' ' + (radius) +
			' 0  1,1 ' + (-absSize) + ' 0 z');
		node.setAttribute('stroke-width', strokewidth * scale);
	}
	
	return new mxPoint(-nx / (2 + strokewidth), -ny / (2 + strokewidth));
};

(function()
		{
			/**
			 * Drawing of the diamond and thin diamond markers
			 */
			var tmp_diamond = function(node, type, pe, nx, ny, strokewidth, size, scale, isVml)
			{
				// The angle of the forward facing arrow sides against the x axis is
				// 45 degrees, 1/sin(45) = 1.4142 / 2 = 0.7071 ( / 2 allows for
				// only half the strokewidth is processed ). Or 0.9862 for thin diamond.
				// Note these values and the tk variable below are dependent, update
				// both together (saves trig hard coding it).
				var swFactor = (type == mxConstants.ARROW_DIAMOND) ?  0.7071 : 0.9862;
				var endOffsetX = nx * strokewidth * swFactor;
				var endOffsetY = ny * strokewidth * swFactor;
				
				nx = nx * (size + strokewidth);
				ny = ny * (size + strokewidth);
				
				pe.x -= endOffsetX + nx / 2;
				pe.y -= endOffsetY + ny / 2;
				
				// thickness factor for diamond
				var tk = ((type == mxConstants.ARROW_DIAMOND) ?  2 : 3.4);

				if (isVml)
				{
					node.path = 'm' + Math.round(pe.x + nx / 2) + ' ' + Math.round(pe.y + ny / 2) +
						' l' + Math.round(pe.x - ny / tk) + ' ' + Math.round(pe.y + nx / tk) +
						' ' + Math.round(pe.x - nx / 2) + ' ' + Math.round(pe.y - ny / 2) +
						' ' + Math.round(pe.x + ny / tk) + ' ' + Math.round(pe.y - nx / tk) +
						' x e';
					node.setAttribute('strokeweight', (strokewidth * scale) + 'px');
				}
				else
				{
					node.setAttribute('d', 'M ' + (pe.x + nx / 2) + ' ' + (pe.y + ny / 2) +
						' L ' + (pe.x - ny / tk) + ' ' + (pe.y + nx / tk) +
						' L ' + (pe.x - nx / 2) + ' ' + (pe.y - ny / 2) +
						' L ' + (pe.x + ny / tk) + ' ' + (pe.y - nx / tk) +
						' z');
					node.setAttribute('stroke-width', strokewidth * scale);
				}
				
				return new mxPoint(-endOffsetX - nx, -endOffsetY - ny);
			};

			mxMarker.markers[mxConstants.ARROW_DIAMOND] = tmp_diamond;
			mxMarker.markers[mxConstants.ARROW_DIAMOND_THIN] = tmp_diamond;
		}());
