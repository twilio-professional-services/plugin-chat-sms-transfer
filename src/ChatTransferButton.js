import React from 'react';
import { Actions, Button } from "@twilio/flex-ui";

export default class ChatTransferButton extends React.Component {
  openDirectory() {
    Actions.invokeAction("ShowDirectory")
  }

  render() {
    return <Button onClick={ this.openDirectory }>Transfer</Button>
  }
}