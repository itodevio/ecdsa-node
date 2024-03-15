import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes } from 'ethereum-cryptography/utils';

function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const message = `Send ${sendAmount} to ${recipient}`;
      const messageBytes = utf8ToBytes(message);
      const signature = secp256k1.sign(keccak256(messageBytes), privateKey.replace('0x', ''));
      console.log(signature)

      const { data } = await server.post(`send`, {
        amount: parseInt(sendAmount),
        recipient: recipient.replace('0x', ''),
        compactSignature: signature.toCompactHex() + signature.recovery.toString(16),
      });
      setBalance(data.balance);
    } catch (ex) {
      console.log(ex)
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
