const JWEValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = JWEValidator(async function (context, event, callback) {
	// setup twilio client
	const client = context.getTwilioClient();

	// setup a response object
	const response = new Twilio.Response();
	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	// parse data form the incoming http request
	const originalTaskSid = event.taskSid;
	const targetSid = event.targetSid;
	const workerName = event.workerName;
	const mode = event.mode;

	// retrieve original task's attributes
	let originalTask = await client.taskrouter
		.workspaces(context.TWILIO_WORKSPACE_SID)
		.tasks(originalTaskSid)
		.fetch();
	let newAttributes = JSON.parse(originalTask.attributes);

	// setup new task's attributes such that its linked to the
	// original task in Flex Insights
	if (!newAttributes.hasOwnProperty('conversations')) {
		newAttributes = Object.assign(newAttributes, {
			conversations: {
				conversation_id: originalTaskSid,
			},
		});
	}

	// update task attributes to ignore the agent who transferred the task
	// its possible that the agent who transferred the task in the queue
	// the task is being transferred to - but we don't want them to
	// receive a task they just transferred. It's also possible the agent
	// is simply transferring to the same queue the task is already in
	// once again, we don't want the transferring agent to receive the task
	newAttributes.ignoreAgent = workerName;

	// update task attributes to put the required targetSid on the task
	// this could be either a workerSid or a queueSid
	newAttributes.targetSid = targetSid;

	// add an attribute that will tell our Workflow if we're transfering to a worker or queue
	if (targetSid.startsWith('WK')) {
		newAttributes.transferTargetType = 'worker';
	} else {
		newAttributes.transferTargetType = 'queue';
	}

	// create New task
	let newTask = await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks.create({
		workflowSid: context.TWILIO_WORKFLOW_SID,
		taskChannel: originalTask.taskChannelUniqueName,
		attributes: JSON.stringify(newAttributes),
	});

	if (mode == 'COLD') {
		// Set the channelSid and ProxySessionSID to a dummy value. This keeps the session alive
		let updatedAttributes = {
			...JSON.parse(originalTask.attributes),
			channelSid: 'CH00000000000000000000000000000000',
			proxySessionSID: 'KC00000000000000000000000000000000',
		};

		await client.taskrouter
			.workspaces(context.TWILIO_WORKSPACE_SID)
			.tasks(originalTaskSid)
			.update({
				attributes: JSON.stringify(updatedAttributes),
			});

		// Close the original Task
		await client.taskrouter
			.workspaces(context.TWILIO_WORKSPACE_SID)
			.tasks(originalTaskSid)
			.update({ assignmentStatus: 'completed', reason: 'task transferred' });
	}

	response.setBody({
		taskSid: newTask.sid,
	});

	callback(null, response);
});
