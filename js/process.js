'use strict';

window.addEventListener('click', (e) => {
	if (e.target.id === 'find') {
		getWords();
		e.preventDefault();
	}
});

function getWords() {
	const xhr = new XMLHttpRequest();
	const formData = new FormData(document.forms.process_form);
	const resultsContainer = document.getElementById("result");
	const resultsVerdict = document.getElementById("result_summary");
	const resultsList = document.getElementById("result_list");
	
	xhr.open("POST", "src/get_words_list.php");
	xhr.onload = function (e) {
		if (xhr.readyState == 4 && xhr.status == 200) {
			
			/* Clean previous results if they were shown */
			resultsVerdict.innerHTML = "";
			resultsList.innerHTML = "";
			
			/* Get response and decode it */
			let response = JSON.parse(xhr.response);
			
			/* Get summary message from response */
			resultsVerdict.innerHTML = response.verdict;
			
			/* Fill results list with found words */
			if (response.count > 0) {
				for (let word of response.words) {
					let wordListElement = document.createElement("li");
					wordListElement.innerHTML = word;
					resultsList.appendChild(wordListElement);
				}
			}
			
			/* If results container is hidden, show it */
			resultsContainer.classList.remove("hidden");
		}
	};
	xhr.send(formData);
}