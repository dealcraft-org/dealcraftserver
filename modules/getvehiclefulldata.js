// const functions = require("firebase-functions");
const Logger = require("./logger");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = (req,res) => {
    var xmlhttp = new XMLHttpRequest();
    let logger = Logger.getInstance();
    const licensePlate=req.body.licensePlate
    xmlhttp.open("GET", `http://52.91.153.117:5000/json/${licensePlate}`, true);
    logger.info("inside getdata");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            logger.info("http json from caraws received");
            //return resolve(xmlhttp.responseText);
            // res.body=xmlhttp.responseText;
            res.status(200).json(JSON.parse(xmlhttp.responseText)).send();
             //return res
        } else if (xmlhttp.status > 200) {
            logger.error("http json from caraws error");
            // reject(
            //     {
            //         status: xmlhttp.status,
            //         statusText: xmlhttp.responseText,
            //     },
            // );
return;
        }
    };

    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();

    logger.info("request sent");
    // return
}
