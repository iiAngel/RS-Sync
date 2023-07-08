const fs = require('node:fs');
const path = require('node:path')
const chokidar = require('chokidar');

class Files {
    constructor (projectName, changesArray) {
        this.projectName = projectName;
        this.changesArray = changesArray;
    }

    addChanges(changesType, path, fileName, content) {
        this.changesArray.push({
            type : changesType,
            path : path,
            fileName : fileName,
            content : content
        });
    }

    clearChanges() {
        this.changesArray.length = 0; 
    }

    createProjectFolders() {
        console.log("Creating project dirs.");
        // Make project dirs
        let ServicesPath = `${this.projectName}/Services`

        fs.mkdirSync(this.projectName);
        fs.mkdirSync(ServicesPath);
        fs.mkdirSync(ServicesPath + "/ReplicatedStorage");
        fs.mkdirSync(ServicesPath + "/ServerScriptService");
    }

    startWatcher() {
        const watcher = chokidar.watch(`${this.projectName}/`,  {
            ignored: /^\./,
            persistent: true,
            ignoreInitial: true
        });

        watcher.on("add", (filePath) => {
            console.log(`${filePath} was added!`);
            this.addChanges("create", filePath, path.basename(filePath), fs.readFileSync(`${filePath}`, "utf8"));
        })

        watcher.on("change", (filePath) => {
            console.log(`${filePath} was saved!`);
            this.addChanges("save", filePath, path.basename(filePath), fs.readFileSync(`${ filePath}`, "utf8"));
        })
    }
}

module.exports = Files