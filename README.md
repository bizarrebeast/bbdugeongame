# Bizarre Underground - Retro Endless Climber

## Overview

A retro-style endless climbing arcade game built with Phaser.js and TypeScript for the Remix platform. Climb through procedurally generated mining caverns, defeat colorful blob enemies, collect treasures, and chase high scores in this nostalgic underground adventure.

## Game Features

- 🎮 **Retro Arcade Gameplay**: Classic Donkey Kong-style climbing action with modern enhancements
- ⛏️ **Mining Theme**: Industrial underground setting with wooden ladders, mining equipment, and treasure
- 📱 **Mobile-Optimized**: 5:9 aspect ratio with full touch controls and virtual joystick
- 🎯 **Progressive Levels**: Discrete level system (1-100) then endless mode with increasing difficulty
- 👾 **Smart Enemy AI**: Four blob types (blue, yellow, green, red) with unique behaviors and chase AI
- 💎 **Rich Collectibles**: Coins, blue coins, diamonds, and treasure chests with automated opening
- 🎪 **Combat System**: Jump-to-kill mechanics with combo multipliers and score popups
- 🏆 **Scoring System**: Comprehensive point system with floor bonuses and achievement feedback

## Technical Features

- 🔧 **TypeScript**: Type-safe game development with Phaser.js integration
- 🔄 **Hot-Reload**: Development server with QR code for instant mobile testing
- 📦 **Optimized Build**: Single-file output ready for Remix platform deployment
- 🎨 **Debug Mode**: Hitbox visualization and development tools
- 🛡️ **Robust Architecture**: Clean codebase with modular systems and future theme support

## What You Need Before Starting

