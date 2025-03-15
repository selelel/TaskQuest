type env_type = ImportMetaEnv & {
    VITE_API_KEY: string;
    VITE_APP_ID: string;
    VITE_AUTH_DOMAIN: string;
    VITE_MEASURE_ID: string;
    VITE_MESSAGING_SENDER_ID: string;
    VITE_PROJECT_ID: string;
    VITE_STORAGE_BUCKET: string;
}

const env = import.meta.env as env_type;

export default env;
