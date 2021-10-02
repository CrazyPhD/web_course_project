<?php

	/*	Algorithm for finding (sub)palindromes in phrase
		Note: if there are spaces, they will be ignored
		and the string will be treated as if they weren't there.
		Also, all duplicates will not be included in result.
		
		Manacher's Algorithm used here.
	*/
	
	mb_internal_encoding("UTF-8"); // UTF-8 support
		
	class Palindrome {
		
		public $subpalindromes;
		public $success;
		public $fail;
		
		function __construct() {
			$this->subpalindromes = function ($phrase) {
				$phrase = mb_strtolower($phrase); // mb_* functions used to support UTF-8 encoding.
				$phrase = mb_ereg_replace(" ", "", $phrase); // remove all spaces
				
				
				$manacher_subpalindromes = self::manacher($phrase); // run Manacher's algorithm to find odd and even subpalindromes
				$odd_subpalindromes = $manacher_subpalindromes[0];
				$even_subpalindromes = $manacher_subpalindromes[1];
				
				$palindromes = [];
				for ($i = 0; $i < mb_strlen($phrase); $i++) {
					if ($odd_subpalindromes[$i] > 1) { // ignore palindromes which consits of one character
						$palindromeLength = $odd_subpalindromes[$i]; // $odd_subpalindromes represents array of lengths of biggest palindromes, where index is the index of the character, which is the center of this palindrome
						while ($palindromeLength > 1) { 
							$palindromes[] = mb_substr($phrase, $i - $palindromeLength + 1, $palindromeLength*2 - 1);
							$palindromeLength--;
						}
					}
					
					// same as previous with specific changes
					if ($even_subpalindromes[$i] > 0) {
						$palindromeLength = $even_subpalindromes[$i];
						while ($palindromeLength > 0) {
							$palindromes[] = mb_substr($phrase, $i - $palindromeLength, $palindromeLength*2);
							$palindromeLength--;
						}
					}
				}
				return array_values(array_unique($palindromes));
			};
			
			/*	Used for formatting correct success message
				depending on the number of words found.
			*/
			$this->success = function ($n) {
				$n_1 = $n % 100;
			
				if ($n_1 > 19) {
					$n_1 = $n_1 % 10;
				}
				
				$palindromeWordForm = "палиндром";
				$foundWordForm = "Найдено";
				
				if ($n_1 >= 2 && $n_1 <= 4) {
					$palindromeWordForm = "палиндрома";
				} else if ($n_1 == 1) {
					$palindromeWordForm = "палиндром";
					$foundWordForm = "Найден";
				} else {
					$palindromeWordForm = "палиндромов";
				}
				
				return $foundWordForm." ".strval($n)." ".$palindromeWordForm;
			};
			
			$this->fail = "Не найдено ни одного палиндрома";
		}
		
		
		
		/*	Manacher's algorithm. 
			Time complexity: O(n)
			Space complexity: O(1)
		*/		
		private static function manacher($str) {
			$n = mb_strlen($str);
			$odd = array_fill(0, $n, 0); // odd subpalindromes
			$even = array_fill(0, $n, 0); // even subpalindromes
			
			/* Odd subpalindromes */
			$l = 0; // left edge of current rightest palindrome
			$r = -1; // right edge of current rightst palindrome
			for ($i = 0; $i < $n; $i++) {	
				$k = $i > $r ? 1 : min($odd[$l + $r - $i], $r - $i + 1); // k - known via previous steps palindrome center offset (guaranteed biggest palindrome with center in current position [i-k, i+k]
				while ($i + $k < $n && $i - $k >= 0 && mb_substr($str, $i - $k, 1) == mb_substr($str, $i + $k, 1)) {
					$k++; // increment offset if we are still between 0 and string length and mirrored elements are equal
				}
				$odd[$i] = $k; // here we know max palindrome size with center in current position (i)
				if ($i + $k - 1 > $r) { // if right edge of current palindrome is righter than right edge of the previous rightest palindrome, renew l and r 
					$l = $i - $k + 1;
					$r = $i + $k - 1;
				}
			}
			
			/*	Even subpalindromes
				a bit modified previous algorithm (for odd subpalindromes)
			*/
			$l = 0;
			$r = -1;
			for ($i = 0; $i < $n; $i++) {
				$k = $i > $r ? 0 : min($even[$l + $r - $i + 1], $r - $i + 1);
				while ($i + $k < $n && $i - $k - 1 >= 0 && mb_substr($str, $i + $k, 1) == mb_substr($str, $i - $k - 1, 1)) {
					$k++;
				}
				$even[$i] = $k;
				if ($i + $k - 1 > $r) {
					$l = $i - $k;
					$r = $i + $k - 1;
				}
			}
			
			return [$odd, $even];
		}
	}