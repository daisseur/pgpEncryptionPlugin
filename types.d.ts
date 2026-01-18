// Missing types to avoid TypeScript errors
// These imports come from Vencord and will be available at runtime

declare module "@api/DataStore" {
    export const DataStore: {
        get(key: string): any;
        set(key: string, value: any): void;
    };
}
