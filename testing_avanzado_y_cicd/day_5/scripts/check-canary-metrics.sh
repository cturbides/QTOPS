#!/bin/bash

# Canary Metrics Checker
# Usage: ./check-canary-metrics.sh [percentage] [duration]

set -e

CANARY_PERCENTAGE=${1:-5}
CHECK_DURATION=${2:-300}  # 5 minutes default
PROMETHEUS_URL=${PROMETHEUS_URL:-"http://prometheus:9090"}

echo "📊 Checking Canary metrics for ${CANARY_PERCENTAGE}% deployment..."
echo "⏱️  Duration: ${CHECK_DURATION}s"

# Thresholds
SUCCESS_RATE_THRESHOLD=99.5
LATENCY_P99_THRESHOLD=1000  # 1 second
ERROR_RATE_THRESHOLD=0.5

# Function to query Prometheus
query_prometheus() {
    local query=$1
    local result
    
    result=$(curl -s -G "$PROMETHEUS_URL/api/v1/query" \
        --data-urlencode "query=$query" | \
        jq -r '.data.result[0].value[1] // "0"')
    
    echo "$result"
}

# Function to check success rate
check_success_rate() {
    local query="sum(rate(http_requests_total{service=\"api-gateway\",status!~\"5..\"}[5m])) / sum(rate(http_requests_total{service=\"api-gateway\"}[5m])) * 100"
    local success_rate
    
    success_rate=$(query_prometheus "$query")
    
    echo "✅ Success Rate: ${success_rate}%"
    
    if (( $(echo "$success_rate >= $SUCCESS_RATE_THRESHOLD" | bc -l) )); then
        echo "✅ Success rate is healthy (>= ${SUCCESS_RATE_THRESHOLD}%)"
        return 0
    else
        echo "❌ Success rate is below threshold (${SUCCESS_RATE_THRESHOLD}%)"
        return 1
    fi
}

# Function to check latency
check_latency() {
    local query="histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service=\"api-gateway\"}[5m])) by (le)) * 1000"
    local latency_p99
    
    latency_p99=$(query_prometheus "$query")
    
    echo "⏱️  P99 Latency: ${latency_p99}ms"
    
    if (( $(echo "$latency_p99 <= $LATENCY_P99_THRESHOLD" | bc -l) )); then
        echo "✅ Latency is healthy (<= ${LATENCY_P99_THRESHOLD}ms)"
        return 0
    else
        echo "❌ Latency is above threshold (${LATENCY_P99_THRESHOLD}ms)"
        return 1
    fi
}

# Function to check error rate
check_error_rate() {
    local query="sum(rate(http_requests_total{service=\"api-gateway\",status=~\"5..\"}[5m])) / sum(rate(http_requests_total{service=\"api-gateway\"}[5m])) * 100"
    local error_rate
    
    error_rate=$(query_prometheus "$query")
    
    echo "🚨 Error Rate: ${error_rate}%"
    
    if (( $(echo "$error_rate <= $ERROR_RATE_THRESHOLD" | bc -l) )); then
        echo "✅ Error rate is healthy (<= ${ERROR_RATE_THRESHOLD}%)"
        return 0
    else
        echo "❌ Error rate is above threshold (${ERROR_RATE_THRESHOLD}%)"
        return 1
    fi
}

# Function to check business metrics
check_business_metrics() {
    echo "📈 Checking business metrics..."
    
    # Course creation rate
    local course_creation_query="sum(rate(course_created_total[5m]))"
    local course_creation_rate
    course_creation_rate=$(query_prometheus "$course_creation_query")
    echo "📚 Course creation rate: ${course_creation_rate}/min"
    
    # Active users
    local active_users_query="sum(active_users)"
    local active_users
    active_users=$(query_prometheus "$active_users_query")
    echo "👥 Active users: ${active_users}"
    
    return 0
}

# Main monitoring loop
echo "🔍 Starting Canary monitoring..."
START_TIME=$(date +%s)
END_TIME=$((START_TIME + CHECK_DURATION))

FAILURE_COUNT=0
MAX_FAILURES=3

while [ $(date +%s) -lt $END_TIME ]; do
    echo ""
    echo "📊 Metrics check at $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check all metrics
    if check_success_rate && check_latency && check_error_rate; then
        echo "✅ All metrics are healthy"
        check_business_metrics
        FAILURE_COUNT=0
    else
        echo "❌ Some metrics are unhealthy"
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
        
        if [ $FAILURE_COUNT -ge $MAX_FAILURES ]; then
            echo "🚨 CRITICAL: Too many metric failures ($FAILURE_COUNT/$MAX_FAILURES)"
            echo "🛑 Canary deployment should be rolled back!"
            exit 1
        fi
    fi
    
    # Calculate remaining time
    CURRENT_TIME=$(date +%s)
    REMAINING_TIME=$((END_TIME - CURRENT_TIME))
    
    if [ $REMAINING_TIME -gt 0 ]; then
        echo "⏳ Continuing monitoring... ${REMAINING_TIME}s remaining"
        sleep 30
    fi
done

echo ""
echo "🎉 Canary monitoring completed successfully!"
echo "📊 Final metrics summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Final check
if check_success_rate && check_latency && check_error_rate; then
    echo "✅ Canary deployment is healthy and ready for promotion!"
    exit 0
else
    echo "❌ Canary deployment has issues and should be rolled back!"
    exit 1
fi
