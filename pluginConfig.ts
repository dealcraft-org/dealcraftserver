import {Manifest, PluginObject} from "@hapi/glue";
import {SecuritySchemeType} from "hapi-swagger";
const secConf: SecuritySchemeType = {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    flow:'application'
}
const envKey = key => {
    const env = process.env.NODE_ENV || 'development';

    const configuration = {
        development: {
            host: 'localhost',
            port: 8000
        },
        uat: {
            host: 'localhost',
            port: 8010
        },
        // These should match environment variables on hosted server
        production: {
            host: process.env.HOST,
            port: process.env.PORT
        }
    };

    return configuration[env][key];
};

// @ts-ignore
export const manifestPlugins: PluginObject[] =
    [
        {
            plugin: 'hapi-firebase-auth'
        },
        {
            plugin: 'hapi-cors'
        },
        // swagger
        {
            plugin: '@hapi/inert'
        },
        {
            plugin: '@hapi/vision'
        },
        {
            plugin: 'hapi-swagger',
            options: {
                info: {
                    title: 'Test API Documentation',
                    // version: Pack.version,
                },
                securityDefinitions: {
                    'firebase': secConf
                },
                security:
                    [{ firebase: [] }]

            }
        },
        {
            plugin: "vision",
            options: {
                engines: {
                    html: require('handlebars')
                },
                relativeTo: __dirname,
                path: 'public'
            }


        }
        // }
        //, {
        // plugin: {
        //     register: 'good',
        //     options: {
        //         ops: { interval: 60000 },
        //         reporters: {
        //             console: [
        //                 { module: 'good-squeeze', name: 'Squeeze', args: [{ error: '*' }] }, { module: 'good-console' }, 'stdout'
        //             ]
        //         }
        //     }
        // }
        // }
    ]


