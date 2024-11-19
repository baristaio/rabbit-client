const amqpLib = require('amqplib/callback_api');
const { connect, postToQueue, postMessages, stringifyMessage } = require('./client');
const { mock, instance, when, verify } = require('jest-mock-extended');
const { once } = require('events');


describe('Client Tests', () => {
  let amqpConfig;
  let mockAmqp;
  let mockChannel;

  beforeEach(() => {
    amqpConfig = {
      username: 'user',
      password: 'pass',
      host: 'localhost',
      options: {},
      onError: jest.fn(),
      onClose: jest.fn(),
      onConnect: jest.fn()
    };
    mockAmqp = mock();
    mockChannel = mock();
  });

  it('should connect successfully with valid config', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn();

    await expect(connect(amqpConfig)).resolves.toBe(mockAmqp);
    expect(amqpConfig.onConnect).toHaveBeenCalledWith(mockAmqp);
  });

  it('should handle connection error', async () => {
    const error = new Error('Connection failed');
    amqpLib.connect = jest.fn((url, options, callback) => callback(error, mockAmqp));

    await expect(connect(amqpConfig)).rejects.toThrow('Connection failed');
    expect(amqpConfig.onError).not.toHaveBeenCalled();
  });

  it('should call onError callback on connection error event', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn((event, handler) => {
      if (event === 'error') {
        handler();
      }
    });

    await connect(amqpConfig);
    expect(amqpConfig.onError).toHaveBeenCalled();
  });


  it('should call onError callback on connection error event', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn((event, handler) => {
      if (event === 'error') {
        handler();
      }
    });

    await connect(amqpConfig);
    expect(amqpConfig.onError).toHaveBeenCalled();
  });

  it('should call onClose callback on connection close event', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn((event, handler) => {
      if (event === 'close') {
        handler();
      }
    });

    await connect(amqpConfig);
    expect(amqpConfig.onClose).toHaveBeenCalled();
  });

  it('should call onClose callback on connection close event', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn((event, handler) => {
      if (event === 'close') {
        handler();
      }
    });

    await connect(amqpConfig);
    expect(amqpConfig.onClose).toHaveBeenCalled();
  });

  it('should post a message to the queue', async () => {
    mockAmqp.createChannel = jest.fn((callback) => callback(null, mockChannel));
    mockChannel.assertQueue = jest.fn();
    mockChannel.sendToQueue = jest.fn();
    mockChannel.close = jest.fn();

    await expect(postToQueue(mockAmqp, 'testQueue', 'testMessage')).resolves.toBeUndefined();
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('testQueue');
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith('testQueue', Buffer.from('testMessage'));
    expect(mockChannel.close).toHaveBeenCalled();
  });

  it('should handle invalid message format', async () => {
    await expect(postToQueue(mockAmqp, 'testQueue', undefined))
      .rejects.toEqual('Unexpected message format, should be JSON or string');
  });

  it('should post multiple messages to the queue', async () => {
    mockAmqp.createChannel = jest.fn((callback) => callback(null, mockChannel));
    mockChannel.assertQueue = jest.fn();
    mockChannel.sendToQueue = jest.fn();
    mockChannel.close = jest.fn();

    const messages = ['message1', 'message2'];
    await expect(postMessages(mockAmqp, 'testQueue', messages)).resolves.toBeUndefined();
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('testQueue');
    messages.forEach(message => {
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith('testQueue', Buffer.from(message));
    });
    expect(mockChannel.close).toHaveBeenCalled();
  });

  it('[postMessages] should handle error when creating channel in postMessages', async () => {
    const error = new Error('Channel creation failed');
    mockAmqp.createChannel = jest.fn((callback) => callback(error, null));

    await expect(postMessages(mockAmqp, 'testQueue', ['message1']))
      .rejects.toThrow('Channel creation failed');
  });

  it('[postToQueue] should handle error when creating channel in postToQueue', async () => {
    const error = new Error('Channel creation failed');
    mockAmqp.createChannel = jest.fn((callback) => callback(error, null));

    await expect(postToQueue(mockAmqp, 'testQueue', 'testMessage'))
      .rejects.toThrow('Channel creation failed');
  });

  it('should handle SIGINT signal and close connection', async () => {
    amqpLib.connect = jest.fn((url, options, callback) => callback(null, mockAmqp));
    mockAmqp.on = jest.fn();
    mockAmqp.close = jest.fn((callback) => callback());

    await connect(amqpConfig);
    process.emit('SIGINT');
    expect(mockAmqp.close).toHaveBeenCalled();
    expect(amqpConfig.onClose).toHaveBeenCalledWith('SIGINT');
  });
  it('should return undefined for undefined message', () => {
    expect(stringifyMessage(undefined)).toBeUndefined();
  });

  it('should return the same string for string message', () => {
    expect(stringifyMessage('test')).toBe('test');
  });

  it('should return JSON string for object message', () => {
    const message = { key: 'value' };
    expect(stringifyMessage(message)).toBe(JSON.stringify(message));
  });

  it('should return undefined for non-string, non-object message', () => {
    expect(stringifyMessage(123)).toBeUndefined();
  });
});
