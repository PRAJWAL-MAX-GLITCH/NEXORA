import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Package, FileText, LayoutDashboard,
  ArrowRight, Loader2, Building2, Hash, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Static nav commands (always visible when query is empty) ─────────────────
const NAV_COMMANDS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, hint: 'Go to Dashboard' },
  { label: 'Customers', path: '/customers', icon: Users, hint: 'View all customers' },
  { label: 'Products', path: '/products', icon: Package, hint: 'View all products' },
  { label: 'Challans', path: '/challans', icon: FileText, hint: 'View all challans' },
  { label: 'New Customer', path: '/customers/new', icon: Users, hint: 'Add a new customer' },
  { label: 'New Challan', path: '/challans/new', icon: FileText, hint: 'Create a new challan' },
  { label: 'Inventory', path: '/inventory', icon: Package, hint: 'Inventory & stock movements' },
];

// ─── Role-based page access ───────────────────────────────────────────────────
const ROLE_ACCESS = {
  ADMIN: ['/dashboard', '/customers', '/customers/new', '/products', '/challans', '/challans/new', '/inventory'],
  SALES: ['/dashboard', '/customers', '/customers/new', '/challans', '/challans/new'],
  WAREHOUSE: ['/dashboard', '/products', '/inventory', '/challans'],
  ACCOUNTS: ['/dashboard', '/challans', '/customers'],
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], products: [], challans: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const debouncedQuery = useDebounce(query, 280);

  // ─── Open / close ──────────────────────────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setResults({ customers: [], products: [], challans: [] });
    setActiveIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
      }
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, open, close]);

  // Listen for click from TopBar search bar
  useEffect(() => {
    const handleOpen = () => open();
    window.addEventListener('nexora:open-search', handleOpen);
    return () => window.removeEventListener('nexora:open-search', handleOpen);
  }, [open]);

  // ─── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ─── Real backend search ───────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults({ customers: [], products: [], challans: [] });
      setLoading(false);
      return;
    }

    const q = debouncedQuery.trim();
    setLoading(true);

    const role = user?.role;
    const allowedPaths = ROLE_ACCESS[role] || [];

    const canSeeCustomers = allowedPaths.includes('/customers');
    const canSeeProducts = allowedPaths.includes('/products');
    const canSeeChallans = allowedPaths.includes('/challans');

    const requests = [];
    if (canSeeCustomers) requests.push(api.get('/customers', { params: { search: q, limit: 5 } }).catch(() => null));
    else requests.push(Promise.resolve(null));

    if (canSeeProducts) requests.push(api.get('/products', { params: { search: q, limit: 5 } }).catch(() => null));
    else requests.push(Promise.resolve(null));

    if (canSeeChallans) requests.push(api.get('/challans', { params: { search: q, limit: 5 } }).catch(() => null));
    else requests.push(Promise.resolve(null));

    Promise.all(requests).then(([custRes, prodRes, chalRes]) => {
      setResults({
        customers: custRes?.data?.customers || [],
        products: prodRes?.data?.products || [],
        challans: chalRes?.data?.challans || [],
      });
      setActiveIndex(0);
      setLoading(false);
    });
  }, [debouncedQuery, user]);

  // ─── Build flat result list for keyboard nav ───────────────────────────────
  const allItems = [];

  if (!query.trim()) {
    // Show nav commands when query is empty
    const role = user?.role;
    const allowedPaths = ROLE_ACCESS[role] || [];
    NAV_COMMANDS.filter(c => allowedPaths.includes(c.path)).forEach(cmd => {
      allItems.push({ type: 'nav', data: cmd });
    });
  } else {
    results.customers.forEach(c => allItems.push({ type: 'customer', data: c }));
    results.products.forEach(p => allItems.push({ type: 'product', data: p }));
    results.challans.forEach(ch => allItems.push({ type: 'challan', data: ch }));
  }

  // ─── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[activeIndex]) selectItem(allItems[activeIndex]);
    }
  };

  // ─── Navigate on selection ─────────────────────────────────────────────────
  const selectItem = (item) => {
    if (item.type === 'nav') navigate(item.data.path);
    else if (item.type === 'customer') navigate(`/customers/${item.data.id}`);
    else if (item.type === 'product') navigate(`/products/${item.data.id}`);
    else if (item.type === 'challan') navigate(`/challans/${item.data.id}`);
    close();
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const hasResults = results.customers.length > 0 || results.products.length > 0 || results.challans.length > 0;
  const showEmpty = debouncedQuery.trim().length >= 2 && !loading && !hasResults;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-[#0F1623] border border-white/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-white/8 gap-3">
          {loading
            ? <Loader2 className="h-4 w-4 text-white/40 flex-shrink-0 animate-spin" />
            : <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm"
            placeholder="Search customers, products, challans..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults({ customers: [], products: [], challans: [] }); }}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              clear
            </button>
          )}
          <kbd className="text-[10px] text-white/25 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto">

          {/* Empty query → show nav commands */}
          {!query.trim() && (
            <div className="p-2">
              <p className="px-3 py-2 text-[10px] text-white/25 uppercase tracking-widest font-bold">Quick Navigation</p>
              {allItems.map((item, i) => (
                <NavItem
                  key={item.data.path}
                  item={item}
                  index={i}
                  active={i === activeIndex}
                  onSelect={() => selectItem(item)}
                  onHover={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && query.trim().length >= 2 && (
            <div className="px-5 py-10 text-center text-white/30 text-sm flex flex-col items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching database...</span>
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="px-5 py-10 text-center">
              <p className="text-white/30 text-sm">No results for "<span className="text-white/50">{query}</span>"</p>
              <p className="text-white/20 text-xs mt-1">Try a customer name, product name, SKU, or challan number.</p>
            </div>
          )}

          {/* Results sections */}
          {!loading && hasResults && (
            <div className="p-2">
              {results.customers.length > 0 && (
                <ResultSection
                  title="Customers"
                  icon={Users}
                  items={results.customers}
                  type="customer"
                  startIndex={0}
                  activeIndex={activeIndex}
                  allItems={allItems}
                  onSelect={selectItem}
                  onHover={setActiveIndex}
                  renderItem={(c, globalIdx) => (
                    <ResultRow
                      key={c.id}
                      index={globalIdx}
                      active={globalIdx === activeIndex}
                      onSelect={() => selectItem({ type: 'customer', data: c })}
                      onHover={() => setActiveIndex(globalIdx)}
                      primary={c.name}
                      secondary={c.businessName || c.mobile}
                      badge={c.status}
                      badgeColor={c.status === 'ACTIVE' ? 'emerald' : c.status === 'LEAD' ? 'amber' : 'slate'}
                      icon={Building2}
                    />
                  )}
                />
              )}

              {results.products.length > 0 && (
                <ResultSection
                  title="Products"
                  icon={Package}
                  items={results.products}
                  type="product"
                  startIndex={results.customers.length}
                  activeIndex={activeIndex}
                  allItems={allItems}
                  onSelect={selectItem}
                  onHover={setActiveIndex}
                  renderItem={(p, globalIdx) => (
                    <ResultRow
                      key={p.id}
                      index={globalIdx}
                      active={globalIdx === activeIndex}
                      onSelect={() => selectItem({ type: 'product', data: p })}
                      onHover={() => setActiveIndex(globalIdx)}
                      primary={p.name}
                      secondary={p.sku}
                      badge={`${p.currentStock} in stock`}
                      badgeColor={p.currentStock === 0 ? 'red' : p.currentStock <= p.minimumStock ? 'amber' : 'emerald'}
                      icon={Package}
                    />
                  )}
                />
              )}

              {results.challans.length > 0 && (
                <ResultSection
                  title="Challans"
                  icon={FileText}
                  items={results.challans}
                  type="challan"
                  startIndex={results.customers.length + results.products.length}
                  activeIndex={activeIndex}
                  allItems={allItems}
                  onSelect={selectItem}
                  onHover={setActiveIndex}
                  renderItem={(ch, globalIdx) => (
                    <ResultRow
                      key={ch.id}
                      index={globalIdx}
                      active={globalIdx === activeIndex}
                      onSelect={() => selectItem({ type: 'challan', data: ch })}
                      onHover={() => setActiveIndex(globalIdx)}
                      primary={ch.challanNumber}
                      secondary={ch.customer?.name || ''}
                      badge={ch.status}
                      badgeColor={ch.status === 'CONFIRMED' ? 'emerald' : ch.status === 'DRAFT' ? 'blue' : 'slate'}
                      icon={Hash}
                    />
                  )}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">NEXORA · Global Search</span>
          <div className="flex items-center gap-4 text-[10px] text-white/20">
            <span><kbd className="font-mono text-white/30">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono text-white/30">↵</kbd> Open</span>
            <span><kbd className="font-mono text-white/30">esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavItem({ item, index, active, onSelect, onHover }) {
  const Icon = item.data.icon;
  return (
    <button
      data-idx={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/6'
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white/70' : 'text-white/25 group-hover:text-white/50'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.data.label}</p>
        {item.data.hint && (
          <p className="text-[11px] text-white/25 truncate">{item.data.hint}</p>
        )}
      </div>
      <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-opacity ${active ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`} />
    </button>
  );
}

function ResultSection({ title, icon: Icon, items, type, startIndex, renderItem }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="h-3 w-3 text-white/25" />
        <span className="text-[10px] text-white/25 uppercase tracking-widest font-bold">{title}</span>
        <span className="text-[10px] text-white/15 ml-auto">{items.length} result{items.length !== 1 ? 's' : ''}</span>
      </div>
      {items.map((item, i) => renderItem(item, startIndex + i))}
    </div>
  );
}

function ResultRow({ index, active, onSelect, onHover, primary, secondary, badge, badgeColor, icon: Icon }) {
  const badgeStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    blue: 'bg-blue-500/15 text-blue-400',
    red: 'bg-red-500/15 text-red-400',
    slate: 'bg-white/5 text-white/30',
  };

  return (
    <button
      data-idx={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/6'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/10' : 'bg-white/5'}`}>
        <Icon className="h-3.5 w-3.5 text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-white/70'}`}>{primary}</p>
        {secondary && (
          <p className="text-[11px] text-white/25 truncate">{secondary}</p>
        )}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${badgeStyles[badgeColor] || badgeStyles.slate}`}>
          {badge}
        </span>
      )}
      <ArrowRight className={`h-3.5 w-3.5 flex-shrink-0 transition-opacity ${active ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'}`} />
    </button>
  );
}
