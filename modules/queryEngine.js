const {logger} = require("firebase-functions");
const {
  execState,
  getUserHome,
  wrapDealDocumentString,
} = require("../modules/utils");
const {checkUserJwt} = require("./UserAuth");
const {noUserTokenProvidedResponse} = require("./responses");
const {getUsersItems} = require("./userassets");
const {INVITE_TRACKING_SUBCOLLECTION_DOC} = require("./../constants");
const {getDocJsonFirestoreByPath} = require("./helpers");
const {BAD_REQUEST, NOT_FOUND} = require("http-status-codes");
const {getDealParticipants} = require("./participants");
const EventEmitter = require("events");
const method = Object.freeze({
  getAllUsersItems: "getAllUsersItems",
  getUsersItems: "getUsersItems",
  getUserDeals: "getUserDeals",
  getDealProperties: "getDealProperties",
});

module.exports.QueryEngine = class QueryEngine {


  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.method = request.query.method;
    this.cors = require("cors")({origin: true});
    this.tokenID = this.request.headers.authorization.split(" ")[1];
    this.myEmitter = new EventEmitter();
    this.failure = false;
    this.myEmitter.on("failure", (e) => {
      this.failure = true;
      console.log(`a failure occurred!  ${e.state} message: ${e.message}`);
      return this.response.json(execState).status(execState.status).end();
    });
    this.myEmitter.once("completed", (e) => {
      console.log("Completed with status:" + e.message);
      try {
        return (!this.failure) ? this.response.json(e.json).status(200).end() : this.response;
      } catch (exception) {
        logger.error("exc:" + exception.message);
        return;
      }
    });
    this.user = null;

  }

  validateJWT() {
    return new Promise(async (resolve) => {
      await checkUserJwt(this.tokenID).then(ruid => {
        resolve(ruid);
      }).catch((err) => {
          this.myEmitter.emit("failure", {
            status: 405, message: "JWT FAILURE" + err,
          });
          return;
        },
      );
    });
  }


  async execQuery() {
    // JWT validity check //
    this.user = await this.validateJWT().then(user => user);

    switch (this.method) {
      case method.getUsersItems:
        this.getUsersItems();
        break;
      case method.getUserDeals: {
        console.debug("QueryEngine: getUserDeals");
        return await this.getUserDeals();
        break;
      }
      case method.getDealProperties: {
        return await this.getDealProperties();
        break;
      }
      case method.getAllUsersItems: {
        return await this.getAllUsersItems();
        break;
      }
      default:
        logger.error("unsupported query method");
        throw new Error("unsupported query method");
    }

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
    let promMain = [];
    let userHome = getUserHome(this.user);
    if (!userHome) {
      return (noUserTokenProvidedResponse("getUserDeals:checkUserJwt", this.response));
    }
    for (let key of ["uuidCompanion", "uuidCompanionInviter"]) {
      console.debug("uuidCompanion key:" + key);
      let proc = getUsersItems(key, this.user, true, INVITE_TRACKING_SUBCOLLECTION_DOC)
        .then(async res => {
          if (res == undefined || res === []) {
            this.myEmitter.emit("failure", {
              status: NOT_FOUND, message: "NO DEALS FOUND",
            });
          } else {
            for (const value of res) {
              let prom = await getDocJsonFirestoreByPath((value.assetdata.path)).then(data => {
                wrapDealDocumentString(resShare, data, value.assetpath, value.assetdata);
              });
            }
          }
        }).catch(err => {
          logger.error(err);
          this.myEmitter.emit("failure", {
            status: 410, message: "getDocJsonFirestoreByPath FAILURE",
          });
        });
      promMain.push(proc);
    }
    Promise.allSettled(promMain).then(() => {
      this.myEmitter.emit("completed", {
        status: 200,
        message: "DONE",
        json: resShare,
      });
      return;
    });


    // return;
  };

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