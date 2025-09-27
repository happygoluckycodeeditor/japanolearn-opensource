import React, { useState } from 'react'
import { ATTRIBUTION_DATA, TOTAL_PACKAGES, LICENSE_SUMMARY } from './attribution-data'

interface AttributionSectionProps {
  className?: string
}

const AttributionSection: React.FC<AttributionSectionProps> = ({ className = '' }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showAllPackages, setShowAllPackages] = useState(false)

  const toggleCategory = (category: string): void => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const expandAll = (): void => {
    if (expandedCategories.size === Object.keys(ATTRIBUTION_DATA).length) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(Object.keys(ATTRIBUTION_DATA)))
    }
  }

  return (
    <div className={`mt-8 border-t border-gray-300 pt-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Open Source Attributions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {TOTAL_PACKAGES} packages
          </span>
          <button onClick={expandAll} className="text-sm text-red-400 hover:text-red-600 underline">
            {expandedCategories.size === Object.keys(ATTRIBUTION_DATA).length
              ? 'Collapse All'
              : 'Expand All'}
          </button>
        </div>
      </div>

      <p className="mb-4 text-gray-700">
        This application is built with the help of many amazing open-source projects. We are
        grateful to all the contributors and maintainers of these projects:
      </p>

      {/* License Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">License Distribution</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LICENSE_SUMMARY)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, showAllPackages ? undefined : 5)
            .map(([license, count]) => (
              <span key={license} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {license}: {count as number}
              </span>
            ))}
          {Object.keys(LICENSE_SUMMARY).length > 5 && (
            <button
              onClick={() => setShowAllPackages(!showAllPackages)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showAllPackages ? 'Show Less' : `+${Object.keys(LICENSE_SUMMARY).length - 5} more`}
            </button>
          )}
        </div>
      </div>

      {/* Attribution Categories */}
      <div className="space-y-4">
        {Object.entries(ATTRIBUTION_DATA).map(([categoryName, packages]) => (
          <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(categoryName)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{categoryName}</h3>
                <p className="text-sm text-gray-600">{packages.length} packages</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedCategories.has(categoryName) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedCategories.has(categoryName) && (
              <div className="px-4 py-3 bg-white">
                <ul className="space-y-3">
                  {packages.map((pkg) => (
                    <li key={pkg.name} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                          {pkg.publisher && (
                            <p className="text-xs text-gray-500 mt-1">By {pkg.publisher}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {pkg.license}
                          </span>
                          {pkg.repository && (
                            <a
                              href={pkg.repository}
                              className="text-xs text-red-400 hover:text-red-600 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🔄 Auto-Generated:</strong> This attribution list is automatically generated from
          our package.json dependencies. Run{' '}
          <code className="bg-blue-100 px-1 rounded">npm run generate-attributions</code> to update
          it.
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-600">
        For complete license information and full attribution details, please see the individual
        project repositories linked above. We extend our heartfelt gratitude to all open-source
        contributors who make projects like this possible.
      </p>
    </div>
  )
}

export default AttributionSection
