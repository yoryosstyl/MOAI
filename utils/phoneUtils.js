// Common country codes for phone numbers
export const countryCodes = [
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
];

// Validate phone number (only digits after country code)
export function validatePhoneNumber(number) {
  // Remove spaces, dashes, parentheses
  const cleaned = number.replace(/[\s\-\(\)]/g, '');
  // Check if it's only digits
  return /^\d+$/.test(cleaned);
}

// Format phone number for display
export function formatPhoneNumber(countryCode, number) {
  if (!number) return '';
  return `${countryCode} ${number}`;
}
