---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status:
maturity: capture
created: 2026-03-08 14:58
---
# [[Notes a base system]]

## Content

# [[Notes a base system]]

[[Your Second Brain - MoC]]

- [ ] Me falta ver donde va los 
	- [ ] aichats
	- [ ] authors
	- [ ] Issues
	- [ ] Place notes
		- [ ] City
		- [ ] Museum
- [ ] Hacer el Outline completando todas las notas intermedias
- [ ] Limpiar plug-ins
- [ ] Hacer las bases
- [ ] Bookmarks de las tiendas de muebles y como hacer lo de las magazines
- [ ] Art notes how to deal with
	- [ ] Usar css para mejor visualización
- [ ] Capturing extractions manually

- Nos vamos a basar en [[PARA Methodology]]
- En el mundo de la IA no te pienses que no es útil, te va a distinguir del resto que seas capaz de recordar. Las bases son lo importante
- Me gustaría aplicar CODE también


- What to assess in the vault
	- Content consumed: videos, film, books, blog
	- Inspirations: HOW WE DO THIS: pinterest, tweets, insta
	- Issues
	- Notes: Index, MoC, Note, Atomic 
	- Project Log: ADR, Meetings, Problems/Decisions/Solutions
	- Bookmarks: bookmark
	- Habit tracker
- What NOT TO assess in the vault
	- Project code
	- Project final documentation
	- Books annotations
	- Files associated to a project

## Why to maintain

- Escribir ayuda a retener mejor la información
- Es una herramienta super útil para recuperar información
- Te hace activamente pensar -> Activa mucho tu parte crítica
- Discovery tools and AI -> Si tienes algo destilado ya para que perder el tiempo otra vez
- Puedes usarlo para construir cosas que te den rédito
	- Saber más te permite ascender laboralmente
	- Ser crítico y reflexivo es muy útil en las relaciones sociales
		- La gente habla de fútbol y política
	- Mis objetivos a medio plazo van condicionados a seguir mejorando
		- Incrementar mis sueldo a 70-80
		- Emprender

## Building blocks

### Note types

- [[Notes are dynamic]]

#### Notes

- Everything though should start as a base note. In deed, the exceptions:
	- Content item for databasing
	- Comments in a Zotero Book highlight
	- Issues
	- Logs
- The idea here is:
	1. Select the [[Base Note Types]]
	2. Write Down the note
	3. Complete the "move out the inbox" checklist
- The base Note Types can be organised following [[How I see the CODE Process]]
	- [[Capturing - CODE]]: it can come from your mind or from a book.
		- Art Notes
		- Literature Note
			- Data, Studies
			- Design Pattern
			- Code Snippet
			- Definitions
			- Quote
			- Wikipedia Page
		- Personal Notes: in a project, this notes should explain it
			- Ideas
			- Reflexions
			- Product Ideas
			- Questions: Preguntas que requieren ser pensadas/desarrolladas
		- Types that can came from external/internal
			- [[Atomic Notes]]
			- Principles
			- Rules
		- Database Items
			- Stories
				- Book
				- Film
				- TV Show
			- Learnings
				- TextBooks
				- Courses
			- Article
			- Youtube Video
			- Bookmarks
		- [[Daily Log]]: Here you capture all the workflow of the day. Split by projects, eventually move to the project log. Ideally at the en of the project this log should look like an index
	- [[Implementing the O of CODE]]:
		- Complete Notes
		- Move notes
		- Create task
		- Clean logs
		- Clean Notebook
	- [[Distill - CODE]]:
		- **Permanent Notes (Evergreen):** Highly distilled, actionable insights written in your own words. They are "important" notes that represent your unique understanding of a topic.
		- **Problem-Solution Description:** Documenting a specific challenge you faced in code or math and how you bypassed it.
		- **Hypotheses & Questions:** A list of "Open Questions" you have about Quant Finance that you haven't solved yet.
		- **Review Notes:** Personal summaries of a research paper, focusing on how it changes your current perspective.
		- **Future Work**
		- **Workflow**
		- **Guidelines**
		- In one word
			- permanent
			- problem
			- review
			- open-questions
			- hypotheses
			- decision
			- workflow
			- guidelines
		- Linker Notes
			- MoC
				- Outlines: Punto de partida de un tema concreto
				- Reviews
				- Explained Indexes
			- Index
				- Curriculums
					- Indices asociados a un tema de estudio concreto. Algunos ejemplos
						- Hull-White
						- Interest Rates
						- Tema 1 de un libro
					- Esquemas de estudio: Nos permiten estudiar esquemáticamente un tema
			- PARA notes
				- Pueden incluir
					- Deadline
					- Goal

#### Note types Definitions

- [[Index]]
- [[Map of Contents]]
- [[Atomic Note]]


### Properties

