import Hashtable from 'jshashtable';

function is_array(pVar) {
    return (Object.prototype.toString.call(pVar) == "[object Array]");
}

class Events {

    constructor() {

        this.gateway = new Hashtable();
        this.hashes = new Hashtable();
        this.once = [];

        this.defaultPriority = 0;

    }

    /**
     * Register for a specific Event. A third optional param can be send that represents the priority.
     *
     * @param pLabel string
     * @param pFunction function
     */
    register(pLabel, pFunction) {

        //priority
        let priority = this.defaultPriority;

        if (arguments.length > 2) {
            priority = arguments[2];
        }

        if (is_array(pLabel)) {

            let hashes = [];

            pLabel.each((aLabel) => {
                hashes = hashes.concat(this.register(aLabel, pFunction, priority));
            });

            return hashes;

        } else {

            //init givent type
            let singleHash = (Math.random() + 1).toString(36).substring(7);

            if (this.gateway.get(pLabel) == undefined) {
                this.gateway.put(pLabel, new Hashtable());
            }

            let typeHash = this.gateway.get(pLabel);

            //check priority
            if (typeHash.get(priority) == undefined) {
                typeHash.put(priority, []);
            }

            let priorityArray = typeHash.get(priority);
            priorityArray.push(singleHash);
            this.hashes.put(singleHash, pFunction);

            return singleHash;

        }

    }

    /**
     * Like register, but will be removed after a single execution
     * 
     * @param pLabel
     * @param pFunction
     */
    register_once(pLabel, pFunction) {

        this.once.push(this.register(pLabel, pFunction, arguments[2] || this.defaultPriority));

    }

    /**
     * Remove callback from event list
     * 
     * @param pLabel
     * @param pHash
     * @returns {boolean}
     */
    unregister(pLabel, pHash) {

        if (this.gateway.get(pLabel) != undefined) {

            let priorityHash = this.gateway.get(pLabel);
            let priorityKeys = priorityHash.keys();

            for (let I = 0; I < priorityKeys.length; I++) {

                let priorityArray = priorityHash.get(priorityKeys[I]);

                for (let Y = 0; Y < priorityArray.length; Y++) {

                    if (priorityArray[Y] == pHash) {

                        priorityArray.splice(Y, 1);

                        this.hashes.remove(pHash);

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
     * @param pLabel string
     * @param pMessage object
     */
    fire(pLabel, pMessage = {}) {

        if (this.gateway.get(pLabel) != undefined) {

            let priorityHash = this.gateway.get(pLabel);
            let priorityKeys = priorityHash.keys();

            priorityKeys.sort((a, b) => {
                return b - a
            });

            let skipType = false;

            for (let I = 0; I < priorityKeys.length; I++) {

                let priorityArray = priorityHash.get(priorityKeys[I]);

                for (let Y = 0; Y < priorityArray.length; Y++) {

                    let hashValue = priorityArray[Y];
                    let returnValue = this.hashes.get(hashValue)(pMessage, (aNewMessage) => {
                        pMessage = aNewMessage;
                    });

                    if (this.once.indexOf(hashValue) > -1) {
                        this.unregister(pLabel, hashValue);
                    }

                    // if return value is negative, we stop here!
                    if (!returnValue) {
                        __DEV__ && console.log('Return value break (return not true) for event (' + pLabel + ')');
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

        this.gateway.each((eventObject) => {

            let eventLabel = eventObject.key;
            let priorityList = eventObject.value;

            priorityList.each((priorityObject) => {

                let priorityKey = priorityObject.key;
                let priority_hashes = priorityObject.value;

                if (priority_hashes.length > 0) {

                    console.log(eventLabel + '(' + priority_hashes.length + ')');

                    priority_hashes.each(function (hashObject) {
                        console.log('#' + hashObject)
                    });

                    console.log('');

                }
            });

        });

    }

}

module.exports = new Events();