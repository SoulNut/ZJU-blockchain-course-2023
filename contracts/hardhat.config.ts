import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x64c2690c4282159e2430f7b15cdd2f37693f87e4a58acd796a528c585cdda000',
        '0x5e138e760da7d5ecd4cec13bb1ee632960a41c3096847848ba79cfd4e5be7c7d',
        '0xe19942c0447a8272f672ae080f6c8af5f221913e96a7990ac8792969b410d382',
        '0xbc8b8d341a24caab62aa94ee6ce92cbab7cd888c910be0b36285b792f35301a1'
      ]
    },
  },
};

export default config;
