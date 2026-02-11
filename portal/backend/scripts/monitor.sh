#!/bin/bash

# ITFY Portal Backend Monitoring Script
# This script provides comprehensive monitoring for production deployment

set -e

# Configuration
APP_NAME="itfy-portal-backend"
LOG_FILE="/var/log/itfy-portal/monitor.log"
HEALTH_URL="http://localhost:5000/health"
DETAILED_HEALTH_URL="http://localhost:5000/health/detailed"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check application health
check_health() {
    log "Checking application health..."

    if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Application is unhealthy${NC}"
        return 1
    fi
}

# Check detailed health
check_detailed_health() {
    log "Checking detailed application health..."

    if command_exists jq; then
        response=$(curl -s "$DETAILED_HEALTH_URL" 2>/dev/null)
        if [ $? -eq 0 ]; then
            status=$(echo "$response" | jq -r '.status' 2>/dev/null)
            if [ "$status" = "healthy" ]; then
                echo -e "${GREEN}✓ All services are healthy${NC}"

                # Check individual services
                echo "$response" | jq -r '.services[] | "\(.name): \(.status)"' 2>/dev/null | while read -r service; do
                    if [[ $service == *"healthy"* ]]; then
                        echo -e "${GREEN}  ✓ $service${NC}"
                    else
                        echo -e "${RED}  ✗ $service${NC}"
                    fi
                done
                return 0
            else
                echo -e "${RED}✗ Services have issues${NC}"
                return 1
            fi
        else
            echo -e "${YELLOW}⚠ Could not parse detailed health response${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ jq not installed, skipping detailed health check${NC}"
        return 0
    fi
}

# Check PM2 status
check_pm2() {
    if command_exists pm2; then
        log "Checking PM2 status..."

        pm2_status=$(pm2 jlist | jq -r '.[] | select(.name == "'$APP_NAME'") | .pm2_env.status' 2>/dev/null)

        if [ "$pm2_status" = "online" ]; then
            echo -e "${GREEN}✓ PM2 process is online${NC}"

            # Get process info
            pm2_info=$(pm2 jlist | jq -r '.[] | select(.name == "'$APP_NAME'") | "\(.pid) \(.pm2_env.restart_time) \(.monit.memory) \(.monit.cpu)"' 2>/dev/null)
            read -r pid restarts memory cpu <<< "$pm2_info"

            echo -e "${BLUE}  PID: $pid${NC}"
            echo -e "${BLUE}  Restarts: $restarts${NC}"
            echo -e "${BLUE}  Memory: $((memory / 1024 / 1024))MB${NC}"
            echo -e "${BLUE}  CPU: ${cpu}%${NC}"

            return 0
        else
            echo -e "${RED}✗ PM2 process is not online (status: $pm2_status)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ PM2 not found, skipping PM2 check${NC}"
        return 0
    fi
}

# Check Docker containers
check_docker() {
    if command_exists docker && docker info >/dev/null 2>&1; then
        log "Checking Docker containers..."

        containers=("itfy-portal-api" "itfy-portal-postgres" "itfy-portal-redis")

        all_healthy=true
        for container in "${containers[@]}"; do
            if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "^${container}"; then
                status=$(docker inspect "$container" --format='{{.State.Health.Status}}' 2>/dev/null)
                if [ "$status" = "healthy" ]; then
                    echo -e "${GREEN}✓ $container is healthy${NC}"
                else
                    echo -e "${RED}✗ $container status: $status${NC}"
                    all_healthy=false
                fi
            else
                echo -e "${RED}✗ $container is not running${NC}"
                all_healthy=false
            fi
        done

        if $all_healthy; then
            return 0
        else
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ Docker not available, skipping Docker check${NC}"
        return 0
    fi
}

# Check system resources
check_system() {
    log "Checking system resources..."

    # CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_usage=${cpu_usage%.*}

    if [ "$cpu_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ CPU usage: ${cpu_usage}%${NC}"
    else
        echo -e "${RED}✗ High CPU usage: ${cpu_usage}%${NC}"
    fi

    # Memory usage
    mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$mem_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ Memory usage: ${mem_usage}%${NC}"
    else
        echo -e "${RED}✗ High memory usage: ${mem_usage}%${NC}"
    fi

    # Disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ Disk usage: ${disk_usage}%${NC}"
    else
        echo -e "${RED}✗ High disk usage: ${disk_usage}%${NC}"
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."

    if command_exists pg_isready; then
        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
            echo -e "${GREEN}✓ PostgreSQL is accessible${NC}"
            return 0
        else
            echo -e "${RED}✗ PostgreSQL is not accessible${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ pg_isready not available, skipping database check${NC}"
        return 0
    fi
}

# Check Redis connectivity
check_redis() {
    log "Checking Redis connectivity..."

    if command_exists redis-cli; then
        if redis-cli ping >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Redis is accessible${NC}"
            return 0
        else
            echo -e "${RED}✗ Redis is not accessible${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ redis-cli not available, skipping Redis check${NC}"
        return 0
    fi
}

# Main monitoring function
main() {
    echo -e "${BLUE}=== ITFY Portal Backend Monitoring ===${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo

    failed_checks=0

    check_health || ((failed_checks++))
    echo
    check_detailed_health || ((failed_checks++))
    echo
    check_pm2 || ((failed_checks++))
    echo
    check_docker || ((failed_checks++))
    echo
    check_system || ((failed_checks++))
    echo
    check_database || ((failed_checks++))
    echo
    check_redis || ((failed_checks++))
    echo

    if [ $failed_checks -eq 0 ]; then
        echo -e "${GREEN}✓ All checks passed${NC}"
        exit 0
    else
        echo -e "${RED}✗ $failed_checks check(s) failed${NC}"
        exit 1
    fi
}

# Run main function
main "$@"