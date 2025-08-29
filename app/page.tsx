// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Package {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function Home() {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDoor, setShowDoor] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Animate lines apart, 2. Fade/scale in content, 3. Remove door overlay
    const timer1 = setTimeout(() => {
      setIsLoaded(true);
    }, 900); // start content fade/scale in as lines move
    const timer2 = setTimeout(() => {
      setShowDoor(false);
    }, 1400); // remove door overlay
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Fetch packages when work section is opened
  const fetchPackages = async () => {
    if (packages.length > 0) return; // Don't fetch if already loaded
    
    setLoading(true);
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkClick = () => {
    setActiveArticle('work');
    fetchPackages();
  };

  // Show modal after fade-out
  useEffect(() => {
    if (activeArticle) {
      const timer = setTimeout(() => setShowModal(activeArticle), 500);
      return () => clearTimeout(timer);
    } else {
      setShowModal(null);
    }
  }, [activeArticle]);

  const handleBookNow = (packageId: string) => {
    router.push(`/booking?package=${packageId}`);
  };

  // Simple SVG Icons
  const SparklesIcon = () => (
    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057-3 1.943 2 2-2L15 3l-2 2 2 2-3 3-2-2-2 2-3-3 2-2L5 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
    </svg>
  );

  const XMarkIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const articles = {
    intro: {
      title: 'Welcome to Dimension',
      content: (
        <div className="space-y-6">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&crop=center"
              alt="Modern technology and space"
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Dimension, a modern and minimalist template designed for 
            showcasing your work and connecting with your audience. This template 
            features smooth animations, responsive design, and a clean aesthetic 
            that puts your content first.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Built with Next.js 14, TypeScript, and Tailwind CSS, Dimension 
            represents the perfect blend of modern web technologies and timeless 
            design principles.
          </p>
        </div>
      ),
    },
    work: {
      title: 'Our Packages',
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Choose from our carefully crafted packages designed to meet your needs.
          </p>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-border rounded-lg overflow-hidden bg-card/50">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <div className="aspect-video md:aspect-square relative">
                        <Image
                          src={pkg.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center"}
                          alt={pkg.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{pkg.name}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">{pkg.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-2xl font-bold text-primary">${pkg.price}</span>
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                            {pkg.duration}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookNow(pkg.id)}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium self-start"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No packages available at the moment.</p>
            </div>
          )}
        </div>
      ),
    },
    about: {
      title: 'About Me',
      content: (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  alt="Profile picture"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                I'm a passionate developer and designer with a love for creating 
                beautiful, functional digital experiences. With years of experience 
                in modern web technologies, I specialize in building responsive, 
                accessible, and performant applications.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My expertise spans across frontend development, UI/UX design, and 
                modern JavaScript frameworks. I believe in the power of clean code, 
                thoughtful design, and continuous learning.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-chart-1/20 text-chart-1 text-sm rounded-full border border-chart-1/20">React</span>
                <span className="px-3 py-1 bg-chart-2/20 text-chart-2 text-sm rounded-full border border-chart-2/20">Node.js</span>
                <span className="px-3 py-1 bg-chart-3/20 text-chart-3 text-sm rounded-full border border-chart-3/20">TypeScript</span>
                <span className="px-3 py-1 bg-chart-4/20 text-chart-4 text-sm rounded-full border border-chart-4/20">Design</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Get In Touch',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 relative mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                alt="Contact avatar"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I'd love to hear from you! Whether you have a project in mind, 
              want to collaborate, or just want to say hello, feel free to reach out.
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your name"
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Your message..."
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            >
              Send Message
            </button>
          </form>
          
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-4 pt-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      ),
    },
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-transparent" />
        <Image
          src="/background.jpeg"
          alt="Space background"
          fill
          className={`object-cover transition-all duration-500 ease-out ${activeArticle ? 'scale-105 blur-sm' : ''}`}
          priority
        />
        {/* Black overlay that fades to 30% opacity after animation */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-1500 ease-in-out ${!showDoor ? 'opacity-80' : 'opacity-100'}`}></div>
      </div>

      {/* Main Content with Door Animation */}
      <div
        className={`
          relative z-10 min-h-screen flex items-center justify-center p-4
        `}
      >
        <div className={`w-full max-w-[1100px] mx-auto text-center space-y-14 main-content-door-wrap${activeArticle ? ' main-content-shrink-fade' : ''}`}> 
          <div className="door-anim-horizontal-content refined-door-layout wide-door-layout">
            {/* Top: Logo, animates up with line */}
            <div className={`door-logo-area${isLoaded ? ' door-logo-area-animated' : ''}`} style={{ marginBottom: '2.5rem' }}>
              <div className="flex justify-center">
                <div className="p-6 border-2 border-black/30 rounded-lg backdrop-blur-sm bg-black/10">
                  <SparklesIcon />
                </div>
              </div>
            </div>
            {/* Door Animation Container: absolutely positioned, lines and text animate independently */}
            <div className="door-anim-container door-anim-container-wide mx-auto" style={{ height: '120px', marginBottom: '2.5rem', width: '100%' }}>
              {/* Top Line: absolutely positioned, animates up */}
              <div className={`door-divider door-divider-top-abs${isLoaded ? ' door-divider-top-abs-animated' : ''}`} />
              {/* Bottom Line: absolutely positioned, animates down */}
              <div className={`door-divider door-divider-bottom-abs${isLoaded ? ' door-divider-bottom-abs-animated' : ''}`} />
              {/* Text: absolutely positioned, fades in as lines move */}
              <div
                className={`door-anim-text${isLoaded ? ' door-anim-text-visible' : ''} door-anim-text-wide`}
                style={!isLoaded ? { transition: 'none', opacity: 0 } : {}}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg mb-6">
                  LTL Recording Studio
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto drop-shadow-md mt-6">
                  A modern, minimalist template for showcasing your work and connecting with your audience.
                </p>
              </div>
            </div>
            {/* Bottom: Buttons, animates down with line */}
            <nav className={`flex flex-wrap justify-center gap-4 md:gap-8 main-content-anim door-nav-area${isLoaded ? ' door-nav-area-animated door-nav-area-unclipped' : ''}`} style={{ marginTop: '2.5rem' }}>
              {Object.keys(articles).map((key) => (
                <button
                  key={key}
                  onClick={() => key === 'work' ? handleWorkClick() : setActiveArticle(key)}
                  className={`
                    px-4 py-2 text-sm md:text-base font-medium border rounded-lg
                    transition-all duration-200 backdrop-blur-sm
                    focus:outline-none focus:ring-2 focus:ring-black/50 focus:ring-offset-2 focus:ring-offset-transparent
                    ${activeArticle === key 
                      ? 'bg-white text-primary border-white shadow-lg' 
                      : 'text-white border-black/30 bg-black/10 hover:bg-black/20 hover:border-black/50'
                    }
                  `}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Overlay with fade-in */}
          <div
            className="absolute inset-0 bg-black/50 animate-overlay-fade-in"
            onClick={() => setActiveArticle(null)}
          />
          {/* Modal with fade-in */}
          <div className="relative modal-bg-custom text-white backdrop-blur-md rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-black/20 animate-modal-fade-in will-change-transform" style={{backfaceVisibility: 'hidden', willChange: 'transform, opacity'}}>
            <div className="flex items-center justify-between p-6 border-b border-black/20">
              <h2 className="text-2xl font-bold">
                {articles[showModal as keyof typeof articles].title}
              </h2>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 text-white hover:text-gray-200 transition-colors rounded-md hover:bg-muted"
                aria-label="Close article"
              >
                <XMarkIcon />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {articles[showModal as keyof typeof articles].content}
            </div>
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
      <style jsx>{`
        .wide-door-layout {
          width: 100%;
        }
        .door-anim-container-wide {
          width: 100%;
        }
        .door-anim-text-wide {
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
        .door-anim-text-wide p {
          max-width: 900px;
        }
        @media (max-width: 900px) {
          .wide-door-layout,
          .door-anim-container-wide {
            max-width: 98vw;
            width: 98vw;
          }
          .door-anim-text-wide {
            max-width: 96vw;
          }
          .door-anim-text-wide p {
            max-width: 92vw;
          }
        }
        @media (max-width: 640px) {
          .wide-door-layout,
          .door-anim-container-wide {
            max-width: 100vw;
            width: 100vw;
          }
          .door-anim-text-wide {
            max-width: 100vw;
          }
          .door-anim-text-wide p {
            max-width: 96vw;
          }
        }
        .main-content-door-wrap, .main-content-door-wrap * {
          font-family: 'Source Sans Pro', Arial, sans-serif !important;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .modal-bg-custom {
          background: rgba(18, 18, 20, 0.6);
        }
        .modal-bg-custom,
        .modal-bg-custom * {
          color: #fff !important;
        }
        /* Custom scrollbar for modal content */
        .modal-bg-custom .p-6 {
          scrollbar-width: thin;
          scrollbar-color: #444 #222;
        }
        .modal-bg-custom .p-6::-webkit-scrollbar {
          width: 8px;
          background: #222;
          border-radius: 8px;
        }
        .modal-bg-custom .p-6::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 8px;
        }
        .modal-bg-custom .p-6::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
        .door-anim-container {
          position: relative;
          width: 100%;
          height: 92px;
          margin: 0 auto 1.5rem auto;
        }
        .door-divider {
          width: 100%;
          height: 1.5px;
          background: linear-gradient(90deg, #fff 70%, #aaa 100%);
          border-radius: 1px;
          box-shadow: 0 0 2px 0 #fff6;
          position: absolute;
          left: 0;
          right: 0;
          transition: transform 0.8s cubic-bezier(0.77,0,0.175,1);
        }
        .door-divider-top-abs {
          top: 50%;
          transform: translateY(0);
        }
        .door-divider-top-abs-animated {
          transform: translateY(-150px);
        }
        .door-divider-bottom-abs {
          top: 50%;
          transform: translateY(0);
        }
        .door-divider-bottom-abs-animated {
          transform: translateY(150px);
        }
        .door-anim-text {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%) scale(1.04);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.8s cubic-bezier(0.77,0,0.175,1), transform 0.8s cubic-bezier(0.77,0,0.175,1);
          text-align: center;
        }
        .door-anim-text-visible {
          opacity: 1;
          transform: translateY(-50%) scale(1);
          pointer-events: auto;
          transition: opacity 0.8s cubic-bezier(0.77,0,0.175,1), transform 0.8s cubic-bezier(0.77,0,0.175,1);
          transition-delay: 0.20s;
        }
        /* Door animation - horizontal split, overlays main content */
        .refined-door-layout {
          position: static;
          width: 100%;
          min-width: 320px;
          max-width: none;
          z-index: 20;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          gap: 0.5rem;
        }
        .door-logo-area {
          margin-bottom: 1.5rem;
          transition: transform 0.8s cubic-bezier(0.77,0,0.175,1);
        }
        .door-logo-area-animated {
          transform: translateY(-48px);
        }
        .door-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #fff 70%, #aaa 100%);
          border-radius: 1px;
          box-shadow: 0 0 2px 0 #fff6;
          transition: transform 0.8s cubic-bezier(0.77,0,0.175,1);
        }
        .door-divider-top {
          /* initial: center */
        }
        .door-divider-top-animated {
          transform: translateY(-48px);
        }
        .door-divider-bottom {
          /* initial: center */
        }
        .door-divider-bottom-animated {
          transform: translateY(48px);
        }
        .door-content-clip-refined {
          width: 100%;
          height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: height 0.4s cubic-bezier(0.77,0,0.175,1), opacity 0.3s cubic-bezier(0.77,0,0.175,1);
        }
        .door-content-clip-reveal-refined {
          height: 92px;
          opacity: 1;
          pointer-events: auto;
        }
        .door-content-clip-unclipped {
          height: auto !important;
          overflow: visible !important;
          pointer-events: auto !important;
        }
        .door-nav-area {
          margin-top: 1.5rem;
          transition: transform 0.8s cubic-bezier(0.77,0,0.175,1);
        }
        .door-nav-area-animated {
          transform: translateY(48px);
        }
        .door-nav-area-unclipped {
          pointer-events: auto !important;
        }
        .door-content-anim {
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.5s cubic-bezier(0.77,0,0.175,1), transform 0.5s cubic-bezier(0.77,0,0.175,1);
        }
        .door-content-clip-refined {
          width: 100%;
          height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: height 0.8s cubic-bezier(0.77,0,0.175,1), opacity 0.7s cubic-bezier(0.77,0,0.175,1);
        }
        .door-content-clip-reveal-refined {
          height: 92px;
          opacity: 1;
          pointer-events: auto;
        }
        .door-content-clip-unclipped {
          height: auto !important;
          overflow: visible !important;
          pointer-events: auto !important;
        }
        .door-content-anim {
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.8s cubic-bezier(0.77,0,0.175,1), transform 0.8s cubic-bezier(0.77,0,0.175,1);
        }
        .door-content-visible {
          opacity: 1;
          transform: scale(1);
          transition-delay: 0.15s;
        }

        /* Animate main content in sync with door */
        .main-content-door-wrap {
          position: relative;
          transition: transform 0.5s cubic-bezier(0.77,0,0.175,1), opacity 0.5s cubic-bezier(0.77,0,0.175,1);
        }
        .main-content-shrink-fade {
          transform: scale(0.92);
          opacity: 0;
          pointer-events: none;
        }
        .main-content-anim {
          transition: opacity 0.7s cubic-bezier(0.77,0,0.175,1);
        }
        .door-content-anim {
          opacity: 0;
        }
        .door-content-visible {
          opacity: 1;
          transition-delay: 0.2s;
        }
        /* End door animation */

        /* Modal and overlay animations */
        @keyframes modal-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes overlay-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-modal-fade-in {
          animation: modal-fade-in 260ms cubic-bezier(0.4, 0.8, 0.2, 1) forwards;
        }
        .animate-overlay-fade-in {
          animation: overlay-fade-in 220ms cubic-bezier(0.4, 0.8, 0.2, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 600ms ease-out 100ms both;
        }
      `}</style>
    </main>
  );
}
