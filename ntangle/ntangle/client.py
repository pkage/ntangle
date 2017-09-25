
# ntangle client

import zmq
import msgpack
import functools

# something happened on the remote
class RemoteError(Exception):
    pass

# client class to proxy a remote object
class Client:
    remote = ""
    listing = []
    __socket = None
    __context = None

    # set up the object
    def __init__(self, remote, context=None):
        self.remote = remote

        # if we don't have a zmq context, create a new one
        if context is None:
            self.__context = zmq.Context()
        else:
            self.__context = context

        # create a socket
        self.__socket = self.__context.socket(zmq.REQ)
        self.__socket.connect(remote)

        # connect to the remote
        self.__refresh_remote()

    # make a remote function call
    def __call(self, func, *args):
        # construct the function call
        payload = {'func': func}
        if args is not None:
            payload['args'] = args

        # pack the payload
        payload = msgpack.packb(payload)

        # send off
        self.__socket.send(payload)

        # wait back from the server
        msg = self.__socket.recv()
        msg = msgpack.unpackb(msg)

        if msg['success']:
            return msg['return']
        else:
            raise RemoteError(msg['error'])

    # get the remote listing
    def __refresh_remote(self):
        self.listing = self.__call('#listing')

    # wait for the remote to come online
    def __ping(self):
        return self.__call('#ping')

    # make this more easily debuggable
    def __repr__(self):
        return '<ntangle client object @ {}>'.format(self.remote)

    def __getattr__(self, name):
        for fn in self.listing:
            if fn['name'] == name:
                return functools.partial(self.__call, name)
        raise AttributeError(name)
