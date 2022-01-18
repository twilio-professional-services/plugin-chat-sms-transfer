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

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 12 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
  ```bash
  # Install the Twilio CLI
  npm install twilio-cli -g
  # Install the Serverless and Flex as Plugins
  twilio plugins:install @twilio-labs/plugin-serverless
  twilio plugins:install @twilio-labs/plugin-flex
  ```

### Contributing

All contributions and improvements to this plugin are welcome! To run the tests of the plugin: `npm run test`.

### Twilio Account Settings

Before we begin, we need to collect
all the config values we need to run this Flex plugin:

| Config&nbsp;Value | Description                                                                                                                                            |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                   |
| Auth Token        | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console).                   |
| Workspace SID     | Your Flex Task Assignment workspace SID - find this [in the Console TaskRouter Workspaces page](https://www.twilio.com/console/taskrouter/workspaces). |
| Queue SID(s)      | The unique IDs of the Flex task queues you wish to use for chat or SMS transfers - find this in the Console TaskRouter TaskQueues page.                |

## Plugin Details

The Chat and SMS Transfers for Flex plugin adds a **Transfer** button near the **End Chat** button that comes out of the box with Flex. Clicking this button opens up the default [WorkerDirectory Flex component](https://www.twilio.com/docs/flex/ui/components#workerdirectory) with Agents and Queues tabs. Upon selecting an agent or a queue, this plugin will initiate a transfer of the chat task to the specified worker (agent) or queue.

![Chat Transfer UI](https://indigo-bombay-5783.twil.io/assets/chat-transfer.gif)

Because Flex does not natively support chat and SMS transfers, this plugin works by creating a new task and routing it through your workflow as normal. Subsequent "transfer" tasks are linked to the original task to be compatible with Flex Insights reporting.

It is up to you to implement the necessary TaskRouter routing rules to send the task to the specified queue or worker. To aid you in this, three new attributes within [`functions/transfer-chat.js`](functions/functions/transfer-chat.js) will be added to your tasks: `targetSid`, `transferTargetType`, and `ignoreAgent`:

| Attribute            | Expected Setting                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetSid`          | Worker or Queue Sid which will be used to determine if you are transferring to a worker or a queue.                                                                                                                                                                                                                                                                  |
| `transferTargetType` | Can be set to `worker` or `queue` and lets your workflow route the task to a specific agent or queue. If you are routing the task to a specific worker, we recommend you have a queue like the "Everyone" queue where all workers are members of the queue. Additionally, set the `targetSid` to the Sid of the worker you want to transfer the chat or SMS task to. |
| `ignoreAgent`        | This will be populated by the name of the agent who initiated the chat/SMS transfer. This ensures that the last agent to transfer the task will not receive the transfer they initiated, _assuming they are transferring the Task to a queue they are already a member of._                                                                                          |

---

### Local development

After the above requirements have been met:

1. Clone this repository.

    ```bash
    git clone git@github.com:twilio-professional-services/plugin-chat-sms-transfer.git
    ```

2. Install dependencies.

  ```bash
  npm install
  ```

3. [Deploy your Twilio Function](#twilio-serverless-deployment).

4. Set your environment variables.

    ```bash
    npm run setup
    ```

See [Twilio Account Settings](#twilio-account-settings) to locate the necessary environment variables.

5. Run the application.

    ```bash
    twilio flex:plugins:start
    ```

6. Navigate to [http://localhost:3000](http://localhost:3000).

That's it!

### Twilio Serverless deployment

You need to deploy the function associated with the Chat and SMS Transfers plugin to your Flex instance. The function is called from the plugin you will deploy in the next step and integrates with TaskRouter, passing in required attributes to perform the chat transfer.

#### Pre-deployment Steps

1. Change into the functions directory and rename `.env.example`.

    ```bash
    cd functions && cp .env.example .env
    ```

2. Open `.env` with your text editor and set the environment variables mentioned in the file.

    ```
    TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    TWILIO_AUTH_TOKEN=9yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    TWILIO_WORKSPACE_SID=WSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    TWILIO_CHAT_TRANSFER_WORKFLOW_SID=WWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    ```

3. Deploy the Twilio function to your account using the Twilio CLI:
  
    ```bash
    cd functions && twilio serverless:deploy
    
    # Example Output
    # Deploying functions & assets to the Twilio Runtime
    # ⠇ Creating 1 Functions
    # ✔ Serverless project successfully deployed
    
    # Deployment Details
    # Domain: https://plugin-chat-sms-transfer-functions-xxxx-dev.twil.io
    # Service:
    #    chat-transfer (ZSxxxx)
    # ..
    ```

4. Copy and save the domain returned when you deploy a function. You will need it in the next step.

If you forget to copy the domain, you can also find it by navigating to [Functions > API](https://www.twilio.com/console/functions/api) in the Twilio Console.

> Debugging Tip: Pass the `-l` or logging flag to review deployment logs.

### Flex Plugin Deployment

Once you have deployed the function, it is time to deploy the plugin to your Flex instance.

You need to modify the source file to mention the serverless domain of the function that you deployed previously.

1. In the main directory rename `.env.example`.

    ```bash
    cp .env.example .env
    ```
2. Open `.env` with your text editor and set the environment variables mentioned in the file.

    ```
    # Paste the Function deployment domain
    REACT_APP_SERVERLESS_FUNCTION_DOMAIN='https://plugin-chat-sms-transfer-functions-xxxx-dev.twil.io';
    ```
3. When you are ready to deploy the plugin, run the following in a command shell:

    ```bash
    twilio flex:plugins:deploy --major --changelog "Update the plugin to use Builder v4" --description "Chat and SMS Cold Transfers in Flex"
    ```

#### Example Output

```
✔ Validating deployment of plugin plugin-chat-sms-transfer
⠧ Compiling a production build of plugin-chat-sms-transferPlugin plugin-chat-sms-transfer was successfully compiled with some warnings.
✔ Compiling a production build of plugin-chat-sms-transfer
✔ Uploading plugin-chat-sms-transfer
✔ Registering plugin plugin-chat-sms-transfer with Plugins API
✔ Registering version v2.0.0 with Plugins API

🚀 Plugin (private) plugin-chat-sms-transfer@2.0.0 was successfully deployed using Plugins API

Next Steps:
Run $ twilio flex:plugins:release --plugin plugin-chat-sms-transfer@2.0.0 --name "Autogenerated Release 1602189036080" --description "The description of this Flex Plugin Configuration" to enable this plugin on your Flex application
```

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test Chat and SMS transfers on your Flex application!

---

## Changelog

### 2.0.0

**November 18, 2020**

- Updated plugin to use the latest Flex plugin for the Twilio CLI. 
- Updated prerequisites and deployment instructions in the README. For more details, see [Keeping Plugins Up-to-Date](https://www.twilio.com/docs/flex/developer/plugins/updating).

### 1.3.1

**September 25, 2020**

- Added full test suite and GitHub actions. Updated readme with instructions on how to run tests.

### 2.0.0

**September 25, 2020**

- Added error handling that rejoins the original agent to the chat session should an error occur during the transfer request.

### 1.2.0

**September 4, 2020**

- We now fully bypass the Flex ChatOrchestrator object and manually remove agent's from chat sessions. This ensures agents don't hit the 250 Chat Channel limit while transfering chat sessions.

### 1.1.0

**August 20, 2020**

- Twilio Channel Janitor will no longer clean up chat channels as soon as they are transferred. Now you can operate this plugin even if you have the Janitor service enabled on your Flex Flow.
- Unfortunately, we can't make warm transfers work with this new update, so all transfers are now "cold" (meaning the initiating agent will have their task immediately completed).
- We had previously been hardcoding `http://` protocol in the `fetch` call to the associated Twilio function. This has been removed and your `SERVERLESS_FUNCTION_DOMAIN` should now specify your desired protocol. This makes transitioning from local development to production a little easier.

### 1.0.1

**August 13, 2020**

- Updated README - added changelog

### 1.0.0

**August 11, 2020**

- Fixes [GitHub Issue #21](https://github.com/twilio-professional-services/plugin-chat-sms-transfer/issues/21)


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
