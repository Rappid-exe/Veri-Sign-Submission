"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Send, Plus, AlertCircle } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { createCredentialASA, distributeCredential, registerCredential, getAllCredentials, optInToCredential, clearAllCredentials, removeCredential } from "@/lib/credentials"

export default function AdminPage() {
  const { address, isConnected, connect } = useWallet()
  
  // Create credential state
  const [orgName, setOrgName] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [createStatus, setCreateStatus] = useState<"idle" | "creating" | "complete" | "error">("idle")
  const [createdAssetId, setCreatedAssetId] = useState<number | null>(null)
  const [createError, setCreateError] = useState("")

  // Distribute credential state
  const [recipientAddress, setRecipientAddress] = useState("")
  const [assetIdToDistribute, setAssetIdToDistribute] = useState("")
  const [distributeStatus, setDistributeStatus] = useState<"idle" | "distributing" | "complete" | "error">("idle")
  const [distributeTxId, setDistributeTxId] = useState("")
  const [distributeError, setDistributeError] = useState("")

  // Opt-in state
  const [assetIdToOptIn, setAssetIdToOptIn] = useState("")
  const [optInStatus, setOptInStatus] = useState<"idle" | "opting" | "complete" | "error">("idle")

  const [credentials, setCredentials] = useState(getAllCredentials())

  // Refresh credentials list
  const refreshCredentials = () => {
    setCredentials(getAllCredentials())
  }

  const handleCreateCredential = async () => {
    if (!address || !orgName || !orgDescription) return

    setCreateStatus("creating")
    setCreateError("")

    try {
      const assetId = await createCredentialASA(address, orgName, orgDescription)
      
      // Register in local registry
      registerCredential({
        name: orgName,
        assetId,
        description: orgDescription,
      })

      setCreatedAssetId(assetId)
      setCreateStatus("complete")
      setOrgName("")
      setOrgDescription("")
      refreshCredentials() // Update the list
    } catch (err: any) {
      setCreateError(err.message || "Failed to create credential")
      setCreateStatus("error")
    }
  }

  const handleDistribute = async () => {
    if (!address || !recipientAddress || !assetIdToDistribute) return

    setDistributeStatus("distributing")
    setDistributeError("")

    try {
      const txId = await distributeCredential(
        address,
        recipientAddress,
        parseInt(assetIdToDistribute)
      )

      setDistributeTxId(txId)
      setDistributeStatus("complete")
      setRecipientAddress("")
    } catch (err: any) {
      setDistributeError(err.message || "Failed to distribute credential")
      setDistributeStatus("error")
    }
  }

  const handleOptIn = async () => {
    if (!address || !assetIdToOptIn) return

    setOptInStatus("opting")

    try {
      await optInToCredential(address, parseInt(assetIdToOptIn))
      setOptInStatus("complete")
      setAssetIdToOptIn("")
    } catch (err: any) {
      setOptInStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Panel</h1>
              <p className="text-lg font-mono text-muted-foreground">
                Manage credential ASAs for the reputation system.
              </p>
            </div>

            {/* Wallet Connection Warning */}
            {!isConnected && (
              <Card className="border-2 border-accent bg-accent/10 p-6 mb-6 flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-xl uppercase tracking-tight">Wallet Required</div>
                  <div className="font-mono text-sm">
                    Connect your wallet to manage credentials.
                  </div>
                </div>
                <Button
                  onClick={connect}
                  className="bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                >
                  Connect Wallet
                </Button>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Create Credential */}
              <Card className="border-2 border-foreground p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Create Credential</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Reuters"
                      className="w-full p-3 border-2 border-foreground font-mono text-sm bg-background"
                      disabled={!isConnected}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      placeholder="Reuters Press Pass"
                      className="w-full p-3 border-2 border-foreground font-mono text-sm bg-background"
                      disabled={!isConnected}
                    />
                  </div>

                  <Button
                    onClick={handleCreateCredential}
                    disabled={createStatus === "creating" || !isConnected || !orgName || !orgDescription}
                    className="w-full bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    {createStatus === "creating" ? "Creating..." : "Create Credential ASA"}
                  </Button>

                  {createStatus === "complete" && createdAssetId && (
                    <div className="p-4 bg-green-50 border-2 border-green-600 font-mono text-sm">
                      <div className="font-bold text-green-900">✓ Credential Created!</div>
                      <div className="text-green-800 mt-2">Asset ID: {createdAssetId}</div>
                    </div>
                  )}

                  {createStatus === "error" && createError && (
                    <div className="p-4 bg-red-50 border-2 border-destructive font-mono text-sm text-red-800">
                      ✗ {createError}
                    </div>
                  )}
                </div>
              </Card>

              {/* Distribute Credential */}
              <Card className="border-2 border-foreground p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Send className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Distribute Credential</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Asset ID
                    </label>
                    <input
                      type="number"
                      value={assetIdToDistribute}
                      onChange={(e) => setAssetIdToDistribute(e.target.value)}
                      placeholder="123456"
                      className="w-full p-3 border-2 border-foreground font-mono text-sm bg-background"
                      disabled={!isConnected}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="VHFHRB..."
                      className="w-full p-3 border-2 border-foreground font-mono text-sm bg-background"
                      disabled={!isConnected}
                    />
                  </div>

                  <Button
                    onClick={handleDistribute}
                    disabled={distributeStatus === "distributing" || !isConnected || !recipientAddress || !assetIdToDistribute}
                    className="w-full bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    {distributeStatus === "distributing" ? "Distributing..." : "Distribute Credential"}
                  </Button>

                  {distributeStatus === "complete" && distributeTxId && (
                    <div className="p-4 bg-green-50 border-2 border-green-600 font-mono text-sm">
                      <div className="font-bold text-green-900">✓ Credential Distributed!</div>
                      <div className="text-green-800 mt-2 break-all">TX: {distributeTxId}</div>
                    </div>
                  )}

                  {distributeStatus === "error" && distributeError && (
                    <div className="p-4 bg-red-50 border-2 border-destructive font-mono text-sm text-red-800">
                      ✗ {distributeError}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Opt-In Section */}
            <Card className="border-2 border-foreground p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Opt-In to Credential</h2>
              </div>

              <p className="font-mono text-sm text-muted-foreground mb-4">
                Recipients must opt-in before receiving a credential ASA.
              </p>

              <div className="flex gap-4">
                <input
                  type="number"
                  value={assetIdToOptIn}
                  onChange={(e) => setAssetIdToOptIn(e.target.value)}
                  placeholder="Asset ID"
                  className="flex-1 p-3 border-2 border-foreground font-mono text-sm bg-background"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleOptIn}
                  disabled={optInStatus === "opting" || !isConnected || !assetIdToOptIn}
                  className="bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                >
                  {optInStatus === "opting" ? "Opting In..." : "Opt-In"}
                </Button>
              </div>

              {optInStatus === "complete" && (
                <div className="p-4 bg-green-50 border-2 border-green-600 font-mono text-sm mt-4">
                  ✓ Successfully opted in!
                </div>
              )}
            </Card>

            {/* Registered Credentials */}
            <Card className="border-2 border-foreground p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tight">Registered Credentials</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={refreshCredentials}
                    variant="outline"
                    size="sm"
                    className="border-2 border-foreground font-mono uppercase tracking-widest bg-transparent"
                  >
                    Refresh
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Clear all registered credentials?')) {
                        clearAllCredentials()
                        refreshCredentials()
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-mono uppercase tracking-widest bg-transparent"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {credentials.length === 0 ? (
                <div className="text-center py-8 font-mono text-sm text-muted-foreground">
                  No credentials registered yet.
                  <div className="mt-2 text-xs">
                    Create a credential above to get started.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred) => (
                    <div key={cred.assetId} className="p-4 border-2 border-foreground bg-muted">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-lg">{cred.name}</div>
                          <div className="font-mono text-sm text-muted-foreground">{cred.description}</div>
                          <div className="font-mono text-xs text-muted-foreground mt-1">
                            Asset ID: {cred.assetId}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setAssetIdToDistribute(cred.assetId.toString())}
                            variant="outline"
                            size="sm"
                            className="border-2 border-foreground font-mono uppercase tracking-widest bg-transparent text-xs"
                          >
                            Use for Distribution
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`Remove ${cred.name} from registry?`)) {
                                removeCredential(cred.assetId)
                                refreshCredentials()
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-mono uppercase tracking-widest bg-transparent text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
