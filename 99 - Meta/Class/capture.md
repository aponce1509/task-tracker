---
limit: 20
mapWithTag: false
icon: inbox
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends: commons
savedViews: []
favoriteView:
fieldsOrder:
  - cUr7lQ
  - cAu4tH
  - cPl8fM
version: "2.1"
fields:
  - name: url
    type: Input
    options: {}
    path: ""
    id: cUr7lQ
  - name: author
    type: MultiFile
    options:
      dvQueryString: dv.pages().where(p => !p.file.name.includes("Template"))
    display: asList
    path: ""
    id: cAu4tH
  - name: platform
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": youtube
        "2": x
        "3": instagram
        "4": web
        "5": apple-notes
    path: ""
    id: cPl8fM
---
