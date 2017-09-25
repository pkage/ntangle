#include "include/ntangle_core.hpp"
#include <iostream>

using json = nlohmann::json;
using namespace ntangle;

int main() {
	RemoteConnection rc("tcp://localhost:55566");

	json j;
	j["func"] = "#listing";

	std::cout << rc.__call(j);
}
