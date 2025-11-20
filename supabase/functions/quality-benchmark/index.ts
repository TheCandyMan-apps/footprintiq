import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BenchmarkRequestSchema = z.object({
  provider_ids: z.array(z.string()).min(1).max(10),
  corpus_version: z.string().min(1).max(50).optional().default('v1.0'),
});

interface TestCase {
  test_case_id: string;
  artifact_type: string;
  artifact_value: string;
  expected_findings: Record<string, any>;
  provider_expectations: Record<string, any>;
}

interface BenchmarkResult {
  provider_id: string;
  latencies: number[];
  errors: number;
  timeouts: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  total_cost: number;
  circuit_trips: number;
  test_cases_passed: number;
  test_cases_failed: number;
  failure_details: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication - Admin only
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Verify admin role
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Rate limiting (10 benchmarks/hour for admins)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'quality-benchmark', {
      maxRequests: 10,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = BenchmarkRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { provider_ids: targetProviders, corpus_version: version } = validation.data;

    console.log(`Starting quality benchmark for providers:`, targetProviders);

    // Fetch active test corpus
    const { data: testCases, error: corpusError } = await supabaseAdmin
      .from('quality_corpus')
      .select('*')
      .eq('is_active', true)
      .eq('corpus_version', version);

    if (corpusError || !testCases || testCases.length === 0) {
      console.error('Corpus fetch error:', corpusError);
      return new Response(
        JSON.stringify({ error: 'No test cases found' }),
        { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }), status: 400 }
      );
    }

    console.log(`Loaded ${testCases.length} test cases from corpus ${version}`);

    const results: BenchmarkResult[] = [];

    // Run tests for each provider
    for (const providerId of targetProviders) {
      console.log(`Testing provider: ${providerId}`);
      
      const result: BenchmarkResult = {
        provider_id: providerId,
        latencies: [],
        errors: 0,
        timeouts: 0,
        tp: 0,
        fp: 0,
        tn: 0,
        fn: 0,
        total_cost: 0,
        circuit_trips: 0,
        test_cases_passed: 0,
        test_cases_failed: 0,
        failure_details: [],
      };

      // Sample test cases to avoid overwhelming providers
      const sampleSize = Math.min(testCases.length, 10);
      const sampledCases = testCases.slice(0, sampleSize);

      for (const testCase of sampledCases) {
        const startTime = Date.now();
        
        try {
          // Simulate provider call (in production, this would call actual provider)
          const mockLatency = 100 + Math.random() * 400;
          await new Promise(resolve => setTimeout(resolve, mockLatency));
          
          const endTime = Date.now();
          const latency = endTime - startTime;
          result.latencies.push(latency);

          // Check expectations (simplified)
          const providerExpectation = testCase.provider_expectations[providerId];
          if (providerExpectation !== undefined) {
            // Simulate accuracy check
            const isCorrect = Math.random() > 0.1; // 90% accuracy simulation
            
            if (isCorrect) {
              result.tp++;
              result.test_cases_passed++;
            } else {
              result.fn++;
              result.test_cases_failed++;
              result.failure_details.push({
                test_case_id: testCase.test_case_id,
                expected: providerExpectation,
                actual: 'incorrect',
              });
            }
          }
        } catch (error) {
          console.error(`Test case ${testCase.test_case_id} failed:`, error);
          result.errors++;
          result.test_cases_failed++;
          result.failure_details.push({
            test_case_id: testCase.test_case_id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Calculate metrics
      const sortedLatencies = result.latencies.sort((a, b) => a - b);
      const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
      const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0;
      const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0;
      const avgLatency = result.latencies.reduce((a, b) => a + b, 0) / result.latencies.length || 0;
      
      const totalTests = result.tp + result.fp + result.tn + result.fn;
      const precision = result.tp > 0 ? (result.tp / (result.tp + result.fp)) * 100 : 0;
      const recall = result.tp > 0 ? (result.tp / (result.tp + result.fn)) * 100 : 0;
      const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      const accuracy = totalTests > 0 ? ((result.tp + result.tn) / totalTests) * 100 : 0;
      const errorRate = sampleSize > 0 ? (result.errors / sampleSize) * 100 : 0;

      // Store results
      const { error: insertError } = await supabaseAdmin
        .from('quality_results')
        .insert({
          provider_id: providerId,
          test_corpus_version: version,
          sample_size: sampleSize,
          p50_latency_ms: Math.round(p50),
          p95_latency_ms: Math.round(p95),
          p99_latency_ms: Math.round(p99),
          avg_latency_ms: Math.round(avgLatency),
          error_rate_pct: Math.round(errorRate * 100) / 100,
          timeout_count: result.timeouts,
          true_positives: result.tp,
          false_positives: result.fp,
          true_negatives: result.tn,
          false_negatives: result.fn,
          precision: Math.round(precision * 100) / 100,
          recall: Math.round(recall * 100) / 100,
          f1_score: Math.round(f1 * 100) / 100,
          accuracy: Math.round(accuracy * 100) / 100,
          total_cost_cents: result.total_cost,
          circuit_breaker_trips: result.circuit_trips,
          test_cases_passed: result.test_cases_passed,
          test_cases_failed: result.test_cases_failed,
          failure_details: result.failure_details,
        });

      if (insertError) {
        console.error('Failed to insert results:', insertError);
      } else {
        console.log(`Stored results for ${providerId}: F1=${f1.toFixed(2)}, P95=${p95.toFixed(0)}ms`);
      }

      results.push(result);
    }

    // Update aggregated scores
    await updateAggregatedScores(supabaseAdmin);

    console.log('Benchmark complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        providers_tested: targetProviders.length,
        test_cases_run: testCases.length,
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }), status: 200 }
    );
  } catch (error) {
    console.error('Error in quality-benchmark:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }), status: 500 }
    );
  }
});

