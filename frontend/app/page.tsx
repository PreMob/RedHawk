import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedHeroSection } from "@/components/animated-hero-section"
import { Server, ChevronRight, BarChart3, Globe, FileText, Network, AlertTriangle } from "lucide-react"
import {InteractiveHoverButton} from "@/components/magicui/interactive-hover-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-red-900/30 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-xl font-bold tracking-tighter text-red-500">RedHawk</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-sm hover:text-red-500 transition-colors">
              Home
            </Link>
          </nav>
          {/*<Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-950 hover:text-white">*/}
          {/*  Get Protected*/}
          {/*</Button>*/}


        </div>
      </header>

      {/* Hero Section with Animated Hawk Eye */}
      <AnimatedHeroSection />

      {/* Features Section - Updated with penetration testing context */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-red-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-Powered Penetration Testing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              RedHawk simulates penetration testing by analyzing application and network logs to detect threats before
              they cause damage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-10 w-10 text-red-500" />,
                title: "Log Analysis",
                description:
                  "Ingests and parses log data from your applications and networks to identify potential security vulnerabilities and attack vectors.",
              },
              {
                icon: <AlertTriangle className="h-10 w-10 text-red-500" />,
                title: "Anomaly Detection",
                description:
                  "Uses advanced machine learning algorithms to detect anomalous or malicious activities that might indicate a security breach.",
              },
              {
                icon: <Network className="h-10 w-10 text-red-500" />,
                title: "Attack Path Mapping",
                description:
                  "Maps potential attack paths and lateral movement strategies that attackers might use to compromise your systems.",
              },
              {
                icon: <Server className="h-10 w-10 text-red-500" />,
                title: "Network Security",
                description:
                  "Comprehensive protection for your entire network infrastructure against external and internal threats.",
              },
              {
                icon: <BarChart3 className="h-10 w-10 text-red-500" />,
                title: "Threat Intelligence",
                description:
                  "Stay ahead of emerging threats with our advanced threat intelligence platform that analyzes global security trends.",
              },
              {
                icon: <Globe className="h-10 w-10 text-red-500" />,
                title: "Interactive Dashboard",
                description:
                  "Presents security findings through an intuitive and interactive frontend dashboard for easy understanding and action.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-black/50 border border-red-900/30 p-8 rounded-lg hover:border-red-500/50 transition-all duration-300"
              >
                <div className="mb-4 bg-red-950/30 p-3 rounded-lg inline-block">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Protect You Section */}
      <section className="py-16 md:py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/10 via-black to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-red-950/50 border border-red-900/50 text-red-500 text-xs font-medium mb-4">
                Our Approach
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How RedHawk Protects Your Digital Assets</h2>
              <p className="text-gray-400 mb-8">
                Our multi-layered security approach combines advanced technology with expert human analysis to provide
                comprehensive protection against evolving cyber threats.
              </p>

              <div className="space-y-6">
                {[
                  {
                    number: "01",
                    title: "Identify",
                    description: "We conduct thorough assessments to identify vulnerabilities in your systems.",
                  },
                  {
                    number: "02",
                    title: "Protect",
                    description: "Implement robust security measures tailored to your specific needs.",
                  },
                  {
                    number: "03",
                    title: "Detect",
                    description: "Continuous monitoring to detect threats before they can cause damage.",
                  },
                  {
                    number: "04",
                    title: "Respond",
                    description: "Rapid incident response to contain and mitigate security breaches.",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="text-xl font-bold text-red-500">{step.number}</div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-900 rounded-lg blur opacity-30"></div>
              <div className="relative bg-black border border-red-900/50 rounded-lg p-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "99.9%", label: "Threat Detection Rate" },
                    { value: "24/7", label: "Continuous Monitoring" },
                    { value: "500+", label: "Enterprise Clients" },
                    { value: "<15min", label: "Response Time" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg text-center">
                      <div className="text-2xl md:text-3xl font-bold text-red-500 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-red-900/30">
                  <h3 className="text-lg font-bold mb-3">Latest Threat Intelligence</h3>
                  <div className="space-y-3">
                    {[
                      "Ransomware attacks increased by 43% in the last quarter",
                      "New zero-day vulnerability discovered in popular CMS platforms",
                      "Supply chain attacks targeting software dependencies on the rise",
                    ].map((alert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        <p className="text-sm text-gray-400">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-red-950/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See what our clients say about RedHawk's cybersecurity solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "RedHawk's security solutions have been instrumental in protecting our sensitive data from advanced threats.",
                author: "Riggs",
                role: "Frontend Developer in RedHawk Security",
              },
              {
                quote:
                  "The real-time threat detection capabilities have saved us from multiple potential breaches. Highly recommended.",
                author: "Panchal Preet",
                role: "Ml Enginers",
              },
              {
                quote:
                  "Implementing RedHawk's security framework was seamless and the results have exceeded our expectations.",
                author: "Soumya",
                role: "Cybersecurity Engineer at RedHawk Security",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-black/50 border border-red-900/30 p-6 rounded-lg relative">
                <div className="absolute -top-3 -left-3 text-4xl text-red-500 opacity-30">"</div>
                <p className="text-gray-300 mb-6 relative z-10">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-red-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-red-950/50 to-black border border-red-900/30 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your digital assets?</h2>
                <p className="text-gray-400 mb-6">
                  Get started with RedHawk's advanced cybersecurity solutions today and protect your business from
                  evolving threats.
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Schedule a Security Assessment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-black/40 border border-red-900/30 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-950 flex items-center justify-center text-red-500 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Security Assessment</h3>
                      <p className="text-sm text-gray-400">We analyze your current security posture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-950 flex items-center justify-center text-red-500 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Custom Solution</h3>
                      <p className="text-sm text-gray-400">We design a tailored security strategy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-950 flex items-center justify-center text-red-500 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Implementation</h3>
                      <p className="text-sm text-gray-400">Seamless deployment with minimal disruption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
