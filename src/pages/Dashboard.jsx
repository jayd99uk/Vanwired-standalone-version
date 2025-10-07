
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Cable,
  Zap,
  Sun,
  Shield,
  ExternalLink,
  CheckSquare
} from "lucide-react";

const tools = [
  {
    title: "Cable Converter",
    description: "AWG ⟷ mm²",
    icon: Cable,
    url: createPageUrl("CableConverter"),
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    title: "Watts Triangle",
    description: "V · A · W",
    icon: Zap,
    url: createPageUrl("WattsTriangle"),
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    title: "Solar & Battery",
    description: "Power system sizing",
    icon: Sun,
    url: createPageUrl("SolarBattery"),
    gradient: "from-green-500 to-emerald-600"
  },
  {
    title: "Cable & Fuse",
    description: "Size + protection",
    icon: Shield,
    url: createPageUrl("CableSystem"),
    gradient: "from-orange-500 to-red-600"
  },
  {
    title: "Checklists",
    description: "Track your build",
    icon: CheckSquare,
    url: createPageUrl("Checklists"),
    gradient: "from-pink-500 to-rose-600"
  },
  {
    title: "Resources",
    description: "Suppliers & guides",
    icon: ExternalLink,
    url: createPageUrl("Resources"),
    gradient: "from-indigo-500 to-purple-600"
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <Zap className="w-20 h-20 md:w-28 md:h-28 text-cyan-400 van-glow" />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 van-glow text-white uppercase tracking-tight" style={{fontFamily: 'Orbitron, sans-serif'}}>
            VanWired
          </h1>
          
          <p className="text-xl md:text-2xl text-cyan-300 font-medium mb-2">
            Your Self-Build Wiring Assistant
          </p>
          
          <div className="mt-6 w-32 h-1 mx-auto bg-gradient-to-r from-cyan-500 via-purple-600 to-orange-500 neon-glow rounded-full"></div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.url}
              className="cyber-card rounded-2xl p-6 group cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 mb-4 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <tool.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors" style={{fontFamily: 'Orbitron, sans-serif'}}>
                  {tool.title}
                </h3>
                
                <p className="text-sm text-gray-300">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-xs md:text-sm text-cyan-400/60 uppercase tracking-widest font-semibold mb-2">
            Build • Wire • Adventure
          </p>
          <p className="text-xs text-gray-500">
            Mobile-First Electrical Tools for Van Lifers
          </p>
        </div>
      </div>
    </div>
  );
}
