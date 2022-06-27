import CustomerType from "../CustomerType";

export interface IOwnerInvite {
    docRefID: string,
    role: CustomerType,
    uuidCompanion: string,
    path: string,


}

export default class OwnerInvite implements IOwnerInvite {
    docRefID: "";
    path: string;
    role: CustomerType.buyer;
    uuidCompanion: "";

    current(invitePropertyList: IOwnerInvite) {
        docRefID : invitePropertyList.docRefID;
        role : invitePropertyList.role;
        uuidCompanion : invitePropertyList.uuidCompanion;
        path : invitePropertyList.path
    }


}