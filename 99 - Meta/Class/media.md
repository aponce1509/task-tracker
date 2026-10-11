---
limit: 20
mapWithTag: false
icon: file-spreadsheet
tagNames:
filesPaths:
bookmarksGroups:
excludes:
  - status
  - maturity
extends: commons
savedViews: []
favoriteView:
fieldsOrder:
  - H31huW
version: "2.7"
fields:
  - name: consumption_status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": to_consume
        "2": consuming
        "3": completed
        "4": abandoned
        "5": pending_new_content
    path: ""
    id: H31huW
---