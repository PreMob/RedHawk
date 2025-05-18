import requests, re, json, os, argparse, sys, ssl, socket
from urllib.parse import urlparse
try:
    import openai
except ImportError:
    openai = None

def parse_version(header_value):
    """Extract version numbers from a header value (e.g. 'Apache/2.4.41')."""
    match = re.search(r'(\d+\.\d+(?:\.\d+)?)', header_value or "")
    return match.group(1) if match else None

def is_outdated_version(name, version_str):
    """Naive version check for demo."""
    if not version_str:
        return False
    try:
        parts = [int(p) for p in version_str.split('.')]
        if name == "Apache":
            # consider Apache 2.4.50+ as current (example threshold)
            if parts[0] == 2 and parts[1] == 4 and (parts[2] if len(parts)>2 else 0) < 50:
                return True
        if name == "nginx":
            # consider nginx 1.18+ as current
            if parts[0] == 1 and parts[1] < 18:
                return True
        if name == "PHP":
            # consider PHP 7.4+ as current (example threshold)
            if parts[0] == 7 and parts[1] < 4:
                return True
            if parts[0] < 7:
                return True
        return False
    except (ValueError, IndexError):
        return False

def check_ssl(url):
    """Check SSL certificate details and security"""
    result = {
        "valid": False,
        "issues": [],
        "certificate": {}
    }
    
    parsed_url = urlparse(url)
    if parsed_url.scheme != 'https':
        result["issues"].append("Not using HTTPS")
        return result
    
    hostname = parsed_url.netloc.split(':')[0]
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                result["valid"] = True
                result["certificate"] = {
                    "issuer": dict(x[0] for x in cert["issuer"]),
                    "subject": dict(x[0] for x in cert["subject"]),
                    "notBefore": cert["notBefore"],
                    "notAfter": cert["notAfter"]
                }
    except ssl.SSLError as e:
        result["issues"].append(f"SSL Error: {str(e)}")
    except (socket.gaierror, socket.timeout, ConnectionRefusedError) as e:
        result["issues"].append(f"Connection error: {str(e)}")
    except Exception as e:
        result["issues"].append(f"Error checking SSL: {str(e)}")
    
    return result

def scan_website(url):
    results = {
        "headers": {}, 
        "technologies": [], 
        "outdated": [], 
        "vuln_tests": {}, 
        "security_headers": {},
        "ssl_info": {},
        "errors": []
    }
    
    # Check if URL is properly formatted
    if not url.startswith(('http://', 'https://')):
        results["errors"].append("Invalid URL format. URL must start with http:// or https://")
        return results
    
    # Check SSL if using HTTPS
    if url.startswith('https://'):
        results["ssl_info"] = check_ssl(url)
    else:
        results["ssl_info"] = {"valid": False, "issues": ["Not using HTTPS"]}
    
    # Send GET to grab headers (banner grabbing)
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        resp = requests.get(url, timeout=8, headers=headers, allow_redirects=True)
        results["headers"] = dict(resp.headers)

        # Check important security headers
        security_headers = {
            "Content-Security-Policy": resp.headers.get("Content-Security-Policy"),
            "Strict-Transport-Security": resp.headers.get("Strict-Transport-Security"),
            "X-Content-Type-Options": resp.headers.get("X-Content-Type-Options"),
            "X-Frame-Options": resp.headers.get("X-Frame-Options"),
            "X-XSS-Protection": resp.headers.get("X-XSS-Protection"),
            "Referrer-Policy": resp.headers.get("Referrer-Policy")
        }
        results["security_headers"] = {k: v for k, v in security_headers.items() if v is not None}
        
        # Missing security headers
        missing_headers = [k for k, v in security_headers.items() if v is None]
        if missing_headers:
            results["missing_security_headers"] = missing_headers

        # Identify server/framework from headers
        server = resp.headers.get("Server")
        xpb = resp.headers.get("X-Powered-By")
        if server:
            results["technologies"].append(server)
            ver = parse_version(server)
            # Check outdated (demo logic)
            if is_outdated_version("Apache", ver) or is_outdated_version("nginx", ver) or is_outdated_version("Microsoft-IIS", ver):
                results["outdated"].append(server)
        if xpb:
            results["technologies"].append(xpb)
            ver = parse_version(xpb)
            if is_outdated_version("PHP", ver) or is_outdated_version("Apache", ver):
                results["outdated"].append(xpb)

        # Basic SQL injection test: compare response lengths
        base_length = len(resp.text or "")
        vuln_sql = []
        payloads = {"true": "' OR '1'='1", "false": "' OR '1'='2"}
        for name, payload in payloads.items():
            try:
                r = requests.get(url, params={"id": payload}, timeout=5, headers=headers)
                vuln_sql.append({"test": name, "length": len(r.text or "")})
            except Exception as e:
                results["errors"].append(f"Error testing SQL injection with payload '{name}': {str(e)}")
        
        results["vuln_tests"]["sql_injection"] = vuln_sql
        # If the "true" payload returns a different length than "false", suspect SQLi
        if len(vuln_sql) == 2:
            if vuln_sql[0]["length"] != vuln_sql[1]["length"]:
                results["vuln_tests"]["sql_injection_suspected"] = True
            else:
                results["vuln_tests"]["sql_injection_suspected"] = False

        # Basic XSS test: check reflection of payload
        xss_payloads = ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>"]
        xss_results = []
        for payload in xss_payloads:
            try:
                r = requests.get(url, params={"id": payload}, timeout=5, headers=headers)
                reflected = payload in (r.text or "")
                xss_results.append({"payload": payload, "reflected": reflected})
            except Exception as e:
                results["errors"].append(f"Error testing XSS with payload '{payload}': {str(e)}")
        
        results["vuln_tests"]["xss"] = xss_results
        results["vuln_tests"]["xss_suspected"] = any(r.get("reflected", False) for r in xss_results)
    
    except requests.exceptions.ConnectionError as e:
        results["errors"].append(f"Connection error: {str(e)}")
    except requests.exceptions.Timeout as e:
        results["errors"].append(f"Timeout error: {str(e)}")
    except requests.exceptions.TooManyRedirects as e:
        results["errors"].append(f"Too many redirects: {str(e)}")
    except requests.exceptions.RequestException as e:
        results["errors"].append(f"Request error: {str(e)}")
    except Exception as e:
        results["errors"].append(f"Unexpected error: {str(e)}")

    return results

