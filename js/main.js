var map;

// Create a new blank array for all the listing markers
var markers = [];

var imageUrl = 'https://farm9.staticflickr.com/8105/28752586140_b29607b0b2.jpg';

function AppViewModel() {
  var self = this;
  self.listings = [
    {title: 'Mount Zion Coffee', location: {lat: 50.215332, lng: -5.477701}, type: 'coffee'},
    {title: 'The Pier Coffee Bar', location: {lat: 50.215524, lng: -5.476800}, type: 'coffee'},
    {title: 'The Coffee Lounge', location: {lat: 50.211323, lng: -5.479729}, type: 'coffee'},
    {title: 'Yellow Canary', location: {lat: 50.213087, lng: -5.480501}, type: 'coffee'},
    {title: 'The Hub', location: {lat: 50.213322, lng: -5.479873}, type: 'coffee'},
    {title: 'Porthmeor Beach Cafe', location: {lat: 50.215052, lng: -5.482913}, type: 'coffee'},
    {title: 'Tate Gallery', location: {lat: 50.214851, lng: -5.481918}, type: 'art'},
    {title: 'Porthminster Gallery', location: {lat: 50.211720, lng:  -5.478527}, type: 'art'},
    {title: 'Imagianation Gallery', location: {lat: 50.214487, lng: -5.478946}, type: 'art'},
    {title: 'Newstatesman Gallery', location: {lat: 50.213759, lng: -5.480480}, type: 'art'},
    {title: 'Whistlefish Gallery', location: {lat: 50.214652, lng: -5.479557}, type: 'art'},
    {title: 'Belgrave Gallery', location: {lat: 50.213447, lng: -5.480394}, type: 'art'},
    {title: 'Porthmeor Beach', location: {lat: 50.215620, lng: -5.482216}, type: 'beach'},
    {title: 'St Ives Harbour Beach', location: {lat: 50.214999, lng: -5.478533}, type: 'beach'},
    {title: 'Bamaluz Beach', location: {lat: 50.215866, lng: -5.476022}, type: 'beach'},
    {title: 'Porthgwidden Beach', location: {lat: 50.217098, lng: -5.476279}, type: 'beach'},
    {title: 'Porthminster Beach', location: {lat: 50.208623, lng: -5.475749}, type: 'beach'}
  ];

  self.filteredListings = ko.observableArray(self.listings);

  // Filter the ListView
  self.filterListView = function(type) {
    self.filteredListings([]);
    ko.utils.arrayForEach(self.listings, function(listing) {
      if (listing.type == type) {
        self.filteredListings.push(listing);
      } 
    });
  };

  self.resetListings = function() {
    self.filteredListings([]);
    ko.utils.arrayForEach(self.listings, function(listing) {
        self.filteredListings.push(listing);
    });

    self.resetMarkers();
  };

  self.resetMarkers = function() {
    ko.utils.arrayForEach(self.markers, function(marker) {
      if (marker.getVisible() === true) {
        change = true;
      }
      marker.setVisible(true);
    });
  };

  self.filterMarkers = function(type) {
    // Filter the markers
    ko.utils.arrayForEach(self.markers, function(marker) {
        if (type === marker.type) {
            if (marker.getVisible() === true) {
                change = true;
            }
            marker.setVisible(true);
        } else {
            if (marker.getVisible() === false) {
                change = true;
            }
            marker.setVisible(false);
        }
    });
  };
  
  // This function will update the filter applied to the listView and Markers
  self.filterListings = function(type) {
    switch(type){
      case 'beach':
        self.filterListView(type);
        break;
      case 'art':
        self.filterListView(type);
        break; 
      case 'coffee':
        self.filterListView(type);
        break;
    }    

    self.filterMarkers(type);
  };

  self.getMarkerId = function(title) {
    ko.utils.arrayForEach(self.markers, function(marker) {
      if (marker.title === title) {
        id = marker.id;
      }
    });
    return id;
  };
  
  // The function to trigger the marker click, 'id' is the reference index to the 'markers' array.
  self.openInfoWindow = function(title) {
    self.getMarkerId(title);
    google.maps.event.trigger(markers[id], 'click');
  };

  // Current Weather Forecast for St Ives
  self.weather = ko.observable('');                                       // Declare weather as ko observable
  $.ajax({
    beforeSend: function(xhr) {                   // Before requesting data
      if (xhr.overrideMimeType) {                 // If supported
        xhr.overrideMimeType("application/json"); // set MIME to prevent errors
      }
    }
  });

  // Function that gets the current weather from api JSON
  function loadWeather() {                    // Declare function
    $.getJSON('http://api.openweathermap.org/data/2.5/weather?lat=50.209246&lon=-5.491105&appid=11a3954a0eb1390d4cbb488c38fecdf6')              // Try to collect JSON data
    .done( function(data){                      // If successful
      self.weather(data.weather[0].description.toUpperCase());                             // Store it in a variable
    }).fail( function() {                       // If a problem: show message
      $('#event').html('Sorry! We could not load the timetable at the moment');
    });
  }

  loadWeather();                              // call the weather function

  // Function that collects 
  // Get Flickr image that is within 0.01 with the marker location.

  self.getImage = function(marker) {
    if(marker !== null) {
      /** Create search URL using marker position for lat/lng geolocation match of photos
        * within 1 km of position. Returns 1 photo that match criteria.
        */
      var searchUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search' +
        '&api_key=588c69c46097a668202169beb9689c36&lat=' + marker.position.lat() +
        '&lon=' + marker.position.lng() + '&radius=0.01&radius_units=km&per_page=1&page=1' +
        '&format=json&nojsoncallback=1';

      /** Call to get flickr photo data in JSON format. 
        */
      $.getJSON(searchUrl)
        .done(function(data) {
          parseImageResult(data);
        })
        .fail(function(jqxhr, textStatus, error) {
          alert("Unable to get photos from Flickr at this time.");
        });
    } else {
      // If no marker chosen when trying to retrieve photos, alert user.
      alert("Choose a location before trying to view photos.");
    }
  };

   /** Parse flickr JSON to form a url for the jpg image
    */
  function parseImageResult(data) {
    ko.utils.arrayForEach(data.photos.photo, function(photo) {
      imageUrl = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'; 
    });
  }
}

