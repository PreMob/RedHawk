const { spawn } = require('child_process');

module.exports = {
  detectAnomalies: (logData) => {
    return new Promise((resolve, reject) => {
      // Replace 'path/to/your_model_script.py' with the actual path to your Python script
      const pythonProcess = spawn('python3', ['path/to/your_model_script.py']);

      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python script exited with code ${code}: ${error}`));
        }
        try {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (parseError) {
          reject(new Error(`Failed to parse JSON output: ${parseError.message}`));
        }
      });

      // Send log data to python script via stdin
      pythonProcess.stdin.write(logData);
      pythonProcess.stdin.end();
    });
  }
};
