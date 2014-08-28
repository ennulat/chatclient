<?php
/**
 * 
 * 
 * helper Class for e.g. file logging
 * @author Jes
 *
 */

class helper{
	
	static $helper;

	
	static public function writelog($out){
		
		ob_start();
		
		echo '<pre>class: '.__CLASS__.' | @line:  '.__LINE__;
		var_dump($out);
		echo '</pre>';
	
		
		$out = ob_get_clean();
		$fh = fopen('log/log.txt', 'a+');
		fwrite($fh, $out);
		fclose($fh);
	
	}
}