-- Add RLS policies for data_sources table
-- Users can view data_sources from their own scans
CREATE POLICY "Users can view their own scan data sources"
  ON public.data_sources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = data_sources.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- Users can insert data_sources for their own scans
CREATE POLICY "Users can insert data sources for their scans"
  ON public.data_sources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = data_sources.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- Users can update data_sources from their own scans
CREATE POLICY "Users can update their own scan data sources"
  ON public.data_sources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = data_sources.scan_id
      AND scans.user_id = auth.uid()
    )
  );

-- Users can delete data_sources from their own scans
CREATE POLICY "Users can delete their own scan data sources"
  ON public.data_sources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scans
      WHERE scans.id = data_sources.scan_id
      AND scans.user_id = auth.uid()
    )
  );