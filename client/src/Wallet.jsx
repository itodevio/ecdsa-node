import { useState } from "react";
import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { toHex } from 'ethereum-cryptography/utils';

function Wallet({ privateKey, setPrivateKey, balance, setBalance }) {
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');

  function getAddress(_publicKey) {
    const publicKey = _publicKey.slice(1);
    return toHex(keccak256(publicKey).slice(-20));
  }

  async function onChange(evt) {
    setError('');
    setAddress('');
    setBalance(0);
    const privKey = evt.target.value;
    setPrivateKey(privKey);
    if (privKey) {
      try {
        const publicKey = secp256k1.getPublicKey(privKey);
        const _address = getAddress(publicKey);
        const { data } = await server.get(`balance/${_address}`);
        setAddress(`0x${_address}`);
        setBalance(data.balance);
      } catch (err) {
        setError('Invalid private key');
      }
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        <span>Private Key <span className="info-message">*Don't worry, it'll not be saved anywhere!</span></span>
        <input placeholder="Type a private key, for example: 0x1" value={privateKey} onChange={onChange}></input>
        <span className="error-message">{error}</span>
      </label>

      <div className="address">Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
