import {QueryMethod} from "../../config/enums";
import {IDealCraftUser} from "../Users";
import {DcSearchOption} from "../../config/types";

export interface IDealCraftQueryRequest {
    method: QueryMethod;
    authUser: IDealCraftUser;
    limit?: number;
    options?: DcSearchOption;
}

export function buildDealCraftQueryRequest(method: QueryMethod,
                                           authUser: IDealCraftUser,
                                           options?: string[] | undefined): IDealCraftQueryRequest {
    class DealCraftQueryRequest implements IDealCraftQueryRequest {
        method: QueryMethod;
        authUser: IDealCraftUser;
        options?: DcSearchOption;

        constructor(method: QueryMethod,
                    authUser: IDealCraftUser,
                    options?: DcSearchOption) {
            this.method = method;
            this.authUser = authUser;
            this.options = options;
        }
    }

    return new DealCraftQueryRequest(method, authUser, options);
}
