import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };


  runExample = async () => {
    const { accounts, contract } = this.state;

    

    const voteYes = await contract.voteYes();
    const voteNo = await contract.voteNo();
    const hash = await contract.hash_value();

    // Update state with the result.
    this.setState({ voteYes : voteYes.toNumber(), voteNo : voteNo.toNumber(), hash : hash });
  };

  vote = (voted) =>
  {
    console.log("vote:" + voted );
    const {accounts, contract} = this.state;
    contract.vote(voted, {"from":accounts[0]});
    contract.saveHash("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", {"from" : accounts[0]});
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Vote app</h1>
        <div>Vote yes: {this.state.voteYes}</div>
        <div>Vote no: {this.state.voteNo}</div>
        <div>Hash: {this.state.hash}</div>

        <button onClick={() => {this.vote(true)}}>Vote Yes</button>
        <button onClick={() => {this.vote(false)}}>Vote No</button>
      </div>
    );
  }
}

export default App;
