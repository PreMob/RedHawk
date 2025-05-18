import os
import json
import argparse
import sys
import re
import time
from functools import lru_cache
from typing import Dict, List, Any, Optional
import gzip
from concurrent.futures import ThreadPoolExecutor

class RedHawkAssistant:
    """
    RedHawk Assistant - A cybersecurity-focused chatbot with broad technical knowledge
    """
    
    def __init__(self, api_key=None, summary_file=None):
        """Initialize the assistant with OpenAI API key and optional summary data"""
        self.api_key = api_key
        self.summary_data = None
        self.response_cache = {}
        self.cache_ttl = 300  # Cache TTL in seconds (5 minutes)
        
        # Expanded cybersecurity keywords (100+ terms)
        self.cybersec_keywords = [
            'attack', 'security', 'threat', 'vulnerability', 'exploit', 'malware',
            'virus', 'ransomware', 'phishing', 'breach', 'hack', 'incident', 'firewall',
            'encryption', 'authentication', 'authorization', 'log', 'network', 'intrusion',
            'detection', 'prevention', 'mitigation', 'risk', 'compliance', 'policy',
            'password', 'access', 'control', 'audit', 'secure', 'protection', 'defense',
            'anomaly', 'alert', 'monitor', 'scan', 'patch', 'update', 'backdoor', 'bot',
            'botnet', 'ddos', 'spoofing', 'trojan', 'worm', 'zero-day', 'penetration',
            'pentest', 'cyber', 'cryptography', 'port', 'protocol', 'siem', 'ids', 'ips',
            'summary', 'analysis', 'report', 'ioc', 'ttp', 'apt', 'cve', 'cwe', 'mitre',
            'owasp', 'sql injection', 'xss', 'csrf', 'iam', 'vpn', 'proxy', 'sandbox',
            'honeypot', 'keylogger', 'rootkit', 'spyware', 'adware', 'cryptojacking',
            'deepfake', 'identity theft', 'data breach', 'denial of service', 'mitm',
            'eavesdropping', 'clickjacking', 'session hijacking', 'dark web', 'tor',
            'phishing kit', 'spear phishing', 'whaling', 'smishing', 'vishing', 'pretexting',
            'baiting', 'quid pro quo', 'tailgating', 'shoulder surfing', 'dumpster diving',
            'malware analysis', 'reverse engineering', 'incident response', 'disaster recovery',
            'business continuity', 'cyber insurance', 'gdpr', 'hipaa', 'pci dss', 'iso 27001',
            'nist', 'threat intelligence', 'threat hunting', 'red team', 'blue team',
            'purple team', 'security awareness', 'endpoint protection', 'edr', 'ngav', 'dlp',
            'ueba', 'zero trust', 'microsegmentation', 'acl', 'biometric', 'mfa', 'sso',
            'password manager', 'hsm', 'digital signature', 'ca', 'pki', 'ssl', 'tls', 'ssh',
            'dnssec', 'dmarc', 'dkim', 'spf', 'ipsec', 'ransomware', 'wannacry', 'notpetya'
        ]

        # General tech keywords for broader technical context
        self.general_tech_keywords = [
            'computer', 'software', 'hardware', 'internet', 'website', 'data',
            'server', 'cloud', 'database', 'programming', 'code', 'router',
            'windows', 'linux', 'macos', 'android', 'ios', 'api', 'ai', 'ml',
            'application', 'system', 'device', 'tech', 'technology', 'it',
            'information technology', 'network', 'wifi', 'ethernet', 'browser'
        ]

        # Predefined simple answers for common cybersecurity terms
        self.keyword_responses = {
            'phishing': "Phishing is a cyber attack using disguised emails to steal sensitive information. "
                       "Always verify sender addresses and avoid clicking suspicious links.",
            'ransomware': "Ransomware encrypts files and demands payment for decryption. "
                         "Regular backups and updated security software are key defenses.",
            'malware': "Malware is malicious software designed to damage or gain unauthorized access. "
                      "Use reputable antivirus software and keep systems updated.",
            'ddos': "DDoS attacks overwhelm systems with traffic. Mitigation includes traffic filtering "
                   "and cloud-based protection services.",
            'firewall': "Firewalls monitor network traffic to block unauthorized access. "
                       "Ensure yours is properly configured and updated.",
            'encryption': "Encryption protects data by converting it into secure code. "
                         "Use strong encryption protocols for sensitive communications.",
            'vpn': "VPNs secure internet connections by encrypting data. "
                  "Always use a reputable VPN service, especially on public networks.",
            'patch': "Regular software patches fix security vulnerabilities. "
                    "Enable automatic updates whenever possible.",
            'zero-day': "Zero-day exploits target unknown vulnerabilities. "
                       "Use threat intelligence feeds and behavior-based detection systems.",
            'iot': "IoT devices often have weak security. Change default passwords "
                  "and keep firmware updated on all smart devices."
        }

        # Load summary data if provided
        if summary_file and os.path.exists(summary_file):
            try:
                if summary_file.endswith('.gz'):
                    with gzip.open(summary_file, 'rt') as f:
                        self.summary_data = json.load(f)
                else:
                    with open(summary_file, 'r') as f:
                        self.summary_data = json.load(f)
                self._preprocess_summary_data()
                print(f"Loaded summary data from {summary_file}")
            except Exception as e:
                print(f"Error loading summary file: {str(e)}")
                
    def _preprocess_summary_data(self):
        """Pre-process summary data for faster access"""
        if not self.summary_data:
            return
            
        self.meta = self.summary_data.get("meta", {})
        self.file_summaries = self.summary_data.get("file_summaries", [])
        self.prediction_counts = {}
        self.recommended_actions = []
        
        for summary in self.file_summaries:
            if "prediction_counts" in summary:
                for category, count in summary.get("prediction_counts", {}).items():
                    self.prediction_counts[category] = self.prediction_counts.get(category, 0) + count
            if "recommended_actions" in summary:
                self.recommended_actions.extend(summary.get("recommended_actions", []))
    
    def is_cybersecurity_question(self, query):
