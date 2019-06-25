# Flex Transfer Chat/SMS Plugin

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer-ui.jpg)

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. It is on the roadmap and when its released you should migrate to that solution.**

---

## Details
This plugin will add a transfer button near the End Chat button. Clicking this button will open the default worker/queue directory. Upon selecting a Queue, this plugin will initiate a blind transfer of the chat task to the specified queue.

Because Flex does not yet support transfering Chat/SMS tasks natively, this plugin works by creating a new task and routing it through your workflow as normal. The original task is automatically completed by

It is up to you to implement the necessary Task Router routing rules to send the task to the specified queue. To aid you in this, two new attributes will be added to your tasks: `ignoreAgent` and `requiredQueue`. 

The selected queue sid will be populated in the `requiredQueue` attribute, and the agent that initiated the transfer will be added to the `ignoreAgent` attribute - this will aid you in ensuring that the last agent to transfer the task will not receive the transfer they initiated.

## Required Flex Version
This plugin requires Flex v1.9 and above. 

## Prerequisite Function

There is a single function Located in `src/functions` that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/functions), or to replicate in your own backend application.

### Required Env Variables in your Function
The provided functions in their current state are looking for your TaskRouter Workspace Sid in the `TWILIO_WORKSPACE_SID` variable. Please ensure this is set in your Twilio Function configuration.

### Required NPM Package for your Function Environment
This plugin uses a Twilio function to actually perform the "transfer" of the chat task. If you use the [Twilio Functions Runtime](https://www.twilio.com/functions) you'll want to validate that the incoming requests to your function are actually coming from a Flex front-end. 

This plugin will send the Flex user's token along with the task information to transfer, upon validating the token, it will intiate the transfer. This plugin expects that you've [configured your Twilio Functions Runtime](https://www.twilio.com/console/runtime/functions/configure) dependencies and added the `twilio-flex-token-validator` package.

![Twilio Token Validator Configuration](https://indigo-bombay-5783.twil.io/assets/twilio-function-validator.jpg)

---

## Run Locally

### Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Afterwards install the dependencies by running `npm install`:

```bash
cd plugin-chat-transfer

# If you use npm
npm install
```
### Development

In order to develop locally, you can use the Webpack Dev Server by running:

```bash
npm start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:8080`. If you want to change that you can do this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

When you make changes to your code, the browser window will be automatically refreshed.

### Deploy

Once you are happy with your plugin, you have to bundle it, in order to deply it to Twilio Flex.

Run the following command to start the bundling:

```bash
npm run build
```

Afterwards, you'll find in your project a `build/` folder that contains a file with the name of your plugin project. For example `plugin-example.js`. Take this file and upload it into the Assets part of your Twilio Runtime.

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex which would provide them globally.