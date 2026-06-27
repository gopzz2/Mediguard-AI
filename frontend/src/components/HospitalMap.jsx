// import { useState } from "react";

// const HOSPITAL_TYPES = [
//   { id:"all",        label:"All",        icon:"🏥" },
//   { id:"government", label:"Government", icon:"🏛️" },
//   { id:"private",    label:"Private",    icon:"🏨" },
//   { id:"emergency",  label:"Emergency",  icon:"🚨" },
//   { id:"pharmacy",   label:"Pharmacy",   icon:"💊" },
//   { id:"blood",      label:"Blood Bank", icon:"🩸" },
// ];

// const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

// const HOSPITALS = [
//   { id:1, name:"Government General Hospital", type:"government", distance:"0.8 km", rating:4.2, open:true, hours:"24/7", phone:"044-25305000", address:"Park Town, Chennai", emergency:true, beds:500, speciality:"Multi-Speciality" },
//   { id:2, name:"Apollo Hospitals", type:"private", distance:"1.2 km", rating:4.8, open:true, hours:"24/7", phone:"044-28293333", address:"Greams Road, Chennai", emergency:true, beds:300, speciality:"Super Speciality" },
//   { id:3, name:"Fortis Malar Hospital", type:"private", distance:"2.1 km", rating:4.6, open:true, hours:"24/7", phone:"044-42892222", address:"Adyar, Chennai", emergency:true, beds:180, speciality:"Cardiac Care" },
//   { id:4, name:"Stanley Medical College", type:"government", distance:"2.5 km", rating:4.0, open:true, hours:"24/7", phone:"044-25281512", address:"Old Jail Road, Chennai", emergency:true, beds:1500, speciality:"Teaching Hospital" },
//   { id:5, name:"Kauvery Hospital", type:"private", distance:"3.0 km", rating:4.7, open:true, hours:"24/7", phone:"044-40006000", address:"Radha Nagar, Chennai", emergency:true, beds:250, speciality:"Multi-Speciality" },
//   { id:6, name:"City Pharmacy", type:"pharmacy", distance:"0.3 km", rating:4.3, open:true, hours:"8AM-10PM", phone:"044-12345678", address:"Anna Nagar, Chennai", emergency:false, beds:0, speciality:"Pharmacy" },
//   { id:7, name:"MedPlus Pharmacy", type:"pharmacy", distance:"0.5 km", rating:4.1, open:true, hours:"7AM-11PM", phone:"1800-419-1999", address:"T Nagar, Chennai", emergency:false, beds:0, speciality:"Pharmacy" },
//   { id:8, name:"Government Blood Bank", type:"blood", distance:"1.5 km", rating:4.4, open:true, hours:"8AM-8PM", phone:"044-28193700", address:"Royapettah, Chennai", emergency:false, beds:0, speciality:"Blood Bank" },
//   { id:9, name:"MIOT International", type:"private", distance:"4.2 km", rating:4.9, open:true, hours:"24/7", phone:"044-42002288", address:"Manapakkam, Chennai", emergency:true, beds:400, speciality:"Orthopaedic" },
// ];

// export default function HospitalMap({ language = "English" }) {
//   const [filter, setFilter]       = useState("all");
//   const [search, setSearch]       = useState("");
//   const [bloodGroup, setBloodGroup] = useState("");
//   const [locLoading, setLocLoading] = useState(false);
//   const [location, setLocation]   = useState(null);
//   const [selected, setSelected]   = useState(null);

//   const getLocation = () => {
//     setLocLoading(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//           setLocLoading(false);
//         },
//         () => { setLocLoading(false); alert("Location access denied!"); }
//       );
//     } else {
//       setLocLoading(false);
//       alert("Geolocation not supported!");
//     }
//   };

//   const filtered = HOSPITALS.filter(h => {
//     const matchFilter = filter==="all" || h.type===filter;
//     const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
//                         h.address.toLowerCase().includes(search.toLowerCase()) ||
//                         h.speciality.toLowerCase().includes(search.toLowerCase());
//     return matchFilter && matchSearch;
//   });