<<<<<<< HEAD
        """Check if the query is related to cybersecurity"""
        # Always return True for common questions
        if query.lower().startswith(('what', 'how', 'tell', 'give', 'are there', 'is there', 'should i', 'overview', 'summary', 'recommended', 'recommend', 'action')):
            return True
            
        query_lower = query.lower()
        
        # Check if query contains any cybersecurity keywords
        for keyword in self.cybersec_keywords:
            if keyword.lower() in query_lower:
                return True
        
        # Use a simple regex to detect common question patterns about cybersecurity
        cybersec_patterns = [
            r'how\s+to\s+protect',
            r'what\s+is\s+a\s+(secure|safe)',
            r'how\s+(can|do)\s+I\s+(secure|protect)',
            r'best\s+practices',
            r'is\s+it\s+safe',
            r'security\s+best\s+practices',
            r'threat\s+intelligence',
            r'tell\s+me\s+about\s+the\s+(logs|summary|analysis|alerts)',
            r'what\s+do\s+the\s+(logs|summary|analysis|alerts)\s+show',
            r'summarize',
            r'ip',
            r'address',
            r'next',
            r'action',
            r'recommend',
            r'overview'
        ]
        
        for pattern in cybersec_patterns:
            if re.search(pattern, query_lower):
                return True
        
=======
        """Determine if query is cybersecurity-related or general tech"""
        query_lower = query.lower()
        
        # Check against cybersecurity keywords
        if any(re.search(r'\b' + re.escape(keyword) + r'\b', query_lower) 
               for keyword in self.cybersec_keywords):
            return True
            
        # Check against general tech keywords
        if any(re.search(r'\b' + re.escape(keyword) + r'\b', query_lower) 
               for keyword in self.general_tech_keywords):
            return True
            
>>>>>>> a7baf488 (The Beganinng of the end)
        return False
    
    @lru_cache(maxsize=100)
    def _get_relevant_summary_data(self, query_type):
        """Get relevant summary data based on query type"""
        if not self.summary_data:
            return None
            
        if query_type == "meta":
            return {
                "total_files_analyzed": self.meta.get("total_files_analyzed", 1),
                "total_records_analyzed": self.meta.get("total_records_analyzed", 0),
                "high_sensitivity_alerts": self.meta.get("high_sensitivity_total", 0),
                "total_alerts": self.meta.get("alert_status_total", 0)
            }
        elif query_type == "summary" and self.file_summaries:
            return self.file_summaries[0].get("text_summary", "")
        elif query_type == "actions":
            return self.recommended_actions[:5] if self.recommended_actions else []
        elif query_type == "predictions":
            return self.prediction_counts
            
        return None
    
    def _prepare_context(self, query):
        """Prepare context for the query"""
        system_message = """You are RedHawk Assistant, an AI assistant with expertise in cybersecurity and security log analysis.

Your personality:
- Helpful, friendly, and conversational
- Knowledgeable about cybersecurity concepts and threats
- You speak in clear, natural language that's easy to understand
- You're concise but thorough
- You respond in a way that sounds like a helpful colleague, not a rigid system

While you have expertise in cybersecurity, you can also engage with users on other topics in a friendly manner. 
When discussing security, provide practical, actionable advice without unnecessary jargon.

Use a conversational tone that feels natural, as if two colleagues were chatting. Occasionally use light humor when appropriate."""
        
