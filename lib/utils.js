export default {
	altitudeUnit : "metre",
	distanceUnit : "kilometre",
	fuelUnit     : "litre",

	responseStatus : (res, status) => {
		res.status(status);
		res.end();
	},

	reply : (req, res, data) => {
		req.aemp.handler.headers(res);

		res.setHeader("Content-Length", data.length);
		res.end(data);
	},

	convertStructure : (structure, properties, extra = {}) => {
		const conversion = {};

		for (const k in extra) {
			conversion[k] = extra[k];
		}

		for (const k in properties) {
			if (typeof properties[k] == "object") {
				conversion[k] = properties[k];
			} else if (properties[k] in structure) {
				conversion[k] = structure[properties[k]];
			}
		}

		return conversion;
	},

	buildPageLinks : (url, page, pages) => {
		const links = [{
			Rel  : "Self",
			Href : `${url}/${page}`,
		}];

		if (page > 1) {
			links.push({
				Rel  : "Prev",
				Href : `${url}/${page - 1}`,
			});
		}

		if (page < pages) {
			links.push({
				Rel  : "Next",
				Href : `${url}/${page + 1}`,
			});
		}

		links.push({
			Rel  : "Last",
			Href : `${url}/${pages}`,
		});

		return links;
	},

	formatDate : (date) => {
		if (typeof date == "number") {
			date = new Date(date);
		}
		if (date instanceof Date) {
			try {
				return date.toISOString();
			} catch (e) {}
		}
	},
};