//   const openDirections = (h) => {
//     const q = encodeURIComponent(`${h.name} ${h.address}`);
//     window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, "_blank");
//   };

//   const openMap = (h) => {
//     const q = encodeURIComponent(`${h.name} ${h.address}`);
//     window.open(`https://www.google.com/maps/search/${q}`, "_blank");
//   };

//   return (
//     <div>
//       <div className="card">
//         <h2 className="card-title">🗺️ Hospital & Healthcare Finder</h2>
//         <p className="card-sub">Find nearby hospitals, pharmacies, and blood banks with directions.</p>

//         <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
//           <input type="text" placeholder="🔍 Search hospital, speciality, area..."
//             value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,margin:0}}/>
//           <button className="btn btn-primary" onClick={getLocation}
//             disabled={locLoading} style={{flexShrink:0}}>
//             {locLoading ? <><span className="spinner"/> Locating...</> : <>📍 My Location</>}
//           </button>
//         </div>

//         {location && (
//           <div style={{background:"rgba(0,255,157,0.06)",border:"1px solid rgba(0,255,157,0.2)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"var(--accent2)"}}>
//             ✅ Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
//           </div>
//         )}

//         <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//           {HOSPITAL_TYPES.map(t=>(
//             <button key={t.id} className={`btn ${filter===t.id?"btn-primary":"btn-ghost"}`}
//               style={{fontSize:12,padding:"7px 14px"}} onClick={()=>setFilter(t.id)}>
//               {t.icon} {t.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Blood Group Finder */}
//       <div className="card" style={{padding:"16px 20px"}}>
//         <p style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:10}}>🩸 Blood Group Finder</p>
//         <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
//           {BLOOD_GROUPS.map(bg=>(
//             <button key={bg} className={`btn ${bloodGroup===bg?"btn-primary":"btn-ghost"}`}
//               style={{fontSize:12,padding:"6px 14px",minWidth:54}}
//               onClick={()=>{setBloodGroup(bg);setFilter("blood");}}>
//               {bg}
//             </button>
//           ))}
//         </div>
//         {bloodGroup && (
//           <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,71,87,0.06)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:8}}>
//             <p style={{fontSize:13,color:"var(--text)"}}>
//               🩸 Showing blood banks for <strong style={{color:"var(--danger)"}}>{bloodGroup}</strong> — Call to check availability
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Emergency Quick Actions */}
//       <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:16}}>
//         <button className="btn" style={{background:"var(--danger)",color:"#fff",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700}}
//           onClick={()=>window.open("tel:108")}>
//           🚨 Call 108
//         </button>
//         <button className="btn" style={{background:"rgba(0,212,255,0.15)",color:"var(--accent)",border:"1px solid rgba(0,212,255,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700}}
//           onClick={()=>window.open("tel:104")}>
//           📞 Call 104
//         </button>
//         <a href="https://www.google.com/maps/search/emergency+hospital+near+me" target="_blank" rel="noreferrer"
//           className="btn" style={{background:"rgba(255,165,2,0.15)",color:"var(--warn)",border:"1px solid rgba(255,165,2,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700,textDecoration:"none"}}>
//           📍 Emergency
//         </a>
//         <a href="https://www.google.com/maps/search/ambulance+near+me" target="_blank" rel="noreferrer"
//           className="btn" style={{background:"rgba(0,255,157,0.15)",color:"var(--accent2)",border:"1px solid rgba(0,255,157,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700,textDecoration:"none"}}>
//           🚑 Ambulance
//         </a>
//       </div>

//       {/* Hospital List */}
//       <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:12}}>
//         Showing <strong style={{color:"var(--accent)"}}>{filtered.length}</strong> results
//       </p>