def generate_manual_summary(results):
    """Generate a brief summary of the scan results without using OpenAI"""
    summary = []
    
    # Check for errors
    if results.get("errors"):
        summary.append(f"Scan encountered {len(results['errors'])} error(s):")
        for error in results["errors"][:3]:  # Show up to 3 errors
            summary.append(f"- {error}")
        if len(results["errors"]) > 3:
            summary.append(f"- And {len(results['errors']) - 3} more error(s)...")
        return "\n".join(summary)
    
    # Server technologies
    if results["technologies"]:
        summary.append(f"Detected technologies: {', '.join(results['technologies'])}")
    else:
        summary.append("No specific server technologies were identified.")
    
    # Outdated versions
    if results["outdated"]:
        summary.append(f"Potentially outdated software: {', '.join(results['outdated'])}")
    
    # SQL injection
    if results["vuln_tests"].get("sql_injection_suspected", False):
        summary.append("WARNING: SQL Injection vulnerability potentially detected!")
    
    # XSS
    if results["vuln_tests"].get("xss_suspected", False):
        summary.append("WARNING: Cross-Site Scripting (XSS) vulnerability potentially detected!")
    
    if not results["outdated"] and not results["vuln_tests"].get("sql_injection_suspected", False) and not results["vuln_tests"].get("xss_suspected", False):
        summary.append("No obvious security issues detected in this basic scan.")
    
    return "\n".join(summary)

def main():
    parser = argparse.ArgumentParser(description="Lightweight web scanner")
    parser.add_argument("url", help="Target URL to scan (include http:// or https://)")
    parser.add_argument("--skip-ai", action="store_true", help="Skip OpenAI summary generation")
    args = parser.parse_args()
    url = args.url.rstrip("/")
    raw_results = scan_website(url)

    # Summarize using OpenAI
    summary_text = ""
    skip_ai = args.skip_ai
    
    if not skip_ai and openai and not raw_results.get("errors"):
        api_key = os.getenv("GITHUB_TOKEN") or os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                client = openai.OpenAI(api_key=api_key)
                prompt = f"Summarize the security scan results: {json.dumps(raw_results, indent=2)}"
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0
                )
                summary_text = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Error with OpenAI API: {str(e)}", file=sys.stderr)
                summary_text = f"(Error using OpenAI API: {str(e)})"
        else:
            summary_text = "(OpenAI API key not found. Set GITHUB_TOKEN or OPENAI_API_KEY env variable.)"
    else:
        if skip_ai:
            summary_text = "(OpenAI summary skipped by user request.)"
        elif raw_results.get("errors"):
            summary_text = "(Skipping OpenAI summary due to scan errors.)"
        else:
            summary_text = "(OpenAI library not installed; skipping summary.)"
    
    # Always add a manual summary as backup
    manual_summary = generate_manual_summary(raw_results)
    if not summary_text or "Error" in summary_text or "not found" in summary_text or "not installed" in summary_text:
        summary_text = manual_summary

    output = {"url": url, "raw_results": raw_results, "summary": summary_text}
    print(json.dumps(output, indent=2))

if __name__ == "__main__":   
    main()
