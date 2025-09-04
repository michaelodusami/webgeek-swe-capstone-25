const settings = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8ff000',
    apiKey: process.env.REACT_APP_API_KEY || 'apikey',
    env: process.env.REACT_APP_ENV || 'development',
    isDev: process.env.REACT_APP_ENV === 'development',
};

export default settings;