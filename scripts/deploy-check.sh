#!/bin/bash

# FootprintIQ Pre-Deployment Checklist Script
# Run this before deploying to production

set -e

echo "🚀 FootprintIQ Pre-Deployment Check"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "📋 Running Pre-Deployment Checks..."
echo ""

# Check 1: Node version
echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    check_pass "Node.js version is $NODE_VERSION (>= 18)"
else
    check_fail "Node.js version is $NODE_VERSION (< 18 required)"
fi

# Check 2: Dependencies installed
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "Dependencies not installed. Run: npm install"
fi

# Check 3: TypeScript compilation
echo "3. Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    check_pass "TypeScript compilation successful"
else
    check_fail "TypeScript errors found. Run: npm run type-check"
fi

# Check 4: Environment variables
echo "4. Checking environment variables..."
if [ -f ".env" ]; then
    check_pass ".env file exists"
    
    # Check for required variables
    if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        check_pass "Required environment variables present"
    else
        check_fail "Missing required environment variables"
    fi
else
    check_warn ".env file not found (may be configured elsewhere)"
fi

# Check 5: Build process
echo "5. Testing production build..."
if npm run build > /dev/null 2>&1; then
    check_pass "Production build successful"
    
    # Check bundle size
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist | cut -f1)
        echo "   Bundle size: $BUNDLE_SIZE"
        
        # Check if main bundle is under 2MB
        MAIN_JS=$(find dist/assets -name "index-*.js" -exec ls -lh {} \; | awk '{print $5}' | head -1)
        echo "   Main JS: $MAIN_JS"
    fi
else
    check_fail "Production build failed. Run: npm run build"
fi

# Check 6: Security headers
echo "6. Checking security headers configuration..."
if [ -f "public/_headers" ]; then
    check_pass "Security headers file exists"
    
    # Check for critical headers
    if grep -q "X-Frame-Options" public/_headers && \
       grep -q "Content-Security-Policy" public/_headers && \
       grep -q "Strict-Transport-Security" public/_headers; then
        check_pass "Critical security headers configured"
    else
        check_fail "Missing critical security headers"
    fi
else
    check_fail "Security headers file not found"
fi

# Check 7: PWA manifest
echo "7. Checking PWA configuration..."
if [ -f "dist/manifest.webmanifest" ]; then
    check_pass "PWA manifest generated"
else
    check_warn "PWA manifest not found (build again to generate)"
fi

# Check 8: Service worker
echo "8. Checking service worker..."
if [ -f "dist/registerSW.js" ]; then
    check_pass "Service worker registration found"
else
    check_warn "Service worker not found"
fi

# Check 9: Git status
echo "9. Checking Git status..."
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        UNCOMMITTED=$(git status --porcelain | wc -l)
        if [ "$UNCOMMITTED" -eq 0 ]; then
            check_pass "No uncommitted changes"
        else
            check_warn "$UNCOMMITTED uncommitted changes detected"
        fi
        
        # Check current branch
        BRANCH=$(git branch --show-current)
        if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
            check_pass "On main branch"
        else
            check_warn "Not on main branch (current: $BRANCH)"
        fi
    else
        check_warn "Not a git repository"
    fi
else
    check_warn "Git not installed"
fi

# Check 10: Package vulnerabilities
echo "10. Checking for security vulnerabilities..."
AUDIT_OUTPUT=$(npm audit --production 2>&1)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    check_pass "No security vulnerabilities found"
elif echo "$AUDIT_OUTPUT" | grep -q "critical"; then
    check_fail "Critical vulnerabilities found. Run: npm audit fix"
else
    check_warn "Some vulnerabilities found. Review with: npm audit"
fi

echo ""
echo "===================================="
echo "📊 Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo "🚀 Ready for deployment"
    echo ""
    echo "Next steps:"
    echo "  1. Review the warnings above (if any)"
    echo "  2. Commit and push your changes"
    echo "  3. Deploy via Lovable Publish button or:"
    echo "     - Netlify: netlify deploy --prod"
    echo "     - Vercel: vercel --prod"
    exit 0
else
    echo -e "${RED}✗ Deployment checks failed${NC}"
    echo "⚠️  Please fix the issues above before deploying"
    exit 1
fi
