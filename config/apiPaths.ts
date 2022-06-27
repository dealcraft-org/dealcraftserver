import {Server} from "@hapi/hapi";

const logger = require("../services/logger").getInstance();
const API_ROUTES = [
    '../api-routes/api/assets',
    '../api-routes/api/participants',
    '../api-routes/api/deals'
]

export async function registerApiRoutes(server: Server): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            API_ROUTES.forEach(route =>
                server.register(require(route)).then(r => logger.info("app route available:"+ route))
            )
            resolve(true)

        } catch (e) {
            reject(e)
        }
        return
    })
}