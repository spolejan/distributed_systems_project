pragma solidity ^0.4.24;

contract SimpleStorage {
    uint32 public voteYes;
    uint32 public voteNo;
    string public hash_value;

    function vote(bool yes) public {
        if(yes)
        {
            ++voteYes;
        }
        else
        {
            ++voteNo;
        }
    }

    function saveHash (string memory in_hash) public {
        hash_value = in_hash;
    }
    function sayHello() public view returns(string memory) {
        return hash_value;
    }
}
