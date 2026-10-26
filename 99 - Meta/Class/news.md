---
limit: 20
mapWithTag: false
icon: newspaper
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends: commons
savedViews: []
favoriteView:
fieldsOrder:
  - nGr3pK
  - nSt7dQ
  - nOu2tL
  - nBl5sP
  - nFs9eN
version: "2.1"
fields:
  - name: group
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": politics-spain
        "2": politics-global
        "3": macro-central-banks
        "4": markets
        "5": companies
        "6": housing-personal-finance
        "7": energy
        "8": crypto
    path: ""
    id: nGr3pK
  - name: story_id
    type: Number
    options: {}
    path: ""
    id: nSt7dQ
  - name: outlets
    type: Number
    options: {}
    path: ""
    id: nOu2tL
  - name: blindspot
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": L
        "2": R
    path: ""
    id: nBl5sP
  - name: first_seen
    type: DateTime
    options:
      dateFormat: YYYY-MM-DD HH:mm
      defaultInsertAsLink: false
    path: ""
    id: nFs9eN
---
