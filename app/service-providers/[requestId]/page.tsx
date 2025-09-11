"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { User } from "@/types/service"
import { ServiceRequest } from "@/types/service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/services/api"

export default function NearbyProvidersPage() {
    const [providers, setProviders] = useState<User[]>([])
    const [request, setRequest] = useState<ServiceRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const { requestId } = useParams()
    const { toast } = useToast()

    useEffect(() => {
        const fetchRequestAndProviders = async () => {
            try {
                // Fetch service request details
                const requestResponse = await fetch(
                    `${API_URL}/services/request/${requestId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                if (!requestResponse.ok) {
                    throw new Error('Failed to fetch service request');
                }

                const requestData = await requestResponse.json();
                console.log('Service request data:', requestData);
                setRequest(requestData);

                if (!requestData.coordinates) {
                    console.error('No coordinates in request data');
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Location data is missing from the request.",
                    });
                    return;
                }

                // Fetch nearby providers
                const providersUrl = `${API_URL}/services/nearby-providers?latitude=${requestData.coordinates.lat}&longitude=${requestData.coordinates.lng}&serviceType=${requestData.serviceType}`;
                console.log('Fetching providers with URL:', providersUrl);
                
                const providersResponse = await fetch(providersUrl, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!providersResponse.ok) {
                    throw new Error('Failed to fetch providers');
                }

                const providersData = await providersResponse.json();
                console.log('Providers response:', providersData);
                setProviders(providersData);
            } catch (err) {
                console.error('Error:', err)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch providers"
                })
            } finally {
                setLoading(false);
            }
        };

        fetchRequestAndProviders();
    }, [requestId, toast]);

    const markAsComplete = async () => {
        try {
            const response = await fetch(`${API_URL}/services/request/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'completed'
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Service request marked as complete",
                })
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1500)
            } else {
                throw new Error('Failed to update status')
            }
        } catch (error) {
            console.error('Error marking service as complete:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark service as complete",
            })
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-20">
                <div className="flex justify-center items-center min-h-[400px]">
                    <p>Loading providers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-20">
            <h1 className="text-3xl font-bold mb-6">Nearby Service Providers</h1>
            
            {request && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold mb-2">Your Request Details:</h2>
                    <p>Service: {request.serviceType}</p>
                    <p>Location: {request.location}</p>
                    <p>Vehicle: {request.vehicleType}</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <div key={provider.id} className="border rounded-lg p-4 shadow-sm">
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg">{provider.name}</h3>
                                <p className="text-sm text-gray-600 font-medium">{provider.businessName}</p>
                                <p className="text-sm text-gray-500 mt-1">Distance: {provider.distance?.toFixed(1)} km</p>
                                <p className="text-sm text-gray-500">Services: {provider.services?.join(', ')}</p>
                                
                                {/* Contact Information */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Information:</h4>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span> {provider.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Email:</span> {provider.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center py-10">
                        No service providers found in your area.
                        <br />
                        <span className="text-sm mt-2 block">
                            Try expanding your search area or checking back later.
                        </span>
                    </p>
                )}
            </div>

            {/* Mark as Complete Button */}
            {request && request.status !== 'completed' && (
                <div className="mt-8 text-center">
                    <Button 
                        onClick={markAsComplete}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                        Mark as Complete
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                        Mark this service request as complete when you&apos;re done
                    </p>
                </div>
            )}
        </div>
    )
} 