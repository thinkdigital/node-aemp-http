import EventEmitter from "events";
import json         from "./formats/json.js";
import xml          from "./formats/xml.js";
import utils        from "./utils.js";

class AEMPHandler extends EventEmitter {
	#device_total    = 0;
	#device_per_page = 100;
	#url             = "http://undefined.url";

	constructor(options = {}) {
		super();

		if (options.devices > 0) {
			this.#device_total = options.devices;
		}

		if (options.url?.length) {
			this.#url = options.url;
		}
	}

	deviceTotal(new_value) {
		if (new_value > 0) {
			this.#device_total = new_value;
		}

		return this.#device_total;
	}

	devicePerPage(new_value) {
		if (new_value > 0) {
			this.#device_per_page = new_value;
		}

		return this.#device_per_page;
	}

	url() {
		return this.#url;
	}

	attachRouter(router) {
		this.#attachRouterBase(router);
		this.#attachRouterFleet(router);
	}

	#attachRouterBase(router) {
		router.use((req, res, next) => {
			if (!("accept" in req.headers)) {
				req.aemp = {
					version : "20161201",
					format  : "xml",
				};
			} else {
				const match = req.headers.accept.match(/^application\/(.*?)iso15143(\-\d\.v(\d{8})|\-snapshot)\+(xml|json)$/);

				if (!match) {
					// return utils.responseStatus(res, 406);
					req.aemp = {
						version : "20161201",
						format  : "xml",
					};
				} else {
					req.aemp = {
						version : match[3] || "snapshot",
						format  : match[4],
					};
				}
			}

			if (req.aemp.format == "xml") {
				req.aemp.handler = xml;
			} else {
				req.aemp.handler = json;
			}

			return next();
		});
	}

	#attachRouterFleet(router) {
		router.get("/fleet/:page", (req, res) => {
			const pages = Math.ceil(this.#device_total / this.#device_per_page);
			const page  = parseInt(req.params.page, 10);

			if (isNaN(page) || page < 0 || page > pages) {
				return utils.responseStatus(res, 404);
			}

			this.emit("fleet", {
				aemp : req.aemp,
				page : page,
			}, {
				reply : (data) => {
					utils.reply(req, res, req.aemp.handler.fleet(this, page, pages, data));
				},
				fail  : (code) => {
					if (typeof code == "number") {
						return utils.responseStatus(res, code);
					}

					return utils.responseStatus(res, 500);
				},
			});
		});
	}
};

export {
	AEMPHandler as Handler,
};
