#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Build the Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Prepare Backend Static Folder
echo "Syncing Static Files..."
mkdir -p backend/static
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

# 3. Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Unified Build Complete!"
