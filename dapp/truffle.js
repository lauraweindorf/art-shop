const HDWalletProvider = require('truffle-hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".mnemonic").toString().trim();
const infuraKey = fs.readFileSync(".infuraKey").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },

    rinkeby: {
        provider: function() {
          return new HDWalletProvider(
            mnemonic,
            'https://rinkeby.infura.io/v3/' + infuraKey
          )
        },
        network_id: '4',
        gas: 4500000,
        gasPrice: 10000000000,
      }
  }
};
