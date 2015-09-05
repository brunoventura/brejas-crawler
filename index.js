var Promise = require('bluebird');
var request = require('request');
var requestGet = Promise.promisify(request.get);
var fs = require('fs');
var cheerio = require('cheerio');

console.log('runned');

var baseUrl = 'http://www.brejas.com.br';

var page = 1;
var pageMax = 3;
var itemsPerPage = 10;
var brejas = [];
var requestQueue = [];

while (true) {
    if (page > pageMax)
        break;

    page++;

    requestQueue.push(requestGet(baseUrl + '/cerveja?page=' + page).then(function(html) {
        var result = [];
        var $ = cheerio.load(html[1]);
        var items = $('.jrRow').not('.jrDataListHeader');

        items.each(function() {
            var breja = {};
            breja.nome = $(this).find('.jrContentTitle a').text();
            breja.url = baseUrl + $(this).find('.jrContentTitle a').attr('href');

            result.push(breja);
        });

        return result;
    }).each(function(breja) {
        return requestGet(breja.url).then(function(html) {
            var $ = cheerio.load(html[1]);
            breja.img = $('.jrListingMainImage img').attr('src');
            brejas.push(breja);
            console.log(brejas.length);
        });
    }));
}

Promise.all(requestQueue).then(function() {
    console.log(JSON.stringify(brejas, null, 4));
    // fs.writeFile('output.json', JSON.stringify(brejas, null, 4), function(err) {});
});
