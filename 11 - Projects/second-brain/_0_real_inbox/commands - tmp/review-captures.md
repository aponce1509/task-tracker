Drives [[WORKFLOWS - Contextual Capture Review]].

- Argument: `<par>`, default the PAR of the most recent `wip` issue
- Load: `obsidian-vault-notes`, the kind skills through `/guide-distillation`
- Steps
	- Query `["maturity":capture] ["paras":"[[<par>]]"]`
	- Rank: notes linked from open issues of the PAR first, then recent edits
	- Show the top 5 with one line each; the user picks 2 or 3
	- Run `/guide-distillation` on each pick
	- Offer the link from the project MoC, or from the PAR note
- Output: ranked list, distillations, links added
- Rules
	- Timecap 15 minutes; stop between notes, never mid-note
	- A link, never a copy of the content
