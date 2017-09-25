const zmq	= require('zeromq');
const msgpack	= require('msgpack');
const deasync	= require('deasync')

class Client {
	constructor(address) {
		// initialize the sockets
		this.__sock = zmq.socket('req');

		// queue to enforce transitions
		this.__call_queue = [];

		// connect the req socket
		this.__sock.connect(address);

		// queue processor
		this.__sock.on('message', reply => {
			// pop off the next operation and call the callback
			let cb = this.__call_queue.shift().cb;
			reply = msgpack.unpack(reply);
			if (!reply.success) {
				cb(reply)
			} else {
				cb(undefined, reply['return'])
			}
			this.__do_next_operation(); // chain to the next call
		});

		// fetch the remote listing
		this.__listing = [];

		// wait for deasync
		deasync(this.__update_remote_listing.bind(this))();
	}

	__update_remote_listing(callback) {
		this.__call({func: '#listing', args: []}, (err, reply) => {
			this.__listing = reply;

			for (let fn of reply) {
				// curry promiseful api calls 
				this[fn.name] = function() {
					const args = [];
					for (let key in arguments) {
						args.push(arguments[key])
					}
					return deasync( this.__call.bind(this) )({
						func: fn.name,
						args: args
					});
				}.bind(this);
			}

			// callback (for deasync)
			callback(undefined, true);
		});
	}

	__do_next_operation() {
		if (this.__call_queue.length == 0) return;
		let rcall = this.__call_queue[0];
		this.__sock.send(rcall.data);
	}

	__call(data, cb) {
		// pack the op with msgpack
		data = msgpack.pack(data);

		// add the request to the queue
		this.__call_queue.push({
			data: data,
			cb: cb
		})

		// if this was the first request on the queue, start the op chain
		if (this.__call_queue.length == 1) {
			this.__do_next_operation();
		}
	}
}

class AsyncClient {
	constructor(address) {
		// initialize the sockets
		this.__sock = zmq.socket('req');

		// queue to enforce transitions
		this.__call_queue = [];

		// connect the req socket
		this.__sock.connect(address);

		// queue processor
		this.__sock.on('message', reply => {
			// pop off the next operation and call the callback
			let cb = this.__call_queue.shift().cb;
			reply = msgpack.unpack(reply);
			if (!reply.success) {
				cb(undefined, reply)
			} else {
				cb(reply['return'])
			}
			this.__do_next_operation(); // chain to the next call
		});

		// fetch the remote listing
		this.__listing = [];

		// wait for deasync
		deasync(this.__update_remote_listing.bind(this))();
	}

	__update_remote_listing(callback) {
		this.__call({func: '#listing', args: []}, reply => {
			this.__listing = reply;

			for (let fn of reply) {
				// curry promiseful api calls 
				this[fn.name] = function() {
					const args = [];
					for (let key in arguments) {
						args.push(arguments[key])
					}
			
					

					return new Promise( (resolve, reject) => {
						this.__call({
							func: fn.name,
							args
						}, (ret, err) => {
							if (err !== undefined) {
								reject(err);
								return;
							}
							resolve(ret);
						})
					})
				}.bind(this);
			}

			// callback (for deasync)
			callback(undefined, true);
		});
	}

	__do_next_operation() {
		if (this.__call_queue.length == 0) return;
		let rcall = this.__call_queue[0];
		this.__sock.send(rcall.data);
	}

	__call(data, cb) { 
		// pack the op with msgpack
		data = msgpack.pack(data);

		// add the request to the queue
		this.__call_queue.push({
			data: data,
			cb: cb
		})

		// if this was the first request on the queue, start the op chain
		if (this.__call_queue.length == 1) {
			this.__do_next_operation();
		}
	}
}
module.exports = {Client, AsyncClient};
