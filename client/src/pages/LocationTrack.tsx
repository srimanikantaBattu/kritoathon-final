import { useState, useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

const LocationTracker = () => {
  // Karimnagar and Hyderabad coordinates
  const KARIMNAGAR_LAT = 18.4386;
  const KARIMNAGAR_LNG = 79.1288;
  const HYDERABAD_LAT = 17.3850;
  const HYDERABAD_LNG = 78.4867;
  
  const [targetLocation, setTargetLocation] = useState<Location | null>({
    lat: KARIMNAGAR_LAT,
    lng: KARIMNAGAR_LNG,
    timestamp: Date.now(),
  });
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [path, setPath] = useState<google.maps.Polyline | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [routePoints, setRoutePoints] = useState<google.maps.LatLng[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  
  // Load Google Maps API
  useEffect(() => {
    const scriptId = 'google-maps-script';
    
    // Check if script is already loaded
    if (document.getElementById(scriptId)) {
      setIsApiLoaded(true);
      return;
    }

    // Check if google is already available
    if (window.google) {
      setIsApiLoaded(true);
      return;
    }

    const loadGoogleMapsAPI = () => {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAB_lzF8wWxOa4addSjkkKnjwuJKDRZ3Fo&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsApiLoaded(true);
      script.onerror = () => setError('Failed to load Google Maps API');
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();

    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newUserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
        };
        
        setUserLocation(newUserLocation);
        
        // If user marker exists, update its position
        if (userMarker && map) {
          userMarker.setPosition({
            lat: newUserLocation.lat,
            lng: newUserLocation.lng
          });
        }
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
      }
    );
  };

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || map) return;

    const defaultCenter = { lat: KARIMNAGAR_LAT, lng: KARIMNAGAR_LNG };
    
    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 9,
      center: defaultCenter,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
    });
    
    setMap(newMap);
    
    // Create marker for target (moving from Karimnagar to Hyderabad)
    const newMarker = new window.google.maps.Marker({
      position: defaultCenter,
      map: newMap,
      title: 'Target Location',
      icon: {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 1,
        scale: 5,
        rotation: 180, // South direction by default
      },
    });
    
    setMarker(newMarker);
    
    // Create path for tracking movement history
    const newPath = new window.google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map: newMap,
    });
    
    setPath(newPath);
    
    // Initialize DirectionsService
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    
    // Create DirectionsRenderer for the route
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#0000FF',
        strokeOpacity: 0.5,
        strokeWeight: 4,
      }
    });
    
    setRoutePath(directionsRenderer);
    
    // Create bounds to fit both locations
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: KARIMNAGAR_LAT, lng: KARIMNAGAR_LNG });
    bounds.extend({ lat: HYDERABAD_LAT, lng: HYDERABAD_LNG });
    newMap.fitBounds(bounds);
    
    // Get user location and create marker
    getUserLocation();
  }, [isApiLoaded]);
  
  // Create user marker when user location is available
  useEffect(() => {
    if (!map || !userLocation) return;
    
    if (!userMarker) {
      const newUserMarker = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 7,
        },
      });
      
      setUserMarker(newUserMarker);
      
      // Add user location to bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: KARIMNAGAR_LAT, lng: KARIMNAGAR_LNG });
      bounds.extend({ lat: HYDERABAD_LAT, lng: HYDERABAD_LNG });
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      map.fitBounds(bounds);
    }
  }, [map, userLocation, userMarker]);

  // Get directions between Karimnagar and Hyderabad
  const getDirections = () => {
    if (!directionsServiceRef.current || !routePath) return;
    
    setIsLoadingRoute(true);
    
    const origin = new window.google.maps.LatLng(KARIMNAGAR_LAT, KARIMNAGAR_LNG);
    const destination = new window.google.maps.LatLng(HYDERABAD_LAT, HYDERABAD_LNG);
    
    directionsServiceRef.current.route({
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
      avoidHighways: false,
      avoidTolls: false,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK && result) {
        // Display the route on the map
        routePath.setDirections(result);
        
        // Extract the path points from the route
        const route = result.routes[0];
        const routeLegs = route.legs[0];
        const routeSteps = routeLegs.steps;
        
        // Calculate total distance and duration
        setRouteDistance(routeLegs.distance?.value || 0);
        setRouteDuration(routeLegs.duration?.value || 0);
        
        // Extract all path points
        const points: google.maps.LatLng[] = [];
        
        routeSteps.forEach(step => {
          const pathPoints = step.path;
          points.push(...pathPoints);
        });
        
        setRoutePoints(points);
        setIsLoadingRoute(false);
      } else {
        setError(`Directions request failed: ${status}`);
        setIsLoadingRoute(false);
      }
    });
  };

  // Update map when target location changes
  useEffect(() => {
    if (!map || !marker || !targetLocation || !path) return;

    const position = { lat: targetLocation.lat, lng: targetLocation.lng };
    
    marker.setPosition(position);
    if (targetLocation.heading !== undefined) {
      marker.setIcon({
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 1,
        scale: 5,
        rotation: targetLocation.heading,
      });
    }
    
    // Add location to history and update path
    setLocationHistory(prev => {
      const newHistory = [...prev, targetLocation];
      if (newHistory.length > 100) {
        // Keep only the last 100 points to prevent performance issues
        return newHistory.slice(-100);
      }
      return newHistory;
    });
    
    // Update the path visualization
    const recentHistory = locationHistory.slice(-99).concat(targetLocation);
    const pathCoords = recentHistory.map(loc => ({ lat: loc.lat, lng: loc.lng }));
    path.setPath(pathCoords);
    
  }, [targetLocation, map, marker, path]);

  // Calculate heading between two points
  const calculateHeading = (start: google.maps.LatLng, end: google.maps.LatLng) => {
    if (!window.google) return 0;
    
    return window.google.maps.geometry.spherical.computeHeading(start, end);
  };

  // Animate movement along the route
  const animateAlongRoute = (timestamp: number) => {
    if (!isConnected || routePoints.length === 0) return;
    
    // Update progress
    setProgress(prev => {
      // Slower progression for a more realistic journey
      const newProgress = prev + 0.0005;
      return newProgress > 1 ? 1 : newProgress;
    });
    
    animationRef.current = requestAnimationFrame(animateAlongRoute);
  };

  // Start/stop animation based on connection status
  useEffect(() => {
    if (isConnected) {
      if (routePoints.length === 0) {
        // Get directions first if we don't have route points
        getDirections();
      } else {
        // Reset progress if starting fresh
        setProgress(0);
        setLocationHistory([]);
        
        // Start animation
        animationRef.current = requestAnimationFrame(animateAlongRoute);
      }
    } else {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isConnected, routePoints.length]);

  // After directions are loaded, start animation if needed
  useEffect(() => {
    if (isConnected && routePoints.length > 0 && !animationRef.current) {
      // Reset progress
      setProgress(0);
      setLocationHistory([]);
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateAlongRoute);
    }
  }, [routePoints.length, isConnected]);

  // Update target location based on progress
  useEffect(() => {
    if (!isConnected || routePoints.length === 0) return;
    
    // Calculate current point index based on progress
    const pointIndex = Math.min(
      Math.floor(progress * (routePoints.length - 1)),
      routePoints.length - 2
    );
    
    // Get current point and next point
    const currentPoint = routePoints[pointIndex];
    const nextPoint = routePoints[pointIndex + 1];
    
    // Calculate sub-progress within this segment
    const segmentProgress = (progress * (routePoints.length - 1)) - pointIndex;
    
    // Interpolate position between current and next point
    const position = window.google.maps.geometry.spherical.interpolate(
      currentPoint,
      nextPoint,
      segmentProgress
    );
    
    // Calculate heading
    const heading = calculateHeading(currentPoint, nextPoint);
    
    // Calculate speed (assuming average speed of 60km/h, but could be variable)
    // In a real application, you could vary speed based on road type
    const speed = 60;
    
    const newLocation = {
      lat: position.lat(),
      lng: position.lng(),
      timestamp: Date.now(),
      heading: heading,
      speed: speed,
    };
    
    setTargetLocation(newLocation);
    
  }, [progress, routePoints, isConnected]);

  // Connect/disconnect tracker
  const connectToTracker = () => {
    if (isConnected) {
      setIsConnected(false);
      return;
    }

    // Get user location if needed
    if (!userLocation) {
      getUserLocation();
    }
    
    // If we don't have route points yet, they'll be fetched when isConnected becomes true
    setIsConnected(true);
  };

  if (!isApiLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div className="location-tracker">
      <div className="map-container" ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
      
      <div className="controls" style={{ padding: '1rem' }}>
        <button 
          onClick={connectToTracker} 
          disabled={isLoadingRoute}
          className={`tracking-button ${isConnected ? 'active' : ''}`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isConnected ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoadingRoute ? 'not-allowed' : 'pointer',
            marginRight: '1rem',
            opacity: isLoadingRoute ? 0.7 : 1,
          }}
        >
          {isLoadingRoute ? "Loading Route..." : 
           isConnected ? "Stop Tracker" : 
           "Start Journey: Karimnagar to Hyderabad"}
        </button>
        
        <button
          onClick={getUserLocation}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Update My Location
        </button>
        
        {routeDistance > 0 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            <strong>Route:</strong> {(routeDistance / 1000).toFixed(1)} km • 
            Approx. {Math.round(routeDuration / 60)} mins drive
          </div>
        )}
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '12px' }}>
            <div 
              style={{ 
                width: `${progress * 100}%`, 
                backgroundColor: '#4CAF50', 
                height: '100%', 
                borderRadius: '4px',
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Karimnagar</span>
            <span>Hyderabad</span>
          </div>
        </div>
        
        {targetLocation && (
          <div className="location-info" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Target Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div>
                <strong>Latitude:</strong> {targetLocation.lat.toFixed(6)}
              </div>
              <div>
                <strong>Longitude:</strong> {targetLocation.lng.toFixed(6)}
              </div>
              <div>
                <strong>Last Update:</strong> {new Date(targetLocation.timestamp).toLocaleTimeString()}
              </div>
              <div>
                <strong>Speed:</strong> {targetLocation.speed ? `${targetLocation.speed.toFixed(1)} km/h` : 'N/A'}
              </div>
              <div>
                <strong>Heading:</strong> {targetLocation.heading !== undefined ? `${targetLocation.heading.toFixed(0)}°` : 'N/A'}
              </div>
              <div>
                <strong>Journey:</strong> {(progress * 100).toFixed(1)}% complete
              </div>
            </div>
          </div>
        )}
        
        {userLocation && (
          <div className="user-location-info" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Your Location</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div>
                <strong>Latitude:</strong> {userLocation.lat.toFixed(6)}
              </div>
              <div>
                <strong>Longitude:</strong> {userLocation.lng.toFixed(6)}
              </div>
              <div>
                <strong>Last Update:</strong> {new Date(userLocation.timestamp).toLocaleTimeString()}
              </div>
              <div>
                <strong>Accuracy:</strong> {userLocation.accuracy ? `±${userLocation.accuracy.toFixed(1)} meters` : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message" style={{
          padding: '1rem',
          backgroundColor: '#ffebee',
          color: '#c62828',
          margin: '1rem',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationTracker;