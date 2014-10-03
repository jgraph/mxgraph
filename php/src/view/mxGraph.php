<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */

class mxGraph
{
	
	/**
	 * Class: mxGraph
	 *
	 * Implements a graph component.
	 * 
	 * Variable: model
	 *
	 * Holds the <mxGraphModel>.
	 */
	var $model;
		
	/**
	 * Variable: stylesheet
	 *
	 * Holds the <mxStylesheet>.
	 */
	var $stylesheet;
	
	/**
	 * Variable: view
	 *
	 * Holds the <mxGraphView>.
	 */
	var $view;
	
	/**
	 * Variable: gridSize
	 * 
	 * Specifies the grid size. Default is 10.
	 */
	var $gridSize = 10;
	
	/**
	 * Variable: labelsVisible
	 * 
	 * Specifies if labels should be visible. This is used in
	 * <getLabel>. Default is true.
	 */
	var $labelsVisible = true;

	/**
	 * Variable: defaultLoopStyle
	 * 
	 * <mxEdgeStyle> to be used for loops. This is a fallback for
	 * loops if the <mxConstants.STYLE_LOOP> is undefined. Default is
	 * <mxEdgeStyle.Loop>.
	 */
	var $defaultLoopStyle = "mxEdgeStyle.Loop";

	/**
	 * Variable: imageBundles
	 *
	 * Holds the list of image bundles.
	 */
	protected $imageBundles = array();
	
	/**
	 * Constructor: mxGraphModel
	 *
	 * Constructs a new graph model using the specified
	 * root cell.
	 */
	function mxGraph($model = null, $stylesheet = null)
	{
		$this->model = ($model != null) ? $model : new mxGraphModel();
		$this->stylesheet = ($stylesheet != null) ? $stylesheet : $this->createStylesheet();
		$this->view = $this->createGraphView();
		$this->view->revalidate();
		
		$this->model->addListener(mxEvent::$GRAPH_MODEL_CHANGED, $this);
	}
		
	/**
	 * Function: createStylesheet
	 * 
	 * Creates a new <mxStylesheet> to be used in this graph.
	 */
	function createStylesheet()
	{
		return new mxStylesheet();
	}
	
	/**
	 * Function: createGraphView
	 * 
	 * Creates a new <mxGraphView> to be used in this graph.
	 */
	function createGraphView()
	{
		return new mxGraphView($this);
	}

	/**
	 * Function: getModel
	 * 
	 * Returns the <mxGraphModel> that contains the cells.
	 */
	function getModel()
	{
		return $this->model;
	}
	
	/**
	 * Function: getStylesheet
	 * 
	 * Returns the <mxStylesheet> that defines the style.
	 */
	function getStylesheet()
	{
		return $this->stylesheet;
	}
	
	/**
	 * Function: getView
	 * 
	 * Returns the <mxGraphView> that contains the <mxCellStates>.
	 */
	function getView()
	{
		return $this->view;
	}

	/**
	 * Function: getDefaultParent
	 * 
	 * Returns the first child child of <mxGraphModel.root>. The value returned
	 * by this function should be used as the parent for new cells (aka default
	 * layer).
	 */
	function getDefaultParent()
	{
		$model = $this->model;
		
		return $model->getChildAt($model->getRoot(), 0);
	}

	/**
	 * Function: convertValueToString
	 * 
	 * Returns the textual representation for the given cell. This
	 * implementation returns the nodename or string-representation of the user
	 * object.
	 */
	function convertValueToString($cell)
	{
		$result = $this->model->getValue($cell);
	 	
 		return ($result != null) ? $result : "";
	}

