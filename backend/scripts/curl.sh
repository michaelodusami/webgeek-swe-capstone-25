#!/bin/bash

# =============================================================================
# FastAPI Backend - API Testing Script
# =============================================================================

# Configuration
BASE_URL="http://localhost:8000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${PURPLE}Testing: $description${NC}"
    echo -e "${BLUE}Endpoint: $method $endpoint${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    elif [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -d "$data" -X "$method" "$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        print_success "Status: $status_code"
        echo -e "${GREEN}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "Status: $status_code"
        echo -e "${RED}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    fi
}

# Function to test specific endpoint
test_specific_endpoint() {
    local endpoint_id=$1
    
    case $endpoint_id in
        # Welcome endpoint
        "welcome")
            make_request "GET" "$BASE_URL/" "null" "Welcome endpoint"
            ;;
        
        *)
            print_error "Unknown endpoint: $endpoint_id"
            print_info "Use 'list' to see all available endpoints"
            ;;
    esac
}

# Function to list all endpoints
list_all_endpoints() {
    echo -e "\n${CYAN}Available Endpoints:${NC}"
    echo -e "\n${BLUE}Welcome:${NC}"
    echo -e "  welcome - Welcome endpoint"
}

# Function to show main menu
show_main_menu() {
    echo -e "\n${CYAN}================================${NC}"
    echo -e "${CYAN}  FastAPI Backend API Testing${NC}"
    echo -e "${CYAN}================================${NC}"
    echo -e "${BLUE}Base URL: $BASE_URL${NC}"
    echo -e "\n${YELLOW}Select an option:${NC}"
    echo -e "1) Test welcome endpoint"
    echo -e "2) Test specific endpoint"
    echo -e "3) Change base URL"
    echo -e "4) Show current configuration"
    echo -e "5) List all endpoints"
    echo -e "0) Exit"
    echo -e "\n${YELLOW}Enter your choice:${NC} "
}

# Function to change base URL
change_base_url() {
    echo -e "\n${YELLOW}Current Base URL: $BASE_URL${NC}"
    echo -e "${BLUE}Enter new base URL (or press Enter to keep current):${NC} "
    read -r new_url
    if [ -n "$new_url" ]; then
        BASE_URL="$new_url"
        print_success "Base URL updated to: $BASE_URL"
    fi
}

# Function to show configuration
show_config() {
    echo -e "\n${CYAN}Current Configuration:${NC}"
    echo -e "${BLUE}Base URL:${NC} $BASE_URL"
}

# Main script logic
main() {
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl to use this script."
        exit 1
    fi
    
    # Check if jq is installed (optional, for pretty JSON output)
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. JSON responses will not be formatted."
    fi
    
    # If arguments are provided, run specific endpoint
    if [ $# -gt 0 ]; then
        if [ "$1" = "list" ]; then
            list_all_endpoints
            exit 0
        else
            test_specific_endpoint "$1"
            exit 0
        fi
    fi
    
    # Interactive menu
    while true; do
        show_main_menu
        read -r choice
        
        case $choice in
            1)
                # Test welcome endpoint
                test_specific_endpoint "welcome"
                ;;
            2)
                # Test specific endpoint
                echo -e "\n${BLUE}Enter endpoint ID (or 'list' to see all):${NC} "
                read -r endpoint_id
                if [ "$endpoint_id" = "list" ]; then
                    list_all_endpoints
                else
                    test_specific_endpoint "$endpoint_id"
                fi
                ;;
            3)
                change_base_url
                ;;
            4)
                show_config
                ;;
            5)
                list_all_endpoints
                ;;
            0)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read -r
    done
}

# Run main function
main "$@" 