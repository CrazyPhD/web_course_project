'use strict';

const search = DOM.get('.search__input');
const resultsContainer = DOM.get('.search__results');
const searchLoading = DOM.get('.search__loading');
let currentProcess = null;
let foundCount = 0;

function simulateLoading(result, link) {
	const min = 300;
	const max = 900;
	setTimeout(() => {
		result = DOM.create(result, resultsContainer);
		result.on('click', function() {
			window_.get().location = link;
		});
		if (--foundCount < 1) {
			searchLoading.addClass('disabled');
		}
	}, Math.floor(Math.random() * (max - min)) + min);
}

search.on('keydown', function() {
	if (currentProcess == null) {
		currentProcess = setTimeout(function() {
			resultsContainer.setInnerHTML('');
			let results = db.find(search.get().value);
			foundCount = results.length;
			if(!isEmpty(results)) {
				foundCount = results.length;
				searchLoading.removeClass('disabled');
				results.forEach((record) => {
					const isProduct = record instanceof Product;
					let img = isProduct ? {tag: 'img', cls: 'search__result_image', attr: [['src', record.getImage()]]} : {tag: 'i', cls: 'search__result_icon fas fa-cogs'};
					let left = {tag: 'div', cls: 'search__result_left', cn: [img]};
					let title = {tag: 'h3', cls: 'search__result_title header_text', innerHTML: record.getName()};
					let desc = {tag: 'article', cls: 'search__result_desc', innerHTML: record.getShortDescription()};
					let right = {tag: 'div', cls: 'search__result_right', cn: [title, desc]};
					let result = {tag: 'div', cls: 'search__result', cn: [left, right]};
					simulateLoading(result, record.getLink());
				});
			}
			currentProcess = null;
		}, 1000);
	}
});