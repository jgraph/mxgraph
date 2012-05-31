<?php
/**
 * $Id: session.php,v 1.10 2010-09-20 10:29:31 gaudenz Exp $
 * Copyright (c) 2006, Gaudenz Alder
 */
include_once("../src/mxServer.php");

// enables logging to a file
mxLog::addLogfile("session.log");
session_start();
mxLog::enter("main (session ".session_id().")");

if (!is_dir("test"))
{
  mkdir("test");
  chmod("test", 0777);
}

$document = $_SESSION['document'];
$sid = session_id();
$filename = $document."/".$sid;
$delta = $document."/delta.xml";

if (!isset($document) || isset($_GET["init"]))
{
  $document = "test";
  $filename = $document."/".session_id();
  $delta = $document."/delta.xml";

  $_SESSION["document"]  = $document;
  session_commit();

  header("Pragma: public");
  header("Expires: 0");
  header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
  header("Content-Type: application/xhtml+xml");

  // Gives the client a unique namespace that
  // is used as a prefix for new cell ids.
  $ns = md5(uniqid(rand(), true));
  mxLog::debug("session $sid initialized: ns=$ns");
  echo "<message namespace=\"$ns\">";
  echo "<state>";

  $fp = fopen("diagrams/graphmodel.xml", "r");
  fpassthru($fp);
  fclose($fp);
  
  echo "</state>";
  echo "<delta>";
  
  if (is_file($delta))
  {
    $fp = fopen($delta, "r+");
    fpassthru($fp);
    fclose($fp);
  }
  
  echo "</delta>";
  echo "</message>";

  // Deletes existing buffer
  if (is_file($filename))
  {
    unlink($filename);
  }
  
  touch($filename);
  chmod($filename, 0777);
}
else
{
  // Gets the XML parameter from the POST request and converts all linefeeds
  // into a HTML entity. This is required for correct handling of the XML on
  // the client side.
  if (isset($_POST["xml"]))
  {
	  $xml = str_replace("\n", "&#xa;", stripslashes($_POST["xml"]));
	  
	  // TODO: Take only the edits from the XML
	  $edits = "";
	  $doc = mxUtils::parseXml($xml);
	  
	  $child = $doc->documentElement;
	  
	  if ($child->nodeName == "message")
	  {
	  	$child = $child->firstChild;

	  	while ($child != null)
	  	{
		  	if ($child->nodeName == "delta")
		  	{
	  			$edit = $child->firstChild;
	  			
	  			while ($edit != null)
	  			{
	  				if ($edit->nodeName == "edit")
	  				{
	  					$edits .= $doc->saveXML($edit);
	  				}
	  				
	  				$edit = $edit->nextSibling;
	  			}
	  		}
	  		
	  		$child = $child->nextSibling;
	  	}
	  }
	  
	  // Appends the change to all connected sessions except the incoming
	  // session and the global delta file
	  if (strlen($edits) > 0)
	  {
	    mxLog::debug("received changes from ".session_id().
	    			": ".strlen($edits)." bytes");
	  
	    // Makes sure the global delta file exists so that the change is
	    // appended below
	    if (!is_file($delta))
	    {
	      touch($delta);
	      chmod($delta, 0777);
	    }
	        
	    // Clears out the delta file if this change contains a mxRootChange
	    // in which case the previous changes will no longer be visible and
	    // just waste bandwidth.
	    if (strpos($edits, "mxRootChange") > 0)
	    {
	      $fp = fopen($delta, "r+");
	      fpassthru($fp);
	      ftruncate($fp, 0);
	      fflush($fp);
	      fclose($fp);
	    }

	    // Dispatches the XML to all sessions except the incoming session
	    // TODO: Remove dead sessions
	    $fp = opendir($document);

	    while($filename = readdir($fp))
	    {
	      if ($filename!= "." &&
	        $filename != ".." &&
	        !is_dir("$document/$filename") &&
	        $filename != session_id())
	      {
	        mxLog::debug("dispatch changes to $filename");
	        $tmp = fopen("$document/$filename", "a");
	        fwrite($tmp, $edits);
	        fflush($tmp);
	        fclose($tmp);
	      }
	    }
	    
	    flush();
	  }
  }
  else
  {
    // Makes sure to cancel existing pending requests before they consume the
    // change data after a refresh, where the request must be served instead.
    $requestid = md5(uniqid(rand(), true));
    $_SESSION['requestid'] = $requestid;
    session_commit();
    mxLog::debug("request $requestid enters");
  
    if (!is_file($filename))
    {
      touch($filename);
      chmod($filename, 0777);
    }
    else
    {
      // Keeps the request for 10 secs and asks for changes each second
      $timeout = 10;
      $count = 0;
      while (is_file($filename) &&
           filesize($filename) == 0 &&
           $count < $timeout &&
           $_SESSION['requestid'] == $requestid)
       {
         sleep(1);
         clearstatcache();
         $count++;
                 
         // Sync the session state
         session_start();
         session_commit();
      }
      
      // Sync the session state
      session_start();
      session_commit();

      if ($_SESSION['requestid'] != $requestid)
      {
        mxLog::debug("request $requestid has died");    
      }
      else if (filesize($filename) > 0)
      {
        mxLog::debug("request $requestid leaves: ".filesize($filename)." bytes");
        header("Pragma: public");
        header("Expires: 0");
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
        header("Content-Type: application/xhtml+xml");
        
        // Sends the changes to the client
        echo "<message>";
        echo "<delta>";
        $fp = fopen($filename, "r+");
        fpassthru($fp);
        ftruncate($fp, 0);
        fflush($fp);
        fclose($fp);
        echo "</delta>";
        echo "</message>";
      }
      else
      {
        touch($filename);
      }
    }
  }
}

mxLog::leave();
mxLog::close();
?>
