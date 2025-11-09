#!/bin/bash

# OWASP ZAP Security Scan Script
# Tests for common vulnerabilities in FootprintIQ APIs

set -e

echo "🔒 Starting OWASP ZAP Security Scan..."

# Configuration
ZAP_PORT=8090
TARGET_URL="${VITE_SUPABASE_URL:-http://localhost:5173}"
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create report directory
mkdir -p "$REPORT_DIR"

# Check if ZAP is installed
if ! command -v zap-cli &> /dev/null; then
    echo "⚠️  OWASP ZAP CLI not found. Installing..."
    pip install --upgrade zaproxy
fi

echo "📡 Starting ZAP daemon on port $ZAP_PORT..."
zap-cli start --start-options "-daemon -port $ZAP_PORT" || true
sleep 5

echo "🎯 Target: $TARGET_URL"

# Open target URL
echo "🌐 Opening target URL..."
zap-cli open-url "$TARGET_URL"

# Spider the application
echo "🕷️  Spidering application..."
zap-cli spider "$TARGET_URL"

# Active scan
echo "🔍 Running active scan..."
zap-cli active-scan --recursive "$TARGET_URL"

# Wait for scan to complete
echo "⏳ Waiting for scan to complete..."
zap-cli status --timeout 300

# Generate reports
echo "📊 Generating security reports..."

# HTML Report
zap-cli report -o "$REPORT_DIR/zap-report-$TIMESTAMP.html" -f html

# JSON Report
zap-cli report -o "$REPORT_DIR/zap-report-$TIMESTAMP.json" -f json

# XML Report
zap-cli report -o "$REPORT_DIR/zap-report-$TIMESTAMP.xml" -f xml

# Get alerts
echo "🚨 Security Alerts Found:"
zap-cli alerts

# Check for high-risk vulnerabilities
HIGH_RISK=$(zap-cli alerts | grep -c "High" || echo "0")
MEDIUM_RISK=$(zap-cli alerts | grep -c "Medium" || echo "0")

echo ""
echo "📈 Scan Summary:"
echo "  High Risk: $HIGH_RISK"
echo "  Medium Risk: $MEDIUM_RISK"
echo ""

# Shutdown ZAP
echo "🛑 Shutting down ZAP..."
zap-cli shutdown

# Check results
if [ "$HIGH_RISK" -gt 0 ]; then
    echo "❌ High risk vulnerabilities found! Please review the report."
    echo "   Report: $REPORT_DIR/zap-report-$TIMESTAMP.html"
    exit 1
elif [ "$MEDIUM_RISK" -gt 5 ]; then
    echo "⚠️  Multiple medium risk vulnerabilities found."
    echo "   Report: $REPORT_DIR/zap-report-$TIMESTAMP.html"
    exit 1
else
    echo "✅ Security scan completed successfully!"
    echo "   Report: $REPORT_DIR/zap-report-$TIMESTAMP.html"
    exit 0
fi
