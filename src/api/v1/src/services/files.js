const fs = require('node:fs');
const path = require('node:path')
const chokidar = require('chokidar');

const services = ["ServerScriptService", "ReplicatedStorage"]

class Files {
    constructor (projectName, changesArray) {
        this.projectName = projectName;
        this.changesArray = changesArray;
        this.creatingScripts = false
    }

    addChanges(changesType, path, fileName, robloxPath, content) {
        this.changesArray.push({
            changesType : changesType,
            path : path,
            fileName : fileName,
            robloxPath : robloxPath,
            content : content
        });
    }

    clearChanges() {
        this.changesArray.length = 0; 
    }

    createProjectFolders() {
        console.log("Creating project dirs.");
        // Make project dirs
        let ServicesPath = `${this.projectName}/Services/`

        fs.mkdirSync(this.projectName);
        fs.mkdirSync(ServicesPath);

        for (let i=0; i<services.length; i++) {
            fs.mkdirSync(ServicesPath + services[i]);
        }
    }

    getRobloxFullPath(filePath) {
        const robloxPath = path.relative(`${this.projectName}/Services`, filePath)
            .replace(/\\/g, ".");
                
        const directories = robloxPath.split('.');
        const trimmedDirectories = directories.slice(0, -2);
        const finalRobloxPath = trimmedDirectories.join('.');

        return finalRobloxPath
    }

    createScript(scriptName, robloxPath, content) {
        const directories = robloxPath.split('.').slice(0, -1);
        const folderPath = path.join(...directories);
      
        this.creatingScripts = true;
      
        directories.reduce((parentPath, directory) => {
            const currentPath = path.join(parentPath, directory);
            const fullPath = path.join(this.projectName, 'Services', currentPath);
      
            if (!fs.existsSync(fullPath)) {
              fs.mkdirSync(fullPath);
            }
      
            return currentPath;
        }, '');
      
        const fullPath = path.join(this.projectName, 'Services', folderPath, scriptName);
      
        if (fs.existsSync(fullPath)) {
            console.log(`File "${fullPath}" already exists.`);
            return;
        }
      
        fs.writeFile(fullPath, content, (err) => {
            if (err) {
                console.error(`Error creating script: ${err}`);
                return;
            }
      
            // console.log(`Script "${scriptName}" has been created at "${fullPath}"`);
        });
    }

    startWatcher() {
        const watcher = chokidar.watch(`${this.projectName}/`,  {
            ignored: /^\./,
            persistent: true,
            ignoreInitial: true
        });

        watcher.on("add", (filePath) => {
            if (!this.creatingScripts) {
                const finalRobloxPath = this.getRobloxFullPath(filePath);
                
                console.log(`${filePath} was added!`);
                this.addChanges("create", filePath, path.basename(filePath), finalRobloxPath, fs.readFileSync(`${filePath}`, "utf8"));
            }
        })

        watcher.on("unlink", (filePath) => {
            if (!this.creatingScripts) {
                const finalRobloxPath = this.getRobloxFullPath(filePath);

                console.log(`${filePath} was removed!`);
                this.addChanges("remove", filePath, path.basename(filePath), finalRobloxPath, null);
            }
        })

        watcher.on("change", (filePath) => {
            if (!this.creatingScripts) {
                const finalRobloxPath = this.getRobloxFullPath(filePath);

                console.log(`${filePath} was saved!`);
                this.addChanges("save", filePath, path.basename(filePath), finalRobloxPath, fs.readFileSync(`${ filePath}`, "utf8"));
            }
        })
    }
}

module.exports = Files