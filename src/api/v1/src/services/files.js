const fs = require('node:fs');
const chokidar = require('chokidar');

class files {
    constructor (projectName, changesArray) {
        this.projectName = projectName;
        this.changesArray = changesArray;
    }

    AddChanges(changesType, fileName, content) {
        this.changesArray.push({
            type : changesType,
            filename : fileName,
            content : content
        });
    }

    CreateProjectFolders() {
        console.log("Creating project dirs.");
        // Make project dirs
        fs.mkdirSync(this.projectName);
        fs.mkdirSync(`${this.projectName}/Services`);
        fs.mkdirSync(`${this.projectName}/Services/ReplicatedStorage`);
        fs.mkdirSync(`${this.projectName}/Services/ServerScriptService`);
    }

    StartWatcher() {
        const watcher = chokidar.watch(`${this.projectName}/`,  { ignored: /^\./, persistent: true });

        watcher.on("add", (filePath) => {
            console.log(`${filePath} was added!`);
            this.AddChanges("create", filePath, fs.readFileSync(`${filePath}`, "utf8"));
        })

        watcher.on("change", (filePath) => {
            console.log(`${filePath} was saved!`);
            this.AddChanges("save", filePath, fs.readFileSync(`${ filePath}`, "utf8"));
        })
    }
}

module.exports = files