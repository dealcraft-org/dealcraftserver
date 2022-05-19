**Candidate**

_addCandidate_

<https://us-central1-sonorous-hangar-309417.cloudfunctions.net/addCandidate>

activates candidates by setting visible true and status scouting

JSON Content

    {
    "docRefID": "55eewlfhqwlgfads2"
    }
**IMAGES**

`http://localhost:5001/sonorous-hangar-309417/us-central1/imageMgr

`https://us-central1-sonorous-hangar-309417.cloudfunctions.net/imageMgr

added: docRefID = unique document identifier 
methods:

    PLATEFLOW (201)
        `
        file: <file>
        store:true
        mock:true
        uuid:55eewlfhqwlgfads2
        role:buyer
        method:PLATEFLOW
        `
    DELIMGMAIN (200)
        `
        method:DELIMGMAIN
        docRefID:55eewlfhqwlgfads2
        `
    CHGIMGMAIN (201)
        `
        file: <file>
        store:true
        uuid:55eewlfhqwlgfads2
        method:CHGIMGMAIN
        docRefID:55eewlfhqwlgfads2
        `
    ASSETPASSPORT (201) - Upload passport 
        Generate following fields in JsonMaster + auto trigger to AI(TBD)
            **vehPassport:** 
            **vehPassportUrl**
        _PARAMETERS_
            method:ASSETPASSPORT
            docRefID:55eewlfhqwlgfads2
            file: <file>
            store:true
            uuid:55eewlfhqwlgfads2
            
        `

copyright by Boris M
