using System;
using System.Collections.Generic;

namespace com.mxgraph
{
    public class mxStencilRegistry
    {

        protected static Dictionary<string, mxStencil> stencils = new Dictionary<string, mxStencil>();

        /// <summary>
        /// Adds the given stencil.
        /// </summary>
        /// <param name="name"></param>
        /// <param name="stencil"></param>
        public static void AddStencil(string name, mxStencil stencil)
        {
            stencils[name] = stencil;
        }

        /// <summary>
        /// Returns the stencil for the given name.
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static mxStencil GetStencil(string name)
        {
            if (stencils.ContainsKey(name))
            {
                return stencils[name];
            }

            return null;
        }

    }
}
