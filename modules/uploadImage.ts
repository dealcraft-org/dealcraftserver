"use strict";

import OwnerInvite, {IOwnerInvite} from "../interfaces/Deals";
import 'dotenv/config'
import CustomerType from "../interfaces/CustomerType";

const constants = require("../constants");
const getVehDetails = require("../services/asset/getVehData");
const fireVehStorage = require("./firestorage");
const helperWriter = require("./helpers.js");
const sharp = require("sharp");
const path = require("path");
const {getStoragePath, setDefCorsHeader, getUserHome} = require("./utils");
const {updateImages} = require("./firestorage");
const {updateJsonFirestoreByPath} = require("./helpers.js");
const {writeJsonFirestoreByPath} = require("./helpers.js");
const {deleteImageFromFirebase} = require("./firestorage");
const {getUsersItems} = require("../services/asset/userAssets");
const {opsMethods: methods} = require("../var");
const {StatusCodes} = require("http-status-codes");
const {crop} = require("./imagemanipulation");
const {tokenImg, validateParam} = require("./utils");
const {logger} = require("../services/logger").getInstance();
const {DealType, DealStatus, DealParticipantRelType} = require("../constants");
const {setDealInvExtraProperties, getDocInvID} = require("./dealproperties");
const {isEmpty} = require("lodash");

//TODO add reference add detection data Done
// add roles

interface IImgFilesBundle {
  image?:string,
  index:number,
  base64:Buffer[],
}

// Done- support multiple file uploading //
let imgFilesBundle:IImgFilesBundle[] = [];
const buffers = {};

function getPublicImgUrl(ref, tokenUUID) {
  return `https://firebasestorage.googleapis.com/v0/b/${ref.bucket.id}/o/${ref.id}?alt=media&token=${tokenImg(tokenUUID)}`;
}

let ownerInvite:IOwnerInvite = new OwnerInvite()
function getPathToImage(docRefID) {
  let pathtoImg = getStoragePath(getAssetData(docRefID));
  return pathtoImg;
}

function getAssetData(docRefID) {
  return docRefID[0][constants.ASSETDATA];

}

function getAssetPath(docRefID) {
  return docRefID[0][constants.ASSETPATH];
}

