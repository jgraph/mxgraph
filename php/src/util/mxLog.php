<?php
/**
 * Copyright (c) 2006-2013, Gaudenz Alder
 */
class mxLog
{

	/**
	 * Class: mxLog
	 * 
	 * Logging facility.
	 * 
	 * Variable: level_fine
	 *
	 * Specifies the fine logging level.
	 */
	public static $level_fine = true;
	
	/**
	 * Variable: level_debug
	 *
	 * Specifies the debug logging level.
	 */
	public static $level_debug = true;
	
	/**
	 * Variable: level_info
	 *
	 * Specifies the info logging level.
	 */
	public static $level_info = true;
	
	/**
	 * Variable: level_warn
	 *
	 * Specifies the warn logging level.
	 */
	public static $level_warn = true;
	
	/**
	 * Variable: level_error
	 *
	 * Specifies the error logging level.
	 */
	public static $level_error = true;
	
	/**
	 * Variable: current
	 *
	 * Default is true.
	 */
	public static $current = array();
	
	/**
	 * Variable: tab
	 *
	 * Default is true.
	 */
	public static $tab = "";
	
	/**
	 * Variable: logfiles
	 *
	 * Holds the array of logfiles.
	 */
	public static $logfiles = array();
	
	/**
	 * Variable: printLog
	 *
	 * Specifies if the log should be printed out.
	 */
	public static $printLog = false;
	
	/**
	 * Function: addLogfile
	 *
	 * Adds a file for logging.
	 */
	static function addLogfile($filename)
	{
		$fh = fopen($filename, "a");
		array_push(mxLog::$logfiles, $fh);
	}
	
	/**
	 * Function: enter
	 *
	 * Logs a method entry.
	 */
	static function enter($method, $text="")
	{
		mxLog::writeln("$method: { $text");
		$t0 = microtime(true);
		array_push(mxLog::$current, $t0);
		mxLog::$tab .= "    ";
	}

	/**
	 * Function: leave
	 *
	 * Logs a method exit.
	 */
	static function leave($text="")
	{
		$t0 = array_pop(mxLog::$current);
		$tab = mxLog::$tab;
		mxLog::$tab = substr($tab, 0, strlen($tab)-4);
		$dt = "(dt=".(microtime(true)-$t0).")";
		mxLog::writeln("} $dt $text");
	}
	
	/**
	 * Function: fine
	 *
	 * Logs a fine trace.
	 */
	static function fine($text)
	{
		if (mxLog::$level_fine)
		{
			mxLog::writeln($text);
		}
	}

	/**
	 * Function: debug
	 *
	 * Logs a debug trace.
	 */
	static function debug($text)
	{
		if (mxLog::$level_debug)
		{
			mxLog::writeln($text);
		}
	}

	/**
	 * Function: info
	 *
	 * Logs an info trace.
	 */
	static function info($text)
	{
		if (mxLog::$level_info)
		{
			mxLog::writeln($text);
		}
	}

	/**
	 * Function: warn
	 *
	 * Logs a warn trace.
	 */
	static function warn($text)
	{
		if (mxLog::$level_warn)
		{
			mxLog::writeln($text);
			error_log($text);
		}
	}

	/**
	 * Function: error
	 *
	 * Logs an error trace.
	 */
	static function error($text)
	{
		if (mxLog::$level_error)
		{
			mxLog::writeln($text);
			error_log($text);
		}
	}
	
	/**
	 * Function: writeln
	 *
	 * Writes a line with a linefeed to the log.
	 */
	static function writeln($text)
	{
		mxLog::write("$text\n");
	}

	/**
	 * Function: write
	 *
	 * Writes a line to the log.
	 */
	static function write($text)
	{
		$msg = date("Y-m-d H:i:s").": ".mxLog::$tab.$text;
		foreach (mxLog::$logfiles as $fh)
		{
			fputs($fh, $msg);
		}
		if (mxLog::$printLog)
		{
			$msg = str_replace(" ", "&nbsp;", $msg);
			print("$msg<br>");
		}
	}

	/**
	 * Function: close
	 *
	 * Closes all open logfiles.
	 */
	static function close()
	{
		foreach (mxLog::$logfiles as $fh)
		{
			fclose($fh);
		}
	}

}
?>
