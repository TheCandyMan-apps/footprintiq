import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProviderStatusPanel } from './ProviderStatusPanel';

interface SummaryResult {
  platform: string;
  url: string;
  confidence: string;
  status: string;
}

interface UnifiedResultsDisplayProps {
  providerResults: {
    maigret: SummaryResult[];
    sherlock: SummaryResult[];
    gosearch: SummaryResult[];
    apify: SummaryResult[];
  };
  searchQuery?: string;
  selectedProviders?: string[];
  pdfExportButton?: React.ReactNode;
  scanId?: string;
}

export function UnifiedResultsDisplay({
  providerResults,
  searchQuery = '',
  selectedProviders = [],
  pdfExportButton,
  scanId,
}: UnifiedResultsDisplayProps) {
  const totalResults =
    providerResults.maigret.length +
    providerResults.sherlock.length +
    providerResults.gosearch.length +
    providerResults.apify.length;

  const filterResults = (results: SummaryResult[], providerName: string) => {
    return results.filter((result) => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesPlatform = (result.platform || '').toLowerCase().includes(searchLower);
        const matchesUrl = (result.url || '').toLowerCase().includes(searchLower);
        if (!matchesPlatform && !matchesUrl) return false;
      }

      // Filter by selected providers
      if (selectedProviders.length > 0 && !selectedProviders.includes(providerName)) {
        return false;
      }

      return true;
    });
  };

  return (
    <>
      {/* Provider Status Panel */}
      {scanId && (
        <div className="mb-4">
          <ProviderStatusPanel scanId={scanId} />
        </div>
      )}

      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg overflow-hidden animate-scale-in">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Scan Results
              <Badge variant="secondary" className="ml-2">
                {totalResults} total
              </Badge>
            </CardTitle>
            <CardDescription>Results from all active scan providers</CardDescription>
          </div>
          {pdfExportButton}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 p-6">
            {/* Maigret Results */}
            {filterResults(providerResults.maigret, 'maigret').length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 px-3 -mx-3 rounded-lg border-b border-green-500/20 z-10">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Maigret Results
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {filterResults(providerResults.maigret, 'maigret').length}
                  </Badge>
                </div>
                {filterResults(providerResults.maigret, 'maigret').map((result, index) => (
                  <Card
                    key={`maigret-${index}`}
                    className="p-4 border-l-4 border-l-green-500 hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-card to-card/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{result.platform}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            >
                              maigret
                            </Badge>
                          </div>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 group/link"
                            >
                              <span className="truncate break-all">{result.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                        <Badge variant="default">{result.status}</Badge>
                      </div>
                      {result.confidence && result.confidence !== 'Unknown' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence:</span>
                          <Badge variant="outline">{result.confidence}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Sherlock Results */}
            {filterResults(providerResults.sherlock, 'sherlock').length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 px-3 -mx-3 rounded-lg border-b border-purple-500/20 z-10">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Sherlock Results
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {filterResults(providerResults.sherlock, 'sherlock').length}
                  </Badge>
                </div>
                {filterResults(providerResults.sherlock, 'sherlock').map((result, index) => (
                  <Card
                    key={`sherlock-${index}`}
                    className="p-4 border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-card to-card/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{result.platform}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              sherlock
                            </Badge>
                          </div>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 group/link"
                            >
                              <span className="truncate break-all">{result.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                        <Badge variant="default">{result.status}</Badge>
                      </div>
                      {result.confidence && result.confidence !== 'Unknown' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence:</span>
                          <Badge variant="outline">{result.confidence}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* GoSearch Results */}
            {filterResults(providerResults.gosearch, 'gosearch').length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 px-3 -mx-3 rounded-lg border-b border-blue-500/20 z-10">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    GoSearch Results
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {filterResults(providerResults.gosearch, 'gosearch').length}
                  </Badge>
                </div>
                {filterResults(providerResults.gosearch, 'gosearch').map((result, index) => (
                  <Card
                    key={`gosearch-${index}`}
                    className="p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-card to-card/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{result.platform}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              gosearch
                            </Badge>
                          </div>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 group/link"
                            >
                              <span className="truncate break-all">{result.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                        <Badge variant="default">{result.status}</Badge>
                      </div>
                      {result.confidence && result.confidence !== 'Unknown' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence:</span>
                          <Badge variant="outline">{result.confidence}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Apify Social Media Finder Results */}
            {filterResults(providerResults.apify, 'apify-social').length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 px-3 -mx-3 rounded-lg border-b border-orange-500/20 z-10">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Social Media Finder Pro (Apify)
                  </h3>
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                    {filterResults(providerResults.apify, 'apify-social').length}
                  </Badge>
                </div>
                {filterResults(providerResults.apify, 'apify-social').map((result, index) => (
                  <Card
                    key={`apify-${index}`}
                    className="p-4 border-l-4 border-l-orange-500 hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-card to-card/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{result.platform}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                              apify-social
                            </Badge>
                          </div>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 group/link"
                            >
                              <span className="truncate break-all">{result.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          )}
                        </div>
                        <Badge variant="default">{result.status}</Badge>
                      </div>
                      {result.confidence && result.confidence !== 'Unknown' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence:</span>
                          <Badge variant="outline">{result.confidence}</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
    </>
  );
}
