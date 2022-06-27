import admin from "firebase-admin";
import Query = admin.firestore.Query;
import {DcSearchOption} from "../../config/types";


const constants = require("../../constants");

const {db} = require("../../modules/firestoredb");
const {wrapDealDocument} = require("../../modules/utils");
const logger = require("../logger").getInstance()
export {};


exports.getUsersItems = function getUsersItems(key, value, inArray = false, specificGroup = undefined, queryOption?: DcSearchOption) {
    return new Promise((resolve, reject) => {
        //search start
        try {
            let startTime, endTime;
            startTime = new Date();
            //console.log("SPG:" + specificGroup);
            let query: Query, collectionGroup: Query;
            collectionGroup = db.getDb().collectionGroup(!specificGroup ? constants.SECONDARY_FRS_DIR_COLLECTION : specificGroup);
            query = (key != null) ? collectionGroup
                .where(key, "==",
                    `${value.user_id}`) : collectionGroup;

            /// set limit ///
            if (queryOption && ('limit' in queryOption)) {
                query = query.limit(queryOption['limit'])
            }
            //////////////////
            function isEmpty(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            }

            query.get().then(res => {
                let ref_location = [];
                for (let doc of res.docs) {
                    let mydata = doc.data();
                    if (!isEmpty(mydata)) {
                        //console.log(JSON.stringify(mydata))

                        wrapDealDocument(ref_location, doc);
                    }
                }

                console.log("search ended for " + value + " total " + res.docs.length);
                endTime = new Date();
                logger.info("query exec time:" + (endTime - startTime) / 1000);
                return resolve(ref_location);
            }).catch(err => {
                console.log("reject:" + err.message);
                return reject("uuid doc fetch failed:" + err.message);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
};
