import Hapi from "@hapi/hapi";

const {getVehicleAssetStatus} = require("../../../services/asset/getVehData");

import {AssetModelCar} from "../../../interfaces/Assets/Vehicles/AssetModelCar"
const logger = require("../../../services/logger").getInstance();
export const getAssetInfo = (req: Hapi.Request, res) => {


// router.post('/', (req,res)=>{
    const licensePlate = req.payload["licensePlate"];
    console.log("route asset")

    logger.info("exec started")

    return new Promise((resolve, reject) => getVehicleAssetStatus(licensePlate, resolve, reject)).
    then((output: AssetModelCar) => {
        return res.response(output).code(200)
    }).catch(
        err => {
            return res.response(err).code(404)
        }
    )

    // logger.info("exec stopped")
};

export function assetHandler(request, response) {
    return response.send("aaaa").status(200).send()
}

// module.exports = router;