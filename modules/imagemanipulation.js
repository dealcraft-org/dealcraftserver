const sharp = require("sharp");
exports.crop = async function crop(boundingBox, imageDataClean) {
  let cropped = await sharp(imageDataClean).rotate().extract({
    left: boundingBox.xmin,
    top: boundingBox.ymin,
    height: boundingBox.ymax - boundingBox.ymin  ,
    width: boundingBox.xmax - boundingBox.xmin,
  }).withMetadata().toBuffer();
  return cropped;
};
exports.resize = async function resize(ratio=null,imageDataClean=null) {
  let resized = await sharp(imageDataClean).rotate().resize(1000,{withoutEnlargement: true}).withMetadata().toBuffer();
  return resized;
}
