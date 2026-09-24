// script.js
const config = {
    geoserverUrl: 'http://localhost:8080/geoserver/ehtp/wms',
    layers: [],
    projection: 'EPSG:4326',
    bbox: [-7.6533, 33.5459, -7.6476, 33.5499],
    cesiumToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjOTg5M2IzYS01YzU4LTQ4NGUtYjdlOS0wMDY5NzFmZDMwNTQiLCJpZCI6MzA2NTEzLCJpYXQiOjE3NDgyOTU3MjB9.XqZNV3k4jxdBUjGO57BjWCLFSuiH4g8_dtJNCoUSEjs'
};

proj4.defs(config.projection, "+proj=longlat +datum=WGS84 +no_defs");
ol.proj.proj4.register(proj4);

const measurementSource = new ol.source.Vector();
const measurementLayer = new ol.layer.Vector({ source: measurementSource });

const map2d = new ol.Map({
    target: 'map2d',
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), measurementLayer],
    view: new ol.View({
        projection: config.projection,
        center: ol.extent.getCenter(config.bbox),
        zoom: 18
    })
});

const layerMap = {};
const layerNames = ['Direction', 'Batiments', 'Centre_Conference', 'Classes_Départements', 'Espaces_Verts', 'Laboratoires', 'Mosquée', 'Parking', 'Restaurant', 'SalleEtude', 'Terrains', 'Voirie'];
layerNames.forEach(name => {
    const lyr = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.geoserverUrl,
            params: { 'LAYERS': `ehtp:${name}`, 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png' },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        })
    });
    layerMap[name] = lyr;
    map2d.addLayer(lyr);
});

document.querySelectorAll('.layer-toggle').forEach(input => {
    input.addEventListener('change', () => {
        const name = input.dataset.layer;
        if (layerMap[name]) layerMap[name].setVisible(input.checked);
    });
});

const popup2d = document.getElementById('popup2d');
const overlay2d = new ol.Overlay({
    element: popup2d,
    autoPan: true,
    offset: [0, -10],
    positioning: 'bottom-center'
});
map2d.addOverlay(overlay2d);

map2d.on('singleclick', function (evt) {
    const resolution = map2d.getView().getResolution();
    let shown = false;
    map2d.getLayers().forEach(layer => {
        if (layer instanceof ol.layer.Tile && layer.getVisible()) {
            const source = layer.getSource();
            if (source instanceof ol.source.TileWMS) {
                const url = source.getFeatureInfoUrl(evt.coordinate, resolution, config.projection, { INFO_FORMAT: 'application/json' });
                if (url) {
                    fetch(url).then(r => r.json()).then(data => {
                        if (data.features.length > 0 && !shown) {
                            const props = data.features[0].properties;
                            popup2d.innerHTML = Object.entries(props).map(([k, v]) => `<b>${k}</b>: ${v}`).join("<br>");
                            overlay2d.setPosition(evt.coordinate);
                            popup2d.classList.remove("hidden");
                            shown = true;
                        }
                    });
                }
            }
        }
    });
});

let drawInteraction;
function activateMeasureTool(type) {
    if (drawInteraction) map2d.removeInteraction(drawInteraction);
    drawInteraction = new ol.interaction.Draw({
        source: measurementSource,
        type: type,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#ff0000', width: 3, lineDash: [10, 10] }),
            image: new ol.style.Circle({ radius: 5, fill: new ol.style.Fill({ color: '#ff0000' }) })
        })
    });
    drawInteraction.on('drawstart', () => {
        document.getElementById('measurementDisplay').style.display = 'block';
    });
    drawInteraction.on('drawend', (event) => {
        const geom = event.feature.getGeometry().clone();
        geom.transform('EPSG:4326', 'EPSG:3857');
        let res = '';
        if (type === 'LineString') {
            const length = geom.getLength();
            res = length > 1000 ? (length / 1000).toFixed(2) + ' km' : Math.round(length) + ' m';
        } else if (type === 'Polygon') {
            const area = geom.getArea();
            res = area > 1000000 ? (area / 1000000).toFixed(2) + ' km²' : Math.round(area) + ' m²';
        }
        document.getElementById('measurementText').innerHTML = `<strong>Résultat :</strong> ${res}`;
        map2d.removeInteraction(drawInteraction);
    });
    map2d.addInteraction(drawInteraction);
}

document.getElementById('measure-distance').addEventListener('click', () => activateMeasureTool('LineString'));
document.getElementById('measure-area').addEventListener('click', () => activateMeasureTool('Polygon'));

document.getElementById("export-png").addEventListener("click", () => {
    map2d.once("rendercomplete", () => {
        const canvas = document.createElement("canvas");
        const size = map2d.getSize();
        canvas.width = size[0];
        canvas.height = size[1];
        const context = canvas.getContext("2d");
        map2d.getViewport().querySelectorAll(".ol-layer canvas").forEach(layerCanvas => {
            if (layerCanvas.width > 0) context.drawImage(layerCanvas, 0, 0);
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "carte_sig_ehtp.png";
        link.click();
    });
    map2d.renderSync();
});

function clearMeasurements() {
    measurementSource.clear();
    document.getElementById('measurementDisplay').style.display = 'none';
    if (drawInteraction) {
        map2d.removeInteraction(drawInteraction);
        drawInteraction = null;
    }
}

let viewer;
async function init3DMap() {
    document.getElementById('loading-overlay').style.display = 'flex';
    try {
        Cesium.Ion.defaultAccessToken = config.cesiumToken;
        viewer = new Cesium.Viewer('map3d', {
            terrain: null, timeline: false, animation: true,
            baseLayerPicker: false, sceneModePicker: false,
            navigationHelpButton: false, homeButton: false,
            geocoder: false, infoBox: false, selectionIndicator: false
        });
        try {
            const tileset = await Cesium.Cesium3DTileset.fromUrl('./tileset.json', {
                maximumScreenSpaceError: 16,
                maximumNumberOfLoadedTiles: 10000,
                skipLevelOfDetail: true
            });
            viewer.scene.primitives.add(tileset);
            viewer.zoomTo(tileset);
        } catch {
            viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                url: config.geoserverUrl,
                layers: config.layers[0],
                parameters: { transparent: true, format: 'image/png' },
                credit: 'GeoServer WMS'
            }));
            viewer.camera.flyTo({
                destination: Cesium.Rectangle.fromDegrees(...config.bbox),
                orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 }
            });
        }
    } catch (error) {
        console.error('Erreur Cesium :', error);
        alert('Erreur lors du chargement de la vue 3D.');
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

init3DMap();