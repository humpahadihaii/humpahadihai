import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useVillageLinkJobs, VillageLinkJob, VillageLinkSuggestion } from "@/hooks/useVillageLinkJobs";

interface Props {
  villageId: string;
  villageName: string;
  onCommitComplete?: () => void;
}

export function VillageLinkSuggestions({ villageId, villageName, onCommitComplete }: Props) {
  const {
    jobs,
    currentJob,
    suggestions,
    isLoading,
    fetchJobs,
    startAutoLinkJob,
    fetchJobDetails,
    commitSuggestions
  } = useVillageLinkJobs(villageId);

  const [mode, setMode] = useState<'geo' | 'fuzzy' | 'ai'>('fuzzy');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Poll for job status if running
    if (currentJob?.status === 'queued' || currentJob?.status === 'running') {
      const interval = setInterval(() => {
        fetchJobDetails(currentJob.id);
      }, 2000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [currentJob?.status, currentJob?.id]);

  const handleStartJob = async () => {
    const result = await startAutoLinkJob(mode);
    if (result.success && result.jobId) {
      fetchJobDetails(result.jobId);
    }
  };

  const handleSelectJob = (jobId: string) => {
    fetchJobDetails(jobId);
    setSelectedSuggestions(new Set());
  };

  const handleToggleSuggestion = (id: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSuggestions.size === suggestions.length) {
      setSelectedSuggestions(new Set());
    } else {
      setSelectedSuggestions(new Set(suggestions.map(s => s.id)));
    }
  };

  const handleCommit = async () => {
    if (!currentJob || selectedSuggestions.size === 0) return;
    
    const result = await commitSuggestions(currentJob.id, Array.from(selectedSuggestions));
    if (result.success) {
      setSelectedSuggestions(new Set());
      onCommitComplete?.();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finished': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-500">High</Badge>;
    if (confidence >= 0.5) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Start New Job */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Auto-Link Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Automatically find and suggest marketplace items, travel packages, and products related to {villageName}.
          </p>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Matching Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuzzy">Fuzzy Name Match</SelectItem>
                  <SelectItem value="geo">Geographic (District)</SelectItem>
                  <SelectItem value="ai">AI-Powered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleStartJob} disabled={isLoading}>
              <Wand2 className="h-4 w-4 mr-2" />
              Start Auto-Link Job
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job History */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.slice(0, 5).map(job => (
                <div
                  key={job.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 ${
                    currentJob?.id === job.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelectJob(job.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium capitalize">{job.mode} Match</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{job.status}</Badge>
                    {job.suggestion_count > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.suggestion_count} suggestions
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Job Progress */}
      {currentJob && (currentJob.status === 'queued' || currentJob.status === 'running') && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">
                  {currentJob.status === 'queued' ? 'Job queued...' : 'Processing...'}
                </span>
              </div>
              <Progress value={currentJob.status === 'running' ? 50 : 10} />
              <p className="text-sm text-muted-foreground">
                Finding items related to {villageName}...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {currentJob?.status === 'finished' && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Suggestions ({suggestions.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedSuggestions.size === suggestions.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCommit}
                  disabled={selectedSuggestions.size === 0 || isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Commit ({selectedSuggestions.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {suggestions.map(sug => (
                  <div
                    key={sug.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={selectedSuggestions.has(sug.id)}
                      onCheckedChange={() => handleToggleSuggestion(sug.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{sug.item_type}</Badge>
                        <span className="font-medium">{sug.candidate_data?.name || sug.item_id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getConfidenceBadge(sug.confidence)}
                        <span className="text-sm text-muted-foreground capitalize">
                          via {sug.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* No suggestions */}
      {currentJob?.status === 'finished' && suggestions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No new suggestions found. Try a different matching mode or link items manually.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Failed */}
      {currentJob?.status === 'failed' && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Job Failed</p>
                <p className="text-sm">{currentJob.error_message || 'Unknown error'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
