---
fields:
  - name: category
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "category" && !p.file.name.includes("Template"))
    display: asList
    style:
      italic: true
      bold: true
      code: false
    path: ""
    id: XisyWP
  - name: par
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => p.file_class == "par" && !p.file.name.includes("Template"))
    display: asList
    style:
      italic: true
      bold: true
    path: ""
    id: q7FH7u
  - name: status
    type: Select
    options:
      sourceType: ValuesListNotePath
      valuesList: {}
      valuesListNotePath: 99 - Meta/Metadata Fields/Status.md
    style:
      italic: true
      bold: true
    path: ""
    id: MugGvZ
  - name: rate
    type: Number
    options:
      min: 1
      max: 7
      step: 1
    style:
      italic: true
      bold: true
    path: ""
    id: St9Dkr
  - name: system_source
    type: Select
    options:
      sourceType: ValuesListNotePath
      valuesList: {}
      valuesListNotePath: 99 - Meta/Metadata Fields/SystemSource.md
    path: ""
    id: eeMCkw
  - name: source_url
    type: Input
    options: {}
    path: ""
    id: vXnsV7
  - name: created
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: YYYY-MM-DD
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: F3fV5d
version: "2.40"
limit: 20
mapWithTag: false
icon: scan
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: []
favoriteView: 
fieldsOrder:
  - XisyWP
  - q7FH7u
  - F3fV5d
  - MugGvZ
  - St9Dkr
  - eeMCkw
  - vXnsV7
---
