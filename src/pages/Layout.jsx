
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Zap } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const isHomePage = currentPageName === "Dashboard";

  return (
    <div className="min-h-screen vanlife-cyber-bg">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        
        :root {
          --cyber-cyan: #06b6d4;
          --cyber-blue: #3b82f6;
          --sunset-orange: #f97316;
          --sunset-purple: #7c3aed;
          --cyber-dark: #0f172a;
          --cyber-darker: #020617;
        }
        
        body {
          font-family: 'Rajdhani', sans-serif;
        }
        
        .vanlife-cyber-bg {
          background: 
            linear-gradient(135deg, 
              #020617 0%, 
              #1e1b4b 40%,
              #4c1d95 70%,
              #020617 100%
            );
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        
        /* Grid overlay */
        .vanlife-cyber-bg::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            repeating-linear-gradient(
              0deg,
              rgba(6, 182, 212, 0.03) 0px,
              transparent 1px,
              transparent 40px,
              rgba(6, 182, 212, 0.03) 41px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(6, 182, 212, 0.03) 0px,
              transparent 1px,
              transparent 40px,
              rgba(6, 182, 212, 0.03) 41px
            );
          pointer-events: none;
          z-index: 1;
        }
        
        /* Horizon glow */
        .vanlife-cyber-bg::after {
          content: '';
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: 
            linear-gradient(to top, 
              rgba(249, 115, 22, 0.15) 0%,
              rgba(124, 58, 237, 0.1) 50%,
              transparent 100%
            );
          pointer-events: none;
          z-index: 1;
        }
        
        .van-glow {
          text-shadow: 
            0 0 20px rgba(6, 182, 212, 0.8),
            0 0 40px rgba(124, 58, 237, 0.6),
            0 0 60px rgba(249, 115, 22, 0.4);
        }
        
        .cyber-card {
          background: linear-gradient(135deg, 
            rgba(15, 23, 42, 0.9) 0%, 
            rgba(76, 29, 149, 0.4) 100%
          );
          backdrop-filter: blur(12px);
          border: 1px solid rgba(6, 182, 212, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .cyber-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(6, 182, 212, 0.8) 50%,
            transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .cyber-card:hover::before {
          opacity: 1;
        }
        
        .cyber-card:hover {
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 
            0 0 30px rgba(6, 182, 212, 0.3),
            0 0 60px rgba(124, 58, 237, 0.2);
          transform: translateY(-4px);
        }
        
        .neon-glow {
          box-shadow: 
            0 0 20px rgba(249, 115, 22, 0.4),
            0 0 40px rgba(124, 58, 237, 0.3);
        }
        
        @media (max-width: 768px) {
          .van-glow {
            text-shadow: 
              0 0 10px rgba(6, 182, 212, 0.8),
              0 0 20px rgba(124, 58, 237, 0.6);
          }
        }
      `}</style>
      
      {/* Header - only show on non-home pages */}
      {!isHomePage && (
        <header className="relative z-10 p-4 border-b border-cyan-500/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Link 
              to={createPageUrl("Dashboard")} 
              className="flex items-center gap-2 text-cyan-400 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-bold uppercase tracking-wider" style={{fontFamily: 'Orbitron, sans-serif'}}>VanWired</span>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
