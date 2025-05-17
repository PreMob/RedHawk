import requests
import os
import json
from pprint import pprint

API_URL = 'http://localhost:3001/api'

def test_log_analysis():
    """Test the log analysis endpoint"""
    print('Testing log analysis endpoint...')
    
    filepath = os.path.join('uploads', 'clean_log.csv')
    if not os.path.exists(filepath):
        print(f"Error: File not found - {filepath}")
        return None
    
    try:
        with open(filepath, 'rb') as file:
            files = {'file': file}
            response = requests.post(f"{API_URL}/analyze-log", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print('Log analysis successful:')
            print(f"Analysis ID: {data['analysis']['logAnalysisId']}")
            print(f"Text summary: {data['analysis']['textSummary']}")
            print(f"Recommended actions: {data['analysis']['recommendedActions']}")
            return data['analysis']['logAnalysisId']
        else:
            print(f"Error: Received status code {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error in log analysis: {str(e)}")
        return None

def test_chatbot(log_analysis_id):
    """Test the chatbot endpoints"""
    print('\nTesting chatbot endpoints...')
    
    try:
        # First message
        message1 = 'What security issues did you find in the logs?'
        print(f'Sending message: "{message1}"')
        
        response1 = requests.post(f"{API_URL}/chat/message", json={
            'message': message1,
            'logAnalysisId': log_analysis_id
        })
        
        data1 = response1.json()
        session_id = data1['sessionId']
        print(f'Assistant response: {data1["response"]}')
        print(f'Session ID: {session_id}')
        
        # Second message in same session
        message2 = 'What actions should I take?'
        print(f'\nSending message: "{message2}"')
        
        response2 = requests.post(f"{API_URL}/chat/message", json={
            'message': message2,
            'sessionId': session_id
        })
        
        data2 = response2.json()
        print(f'Assistant response: {data2["response"]}')
        
        # Get conversation history
        print('\nFetching conversation history...')
        history_response = requests.get(f"{API_URL}/chat/history/{session_id}")
        history_data = history_response.json()
        print(f'Conversation history has {len(history_data["history"])} messages')
        
        # Print full conversation
        print("\nFull conversation:")
        for msg in history_data['history']:
            role = "User" if msg['role'] == 'user' else "Assistant"
            print(f"{role}: {msg['content']}")
        
        return True
    except Exception as e:
        print(f"Error in chatbot test: {str(e)}")
        return False

def test_available_logs():
    """Test fetching available logs"""
    print('\nTesting available logs endpoint...')
    
    try:
        response = requests.get(f"{API_URL}/chat/available-logs")
        data = response.json()
        print(f'Available logs: {len(data["logs"])}')
        
        if data['logs']:
            print("\nSample log entry:")
            pprint(data['logs'][0])
        
        return True
    except Exception as e:
        print(f"Error fetching available logs: {str(e)}")
        return False

def run_tests():
    """Run all tests"""
    try:
        # First test log analysis
        log_analysis_id = test_log_analysis()
        
        if log_analysis_id:
            # Then test chatbot with the log analysis
            test_chatbot(log_analysis_id)
            
            # Test available logs endpoint
            test_available_logs()
        
        print('\nTesting complete!')
    except Exception as e:
        print(f"Error running tests: {str(e)}")

if __name__ == "__main__":
    run_tests() 