- PARA folders
	- links to the para note
- Rating: int 1 - 5
- img: default for cards
- para_type: for para notes
- tags:
	- Note type tags
		 - For databases
			- `_db/recipe`
			- `_db/book`
			- `_db/textbook`
			- `_db/film`
			- `_db/article`
			- `_db/video`
			- `_db/bookmark`
			- `_db/product`
		- Basic types
			- `_note/note`
			- `_note/index`
			- `_note/atomic`
			- `_note/moc`
			- `_note/literature`
			- `_note/log`
			- `_note/para`
		- Atomic Subtypes
			- `_note/quote`
			- `_note/wikipage`
			- `_note/definition`
			- `_note/code`
			- `_note/design-patern`
			- `_note/principle`
			- `_note/rule`
			- `_note/data`
		- Note Subtypes
			- `_note/ideas`
			- `_note/reflexions`
			- `_note/product-idea`
			- `_note/questions`
			- `_note/hypotheses`
		- Index Subtypes
			- `_note/curriculum`
			- `_note/open-questions`
		- Moc Subtypes
			- `_note/review`
		- Distilled Subtypes
			- `_note/permanent`
			- `_note/problem-solution`
			- `_note/decision`
			- `_note/workflow`
			- `_note/guidelines`
			- `_note/checklist`
	- Source tag
		- Literature Notes: Just add: `_external`
		- Databases items are redundant
	- Usage tag
		- To [[Express]], in a way to be defined, add `_output`
	- Status
		- `inbox`
		- `to-learn`
		- `to-consume`
		- `goal`
	- Review stat
		- Not reviewed -> no tag
		- `_r/1-3`

### Other systems

- Your physical notebook -> Physical implementation of [[Daily Log]]
- Apple Notes -> ideas that comes to your mind when outside
- Zotero -> Book annotations
- Eagle
## Note Taking Workflows

- Base Note Taking
- Logging
- Textbook learning
	- Reading
	- End of Unit/Book
	- Review
- Browsing
- Future content input: books, films and so on
- Bookmarking
- Looking for inspiration
- Looking for content
- Active learning with an AI

## Rules

- Avoid notes plain chains note 1 -> note 2 -> note 3
- No IDs in notes
## AI Helpers

### Prompts

- Chat2Notes
- CreateAtomic 
- DevelopNotej

### Models

- Note Writer
- English Teacher

### Instructions

- Note rules

### Skills


## Comments

- The categories are or para

## Tags usage

This should be a second folder structure

- Only note level. You can use them at the middle of a note but don't try to use things like evidence to show that this is a evidence
- Help for searching: 
	- Resources to see: movies, shows, book, blog, tutorial, to-watch, to-visit, to-read, to-read
	- to-learn
	- year-objetive

## Notes positioning

1. Inbox
2. References go to 06 Inputs
3. General notes and PARA files to the folder of the p/a/r
4. Map of Contents and Permanents has their own folder

## Elements

These elements constitute the different Categories, each of this should be thought as its own database with some commons properties and should have a template (obsidian or obsidian clippings)

- General Resources
	- Book: authors, genre
	- TextBook: authors, genre
	- Film: director, cast, genre
	- Video: authors, genre
	- Articles: authors, genre
	- Music: authors, genre
	- AIChat
	- Author
- Other Resources
	- Product
	- AnyWeb
- Productivity
	- Issue
	- Note
	- Permanent
	- MoC
	- PARA
- Trips
	- Trip -> loc(city), start, end
	- City
	- Place -> loc(city), last
- Others
	- Category
	- KnowledgePleasure -> Normalmente asociada a una de las 12 Permanent Active y simplemente guardamos los links y la info para poder aprender

## Bases

- Todos los PARA
- For a PAR
	- References (by type)
	- Issues
	- Logs
	- Meetings
	- Indexes
	- MoC
	- Notes
- Calendar: WAITING TO BE IMPLEMENTED
- Films/Shows/Books: to-watch/complete by years
- Text Books: just for inspiration sake
- Something for places?
## Proyectos de prueba

- Libros, series y pelis Database
- Recetas 2026
- NOMAD Project
- Plan 2026
- 3 temas del Hull y White (usandolo con zotero)
- Planificar y documentar un viaje


## Questions

- How we deal with note of books
- Como hago para los topics to explore: 

# Archive

- Quiero definir como se deben escribir notas
	- Sobre todo pensando en decirle a una IA que me escriba/formatee algo
- Estoy pensando en los tipos de notas
	- Tomar notas de un libro
		- lo más parecido a tomarlas directamente en un cuaderno -> BookNote -> BookIndex
		- Esquemas del tema
		- [[The Module - The minimum learning magnitude]]
	- Algo propio
		- código
		- pensamiento, opinion
		- solucion
		- piensalo más en detalle hablalo con gemini
