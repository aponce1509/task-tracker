---
fields:
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
    type: Multi
    options:
      sourceType: ValuesList
      valuesList:
        "1": learnable
        "2": sentations_request
        "3": rfm
        "4": todo
    command:
      id: insert__commons__tags
      icon: list-plus
      label: Insert tags field
    path: ""
    id: 4YBXU4
  - name: type
    type: File
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "type" && !p.file.name.includes("Template") && p.file.path.includes("02 - Categories/_types"))
    path: ""
    id: P1TJHU
    command:
      id: insert__P1TJHU
      icon: list-plus
      label: Insert type field
  - name: subtypes
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "subtype" && !p.file.name.includes("Template") && p.file.path.includes("02 - Categories/_subtypes"))
      customRendering: page.file.name.split(" - ").pop().trim()
    path: ""
    id: Dc2RIX
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": inbox
        "2": feed
        "3": wip
        "4": blocked
        "5": done
    path: ""
    id: 148aJO
  - name: maturity
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": capture
        "2": distilled
        "3": evergreen
    path: ""
    id: y4lo2Z
version: "2.118"
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
  - P1TJHU
  - Dc2RIX
  - 148aJO
  - y4lo2Z
  - 4YBXU4
  - St9Dkr
  - F3fV5d
---
