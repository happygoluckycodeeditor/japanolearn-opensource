#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

/**
 * Automatic License Attribution Generator
 * This script generates an attribution section for your About.tsx component
 */

// Configuration
const OUTPUT_FILE = path.join(__dirname, '../src/renderer/src/components/attribution-data.ts')
const LICENSES_FILE = path.join(__dirname, '../licenses.json')

// Main dependencies to highlight (these will be shown prominently)
const MAIN_DEPENDENCIES = [
  'electron',
  'react',
  'react-dom',
  'electron-vite',
  'tailwindcss',
  'daisyui',
  'better-sqlite3',
  'react-router-dom',
  'react-joyride',
  'quill',
  'react-quill',
  'recharts',
  'typescript',
  'vite',
  'eslint',
  'prettier'
]

// Categories for organization
const CATEGORIES = {
  'Core Framework': [
    'electron',
    'react',
    'react-dom',
    'electron-vite',
    '@electron-toolkit/preload',
    '@electron-toolkit/utils'
  ],
  'UI & Styling': ['tailwindcss', 'daisyui', 'react-confetti', 'react-responsive-masonry'],
  'Core Functionality': [
    'better-sqlite3',
    'react-router-dom',
    'react-joyride',
    'quill',
    'react-quill',
    'recharts',
    'react-youtube'
  ],
  'Development Tools': ['typescript', 'vite', 'eslint', 'prettier', 'autoprefixer', 'postcss'],
  'Build & Deployment': ['electron-builder', 'electron-updater']
}

function generateLicensesFile() {
  console.log('🔍 Generating licenses file...')
  try {
    execSync('npx license-checker-rseidelsohn --json --production --out licenses.json', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })
    console.log('✅ Licenses file generated successfully')
  } catch (error) {
    console.error('❌ Error generating licenses file:', error.message)
    process.exit(1)
  }
}

function loadLicenses() {
  if (!fs.existsSync(LICENSES_FILE)) {
    console.log('📄 Licenses file not found, generating...')
    generateLicensesFile()
  }

  const licensesData = JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf8'))
  return licensesData
}

function getPackageName(fullName) {
  // Extract package name without version (e.g., "react@18.3.1" -> "react")
  return fullName.split('@')[0] || fullName.split('@').slice(0, -1).join('@')
}

function categorizePackages(licenses) {
  const categorized = {}
  const uncategorized = []

  // Initialize categories
  Object.keys(CATEGORIES).forEach((category) => {
    categorized[category] = []
  })

  // Categorize packages
  Object.keys(licenses).forEach((packageFullName) => {
    const packageName = getPackageName(packageFullName)
    const packageData = licenses[packageFullName]

    let categoryFound = false

    for (const [categoryName, packages] of Object.entries(CATEGORIES)) {
      if (packages.some((pkg) => packageName.includes(pkg) || pkg.includes(packageName))) {
        categorized[categoryName].push({
          name: packageName,
          fullName: packageFullName,
          ...packageData
        })
        categoryFound = true
        break
      }
    }

    if (!categoryFound && MAIN_DEPENDENCIES.includes(packageName)) {
      uncategorized.push({
        name: packageName,
        fullName: packageFullName,
        ...packageData
      })
    }
  })

  return { categorized, uncategorized }
}

function getGitHubUrl(repository) {
  if (!repository) return null

  // Handle different repository URL formats
  let url = repository
  if (typeof repository === 'object' && repository.url) {
    url = repository.url
  }

  // Clean up git URLs
  url = url.replace('git+', '').replace('.git', '').replace('git://', 'https://')

  // Ensure it's a GitHub URL
  if (url.includes('github.com')) {
    return url
  }

  return null
}

function generateAttributionData(licenses) {
  const { categorized } = categorizePackages(licenses)

  const attributionData = {}

  Object.entries(categorized).forEach(([categoryName, packages]) => {
    if (packages.length === 0) return

    attributionData[categoryName] = packages
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((pkg) => ({
        name: pkg.name,
        description: getPackageDescription(pkg.name),
        license: pkg.licenses || 'Unknown',
        repository: getGitHubUrl(pkg.repository),
        publisher: pkg.publisher
      }))
  })

  return attributionData
}

function getPackageDescription(packageName) {
  const descriptions = {
    electron: 'Cross-platform desktop app framework',
    react: 'UI library for building user interfaces',
    'react-dom': 'React DOM rendering',
    'electron-vite': 'Build tool for Electron apps',
    tailwindcss: 'Utility-first CSS framework',
    daisyui: 'Component library for Tailwind CSS',
    'better-sqlite3': 'Fast SQLite3 database for Node.js',
    'react-router-dom': 'Routing library for React',
    'react-joyride': 'Interactive tour component',
    quill: 'Rich text editor',
    'react-quill': 'React wrapper for Quill editor',
    recharts: 'Chart library for React',
    typescript: 'Typed JavaScript',
    vite: 'Build tool and development server',
    eslint: 'JavaScript linting utility',
    prettier: 'Code formatter',
    'react-confetti': 'Confetti animation component',
    'electron-builder': 'Electron app packaging tool',
    'electron-updater': 'Auto-updater for Electron apps'
  }

  return descriptions[packageName] || 'Open source package'
}

function generateTypeScriptFile(attributionData) {
  const tsContent = `// Auto-generated attribution data
// Run 'npm run generate-attributions' to update

export interface AttributionItem {
  name: string;
  description: string;
  license: string;
  repository?: string;
  publisher?: string;
}

export interface AttributionData {
  [category: string]: AttributionItem[];
}

export const ATTRIBUTION_DATA: AttributionData = ${JSON.stringify(attributionData, null, 2)};

export const TOTAL_PACKAGES = ${Object.values(attributionData).flat().length};

export const LICENSE_SUMMARY = {
${
  Object.values(attributionData)
    .flat()
    .reduce((acc, item) => {
      acc[item.license] = (acc[item.license] || 0) + 1
      return acc
    }, {}).constructor === Object
    ? Object.entries(
        Object.values(attributionData)
          .flat()
          .reduce((acc, item) => {
            acc[item.license] = (acc[item.license] || 0) + 1
            return acc
          }, {})
      )
        .map(([license, count]) => `  '${license}': ${count}`)
        .join(',\n')
    : ''
}
};
`

  fs.writeFileSync(OUTPUT_FILE, tsContent)
  console.log(`✅ Attribution data written to ${OUTPUT_FILE}`)
}

function main() {
  console.log('🚀 Generating license attributions...')

  try {
    // Load licenses
    const licenses = loadLicenses()
    console.log(`📦 Found ${Object.keys(licenses).length} packages`)

    // Generate attribution data
    const attributionData = generateAttributionData(licenses)

    // Write TypeScript file
    generateTypeScriptFile(attributionData)

    console.log('🎉 Attribution generation complete!')
    console.log('\n📋 Summary:')
    Object.entries(attributionData).forEach(([category, items]) => {
      console.log(`  ${category}: ${items.length} packages`)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
