class Table {

    storage: { [index: string]: any } = {}

    constructor() {
        this.storage = {};
    }

    put(key: string, value: any) {
        this.storage[key] = value;
    }

    get(key: string): any {
        return this.storage[key];
    }

    remove(key: string) {
        delete this.storage[key];
    }

    keys() {
        return Object(this.storage).keys;
    }

}

class Events {

    gateway: Table = new Table();
    hashes: Table = new Table();

    once: Array<string>;

    defaultPriority: number = 0;

    /**
     *
     * @param key
     * @param callback
     * @param priority
     */
    register(key: string | Array<string>, callback: (message: any, updateMessage?: (updatedMessage: any) => void) => void, priority?: number): string | Array<string> {

        //priority fallback if not set
        if (priority === null) {
            priority = this.defaultPriority;
        }

        // if key is an array, register callback to multiple events
        if (Array.isArray(key)) {

            let hashes: Array<string> = [];

            key.forEach((subKey) => {
                hashes = hashes.concat(this.register(subKey, callback, priority));
            });

            return hashes;

        } else {

            // create "random-ish" hash
            let hash: string = (Math.random() + 1).toString(36).substring(7);

            if (this.gateway.get(key) == undefined) {
                this.gateway.put(key, new Table());
            }

            let table = this.gateway.get(key);

            //check priority
            if (table.get(priority) == undefined) {
                table.put(priority, []);
            }

            let priorityArray = table.get(priority);
            priorityArray.push(hash);
            this.hashes.put(hash, callback);

            return hash;

        }

    }

    /**
     * Like register, but will be removed after a single execution
     *
     * @param key
     * @param callback
     * @param priority
     */
    register_once(key: string, callback: () => void, priority?: number): string | Array<string> {

        let hashes = this.register(key, callback, priority);

        if (Array.isArray(hashes)) {
            this.once.concat(hashes);
        } else {
            this.once.push(hashes);
        }

        return hashes;
    }

    /**
     * Remove callback from event list
     *
     * @param key
     * @param hash
     * @returns {boolean}
     */
    unregister(key: string, hash: string) {

        if (this.gateway.get(key) != undefined) {

            let priorityHash = this.gateway.get(key);
            let priorityKeys = priorityHash.keys();

            for (let I = 0; I < priorityKeys.length; I++) {

                let priorityArray = priorityHash.get(priorityKeys[I]);

                for (let Y = 0; Y < priorityArray.length; Y++) {
                    if (priorityArray[Y] == hash) {
                        priorityArray.splice(Y, 1);
                        this.hashes.remove(hash);
                        return true;
                    }
                }
            }

        }

        return false;
    }

    /**
     * Fire an event. The gateway searches for listeners and processes the callback with the payload
     *
     * @param key string
     * @param message
     */
    fire(key: string, message: {} = {}) {

        if (this.gateway.get(key) != undefined) {

            let priorityHash = this.gateway.get(key);
            let priorityKeys = priorityHash.keys();

            priorityKeys.sort((a: number, b: number) => {
                return b - a
            });

            let skipType = false;

            for (let I = 0; I < priorityKeys.length; I++) {

                let priorityArray = priorityHash.get(priorityKeys[I]);

                for (let Y = 0; Y < priorityArray.length; Y++) {

                    let hashValue = priorityArray[Y];
                    let returnValue = this.hashes.get(hashValue)(message, (updatedMessage: any) => {
                        message = updatedMessage;
                    });

                    if (this.once.indexOf(hashValue) > -1) {
                        this.unregister(key, hashValue);
                    }

                    // if return value is negative, we stop here!
                    if (!returnValue) {
                        skipType = true;
                        break;
                    }
                }

                if (skipType) {
                    break;
                }

            }

        }

    }

    /**
     * Return array of registered events
     */
    showEvents() {

        this.gateway.keys().forEach((key: string) => {

            let priorityList = this.gateway.get(key);

            priorityList.forEach((value: Table) => {

                console.log('Value',value.keys());

            })

        });

    }

}

module.exports = new Events();