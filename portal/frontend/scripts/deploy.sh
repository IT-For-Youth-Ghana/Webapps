#!/bin/bash

# ITFY Portal Frontend Deployment Script
# This script handles deployment to various environments

set -e

# Configuration
APP_NAME="itfy-portal-frontend"
DOCKER_IMAGE="itfy-portal-frontend"
DOCKER_TAG=${DOCKER_TAG:-latest}
ENVIRONMENT=${ENVIRONMENT:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Error function
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Success function
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate environment
validate_environment() {
    log "Validating environment..."

    # Check if required commands exist
    local required_commands=("docker" "docker-compose" "curl")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            error "Required command '$cmd' not found"
        fi
    done

    # Check if .env file exists
    if [ ! -f ".env" ]; then
        error ".env file not found. Please copy .env.example to .env and configure"
    fi

    success "Environment validation passed"
}

# Build Docker image
build_image() {
    log "Building Docker image..."

    if [ "$SKIP_BUILD" = "true" ]; then
        log "Skipping build as requested"
        return 0
    fi

    docker build -t "$DOCKER_IMAGE:$DOCKER_TAG" .

    if [ $? -eq 0 ]; then
        success "Docker image built successfully"
    else
        error "Failed to build Docker image"
    fi
}

# Deploy locally with Docker Compose
deploy_local() {
    log "Deploying to local environment..."

    # Stop existing containers
    docker-compose down || true

    # Start services
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose --profile production up -d
    else
        docker-compose up -d
    fi

    success "Local deployment completed"
}

# Deploy to remote server (example for AWS/DigitalOcean)
deploy_remote() {
    local server=${REMOTE_SERVER:-}
    local user=${REMOTE_USER:-root}

    if [ -z "$server" ]; then
        error "REMOTE_SERVER environment variable not set"
    fi

    log "Deploying to remote server: $server"

    # Build and push image (assuming registry is configured)
    if [ "$PUSH_IMAGE" = "true" ]; then
        log "Pushing image to registry..."
        docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "registry.example.com/$DOCKER_IMAGE:$DOCKER_TAG"
        docker push "registry.example.com/$DOCKER_IMAGE:$DOCKER_TAG"
    fi

    # Deploy via SSH (example)
    ssh "$user@$server" << EOF
        cd /opt/itfy-portal/frontend
        docker-compose pull
        docker-compose down
        docker-compose --profile production up -d
        docker system prune -f
EOF

    success "Remote deployment completed"
}

# Health check
health_check() {
    local max_attempts=${HEALTH_CHECK_ATTEMPTS:-30}
    local attempt=1

    log "Performing health check..."

    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"

        if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Application is healthy"
            return 0
        fi

        sleep 10
        ((attempt++))
    done

    error "Health check failed after $max_attempts attempts"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."

    # Stop current deployment
    docker-compose down

    # Start previous version (if available)
    if [ -f "docker-compose.previous.yml" ]; then
        mv docker-compose.previous.yml docker-compose.yml
        docker-compose up -d
        success "Rollback completed"
    else
        error "No previous version available for rollback"
    fi
}

# Backup current deployment
backup_current() {
    log "Backing up current deployment..."

    # Backup docker-compose file
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml docker-compose.previous.yml
    fi

    # Backup environment file
    if [ -f ".env" ]; then
        cp .env .env.backup
    fi

    success "Backup completed"
}

# Main deployment function
main() {
    log "Starting deployment of $APP_NAME to $ENVIRONMENT environment"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment=*)
                ENVIRONMENT="${1#*=}"
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --push-image)
                PUSH_IMAGE=true
                shift
                ;;
            --remote)
                DEPLOY_REMOTE=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done

    # Handle rollback
    if [ "$ROLLBACK" = "true" ]; then
        rollback
        exit 0
    fi

    # Validate environment
    validate_environment

    # Backup current deployment
    backup_current

    # Build image
    build_image

    # Deploy
    if [ "$DEPLOY_REMOTE" = "true" ]; then
        deploy_remote
    else
        deploy_local
    fi

    # Health check
    health_check

    success "Deployment completed successfully!"
    log "Application is running at http://localhost:3000"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --environment=ENV    Set deployment environment (default: production)"
    echo "  --skip-build         Skip Docker image build"
    echo "  --push-image         Push image to registry"
    echo "  --remote             Deploy to remote server"
    echo "  --rollback           Rollback to previous version"
    echo ""
    echo "Environment variables:"
    echo "  REMOTE_SERVER        Remote server address for deployment"
    echo "  REMOTE_USER          SSH user for remote deployment (default: root)"
    echo "  DOCKER_TAG           Docker image tag (default: latest)"
    echo "  HEALTH_CHECK_ATTEMPTS Number of health check attempts (default: 30)"
}

# Handle help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
    exit 0
fi

# Run main function
main "$@"