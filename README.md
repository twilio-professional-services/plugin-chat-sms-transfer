# Flex Transfer Chat/SMS Plugin

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer.gif)

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. It is on the roadmap and when its released you should migrate to that solution.**

---

## Details

This plugin will add a transfer button near the End Chat button. Clicking this button will open the default worker/queue directory. Upon selecting a Queue or Worker, this plugin will initiate a transfer of the chat task to the specified queue or worker.

Because Flex does not yet support transfering Chat/SMS tasks natively, this plugin works by creating a new task and routing it through your workflow as normal. These subsequent "transfer" tasks are linked to the original task to be compatible with Flex Insights reporting.

This plugin supports both warm and cold transfers to queues and workers.

It is up to you to implement the necessary Task Router routing rules to send the task to the specified queue or worker. To aid you in this, three new attributes will be added to your tasks: `ignoreAgent`, `targetSid`, and `transferTargetType`.

The sid of the worker OR queue will be populated in the `targetSid` attribute. The `functions/transfer-chat.js` function uses this value to determine if you are transfering the task to a worker or queue.

Upon parsing where you are attempting to transfer the task, the `functions/transfer-chat.js` function will add a `transferTargetType` attribute to the task with the possible values of `worker` or `queue`. This lets your workflow target the task to the appropriate queue.

If you are trying to route the task to a specific worker, we recommend you have a queue like the "Everyone" queue where all workers are members of the queue. Use the `targetSid` to target the worker that should be the recipient of the transfer.

The agent that initiated the transfer will be added to
the `ignoreAgent` attribute - this will aid you in ensuring that the last agent to transfer the task will not receive the transfer they initiated, _assuming they are transfering the Task to a queue they are already a member of_.

### Prerequisite Function

There is a single function Located in `functions` directory that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/functions), or to replicate in your own backend application.

##### Required Env Variables in your Function

The provided functions in their current state are looking for your TaskRouter Workspace Sid in the `TWILIO_WORKSPACE_SID` variable and your workflowSid in `TWILIO_WORKFLOW_SID`. Please ensure that these are set in your Twilio Function configuration.

##### Required NPM Package for your Function Environment

This plugin uses a Twilio function to actually perform the "transfer" of the chat task. If you use the [Twilio Functions Runtime](https://www.twilio.com/functions) you'll want to validate that the incoming requests to your function are actually coming from a Flex front-end.

This plugin will send the Flex user's token along with the task information to transfer, upon validating the token, it will intiate the transfer. This plugin expects that you've [configured your Twilio Functions Runtime](https://www.twilio.com/console/runtime/functions/configure) dependencies and added the `twilio-flex-token-validator` package.

![Twilio Token Validator Configuration](https://indigo-bombay-5783.twil.io/assets/twilio-function-validator.jpg)

---

## Run Locally

### Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Afterwards install the dependencies by running `npm install`:

```bash
cd plugin-chat-sms-transfer

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
