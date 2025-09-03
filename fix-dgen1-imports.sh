#!/bin/bash

# Script to fix GameSettings imports for dgen1 version
# This updates all scene files to conditionally load the correct GameSettings

echo "Fixing GameSettings imports for dgen1 version..."

# Create a new GameSettings loader that detects which version to use
cat > src/config/GameSettingsLoader.ts << 'EOF'
/**
 * GameSettings Loader
 * Automatically loads the correct settings based on build type
 */

// Check if this is a dgen1 build
const isDgen1 = window.location.hostname.includes('dgen1') || 
                window.location.search.includes('dgen1=true') ||
                window.location.port === '3001' ||
                (typeof DGEN1_BUILD !== 'undefined' && DGEN1_BUILD);

// Import the appropriate settings
let GameSettings: any;

if (isDgen1) {
  // Use dgen1 settings (720x720)
  GameSettings = require('./GameSettings.dgen1').default;
  console.log('📐 Loading dgen1 settings (720x720)');
} else {
  // Use default Remix settings
  GameSettings = require('./GameSettings').default;
  console.log('📐 Loading default Remix settings');
}

export default GameSettings;
EOF

echo "✅ Created GameSettingsLoader.ts"

# Now update all imports in scene files to use the loader
echo "Updating scene imports..."

# List of files to update
FILES=(
  "src/scenes/LoadingScene.ts"
  "src/scenes/SplashScene.ts"
  "src/scenes/InstructionsScene.ts"
  "src/scenes/GameScene.ts"
  "src/ui/MenuOverlay.ts"
)

# Update each file
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Replace the import statement
    sed -i '' 's|import GameSettings from "../config/GameSettings"|import GameSettings from "../config/GameSettingsLoader"|g' "$FILE"
    sed -i '' 's|import GameSettings from ".*/config/GameSettings"|import GameSettings from "../config/GameSettingsLoader"|g' "$FILE"
    echo "✅ Updated $FILE"
  fi
done

echo "🎉 All files updated!"
echo ""
echo "Now the game will automatically use:"
echo "- 720x720 settings when running on port 3001 (dgen1)"
echo "- Default settings when running normally"