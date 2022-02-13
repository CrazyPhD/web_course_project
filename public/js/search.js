'use strict';

const search = DOM.get('.search__input');
const resultsContainer = DOM.get('.search__results');
const searchLoading = DOM.get('.search__loading');
let currentProcess = null;
let foundCount = 0;

search.on('keydown', function(e) {
	if (e.keyCode === 8)
		resultsContainer.setInnerHTML('');
	if (search.get().value.length < 2)
		return;
	resultsContainer.setInnerHTML('');
	searchLoading.removeClass('disabled');
	db.find(search.get().value).then(results => {
		foundCount = results.length;
		if (foundCount === 0) {
			searchLoading.addClass('disabled');
		}
		if(!isEmpty(results)) {
			foundCount = results.length;
			searchLoading.addClass('disabled');
			results.forEach((record) => {
				const isProduct = record instanceof Product;
				let img = isProduct ? {tag: 'img', cls: 'search__result_image', attr: [['src', record.getImage()]]} : {tag: 'i', cls: 'search__result_icon fas fa-cogs'};
				let left = {tag: 'div', cls: 'search__result_left', cn: [img]};
				let title = {tag: 'h3', cls: 'search__result_title header_text', innerHTML: record.getName()};
				let desc = {tag: 'article', cls: 'search__result_desc', innerHTML: record.getShortDescription()};
				let right = {tag: 'div', cls: 'search__result_right', cn: [title, desc]};
				let result = {tag: 'div', cls: 'search__result', cn: [left, right]};
				result = DOM.create(result, resultsContainer);
				result.on('click', function() {
					window_.get().location = record.getLink();
				});
			});
		}
	});
});