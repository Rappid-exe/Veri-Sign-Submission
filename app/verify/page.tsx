"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, CheckCircle2, XCircle } from "lucide-react"

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "not-verified">("idle")
  const [verificationData, setVerificationData] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus("idle")
      setVerificationData(null)
    }
  }

  const verifyFile = async () => {
    if (!file) return

    setStatus("verifying")

    // Simulate verification
    setTimeout(() => {
      const isVerified = Math.random() > 0.3 // 70% chance of verified

      if (isVerified) {
        setVerificationData({
          hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
          creator: "0xA12C...9F7E",
          timestamp: "2025-10-17 20:44:32 UTC",
          block: "#19392922",
        })
        setStatus("verified")
      } else {
        setStatus("not-verified")
      }
    }, 2500)
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
              </Card>

              {/* Terminal Output */}
              {(status === "verifying" || status === "verified" || status === "not-verified") && (
                <Card className="border-2 border-foreground p-8 bg-foreground text-background font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-accent">{">"} Verification log:</div>

                    {status === "verifying" && (
                      <>
                        <div className="pl-4 animate-pulse">Generating file hash...</div>
                        <div className="pl-4 animate-pulse">Querying Algorand blockchain...</div>
                        <div className="pl-4 animate-pulse">Checking signature database...</div>
                      </>
                    )}

                    {status === "verified" && verificationData && (
                      <>
                        <div className="pl-4 text-green-400">✓ Hash generated successfully.</div>
                        <div className="pl-4">{verificationData.hash}</div>
                        <div className="pl-4 text-green-400 mt-4">✓ Signature found on blockchain.</div>
                        <div className="pl-4">CREATOR: {verificationData.creator}</div>
                        <div className="pl-4">TIMESTAMP: {verificationData.timestamp}</div>
                        <div className="pl-4">BLOCK: {verificationData.block}</div>
                        <div className="pl-4 text-green-400 mt-4 font-bold">✓ VERIFICATION STATUS: TRUE</div>
                      </>
                    )}

                    {status === "not-verified" && (
                      <>
                        <div className="pl-4 text-green-400">✓ Hash generated successfully.</div>
                        <div className="pl-4 text-red-400 mt-4">✗ No signature found.</div>
                        <div className="pl-4 text-red-400">✗ File not registered on blockchain.</div>
                        <div className="pl-4 text-red-400 mt-4 font-bold">✗ VERIFICATION STATUS: FALSE</div>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Verification Details */}
              {status === "verified" && verificationData && (
                <Card className="border-2 border-foreground p-8 bg-muted">
                  <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Signature Details</h2>

                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">File Hash</div>
                      <div className="break-all">{verificationData.hash}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Creator Wallet</div>
                      <div>{verificationData.creator}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timestamp</div>
                      <div>{verificationData.timestamp}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Block Number</div>
                      <div>{verificationData.block}</div>
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
