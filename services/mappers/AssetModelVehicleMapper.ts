import {VehicleInspectionStatus} from "../../interfaces/Assets/Vehicles/VehicleInspectionStatus";
import {VehicleInspectionItem} from "../../interfaces/Assets/Vehicles/VehicleInspectionItem";
import {AssetModelCar} from "../../interfaces/Assets/Vehicles/AssetModelCar";
import {AssetModelMapper} from "./AssetModelMapper";
import * as objectTypeMapper from "./utils/stringToType"


export class AssetModelVehicleMapper extends AssetModelMapper {
    constructor() {
        super(typeMap);
    }



    public  toAssetModel(json: string): AssetModelCar {
        return this.cast(JSON.parse(json), objectTypeMapper.r("AssetModelCar"));
    }

    public  welcomeToJson(value: AssetModelCar): string {
        return JSON.stringify(super.uncast(value, objectTypeMapper.r("AssetModelCar")), null, 2);
    }

    public  toVehicleCheck(json: string): VehicleInspectionStatus {
        return super.cast(JSON.parse(json), objectTypeMapper.r("VehicleCheck"));
    }

    public vehicleCheckToJson(value: VehicleInspectionStatus): string {
        return JSON.stringify(this.uncast(value, objectTypeMapper.r("VehicleCheck")), null, 2);
    }

    public  toVehicle(json: string): VehicleInspectionItem {
        return this.cast(JSON.parse(json), objectTypeMapper.r("Vehicle"));
    }

    public  vehicleToJson(value: VehicleInspectionItem): string {
        return JSON.stringify(this.uncast(value, objectTypeMapper.r("Vehicle")), null, 2);
    }
}
const      typeMap: any = {
    "AssetModelCar": objectTypeMapper.o([
        {json: "vehicle_personalimport", js: "vehiclePersonalimport", typ: true},
        {json: "vehicle_license_number", js: "vehicleLicenseNumber", typ: 0},
        {json: "vehicle_manufacture", js: "vehicleManufacture", typ: ""},
        {json: "vehicle_trim_level", js: "vehicleTrimLevel", typ: ""},
        {json: "vehicle_front_wheel", js: "vehicleFrontWheel", typ: ""},
        {json: "vehicle_rear_wheel", js: "vehicleRearWheel", typ: ""},
        {json: "vehicle_powertrain_type", js: "vehiclePowertrainType", typ: ""},
        {json: "vehicle_model", js: "vehicleModel", typ: ""},
        {json: "vehicle_engine", js: "vehicleEngine", typ: ""},
        {json: "vehicle_manufactured_year", js: "vehicleManufacturedYear", typ: 0},
        {json: "vehicle_engine_fuel", js: "vehicleEngineFuel", typ: ""},
        {json: "vehicle_engine_model", js: "vehicleEngineModel", typ: ""},
        {json: "vehicle_ownership_type", js: "vehicleOwnershipType", typ: ""},
        {json: "vehicle_vin", js: "vehicleVin", typ: ""},
        {json: "vehicle_color_rgb", js: "vehicleColorRgb", typ: ""},
        {json: "vehicle_color", js: "vehicleColor", typ: ""},
        {json: "vehicle_onroadregistration", js: "vehicleOnroadregistration", typ: ""},
        {json: "vehicle_approve_note", js: "vehicleApproveNote", typ: 0},
        {json: "vehicle_type", js: "vehicleType", typ: ""},
        {json: "vehicle_special_notes", js: "vehicleSpecialNotes", typ: null},
        {json: "vehicle_country_of_manufacture", js: "vehicleCountryOfManufacture", typ: ""},
        {json: "vehicle_permit_due_datetime", js: "vehiclePermitDueDatetime", typ: null},
        {json: "vehicle_permit_due_IL", js: "vehiclePermitDueIl", typ: ""},
        {json: "vehicle_check", js: "vehicleCheck", typ: objectTypeMapper.r("VehicleCheck")},
    ], false),
    "VehicleCheck": objectTypeMapper.o([
        {json: "vehicle_registeredTaxi", js: "vehicleRegisteredTaxi", typ: objectTypeMapper.r("Vehicle")},
        {
            json: "vehicle_changed_registration_after_2017",
            js: "vehicleChangedRegistrationAfter2017",
            typ: objectTypeMapper.r("Vehicle")
        },
        {json: "vehicle_permit_expired:", js: "vehiclePermitExpired", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_discarded", js: "vehicleDiscarded", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_disabilitytag", js: "vehicleDisabilitytag", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_recallmissed", js: "vehicleRecallmissed", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_personalimport", js: "vehiclePersonalimport", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_personalimport_used", js: "vehiclePersonalimportUsed", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_fuelused", js: "vehicleFuelused", typ: objectTypeMapper.r("Vehicle")},
        {json: "vehicle_currentownership", js: "vehicleCurrentownership", typ: objectTypeMapper.r("Vehicle")},
    ], false),
    "Vehicle": objectTypeMapper.o([
        {json: "check_id", js: "checkId", typ: ""},
        {json: "check_ans_id", js: "checkAnsId", typ: ""},
        {json: "severity", js: "severity", typ: 0},
        {json: "notes", js: "notes", typ: "any"}]
        , false)

};
