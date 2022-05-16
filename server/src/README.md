# Source structure

The source code for this service is organized using the Hexagonal Architecture. Since there's no consensus on the terms, the structure tries to assimilate the concepts of the architecture as close as possible.

## Interfaces

_Interfaces_ are the entry points for the outside world. Ways in that the server interfaces with other systems. Ex: REST Api, Discord, gRPC.

In the context of ~Albion-Killbot~, they are the main entry points for the system, or modes. Those are:

- _api_: REST Api to communicate with other systems.
- _bot_: Discord bot to interact with Discord servers. Also a consumer for message queues.
- _crawler_: Interface to connect with Albion API and fetch events. Also a producer for message queues.

Each of those can have multiple _controllers_, _routers_ or similiar things to help them manage the state of the application and perform various actions.

## Services

_Services_ are domain-related code that are core to the application functioning. They provide the functionalities to the interfaces, and make use of many _ports_ to intercommunicate with other systems. _Services_ are the application and business logic that run inside the "hexagon boundaries".

## Ports

The way that _services_ communicate with external systems. _Ports_ abstract the underlying technology and provide simple methods for interaction with the ouside world of the "hexagon boundaries".

## Adapters

The same way your power plug needs an adapter when using a foreign power plug hole, _adapters_ are the piece of code that take care of the engineering necessary to make _ports_ work "magically". They are mostly sdk clients to other systems, thus they can be switched as needed.

## Helpers

Helpers are shared code for the entire application, providing support to all other architecture components.
