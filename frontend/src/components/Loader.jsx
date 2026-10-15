import React from 'react';

/**
 * Loader Component - displays a loading spinner
 * @param {object} props
 * @param {string} props.size - Size of loader: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullscreen - Whether loader takes up full viewport (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const Loader = ({
  size = 'md',
  message = 'Loading...',
  fullscreen = false,
  className = '',
}) => {
  let spinnerClass = 'spinner';
  if (size === 'sm') {
    spinnerClass = 'spinner';
  } else if (size === 'lg') {
    spinnerClass = 'spinner spinner-lg';
  }

  const containerClass = `loading-state ${fullscreen ? 'loading-state-fullscreen' : ''} ${className}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Loader;
