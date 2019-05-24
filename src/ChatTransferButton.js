import React from 'react';
import * as Flex from "@twilio/flex-ui";
import { Actions, Button } from "@twilio/flex-ui";

export default class ChatTransferButton extends React.Component {
  constructor() {
    super();
    console.log(Button);
    console.log(Flex);
  }

  openDirectory() {
    Actions.invokeAction("ShowDirectory")
  }

  render() {
    return <Button onClick={ this.openDirectory }>Transfer</Button>
  }
}