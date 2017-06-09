# shades-worker
Worker for Shades


### Implementation TODOs

- Process startup, add a way to configure which persistence module(s) and which projection modules to use. 
  - For now, we statically install persistence and projection modules as dependencies; can figure out a way to do that dynamically later.
  - Configure which modules to use during startup
- Listen to worker queue using shades-xyz module
- On event, fetch current projection state
  - Pass into each projection module, together with the event
- Publish projection diff to pub-sub topic using shades-xyz module
- 


### Notes

#### TODO Example for starting the worker

```
node index.js --store redis --projection graphlib --projection bar --shades-store-redis:host='10.127.0.1'
```