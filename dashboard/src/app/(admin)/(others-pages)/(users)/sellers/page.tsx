// app/(admin)/sellers/page.tsx
"use client"

import { useState, useEffect,useCallback } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import apiClient from "@/lib/apiClient";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Mail, UserX, Trash2, RefreshCw  } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Seller {
  id: string
  first_name: string
  last_name: string
  email: string
  faculte?: string
  affiliation?:string
  branche?: string
  status: boolean  
  created_at: string
  email_verified:boolean
  notif_read_status:boolean
}


interface RawSeller {
  id: string
  first_name: string
  last_name: string
  email: string
  faculte?: string
  affiliation?: string
  branche?: string
  status: boolean | string
  created_at: string
  email_verified: boolean | string
  notif_read_status: boolean | string
}

export default function SellersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sellers, setSellers] = useState<Seller[]>([])
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page



 

  // Fetch sellers from backend
  const fetchSellers = useCallback(async (page = 1, limit = itemsPerPage) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/users/sellers?page=${page}&limit=${limit}`)
  
      // Improved response handling
      const sellersArray = Array.isArray(response.data) ? response.data : 
                         response.data?.sellers || response.data?.data || []
    
  
      // More reliable boolean conversion
      const normalizedData = sellersArray.map((seller: RawSeller) => {
        // Debug log to check raw values
        console.log('Raw notif_read_status:', seller.notif_read_status, typeof seller.notif_read_status)
        
        return {
          ...seller,
          status: convertToBoolean(seller.status),
          notif_read_status: convertToBoolean(seller.notif_read_status),
          email_verified: convertToBoolean(seller.email_verified),
        }
      })
  
      // Debug log to check normalized values
      console.log('Normalized data:', normalizedData)
  
      setSellers(normalizedData)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching sellers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sellers')
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage]);

  function convertToBoolean(value: boolean | string | number | null | undefined): boolean {

    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true
      if (value.toLowerCase() === 'false') return false
    }
    return Boolean(value)
  }


  useEffect(() => {
    fetchSellers(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, fetchSellers])
  
  
  

  const refreshSellers = async () => {
    await fetchSellers(currentPage, itemsPerPage)
    toast.success('Sellers data refreshed successfully')
  }
  const filteredSellers = sellers.filter(seller => {
    const fullName = `${seller.first_name} ${seller.last_name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  

  const PaginationControls = () => {
    const totalPages = Math.ceil(filteredSellers.length / itemsPerPage)
    const maxVisiblePages = 5

    const getPageNumbers = () => {
      const pages = []
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const  endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredSellers.length)}
            </span>{' '}
            of <span className="font-medium">{filteredSellers.length}</span> sellers
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
              setCurrentPage(1) // Reset to first page when changing items per page
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
      setSellers(sellers.map(seller =>
        seller.id === id ? { ...seller, status: false } : seller
      ))
      toast.success('Seller disabled successfully')
    } catch (error) {
      console.error('Error disabling seller:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to disable seller')
    }
  }
  
  const handleEnable = async (id: string) => {
    try {
       await apiClient.put(`/users/${id}`, { status: true })
      setSellers(sellers.map(seller =>
        seller.id === id ? { ...seller, status: true } : seller
      ))
      toast.success('Seller enabled successfully')
    } catch (error) {
      console.error('Error enabling seller:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to enable seller')
    }
  }

  const handleDeleteClick = (id: string) => {
    setSellerToDelete(id);
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDeleteSeller = async () => {
    if (!sellerToDelete) return;
  
    setShowConfirmDialog(false);
    try {
      await apiClient.delete(`/users/${sellerToDelete}`);
      setSellers(sellers.filter(seller => seller.id !== sellerToDelete));
      toast.success('Seller deleted successfully');
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error('Failed to delete seller');
    } finally {
      setSellerToDelete(null);
    }
  };

  const handleSendNotification = async (id: string) => {
    try {
     await apiClient.put(`/users/${id}`, { notif_read_status: true })
      setSellers(sellers.map(seller =>
        seller.id === id ? { ...seller, notif_read_status: true } : seller
      ))
      toast.success('Notification sent successfully', {
        style: {
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderColor: '#a7f3d0',
          fontWeight: 'bold'
        }
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
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
            <CardTitle>Sellers</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search sellers..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refreshSellers}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Name</TableHead>
                <TableHead className='text-center'>Faculté</TableHead>
                <TableHead className='text-center'>Branche</TableHead>
                <TableHead className='text-center'>Email</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-center'>Email verification</TableHead>
                <TableHead className='text-center'>Notification</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            


            <TableBody>
            {paginatedSellers.length > 0 ? (
                paginatedSellers.map((seller) => (
      <TableRow key={seller.id}>
                  <TableCell className="font-medium text-center">
                    {seller.first_name} {seller.last_name}
                  </TableCell>
                  <TableCell className='text-center'>{seller.affiliation || '-'}</TableCell>
                  <TableCell className='text-center'>{seller.faculte || '-'}</TableCell>
                  <TableCell className='text-center'>{seller.email}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center'>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        Boolean(seller.status) // Force boolean conversion
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${
                          Boolean(seller.status) ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {Boolean(seller.status) ? 'Activé' : 'Désactivé'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
  <div className='flex items-center justify-center'>
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      seller.email_verified  // Remove Boolean() since we already normalized
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}>
      <span className={`h-2 w-2 rounded-full mr-1.5 ${
        seller.email_verified ? 'bg-green-500' : 'bg-red-500'
      }`}></span>
      {seller.email_verified ? 'Vérifié' : 'Non-vérifié'} 
    </span>
  </div>
</TableCell>
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center'>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          Boolean(seller.notif_read_status) // Force boolean conversion
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`h-2 w-2 rounded-full mr-1.5 ${
                            Boolean(seller.notif_read_status) ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {Boolean(seller.notif_read_status) ? 'Envoyé' : 'Déja lu'}
                        </span>
                      </div>
                    </TableCell>
                  <TableCell className='text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSendNotification(seller.id)}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Send Notification
                        </DropdownMenuItem>
                        {seller.status === true ? (
                          <DropdownMenuItem
                            onClick={() => handleDisable(seller.id)}
                            className="flex items-center gap-2"
                          >
                            <UserX className="h-4 w-4" />
                            Disable
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleEnable(seller.id)}
                            className="flex items-center gap-2"
                          >
                            <UserX className="h-4 w-4" />
                            Enable
                          </DropdownMenuItem>
                        )}
                       <DropdownMenuItem
                        onClick={() => handleDeleteClick(seller.id)}
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
      <TableCell colSpan={6} className="text-center py-8">
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
          <p className="text-gray-500 font-medium">No Sellers found</p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchTerm('')}
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
  onConfirm={handleConfirmDeleteSeller}
  onCancel={() => setShowConfirmDialog(false)}
  message="Are you sure you want to delete this seller? This action cannot be undone."
/>
    </div>
  )
}