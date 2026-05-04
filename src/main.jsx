import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, CalendarCheck, CheckCircle2, MapPin, MessageCircle, Search, Sparkles, Star, Wallet, Send, Phone, Mail, UserCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lwjbevkozebnlkshfrrd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3amJldmtvemVibmxrc2hmcnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjgyNDAsImV4cCI6MjA5MzQ0NDI0MH0.NEy0OWpYz370TR7xDw8UKr0OKGdkXLwsFYUnYDec1QA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EMAILJS_SERVICE_ID = 'service_ixz8cn4';
const EMAILJS_TEMPLATE_ID = 'template_6uwo0lc';
const EMAILJS_PUBLIC_KEY = 'oSivgdHLY_A9E23qT';

const properties = [
  {
    id: 1,
    title: 'Downtown Dubai Sky Residence',
    location: 'Downtown Dubai, UAE',
    country: 'UAE',
    type: 'Apartment',
    price: 1850000,
    beds: 2,
    score: 98,
    tag: 'Best for serious investors',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Burj Khalifa view', 'Metro access', 'High rental demand']
  },
  {
    id: 2,
    title: 'Dubai Marina Waterfront Home',
    location: 'Dubai Marina, UAE',
    country: 'UAE',
    type: 'Apartment',
    price: 1250000,
    beds: 1,
    score: 94,
    tag: 'Better option for lifestyle buyers',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Waterfront', 'Walkable area', 'Premium amenities']
  },
  {
    id: 3,
    title: 'Abu Dhabi Family Villa',
    location: 'Saadiyat Island, UAE',
    country: 'UAE',
    type: 'Villa',
    price: 4200000,
    beds: 4,
    score: 91,
    tag: 'Best family upgrade',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Private garden', 'Near schools', 'Beach community']
  },
  {
    id: 4,
    title: 'Sharjah Smart Studio',
    location: 'Aljada, UAE',
    country: 'UAE',
    type: 'Studio',
    price: 520000,
    beds: 0,
    score: 86,
    tag: 'Budget friendly lead match',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Low entry price', 'Modern community', 'Good ROI']
  },
  {
    id: 5,
    title: 'Palm Jumeirah Signature Villa',
    location: 'Palm Jumeirah, UAE',
    country: 'UAE',
    type: 'Villa',
    price: 7800000,
    beds: 5,
    score: 89,
    tag: 'Luxury recommendation',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Private beach', 'Luxury buyer fit', 'Exclusive community']
  },
  {
    id: 6,
    title: 'Doha Pearl Residence',
    location: 'The Pearl, Qatar',
    country: 'Qatar',
    type: 'Apartment',
    price: 1450000,
    beds: 2,
    score: 84,
    tag: 'GCC alternative option',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Marina lifestyle', 'GCC market', 'Premium finish']
  }
];

const quickQuestions = [
  'I want a 2 bedroom apartment in Dubai under AED 2M',
  'Show me family villas in UAE',
  'Book a visit for Downtown Dubai',
  'Which option is better for investment?'
];

