const {logger} = require("firebase-functions");
exports.sendSignInEmail= function (email, displayName, link){
  let body ={}
  logger.info(`sending invite email to ${email}`)
  logger.info(`sending invite email with ${link}`)

  return
}