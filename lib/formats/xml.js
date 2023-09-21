import utils from "../utils.js";
import xmljs from "xml-js";

export default {
	headers : (res) => {
		res.setHeader("Content-Type", "application/xml");
	},
	fleet : (handler, page, pages, data) => {
		const Elements  = [];
		const Links     = [];

		utils.buildPageLinks(handler.url(), page, pages).map((link) => {
			Links.push(xmlNode("rel", link.Rel));
			Links.push(xmlNode("href", link.Href));
		});

		Elements.push(xmlNode("Links", null, Links));

		data.map(equipment => {
			const Equipment = xmlNode("Equipment");

			Equipment.elements.push(xmlNode("EquipmentHeader", null, xmlNodes(utils.convertStructure(equipment, {
				OEMName     : "brand",
				Model       : "model",
				EquipmentID : "uid",
			}))));

			if (equipment.position) {
				Equipment.elements.push(xmlNode("Location", null, xmlNodes(utils.convertStructure(equipment.position, {
					Latitude  : "lat",
					Longitude : "lon",
					Address   : "addr",
					Altitude  : xmlNodes(utils.convertStructure(equipment.position, {
						Meters : "alt",
					}))
				}, {
					AltitudeUnits : utils.altitudeUnit
				})), {
					datetime : utils.formatDate(equipment.position?.date),
				}));
			}

			if (equipment.engine_hours) {
				Equipment.elements.push(xmlNode("CumulativeOperatingHours", null, xmlNodes(utils.convertStructure(equipment.engine_hours, {
					Hour : "value",
				})), {
					datetime : utils.formatDate(equipment.date_engine_hours.date),
				}));
			}

			if (equipment.fuel) {
				Equipment.elements.push(xmlNode("FuelUsed", null, xmlNodes(utils.convertStructure(equipment.fuel, {
					FuelConsumed : "value",
				}, {
					FuelUnits : utils.fuelUnit,
				})), {
					datetime : utils.formatDate(equipment.fuel.date),
				}));
			}

			if (equipment.distance) {
				Equipment.elements.push(xmlNode("Distance", null, xmlNodes(utils.convertStructure(equipment.distance, {
					Odometer : "value",
				}, {
					OdometerUnits : utils.distanceUnit,
				})), {
					datetime : utils.formatDate(equipment.date_distance),
				}));
			}

			Elements.push(Equipment);
		});

		return xmljs.json2xml({
			declaration : {
				attributes : {
					version  : "1.0",
					encoding : "utf-8",
				},
			},
			elements : [{
				type       : "element",
				name       : "Fleet",
				elements   : Elements,
				attributes : {
					version      : "1.0",
					snapshotTime : utils.formatDate(new Date),
				}
			}],
		}, { compact: false, spaces : 2 });
	},
};

function xmlNodes(nodes) {
	const list = [];

	for (const k in nodes) {
		if (Array.isArray(nodes[k])) {
			list.push(xmlNode(k, null, nodes[k]));
		} else {
			list.push(xmlNode(k, nodes[k]));
		}
	}

	return list;
}

function xmlNode(name, value = null, childs = [], attributes = {}) {
	const element = {
		type       : "element",
		name       : name,
		elements   : childs,
		attributes : attributes,
	};

	if (value !== null) {
		element.elements.push({ type: "text", text: value });
	}

	return element;
}
