const crypto = require("crypto");
const constants = require("../constants");
const {CORS_GENERIC} = require("../constants");
const {StatusCodes} = require("http-status-codes");
const _ = require("lodash");

exports.tokenImg = function tokenImg(token) {
  return crypto.createHash("md5").update(token).digest("hex");
};
exports.execState = {state: {}, message: {}};

exports.setExecState = (ref, state, message) => {
  ref.state = state;
  ref.message = message;
  //return ref;
};

exports.validateParam = function validateParam(field, res, msg) {
  if (field == undefined || field == null || field == "") {
    console.debug("field undefined:" + field);
    return res.status(StatusCodes.BAD_REQUEST).json({"reason": `invalid request = method is ${msg}`}).end();
  } else {
    return null;
  }
};
exports.getUserHome = function(e, docName = "") {
  if (!e) {
    //reject("not user");
    throw ("not user" + e);
    //return;
  }
  // if (e===constants.INVITE_UUID) {return constants.INVITE_TRACKING_DOC}
  // return constants.USER_IDS_COLLECTION + `/${e}`;
  let userDir = `${constants.INVITE_TRACKING_DOC}/${e}/${constants.INVITE_TRACKING_SUBCOLLECTION_DOC}/${docName}`;
  console.debug("USDir:" + userDir);
  return userDir;
};
exports.getStoragePath = function(docRef) {
  let plateNumber = docRef["platenumber"];
  let vehVin = docRef["vehVin"];
  let intDocRefID = docRef["docRefID"];
  let pathtoImg = `${constants.PATH}/${vehVin}/${plateNumber}/${intDocRefID}/`;
  return pathtoImg;
};
exports.findValuesDeepByKey = (obj, key, res = []) => (
  _.cloneDeepWith(obj, (v, k) => {
    k == key && res.push(v);
  }) && res
);

exports.setDefCorsHeader = function(response, request, funcRef) {
  if (request.method === "OPTIONS") {
    response.set(CORS_GENERIC);
    console.debug("options dispatched");
    funcRef = function() {return response.status(200).send().end();}
    return [false,funcRef];
  } else if (!request.headers.authorization) {
    funcRef = function() {return response.status(405).json(constants.ERROR_AUTHORIZATION_HEADER).end();};
    return [false,funcRef];
  } else {
    response.set(CORS_GENERIC);
    return [true,undefined];
  }

};
exports.wrapDealDocument = function wrapDealDocument(resultStore, doc) {
  if (doc.ref.path) {
    resultStore.push(
      {
        "assetpath": doc.ref.path,
        "assetdata": doc.data(),
      });
  }
};
exports.wrapDealDocumentString = function wrapDealDocument(resultStore, doc, assetPath,dealData=undefined) {

  resultStore.push(
    {
      "assetpath": assetPath,
      "assetdata": doc,
      "dealdata": dealData
    });
};