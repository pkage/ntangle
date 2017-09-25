# ntangle

## purpose

make rpc kind of tolerable, unfortunately that didn't really happen but hey here we are.

## underlying structure

servers are written in python, and their methods are exposed to python/js/cpp via a simple msgpack-over-zeromq protocol. see `ntangle/protocol.txt` for a rough sketch.

## file structure

`./ntangle` is the python server/client

`./ntangle-js` is the javascript client, coming in both async and sync flavors (using deasync). not suitable for browser use.

`./ntangle-cpp` is the (unfinished) c++ client. it's functional if you don't mind packing everything yourself. couldn't find the version of this where i had finished it, so the generator script is missing. :/
