"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Hash, CheckCircle2 } from "lucide-react"

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "hashing" | "signing" | "complete">("idle")
  const [txId, setTxId] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setHash("")
      setStatus("idle")
    }
  }

  const generateHash = async () => {
    if (!file) return

    setStatus("hashing")

    // Simulate hash generation
    setTimeout(() => {
      const mockHash = "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
      setHash(mockHash)
      setStatus("idle")
    }, 1500)
  }

  const createSignature = async () => {
    setStatus("signing")

    // Simulate blockchain transaction
    setTimeout(() => {
      const mockTxId = "0xABC123DEF456..."
      setTxId(mockTxId)
      setStatus("complete")
    }, 2500)
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
                      disabled={status === "signing"}
                      className="w-full mt-6 bg-accent hover:bg-accent/90 text-foreground border-2 border-background font-mono uppercase tracking-widest"
                    >
                      {status === "signing" ? "Creating Signature..." : "Create Signature"}
                    </Button>
                  )}
                </Card>
              )}

              {/* Terminal Log */}
              {(status === "hashing" || status === "signing" || status === "complete") && (
                <Card className="border-2 border-foreground p-8 bg-foreground text-background font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-accent">{">"} System log:</div>

                    {status === "hashing" && <div className="pl-4 animate-pulse">Generating SHA-256 hash...</div>}

                    {(status === "signing" || status === "complete") && (
                      <>
                        <div className="pl-4 text-green-400">✓ Hash generated successfully.</div>
                        <div className="pl-4">{hash}</div>
                      </>
                    )}

                    {status === "signing" && (
                      <>
                        <div className="pl-4 animate-pulse mt-4">Connecting to Algorand TestNet...</div>
                        <div className="pl-4 animate-pulse">Awaiting wallet approval...</div>
                      </>
                    )}

                    {status === "complete" && (
                      <>
                        <div className="pl-4 text-green-400 mt-4">✓ Transaction sent to Algorand TestNet.</div>
                        <div className="pl-4 text-green-400">✓ Signature created. Block #19392922</div>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Transaction Details */}
              {status === "complete" && (
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
                      <div>0xA12C...9F7E</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timestamp</div>
                      <div>2025-10-17 20:44:32 UTC</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Transaction ID</div>
                      <div className="break-all">{txId}</div>
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
