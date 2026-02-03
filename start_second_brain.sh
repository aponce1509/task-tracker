#!/bin/zsh

# Create subdirectories
mkdir -p "00 - Map of Contents"/"00 - Index"
mkdir -p "01 - Projects"/_archive
mkdir -p "01 - Projects"/_active
mkdir -p "01 - Projects"/_some_day
mkdir -p "02 - Areas"/_archive
mkdir -p "02 - Areas"/_active
mkdir -p "02 - Areas"/_some_day
mkdir -p "03 - Resources"/_archive
mkdir -p "03 - Resources"/_active
mkdir -p "03 - Resources"/_some_day
mkdir -p "04 - Permanent"
mkdir -p "05 - Fleeting"
mkdir -p "06 - Inputs"/Highlights/Zotero
mkdir -p "06 - Inputs"/Highlights/Readwise
mkdir -p "07 - Daily"
mkdir -p "08 - Tasks"
mkdir -p "09 - Inbox"
mkdir -p "10 - Archive"
mkdir -p "99 - Meta"/Attachments
mkdir -p "99 - Meta"/Templates

# copy templates from dotfiles

cp $DOTFILES/obsidian/templates/Nvim/* "99 - Meta"/Templates
