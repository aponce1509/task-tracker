---
tags:
  - Linked
  - docu_type/permanent
  - docu_type/example
  - output/workflow
  - output/principles
---

# Capture Example - Rust Crates

This example can be seen in: [[Rust Projects Structure]]

Esto documento define como trabajar cuando estas aprendiendo algo dentro de un
contexto definido, no es algo aleatorio que te has encontrado. Si que puede ser
algo espontaneo, pero sabes que quieres aprender. Algunos casos parecidos:

1. Un capítulo de un libro
2. Aprender como funciona algo de una librería

Algunas cosas que no entran son:

1. Como resolver un problema
2. Definiciones atómicas

Esto es un ejemplo de como tomar notas sobre una documentación donde hay código
relacionado. En concreto queremos recoger los capítulos:

- [Capítulo 7](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [Capítulo 11](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [Capítulo 14](https://doc.rust-lang.org/book/ch14-00-more-about-cargo.html)

## Some context

This is not the scenario where you try to solve this question while starting a
Rust Project.

> [!important]
>
> This example shows how to capture over a documentation when you are studying
> it, more like a book. Here we want to show how to take code notes and capture
> documentation.

## The firsts steps

<!-- NOTE: #key You have to know that you are learning something -->

> [!IMPORTANT]
>
> The most important step is to be aware that you are learning something that
> need notes.

In this case, we know what to learn: the things related to project management
and development in rust and the workflow would be:

<!-- NOTE: #output/workflow Planned learning of a defined topic  -->

1. Create or use a reference (could be any PAR). I prefer put first in the
   project and move it later to the reference using the #MoveToReference.
2. Add to the unordered section the link to the new note.
3. Indicate what do you want to learn.
4. Look for notes related
5. Start the learning

<!-- NOTE: #output/workflow Spontaneous learning of a defined topic  -->

In the situations where you are aware that are learning but it is more
spontaneous, ignore the steps 1 and 2. Just create the note add a quick
introduction just saying what and why are you learning this. This is saved in
the inbox, we complete 1 and 2 when cleaning.

## The learning Phase

<!-- TODO: Late review. This is a WIP -->

La idea es que lo leas, tomes las notas correspondiente en el documento creado y
siempre poniendo las referencias de donde los has sacado. Si hay código, escribe
a mano el código en el repo.

Como herramienta adicional tienes reader, pero únicamente como referencia
adicional, no como creador de notas.

## The cleaning

- Revisar los subrayados tienes las cosas importantes deben estar.
- Si es reader tags y archivar
- Quitar los todos
- Ver que tags tienes que poner en la nota (y subnotas si se han creado)
- Links a otras notas?
- Añadir referencias dentro de la nota
- Mover nota
- Add to revisit in the todo list.

### Tags in the file

Hay algunas cosas dentro de la nota que vas a considerar las más importantes y
en caso de vistazo rápido no te puedes perder. Para esto usamos tags dentro de
un comentario de markdown (son `NOTE:`). Las más habituales son:

- #evidences/definition
- #evidences/code
- #key

Imagina una nota como un árbol, estos tags debería de permitirte reconstruir el
árbol a partir de ellas.

## Situaciones de consumo y recovery

Es importante notar que el ejemplo que estamos usando, estrictamente lo que
debería ser es un MoC. Pero mi cabeza no funciona bien con tantas notas. Sobre
todo a ir creandolas mientras estudio y luego crear el MoC. Funciono mejor en el
otro sentido.

- Recall the content. In this note the idea is search all the NOTES and comments
  and tags. You can even add new tags to help in future recalls. and
- coding something that is related with this, you may need to copy something or
  check some particularities.

## Que ocurre cuando estamos en en medio de otro proyecto

Este ejemplo esta pensado para aprender algo en una situación de aprendizaje.
Pero habitualmente la situación en la que te enfrentas a la documentación es
primero en medio de un proyecto, que luego te puede hacer querer profundizar en
la documentación y si estaríamos ya en la situación descrita en el ejemplo.

<!-- NOTE: #evidences/question Se puede capturar en estás situaciones? -->

Las cuestiones ahora son:

- Puedo o tengo recoger en algún sitio esta info.
- Tiene sentido retener la referencia bajo un tag de need_learning.
- Las anotaciones las tenemos tanto en reader como en la nota.
- Montamos una sola nota para la sesión o vamos creando notas.