	/**
	 * Function: getLabel
	 * 
	 * Returns a string or DOM node that represents the label for the given
	 * cell. This implementation uses <convertValueToString> if <labelsVisible>
	 * is true. Otherwise it returns an empty string.
	 */
	function getLabel($cell)
	{
		$result = "";
		
		if ($cell != null)
		{
			$state = $this->view->getState($cell);
			$style = ($state != null) ?
				$state->style : $this->getCellStyle($cell);
			
			if ($this->labelsVisible &&
				!mxUtils::getValue($style, mxConstants::$STYLE_NOLABEL, false))
			{
				$result = $this->convertValueToString($cell);
			}
		}
		
		return $result;
	}

	/**
	 * Function: getChildOffsetForCell
	 * 
	 * Returns the offset to be used for the cells inside the given cell. The
	 * root and layer cells may be identified using <mxGraphModel.isRoot> and
	 * <mxGraphModel.isLayer>. For all other current roots, the
	 * <mxGraphView.currentRoot> field points to the respective cell, so that
	 * the following holds: cell == this.view.currentRoot. This implementation
	 * returns null.
	 * 
	 * Parameters:
	 * 
	 * cell - <mxCell> whose offset should be returned.
	 */
	function getChildOffsetForCell($cell)
	{
		return null;
	}

	/**
	 * Function: isOrthogonal
	 * 
	 * Returns true if perimeter points should be computed such that the
	 * resulting edge has only horizontal or vertical segments.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> that represents the edge.
	 */
	function isOrthogonal($edge)
	{
		if (isset($edge->style[mxConstants::$STYLE_ORTHOGONAL]))
		{
			return mxUtils::getValue($edge->style, mxConstants::$STYLE_ORTHOGONAL);
		}

		$edgeStyle = $this->view->getEdgeStyle($edge, null, null, null);

		return $edgeStyle === mxEdgeStyle::$ElbowConnector ||
			$edgeStyle === mxEdgeStyle::$SideToSide ||
			$edgeStyle === mxEdgeStyle::$TopToBottom ||
			$edgeStyle === mxEdgeStyle::$EntityRelation;
	}
	
	/**
	 * Function: isCellVisible
	 *
	 * Returns true if the given cell is visible.
	 */
	function isCellVisible($cell)
	{
		return $this->model->isVisible($cell);
	}
	
	/**
	 * Function: isCellCollapsed
	 *
	 * Returns true if the given cell is collapsed.
	 */
	function isCellCollapsed($cell)
	{
		return $this->model->isCollapsed($cell);
	}
	
	/**
	 * Function: isCellCollapsed
	 *
	 * Returns true if the given cell is connectable.
	 */
	function isCellConnectable($cell)
	{
		return $this->model->isConnectable($cell);
	}

	/**
	 * Function: getCellGeometry
	 *
	 * Returns the <mxGeometry> for the given <mxCell>.
	 */
	function getCellGeometry($cell)
	{
		return $this->model->getGeometry($cell);
	}
	
	/**
	 * Function: getCellStyle
	 */
	function getCellStyle($cell)
	{
		$style = ($this->model->isVertex($cell)) ?
			$this->stylesheet->getDefaultVertexStyle() :
			$this->stylesheet->getDefaultEdgeStyle();

		$name = $this->model->getStyle($cell);
		
		if ($name != null)
		{
			$style = $this->postProcessCellStyle($this->stylesheet->getCellStyle($name, $style));
		}
		
		if ($style == null)
		{
			$style = array();
		}
		
		return $style;
	}
	
	/**
	 * Function: postProcessCellStyle
	 * 
	 * Tries to resolve the value for the image style in the image bundles and
	 * turns short data URIs as defined in mxImageBundle to data URIs as
	 * defined in RFC 2397 of the IETF.
	 */
	function postProcessCellStyle($style)
	{
		if (isset($style) && array_key_exists(mxConstants::$STYLE_IMAGE, $style))
		{
			$key = $style[mxConstants::$STYLE_IMAGE];
			$image = $this->getImageFromBundles($key);

			if (isset($image))
			{
				$style[mxConstants::$STYLE_IMAGE] = $image;
			}
			else
			{
				$image = $key;
			}
			
			// Converts short data uris to normal data uris
			if (isset($image) && substr($image, 0, 11) == "data:image/")
			{
				$comma = strpos($image, ",");
				
				if ($comma !== false)
				{
					$image = substr($image, 0, $comma).";base64,".
						substr($image, $comma + 1);
				}
				
				$style[mxConstants::$STYLE_IMAGE] = $image;
			}
		}

		return $style;
	}

