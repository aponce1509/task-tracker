---
limit: 20
mapWithTag: false
icon: file-spreadsheet
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends: commons
savedViews: []
favoriteView:
fieldsOrder:
  - zYr1LR
  - 2xi5YC
version: "2.3"
fields:
  - name: learning_status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": to_learn
        "2": learning
        "3": learned
        "4": abandoned
    path: ""
    id: 2xi5YC
  - name: winstreak
    type: Number
    options:
      min: 0
      max: 5
      step: 1
    path: ""
    id: zYr1LR
---