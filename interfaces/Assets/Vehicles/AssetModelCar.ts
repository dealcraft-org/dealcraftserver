// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

import {VehicleInspectionStatus} from "./VehicleInspectionStatus";
import {AssetBase} from "../AssetBase";
import {VehicleInspectionItem} from "./VehicleInspectionItem";

export interface AssetModelCar extends AssetBase{
    vehiclePersonalimport:       boolean;
    vehicleLicenseNumber:        number;
    vehicleManufacture:          string;
    vehicleTrimLevel:            string;
    vehicleFrontWheel:           string;
    vehicleRearWheel:            string;
    vehiclePowertrainType:       string;
    vehicleModel:                string;
    vehicleEngine:               string;
    vehicleManufacturedYear:     number;
    vehicleEngineFuel:           string;
    vehicleEngineModel:          string;
    vehicleOwnershipType:        string;
    vehicleVin:                  string;
    vehicleColorRgb:             string;
    vehicleColor:                string;
    vehicleOnroadregistration:   string;
    vehicleApproveNote:          number;
    vehicleType:                 string;
    vehicleSpecialNotes:         string;
    vehicleCountryOfManufacture: string;
    vehiclePermitDueDatetime:    string;
    vehiclePermitDueIl:          string;
    vehicleCheck:                VehicleInspectionStatus;
}




// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
//TODO refactor to utils/convertDealCraftModel