	/**
	 * Function: setCellStyles
	 * 
	 * Sets the key to value in the styles of the given cells. This will modify
	 * the existing cell styles in-place and override any existing assignment
	 * for the given key. If no cells are specified, then the selection cells
	 * are changed. If no value is specified, then the respective key is
	 * removed from the styles.
	 * 
	 * Parameters:
	 * 
	 * key - String representing the key to be assigned.
	 * value - String representing the new value for the key.
	 * cells - Array of <mxCells> to change the style for.
	 */
	function setCellStyles($key, $value, $cells)
	{
		mxUtils::setCellStyles($this->model, $cells, $key, $value);
	}
	/**
	 * Function: addBundle
	 * 
	 * Adds the specified <mxImageBundle>.
	 */
	function addImageBundle($bundle)
	{
		array_push($this->imageBundles, $bundle);
	}
	
	/**
	 * Function: removeImageBundle
	 * 
	 * Removes the specified <mxImageBundle>.
	 */
	function removeImageBundle($bundle)
	{
		$tmp = array();
		
		for ($i = 0; $i < sizeof($this->imageBundles); $i++)
		{
			if ($this->imageBundles[$i] !== $bundle)
			{
				array_push($tmp, $this->imageBundles[$i]);
			}
		}
		
		$this->imageBundles = $tmp;
	}
	
	/**
	 * Function: getImageFromBundles
	 * 
	 * Searches all <imageBundles> for the specified key and returns the value
	 * for the first match or null if the key is not found.
	 */
	function getImageFromBundles($key)
	{
		if (isset($key))
		{
			for ($i = 0; $i < sizeof($this->imageBundles); $i++)
			{
				$image = $this->imageBundles[$i]->getImage($key);
				
				if (isset($image))
				{
					return $image;
				}
			}
		}
		
		return null;
	}
		
	/**
	 * Function: getImageBundles
	 * 
	 * Returns the <imageBundles>.
	 */
	function getImageBundles()
	{
		return $this->imageBundles;
	}
	
	/**
	 * Function: setImageBundles
	 * 
	 * Sets the <imageBundles>.
	 */
	function setImageBundles($value)
	{
		$this->imageBundles = $value;
	}
	
	/**
	 * Function: insertVertex
	 * 
	 * Adds a new vertex into the given parent <mxCell> using value as the user
	 * object and the given coordinates as the <mxGeometry> of the new vertex.
	 * The id and style are used for the respective properties of the new
	 * <mxCell>, which is returned.
	 *
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent of the new vertex.
	 * id - Optional string that defines the Id of the new vertex.
	 * value - Object to be used as the user object.
	 * x - Integer that defines the x coordinate of the vertex.
	 * y - Integer that defines the y coordinate of the vertex.
	 * width - Integer that defines the width of the vertex.
	 * height - Integer that defines the height of the vertex.
	 * style - Optional string that defines the cell style.
	 * relative - Optional boolean that specifies if the geometry is relative.
	 * Default is false.
	 */
	function insertVertex($parent, $id = null, $value = null, $x = 0, $y = 0,
		$width = 1, $height = 1, $style = null, $relative = false)
	{
		if ($parent == null)
		{
			$parent = $this->getDefaultParent();
		}
		
		$vertex = $this->createVertex($parent, $id, $value, $x, $y, $width, $height, $style, $relative);
		$index = $this->model->getChildCount($parent);
		
		return $this->model->add($parent, $vertex, $index);
	}
			
