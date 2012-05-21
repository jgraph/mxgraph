package com.mxgraph.examples.web;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.util.Date;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mxgraph.util.mxBase64;
import com.mxgraph.util.mxUtils;

/**
 *
 */
public class EmbedImage extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4951624126588618796L;

	/**
	 * 
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		OutputStream out = response.getOutputStream();
		String encoding = request.getHeader("Accept-Encoding");

		// Supports GZIP content encoding
		if (encoding != null && encoding.indexOf("gzip") >= 0)
		{
			response.setHeader("Content-Encoding", "gzip");
			out = new GZIPOutputStream(out);
		}

		PrintWriter writer = new PrintWriter(out);
		writer.println("<html>");
		writer.println("<head>");
		writer.println("</head>");
		writer.println("<body>");
		writer.println("<script type=\"text/javascript\">");

		// Shows an error message on the client-side if the file is larger than
		// 32 KB, which is the maximum size foe data URIs in IE8.
		// LATER: Define correct size so that image can have max of 32K
		if (request.getContentLength() < 40000)
		{
			Map<String, String> post = parseMultipartRequest(request);
			byte[] img = post.get("upfile").getBytes(ENCODING);
			String data = mxBase64.encodeToString(img, false);
			String name = post.get("filename");
			int index = name.lastIndexOf('\\');

			if (index >= 0)
			{
				name = name.substring(index + 1);
			}

			name += "-" + new Date().getTime();
			String url = "null";

			if (post.get("dataurl").equals("false"))
			{
				url = "'mhtml:'+window.location.href+'?img=" + name + "!" + name + "'";

				// In theory, up to 4K in 300 cookies can be used to transfer the data
				// directly in the GET request of the image to avoid a session state.
				// This can be done by splitting the base64 data into 4K cookies in the
				// insert method in the client and then forcing an image prefetch with
				// the respective MHTML URL for the image. On the server-side all we
				// we need to do is fetch the content location (get param) and data.
				// In practice most servers have a header size limit of 8-16K.
				// LATER: Use cookieless sessions
				request.getSession(true).setAttribute("image",
						"<!--\n" + mhtml(name, data) + "-->");
			}

			writer.println("window.parent.insert(\"" + name
					+ "\", \"data:image/png," + data + "\", " + url + ");");
		}
		else
		{
			writer.println("alert(\"File exceeds the maximum allowed size. File must be less than 32KB.\");");
		}

		// NOTE: Ignore "Failed to load resource" error in Chrome,
		// see http://code.google.com/p/chromium/issues/detail?id=29180
		writer.println("var iframe = window.parent.document.getElementById('embedimageframe');");
		writer.println("iframe.parentNode.removeChild(iframe);");
		writer.println("</script>");
		writer.println("</body>");
		writer.println("<head>");

		writer.flush();
		writer.close();
	}

	/**
	 * 
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		OutputStream out = response.getOutputStream();
		String encoding = request.getHeader("Accept-Encoding");

		// Supports GZIP content encoding
		if (encoding != null && encoding.indexOf("gzip") >= 0)
		{
			response.setHeader("Content-Encoding", "gzip");
			out = new GZIPOutputStream(out);
		}

		PrintWriter writer = new PrintWriter(out);
		String url = request.getParameter("url");

		if (url != null)
		{
			// Enables caching of this response
			response.setHeader("Content-Type", "text/plain");
			response.setHeader("Cache-Control", "private");
			response.setHeader("Expires", "Thu, 15 Apr 2030 20:00:00 GMT");

			ByteArrayOutputStream bos = new ByteArrayOutputStream();
			ImageIO.write(ImageIO.read(new URL(url)), "png", bos);

			writer.print("<!--\n"
					+ mhtml("image",
							mxBase64.encodeToString(bos.toByteArray(), false))
					+ "-->\n");
		}
		else if (request.getSession(false) != null)
		{
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Cache-Control",
					"no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
			response.setHeader("Content-Type", "text/plain");

			// Gets the image from the session and destroys the session and the cookie
			writer.print(request.getSession().getAttribute("image"));
			request.getSession().invalidate();
			Cookie cookie = new Cookie("JSESSIONID", "");
			cookie.setMaxAge(0);
			cookie.setPath("/");
			response.addCookie(cookie);
		}
		else
		{
			// Makes sure there is no caching on the client side
			response.setHeader("Cache-control", "private, no-cache, no-store");
			response.setHeader("Expires", "0");
			response.setStatus(HttpServletResponse.SC_OK);

			// Loads the static HTML page with the placeholder from the template
			String page = mxUtils.readFile(Roundtrip.class.getResource(
					"/com/mxgraph/examples/web/resources/embedimage.html")
					.getPath());

			String userAgent = request.getHeader("User-Agent");
			boolean dataUrl = userAgent.indexOf("MSIE 6") < 0
					&& userAgent.indexOf("MSIE 7") < 0;

			// In a real-world environment the following would be done for each entry
			// of the image bundle in an XML file for a diagram.
			String name = "myImage";
			String data = "R0lGODlhEAAQAMIGAAAAAICAAICAgP//AOzp2O3r2////////yH+FUNyZWF0ZWQgd2l0aCBUaGUgR0lNUAAh+QQBCgAHACwAAAAAEAAQAAADTXi63AowynnAMDfjPUDlnAAJhmeBFxAEloliKltWmiYCQvfVr6lBPB1ggxN1hilaSSASFQpIV5HJBDyHpqK2ejVRm2AAgZCdmCGO9CIBADs";

			String mhtml = (dataUrl) ? "" : "\n" + mhtml(name, data);
			String bundle = "bundle.putImage('myImage', 'data:image/png," + data
					+ "=', 'mhtml:' + window.location.href + '!" + name + "');";

			// Replaces the placeholder in the template with the XML data
			// which is then parsed into the graph model on the client.
			// In a production environment you should use a template engine.
			page = page.replaceAll("%mhtml%", mhtml);
			page = page.replaceAll("%dataUrl%", (dataUrl) ? "true" : "false");
			page = page.replaceAll("%bundle%", bundle);

			writer.println(page);
		}

		writer.flush();
		writer.close();
	}

	/**
	 * Creates a MHTML entry for the given resource name and base64 encoded data.
	 */
	protected String mhtml(String name, String data)
	{
		return "Content-Type: multipart/related; boundary=\"----\"\n" + "\n"
				+ "------\n" + "Content-Location:" + name + "\n"
				+ "Content-Transfer-Encoding:base64\n" + "\n" + data + "=\n"
				+ "------\n";
	}

	//
	// Handling of multipart/form-data *** NOT FOR PRODUCTION USE!! ***
	//

	/**
	 * Encoding for the multipart/form-data.
	 */
	protected static final String ENCODING = "ISO-8859-1";

	/**
	 * Parses the given multipart/form-data request into a map that maps from
	 * names to values. Note that this implementation ignores the file type and
	 * filename and does only return the actual data as the value for the name
	 * of the file input in the form. Returns an empty map if the form does not
	 * contain any multipart/form-data.
	 */
	protected Map<String, String> parseMultipartRequest(
			HttpServletRequest request) throws IOException
	{
		Map<String, String> result = new Hashtable<String, String>();
		String contentType = request.getHeader("Content-Type");

		// Checks if the form is of the correct content type
		if (contentType != null
				&& contentType.indexOf("multipart/form-data") == 0)
		{
			// Extracts the boundary from the header
			int boundaryIndex = contentType.indexOf("boundary=");
			String boundary = "--"
					+ contentType.substring(boundaryIndex + 9).trim();
			
			// Splits the multipart/form-data into its different parts
			Iterator<String> it = splitFormData(
					readStream(request.getInputStream()), boundary).iterator();

			while (it.hasNext())
			{
				parsePart(it.next(), result);
			}
		}

		return result;
	}

	/**
	 * Parses the values in the given form-data part into the given map. The
	 * value of the name attribute will be used as the name for the data. The
	 * filename will be stored under filename in the given map and the
	 * content-type is ignored in this implementation.
	 */
	protected void parsePart(String part, Map<String, String> into)
	{
		String[] lines = part.split("\r\n");
		
		if (lines.length > 1)
		{
			// First line contains content-disposition in the following format:
			// form-data; name="upfile"; filename="avatar.jpg"
			String[] tokens = lines[1].split(";");
			
			// Stores the value of the name attribute for the form-data
			String name = null;
	
			for (int i = 0; i < tokens.length; i++)
			{
				String tmp = tokens[i];
				int index = tmp.indexOf("=");
	
				// Checks if the token contains a key=value pair
				if (index >= 0)
				{
					String key = tmp.substring(0, index).trim();
					String value = tmp.substring(index + 2, tmp.length() - 1);
	
					if (key.equals("name"))
					{
						name = value;
					}
					else
					{
						into.put(key, value);
					}
				}
			}
	
			// Last line contains the actual data
			if (name != null)
			{
				into.put(name, lines[lines.length - 1]);
			}
		}
	}

	/**
	 * Returns the parts of the given multipart/form-data.
	 */
	protected List<String> splitFormData(String formData, String boundary)
	{
		List<String> result = new LinkedList<String>();
		int nextBoundary = formData.indexOf(boundary);

		while (nextBoundary >= 0)
		{
			if (nextBoundary > 0)
			{
				result.add(formData.substring(0, nextBoundary));
			}

			formData = formData.substring(nextBoundary + boundary.length());
			nextBoundary = formData.indexOf(boundary);
		}

		return result;
	}

	/**
	 * Reads the complete stream into memory as a String.
	 */
	protected String readStream(InputStream is) throws IOException
	{
		if (is != null)
		{
			Writer writer = new StringWriter();

			char[] buffer = new char[1024];
			try
			{
				Reader reader = new BufferedReader(new InputStreamReader(is,
						ENCODING));
				int n;
				while ((n = reader.read(buffer)) != -1)
				{
					writer.write(buffer, 0, n);
				}
			}
			finally
			{
				is.close();
			}

			return writer.toString();
		}
		else
		{
			return "";
		}
	}

}
