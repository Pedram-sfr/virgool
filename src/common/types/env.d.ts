namespace NodeJS{
    interface ProcessEnv{
        //Application
        PORT: number
        //DataBase
        DB_PORT: number;
        DB_NAME: string;
        DB_HOST: string;
        DB_USERNAME: string;
        DB_PASSWORD: string;
        //secrets
        COOKIE_SECRET: string;
        OTP_TOKEN_SECRET: string;
        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        EMAIL_TOKEN_SECRET: string;
        PHONE_TOKEN_SECRET: string;
    }
}