<<<<<<< HEAD
        # Debug API key (mask it for security)
        api_key_debug = "None"
=======
        # Add relevant summary data context if available
        if self.summary_data:
            meta_data = self._get_relevant_summary_data("meta")
            if meta_data:
                system_message += "\n\nLog analysis statistics:\n"
                for key, value in meta_data.items():
                    system_message += f"- {key.replace('_', ' ').title()}: {value}\n"
            
            # Determine what additional context to add based on the query
            query_lower = query.lower()
            if "summar" in query_lower or "overview" in query_lower:
                summary = self._get_relevant_summary_data("summary")
                if summary:
                    system_message += f"\n\nSummary:\n{summary}\n"
            
            if "action" in query_lower or "recommend" in query_lower or "what should i do" in query_lower:
                actions = self._get_relevant_summary_data("actions")
                if actions:
                    system_message += "\n\nRecommended actions:\n"
                    for action in actions:
                        system_message += f"- {action}\n"
            
            if "attack" in query_lower or "threat" in query_lower or "danger" in query_lower:
                predictions = self._get_relevant_summary_data("predictions")
                if predictions:
                    system_message += "\n\nThreat categories found:\n"
                    for category, count in predictions.items():
                        if count > 0:
                            system_message += f"- {category}: {count}\n"
                            
        return system_message
    
    def _check_cache(self, query):
        """Check if response is in cache"""
        if query in self.response_cache:
            cache_time, response = self.response_cache[query]
            # Check if cache is still valid
            if time.time() - cache_time < self.cache_ttl:
                return response
        return None
    
    def _update_cache(self, query, response):
        """Update response cache"""
        self.response_cache[query] = (time.time(), response)
        # Clean old cache entries
        current_time = time.time()
        self.response_cache = {k: v for k, v in self.response_cache.items() 
                               if current_time - v[0] < self.cache_ttl}
    
    def generate_response(self, query):
        """Generate response to user query"""
        if not self.is_cybersecurity_question(query):
            return "I'm RedHawk Assistant, focused on cybersecurity and IT topics. " \
                   "How can I assist you with security-related matters today?"
        
        # Check cache first
        cached_response = self._check_cache(query)
        if cached_response:
            return cached_response
            
        # Try to use OpenAI if API key is available
>>>>>>> a7baf488 (The Beganinng of the end)
        if self.api_key:
            masked_key = self.api_key[:4] + "..." + self.api_key[-4:] if len(self.api_key) > 8 else "***"
            api_key_debug = f"{masked_key} (length: {len(self.api_key)})"
        print(f"API key status: {api_key_debug}")
        
        # Try to use OpenAI if API key is available
        if self.api_key and len(self.api_key) > 10 and self.api_key != 'dummy-key':
            try:
<<<<<<< HEAD
                # Import at function call time to avoid issues if OpenAI is not installed
                try:
                    from openai import OpenAI
                    client = OpenAI(api_key=self.api_key)
                    print("OpenAI client initialized successfully")
                    
                    # Prepare system message with context
                    system_message = """You are RedHawk Assistant, a cybersecurity expert specializing in security log analysis and threat detection.
Your purpose is to provide expert guidance on cybersecurity topics and analyze security log data.
Answer ONLY questions related to cybersecurity. For any other topics, politely decline to answer.
Be concise, accurate, and practical in your responses."""
                    
                    # Add summary data context if available
                    if self.summary_data:
                        system_message += "\n\nYou have access to the following security log analysis data:\n"
                        system_message += json.dumps({
                            "total_files_analyzed": self.summary_data.get("meta", {}).get("total_files_analyzed", 1),
                            "total_records_analyzed": self.summary_data.get("meta", {}).get("total_records_analyzed", 0),
                            "high_sensitivity_alerts": self.summary_data.get("meta", {}).get("high_sensitivity_total", 0),
                            "total_alerts": self.summary_data.get("meta", {}).get("alert_status_total", 0)
                        })
                        
                        # Add first file summary as example
                        file_summaries = self.summary_data.get("file_summaries", [])
                        if file_summaries:
                            first_summary = file_summaries[0]
                            system_message += "\n\nFirst file analysis summary:\n"
                            summary_dict = {
                                "prediction_counts": first_summary.get("prediction_counts", {}),
                                "prediction_percentages": first_summary.get("prediction_percentages", {}),
                                "text_summary": first_summary.get("text_summary", ""),
                                "recommended_actions": first_summary.get("recommended_actions", [])
                            }
                            # Only add file_name if it exists
                            if "file_name" in first_summary:
                                summary_dict["file_name"] = first_summary["file_name"]
                            system_message += json.dumps(summary_dict)
                    
                    print("Calling OpenAI API...")
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",  # Use gpt-3.5-turbo as a fallback if gpt-4-turbo is not available
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": query}
                        ],
                        temperature=0.7,
                        max_tokens=500
                    )
                    print("OpenAI API call successful")
                    return response.choices[0].message.content
                    
                except ImportError:
                    print("OpenAI SDK not installed. Falling back to rule-based responses.")
                    # Fall back to rule-based responses
                except Exception as api_error:
                    print(f"OpenAI API error: {str(api_error)}")
                    # Fall back to rule-based responses
