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

  // Filtered data
  const myNotes = useMemo(() => filterResearch(allMyNotes, searchQuery), [searchQuery]);
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
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="#333" strokeWidth="3">
                <path d="M9.06,25C7.68,17.3,12.78,10.63,20.73,10c7-.55,10.47,7.93,11.17,9.55a.13.13,0,0,0,.25,0c3.25-8.91,9.17-9.29,11.25-9.5C49,9.45,56.51,13.78,55,23.87c-2.16,14-23.12,29.81-23.12,29.81S11.79,40.05,9.06,25Z"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7258 7.34056C12.1397 7.32632 12.4638 6.97919 12.4495 6.56522C12.4353 6.15125 12.0882 5.8272 11.6742 5.84144L11.7258 7.34056ZM7.15843 11.562L6.40879 11.585C6.40906 11.5938 6.40948 11.6026 6.41006 11.6114L7.15843 11.562ZM5.87826 14.979L6.36787 15.5471C6.38128 15.5356 6.39428 15.5236 6.40684 15.5111L5.87826 14.979ZM5.43951 15.342L5.88007 15.949C5.89245 15.94 5.90455 15.9306 5.91636 15.9209L5.43951 15.342ZM9.74998 17.75C10.1642 17.75 10.5 17.4142 10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25V17.75ZM11.7258 5.84144C11.3118 5.8272 10.9647 6.15125 10.9504 6.56522C10.9362 6.97919 11.2602 7.32632 11.6742 7.34056L11.7258 5.84144ZM16.2415 11.562L16.9899 11.6113C16.9905 11.6025 16.9909 11.5938 16.9912 11.585L16.2415 11.562ZM17.5217 14.978L16.9931 15.5101C17.0057 15.5225 17.0187 15.5346 17.0321 15.5461L17.5217 14.978ZM17.9605 15.341L17.4836 15.9199C17.4952 15.9294 17.507 15.9386 17.5191 15.9474L17.9605 15.341ZM13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17C12.9 17.4142 13.2358 17.75 13.65 17.75V16.25ZM10.95 6.591C10.95 7.00521 11.2858 7.341 11.7 7.341C12.1142 7.341 12.45 7.00521 12.45 6.591H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17C8.99998 17.4142 9.33577 17.75 9.74998 17.75V16.25ZM13.65 17.75C14.0642 17.75 14.4 17.4142 14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25V17.75ZM10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17H10.5ZM14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17H14.4ZM11.6742 5.84144C8.65236 5.94538 6.31509 8.53201 6.40879 11.585L7.90808 11.539C7.83863 9.27613 9.56498 7.41488 11.7258 7.34056L11.6742 5.84144ZM6.41006 11.6114C6.48029 12.6748 6.08967 13.7118 5.34968 14.4469L6.40684 15.5111C7.45921 14.4656 8.00521 13.0026 7.9068 11.5126L6.41006 11.6114ZM5.38865 14.4109C5.23196 14.5459 5.10026 14.6498 4.96265 14.7631L5.91636 15.9209C6.0264 15.8302 6.195 15.6961 6.36787 15.5471L5.38865 14.4109ZM4.99895 14.735C4.77969 14.8942 4.58045 15.1216 4.43193 15.3617C4.28525 15.5987 4.14491 15.9178 4.12693 16.2708C4.10726 16.6569 4.24026 17.0863 4.63537 17.3884C4.98885 17.6588 5.45464 17.75 5.94748 17.75V16.25C5.78415 16.25 5.67611 16.234 5.60983 16.2171C5.54411 16.2004 5.53242 16.1861 5.54658 16.1969C5.56492 16.211 5.59211 16.2408 5.61004 16.2837C5.62632 16.3228 5.62492 16.3484 5.62499 16.3472C5.62513 16.3443 5.62712 16.3233 5.6414 16.2839C5.65535 16.2454 5.67733 16.1997 5.70749 16.151C5.73748 16.1025 5.77159 16.0574 5.80538 16.0198C5.84013 15.981 5.86714 15.9583 5.88007 15.949L4.99895 14.735ZM5.94748 17.75H9.74998V16.25H5.94748V17.75ZM11.6742 7.34056C13.835 7.41488 15.5613 9.27613 15.4919 11.539L16.9912 11.585C17.0849 8.53201 14.7476 5.94538 11.7258 5.84144L11.6742 7.34056ZM15.4932 11.5127C15.3951 13.0024 15.9411 14.4649 16.9931 15.5101L18.0503 14.4459C17.3105 13.711 16.9199 12.6744 16.9899 11.6113L15.4932 11.5127ZM17.0321 15.5461C17.205 15.6951 17.3736 15.8292 17.4836 15.9199L18.4373 14.7621C18.2997 14.6488 18.168 14.5449 18.0113 14.4099L17.0321 15.5461ZM17.5191 15.9474C17.5325 15.9571 17.5599 15.9802 17.5949 16.0193C17.629 16.0573 17.6634 16.1026 17.6937 16.1514C17.7241 16.2004 17.7463 16.2463 17.7604 16.285C17.7748 16.3246 17.7769 16.3457 17.777 16.3485C17.7771 16.3497 17.7756 16.3238 17.792 16.2844C17.81 16.241 17.8375 16.211 17.856 16.1968C17.8702 16.1859 17.8585 16.2002 17.7925 16.217C17.7259 16.234 17.6174 16.25 17.4535 16.25V17.75C17.9468 17.75 18.4132 17.6589 18.7669 17.3885C19.1628 17.0859 19.2954 16.6557 19.2749 16.2693C19.2562 15.9161 19.1151 15.5972 18.9682 15.3604C18.8194 15.1206 18.6202 14.8936 18.4018 14.7346L17.5191 15.9474ZM17.4535 16.25H13.65V17.75H17.4535V16.25ZM12.45 6.591V5H10.95V6.591H12.45ZM9.74998 17.75H13.65V16.25H9.74998V17.75ZM8.99998 17C8.99998 18.5008 10.191 19.75 11.7 19.75V18.25C11.055 18.25 10.5 17.7084 10.5 17H8.99998ZM11.7 19.75C13.2089 19.75 14.4 18.5008 14.4 17H12.9C12.9 17.7084 12.3449 18.25 11.7 18.25V19.75Z" fill="#333"/>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M14.75 7.33303V11.222C14.7728 12.4877 13.7657 13.5325 12.5 13.556C11.2343 13.5325 10.2271 12.4877 10.25 11.222V7.33303C10.2277 6.06772 11.2347 5.02357 12.5 5.00003C13.7653 5.02357 14.7723 6.06772 14.75 7.33303Z" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.46233 13.8534C8.13618 13.5981 7.66478 13.6555 7.40945 13.9817C7.15411 14.3078 7.21152 14.7792 7.53767 15.0346L8.46233 13.8534ZM17.4623 15.0346C17.7885 14.7792 17.8459 14.3078 17.5906 13.9817C17.3352 13.6555 16.8638 13.5981 16.5377 13.8534L17.4623 15.0346ZM13.25 16C13.25 15.5858 12.9142 15.25 12.5 15.25C12.0858 15.25 11.75 15.5858 11.75 16H13.25ZM11.75 19C11.75 19.4142 12.0858 19.75 12.5 19.75C12.9142 19.75 13.25 19.4142 13.25 19H11.75ZM7.53767 15.0346C10.4524 17.3164 14.5476 17.3164 17.4623 15.0346L16.5377 13.8534C14.1661 15.7101 10.8339 15.7101 8.46233 13.8534L7.53767 15.0346ZM11.75 16V19H13.25V16H11.75Z" fill="#8B8BA3"/>
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
            <button className="view-all-button">
              <span>View All</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="#9F2089" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="notes-cards">
            {myNotes.length > 0 ? (
              myNotes.map((note) => (
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
              ))
            ) : searchQuery ? (
              <div className="no-results">No notes found matching "{searchQuery}"</div>
            ) : null}
          </div>
          
          <button 
            className="create-button"
            onClick={() => navigate('/create')}
          >
            Create
          </button>
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
                      <svg width="16" height="16" viewBox="0 0 64 64" fill="none" stroke="#333" strokeWidth="3">
                        <path d="M9.06,25C7.68,17.3,12.78,10.63,20.73,10c7-.55,10.47,7.93,11.17,9.55a.13.13,0,0,0,.25,0c3.25-8.91,9.17-9.29,11.25-9.5C49,9.45,56.51,13.78,55,23.87c-2.16,14-23.12,29.81-23.12,29.81S11.79,40.05,9.06,25Z"/>
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

