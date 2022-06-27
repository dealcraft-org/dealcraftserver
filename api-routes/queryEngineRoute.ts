const {setDefCorsHeader} = require("../modules/utils");
const {QueryEngine} = require("../services/query/queryEngine");
const logger = require("../services/logger").getInstance();
const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
    // const licensePlate=req.body.licensePlate

    console.log("query engine")
    https://us-central1-sonorous-hangar-309417.cloudfunctions.net/queryEngine?userId=undefined&method=getUserDeals
    if (!req.query.method) return res.status(401).json({"code":"bad arg"}).send()
    logger.info("query started")
    //
    // // new Promise((resolve, reject)=> getVehicleData(licensePlate,resolve,reject)).then((output)=>res.status(200).json(JSON.parse(output)).send()).catch(
    // //     err=>{res.status(404).json(err).send()}
    // // )
    // logger.info("query ended")
    let [continueExecution, funcRef] = setDefCorsHeader(res, req);
    if (!continueExecution) {
        if (!funcRef) {
            console.error("return function not defined");
        } else {
            return funcRef();
        }
    } else {
        let queryEngine = new QueryEngine(req, res);
        queryEngine.execQuery().then(res => {
            console.log("qe res:" + res);
        }).catch(err=> {return err});

    }
});

module.exports = router;