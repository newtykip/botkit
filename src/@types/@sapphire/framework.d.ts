declare module '@sapphire/framework' {
    export interface SapphireClient {
        readonly production: boolean;
        readonly silent: boolean;
    }

    export enum LogLevel {
        Loader = 70
    }
}

export {};