- Las inspiraciones no se como gestionarlas
	- Pinterest es la mejor forma de inspiración
	- Algun mix: pero no si fotos albunes o que. supongo que depende de lo que sea. La gracia es que este por temas y sea scrolleable
	- Inspiration view y siempre pon una puta foto
- El log es como un diario pero los problemas, soluciones, dudas viven en notas
- Necesito dejar clara la jeraquia
- No te olvides de las referencias -> studios, hechos de valor

## Notes category

En CODE la idea es:
1. Capturar: tomar todo lo que surge a tu alrededor y registrarlo
	1. Capturas de contenido
	2. Ideas, pensamientos reflexiones
	3. 
2. Organizar: tomar todo esto que has observado y organizarlo [[Que significa Organizar en CODE]]
3. Destilar: Transformar todas estas capturas en conceptos, acciones
4. Expresar: Es la parte más importante a fin de cuentas -> Hacer uso de estas notas destiladas para generar valor:
	1. Producto
	2. Patron de Diseño
	3. Código (script, librería, modulo concreto)

- Las notas que tomas tienen un uso para tu dia a dia
	- Información: Cosas que puedes usar en tu día a día según tus intereses
		- Plan cerdan
		- ML Model
		- Finance Term
	- Ideas and Reflexions
	- Processes
	- Documentation
	- Intermediates: Things that could be used in the future
		- Code idea
	- Project ideas
	- Content to consume

### Externals

Tienen dos funcionalidades distintas

- Literature Notes: servir como inbox de las cosas que leas en libro
	- Son:
		- Subrayados
		- Comentarios sobre el texto
		- Dudas y reflexiones
		- Datos
	- Sirven como punto de partidas para nuevas notas
	- NO VIVEN EN OBSIDIAN DE PRIMERAS
	- [[Literature Notes movement Workflow]]:
		- Es un paso más dentro del consumo de contenido
		- Ver como automatizar -> Zotero exporter
	- Workflow
		- Realizar cada: Si es un libro de texto, una vez por tema. Otro tipo de libro, el finde después de acabarlo. (Libro = cualquier tipo de contenido)
		- [ ] Leer todo lo subrayado, uno a uno de forma reflexiva
		- [ ] Crear Notas individuales de los que vuelvan a resonar
		- [ ] Hacer un indice propio (no una index note) del libro/tema

- BookIndex -> Nota del libro en si
	- BookNote -> Nota del libro en si
- Searching session
	- to-learn tag
- Blog
	- to-read
	- Usamos como reader obsidian y de vez en cuando creamos las notas


### Logs

Son notas que nos permiten recoger lo que vamos a haciendo en un proyecto. Nos permite preparar también eventos y recoger lo que paso (por ejemplo una reunion).

- Fuerza la toma de notas. La idea no es que usemos la notas de los logs. Si no que extraigamos notas del log. Por ejemplo un decision o un problema.
- Nos permite recuperar que hemos hecho en un proyecto
## How to manage inspiration

- Que entendemos como inspiración
	- Buscar ideas que nos puedan ser útiles en un proyecto
	- Forzar nuestra mente a un estados concreto
- Pinterest is the easiest, you find there 
	- Organizamos nuestros intereses
		- Aesthetics photos
		- Clothes
		- Buildings
		- Interior Design
		- Web UI/UX
		- Art
- Incluimos Atomic Interes
	- Notas asociadas a una fuente de inspiración
	- Creamos la base de datos para ver estas imágenes
	- Les asignamos que nos hacen sentir
	- No tiene por que tener un foto obligatoriamente, pero es lo ideal

## El flujo final

- Flujos de captura genérico
	- Puntos de entrada
	- Creación de la nota
	- Metadata de la nota
	- Linkar Nota
	- Consumo y refinado
- Los puntos de entrada son:
	- Leyendo - Estudiando
		- Nota del libro
		- Nota sobre contenido del libro
		- Indices (los añado porque te tienes que obligar a elaborlos)
	- Trabajando
		- Ideas
		- Logs
		- Problemas
		- Soluciones
		- Notas atomicas
	- Pensando
		- Idea (reflexiones)
		- Notas atómicas
		- Sentimientos y que te lo ha generado
	- Consumiendo contenido cotidiano
		- Notas de Pelis, Series, Libros
		- Ideas (reflexiones)
		- Fotos



## Notes about places

- Si tienes la ciudad de barcelona esta puede tener notas asociadas -> Plan Cerdan 
- La cultura son notas

## Note taking when learning

- Subrayar el libro y tomar notas
	- Una nota genérica con
		- Comentarios
		- Dibujos
		- Formulas
		- Ejemplos
- Repasar tema
	- Nuevas notas
	- Crear notas especificas
	- Mover 