	/**
	 * Function: createVertex
	 * 
	 * Creates the vertex to be used in insertVertex.
	 */
	function createVertex($parent, $id = null, $value = null, $x = 0, $y = 0,
		$width = 1, $height = 1, $style = null, $relative = false)
	{
		$geometry = new mxGeometry($x, $y, $width, $height);
		$geometry->relative = $relative;
		
		$vertex = new mxCell($value, $geometry, $style);
		$vertex->setId($id);
		$vertex->setVertex(true);
		
		return $vertex;
	}

	/**
	 * Function: insertEdge
	 * 
	 * Adds a new edge into the given parent <mxCell> using value as the user
	 * object and the given source and target as the terminals of the new edge.
	 * The id and style are used for the respective properties of the new
	 * <mxCell>, which is returned.
	 *
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent of the new edge.
	 * id - Optional string that defines the Id of the new edge.
	 * value - JavaScript object to be used as the user object.
	 * source - <mxCell> that defines the source of the edge.
	 * target - <mxCell> that defines the target of the edge.
	 * style - Optional string that defines the cell style.
	 */
	function insertEdge($parent, $id = null, $value = null,
		$source = null, $target = null, $style = null)
	{
		if ($parent == null)
		{
			$parent = $this->getDefaultParent();
		}

		$edge = $this->createEdge($parent, $id, $value, $source, $target, $style);
		
		// Appends the edge to the given parent and sets
		// the edge terminals in a single transaction
		$index = $this->model->getChildCount($parent);
	 	
	 	$this->model->beginUpdate();
	 	try
	 	{
		 	$edge = $this->model->add($parent, $edge, $index);
		 	
			$this->model->setTerminal($edge, $source, true);
			$this->model->setTerminal($edge, $target, false);
		}
		catch (Exception $e)
		{
			$this->model->endUpdate();
			throw($e);
		}
		$this->model->endUpdate();

		return $edge;
	}
				
	/**
	 * Function: createEdge
	 * 
	 * Creates the edge to be used in <insertEdge>. This implementation does
	 * not set the source and target of the edge, these are set when the edge
	 * is added to the model.
	 */
	function createEdge($parent, $id = null, $value = null,
		$source = null, $target = null, $style = null)
	{
		$geometry = new mxGeometry();
		$edge = new mxCell($value, $geometry, $style);
		
		$edge->setId($id);
		$edge->setEdge(true);
		$edge->geometry->relative = true;

		return $edge;
	}
	
	/**
  	 * Function: getGraphBounds
  	 * 
  	 * Returns the bounds of the visible graph. Shortcut to
  	 * <mxGraphView.getGraphBounds>.
  	 */
	function getGraphBounds()
	{
		return $this->getView()->getGraphBounds();
	}

    /**
     * Function: getBoundingBox
     * 
     * Returns the bounding box of the given cell including all connected edges
     * if includeEdge is true.
     */
    function getBoundingBox($cell, $includeEdges = false, $includeDescendants = false)
    {
        return $this->getCellBounds($cell, $includeEdges, $includeDescendants, true);
    }

    /**
     * Function: getPaintBounds
     * 
     * Returns the bounding box of the given cells and their descendants.
     */
    function getPaintBounds($cells)
    {
        return $this->getBoundsForCells($cells, false, true, true);
    }

    /**
     * Function: getBoundsForCells
     * 
     * Returns the bounds for the given cells.
     */
    function getBoundsForCells($cells, $includeEdges = false, $includeDescendants = false, $boundingBox = false)
    {
    	$cellCount = sizeof($cells);
    	$result = null;
    	
        if ($cellCount > 0)
        {
			for ($i = 0; $i < $cellCount; $i++)
			{
            	$bounds = $this->getCellBounds($cells[$i], $includeEdges,
            		$includeDescendants, $boundingBox);
            	
            	if ($bounds != null)
            	{
	            	if ($result == null)
	            	{
	            		$result = new mxRectangle($bounds->x, $bounds->y,
	            			$bounds->width, $bounds->height);
	            	}
					else
	                {
	                	$result->add($bounds);
	                }
            	}
			}
        }

        return $result;
    }