function formatAED(value) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [budget, setBudget] = useState('2000000');
  const [location, setLocation] = useState('UAE');
  const [propertyType, setPropertyType] = useState('Any');
  const [seriousBuyer, setSeriousBuyer] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  const [booking, setBooking] = useState({ name: '', email: '', phone: '', date: '', time: '11:00 AM' });
  const [bookingDone, setBookingDone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Marhaba! I am your property assistant. Tell me your budget, preferred UAE location, and property type. I will filter serious leads and suggest better options.' }
  ]);

  const filteredProperties = useMemo(() => {
    const maxBudget = Number(budget || 0);
    return properties
      .filter((item) => item.price <= maxBudget || maxBudget === 0)
      .filter((item) => location === 'All' || item.location.toLowerCase().includes(location.toLowerCase()) || item.country.toLowerCase().includes(location.toLowerCase()))
      .filter((item) => propertyType === 'Any' || item.type === propertyType)
      .sort((a, b) => b.score - a.score);
  }, [budget, location, propertyType]);

  const recommendationList = filteredProperties.length ? filteredProperties : properties.slice(0, 3);

  const leadStatus = Number(budget) >= 500000 && seriousBuyer ? 'Qualified Buyer' : 'Needs Follow-up';

  function sendMessage(text = chatInput) {
    if (!text.trim()) return;
    const userText = text.trim();
    const lower = userText.toLowerCase();
    const suggested = recommendationList[0];
    let reply = `Based on your budget and location, I recommend ${suggested.title}. It has a ${suggested.score}% match score and fits ${suggested.tag.toLowerCase()}.`;

    if (lower.includes('villa')) reply = 'For villas, the Abu Dhabi Family Villa and Palm Jumeirah Signature Villa are strong choices. If budget matters, Abu Dhabi gives better family value.';
    if (lower.includes('book') || lower.includes('visit')) reply = 'Great. Select a property card and fill the visit form. I will create the booking and show a follow-up reminder.';
    if (lower.includes('investment') || lower.includes('roi')) reply = 'For investment, Downtown Dubai Sky Residence is the strongest pick because of location demand, metro access, and high rental potential.';
    if (lower.includes('under') || lower.includes('budget')) reply = `I filtered properties under your budget. Top match: ${suggested.title}. You can change budget/location from the smart filters above.`;

    setMessages((prev) => [...prev, { role: 'user', text: userText }, { role: 'agent', text: reply }]);
    setChatInput('');
  }

  async function submitBooking(e) {
    e.preventDefault();
    setIsSending(true);
    setBookingDone(false);

    const bookingData = {
      buyer_name: booking.name.trim(),
      buyer_email: booking.email.trim(),
      buyer_phone: booking.phone.trim(),
      property_name: selectedProperty.title,
      property_location: selectedProperty.location,
      property_price: formatAED(selectedProperty.price),
      visit_date: booking.date,
      visit_time: booking.time,
      lead_status: leadStatus,
    };

    try {
      // 1. Save lead to Supabase database
      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (supabaseError) {
        throw supabaseError;
      }

      // 2. Map data for EmailJS template and send email
      const emailParams = {
        to_name: bookingData.buyer_name,
        to_email: bookingData.buyer_email,
        phone: bookingData.buyer_phone,
        property_title: bookingData.property_name,
        property_location: bookingData.property_location,
        property_price: bookingData.property_price,
        visit_date: bookingData.visit_date,
        visit_time: bookingData.visit_time,
        lead_status: bookingData.lead_status,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      );

      setBookingDone(true);
      setBooking({ name: '', email: '', phone: '', date: '', time: '11:00 AM' });
    } catch (error) {
      console.error('Booking failed:', error);
      alert(error?.message || 'Booking failed. Please check Supabase table, EmailJS template variables, and public keys.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <nav className="nav">
          <div className="brand"><Building2 /> UAE Property System</div>
          <div className="navLinks"><span>Recommendations</span><span>Booking</span><span>Chat Agent</span></div>
        </nav>
        <div className="heroGrid">
          <div className="heroContent">
            <div className="pill"><Sparkles size={18} /> Premium Property Management</div>
            <h1>Bright UAE Real Estate Property Management System</h1>
            <p>Smart system filters serious buyers, recommends better properties, schedules visits, and follows up automatically.</p>
            <div className="heroActions">
              <a href="#recommendations" className="primaryBtn">Find Properties</a>
              <a href="#chat" className="secondaryBtn">Chat with Agent</a>
            </div>
            <div className="stats">
              <div><b>98%</b><span>Match Score</span></div>
              <div><b>24/7</b><span>Lead Follow-up</span></div>
              <div><b>UAE</b><span>Market UX</span></div>
            </div>
          </div>
          <div className="heroCard">
            <img src={selectedProperty.image} alt={selectedProperty.title} />
            <div className="floatingBadge"><Star fill="currentColor" /> {selectedProperty.score}% Match Score</div>
            <h3>{selectedProperty.title}</h3>
            <p><MapPin size={16} /> {selectedProperty.location}</p>
            <h2>{formatAED(selectedProperty.price)}</h2>
          </div>
        </div>
      </section>

      <section className="filters" id="recommendations">
        <div className="sectionTitle">
          <span><Search size={18} /> Smart Buyer Filters</span>
          <h2>Budget + Location Input</h2>
        </div>
        <div className="filterGrid">
          <label>Budget AED<input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="2000000" /></label>
          <label>Location<select value={location} onChange={(e) => setLocation(e.target.value)}><option>UAE</option><option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Qatar</option><option>All</option></select></label>
          <label>Property Type<select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}><option>Any</option><option>Apartment</option><option>Villa</option><option>Studio</option></select></label>
          <button className={seriousBuyer ? 'qualifiedBtn active' : 'qualifiedBtn'} onClick={() => setSeriousBuyer(!seriousBuyer)}><UserCheck size={18} /> {seriousBuyer ? 'Serious Buyer: Yes' : 'Mark Serious Buyer'}</button>
        </div>
        <div className="leadBox"><Wallet /> Lead Status: <b>{leadStatus}</b> — {leadStatus === 'Qualified Buyer' ? 'Ready for agent contact and property visit.' : 'System will keep this lead in follow-up mode.'}</div>
      </section>

      <section className="properties">
        <div className="sectionTitle"><span><CheckCircle2 size={18} /> Recommendation System</span><h2>Smart Property Recommendations</h2></div>
        <div className="propertyGrid">
          {recommendationList.map((property) => (
            <article className="propertyCard" key={property.id} onClick={() => {
              setSelectedProperty(property);
              document.getElementById('bookingPanel')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <img src={property.image} alt={property.title} />
              <div className="cardBody">
                <div className="tag">{property.tag}</div>
                <h3>{property.title}</h3>
                <p><MapPin size={15} /> {property.location}</p>
                <div className="priceRow"><b>{formatAED(property.price)}</b><span>{property.beds === 0 ? 'Studio' : `${property.beds} Beds`}</span></div>
                <div className="chips">{property.highlights.map((h) => <span key={h}>{h}</span>)}</div>
                <button>Select for Visit</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bookingChat">
        <div className="bookingPanel" id="bookingPanel">
          <div className="sectionTitle"><span><CalendarCheck size={18} /> Booking System</span><h2>Schedule Property Visit</h2></div>
          <div className="selectedBox"><b>{selectedProperty.title}</b><span>{selectedProperty.location}</span></div>
          <form onSubmit={submitBooking}>
            <input required placeholder="Buyer Name" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
            <input required placeholder="Email" type="email" value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} />
            <input required placeholder="Phone / WhatsApp" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} />
            <div className="formRow"><input required type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} /><select value={booking.time} onChange={(e) => setBooking({ ...booking, time: e.target.value })}><option>11:00 AM</option><option>2:00 PM</option><option>5:00 PM</option><option>7:00 PM</option></select></div>
            <button className="primaryBtn full" disabled={isSending}>{isSending ? 'Sending Verification...' : 'Confirm Visit'}</button>
          </form>
          {bookingDone && <div className="successBox"><CheckCircle2 /> Visit booked successfully. The lead has been saved in Supabase and the EmailJS notification has been sent.</div>}
        </div>

        <div className="chatPanel" id="chat">
          <div className="sectionTitle"><span><MessageCircle size={18} /> Chat Interface</span><h2>Property Assistant</h2></div>
          <div className="messages">
            {messages.map((m, index) => <div key={index} className={m.role === 'agent' ? 'bubble agent' : 'bubble user'}>{m.text}</div>)}
          </div>
          <div className="quickQuestions">{quickQuestions.map((q) => <button key={q} onClick={() => sendMessage(q)}>{q}</button>)}</div>
          <div className="chatInput"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about budget, location, visits..." /><button onClick={() => sendMessage()}><Send size={18} /></button></div>
        </div>
      </section>

      <section className="followups">
        <div><Mail /><b>Email Follow-up</b><span>Auto-send property shortlist after visit booking.</span></div>
        <div><Phone /><b>WhatsApp/SMS Follow-up</b><span>Reminder message before scheduled visit.</span></div>
        <div><UserCheck /><b>Serious Buyer Filter</b><span>Only qualified leads go to agent pipeline.</span></div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
