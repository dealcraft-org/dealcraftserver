const {checkUserJwt} = require("./UserAuth");
const {getUsersItems} = require("./userassets");
const {updateJsonFirestoreByPath} = require("./helpers");


exports.dealpricemgmt = async function(docRefID, priceObject) {
  let jsonData = {"dealProperties": priceObject};
  await getUsersItems("docRefID", docRefID).then(recPath => {
    updateJsonFirestoreByPath(recPath[0].assetpath, jsonData);
    return ({updated: true});
  }).catch(err => {
    return ("price update failed:" + err)});
  }
