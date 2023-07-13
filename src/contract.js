function getERC20TokenContract(contractAddress){
    const ETH_ERC20_ABI = require("./abis/eth-erc-20-abi.json");
    const web3 = require("./provider").getWeb3Provider();
    return new web3.eth.Contract(ETH_ERC20_ABI, contractAddress);
}

module.exports = {
    getERC20TokenContract
};