const {checkUserJwt} = require("../services/auth/UserAuth");
const {getUsersItems} = require("../services/asset/userAssets");
const {updateJsonFirestoreByPath} = require("./helpers");


exports.dealPriceMgmt = async function(docRefID, priceObject) {
  let jsonData = {"dealProperties": priceObject};
  await getUsersItems("docRefID", docRefID).then(recPath => {
    updateJsonFirestoreByPath(recPath[0].assetpath, jsonData);
    return ({updated: true});
  }).catch(err => {
    return ("price update failed:" + err)});
  }
