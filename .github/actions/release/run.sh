#!/bin/bash
set -o pipefail
set -eux

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'

sed -i -e 's|^/dist.*||g' .gitignore
git add .gitignore
git add dist

git status
git commit -m "Release $TAG_NAME"
git tag -f "$TAG_NAME"
git push origin -f "$TAG_NAME"
