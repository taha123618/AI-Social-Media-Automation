import { describe, it, expect, beforeEach } from 'bun:test';
import { useSidebarStore } from '../stores/sidebar.store';

describe('Mobile App - Global Sidebar Navigation', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false });
  });

  it('initializes with sidebar closed by default', () => {
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('opens sidebar when open() is triggered', () => {
    useSidebarStore.getState().open();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('closes sidebar when close() is triggered', () => {
    useSidebarStore.getState().open();
    expect(useSidebarStore.getState().isOpen).toBe(true);

    useSidebarStore.getState().close();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('toggles sidebar state back and forth', () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(true);

    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });
});
