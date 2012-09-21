<?php
// Does not use cookies for sessions since the only session exists between
// two requests where the URL of the second request is defined below.
ini_set('session.use_cookies', '0');
$compress = strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false;

function mhtml($name, $data)
{
	return "Content-Type: multipart/related; boundary=\"----\"\n".
		"\n".
		"------\n".
		"Content-Location:$name\n".
		"Content-Transfer-Encoding:base64\n".
		"\n".
		$data.
		"=\n".
		"------\n";
}

// Uses wire-compression for response
if ($compress)
{
	ob_start();
	ob_start("ob_gzhandler");
}

// Converts an uploaded file to a base64 MHTML response
// which is inserted via injected JavaScript on the client-side.
if ($_SERVER["REQUEST_METHOD"] == "POST")
{
	$tmpfile = $_FILES["upfile"]["tmp_name"];
	header("Content-Type: text/html");	

	echo "<html>\n";
	echo "<head>\n";
	echo "</head>\n";
	echo "<body>\n";
	echo "<script type=\"text/javascript\">\n";
	
	// Shows an error message on the client-side if the file is larger than
	// 32 KB, which is the maximum size foe data URIs in IE8.
	if (filesize($tmpfile) > 32768)
	{
		echo "alert(\"File exceeds the maximum allowed size. File must be less than 32KB.\");\n";
	}
	else
	{
		$img = file_get_contents($tmpfile);
		$data = base64_encode($img);
		
		// Makes the name unique by adding a timestamp as a postfix
		$name = $_FILES["upfile"]["name"]."-".mktime();

		// Stores the file in the session which only exists between this and the
		// next request. The subsequent request is handled in the else branch.
		// Note that the request destroys the session and its contents, however,
		// in IE the MHTML resource is only loaded once and kept in the browser.
		if ($_POST["dataurl"] == "false")
		{
			// In theory, up to 4K in 300 cookies can be used to transfer the data
			// directly in the GET request of the image to avoid a session state.
			// This can be done by splitting the base64 data into 4K cookies in the
			// insert method in the client and then forcing an image prefetch with
			// the respective MHTML URL for the image. On the server-side all we
			// we need to do is fetch the content location (get param) and data.
			// In practice most servers have a header size limit of 8-16K.
			session_start();
			$url = "'mhtml:'+window.location.href+'?PHPSESSID=".session_id()."&img=$name!$name'";
			$_SESSION["image"] = "<!--\n".mhtml($name, $data)."-->\n";
		}
		else
		{
			$url = "null";
		}

		echo "window.parent.insert(\"$name\", \"data:image/png,".$data."\", $url);\n";
	}

	// NOTE: Ignore "Failed to load resource" error in Chrome,
	// see http://code.google.com/p/chromium/issues/detail?id=29180
	echo "var iframe = window.parent.document.getElementById('embedimageframe');\n";
	echo "iframe.parentNode.removeChild(iframe);";
	echo "</script>\n";
	echo "</body>\n";
	echo "</html>\n";
}
// Fetches the given image and encodes it as a MHTM page.
// On the client-side the page is used as is and the
// base64 encoded data is extracted and put into an
// mxImageBundle for storage with the diagram.
else if (isset($_GET["url"]))
{
	$url = $_GET["url"];
	$img = file_get_contents($url);

	// Enables caching of this response
	header("Content-Type: text/plain");
	header("Cache-Control: private");
	header("Expires: Thu, 15 Apr 2030 20:00:00 GMT");
	
	echo "<!--\n".mhtml("image", base64_encode($img))."-->\n";
}
// Returns the MHTML stored in the session.
else if (isset($_GET["PHPSESSID"]))
{
	header("Content-Type: text/plain");

	// Gets the image from the session and destroys the session (since we do
	// not use session cookies there is no need to delete a cookie here).
	session_start();
	echo $_SESSION["image"];
	session_destroy();
}
else
{
	header("Content-Type: text/html");
	
	$userAgent = strtoupper(getenv("HTTP_USER_AGENT"));
	$dataUrl = strpos($userAgent, "MSIE 6") === false &&
			   strpos($userAgent, "MSIE 7") === false;

	// In a real-world environment the following would be done for each entry
	// of the image bundle in an XML file for a diagram.
	$name = "myImage";
	$data = "R0lGODlhEAAQAMIGAAAAAICAAICAgP//AOzp2O3r2////////yH+FUNyZWF0ZWQgd2l0aCBUaGUgR0lNUAAh+QQBCgAHACwAAAAAEAAQAAADTXi63AowynnAMDfjPUDlnAAJhmeBFxAEloliKltWmiYCQvfVr6lBPB1ggxN1hilaSSASFQpIV5HJBDyHpqK2ejVRm2AAgZCdmCGO9CIBADs";
	
	$mhtml = ($dataUrl) ? "" : "\n".mhtml($name, $data);
	$bundle = "bundle.putImage('myImage', 'data:image/png,$data=', 'mhtml:' + window.location.href + '!$name');";

	// Replaces the placeholders in the template with the data from above.
	// Note: In a production environment you should use a template engine.
	$page = file_get_contents("embedimage.html");
	$page = str_replace("%mhtml%", $mhtml, $page);
	$page = str_replace("%dataUrl%", ($dataUrl) ? "true" : "false", $page);
	$page = str_replace("%bundle%", $bundle, $page);
	
	echo $page;
}

// Flushes the compression buffers	
if ($compress)
{
	ob_end_flush();
	ob_end_flush();
}
?>

