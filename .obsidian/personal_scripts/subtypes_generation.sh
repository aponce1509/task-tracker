#!/usr/bin/env bash

set -e

JSON_FILE="${1:-taxonomy.json}"
BASE_DIR="${2:-.}"

if [[ ! -f "$JSON_FILE" ]]; then
  echo "Error: JSON file '$JSON_FILE' not found."
  echo "Usage: ./generate_subtypes.sh [path/to/taxonomy.json] [target_output_dir]"
  exit 1
fi

echo "Reading taxonomy from: ${JSON_FILE}"
echo "Output directory: ${BASE_DIR}"

python3 - "$JSON_FILE" "$BASE_DIR" << 'EOF'
import sys
import json
import os
from datetime import datetime

json_file = sys.argv[1]
base_dir = sys.argv[2]

# Directory setup
types_dir = os.path.join(base_dir, "../_types")
os.makedirs(base_dir, exist_ok=True)
os.makedirs(types_dir, exist_ok=True)

with open(json_file, 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

for category, types in taxonomy.items():
    formatted_category = category.replace("/", " & ")

    for note_type, subtypes in types.items():
        # ---------------------------------------------------------
        # 1. Create the Type file (lives in _type directory)
        # ---------------------------------------------------------
        type_basename = f"{note_type}.md"
        type_file_path = os.path.join(types_dir, type_basename)
        type_link_name = note_type

        type_content = f"""---
file_class: category
created: {timestamp}
---
# [[{type_link_name}]]

![[types.base]]
"""

        with open(type_file_path, 'w', encoding='utf-8') as out_file:
            out_file.write(type_content)

        print(f"  [+] Created Type: _type/{type_basename}")

        # ---------------------------------------------------------
        # 2. Create the Subtype files (lives in BASE_DIR)
        # ---------------------------------------------------------
        for subtype_name, description in subtypes.items():
            subtype_basename = f"{formatted_category} - {note_type} - {subtype_name}.md"
            subtype_file_path = os.path.join(base_dir, subtype_basename)
            subtype_link_name = subtype_basename.replace('.md', '')

            subtype_content = f"""---
aliases:
  - "{subtype_name}"
file_class:
  - subtype
created: {timestamp}
---
# [[{subtype_link_name}|{subtype_name}]]

> [!note] When to use
> {description}

![[subtypes.base]]
"""

            with open(subtype_file_path, 'w', encoding='utf-8') as out_file:
                out_file.write(subtype_content)

            print(f"      [+] Created Subtype: {subtype_basename}")

print("\nDone! All type and subtype files generated successfully.")
EOF