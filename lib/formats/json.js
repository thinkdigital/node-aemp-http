import utils from "../utils.js";

export default {
	headers : (res) => {
		res.setHeader("Content-Type", "application/json");
	},
	fleet : (handler, page, pages, data) => {
		const Links     = utils.buildPageLinks(handler.url(), "/fleet", page, pages);
		const Equipment = [];

		data.map(equipment => {
			const Element = {};

			Element.EquipmentHeader = utils.convertStructure(equipment, {
				OEMName     : "brand",
				Model       : "model",
				EquipmentID : "uid",
			});

			if (equipment.position) {
				Element.Location = utils.convertStructure(equipment.position, {
					Latitude  : "lat",
					Longitude : "lon",
					Address   : "addr",
					Altitude  : "alt",
				}, {
					AltitudeUnits : utils.altitudeUnit,
					Datetime      : utils.formatDate(equipment.position?.date),
				});
			}

			if (equipment.engine_hours) {
				Element.CumulativeOperatingHours = utils.convertStructure(equipment.engine_hours, {
					Hour : "value",
				}, {
					Datetime : utils.formatDate(equipment.engine_hours?.date),
				});
			}

			if (equipment.fuel) {
				Element.FuelUsed = utils.convertStructure(equipment.fuel, {
					FuelConsumed : "value",
				}, {
					FuelUnits : utils.fuelUnit,
					Datetime  : utils.formatDate(equipment.fuel?.date),
				});
			}

			if (equipment.distance) {
				Element.Distance = utils.convertStructure(equipment.distance, {
					Odometer : "value",
				}, {
					OdometerUnits : utils.distanceUnit,
					Datetime      : utils.formatDate(equipment.distance?.date),
				});
			}

			Equipment.push(Element);
		});

		return JSON.stringify({ Links, Equipment }, null, 2);
	},
};
