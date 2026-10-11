# task hierarchy

We have 2 simple elements List -> Issue

## What does GTD say?

link: <https://www.youtube.com/watch?v=YsACz5GPMeA&t=3s>

When a new task you insert it in the inbox. The you have to move it around.

You have the calendar list, that is a list of task that must be accomplished in
a concrete day.

You have also multiple list, one for each group of task. A common example is go
to a medical revision for this task you have to do multiple things, like call,
look for previous data, etc. Each task is something that can be accomplished
directly.

## Our implementation

Mi visión es algo distinta. Yo quiero tener un proyecto por cada proyecto real,
más como se ve en PARA.

Dentro de este proyecto tenemos una lista de tareas por cada Issue. Tareas de un
único elemento pueden ser: issues o una tarea asociada al propio proyecto, el
Issue 0.

El calendario. Depende de a que a nivel se aplique se ponga la fecha.

1. En una tarea: Tienen que hacerse en un bloque de tiempo concreto en ese día.
   Estas obligado a ir al calendario y bloquear.
2. Issues: Deadline para dicho evento, el output tiene que estar revisado para
   dicha fecha.
3. Proyectos: Deadline para el proyecto.

## DAG

Projects, issues and task has relations between themselves. So, to make a
prioritization system we need to see this relations.

My inspiration here is try to mimic the Spark Jobs architecture.

This only affect to the issues. It is true that you can do it at project level,
but is something that not need to be consider, is easy to do by hand for
personal management.

We model the issues and its relation as multiple disjoint DAG. Each disjoint DAG
IS a (spark) JOB.

Each issue in this DAG IS a STAGE.

Each task IS a (spark) TASK.

In spark a stage is create in a job when there is data transfer, in our case is
because the output of one issue is needed for the next issue. This

## Small comments about the prioritization system

1. Issues con tareas que cumplidas tienen prioridad maxima
2. Issues con tareas que cumplan hoy, manana tienen mucha prioridad
   desapareciendo progresivamente a las dos semanas estas notas son las
   "urgentes", una nota en el calendario siempre tiene prioridad alta.
3. Asignamos 3 niveles de prioridad. La prio alta es lo que se conoce como
   urgente.
4. las tareas que bloquean tienen bonus
5. las tareas antiguas tienen mas prio
6. issues con mas tareas tienen mas prio
7. tienes el comodín del next, que asigna prio + 100
8. una tarea empezada tiene prio sobre una no empezada.

## Blocking and delegation

There are task that you may delegate to other team or person (blocking can be
assigned to you) this task/issue can block other things so you need to keep
track of the completion of the following task converting it to calendar.

### Task hierarchy

We force this hierarchy to be linear. What can happen is that a task is blocking
the rest, in this cases if the task is delegated, you have to convert this task
in calendar.

If a task in a issue is blocked, the issue is blocked too.

## Que tenemos a nivel tarea y como influye sobre el issue

1. Blocked. A issue with a blocked issue is blocked too
2. Date, when this task should be done. A blocked issue need an assignee and a
   date. The calendar will show projects, issues and task using different color
   codes.
3. assigned, this is for delegated tasks, the issue assignee should be modified
   adding any assigned in a task.
