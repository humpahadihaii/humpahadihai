import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowDown, TrendingDown, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";

interface FunnelStep {
  name: string;
  path_pattern: string;
}

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  steps: FunnelStep[];
  is_active: boolean;
  created_at: string;
}

interface FunnelResult {
  step: string;
  count: number;
  drop_off: number;
}

export function FunnelBuilder() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [newFunnel, setNewFunnel] = useState({ name: '', description: '', steps: [{ name: '', path_pattern: '' }] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch funnels
  const { data: funnels, isLoading: funnelsLoading } = useQuery({
    queryKey: ['analytics-funnels'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('analytics_funnels' as any)
        .select('*')
        .order('created_at', { ascending: false })) as { data: Funnel[] | null; error: any };
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch funnel results
  const { data: funnelResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['analytics-funnel-results', selectedFunnel, selectedDate],
    queryFn: async () => {
      if (!selectedFunnel) return null;
      const { data, error } = await (supabase
        .from('analytics_funnel_results' as any)
        .select('*')
        .eq('funnel_id', selectedFunnel)
        .eq('result_date', selectedDate)
        .single()) as { data: any; error: any };
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!selectedFunnel,
  });

  // Create funnel mutation
  const createFunnel = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await (supabase
        .from('analytics_funnels' as any)
        .insert({
          name: newFunnel.name,
          description: newFunnel.description || null,
          steps: newFunnel.steps.filter(s => s.name && s.path_pattern),
          created_by: userData.user?.id,
        })) as { error: any };
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-funnels'] });
      setIsCreateOpen(false);
      setNewFunnel({ name: '', description: '', steps: [{ name: '', path_pattern: '' }] });
      toast.success('Funnel created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create funnel');
    },
  });

  // Delete funnel mutation
  const deleteFunnel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('analytics_funnels' as any)
        .delete()
        .eq('id', id)) as { error: any };
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-funnels'] });
      setSelectedFunnel(null);
      toast.success('Funnel deleted');
    },
  });

  // Run funnel calculation
  const runFunnel = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-worker?action=funnels&date=${selectedDate}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to run funnel calculation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-funnel-results'] });
      toast.success('Funnel calculation completed');
    },
    onError: () => {
      toast.error('Failed to run funnel calculation');
    },
  });

  const addStep = () => {
    setNewFunnel(prev => ({
      ...prev,
      steps: [...prev.steps, { name: '', path_pattern: '' }],
    }));
  };

  const removeStep = (index: number) => {
    setNewFunnel(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, field: 'name' | 'path_pattern', value: string) => {
    setNewFunnel(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? { ...step, [field]: value } : step),
    }));
  };

  const selectedFunnelData = funnels?.find(f => f.id === selectedFunnel);
  const stepResults = funnelResults?.step_results as FunnelResult[] | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Conversion Funnels</h2>
          <p className="text-sm text-muted-foreground">Track user journeys through your site</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Funnel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Funnel</DialogTitle>
              <DialogDescription>Define the steps users should take</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Funnel Name</Label>
                <Input
                  placeholder="e.g., Booking Conversion"
                  value={newFunnel.name}
                  onChange={(e) => setNewFunnel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Describe what this funnel tracks"
                  value={newFunnel.description}
                  onChange={(e) => setNewFunnel(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <Label>Funnel Steps</Label>
                {newFunnel.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Step name"
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="/path/* pattern"
                        value={step.path_pattern}
                        onChange={(e) => updateStep(index, 'path_pattern', e.target.value)}
                      />
                    </div>
                    {newFunnel.steps.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeStep(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => createFunnel.mutate()} disabled={!newFunnel.name || newFunnel.steps.filter(s => s.name && s.path_pattern).length < 2}>
                Create Funnel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Funnel List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Funnels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {funnelsLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : funnels?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No funnels created yet</p>
            ) : (
              funnels?.map(funnel => (
                <div
                  key={funnel.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFunnel === funnel.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedFunnel(funnel.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{funnel.name}</p>
                      <p className="text-xs text-muted-foreground">{funnel.steps.length} steps</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Funnel Visualization */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedFunnelData?.name || 'Select a Funnel'}
                </CardTitle>
                {selectedFunnelData?.description && (
                  <CardDescription>{selectedFunnelData.description}</CardDescription>
                )}
              </div>
              {selectedFunnel && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[150px]"
                  />
                  <Button size="sm" variant="outline" onClick={() => runFunnel.mutate()}>
                    <Play className="h-4 w-4 mr-1" />
                    Calculate
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteFunnel.mutate(selectedFunnel)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedFunnel ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a funnel to view results
              </div>
            ) : resultsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !stepResults ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No results for this date</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => runFunnel.mutate()}>
                  Run Calculation
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {stepResults.map((step, index) => {
                  const prevCount = index > 0 ? stepResults[index - 1].count : funnelResults?.total_sessions || 0;
                  const dropOffPercent = prevCount > 0 ? ((step.drop_off / prevCount) * 100).toFixed(1) : 0;
                  const conversionPercent = funnelResults?.total_sessions > 0 
                    ? ((step.count / funnelResults.total_sessions) * 100).toFixed(1) 
                    : 0;

                  return (
                    <div key={step.step}>
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{step.step}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{step.count} users</Badge>
                              <Badge variant="outline">{conversionPercent}%</Badge>
                            </div>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${conversionPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {index < stepResults.length - 1 && (
                        <div className="flex items-center justify-center py-1 text-xs text-muted-foreground">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                          {dropOffPercent}% drop-off ({step.drop_off} users)
                        </div>
                      )}
                    </div>
                  );
                })}
                {funnelResults && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Overall Conversion Rate</p>
                    <p className="text-2xl font-bold">{funnelResults.conversion_rate?.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}