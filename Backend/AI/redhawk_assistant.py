import os
import json
import argparse
import sys
import re

class RedHawkAssistant:
    """
    RedHawk Assistant - A chatbot for cybersecurity insights and summary analysis
    """
    
    def __init__(self, api_key=None, summary_file=None):
        """Initialize the assistant with OpenAI API key and optional summary data"""
        self.api_key = api_key
        self.summary_data = None
        
        # Load summary data if provided
        if summary_file and os.path.exists(summary_file):
            try:
                with open(summary_file, 'r') as f:
                    self.summary_data = json.load(f)
                print(f"Loaded summary data from {summary_file}")
            except Exception as e:
                print(f"Error loading summary file: {str(e)}")
        
        # Define cybersecurity keywords for filtering
        self.cybersec_keywords = [
            'attack', 'security', 'threat', 'vulnerability', 'exploit', 'malware', 
            'virus', 'ransomware', 'phishing', 'breach', 'hack', 'incident', 'firewall', 
            'encryption', 'authentication', 'authorization', 'log', 'network', 'intrusion',
            'detection', 'prevention', 'mitigation', 'risk', 'compliance', 'policy',
            'password', 'access', 'control', 'audit', 'secure', 'protection', 'defense',
            'anomaly', 'alert', 'monitor', 'scan', 'patch', 'update', 'backdoor', 'bot',
            'botnet', 'ddos', 'spoofing', 'trojan', 'worm', 'zero-day', 'penetration',
            'pentest', 'cyber', 'cryptography', 'port', 'protocol', 'siem', 'ids', 'ips',
            'summary', 'analysis', 'report', 'detection', 'redhawk', 'log analysis'
        ]
    
    def is_cybersecurity_question(self, query):
        """Check if the query is related to cybersecurity"""
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
            r'summarize'
        ]
        
        for pattern in cybersec_patterns:
            if re.search(pattern, query_lower):
                return True
        
        return False
    
    def generate_response(self, query):
        """Generate a response to the user's query"""
        # Check if query is related to cybersecurity
        if not self.is_cybersecurity_question(query):
            return "I'm RedHawk Assistant, designed to help with cybersecurity related queries only. Please ask me about cybersecurity topics, threats, vulnerabilities, or about your security log analysis."
        
        # Try to use OpenAI if API key is available
        if self.api_key:
            try:
                import openai
                from openai import OpenAI
                
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
                
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": query}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content
                
            except Exception as e:
                print(f"OpenAI API error: {str(e)}")
                # Fall back to rule-based responses
        
        # Rule-based responses if API key not available or API call failed
        query_lower = query.lower()
        
        if self.summary_data:
            file_summaries = self.summary_data.get("file_summaries", [])
            
            if "summarize" in query_lower or "summary" in query_lower:
                if file_summaries and "text_summary" in file_summaries[0]:
                    return file_summaries[0]["text_summary"]
                elif file_summaries:
                    summary = []
                    counts = file_summaries[0].get("prediction_counts", {})
                    for category, count in counts.items():
                        summary.append(f"{category}: {count}")
                    return "Log summary: " + ", ".join(summary)
            
            if "action" in query_lower or "recommend" in query_lower or "what should i do" in query_lower or "take" in query_lower:
                if file_summaries and "recommended_actions" in file_summaries[0]:
                    actions = file_summaries[0]["recommended_actions"]
                    if actions and len(actions) > 0:
                        return "Recommended actions:\n- Immediately investigate attack incidents and consider isolating affected systems\n- Review unusual behavior patterns in the log entries\n- Continue monitoring logs for security incidents"
                    else:
                        return "Recommended actions:\n- Investigate any suspicious activities in the logs\n- Monitor systems for unusual behavior\n- Update security protocols if necessary"
                else:
                    return "Recommended actions:\n- Investigate any suspicious activities in the logs\n- Monitor systems for unusual behavior\n- Update security protocols if necessary"
            
            if "attack" in query_lower or "threat" in query_lower or "danger" in query_lower:
                for summary in file_summaries:
                    if "attack" in summary.get("prediction_counts", {}):
                        return "There are potential attack indicators in the logs. I recommend immediate investigation."
        
        # Default response
        return "Based on the security logs, there appear to be some security concerns that require attention. Please check the detailed analysis report for specific recommendations."

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
    parser.add_argument('--api-key', type=str, default=os.environ.get('OPENAI_API_KEY'),
                        help='OpenAI API key (can also be set via OPENAI_API_KEY env variable)')
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