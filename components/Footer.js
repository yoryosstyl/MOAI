export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-10 px-4 py-2 bg-transparent pointer-events-none">
      <div className="pointer-events-auto">
        <p className="text-xs text-gray-500 opacity-70 hover:opacity-100 transition">
          Design by{' '}
          <a
            href="https://yoryosstyl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            Yoryos Styl
          </a>
          {' | '}
          <a
            href="https://insidespaceman.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            Inside Spaceman
          </a>
        </p>
      </div>
    </footer>
  );
}
