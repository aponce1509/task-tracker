---
paras:
type: "[[Meetings]]"
rate:
tags:
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---
<%*
const baseFolderOptions = ["11 - Projects", "12 - Areas", "13 - Resources"];
const baseFolder = await tp.system.suggester(baseFolderOptions, baseFolderOptions, false, "Select Base Folder");
const prefix = "_M";
const timestamp = tp.date.now("YYYYMMDDHHmm");
const padding = 5;

// 2. Get folder names from "01 - PAR" for the suggester
const parentDir = app.vault.getAbstractFileByPath(baseFolder);
if (!parentDir || !parentDir.children) {
    throw new Error("Base folder not found");
}

const projectFolders = parentDir.children
    .filter(f => f instanceof tp.obsidian.TFolder)
    .map(f => f.name);

const projectName = await tp.system.suggester(projectFolders, projectFolders, false, "Select Project Folder");

if (!projectName) return; // Exit if cancelled

const folder = `${baseFolder}/${projectName}/Logs/${prefix}`;

// Get all files in the target folder to calculate the next ID
const files = app.vault.getFiles().filter(f => f.path.startsWith(folder + "/"));

// Extract all task numbers
const numbers = files.map(f => {
    const match = f.name.match(/^_M(\d{5})/); // Changed regex to match your prefix _M
    return match ? parseInt(match[1], 10) : 0;
}).filter(n => !isNaN(n));

// Compute next number
const next = Math.max(0, ...numbers) + 1;
const numberStr = String(next).padStart(padding, "0");

const taskTitle = await tp.system.prompt("Meeting Name?");
const filename = `${prefix}${numberStr} ${taskTitle}`;

// Move to the folder with the new filename
await tp.file.rename(`${filename}`);
await tp.file.move(`${folder}/${filename}`);

// Optional: If you want to use that timestamp somewhere in the file content:
// tR += `Created on: ${timestamp}`;
%>

# [[<% tp.date.now("YYYY-MM-DD") %>]]

## Creation/Move checklist

- [ ] add context to the title
- [ ] Add paras
- [ ] Take-away completed
- [ ] Create issues Requirements
- [ ] Remove inbox

## Take Aways

## Preparation

## Notes
