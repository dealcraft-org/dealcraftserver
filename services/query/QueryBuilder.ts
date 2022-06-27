import {IDealCraftQueryRequest} from "../../interfaces/Queries";
import {QueryMethod} from "../../config/enums";
import {IDealCraftUser} from "../../interfaces/Users";
import exp from "constants";
import {DcSearchOption} from "../../config/types";


export class QuerySearchBuilder {
    private readonly dealCraftQueryRequest: IDealCraftQueryRequest;

    constructor() {

        console.info("empty call")
        this.dealCraftQueryRequest = new class implements IDealCraftQueryRequest {
            options: DcSearchOption = {};
            authUser: IDealCraftUser;
            limit: number;
            method: QueryMethod;

        }
        //this.dealCraftQueryRequest = new this.init();
    }

    setMethod(method: QueryMethod): QuerySearchBuilder {
        this.dealCraftQueryRequest.method = method
        return this
    }

    setLimit(limit: number) {
        this.dealCraftQueryRequest.limit = limit;
        return this
    }

    setUser(user: IDealCraftUser) {
        this.dealCraftQueryRequest.authUser = user;
        return this
    }

    setOption(option: DcSearchOption) {
        console.dir(Object.entries(option))
        this.dealCraftQueryRequest.options = Object.assign(this.dealCraftQueryRequest.options!, option);
        return this
    }

    build() {
        return this.dealCraftQueryRequest;
    }
}