//       {filtered.map(h=>(
//         <div key={h.id} className="card" style={{padding:"18px 20px",cursor:"pointer",borderColor:selected?.id===h.id?"var(--accent)":undefined,transition:"all 0.2s"}}
//           onClick={()=>setSelected(selected?.id===h.id?null:h)}>
//           <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
//             <span style={{fontSize:28,flexShrink:0}}>
//               {h.type==="pharmacy"?"💊":h.type==="blood"?"🩸":h.emergency?"🚨":"🏥"}
//             </span>
//             <div style={{flex:1}}>
//               <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:6}}>
//                 <p style={{fontFamily:"Syne",fontSize:15,fontWeight:700}}>{h.name}</p>
//                 <div style={{display:"flex",gap:6,flexShrink:0}}>
//                   <span className={`badge ${h.open?"badge-green":"badge-red"}`}>
//                     {h.open?"● Open":"● Closed"}
//                   </span>
//                   {h.emergency&&<span className="badge badge-red">🚨 Emergency</span>}
//                 </div>
//               </div>
//               <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:8}}>
//                 <span style={{fontSize:12,color:"var(--text-muted)"}}>📍 {h.distance}</span>
//                 <span style={{fontSize:12,color:"var(--warn)"}}>⭐ {h.rating}</span>
//                 <span style={{fontSize:12,color:"var(--text-muted)"}}>🕐 {h.hours}</span>
//                 <span style={{fontSize:12,color:"var(--accent)"}}>🏥 {h.speciality}</span>
//               </div>
//               <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:10}}>📮 {h.address}</p>
//               <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
//                 <button className="btn btn-primary" style={{fontSize:11,padding:"6px 14px"}}
//                   onClick={e=>{e.stopPropagation();openDirections(h);}}>
//                   🧭 Directions
//                 </button>
//                 <button className="btn btn-ghost" style={{fontSize:11,padding:"6px 14px"}}
//                   onClick={e=>{e.stopPropagation();openMap(h);}}>
//                   🗺️ View Map
//                 </button>
//                 <a href={`tel:${h.phone}`} className="btn btn-ghost"
//                   style={{fontSize:11,padding:"6px 14px",textDecoration:"none"}}
//                   onClick={e=>e.stopPropagation()}>
//                   📞 {h.phone}
//                 </a>
//               </div>
//               {selected?.id===h.id && h.beds>0 && (
//                 <div style={{marginTop:12,padding:"12px 14px",background:"rgba(0,212,255,0.04)",borderRadius:10,border:"1px solid rgba(0,212,255,0.15)"}}>
//                   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
//                     <div>
//                       <p style={{fontSize:11,color:"var(--text-muted)"}}>Total Beds</p>
//                       <p style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:"var(--accent)"}}>{h.beds}</p>
//                     </div>
//                     <div>
//                       <p style={{fontSize:11,color:"var(--text-muted)"}}>Speciality</p>
//                       <p style={{fontFamily:"Syne",fontSize:13,fontWeight:700}}>{h.speciality}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}

//       <div className="disclaimer">
//         ⚠️ Hospital data is for reference only. Always call ahead to confirm availability.
//       </div>
//     </div>
//   );
// }
import { useState } from "react";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const HOSPITAL_TYPES = [
  { id:"hospital",  label:"Hospitals",   icon:"🏥", osm:"hospital" },
  { id:"pharmacy",  label:"Pharmacy",    icon:"💊", osm:"pharmacy" },
  { id:"blood",     label:"Blood Bank",  icon:"🩸", osm:"blood_bank" },
  { id:"clinic",    label:"Clinic",      icon:"🏨", osm:"clinic" },
  { id:"emergency", label:"Emergency",   icon:"🚨", osm:"emergency" },
];

