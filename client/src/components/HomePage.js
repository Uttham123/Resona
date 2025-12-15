import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ notebooks = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for "My Notes" cards
  const allMyNotes = [
    {
      id: 1,
      title: 'Improve Mall Comprehension',
      date: '12 December 2025',
      researchers: ['Uttham', 'Vedant', 'Aman', 'Pravalhika', 'Prasanna']
    },
    {
      id: 2,
      title: 'Enhance Checkout Experience',
      date: '15 January 2026',
      researchers: ['Siddharth', 'Neha', 'Rohan', 'Tanvi', 'Kartik']
    },
    {
      id: 3,
      title: 'Optimize Inventory Management',
      date: '20 February 2026',
      researchers: ['Aarav', 'Diya', 'Kabir', 'Priya', 'Vikram']
    }
  ];

  // Sample data for "Latest Research"
  const allLatestResearch = [
    {
      id: 1,
      title: 'Improve Mall Comprehension',
      description: '"Mall matlab company ka product jo mall se aate hain"',
      date: '12 December 2025',
      researchers: ['Uttham', 'Vedant', 'Aman', 'Pravalhika', 'Prasanna']
    },
    {
      id: 2,
      title: 'Enhance Checkout Conversion',
      description: '"Mai products cart pe daal deti hun, phir jab rate ghirne ka wait karti hun "',
      date: '15 January 2024',
      researchers: ['Siddharth', 'Neha', 'Rohan', 'Tanvi', 'Kartik']
    },
    {
      id: 3,
      title: 'Optimize Shopping Experience',
      description: '"Shopping matlab samagri kharidne ki prakriya"',
      date: '20 February 2026',
      researchers: ['Aarav', 'Diya', 'Kabir', 'Priya', 'Vikram']
    }
  ];

  // Filter function
  const filterResearch = (items, query) => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase().trim();
    
    return items.filter(item => {
      // Search in title/goal
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      
      // Search in date
      const dateMatch = item.date.toLowerCase().includes(lowerQuery);
      
      // Search in researcher names
      const researcherMatch = item.researchers.some(researcher => 
        researcher.toLowerCase().includes(lowerQuery)
      );
      
      // Search in description (for latest research)
      const descriptionMatch = item.description?.toLowerCase().includes(lowerQuery);
      
      return titleMatch || dateMatch || researcherMatch || descriptionMatch;
    });
  };

  // Filtered data - allMyNotes and allLatestResearch are constants, so we can safely ignore them in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const myNotes = useMemo(() => filterResearch(allMyNotes, searchQuery), [searchQuery]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const latestResearch = useMemo(() => filterResearch(allLatestResearch, searchQuery), [searchQuery]);

  return (
    <div className="home-page">
      {/* Header Section */}
      <div className="home-header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-profile">
              <div className="user-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                  alt="User" 
                  className="avatar-image"
                />
              </div>
              <div className="user-info">
                <p className="user-name">Uttham Udatthu</p>
                <div className="user-badges">
                  <span className="badge badge-yellow">VSKU</span>
                  <span className="badge badge-yellow">Gen-AI Research</span>
                </div>
              </div>
            </div>
          </div>
          <div className="action-icons">
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_24_609)">
                  <path d="M7.76807 4.56C8.83807 4.56 9.85807 5.04 10.7881 5.99C11.1081 6.31 11.5481 6.5 11.9981 6.5C12.4481 6.5 12.8881 6.32 13.2081 5.99C14.1381 5.04 15.1581 4.57 16.2281 4.57C17.8281 4.57 19.3781 5.68 20.0781 7.32C20.8081 9.04 20.4081 10.89 18.9681 12.39L12.4181 19.25C12.2681 19.4 12.1081 19.44 11.9981 19.44C11.8881 19.44 11.7281 19.41 11.5781 19.25L5.02807 12.39C3.58807 10.88 3.18807 9.03 3.91807 7.31C4.61807 5.67 6.16807 4.56 7.76807 4.56ZM7.76807 3C3.28807 3 -0.381933 8.98 3.90807 13.47L10.4581 20.33C10.8781 20.78 11.4381 21 11.9981 21C12.5581 21 13.1181 20.78 13.5381 20.33L20.0881 13.47C24.3681 8.99 20.6981 3 16.2181 3C14.8481 3 13.4081 3.56 12.0981 4.89C12.0681 4.92 12.0381 4.93 11.9981 4.93C11.9581 4.93 11.9281 4.92 11.8981 4.89C10.5881 3.56 9.13807 3 7.76807 3Z" fill="#616173"/>
                </g>
                <defs>
                  <clipPath id="clip0_24_609">
                    <rect width="20" height="18" fill="white" transform="translate(2 3)"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.3942 5.02194L11.2517 4.73692L11.4094 3.88146C11.4455 3.68775 11.6508 3.48047 11.9657 3.48047C12.2772 3.48047 12.4826 3.68364 12.5208 3.87571L12.6913 4.72828L13.5519 5.00178C15.4473 5.60472 16.773 7.26792 16.773 9.18735C16.773 9.24164 16.7722 9.29593 16.77 9.34981L16.7692 9.37736V9.40492V13.8537C16.7692 14.6635 17.1468 15.4305 17.7985 15.9463L18.9928 16.8902H5.00784L6.20171 15.9459C6.853 15.4301 7.23019 14.6631 7.23019 13.8541V9.12196L7.23535 9.07877L7.23792 9.02161C7.30967 7.19512 8.5856 5.62322 10.3942 5.02194ZM4.29114 18.3701C3.08351 18.3701 2.5392 16.9224 3.47016 16.1862L5.21608 14.8047C5.51208 14.5703 5.68349 14.2215 5.68349 13.8538V9.10852C5.68349 9.0604 5.6865 9.01269 5.69209 8.9658C5.78961 6.49567 7.51061 4.41337 9.88676 3.62331C10.0569 2.70164 10.923 2 11.9652 2C12.998 2 13.8568 2.68848 14.0389 3.59699C16.5281 4.3887 18.3187 6.59232 18.3187 9.18707C18.3187 9.25987 18.3174 9.33225 18.3144 9.40463V13.8534C18.3144 14.2215 18.4862 14.5703 18.7826 14.8047L20.5294 16.1858C21.4608 16.922 20.9169 18.3701 19.7093 18.3701H4.29114ZM12 20.5206C11.3667 20.5206 10.8001 20 10.8001 19.293H9.25393C9.25393 20.7596 10.4538 22.0008 12 22.0008C13.5457 22.0008 14.7456 20.7596 14.7456 19.293H13.1994C13.1994 20 12.6328 20.5206 12 20.5206Z" fill="#616173"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <svg className="search-icon" width="19" height="19" viewBox="0 0 19 19" fill="none">
              <path d="M8.5 15C12.0899 15 15 12.0899 15 8.5C15 4.91015 12.0899 2 8.5 2C4.91015 2 2 4.91015 2 8.5C2 12.0899 4.91015 15 8.5 15Z" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 17L13.5 13.5" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for any research" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="mic-button">
              <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11.646" y="4.47915" width="5.375" height="12.5417" rx="2.6875" stroke="#353543" strokeWidth="1.79167"/>
                <path d="M14.3335 21.7582V26.2778M14.3335 21.7582C17.9724 21.7582 20.9029 19.1111 21.5001 15.5278M14.3335 21.7582C10.6945 21.7582 7.76397 19.1111 7.16675 15.5278" stroke="#353543" strokeWidth="1.79167" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        {/* My Notes Section */}
        <div className="my-notes-section">
          <div className="section-header">
            <h2 className="section-title">My Notes</h2>
            {myNotes.length > 0 && (
              <button className="view-all-button">
                <span>View All</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="#9F2089" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          
          {myNotes.length > 0 ? (
            <>
              <div className="notes-cards">
                {myNotes.map((note) => (
                  <div key={note.id} className="note-card">
                    <h3 className="note-card-title">{note.title}</h3>
                    <div className="note-card-footer">
                      <div className="researcher-avatars">
                        {note.researchers.slice(0, 5).map((researcher, idx) => (
                          <div key={idx} className="researcher-avatar">
                            <span>{researcher[0]}</span>
                          </div>
                        ))}
                      </div>
                      <p className="note-card-date">{note.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="create-button"
                onClick={() => navigate('/create')}
              >
                Create
              </button>
            </>
          ) : searchQuery ? (
            <div className="no-results">No notes found matching "{searchQuery}"</div>
          ) : (
            <>
              <div className="empty-state-container">
                <div className="empty-state-content">
                  <div className="empty-state-image">
                    <svg width="102" height="156" viewBox="0 0 102 156" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Main illustration - simplified research/notebook concept */}
                      <ellipse cx="51" cy="50" rx="50" ry="50" fill="#FFE7FB" opacity="0.4"/>
                      <rect x="20" y="20" width="62" height="60" rx="8" fill="#FFFFFF" opacity="0.8"/>
                      <rect x="25" y="30" width="52" height="4" rx="2" fill="#9F2089" opacity="0.3"/>
                      <rect x="25" y="40" width="45" height="4" rx="2" fill="#9F2089" opacity="0.3"/>
                      <rect x="25" y="50" width="40" height="4" rx="2" fill="#9F2089" opacity="0.3"/>
                      <circle cx="35" cy="70" r="6" fill="#9F2089" opacity="0.2"/>
                      <circle cx="50" cy="70" r="6" fill="#9F2089" opacity="0.2"/>
                      <circle cx="65" cy="70" r="6" fill="#9F2089" opacity="0.2"/>
                      <path d="M30 100C30 100 40 110 51 110C62 110 72 100 72 100" stroke="#9F2089" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                    </svg>
                  </div>
                  <div className="empty-state-text">
                    <h3 className="empty-state-title">Create your First Research</h3>
                    <ol className="empty-state-steps">
                      <li>
                        <span className="step-bold">Add</span> Research Audio
                      </li>
                      <li>
                        <span className="step-bold">Validate</span> the Insights
                      </li>
                      <li>
                        <span className="step-bold">Publish</span> your Research
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <button 
                className="create-button"
                onClick={() => navigate('/create')}
              >
                Create
              </button>
            </>
          )}
        </div>

        {/* Latest Research Section */}
        <div className="latest-research-section">
          <h2 className="section-title">Latest Research</h2>
          
          <div className="research-cards">
            {latestResearch.length > 0 ? (
              latestResearch.map((research) => (
                <div 
                  key={research.id} 
                  className="research-card"
                  onClick={() => navigate(`/research/${research.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="research-card-header">
                    <h3 className="research-card-title">{research.title}</h3>
                    <button className="favorite-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_24_609)">
                          <path d="M7.76807 4.56C8.83807 4.56 9.85807 5.04 10.7881 5.99C11.1081 6.31 11.5481 6.5 11.9981 6.5C12.4481 6.5 12.8881 6.32 13.2081 5.99C14.1381 5.04 15.1581 4.57 16.2281 4.57C17.8281 4.57 19.3781 5.68 20.0781 7.32C20.8081 9.04 20.4081 10.89 18.9681 12.39L12.4181 19.25C12.2681 19.4 12.1081 19.44 11.9981 19.44C11.8881 19.44 11.7281 19.41 11.5781 19.25L5.02807 12.39C3.58807 10.88 3.18807 9.03 3.91807 7.31C4.61807 5.67 6.16807 4.56 7.76807 4.56ZM7.76807 3C3.28807 3 -0.381933 8.98 3.90807 13.47L10.4581 20.33C10.8781 20.78 11.4381 21 11.9981 21C12.5581 21 13.1181 20.78 13.5381 20.33L20.0881 13.47C24.3681 8.99 20.6981 3 16.2181 3C14.8481 3 13.4081 3.56 12.0981 4.89C12.0681 4.92 12.0381 4.93 11.9981 4.93C11.9581 4.93 11.9281 4.92 11.8981 4.89C10.5881 3.56 9.13807 3 7.76807 3Z" fill="#616173"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_24_609">
                            <rect width="20" height="18" fill="white" transform="translate(2 3)"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </div>
                  <p className="research-card-description">{research.description}</p>
                  <div className="research-card-footer">
                    <div className="research-date">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 2H2C1.44772 2 1 2.44772 1 3V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V3C11 2.44772 10.5523 2 10 2Z" stroke="#666666" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 4H11" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M3 1V3" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
                        <path d="M9 1V3" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                      <span>{research.date}</span>
                    </div>
                    <div className="researcher-badges">
                      {research.researchers.map((researcher, idx) => (
                        <span key={idx} className="researcher-badge">{researcher}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="no-results">No research found matching "{searchQuery}"</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

