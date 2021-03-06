import $ from 'jquery';
import React, { Component } from 'react';
import { defer, each } from 'lodash';

export default class ChurchFinderMap extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (typeof window !== 'undefined') {
            document.title = 'Reformed Church Finder: An International Directory';
        }
    }

    componentDidMount() {
        this.initMap();
    }

    componentDidUpdate() {
        this.initMap();
    }

    initMap() {
        if (typeof window !== 'undefined') {
            var usa = {lat: 37.09024, lng: -95.712891};
            var map = new google.maps.Map(this.map, {
                zoom: 4,
                center: usa,
                mapTypeId: 'roadmap'
            });

            let infoWindow = {};

            this.props.filteredChurches.forEach((church, index) => {
                const { name, address, lat, long, region, website, email, pastor, confession, lastUpdated } = church;

                const icon = this.getIcon();

                var marker = new google.maps.Marker({
                    icon,
                    map,
                    position: {
                        lat: Number(lat),
                        lng: Number(long)
                    }
                });

                const nameAddressString = this.getNameAddressString(name, address);
                const websiteString = this.getWebsiteString(website);
                const emailString = this.getEmailString(email);
                const pastorString = this.getPastorString(pastor);
                const confession1689 = this.getConfession(confession);
                const lastUpdatedString = this.getLastUpdatedString(lastUpdated);

                infoWindow[index] = new google.maps.InfoWindow({
                    content: `
                        <div class="info-window">
                            ${nameAddressString}
                            ${confession1689}
                            ${websiteString}
                            ${emailString}
                            ${pastorString}
                            ${lastUpdatedString}
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    each(infoWindow, window => { window.close() });

                    defer(() => {
                        infoWindow[index].open(map, marker);
                    });
                });
            });

            $('body').click(event => {
                if ($('.info-window').length && !$(event.target).parents('.info-window').length) {
                    each(infoWindow, window => { window.close() });
                }
            });
        }

        // Create the search box and link it to the UI element.
        var input = this.search;
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
    }

    getIcon(familyIntegrated, noConfession) {
        let icon;

        if (familyIntegrated) {
            return '/marker-baptist-fi.png';
        }

        if (noConfession) {
            return '/marker-baptist-generic.png';
        }

        return '/marker-baptist.png';
    }

    getNameAddressString(name, address) {
        return `
            <h2>${name}</h2>
            <div>${address} (<a href="https://maps.google.com?daddr=${address.replace(' ', '+')}" target="_blank">Directions</a>)</div>
        `;
    }

    getWebsiteString(website) {
        if (!website) { return ''; }

        return `<div><strong>Website: </strong><a href="${website}" target="_blank">${website}</a></div>`;
    }

    getEmailString(email) {
        if (!email) { return ''; }

        return `<div><strong>Email: </strong><a href="mailto:${email}" target="_blank">${email}</a></div>`;
    }

    getPastorString(pastor) {
        if (!pastor) { return ''; }

        return `<div><strong>Lead Pastor: </strong>${pastor}</div>`;
    }

    getConfession(confession) {
        if (!confession) { return ''; }

        return `<div><i class="fa fa-book"></i> ${confession}</div>`;
    }

    getLastUpdatedString(lastUpdated) {
        if (!lastUpdated) { return ''; }

        return `<div><strong>Last updated: </strong>${lastUpdated}</div>`;
    }
    
    render() {
        return (
            <div className="church-directory__map">
                <input id="pac-input" className="controls" type="text" placeholder="Search Box" ref={input => this.search = input} />
                <div className="map" ref={div => this.map = div} />
            </div>
        );
    }
}
