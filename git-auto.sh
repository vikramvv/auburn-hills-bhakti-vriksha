#!/bin/bash
# Auto Git Commit Script
# Adds, commits with timestamp + hostname, and pushes

# Get date/time in format: 2025-10-03 22:15:42
NOW=$(date +"%Y-%m-%d %H:%M:%S")

# Get hostname (your Mac/PC name)
HOST=$(hostname)

# Stage all changes
git add -A

# Commit with message
git commit -m "Auto commit on $NOW from $HOST"

# Push to the current branch
git push

