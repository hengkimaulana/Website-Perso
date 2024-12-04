// Fungsi Haversine untuk menghitung jarak
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam kilometer
    const toRad = angle => angle * Math.PI / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c * 1000; // Hasil dalam meter
}

// Fungsi untuk menghitung initial bearing dan final bearing
function vincentyInverse(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    
    lat1 = toRad(lat1);
    lon1 = toRad(lon1);
    lat2 = toRad(lat2);
    lon2 = toRad(lon2);

    const deltaLon = lon2 - lon1;

    const x = Math.cos(lat2) * Math.sin(deltaLon);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    const initialBearing = (toDeg(Math.atan2(x, y)) + 360) % 360;

    const x2 = Math.cos(lat1) * Math.sin(deltaLon);
    const y2 = Math.cos(lat2) * Math.sin(lat1) - Math.sin(lat2) * Math.cos(lat1) * Math.cos(deltaLon);
    const finalBearing = (toDeg(Math.atan2(x2, y2)) + 360) % 360;

    return { initialBearing, finalBearing };
}

// Variabel untuk menyimpan marker dan garis
let marker1 = null;
let marker2 = null;
let line = null;
let map = null;

// Inisialisasi Peta
document.addEventListener("DOMContentLoaded", () => {
    map = L.map("map").setView([0, 0], 2);

    // Pilihan basemap
    const baseMaps = {
        osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
        satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
        terrain: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}")
    };

    // Basemap default
    baseMaps.osm.addTo(map);

    // Ganti basemap saat pilihan berubah
    document.getElementById("basemap-selector").addEventListener("change", function (e) {
        map.eachLayer(layer => map.removeLayer(layer));
        baseMaps[e.target.value].addTo(map);
    });

    // Tangkap klik pada peta
    map.on("click", function (e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        if (!document.getElementById("lat1").value && !document.getElementById("lon1").value) {
            // Titik Pergi
            if (marker1) map.removeLayer(marker1);
            marker1 = L.marker([lat, lon]).addTo(map).bindPopup("Titik Pergi").openPopup();
            document.getElementById("lat1").value = lat.toFixed(6);
            document.getElementById("lon1").value = lon.toFixed(6);
        } else {
            // Titik Pulang
            if (marker2) map.removeLayer(marker2);
            marker2 = L.marker([lat, lon]).addTo(map).bindPopup("Titik Pulang").openPopup();
            document.getElementById("lat2").value = lat.toFixed(6);
            document.getElementById("lon2").value = lon.toFixed(6);
        }

        // Tambahkan garis jika kedua titik sudah ada
        drawLine();
    });

    // Hapus marker titik pergi
    document.getElementById("remove-start").addEventListener("click", function () {
        if (marker1) {
            map.removeLayer(marker1);
            marker1 = null;
            document.getElementById("lat1").value = "";
            document.getElementById("lon1").value = "";
            removeLine();
        }
    });

    // Hapus marker titik pulang
    document.getElementById("remove-end").addEventListener("click", function () {
        if (marker2) {
            map.removeLayer(marker2);
            marker2 = null;
            document.getElementById("lat2").value = "";
            document.getElementById("lon2").value = "";
            removeLine();
        }
    });
});

// Fungsi menggambar garis
function drawLine() {
    const lat1 = parseFloat(document.getElementById("lat1").value);
    const lon1 = parseFloat(document.getElementById("lon1").value);
    const lat2 = parseFloat(document.getElementById("lat2").value);
    const lon2 = parseFloat(document.getElementById("lon2").value);

    if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
        // Hapus garis lama jika ada
        if (line) map.removeLayer(line);

        // Tambahkan garis baru
        line = L.polyline([[lat1, lon1], [lat2, lon2]], { color: 'red' }).addTo(map);
    }
}

// Fungsi menghapus garis
function removeLine() {
    if (line) {
        map.removeLayer(line);
        line = null;
    }
}

// Fungsi untuk menghitung jarak dan bearing
function calculateDistance() {
    const lat1 = parseFloat(document.getElementById("lat1").value);
    const lon1 = parseFloat(document.getElementById("lon1").value);
    const lat2 = parseFloat(document.getElementById("lat2").value);
    const lon2 = parseFloat(document.getElementById("lon2").value);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        alert("Masukkan koordinat yang valid.");
        return;
    }

    // Hitung jarak
    const distance = haversine(lat1, lon1, lat2, lon2);
    document.getElementById("result").innerText = `Jarak: ${distance.toFixed(2)} meter`;

    // Hitung bearing
    const bearings = vincentyInverse(lat1, lon1, lat2, lon2);
    document.getElementById("initial-bearing").innerText = `${bearings.initialBearing.toFixed(2)}°`;
    document.getElementById("final-bearing").innerText = `${bearings.finalBearing.toFixed(2)}°`;
}
