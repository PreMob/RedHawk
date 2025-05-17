import os
import argparse
import pandas as pd
import glob
from datetime import datetime
import json
import sys
from collections import Counter

def analyze_prediction_file(file_path):
    """
    Generate a summary analysis for a single prediction file
    """
    try:
        print(f"Analyzing: {file_path}")
        df = pd.read_csv(file_path)
        
        # Basic statistics
        total_records = len(df)
        prediction_counts = df['predicted_category'].value_counts().to_dict()
        prediction_percentages = {k: round(v/total_records*100, 2) for k, v in prediction_counts.items()}
        
        # Extract and analyze additional fields
        log_entries = []
        
        # Track ports and vulnerability types for visualization
        port_counts = Counter()
        vulnerability_types = Counter()
        
        for _, row in df.iterrows():
            entry = {
                'timestamp': None,
                'source_ip': None,
                'type': row['predicted_category'],
                'sensitivity': 'HIGH' if any(prob > 0.9 for prob in [row[col] for col in df.columns if col.startswith('prob_')]) else 'MEDIUM' if any(prob > 0.7 for prob in [row[col] for col in df.columns if col.startswith('prob_')]) else 'LOW',
                'status': 'ALERT' if row['predicted_category'] in ['attack', 'anomaly', 'threat'] else 'INFO'
            }
            
            # Try to find timestamp
            timestamp_cols = [col for col in df.columns if any(time_indicator in col.lower() 
                                                             for time_indicator in ['time', 'date', 'timestamp'])]
            if timestamp_cols:
                try:
                    entry['timestamp'] = pd.to_datetime(row[timestamp_cols[0]]).isoformat()
                except:
                    pass
            
            # Try to find source IP
            ip_cols = [col for col in df.columns if any(ip_indicator in col.lower() 
                                                       for ip_indicator in ['ip', 'source', 'src', 'address'])]
            if ip_cols:
                entry['source_ip'] = str(row[ip_cols[0]])
            
            # Try to find port information (for visualization)
            port_cols = [col for col in df.columns if any(port_indicator in col.lower() 
                                                        for port_indicator in ['port', 'dst_port', 'src_port'])]
            for port_col in port_cols:
                if pd.notna(row[port_col]):
                    port_counts[str(row[port_col])] += 1
            
            log_entries.append(entry)
        
        # Create summary result
        result = {
            'total_records': total_records,
            'prediction_counts': prediction_counts,
            'prediction_percentages': prediction_percentages,
            'log_entries': log_entries,
        }
        
        # Add port analysis if available
        if port_counts:
            result['port_analysis'] = dict(port_counts)
            
        return result
        
    except Exception as e:
        print(f"Error analyzing file {file_path}: {str(e)}")
        import traceback
        traceback.print_exc()
        return {}

def generate_text_summary(total_records, prediction_counts, prediction_percentages, 
                        high_count=0, medium_count=0, low_count=0):
    """
    Generate a human-readable text summary of log analysis
    """
    # Determine overall security status
    total_threats = sum(prediction_counts.get(category, 0) 
                        for category in ['attack', 'anomaly', 'probe', 'threat'])
    threat_percentage = total_threats / total_records * 100 if total_records > 0 else 0
    
    if 'attack' in prediction_counts and prediction_counts['attack'] > 0:
        security_status = "critical"
    elif threat_percentage > 30:
        security_status = "severe"
    elif threat_percentage > 10:
        security_status = "concerning"
    else:
        security_status = "stable"
    
    # Create breakdown text
    breakdown_parts = []
    for category, count in prediction_counts.items():
        percentage = prediction_percentages.get(category, 0)
        breakdown_parts.append(f"{category}: {count} entries ({percentage}%)")
    
    breakdown_text = ", ".join(breakdown_parts)
    
    # Compose the summary
    summary = f"Analysis of {total_records} log entries shows the security status is {security_status}. "
    summary += f"Breakdown by category: {breakdown_text}. "
    
    if any([high_count, medium_count, low_count]):
        summary += f"Risk levels: {high_count} high, {medium_count} medium, and {low_count} low risk entries."
    
    return summary

def generate_recommended_actions(prediction_counts, high_alerts=0, has_attack=False, has_probe=False):
    """
    Generate recommended actions based on the log analysis
    """
    recommendations = []
    
    # Critical actions for attacks
    if has_attack:
        recommendations.append("Immediately investigate attack incidents and consider isolating affected systems")
    
    # Actions for probes
    if has_probe:
        recommendations.append("Monitor for further suspicious activity from identified source IPs")
    
    # General recommendations
    if high_alerts > 0:
        recommendations.append("Review unusual behavior patterns in the log entries")
    
    # Always recommend ongoing monitoring
    recommendations.append("Continue monitoring logs for security incidents")
    
    return recommendations

def load_prediction_files(path, pattern="*_predictions_*.csv"):
    """
    Find and load all prediction files generated by the log analysis pipeline
    """
    prediction_files = []
    
    # If path is a directory, search for files matching pattern
    if os.path.isdir(path):
        prediction_files = glob.glob(os.path.join(path, pattern))
    # If path is a file, use it directly
    elif os.path.isfile(path):
        prediction_files = [path]
    
    if not prediction_files:
        print(f"No prediction files found at {path}")
        return []
    
    print(f"Found {len(prediction_files)} prediction files")
    return prediction_files

def main():
    parser = argparse.ArgumentParser(description='Generate summary of security log analysis')
    parser.add_argument('--input', type=str, required=True, help='Path to input prediction file or directory')
    parser.add_argument('--output', type=str, help='Path to output JSON file')
    args = parser.parse_args()
    
    prediction_files = load_prediction_files(args.input)
    
    if not prediction_files:
        print("No prediction files found. Exiting.")
        sys.exit(1)
    
    file_summaries = []
    
    for file_path in prediction_files:
        analysis_result = analyze_prediction_file(file_path)
        if analysis_result:
            analysis_result['file_name'] = os.path.basename(file_path)
            file_summaries.append(analysis_result)
    
    if not file_summaries:
        print("No valid analysis results generated. Exiting.")
        sys.exit(1)
    
    # Calculate total stats
    total_records = sum(summary['total_records'] for summary in file_summaries)
    total_high_sensitivity = sum(
        sum(1 for entry in summary.get('log_entries', []) if entry.get('sensitivity') == 'HIGH')
        for summary in file_summaries
    )
    total_alerts = sum(
        sum(1 for entry in summary.get('log_entries', []) if entry.get('status') == 'ALERT')
        for summary in file_summaries
    )
    
    # Generate output
    output = {
        'generated_at': datetime.now().isoformat(),
        'file_summaries': file_summaries,
        'meta': {
            'total_files_analyzed': len(file_summaries),
            'total_records_analyzed': total_records,
            'high_sensitivity_total': total_high_sensitivity,
            'alert_status_total': total_alerts
        }
    }
    
    # Save to file if output path provided
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(output, f, indent=2)
        print(f"Summary saved to: {args.output}")
    else:
        print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main() 