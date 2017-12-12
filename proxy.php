<?php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST');

  $url = (isset($_POST['url'])) ? $_POST['url'] : false;

  if(!$url) {
    echo 'no url';
    exit;
  }

  // create curl resource
  $ch = curl_init();

  // set url
  curl_setopt($ch, CURLOPT_URL, $url);

  //return the transfer as a string
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  // $output contains the output string
  $output = curl_exec($ch);
  echo $output;
  // close curl resource to free up system resources
  curl_close($ch);
?>