    /**
     * Function: getCellBounds
     * 
     * Returns the bounds of the given cell including all connected edges
     * if includeEdge is true.
     */
    function getCellBounds($cell, $includeEdges = false, $includeDescendants = false, $boundingBox = false)
    {
		$cells = array($cell);

		// Includes the connected edges
        if ($includeEdges)
        {
            $edgeCount = $this->model->getEdgeCount($cell);

            for ($i = 0; $i < $edgeCount; $i++)
            {
            	array_push($cells, $this->model->getEdgeAt($cell, $i));
            }
        }

		$result = $this->view->getBounds($cells, $boundingBox);
		
		// Recursively includes the bounds of the children
		if ($includeDescendants)
		{
			for ($i = 0; $i < sizeof($cells); $i++)
			{
				$childCount = $this->model->getChildCount($cells[$i]);
				
				for ($j = 0; $j < $childCount; $j++)
				{
					$tmp = $this->getCellBounds($this->model->getChildAt($cells[$i], $j),
						$includeEdges, true, $boundingBox);
	
					if ($result != null)
					{
						$result->add($tmp);
					}
					else
					{
						$result = $tmp;
					}
				}
			}
		}
		
		return $result;
    }

	/**
	 * Function: getConnectionConstraint
	 * 
	 * Returns an <mxConnectionConstraint> that describes the given connection
	 * point. This result can then be passed to <getConnectionPoint>.
	 * 
	 * Parameters:
	 * 
	 * edge - <mxCellState> that represents the edge.
	 * terminal - <mxCellState> that represents the terminal.
	 * source - Boolean indicating if the terminal is the source or target.
	 */
   	function getConnectionConstraint($edge, $terminal, $source)
	{
		$point = null;
		$x = mxUtils::getValue($edge->style,
			($source) ? mxConstants::$STYLE_EXIT_X :
			mxConstants::$STYLE_ENTRY_X);

		if (isset($x))
		{
			$y = mxUtils::getValue($edge->style,
				(($source) ? mxConstants::$STYLE_EXIT_Y :
				mxConstants::$STYLE_ENTRY_Y));
			
			if (isset($y))
			{
				$point = new mxPoint($x, $y);
			}
		}
		
		$perimeter = false;
		
		if (isset($point))
		{
			$perimeter = mxUtils::getValue($edge->style, ($source) ?
				mxConstants::$STYLE_EXIT_PERIMETER :
				mxConstants::$STYLE_ENTRY_PERIMETER, true);
		}
		
		return new mxConnectionConstraint($point, $perimeter);
	}

	/**
	 * Function: getConnectionPoint
	 *
	 * Returns the nearest point in the list of absolute points or the center
	 * of the opposite terminal.
	 * 
	 * Parameters:
	 * 
	 * vertex - <mxCellState> that represents the vertex.
	 * constraint - <mxConnectionConstraint> that represents the connection point
	 * constraint as returned by <getConnectionConstraint>.
	 */
	function getConnectionPoint($vertex, $constraint)
	{
		$point = null;
		
		if (isset($vertex) && isset($constraint->point))
		{
			$point = new mxPoint($vertex->x + $constraint->point->x * $vertex->width,
					$vertex->y + $constraint->point->y * $vertex->height);
		}
		
		if (isset($point) && $constraint->perimeter)
		{
			$point = $this->view->getPerimeterPoint($vertex, $point, false);
		}
		
		return $point;
	}
    
