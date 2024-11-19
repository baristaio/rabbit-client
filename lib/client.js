const amqpLib = require('amqplib/callback_api');

function bail(conn) {
  if (conn) {
    conn.close();
  }
}
const amqpUrl = (username, password, host) => `amqp://${username}:${password}@${host}`;

const connect = (amqpConfig) => {
  return new Promise((resolve, reject) => {
    const { username, password, host,options } = amqpConfig;
    const amqpHost = amqpUrl(username, password, host);
    amqpLib.connect(amqpHost, options, (err, conn) => {
      if (err !== null) {
        bail(conn);
        return reject(err);
      }

      conn.on('error', () => {
        if (typeof amqpConfig.onError === 'function') {
          amqpConfig.onError();
        }
      });

      conn.on('close', () => {
        if (typeof amqpConfig.onClose === 'function') {
          amqpConfig.onClose();
        }
      });

      process.once('SIGINT', () => {
        conn.close(() => {
          amqpConfig.onClose('SIGINT');
        });
      });

      if (typeof amqpConfig.onConnect === 'function') {
        amqpConfig.onConnect(conn);
      }

      return resolve(conn);
    });
  });

};

const stringifyMessage = message => {
  switch (typeof(message)) {
    case 'undefined': return undefined;
    case 'string': return message;
    case 'object': return JSON.stringify(message);
    default: return undefined;
  }
};

const postMessages = (amqp, queueName, messages) => {
  return new Promise(((resolve, reject) => {
    amqp.createChannel((err, ch) => {
      if (err !== null) {
        reject(err);
      }
      ch.assertQueue(queueName);
      messages.forEach(m => ch.sendToQueue(queueName, Buffer.from(stringifyMessage(m))));
      ch.close();
      resolve();
    });
  }));
};

const postToQueue = (amqp, queueName, message) => {
  const messageStr = stringifyMessage(message);
  if (!messageStr) {
    return Promise.reject('Unexpected message format, should be JSON or string');
  }

  return new Promise(((resolve, reject) => {
    amqp.createChannel((err, ch) => {
      if (err !== null) {
        reject(err);
      }
      ch.assertQueue(queueName);
      ch.sendToQueue(queueName, Buffer.from(messageStr));
      ch.close();
      resolve();
    });
  }));
};

module.exports = {
  connect,
  stringifyMessage,
  postToQueue,
  postMessages
};
