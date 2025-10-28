export default function ToolkitsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Toolkits</h1>
          <p className="text-lg text-gray-600">
            Discover curated toolkits and resources for art creation
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search toolkits..."
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="digital">Digital Tools</option>
              <option value="physical">Physical Materials</option>
              <option value="software">Software</option>
              <option value="techniques">Techniques</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Search
            </button>
          </div>
        </div>

        {/* Toolkits List */}
        <div className="space-y-6">
          {/* Placeholder Toolkit Cards */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Toolkit Title {i}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                    Category
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                This is a placeholder description for a creative toolkit. It includes
                various resources, guides, and tools for artists to use in their
                creative process.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  #tag1
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  #tag2
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  #tag3
                </span>
              </div>
              <div className="flex gap-4">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  View Resources →
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
