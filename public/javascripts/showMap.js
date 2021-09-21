mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: store.geometry.coordinates, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat(store.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h5>${store.title}</h5><p>${store.location}</p>`
            )
    )
    .addTo(map);
