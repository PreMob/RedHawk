import requests, re, json, os, argparse, sys, ssl, socket
from urllib.parse import urlparse, parse_qs
try:
    import google.generativeai as genai
except ImportError:
    genai = None

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
                results["outdated"].append(xpb)        # Enhanced SQL injection test: extract existing parameters and test comprehensively
        base_length = len(resp.text or "")
        base_content = resp.text or ""
        vuln_sql = []
        sql_injection_detected = False
        
        # Parse URL to extract existing parameters
        parsed_url = urlparse(url)
        existing_params = parse_qs(parsed_url.query)
        
        # SQL injection payloads
        sql_payloads = {
            "true_condition": "' OR '1'='1",
            "false_condition": "' OR '1'='2", 
            "union_select": "' UNION SELECT 1,2,3--",
            "error_based": "' AND (SELECT COUNT(*) FROM (SELECT 1 UNION SELECT 2)x GROUP BY CONCAT(version(),FLOOR(RAND(0)*2)))--",
            "time_delay": "' OR SLEEP(2)--",
            "numeric_true": " OR 1=1--",
            "numeric_false": " OR 1=2--",
            "quote_break": "'",
            "double_quote_break": '"',
            "comment_break": "/*"
        }
        
        # Test parameters found in URL
        test_params = list(existing_params.keys()) if existing_params else ["id", "title", "search", "q", "name"]
        
        for param_name in test_params:
            param_results = []
            baseline_response = None
            
            # Get baseline response for this parameter
            try:
                baseline_params = {}
                for k, v in existing_params.items():
                    baseline_params[k] = v[0] if v else ""
                
                baseline_req = requests.get(parsed_url.scheme + "://" + parsed_url.netloc + parsed_url.path, 
                                          params=baseline_params, timeout=8, headers=headers)
                baseline_response = baseline_req.text or ""
                baseline_length = len(baseline_response)
            except:
                baseline_length = base_length
                baseline_response = base_content
            
            for payload_name, payload in sql_payloads.items():
                try:
                    test_params_dict = {}
                    # Preserve existing parameters
                    for k, v in existing_params.items():
                        test_params_dict[k] = v[0] if v else ""
                    
                    # If testing an existing parameter, modify it; otherwise add the test parameter
                    if param_name in existing_params:
                        original_value = existing_params[param_name][0] if existing_params[param_name] else ""
                        test_params_dict[param_name] = original_value + payload
                    else:
                        test_params_dict[param_name] = payload
                    
                    r = requests.get(parsed_url.scheme + "://" + parsed_url.netloc + parsed_url.path, 
                                   params=test_params_dict, timeout=8, headers=headers)
                    
                    response_length = len(r.text or "")
                    response_content = r.text or ""
                    
                    # Check for SQL injection indicators
                    sql_errors = [
                        "mysql_fetch", "ORA-", "Microsoft OLE DB", "ODBC", "SQLException", 
                        "PostgreSQL", "Warning: mysql", "valid MySQL result", "MySqlClient",
                        "syntax error", "quoted string not properly terminated", "unclosed quotation mark",
                        "mysql_num_rows", "mysql_", "Warning:", "Fatal error", "Parse error",
                        "SQL syntax", "Database error", "ORA-01756", "Microsoft Access Driver",
                        "JET Database Engine", "Access Database Engine"
                    ]
                    
                    error_detected = any(error.lower() in response_content.lower() for error in sql_errors)
                    
                    # More sophisticated length analysis
                    length_diff = response_length - baseline_length
                    significant_length_change = abs(length_diff) > (baseline_length * 0.1)  # 10% change
                    
                    # Check for different response patterns
                    response_differs_significantly = False
                    if baseline_response and response_content:
                        # Simple content comparison
                        common_words = set(baseline_response.lower().split()) & set(response_content.lower().split())
                        total_words = len(set(baseline_response.lower().split()) | set(response_content.lower().split()))
                        if total_words > 0:
                            similarity = len(common_words) / total_words
                            response_differs_significantly = similarity < 0.7  # Less than 70% similarity
                    
                    test_result = {
                        "param": param_name,
                        "payload": payload_name, 
                        "length": response_length,
                        "length_diff": length_diff,
                        "error_detected": error_detected,
                        "significant_change": significant_length_change or response_differs_significantly
                    }
                    
                    param_results.append(test_result)
                    
                    # Mark as suspected if we detect SQL errors, significant anomalies, or response differences
                    if error_detected or significant_length_change or response_differs_significantly:
                        sql_injection_detected = True
                        
                except Exception as e:
                    results["errors"].append(f"Error testing SQL injection with payload '{payload_name}' on param '{param_name}': {str(e)}")
            
            vuln_sql.extend(param_results)
        
        results["vuln_tests"]["sql_injection"] = vuln_sql
        results["vuln_tests"]["sql_injection_suspected"] = sql_injection_detected# Enhanced XSS test: check reflection of payloads in existing parameters
        xss_payloads = [
            "<script>alert(1)</script>",
            "<img src=x onerror=alert(1)>",
            "<svg onload=alert(1)>",
            "javascript:alert(1)",
            "'\"><script>alert(1)</script>",
            "<iframe src=javascript:alert(1)>",
            "<body onload=alert(1)>",
            "<<SCRIPT>alert(1);//<</SCRIPT>"
        ]
        xss_results = []
        xss_detected = False
        
        for param_name in test_params:
            for payload in xss_payloads:
                try:
                    test_params_dict = {}
                    # Preserve existing parameters
                    for k, v in existing_params.items():
                        test_params_dict[k] = v[0] if v else ""
                    
                    # Test the parameter with XSS payload
                    if param_name in existing_params:
                        test_params_dict[param_name] = payload
                    else:
                        test_params_dict[param_name] = payload
                    
                    r = requests.get(parsed_url.scheme + "://" + parsed_url.netloc + parsed_url.path, 
                                   params=test_params_dict, timeout=8, headers=headers)
                    
                    response_content = r.text or ""
                    
                    # Check for direct reflection (exact match)
                    direct_reflected = payload in response_content
                      # Check for partial reflection (payload components)
                    partial_reflected = False
                    if "<script>" in payload and "<script>" in response_content.lower():
                        partial_reflected = True
                    elif "alert(" in payload and "alert(" in response_content.lower():
                        partial_reflected = True
                    elif "onerror=" in payload and "onerror=" in response_content.lower():
                        partial_reflected = True
                    
                    if direct_reflected or partial_reflected:
                        xss_detected = True
                    
                    xss_results.append({
                        "param": param_name,
                        "payload": payload, 
                        "reflected": direct_reflected,
                        "partial_reflected": partial_reflected
                    })
                    
                except Exception as e:
                    results["errors"].append(f"Error testing XSS with payload '{payload}' on param '{param_name}': {str(e)}")
        
        results["vuln_tests"]["xss"] = xss_results
        results["vuln_tests"]["xss_suspected"] = xss_detected

        # Add security header analysis as potential vulnerabilities
        critical_missing_headers = []
        if "missing_security_headers" in results:
            critical_headers = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options"]
            for header in results["missing_security_headers"]:
                if header in critical_headers:
                    critical_missing_headers.append(header)
        
        results["vuln_tests"]["missing_critical_headers"] = critical_missing_headers
        results["vuln_tests"]["missing_critical_headers_suspected"] = len(critical_missing_headers) > 0
    
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
    """Generate a brief summary of the scan results without using Gemini"""
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
    parser.add_argument("--skip-ai", action="store_true", help="Skip Gemini summary generation")
    args = parser.parse_args()
    url = args.url.rstrip("/")
    raw_results = scan_website(url)    # Summarize using Gemini
    summary_text = ""
    skip_ai = args.skip_ai
    
    if not skip_ai and genai and not raw_results.get("errors"):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GITHUB_TOKEN")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = f"Summarize the security scan results: {json.dumps(raw_results, indent=2)}"
                response = model.generate_content(prompt)
                summary_text = response.text.strip()
            except Exception as e:
                print(f"Error with Gemini API: {str(e)}", file=sys.stderr)
                summary_text = f"(Error using Gemini API: {str(e)})"
        else:
            summary_text = "(Gemini API key not found. Set GEMINI_API_KEY or GITHUB_TOKEN env variable.)"
    else:
        if skip_ai:
            summary_text = "(Gemini summary skipped by user request.)"
        elif raw_results.get("errors"):
            summary_text = "(Skipping Gemini summary due to scan errors.)"
        else:
            summary_text = "(Gemini library not installed; skipping summary.)"
      # Always add a manual summary as backup
    manual_summary = generate_manual_summary(raw_results)
    if not summary_text or "Error" in summary_text or "not found" in summary_text or "not installed" in summary_text:
        summary_text = manual_summary

    output = {"url": url, "raw_results": raw_results, "summary": summary_text}
    print(json.dumps(output, indent=2))

if __name__ == "__main__":   
    main()
