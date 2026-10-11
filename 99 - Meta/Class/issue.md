---
limit: 20
mapWithTag: false
icon: check
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends: commons
savedViews: []
favoriteView:
fieldsOrder:
  - DAM34S
  - ur3eXD
  - il5t6r
version: "2.11"
fields:
  - name: dueDate
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: YYYY-MM-DD
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: ur3eXD
  - name: priority
    type: Number
    options:
      step: 1
      min: 0
      max: 2
    path: ""
    id: DAM34S
  - name: role
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": core
        "2": milestone
        "3": pattern
        "4": debt
    path: ""
    id: il5t6r
---
