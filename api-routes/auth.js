var express = require('express');
var router = express.Router();
var getVehicleData = require("../services/asset/getVehData");
const {loginWithUserAndPAss: loginWithUserAndPass} = require("../services/auth/UserAuth");
const logger = require("../services/logger").getInstance();

router.post('/login', (req,res)=>{
    const username=req.body.username
    const password=req.body.password
    console.log("route asset")

    logger.info("exec started")
    let result= loginWithUserAndPass(username,password)
    // new Promise((resolve, reject)=> getVehicleData(licensePlate,resolve,reject)).then((output)=>res.status(200).json(JSON.parse(output)).send()).catch(
    //     err=>{res.status(404).json(err).send()}
    // )

    logger.info("exec stopped")
});

module.exports = router;