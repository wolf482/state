#!/bin/bash

SHAREPOINT_URL="https://otshare.eur.citi.net"
FILE_PATH="/sites/SSM/Reports/VTM/SNOW_VR_Extract/Snow_VR_Extract%202025_11_04.xlsb"
DOWNLOAD_DIR="./downloads"

mkdir -p "$DOWNLOAD_DIR"

full_url="${SHAREPOINT_URL}${FILE_PATH}"
output_path="${DOWNLOAD_DIR}/Snow_VR_Extract_2025_11_04.xlsb"

echo "Testing different authentication methods..."

# Method 1: NTLM with verbose output
echo "1. Trying NTLM authentication..."
curl -v -u "${USERNAME}:${PASSWORD}" --ntlm -o "$output_path" "$full_url"

if [ $? -eq 0 ]; then
    echo "✅ NTLM worked!"
    exit 0
fi

# Method 2: Basic authentication
echo "2. Trying Basic authentication..."
curl -v -u "${USERNAME}:${PASSWORD}" --basic -o "$output_path" "$full_url"

if [ $? -eq 0 ]; then
    echo "✅ Basic auth worked!"
    exit 0
fi

# Method 3: Negotiate (Kerberos)
echo "3. Trying Negotiate authentication..."
curl -v -u "${USERNAME}:${PASSWORD}" --negotiate -o "$output_path" "$full_url"

if [ $? -eq 0 ]; then
    echo "✅ Negotiate worked!"
    exit 0
fi

echo "❌ All authentication methods failed"
