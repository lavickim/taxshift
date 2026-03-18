#!/bin/bash

# MoneyShift Chrome Extension PNG Icon Generator
# This script creates simple PNG icons using ImageMagick or creates placeholder images

ICONS_DIR="$(dirname "$0")/../assets/icons"
cd "$ICONS_DIR"

echo "🎨 Creating PNG icons for MoneyShift Chrome Extension..."

# Check if ImageMagick is available
if command -v convert >/dev/null 2>&1; then
    echo "✅ ImageMagick found, converting SVG to PNG..."
    
    # Convert SVG files to PNG
    for size in 16 32 48 128; do
        if [ -f "icon${size}.svg" ]; then
            convert "icon${size}.svg" "icon${size}.png"
            echo "✅ Converted icon${size}.svg to PNG"
        fi
    done
    
else
    echo "⚠️  ImageMagick not found, creating simple colored squares as placeholders..."
    
    # Create simple colored squares using base64 encoded 1x1 pixel images
    # This is a fallback method that creates minimal but functional icons
    
    # Create 16x16 icon
    echo "Creating 16x16 icon..."
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\x08\x02\x00\x00\x00\x90\x91h6\x00\x00\x00\tpHYs\x00\x00.#\x00\x00.#\x01x\xa5?v\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\xc9e<\x00\x00\x00\x12IDATx\xdab\xf8\x0f\x00\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > icon16_temp.png
    
    # Create a more sophisticated icon using a simple method
    create_simple_icon() {
        local size=$1
        local filename="icon${size}.png"
        
        # Create a simple 1x1 blue pixel and then scale it
        printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00.#\x00\x00.#\x01x\xa5?v\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\x00\x00\x00\x03\x00\x01\x8e\x1e\x1d\x9e\x00\x00\x00\x00IEND\xaeB`\x82' > "${filename}"
        echo "✅ Created simple ${filename}"
    }
    
    # Create icons for each size
    for size in 16 32 48 128; do
        create_simple_icon $size
    done
fi

echo "🎉 PNG icon generation completed!"
echo ""
echo "📁 Generated files in $ICONS_DIR:"
ls -la *.png 2>/dev/null || echo "   (PNG files will be created during extension loading)"

echo ""
echo "💡 If you see placeholder icons, install ImageMagick to generate proper icons:"
echo "   macOS: brew install imagemagick"
echo "   Ubuntu: sudo apt-get install imagemagick"