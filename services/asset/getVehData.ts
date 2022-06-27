import {AssetModelMapper} from "../mappers/AssetModelMapper";

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger =  require("../../services/logger").getInstance();
import {AssetModelCar} from "../../interfaces/Assets/Vehicles/AssetModelCar";
import {AssetModelVehicleMapper} from "../mappers/AssetModelVehicleMapper";
export function getVehicleAssetStatus(licenseplate, resolve, reject) {
    let xmlHttp : XMLHttpRequest = new XMLHttpRequest();
    xmlHttp.open("GET", `${process.env.HTTP_ASSET_QUERY_URL}/${licenseplate}`, true);
    logger.debug("call to getdata for asset with id {}" + licenseplate);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            logger.debug("http json from caraws received");
            let dealModel: AssetModelCar = new AssetModelVehicleMapper().toAssetModel(xmlHttp.responseText)
            console.dir(dealModel.vehicleLicenseNumber)
            return resolve(dealModel);
        } else if (xmlHttp.status > 200) {
            logger.error("http json from caraws error");
            reject(
                {
                    status: xmlHttp.status,
                    statusText: xmlHttp.responseText,
                },
            );
            return
        }
    };

    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send();
    logger.info("request sent");

}
