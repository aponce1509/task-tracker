---
tags:
---

<!-- TODO: Code an example of all this note -->
<!-- TODO: In the review, use as reference the Capture Example Note -->

<!-- TO SOLVE IN THE FUTURE -->
<!-- TODO: Maybe you should talk about git submodules: in a workspace how we deal with git -->
<!-- TODO: Can I create a workspace from an external package through git: I guess that yes -->

# Rust Projects Structure

Vamos a recoger todo lo que necesitas para gestionar un proyecto the Rust. Vamos
a ver el siguiente contenido:

- [x] [Capítulo 7: Crates and Modules](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [x] [Capítulo 11: Testing](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [x] [Capítulo 14: More about cargo](https://doc.rust-lang.org/book/ch14-00-more-about-cargo.html)

## Create your own crates

See:

- <https://doc.rust-lang.org/book/ch01-03-hello-cargo.html>
- <https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html>

The first thing you need to know is how to create and initialise a project:
[[rust quickstart]]. We use `cargo` to create, build, run and test the code.

A Package is a group of binary crates (rust script that has a main function) and
a library crate that does not compile to anything is just a bunch of **modules**
to be **use** in other rust projects (or the binary crates)

> [!NOTE]
>
> When you run `cargo new` you are creating a project with only one crate

You can see a list of steps in [[starting a new rust project]].

### Library Crates

See: <https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html>

Is the code inside the `lib.rs` file.

```bash
cargo new lib-test --lib
```

```text
lib-test
├── Cargo.toml
└── src
    └── lib.rs
```

### Binary Crates

See: <https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html>

Is the code inside the `main.rs` file or the `.rs` files inside `src/bin/*.rs`
this file must have a main function that will be executed by the binary.

```bash
cargo new bin-test
```

```text
bin-test
├── Cargo.toml
└── src
    └── main.rs
```

See [this](https://doc.rust-lang.org/cargo/reference/cargo-targets.html#configuring-a-target) to know how to customize binaries and libs (name, path, ...).

## The module system

See:
<https://doc.rust-lang.org/book/ch07-02-defining-modules-to-control-scope-and-privacy.html#modules-cheat-sheet>


> [!info]
>
> Rust has a number of features that allow you to manage your code’s
> organization, including which details are exposed, which details are private,
> and what names are in each scope in your programs.

This features include:

- Packages: A Cargo feature that lets you build, test, and share crates
- Crates: A tree of modules that produces a library or executable
- Modules and use: Let you control the organization, scope, and privacy of paths
- Paths: A way of naming an item, such as a struct, function, or module

We have seen packages and crates already.

## Modules

They need to be declared:

```rust
# lib.rs
mod garden;
```

Later the compiler will look for the code:

1. inline
2. in the `src/garden.rs` file.
3. in the `src/garden/mod.rs` file, old way.

You can nest modules declaring the module inside a module

```rust
# garden.rs
mod vegetables;
```

Now the code will be search:

1. inline
2. in the `src/garden/vegetables.rs` file.
3. in the `src/garden/vegetables/mod.rs` file, old way.

If you define a struct in the vegetables module to use it you need to bring it
to the scope using the `use` keyword and its `path`

```rust
use crate::garden::vegetables::Asparagus;
```

### The way of thing


El compilador construye un árbol con los módulos partiendo de `lib.rs`. Las
hojas del árbol son las funciones, structs, enums, etc. El árbol se construye
mediante la declaración. Para referirnos a un objeto usamos su Path que es los
módulos más su nombre.

Es importante tener claros el scope, que tienes accesible dentro de un modulo
(ignorando privacidad) y que cosas son internas del scope (privado) y que se
permite importar (público).

### Scope

El scope de un módulo son las funciones definidas dentro de ese módulo (ojo con
los scopes dentro) Y dentro de ese módulo puedes acceder a cualquier objeto
independientemente de su privacidad.

### Privacy

Para poder usar algo dentro del árbol, tiene que estar marcado como público. No
basta con que este marcado el elemento final, los módulos tienen que estar
marcados también. Y marcar un modulo como público no hace el módulo completo
público.

> [!IMPORTANT]
>
> A child has complete vision of his ancestors

#### Structs and Enums

We can also use pub to designate structs and enums as public, but there are a
few extra details to the usage of pub with structs and enums.

If we use pub before a struct definition, we make the struct public, but the
struct’s fields will still be private, the same wit te functions.

In contrast, if we make an enum public, all of its variants are then public. We
only need the pub before the enum keyword

### Paths

A path can take two forms:

- An absolute path is the full path starting from a crate root; for code from an
  external crate, the absolute path begins with the crate name, and for code
  from the current crate, it starts with the literal crate.
- A relative path starts from the current module and uses `self`, `super`, or an
  identifier in the current module.

You can use `super` multiple times.
[More about paths here](https://doc.rust-lang.org/book/ch07-04-bringing-paths-into-scope-with-the-use-keyword.html)

## Testing

See: <https://doc.rust-lang.org/book/ch11-00-testing.html>

### Test basics

Just do this:

```rust
pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}

```

and run `cargo test`.

> [!IMPORTANT]
>
> The `#[cfg(test)]` annotation on the tests module tells Rust to compile and
> run the test code only when you run cargo test. The `#[test]` annotation
> convert a function into a test.

### Test Utils

See: <https://doc.rust-lang.org/book/ch11-02-running-tests.html>

cargo test cli

- Threads: `cargo test -- --test-threads=1`
- Output: `cargo test -- --show-output`
- Filtering: `cargo test name`, search `name` in the Path of the test function
  (including the module).
- ignore: using `#[ignore]` makes the test ignored unless used the `--ignored`
  flag
- You can test private functions if your test is define as a child of the module
  where the private function is. An example

test snippet

```rust
pub fn add_two(a: usize) -> usize {
    internal_adder(a, 2)
}

fn internal_adder(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        let result = internal_adder(2, 2);
        assert_eq!(result, 4);
    }
}
```

### Integration Test

In Rust, integration tests are entirely external to your library. They use your
library in the same way any other code would, which means they can only call
functions that are part of your library’s public API.

1. special `tests/` folder.
2. You don't need `#[cfg(test)]` only `#[test]`

   Cargo treats the tests directory specially and compiles files in this
   directory only when we run cargo test

3. You can access the code in the library as the user will.

Important considerations:

1. Each file is compile in the tests folder is compiled as a crate.
2. If you want to create modules for testing you should follow the old
   convention style.
3. The code in the binary crates cannot be accessed by the integration tests.

Note that you must declare the module in each test because it is an independent
crate.

## Deploying

### Compilation

- you have profiles to configure how the code compilation is done. By default,
  build use the dev profile that it is not optimized, so faster, and release use
  the most optimized option, so it is slower.
- You can define custom profiles:
  <https://doc.rust-lang.org/cargo/reference/profiles.html#custom-profiles>
- [Here](https://doc.rust-lang.org/cargo/reference/profiles.html#profile-selection)
  you can see which profile is selected.
- For more low lever adjustments:
  <https://doc.rust-lang.org/cargo/reference/profiles.html#profile-selection>

### Code Documentation

<!-- TODO: Extend when used -->

See:
<https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#making-useful-documentation-comments>

- Docstrings are placed over the function and require `///`
- There are 4 common sections:
  - Example
  - Panics
  - Errors
  - Safety
- You can use `//!` to document the item that contains the text. Useful for
  modules and crates.

### Publishing

<!-- TODO: Extend when used -->

1. `cargo publish` but you need to login first.
2. You need a bunch of metadata to make this works.
3. You can "yank" a version that is deprecated.

See:
<https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#setting-up-a-cratesio-account>

## Cargo Workspaces

It is just a bunch of packages.

A directory with a `Cargo.toml`

```toml
[workspace]

members = [
    "member_1",
    "member_2",
]
```

You can create the members using `cargo add memeber_1`

Comments:

1. A workspace has one target for all the members, because optimization reasons.

   > If each crate had its own target directory, each crate would have to
   > recompile each of the other crates in the workspace to place the artifacts
   > in its own target directory. By sharing one target directory, the crates
   > can avoid unnecessary rebuilding.

2. Dependencies between crates in the workspace:

   ```toml
   [dependencies]
   add_one = { path = "../memeber_1" }

   ```

3. To run a binary from one the members PACKAGES we use: `cargo run -p member_1`
4. All the members share the dependencies versions but we need to specify them
   explicitly. They are resolved to have the same version in all the packages.
