import {Request, Response} from 'express'
import {IDealCraftQueryRequest} from "../../interfaces/Queries";
import {httpResponses, httpResponsesOk, IDealCraftHttpResponses} from "../http/httpResponses";
import {QueryMethod, QuerySearchOrder} from "../../config/enums";
import {IDealCraftUser} from "../../interfaces/Users";
import {PromisePool} from "@supercharge/promise-pool";
import {QuerySearchBuilder} from "./QueryBuilder";

const {
    execState,
    getUserHome,
    wrapDealDocumentString,
} = require("../../modules/utils");
const {noUserTokenProvidedResponse} = require("../../modules/responses");
const {getUsersItems} = require("../asset/userAssets");
const {INVITE_TRACKING_SUBCOLLECTION_DOC} = require("../../constants");
const {getDocJsonFirestoreByPath} = require("../../modules/helpers");
const {BAD_REQUEST, NOT_FOUND} = require("http-status-codes");
const {getDealParticipants} = require("../../modules/participants");
const EventEmitter = require("events");
const logger = require("../logger").getInstance();


type DcQueryResultsOutput = {
    assetdata: any;
    assetpath: string;
}

export class QueryEngine implements IDealCraftQueryRequest {
    method: QueryMethod;
    authUser: IDealCraftUser;
    options: string[]

    private request: Request;
    private readonly response: Response;
    private myEmitter: typeof EventEmitter;
    private failure: boolean = true;
    private user: string | null | IDealCraftUser;
    private queryS: IDealCraftQueryRequest;

    constructor(queryObj: IDealCraftQueryRequest) {
        // this.request = request;
        // this.response = response;
        // this.method = request.query.method;
        // this.cors = require("cors")({origin: true});
        // this.tokenId = this.request.headers.authorization!.split(" ")[1];
        this.queryS = new QuerySearchBuilder().setLimit(5).setMethod(queryObj.method).setUser(queryObj.authUser).setOption({
            aaa: "223",
            searchOrder: QuerySearchOrder.Descending
        }).build()
        this.myEmitter = new EventEmitter();
        this.failure = false;
        this.method = queryObj.method;
        this.user = queryObj.authUser;

    }

    queryEventRegister(): Promise<IDealCraftHttpResponses | string> {
        return new Promise(async (resolve, reject) => {

            this.myEmitter.on("failure", (e) => {
                this.failure = true;
                console.log(`a failure occurred!  ${e.state} message: ${e.message}`);
                reject(httpResponses(execState.status, e));
                return
            });
            this.myEmitter.once("completed", (result) => {
                console.log("Completed with status:" + result.message);
                try {
                    (!this.failure) ? resolve(httpResponsesOk(result.json)) : reject(httpResponses(404, this.response));
                    return;
                } catch (exception) {
                    logger.error("exc:" + exception.message);
                    reject(httpResponses(BAD_REQUEST, exception.message))
                    return;
                }
            });

            // JWT validity check //
            // this.user = this.user;

            switch (this.method) {
                case QueryMethod.getUsersItems:
                    this.getUsersItems();
                    break;
                case QueryMethod.getUserDeals: {
                    console.debug("QueryEngine: getUserDeals");
                    return await this.getUserDeals();
                    break;
                }
                case QueryMethod.getDealProperties: {
                    return await this.getDealProperties();
                    break;
                }
                case QueryMethod.getAllUsersItems: {
                    return await this.getAllUsersItems();
                    break;
                }
                default:
                    logger.error("unsupported query method");
                    throw new Error("unsupported query method");
            }
        })
    }

    getAllUsersItems() {
        return getUsersItems(null, null).then(resShare => this.myEmitter.emit("completed", {
            status: 200,
            message: "DONE",
            json: resShare,
        })).catch(err => this.response.status(404));
    };

    getUsersItems() {
        getUsersItems("uuidCompanion", this.user).then(r => {
            this.myEmitter.emit("completed", {status: 200, message: "DONE", json: r});
            return;
        })
            .catch(err => this.response.status(404).end());
    }

    async getUserDeals() {
        let resShare = [];
        let promMain: any = [];
        let userHome = getUserHome(this.user);
        if (!userHome) {
            return (noUserTokenProvidedResponse("getUserDeals:checkUserJwt", this.response));
        }
        // paralllized
        const fields: string[] = ["uuidCompanion", "uuidCompanionInviter"];
        let d = await PromisePool.withConcurrency(fields.length).for(fields).process(
            async (key) => {
                console.debug("uuidCompanion key:" + key);
                let proc = await getUsersItems(key, this.user, true, INVITE_TRACKING_SUBCOLLECTION_DOC,this.queryS)
                    .then(async res => {
                        if (res == undefined || res === []) {
                            this.myEmitter.emit("failure", {
                                status: NOT_FOUND, message: "NO DEALS FOUND",
                            });
                        } else {
                            ///
                            const {results, errors} = await PromisePool
                                .withConcurrency(10).for(res).process(
                                    ///
                                    async (value: DcQueryResultsOutput, index, pool) => {
                                        let prom = await getDocJsonFirestoreByPath((value.assetdata.path)).then(data => {
                                            wrapDealDocumentString(resShare, data, value.assetpath, value.assetdata);
                                        });
                                    })
                        }
                    }).catch(err => {
                        logger.error(err);
                        this.myEmitter.emit("failure", {
                            status: 410, message: "getDocJsonFirestoreByPath FAILURE",
                        });
                    }).then(keyRes => {
                        logger.info("keyRes:" + keyRes)
                    }).catch(err => logger.err("keyRes error:" + err));
            }).then((mes) =>
            //promMain.push(proc);

        {
            this.myEmitter.emit("completed", {
                status: 200,
                message: mes,
                json: resShare,
            });
            return;
        }).catch(err => logger.error(err));

    }

    // return;

    async getDealProperties() {
        let participantsInDeal = [];

        let docRefID = this.request.query.docRefID !== undefined ? this.request.query.docRefID : this.request.body.docRefID;
        if (!docRefID) throw new Error("docRefID not found:" + BAD_REQUEST);
        console.debug("getDealProperties:" + docRefID);

        try {
            return await getDealParticipants(docRefID, this.response, participantsInDeal).then(r => {
                this.myEmitter.emit("completed", {
                    status: 200,
                    message: "DONE",
                    json: r,
                });
                return;
            }).catch(err => {
                logger.error("error getting participants: " + err);
                return this.response.status(NOT_FOUND).json({"error": err}).end();
            });
        } catch (e) {
            console.log("participants.js error:" + e);
            return;
        }
    }


};