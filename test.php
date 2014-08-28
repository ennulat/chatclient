<?php

 $pics = array();
 $i = 0; 
    $dir = 'img/';
    if ($handle = opendir($dir)) {
        while (($file = readdir($handle)) !== false){
            if (!in_array($file, array('.', '..')) && !is_dir($dir.$file)){
            	$pics[$i] = $dir.$file;
                $i++;
            }
                
        }
    }
    
  echo json_encode($pics);
