# Art Shop - Udacity Project
*a decentralized app that lets artists sell their work on the blockchain*

## Art Supply chain & data auditing

This repository containts an Ethereum DApp that demonstrates an Artwork Supply Chain flow between an Artist and Art Adopter. The user story is similar to any commonly used supply chain process. An artist can add artworks to the inventory of adoptable art stored in the blockchain. An Art Adopter can adopt the artwork, for a fee, from the inventory system. Additionally an Artist can mark an artwork as Framed and ready for pick-up. The Shipper thens ships and marks the artwork as Delivered to the Art Adopter.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Please make sure you've already installed ganache-cli, Truffle and enabled MetaMask extension in your browser.

### Installing

A step by step series of examples that tell you have to get a development env up and running

Clone this repository:

```
git clone https://github.com/lauraweindorf/art-shop
```

Change directory to the ```art-shop/dapp``` folder and install all requisite npm packages (as listed in ```package.json```):

```
cd art-shop/dapp
npm install
```

Launch Ganache:

```
ganache-cli -m "spirit supply whale amount human item harsh scare congress discover talent hamster"
```

Your terminal should look something like this:

![truffle test](images/ganache-cli.png)

In a separate terminal window, Compile smart contracts:

```
truffle compile
```

This will create the smart contract artifacts in folder ```dapp/build/contracts```.

Migrate smart contracts to the locally running blockchain, ganache-cli:

```
truffle migrate
```

Test smart contracts:

```
truffle test
```

All tests should pass.


## Built With

* [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
* [IPFS](https://ipfs.io/) - IPFS is the Distributed Web | A peer-to-peer hypermedia protocol
to make the web faster, safer, and more open.
* [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.


## Authors

Adapted from the [Udacity Supply chain & data auditing](https://github.com/udacity/nd1309-Project-6b-Example-Template) project.
Adapted from the [Truffle Framework's Pet Shop Tutorial](https://truffleframework.com/tutorials/pet-shop) by Josh Quintal.

See also the list of [contributors](https://github.com/lauraweindorf/art-shop/contributors.md) who participated in this project.

## Acknowledgments

* Solidity v0.5.4
* Ganache-cli
* Truffle v5.0.5
* IPFS

