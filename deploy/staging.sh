#!/bin/bash

# Sudan Digital Identity System - Staging Deployment Script
# This script deploys the system to a staging environment for testing

set -e

echo "🇸🇩 Sudan Digital Identity System - Staging Deployment"
echo "=================================================="

# Configuration
NAMESPACE="sudan-identity"
DOCKER_REGISTRY="ghcr.io/sudan-gov"
IMAGE_NAME="digital-identity"
STAGING_TAG="staging"
KUBECONFIG_FILE="${KUBECONFIG_FILE:-~/.kube/config}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed. Please install docker first."
        exit 1
    fi
    
    # Check if kubeconfig exists
    if [ ! -f "$KUBECONFIG_FILE" ]; then
        log_error "Kubeconfig file not found at $KUBECONFIG_FILE"
        exit 1
    fi
    
    # Test kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Check your kubeconfig."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building Docker image for staging..."
    
    # Build the image
    docker build \
        --build-arg NODE_ENV=staging \
        --build-arg REACT_APP_OID_BASE=1.3.6.1.4.1.61026.1 \
        --build-arg REACT_APP_API_URL=https://staging-api.sudan.gov.sd \
        --build-arg REACT_APP_BLOCKCHAIN_NETWORK=sudan-testnet \
        --build-arg REACT_APP_BIOMETRIC_SERVICE_URL=https://staging-biometric.sudan.gov.sd \
        -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${STAGING_TAG} \
        .
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
    
    # Push the image
    log_info "Pushing image to registry..."
    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${STAGING_TAG}
    
    if [ $? -eq 0 ]; then
        log_success "Docker image pushed successfully"
    else
        log_error "Failed to push Docker image"
        exit 1
    fi
}

# Create namespace if it doesn't exist
create_namespace() {
    log_info "Setting up Kubernetes namespace..."
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_info "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f k8s/namespace.yaml
        log_success "Namespace $NAMESPACE created"
    fi
}

# Deploy ConfigMaps and Secrets
deploy_config() {
    log_info "Deploying configuration..."
    
    # Apply ConfigMap
    kubectl apply -f k8s/configmap.yaml
    
    # Apply Secrets (in production, use external secret management)
    kubectl apply -f k8s/secret.yaml
    
    log_success "Configuration deployed"
}

# Deploy RBAC
deploy_rbac() {
    log_info "Deploying RBAC configuration..."
    
    kubectl apply -f k8s/rbac.yaml
    
    log_success "RBAC configuration deployed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Update deployment image
    kubectl set image deployment/sudan-digital-identity \
        web=${DOCKER_REGISTRY}/${IMAGE_NAME}:${STAGING_TAG} \
        -n ${NAMESPACE} || kubectl apply -f k8s/deployment.yaml
    
    # Apply services
    kubectl apply -f k8s/service.yaml
    
    # Apply ingress
    kubectl apply -f k8s/ingress.yaml
    
    log_success "Application deployed"
}

# Wait for deployment to be ready
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    kubectl rollout status deployment/sudan-digital-identity -n ${NAMESPACE} --timeout=600s
    
    if [ $? -eq 0 ]; then
        log_success "Deployment is ready"
    else
        log_error "Deployment failed to become ready within timeout"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Get the service endpoint
    SERVICE_IP=$(kubectl get service sudan-digital-identity-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -z "$SERVICE_IP" ]; then
        # Fallback to port-forward for testing
        log_warning "LoadBalancer IP not available, using port-forward for health check"
        kubectl port-forward service/sudan-digital-identity-service 8080:80 -n ${NAMESPACE} &
        PORT_FORWARD_PID=$!
        sleep 5
        HEALTH_URL="http://localhost:8080/health"
    else
        HEALTH_URL="http://${SERVICE_IP}/health"
    fi
    
    # Check health endpoint
    for i in {1..10}; do
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            log_success "Health check passed"
            [ ! -z "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null
            return 0
        else
            log_warning "Health check attempt $i failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    [ ! -z "$PORT_FORWARD_PID" ] && kill $PORT_FORWARD_PID 2>/dev/null
    log_error "Health checks failed"
    return 1
}

# Display deployment information
display_info() {
    log_info "Deployment Information:"
    echo "========================"
    
    # Get pod status
    echo "Pods:"
    kubectl get pods -n ${NAMESPACE} -l app=sudan-digital-identity
    echo ""
    
    # Get service status
    echo "Services:"
    kubectl get services -n ${NAMESPACE}
    echo ""
    
    # Get ingress status
    echo "Ingress:"
    kubectl get ingress -n ${NAMESPACE}
    echo ""
    
    # Get deployment status
    echo "Deployment Status:"
    kubectl get deployment sudan-digital-identity -n ${NAMESPACE}
    echo ""
    
    # Display access URLs
    STAGING_URL=$(kubectl get ingress sudan-digital-identity-staging-ingress -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "staging.sudan-identity.gov.sd")
    echo "🌐 Staging URL: https://${STAGING_URL}"
    echo "📊 Monitoring: https://monitoring.sudan-identity.gov.sd"
    echo "🔍 Logs: kubectl logs -f deployment/sudan-digital-identity -n ${NAMESPACE}"
}

# Cleanup function for failed deployments
cleanup_on_failure() {
    log_error "Deployment failed. Cleaning up..."
    
    # Rollback deployment if it exists
    if kubectl get deployment sudan-digital-identity -n ${NAMESPACE} &> /dev/null; then
        kubectl rollout undo deployment/sudan-digital-identity -n ${NAMESPACE}
        log_info "Rolled back deployment"
    fi
}

# Main deployment function
main() {
    echo ""
    log_info "Starting staging deployment process..."
    echo ""
    
    # Set error handler
    trap cleanup_on_failure ERR
    
    # Run deployment steps
    check_prerequisites
    echo ""
    
    build_and_push_image
    echo ""
    
    create_namespace
    echo ""
    
    deploy_config
    echo ""
    
    deploy_rbac
    echo ""
    
    deploy_application
    echo ""
    
    wait_for_deployment
    echo ""
    
    if run_health_checks; then
        echo ""
        log_success "🎉 Staging deployment completed successfully!"
        echo ""
        display_info
    else
        log_error "Health checks failed. Please investigate."
        echo ""
        echo "Debug commands:"
        echo "- Check pods: kubectl get pods -n ${NAMESPACE}"
        echo "- Check logs: kubectl logs -f deployment/sudan-digital-identity -n ${NAMESPACE}"
        echo "- Check events: kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp'"
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy Sudan Digital Identity System to staging environment"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --dry-run      Show what would be deployed without actually deploying"
    echo "  --skip-build   Skip Docker build and push (use existing image)"
    echo ""
    echo "Environment Variables:"
    echo "  KUBECONFIG_FILE    Path to kubeconfig file (default: ~/.kube/config)"
    echo "  DOCKER_REGISTRY    Docker registry URL (default: ghcr.io/sudan-gov)"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        --dry-run)
            log_info "DRY RUN MODE - No actual deployment will occur"
            # Add dry-run logic here
            exit 0
            ;;
        --skip-build)
            log_info "Skipping Docker build step"
            build_and_push_image() {
                log_info "Skipping Docker build and push (using existing image)"
            }
            shift
            ;;
        *)
            log_error "Unknown option $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main

echo ""
log_success "🇸🇩 Sudan Digital Identity System staging deployment complete!"
echo ""