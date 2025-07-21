import React, { useCallback, useEffect, useState } from "react";
import abi from "./abi.json";
import "../src/myCss.css";
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
      setViewOut("Error fetching message");
      setGetOutError(
        "Failed to fetch message: " +
          (error.message || "Check console for details")
      );
    }
  }, []);

  useEffect(() => {
    handleGet();
  }, [handleGet]);

  return (
    <div className="firstdiv" style={{ padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", }}>
      <div className="seconddiv" style={{ position: "absolute", top: "25%", border: "2px solid blue", width: "70%", padding: "3% 3%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ textAlign: "center", fontSize: "25px" }}>Smart Contract</h1>
        <input
          type="text"
          placeholder="Set message"
          value={text}
          style={{ margin: "1.5rem 1.5rem", width: "70%"}}
          onChange={(e) => setText(e.target.value)}
        />
        <button style={{ margin: "1rem 1rem", padding: "3% 3%", width: "70%", border: "none", backgroundColor: "blue", color: "white", borderRadius: "5%" }}  onClick={handleSet}>{viewIn}</button>
        <div style={{ overflow: "hidden"}}>
          {message && <p style={{ overflow: "hidden"}}>Message: {message}</p>}
          {getInError && <p style={{ color: "red" }}>Error: {getInError}</p>}
        </div>

        <button style={{ margin: "1rem 1rem", padding: "3% 3%", width: "70%", border: "none", backgroundColor: "blue", color: "white", borderRadius: "5%" }} onClick={handleGet}>{viewOut}</button>
        <div>
          {outMessage && <p style={{ overflow: "hidden"}}>Message: {outMessage}</p>}
          {getOutError && <p style={{ color: "red" }}>Error: {getOutError}</p>}
        </div>
        </div>
    </div>
  );
}

export default App;
