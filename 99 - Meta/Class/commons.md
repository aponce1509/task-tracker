---
fields:
  - name: categories
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "category" && !p.file.name.includes("Template") && !p.file.path.includes("02 - Categories/_types"))
    display: asList
    style:
      italic: true
      bold: true
      code: false
    path: ""
    id: XisyWP
    command:
      id: insert__commons__categories
      icon: list-plus
      label: Insert categories field
  - name: paras
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "par" && !p.file.name.includes("Template"))
    display: asList
    style:
      italic: true
      bold: true
    path: ""
    id: q7FH7u
    command:
      id: insert__commons__paras
      icon: list-plus
      label: Insert paras field
  - name: rate
    type: Number
    options:
      min: 1
      max: 5
      step: 1
    style:
      italic: true
      bold: true
    path: ""
    id: St9Dkr
  - name: created
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: YYYY-MM-DD
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: F3fV5d
  - name: tags
    type: Input
    options: {}
    command:
      id: insert__commons__tags
      icon: list-plus
      label: Insert tags field
    path: ""
    id: 4YBXU4
  - name: types
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "category" && !p.file.name.includes("Template") && p.file.path.includes("02 - Categories/_types"))
    command:
      id: insert__SHTG5O
      icon: list-plus
      label: Insert  field
    path: ""
    id: dmGpsP
version: "2.79"
limit: 20
mapWithTag: false
icon: file-spreadsheet
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends:
savedViews: []
favoriteView:
fieldsOrder:
  - q7FH7u
  - XisyWP
  - dmGpsP
  - 4YBXU4
  - St9Dkr
  - F3fV5d
---
