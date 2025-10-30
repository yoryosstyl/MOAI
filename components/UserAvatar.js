'use client';

/**
 * UserAvatar component - Displays user avatar or initials
 * @param {string} photoURL - User's photo URL
 * @param {string} name - User's display name
 * @param {string} size - Size of avatar ('sm', 'md', 'lg', 'xl')
 */
export default function UserAvatar({ photoURL, name, size = 'md' }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Generate a consistent color based on name
  const getColorFromName = (name) => {
    if (!name) return 'bg-gray-400';

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || 'User'}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  const colorClass = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
