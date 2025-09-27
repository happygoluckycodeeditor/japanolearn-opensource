# 📄 Automatic License Attribution System

This project includes an automated system for generating open-source license attributions.

## 🚀 Quick Usage

### Generate/Update Attributions
```bash
npm run generate-attributions
```

This will:
- Scan all production dependencies 
- Generate a `licenses.json` file with complete license data
- Create `attribution-data.ts` with categorized attribution information
- Update the About page with current dependency information

### View in App
The attributions automatically appear in your About page with:
- ✅ **Interactive categories** (expandable/collapsible)
- ✅ **License distribution summary**
- ✅ **Direct links to repositories**
- ✅ **Publisher information**
- ✅ **Auto-update notification**

## 🛠️ How It Works

### Files Generated
- `licenses.json` - Raw license data from license-checker
- `src/renderer/src/components/attribution-data.ts` - Processed TypeScript data
- Updated About page component

### Dependencies Used
- **`license-checker-rseidelsohn`** - Enhanced license scanner
- **Custom categorization script** - Organizes packages by purpose

### Categories
- **Core Framework** - Electron, React, build tools
- **UI & Styling** - Tailwind, DaisyUI, UI components  
- **Core Functionality** - Database, routing, editors
- **Development Tools** - TypeScript, linting, formatting
- **Build & Deployment** - Packaging and distribution tools

## 📋 Benefits

✅ **Legal Compliance** - Properly attributes all dependencies
✅ **Automated Updates** - Always current with package changes  
✅ **Professional Appearance** - Clean, organized presentation
✅ **Zero Maintenance** - Updates automatically with dependency changes
✅ **Community Respect** - Shows appreciation for open-source work

## 🔧 Customization

Edit `scripts/generate-attributions.js` to:
- Add/modify package categories
- Customize package descriptions
- Change output format or styling
- Add additional metadata

## 🤖 CI Integration

Add to your build process:
```json
{
  "scripts": {
    "prebuild": "npm run generate-attributions && electron-vite build"
  }
}
```

This ensures attributions are always up-to-date in releases!

---

*This system automatically scans your package.json dependencies and generates proper attribution. No manual maintenance required!* 🎉