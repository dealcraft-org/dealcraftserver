import {ReasonPhrases, StatusCodes,getReasonPhrase} from "http-status-codes";

type DealCraftHttpResponseTypes=ReasonPhrases|string|undefined|null;
export interface IDealCraftHttpResponses {
    httpCode?: StatusCodes
    httpResponse?:DealCraftHttpResponseTypes;
    asset?:string
}
class DealCraftHttpResponses implements IDealCraftHttpResponses{
    httpCode: StatusCodes;
    httpResponse: DealCraftHttpResponseTypes;
    constructor(httpCode:StatusCodes,httpPhrase?:DealCraftHttpResponseTypes) {
        this.httpCode=httpCode
        this.httpResponse=httpPhrase ?? getReasonPhrase(httpCode.valueOf());
    }
    // public getJson(){
    //     return {httpCode:this.httpCode,httpResponse:this.httpResponse}
    // }
}
export function httpResponsesOk(httpResponse?:DealCraftHttpResponseTypes):IDealCraftHttpResponses {
    return new DealCraftHttpResponses(StatusCodes.OK,httpResponse)//.getJson()
}export function httpResponses(httpStatusCode:StatusCodes,httpResponse?:DealCraftHttpResponseTypes):IDealCraftHttpResponses {
    return new DealCraftHttpResponses(httpStatusCode,httpResponse)//.getJson()
}