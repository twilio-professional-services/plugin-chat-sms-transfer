/* eslint-disable camelcase, import/no-unresolved, func-names */
const JWEValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = JWEValidator(async function (context, event, callback) {
  // set up twilio client
  const client = context.getTwilioClient();

  // setup a response object
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent',
  );
  response.appendHeader('Vary', 'Origin');

  // parse data form the incoming http request
  const originalTaskSid = event.taskSid;
  const { targetSid } = event;
  const { workerName } = event;

  // retrieve attributes of the original task
  const originalTask = await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks(originalTaskSid).fetch();
  let newAttributes = JSON.parse(originalTask.attributes);

  /*
   * set up attributes of the new task to link them to
   * the original task in Flex Insights
   */
  if (!newAttributes.hasOwnProperty('conversations')) {
    newAttributes = Object.assign(newAttributes, {
      conversations: {
        conversation_id: originalTaskSid,
      },
    });
  }

  /*
   * update task attributes to ignore the agent who transferred the task
   * it's possible that the agent who transferred the task is in the queue
   * the task is being transferred to - but we don't want them to
   * receive a task they just transferred. It's also possible the agent
   * is simply transferring to the same queue the task is already in
   * once again, we don't want the transferring agent to receive the task
   */
  newAttributes.ignoreAgent = workerName;

  /*
   * update task attributes to include the required targetSid on the task
   * this could either be a workerSid or a queueSid
   */
  newAttributes.targetSid = targetSid;

  // add an attribute that will tell our Workflow if we're transferring to a worker or a queue
  if (targetSid.startsWith('WK')) {
    newAttributes.transferTargetType = 'worker';
  } else {
    newAttributes.transferTargetType = 'queue';
  }

  // create New task
  const newTask = await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks.create({
    workflowSid: context.TWILIO_CHAT_TRANSFER_WORKFLOW_SID,
    taskChannel: originalTask.taskChannelUniqueName,
    attributes: JSON.stringify(newAttributes),
  });

  /*
   * Remove the original transferred task's reference to the chat channelSid
   * this prevents Twilio's Janitor service from cleaning up the channel when
   * the original task gets completed.
   */
  const originalTaskAttributes = JSON.parse(originalTask.attributes);
  delete originalTaskAttributes.channelSid;

  // update task and remove channelSid
  await client.taskrouter
    .workspaces(context.TWILIO_WORKSPACE_SID)
    .tasks(originalTaskSid)
    .update({
      attributes: JSON.stringify(originalTaskAttributes),
    });

  // Close the original Task
  await client.taskrouter
    .workspaces(context.TWILIO_WORKSPACE_SID)
    .tasks(originalTaskSid)
    .update({ assignmentStatus: 'completed', reason: 'task transferred' });

  response.setBody({
    taskSid: newTask.sid,
  });

  callback(null, response);
});
