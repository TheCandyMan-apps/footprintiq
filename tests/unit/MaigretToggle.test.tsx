import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaigretToggle } from '@/components/scan/MaigretToggle';

describe('MaigretToggle', () => {
  it('should render with correct label', () => {
    render(<MaigretToggle enabled={false} onChange={vi.fn()} />);
    
    expect(screen.getByText('Use Maigret (OSINT username scan)')).toBeInTheDocument();
  });

  it('should display tooltip on hover', async () => {
    render(<MaigretToggle enabled={false} onChange={vi.fn()} />);
    
    const helpIcon = screen.getByRole('button', { name: /help/i });
    expect(helpIcon).toBeInTheDocument();
  });

  it('should call onChange when toggled', () => {
    const onChange = vi.fn();
    render(<MaigretToggle enabled={false} onChange={onChange} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<MaigretToggle enabled={false} onChange={vi.fn()} disabled={true} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
  });

  it('should reflect enabled state', () => {
    const { rerender } = render(<MaigretToggle enabled={false} onChange={vi.fn()} />);
    
    let toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
    
    rerender(<MaigretToggle enabled={true} onChange={vi.fn()} />);
    
    toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
  });
});
