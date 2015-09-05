'use strict';

var request = require("request-promise");
var fs = require("fs");
var cheerio = require("cheerio");

console.log("runned");

var baseUrl = 'http://www.brejas.com.br';

var page = 1;
var pageMax = 10;
var itemsPerPage = 10;
var brejas = [];
console.time("crawler time");
while(true) {
	if(page > pageMax) break;
	page++;
	request(baseUrl + "/cerveja?page=" + page).then(function(html) {	
		var $ = cheerio.load(html);
		var items = $(".jrRow").not(".jrDataListHeader");

		items.each(function() {
			var breja = {};
			breja.nome = $(this).find(".jrContentTitle a").text();
			breja.url = baseUrl + $(this).find(".jrContentTitle a").attr("href");
			request(breja.url).then(function(html) {
				var $ = cheerio.load(html);
				breja.img = $(".jrListingMainImage img").attr("src");
				brejas.push(breja);
				console.log(brejas.length);
				if(brejas.length === pageMax*itemsPerPage) {
                    console.timeEnd("crawler time");
					fs.writeFile('output.json', JSON.stringify(brejas, null, 4), function(err){});
				}
			});
		});

	});
}