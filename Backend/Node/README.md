# Redhawk Backend

This is the backend service for Redhawk, a security tool for log analysis, URL reconnaissance, vulnerability scanning, and exploitation.

## Project Structure

- `controllers/`: Handle incoming requests and coordinate services.
- `services/`: Core business logic including ML, scanning, exploitation, and reporting.
- `routes/`: API route definitions.
- `utils/`: Utility functions and data.
- `uploads/`: Temporary storage for uploaded logs.
- `app.js`: Express app setup and middleware.
- `server.js`: Server entry point.
- `.env`: Environment variables.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env`.

3. Start the server:
   ```
   node server.js
   ```

## API Endpoints

- `POST /api/analyze-log`: Upload and analyze logs.
- `POST /api/scan-url`: Perform URL reconnaissance and vulnerability scanning.

## Future Work

- Implement detailed ML anomaly detection.
- Enhance vulnerability scanning and exploitation.
- Add comprehensive testing.

## License

MIT License
