const {db} = require("./firestoredb");
const {logger} = require("firebase-functions");
const {INVITE_TRACKING_SUBCOLLECTION_DOC} = require("../constants");
const {ref} = require("firebase-functions/lib/providers/database");
const {setExecState} = require("./utils");
const {NOT_FOUND} = require("http-status-codes");

exports.getDealParticipants = function(docRefID, res, participantsInDeal) {
  return new Promise((resolve, reject) => {
    let result = db.getDocs("docRefID", docRefID, false, INVITE_TRACKING_SUBCOLLECTION_DOC).then(async refDoc => {
      if (refDoc.empty) {
        logger.warn("search ended with no results for " + docRefID + " total " + refDoc.docs.length);
        reject(setExecState(res,NOT_FOUND,"req not found "));
        return
      }
      console.info("docs found for:" + refDoc.docs.length);
      //console.log(refDoc[0].data().uuid)

      for (let i = 0; i < refDoc.docs.length; i++) {

        //console.log(refDocElement);
        let participants = refDoc.docs[i].data();
        logger.debug(participants);
        if (participants) {
          for (const participant of [participants]) {
            let extendedParticipantInfo = await db.extendUserInfo(participant);
            //console.debug(extendedParticipantInfo);
            if (extendedParticipantInfo != null) {
              participantsInDeal.push(extendedParticipantInfo);
            }
          }
        }
      }


      // return res.json((participantsInDeal)).status(200);
      resolve(participantsInDeal);
      return
    }).catch(err => {
      console.log("reject:" + err.message);
      //fix
      reject([]);
      return;
    });
    //console.log("Res gdts:" + result);
    //reject(result);
    //return;
  });
};