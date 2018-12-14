<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxGraphModel extends mxEventSource
{
	
	/**
	 * Class: mxGraphModel
	 * 
	 * Cells are the elements of the graph model. They represent the state
	 * of the groups, vertices and edges in a graph.
	 *
	 * Fires a graphModelChanged event after each group of changes.
	 * 
	 * Variable: root
	 * 
	 * Holds the root cell, which in turn contains the cells that represent the
	 * layers of the diagram as child cells. That is, the actual elements of the
	 * diagram are supposed to live in the third generation of cells and below.
	 */
	var $root;
		
	/**
	 * Variable: cells
	 * 
	 * Maps from Ids to cells.
	 */
	var $cells;
	
	/**
	 * Variable: maintainEdgeParent
	 * 
	 * Specifies if edges should automatically be moved into the nearest common
	 * ancestor of their terminals. Default is true.
	 */
	var $maintainEdgeParent = true;

	/**
	 * Variable: createIds
	 * 
	 * Specifies if the model should automatically create Ids for new cells.
	 * Default is true.
	 */
	var $createIds = true;
	
	/**
	 * Variable: nextId
	 * 
	 * Specifies the next Id to be created. Default is 0.
	 */
	var $nextId = 0;

	/**
	 * Variable: updateLevel
	 * 
	 * Counter for the depth of nested transactions. Each call to <beginUpdate>
	 * will increment this number and each call to <endUpdate> will decrement
	 * it. When the counter reaches 0, the transaction is closed and the
	 * respective events are fired. Initial value is 0.
	 */
	var $updateLevel = 0;

	/**
	 * Constructor: mxGraphModel
	 *
	 * Constructs a new graph model using the specified root cell.
	 */
	function mxGraphModel($root = null)
	{
	 	if (isset($root))
	 	{
			$this->setRoot($root);
	 	}
	 	else
	 	{
	 		$this->clear();
	 	}
	}
		
	/**
	 * Function: clear
	 *
	 * Sets a new root using <createRoot>.
	 */
	function clear()
	{
		$this->setRoot($this->createRoot());
	}

	/**
	 * Function: createRoot
	 *
	 * Creates a new root cell with a default layer (child 0).
	 */
	function createRoot()
	{
		$root = new mxCell();
		$root->insert(new mxCell());
			
		return $root;
	}
	
	/**
	 * Function: getCells
	 * 
	 * Returns the internal lookup table that is used to map from Ids to cells.
	 */
	function getCells()
	{
	 	return $this->cells;
	}

	/**
	 * Function: setRoot
	 *
	 */
	function getCell($id)
	{
		$result = null;

		if ($this->cells != null)
		{
			$result = mxUtils::getValue($this->cells, $id);
		}

		return $result;
	}
	
	/**
	 * Function: getRoot
	 * 
	 * Returns the root of the model.
	 */
	function getRoot()
	{
	 	return $this->root;
	}
	
	/**
	 * Function: setRoot
	 * 
	 * Sets the <root> of the model using <mxRootChange> and adds the change to
	 * the current transaction. This resets all datastructures in the model and
	 * is the preferred way of clearing an existing model. Returns the new
	 * root.
	 *
	 * Parameters:
	 * 
	 * root - <mxCell> that specifies the new root.
	 */
	function setRoot($root)
	{
		$oldRoot = $this->root;
		
	 	$this->beginUpdate();
	 	try
	 	{
			$this->root = $root;
			$this->nextId = 0;
			$this->cells = null;
			
			$this->cellAdded($root);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
		
		return $oldRoot;
	}

	//
	// Cell Cloning
	//

	/**
	 * Function: cloneCell
	 * 
	 * Returns a deep clone of the given <mxCell> (including
	 * the children) which is created using <cloneCells>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> to be cloned.
	 */
	function cloneCell($cell)
	{
		$clones = $this->cloneCells(array($cell), true);
		
		return $clones[0];
	}

	/**
	 * Function: cloneCells
	 * 
	 * Returns an array of clones for the given array of <mxCells>.
	 * Depending on the value of includeChildren, a deep clone is created for
	 * each cell. Connections are restored based if the corresponding
	 * cell is contained in the passed in array.
	 *
	 * Parameters:
	 * 
	 * cells - Array of <mxCell> to be cloned.
	 * includeChildren - Boolean indicating if the cells should be cloned
	 * with all descendants.
	 */
	function cloneCells($cells, $includeChildren=true)
	{
		$mapping = array();
		$clones = array();
		
		for ($i=0; $i<sizeof($cells); $i++)
		{
			$cell = $cells[$i];
			$clne = $this->cloneCellImpl($cell, $mapping, $includeChildren);
			array_push($clones, $clne);
		}
		
		for ($i=0; $i<sizeof($clones); $i++)
		{
			$this->restoreClone($clones[$i], $cells[$i], $mapping);
		}
		
		return $clones;
	}
				
	/**
	 * Function: cloneCellImpl
	 * 
	 * Inner helper method for cloning cells recursively.
	 */
	function cloneCellImpl($cell, $mapping, $includeChildren)
	{
		$ident = mxCellPath::create($cell);
		$clne = $mapping[$ident];
		
		if ($clne == null)
		{
			$clne = $this->cellCloned($cell);
			$mapping[$ident] = $clne;	
		
			if ($includeChildren)
			{
				$childCount = $this->getChildCount($cell);
	
				for ($i = 0; $i < $childCount; $i++)
				{
					$child = $this->getChildAt($cell, $i);
					$cloneChild = $this->cloneCellImpl($child, $mapping, true);
					$clne->insert($cloneChild);
				}
			}
		}
		
		return $clne;
	}

	/**
	 * Function: cellCloned
	 * 
	 * Hook for cloning the cell. This returns cell->copy() or
	 * any possible exceptions.
	 */
	function cellCloned($cell)
	{
		return $cell->copy();
	}
	
	/**
	 * Function: restoreClone
	 * 
	 * Inner helper method for restoring the connections in
	 * a network of cloned cells.
	 */
	function restoreClone($clne, $cell, $mapping)
	{
		$source = $this->getTerminal($cell, true);
		
		if ($source != null)
		{
			$tmp = $mapping[mxCellPath::create($source)];
			
			if ($tmp != null)
			{
				$tmp->insertEdge($clne, true);
			}
		}
		
		$target = $this->getTerminal($cell, false);
		
		if ($target != null)
		{
			$tmp = $mapping[mxCellPath::create($target)];
			
			if ($tmp != null)
			{
				$tmp->insertEdge($clne, false);
			}
		}
		
		$childCount = $this->getChildCount($clne);
		
		for ($i = 0; $i < $childCount; $i++)
		{
			$this->restoreClone($this->getChildAt($clne, $i),
				$this->getChildAt($cell, $i), $mapping);
		}
	}
	
	/**
	 * Function: isAncestor
	 * 
	 * Returns true if the given parent is an ancestor of the given child.
	 *
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent.
	 * child - <mxCell> that specifies the child.
	 */
	function isAncestor($parent, $child)
	{
		while ($child != null && $child != $parent)
		{
			$child = $this->getParent($child);
		}

		return $child === $parent;
	}

	/**
	 * Function: contains
	 * 
	 * Returns true if the model contains the given <mxCell>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that specifies the cell.
	 */
	function contains($cell)
	{
		return $this->isAncestor($this->root, $cell);
	}
	
	/**
	 * Function: getParent
	 * 
	 * Returns the parent of the given cell.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose parent should be returned.
	 */
	function getParent($cell)
	{
		if ($cell != null)
		{
			return $cell->getParent();
		}
		
		return null;
	}

	/**
	 * Function: add
	 * 
	 * Adds the specified child to the parent at the given index using
	 * <mxChildChange> and adds the change to the current transaction. If no
	 * index is specified then the child is appended to the parent's array of
	 * children. Returns the inserted child.
	 * 
	 * Parameters:
	 * 
	 * parent - <mxCell> that specifies the parent to contain the child.
	 * child - <mxCell> that specifies the child to be inserted.
	 * index - Optional integer that specifies the index of the child.
	 */
	function add($parent, $child, $index = null)
	{
		if ($child !== $parent && $child != null && $parent != null)
		{
			$parentChanged = $parent !== $this->getParent($child);
			
		 	$this->beginUpdate();
		 	try
		 	{
				$parent->insert($child, $index);
				$this->cellAdded($child);
			}
			catch (Exception $e)
			{
				$this->endUpdate();
				throw($e);
			}
			$this->endUpdate();
			
			if ($parentChanged && $this->maintainEdgeParent)
			{
				$this->updateEdgeParents($child);
			}
		}
		
		return $child;
	}

	/**
	 * Function: cellAdded
	 * 
	 * Inner callback to update <cells> when a cell has been added. This
	 * implementation resolves collisions by creating new Ids.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that specifies the cell that has been added.
	 */
	function cellAdded($cell)
	{
	 	if ($cell->getId() == null && $this->createIds)
	 	{
	 		$cell->setId($this->createId($cell));
	 	}
	 	
	 	if ($cell->getId() != null)
	 	{
	 		$collision = $this->getCell($cell->getId());
	 		
	 		if ($collision != $cell)
	 		{
	 			while ($collision != null)
	 			{
	 				$cell->setId($this->createId($cell));
	 				$collision = $this->getCell($cell->getId());
	 			}
	 			
	 			if ($this->cells == null)
	 			{
	 				$this->cells = array();
	 			}
	 			
	 			$this->cells[$cell->getId()] = $cell;
	 		}
	 	}

		// Makes sure IDs of deleted cells are not reused
		if (is_numeric($cell->getId()))
		{
			$this->nextId = max($this->nextId, $cell->getId() + 1);
		}
		
		$childCount = $this->getChildCount($cell);
		
		for ($i = 0; $i < $childCount; $i++)
		{
			$this->cellAdded($this->getChildAt($cell, $i));
		}
	}
			
	/**
	 * Function: createId
	 * 
	 * Hook method to create an Id for the specified cell. This
	 * implementation increments <nextId>.
	 *
	 * Parameters:
	 *
	 * cell - <mxCell> to create the Id for.
	 */
	function createId($cell)
	{
		$id = $this->nextId;
		$this->nextId++;
		
		return $id;
	}

	/**
	 * Function: updateEdgeParents
	 * 
	 * Updates the parent for all edges that are connected to cell or one of
	 * its descendants using <updateEdgeParent>.
	 */
	function updateEdgeParents($cell, $root = null)
	{
		// Gets the topmost node of the hierarchy
		$root = $root || $this->getRoot();
		
		// Updates edges on children first
		$childCount = $this->getChildCount($cell);
		
		for ($i = 0; $i < $childCount; $i++)
		{
			$child = $this->getChildAt($cell, $i);
			$this->updateEdgeParents($child, $root);
		}
		
		// Updates the parents of all connected edges
		$edgeCount = $this->getEdgeCount($cell);
		$edges = array();
		
		for ($i = 0; $i < $edgeCount; $i++)
		{
			array_push($edges, $this->getEdgeAt($cell, $i));
		}
		
		foreach ($edges as $edge)
		{
			// Updates edge parent if edge and child have
			// a common root node (does not need to be the
			// model root node)
			if ($this->isAncestor($root, $edge))
			{
				$this->updateEdgeParent($edge, $root);
			}
		}
	}
	
	/**
	 * Function: updateEdgeParent
	 *
	 * Inner callback to update the parent of the specified <mxCell> to the
	 * nearest-common-ancestor of its two terminals.
	 *
	 * Parameters:
	 * 
	 * edge - <mxCell> that specifies the edge.
	 * root - <mxCell> that represents the current root of the model.
	 */
	function updateEdgeParent($edge, $root)
	{
		$source = $this->getTerminal($edge, true);
		$target = $this->getTerminal($edge, false);
		$cell = null;
		
		// Uses the first non-relative descendants of the source terminal
		while ($source != null && !$this->isEdge($source) &&
			$source->geometry != null && $source->geometry->relative)
		{
			$source = $this->getParent($source);
		}
		
		// Uses the first non-relative descendants of the target terminal
		while ($target != null && !$this->isEdge($target) &&
			$target->geometry != null && $target->geometry->relative)
		{
			$target = $this->getParent($target);
		}
		
		if ($this->isAncestor($root, $source) &&
			$this->isAncestor($root, $target))
		{
			if ($source === $target)
			{
				$cell = $this->getParent($source);
			}
			else
			{
				$cell = $this->getNearestCommonAncestor($source, $target);
			}
			
			if ($cell != null &&
				$this->getParent($cell) !== $this->root &&
				$this->getParent($edge) !== $cell)
			{
				$geo = $this->getGeometry($edge);
				
				if ($geo != null)
				{
					$origin1 = $this->getOrigin($this->getParent($edge));
					$origin2 = $this->getOrigin($cell);
					
					$dx = $origin2->x - $origin1->x;
					$dy = $origin2->y - $origin1->y;
					
					$geo = $geo->copy();
					$geo->translate(-$dx, -$dy);
					$this->setGeometry($edge, $geo);
				}
				
				$this->add($cell, $edge, $this->getChildCount($cell));
			}
		}
	}

	/**
	 * Function: getOrigin
	 * 
	 * Returns the absolute, cummulated origin for the children inside the
	 * given parent as an <mxPoint>.
	 */
	function getOrigin($cell)
	{
		$result = null;
		
		if ($cell != null)
		{
			$result = $this->getOrigin($this->getParent($cell));
			
			if (!$this->isEdge($cell))
			{
				$geo = $this->getGeometry($cell);
				
				if ($geo != null)
				{
					$result->x += $geo->x;
					$result->y += $geo->y;
				}
			}
		}
		else
		{
			$result = new mxPoint();
		}
		
		return $result;
	}
	
	/**
	 * Function: getNearestCommonAncestor
	 * 
	 * Returns the nearest common ancestor for the specified cells.
	 *
	 * Parameters:
	 * 
	 * cell1 - <mxCell> that specifies the first cell in the tree.
	 * cell2 - <mxCell> that specifies the second cell in the tree.
	 */
	function getNearestCommonAncestor($cell1, $cell2)
	{
		if ($cell1 != null && $cell2 != null)
		{		
			// Creates the cell path for the second cell
			$path = mxCellPath::create($cell2);
			
			if (isset($path) && strlen($path) > 0)
			{
				// Bubbles through the ancestors of the target
				// cell to find the nearest common ancestor.
				$cell = $cell1;
				$current = mxCellPath::create($cell);
				
				while ($cell != null)
				{
					$parent = $this->getParent($cell);

					// Checks if the cell path is equal to the beginning
					// of the given cell path
					if (strpos($path, $current.mxCellPath::$PATH_SEPARATOR) === 0 &&
						$parent != null)
					{
						return $cell;
					}
					
					$current = mxCellPath::getParentPath($current);
					$cell = $parent;
				}
			}
		}
		
		return null;
	}

	/**
	 * Function: remove
	 * 
	 * Removes the specified cell from the model using <mxChildChange> and adds
	 * the change to the current transaction. This operation will remove the
	 * cell and all of its children from the model. Returns the removed cell.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that should be removed.
	 */
	function remove($cell)
	{
	 	$this->beginUpdate();
	 	try
	 	{
			if ($cell === $this->root)
			{
				$this->setRoot(null);
			}
			else
			{
				$cell->removeFromParent();
            }
            
            $this->cellRemoved($cell);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();

		return $cell;
	}

	/**
	 * Function: cellRemoved
	 * 
	 * Inner callback to update <cells> when a cell has been removed.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that specifies the cell that has been removed.
	 */
	function cellRemoved($cell)
	{
		if ($cell != null)
		{
			$childCount = $this->getChildCount($cell);
			
			for ($i = 0; $i < $childCount; $i++)
			{
				$this->cellRemoved($this->getChildAt($cell, $i));
			}
			
			$cell->removeFromTerminal(true);
			$cell->removeFromTerminal(false);

			if ($this->cells != null && $cell->getId() != null)
			{
				$this->cells[$cell->getId()] = null;
			}
		}
	}

	/**
	 * Function: getChildCount
	 *
	 * Returns the number of children in the given cell.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose number of children should be returned.
	 */
	function getChildCount($cell)
	{
	 	return ($cell != null) ? $cell->getChildCount() : 0;
	}
	
	/**
	 * Function: getChildAt
	 *
	 * Returns the child of the given <mxCell> at the given index.
	 * 
	 * Parameters:
	 * 
	 * cell - <mxCell> that represents the parent.
	 * index - Integer that specifies the index of the child to be returned.
	 */
	function getChildAt($cell, $index)
	{
		if ($cell != null)
		{
			return $cell->getChildAt($index);
		}
		
		return null;
	}

	/**
	 * Function: getTerminal
	 * 
	 * Returns the source or target <mxCell> of the given edge depending on the
	 * value of the boolean parameter.
	 *
	 * Parameters:
	 * 
	 * edge - <mxCell> that specifies the edge.
	 * cource - Boolean indicating which end of the edge should be returned.
	 */
	function getTerminal($edge, $cource)
	{
		if ($edge != null)
		{
			return $edge->getTerminal($cource);
		}
		
	 	return null;
	}
	
	/**
	 * Function: setTerminal
	 * 
	 * Sets the source or target terminal of the given <mxCell> using
	 * <mxTerminalChange> and adds the change to the current transaction.
	 * This implementation updates the parent of the edge using <updateEdgeParent>
	 * if required.
	 *
	 * Parameters:
	 * 
	 * edge - <mxCell> that specifies the edge.
	 * terminal - <mxCell> that specifies the new terminal.
	 * isSource - Boolean indicating if the terminal is the new source or
	 * target terminal of the edge.
	 */
	function setTerminal($edge, $terminal, $source)
	{
		$previous = $edge->getTerminal($source);
		
		$this->beginUpdate();
		try
		{
			if ($terminal != null)
			{
				$terminal->insertEdge($edge, $source);
			}
			else if ($previous != null)
			{
				$previous->removeEdge($edge, $source);
			}
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();

        if ($this->maintainEdgeParent)
        {
			$this->updateEdgeParent($edge, $this->getRoot());
        }

		return $terminal;
	}
	
	/**
	 * Function: setTerminals
	 * 
	 * Sets the source and target <mxCell> of the given <mxCell> in a single
	 * transaction using <setTerminal> for each end of the edge.
	 *
	 * Parameters:
	 * 
	 * edge - <mxCell> that specifies the edge.
	 * source - <mxCell> that specifies the new source terminal.
	 * target - <mxCell> that specifies the new target terminal.
	 */
	function setTerminals($edge, $source, $target)
	{
		$this->beginUpdate();
		try
		{
			$this->setTerminal($edge, $source, true);
			$this->setTerminal($edge, $target, false);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	}
	
	/**
	 * Function: getEdgeCount
	 * 
	 * Returns the number of distinct edges connected to the given cell.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that represents the vertex.
	 */
	function getEdgeCount($cell)
	{
	 	return ($cell != null) ? $cell->getEdgeCount() : 0;
	}
	
	/**
	 * Function: getEdgeAt
	 * 
	 * Returns the edge of cell at the given index.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that specifies the vertex.
	 * index - Integer that specifies the index of the edge
	 * to return.
	 */
	function getEdgeAt($cell, $index)
	{
	 	return ($cell != null) ? $cell->getEdgeAt($index) : null;
	}

	/**
	 * Function: getEdges
	 * 
	 * Returns all distinct edges connected to this cell as an array of
	 * <mxCells>. The return value should be only be read.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that specifies the cell.
	 */
	function getEdges($cell)
	{
		return ($cell != null) ? $cell->edges : null;
	}
	
	/**
	 * Function: isVertex
	 * 
	 * Returns true if the given cell is a vertex.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that represents the possible vertex.
	 */
	function isVertex($cell)
	{
	 	return ($cell != null) ? $cell->isVertex() : null;
	}

	/**
	 * Function: isEdge
	 * 
	 * Returns true if the given cell is an edge.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> that represents the possible edge.
	 */
	function isEdge($cell)
	{
	 	return ($cell != null) ? $cell->isEdge() : null;
	}

	/**
	 * Function: isConnectable
	 * 
	 * Returns true if the given <mxCell> is connectable. If <edgesConnectable>
	 * is false, then this function returns false for all edges else it returns
	 * the return value of <mxCell.isConnectable>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose connectable state should be returned.
	 */
	function isConnectable($cell)
	{
	 	return ($cell != null) ? $cell->isConnectable() : false;
	}

	/**
	 * Function: getValue
	 * 
	 * Returns the user object of the given <mxCell> using <mxCell.getValue>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose user object should be returned.
	 */
	function getValue($cell)
	{
	 	return ($cell != null) ? $cell->getValue() : null;
	}
	
	/**
	 * Function: setValue
	 * 
	 * Sets the user object of then given <mxCell> using <mxValueChange>
	 * and adds the change to the current transaction.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose user object should be changed.
	 * value - Object that defines the new user object.
	 */
	function setValue($cell, $value)
	{
	 	$this->beginUpdate();
	 	try
	 	{
		 	$cell->setValue($value);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	 	
	 	return $value;
	}

	/**
	 * Function: getGeometry
	 * 
	 * Returns the <mxGeometry> of the given <mxCell>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose geometry should be returned.
	 */
	function getGeometry($cell)
	{
		if ($cell != null)
		{
			return $cell->getGeometry();
		}
		
		return null;
	}

	/**
	 * Function: setGeometry
	 * 
	 * Sets the <mxGeometry> of the given <mxCell>. The actual update
	 * of the cell is carried out in <geometryForCellChanged>. The
	 * <mxGeometryChange> action is used to encapsulate the change.
	 * 
	 * Parameters:
	 * 
	 * cell - <mxCell> whose geometry should be changed.
	 * geometry - <mxGeometry> that defines the new geometry.
	 */
	function setGeometry($cell, $geometry)
	{
		$this->beginUpdate();
		try
		{	
		 	$cell->setGeometry($geometry);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	 	
	 	return $geometry;
	}

	/**
	 * Function: getStyle
	 * 
	 * Returns the style of the given <mxCell>.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose style should be returned.
	 */
	function getStyle($cell)
	{
	 	return ($cell != null) ? $cell->getStyle() : null;
	}

	/**
	 * Function: setStyle
	 * 
	 * Sets the style of the given <mxCell> using <mxStyleChange> and
	 * adds the change to the current transaction.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose style should be changed.
	 * style - String of the form stylename[;key=value] to specify
	 * the new cell style.
	 */
	function setStyle($cell, $style)
	{
 		$this->beginUpdate();
 		try
 		{
		 	$cell->setStyle($style);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	 	
	 	return $style;
	}
	
	/**
	 * Function: isCollapsed
	 * 
	 * Returns true if the given <mxCell> is collapsed.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose collapsed state should be returned.
	 */
	function isCollapsed($cell)
	{
	 	return ($cell != null) ? $cell->isCollapsed() : false;
	}
	
	/**
	 * Function: setCollapsed
	 * 
	 * Sets the collapsed state of the given <mxCell> using <mxCollapseChange>
	 * and adds the change to the current transaction.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose collapsed state should be changed.
	 * collapsed - Boolean that specifies the new collpased state.
	 */
	function setCollapsed($cell, $isCollapsed)
	{
	 	$this->beginUpdate();
	 	try
	 	{
		 	$cell->setCollapsed($isCollapsed);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	 	
	 	return $isCollapsed;
	}

	/**
	 * Function: isVisible
	 * 
	 * Returns true if the given <mxCell> is visible.
	 * 
	 * Parameters:
	 * 
	 * cell - <mxCell> whose visible state should be returned.
	 */
	function isVisible($cell)
	{
	 	return ($cell != null) ? $cell->isVisible() : false;
	}

	/**
	 * Function: setVisible
	 * 
	 * Sets the visible state of the given <mxCell> using <mxVisibleChange> and
	 * adds the change to the current transaction.
	 *
	 * Parameters:
	 * 
	 * cell - <mxCell> whose visible state should be changed.
	 * visible - Boolean that specifies the new visible state.
	 */
	function setVisible($cell, $visible)
	{
	 	$this->beginUpdate();
	 	try
	 	{
		 	$cell->setVisible($visible);
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	 	
	 	return $isVisible;
	}

	/**
	 * Function: mergeChildren
	 * 
	 * Merges the children of the given cell into the given target cell inside
	 * this model. All cells are cloned unless there is a corresponding cell in
	 * the model with the same id, in which case the source cell is ignored and
	 * all edges are connected to the corresponding cell in this model. Edges
	 * are considered to have no identity and are always cloned unless the
	 * cloneAllEdges flag is set to false, in which case edges with the same
	 * id in the target model are reconnected to reflect the terminals of the
	 * source edges.
	 */
	function mergeChildren($from, $to, $cloneAllEdges = true)
	{
		$this->beginUpdate();
		try
		{
			$mapping = array();
			$this->mergeChildrenImpl($from, $to, $cloneAllEdges, $mapping);
			
			// Post-processes all edges in the mapping and
			// reconnects the terminals to the corresponding
			// cells in the target model
			foreach ($mapping as $key => $cell)
			{
				$terminal = $this->getTerminal($cell, $true);
				
				if (isset($terminal))
				{
					$terminal = $mapping[mxCellPath::create($terminal)];
					$this->setTerminal($cell, $terminal, $true);
				}
				
				$terminal = $this->getTerminal(cell, false);
				
				if (isset($terminal))
				{
					$terminal = $mapping[mxCellPath::create($terminal)];
					$this->setTerminal($cell, $terminal, false);
				}
			}
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	}

	/**
	 * Function: mergeChildrenImpl
	 * 
	 * Clones the children of the source cell into the given target cell in
	 * this model and adds an entry to the mapping that maps from the source
	 * cell to the target cell with the same id or the clone of the source cell
	 * that was inserted into this model.
	 */
	function mergeChildrenImpl($from, $to, $cloneAllEdges, $mapping)
	{
		$this->beginUpdate();
		try
		{
			$childCount = $from->getChildCount();
			
			for ($i = 0; $i < $childCount; $i++)
			{
				$cell = $from->getChildAt($i);
				$id = $cell->getId();
				$target = (isset($d) && (!$this->isEdge($cell) || !$cloneAllEdges)) ?
						$this->getCell($id) : null;
				
				// Clones and adds the child if no cell exists for the id
				if (!isset($target))
				{
					$clone = $cell->clone();
					$clone->setId($id);
					
					// Sets the terminals from the original cell to the clone
					// because the lookup uses strings not cells in PHP
					$clone->setTerminal($cell->getTerminal(true), true);
					$clone->setTerminal($cell->getTerminal(false), false);
											
					// Do *NOT* use model.add as this will move the edge away
					// from the parent in updateEdgeParent if maintainEdgeParent
					// is enabled in the target model
					$target = $to->insert($clone);
					$this->cellAdded($target);
				}
				
				// Stores the mapping for later reconnecting edges
				$mapping[mxCellPath::create($cell)] = $target;
				
				// Recurses
				$this->mergeChildrenImpl($cell, $target, $cloneAllEdges, $mapping);
			}
		}
		catch (Exception $e)
		{
			$this->endUpdate();
			throw($e);
		}
		$this->endUpdate();
	}

	/**
	 * Function: beginUpdate
	 * 
	 * Increments the <updateLevel> by one. The event notification
	 * is queued until <updateLevel> reaches 0 by use of
	 * <endUpdate>.
	 */
	function beginUpdate()
	{
		$this->updateLevel++;
	}

	/**
	 * Function: endUpdate
	 * 
	 * Decrements the <updateLevel> by one and fires a notification event if
	 * the <updateLevel> reaches 0. This function indirectly fires a
	 * notification.
	 */
	function endUpdate()
	{
		$this->updateLevel--;

		if ($this->updateLevel == 0)
		{
			$this->fireEvent(new mxEventObject(mxEvent::$GRAPH_MODEL_CHANGED));
		}
	}

	/**
	 * Function: getDirectedEdgeCount
	 * 
	 * Returns the number of incoming or outgoing edges, ignoring the given
	 * edge.
	 * 
	 * Parameters:
	 * 
	 * cell - <mxCell> whose edge count should be returned.
	 * outgoing - Boolean that specifies if the number of outgoing or
	 * incoming edges should be returned.
	 * ignoredEdge - <mxCell> that represents an edge to be ignored.
	 */
	function getDirectedEdgeCount($cell, $outgoing, $ignoredEdge = null)
	{
		$count = 0;
		$edgeCount = $this->getEdgeCount($cell);

		for ($i = 0; $i < $edgeCount; $i++)
		{
			$edge = $this->getEdgeAt($cell, $i);
			
			if ($edge !== $ignoredEdge &&
				$this->getTerminal($edge, $outgoing) === $cell)
			{
				$count++;
			}
		}
		
		return $count;
	}

}

?>
