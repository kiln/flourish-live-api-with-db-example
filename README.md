# Using data from a database in the Flourish Live API

This examples shows the steps needed to fetch data from a database, and use that data to generate visualisations using the Flourish Live API. It is written in Node.js using SQLite as the database, but the same principles could be applied to almost any backend language and database.

## Pre-requisites

You need access to the Flourish API. This is an enterprise-level bolt-on and not available to all customers. If you are interested getting access to the Flourish API, please contact sales@flourish.studio.

To run the example, you need a version of [Node.js](https://nodejs.org/) >= 12 installed on your system.

## Quick start

1. Clone this repository
2. Open a terminal in the cloned directory
3. Install the dependencies by running:
	```
	npm install
	```
4. Create a Flourish API key by visiting [your Flourish settings page](https://app.flourish.studio/settings), and copy it to your clipboard
5. Create a new file called `.env` by copying the `.env.example` file, and replacing `YOUR_API_KEY_HERE` with the API key you created in the previous step
6. Start the example by running `npm start`
7. Visit `http://localhost:8080` and choose one of the regions to see the dynamically populated Flourish visualisation

## How it works

### Fetching data

The first step in dynamically creating a visualisation is to fetch the data from the database. When the client makes a request to the `/:region` endpoint (for example, by visiting http://localhost:8080/Europe), the server makes a request to the database to fetch the data for the corresponding region.

### Sending it to the client

When the data has been fetched, it then needs to be made available to the client-side JavaScript which will render the visualisation. In this example, this is achieved using a data attribute. The server JSON encodes the array of data, and returns it as part of the generated HTML in the `data-chart-data` attribute of a `<div>`. So, for example, if you were fetching data containing number of grand slam tournaments won by tennis players, the div might looks something like this:

```
<div class='chart-container' data-chart-data='[{"name": "Margret Court", "wins": 24}, {"name": "Serena Williams", "wins": 23}]'></div>
```

Alternatively, you could fetch this data using a separate AJAX request and then procede to render the visualisation.

### Rendering the visualisation

To create the visualisation, the client-side JavaScript first retreives this data from the data attribute, and decodes the JSON. It then passes the data to the Flourish Live API, along with a information about which type of visualisation to create, and how the columns of data should be mapped to different aspects of the visualisation (the data bindings). You can read more about the options passed to the live API in [the API documentation](https://developers.flourish.studio/api/create-visualisation/).

### Keeping the API key secret

In order to access the Live API, you need to provide a valid API key. To keep the key secret, you should proxy requests to the API through your server, adding the key on the server-side rather than exposing it to the client. To do this, you can add the `api_url` option to your call to the Live API. In this case we say:

```
api_url: "/flourish",
```

This means that all requests to the Live API will be sent to the `/flourish` endpoint. The endpoint adds the API key as a search parameter to the request, and forwards the it on to the Live API which is hosted at https://flourish-api.com/api/v1/live.

