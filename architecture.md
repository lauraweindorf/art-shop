# Art Supply Chain Contract Architecture
*describes the architecture for the smart contract and includes UML diagrams*

The smart contract design is modeled after the idea of adopting artwork from an artist, as opposed to the idea of purchasing. Finding a good home for a great piece of artwork, and being able to trace the provenance and authenticity of the artwork is an excellent use of Blockchain technology. Additionally, with no third-party handling of the transactions, the artist, shipper and art adopter can streamline and make the whole process much simpler, cheaper and more reliable.

This project is the beginning of an idea to liberate artists and their artwork so it can be shared and tracked on the Blockchain. Future improvements could include contract payments to the origin artist when their work transfers to another art lover in the future.

## Roles
* Artist - creates the artwork and handles the framing, listing and packing the artwork
* Art Adopter - adopts the artwork for a fee and anticipates the delivery by the shipper
* Shipper - once the artwork is adopted and packed the shipper picks up the work so it can be shipped and delivered to its new owner!

## Activity Diagram
This diagram illustrates the activities and roles that are involved in the Art Supply Chain. The Art Adoption Shop is more of a virtual role that illustrates how the smart contract is responsible for adding the artwork to the Art Shop inventory.

!()[images/art-adoption-activity-diagram.png]

## Class Diagram
The class diagram is primarily used to illustrate the solidity folders and components that make up the smart contract files.

!()[images/art-adoption-class-diagram.png]

## Sequence Diagram
The process of creating the sequence diagram for the smart contract was useful in revealing an additional object that is central to the whole process, namely the Artwork. There are some differences between UML diagramming in an object-oriented sense vs. smart contracts. The main purpose of the diagramming for this project was to communicate the design and serve as a "recipe" for proceeding with the implementation. 

!()[images/art-adoption-sequence-diagram.png]

## State Diagram
The state diagram for the most interesting to do, being new to smart contract design. It was helpful in designing the flow of states and the modifiers that would be needed for each contract call where there was a state transition.

!()[images/art-adoption-state-diagram.png]

# Conclusion
Designing the smart contract implementation for the Art Supply Chain project was extremely helpful in that it necessitated modeling different views which naturally led to a harmonious design. That feeling when you know it feels right!