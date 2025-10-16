// components/TemporaryFailureCard.jsx
import React from "react";
import "../css/TemporaryFailureCard.css";

const TemporaryFailureCard = ({
  searchQuery,
  searchLocation,
  onUseMockData,
  onRetry,
}) => {
  const mockEvents = [
    {
      ticketmasterId: "mock_art_1",
      title: `${searchLocation} Contemporary Art Biennale`,
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      description: `The premier contemporary art exhibition in ${searchLocation}, featuring groundbreaking works from international artists pushing the boundaries of modern art.`,
      link: "https://ticketmaster.com",
      location: `${searchLocation} Museum of Modern Art`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_2",
      title: "Street Art Festival & Live Murals",
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      description:
        "Watch world-renowned street artists create massive murals live in the urban landscape. Includes artist talks and workshops.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Arts District`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_3",
      title: "Sculpture Garden Opening: Forms in Nature",
      start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      description:
        "Grand opening of our new sculpture garden featuring large-scale installations that interact with the natural environment and changing seasons.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Botanical Gardens`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_4",
      title: "Digital Art & Projection Mapping Experience",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      description:
        "Immersive digital art experience with cutting-edge projection mapping, interactive installations, and virtual reality art journeys.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Digital Arts Center`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_5",
      title: "Pottery Workshop: Wheel Throwing Masterclass",
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      description:
        "Comprehensive pottery workshop for all skill levels. Learn wheel throwing techniques and create your own ceramic masterpieces.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Clay Studio Collective`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_6",
      title: "Photography Exhibition: Urban Landscapes",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      description:
        "Black and white photography capturing the soul of the city through architectural details, street scenes, and urban environments.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Photography Gallery`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_7",
      title: "Printmaking Fair & Artist Market",
      start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      description:
        "Local and international printmakers showcase their work including screen printing, etching, linocut, and monoprint techniques.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Arts Factory`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_8",
      title: "Watercolor Painting in the Park",
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      description:
        "Outdoor painting session focusing on watercolor techniques inspired by nature. All skill levels welcome with materials provided.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Riverside Park Pavilion`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_9",
      title: "Glass Blowing Demonstration & Workshop",
      start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      description:
        "Watch master glass blowers create stunning pieces and participate in hands-on workshops to create your own glass art.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Glass Art Studio`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_10",
      title: "Textile Art & Fiber Sculpture Exhibition",
      start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      description:
        "Exploring the boundaries of textile art with large-scale fiber sculptures, woven installations, and contemporary fabric art.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Craft and Design Museum`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_11",
      title: "Art History Lecture Series: Modern Masters",
      start: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      description:
        "Weekly lecture series exploring the works and influences of modern art masters from Picasso to contemporary artists.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} University Art Department`,
      genre: "art",
    },
    {
      ticketmasterId: "mock_art_12",
      title: "Mixed Media Collage Workshop",
      start: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      description:
        "Create dynamic mixed media collages using found objects, paper, paint, and textiles. Explore composition and texture.",
      link: "https://ticketmaster.com",
      location: `${searchLocation} Community Arts Center`,
      genre: "art",
    },
  ];

  const filteredMockEvents = mockEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseMockData = () => {
    onUseMockData(filteredMockEvents);
  };

  return (
    <div className="temporary-failure-card">
      <div className="failure-header">
        <div className="failure-icon">🎨</div>
        <h3>Ticketmaster API Temporarily Unavailable</h3>
      </div>

      <div className="failure-content">
        <p>
          ⚠️ Note: All good here! The app is working fine — the last time we
          pulled live events from Ticketmaster was 15/10/2025. If you happen to
          see any errors while searching, that’s on Ticketmaster’s side, so just
          try again a little later. In the meantime, I’ve set up a demo so you
          can see exactly how the application would look when everything is
          working.:
        </p>

        <div className="failure-options">
          <div className="option-card">
            <h4>🎨 Explore Art Events</h4>
            <p>
              Discover {filteredMockEvents.length} art exhibitions, workshops,
              and cultural events in {searchLocation}
            </p>
            <button onClick={handleUseMockData} className="demo-button">
              Load Art Events ({filteredMockEvents.length} available)
            </button>
          </div>

          <div className="option-card">
            <h4>🔄 Try Again</h4>
            <p>The issue might be resolved now</p>
            <button onClick={onRetry} className="retry-button">
              Retry Ticketmaster Connection
            </button>
          </div>
        </div>

        <div className="failure-tips">
          <h5>Featured Art Events:</h5>
          <ul>
            <li>🎭 Contemporary Art Exhibitions</li>
            <li>🖼️ Photography & Digital Art</li>
            <li>🏺 Sculpture & 3D Art Forms</li>
            <li>🎪 Hands-on Art Workshops</li>
            <li>📚 Art History & Lectures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemporaryFailureCard;
