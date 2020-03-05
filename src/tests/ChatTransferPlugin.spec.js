import fetch from 'node-fetch';
import * as Flex from '@twilio/flex-ui'
import { 
  setUpComponents,
  removeDefaultChatChannelOrchestrations,
  restoreDefaultChatChannelOrchestrations,
  transferOverride
} from '../ChatTransferPlugin'

const { Response } = jest.requireActual('node-fetch');

jest.mock('@twilio/flex-ui')
jest.mock('node-fetch', () => jest.fn())

describe('setUpComponents', () => {
  it('it appends to TaskCanvasHeader', () => {
    setUpComponents();
    expect(Flex.TaskCanvasHeader.Content.add).toHaveBeenCalled();
  })
})

describe('channel orchestrations', () => {
  beforeEach(() => {
    Flex.ChatOrchestrator.setOrchestrations.mockClear();
  })

  it('removes default channel orchestrations', () => {
    removeDefaultChatChannelOrchestrations();
    expect(Flex.ChatOrchestrator.setOrchestrations).toHaveBeenNthCalledWith(1, "wrapup", []);
    expect(Flex.ChatOrchestrator.setOrchestrations).toHaveBeenNthCalledWith(2, "completed", ["LeaveChatChannel"]);
  })

  it('restores default channel orchestrations', () => {
    restoreDefaultChatChannelOrchestrations();
    expect(Flex.ChatOrchestrator.setOrchestrations).toHaveBeenNthCalledWith(1, "wrapup", ["DeactivateChatChannel"]);
    expect(Flex.ChatOrchestrator.setOrchestrations).toHaveBeenNthCalledWith(2, "completed", ["DeactivateChatChannel", "LeaveChatChannel"]);
  })
})

describe('handles transfers for chat tasks', () => {
  let task = {
    taskSid: 'taskSid',
  }
  let payload = {
    task,
    targetSid: 'targetSid'
  }
  let original = jest.fn();

  it('calls original for non-chat tasks', async () => {
    // force task helper to return false
    Flex.TaskHelper.isChatBasedTask = jest.fn(() => false);

    await transferOverride(payload, original);
    expect(original).toHaveBeenCalled();

    Flex.TaskHelper.isChatBasedTask.mockClear();
  })

  it('calls fetch if the task is a chat task', async () => {
    // force task helper to return true
    Flex.TaskHelper.isChatBasedTask = jest.fn(() => true);

    // mock fetch to return a valid value
    fetch.mockImplementation(() => Promise.resolve(new Response()));

    await transferOverride(payload, original);
    expect(fetch).toHaveBeenCalledTimes(1);
  })
})