	/**
	 * Function: findTreeRoots
	 * 
	 * Returns all children in the given parent which do not have incoming
	 * edges. If the result is empty then the with the greatest difference
	 * between incoming and outgoing edges is returned.
	 * 
	 * Parameters:
	 * 
	 * parent - <mxCell> whose children should be checked.
	 * isolate - Optional boolean that specifies if edges should be ignored if
	 * the opposite end is not a child of the given parent cell. Default is
	 * false.
	 * invert - Optional boolean that specifies if outgoing or incoming edges
	 * should be counted for a tree root. If false then outgoing edges will be
	 * counted. Default is false.
	 */
	function findTreeRoots($parent, $isolate = false, $invert = false)
	{
		$roots = array();
		
		if ($parent != null)
		{
			$model = $this->getModel();
			$childCount = $model->getChildCount($parent);
			$maxDiff = 0;
			
			for ($i=0; $i<$childCount; $i++)
			{
				$cell = $model->getChildAt($parent, $i);
				
				if ($this->model->isVertex($cell) &&
					$this->isCellVisible($cell))
				{
					$edgeCount = $model->getEdgeCount($cell);
					$fanOut = 0;
					$fanIn = 0;
					
					for ($j = 0; $j < $edgeCount; $j++)
					{
						$edge = $model->getEdgeAt($cell, $j);
						
						if ($this->isCellVisible($edge))
						{
							$source = $this->view->getVisibleTerminal($edge, true);
							$target = $this->view->getVisibleTerminal($edge, false);
							
							if ($source !== $target)
							{
                                if ($source === $cell && (!$isolate ||
                                	$this->model->getParent(target) == $parent))
                                {
                                    $fanOut++;
                                }
                                else if (!$isolate ||
                                	$this->model->getParent(source) == $parent)
                                {
                                    $fanIn++;
                                }
							}
						}
					}
					
					if (($invert && $fanOut == 0 && $fanIn > 0) ||
						(!$invert && $fanIn == 0 && $fanOut > 0))
					{
						array_push($roots, $cell);
					}
					
					$diff = ($invert) ? $fanIn - $fanOut : $fanOut - $fanIn;
					
					if ($diff > $maxDiff)
					{
						$maxDiff = $diff;
						$best = $cell;
					}
				}
			}
			
			if (sizeof($roots) == 0 && $best != null)
			{
				array_push($roots, $best);
			}
		}
		
		return $roots;
	}
	
	/**
	 * Function: createImage
	 */
	function createImage($clip = null, $background = null)
	{
		return mxGdCanvas::drawGraph($this, $clip, $background);
	}

	/**
	 * Function: drawGraph
	 * 
	 * Draws the given cell onto the specified canvas.
	 */
	function drawGraph($canvas)
	{
		$this->drawCell($canvas, $this->model->getRoot());
	}
	
	/**
	 * Function: paintCell
	 * 
	 * Draws the given cell onto the specified canvas.
	 */
	function drawCell($canvas, $cell)
	{
		$this->drawState($canvas, $this->view->getState($cell),
			$this->getLabel($cell));
		
		// Draws the children on top
		$childCount = $cell->getChildCount();
		
		for ($i = 0; $i < $childCount; $i++)
		{
			$child = $cell->getChildAt($i);
			$this->drawCell($canvas, $child);
		}
	}
	
	/**
	 * Function: paintState
	 * 
	 * Draws the given cell and label onto the specified canvas. No
	 * children or descendants are painted.
	 */
	function drawState($canvas, $state, $label)
	{
		$cell = (isset($state)) ? $state->cell : null;

		if ($cell != null && $cell !== $this->model->getRoot() &&
			($this->model->isVertex($cell) || $this->model->isEdge($cell)))
		{
			$canvas->drawCell($state);

			if ($label != null && $state->labelBounds != null)
			{
				$canvas->drawLabel($label, $state, false);
			}
		}
	}
	
	/**
	 * Function: graphModelChanged
	 * 
	 * Called when the graph model has changed.
	 */
	function graphModelChanged($event)
	{
	 	$this->view->revalidate();
	}

}
?>
