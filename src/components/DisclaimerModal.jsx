import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DisclaimerModal({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 vanlife-cyber-bg">
      <style>{`
        .vanlife-cyber-bg {
          background:
            linear-gradient(135deg,
              #020617 0%,
              #1e1b4b 40%,
              #4c1d95 70%,
              #020617 100%
            );
          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
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
      `}</style>
      <div className="cyber-card border-cyan-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        <div className="p-6 space-y-6">
          {/* Welcome Header */}
          <div className="text-center pb-4 border-b border-cyan-500/30">
            <h1 className="text-3xl font-black text-white uppercase mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
              Welcome to VanWired
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl mx-auto">
              Welcome, and thanks so much for installing VanWired! This app was built by self-build enthusiasts for other
              enthusiasts who are willing to give the DIY route a go. We've put together a collection of basic calculators
              and reference guides that we found really useful during our own builds. They're not groundbreaking, but they're
              practical tools that can help answer common wiring questions and support you throughout your project. We genuinely
              hope you see the value in them!
            </p>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl mx-auto mt-3">
              Of course, the responsibility for your build ultimately lies with you, which is why we kindly ask you to review
              and accept the disclaimer below. The tools and information here are <strong className="text-orange-400">reference
              materials to support your journey</strong> - not professional advice or recommendations. Please take a moment to
              read through the terms before continuing.
            </p>
          </div>

          {/* Disclaimer Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-orange-400/30">
            <div className="w-12 h-12 bg-orange-400/15 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase" style={{fontFamily: 'Orbitron, sans-serif'}}>
                Important Notice
              </h2>
              <p className="text-orange-400 text-sm">Please Read Carefully</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 text-gray-200">
            <p className="text-sm leading-relaxed text-center">
              VanWired is provided as an <strong className="text-white">educational reference tool only</strong>.
              All calculations, specifications, and information are estimates for guidance purposes and should not be
              considered professional advice or definitive facts.
            </p>

            <div className="bg-orange-400/10 border border-orange-400/25 rounded-xl p-5">
              <ul className="text-sm space-y-3 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>All data is compiled from various sources and may be outdated or inaccurate</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>You are solely responsible for verifying all specifications with manufacturers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span><strong className="text-white">Electrical work can be dangerous</strong> and may cause fire, injury, or death if done incorrectly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>This app does NOT replace consultation with qualified electricians</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>The developer makes no warranties and accepts no liability for damages, losses, or injuries</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>You use this app entirely at your own risk</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-400 italic text-center pt-1">
              By continuing, you acknowledge you have read and accept these terms.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cyan-500/30">
            <Button
              onClick={onDecline}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-6 rounded-xl"
            >
              Exit App
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-xl"
            >
              I Understand and Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
