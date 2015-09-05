'use strict';
var fs = require('fs');
var Crawler = require('crawler');
var baseUrl = 'http://www.brejas.com.br';
var brejas = [];
var i = 1;
console.time("crawler time");
var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, result, $) {
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server

        $('.jrRow').not('.jrDataListHeader').each(function() {
            var breja = {};
            breja.nome = $(this).find(".jrContentTitle a").text();
            breja.url = baseUrl + $(this).find('.jrContentTitle a').attr('href');

            c.queue([{
                uri: breja.url,
                maxConnections : 10,
                // The global callback won't be called
                callback: function (error, result, $) {
                    breja.img = $(".jrListingMainImage img").attr("src");
                    brejas.push(breja);
                    console.log(brejas.length);
                }
            }]);
        });
    },

    onDrain: function() {
        console.timeEnd("crawler time");
        fs.writeFile('output.json', JSON.stringify(brejas, null, 4), function(err){});
    }
});

var urls = function(pages) {
    return Array.apply(null, {length: pages}).map(function(item, i){return baseUrl + "/cerveja?page=" + (i+1)})
};
c.queue(urls(10));