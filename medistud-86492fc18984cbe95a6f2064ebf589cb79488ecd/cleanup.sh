#!/bin/bash

# Cleanup script for PTI Clinic Management System
# Removes auto-extracted directories and temporary files

echo "Cleaning up project..."

# Remove auto-extracted clinic directories
find . -maxdepth 1 -type d -name "clinic-database-system-*" -exec rm -rf {} + 2>/dev/null

# Remove leftover zip files
find . -maxdepth 1 -type f -name "*.zip" -delete 2>/dev/null

# Remove build artifacts (optional)
rm -rf .next 2>/dev/null

echo "Cleanup complete!"
echo "✓ Auto-extracted directories removed"
echo "✓ Zip files removed"
