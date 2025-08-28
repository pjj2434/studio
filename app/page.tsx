// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      title: 'My Work',
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Here's a showcase of some of my recent projects and work. Each project 
            represents a unique challenge and creative solution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center"
                alt="Project 1 - Analytics Dashboard"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">Analytics Dashboard</span>
              </div>
            </div>
            <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=400&fit=crop&crop=center"
                alt="Project 2 - Mobile App"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">Mobile App</span>
              </div>
            </div>
            <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop&crop=center"
                alt="Project 3 - E-commerce Platform"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">E-commerce Platform</span>
              </div>
            </div>
            <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=400&fit=crop&crop=center"
                alt="Project 4 - Web Application"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">Web Application</span>
              </div>
            </div>
          </div>
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
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/t.jpg"
          alt="Space background"
          fill
          className={`
            object-cover transition-all duration-300 ease-out
            ${activeArticle ? 'scale-105 blur-sm' : ''}
          `}
          priority
        />
        {/* Pattern overlay */}
        <div 
          
          
        />
      </div>
      
      {/* Main Content */}
      <div
        className={`
          relative z-10 min-h-screen flex items-center justify-center p-4
          transition-all duration-300 ease-out
          ${activeArticle ? 'scale-105 blur-sm' : ''}
          ${isLoaded ? 'animate-fade-in' : 'opacity-0'}
        `}
      >
        <div className="w-full max-w-4xl text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 border-2 border-black/30 rounded-lg backdrop-blur-sm bg-black/10">
                <SparklesIcon />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                Dimension
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-md mx-auto drop-shadow-md">
                A modern, minimalist template for showcasing your work and connecting with your audience.
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
            {Object.keys(articles).map((key) => (
              <button
                key={key}
                onClick={() => setActiveArticle(key)}
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

      {/* Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-in">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveArticle(null)}
          />
          
          <div className="relative bg-card/22 backdrop-blur-md rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-black/20">
            <div className="flex items-center justify-between p-6 border-b border-black/20">
              <h2 className="text-2xl font-bold text-card-foreground">
                {articles[activeArticle as keyof typeof articles].title}
              </h2>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                aria-label="Close article"
              >
                <XMarkIcon />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {articles[activeArticle as keyof typeof articles].content}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slide-in 350ms ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 600ms ease-out 100ms both;
        }
      `}</style>
    </main>
  );
}
