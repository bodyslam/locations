var Diacritics = require('diacritic');
var request = require('request');
var limit = require('async-limit');
var limitedGet = limit(request.get, 2);
var limitedPost = limit(request.post, 2);
var locations = require('./transformed.json');
var copilotPath = 'http://ci-cnt-api.aws.conde.io/search?';
var xlsxj = require("xlsx-to-json");
var converters = require("./lib/typeConverters");


function xlsToJSON(type) {
	return new Promise((resolve, reject) => {
		xlsxj({
			input: 'RCAVersion3.xlsx',
			output: null
		}, (err, result) => {
			if (err) reject(err);
			if (type) { 
				result = result.filter((entry) => {
					return entry.Type === type;
				})
			}
			resolve(result);
		})
	})
}

function cleanDiacritics(entries) {
	return entries.map((entry) => {
		Object.keys(entry).map((key) => {
			entry[key] = Diacritics.clean(entry[key]);
		});
		return entry;
	})
}

function convertEntries(entries) {
	return Promise.resolve(entries.map((entry) => {
		var functionName = 'convert' + entry.Type.trim().replace(/ /, '');
		return converters[functionName](entry);
	}));
}


var type = 'Ski Resort';

xlsToJSON(type)
.then(cleanDiacritics)
.then(convertEntries)
.then((r) => {
	console.log(JSON.stringify(r));
	process.exit();
})
.catch((e)=>{
	console.log("Fatal: ", e.stack);
	process.exit();
});