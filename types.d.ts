// Types manquants pour éviter les erreurs TypeScript
// Ces imports proviennent de Vencord et seront disponibles à l'exécution

declare module "@api/DataStore" {
    export const DataStore: {
        get(key: string): any;
        set(key: string, value: any): void;
    };
}
