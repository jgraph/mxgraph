// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections.Generic;
using System.Text;

namespace com.mxgraph
{
    /// <summary>
    /// Implements a mechanism for temporary cell Ids.
    /// </summary>
    public class mxCellPath
    {

        /// <summary>
        /// Defines the separator between the path components. Default is ".".
        /// </summary>
        public static char PATH_SEPARATOR = '.';

        /// <summary>
        /// Creates the cell path for the given cell. The cell path is a
        /// concatenation of the indices of all cells on the (finite) path to
        /// the root, eg. "0.0.0.1".
        /// </summary>
        /// <param name="cell">Cell whose path should be returned.</param>
        /// <returns>Returns the string that represents the path.</returns>
        public static string Create(mxICell cell)
        {
            string result = "";
            mxICell parent = cell.Parent;

            while (parent != null)
            {
                int index = parent.GetIndex(cell);
                result = index.ToString() + mxCellPath.PATH_SEPARATOR + result;

                cell = parent;
                parent = cell.Parent;
            }

            return (result.Length > 1) ? result.Substring(0, result.Length - 1)
                    : "";
        }

        /// <summary>
        /// Returns the path for the parent of the cell represented by the given
        /// path. Returns null if the given path has no parent.
        /// </summary>
        /// <param name="path">Path whose parent path should be returned.</param>
        public static string GetParentPath(string path)
        {
            if (path != null)
            {
                int index = path.LastIndexOf(mxCellPath.PATH_SEPARATOR);

                if (index >= 0)
                {
                    return path.Substring(0, index);
                }
                else if (path.Length > 0)
                {
                    return "";
                }
            }

            return null;
        }

        /// <summary>
        /// Returns the cell for the specified cell path using the given root as the
        /// root of the path.
        /// </summary>
        /// <param name="root">Root cell of the path to be resolved.</param>
        /// <param name="path">String that defines the path.</param>
        /// <returns>Returns the cell that is defined by the path.</returns>
        public static mxICell Resolve(mxICell root, string path)
        {
            mxICell parent = root;
            string[] tokens = path.Split(PATH_SEPARATOR);

            for (int i = 0; i < tokens.Length; i++)
            {
                parent = parent.GetChildAt(int.Parse(tokens[i]));
            }

            return parent;
        }

    }

}
