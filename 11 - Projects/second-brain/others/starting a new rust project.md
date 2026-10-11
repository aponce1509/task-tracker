---
tags: []
---

# starting a new rust project

To start a Rust project with both binary and library crates and to set up tests
for your code, follow these steps:

1. **Create a new Rust project**: Use `cargo new` to create a new project. This
   will create a binary crate by default.

   ```sh
   cargo new my_project
   cd my_project
   ```

2. **Add a library crate**: Create a `src/lib.rs` file. This will be your
   library crate.

   ```sh
   touch src/lib.rs
   ```

3. **Modify `Cargo.toml`**: Ensure your `Cargo.toml` includes both the binary
   and library crates.

   ```toml
   [package]
   name = "my_project"
   version = "0.1.0"
   edition = "2021"

   [dependencies]

   [[bin]]
   name = "my_project"
   path = "src/main.rs"
   ```

4. **Write your library code**: Add your library code in `src/lib.rs`.

   ```rust
   // src/lib.rs
   pub fn greet() -> String {
       "Hello from the library!".to_string()
   }
   ```

5. **Use the library in the binary**: Modify `src/main.rs` to use the library
   crate.

   ```rust
   // src/main.rs
   fn main() {
       println!("{}", my_project::greet());
   }
   ```

6. **Add tests**: Create a `tests` directory for integration tests and add unit
   tests in `src/lib.rs`.

   **Unit tests in `src/lib.rs`**:

   ```rust
   // src/lib.rs
   pub fn greet() -> String {
       "Hello from the library!".to_string()
   }

   #[cfg(test)]
   mod tests {
       use super::*;

       #[test]
       fn test_greet() {
           assert_eq!(greet(), "Hello from the library!");
       }
   }
   ```

   **Integration tests in `tests` directory**: Create a file
   `tests/integration_test.rs`.

   ```rust
   // tests/integration_test.rs
   use my_project;

   #[test]
   fn test_greet() {
       assert_eq!(my_project::greet(), "Hello from the library!");
   }
   ```

7. **Run tests**: Use `cargo test` to run all tests.

   ```bash
   cargo test
   ```

By following these steps, you will have a Rust project with both binary and
library crates, and you will be able to write and run tests for your code.
