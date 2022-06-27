const admin = require("firebase-admin");
const {firebaseConfig} = require("../../config/firebase")
const {static} = require("express");
const {applicationDefault} = require("firebase-admin");


class FirebaseProvider {
    provider = null;

    constructor() {
        this.provider=admin.initializeApp()
        // =admin
    }

    getProvider() {
        console.log("provider call")
        return this.provider;
    }

}
class  Singleton {
    static instance=null
    static getInstance()
    {
        if (this.instance) return this.instance
        this.instance=new FirebaseProvider().getProvider()
        console.dir(this.instance)
        return this.instance
    }

}
module.exports=Singleton
