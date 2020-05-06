# Flex Chat/SMS Transfer Plugin

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. To track the addition of Chat/SMS transfers as a feature, visit the [Flex Release Notes](https://www.twilio.com/docs/flex/release-notes) page.**

---

## Prerequisites

To deploy this plugin, you will need:
- An active Twilio account. [Sign up](https://www.twilio.com/try-twilio) if you don't already have one
- A Flex instance (on flex.twilio.com) where you have owner, admin, or developer permissions
- [TaskRouter Queues](https://www.twilio.com/docs/flex/routing/api/task-queue) you wish to use for chat or SMS transfers


## Details

The Chat/SMS Transfer Flex plugin adds a **Transfer** button near the **End Chat** button that comes out of the box with Flex. Clicking this button opens up the default [WorkerDirectory Flex component](https://www.twilio.com/docs/flex/ui/components#workerdirectory) with Agents and Queues tabs. Upon selecting an agent or a queue, this plugin will initiate a transfer of the chat task to the specified worker (agent) or queue.

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer.gif)

Because Flex does not natively support chat and SMS transfers, this plugin works by creating a new task and routing it through your workflow as normal. Subsequent "transfer" tasks are linked to the original task to be compatible with Flex Insights reporting.

This plugin supports both warm and cold transfers to agents and queues. The phone icon serves as the **Warm Transfer** button while the right arrow serves as the **Cold Transfer** button. 

It is up to you to implement the necessary TaskRouter routing rules to send the task to the specified queue or worker. To aid you in this, three new attributes within [`functions/transfer-chat.js`](functions/functions/transfer-chat.js) will be added to your tasks: `targetSid`, `transferTargetType`, and `ignoreAgent`:

| Attribute | Expected Setting |
|-----------|----------------|
| `targetSid` | Worker or Queue Sid which will be used to determine if you are transferring to a worker or a queue. |
| `transferTargetType` | Can be set to `worker` or `queue` and lets your workflow route the task to a specific agent or queue. If you are routing the task to a specific worker, we recommend you have a queue like the "Everyone" queue where all workers are members of the queue. Additionally, set the `targetSid` to the Sid of the worker you want to transfer the chat or SMS task to. | 
| `ignoreAgent` | This will be populated by the name of the agent who initiated the chat/SMS transfer. This ensures that the last agent to transfer the task will not receive the transfer they initiated, *assuming they are transferring the Task to a queue they are already a member of.*  |

### Prerequisite Function

There is a single function located in the `functions` directory that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/docs/runtime), or to replicate in your own backend application.

##### Required Env Variables in your Function

The provided functions in their current state are looking for your TaskRouter Workspace Sid in the `TWILIO_WORKSPACE_SID` variable and your workflowSid in `TWILIO_WORKFLOW_SID`. Please ensure that these are set in your Twilio Function configuration.

From the repo root directory, change into functions and rename `.env.sample`.
```
cd functions && mv .env.sample .env
```

Follow the instructions on the file and set your Flex project configuration values as environment variables.

#### Function Deployment via the Twilio CLI

One way to deploy the plugin function to the Twilio Functions Runtime is to use the Twilio CLI and the Serverless Plugin. To get started, see the [Twilio CLI Quickstart](https://www.twilio.com/docs/twilio-cli/quickstart#warning-for-nodejs-developers) and [Install the Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started).

To confirm that your environment variables have been set properly, run the following:

```
twilio serverless:list
```

To deploy the serverless function to the Serverless API, run:

```
twilio serverless:deploy
```

You can review your deployed resources in the Twilio Console by selecting your Flex project from the dropdown list on the upper left corner of the screen and navigating to **Functions > API**. To learn more about the Functions and Assets API, see [Functions & Assets (API Only): Beta limitations, known issues and limits](https://www.twilio.com/docs/runtime/functions-assets-api).


##### Required NPM Package for your Function Environment

This plugin uses a Twilio function to perform the "transfer" of the chat task. If you use the [Twilio Functions Runtime](https://www.twilio.com/docs/runtime), you'll need to validate that the incoming requests to your serverless function are coming from a Flex front-end.

This plugin will send the Flex user's token along with the task information to transfer. Upon validating the token, it will initiate the transfer. This plugin expects that you've [configured your Twilio Functions Runtime](https://www.twilio.com/console/runtime/functions/configure) dependencies and added the `twilio-flex-token-validator` package.

![Twilio Token Validator Configuration](https://indigo-bombay-5783.twil.io/assets/twilio-function-validator.jpg)

---

## Run Locally

### Setup

Make sure you have [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed. 

Afterwards, install the dependencies by running `npm install`:

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

This will automatically start the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. To change the port, set the `PORT` environment variable:

```bash
PORT=8000 npm start
```

When you make changes to your code, the browser window will be automatically refreshed.

### Deploy

Once you are happy with your plugin, bundle it and deploy it to Twilio Flex.

Run the following command to start the bundling:

```bash
npm run build
```

Afterwards, you'll find in your project a `build` folder that contains a file with the name of your plugin project. For example `plugin-<plugin-name>.js`. Take this file and upload it to the Assets part of your Twilio Runtime.

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex which would provide them globally.
