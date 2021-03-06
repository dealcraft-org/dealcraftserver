'use strict'

//https://stackoverflow.com/questions/48567125/hapi-17-routes-not-registered
// const Config = require('../../config')


import {assetHandler, getAssetInfo} from "../../handlers/assets/getAssetInfoHandler";
import Joi from "joi";
import {getUsersDealsHandler} from "../../handlers/deals/getUsersDealsHandler";


export const plugin = {
    register: (server, options) => {
        server.route(
            {
                method: 'GET',
                path: '/participants/{participantId*}',
                handler: async function(request, h) {
                    const response = h.response("hello world ankur");
                    response.type("text/plain");
                    return response;
                },
                options:{
                    tags:['api']
                }

            },
            server.route(
                {
                    method: 'POST',
                    path: '/participants/get-participant-deals',
                    handler: getUsersDealsHandler,

                    options: {
                        auth: 'firebase',
                        tags: ['assets', 'api', 'getAssetInfo'],
                        description: "provide information on asset state",
                        notes: ["asset state and metadata"],
                        // plugins: {
                        //     'hapi-swagger': {
                        //         payloadType: 'form'
                        //     }
                        // },
                        // validate: {
                        //     payload: Joi.object({
                        //         licensePlate: Joi.string().max(10).required().description("car license plate")
                        //     }),
                        // },
                        // response: {
                        //     // schema: {},
                        //     // schema: Joi.object().tailor("AssetCarModel"),
                        //
                        //     status:
                        //         {
                        //             200: ["OK"]
                        //         }
                        //
                        // }
                    }



                }
            )
        )

    }, name: "participants"
};
