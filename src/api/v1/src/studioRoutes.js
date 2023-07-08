const files = require('./services/files')
const fs = require('node:fs')
const express = require('express');
const router = express.Router();

let StudioConnected = false;
let projectName;
let changes = [];

const projectFs = new files("name", changes);

router.post('/studio', (req, res) => {
    if (StudioConnected) return res.send({ "message" : "Studio is already connected!" }).status(200);

    const { body } = req;
    const name = body.name;

    projectFs.projectName = name

    if (!fs.existsSync(name)) {
        projectFs.createProjectFolders()
    }

    projectFs.startWatcher()

    StudioConnected = true;

    return res.send({ "message" : "Studio is connected!"});
})

router.get('/changes', (req, res) => {
    const intervalDuration = 150;

    const resWithChanges = () => {
        res.json({ changes }).status(200);
        projectFs.clearChanges()
        return;
    };

    if (changes.length > 0) {
        resWithChanges();
    } else {
        const interval = setInterval(() => {
            if (changes.length > 0) {
                resWithChanges();
                clearInterval(interval);
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