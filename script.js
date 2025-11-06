#!/bin/bash

# Configuration
SHAREPOINT_URL="https://otshare.eur.citi.net"
SITE_PATH="/sites/SSM"
DOWNLOAD_DIR="./downloads"
USERNAME="ye89463"
PASSWORD="Adminadmin29595%"
LOG_FILE="./sharepoint_download.log"

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Create download directory
mkdir -p "$DOWNLOAD_DIR"

# Find and download latest file
find_latest_file() {
    log "Searching for latest Snow_VR_Extract file..."
    
    for days_back in {0..7}; do
        date_str=$(date -d "$days_back days ago" +%Y_%m_%d)
        filename="Snow_VR_Extract_${date_str}.xlsb"
        full_url="${SHAREPOINT_URL}${SITE_PATH}/${filename}"
        output_path="${DOWNLOAD_DIR}/${filename}"
        
        log "Checking: $filename"
        
        # Try to download with curl and NTLM auth
        if curl -s -f -u "${USERNAME}:${PASSWORD}" --ntlm \
           -o "$output_path" "$full_url" > /dev/null 2>&1; then
            
            # Verify file was actually downloaded (not an error page)
            file_size=$(stat -c%s "$output_path" 2>/dev/null || echo 0)
            if [ "$file_size" -gt 10000 ]; then  # Assuming real file > 10KB
                log "✅ SUCCESS: Downloaded $filename ($((file_size/1024/1024)) MB)"
                echo "$filename"
                return 0
            else
                rm -f "$output_path"
                log "File too small, likely an error page"
            fi
        fi
    done
    
    log "❌ ERROR: No valid Snow_VR_Extract file found in the last 7 days"
    return 1
}

# Main execution
main() {
    log "Starting SharePoint download with NTLM authentication"
    
    latest_file=$(find_latest_file)
    if [ $? -eq 0 ]; then
        log "Download completed: $latest_file"
    else
        log "Download failed"
        exit 1
    fi
}

main
