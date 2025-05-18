import { useState } from 'react';

interface ScanResult {
  scan_id?: string;
  target_url: string;
  summary: string;
  vulnerabilities: string[];
  raw_results: {
    headers: Record<string, string>;
    technologies: string[];
    outdated: string[];
    vuln_tests: {
      sqlInjection: any[];
      sqlInjectionSuspected: boolean;
      xss: any[];
      xssSuspected: boolean;
    };
    errors: string[];
  };
  scan_duration_ms?: number;
}

export function useUrlScan() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scanUrl = async (targetUrl?: string) => {
    // Use provided targetUrl or state
    const urlToScan = targetUrl || url;
    
    // Basic URL validation
    if (!urlToScan.trim() || !urlToScan.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scan/scan-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_url: urlToScan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan URL');
      }

      const data = await response.json();
      setScanResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setUrl('');
    setError(null);
    setScanResult(null);
  };

  return {
    url,
    setUrl,
    scanUrl,
    isLoading,
    error,
    scanResult,
    reset,
  };
} 