var map;

var masterTitles = [];

var shownTitles = [];

var markers = [];

var loadedMarker;

var allItemsObservable = ko.observableArray([]);

var flickr_API_KEY = "6469a4b11d59dfadb505e856ded59af3"

var flickr_URL = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + flickr_API_KEY + "&format=json&nojsoncallback=1&photo_id="

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    // Map construction taken from the Udacity github repository for the "Getting Started with APIs" lesson
    // Used this snippet because it showed me how to load the map on the screen
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.759617, lng: -122.426904 },
        zoom: 13
    });

    // Error Handling
    if (map.center === null || map.zoom === null) {
        window.alert("Google Maps has failed to load. Please try again later");
    }

    // Makes map responsive
    // Code taken from https://stackoverflow.com/questions/15421369/responsive-google-map
    google.maps.event.addDomListener(window, "resize", function () {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });

    // Loads the info window for each marker
    function callInfoWindow() {
        loadedMarker.addListener('click', function () {
            populateInfoWindow(this, infowindow);
            loadedMarker = null;
        });
    }


    // Array of marker locations and info
    var markerLocations = [
        {
            title: 'AT&T Park',
            position: { lat: 37.778595, lng: -122.38927 },
            photoId: '8289047254'
        },

        {
            title: 'Seward Mini Park',
            position: { lat: 37.757658, lng: -122.439993 },
            photoId: '36004325783'
        },

        {
            title: 'Alta Plaza Park',
            position: { lat: 37.791142, lng: -122.437624 },
            photoId: '36994578043'
        },

        {
            title: 'Union Square',
            position: { lat: 37.787980, lng: -122.407517 },
            photoId: '11610314343'
        },

        {
            title: 'Mission Dolores Park',
            position: { lat: 37.759617, lng: -122.426904 },
            photoId: '39151366532'
        }
    ];

    // Loops through markerLocations array and sets the positions as titles
    // Makes markes appear on the map
    for (var i = 0; i < markerLocations.length; i++) {
        var position = markerLocations[i].position;
        var title = markerLocations[i].title;
        var photoId = markerLocations[i].photoId;

        // Master list of all the titles
        // So that they never get deleted
        // When I'm filtering them
        masterTitles.push(title);

        var marker = new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP,
            title: title,
            photoId: photoId,
            show: true
        });

        markers.push(marker);

        loadedMarker = marker;

        callInfoWindow();

        var infowindow = new google.maps.InfoWindow({
            content: title
        });

    }

    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            //Flickr API
            // Add Image to infowindow
            $.getJSON(flickr_URL + marker.photoId, function (data) {
                // Whole of the resposne from the HTTP request 
                // console.log("Data:", data)
                // After extracting the required info from the whole bunch of data received 
                // console.log("Image Link:", data.sizes.size[4].source)

                // Adds imae to info window
                infowindow.setContent('<img src="' + data.sizes.size[4].source + '"'
                    + 'alt="Sorry, this Flickr image has failed to load. Please try again later.">'
                    + '<div>' + marker.title + '</div>'
                    + '<div>' + "Image courtesy of Flickr.com" + '</div>');
            })

            // Info window population taken from the Udacity github repository for the "Getting Started with APIs" lesson
            // Used this snippet because when I coded the info windows myself, I could only get one to open
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }


        // Handles marker bouncing
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        }
        // When another marker is clicked, other marker bounces cease
        // Allows for one marker bouncing at a time
        else {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }



    //   Handles the list of locations at the top of the screen
    var ListModel = function () {
        this.itemToAdd = ko.observable("");

        this.selectedItems = ko.observableArray([""]);

        // These items are displayed in the list
        // Initially displays every location
        this.allItems = ko.observableArray(masterTitles);

        // When an item is selected from the list and selectedItems changes, open and populate the info window
        this.selectedItems.subscribe(function (context) {
            for (i = 0; i < markers.length; i++) {
                if (context == markers[i].title) {
                    infowindow.marker = markers[i];
                    infowindow.setContent('<div>' + context + '</div>');
                    infowindow.open(map, markers[i]);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', infowindow.marker = null);

                    // Handles marker bouncing
                    if (markers[i].getAnimation() !== null) {
                        markers[i].setAnimation(null);
                    }
                    // When another marker is clicked, other marker bounces cease
                    // Allows for one marker bouncing at a time
                    else {
                        for (var x = 0; x < markers.length; x++) {
                            markers[x].setAnimation(null);
                        }
                        markers[i].setAnimation(google.maps.Animation.BOUNCE);
                    }
                }
            }
        });

        function updateItems() {
            allItemsObservable.subscribe(function (changes) {
                this.allItems = changes;
                console.log('Changes: ' + changes);
            })
        }

        // FILTERING LOGIC
        this.input = ko.observable('');

        // Makes all markers and places not visible
        this.input.subscribe(function (input) {
            var searchInput = input.toLowerCase();

            // Makes every marker invisible 
            //and only makes them visible if the input matches the title
            for (i = 0; i < markers.length; i++) {
                markers[i].setVisible(false);
            }

            // Makes all markers and items remain visible
            // if the user deletes their input
            if (searchInput === '') {
                for (i = 0; i < markers.length; i++) {
                    markers[i].setVisible(true);
                    // Pushes all of the items from
                    // The master titles array
                    // Into the shown titles array
                    
                    for (var x = 0; x < masterTitles.length; x++) {
                        // These items are displayed in the list
                        shownTitles.push(masterTitles[i]);
                    }
                    allItemsObservable.push(shownTitles);
                    updateItems();
                    shownTitles = [];
                }
            } else {
                //this loop iterates through each marker
                // if any of the letters in the input and the marker's title match,
                // then that marker is visible
                // otherwise, it is invisible
                for (i = 0; i < markers.length; i++) {
                    if (markers[i].title.toLowerCase().search(searchInput) !== -1 && masterTitles[i].toLowerCase().search(searchInput) !== -1) {
                        markers[i].setVisible(true);

                        // Puts only titles that match
                        // The input into the shown titles array
                        shownTitles.push(masterTitles[i]);
                        // Shows which titles have been filteres
                        console.log('Filtered titles: ' + shownTitles)

                    }
                    allItemsObservable.push(shownTitles);
                }
                // Should update the allItems array and display 
                // the filtered items on the page
                updateItems();
                shownTitles = []
            }

        });

        // Handles the opening and closing of the open/close list button
        // Located at the top of the screen
        this.toggleList = function (test) {
            var list = document.getElementById('list');

            var displaySetting = list.style.display;

            var listButton = document.getElementById('listButton');

            // Toggles the list and the button text
            if (displaySetting === 'none') {
                list.style.display = 'block';
                listButton.innerHTML = 'Close Location List';
            }
            else {
                list.style.display = 'none';
                listButton.innerHTML = 'Open Location List';
            }
        };

    };

    ko.applyBindings(new ListModel());

}