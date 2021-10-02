<?php
	include_once "palindrome.php"; /* Words filter logic source */
	
	$palindrome = new Palindrome();
	
	/* Words filter logic function */
	$algorithm = $palindrome->subpalindromes;
	
	/*	If something is found, success message
		Note:	It is assumed, that it is an anonymous function with number as parameter.
				If it is necessary, change its usage below in desired way. ("verdict" field in json output)
	*/
	$verdict_success = $palindrome->success;
	
	/* Nothing is found, failure message */
	$verdict_fail = $palindrome->fail;
	
	if (isset($_POST['phrase'])) {
		$foundWords = $algorithm($_POST['phrase']);
		$foundWordsCount = count($foundWords);
		print json_encode(array(
					"count" => $foundWordsCount,
					"words" => $foundWords,
					"verdict" => ($foundWordsCount > 0 ? $verdict_success($foundWordsCount) : $verdict_fail)
					));
	}