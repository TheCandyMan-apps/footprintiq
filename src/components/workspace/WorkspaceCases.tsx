import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, Image, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Case {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  image_results: any;
  created_at: string;
}

interface WorkspaceCasesProps {
  workspaceId: string;
}

export function WorkspaceCases({ workspaceId }: WorkspaceCasesProps) {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['workspace-cases', workspaceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Case[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Recent Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading cases...</p>
        </CardContent>
      </Card>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Recent Cases
          </CardTitle>
          <CardDescription>
            Save reverse image search results to create cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cases yet. Start by running a reverse image search.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Recent Cases
        </CardTitle>
        <CardDescription>
          {cases.length} {cases.length === 1 ? 'case' : 'cases'} in this workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {cases.map((caseItem) => (
            <AccordionItem key={caseItem.id} value={caseItem.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">{caseItem.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={caseItem.status === 'open' ? 'default' : 'secondary'}>
                      {caseItem.status}
                    </Badge>
                    <Badge variant={
                      caseItem.priority === 'high' ? 'destructive' :
                      caseItem.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {caseItem.description && (
                    <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                  )}
                  
                  {caseItem.image_results && Array.isArray(caseItem.image_results) && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Image Search Results ({caseItem.image_results.length} matches)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {caseItem.image_results.slice(0, 6).map((result: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-2 space-y-2">
                            <div className="aspect-video relative bg-muted rounded overflow-hidden">
                              <img
                                src={result.thumbnail_url}
                                alt={`Match ${idx + 1}`}
                                className="object-cover w-full h-full"
                              />
                              <Badge className="absolute top-1 right-1 text-xs">
                                {result.match_percent}%
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium truncate">{result.domain}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={() => window.open(result.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {caseItem.image_results.length > 6 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{caseItem.image_results.length - 6} more results
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
