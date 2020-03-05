import React from 'react';
import { Actions } from "@twilio/flex-ui";

export default class ChatTransferButton extends React.Component {
  openDirectory() {
    Actions.invokeAction("ShowDirectory")
  }

  render() {
    return <button onClick={ this.openDirectory }>Transfer</button>
  }
}