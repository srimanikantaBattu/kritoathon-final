import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Phone, MessageSquare, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { Toaster } from '@/components/ui/sonner'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'

interface Request {
  _id: string
  productName: string
  category: string
  quantity: number
  budget: string
  requesterPhone?: string
  status: 'pending' | 'accepted' | 'completed'
  createdAt: string
}

export default function AgentAcceptedRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      if (!userId) return
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/user-api/agent/accepted-requests/${userId}`
        )
        setRequests(response.data.acceptedRequests)
        setLoading(false)
        console.log(response.data.acceptedRequests)
      } catch (error) {
        toast.error('Failed to fetch accepted requests')
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }
    console.log(userId)
    fetchAcceptedRequests()
  }, [userId])

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`)
  }

  const handleChat = (request:any) => {
    console.log("hereeeeee")
    console.log(request)
    toast.success(`Chat initiated for request ${request.email}`, {
      action: {
        label: "Open Chat",
        onClick: () => navigate(`/agent-chat/${request.buyerId}`),
      },
    })
  }

  const handleViewDetails = (requestId: string) => {
    toast.info(`Showing details for request ${requestId}`, {
      description: 'Request details will appear here',
    })
  }

  const exportToExcel = () => {
    // Prepare the data for export
    const dataForExport = requests.map((request) => ({
      'Product Name': request.productName,
      'Category': request.category,
      'Quantity': request.quantity,
      'Budget': request.budget,
      'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
      'Date': request.createdAt
        ? format(new Date(request.createdAt), 'MMM dd, yyyy')
        : '-',
      'Phone': request.requesterPhone || 'N/A'
    }))

    // Create a new workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataForExport)
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Accepted Requests')
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, `agent_accepted_requests_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Card>
        <CardHeader>
          <CardTitle>Accepted Requests</CardTitle>
          <CardDescription>
            Manage your accepted product requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {userId ? 'No accepted requests found' : 'User not authenticated'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.category}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.createdAt
                        ? format(new Date(request.createdAt), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleChat(request)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </DropdownMenuItem>
                          {/* {request.requesterPhone && (
                            <DropdownMenuItem
                              onClick={() => handleCall(request.requesterPhone)}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>
                          )} */}
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(request._id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{requests.length}</strong> accepted requests
          </div>
          <Button
            variant="outline"
            disabled={requests.length === 0}
            onClick={() => {
              toast.promise(
                new Promise((resolve) => {
                  exportToExcel()
                  setTimeout(resolve, 1000)
                }),
                {
                  loading: 'Preparing export...',
                  success: 'Excel file downloaded successfully!',
                  error: 'Export failed',
                }
              )
            }}
          >
            Export to Excel
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}