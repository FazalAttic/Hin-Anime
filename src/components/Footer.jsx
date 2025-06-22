import React from "react";

const Footer = () => (
  <footer className="w-full bg-gray-900 py-6 px-4 mt-12">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-end items-center">
      <div className="text-gray-400 text-sm text-right">
        <div className="mb-2">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-red-400 font-semibold">YourAnimeSite</span>. All
          rights reserved.
        </div>
        <div>
          <a
            href="mailto:support@youranimesite.com"
            className="hover:text-red-400 transition"
          >
            Contact Support
          </a>{" "}
          |{" "}
          <a href="/privacy" className="hover:text-red-400 transition">
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="/terms" className="hover:text-red-400 transition">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
