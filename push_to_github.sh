#!/bin/bash
echo "Initializing Git repository..."
git init
git add .
git commit -m "Initial commit of Faculty Management System"
git branch -M main
git remote add origin https://github.com/YeshwanthKM/Faculty-Management.git
echo "Pushing to GitHub..."
git push -u origin main
echo "Done!"
