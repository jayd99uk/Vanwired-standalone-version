
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Zap, Sun, Wrench, BookOpen, Users } from "lucide-react";

const resourceCategories = [
  {
    title: "Solar & Battery Manufacturers",
    icon: Sun,
    color: "from-yellow-500 to-orange-500",
    resources: [
      {
        name: "Victron Energy",
        description: "Premium solar charge controllers, inverters, and monitoring systems",
        url: "https://www.victronenergy.com",
        specialty: "Professional grade equipment"
      },
      {
        name: "Renogy",
        description: "Complete solar kits and components for RV and marine use",
        url: "https://www.renogy.com",
        specialty: "DIY-friendly solar kits"
      },
      {
        name: "Battle Born Batteries",
        description: "Premium LiFePO4 batteries made for RV and marine applications",
        url: "https://battlebornbatteries.com",
        specialty: "Lithium battery specialists"
      },
      {
        name: "Roamer",
        description: "UK-based leisure battery specialist offering AGM and lithium batteries",
        url: "https://www.roamerbatteries.com",
        specialty: "UK leisure batteries"
      },
      {
        name: "AIMS Power",
        description: "Inverters, chargers, and power conversion equipment",
        url: "https://www.aimscorp.net",
        specialty: "Inverter systems"
      }
    ]
  },
  {
    title: "Electrical Components",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    resources: [
      {
        name: "12V Planet",
        description: "UK supplier specializing in 12V and 24V equipment for campervans and boats",
        url: "https://www.12voltplanet.co.uk",
        specialty: "UK 12V/24V specialists"
      },
      {
        name: "Blue Sea Systems",
        description: "Circuit protection, switches, and electrical panels for marine/RV use",
        url: "https://www.bluesea.com",
        specialty: "Marine-grade electrical"
      },
      {
        name: "MaxxFan",
        description: "Premium roof ventilation fans with rain sensors for vans and RVs",
        url: "https://www.maxxair.com",
        specialty: "Roof ventilation fans"
      },
      {
        name: "Truma",
        description: "Heating, air conditioning, and energy systems for mobile living",
        url: "https://www.truma.com",
        specialty: "Climate control systems"
      },
      {
        name: "Digi-Key Electronics",
        description: "Vast selection of electronic components and tools",
        url: "https://www.digikey.com",
        specialty: "Electronic components"
      },
      {
        name: "AutoZone",
        description: "Automotive electrical supplies and accessories",
        url: "https://www.autozone.com",
        specialty: "12V automotive parts"
      },
      {
        name: "West Marine",
        description: "Marine electrical supplies perfect for van builds",
        url: "https://www.westmarine.com",
        specialty: "Marine electrical gear"
      }
    ]
  },
  {
    title: "Tools & Installation",
    icon: Wrench,
    color: "from-green-500 to-emerald-600",
    resources: [
      {
        name: "Fluke",
        description: "Professional electrical testing and measurement tools",
        url: "https://www.fluke.com",
        specialty: "Electrical testing tools"
      },
      {
        name: "Klein Tools",
        description: "Electrician tools and safety equipment",
        url: "https://www.kleintools.com",
        specialty: "Professional electrician tools"
      },
      {
        name: "Ancor Marine",
        description: "Marine grade wire, connectors, and electrical accessories",
        url: "https://www.ancorproducts.com",
        specialty: "Marine wire & connectors"
      }
    ]
  },
  {
    title: "Learning Resources",
    icon: BookOpen,
    color: "from-purple-500 to-pink-600",
    resources: [
      {
        name: "Will Prowse YouTube",
        description: "Solar power tutorials and product reviews for DIY builders",
        url: "https://www.youtube.com/c/WillProwse",
        specialty: "Solar education"
      },
      {
        name: "Greg Virgo YouTube",
        description: "UK-based vanlife builder sharing detailed build guides and electrical tutorials",
        url: "https://www.youtube.com/@GregVirgo",
        specialty: "UK vanlife builds"
      },
      {
        name: "Cheap RV Living",
        description: "Budget vanlife tips and electrical system guides",
        url: "https://cheaprvliving.com",
        specialty: "Budget vanlife builds"
      },
      {
        name: "Solar-Electric.com",
        description: "Comprehensive guides on solar electric systems",
        url: "https://www.solar-electric.com",
        specialty: "Solar system design"
      },
      {
        name: "NEC Code Book",
        description: "National Electrical Code for proper electrical installation",
        url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70",
        specialty: "Electrical codes & safety"
      }
    ]
  },
  {
    title: "Community & Forums",
    icon: Users,
    color: "from-indigo-500 to-blue-600",
    resources: [
      {
        name: "UK Campsite Forum",
        description: "UK's largest camping and caravanning community forum",
        url: "https://www.ukcampsite.co.uk/chatter",
        specialty: "UK camping community"
      },
      {
        name: "Motorhome Fun",
        description: "Active UK motorhome and campervan forum with technical advice",
        url: "https://www.motorhomefun.co.uk/forum",
        specialty: "UK motorhome forum"
      },
      {
        name: "VW T4 Forum",
        description: "Dedicated community for VW T4, T5, and T6 van conversions",
        url: "https://www.t4forum.co.uk",
        specialty: "VW van conversions"
      },
      {
        name: "Vanlife UK - Facebook Group",
        description: "Large Facebook community for UK-based vanlifers sharing tips and builds",
        url: "https://www.facebook.com/groups/vanlifeuk",
        specialty: "UK vanlife community"
      },
      {
        name: "Self Build Motorhomes & Campervans - Facebook",
        description: "UK Facebook group focused on DIY campervan conversions",
        url: "https://www.facebook.com/groups/selfbuildmotorhomes",
        specialty: "DIY conversion support"
      },
      {
        name: "Cheap RV Living Forum",
        description: "Active community of budget-conscious van lifers",
        url: "https://cheaprvliving.com/forums",
        specialty: "Budget builds & tips"
      },
      {
        name: "Reddit - r/vandwellers",
        description: "Large community sharing builds, tips, and experiences",
        url: "https://reddit.com/r/vandwellers",
        specialty: "General vanlife community"
      },
      {
        name: "Skoolies.net",
        description: "School bus and large vehicle conversion community",
        url: "https://www.skoolies.net",
        specialty: "Large vehicle conversions"
      },
      {
        name: "DIY Solar Forums",
        description: "Technical discussions on solar power systems",
        url: "https://diysolarforum.com",
        specialty: "Solar technical support"
      }
    ]
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Vanlife Resource Library
          </h1>
          <p className="text-xl text-cyan-300 max-w-2xl mx-auto">
            Curated collection of trusted suppliers, tools, and learning resources for your vanlife electrical build
          </p>
        </div>

        {/* Resource Categories */}
        <div className="space-y-12">
          {resourceCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{category.title}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.resources.map((resource) => (
                  <Card 
                    key={resource.name} 
                    className="cyber-card border-cyan-500/30 group"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-cyan-300 transition-colors flex items-center gap-2 text-white">
                        {resource.name}
                        <ExternalLink className="w-4 h-4 opacity-50 text-cyan-400" />
                      </CardTitle>
                      <div className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full inline-block border border-cyan-500/30">
                        {resource.specialty}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {resource.description}
                      </p>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="cyber-card border-cyan-500/30 mt-12">
          <CardContent className="p-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">
                Disclaimer
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                These resources are provided for informational purposes only. VanBuild Assistant is not affiliated with any of these companies and does not receive compensation for recommendations. Always verify product specifications and consult with qualified professionals for your specific electrical installation needs. Links may become outdated over time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
