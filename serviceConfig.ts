import {ServerOptions, RouteOptions, RouteOptionsCors, ServerAuthConfig} from "@hapi/hapi";
import Path from "path";
import path from "path";
import * as fs from "fs";
import {manifestPlugins} from "./pluginConfig";


export const tls = true;
export const serverAuthConfig: ServerAuthConfig={
    strategy:'firebase',
    mode:'try',

}
export const serverOptions: ServerOptions = {
    address: "0.0.0.0",
    port: tls ? 8303 : 3303,
    tls: !tls ? !tls : {

        key: fs.readFileSync(path.join(__dirname, '../ssl/server.key'), 'utf8'),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'), 'utf8')

    },
    routes: getRoutes(),
    // plugins: {routesPlugin}
}

export function getCors(): RouteOptionsCors {
    return {
        origin: ['*'], // an array of origins or 'ignore'
        headers: ['Authorization'], // an array of strings - 'Access-Control-Allow-Headers'
        exposedHeaders: ['Accept'], // an array of exposed headers - 'Access-Control-Expose-Headers',
        // additionalExposedHeaders: ['Accept'], // an array of additional exposed headers
        maxAge: 60,
        credentials: true // boolean - 'Access-Control-Allow-Credentials'
    };
}

export const optionsExtra = {
    relativeTo: __dirname
};


function getRoutes(): RouteOptions {
    return {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        },
        /// Enable CORS protection ///
        cors: getCors()
        //////////////////////////////
    };
}