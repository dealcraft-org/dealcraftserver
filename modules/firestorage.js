const constants = require("../constants");
const admin = require("firebase-admin");

function getRandFilename(filename) {
  const imageExtension = filename.split(".")[
  filename.split(".").length - 1
    ];
  // Setting filename
  let imageFileName = `${Math.round(
    Math.random() * 1000000000,
  )}.${imageExtension}`;
  return imageFileName;
}

exports.fireVehStorage = async function fireVehStorage(carObject, imageDataClean, formparam, resolve) {
  console.log("vin:" + carObject.vehicle_vin + carObject.jsonPlateConf);

  if ((formparam["store"] == "true" && carObject.jsonPlateConf > 0.85)) {
    console.log("executing store on platenumber:" + carObject.jsonPlate);
    const helperWriter = require("./helpers.js");
    const uploadDir = `${constants.PATH}/${carObject.vehicle_vin}/${carObject.jsonPlate}/${carObject.uuid}/`;
    // let filePromise =
    //let v = new Promise(function(resolve, reject) {
    await helperWriter.fileUploader(imageDataClean, uploadDir,
      getRandFilename(carObject.filename), carObject.uuid).then(f => {
      console.log("file written succesfully:" + f.id);
      return resolve(f);
      //  }).then(f=>{return resolve(f)});
    });
    // .then(f => {
    //   //refFileUrl = f.id;
    //   console.log("file url:" + f.id);
    //   return resolve(f);
    // }).catch(err => console.log(err))})
    // return resolve(refFileUrl);

  }
};

exports.updateImages = function updateImages(imageDataClean, path, filename, formparam, resolve) {
  //console.log("vin:" + carObject.vehicle_vin + carObject.jsonPlateConf);

  if ((formparam["store"] == "true" )) {
    console.log("storing at path:" + path);
    const helperWriter = require("./helpers.js");
    const uploadDir = path;
    // let filePromise =
    //let v = new Promise(function(resolve, reject) {
    helperWriter.fileUploader(imageDataClean, uploadDir,
      getRandFilename(filename),formparam["uuid"]).then(f => {
      console.log("file written successfully:" + f.id);
       resolve(f);

      //  }).then(f=>{return resolve(f)});
    });

    // .then(f => {
    //   //refFileUrl = f.id;
    //   console.log("file url:" + f.id);
    //   return resolve(f);
    // }).catch(err => console.log(err))})
    // return resolve(refFileUrl);

  }
  return
};


exports.deleteImageFromFirebase = async function deleteImageFromFirebase(imageName) {
  await admin.storage().bucket().file(imageName).delete();
};
