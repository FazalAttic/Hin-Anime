import React from "react";

const DMCAPolicy = () => {
  return (
    <div className="relative min-h-screen  overflow-hidden flex items-center justify-center ml-52 max-sm:ml-0  ">
      {/* Blurred Background with Anime Images */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0  opacity-60"></div>
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
          style={{
            backgroundImage:
              "url('https://source.unsplash.com/random/1600x900/?anime')",
          }}
        ></div>
      </div>

      {/* Content Container */}
      <div className="flex justify-center w-full mt-8">
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                DMCA - Digital Millennium Copyright Act Policy
              </h1>
              <p className="mt-2 text-purple-200">
                Protecting intellectual property rights
              </p>
            </div>

            {/* Main Content */}
            <div className="p-6 sm:p-8 space-y-8 text-gray-300">
              {/* Introduction */}
              <section className="space-y-4">
                <p>
                  We respect the intellectual property rights of others, and we
                  expect all users of our website to do the same. In accordance
                  with the Digital Millennium Copyright Act of 1998 (DMCA), we
                  will respond promptly to claims of copyright infringement
                  committed using our platform, if such claims are reported to
                  us in compliance with the DMCA.
                </p>

                <p>
                  We do not host any videos or copyrighted files on our servers.
                  All the content found on this site is embedded or linked from
                  third-party services. We act as an indexing site, similar to
                  how search engines work, and we do not control the content
                  uploaded to third-party hosting platforms.
                </p>

                <p>
                  This website is for educational and promotional purposes only.
                  All linked files and content are intended for testing,
                  preview, or backup purposes. We encourage users to support the
                  original creators by purchasing the official versions of
                  content (anime DVDs, Blu-rays, subscriptions, etc.).
                </p>
              </section>

              {/* Takedown Requirements */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-purple-400 mr-2">🛡️</span>
                  DMCA Takedown Request Requirements
                </h2>

                <p>
                  If you are a copyright owner or an agent thereof, and believe
                  that any content linked or shown on our website infringes upon
                  your copyright, you may submit a DMCA takedown request to us.
                </p>

                <p>Your DMCA request must include the following:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    A description of the copyrighted work that you claim has
                    been infringed.
                  </li>
                  <li>
                    The exact URL(s) or location(s) of the infringing material
                    on our website.
                  </li>
                  <li>
                    Your contact information (name, title, address, phone
                    number, and email).
                  </li>
                  <li>
                    The following statement:
                    <blockquote className="mt-2 p-3 bg-gray-700 rounded italic">
                      "I have a good faith belief that the use of the
                      copyrighted material I am complaining of is not authorized
                      by the copyright owner, its agent, or the law (e.g., fair
                      use)."
                    </blockquote>
                  </li>
                  <li>
                    The following statement:
                    <blockquote className="mt-2 p-3 bg-gray-700 rounded italic">
                      "The information in this notice is accurate, and under
                      penalty of perjury, I am the copyright owner or am
                      authorized to act on behalf of the owner of the exclusive
                      right that is allegedly infringed."
                    </blockquote>
                  </li>
                  <li>Your electronic or physical signature.</li>
                </ul>
              </section>

              {/* Submission */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-blue-400 mr-2">📬</span>
                  Submit Your DMCA Request
                </h2>

                <p>
                  You can submit your request via email to:
                  <br />
                  <a
                    href="mailto:hinanime.site@gmail.com"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    📧 hinanime.site@gmail.com
                  </a>
                </p>

                <p>
                  We will promptly review your request and take appropriate
                  action, including the removal of any allegedly infringing
                  content.
                </p>
              </section>

              {/* Disclaimer */}
              <section className="space-y-4 p-6 bg-gray-700 bg-opacity-50 rounded-lg border-l-4 border-red-500">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-red-400 mr-2">⚠️</span>
                  Disclaimer
                </h2>

                <ul className="list-disc pl-6 space-y-2">
                  <li>This site does not host any copyrighted material.</li>
                  <li>
                    All media content is hosted by non-affiliated third parties
                    and simply indexed here.
                  </li>
                  <li>
                    If you are the rightful owner of any content linked here and
                    want it removed, please contact us immediately.
                  </li>
                  <li>
                    All users who do not agree with our terms and policies are
                    advised to exit this site immediately.
                  </li>
                </ul>
              </section>

              {/* Legal Notice */}
              <section className="space-y-4 p-6 bg-gray-700 bg-opacity-50 rounded-lg border-l-4 border-yellow-500">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-yellow-400 mr-2">⚠️</span>
                  Legal Notice
                </h2>

                <p>
                  By staying on this website, you affirm that you understand and
                  agree with the above policies and release us from all
                  liability related to the content displayed or linked.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCAPolicy;
