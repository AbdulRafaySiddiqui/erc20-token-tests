const hre = require("hardhat");

async function main() {
    // const Deployer = '0x48656596EF052DA66c93830E2eD5BB7785f3C752';
    // const WETH = '0x8F794354B55e04c45f02b7905542dc2D35ffbDD8';
    // const Factory = '0x8aeF98Fb4A702fa7D42B862067F53c4A38ED2181';
    // const Router = '0x47C763A8FC66fb892d30EfE1f93D25B1f68393d3';
    // const Sauce = '0xc9249a896545dD29d6E5dF370506D21294957496';

    const Deployer = '0x48656596EF052DA66c93830E2eD5BB7785f3C752';
    const WETH = '0xca7a7f65CC43e98a6A4BdE99c5D0b84671c04553';
    const Factory = '0xE25032308bDeABC9e2918e061221E37Ce359941D';
    const Router = '0x47968dFE565d50b29B31E20E624d0245c824Dc1F';

    await hre.run("verify:verify", {
        address: WETH,
        constructorArguments: [],
    });

    await hre.run("verify:verify", {
        address: Factory,
        constructorArguments: [Deployer],
    });

    await hre.run("verify:verify", {
        address: Router,
        constructorArguments: [Factory, WETH],
    });

    // await hre.run("verify:verify", {
    //     address: Sauce,
    //     constructorArguments: [],
    // });

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });