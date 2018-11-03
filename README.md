## Install
```
npm install @belongs/asyncutil --save
```

## Usage
### Roll
To process a data set a given concurrency level.
```
await roll(items, (item) => { /* async processor of item */ }, concurrencyLevel);
```

### Hub
To make only one async call for multiple incoming request and cache the output.
```
const hub = new Hub(()=> { /* to fetch the data */ }, cacheTimeout);
const data = await hub.get();
```
Here the callback function will be called only once even hub.get() is called multiple times.