export default function HospitalMap({ language = "English" }) {
  const [filter, setFilter]         = useState("hospital");
  const [search, setSearch]         = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [loading, setLoading]       = useState(false);
  const [hospitals, setHospitals]   = useState([]);
  const [location, setLocation]     = useState(null);
  const [error, setError]           = useState("");
  const [selected, setSelected]     = useState(null);
  const [searched, setSearched]     = useState(false);

  // Get user location and fetch nearby hospitals
  const findNearby = async (type = filter) => {
    setLoading(true); setError(""); setHospitals([]); setSearched(false);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setLocation({ lat, lng });
      await fetchHospitals(lat, lng, type);
    } catch (e) {
      // If location denied, use default location (Chennai)
      setError("📍 Location access denied — showing results for Chennai. Allow location for accurate results!");
      setLocation({ lat: 13.0827, lng: 80.2707 });
      await fetchHospitals(13.0827, 80.2707, type);
    }
    setLoading(false);
  };

  // Fetch from OpenStreetMap Overpass API — 100% Free!
  const fetchHospitals = async (lat, lng, type) => {
    const radius = 5000; // 5km radius
    const osmType = HOSPITAL_TYPES.find(t => t.id === type)?.osm || "hospital";

    let query = "";
    if (osmType === "emergency") {
      query = `
        [out:json][timeout:25];
        (
          node["emergency"="yes"](around:${radius},${lat},${lng});
          node["amenity"="hospital"]["emergency"="yes"](around:${radius},${lat},${lng});
          way["amenity"="hospital"]["emergency"="yes"](around:${radius},${lat},${lng});
        );
        out body center 20;
      `;
    } else {
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="${osmType}"](around:${radius},${lat},${lng});
          way["amenity"="${osmType}"](around:${radius},${lat},${lng});
          node["healthcare"="${osmType}"](around:${radius},${lat},${lng});
        );
        out body center 20;
      `;
    }

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();

    const results = data.elements
      .filter(e => e.tags)
      .map(e => {
        const eLat = e.lat || e.center?.lat;
        const eLng = e.lon || e.center?.lon;
        const dist = eLat && eLng ? getDistance(lat, lng, eLat, eLng) : null;
        return {
          id:       e.id,
          name:     e.tags.name || e.tags["name:en"] || "Unnamed Facility",
          address:  [e.tags["addr:street"], e.tags["addr:city"]].filter(Boolean).join(", ") || "Address not available",
          phone:    e.tags.phone || e.tags["contact:phone"] || "Not available",
          type:     e.tags.amenity || e.tags.healthcare || type,
          emergency:e.tags.emergency === "yes",
          open:     e.tags.opening_hours ? !e.tags.opening_hours.includes("off") : true,
          hours:    e.tags.opening_hours || "Hours not listed",
          website:  e.tags.website || e.tags["contact:website"] || null,
          lat:      eLat,
          lng:      eLng,
          distance: dist ? `${dist.toFixed(1)} km` : "N/A",
          distNum:  dist || 999,
          speciality: e.tags.speciality || e.tags["healthcare:speciality"] || type,
        };
      })
      .sort((a,b) => a.distNum - b.distNum)
      .slice(0, 20);

    setHospitals(results);
    setSearched(true);
  };

  // Search by city name
  const searchByCity = async () => {
    if (!search.trim()) return;
    setLoading(true); setError(""); setHospitals([]); setSearched(false);
    try {
      // First geocode the city name
      const geoRes  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (geoData.length === 0) { setError("Location not found! Try a different search."); setLoading(false); return; }
      const { lat, lon: lng } = geoData[0];
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
      await fetchHospitals(parseFloat(lat), parseFloat(lng), filter);
    } catch(e) { setError("Search failed: " + e.message); }
    setLoading(false);
  };

  // Calculate distance between 2 coordinates (Haversine formula)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R    = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLng = (lng2-lng1) * Math.PI/180;
    const a    = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const openDirections = (h) => {
    if (h.lat && h.lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`, "_blank");
    else window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name)}`, "_blank");
  };

  const openMap = (h) => {
    if (h.lat && h.lng) window.open(`https://www.google.com/maps?q=${h.lat},${h.lng}`, "_blank");
    else window.open(`https://www.google.com/maps/search/${encodeURIComponent(h.name)}`, "_blank");
  };

  const filteredHospitals = hospitals.filter(h =>
    !search.trim() || h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="card">
        <h2 className="card-title">🗺️ Hospital & Healthcare Finder</h2>
        <p className="card-sub">
          Find real nearby hospitals using live OpenStreetMap data — 100% free, works anywhere in the world!
        </p>

        {/* Search + Location */}
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <input type="text" placeholder="🔍 Search by city, area (e.g. Chennai, Mumbai, Delhi...)"
            value={search} onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&searchByCity()}
            style={{flex:1,margin:0}}/>
          <button className="btn btn-ghost" style={{flexShrink:0}} onClick={searchByCity} disabled={loading}>
            🔍 Search
          </button>
          <button className="btn btn-primary" style={{flexShrink:0}} onClick={()=>findNearby(filter)} disabled={loading}>
            {loading ? <><span className="spinner"/> Finding...</> : <>📍 Near Me</>}
          </button>
        </div>

        {/* Type Filter */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
          {HOSPITAL_TYPES.map(t=>(
            <button key={t.id}
              className={`btn ${filter===t.id?"btn-primary":"btn-ghost"}`}
              style={{fontSize:12,padding:"7px 14px"}}
              onClick={()=>{setFilter(t.id); if(location) fetchHospitals(location.lat,location.lng,t.id).then(()=>setLoading(false));}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Info */}
      {location && (
        <div style={{background:"rgba(0,255,157,0.06)",border:"1px solid rgba(0,255,157,0.2)",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:12,color:"var(--accent2)",display:"flex",alignItems:"center",gap:8}}>
          ✅ Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)} —
          <a href={`https://www.google.com/maps/search/${HOSPITAL_TYPES.find(t=>t.id===filter)?.label}/@${location.lat},${location.lng},14z`}
            target="_blank" rel="noreferrer" style={{color:"var(--accent)",textDecoration:"underline"}}>
            View on Google Maps
          </a>
        </div>
      )}

      {/* Error */}
      {error && <div className="disclaimer" style={{marginBottom:14}}>⚠️ {error}</div>}

      {/* Blood Group Finder */}
      <div className="card" style={{padding:"16px 20px"}}>
        <p style={{fontFamily:"Syne",fontSize:14,fontWeight:700,marginBottom:10}}>🩸 Blood Bank Finder</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {BLOOD_GROUPS.map(bg=>(
            <button key={bg}
              className={`btn ${bloodGroup===bg?"btn-primary":"btn-ghost"}`}
              style={{fontSize:12,padding:"6px 14px",minWidth:52}}
              onClick={()=>{setBloodGroup(bg);setFilter("blood");findNearby("blood");}}>
              {bg}
            </button>
          ))}
        </div>
        {bloodGroup && (
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,71,87,0.06)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:8}}>
            <p style={{fontSize:13,color:"var(--text)"}}>
              🩸 Searching blood banks near you for <strong style={{color:"var(--danger)"}}>{bloodGroup}</strong> — Call to confirm availability
            </p>
          </div>
        )}
      </div>

      {/* Emergency Quick Actions */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        <button className="btn" style={{background:"var(--danger)",color:"#fff",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700}}
          onClick={()=>window.open("tel:108")}>
          🚨 Call 108
        </button>
        <button className="btn" style={{background:"rgba(0,212,255,0.15)",color:"var(--accent)",border:"1px solid rgba(0,212,255,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700}}
          onClick={()=>window.open("tel:104")}>
          📞 Call 104
        </button>
        <a href="https://www.google.com/maps/search/emergency+hospital+near+me" target="_blank" rel="noreferrer"
          className="btn" style={{background:"rgba(255,165,2,0.15)",color:"var(--warn)",border:"1px solid rgba(255,165,2,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700,textDecoration:"none"}}>
          📍 Emergency
        </a>
        <a href="https://www.google.com/maps/search/ambulance+near+me" target="_blank" rel="noreferrer"
          className="btn" style={{background:"rgba(0,255,157,0.15)",color:"var(--accent2)",border:"1px solid rgba(0,255,157,0.3)",justifyContent:"center",padding:"14px",borderRadius:12,fontFamily:"Syne",fontWeight:700,textDecoration:"none"}}>
          🚑 Ambulance
        </a>
      </div>

      {/* Initial state */}
      {!searched && !loading && (
        <div className="card" style={{textAlign:"center",padding:"40px"}}>
          <p style={{fontSize:48,marginBottom:16}}>🗺️</p>
          <p style={{fontFamily:"Syne",fontSize:16,fontWeight:700,marginBottom:8}}>Find Hospitals Near You</p>
          <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:20}}>
            Click "Near Me" to find real hospitals near your location,<br/>
            or search by city name!
          </p>
          <button className="btn btn-primary" style={{margin:"0 auto"}} onClick={()=>findNearby(filter)}>
            📍 Find Hospitals Near Me
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{textAlign:"center",padding:"40px"}}>
          <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
          <p style={{marginTop:16,color:"var(--text-muted)",fontSize:13}}>
            Fetching real hospitals from OpenStreetMap...
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:12}}>
            Found <strong style={{color:"var(--accent)"}}>{filteredHospitals.length}</strong> {filter}s nearby
            {location && ` within 5km`}
          </p>

          {filteredHospitals.length === 0 && (
            <div className="card" style={{textAlign:"center",padding:"30px"}}>
              <p style={{fontSize:32,marginBottom:10}}>🏥</p>
              <p style={{color:"var(--text-muted)"}}>No {filter}s found nearby. Try increasing search area or different type.</p>
            </div>
          )}

          {filteredHospitals.map(h => (
            <div key={h.id} className="card" style={{padding:"18px 20px",cursor:"pointer",borderColor:selected?.id===h.id?"var(--accent)":undefined,transition:"all 0.2s"}}
              onClick={()=>setSelected(selected?.id===h.id?null:h)}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <span style={{fontSize:28,flexShrink:0}}>
                  {h.type==="pharmacy"?"💊":h.type==="blood_bank"?"🩸":h.emergency?"🚨":"🏥"}
                </span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:6}}>
                    <p style={{fontFamily:"Syne",fontSize:15,fontWeight:700}}>{h.name}</p>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <span className={`badge ${h.open?"badge-green":"badge-red"}`}>
                        {h.open?"● Open":"● Closed"}
                      </span>
                      {h.emergency && <span className="badge badge-red">🚨 Emergency</span>}
                    </div>
                  </div>

                  <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:8}}>
                    {h.distance!=="N/A" && <span style={{fontSize:12,color:"var(--accent2)"}}>📍 {h.distance}</span>}
                    <span style={{fontSize:12,color:"var(--text-muted)"}}>🕐 {h.hours}</span>
                    {h.speciality && <span style={{fontSize:12,color:"var(--accent)"}}>🏥 {h.speciality}</span>}
                  </div>

                  <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:10}}>
                    📮 {h.address}
                  </p>

                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button className="btn btn-primary" style={{fontSize:11,padding:"6px 14px"}}
                      onClick={e=>{e.stopPropagation();openDirections(h);}}>
                      🧭 Directions
                    </button>
                    <button className="btn btn-ghost" style={{fontSize:11,padding:"6px 14px"}}
                      onClick={e=>{e.stopPropagation();openMap(h);}}>
                      🗺️ View Map
                    </button>
                    {h.phone !== "Not available" && (
                      <a href={`tel:${h.phone}`} className="btn btn-ghost"
                        style={{fontSize:11,padding:"6px 14px",textDecoration:"none"}}
                        onClick={e=>e.stopPropagation()}>
                        📞 Call
                      </a>
                    )}
                    {h.website && (
                      <a href={h.website} target="_blank" rel="noreferrer"
                        className="btn btn-ghost"
                        style={{fontSize:11,padding:"6px 14px",textDecoration:"none"}}
                        onClick={e=>e.stopPropagation()}>
                        🌐 Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="disclaimer">
        ⚠️ Hospital data from OpenStreetMap. Always call ahead to confirm availability and timings.
      </div>
    </div>
  );
}