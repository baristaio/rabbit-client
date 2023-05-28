const getInstance = require('./manager') .getInstance;

describe('Rabbit API manager', () => {

    test('TEMPORARY TEST', ()=> {
        const manager = getInstance({
            port: 15672,
            host: 'localhost',
            userName: 'guest',
            password: 'guest'
        });

        const time = Date.now();
        manager.publish('hello', 'Hello World')
            .then((result)=> {
                console.log(` TIME: ${Date.now() - time}`);
                console.log(result)
            })
            .catch(e => console.log(e));
    });

    test('url assembling', ()=> {
        expect(true).toBeTruthy();
    })
});
