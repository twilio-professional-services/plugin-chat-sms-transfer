# Flex Transfer Chat/SMS Plugin

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer-ui.jpg)

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. It is on the roadmap and when its released you should migrate to that solution.**

---

## Prerequisite Functions

Located in `src/functions` are two javascript files that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/functions), or to replicate in your own backend application.

### Required Env Variables in your Functions
The provided functions in their current state are looking for your TaskRouter Workspace Sid in the `TWILIO_WORKSPACE_SID` variable. Please ensure this is set in your Twilio Function configuration.

## appConfig.js

This plugin does expect you to provide the `serviceBaseUrl` parameter in your appConfig.js file. See the example in the repository. This would be the domain in which your hosted functions reside.

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Afterwards install the dependencies by running `npm install`:

```bash
cd plugin-chat-transfer

# If you use npm
npm install
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running:

```bash
npm start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:8080`. If you want to change that you can do this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

Once you are happy with your plugin, you have to bundle it, in order to deply it to Twilio Flex.

Run the following command to start the bundling:

```bash
npm run build
```

Afterwards, you'll find in your project a `build/` folder that contains a file with the name of your plugin project. For example `plugin-example.js`. Take this file and upload it into the Assets part of your Twilio Runtime.

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex which would provide them globally.