Replaces [[WORKFLOWS - Contextual Capture Review]]. No command yet; it chains a query and `/guide-distillation`.

Truths
- Trigger: dead time, or when I open a project
- Timecap: 10-15 minutes, no need to clear the list
- Steps
	- Query the captured notes of the current PAR: `["maturity":capture] ["paras":"[[<project>]]"]`
	- Pick the top 2-3 by relevance to what I am doing now
	- Run `/guide-distillation` on each
	- Feed the project: link the distilled notes from the project note, or from its MoC
	- Stop when the time is up
- Changes against the legacy version: distillation is the command, the "feed the project" step becomes a link, not a copy

Open questions
- Does this deserve its own command (`/review-captures <project>`) that runs the query and picks the notes
- Is the relevance order mine, or proposed by the agent (recent edits, open issues of the PAR)
- Does "feed the project" mean the project note, the project MoC or the project journal
