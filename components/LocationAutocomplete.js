'use client';

import { useState, useEffect, useRef } from 'react';

export default function LocationAutocomplete({ value, onChange, onVerifiedChange }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isManual, setIsManual] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Update inputValue when value prop changes (e.g., when profile data loads)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Load Google Places Autocomplete
    // Note: This requires Google Maps API key
    if (typeof window !== 'undefined' && window.google && !isManual) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            fields: ['formatted_address', 'geometry'],
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setInputValue(place.formatted_address);
            onChange(place.formatted_address);
            onVerifiedChange(true); // Address verified from Google
          }
        });
      } catch (error) {
        console.log('Google Maps not loaded, using manual input');
        setIsManual(true);
      }
    }
  }, [isManual, onChange, onVerifiedChange]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (isManual) {
      onChange(e.target.value);
      onVerifiedChange(false); // Manual input not verified
    }
  };

  const toggleManual = () => {
    setIsManual(!isManual);
    if (!isManual) {
      onVerifiedChange(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <button
          type="button"
          onClick={toggleManual}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {isManual ? 'Use Autocomplete' : 'Enter Manually'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={
          isManual
            ? 'Enter your location manually'
            : 'Start typing your address...'
        }
        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {!window.google && !isManual && (
        <p className="text-xs text-yellow-600 mt-1">
          Google Maps not loaded. Using manual input.
        </p>
      )}

      {isManual && (
        <p className="text-xs text-gray-500 mt-1">
          Manual entry - location not verified
        </p>
      )}
    </div>
  );
}
