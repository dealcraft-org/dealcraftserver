const admin = require("../providers/firebaseProvider").getInstance();
const { getAuth, signInWithEmailAndPassword }= require ( "firebase/auth");

const {sendSignInEmail} = require("../../modules/smtp");
const {writeJsonFirestoreByPath} = require("../../modules/helpers.js");
// const firebase = require("firebase/");
const {firebaseConfig} = require("../../config/firebase");
// const {firebaseConfig} = require("../../config/firebase");
const logger = require("../logger").getInstance();
// admin.initializeApp(firebaseConfig);

function actionCodeSettings(email) {
  return Object({
    url: "https://www.legexa.com/?email=" + email,
    iOS: {
      bundleId: "com.legexa.companion",
    },
    android: {
      packageName: "com.legexa.companion",
      installApp: true,
      minimumVersion: "12",
    },
    handleCodeInApp: true,
    // When multiple custom dynamic link domains are defined, specify which
    // one to use.
    dynamicLinkDomain: "legexa.page.link",
  });
};
exports.checkUserJwt = function checkUserJWT(header) {
  //admin.initializeApp(functions.config().firebase);
  return new Promise((resolve, reject) => {
    let idToken = header;
    try {

      admin.auth()
        .verifyIdToken(idToken,true)
        .then((decodedToken) => {
          console.log("dda:" + decodedToken.uid);
          const uid = decodedToken.uid;
          resolve(uid);
          return;
          // ...
        })
        .catch((error) => {
          // Handle error
          //console.log("error:" + error);
          reject("VALID jwt IS not detected:"+error);
          return;

        });

      ;
    } catch (e) {
      logger.error("error caught:" + e);
      reject("UserAuth:" + e);
      return;

    }
  });
};
exports.getLegexaUserByEmail = function getLegexaUserByEmail(email) {
  return new Promise((resolve, reject) => {
    admin.auth()
      .getUserByEmail(email)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        //console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        resolve({found: true, data: userRecord});
      })
      .catch((error) => {
        console.log("Error fetching user data:", error.message);
        resolve({found: false, data: null});
      });
    return;
  });
};
exports.sendInviteByEmail = function(email) {
  let displayName = "hello from Legexa";
  let wait = true;
  //admin.auth().createUser({email:email}).then((user) => {console.log(user.uid)} )
  admin.auth().getUserByEmail(email).then((user) => {
    console.debug("user exists:" + user.uid);
    wait = false;
  }).catch(async (err) => {
    console.log("user not exist,proceeding with creation" + email + " err:" + err.message);
    await admin.auth().createUser({email: email}).then((user) => {
      admin.auth().setCustomUserClaims(user.uid, {deviceId: 123456});
      writeJsonFirestoreByPath(`/users/${user.uid}`,
        {
          deals: {},
          createdAt: admin.database.ServerValue.TIMESTAMP,
          email: email
        });
      // console.log("Error creating user session: ", error);
      // alert("Could not log user in.");

      console.log(user.uid);
      wait = false;
    }).catch(errs => "user creation failed with error" + errs);
  });


  let interval = setInterval(() => {
    if (wait == false) {
      wait = true;
      admin.auth().generateSignInWithEmailLink(email, actionCodeSettings(email))
        .then((link) => {
          clearInterval(interval);
          console.debug("interval stopped");
          return sendSignInEmail(email, displayName, link);
        });
    }
  });

// Construct sign-in with email link template, embed the link and
// send using custom SMTP server.


  return email;
}
exports.loginWithUserAndPAss = function (email,password){
getAuth(firebaseConfig).signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      return userCredential
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
}
;



