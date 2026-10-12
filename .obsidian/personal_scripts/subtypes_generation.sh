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

# Detect subtype slug collisions so aliases stay unique across the vault.
slug_counts = {}
for _category, _types in taxonomy.items():
    for _note_type, _subtypes in _types.items():
        for _slug in _subtypes:
            slug_counts[_slug] = slug_counts.get(_slug, 0) + 1

for category, types in taxonomy.items():
    # Normalize category to avoid double spaces
    formatted_category = category.replace("/", " & ").replace("  ", " ").strip()

    for note_type, subtypes in types.items():
        # ---------------------------------------------------------
        # 1. Create the Type file (lives in _types directory)
        # ---------------------------------------------------------
        type_basename = f"{note_type}.md"
        type_file_path = os.path.join(types_dir, type_basename)
        type_link_name = note_type

        # Only create if doesn't exist - preserve created date
        if os.path.exists(type_file_path):
            # Read existing file to get created date if possible
            with open(type_file_path, 'r', encoding='utf-8') as existing:
                content = existing.read()
            # Try to extract created date
            created_date = None
            for line in content.splitlines():
                if line.strip().startswith('created:'):
                    created_date = line.split(':', 1)[1].strip()
                    break
            if not created_date:
                created_date = datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            created_date = datetime.now().strftime("%Y-%m-%d %H:%M")

        type_content = f"""---
file_class: type
created: {created_date}
---
# [[{type_link_name}]]

![[types.base]]
"""

        with open(type_file_path, 'w', encoding='utf-8') as out_file:
            out_file.write(type_content)

        print(f"  [+] Created/Updated Type: _types/{type_basename}")

        # ---------------------------------------------------------
        # 2. Create the Subtype files (lives in BASE_DIR)
        # ---------------------------------------------------------
        for subtype_name, description in subtypes.items():
            subtype_basename = f"{formatted_category} - {note_type} - {subtype_name}.md"
            subtype_file_path = os.path.join(base_dir, subtype_basename)
            subtype_link_name = subtype_basename.replace('.md', '')

            # Only create if doesn't exist - preserve created date
            if os.path.exists(subtype_file_path):
                with open(subtype_file_path, 'r', encoding='utf-8') as existing:
                    content = existing.read()
                created_date = None
                for line in content.splitlines():
                    if line.strip().startswith('created:'):
                        created_date = line.split(':', 1)[1].strip()
                        break
                if not created_date:
                    created_date = datetime.now().strftime("%Y-%m-%d %H:%M")
            else:
                created_date = datetime.now().strftime("%Y-%m-%d %H:%M")

            # Qualify the alias when the slug exists in more than one type,
            # otherwise [[slug]] links are ambiguous.
            alias = subtype_name if slug_counts.get(subtype_name, 1) == 1 else f"{note_type} {subtype_name}"

            subtype_content = f"""---
aliases:
  - "{alias}"
file_class: subtype
created: {created_date}
---
# [[{subtype_link_name}|{subtype_name}]]

> [!note] When to use
> {description}

![[subtypes.base]]
"""

            with open(subtype_file_path, 'w', encoding='utf-8') as out_file:
                out_file.write(subtype_content)

            print(f"      [+] Created/Updated Subtype: {subtype_basename}")

print("\nDone! All type and subtype files generated successfully.")
EOF