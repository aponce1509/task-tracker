---
file_class: issue
paras:
type: "[[Issues]]"
subtypes:
role:
priority:
rate:
tags:
status: inbox
maturity: capture
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
dueDate:
dependencies:
complete: false
---
<%*
const baseFolder = "08 - Issues";
const prefix = "_I";
const padding = 5;

const folder = `${baseFolder}`
// Get all files in the target folder
const files = app.vault.getFiles().filter(f => f.path.startsWith(folder + "/"));

// Extract all task numbers
const numbers = files.map(f => {
    const match = f.name.match(/^_I(\d{5})/);
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

tR += `# [[${filename}]]`;
%>

## Description

- 

## Tasks

- [ ] Task 1
- [ ] Task 2


## Post-Mortem

- We have added this to the logging? (project journal — TBD)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas