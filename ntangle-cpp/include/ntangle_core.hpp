/**
 * Dear lord why
 * @author Patrick Kage
 */

#ifndef NTANGLE_CORE_HPP
#define NTANGLE_CORE_HPP

#include "lib/json.hpp"
#include "lib/zmq.hpp"

namespace ntangle {
	// for convenience
	using json = nlohmann::json;

	/**
	 * The main remote connection class
	 */
	class RemoteConnection {
	private:
		// zeromq stuff
		zmq::context_t* context;
		zmq::socket_t* sock;

		void create_socket(std::string &address) {
			this->sock = new zmq::socket_t(*this->context, ZMQ_REQ);
			this->sock->connect(address.c_str());
		}
	public:
		/**
		 * @constructor
		 * Create the remote connection at the address, and create a new zeromq context
		 */
		RemoteConnection(std::string address) {
			this->context = new zmq::context_t(1);
			create_socket(address);
		}

		/**
		 * @constructor
		 * Create the remote connection at the address, and re-use an existing zeromq context
		 */
		RemoteConnection(std::string address, zmq::context_t &context) {
			this->context = &context;
			create_socket(address);
		}

		/**
		 * Call a remote function
		 * @param call_desc a json object describing the current call.
		 */
		json __call(json &call_desc) {
			// pack up the json as a msgpack object
			std::vector<std::uint8_t> packed = json::to_msgpack(call_desc);

			// create the request
			zmq::message_t request(packed.size());

			// copy over the data (!)
			// this relies on vector memory being contiguous
			// iirc this is not enforced by the spec but is oftenn the case
			memcpy(request.data(), &packed[0], packed.size());

			// lets call!
			this->sock->send(request);

			zmq::message_t reply;
			this->sock->recv(&reply);

			// reuse the vector from earlier i guess
			packed.resize(reply.size());
			memcpy(&packed[0], reply.data(), reply.size());

			// unpack as msgpack
			return json::from_msgpack(packed);
		}
	};
}

#endif