### For Complete Beginners:
1. **Node.js** - Download from [nodejs.org](https://nodejs.org) (choose the LTS version)
   - This includes `npm` (package manager) automatically
   - On Windows: Run the installer and follow the setup wizard
   - On Mac: Download the installer or use `brew install node`
   - On Linux: Use your package manager (e.g., `sudo apt install nodejs npm`)

2. **A Code Editor** - We recommend:
   - [Visual Studio Code](https://code.visualstudio.com) (free, beginner-friendly)
   - [Cursor](https://cursor.sh) (VS Code with built-in AI assistance)

3. **Basic Terminal/Command Line Knowledge**:
   - Windows: Use Command Prompt or PowerShell
   - Mac/Linux: Use Terminal
   - You'll need to navigate to folders and run commands

## ⚠️ Important Notes

- **Phaser.js is loaded from CDN**: The game framework is loaded in `index.html`, so Phaser is globally available. **Never add Phaser imports** to your TypeScript files - this will break your game.
- **Mobile-First**: This template is designed for vertical mobile games with a 5:9 aspect ratio.
- **One-Time Setup**: The setup command can only be run once per project for safety.

## Quick Start (Development)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone [repository-url] bizarre-underground
cd bizarre-underground

# Install dependencies
npm install
```

### Step 2: Start Development
```bash
npm run dev
```

**What happens:**
- Development server starts at `http://localhost:3000`
- A QR code appears in your terminal for mobile testing
- The browser opens automatically
- You'll see the full Bizarre Underground game
- File changes trigger automatic browser refresh

### Step 3: Test on Mobile
1. Make sure your phone is on the same Wi-Fi network as your computer
2. Scan the QR code that appears in your terminal
3. The game opens in your phone's browser
4. Test the touch controls and gameplay

## Game Controls

### Desktop
- **Movement**: Arrow keys or WASD
- **Jumping**: Spacebar
- **Climbing**: Up/Down near ladders
- **Door Activation**: UP key when near door to complete level
- **Debug**: Hitboxes visible when debug mode enabled

### Mobile
- **Movement**: Virtual joystick (left side)
- **Jumping**: Jump button (right side)
- **Climbing**: Joystick up/down near ladders
- **Door Activation**: Joystick up when near door to complete level
- **Multi-touch**: Supports simultaneous movement and jumping

<details>
<summary><strong>📦 Porting an Existing Game (Click to expand)</strong></summary>

If you have an existing game that you want to port to this starter template then follow these steps:

### Step 1: Complete the Quick Start Setup
Follow the Quick Start steps above to set up the template first.

### Step 2: Prepare Your Existing Game Code
1. Create a new folder in the project root called `src_prev` (as a sibling to the `src` folder):
   ```bash
   mkdir src_prev
   ```

2. Copy all your existing game files into the `src_prev` folder:
   ```
   your-project/
   ├── src/                    # New template structure
   ├── src_prev/           # Your existing game code
   │   ├── scenes/
   │   ├── objects/
   │   ├── assets/
   │   └── ... (all your existing files)
   └── ...
   ```

### Step 3: Ask Your LLM Assistant to Help Migrate
Once your existing code is in the `src_prev` folder, ask your AI assistant (like Claude Code) to help you migrate:

> "I have an existing Phaser.js game in the `src_prev` folder that I want to port to this Remix template. Please help me migrate the code into the proper `src` structure, ensuring it works with the 5:9 aspect ratio and Remix platform requirements. Please analyze my existing game structure and guide me through the migration process."

### ⚠️ Important Migration Reality Check:
**Things WILL break during migration!** This is completely normal and expected. Game porting is an iterative process that requires multiple rounds of fixes:

- **Expect compilation errors** - TypeScript and build issues are common
- **Expect runtime crashes** - Games may not start immediately after migration
- **Expect visual/gameplay issues** - Aspect ratio changes affect game layout
- **Be prepared for multiple LLM conversations** - You'll need to ask follow-up questions like:
  - "Fix this TypeScript error: [paste error]"
  - "The game crashes with this error: [paste error]"
  - "Help me adjust the UI layout for 5:9 aspect ratio"
  - "My touch controls aren't working, can you help?"

**Migration is a collaborative process** - Plan to spend time working with your AI assistant to resolve issues step by step. Don't expect a perfect one-shot migration.

### Migration Considerations:
- **Aspect Ratio**: Your game will need to adapt to the 5:9 mobile format
- **Asset Loading**: Assets may need to be restructured for the build process
- **Phaser Imports**: Remove any Phaser imports since it's loaded globally via CDN
- **Platform Integration**: Add Remix SDK integration for platform features
- **Mobile Optimization**: Ensure touch controls and mobile performance

### Step 4: Clean Up
After successful migration, you can remove the `src_prev` folder:
```bash
rm -rf src_prev
```

**💡 Pro Tip**: Keep your original game backup in a separate location until you're confident the migration is complete and working properly.

</details>

## Game Architecture

### Project Structure
```
bizarre-underground/
├── index.html             # Main HTML file - loads Phaser and Remix SDK
├── package.json           # Project configuration and commands
├── gameplan.md           # Complete game design document
├── src/                   # Game source code
│   ├── main.ts           # Game entry point - creates Phaser game
│   ├── config/
│   │   └── GameSettings.ts # Game settings (canvas size, debug mode, etc.)
│   ├── scenes/
│   │   └── GameScene.ts   # Main game scene with all gameplay logic
│   ├── objects/           # Game objects and entities
│   │   ├── Player.ts     # Player character with enhanced collision
│   │   ├── Door.ts       # Mining-themed level completion doors
│   │   ├── Cat.ts        # Enemy blob system (4 color variants)
│   │   ├── Coin.ts       # Collectible coin system
│   │   ├── TreasureChest.ts # Interactive treasure chests
│   │   └── TouchControls.ts # Mobile virtual joystick
│   ├── systems/           # Game systems and managers
│   │   └── LevelManager.ts # Level progression and configuration
│   ├── utils/
│   │   └── RemixUtils.ts  # Remix platform integration
│   └── types.ts          # TypeScript type definitions
├── scripts/               # Build and development scripts
└── dist/                 # Built game files (created when you run build)
```

### Key Game Systems:
- **`GameScene.ts`**: Complete gameplay logic with Mining Theme background
- **`Player.ts`**: Enhanced player with 28×55 pixel hitbox for forgiving collision
- **`LevelManager.ts`**: Progressive difficulty system (levels 1-100, then endless)
- **`Cat.ts`**: Smart enemy AI system with four behavioral patterns
- **`Door.ts`**: Industrial mining-themed doors with wooden panels and hardware

## Available Commands

```bash
npm install      # Install dependencies (first time setup)
npm run dev      # Start development server (most common)
npm run dev:3001 # Start server on port 3001 (if 3000 is busy)
npm run dev:any  # Start server on random available port
npm run build    # Build for production (creates dist/index.html)
npm run preview  # Preview the built game locally
```

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Edit Game Logic**: Modify files in `src/` folder
3. **Test Gameplay**: Browser refreshes automatically with changes
4. **Mobile Testing**: Scan QR code with phone to test touch controls
5. **Debug**: Use debug mode for hitbox visualization
6. **Build for Production**: `npm run build` when ready
7. **Deploy**: Copy contents of `dist/index.html` to Remix platform

## Game Development Guide

### Adding New Features
- **New Enemies**: Create in `src/objects/` following the Cat.ts pattern
- **New Collectibles**: Add to collectible system in GameScene.ts
- **Visual Themes**: Duplicate Mining Theme background system for new themes
- **Game Mechanics**: Extend GameScene.ts with new systems

### Testing
- **Level 1**: Has all collectible types enabled for testing
- **Debug Mode**: Shows player and enemy hitboxes
- **Mobile Controls**: Virtual joystick supports multi-touch gameplay

## Troubleshooting

### Common Issues:

**"Command not found: npm"**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart your terminal after installation

**"npm run remix-setup fails"**
- Make sure you're in the correct folder (should contain `package.json`)
- Check that the `.is_fresh` file exists (if missing, you may have already run setup)

**"Port 3000 is already in use"**
- Use `npm run dev:3001` or `npm run dev:any` for different ports
- Or stop other servers using port 3000

**"Game doesn't load on mobile"**
- Ensure your phone and computer are on the same Wi-Fi network
- Try refreshing the page or scanning the QR code again
- Check that no firewall is blocking the connection

**"TypeScript errors about Phaser"**
- Never import Phaser in your TypeScript files
- Phaser is loaded globally via CDN in `index.html`
- Remove any `import Phaser from 'phaser'` lines
- You can ask your LLM to resolve this for you

### Building for Production
```bash
npm run build
```
This creates `dist/index.html` - a single file containing your entire game ready for Remix deployment.

## Deployment to Remix

1. **Build**: Run `npm run build`
2. **Copy**: Open `dist/index.html` and copy all contents
3. **Paste**: Paste into Remix platform
4. **Test**: Verify everything works on the platform
5. **Publish**: Release your game to players

## What's Included

### Game Features
- **Complete Arcade Game**: Fully playable retro climbing adventure
- **Mining Theme**: Industrial underground setting with detailed visuals
- **Progressive Gameplay**: 100 discrete levels plus endless mode
- **Smart Enemy AI**: Four blob types with unique behavioral patterns
- **Enhanced Collision**: Forgiving hitbox system for better gameplay feel
- **Mobile Optimized**: Full touch controls with virtual joystick

### Technology Stack
- **Phaser.js**: HTML5 game framework loaded via CDN
- **TypeScript**: Type-safe game development
- **Vite**: Fast build tool and hot-reload dev server
- **Remix SDK**: Platform integration for deployment
- **Responsive Design**: 5:9 aspect ratio optimized for mobile screens

### Development Tools
- **Debug Mode**: Hitbox visualization and development aids
- **QR Code Testing**: Instant mobile testing via terminal QR codes
- **Hot Reload**: Automatic browser refresh on code changes
- **Single-File Build**: Optimized dist/index.html for easy deployment

## Getting Help

- **Documentation**: See `gameplan.md` for complete game design details
- **Issues**: Copy any error output when asking for help
- **Community**: Join the [Remix Discord Server](https://discord.com/invite/a3bgdr4RC6)

## License

MIT License - See LICENSE file for details
