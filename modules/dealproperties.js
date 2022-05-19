const constants = require("../constants");

const {db} = require("./firestoredb");
const {logger} = require("firebase-functions");
const functions = require("firebase-functions");
const {runtimeOpts} = require("../var");
const {setDefCorsHeader} = require("./utils");
const {getDealParticipants} = require("./participants");
const {DealParticipantRelType, DealType, DealStatus} = require("../constants");
//const {getDealParticipants} = require("./dealproperties");
exports.setDealInvExtraProperties=function(legexaInviteObject,extraParameters, docInvID, userHomeDoc, dealParticipantRelType = undefined, dealType = undefined, dealStatus = undefined) {
  legexaInviteObject.uuidCompanionInviter = extraParameters.loggedInUser;//owner
  legexaInviteObject.uuidCompanion = extraParameters.currentUserUid;
  legexaInviteObject.docInvID = docInvID;
  legexaInviteObject.docInvPath = userHomeDoc;
  legexaInviteObject.dealParticipantRelType = !dealParticipantRelType ? DealParticipantRelType.dealParticipant : dealParticipantRelType;
  legexaInviteObject.dealType = !dealType ? DealType.principal : dealType;
  legexaInviteObject.dealStatus = !dealStatus ? DealStatus.open : dealStatus;
  console.info("legexaInviteObject:" + legexaInviteObject);
  return legexaInviteObject;

}
exports.getDocInvID=function(docRefID) {
  return `${docRefID}${Math.floor(Math.random() * 3)}`;
}
exports.getDealParticipantProperties = functions.runWith(runtimeOpts).https.onRequest(async (request, res) => {
  if (setDefCorsHeader(res, req)) {
    let docRefID = req.query.docRefID !== undefined ? req.query.docRefID : req.body.docRefID;
    console.log("search started for:" + docRefID);
    let participantsInDeal = [];
    try {
      let vRes= await getDealParticipants(docRefID,res,participantsInDeal);
      return res.json((vRes)).status(200).end;

    } catch (e) {
      console.log("participants.js error:" + e);
      //return res.json("failed" + e);
      return
    }
  }
});



