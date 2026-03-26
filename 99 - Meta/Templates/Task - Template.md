---
paras:
categories:
  - "[[Logs]]"
types:
  - "[[Issues]]"
priority:
rate:
tags:
  - _inbox
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---
<%*
const baseFolder = "08 - Tasks";
const prefix = "_T";
const padding = 5;

// const projectName = await tp.system.prompt("Project Name?");

const folder = `${baseFolder}`
// Get all files in the target folder
const files = app.vault.getFiles().filter(f => f.path.startsWith(folder + "/"));

// Extract all task numbers
const numbers = files.map(f => {
    const match = f.name.match(/^_T(\d{5})/);
    return match ? parseInt(match[1], 10) : 0;
}).filter(n => !isNaN(n));

// Compute next number
const next = Math.max(0, ...numbers) + 1;
const numberStr = String(next).padStart(padding, "0");

const taskTitle = await tp.system.prompt("Task Name?");
const filename = `${prefix}${numberStr} ${taskTitle}`;

// Move to the folder with the new filename
await tp.file.rename(`${filename}`);
await tp.file.move(`${folder}/${filename}`)

tp.file.include("[[template-content]]");
%>

# [[<% tp.date.now("YYYY-MM-DD") %>]]

## Tasks

- [ ] Task 1
- [ ] Task 2

## Log

- Fact 1
- Fact 2

## Post-Mortem

- Liked from the task
- To improve
- Notes to created?
	- [[ADRs]]
	- New [[Issues]]
	- [[Implementation Details]]
	- [[Decisions]] or [[Problems & Solutions]]
	- [[Assets]] or [[Knowledge Atoms]]
	- [[Sources]], [[Clippings]]


