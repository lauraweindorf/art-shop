// migrating the appropriate contracts
var ArtSupplyChain = artifacts.require("./ArtSupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(ArtSupplyChain);
};
