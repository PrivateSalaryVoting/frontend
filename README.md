

# Private Salary Voting

A fully homomorphic encryption (FHE) based smart contract for anonymous salary voting and averaging using Zama's fhEVM.

## Overview

This contract allows users to privately submit their salary information and compute averages without revealing individual salaries. All salary data remains encrypted on-chain, ensuring complete privacy while still enabling collective statistics.

## Features

- *Private Voting*: Submit encrypted salary votes that remain confidential
- *Encrypted Averaging*: Compute average salaries without decrypting individual votes
- *Session Management*: Create and manage multiple voting sessions with custom parameters
- *Access Control*: Only session owners can manage sessions and compute results
- *Time-Bound Voting*: Set deadlines for when voting closes

## Key Functions

### Creating a Session

solidity
function createSession(
    uint64 minSalary,
    uint64 maxSalary,
    uint256 deadline
) external returns (uint256 sessionId)


Creates a new voting session with specified salary range and deadline.

*Parameters:*
- minSalary: Minimum expected salary (for reference)
- maxSalary: Maximum expected salary (for reference)
- deadline: Unix timestamp when voting closes

*Returns:* Unique session ID

### Submitting a Vote

solidity
function submitVote(
    uint256 sessionId,
    externalEuint64 encryptedSalary,
    bytes calldata proof
) external


Submit an encrypted salary vote to a session.

*Parameters:*
- sessionId: ID of the voting session
- encryptedSalary: Your encrypted salary value
- proof: Cryptographic proof for the encrypted value

### Computing Average

solidity
function computeAverage(uint256 sessionId) external


Computes the encrypted average of all votes. Only callable by session owner after voting period.

### Getting Results

solidity
function getFinalAverage(uint256 sessionId) public view returns(euint64)


Returns the encrypted final average. Use Zama's decryption tools on the frontend to reveal the result.

solidity
function getUserVote(uint256 sessionId) public view returns(euint64)


Returns your own encrypted vote for a session.

## Usage Flow

1. *Session Owner*: Create a voting session with createSession()
2. *Participants*: Submit encrypted salaries using submitVote()
3. *Session Owner*: After deadline, call computeAverage()
4. *Anyone*: Decrypt the result on the frontend using getFinalAverage()

## Security Features

- Individual votes remain encrypted on-chain
- Only voters can decrypt their own votes
- Session owners cannot see individual salaries
- Time-locked voting periods prevent late manipulation
- Session owners can update parameters but this resets all votes

## Events

- SessionCreated: Emitted when a new session is created
- SessionUpdated: Emitted when session parameters are updated
- VoteSubmitted: Emitted when a user submits a vote

## Requirements

- Zama fhEVM compatible network
- Encrypted input generation tools for creating encryptedSalary and proof