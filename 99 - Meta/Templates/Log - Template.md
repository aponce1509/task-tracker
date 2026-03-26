---
paras:
categories:
  - "[[Logs]]"
types:
  - "[[Logbook]]"
rate:
tags:
  - _inbox
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---
<%*
const baseFolderOptions = ["11 - Projects", "12 - Areas", "13 - Resources"];
const baseFolder = await tp.system.suggester(baseFolderOptions, baseFolderOptions, false, "Select Base Folder");
const prefix = "_L";
const timestamp = tp.date.now("YYYYMMDDHHmm");
const date = tp.date.now("YYYYMMDD");
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

const folder = `${baseFolder}/${projectName}/Logs/`;

const taskTitle = await tp.system.prompt("Log Name");
const filename = `${date} ${taskTitle}`;

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

> [!tldr]
> This logs are notes with a section for each date where we capture the things that happens a long the days for a concrete PAR. The idea is capture here things and move it to notes later if you don't want to create the note right now.

> [!important]
> To complete:
> - This should look like an index with the track of things done
> - remove the `_inbox` tag


## [[<% tp.date.now("YYYY-MM-DD") %>]]

<% await tp.file.cursor() %>
