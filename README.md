# The rabbit-client utils
The RabbitMQ 0.91 client wrapper and utils

## Installation
```bash
npm install rabbit-client
```
## API

### connect
connect to RabbitMQ server

#### config to connection
```aiignore
    config = {
      username: 'userName',
      password: 'password',
      host: 'host name',
      
      onError: (err) => {
        console.log(err);
      },
      onClose: () => {
        console.log('connection closed');
      },
      onConnect: () => {
        console.log('connection established');
      }
    };
```
OnError, onClose, onConnect are optional callbacks functions:
- onError: called when an error occurs
- onClose: called when the connection is closed
- onConnect: called when the connection is established



```javascript
const rabbitClient = require('@baristaio/rabbit-client');

const connection = await rabbitClient.connect(config);

await postMessage(connection, 'queueName', 'message');

await postMessges(connection, 'queueName', ['message1', 'message2', 'message3']);

```