=======
                import openai
                from openai import OpenAI
                
                # Prepare system message with context
                system_message = self._prepare_context(query)
                
                client = OpenAI(api_key=self.api_key)
                
                # Use a more efficient model based on complexity and content
                # For cybersecurity topics, use GPT-4 for better expertise
                is_cybersec_topic = any(keyword in query.lower() for keyword in self.cybersec_keywords)
                model = "gpt-4-turbo" if is_cybersec_topic or len(query) > 100 else "gpt-3.5-turbo"
                
                # Use streaming for faster initial response
                response_stream = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": query}
                    ],
                    temperature=0.7,
                    max_tokens=500,
                    stream=True
                )
                
                # Collect the streamed response
                collected_response = ""
                for chunk in response_stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        collected_response += chunk.choices[0].delta.content
                
                # Cache the response
                self._update_cache(query, collected_response)
                return collected_response
                
>>>>>>> a7baf488 (The Beganinng of the end)
            except Exception as e:
                print(f"OpenAI API error: {str(e)}")
                # Fall back to rule-based responses
        
        # Rule-based responses if API key not available or API call failed
        response = self._generate_rule_based_response(query)
        self._update_cache(query, response)
        return response
        
    def _generate_rule_based_response(self, query):
        """Generate rule-based response with enhanced keyword handling"""
        query_lower = query.lower()
        
<<<<<<< HEAD
        # If we have summary data, use it to generate better responses
        if self.summary_data:
            file_summaries = self.summary_data.get("file_summaries", [])
            
            # Handle summary/overview related questions
            if "summarize" in query_lower or "summary" in query_lower or "overview" in query_lower:
                if file_summaries and "text_summary" in file_summaries[0] and file_summaries[0]["text_summary"]:
                    return file_summaries[0]["text_summary"]
                elif file_summaries:
                    summary = []
                    counts = file_summaries[0].get("prediction_counts", {})
                    for category, count in counts.items():
                        summary.append(f"{category}: {count}")
                    return "Log summary: " + ", ".join(summary)
            
            # Handle action/recommendation related questions
            if "action" in query_lower or "recommend" in query_lower or "what should i do" in query_lower or "take" in query_lower or "next" in query_lower:
                # Default actions in case recommended_actions is not available
                default_actions = [
                    "Investigate any suspicious activities in the logs",
                    "Monitor systems for unusual behavior",
                    "Update security protocols if necessary"
                ]
                
                # If we have a summary with recommended actions, use them
                if file_summaries and "recommended_actions" in file_summaries[0]:
                    actions = file_summaries[0]["recommended_actions"]
                    
                    if isinstance(actions, list) and len(actions) > 0:
                        return "Recommended actions:\n- " + "\n- ".join(actions)
                    else:
                        # Provide more detailed generic recommendations
                        return "Recommended actions:\n- Immediately investigate attack incidents and consider isolating affected systems\n- Monitor for further suspicious activity from identified source IPs\n- Review unusual behavior patterns in the log entries\n- Continue monitoring logs for security incidents"
=======
        # Check for specific cybersecurity keywords
        for keyword, response in self.keyword_responses.items():
            if re.search(r'\b' + re.escape(keyword) + r'\b', query_lower):
                return response

        # If summary data exists, use summary-based responses
        if self.summary_data:
            if "summarize" in query_lower or "summary" in query_lower:
                summary = self._get_relevant_summary_data("summary")
                if summary:
                    return summary
                
                predictions = self._get_relevant_summary_data("predictions")
                if predictions:
                    summary_parts = []
                    for category, count in predictions.items():
                        if count > 0:
                            summary_parts.append(f"{category}: {count}")
                    return "Log summary: " + ", ".join(summary_parts)
            
            if "action" in query_lower or "recommend" in query_lower or "what should i do" in query_lower or "take" in query_lower:
                actions = self._get_relevant_summary_data("actions")
                if actions and len(actions) > 0:
                    response = "Recommended actions:\n"
                    for action in actions[:3]:  # Limit to top 3 actions
                        response += f"- {action}\n"
                    return response
