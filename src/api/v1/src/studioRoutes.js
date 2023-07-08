const files = require('./services/files')
const fs = require('node:fs')
const express = require('express');
const router = express.Router();

let StudioConnected = false;
let projectName;
let projectAlreadyCreated = true;
let changes = [];

const projectFs = new files("name", changes);

router.post('/studio', (req, res) => {
    if (StudioConnected) return res.send({ "message" : "Studio is already connected!" }).status(200);

    const { body } = req;
    const name = body.name;

    projectFs.projectName = name

    if (!fs.existsSync(name)) {
        projectAlreadyCreated = false;
        projectFs.createProjectFolders()
    }

    projectFs.startWatcher()

    StudioConnected = true;

    return res.send({ "message" : "Studio is connected!", "status" : "Connected", "alreadyCreated" : projectAlreadyCreated});
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

    let scriptName = ""

    switch (body.scriptType) {
        case "Script":
            scriptName = body.name + ".server.lua"
            break;
        case "LocalScript":
            scriptName = body.name + ".client.lua"
            break;
        case "ModuleScript":
            scriptName = body.name + ".module.lua"
            break;
        default:
            break;
    }

    projectFs.createScript(scriptName, body.robloxPath, body.content)

    res.send({"status" : "Created"});
})

module.exports = router