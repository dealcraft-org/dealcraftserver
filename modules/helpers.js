// const functions = require("firebase-functions");
//const tokenImg = require("./utils").tokenImg()
const admin = require("firebase-admin");
//var dbIns = require("../index");
///const firebase = require("firebase-admin/lib/firestore");
const {db} = require("./firestoredb");
const {firebaseMethod} = require("../var");
const {tokenImg} = require("./utils");
const {firestore} = require("firebase-admin");

// Creates a client

function firebaseDocCRUD(writePath, json, resolve, reject, method) {
  if (typeof writePath === "string") {
    writePath = db.getDb().doc(writePath);
  }
  functions.logger.log("update/skip/creat veh json data");

  async function innercrud() {
    let a = null;
    if (method == firebaseMethod.CREATEREC) {
      await writePath.set(json);
      return writePath;
    } else if (method == firebaseMethod.MODIFYREC) {
      await writePath.update(json).then(resa => console.info("update passed:" + resa)).catch(err => console.error("update failure:" + err));
      return writePath;
    }
    //return Promise.resolve(writePath);
  }

  innercrud().then(value => {
    let jsonTS = (method == firebaseMethod.CREATEREC) ? {"timeCreated": firestore.Timestamp.now()} : {"timeUpdated": firestore.Timestamp.now()};
    value.update(jsonTS).then(() => {
      functions.logger.debug("write completed:" + writePath.path);
      resolve("write completed " + writePath.path);
      ;

      //functions.logger.debug(value);
      //return Promise.resolve()

    })
      .catch(error => {
        functions.logger.error("gen error to firebase", error);
        reject("error reject:" + error);

      });
    return;
  });

}


exports.writeJsonFirestoreByPath = function writeJsonFirestoreByPath(writePath, json) {
  return new Promise((resolve, reject) => {
    firebaseDocCRUD(writePath, json, resolve, reject, firebaseMethod.CREATEREC);
    //vehGenRef.update({"timestamp":timestamp});
  });
};
exports.updateJsonFirestoreByPath = function updateJsonFirestoreByPath(writePath, json) {
  return new Promise((resolve, reject) => {

    // load document
    firebaseDocCRUD(writePath, json, resolve, reject, firebaseMethod.MODIFYREC);
    return;
  });
};
exports.getDocJsonFirestoreByPath = function updateJsonFirestoreByPath(path) {
  return new Promise((resolve, reject) => {

    // load document

    try {
      resolve(db.getDb().doc(path).get().then(doc => {
        return (doc.data());
      }));
    } catch (e) {
      reject("updateJsonFirestoreByPath failed:"+e);
    }
    return;
  });
};

//https://www.sentinelstand.com/article/guide-to-firebase-storage-download-urls-tokens

exports.fileUploader = function fileUploader(imageData, path, fileName, uuid) {
  return new Promise((resolve, reject) => {
    console.log("file uploader");
    const defaultBucket = admin.storage().bucket();
    const defaultBucketName = defaultBucket.file(path + fileName);
    defaultBucketName.save((imageData),
      {metadata: {contentType: "image/jpeg"}}).then(() => {
      defaultBucketName.setMetadata({
        metadata: {
          "imageclass": "plate",
          "firebaseStorageDownloadTokens": tokenImg(uuid),
        },
      });
    }).then(() => {
      return resolve(defaultBucketName);
    })
      .catch(err => {
        console.log("firestore err:" + err);
        return reject(err);
      });
  });
};

