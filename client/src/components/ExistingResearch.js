import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ExistingResearch.css';

const ExistingResearch = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id will be used when fetching real data from API

  // Helper to generate timestamp
  const generateTimestamp = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.getTime();
  };

  // Sample data with timestamps - in production, fetch from API based on id
  const initialData = {
    title: 'Enhance Checkout Conversion',
    date: '15 January 2024',
    userCohorts: '0-1 OD users from T3, T4 villages in Bihar',
    methodology: 'In-person LoDs',
    researchers: ['Siddharth', 'Neha', 'Rohan', 'Tanvi', 'Kartik'],
    insights: [
      { id: 1, text: 'People were not reading texts and missing on mall pills at PDP', timestamp: generateTimestamp(0) },
      { id: 2, text: 'Mall colour was strongly associated and that was building associations.', timestamp: generateTimestamp(1) },
      { id: 3, text: 'People perceived mall as something coming from physical mall and those are mostly branded products.', timestamp: generateTimestamp(2) },
      { id: 4, text: 'People perceive company ka products as branded products they don\'t remember brands across all the categories.', timestamp: generateTimestamp(3) },
      { id: 5, text: 'Day to day life brands are well resonated byt they don\'t realise that they know brands.', timestamp: generateTimestamp(4) },
      { id: 6, text: 'Almost all branded products at meesho are discovered via search.', timestamp: generateTimestamp(5) },
      { id: 7, text: 'New brand launches are not known to our users, they only discover via their friends.', timestamp: generateTimestamp(6) },
      { id: 8, text: 'Manufacturing date and expiry date are important for some customers to build trust.', timestamp: generateTimestamp(7) },
      { id: 9, text: 'Some of the people were coming directly by looking at ads.', timestamp: generateTimestamp(8) }
    ],
    opportunities: [
      { id: 1, text: 'People were not reading texts and missing on mall pills at PDP', timestamp: generateTimestamp(0) },
      { id: 2, text: 'Mall colour was strongly associated and that was building associations.', timestamp: generateTimestamp(1) },
      { id: 3, text: 'People perceived mall as something coming from physical mall and those are mostly branded products.', timestamp: generateTimestamp(2) },
      { id: 4, text: 'People perceive company ka products as branded products they don\'t remember brands across all the categories.', timestamp: generateTimestamp(3) },
      { id: 5, text: 'Day to day life brands are well resonated byt they don\'t realise that they know brands.', timestamp: generateTimestamp(4) }
    ],
    painPoints: [
      { id: 1, text: 'Users find it difficult to navigate through the checkout process', timestamp: generateTimestamp(0) },
      { id: 2, text: 'Payment options are limited and cause frustration', timestamp: generateTimestamp(1) },
      { id: 3, text: 'Cart abandonment is high due to unclear pricing', timestamp: generateTimestamp(2) },
      { id: 4, text: 'Mobile app crashes during peak shopping hours', timestamp: generateTimestamp(3) }
    ]
  };

  const [researchData, setResearchData] = useState(initialData);
  const [editingCard, setEditingCard] = useState(null);
  const [editText, setEditText] = useState('');

  // Sort by newest first
  const sortedInsights = useMemo(() => 
    [...researchData.insights].sort((a, b) => b.timestamp - a.timestamp),
    [researchData.insights]
  );
  const sortedOpportunities = useMemo(() => 
    [...researchData.opportunities].sort((a, b) => b.timestamp - a.timestamp),
    [researchData.opportunities]
  );
  const sortedPainPoints = useMemo(() => 
    [...researchData.painPoints].sort((a, b) => b.timestamp - a.timestamp),
    [researchData.painPoints]
  );

  const handleCardClick = (type, item) => {
    setEditingCard({ type, id: item.id });
    setEditText(item.text);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditText('');
  };

  const handleSaveNote = async (type, item) => {
    const updatedText = editText.trim();
    if (!updatedText) return;

    // Update the item in the research data
    const updatedData = { ...researchData };
    const itemIndex = updatedData[type].findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      updatedData[type][itemIndex] = {
        ...updatedData[type][itemIndex],
        text: updatedText,
        timestamp: Date.now() // Update timestamp to newest
      };
      setResearchData(updatedData);
    }

    // TODO: Save to backend
    // Save to "My Notes" and "Research Notes"
    try {
      // await axios.post('/api/notes/save', {
      //   type: 'my-notes',
      //   category: type,
      //   text: updatedText,
      //   researchId: id
      // });
      // await axios.post('/api/notes/save', {
      //   type: 'research-notes',
      //   category: type,
      //   text: updatedText,
      //   researchId: id
      // });
      console.log('Saved to My Notes and Research Notes:', { type, text: updatedText });
    } catch (error) {
      console.error('Error saving note:', error);
    }

    setEditingCard(null);
    setEditText('');
  };

  return (
    <div className="existing-research">
      {/* Header */}
      <div className="research-header">
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
            <button className="icon-button" onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_24_609_research)">
                  <path d="M7.76807 4.56C8.83807 4.56 9.85807 5.04 10.7881 5.99C11.1081 6.31 11.5481 6.5 11.9981 6.5C12.4481 6.5 12.8881 6.32 13.2081 5.99C14.1381 5.04 15.1581 4.57 16.2281 4.57C17.8281 4.57 19.3781 5.68 20.0781 7.32C20.8081 9.04 20.4081 10.89 18.9681 12.39L12.4181 19.25C12.2681 19.4 12.1081 19.44 11.9981 19.44C11.8881 19.44 11.7281 19.41 11.5781 19.25L5.02807 12.39C3.58807 10.88 3.18807 9.03 3.91807 7.31C4.61807 5.67 6.16807 4.56 7.76807 4.56ZM7.76807 3C3.28807 3 -0.381933 8.98 3.90807 13.47L10.4581 20.33C10.8781 20.78 11.4381 21 11.9981 21C12.5581 21 13.1181 20.78 13.5381 20.33L20.0881 13.47C24.3681 8.99 20.6981 3 16.2181 3C14.8481 3 13.4081 3.56 12.0981 4.89C12.0681 4.92 12.0381 4.93 11.9981 4.93C11.9581 4.93 11.9281 4.92 11.8981 4.89C10.5881 3.56 9.13807 3 7.76807 3Z" fill="#616173"/>
                </g>
                <defs>
                  <clipPath id="clip0_24_609_research">
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
      </div>

      {/* Research Content */}
      <div className="research-content">
        <div className="research-header-section">
          <div className="research-title-row">
            <h1 className="research-title">{researchData.title}</h1>
            <button className="close-button" onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#353543" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="research-meta">
            <div className="meta-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 2H2C1.44772 2 1 2.44772 1 3V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V3C11 2.44772 10.5523 2 10 2Z" stroke="#666666" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 4H11" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
                <path d="M3 1V3" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
                <path d="M9 1V3" stroke="#666666" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span className="meta-date">{researchData.date}</span>
            </div>
            <div className="meta-row">
              <span className="meta-text">
                <strong>{researchData.userCohorts.split(' from ')[0]}</strong> from <strong>{researchData.userCohorts.split(' from ')[1]}</strong>
              </span>
              <span className="meta-methodology">{researchData.methodology}</span>
            </div>
            <div className="researcher-badges">
              {researchData.researchers.map((researcher, idx) => (
                <span key={idx} className="researcher-badge">{researcher}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Insights Section */}
        <div className="section-content">
          <h2 className="section-title">Insights</h2>
          <div className="cards-container">
            {sortedInsights.map((insight) => (
              <div
                key={insight.id}
                className={`summary-card ${editingCard?.type === 'insights' && editingCard?.id === insight.id ? 'editing' : ''}`}
                onClick={() => !editingCard && handleCardClick('insights', insight)}
              >
                {editingCard?.type === 'insights' && editingCard?.id === insight.id ? (
                  <div className="edit-mode">
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveNote('insights', insight);
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="card-text">{insight.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Opportunities Section */}
        <div className="section-content">
          <h2 className="section-title">Opportunities</h2>
          <div className="cards-container">
            {sortedOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className={`summary-card ${editingCard?.type === 'opportunities' && editingCard?.id === opportunity.id ? 'editing' : ''}`}
                onClick={() => !editingCard && handleCardClick('opportunities', opportunity)}
              >
                {editingCard?.type === 'opportunities' && editingCard?.id === opportunity.id ? (
                  <div className="edit-mode">
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveNote('opportunities', opportunity);
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="card-text">{opportunity.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Pain Points Section */}
        <div className="section-content">
          <h2 className="section-title">Pain Points</h2>
          <div className="cards-container">
            {sortedPainPoints.map((painPoint) => (
              <div
                key={painPoint.id}
                className={`summary-card ${editingCard?.type === 'painPoints' && editingCard?.id === painPoint.id ? 'editing' : ''}`}
                onClick={() => !editingCard && handleCardClick('painPoints', painPoint)}
              >
                {editingCard?.type === 'painPoints' && editingCard?.id === painPoint.id ? (
                  <div className="edit-mode">
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveNote('painPoints', painPoint);
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="card-text">{painPoint.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistingResearch;

