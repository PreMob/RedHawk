"use client"

import { DashboardLayout } from "../layout-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Globe, Loader2, Shield, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUrlScan } from "@/hooks/use-url-scan"
import { cn } from "@/lib/utils"

export default function UrlScanPage() {
  const { url, setUrl, scanUrl, isLoading, error, scanResult } = useUrlScan()

  const handleScan = async () => {
    await scanUrl()
  }

  const getBadgeForVulnerability = (vuln: string) => {
    if (vuln.includes("SQL Injection")) {
      return <Badge className="bg-red-500">HIGH</Badge>
    } else if (vuln.includes("XSS")) {
      return <Badge className="bg-red-500">HIGH</Badge>
    } else if (vuln.includes("Outdated")) {
      return <Badge className="bg-yellow-500">MEDIUM</Badge>
    } else {
      return <Badge className="bg-blue-500">INFO</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">URL Security Scanner</h1>
        
        <Card className="border-red-900/30 bg-black">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Scan a Website for Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Enter a URL to scan for common security vulnerabilities such as outdated software, SQL injection points, and cross-site scripting (XSS) vulnerabilities.
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 bg-black border-red-900/30 text-white focus-visible:ring-red-500"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleScan} 
                disabled={isLoading} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" /> 
                    Scan URL
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-900/20 border border-red-900/30 p-4 text-red-500 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {scanResult && (
          <div className="space-y-6">
            <Card className="border-red-900/30 bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Scan Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-400">Target URL</p>
                  <p className="text-white break-all">{scanResult.target_url}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-400">Scan Duration</p>
                  <p className="text-white">{scanResult.scan_duration_ms ? `${(scanResult.scan_duration_ms / 1000).toFixed(2)} seconds` : "N/A"}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-400">Summary</p>
                  <p className="text-white whitespace-pre-wrap">{scanResult.summary}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-400">Detected Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.raw_results.technologies.length > 0 ? (
                      scanResult.raw_results.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-900 text-white border-gray-700">
                          {tech}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No technologies detected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-400">Vulnerabilities</p>
                  {scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0 ? (
                    <div className="space-y-2">
                      {scanResult.vulnerabilities.map((vuln, index) => (
                        <div key={index} className="rounded-md bg-red-950/20 border border-red-900/30 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <p className="text-white">{vuln}</p>
                          </div>
                          {getBadgeForVulnerability(vuln)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md bg-green-950/20 border border-green-900/30 p-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <p className="text-white">No vulnerabilities detected in this scan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-900/30 bg-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">HTTP Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto rounded-md bg-black border border-red-900/30 p-4">
                  <pre className="text-xs text-gray-400">
                    {Object.entries(scanResult.raw_results.headers).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-red-400">{key}</span>: {value}
                      </div>
                    ))}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 