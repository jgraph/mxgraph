// Copyright (c) 2007-2008, Gaudenz Alder
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace com.mxgraph
{
    /// <summary>
    /// Maps from keys to base64 encoded images or file locations. All values must
    /// be URLs or use the format data:image/format followed by a comma and the base64
    /// encoded image data, eg. "data:image/gif,XYZ", where XYZ is the base64 encoded
    /// image data.
    /// 
    /// To add a new image bundle to an existing graph, the following code is used:
    /// 
    /// mxImageBundle bundle = new mxImageBundle();
    /// bundle.PutImage("myImage", "data:image/gif,R0lGODlhEAAQAMIGAAAAAICAAICAgP" +
    ///   "//AOzp2O3r2////////yH+FUNyZWF0ZWQgd2l0aCBUaGUgR0lNUAAh+QQBCgAHACwAAAAA" +
    ///   "EAAQAAADTXi63AowynnAMDfjPUDlnAAJhmeBFxAEloliKltWmiYCQvfVr6lBPB1ggxN1hi" +
    ///   "laSSASFQpIV5HJBDyHpqK2ejVRm2AAgZCdmCGO9CIBADs=");
    /// graph.AddImageBundle(bundle);
    /// 
    /// The image can then be referenced in any cell style using image=myImage.
    /// 
    /// To convert a given Image to a base64 encoded String, the following
    /// code can be used:
    ///
    /// MemoryStream ms = new System.IO.MemoryStream();
    /// image.Save(ms, System.Drawing.Imaging.ImageFormat.Gif);
    /// byte[] data = ms.ToArray();
    /// Console.WriteLine("base64="+Convert.ToBase64String(data));
    /// 
    /// The value is decoded in mxUtils.LoadImage. The keys for images are
    /// resolved and the short format above is converted to a data URI in
    /// mxGraph.postProcessCellStyle.
    /// </summary>
    public class mxImageBundle
    {

        /// <summary>
        /// Maps from keys to images.
        /// </summary>
        protected Dictionary<String, String> images = new Dictionary<String, String>();

        /// <summary>
        /// Returns the images.
        /// </summary>
        public Dictionary<String, String> Images
        {
            get { return images; }
        }

        /// <summary>
        /// Adds the specified entry to the map.
        /// </summary>
        public void PutImage(String key, String value)
        {
            images[key] = value;
        }

        /// <summary>
        /// Returns the value for the given key.
        /// </summary>
        public String GetImage(String key)
        {
            if (images.ContainsKey(key))
            {
                return images[key];
            }

            return null;
        }

    }

}
