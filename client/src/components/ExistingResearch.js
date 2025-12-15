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
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L13.09 8.26L20 9.27L14 13.14L15.18 20.02L11 16.77L6.82 20.02L8 13.14L2 9.27L8.91 8.26L11 2Z" stroke="#333" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7258 7.34056C12.1397 7.32632 12.4638 6.97919 12.4495 6.56522C12.4353 6.15125 12.0882 5.8272 11.6742 5.84144L11.7258 7.34056ZM7.15843 11.562L6.40879 11.585C6.40906 11.5938 6.40948 11.6026 6.41006 11.6114L7.15843 11.562ZM5.87826 14.979L6.36787 15.5471C6.38128 15.5356 6.39428 15.5236 6.40684 15.5111L5.87826 14.979ZM5.43951 15.342L5.88007 15.949C5.89245 15.94 5.90455 15.9306 5.91636 15.9209L5.43951 15.342ZM9.74998 17.75C10.1642 17.75 10.5 17.4142 10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25V17.75ZM11.7258 5.84144C11.3118 5.8272 10.9647 6.15125 10.9504 6.56522C10.9362 6.97919 11.2602 7.32632 11.6742 7.34056L11.7258 5.84144ZM16.2415 11.562L16.9899 11.6113C16.9905 11.6025 16.9909 11.5938 16.9912 11.585L16.2415 11.562ZM17.5217 14.978L16.9931 15.5101C17.0057 15.5225 17.0187 15.5346 17.0321 15.5461L17.5217 14.978ZM17.9605 15.341L17.4836 15.9199C17.4952 15.9294 17.507 15.9386 17.5191 15.9474L17.9605 15.341ZM13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17C12.9 17.4142 13.2358 17.75 13.65 17.75V16.25ZM10.95 6.591C10.95 7.00521 11.2858 7.341 11.7 7.341C12.1142 7.341 12.45 7.00521 12.45 6.591H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17C8.99998 17.4142 9.33577 17.75 9.74998 17.75V16.25ZM13.65 17.75C14.0642 17.75 14.4 17.4142 14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25V17.75ZM10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17H10.5ZM14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17H14.4ZM11.6742 5.84144C8.65236 5.94538 6.31509 8.53201 6.40879 11.585L7.90808 11.539C7.83863 9.27613 9.56498 7.41488 11.7258 7.34056L11.6742 5.84144ZM6.41006 11.6114C6.48029 12.6748 6.08967 13.7118 5.34968 14.4469L6.40684 15.5111C7.45921 14.4656 8.00521 13.0026 7.9068 11.5126L6.41006 11.6114ZM5.38865 14.4109C5.23196 14.5459 5.10026 14.6498 4.96265 14.7631L5.91636 15.9209C6.0264 15.8302 6.195 15.6961 6.36787 15.5471L5.38865 14.4109ZM4.99895 14.735C4.77969 14.8942 4.58045 15.1216 4.43193 15.3617C4.28525 15.5987 4.14491 15.9178 4.12693 16.2708C4.10726 16.6569 4.24026 17.0863 4.63537 17.3884C4.98885 17.6588 5.45464 17.75 5.94748 17.75V16.25C5.78415 16.25 5.67611 16.234 5.60983 16.2171C5.54411 16.2004 5.53242 16.1861 5.54658 16.1969C5.56492 16.211 5.59211 16.2408 5.61004 16.2837C5.62632 16.3228 5.62492 16.3484 5.62499 16.3472C5.62513 16.3443 5.62712 16.3233 5.6414 16.2839C5.65535 16.2454 5.67733 16.1997 5.70749 16.151C5.73748 16.1025 5.77159 16.0574 5.80538 16.0198C5.84013 15.981 5.86714 15.9583 5.88007 15.949L4.99895 14.735ZM5.94748 17.75H9.74998V16.25H5.94748V17.75ZM11.6742 7.34056C13.835 7.41488 15.5613 9.27613 15.4919 11.539L16.9912 11.585C17.0849 8.53201 14.7476 5.94538 11.7258 5.84144L11.6742 7.34056ZM15.4932 11.5127C15.3951 13.0024 15.9411 14.4649 16.9931 15.5101L18.0503 14.4459C17.3105 13.711 16.9199 12.6744 16.9899 11.6113L15.4932 11.5127ZM17.0321 15.5461C17.205 15.6951 17.3736 15.8292 17.4836 15.9199L18.4373 14.7621C18.2997 14.6488 18.168 14.5449 18.0113 14.4099L17.0321 15.5461ZM17.5191 15.9474C17.5325 15.9571 17.5599 15.9802 17.5949 16.0193C17.629 16.0573 17.6634 16.1026 17.6937 16.1514C17.7241 16.2004 17.7463 16.2463 17.7604 16.285C17.7748 16.3246 17.7769 16.3457 17.777 16.3485C17.7771 16.3497 17.7756 16.3238 17.792 16.2844C17.81 16.241 17.8375 16.211 17.856 16.1968C17.8702 16.1859 17.8585 16.2002 17.7925 16.217C17.7259 16.234 17.6174 16.25 17.4535 16.25V17.75C17.9468 17.75 18.4132 17.6589 18.7669 17.3885C19.1628 17.0859 19.2954 16.6557 19.2749 16.2693C19.2562 15.9161 19.1151 15.5972 18.9682 15.3604C18.8194 15.1206 18.6202 14.8936 18.4018 14.7346L17.5191 15.9474ZM17.4535 16.25H13.65V17.75H17.4535V16.25ZM12.45 6.591V5H10.95V6.591H12.45ZM9.74998 17.75H13.65V16.25H9.74998V17.75ZM8.99998 17C8.99998 18.5008 10.191 19.75 11.7 19.75V18.25C11.055 18.25 10.5 17.7084 10.5 17H8.99998ZM11.7 19.75C13.2089 19.75 14.4 18.5008 14.4 17H12.9C12.9 17.7084 12.3449 18.25 11.7 18.25V19.75Z" fill="#333"/>
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

