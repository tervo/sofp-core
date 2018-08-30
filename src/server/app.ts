import * as express from 'express';
import * as exegesisExpress from 'exegesis-express';
import * as http from 'http';
import * as path from 'path';


async function createServer() {
    // See https://github.com/exegesis-js/exegesis/blob/master/docs/Options.md
    const options = {
        controllers: path.resolve(__dirname, '../controllers'),
        controllersPattern: '**/*Controller.@(js|ts)',
        allowMissingControllers: false
    };

    // This creates an exgesis middleware, which can be used with express,
    // connect, or even just by itself.
    const exegesisMiddleware = await exegesisExpress.middleware(
        path.resolve(__dirname, '../../api/hello-world.yaml'),
        options
    );

    const app = express();

    // If you have any body parsers, this should go before them.
    app.use(exegesisMiddleware);

    // Return a 404
    app.use((req, res) => {
        res.status(404).json({message: `Not found`});
    });

    // Handle any unexpected errors
    app.use((err, req, res, next) => {
        res.status(500).json({message: `Internal error: ${err.message}`});
    });

    const server = http.createServer(app);

    return server;
}


createServer()
.then(server => {
    server.listen(3000);
    console.log('Listening on port 3000');
    console.log('Try visiting http://localhost:3000/greet?name=Jason');
})
.catch(err => {
    console.error(err.stack);
    process.exit(1);
});