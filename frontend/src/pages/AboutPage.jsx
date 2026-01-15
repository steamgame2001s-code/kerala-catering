import React from 'react';
import axios from '../api/axiosConfig';

const AboutPage = () => {
  // Track user actions
  const trackAction = async (type, additionalData = {}) => {
    try {
      await axios.post('/actions/log', {
        type,
        page: window.location.pathname,
        ...additionalData
      });
    } catch (error) {
      console.error('Error tracking action:', error);
      // Fail silently - don't disrupt user experience
    }
  };

  const openGoogleMaps = () => {
    const latitude = 9.810562901169162;
    const longitude = 76.31187137902629;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:upasanacatering@gmail.com';
  };

  const handlePhoneClick = () => {
    // Track Call click
    trackAction('call', {
      userInfo: 'About Page Phone Button'
    });
    
    window.location.href = 'tel:+919447975836';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-24 px-6 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Changed text-white here */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center text-white">
            About Upasana Catering
          </h1>
          <p className="text-xl md:text-2xl text-center mb-12">Preserving Kerala's Culinary Heritage Since 1998</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center bg-white rounded-xl p-8 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl font-bold mb-2 text-orange-600">25+</div>
              <div className="text-lg text-gray-700 font-semibold">Years of Excellence</div>
            </div>
            <div className="text-center bg-white rounded-xl p-8 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl font-bold mb-2 text-orange-600">10,000+</div>
              <div className="text-lg text-gray-700 font-semibold">Events Catered</div>
            </div>
            <div className="text-center bg-white rounded-xl p-8 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl font-bold mb-2 text-orange-600">10+</div>
              <div className="text-lg text-gray-700 font-semibold">Expert Chefs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                Founded in 1998 in the heart of Kerala, <span className="font-semibold text-gray-900">Upasana Catering</span> was established by <span className="font-semibold text-gray-900">Mr. J. R. Ajith</span> with a clear vision—to deliver authentic Kerala cuisine prepared with care, consistency, and respect for tradition. What began as a small, dedicated kitchen has steadily grown into a trusted catering service known across Kerala.
              </p>

              <p className="text-lg">
                In its early years, Upasana Catering operated with a limited team and a strong focus on quality and authenticity. Through dedication, attention to detail, and word-of-mouth reputation, Mr. Ajith successfully built the brand, catering to a wide range of events including family functions, corporate gatherings, and wedding ceremonies.
              </p>

              <p className="text-lg">
                Over the years, Upasana Catering has proudly served more than <span className="font-semibold text-gray-900">10,000 events</span> across Kerala, earning the trust of clients through consistent service, traditional flavors, and professional execution.
              </p>

              <p className="text-lg">
                The business entered its next phase of growth when <span className="font-semibold text-gray-900">Arun A.</span>, son of Mr. J. R. Ajith, joined the organization in 2015. Bringing a modern perspective to operations and customer engagement, Arun A. works closely with the founder to strengthen the brand while maintaining the values and standards established since inception.
              </p>

              <p className="text-lg">
                Today, operating from Kochi, Upasana Catering continues to blend time-tested culinary practices with contemporary service expectations—ensuring every event reflects quality, authenticity, and reliability.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To deliver authentic Kerala cuisine with uncompromising quality, consistency, and customer satisfaction.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border-2 border-orange-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To be Kerala's most trusted catering service, known for tradition, professionalism, and excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Specialized Services</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">
              Catering to Kerala's traditional celebrations and modern events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "💍", title: "Wedding & Engagement", desc: "Complete wedding catering with traditional sadhya, engagement ceremonies, and pre-wedding functions." },
              { icon: "🏡", title: "Housewarming Ceremonies", desc: "Traditional Grihapravesam catering with authentic Kerala feast for your new home celebration." },
              { icon: "🎂", title: "Birthday Celebrations", desc: "Special menus for milestone birthdays, children's parties, and family celebrations." },
              { icon: "🙏", title: "Religious Functions", desc: "Catering for temple festivals, poojas, annaprashan, and other religious ceremonies." },
              { icon: "👨‍👩‍👧‍👦", title: "Family Gatherings", desc: "Family reunions, anniversaries, get-togethers, and special family occasions." },
              { icon: "🎓", title: "Corporate Events", desc: "Office parties, conferences, corporate celebrations, and team building events." },
              { icon: "🍽️", title: "Traditional Sadhya", desc: "Authentic Kerala feast served on banana leaves with 21+ items for special occasions." },
              { icon: "🌶️", title: "Festival Specials", desc: "Special menus for Onam, Vishu, Christmas, Ramadan, and other Kerala festivals." }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Commitment to Excellence</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: "🧼",
                title: "Hygiene & Cleanliness",
                items: [
                  "FDA-approved kitchen facilities",
                  "Regular health inspections and certifications",
                  "Daily staff hygiene training",
                  "Sanitized equipment and cooking utensils",
                  "Separate vegetarian and non-vegetarian sections"
                ]
              },
              {
                icon: "🥬",
                title: "Ingredient Quality",
                items: [
                  "Fresh and Seasonal: Daily market visits for fresh produce",
                  "Locally Sourced: Vegetables from local farmers",
                  "Premium Spices: Authentic Kerala spices from trusted suppliers",
                  "Chemical-Free: No preservatives or artificial additives",
                  "Traditional Methods: Stone grinding for authentic flavors"
                ]
              },
              {
                icon: "👨‍🍳",
                title: "Food Preparation Practices",
                items: [
                  "Traditional cooking methods preserved",
                  "Time-tested family recipes",
                  "Fresh preparation for each event",
                  "Temperature-controlled cooking",
                  "Expert chefs with 10+ years experience"
                ]
              },
              {
                icon: "❄️",
                title: "Proper Storage & Handling",
                items: [
                  "Refrigerated storage for perishables",
                  "Dry storage with humidity control",
                  "First-in-first-out inventory system",
                  "Regular temperature monitoring",
                  "Hygienic food packing and transport"
                ]
              }
            ].map((quality, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 shadow-lg border-2 border-orange-200">
                <div className="flex items-start mb-6">
                  <div className="text-5xl mr-4">{quality.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{quality.title}</h3>
                </div>
                <ul className="space-y-3">
                  {quality.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="text-orange-600 mr-3 mt-1 font-bold">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">
              Guided by family legacy and culinary expertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border-2 border-orange-200 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-7xl mb-6 text-center">👨‍🍳</div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">J.R. Ajith</h3>
              <p className="text-orange-600 font-semibold text-center mb-6">Founder & Master Chef (Third Generation)</p>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Continuing a family culinary tradition, Mr. Ajith represents the third generation of chefs in his family. With decades of experience, he founded Upasana Catering in 1998 to share authentic Kerala recipes.
                </p>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-900">Family Legacy:</span> Continuing a culinary tradition passed through generations
                </p>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-900">Specialties:</span> Traditional Sadhya, Wedding Feasts, Religious Ceremony Catering
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 border-2 border-orange-200 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-7xl mb-6 text-center">👨‍💼</div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Arun A.</h3>
              <p className="text-orange-600 font-semibold text-center mb-6">Director & Operations Head (Fourth Generation)</p>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  As the son of founder J.R. Ajith, he represents the fourth generation of the family's culinary tradition. Joining the family business in 2015, he bridges traditional culinary arts with modern catering management.
                </p>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-900">Role:</span> Combines family recipes with contemporary business practices
                </p>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-900">Focus:</span> Business Development, Client Relations, Modern Catering Solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Changed text-white here */}
          <h2 className="text-4xl font-bold mb-4 text-white">
            Experience Authentic Kerala Catering
          </h2>
          <p className="text-xl mb-12">
            From traditional sadhya to customized menus, we bring Kerala's rich culinary heritage to your celebration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button 
              onClick={openGoogleMaps}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📍</div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Location</h4>
            </button>

            <button 
              onClick={handlePhoneClick}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📞</div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Phone</h4>
            </button>

            <button 
              onClick={handleEmailClick}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📧</div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Email</h4>
            </button>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-3">⏰</div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Service Hours</h4>
              <p className="text-gray-700">24/7 Catering Service</p>
              <p className="text-sm text-gray-500 mt-2">Available for all events</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;