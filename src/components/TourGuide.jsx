import { useEffect } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

const TourGuide = () => {
  useEffect(() => {
    if (localStorage.getItem("seenTour")) return;

    const loadConfetti = async () => {
      if (typeof window.confetti !== "function") {
        const confetti = await import("canvas-confetti");
        window.confetti = confetti.default;
      }
    };

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true, label: "✕" },
        classes: "shepherd-theme-custom",
        scrollTo: { behavior: "smooth", block: "center" },
        arrow: false,
      },
      useModalOverlay: true,
      keyboardNavigation: true,
      exitOnEsc: true,
    });

    const style = document.createElement("style");
    style.textContent = `
      .shepherd-theme-custom {
        background: rgba(17, 24, 39, 0.95) !important;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(234, 179, 8, 0.2);
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        color: #fefce8;
        max-width: 500px;
        font-family: 'Inter', 'Poppins', sans-serif;
        text-align: center;
        opacity: 0;
        transform: scale(0.95);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
      }

      .shepherd-theme-custom.shepherd-enabled {
        opacity: 1;
        transform: scale(1);
      }

      .shepherd-theme-custom .shepherd-text {
        padding: 1.5rem;
        font-size: 1rem;
        line-height: 1.5;
      }

      .shepherd-theme-custom .shepherd-button {
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        color: #111827;
        border-radius: 0.5rem;
        padding: 0.5rem 1.25rem;
        font-weight: 600;
        margin: 0.75rem 0.25rem 0;
        transition: all 0.2s ease;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .shepherd-theme-custom .shepherd-button:hover {
        background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .shepherd-theme-custom .shepherd-button:active {
        transform: translateY(0);
      }

      .shepherd-theme-custom .shepherd-cancel-icon {
        color: #fef9c3;
        font-size: 1.5rem;
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        transition: all 0.2s ease;
      }

      .shepherd-theme-custom .shepherd-cancel-icon:hover {
        color: #f87171;
        transform: rotate(90deg) scale(1.1);
      }

      .shepherd-modal-overlay-container {
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      

      .tour-image {
        max-height: 280px;
        width: auto;
        border-radius: 0.75rem;
        border: 1px solid rgba(234, 179, 8, 0.2);
        margin: 0 auto;
        object-fit: contain;
      }

      .feature-badge {
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: rgba(234, 179, 8, 0.1);
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);

    // Welcome step
    tour.addStep({
      id: "welcome",
      title: "",
      text: `
        <div class="flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/XvdWdLrm/hinanime-logo-removebg-preview.png" 
            alt="HinAnime Logo"
            class="w-32 h-32 rounded-full border-2 border-yellow-400 mb-4 animate-bounce"
          />
          <h3 class="text-2xl font-bold text-amber-50 mb-2">Welcome to HinAnime</h3>
          <p class="text-amber-100 mb-4 text-lg">Your ultimate anime destination</p>
          <span class="feature-badge text-amber-300">Let's begin the tour ✨</span>
        </div>
      `,
      buttons: [
        {
          text: "Let's Go!",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    // Anime Cards step
    tour.addStep({
      id: "cards",
      title: "",
      text: `
        <div class="flex flex-col items-center">
          <img 
            src="https://res.cloudinary.com/dmo2cjvrs/image/upload/v1752139180/tl9ilgkv3dmnxqlecrym.png" 
            class="tour-image"
            alt="Anime Card Example"
          />
          <h4 class="mt-4 text-amber-50 font-medium text-xl">Discover Anime</h4>
          <p class="text-base text-amber-100/80 mb-3">
            Hover over cards for quick details or click to explore more
          </p>
          <span class="feature-badge text-purple-300">Click 'Add' to save to watchlist</span>
        </div>
      `,
      attachTo: {
        element: ".anime-card",
        on: "bottom",
      },
      buttons: [
        {
          text: "← Back",
          action: tour.back,
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next →",
          action: tour.next,
          classes: "shepherd-button-primary",
        },
      ],
    });

    // Profile Customization step
    tour.addStep({
      id: "profile",
      title: "",
      text: `
        <div class="flex flex-col items-center">
          <img 
            src="https://res.cloudinary.com/dmo2cjvrs/image/upload/v1752141512/wbo1yzfiahc2egecm9vk.png" 
            class="tour-image"
            alt="Profile Customization"
          />
          <h4 class="mt-4 text-amber-50 font-medium text-xl">Personalize Your Profile</h4>
          <ul class="text-left text-base text-amber-100/80 list-disc list-inside mb-3">
            <li>Upload profile & banner images</li>
            <li>Customize with color grading</li>
            <li>Update username & password</li>
          </ul>
          <span class="feature-badge text-blue-300">Express your style</span>
        </div>
      `,
      attachTo: {
        element: ".profile-section",
        on: "bottom",
      },
      buttons: [
        {
          text: "← Back",
          action: tour.back,
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next →",
          action: tour.next,
          classes: "shepherd-button-primary",
        },
      ],
    });

    // Messages step
    tour.addStep({
      id: "message",
      title: "",
      text: `
        <div class="flex flex-col items-center">
          <img 
            src="https://res.cloudinary.com/dmo2cjvrs/image/upload/v1752141817/rsvc66abgb4teqbiwfvb.png" 
            class="tour-image"
            alt="Messages Section"
          />
          <h4 class="mt-4 text-amber-50 font-medium text-xl">Connect With Others</h4>
          <p class="text-base text-amber-100/80 mb-3">
            View profiles and interact with other anime fans
          </p>
          <span class="feature-badge text-green-300">Your profile appears like this to others</span>
        </div>
      `,
      attachTo: {
        element: ".messages-section",
        on: "bottom",
      },
      buttons: [
        {
          text: "← Back",
          action: tour.back,
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next →",
          action: tour.next,
          classes: "shepherd-button-primary",
        },
      ],
    });

    // Search step
    tour.addStep({
      id: "search",
      title: "",
      text: `
        <div class="flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/XvdWdLrm/hinanime-logo-removebg-preview.png" 
            class="w-28 h-28 mb-4"
            alt="Search"
          />
          <h4 class="text-amber-50 font-medium text-xl">Find Your Anime</h4>
          <p class="text-base text-amber-100/80 mb-3">
            Quick search to discover new favorites
          </p>
          <span class="feature-badge text-purple-300">Try it now!</span>
        </div>
      `,
      attachTo: {
        element: ".search-bar",
        on: "bottom",
      },
      buttons: [
        {
          text: "← Back",
          action: tour.back,
          classes: "shepherd-button-secondary",
        },
        {
          text: "Finish Tour",
          action: async () => {
            await loadConfetti();

            const count = 200;
            const defaults = {
              origin: { y: 0.7 },
              spread: 100,
              startVelocity: 30,
            };

            function fire(particleRatio, opts) {
              window.confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
                colors: ["#facc15", "#a78bfa", "#ec4899", "#60a5fa", "#34d399"],
              });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, {
              spread: 120,
              startVelocity: 25,
              decay: 0.92,
              scalar: 1.2,
            });
            fire(0.1, { spread: 120, startVelocity: 45 });

            localStorage.setItem("seenTour", "true");
            tour.complete();
          },
          classes: "shepherd-button-primary",
        },
      ],
    });

    setTimeout(() => {
      tour.start();
      if (navigator.vibrate) navigator.vibrate(100);
    }, 1000);

    return () => {
      document.head.removeChild(style);
      if (tour.isActive()) tour.complete();
    };
  }, []);

  return null;
};

export default TourGuide;
