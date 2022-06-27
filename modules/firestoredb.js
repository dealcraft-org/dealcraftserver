const admin = require("../services/providers/firebaseProvider").getInstance();
// const functions = require("firebase-functions");
const constants = require("../constants");
const {logger} = require("../services/logger");


class FirestoreDb {
  db = null;
  admin = null;

  constructor() {
    console.log("admin");
    this.admin = admin;
    this.db = admin.firestore();
  }

  getDb() {
    return this.db;
  }

  getAdmin() {

    return this.admin;
  }

  getDocs(key, value,inArray=false,collectionSearchGroup=undefined) {
    return new Promise((resolve, reject) => {
      let query, collectionGroup;
      collectionGroup = this.db.collectionGroup(collectionSearchGroup ?  collectionSearchGroup :constants.SECONDARY_FRS_DIR_COLLECTION );
      query = (key != null) ? collectionGroup
        .where(key, "==",
          `${value}`) : collectionGroup;

      if (inArray === true) {
        //TO
        query = collectionGroup.where("participants", "array-contains-any", {key: value})
        console.log("query:" + query.toJSON())
      }

      resolve(query.get());
      return;
    });
  }

  extendUserInfo(participant) {
    console.log(`${constants.USER_IDS_COLLECTION})(${participant.uuidCompanion}`);
    let vDoc = participant.uuidCompanion;
    return this.db.collection(constants.USER_IDS_COLLECTION).doc(vDoc).get().then(x => {
      if (x.exists) {
        console.debug("participant exists:" + x.data());
        let newPart = x.data();
        newPart["role"] = (participant.role);
        return Promise.resolve(newPart);
      } else if (participant) {
        console.debug("participant exists,not registered:" + participant);
        return Promise.resolve(participant);
      } else {
        return Promise.reject(null);
      }

    }).catch(err => logger.warn("cant user locate:" + err));
  }
}

let db = new FirestoreDb();
exports.db = db;
