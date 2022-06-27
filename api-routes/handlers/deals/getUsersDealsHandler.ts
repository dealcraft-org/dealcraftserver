import {AssetModelCar} from "../../../interfaces/Assets/Vehicles/AssetModelCar"
import Hapi from "@hapi/hapi";
import {User as FirebaseUser} from "firebase/auth";
import createError from 'http-errors'
import {StatusCodes, ReasonPhrases} from 'http-status-codes'
import { QueryEngine} from "../../../services/query/queryEngine";
import {httpResponsesOk} from "../../../services/http/httpResponses";
import {buildDealCraftQueryRequest} from "../../../interfaces/Queries";
import {QueryMethod} from "../../../config/enums";

const logger = require("../../../services/logger").getInstance();
export const getUsersDealsHandler = async (req: Hapi.Request, res) => {
    if (req.auth.isAuthenticated) {
        const user: FirebaseUser = (<FirebaseUser>req['user']);
        // const method: string = req.payload['method'];
        // if (!method)  return res.response(ReasonPhrases.BAD_REQUEST).code(StatusCodes.BAD_REQUEST)

        // make builder //
        const queryEngine = new QueryEngine(buildDealCraftQueryRequest(QueryMethod.getUserDeals, user))
        return  await queryEngine.queryEventRegister().then(result => {
            return res.response(result)
        })
        // return res.response(user)
        // return res.response(httpResponsesOk("DSA"))
    }
}


