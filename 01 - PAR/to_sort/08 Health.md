---
file_class: par
status: Backlog
category: 
par:
  - "[[- root index]]"
tags: 
rate: 
---

# [[08 Health]]

- [[Link To Note]]

## Notes

- Comments

## Queries

```dataview
TABLE status as Status
FROM [[]]
where file_class = "par"
sort file.name asc
```


### Permanent

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]]
where file_class = "permanent"
```

### Notes

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]]
where file_class = "note"
```

### Tasks

```dataview
TABLE category as Category, status as Status, tags as Tags
FROM [[]]
where file_class = "task"
```

### All Notes by task

```dataview
TABLE rows.file.link as file, category as Category, created as Created
FROM [[]]
FLATTEN tags
GROUP BY tags
```
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