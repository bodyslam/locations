
module.exports = {
	isRegionalType : function (entry) {
		var regionRegex = /asia|africa|europe|middle east|caribbean|global|central america|indian ocean|south america|Australia and Pacific/i;
		return regionRegex.test(entry.Level1);
	},
	hasUnicode: function(entry) {
		return /[0-9]+/.test(entry.Unicode);
	},
	hasURL: function(entry) {
		return /[a-zA-Z0-9]+/.test(entry.URL);
	},
	convertAirline : function (entry) {
		var ret = {
			type: "Airline",
			name: entry.Candidate_Name,
			url: this.hasURL(entry) ? entry.URL : '',
			country: entry.Level2,
			region: entry.Level1
		};
		if (this.hasUnicode(entry)) ret.unicode = entry.Unicode;
		return ret;
	},
	convertAirport : function (entry) {
		var isRegional = this.isRegionalType(entry);
		var tokens = entry.Candidate_Name.match(/\((.+)\)/);
		var airportCode = tokens[1];
		var state = isRegional ? '' : entry.Level2;
		var ret = {
			type: "Airport",
			city: entry.Level3,
			country: isRegional ? entry.Level2 : entry.Level1,
			url: this.hasURL(entry) ? entry.URL : '',
			region: entry.Level1,
			airportCode: airportCode
		};
		if (state) ret.state = state;
		if (this.hasUnicode(entry)) ret.unicode = entry.Unicode;
		return ret;
	},
	convertIsland : function (location) {
		return this.convertVenues(location, 'Island')
	},
	convertCity : function (location) {
		return this.convertVenues(location, 'City')
	},
	convertVenues : function (location, type) {
		var isRegional = this.isRegionalType(location);
		var state, country, ret =  {};
		if (isRegional) {
			country = location.Level2;
		} else {
			country = location.Level1;
			state = location.Level2;
		}
		ret.country = country;
		
		/**
		 * TEMP SOLUTION FOR V3 OF RCA 
		 * REMOVE ASAP FOR V4
		 */
		var forVersion3Only = type === 'City' && country === 'United States'; // Remove this for v4 of RCA
		ret.city = forVersion3Only ? location.Candidate_Name : location.Level3;
		state = forVersion3Only ? location.Level3 : state;
		
		ret.region = location.Level1;
		if (state) ret.state = state;
 		if (type) ret.type = type;
 		if (this.hasUnicode(location)) ret.unicode = location.Unicode;
		return ret;
	},
	convertCruise : function (entry) {
		var ret = {
			type: "Cruise",
			name: entry.Candidate_Name,
			url: entry.URL,
			size: entry.Leve2
		};
		if (this.hasUnicode(entry)) ret.unicode = entry.Unicode;
		if (/[0-9]+/.test(entry.Number_Of)) ret.rooms = entry.Number_Of;
		return ret;
	},
	convertLodging : function (entry) {
		var isRegional = this.isRegionalType(entry);
		var subtype = entry.Classification.split('-').shift().trim(); // Handle stuff like 'Resort - US'
		var originalName = entry.Candidate_Name;
		var cleanName =  (entry.Candidate_Name);
		var country = isRegional ? entry.Level2 : entry.Level1; 
		var city = entry.Level3;
		var ret = {
			type: "hotels",
			name: cleanName,
			city: city,
			country: country,
			url: entry.URL,
			region: entry.Level1,
			subtype: subtype,
			rooms: entry.Number_Of,
			isRegional: isRegional
		}
		if (this.hasUnicode(entry)) ret.unicode = entry.Unicode;
		if (!isRegional) ret.state = entry.Level2;
		return ret;
	},
	convertSkiResort : function (entry) {
		var isRegional = this.isRegionalType(entry);
		var ret = {
			type: "Ski Resort",
			name: entry.Candidate_Name,
			city: entry.Level3,
			country: isRegional ? entry.Level2 : entry.Level1,
			url: entry.URL,
			region: entry.Level1
		};
		if (!isRegional) ret.state = entry.Level2;
		if (this.hasUnicode(entry)) ret.unicode = entry.Unicode;
		return ret;
	}
};