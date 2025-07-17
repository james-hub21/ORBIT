import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BookingModal from "@/components/modals/BookingModal";
import { Plus, Calendar, History, Settings, Home } from "lucide-react";

export default function BookingDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedView, setSelectedView] = useState("dashboard");

  const { data: facilities } = useQuery({
    queryKey: ["/api/facilities"],
  });

  const { data: userBookings } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "new-booking", label: "New Booking", icon: Plus },
    { id: "my-bookings", label: "My Bookings", icon: History },
    { id: "available-rooms", label: "Available Rooms", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSidebarClick = (itemId: string) => {
    if (itemId === "new-booking") {
      setShowBookingModal(true);
    } else {
      setSelectedView(itemId);
    }
  };

  const getStats = () => {
    if (!userBookings) return { active: 0, approved: 0, pending: 0 };
    
    const active = userBookings.filter((booking: any) => 
      booking.status === 'approved' && new Date(booking.startTime) >= new Date()
    ).length;
    
    const approved = userBookings.filter((booking: any) => 
      booking.status === 'approved'
    ).length;
    
    const pending = userBookings.filter((booking: any) => 
      booking.status === 'pending'
    ).length;

    return { active, approved, pending };
  };

  const stats = getStats();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getFacilityName = (facilityId: number) => {
    const facility = facilities?.find((f: any) => f.id === facilityId);
    return facility?.name || `Facility ${facilityId}`;
  };

  const renderContent = () => {
    switch (selectedView) {
      case "my-bookings":
        return (
          <div className="material-card p-6">
            <h3 className="text-lg font-semibold mb-4">My Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Facility</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Purpose</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings?.map((booking: any) => (
                    <tr key={booking.id} className="border-b hover:bg-accent/50">
                      <td className="py-3 px-4">{getFacilityName(booking.facilityId)}</td>
                      <td className="py-3 px-4">
                        {formatDateTime(booking.startTime)} - {new Date(booking.endTime).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">{booking.purpose}</td>
                      <td className="py-3 px-4">
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "available-rooms":
        return (
          <div className="material-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Facilities</h2>
              <button
                onClick={() => setShowBookingModal(true)}
                className="material-button primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities?.map((facility: any) => (
                <div key={facility.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <img 
                    src={facility.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop"} 
                    alt={facility.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold mb-2">{facility.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {facility.description || `Capacity: ${facility.capacity} people`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Available</span>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="text-primary hover:underline text-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="material-card p-6">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Notifications</label>
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="ml-2 text-sm">Receive booking confirmations</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Booking Duration</label>
                <select className="material-input max-w-xs">
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="material-card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active Bookings</div>
              </div>
              <div className="material-card p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved This Month</div>
              </div>
              <div className="material-card p-6 text-center">
                <div className="text-3xl font-bold text-warning mb-2">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
            </div>

            {/* Available Facilities */}
            <div className="material-card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Available Facilities</h2>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="material-button primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities?.slice(0, 3).map((facility: any) => (
                  <div key={facility.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <img 
                      src={facility.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop"} 
                      alt={facility.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold mb-2">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {facility.description || `Capacity: ${facility.capacity} people`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Available</span>
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="text-primary hover:underline text-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="material-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Facility</th>
                      <th className="text-left py-3 px-4">Date & Time</th>
                      <th className="text-left py-3 px-4">Purpose</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookings?.slice(0, 5).map((booking: any) => (
                      <tr key={booking.id} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4">{getFacilityName(booking.facilityId)}</td>
                        <td className="py-3 px-4">
                          {formatDateTime(booking.startTime)} - {new Date(booking.endTime).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">{booking.purpose}</td>
                        <td className="py-3 px-4">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Sidebar
              items={sidebarItems}
              activeItem={selectedView}
              onItemClick={handleSidebarClick}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        facilities={facilities || []}
      />
    </div>
  );
}