>>>>>>> a7baf488 (The Beganinng of the end)
                else:
                    return "Recommended actions:\n- " + "\n- ".join(default_actions)
            
<<<<<<< HEAD
            # Handle threat/attack related questions
            if "threat" in query_lower or "attack" in query_lower or "danger" in query_lower or "vulnerability" in query_lower:
                high_sensitivity = self.summary_data.get("meta", {}).get("high_sensitivity_total", 0)
                alerts = self.summary_data.get("meta", {}).get("alert_status_total", 0)
                
                if high_sensitivity > 0 or alerts > 0:
                    return f"There are potential security issues detected: {high_sensitivity} high sensitivity alerts and {alerts} total alerts. I recommend immediate investigation of these security incidents."
                else:
                    return "Based on the logs analyzed, no immediate threats were detected. Continue with regular security monitoring."
            
            # Handle IP/source related questions
            if "ip" in query_lower or "source" in query_lower or "attacker" in query_lower:
                return "The logs show suspicious activity from multiple IP addresses. These should be investigated and potentially blocked if malicious activity is confirmed."
            
            # Handle malware related questions
            if "malware" in query_lower or "virus" in query_lower or "ransomware" in query_lower:
                return "The logs indicate potential malware activity. I recommend running a full system scan, updating your antivirus, and checking for any unauthorized system changes."
        
        # Default detailed response based on whether summary data is available
        if self.summary_data:
            high_count = self.summary_data.get("meta", {}).get("high_sensitivity_total", 0)
            alert_count = self.summary_data.get("meta", {}).get("alert_status_total", 0)
            records = self.summary_data.get("meta", {}).get("total_records_analyzed", 0)
            
            return f"Based on the analysis of {records} log entries, I found {high_count} high severity issues and {alert_count} security alerts that require attention. The logs show a mix of normal system activity and potential security concerns. I recommend investigating the alerts further and monitoring for any suspicious patterns."
        else:
            return "I can help analyze your security logs and provide recommendations based on detected threats and vulnerabilities. Please upload a log file for analysis or ask specific cybersecurity questions."
=======
            if "attack" in query_lower or "threat" in query_lower or "danger" in query_lower:
                predictions = self._get_relevant_summary_data("predictions")
                if predictions and "attack" in predictions and predictions["attack"] > 0:
                    return "There are potential attack indicators in the logs. I recommend immediate investigation."
        
        # Default cybersecurity response
        return "Cybersecurity best practices recommend regular software updates, " \
               "strong unique passwords, and employee security awareness training."
>>>>>>> a7baf488 (The Beganinng of the end)

def interactive_mode(assistant):
    """Run the assistant in interactive mode"""
    print("\n🔒 RedHawk Cybersecurity Assistant 🔒")
    print("Type 'exit' or 'quit' to end the conversation.")
    
    while True:
        query = input("\nYou: ")
        if query.lower() in ['exit', 'quit', 'bye']:
            print("RedHawk Assistant: Goodbye! Stay secure.")
            break
        
        response = assistant.generate_response(query)
        print(f"\nRedHawk Assistant: {response}")

def main():
    parser = argparse.ArgumentParser(description='RedHawk Cybersecurity Assistant')
    parser.add_argument('--api-key', type=str, 
                        default=os.environ.get('GITHUB_TOKEN') or os.environ.get('OPENAI_API_KEY'),
                        help='OpenAI API key (can also be set via GITHUB_TOKEN or OPENAI_API_KEY env variable)')
    parser.add_argument('--summary', type=str, default=None,
                        help='Path to a summary JSON file for contextual knowledge')
    parser.add_argument('--query', type=str, default=None,
                        help='Single query mode: Provide a question and exit')
    
    args = parser.parse_args()
    
    # Initialize the assistant
    assistant = RedHawkAssistant(args.api_key, args.summary)
    
    # Single query mode
    if args.query:
        response = assistant.generate_response(args.query)
        print(f"RedHawk Assistant: {response}")
        return
    
    # Interactive mode
    interactive_mode(assistant)

if __name__ == "__main__":
    main()