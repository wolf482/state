#!/bin/bash

# Working script based on your successful curl command

BASE_PATH="/sites/SSM/Reports/VTM/SNOW_VR_Extract"
DOWNLOAD_DIR="./downloads"

mkdir -p "$DOWNLOAD_DIR"

echo "🔍 Searching for latest Snow_VR_Extract file..."

for days_back in {0..7}; do
    date_str=$(date -d "$days_back days ago" +%Y_%m_%d)
    filename="Snow_VR_Extract_${date_str}.xlsb"
    full_url="${SHAREPOINT_URL}${BASE_PATH}/${filename}"
    output_path="${DOWNLOAD_DIR}/${filename}"
    
    echo "Checking: $filename"
    
    # Use the exact curl format that worked for you
    if curl -u "${USERNAME}:${PASSWORD}" --ntlm --output "$output_path" "$full_url" 2>/dev/null; then
        file_size=$(stat -c%s "$output_path" 2>/dev/null || echo 0)
        if [ "$file_size" -gt 10000 ]; then
            echo "✅ SUCCESS: Downloaded $filename"
            echo "📁 Location: $output_path"
            echo "📊 Size: $((file_size / 1024 / 1024)) MB"
            exit 0
        else
            echo "File too small, removing..."
            rm -f "$output_path"
        fi
    else
        echo "Download failed for this date"
    fi
done

echo "❌ No file found in the last 7 days"
exit 1
