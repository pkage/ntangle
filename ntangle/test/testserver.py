#! /usr/bin/env python

import server as ntangle

class Toaster:
    @ntangle.expose('foo')
    def foo(self):
        print("calling foo");
        return 'fooo'

    @ntangle.expose('bar', 'long name for bar')
    def bar(self):
        print("calling bar");
        return 'baarrr'

    @ntangle.expose('echo')
    def echo(self, text):
        print(text)
        return text

if __name__ == "__main__":
    serv = ntangle.Server(Toaster())

    serv.listen('tcp://*:55566')
