Hackathon Project Context: Veri-Sign (Updated)
1. Project Elevator Pitch
Veri-Sign is a protocol and platform for creating a "Web of Trust" on the internet. It allows verified organizations (like news agencies and universities) to issue on-chain credentials to their members, who can then create permanent, verifiable signatures for their digital content. By combining smart contracts with a decentralized identity system, Veri-Sign provides an unprecedented level of authenticity, allowing anyone to instantly distinguish between trusted content and misinformation.
2. The Problem
The internet is flooded with sophisticated AI-generated fakes. Trust is broken. It's no longer enough to know if a piece of content is real; we need to know if it comes from a trusted source. Anonymous signatures are a good first step, but a true solution requires a system for on-chain reputation.
3. The Solution: A Two-Tiered System
Veri-Sign solves this with an elegant, two-tiered system for verification.
Layer 1: The Core Attestation Engine (The "What" and "When")
A simple, robust smart contract allows any individual to create an immutable, timestamped signature for a file, linking its hash to their wallet address. This is the base layer of authenticity.
Layer 2: The Organization & Reputation Layer (The "Who")
Verified organizations (e.g., Reuters, Harvard) are whitelisted at the protocol level.
These organizations can mint and distribute non-transferable Algorand Standard Assets (ASAs) that act as on-chain credentials or "Press Passes" to their members (e.g., journalists, researchers).
When content is verified, our platform checks not only for the core signature but also if the creator's wallet holds a credential from a trusted organization.
This results in a powerful user experience. Instead of just seeing "Verified by ...XYZ.algo," a user sees "Verified by Reuters."
4. Core User Flows
Admin Flow (Organization Onboarding):
A trusted entity (e.g., Reuters.algo) mints a unique, non-transferable ASA to serve as their official credential.
The organization sends one of these credential ASAs to the personal wallet of each verified member (e.g., journalist Sarah Jones).
Creator Flow (Signing Content):
Sarah connects her wallet to the Veri-Sign webapp.
She uploads a photo. The app hashes it locally.
She approves a transaction to the Veri-Sign smart contract, creating the core signature.
Consumer Flow (The "Magic Moment"):
A user right-clicks a photo on a news site and selects "Verify with Veri-Sign."
The extension hashes the photo and queries our smart contract, finding it was signed by Sarah's wallet.
The extension then makes a second, fast query to the Algorand Indexer, checking if Sarah's wallet holds a credential ASA from a known organization.
The user sees a rich, branded notification: "✅ Verified by Reuters."
5. Technical Architecture & Stack
Web Application: Next.js (TypeScript), Tailwind CSS, deployed on Vercel.
Smart Contract: Python with Beaker (developed with AlgoKit). The core contract is already complete and tested on LocalNet.
Blockchain Interaction:
algosdk-js for core transactions.
@perawallet/connect for wallet integration.
Algorand Indexer API: This is crucial for efficiently querying ASA holdings for the reputation layer.
Chrome Extension: Plain JavaScript/HTML/CSS (using Vite).
6. Hackathon MVP & Goals
Our priorities are tiered to ensure we have a winning submission.
MUST HAVE (The Core Product):
A fully functional Next.js webapp for individual signing and verification.
This core functionality is our safety net and proves the fundamental concept.
WINNING GOAL (The Reputation Layer):
Implement the frontend logic to check for a "credential ASA" using the Algorand Indexer.
Create a simple admin interface (or script) to mint and distribute a test credential.
Display the enhanced, branded verification notifications. This is the key differentiator.
STRETCH GOAL (The "Veri-Sign Camera"):
A mobile-friendly PWA page (/camera) that uses getUserMedia to access the phone's camera.
Allows users to take a photo and sign it in a single, seamless flow, proving physical capture.