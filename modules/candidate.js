const functions = require("firebase-functions");
const {getUsersItems} = require("./userassets");
const {updateJsonFirestoreByPath} = require("./helpers.js");
const {runtimeOpts} = require("../var");
const {
  checkUserJwt,
  getLegexaUserByEmail,
  sendInviteByEmail,
} = require("./UserAuth");
const {
  setDefCorsHeader,
  getUserHome,
  setExecState,
  execState,
} = require("./utils");
const {getDealParticipants} = require("./participants");
const cors = require("cors")({origin: true});
;
const {
  getDocJsonFirestoreByPath,
  writeJsonFirestoreByPath,
} = require("./helpers");
const {logger} = require("firebase-functions");

const _ = require("lodash");
const e = require("cors");
//// global temp
const EventEmitter = require("events");
const constants = require("constants");
const {
  INVITE_GENERIC_UUID, DealType, DealStatus, DocRelType,
  DealParticipantRelType,
} = require("../constants");
const {dealpricemgmt} = require("./updateDealPrice");
const {write} = require("firebase-functions/lib/logger");
const {setDealInvExtraProperties, getDocInvID} = require("./dealproperties");


function updateUsersDealsRefs(r, docDealPath, currentUserUid, emitterRef, customers, docRefID, loggedInUser) {


  return new Promise((resolve, reject) => {
      // defining name for invite reference id
      const docInvID = getDocInvID(docRefID);
// setting invite ownership information
      let userHomeDoc = getUserHome(currentUserUid, docInvID);
      setDealInvExtraProperties(customers, {
        "currentUserUid": currentUserUid,
        "loggedInUser": loggedInUser,
      }, docInvID, userHomeDoc);


      let jsonRefDelta;
      getDocJsonFirestoreByPath(userHomeDoc).then(result => {
          let deals = result;
          let modeCreateDocPath = false;
          if (deals == undefined) {
            modeCreateDocPath = true;
          }
          console.log("data:" + (deals));

          let myRole = customers.role;
          let mainContact = currentUserUid != INVITE_GENERIC_UUID ? "uuid" : customers.email ? "email" : "mobile";
          let otherDeals = deals ? deals[myRole] : {};
          let merged = {
            path: docDealPath, ...otherDeals, ...customers,
          };

          jsonRefDelta = _.merge(deals ? deals : {}, merged)


          ;//.deals[[myRole]] = v;//deals

          console.log("update started for users/deals");
          return;

        },
      ).then(() => {
        //updateJsonFirestoreByPath(userHomeDoc, jsonRefDelta).then(
        writeJsonFirestoreByPath(userHomeDoc, jsonRefDelta).then(
          (r) => {
            resolve("done");
            return;
          })
          .catch(err => {
            logger.error("updateJsonFirestoreByPath:" + err);
            reject("updateJsonFirestoreByPath:" + err);
            return;
          });
      }).catch(err => {
        logger.error("update refs to user deals failed:" + err);
        reject(err);
        return;
      });
      //return setExecState(execState, 200, "updateJsonFirestoreByPath passed");
    },
  )
    ;

}


