import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Package, 
  FileText, 
  Clock, 
  MapPin, 
  Download, 
  Plus, 
  Trash2, 
  Save,
  Lock,
  AlertTriangle
} from 'lucide-react';
import JSZip from 'jszip';
import { format } from 'date-fns';

interface Finding {
  id: string;
  scan_id: string;
  kind: string;
  severity: string;
  confidence: number;
  provider: string;
  observed_at: string;
  evidence: any[];
}

interface EvidencePack {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface PackItem {
  id: string;
  finding_id: string;
  notes: string;
  tags: string[];
  finding: Finding;
}

interface PackNote {
  id: string;
  content: string;
  note_type: string;
  created_at: string;
}

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string;
  source: string;
}

export default function EvidencePack() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('id');
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { subscriptionTier, isLoading: subscriptionLoading } = useSubscription();
  
  const [pack, setPack] = useState<EvidencePack | null>(null);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [items, setItems] = useState<PackItem[]>([]);
  const [notes, setNotes] = useState<PackNote[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [availableFindings, setAvailableFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Premium gate
  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';

  useEffect(() => {
    if (workspaceLoading || subscriptionLoading) return;
    
    if (!isPremium) {
      toast.error('Evidence Pack is a Premium feature');
      navigate('/settings/billing');
      return;
    }

    if (packId) {
      loadPack(packId);
    } else {
      setLoading(false);
    }
    
    loadAvailableFindings();
  }, [packId, workspace, isPremium, workspaceLoading, subscriptionLoading]);

  const loadPack = async (id: string) => {
    try {
      const { data: packData, error: packError } = await supabase
        .from('evidence_packs')
        .select('*')
        .eq('id', id)
        .single();

      if (packError) throw packError;

      setPack(packData);
      setPackName(packData.name);
      setPackDescription(packData.description || '');

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('evidence_pack_items')
        .select(`
          *,
          finding:findings(*)
        `)
        .eq('pack_id', id)
        .order('order_index');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Load notes
      const { data: notesData, error: notesError } = await supabase
        .from('evidence_pack_notes')
        .select('*')
        .eq('pack_id', id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Load timeline
      const { data: timelineData, error: timelineError } = await supabase
        .from('evidence_pack_timeline')
        .select('*')
        .eq('pack_id', id)
        .order('event_date', { ascending: false });

      if (timelineError) throw timelineError;
      setTimeline(timelineData || []);

    } catch (error: any) {
      toast.error('Failed to load evidence pack');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableFindings = async () => {
    if (!workspace?.id) return;

    try {
      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('observed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAvailableFindings(data || []);
    } catch (error: any) {
      console.error('Failed to load findings:', error);
    }
  };

  const createPack = async () => {
    if (!workspace?.id || !packName.trim()) {
      toast.error('Pack name is required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('evidence_packs')
        .insert({
          workspace_id: workspace.id,
          created_by: user.id,
          name: packName,
          description: packDescription
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Evidence pack created');
      navigate(`/evidence-pack?id=${data.id}`);
    } catch (error: any) {
      toast.error('Failed to create pack');
      console.error(error);
    }
  };

  const updatePack = async () => {
    if (!packId) return;

    try {
      const { error } = await supabase
        .from('evidence_packs')
        .update({
          name: packName,
          description: packDescription
        })
        .eq('id', packId);

      if (error) throw error;
      toast.success('Pack updated');
    } catch (error: any) {
      toast.error('Failed to update pack');
      console.error(error);
    }
  };

  const addFinding = async (findingId: string) => {
    if (!packId) return;

    try {
      const { error } = await supabase
        .from('evidence_pack_items')
        .insert({
          pack_id: packId,
          finding_id: findingId,
          order_index: items.length
        });

      if (error) throw error;
      toast.success('Finding added to pack');
      loadPack(packId);
    } catch (error: any) {
      toast.error('Failed to add finding');
      console.error(error);
    }
  };

  const removeFinding = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('evidence_pack_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Finding removed');
      setItems(items.filter(i => i.id !== itemId));
    } catch (error: any) {
      toast.error('Failed to remove finding');
      console.error(error);
    }
  };

  const addNote = async (content: string, noteType: string) => {
    if (!packId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('evidence_pack_notes')
        .insert({
          pack_id: packId,
          author_id: user.id,
          content,
          note_type: noteType
        });

      if (error) throw error;
      toast.success('Note added');
      if (packId) loadPack(packId);
    } catch (error: any) {
      toast.error('Failed to add note');
      console.error(error);
    }
  };

  const geocodeIP = async (ipAddress: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ip-geocode', {
        body: { ip_address: ipAddress }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Geocode failed:', error);
      return null;
    }
  };

  const exportPack = async () => {
    if (!pack || !packId) return;

    setExporting(true);
    try {
      const zip = new JSZip();

      // Add pack metadata
      zip.file('README.txt', `Evidence Pack: ${pack.name}\n\nDescription: ${pack.description || 'N/A'}\nCreated: ${format(new Date(pack.created_at), 'PPpp')}\nStatus: ${pack.status}\n\nThis evidence pack contains ${items.length} findings, ${notes.length} notes, and ${timeline.length} timeline events.`);

      // Add findings
      const findingsFolder = zip.folder('findings');
      for (const item of items) {
        const findingContent = JSON.stringify(item.finding, null, 2);
        findingsFolder?.file(`finding_${item.finding.id}.json`, findingContent);
        
        if (item.notes) {
          findingsFolder?.file(`finding_${item.finding.id}_notes.txt`, item.notes);
        }

        // Geocode IPs in evidence
        for (const evidence of item.finding.evidence || []) {
          if (evidence.key === 'ip_address' || evidence.key === 'ip') {
            const geoData = await geocodeIP(evidence.value);
            if (geoData) {
              findingsFolder?.file(`finding_${item.finding.id}_geo_${evidence.value}.json`, JSON.stringify(geoData, null, 2));
            }
          }
        }
      }

      // Add notes
      const notesFolder = zip.folder('notes');
      notes.forEach((note, index) => {
        notesFolder?.file(`note_${index + 1}_${note.note_type}.txt`, `${note.content}\n\nCreated: ${format(new Date(note.created_at), 'PPpp')}`);
      });

      // Add timeline
      const timelineContent = timeline.map(event => 
        `${format(new Date(event.event_date), 'PPpp')} - ${event.title}\n${event.description || ''}\nSource: ${event.source || 'N/A'}\n\n`
      ).join('---\n\n');
      
      zip.file('timeline.txt', timelineContent);

      // Generate ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence_pack_${pack.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      // Update pack status
      await supabase
        .from('evidence_packs')
        .update({ status: 'exported' })
        .eq('id', packId);

      toast.success('Evidence pack exported');
    } catch (error: any) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  if (!isPremium && !subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Premium Feature</CardTitle>
            </div>
            <CardDescription>
              Evidence Pack is available on Premium and Enterprise plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/settings/billing')} className="w-full">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || workspaceLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Evidence Pack</h1>
              <p className="text-muted-foreground">Organize findings into exportable evidence</p>
            </div>
          </div>
          {pack && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={updatePack}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={exportPack} disabled={exporting || items.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export ZIP'}
              </Button>
            </div>
          )}
        </div>

        {!packId ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Evidence Pack</CardTitle>
              <CardDescription>Group findings and add notes for investigation or reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pack Name</Label>
                <Input
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="e.g., Case Investigation #2024-001"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={packDescription}
                  onChange={(e) => setPackDescription(e.target.value)}
                  placeholder="Describe the purpose of this evidence pack..."
                  rows={4}
                />
              </div>
              <Button onClick={createPack}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pack
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="findings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="findings">
                <FileText className="w-4 h-4 mr-2" />
                Findings ({items.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                <FileText className="w-4 h-4 mr-2" />
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="w-4 h-4 mr-2" />
                Timeline ({timeline.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="findings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Findings</CardTitle>
                  <CardDescription>Select findings from your workspace to include</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={addFinding}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a finding to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFindings.filter(f => !items.find(i => i.finding_id === f.id)).map(finding => (
                        <SelectItem key={finding.id} value={finding.id}>
                          {finding.kind} - {finding.provider} ({format(new Date(finding.observed_at), 'PP')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.finding.kind}</CardTitle>
                          <CardDescription>
                            Provider: {item.finding.provider} • {format(new Date(item.finding.observed_at), 'PPpp')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.finding.severity === 'critical' ? 'destructive' : 'default'}>
                            {item.finding.severity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFinding(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {item.finding.evidence?.map((ev: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">{ev.key}:</span> {ev.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      {item.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{item.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <NewNoteForm onAdd={addNote} />
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{note.note_type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(note.created_at), 'PPpp')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Events</CardTitle>
                  <CardDescription>Chronological record of investigation events</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No timeline events yet</p>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((event) => (
                        <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(event.event_date), 'PPpp')}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                            {event.source && (
                              <Badge variant="secondary" className="text-xs">{event.source}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function NewNoteForm({ onAdd }: { onAdd: (content: string, type: string) => void }) {
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('general');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd(content, noteType);
    setContent('');
    setNoteType('general');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Note Type</Label>
        <Select value={noteType} onValueChange={setNoteType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="conclusion">Conclusion</SelectItem>
            <SelectItem value="recommendation">Recommendation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note..."
          rows={4}
        />
      </div>
      <Button onClick={handleSubmit}>
        <Plus className="w-4 h-4 mr-2" />
        Add Note
      </Button>
    </div>
  );
}
