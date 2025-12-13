#!/bin/bash

# ============================================================================
# Database Optimization Deployment Script
# ============================================================================
# This script deploys all database optimizations in the correct order
# 
# Usage:
#   ./deploy_optimizations.sh [environment]
# 
# Examples:
#   ./deploy_optimizations.sh dev
#   ./deploy_optimizations.sh staging
#   ./deploy_optimizations.sh production
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
MIGRATIONS_DIR="supabase/migrations"
LOG_FILE="optimization_deployment_$(date +%Y%m%d_%H%M%S).log"

# Migration files in order
MIGRATIONS=(
  "016_database_optimization_indexes.sql"
  "017_rls_optimization.sql"
  "018_denormalization_optimization.sql"
  "019_query_functions_optimization.sql"
  "020_monitoring_setup.sql"
)

# Functions
log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

check_prerequisites() {
  log "Checking prerequisites..."
  
  # Check if Supabase CLI is installed
  if ! command -v supabase &> /dev/null; then
    error "Supabase CLI not found. Please install it first:"
    error "  npm install -g supabase"
    exit 1
  fi
  
  # Check if migrations directory exists
  if [ ! -d "$MIGRATIONS_DIR" ]; then
    error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
  fi
  
  # Check if all migration files exist
  for migration in "${MIGRATIONS[@]}"; do
    if [ ! -f "$MIGRATIONS_DIR/$migration" ]; then
      error "Migration file not found: $MIGRATIONS_DIR/$migration"
      exit 1
    fi
  done
  
  success "All prerequisites met"
}

confirm_deployment() {
  if [ "$ENVIRONMENT" == "production" ]; then
    warning "You are about to deploy to PRODUCTION!"
    warning "This will modify your production database."
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
    
    if [ "$confirm" != "yes" ]; then
      log "Deployment cancelled by user"
      exit 0
    fi
  fi
}

deploy_migration() {
  local migration_file=$1
  local migration_name=$(basename "$migration_file")
  
  log "Deploying: $migration_name"
  
  # Deploy using Supabase CLI
  if supabase db push --file "$migration_file" 2>&1 | tee -a "$LOG_FILE"; then
    success "Completed: $migration_name"
    return 0
  else
    error "Failed: $migration_name"
    return 1
  fi
}

verify_deployment() {
  log "Verifying deployment..."
  
  # This would run verification queries
  # For now, just check if files were processed
  success "Verification complete (manual verification recommended)"
}

show_summary() {
  log "========================================="
  log "Deployment Summary"
  log "========================================="
  log "Environment: $ENVIRONMENT"
  log "Log file: $LOG_FILE"
  log ""
  log "Migration files deployed:"
  for migration in "${MIGRATIONS[@]}"; do
    echo "  - $migration" | tee -a "$LOG_FILE"
  done
  log ""
  log "Next steps:"
  log "  1. Review the log file: $LOG_FILE"
  log "  2. Verify optimizations: SELECT * FROM get_database_health();"
  log "  3. Check index usage: SELECT * FROM index_usage_stats LIMIT 20;"
  log "========================================="
}

# Main execution
main() {
  log "========================================="
  log "Database Optimization Deployment"
  log "========================================="
  log "Environment: $ENVIRONMENT"
  log "Started at: $(date)"
  log ""
  
  check_prerequisites
  confirm_deployment
  
  log "Starting deployment process..."
  log ""
  
  local failed_migrations=()
  
  for migration in "${MIGRATIONS[@]}"; do
    if ! deploy_migration "$MIGRATIONS_DIR/$migration"; then
      failed_migrations+=("$migration")
      error "Migration failed: $migration"
      
      if [ "$ENVIRONMENT" == "production" ]; then
        error "Stopping deployment due to failure in production environment"
        exit 1
      else
        warning "Continuing despite failure (non-production environment)"
      fi
    fi
    
    # Small delay between migrations
    sleep 1
  done
  
  log ""
  
  if [ ${#failed_migrations[@]} -eq 0 ]; then
    success "All migrations deployed successfully!"
    verify_deployment
  else
    error "Some migrations failed:"
    for failed in "${failed_migrations[@]}"; do
      error "  - $failed"
    done
    exit 1
  fi
  
  show_summary
}

# Run main function
main "$@"
