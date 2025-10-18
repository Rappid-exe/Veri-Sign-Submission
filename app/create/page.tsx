"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Hash, CheckCircle2, AlertCircle } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { hashFile, formatAddress, formatTimestamp } from "@/lib/algorand"
import { createAttestation, type Attestation } from "@/lib/contract"

export default function CreatePage() {
  const { address, isConnected, connect } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "hashing" | "signing" | "complete" | "error">("idle")
  const [attestation, setAttestation] = useState<Attestation | null>(null)
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setHash("")
      setStatus("idle")
      setAttestation(null)
      setError("")
      setLogs([])
    }
  }

  const generateHash = async () => {
    if (!file) return

    setStatus("hashing")
    setLogs([])
    addLog("> Generating SHA-256 hash...")

    try {
      const fileHash = await hashFile(file)
      setHash(fileHash)
      addLog(`✓ Hash generated successfully.`)
      addLog(`  ${fileHash}`)
      setStatus("idle")
    } catch (err: any) {
      setError("Failed to generate hash: " + err.message)
      setStatus("error")
      addLog(`✗ Error: ${err.message}`)
    }
  }

  const createSignature = async () => {
    if (!hash || !address) return

    setStatus("signing")
    addLog("> Connecting to Algorand TestNet...")
    addLog("> Preparing transaction...")

    try {
      addLog("> Awaiting wallet approval...")
      const result = await createAttestation(hash, address)
      
      addLog(`✓ Transaction sent to Algorand TestNet.`)
      addLog(`✓ Signature created. Block #${result.blockNumber}`)
      addLog(`✓ Transaction ID: ${result.txId}`)
      
      setAttestation(result)
      setStatus("complete")
    } catch (err: any) {
      setError(err.message || "Failed to create signature")
      setStatus("error")
      addLog(`✗ Error: ${err.message}`)
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connect()
    } catch (err: any) {
      setError("Failed to connect wallet: " + err.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Create a Signature</h1>
              <p className="text-lg font-mono text-muted-foreground">
                Upload your content, generate its hash, and anchor its authenticity to the blockchain.
              </p>
            </div>

            {/* Wallet Connection Warning */}
            {!isConnected && (
              <Card className="border-2 border-accent bg-accent/10 p-6 mb-6 flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-xl uppercase tracking-tight">Wallet Required</div>
                  <div className="font-mono text-sm">
                    Connect your Pera Wallet to create signatures on the blockchain.
                  </div>
                </div>
                <Button
                  onClick={handleConnectWallet}
                  className="bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                >
                  Connect Wallet
                </Button>
              </Card>
            )}

            {/* Error Display */}
            {error && status === "error" && (
              <Card className="border-2 border-destructive bg-red-50 p-6 mb-6 flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                <div>
                  <div className="font-bold text-xl text-red-900 uppercase tracking-tight">Error</div>
                  <div className="font-mono text-sm text-red-800">{error}</div>
                </div>
              </Card>
            )}

            <div className="space-y-6">
              {/* File Upload */}
              <Card className="border-2 border-foreground p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Upload className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Upload File</h2>
                </div>

                <div className="border-2 border-dashed border-foreground p-12 text-center hover:bg-muted transition-colors cursor-pointer">
                  <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-mono text-sm">{file ? file.name : "Click to upload or drag and drop"}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-2">Images, PDFs, documents supported</p>
                  </label>
                </div>

                {file && !hash && (
                  <Button
                    onClick={generateHash}
                    disabled={status === "hashing"}
                    className="w-full mt-6 border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    {status === "hashing" ? "Generating Hash..." : "Generate Hash"}
                  </Button>
                )}
              </Card>

              {/* Hash Display */}
              {hash && (
                <Card className="border-2 border-foreground p-8 bg-foreground text-background">
                  <div className="flex items-center gap-3 mb-6">
                    <Hash className="h-5 w-5" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">File Hash</h2>
                  </div>

                  <div className="font-mono text-sm break-all bg-background text-foreground p-4 border-2 border-background">
                    {hash}
                  </div>

                  {status !== "complete" && (
                    <Button
                      onClick={createSignature}
                      disabled={status === "signing" || !isConnected}
                      className="w-full mt-6 bg-accent hover:bg-accent/90 text-foreground border-2 border-background font-mono uppercase tracking-widest"
                    >
                      {status === "signing" ? "Creating Signature..." : !isConnected ? "Connect Wallet First" : "Create Signature"}
                    </Button>
                  )}
                </Card>
              )}

              {/* Terminal Log */}
              {logs.length > 0 && (
                <Card className="border-2 border-foreground p-8 bg-foreground text-background font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-accent">{">"} System log:</div>
                    {logs.map((log, i) => (
                      <div key={i} className={log.startsWith('>') ? '' : 'pl-4'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Transaction Details */}
              {status === "complete" && attestation && (
                <Card className="border-2 border-foreground p-8 bg-muted">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Transaction Details</h2>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">File Hash</div>
                      <div className="break-all">{hash}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Wallet Address</div>
                      <div>{formatAddress(attestation.creatorAddress)}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timestamp</div>
                      <div>{formatTimestamp(attestation.timestamp)}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Block Number</div>
                      <div>#{attestation.blockNumber}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Transaction ID</div>
                      <div className="break-all">{attestation.txId}</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
