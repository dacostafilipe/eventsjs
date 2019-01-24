# Events.js

## Usage

Include the script in your page

```html
<script src="/dist/events.js"></script>
```

A global `Events` should now be available across your site. 

## API

### Register Event

```javascript
Events.register(EventKey, Callback, Priority);
```

- `EventKey` (string) : The name of your event
- `Callback` (function) : Function that is called when event is fired. A `Message` object is passed to the function with the event payload and an `Update` callback that allows you modify the `Message` for the next queue element. 
- `Priority` (int) : Optional priority that defined that register is called first

***Important*** : The `Callback` function has to return a boolean value, where `true` would continue to call the next listener to `EventKey` and `false` would stop and not continue. 

The register process returns a `Hash` that you need to keep if you want to unregister this event in the future.

### Fire Event

```javascript
Events.fire(EventKey, Message);
```

- `EventKey` (string) : The name of your event
- `Message` (object) : Payload for the event

### Unregister Event

If, for some reason, you want to remove an event,

```javascript
Events.unregister(EventKey, Hash);
```

- `EventKey` (string) : The name of your event
- `Hash` (string) : Value returned by the register process

### Register Event Once

In some cases, you only want to listen to an even once. By using `register_once`, the library will automatically call `unregister` after the first call.

```javascript
Events.register_once(EventKey, Callback, Priority);
```

### Show Events (Debug)

List all you registered events

```javascript
Events.showEvents();
```

## Example


```javascript

// register event and add your main code there
Events.register('analytics.google', (Message) => {
    ga('send', 'event', Message.category, Message.action, Message.label, Message.value);
    return true;
});

// fire the event from everywhere in your code
Events.fire('analytics.google', {
    category: 'reading',
    action: 'started.reading',
    label: 'bookA',
    value: 123,
});

```

```javascript

// register event
Events.register('submit.data', (Message) => {
    
    axios.get(
        'https://example.domain/api/',
        {
            params : Message
        }
        )
        .catch(function (error) {
            console.log(error);
        })
    
    return true;
    
});

// register event with high priority. This will get called before the event above even if it's registered after.
Events.register('submit.data', (Message, Update) => {
    
    Message.injected = true; // modify message
    
    Update(Message); // update the message to force our changes to all the next event calls
      
}, 10000 );

// fire event
Events.fire('submit.data', {
    name : 'testing',
    injected : false
});

```




 