const getInstance = (options) => {
    const { host, port, userName, password, protocol = 'http' } = options;
    if (!(host && port && userName && password )) {
        throw new Error(`Missing or undefined required parameter(s)`);
    }

    const http = require(protocol.toLowerCase());

    const encodedToken = Buffer.from(`${userName}:${password}`).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic '+ encodedToken
    };

    const info = () => {
        //const path = '/api/queues';
    }
    const publish =  (queueName, message, params = {}) => {
        const path = '/api/exchanges/%2F//publish';
        const options = {
            host,
            port,
            path,
            method: 'POST',
            headers
        };
        const properties = Object.assign({}, params);
        const body = {
            properties,
            payload: message,
            'routing_key': queueName,
            'payload_encoding': 'string'
        };
        return new Promise ((resolve, reject) => {
            const request = http.request(options, (res) => {
                res.setEncoding('utf8');
                let data = '';
                // A chunk of data has been received.
                res.on('data', chunk => {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    return resolve(data);
                });
            }).on('error', (err) => {
                console.error(`Error: ${err.message}`);
                return reject(err);
            });

            // post the data
            request.write(JSON.stringify(body));
            request.end();
        });
    };

    return {
        publish,
        info
    }
}

module.exports = {
    getInstance
};

// function stringifyMessage (message) {
//     switch (typeof(message)) {
//         case 'undefined': return null;
//         case 'string': return message;
//         case 'object': return JSON.stringify(message);
//         default: return null;
//     }
// }
//

const manager = getInstance({
    port: 15672,
    host: 'localhost',
    userName: 'guest',
    password: 'guest'
});



// ---------------------------------------------------------
const time = Date.now();
manager.publish('hello', 'Hello World')
    .then((result)=> {
        console.log(` TIME: ${Date.now() - time}`);
        console.log(result)
    })
    .catch(e => console.log(e));

