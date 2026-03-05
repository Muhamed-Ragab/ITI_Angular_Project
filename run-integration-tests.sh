#!/bin/bash

# Integration Tests Runner
# This script runs all integration tests for services

echo "=================================="
echo "Running Integration Tests"
echo "=================================="
echo ""

echo "Testing Services:"
echo "  - CartService"
echo "  - OrderService"
echo "  - PaymentService"
echo ""

# Run tests
npm test -- --include='**/*.integration.spec.ts'

echo ""
echo "=================================="
echo "Integration Tests Complete"
echo "=================================="
