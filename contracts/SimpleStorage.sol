pragma solidity ^0.4.24;

contract SimpleStorage {
    uint32 public voteYes;
    uint32 public voteNo;

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
}
