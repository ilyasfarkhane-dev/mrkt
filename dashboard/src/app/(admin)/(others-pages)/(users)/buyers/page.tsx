"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import apiClient from "@/lib/apiClient"
import CustomConfirmDialog from "@/components/CustomConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Mail, UserX, Trash2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface Buyer {
  id: string
  first_name: string
  last_name: string
  email: string
  faculte?: string | null
  affiliation?: string | null
  branche?: string | null
  status: boolean
  created_at: string
  email_verified: boolean
  notif_read_status: boolean
}

interface RawBuyer {
  id: string
  first_name: string
  last_name: string
  email: string
  faculte?: string | null
  affiliation?: string | null
  branche?: string | null
  status: boolean | string
  created_at: string
  email_verified: boolean | string
  notif_read_status: boolean | string
}

interface ApiResponse {
  data?: Buyer[]
  buyers?: Buyer[]
  totalCount?: number
  total?: number
}

export default function BuyersPage() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value
    if (typeof value === "string") {
      return value.toLowerCase() === "true"
    }
    return Boolean(value)
  }

  const fetchBuyers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const { data } = await apiClient.get<ApiResponse>("/users/buyers")
        const buyersArray = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.buyers)
          ? data.buyers
          : []

       

        const normalizedData = buyersArray.map((buyer: RawBuyer) => ({
          ...buyer,
          status: convertToBoolean(buyer.status),
          email_verified: convertToBoolean(buyer.email_verified),
          notif_read_status: convertToBoolean(buyer.notif_read_status),
          faculte: buyer.faculte ?? undefined,
          affiliation: buyer.affiliation ?? undefined,
          branche: buyer.branche ?? undefined,
        }))

        setBuyers(normalizedData)
        setCurrentPage(page)
      } catch (err) {
        const error = err as Error
        console.error("Error fetching buyers:", error)
        setError(error.message)
        toast.error("Failed to load buyers")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchBuyers(currentPage)
  }, [currentPage, fetchBuyers])

  const refreshBuyers = async () => {
    await fetchBuyers(1)
    toast.success("Buyers data refreshed successfully")
  }

  const filteredBuyers = buyers.filter((buyer) => {
    const fullName = `${buyer.first_name} ${buyer.last_name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const PaginationControls = () => {
    const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage)
    const maxVisiblePages = 5

    const getPageNumbers = () => {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      const pages: number[] = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredBuyers.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium">{filteredBuyers.length}</span> buyers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  const handleDisable = async (id: string) => {
    try {
      await apiClient.put(`/users/${id}`, { status: false })
      setBuyers(buyers.map((buyer) => (buyer.id === id ? { ...buyer, status: false } : buyer)))
      toast.success("Buyer disabled successfully")
    } catch (err) {
      const error = err as Error
      console.error("Error disabling buyer:", error)
      toast.error(error.message || "Failed to disable buyer")
    }
  }

  const handleEnable = async (id: string) => {
    try {
      await apiClient.put(`/users/${id}`, { status: true })
      setBuyers(buyers.map((buyer) => (buyer.id === id ? { ...buyer, status: true } : buyer)))
      toast.success("Buyer enabled successfully")
    } catch (err) {
      const error = err as Error
      console.error("Error enabling buyer:", error)
      toast.error(error.message || "Failed to enable buyer")
    }
  }

  const handleDeleteClick = (id: string) => {
    setBuyerToDelete(id)
    setShowConfirmDialog(true)
  }

  const handleConfirmDeleteBuyer = async () => {
    if (!buyerToDelete) return
    setShowConfirmDialog(false)
    try {
      await apiClient.delete(`/users/${buyerToDelete}`)
      setBuyers(buyers.filter((buyer) => buyer.id !== buyerToDelete))
      toast.success("Buyer deleted successfully")
    } catch (err) {
      const error = err as Error
      console.error("Error deleting buyer:", error)
      toast.error("Failed to delete buyer")
    } finally {
      setBuyerToDelete(null)
    }
  }

  const handleSendNotification = async (id: string) => {
    try {
      await apiClient.put(`/users/${id}`, { notif_read_status: true })
      setBuyers(
        buyers.map((buyer) =>
          buyer.id === id ? { ...buyer, notif_read_status: true } : buyer
        )
      )
      toast.success("Notification sent successfully", {
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
          borderColor: "#a7f3d0",
          fontWeight: "bold",
        },
      })
    } catch (err) {
      const error = err as Error
      console.error("Error sending notification:", error)
      toast.error("Failed to send notification")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Buyers</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search buyers..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={refreshBuyers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Faculté</TableHead>
                <TableHead className="text-center">Branche</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Email Verification</TableHead>
                <TableHead className="text-center">Notification</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBuyers.length > 0 ? (
                paginatedBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium text-center">
                      {buyer.first_name} {buyer.last_name}
                    </TableCell>
                    <TableCell className="text-center">{buyer.affiliation || "-"}</TableCell>
                    <TableCell className="text-center">{buyer.faculte || "-"}</TableCell>
                    <TableCell className="text-center">{buyer.email}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            buyer.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-1.5 ${
                              buyer.status ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {buyer.status ? "Activé" : "Désactivé"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            buyer.email_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-1.5 ${
                              buyer.email_verified ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {buyer.email_verified ? "Vérifié" : "Non-vérifié"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            buyer.notif_read_status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-1.5 ${
                              buyer.notif_read_status ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {buyer.notif_read_status ? "Envoyé" : "Déjà lu"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSendNotification(buyer.id)}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Send Notification
                          </DropdownMenuItem>
                          {buyer.status ? (
                            <DropdownMenuItem
                              onClick={() => handleDisable(buyer.id)}
                              className="flex items-center gap-2"
                            >
                              <UserX className="h-4 w-4" />
                              Disable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleEnable(buyer.id)}
                              className="flex items-center gap-2"
                            >
                              <UserX className="h-4 w-4" />
                              Enable
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(buyer.id)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-gray-500 font-medium">No buyers found</p>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="text-primary"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls />
        </CardContent>
      </Card>
      <CustomConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmDeleteBuyer}
        onCancel={() => setShowConfirmDialog(false)}
        message="Are you sure you want to delete this buyer? This action cannot be undone."
      />
    </div>
  )
}