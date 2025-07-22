import React, { useCallback, useEffect, useState } from "react";
import abi from "./abi.json";
import "./Css/special.css";
import { ethers } from "ethers";

const contractAddress = "0xee053B950ea5b88Db90288D1E92f7a293dDe3628"; //this is the contract address after i have deployed the contract

function App() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [outMessage, setOutMessage] = useState("");
  const [getInError, setGetInError] = useState(null);
  const [getOutError, setGetOutError] = useState(null);
  const [viewIn, setViewIn] = useState("Set Message");
  const [viewOut, setViewOut] = useState("Get Message");


  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const handleSet = async () => {
    try {
      if (!text) {
        alert("Please enter a message before setting.");
        return;
      }

      if (window.ethereum) {
        setViewIn("Setting Message...");
        await requestAccount();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.setMessage(text);
        const txReceipt = await tx.wait();
        console.log("Transaction successful:", txReceipt);
        setMessage(txReceipt);
        console.log(tx, txReceipt);
        setGetInError(null);
        setText("");

        await handleGet();
        setViewIn("Messge Set!...");
      } else {
        setViewIn("Error Sending...");
        console.error(
          "MetaMask not found. Please install MetaMask to use this application."
        );
        setGetInError(
          "MetaMask not found. Please install MetaMask to use this application."
        );
      }
    } catch (error) {
      console.error("Error setting message:", error);
      alert(error.message || error);
      setGetInError(error.message || "Oops, Failed to set message.");
    }
  };

  const handleGet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        setGetOutError(
          "MetaMask not found. Please install MetaMask to use this application."
        );
        return;
      }
      if (!window.ethereum.isMetaMask) {
        setGetOutError("Please use MetaMask wallet only.");
        return;
      }
      setViewOut("fetching Message...");
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const messageFromContract = await contract.getMessage();
      setOutMessage(messageFromContract);
      setGetOutError(null);
      setViewOut("Message Fetched Below!")
    } catch (error) {
      console.error("Error fetching message:", error);
      setViewOut("Reponds Above");
      setGetInError(
        "Failed to fetch message: " +
          (error.message || "Check console for details")
      );
    }
  }, []);

  useEffect(() => {
    handleGet();
  }, [handleGet]);

  return (
    <div className="firstdiv" >
      <div className="seconddiv" >
        <h1 style={{ textAlign: "center", fontSize: "25px" }}>Smart Contract</h1>
        <input
          type="text"
          placeholder="Set message"
          value={text}
          className="uniInput"
          onChange={(e) => setText(e.target.value)}
        />
        <button className="firstbtn" onClick={handleSet} >{viewIn}</button>
        <div style={{ overflow: "hidden"}}>
          {message && <p className="good">Message: {message}</p>}
          {getInError && <p className="errors">Error: {getInError}</p>}
        </div>

        <button className="secbtn" onClick={handleGet}>{viewOut}</button>
        <div style={{ overflow: "hidden"}}>
          {outMessage && <p className="good">Message: {outMessage}</p>}
          {getOutError && <p className="erroes">Error: {getOutError}</p>}
        </div>
        </div>
    </div>
  );
}

export default App;
