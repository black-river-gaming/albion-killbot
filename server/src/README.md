# Source structure

The source code for this service is organized using the Hexagonal Architecture. Since there's no consensus on the terms, the structure tries to assimilate the concepts of the architecture as close as possible.

## Interfaces

**Interfaces** are the entry points for the outside world. Ways in that the server interfaces with other systems. Ex: REST Api, Discord, gRPC.

In the context of _Albion-Killbot_, they are the main entry points for the system, or modes. Those are:

- **api**: REST Api to communicate with other systems.
- **bot**: Discord bot to interact with Discord servers. Also a consumer for message queues.
- **crawler**: Interface to connect with Albion API and fetch events. Also a producer for message queues.

Each of those can have multiple **controllers**, **routers** or similiar things to help them manage the state of the application and perform various actions.

## Services

**Services** are domain-related code that are core to the application functioning. They provide the functionalities to the interfaces, and make use of **ports** to intercommunicate with other systems. **Services** are the application and business logic that run inside the "hexagon boundaries".

## Ports

Are the glue between **services** and **adapters**. **Ports** abstract the underlying technology and provide simple methods for interaction between the worlds inside and outside of the hexagon boundaries.

## Adapters

The same way your power plug needs an adapter when using a foreign power plug hole, **adapters** are the piece of code that take care of the engineering necessary to make **ports** work. They are mostly sdk clients to other systems, and they can be switched as needed.

## Helpers

Helpers are shared code for the entire application, providing support to all other architecture components. Examples are _logger_ and _utils_.
