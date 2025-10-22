# ⚙️ Font Size Settings Feature

## Overview

The GUI now includes customizable font size settings with real-time adjustments and persistent storage.

## ✨ What Changed

### Default Font Sizes (Improved)
- **Main Heading**: Increased from 24px to **36px** (50% bigger)
- **Small Text**: Increased from 10px to **30px** (200% bigger / 3x)
- **Medium Text**: 18px (new size category)

### New Features
- ⚙️ **Settings Button** in header (next to theme toggle)
- **Settings Modal** with three sliders:
  - Main Heading Size (24px - 60px)
  - Small Text Size (10px - 40px)
  - Medium Text Size (12px - 30px)
- **Real-time Preview** as you adjust sliders
- **Reset to Defaults** button
- **Persistent Storage** (localStorage)

## 🎨 How to Use

### Access Settings
1. Click the **⚙️ gear icon** in the top-right header
2. Settings modal appears with three sliders

### Adjust Font Sizes
1. **Drag sliders** to change font sizes
2. Changes apply **immediately** to the interface
3. Current size displays next to each slider label
4. Min/max values shown below each slider

### Reset to Defaults
- Click **"RESET TO DEFAULTS"** button at bottom of settings
- Restores: Heading=36px, Small=30px, Medium=18px

### Close Settings
- Click **X** button in top-right of modal
- Or click outside the modal
- Settings are automatically saved

## 🔧 Technical Implementation

### CSS Variables
```css
:root[data-theme="dark"] {
  --heading-size: 36px;
  --small-text-size: 30px;
  --medium-text-size: 18px;
}
```

### Applied To
- **Heading Size**: `.title` (main "GAMEDEV MCP HUB" text)
- **Small Text Size**:
  - `.btn-small` (button text)
  - `.tab` (tab navigation)
  - `.connection-status` (connection text)
  - `.checkbox-label` (checkbox labels)
  - `.stat-title` (analytics card titles)
  - `.sidebar-title` (docs sidebar title)
  - `.footer` (footer text)
- **Medium Text Size**:
  - `.section-title` (section headings)
  - Other medium-sized text elements

### localStorage Keys
- `headingSize`: Number (24-60)
- `smallTextSize`: Number (10-40)
- `mediumTextSize`: Number (12-30)

### Functions
```javascript
// Open/close
openSettings()
closeSettings()

// Update sizes
updateHeadingSize(event)
updateSmallTextSize(event)
updateMediumTextSize(event)

// Reset and load
resetSettings()
loadSavedSettings()
```

## 📊 Size Constraints

### Main Heading
- **Min**: 24px (original size)
- **Default**: 36px (50% bigger)
- **Max**: 60px
- **Step**: 2px

### Small Text
- **Min**: 10px (original smallest)
- **Default**: 30px (3x original)
- **Max**: 40px
- **Step**: 2px

### Medium Text
- **Min**: 12px
- **Default**: 18px
- **Max**: 30px
- **Step**: 2px

## 🎯 Use Cases

### Accessibility
- **Increase** sizes for better readability
- **Decrease** sizes for more content on screen
- Customize per user preference

### Presentations
- **Increase** heading size for demos
- Balance text sizes for audience viewing

### Personal Preference
- Fine-tune to your comfort level
- Different sizes for different monitors
- Adjust based on lighting conditions

## 🔄 Upgrade Notes

### From Previous Version
- Settings automatically applied on first load
- Existing theme preference preserved
- New default sizes immediately visible
- No configuration needed

### Backwards Compatibility
- If no saved settings exist, defaults are used
- Old localStorage keys don't conflict
- Can reset to new defaults anytime

## 🐛 Troubleshooting

### Settings Not Saving
- Check browser localStorage is enabled
- Try clearing browser cache
- Check browser console for errors

### Sliders Not Responding
- Hard refresh: Ctrl+Shift+R
- Clear cache and reload
- Check JavaScript console for errors

### Text Too Small/Big
- Click "RESET TO DEFAULTS" in settings
- Or manually adjust sliders to preference

### Modal Won't Close
- Click X button
- Click outside modal area
- Press ESC key (if implemented)

## 📝 Future Enhancements

Potential additions:
- [ ] Body text size control
- [ ] Line height adjustment
- [ ] Letter spacing control
- [ ] Font family selection
- [ ] Per-tab size settings
- [ ] Keyboard shortcuts for settings
- [ ] Import/export settings
- [ ] Presets (compact/comfortable/large)

## 🎨 Modal Design

### Visual Style
- Retro 16-bit aesthetic matching theme
- Glowing sliders with hover effects
- Press Start 2P font for labels
- Color-coded values (secondary color)
- Smooth transitions

### Accessibility
- Clear labels for each slider
- Current value always visible
- Min/max indicators
- Easy-to-grab slider thumbs (24px)
- Keyboard accessible

## 💡 Tips

1. **Start with defaults**: New defaults are carefully chosen
2. **Small changes**: Adjust by 2-4px increments for subtle changes
3. **Test both themes**: Check sizes in dark and light mode
4. **Different screens**: Re-adjust when switching monitors
5. **Export**: Take a screenshot of your settings for reference

---

**Feature Status**: ✅ Complete and ready to use!  
**Added in**: Version 0.1.1  
**Build**: Latest (includes GUI settings)