const uploadImage = function(request, response) {
    // let [continueExecution, funcRef] = setDefCorsHeader(response, request);
    // if (!continueExecution) {
    //   if (!funcRef) {
    //     console.error("return function not defined");
    //   } else {
    //     return funcRef();
    //   }
    // } else {
      const BusBoy = require("busboy");
      const fetch = require("node-fetch");
      const FormData = require("form-data");
      let platePic = null;
      let busboy = new BusBoy({headers: request.headers});
      let origFileName = null;
      var imageData = [];
      var imageDataClean:Buffer[] = [];
      let formparam = {};
      let jsonPlate, jsonPlateConf, methodOps, uuid = null;
      let vehicle_vin = null, vehicle_json = null,
        initPlateImgsPromise = null;

      ///////
      // let imageToBeUploaded = {};
      busboy.on("field", (fieldName, val) => {
          console.log("fieldname : " + fieldName);
          console.log("value : " + val);
          formparam[fieldName] = val;
          //validateParam(method, res, "missing");
          if (fieldName == "method") {
            let method = formparam["method"];
            switch (method) {
              case "PLATEFLOW":
                methodOps = methods.PLATEFLOW;
                break;
              case "PLATEFLOWNOIMG":
                methodOps = methods.PLATEFLOWNOIMG;
                break;
              case "DELIMGMAIN":
                methodOps = methods.DELIMGMAIN;
                break;
              case "CHGIMGMAIN":
                methodOps = methods.CHGIMGMAIN;
                break;
              case "ASSETPASSPORT":
                methodOps = methods.ASSETPASSPORT;
                break;
              case "CHGIMGGAL":
                methodOps = methods.CHGIMGGAL;
                break;
              default:
                validateParam("UNSUPPORTED", response, "not supported");
            }
          }
        },
      )
      ;


      busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        if (!mimetype.match(/^image/)) {
          return response
            .json({error: "Wrong file type submitted!"}).status(400);
        }

        let buffer;
        buffers[filename] = [];

        file.fileRead = [];
        origFileName = filename;

        file.on("data", data => {
          buffers[filename] = data;
          buffer = data;//file.read();
        }).on("end", function() {
          console.log("end file");
          imageData = buffer.toString("base64");
          imageDataClean = buffer;
          imgFilesBundle.push({index: filename, base64: imageDataClean});
        });
        //imageFileName = getRandFilename(filename);
        origFileName = filename;

      }).on("finish", async () => {
        console.debug("finish triggered");
        let promises:Promise<any>[] = [];
        let plateJson;
        let carObject, jsonMaster, mainProfilePicUrl, mainProfilePic,
          plateFileUrl;
        let docRefID = formparam["docRefID"];

        let resval = null;
        let mock = ((formparam["mock"]) == "true") ? true : false;

        function getDocRefID() {
          docRefID = formparam["docRefID"];
          if ((resval = validateParam(docRefID, response, "missing docRefID")) !== null) return resval;
          return getUsersItems("docRefID", docRefID);
        }

        function getPlateDetection() {
          return new Promise(function(resolve, reject) {
            //let image_path = '/path/to/car.jpg'
            console.log("for moc:" + formparam["mock"]);
            if (!mock) {
              let body = new FormData();
              //body.append('upload', streamifier);
              console.log("image size base64:" + imageData.length);// .valueOf()!.length);
              body.append("upload", (imageData.valueOf()));
              body.append("regions", "il"); // Change to your country
              fetch(process.env.PLATE_READER_URL_ENV, {
                method: "POST",
                headers: {
                  "Authorization": process.env.PLATE_TOKEN,
                },
                body: body,
              }).then(res => res.json())
                .then(json => {
                  //console.log(json);
                  plateJson = json.valueOf();
                  return resolve(json);
                })
                .catch((err) => {
                  console.log(err);
                  return reject(err);
                });
            } else {
              //return new Promise(resolve,reject=>{
              console.log("mock on");
              plateJson = (JSON.parse("{\"results\": [{\"plate\": 49770401, \"score\": 0.901}]}"));
              return resolve(plateJson);
            }
          });
        }

        function getVehicleTechDetails() {
          return new Promise(function(resolve, reject) {
            {
              console.log("json:" + plateJson);
              if (plateJson.results.length === 0) {
                response.status(404).send("plate not detected");
              } else if (plateJson.results.length > 1) {
                response.status(403).send("more than one number detected, please use single vehicle pic");
              }
              jsonPlate = plateJson.results.map(function(obj) {
                return obj["plate"];
              });
              jsonPlateConf = plateJson.results.map(function(obj) {
                return obj["score"];
              });

              //console.log("crop str:"+platePic);
              /// get vin ///
              //jsonVeh = new Promise(function(resolve, reject) {
              return (getVehDetails(jsonPlate, resolve, reject));
            }
          }).then((json:string) => {
            console.log("getvehdet json:" + json);
            vehicle_json = JSON.parse(json);
            vehicle_vin = vehicle_json!["vehicle_vin"];
            console.log("getvehdet json:" + vehicle_json!["vehicle_vin"]);
            carObject =
              {
                vehicle_vin: vehicle_json!["vehicle_vin"],
                jsonPlate: jsonPlate[0],
                jsonPlateConf: jsonPlateConf[0],
                filename: origFileName,
                uuid: formparam["uuid"],
                role: formparam["role"],
              };
            return Promise.resolve(carObject);
          });
        }

        function cropPlateImgUpload() {
          /// crop
          let boundingBox = plateJson.results[0].box;
          console.log("inside crop");
          crop(boundingBox, imageDataClean).then(
            r => {
              //console.log("crop str:" + r);
              platePic = r;
            }).catch(err => console.log(err));
          console.log("outside crop");
          return   new Promise(function(resolve) {
            if (platePic !== undefined) {
              return fireVehStorage.fireVehStorage(carObject, platePic, formparam, resolve);
            } else {
              resolve(undefined);
              return;
            }
          }).then(ref => {
            logger.debug("pst upload plate");
            plateFileUrl = getPublicImgUrl(ref, carObject.uuid);
            console.log("ref plate:" + getPublicImgUrl(ref, carObject.uuid));
            return (plateFileUrl);
          });
          return
        }

        function uploadPlateAndInitCarImage() {
          console.log("upload started");
          return new Promise(function(resolve) {
            return (fireVehStorage.fireVehStorage(carObject, imageDataClean, formparam, resolve));
          }).then((ref:File) => {
            logger.debug("pst upload");
            mainProfilePicUrl = getPublicImgUrl(ref, carObject.uuid);
            mainProfilePic = ref.name;
            Promise.resolve("sss");
          }).then(() => {
            // crop upload
            return cropPlateImgUpload();
          });
        }

        async function writeInitFireStoreData(ownerInvite:IOwnerInvite) {
          console.log("gene response");
          let pathToMaster = `${constants.MAJOR_FRS_DIR_COLLECTION}/${jsonPlate[0]}/${constants.SECONDARY_FRS_DIR_COLLECTION}/${docRefID}`;
          let FIRESTORE_PLAIN_ROOT_DIR = `${constants.MAJOR_FRS_DIR_COLLECTION}/${jsonPlate[0]}`;
          await helperWriter.writeJsonFirestoreByPath(pathToMaster, jsonMaster).then(() => helperWriter.writeJsonFirestoreByPath(FIRESTORE_PLAIN_ROOT_DIR, {"status": "active"}),
          );
          // write owner self invite to participate - preserve flutter flow - refactoring later
          if (ownerInvite) {
            const currentUserUid = ownerInvite.uuidCompanion;
            const docInvID = getDocInvID(docRefID);
// setting invite ownership information
            let userHomeDoc = getUserHome(currentUserUid, docInvID);
            setDealInvExtraProperties(ownerInvite, {
              "currentUserUid": currentUserUid,
              "loggedInUser": currentUserUid,
            }, docInvID, userHomeDoc, DealParticipantRelType.dealOwner, DealType.principal, DealStatus.open);
            ownerInvite.docRefID=( pathToMaster ?? "wrong");


            await helperWriter.writeJsonFirestoreByPath(userHomeDoc, ownerInvite).then(r => {
              console.log(r);
            });
          }
        }


        function cleanMemory() {
          console.debug("cleaning memory started start:" + process.memoryUsage().heapUsed);
          jsonMaster = null;
          jsonPlate = null;
          imageData = [];
          imageDataClean = [];
          imgFilesBundle = [];
          console.debug("cleaning memory started end:" + process.memoryUsage().heapUsed);
        }

/// detect plate
        switch (methodOps) {
          case methods.PLATEFLOW: {
            console.log("PLATEFLOW OP");
            uuid = formparam["uuid"];
            if ((resval = validateParam(uuid, response, "missing uuid")) !== null) return resval;
            await getPlateDetection().then(() => {
              getVehicleTechDetails().then(() => uploadPlateAndInitCarImage())
                .then(() => {

                  docRefID = (!mock) ?
                    docRefID = `${uuid}${Math.floor((new Date()).getTime() / 1000)}`
                    : docRefID = `${uuid}`;
                  console.log("master json builder:" + initPlateImgsPromise);
                  Promise.all([initPlateImgsPromise]).then(() => console.debug("all promisses complete"));
                  jsonMaster =
                    {
                      docRefID: docRefID,
                      uuidCompanion: carObject.uuid,
                      role: carObject.role,
                      platenumber: jsonPlate[0],
                      detect: generateJsonMockup(jsonPlate[0], jsonPlateConf[0], origFileName, imageData),
                      vehData: vehicle_json,
                      vehVin: vehicle_vin,
                      detectresponse: plateJson,
                      plateFileImgUrl: (plateFileUrl !== undefined) ? plateFileUrl : null,
                      mainProfileImgUrl: mainProfilePicUrl,
                      mainProfileImg: mainProfilePic,
                      visible: true,
                      // call to update dealmetadata


                    };

                  ownerInvite=  ({
                    docRefID: docRefID,
                    role: carObject.role,
                    uuidCompanion: uuid ?? "NO-UUID",
                    path: ""
                  });
                  //});
                  //rewrite
                  return Promise.resolve(ownerInvite);
                }).then((ownerInvite) =>
                writeInitFireStoreData(ownerInvite))
                .then(() => {

                  response.contentType("application/json").json((jsonMaster)).status(201).end();
                  //// clean memory ////
                  cleanMemory();

                });
            });
            break;
          }
          case methods.PLATEFLOWNOIMG: {
            console.log("PLATEFLOWNOIMG OP");
            uuid = formparam["uuid"];
            let plateNumber = formparam["plateNumber"];
            if ((resval = validateParam(uuid, response, "missing docRefID")) !== null) return resval;
            plateJson = (JSON.parse(`{"results": [{"plate": ${plateNumber}, "score": 0.999}]}`));

            getVehicleTechDetails()
              .then(() => {

                docRefID = (!mock) ?
                  docRefID = `${uuid}${Math.floor((new Date()).getTime() / 1000)}`
                  : docRefID = `${uuid}`;
                //console.log("master json builder:" + initPlateImgsPromise);
                jsonMaster =
                  {
                    docRefID: docRefID,
                    uuidCompanion: carObject.uuid,
                    role: carObject.role,
                    platenumber: jsonPlate[0],
                    detect: generateJsonMockup(jsonPlate[0], jsonPlateConf[0], origFileName, imageData),
                    vehData: vehicle_json,
                    vehVin: vehicle_vin,
                    detectresponse: plateJson,
                    plateFileImgUrl: (plateFileUrl !== undefined) ? plateFileUrl : null,
                    mainProfileImgUrl: (mainProfilePicUrl !== undefined) ? mainProfilePicUrl : null,
                    mainProfileImg: (mainProfilePic !== undefined) ? mainProfilePic : null,
                    visible: false,

                  };
                ownerInvite=new OwnerInvite()
                //});
                return Promise.resolve(ownerInvite);
              }).then(async (ownerInvite) =>
              await writeInitFireStoreData(ownerInvite))
              .then(() => {

                response.contentType("application/json").json((jsonMaster)).status(201).end();
                //// clean memory ////
                cleanMemory();

              }).catch(err => logger.error("PLATEFLOWNOIMG ADD ERROR:" + err));
            ;
            break;
          }
          case methods.DELIMGMAIN: {
            getDocRefID().then(docRefID => {
              if (docRefID.length == 0) {
                logger.error(`no ref doc found for docRefID${formparam["docRefID"]}`);
                response.status(StatusCodes.NOT_FOUND).send("no doc found").end();
              } else {
                let mainImgFile = docRefID[0]["assetdata"][constants.MAINASSETIMG];
                let mainImgFileURL = docRefID[0]["assetdata"][constants.MAINASSETIMGURL];
                console.log(docRefID[0]["assetdata"][constants.MAINASSETIMG]);
                deleteImageFromFirebase(mainImgFile).then(() => console.log("deleted file:" + mainImgFile));
                let delJson = {"mainProfileImgUrl": null};
                updateJsonFirestoreByPath(docRefID[0]["assetpath"], (delJson)).then(() => console.log("cleared:" + constants.MAINASSETIMGURL)).catch(err => console.error("doc error:" + err.message));
                //   docRef.markImgDeleted().updateDocRef("");
                // });
                console.debug("field passed");
                response.send("img deleted:" + mainImgFile).status(StatusCodes.OK).end();
              }
            });
            break;
          }

          case methods.CHGIMGMAIN:

            console.debug("change img main");
            getDocRefID().then(docRefID => {
              //let mainImgFile = docRefID[0]["assetdata"][constants.MAINASSETIMG];
              if (docRefID.length == 0) {
                logger.error(`no ref doc found for docRefID${formparam["docRefID"]}`);
                response.status(StatusCodes.NOT_FOUND).send("no doc found").end();
              } else {
                let fileChangedName:String|null = null;
                let pathtoImg = getPathToImage(docRefID);


                let v = new Promise((resolve, reject) => updateImages(imageDataClean, pathtoImg, origFileName, formparam, resolve)).then((fileWritten:File) => {
                  let url = getPublicImgUrl(fileWritten, formparam["uuid"]);
                  console.debug("new url:" + url);
                  updateJsonFirestoreByPath(getAssetPath(docRefID), {mainProfileImg: fileWritten.name}).then(() => console.log("updated:" + constants.MAINASSETIMG));
                  updateJsonFirestoreByPath(getAssetPath(docRefID), {mainProfileImgUrl: url}).then(() => console.log("updated:" + constants.MAINASSETIMGURL));
                  fileChangedName = fileWritten.name;
                  return Promise.resolve("kkk");
                }).then(() => console.log("all written")).catch(err => console.error("chg img" + err));
                Promise.allSettled([v]).then((pr) => console.debug("all settled:" + pr)).then(() => response.status(StatusCodes.CREATED).send("main img updated:" + fileChangedName).end());
                // upload /delete
              }

            });
            break;

          case methods.ASSETPASSPORT: {
            // upload picture //
            let tmpFile = undefined;
            console.debug("change img main");
            await getDocRefID().then(docRefID => {
              return new Promise((resolve, reject) => {
                updateImages(imageDataClean, getPathToImage(docRefID), origFileName, formparam, resolve)
                  .then(f => {
                    updateJsonFirestoreByPath(getAssetPath(docRefID), {
                      vehPassport: f.name,
                      vehPassportUrl: getPublicImgUrl(f, formparam["uuid"]),

                    }).then(() => logger.info("passpord uploaded" + f.name));
                    return resolve(f);
                  })
                  .then(f => response.status(StatusCodes.CREATED).send("passport data added/updated" + f.name).end())
                  .catch(err => response.status(StatusCodes.EXPECTATION_FAILED).send("passport failed to be added/updated:" + err.message).end());
                // add hook to processing with//
              });
            });
            break;

          }
            ;
          case methods.CHGIMGGAL: {
            async function postImage(galId, imgType) {
              let publicUrl;

              function getImageDataClean() {
                const tempRes = imgFilesBundle.filter((value, index) => {
                  if (galId == index) {
                    console.log(`match:${galId} ${index}`);
                    return value && value.hasOwnProperty("base64") ? value.base64 : undefined;
                  }
                  ///
                  else {return }
                });
                if (tempRes && tempRes.length > 0) {
                  return tempRes[0].base64;
                } else {
                  return undefined
                    ;
                }
                //})[0].base64;
              }


              await getDocRefID().then(docRefID => {
                return new Promise(async (resolve, reject) => {
                  let imgBase64 = getImageDataClean();
                  if (!imgBase64) {
                    reject("no base64");
                    failure++;
                    return;
                  }
                  await  new Promise(async (resolve, reject) => {updateImages(imgBase64,
                    getPathToImage(docRefID), galId + ".jpg", formparam, resolve)})
                    .then(async (f:File) => {
                      const recID = `gallery.${galId}`;
                      await updateJsonFirestoreByPath(getAssetPath(docRefID), {
                        [recID]:
                          {
                            index: galId,
                            filename: f.name,
                            publicUrl: publicUrl = getPublicImgUrl(f, formparam["uuid"]),
                            type: imgType,
                          },

                      }).then(() => logger.info("updated" + f.name + "id:" + galId));
                      // GET ARRAY //
                      // UPLOAD ARRAY //
                      // UPDATE ARRAY //
                      // RETURN CODE //
                      resolve(f);
                      return
                    })
                    .then((res) => {
                      logger.debug("gal img upload success: " + res);
                      success++;
                    })
                    .catch((err) => {
                      logger.error("gal img upload failed:" + err);
                      failure++;
                    });
                  // .then(f => response.status(StatusCodes.CREATED).json({publicUrl: publicUrl}).end());

                  //.catch(err => response.status(StatusCodes.EXPECTATION_FAILED).json({error: "gallery failed to be added/updated:" + err.message}).end());
                  // add hook to processing with//
                });
              });
            }
            let success = 0;
            let failure = 0;
            let promisses = [];
            console.log(formparam["manifest"]);
            let imgManifest =
              JSON.parse(formparam["manifest"] ? formparam["manifest"] : {});
            console.log("manifest:" + imgManifest);
            for (const img of imgManifest) {
              const v = imgManifest.indexOf(img);
              console.debug(img);
              if (isEmpty(img)) {
                failure++;
              } else {
                let vs = postImage(v, img.type).catch(err => "img error: " + err);
                promises.push(vs);
              }
            }

            //let galIdUrl = `galleryUrl.${imgId}`;


            Promise.allSettled(promises).then(() => {
              console.debug("all done");
              cleanMemory();
              return response.status(StatusCodes.CREATED).json({
                success: success,
                failure: failure,
              }).end();
            });
            break;
          }
            ;
        }
        return
      });

      busboy.end(request.rawBody);
      busboy = null;

    }


;

function generateJsonMockup(platenumber, platenumberConfidence, filename, filesize) {
  let jsonData = {};
  jsonData["platenumber"] = platenumber;
  jsonData["platenumber_confidence"] = platenumberConfidence;
  jsonData["filename"] = filename;
  jsonData["filename_size"] = filesize.valueOf().length;
  return jsonData;
}
