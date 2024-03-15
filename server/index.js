const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { keccak256 } = require('ethereum-cryptography/keccak');
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { utf8ToBytes, toHex } = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = {
  "7ebd1e6de04b088bb1db221cca4fb2893afc5585": 100,
  "0080842abdf2c5604919c76ff45c6b06ed65c935": 50,
  "b375c4d185954a7603ffa0848fe194e4e69ed785": 75,
};

const nonces = {
  "7ebd1e6de04b088bb1db221cca4fb2893afc5585": 0,
  "0080842abdf2c5604919c76ff45c6b06ed65c935": 0,
  "b375c4d185954a7603ffa0848fe194e4e69ed785": 0,
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address.replace('0x', '')] || 0;
  const nonce = nonces[address.replace('0x', '')] || 0;
  res.send({ balance, nonce });
});

app.post("/send", (req, res) => {
  const { recipient, amount, compactSignature, nonce } = req.body;

  console.log(nonces)

  const message = `Send ${amount} to ${recipient}. Nonce: ${nonce}`;

  const signature = unpackSignature(compactSignature);
  const publicKey = recoverPublicKey(signature, message);

  const isSignatureValid = secp256k1.verify(signature, hash(message), publicKey);

  if (!isSignatureValid) {
    return res.status(400).send({ message: 'Invalid signature!' });
  }

  const sender = getAddress(publicKey);

  if (nonces[sender] !== nonce) {
    return res.status(400).send({ message: 'Invalid nonce' });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);
  setInitialNonce(sender);

  if (balances[sender] < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    nonces[sender] += 1;
    return res.send({ balance: balances[sender], nonce: nonces[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialNonce(address) {
  if (!nonces[address]) {
    nonces[address] = 0;
  }
}

function hash(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}

function unpackSignature(compactSignature) {
  const signature = secp256k1.Signature.fromCompact(compactSignature.slice(0, 128));
  signature.recovery = parseInt(compactSignature.slice(128), 16);
  return signature;
}

function getAddress(_publicKey) {
  const publicKey = _publicKey.slice(1);
  return toHex(keccak256(publicKey).slice(-20));
}

function recoverPublicKey(signature, message) {
  return signature.recoverPublicKey(toHex(hash(message))).toRawBytes();
}