exports.sendInvite = functions.runWith(runtimeOpts).https.onRequest(async (request, response) => {
  if (setDefCorsHeader(response, request)) {
    let emailAddressToSend = request.body.email;
    let v = await sendInviteByEmail(emailAddressToSend);
    return response.status(200).json({"email": emailAddressToSend}).end();
  }
});
exports.addCandidate = functions.runWith(runtimeOpts).https.onRequest(async (request, res) => {
  let docRefID = request.body.docRefID;
  let jsonData = request.body.docUpdate;
  //jsonData.push({});
  await getUsersItems("docRefID", docRefID).then(recId => {
    if (recId.length == 0) return Promise.reject(res.status(404).send("doc not found").end());
    //console.log(recId.length + " doc:" + docRefID);
    updateJsonFirestoreByPath(recId[0]["assetpath"], jsonData).then(r => console.debug("updated"));
  }).then(r => {
    res.status(200).send("candidate activated " + docRefID + "-" + JSON.stringify(jsonData)).end();
    console.log(r);
  }).catch(err => functions.logger.warn("error activating candidate:" + err));
});
exports.updateDealMetadata = functions.runWith(runtimeOpts).https.onRequest(async (request, response) => {
    let participantsInDeal = [];
    // const LegexaEmitter = require("./LegexaEmitter");
    // const myEmitter = new LegexaEmitter().getInstance();
    const myEmitter = new EventEmitter();
    let inProgress = true;
    let tokenID;
    let [continueExecution, funcRef] = setDefCorsHeader(response, request);
    if (!continueExecution) {
      //console.log("queryEngine cors/authorization problem:"+request.headers.au);
      //setExecState(execState, 400, "cores/authorization problem");
      //myEmitter.emit("failure", execState);
      //return response.status(execState.state).json(execState.message).end();;
      if (!funcRef) {
        console.error("return function not defined");
      } else {
        return funcRef();
      }

    } else {
      myEmitter.on("event", (e) => {
        console.log("an event occurred!" + e.state + e.message);
        try {
          return cors(request, response, () => {
            return response.json(execState).status(execState.status).end();
          });
        } catch (err) {
          console.log("error:" + err);
          return;
        }
      });
      ;
      myEmitter.on("failure", (e) => {
        console.log(`a failure occurred!  ${e.state} message: ${e.message}`);
        try {
          return response.json(execState).status(execState.status).end();
        } catch (err) {

          console.log(err);
          return;
        }
        inProgress = false;
      });
//
      tokenID = request.headers.authorization.split(" ")[1];
      if (!tokenID) {
        setExecState(execState, "405", "auth error:" + err);
        myEmitter.emit("failure", execState);
      }


      console.log("proceed token");
      let jsonData = {"dealProperties": {}};
      let docRefID = request.body.Customers?.docRefID || request.body.docRefID;
      let currentPrice = request.body.currentPrice ? jsonData.dealProperties = {"amountValue": request.body.currentPrice} : null;
      let customers = request.body.Customers;
      let promises = [];
      if (currentPrice) {
        await dealpricemgmt(docRefID, currentPrice).then(() => {
          !customers && myEmitter.emit("event", () => {
            return setExecState(execState, 200, "price updated");
          });
          return;
        });
      }
      if (customers) {

        let customerUid = null;

        function checkUserEmail(email) {
          let d;
          return new Promise((resolve, reject) => {
            console.debug("email:" + email);
            let v = getLegexaUserByEmail(email).then(r => {
              customerUid = r.found ? r.data.uid : INVITE_GENERIC_UUID;
              //setting target user
              console.log("CCUID:" + customerUid);
              jsonData = {
                "dealProperties": {
                  "participants": [{
                    "uuidCompanion": customerUid,
                    "email": r.data?.email ? r.data.email : email, ...customers,
                  }],
                },
              };
              resolve({json: jsonData, check: r.found});
              return;
            }).catch(err => {
              reject("error validating:" + err);
              return;
            });
          });
        }

        let currentUserUid = "";
        await checkUserJwt(tokenID).then(async ruid => {
          currentUserUid = ruid;
          await checkUserEmail(customers.email)
            .then((r) => getUsersItems("docRefID", docRefID).then(docRefID => {
              return Promise.resolve({
                docRefID: docRefID,
                isLegexaUserRegistered: r.check,
              });
            }))
            .then(recId => {
              new Promise(async (resolve, reject) => {
                if (recId.docRefID.length == 0) reject("no-record");
                await getDealParticipants(docRefID, response, participantsInDeal).catch(err=>{console.debug("no participants")});
                if (participantsInDeal.length != 0) {
                  jsonData.dealProperties.participants.push(...participantsInDeal);//...jsonData.dealProperties.participants};
                }
                updateJsonFirestoreByPath(recId.docRefID[0]["assetpath"], jsonData)
                  .then(r => updateUsersDealsRefs(r, recId.docRefID[0]["assetpath"], customerUid, myEmitter, customers, docRefID, currentUserUid)) // replacing with virtual user instead of currentUserUid
                  .then(r => {
                    setExecState(execState, 200, "aaaa");
                    resolve(execState);
                  }).catch(err => {
                    setExecState(execState, 405, "updateJsonFirestoreByPath:" + err);
                    reject("upd json metadata failed:" + err);
                  },
                );
                return;
              }).then((e) => {
                myEmitter.emit("event", execState);
              }).catch(err => {
                logger.error("error act candidate:" + err);
                setExecState(execState, 401, "error act candidate:" + err.message);
                myEmitter.emit("failure", execState);

              });

            }).catch(err => {
              functions.logger.error("error activating candidate:" + err);
              return setExecState(execState, 404, "doc not found" + docRefID);
            });
        }).catch(err => {
          logger.error("failure error:" + err);
          setExecState(execState, 403, "error jwt block:" + err);
          myEmitter.emit("failure", execState);
        });
      }


// wait till all finished //
      logger.debug("shouldn't be here");
      return;
//se
    }
  },
)
;



