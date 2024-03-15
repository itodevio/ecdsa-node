const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex } = require('ethereum-cryptography/utils');

const privateKey = secp256k1.utils.randomPrivateKey();
const publicKey = secp256k1.getPublicKey(privateKey);

const publicKeyHash = keccak256(publicKey);
const address = toHex(publicKeyHash.slice(publicKeyHash.length - 20));

console.log({
  privateKey: toHex(privateKey),
  publicKey: toHex(publicKey),
  address,
});
