export class Enum {
    [key: string]: any;
    [key: number]: any;

    // getById
    static getById(id: string | number): string {
        // Use 'as any' to allow dynamic access
        return (this as any)[id];
    }

    //getByName
    static getByName(name: string): number | undefined {
        const key = Object.keys(this)
            .filter(key => typeof (this as any)[key] === 'string')
            .find(key => ((this as any)[parseInt(key, 10)]?.toLowerCase?.() ?? '') === name.toLowerCase());
        return key !== undefined ? parseInt(key, 10) : undefined;
    }

    // getAll
    static getAll(): Array<Object> {
        // which means here we filter only
        return Object.keys(this)
            .filter(key => typeof (this as any)[key] === 'string')
            .map(key => {
                const id = parseInt(key, 10);
                return {
                    title: this.getById(key),
                    id: isNaN(id) ? key : id,
                };
            });
    }
}
