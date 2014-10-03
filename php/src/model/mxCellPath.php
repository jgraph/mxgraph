<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxCellPath
{

	/**
	 * Class: mxCellPath
	 * 
	 * Implements a mechanism for temporary cell Ids.
	 * 
	 * Variable: codecs
	 *
	 * Maps from constructor names to codecs.
	 */
	public static $PATH_SEPARATOR = ".";

	/**
	 * Function: create
	 * 
	 * Creates the cell path for the given cell. The cell path is a
	 * concatenation of the indices of all ancestors on the (finite) path to
	 * the root, eg. "0.0.0.1".
	 * 
	 * Parameters:
	 * 
	 * cell - Cell whose path should be returned.
	 */
	static function create($cell)
	{
		$result = "";
		$parent = $cell->getParent();

		while ($parent != null)
		{
			$index = $parent->getIndex($cell);
			$result = $index . mxCellPath::$PATH_SEPARATOR . $result;
			
			$cell = $parent;
			$parent = $cell->getParent();
		}
		
		return (strlen($result) > 1) ?
			substr($result, 0, strlen($result) - 1) : "";
	}

	/**
	 * Function: getParentPath
	 * 
	 * Returns the cell for the specified cell path using the given root as the
	 * root of the path.
	 * 
	 * Parameters:
	 * 
	 * path - Path whose parent path should be returned.
	 */
	static function getParentPath($path)
	{
		if ($path != null && strlen($path) > 0)
		{
			$index = strrpos($path, mxCellPath::$PATH_SEPARATOR);
			
			if ($index === false)
			{
				return "";
			}
			else
			{
				return substr($path, 0, $index);
			}
		}
		
		return null;
	}

	/**
	 * Function: resolve
	 * 
	 * Returns the cell for the specified cell path using the given root as the
	 * root of the path.
	 * 
	 * Parameters:
	 * 
	 * root - Root cell of the path to be resolved.
	 * path - String that defines the path.
	 */
	static function resolve($root, $path)
	{
		$parent = $root;
		$tokens = explode(mxCellPath::$PATH_SEPARATOR, $path);
		
		for ($i=0; $i<sizeof($tokens); $i++)
		{
			$parent = $parent->getChildAt($tokens[$i]);
		}
		
		return $parent;
	}

}
?>
