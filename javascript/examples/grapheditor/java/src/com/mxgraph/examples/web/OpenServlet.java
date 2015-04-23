/**
 * Copyright (c) 2011-2012, JGraph Ltd
 */
package com.mxgraph.examples.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class OpenServlet.
 * 
 * open.html implements the user interface. This file is displayed within an
 * IFRAME in order to better handle the response. The form is then processed
 * either locally if the browser implements the HTML5 FileReader API or via the
 * OpenServlet. Note that the mechanism to open files uses OpenFile in
 * Editor.js, as well as Editor.openFile when the client starts. This is
 * required to abstract away the asynchronous loading of the new editor and
 * handling of the response, which in turn calls the setData method on the
 * OpenFile instance of the parent window of the frame where open.html was
 * displayed (see below).
 */
public class OpenServlet extends HttpServlet
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4442397463551836919L;

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException
	{
		request.setCharacterEncoding("UTF-8");
		response.setCharacterEncoding("UTF-8");
		response.setContentType("text/html; charset=UTF-8");

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

		try
		{
			if (request.getContentLength() < Constants.MAX_REQUEST_SIZE)
			{
				Map<String, String> post = parseMultipartRequest(request);
				String xml = new String(post.get("upfile").getBytes(ENCODING),
						"UTF-8");
				String filename = post.get("filename");

				// Uses JavaScript to load the XML on the client-side
				writer.println("window.parent.openFile.setData(decodeURIComponent('"
						+ encodeURIComponent(xml) + "'), '" + filename + "');");
			}
			else
			{
				error(writer, "drawingTooLarge");
			}
		}
		catch (Exception e)
		{
			error(writer, "invalidOrMissingFile");
		}

		writer.println("</script>");
		writer.println("</body>");
		writer.println("</html>");

		writer.flush();
		writer.close();
	}

	public static void error(PrintWriter w, String key)
	{
		w.println("window.parent.openFile.error(window.parent.mxResources.get('"
				+ key + "'));");
	}

	/**
	   * Encodes the passed String as UTF-8 using an algorithm that's compatible
	   * with JavaScript's <code>encodeURIComponent</code> function. Returns
	   * <code>null</code> if the String is <code>null</code>.
	   * 
	   * @param s The String to be encoded
	   * @return the encoded String
	   */
	public static String encodeURIComponent(String s)
	{
		String result = null;

		try
		{
			result = URLEncoder.encode(s, "UTF-8").replaceAll("\\+", "%20")
					.replaceAll("\\%21", "!").replaceAll("\\%28", "(")
					.replaceAll("\\%29", ")").replaceAll("\\%7E", "~");
		}

		// This exception should never occur.
		catch (UnsupportedEncodingException e)
		{
			result = s;
		}

		return result;
	}

	///////////////////////////////////////////////////////////////////////
	// Handling of multipart/form-data **** NOT FOR PRODUCTION USE! **** //
	// If you want a production library, we recommend Commons-Fileupload //
	//       https://commons.apache.org/proper/commons-fileupload/       //
	///////////////////////////////////////////////////////////////////////

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

			// Parses all lines starting from the first empty line
			if (name != null && lines.length > 2)
			{
				boolean active = false;
				StringBuffer value = new StringBuffer();

				for (int i = 2; i < lines.length; i++)
				{
					if (active)
					{
						value.append(lines[i]);
					}
					else if (!active)
					{
						active = lines[i].length() == 0;
					}
				}

				into.put(name, value.toString());
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
			StringBuffer buffer = new StringBuffer();
			try
			{
				Reader in = new BufferedReader(new InputStreamReader(is,
						ENCODING));
				int ch;

				while ((ch = in.read()) > -1)
				{
					buffer.append((char) ch);
				}
			}
			finally
			{
				is.close();
			}

			return buffer.toString();
		}
		else
		{
			return "";
		}
	}

}
