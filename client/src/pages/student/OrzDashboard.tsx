import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import TimeExtensionModal from "@/components/modals/TimeExtensionModal";
import { Dock, Clock, History, Settings, HelpCircle, Circle } from "lucide-react";

export default function OrzDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  const { data: activeSession, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/orz/sessions/active"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: sessionHistory } = useQuery({
    queryKey: ["/api/orz/sessions/history"],
  });

  const { data: stations } = useQuery({
    queryKey: ["/api/orz/stations"],
  });

  const startSessionMutation = useMutation({
    mutationFn: async (stationId: number) => {
      const response = await apiRequest("POST", "/api/orz/sessions", { stationId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orz/sessions/active"] });
      toast({
        title: "Session Started",
        description: "Your computer session has been started successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/orz/sessions/${sessionId}/end`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orz/sessions/active"] });
      toast({
        title: "Session Ended",
        description: "Your computer session has been ended.",
        variant: "default",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/orz/sessions/${sessionId}/activity`);
      return response.json();
    },
  });

  // Calculate time remaining
  useEffect(() => {
    if (activeSession) {
      const updateTimer = () => {
        const now = new Date();
        const endTime = new Date(activeSession.plannedEndTime);
        const diff = endTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining("00:00:00");
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  // Update activity every 2 minutes
  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        updateActivityMutation.mutate(activeSession.id);
      }, 120000); // 2 minutes

      return () => clearInterval(interval);
    }
  }, [activeSession, updateActivityMutation]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStationName = (stationId: number) => {
    const station = stations?.find((s: any) => s.id === stationId);
    return station?.name || `Station ${stationId}`;
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Session Card */}
          <div className="lg:col-span-2">
            <div className="material-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Computer Session Status</h2>
                {activeSession ? (
                  <span className="status-badge active">
                    <Circle className="h-3 w-3 mr-2 fill-current" />
                    Active
                  </span>
                ) : (
                  <span className="status-badge">
                    <Circle className="h-3 w-3 mr-2" />
                    Not Active
                  </span>
                )}
              </div>
              
              {activeSession ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Computer Station</div>
                    <div className="text-lg font-semibold">{getStationName(activeSession.stationId)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Session Started</div>
                    <div className="text-lg font-semibold">{formatTime(activeSession.startTime)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                    <div className="text-2xl font-bold text-primary">{timeRemaining}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Auto-logout Warning</div>
                    <div className="text-sm text-warning">10 minutes of inactivity</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No active session</p>
                  <div className="space-y-2">
                    {stations?.map((station: any) => (
                      <button
                        key={station.id}
                        onClick={() => startSessionMutation.mutate(station.id)}
                        disabled={startSessionMutation.isPending}
                        className="material-button primary mr-2 mb-2"
                      >
                        Start Session on {station.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSession && (
                <div className="mt-6 pt-4 border-t flex space-x-4">
                  <button
                    onClick={() => setShowExtensionModal(true)}
                    className="material-button primary"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Request Time Extension
                  </button>
                  <button
                    onClick={() => endSessionMutation.mutate(activeSession.id)}
                    disabled={endSessionMutation.isPending}
                    className="material-button destructive"
                  >
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <div className="material-card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
                  <History className="h-5 w-5 mr-3 inline text-muted-foreground" />
                  View Usage History
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
                  <Settings className="h-5 w-5 mr-3 inline text-muted-foreground" />
                  Account Settings
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
                  <HelpCircle className="h-5 w-5 mr-3 inline text-muted-foreground" />
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Sessions */}
        <div className="material-card p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Station</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionHistory?.map((session: any) => (
                  <tr key={session.id} className="border-b hover:bg-accent/50">
                    <td className="py-3 px-4">{formatDate(session.startTime)}</td>
                    <td className="py-3 px-4">{getStationName(session.stationId)}</td>
                    <td className="py-3 px-4">{formatDuration(session.startTime, session.endTime)}</td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${session.isActive ? 'active' : 'approved'}`}>
                        {session.isActive ? 'Active' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimeExtensionModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        sessionId={activeSession?.id}
      />
    </div>
  );
}
