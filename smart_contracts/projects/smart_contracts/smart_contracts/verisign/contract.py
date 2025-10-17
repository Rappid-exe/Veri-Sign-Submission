from algopy import ARC4Contract, Txn, Global, BoxMap, Bytes
from algopy.arc4 import abimethod, Struct, Address, UInt64
from typing import Literal


class Attestation(Struct):
    """
    Represents an on-chain signature for a piece of content.
    
    Attributes:
        creator_address: The wallet address of the content creator
        timestamp: The block timestamp when the content was signed
    """
    creator_address: Address
    timestamp: UInt64


class VerisignApp(ARC4Contract):
    """
    Veri-Sign Smart Contract
    
    This contract provides a decentralized content authentication system.
    Creators can create immutable, timestamped signatures for their digital content
    by storing a hash of the content on-chain, linked to their wallet address.
    """
    
    def __init__(self) -> None:
        """Initialize the contract with an empty attestations mapping."""
        # BoxMap stores attestations using file hash as key
        # Key: 32-byte SHA-256 hash of the file
        # Value: Attestation struct containing creator address and timestamp
        self.attestations = BoxMap(Bytes, Attestation, key_prefix=b"a")
    
    @abimethod()
    def attest(self, file_hash: Bytes) -> Attestation:
        """
        Create an immutable, timestamped signature for a piece of content.
        
        This method allows a creator to register a file hash on-chain, proving
        they were the first to sign this specific content at a specific time.
        
        Args:
            file_hash: A 32-byte SHA-256 hash of the content being signed
            
        Returns:
            Attestation: The newly created attestation containing creator address and timestamp
            
        Raises:
            AssertionError: If the file_hash has already been attested
        """
        # Assert: Ensure this file hash hasn't been signed before
        # This implements a "first to sign wins" policy
        assert file_hash not in self.attestations, "Content already attested"
        
        # Create: Instantiate a new Attestation struct
        new_attestation = Attestation(
            creator_address=Address(Txn.sender),  # The wallet address calling this method
            timestamp=UInt64(Global.latest_timestamp)  # Current block timestamp
        )
        
        # Store: Save the attestation to the BoxMap using file_hash as key
        self.attestations[file_hash] = new_attestation.copy()
        
        # Return: Output the newly created attestation
        return new_attestation
