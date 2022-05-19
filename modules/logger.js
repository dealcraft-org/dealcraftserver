const {createLogger, format, transports} = require("winston");

// make singleton
class Logger {
    logger = null;

    constructor() {
        this.logger = createLogger({
            format: format.combine(format.timestamp(), format.json()),
            transports: [new transports.Console({})],
        })
    }
    getLogger(){return this.logger}
}

class Singleton {
    static instance;
    constructor() {
        if (!this.instance) {
            this.instance = new Logger();
        }
    }
    static getInstance(){
        if (!this.instance) {
            this.instance = new Logger();
        }
        return this.instance.getLogger()
    }
}


module.exports = Singleton


