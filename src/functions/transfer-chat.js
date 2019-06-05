// be sure to configure your function runtime with the `twilio-flex-token-validator` npm package
// https://www.twilio.com/console/runtime/functions/configure
// twilio-flex-token-validator:*

const JWEValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = JWEValidator(function(context, event, callback) {

    // setup twilio client
    const client = context.getTwilioClient();

    // parse data form the incoming http request
    const originalTaskSid = event.taskSid;
    const destinationQueueSid = event.destinationQueue;
    const workerName = event.workerName;

    // setup a response object
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    // retrieve original task's attributes
    client
    .taskrouter
    .workspaces(context.TWILIO_WORKSPACE_SID)
    .tasks(originalTaskSid)
    .fetch()
    .then(task => {
        let newAttributes = JSON.parse(task.attributes);

        // setup new task's attributes such that its linked to the
        // original task in Twilio WFO
        if (!newAttributes.hasOwnProperty('conversations')) {
          newAttributes = Object.assign(newAttributes, {
              conversations: {
                  conversation_id: originalTaskSid
              }
          })
        }

        // update task attributes to ignore the agent who transferred the task
        // its possible that the agent who transferred the task in the queue
        // the task is being transferred to - but we don't want them to
        // receive a task they just transferred. It's also possible the agent
        // is simply transferring to the same queue the task is already in
        // once again, we don't want the transferring agent to receive the task
        newAttributes.ignoreAgent = workerName;

        // update task attributes to put the required queue sid on the task
        // your workflow would need to be updated to honor these values
        // and ensure the task makes it to the correct agent/queue
        newAttributes.requiredQueue = destinationQueueSid;

        // create New task
        client
        .taskrouter
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .tasks
        .create({
            taskChannel: task.taskChannelUniqueName,
            attributes: JSON.stringify(newAttributes),
            workflowSid: context.TWILIO_WORKFLOW_SID
        }).then(task => {

            // complete old task
            client
            .taskrouter
            .workspaces(context.TWILIO_WORKSPACE_SID)
            .tasks(originalTaskSid)
            .update({
              assignmentStatus: 'completed',
              reason: 'task transferred'
            })
            .then((completedTask) => {
                response.setBody({
                    taskSid: task.sid
                });
                callback(null, response);
            }).catch(e => {
                callback(e);
            })
        })
        .catch(e => {
            callback(e);
        });
    }).catch(e => {
        callback(e);
    })
});