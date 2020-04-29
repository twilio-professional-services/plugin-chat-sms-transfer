export const Actions = {
  addListener: jest.fn(),
  invokeAction: jest.fn(),
  registerAction: jest.fn(),
  replaceAction: jest.fn()
};

export const TaskCanvasHeader = {
  Content: {
    add: jest.fn()
  }
}

export const ChatOrchestrator = {
  setOrchestrations: jest.fn()
}

export const Manager = {
  getInstance: jest.fn(() => ({
    serviceConfiguration: {
      runtime_domain: 'runtime_domain'
    },
    user: {
      token: 'token',
      identity: 'identity'
    }
  }))
}

export const TaskHelper = {
  isChatBasedTask: jest.fn(() => true)
}