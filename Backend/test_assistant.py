import os
import subprocess
import json
import sys

# Path to the assistant script
ASSISTANT_SCRIPT = os.path.join(os.path.dirname(__file__), 'AI', 'redhawk_assistant.py')
# Path to the sample summary
SUMMARY_FILE = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'summary.json')

def test_assistant(query, summary_path=None):
    """Test the RedHawk assistant with a query"""
    cmd = [sys.executable, ASSISTANT_SCRIPT, '--query', query]
    
    if summary_path and os.path.exists(summary_path):
        cmd.extend(['--summary', summary_path])
    
    # Run the assistant process
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print(f"Error: {stderr}")
        return None
    
    # Extract the assistant's response
    response = stdout.strip()
    prefix_match = response.find("RedHawk Assistant: ")
    if prefix_match != -1:
        response = response[prefix_match + len("RedHawk Assistant: "):]
    
    return response

def run_tests():
    """Run a series of tests to check the assistant's responses"""
    test_queries = [
        "What's in the summary?",
        "What are the recommended actions?",
        "Are there any security threats in the logs?",
        "Tell me about potential attacks",
        "What IP addresses are suspicious?",
        "Is there any malware activity?",
        "Give me an overview of the logs",
        "What should I do next?",
        "Hello, how are you?",  # Non-security question to test filtering
    ]
    
    print("\n🔒 RedHawk Assistant Testing 🔒\n")
    
    print("Testing with summary data:")
    for query in test_queries:
        print(f"\nQuery: {query}")
        response = test_assistant(query, SUMMARY_FILE)
        print(f"Response: {response}")
        print("-" * 80)
    
    print("\nTesting without summary data:")
    for query in test_queries[:3]:  # Test fewer queries without summary
        print(f"\nQuery: {query}")
        response = test_assistant(query)
        print(f"Response: {response}")
        print("-" * 80)

if __name__ == "__main__":
    run_tests() 