ko.applyBindings(AppViewModel);

function initMap() {
  // Create custom styles for the map
  var styles = [
    {
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
      {
        "visibility": "on"
      },
      {
        "color": "#e0efef"
      }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry.fill",
      "stylers": [
      {
        "visibility": "on"
      },
      {
        "hue": "#1900ff"
      },
      {
        "color": "#c0e8e8"
      }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
      {
        "lightness": 100
      },
      {
        "visibility": "simplified"
      }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [
      {
        "visibility": "off"
      }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
      {
        "visibility": "on"
      },
      {
        "lightness": 700
      }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
      {
        "color": "#7dcdcd"
      }
      ]
    }
  ];

  var largeInfowindow = new google.maps.InfoWindow();

  // Add the location markers on initialize
    // Custom styling for markers
    var defaultIcon = makeMarkerIcon('7dcdcd');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for (var i = 0; i < listings.length; i++) {
      // Get the position from the location array.
      var position = listings[i].location;
      var title = listings[i].title;
      var type = listings[i].type;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        type: type,
        visible: true,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });

      // Add marker to our array of markers.
      markers.push(marker);

      var previousMarker = null;
      
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
        if (previousMarker !== null) {
          previousMarker.setIcon(defaultIcon);
        }
        this.setIcon(highlightedIcon);
        previousMarker = this;
      });
    }


  // This function will loop through the markers array and display them all.
  function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      self.getImage(marker);

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        marker.setIcon(defaultIcon);
        infowindow.marker = null;
      });
      infowindow.setContent('<div>' + marker.title + '</div>' + "<img width='50px' height='50px' src='" + imageUrl + "'/>");
      infowindow.open(map, marker);
    }
  }

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: {lat: 50.209246, lng: -5.491105},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  showListings();
}