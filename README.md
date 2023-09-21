# AEMP

Implementation of AEMP Telematics Data Standard according to ISO/TS 15143-3:2020

**No version yet, just reserving the package name**

## Install

```sh
npm i aemp-http
```

## Usage

```js
const handler = new Handler({
	devices : 1000, // total devices exposed (for pagination)
	url     : "http://url.to.this.api/fleet",
});
const router = express.Router(); // or get a router

handler.attachRouter(router);

handler.on("fleet", (req, res) => {
	console.log(req.aemp);
	console.log("requesting fleet call for page %d", req.page);

	res.reply([{
		uid          : "imei:123456789",
		brand        : "Renault",
		model        : "Clio",
		position     : { lat: -8, lon: 40, alt: 50, date: new Date },
		fuel         : { value: 5000, date: new Date },   // total fuel
		distance     : { value: 12345, date : new Date }, // total distance
		engine_hours : { value: 1000, date : new Date },  // total engine hours
	}, /* ... */ ]);
});
```
