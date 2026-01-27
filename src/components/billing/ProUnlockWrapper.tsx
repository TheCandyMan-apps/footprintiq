import { ProUnlockTransition } from '@/components/billing/ProUnlockTransition';
import { useProUnlock } from '@/hooks/useProUnlock';

/**
 * Global wrapper that monitors plan changes and shows unlock transition
 * Must be rendered inside WorkspaceProvider context
 */
export function ProUnlockWrapper() {
  const { showUnlockTransition, dismissTransition } = useProUnlock();

  return (
    <ProUnlockTransition 
      isVisible={showUnlockTransition} 
      onDismiss={dismissTransition} 
    />
  );
}
