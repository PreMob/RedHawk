import osimport subprocessimport jsonimport sys# Try to load environment variables from .env filetry:    from dotenv import load_dotenv    load_dotenv()    print("Loaded environment variables from .env file")except ImportError:    print("dotenv module not available, using existing environment variables")# Path to the assistant scriptASSISTANT_SCRIPT = os.path.join(os.path.dirname(__file__), 'AI', 'redhawk_assistant.py')

def test_with_explicit_api_key():
    """Test the RedHawk assistant with an explicit API key"""
    # For testing purposes only - in a real app, never hardcode API keys
    # This is used just to verify the API key flow is working
    test_api_key = os.environ.get('GITHUB_TOKEN') or os.environ.get('OPENAI_API_KEY')
    
    if not test_api_key:
        print("No API key found in environment variables (GITHUB_TOKEN or OPENAI_API_KEY)")
        print("Please make sure at least one of these is set properly.")
        return
    
    # Mask the key for security
    masked_key = test_api_key[:4] + "..." + test_api_key[-4:] if len(test_api_key) > 8 else "***"
    print(f"Testing with API key: {masked_key} (length: {len(test_api_key)})")
    
    # Run the assistant with a basic security question
    cmd = [
        sys.executable, 
        ASSISTANT_SCRIPT, 
        '--api-key', test_api_key,
        '--query', 'What are the common security vulnerabilities?'
    ]
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = process.communicate()
    
    print("\nOutput from assistant:")
    print(stdout)
    
    if stderr:
        print("\nErrors:")
        print(stderr)
    
    print("\nVerify that the output shows 'API key status: ...' and an OpenAI API response")
    print("If you don't see a response from the OpenAI API, there may be an issue with the API key or connection")

if __name__ == "__main__":
    print("\n🔒 RedHawk Assistant API Integration Test 🔒\n")
    test_with_explicit_api_key() 