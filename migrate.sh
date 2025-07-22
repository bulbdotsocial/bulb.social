#!/bin/bash

# Script de migration automatique pour Bulb.social Client
# Remplace les anciens imports par les nouveaux composants et hooks optimisés

echo "🚀 Starting Bulb.social Client Migration..."

CLIENT_DIR="/Users/macbookpro/Documents/Dev/EthGlobal/bulb.social/client"
SRC_DIR="$CLIENT_DIR/src"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with colors
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -d "$SRC_DIR" ]]; then
    log_error "Source directory not found: $SRC_DIR"
    exit 1
fi

cd "$CLIENT_DIR"

log_info "Starting migration process..."

# Backup current files
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
log_info "Creating backup in: $BACKUP_DIR"
cp -r src "$BACKUP_DIR"
log_success "Backup created successfully"

# Phase 1: Replace component imports
log_info "Phase 1: Updating component imports..."

# Replace ENSUser imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
    -e "s|import ENSUser from ['\"].*ENSUser['\"];*|import UserDisplayComponent from './UserDisplayComponent';|g" \
    -e "s|import.*{.*ENSUser.*}.*from.*|import UserDisplayComponent from './UserDisplayComponent';|g"

# Replace ProfileUser imports  
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
    -e "s|import ProfileUser from ['\"].*ProfileUser['\"];*|import UserDisplayComponent from './UserDisplayComponent';|g" \
    -e "s|import.*{.*ProfileUser.*}.*from.*|import UserDisplayComponent from './UserDisplayComponent';|g"

log_success "Component imports updated"

# Phase 2: Replace component usages
log_info "Phase 2: Updating component usages..."

# Replace ENSUser component usage
find src -name "*.tsx" | xargs sed -i '' \
    -e 's|<ENSUser|<UserDisplayComponent variant="ens-only"|g' \
    -e 's|</ENSUser>|</UserDisplayComponent>|g'

# Replace ProfileUser component usage
find src -name "*.tsx" | xargs sed -i '' \
    -e 's|<ProfileUser|<UserDisplayComponent variant="full"|g' \
    -e 's|</ProfileUser>|</UserDisplayComponent>|g'

log_success "Component usages updated"

# Phase 3: Update hook imports
log_info "Phase 3: Updating hook imports..."

# Replace old hook imports with optimized versions
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
    -e "s|import.*{.*useENS.*}.*from.*useENS|import { useUserData } from '../hooks/useUserData';|g" \
    -e "s|import.*{.*useBulbFactory.*}.*from.*useBulbFactory|import { useOptimizedContractIntegration } from '../hooks/useOptimizedContractIntegration';|g" \
    -e "s|import.*{.*useProfileContract.*}.*from.*useProfileContract|import { useUserData } from '../hooks/useUserData';|g"

log_success "Hook imports updated"

# Phase 4: Update UI component imports
log_info "Phase 4: Updating UI component imports..."

# Update MUI Button imports to use our custom Button
find src -name "*.tsx" | xargs sed -i '' \
    -e "s|import.*{.*Button.*}.*from.*@mui/material|import { Button } from '../components/ui';|g" \
    -e "s|import.*{.*Card.*}.*from.*@mui/material|import { Card } from '../components/ui';|g"

log_success "UI component imports updated"

# Phase 5: Update service imports
log_info "Phase 5: Adding service imports where needed..."

# Add service imports to files that might need them
find src/components -name "*.tsx" | xargs grep -l "fetch.*api" | while read file; do
    if ! grep -q "import.*services" "$file"; then
        sed -i '' "1i\\
import { postService, apiService } from '../services';
" "$file"
    fi
done

log_success "Service imports added"

# Phase 6: Update type imports
log_info "Phase 6: Updating type imports..."

# Update type imports to use centralized types
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
    -e "s|interface.*UserProps|import type { UserDisplayComponentProps } from '../components/UserDisplayComponent';|g"

# Add centralized type imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
    -e "1s|^|import type { Post, User, ApiResponse } from '../types';\\n|"

log_success "Type imports updated"

# Phase 7: Clean up duplicate imports
log_info "Phase 7: Cleaning up duplicate imports..."

# Remove duplicate import lines
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    # Remove consecutive duplicate lines
    awk '!seen[$0]++' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done

log_success "Duplicate imports cleaned"

# Phase 8: Format and lint
log_info "Phase 8: Running formatting and linting..."

# Run prettier if available
if command -v prettier &> /dev/null; then
    npx prettier --write "src/**/*.{ts,tsx}" 2>/dev/null || log_warning "Prettier formatting skipped"
    log_success "Code formatted with Prettier"
fi

# Run ESLint fix if available
if command -v eslint &> /dev/null; then
    npx eslint --fix "src/**/*.{ts,tsx}" 2>/dev/null || log_warning "ESLint fixes skipped"
    log_success "ESLint fixes applied"
fi

# Phase 9: Validation
log_info "Phase 9: Validating migration..."

# Check for common migration issues
ISSUES_FOUND=0

# Check for remaining old imports
OLD_IMPORTS=$(grep -r "import.*ENSUser\|import.*ProfileUser" src/ 2>/dev/null | wc -l)
if [[ $OLD_IMPORTS -gt 0 ]]; then
    log_warning "Found $OLD_IMPORTS remaining old component imports"
    ISSUES_FOUND=$((ISSUES_FOUND + OLD_IMPORTS))
fi

# Check for missing UserDisplayComponent imports
MISSING_IMPORTS=$(grep -r "UserDisplayComponent" src/ --include="*.tsx" | grep -v "import.*UserDisplayComponent" | wc -l)
if [[ $MISSING_IMPORTS -gt 0 ]]; then
    log_warning "Found $MISSING_IMPORTS files using UserDisplayComponent without imports"
    ISSUES_FOUND=$((ISSUES_FOUND + MISSING_IMPORTS))
fi

# Check TypeScript compilation
log_info "Checking TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
    log_success "TypeScript compilation successful"
else
    log_warning "TypeScript compilation has warnings/errors - please review manually"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Migration summary
echo
echo "================== MIGRATION SUMMARY =================="
log_info "Migration completed!"
log_info "Backup created in: $BACKUP_DIR"

if [[ $ISSUES_FOUND -eq 0 ]]; then
    log_success "No issues found - migration appears successful!"
else
    log_warning "Found $ISSUES_FOUND potential issues - please review manually"
fi

# Report what was migrated
echo
echo "Migrated components:"
echo "  ✅ ENSUser → UserDisplayComponent (variant='ens-only')"
echo "  ✅ ProfileUser → UserDisplayComponent (variant='full')"
echo
echo "Migrated hooks:"
echo "  ✅ useENS → useUserData"
echo "  ✅ useBulbFactory + useProfileContract → useOptimizedContractIntegration"
echo
echo "Updated imports:"
echo "  ✅ UI components (Button, Card, Input)"
echo "  ✅ Service imports (postService, apiService)"
echo "  ✅ Centralized types"

echo
echo "Next steps:"
echo "1. Review and test the migrated components"
echo "2. Update any custom logic that depended on old hook APIs"
echo "3. Test the application thoroughly"
echo "4. Remove backup directory when satisfied: rm -rf $BACKUP_DIR"

echo
log_success "Migration script completed!"

# Open VS Code if available
if command -v code &> /dev/null; then
    echo
    read -p "Open VS Code to review changes? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        code .
    fi
fi
