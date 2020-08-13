<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Chat and SMS Transfers for Flex

The Chat and SMS Transfers for Flex plugin helps contact center administrators set up transferring of Chats and SMS between Agents.

**As of the writing of this document, Flex does not natively support transferring of non-voice tasks. To track the addition of Chat and SMS transfers as a feature, visit the [Flex Release Notes](https://www.twilio.com/docs/flex/release-notes) page.**

**Note if you have deployed this plugin between March 26 and August 11, 2020:** We recently made a fix that cleans up the channels of your agents when they perform a chat or SMS transfer. This will ensure that your agents don’t hit the limit of the channels they can join. We recommend installing the latest version of the plugin in order to get this change. See [Plugin Deployment instructions](#) to redeploy the plugin and [GitHub Issue #21](https://github.com/twilio-professional-services/plugin-chat-sms-transfer/issues/21) for more details on the bug.

---

## Set up

### Requirements

To deploy this plugin, you will need:
- An active Twilio account. [Sign up](https://www.twilio.com/try-twilio) if you don't already have one
- A Twilio Flex instance where you have admin permissions. See our [getting started guide](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project) to create one 
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
   ```
   # Install the Twilio CLI
   npm install twilio-cli -g
   # Install the Serverless and Flex as Plugins
   twilio plugins:install @twilio-labs/plugin-serverless
   twilio plugins:install @twilio-labs/plugin-flex
- A GitHub account

### Twilio Account Settings

Before we begin, we need to collect
all the config values we need to run this Flex plugin:

| Config&nbsp;Value | Description                                                                                                                                                  |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                         |
| Auth Token | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console). |
| Workspace SID | Your Flex Task Assignment workspace SID - find this [in the Console TaskRouter Workspaces page](https://www.twilio.com/console/taskrouter/workspaces). |
| Queue SID(s) | The unique IDs of the Flex task queues you wish to use for chat or SMS transfers - find this in the Console TaskRouter TaskQueues page. |

## Plugin Details

The Chat and SMS Transfers for Flex plugin adds a **Transfer** button near the **End Chat** button that comes out of the box with Flex. Clicking this button opens up the default [WorkerDirectory Flex component](https://www.twilio.com/docs/flex/ui/components#workerdirectory) with Agents and Queues tabs. Upon selecting an agent or a queue, this plugin will initiate a transfer of the chat task to the specified worker (agent) or queue.

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer.gif)

Because Flex does not natively support chat and SMS transfers, this plugin works by creating a new task and routing it through your workflow as normal. Subsequent "transfer" tasks are linked to the original task to be compatible with Flex Insights reporting.

This plugin supports both warm and cold transfers to agents and queues. The phone icon serves as the **Warm Transfer** button while the right arrow serves as the **Cold Transfer** button. 

It is up to you to implement the necessary TaskRouter routing rules to send the task to the specified queue or worker. To aid you in this, three new attributes within [`functions/transfer-chat.js`](functions/functions/transfer-chat.js) will be added to your tasks: `targetSid`, `transferTargetType`, and `ignoreAgent`:

| Attribute | Expected Setting |
|-----------|----------------|
| `targetSid` | Worker or Queue Sid which will be used to determine if you are transferring to a worker or a queue. |
| `transferTargetType` | Can be set to `worker` or `queue` and lets your workflow route the task to a specific agent or queue. If you are routing the task to a specific worker, we recommend you have a queue like the "Everyone" queue where all workers are members of the queue. Additionally, set the `targetSid` to the Sid of the worker you want to transfer the chat or SMS task to. | 
| `ignoreAgent` | This will be populated by the name of the agent who initiated the chat/SMS transfer. This ensures that the last agent to transfer the task will not receive the transfer they initiated, *assuming they are transferring the Task to a queue they are already a member of.*  |

---

### Local development

After the above requirements have been met:

1. Clone this repository.

```
git clone git@github.com:twilio-professional-services/plugin-chat-sms-transfer.git
```

2. Rename the example app configuration file.

```
plugin-chat-sms-transfer $ mv public/appConfig.example.js public/appConfig.js
```

3. Install dependencies.

```bash
npm install
```

5. [Deploy your Twilio Function](#twilio-serverless-deployment).

6. Set your environment variables.

```bash
npm run setup
```

See [Twilio Account Settings](#twilio-account-settings) to locate the necessary environment variables.

4. Run the application.

```bash
npm start
```

Alternatively, you can use this command to start the server in development mode. It will reload whenever you change any files.

```bash
npm run dev
```

5. Navigate to [http://localhost:3000](http://localhost:3000).

That's it!

### Twilio Serverless deployment

You need to deploy the function associated with the Chat and SMS Transfers plugin to your Flex instance. The function is called from the plugin you will deploy in the next step and integrates with TaskRouter, passing in required attributes to perform the chat transfer.

#### Pre-deployment Steps

Step 1: Change into the functions directory and rename `.env.sample`.

```
plugin-chat-sms-transfer $ cd functions && mv .env.sample .env
```

Step 2: Open `.env` with your text editor and set the environment variables mentioned in the file.

```
TWILIO_ACCOUNT_SID = ACaaaa
TWILIO_AUTH_TOKEN = 93bbbb
TWILIO_WORKSPACE_SID = WScccc
TWILIO_CHAT_TRANSFER_WORKFLOW_SID = WWdddd
```

Step 3: Deploy the Twilio function to your account using the Twilio CLI:
```
functions $ twilio serverless:deploy

# Example Output
Deploying functions & assets to the Twilio Runtime
⠇ Creating 1 Functions
✔ Serverless project successfully deployed

Deployment Details
Domain: chat-transfer-4876-dev.twil.io
Service:
   chat-transfer (ZSxxxx)
...
```

Step 4: Copy and save the domain returned when you deploy a function. You will need it in the next step.

If you forget to copy the domain, you can also find it by navigating to [Functions > API](https://www.twilio.com/console/functions/api) in the Twilio Console.

> Debugging Tip: Pass the `-l` or logging flag to review deployment logs. 

### Flex Plugin Deployment

Once you have deployed the function, it is time to deploy the plugin to your Flex instance.

You need to modify the source file to mention the serverless domain of the function that you deployed previously.

- Open src/ChatTransferPlugin.js in a text editor of your choice. 
- Paste the Function deployment domain in the variable SERVERLESS_FUNCTION_DOMAIN.
   ```
   const SERVERLESS_FUNCTION_DOMAIN = 'plugin-chat-sms-transfer-7325-dev.twil.io';
   ```
   
When you are ready to deploy the plugin, run the following in a command shell:
```
twilio flex:plugins:deploy
```

The Chat Transfer Plugin is now active on your contact center!

#### Example Output

```
Uploading your Flex plugin to Twilio Assets

✔ Fetching Twilio Runtime service
✔ Validating the new plugin bundle
✔ Uploading your plugin bundle
✔ Registering plugin with Flex
✔ Deploying a new build of your Twilio Runtime

🚀  Your plugin has been successfully deployed to your Flex project Flex Solution Guide Chat Transfer  (ACxxxxx).
...
```

You are all set to test Chat and SMS transfers on your Flex instance!
