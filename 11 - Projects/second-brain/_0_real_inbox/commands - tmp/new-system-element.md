Drives [[WORKFLOWS - New Tags & Types]] and [[WORKFLOWS - New Properties]]. The approval gate as a command.

- Argument: `<tag | type | subtype | cluster | property> <name>`
- Load: `obsidian-vault-notes` (taxonomy, tags, properties references), `system-reference-maintance`
- Steps
	- Ask the query the element enables; no query → stop
	- Redundancy check against taxonomy, the four tags and the classes; show the closest existing element
	- Ask the definition; approval stop with name and definition
	- Apply through the right path: `taxonomy.sh`, Tag System note, class + Metadata Menu
	- Propose the base view and the cheatsheet row
	- Run `audit.py`; append the AGENTS.md status log
- Output: query, redundancy verdict, applied changes, audit result
- Rules
	- Never apply without the explicit approval of name and definition
	- Never hand-edit generated type or subtype notes