async function updateAggregatedScores(supabase: any) {
  // Get all providers with recent results
  const { data: providers } = await supabase
    .from('quality_results')
    .select('provider_id')
    .gte('run_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('provider_id');

  if (!providers) return;

  const uniqueProviders = [...new Set(providers.map((p: any) => p.provider_id))];

  for (const providerId of uniqueProviders) {
    // 7-day averages
    const { data: recent7d } = await supabase
      .from('quality_results')
      .select('f1_score, p95_latency_ms, error_rate_pct')
      .eq('provider_id', providerId)
      .gte('run_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // 30-day averages
    const { data: recent30d } = await supabase
      .from('quality_results')
      .select('f1_score, p95_latency_ms, error_rate_pct')
      .eq('provider_id', providerId)
      .gte('run_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const avg7dF1 = recent7d?.reduce((sum: number, r: any) => sum + (r.f1_score || 0), 0) / (recent7d?.length || 1);
    const avg7dP95 = recent7d?.reduce((sum: number, r: any) => sum + (r.p95_latency_ms || 0), 0) / (recent7d?.length || 1);
    const avg7dErr = recent7d?.reduce((sum: number, r: any) => sum + (r.error_rate_pct || 0), 0) / (recent7d?.length || 1);

    const avg30dF1 = recent30d?.reduce((sum: number, r: any) => sum + (r.f1_score || 0), 0) / (recent30d?.length || 1);
    const avg30dP95 = recent30d?.reduce((sum: number, r: any) => sum + (r.p95_latency_ms || 0), 0) / (recent30d?.length || 1);
    const avg30dErr = recent30d?.reduce((sum: number, r: any) => sum + (r.error_rate_pct || 0), 0) / (recent30d?.length || 1);

    await supabase
      .from('provider_quality_scores')
      .upsert({
        provider_id: providerId,
        last_tested_at: new Date().toISOString(),
        avg_f1_score_7d: Math.round(avg7dF1 * 100) / 100,
        avg_p95_latency_7d: Math.round(avg7dP95),
        avg_error_rate_7d: Math.round(avg7dErr * 100) / 100,
        avg_f1_score_30d: Math.round(avg30dF1 * 100) / 100,
        avg_p95_latency_30d: Math.round(avg30dP95),
        avg_error_rate_30d: Math.round(avg30dErr * 100) / 100,
      }, {
        onConflict: 'provider_id',
      });
  }
}
