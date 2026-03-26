---
file_class: par
status: Doing
category:
par:
  - "[[08 Health]]"
tags:
rate:
created: 2025-07-24
system_source: Obsidian
---

# [[08aa Gym]]

## Notes

## Queries

### Bases

![[08 Gym Base.base#Index, MoC & PAR]]

![[08 Gym Base.base#Notes]]

![[08 Gym Base.base#Permanents]]

![[08 Gym Base.base#Tasks]]

![[08 Gym Base.base#All notes by Tag]]

### Inbox

```dataview
TABLE rows.file.link as file, category as Category, created as Created
FROM [[]] and #inbox
FLATTEN tags
GROUP BY tags
```

### Bookmarks, tools and Inspiration

```dataview
TABLE WITHOUT ID
  Tag,
	map(rows, (r) => link(r.file.link, r.title)) AS Notes
from (#bookmark or #inspiration or #tool or #book) and [[]]
FLATTEN reduce(file.tags, "+") as Tag
group by Tag
```

### Forest

#### Seeds

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]] and #_seed/seed
```
#### plants

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]] and #_seed/plant 
```
#### Trees

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]] and #_seed/tree
```

