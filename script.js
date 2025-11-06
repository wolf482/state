#!/bin/bash

# Corrected script with the right path
SHAREPOINT_URL="https://otshare.eur.citi.net"
SITE_PATH="/sites/SSM/Reports/VTM/SNOW_VR_Extract"
DOWNLOAD_DIR="./downloads"
LOG_FILE="./sharepoint_download.log"

# Clear previous log
> "$LOG_FILE"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

mkdir -p "$DOWNLOAD_DIR"

log "🚀 Starting SharePoint download with correct path"
log "📋 Using path: $SITE_PATH"

echo "🔍 Searching for latest file..."

for days_back in {0..7}; do
    date_str=$(date -d "$days_back days ago" +%Y_%m_%d)
    
    # Try both filename patterns (with and without space)
    filenames=(
        "Snow_VR_Extract_${date_str}.xlsb"
        "Snow_VR_Extract ${date_str}.xlsb"
    )
    
    for filename in "${filenames[@]}"; do
        # URL encode spaces if needed
        if [[ "$filename" == *" "* ]]; then
            encoded_filename=$(echo "$filename" | sed 's/ /%20/g')
        else
            encoded_filename="$filename"
        fi
        
        full_url="${SHAREPOINT_URL}${SITE_PATH}/${encoded_filename}"
        output_path="${DOWNLOAD_DIR}/Snow_VR_Extract_${date_str}.xlsb"  # Always save with underscores
        
        log "Checking: $filename"
        log "Full URL: $full_url"
        
        # Test if file exists
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -u "${USERNAME}:${PASSWORD}" --ntlm -I "$full_url")
        log "HTTP Response: $http_code"
        
        if [ "$http_code" -eq 200 ]; then
            log "✅ File exists! Downloading..."
            
            # Download the file
            if curl -f -u "${USERNAME}:${PASSWORD}" --ntlm -o "$output_path" "$full_url"; then
                file_size=$(stat -c%s "$output_path" 2>/dev/null || echo 0)
                
                if [ "$file_size" -gt 10000 ]; then
                    log "🎉 SUCCESS: Downloaded $filename"
                    log "📁 Saved as: $output_path"
                    log "📊 Size: $((file_size / 1024 / 1024)) MB"
                    
                    echo ""
                    echo "✅ Download completed!"
                    echo "📁 File: $output_path"
                    echo "📊 Size: $((file_size / 1024 / 1024)) MB"
                    exit 0
                else
                    log "❌ File too small, likely failed"
                    rm -f "$output_path"
                fi
            else
                log "❌ Download failed"
            fi
        fi
    done
done

log "❌ No file found in the last 7 days"
echo "❌ No file found in the last 7 days"
exit 1
