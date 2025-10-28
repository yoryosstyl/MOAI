'use client';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-2xl">Avatar</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Name</h1>
              <p className="text-gray-600 mb-4">Artist bio goes here...</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">artist@example.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <p className="text-gray-900">Athens, Greece</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Preferred Contact</label>
              <p className="text-gray-900">Email, Website</p>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Make email public</span>
              <input type="checkbox" className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Make telephone public</span>
              <input type="checkbox" className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Make location public</span>
              <input type="checkbox" className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
