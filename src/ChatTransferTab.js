import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';

const container = {
  overflow: 'auto',
  paddingLeft: '12px',
  paddingRight: '12px',
  paddingTop: '12px',
  paddingBottom: '12px',
  width: '100%'
}

const label = {
  display: 'block'
}

const currentQueue = {
  fontSize: '1rem',
  marginBottom: '12px'
}

const button = {
  background: 'red',
  fontSize: '0.75rem',
  display: 'block',
  marginTop: '12px',
  padding: '10px'
}

export default class ChatTransferTab extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      queue: this.props.task.queueSid,
      allQueues: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitTransfer = this.submitTransfer.bind(this);
    this.removeDefaultChatChannelOrchestration = this.removeDefaultChatChannelOrchestration.bind(this);
    this.restoreDefaultChatChannelOrchestration = this.restoreDefaultChatChannelOrchestration.bind(this);
    this.serviceUrl = this.prepServiceBaseUrl(this.props.manager.serviceConfiguration.runtime_domain);
  }

  componentDidMount() {
    fetch(`${this.serviceUrl}list-all-queues`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: `Token=${this.props.manager.user.token}`
    })
      .then(response => {
        return response.json()
      })
      .then(json => {
        this.setState({
          allQueues: JSON.parse(json)
        })
      })
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  };

  removeDefaultChatChannelOrchestration() {
    return new Promise((resolve, reject) => {
      this.props.flex.ChatOrchestrator.setOrchestrations("wrapup", []);
      console.log(this.props.flex.ChatOrchestrator.events.wrapup.size);
      this.props.flex.ChatOrchestrator.setOrchestrations("completed", ["LeaveChatChannel"]);
      console.log('polling to remove default orchestration');
      let maxAttempts = 50;
      let interval = setInterval(() => {
        console.log(this.props.flex.ChatOrchestrator.events.wrapup.size);
        if (
          this.props.flex.ChatOrchestrator.events.wrapup.size === 0 &&
          this.props.flex.ChatOrchestrator.events.completed.size === 1 &&
          this.props.flex.ChatOrchestrator.events.completed.has("LeaveChatChannel")
        ) {
          console.log('polling complete');
          clearInterval(interval);
          return resolve();
        }

        if (maxAttempts === 0) {
          console.log('polling failed to remove default orchestration');
          clearInterval(interval);
          return reject();
        }

        console.log('decrementing maxAttempts')
        maxAttempts--;
        console.log(maxAttempts);
      }, 50);
    })
  }

  restoreDefaultChatChannelOrchestration() {
    return new Promise((resolve, reject) => {
      this.props.flex.ChatOrchestrator.setOrchestrations("wrapup", ["DeactivateChatChannel"]);
      this.props.flex.ChatOrchestrator.setOrchestrations("completed", ["DeactivateChatChannel", "LeaveChatChannel"]);

      let maxAttempts = 50;
      let interval = setInterval(() => {
        if (
          this.props.flex.ChatOrchestrator.events.wrapup.has("DeactivateChatChannel") &&
          this.props.flex.ChatOrchestrator.events.completed.size === 2 &&
          this.props.flex.ChatOrchestrator.events.completed.has("DeactivateChatChannel") &&
          this.props.flex.ChatOrchestrator.events.completed.has("LeaveChatChannel")
        ) {
          clearInterval(interval);
          resolve();
        }

        if (maxAttempts === 0) {
          clearInterval(interval);
          reject();
        }

        maxAttempts--;
      }, 50);
    })
  }

  submitTransfer() {
    this.removeDefaultChatChannelOrchestration().then(() => {
      fetch(`${this.serviceUrl}transfer-chat`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: `Token=${this.props.manager.user.token}&taskSid=${this.props.task.taskSid}&destinationQueue=${this.state.queue}&workerName=${this.props.manager.user.identity}`
      })
      .then(response => {
        this.restoreDefaultChatChannelOrchestration().then(() => {
          console.log('Task Successfully Transfered');
        })
      })
      .catch(error => {
        this.restoreDefaultChatChannelOrchestration().then(() => {
          console.log(error);
        })
      });
    })
  }

  prepServiceBaseUrl(url) {
    // prepend https if it doesn't exist
    if (!url.startsWith('https://')) {
      url = 'https://'+url;
    }
    // append a trailing slash if it doesn't exist
    if (url.substr(-1) !== '/') {
      url = url+'/';
    }
    return url;
  }

  render() {
    return (
      <div style={container}>
        <p style={currentQueue}>Current Queue: { this.props.task.queueName }</p>
        <InputLabel style={label} htmlFor="queue">Transfer To</InputLabel>
        <Select
          value={this.state.queue}
          onChange={this.handleChange}
          name="queue"
        >
          { this.state.allQueues.map((queue, i) => {
            return <MenuItem key={i} value={queue.sid}>{queue.name}</MenuItem>
          }) }
        </Select>
        <Button style={button} onClick={this.submitTransfer}>Transfer</Button>
      </div>
    )
  }
}