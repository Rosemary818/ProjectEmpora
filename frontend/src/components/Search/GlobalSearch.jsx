import React, { useState, useEffect, useRef } from 'react';
import './GlobalSearch.css';

const GlobalSearch = ({ className }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const searchRef = useRef(null);

  // Debounce logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSearchResults = async (searchQuery) => {
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.data || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (item, type, category) => {
    setSelectedItem({ item, type, category });
    setShowDropdown(false);
    setQuery('');
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <div className={`global-search-container ${className || ''}`} ref={searchRef}>
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search everywhere..." 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          />
          {isSearching && (
            <div className="search-spinner"></div>
          )}
        </div>

        {showDropdown && query.trim() && (
          <div className="search-dropdown">
            {results.length === 0 && !isSearching ? (
              <div className="search-no-results">No results found for '{query}'</div>
            ) : (
              results.map((group, idx) => (
                <div key={idx} className="search-group">
                  <div className="search-group-title">{group.category}</div>
                  {group.items.map((item, itemIdx) => (
                    <div 
                      key={item._id || itemIdx} 
                      className="search-item"
                      onClick={() => handleResultClick(item, group.type, group.category)}
                    >
                      {group.type === 'employee' || group.type === 'candidate' ? (
                        <>
                          <div className="search-item-title">{item.firstName} {item.lastName}</div>
                          <div className="search-item-subtitle">{item.employeeCode || item.email}</div>
                        </>
                      ) : group.type === 'training' || group.type === 'job' || group.type === 'document' || group.type === 'announcement' ? (
                        <>
                          <div className="search-item-title">{item.title}</div>
                        </>
                      ) : group.type === 'complaint' ? (
                        <>
                          <div className="search-item-title">{item.subject}</div>
                          <div className="search-item-subtitle">{item.complaintId || ''}</div>
                        </>
                      ) : group.type === 'asset' ? (
                        <>
                          <div className="search-item-title">{item.assetName}</div>
                          <div className="search-item-subtitle">{item.assetId || ''}</div>
                        </>
                      ) : group.type === 'leave' ? (
                        <>
                          <div className="search-item-title">{item.leaveType}</div>
                          <div className="search-item-subtitle">{item.reason || ''}</div>
                        </>
                      ) : group.type === 'payslip' ? (
                        <>
                          <div className="search-item-title">{item.month} {item.year}</div>
                        </>
                      ) : (
                        <div className="search-item-title">Item {item._id}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="search-modal-overlay" onClick={closeModal}>
          <div className="search-modal-content" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <h3>{selectedItem.category} Details</h3>
              <button className="search-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="search-modal-body">
              {Object.entries(selectedItem.item).map(([key, value]) => {
                if (key === '_id' || key === '__v' || key === 'password' || typeof value === 'object') return null;
                return (
                  <div key={key} className="search-modal-row">
                    <span className="search-modal-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="search-modal-value">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
