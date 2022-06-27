'use strict';

import {Manifest} from "@hapi/glue";
import chalk from "chalk"
const admin = require("./services/providers/firebaseProvider").getInstance();
import Glue from "@hapi/glue";
import {manifestPlugins} from './pluginConfig';
import {getCors, optionsExtra, serverAuthConfig, serverOptions} from "./serviceConfig";
import {Server} from "@hapi/hapi";
import {registerApiRoutes} from "./config/apiPaths";
import {userSession} from "./services/utils/uuidGen";

const logger = require("./services/logger").getInstance();


const manifest: Manifest = {
    server: serverOptions,


    register: {
        plugins: manifestPlugins,
    },
}

if (!process.env.PRODUCTION) {
    // manifest.register!.plugins.push(blipp);
}

Glue.compose(manifest, optionsExtra).then((server: Server) => {
    server.auth.strategy('firebase', 'firebase', {instance: admin})
    server.auth.default(serverAuthConfig)
    server.route({
        method: 'GET',
        path: '/public/{path*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true,
            },

        },
        options:{
            auth:false,
            cache:{
                expiresIn:300
            }
        }
    })
    server.route({
            method: '*',
            path: '/{any*}',
            handler(request, h) {
                console.log("jsjs")

                // @ts-ignore
                return h.view("html/404.html").code(404);
            }
        },
    );
    console.info("logging on:")
    server.events.on('log', (event, tags) => {
        if (event.error)
            logger.info(event)
    })

    server.start().then(async () => {
        ///load api routes ///
        /// print all routes
        let setApiRoute = await registerApiRoutes(server).catch((error)=>{
            logger.error("API ROUTES SET FAILED: "+error)
            return false})
        if (setApiRoute)
            await server.register([{
                plugin: require('blipp'),
                options: {showAuth: true, showStart: true}
            }]).then(() =>
                console.log(server.plugins['blipp'].text()));
        else throw new Error("cant set apis")
        server.state((userSession), {
            ttl: 30000,
            isSecure: true,
            isHttpOnly: true,
            encoding: 'base64json',
            clearInvalid: true,
            strictHeader: true                        });

        console.log(chalk.bgCyan('✅  Server is listening on ' + server.info.uri.toLowerCase()));

    })
}).catch(err => {
    console.log('server.register err:', err);
})