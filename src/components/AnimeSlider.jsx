import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AnimeSlider = () => {
  const slides = [
    {
      id: 1,
      title: "Attack on Titan: Final Season",
      image: "https://images8.alphacoders.com/108/thumb-1920-1081458.jpg",
      description:
        "The war for Paradis zeroes in on Shiganshina just as Jaegerists have seized control.",
    },
    {
      id: 2,
      title: "Kaiju No. 8",
      image: "https://4kwallpapers.com/images/walls/thumbs_3t/21155.jpg",
      description:
        "Kafka Hibino aspires to join the Defense Force to fight kaiju after a childhood promise.",
    },
    {
      id: 3,
      title: "Jujutsu Kaisen",
      image: "https://images3.alphacoders.com/137/thumb-1920-1371543.jpeg",
      description:
        "Yuji Itadori swallows a cursed talisman and becomes host to a powerful curse.",
    },
    {
      id: 4,
      title: "Chainsaw Man",
      image: "https://images3.alphacoders.com/131/thumb-1920-1319293.jpeg",
      description:
        "Denji becomes Chainsaw Man after merging with his pet devil Pochita.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const promises = slides.map((slide) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = slide.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading images:", error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || isLoading) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, autoPlay, isLoading]);

  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-[69rem] h-[450px] md:h-[600px] overflow-hidden bg-gray-900 shadow-2xl  max-sm:ml-0  ml-40 mt-20 rounded-xl">
        {/* Pause/play button */}
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="max-sm:hidden absolute top-4 right-4 z-20 bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-purple-600 transition-all w-12 h-12 flex items-center justify-center"
          aria-label={autoPlay ? "Pause slider" : "Play slider"}
        >
          {autoPlay ? "⏸" : "▶"}
        </button>

        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={slides[currentSlide].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                handleNext();
              } else if (swipe > 10000) {
                handlePrev();
              }
            }}
          >
            {/* Slide image with fallback */}
            <div className="absolute inset-0 bg-gray-800">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover opacity-70"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x450/1a202c/4a5568?text=Anime+Image+Not+Found";
                }}
              />
            </div>

            {/* Slide content */}
            <div className="relative z-10 max-w-4xl px-6 md:px-10 py-8 text-white">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-bold mb-4 text-shadow-lg"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl mb-6 max-w-2xl text-shadow"
              >
                {slides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                  Watch Now
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - made larger and more visible */}
        <button
          onClick={handlePrev}
          className="max-sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-purple-600 transition-all w-12 h-12 flex items-center justify-center"
          aria-label="Previous slide"
        >
          <FiChevronLeft size={28} />
        </button>
        <button
          onClick={handleNext}
          className="max-sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-purple-600 transition-all w-12 h-12 flex items-center justify-center"
          aria-label="Next slide"
        >
          <FiChevronRight size={28} />
        </button>

        {/* Dots indicator - made slightly larger */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-purple-500 w-8"
                  : "bg-gray-500 bg-opacity-50 hover:bg-opacity-100"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimeSlider;
