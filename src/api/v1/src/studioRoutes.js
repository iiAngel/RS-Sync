const files = require('./services/files')
const fs = require('node:fs')
const express = require('express');
const router = express.Router();

let StudioConnected = false;
let changes = [];

router.post('/studio', (req, res) => {
    if (StudioConnected) return res.send({ "message" : "Studio is already connected!" }).status(200);

    const { body } = req;
    const name = body.name;

    const projectFs = new files(name, changes);

    if (!fs.existsSync(name)) {
        projectFs.CreateProjectFolders()
    }
    
    projectFs.StartWatcher()

    StudioConnected = true;

    return res.send({ "message" : "Studio is connected!"});
})

router.get('/changes', (req, res) => {
    const intervalDuration = 150;

    const resWithChanges = () => {
        res.json({ changes }).status(200);
        changes = [];
        return;
    };

    if (changes.length > 0) {
        resWithChanges();
    } else {
        const interval = setInterval(() => {
            if (changes.length > 0) {
                clearInterval(interval);
                resWithChanges();
            }
        }, intervalDuration);
    }

})

router.post('/newscript', (req, res) => {
    const { body } = req;

    fs.writeFile(body.name + ".lua", body.content, () => {
        console.log("Script \"" + body.name + "\" has been created!");
    })

    res.sendStatus(200);
})

module.exports = router