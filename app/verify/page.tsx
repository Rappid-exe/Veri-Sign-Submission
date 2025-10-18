"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, CheckCircle2, XCircle } from "lucide-react"
import { hashFile, formatAddress, formatTimestamp } from "@/lib/algorand"
import { verifyAttestation, type Attestation } from "@/lib/contract"

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "not-verified" | "error">("idle")
  const [attestation, setAttestation] = useState<Attestation | null>(null)
  const [hash, setHash] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus("idle")
      setAttestation(null)
      setHash("")
      setLogs([])
      setError("")
    }
  }

  const verifyFile = async () => {
    if (!file) return

    setStatus("verifying")
    setLogs([])
    addLog("> Verification log:")
    addLog("> Generating file hash...")

    try {
      // Generate hash
      const fileHash = await hashFile(file)
      setHash(fileHash)
      addLog(`✓ Hash generated successfully.`)
      addLog(`  ${fileHash}`)

      // Query blockchain
      addLog("> Querying Algorand blockchain...")
      addLog("> Checking signature database...")

      const result = await verifyAttestation(fileHash)

      if (result) {
        addLog(`✓ Signature found on blockchain.`)
        addLog(`  CREATOR: ${formatAddress(result.creatorAddress)}`)
        addLog(`  TIMESTAMP: ${formatTimestamp(result.timestamp)}`)
        if (result.blockNumber) {
          addLog(`  BLOCK: #${result.blockNumber}`)
        }
        addLog(`✓ VERIFICATION STATUS: TRUE`)
        
        setAttestation(result)
        setStatus("verified")
      } else {
        addLog(`✗ No signature found.`)
        addLog(`✗ File not registered on blockchain.`)
        addLog(`✗ VERIFICATION STATUS: FALSE`)
        setStatus("not-verified")
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
      setStatus("error")
      addLog(`✗ Error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Verify Content</h1>
              <p className="text-lg font-mono text-muted-foreground">
                Upload a file to verify its authenticity against the Algorand blockchain.
              </p>
            </div>

            {/* Status Banner */}
            {status === "verified" && (
              <div className="border-2 border-green-600 bg-green-50 p-6 mb-6 flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xl text-green-900 uppercase tracking-tight">VERIFIED</div>
                  <div className="font-mono text-sm text-green-800">
                    This file has a valid signature on the blockchain.
                  </div>
                </div>
              </div>
            )}

            {status === "not-verified" && (
              <div className="border-2 border-destructive bg-red-50 p-6 mb-6 flex items-center gap-4">
                <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                <div>
                  <div className="font-bold text-xl text-red-900 uppercase tracking-tight">NOT VERIFIED</div>
                  <div className="font-mono text-sm text-red-800">
                    No signature found for this file on the blockchain.
                  </div>
                </div>
              </div>
            )}

            {status === "error" && error && (
              <div className="border-2 border-destructive bg-red-50 p-6 mb-6 flex items-center gap-4">
                <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                <div>
                  <div className="font-bold text-xl text-red-900 uppercase tracking-tight">ERROR</div>
                  <div className="font-mono text-sm text-red-800">{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* File Upload */}
              <Card className="border-2 border-foreground p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Upload className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Upload File to Verify</h2>
                </div>

                <div className="border-2 border-dashed border-foreground p-12 text-center hover:bg-muted transition-colors cursor-pointer">
                  <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-mono text-sm">{file ? file.name : "Click to upload or drag and drop"}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-2">Any file type supported</p>
                  </label>
                </div>

                {file && status === "idle" && (
                  <Button
                    onClick={verifyFile}
                    className="w-full mt-6 bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    Verify with Veri-Sign
                  </Button>
                )}

                {file && status === "verifying" && (
                  <Button
                    disabled
                    className="w-full mt-6 bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    Verifying...
                  </Button>
                )}
              </Card>

              {/* Terminal Output */}
              {logs.length > 0 && (
                <Card className="border-2 border-foreground p-8 bg-foreground text-background font-mono text-sm">
                  <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div key={i} className={log.startsWith('>') ? 'text-accent' : 'pl-4'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Verification Details */}
              {status === "verified" && attestation && (
                <Card className="border-2 border-foreground p-8 bg-muted">
                  <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Signature Details</h2>

                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">File Hash</div>
                      <div className="break-all">{hash}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Creator Wallet</div>
                      <div>{attestation.creatorAddress}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timestamp</div>
                      <div>{formatTimestamp(attestation.timestamp)}</div>
                    </div>

                    {attestation.blockNumber > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Block Number</div>
                        <div>#{attestation.blockNumber}</div>
                      </div>
                    )}

                    {attestation.txId && (
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Transaction ID</div>
                        <div className="break-all">{attestation.txId}</div>
                      </div>
                    )}
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
