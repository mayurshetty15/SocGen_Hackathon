const hre = require("hardhat");

async function main() {
    console.log("Deploying DocumentVerifier contract...");

    const DocumentVerifier = await hre.ethers.getContractFactory("DocumentVerifier");
    const documentVerifier = await DocumentVerifier.deploy();

    await documentVerifier.waitForDeployment();

    const address = await documentVerifier.getAddress();
    console.log("DocumentVerifier deployed to:", address);

    // Save the contract address to a file for the backend to use
    const fs = require('fs');
    const contractInfo = {
        address: address,
        network: hre.network.name
    };

    fs.writeFileSync('./contract-address.json', JSON.stringify(contractInfo, null, 2));
    console.log("Contract address saved to contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 