# Logo Setup Instructions

## Add Your Hospital Logo

Place your hospital logo file in this directory (`public/`) with the name:

```
logo.png
```

### Requirements:
- **File name:** `logo.png` (exactly, case-sensitive)
- **Location:** `clinic/frontend/frontend/public/logo.png`
- **Format:** PNG (recommended) or JPG
- **Size:** Recommended 200x200 pixels or larger
- **Background:** Transparent background preferred

### Example:
```
clinic/frontend/frontend/public/
  ├── logo.png          ← Your logo file here
  ├── index.html
  └── ...
```

### Fallback:
If `logo.png` is not found, the system will display a default "H" icon with a gradient background.

### Testing:
After adding the logo:
1. Restart your development server
2. Refresh the browser
3. The logo should appear in the sidebar

### Supported Formats:
- PNG (recommended for transparency)
- JPG/JPEG
- SVG (rename to logo.png or update code to use logo.svg)

---

**Current Status:** Logo file not found - using fallback icon
**Action Required:** Add `logo.png` to this directory
