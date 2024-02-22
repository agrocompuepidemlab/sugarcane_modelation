import { Component, Injectable, OnInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { NavbarComponent } from '../navbar/navbar.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { panelaData } from './c_panela';
import { azucarData } from './c_cana';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

import '@geoman-io/leaflet-geoman-free';
import * as L from 'leaflet';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NavbarComponent, LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit{
  numbers: number[];
  LeafletMap: any;
  drawnItems: any;
  //drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined;

  azucarClusters: any;
  //panelaClusters: any;
  

  constructor(
    private readonly geolocation$: GeolocationService, 
    private http: HttpClient, 
    private router: Router) {
      this.numbers = [4.685347, -74.191439];
      geolocation$.pipe(take(1)).subscribe(position => {
        this.numbers[0] = position.coords.latitude;
        this.numbers[1] = position.coords.longitude;
        this.LeafletMap?.setView(L.latLng(this.numbers[0], this.numbers[1]), 18);
    });
  }
  
  ngOnInit(): void {
    this.drawMap();
    if(!sessionStorage.getItem('token')){
      this.router.navigate(['/login']);
    }
  };

  private drawMap(){
    var layer_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var layer_2 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var layer_3 = L.geoJSON(azucarData);
    
    var layer_4 = L.geoJSON(panelaData);

    this.LeafletMap = L.map("map", { layers: [layer_1] }).setView(L.latLng(this.numbers[0], this.numbers[1]), 10);
    

    var baseMaps = {
      "Cartográfica": layer_1
    };
    var overLay = {
      "Elevación": layer_2,
      "Clusters Caña de Azucar": layer_3,
      "Clusters Caña de Panela": layer_4,
    }

    
    L.control.layers(
      baseMaps,
      overLay).addTo(this.LeafletMap);

    this.LeafletMap.pm.addControls({
      position: 'topright',
      drawCircle: true,
      drawCircleMarker: true,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      drawMarker: true
    });

    this.LeafletMap.on('pm:create', (e: any) => {
      var shape = e.layer;
      Swal.fire('Perfecto!', 'Ahora ve a guardar el lote y seguir con las instrucciones!', 'success');
      this.router.navigate(['/analysis'], { state: { coordinatesPolygon: shape._latlngs }})
    });

    this.LeafletMap.pm.setLang('es');
  }
}
