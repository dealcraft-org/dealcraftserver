import {VehicleInspectionItem} from "./VehicleInspectionItem";

export interface VehicleInspectionStatus {
    vehicleRegisteredTaxi:               VehicleInspectionItem;
    vehicleChangedRegistrationAfter2017: VehicleInspectionItem;
    vehiclePermitExpired:                VehicleInspectionItem;
    vehicleDiscarded:                    VehicleInspectionItem;
    vehicleDisabilitytag:                VehicleInspectionItem;
    vehicleRecallmissed:                 VehicleInspectionItem;
    vehiclePersonalimport:               VehicleInspectionItem;
    vehiclePersonalimportUsed:           VehicleInspectionItem;
    vehicleFuelused:                     VehicleInspectionItem;
    vehicleCurrentownership:             VehicleInspectionItem;
}