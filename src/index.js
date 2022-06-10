require("dotenv").config();

if (!process.env.FLOURISH_API_KEY) {
	console.error("No Flourish API key supplied");
	process.exit(1);
}

const path = require("path");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const { createProxyMiddleware } = require("http-proxy-middleware");
const sqlite3 = require("sqlite3").verbose();

// Create the server
const app = express();

// Connect to the database
const db = new sqlite3.Database(path.join(__dirname, "..", "database.db"));

// Set up templating. Calls to res.render will renderer the handlebars
// template from src/views.
app.engine("handlebars", expressHandlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// The home page
// Lists the different variations of the visualisation which you can view
app.get("/", (req, res) => {
	// Fetch a list of regions from the database
	const data = db.all(`
		select * from region
	`, (err, regions) => {
		// Render the template in src/views/home.handlebars, passing in the data
		// fetched from the database.
		res.render("home", {
			regions
		});
	});
});

// The visualisation pages
// Displays the visualisation with data for a particular region
app.get("/:region", (req, res) => {
	// Fetch the data from the database
	const data = db.all(`
		select country.*
		from country
		join region on country.region_id = region.id
		where region.name=?
	`, req.params.region, (err, data) => {
		// Render the template in src/views/chart.handlebars, passing in the data
		// fetched from the database. The template contains the JavaScript which
		// calls the Flourish Live API to render the chart.
		res.render("chart", {
			data: JSON.stringify(data)
		});
	});
});

// Proxy calls to the Flourish API, adding in the API key so that it isn't
// exposed to the client-side.
// For example, a request to /flourish/template will be redirected to
// https://flourish-api.com/api/v1/live/template.
app.use("/flourish", createProxyMiddleware({
	target: "https://flourish-api.com/api/v1/live",
	onProxyReq: (proxyReq) => {
		// When we proxy a request, add the API key to the the query string
		const url = new URL(proxyReq.path, `${proxyReq.protocol}//${proxyReq.host}`);
		url.searchParams.set("api_key", process.env.FLOURISH_API_KEY);
		proxyReq.path = `${url.pathname}${url.hash}${url.search}`;
	},
	changeOrigin: true,
	pathRewrite: { "^/flourish": "" }
}));

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
