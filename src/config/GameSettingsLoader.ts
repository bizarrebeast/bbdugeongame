/**
 * GameSettings Loader
 * Automatically loads the correct settings based on build type
 */

import GameSettingsDgen1 from './GameSettings.dgen1';
import GameSettingsDefault from './GameSettings';

// Check if this is a dgen1 build
const isDgen1 = window.location.hostname.includes('dgen1') || 
                window.location.search.includes('dgen1=true') ||
                window.location.port === '3001' ||
                (typeof (window as any).DGEN1_BUILD !== 'undefined' && (window as any).DGEN1_BUILD);

// Select the appropriate settings
const GameSettings = isDgen1 ? GameSettingsDgen1 : GameSettingsDefault;

if (isDgen1) {
  console.log('📐 Loading dgen1 settings (720x720)');
} else {
  console.log('📐 Loading default Remix settings');
}

export default GameSettings;