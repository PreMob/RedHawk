"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Globe, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../../components/ui/input";
import { AnimatedEye } from "../../components/animated-eye";
import Image from "next/image";
import { FileUpload } from "../../components/file-upload";

export default function LandingPage() {
    const router = useRouter()
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    const handleTestUrl = () => {
        setIsLoading(true)
        // Simulate loading
        setTimeout(() => {
            router.push("/dashboard")
        }, 1500)
    }

    const handleLogUpload = async (data: any[]) => {
        // If we received data from the FileUpload component, it means CSV parsing was successful
        if (data && data.length > 0) {
            // Show upload success state immediately
            setUploadSuccess(true);
            
            // Show success message for 1.5 seconds before redirecting
            setTimeout(() => {
                // Redirect to dashboard
                router.push("/dashboard");
            }, 1500);
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <header className="border-b border-red-900/30 bg-black px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-950">
                            <Image src="/logo.png" width={40} height={40} alt="RedHawk Logo" className="rounded-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-white">RedHawk</span>
                            <span className="text-xs text-gray-400">Cybersecurity Platform</span>
                        </div>
                    </div>

                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-black to-red-950/10">
                <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left side - Animated eye and text */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="mb-6">
                            <AnimatedEye />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                            Advanced <span className="text-red-500">Threat</span> Detection
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md mb-6">
                            RedHawk provides real-time monitoring and AI-powered analysis to protect your digital assets from
                            sophisticated cyber threats.
                        </p>
                    </div>

                    {/* Right side - Option cards */}
                    <div className="space-y-6">
                        <Card className="border-red-900/30 bg-black hover:bg-red-950/10 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-red-500" />
                                    Upload Log Files
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Upload your security logs for analysis and threat detection
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 mb-4">
                                    Our AI will analyze your log files to identify potential security threats, vulnerabilities, and
                                    suspicious activities.
                                </p>
                                <FileUpload onFileUpload={handleLogUpload} />
                                <div className="mt-4">
                                    <Button 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2" 
                                        onClick={() => router.push('/dashboard')}
                                    >
                                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {uploadSuccess && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => router.push("/dashboard")}>
                                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                                {!uploadSuccess && (
                                    <p className="text-xs text-gray-500 text-center w-full">
                                        Supported file types: CSV, LOG files
                                    </p>
                                )}
                            </CardFooter>
                        </Card>

                        <Card className="border-red-900/30 bg-black hover:bg-red-950/10 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-red-500" />
                                    Test URL Security
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Check if a website or URL contains potential security threats
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 mb-4">
                                    Enter a URL to scan for malware, phishing attempts, and other security vulnerabilities.
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="bg-black text-white border-red-900/30 focus-visible:ring-red-500 "
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleTestUrl}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="animate-pulse mr-2">Analyzing</span>
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        </>
                                    ) : (
                                        "Test URL"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>

        </div>
    )
}
