const runtimeOpts = {
  timeoutSeconds: 15,
  memory: "128MB",
  retry: false,
};
const runtimeOptsRetryMinOneInstance = {
  timeoutSeconds: 15,
  memory: "128MB",
  retry: true,
  minInstances:1
};
const runtimeOptsUploadImg = {
  timeoutSeconds: 15,
  memory: "256MB",
  retry: false,
};
const opsMethods = {
  PLATEFLOW: 1,
  IMAGEGALGUPLOAD: 2,
  DELIMGMAIN: 3,
  CHGIMGMAIN: 4,
  DELIMGGAL: 5,
  ASSETPASSPORT:6,
  CHGIMGGAL:7,
  PLATEFLOWNOIMG: 8,

};

const firebaseMethod ={
  CREATEREC:1,
  MODIFYREC:2
}
module.exports = {runtimeOpts, runtimeOptsUploadImg, opsMethods,firebaseMethod,runtimeOptsRetryMinOneInstance};
