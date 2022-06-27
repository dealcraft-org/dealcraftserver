
module.exports = Object.freeze({
  ERROR_AUTHORIZATION_HEADER: "cors - authorization header not present",
  PATH: "carimages",
  MAJOR_FRS_DIR_COLLECTION: "vehicle-assets",
  SECONDARY_FRS_DIR_COLLECTION: "userdata",
  PARTICIPANTS_FRS_DIR_COLLECTION: "participants",
  USER_IDS_COLLECTION: "users",
  PREFIX: "master",
  ANOTHER_CONSTANT: "another value",
  MAINASSETIMGURL: "mainProfileImgUrl",
  MAINASSETIMG: "mainProfileImg",
  ASSETDATA: "assetdata",
  ASSETPATH: "assetpath",
  INVITE_GENERIC_UUID: "10000000000000000",
  INVITE_FINANCE_UUID: "20000000000000000",
  INVITE_INSURANCE_UUID: "30000000000000000",
  INVITE_PARTICIPANT_NOASSET_UUID: "40000000000000000",
  INVITE_TRACKING_DOC: "invites",
  INVITE_TRACKING_SUBCOLLECTION_DOC: "invidocs",
  LOAN_PROVIDERS_PATH: "/providers/loans/carfinancing",
  CORS_GENERIC: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": 929292,
    "Access-Control-Max-Age": 86400

},
  DealType: {
    "principal": "DealType.principal",
    "embedded": "DealType.embedded",
  },
  DealStatus: {
    "open": "DealStatus.open",
    "running": "DealStatus.running",
    "completed": "DealStatus.completed",
  },
  DealParticipantRelType: {
    "dealOwner":"DealParticipantRelType.dealOwner",
    "dealParticipant":"DealParticipantRelType.dealParticipant",
    // currently covered by customerRole
    // "dealFinance":"DealParticipantRelType.dealFinance",
    // "dealInsurance":"DealParticipantRelType.dealInsurance",
    // "dealOther":"DealParticipantRelType.dealOther",


  },
})
;
