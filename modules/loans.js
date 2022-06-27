"use strict";
const {runtimeOpts} = require("../var");
const constants = require("../constants");
const functions = require("firebase-functions");
const {setDefCorsHeader} = require("./utils");
const {CORS_GENERIC} = require("../constants");
const {db} = require("./firestoredb");

class Loans {
    static db = db.getDb();
    assetValue = null;
    loanProvidersPath = constants.LOAN_PROVIDERS_PATH;

    constructor(totalAssetValue) {
        this.assetValue = totalAssetValue;
    }


    async getListLoans() {
        //db.collection("use strict");
        return db.getDb().collection(this.loanProvidersPath).get();
    }


}

exports.getLoanOffers = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
    //

    setDefCorsHeader(res,req);
    let totalAssetValue = req.body.totalAssetValue;
    let loans = new Loans(totalAssetValue);
    let v = await loans.getListLoans().then(json => {
        if (json.docs.length != 0) {
            let v=  json.docs.map(doc => doc.data());
            res.status(200).send(v).end()
        }
        else res.status(404).send("no offers")
    }).catch(err => {
        return res.status(404).send("error" + err).end()
    });
    return v;
    //console.log(v.docs.length); //).catch(err=>functions.logger.warn(err));
    //console.log(v.length);
});

