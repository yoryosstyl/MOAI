import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to MOAI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A collaborative platform for artists to share projects, discover creative toolkits, and connect with fellow creators.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Projects Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Browse Projects
            </h2>
            <p className="text-gray-600 mb-4">
              Explore creative projects shared by artists from around the world.
            </p>
            <Link href="/projects" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              View Projects
            </Link>
          </div>

          {/* Toolkits Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Discover Toolkits
            </h2>
            <p className="text-gray-600 mb-4">
              Find curated toolkits and resources for your creative process.
            </p>
            <Link href="/toolkits" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Browse Toolkits
            </Link>
          </div>

          {/* Community Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Join Community
            </h2>
            <p className="text-gray-600 mb-4">
              Connect with artists and collaborate on exciting projects.
            </p>
            <Link href="/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
