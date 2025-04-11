import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wrapper">
        <div className="footer-content">
          <nav className="footer-links" aria-label="Footer navigation">
            <a
              href="https://github.com/The-CodingSloth/brainrot-games"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="GitHub repository"
            >
              GitHub for the inspiration source code
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
