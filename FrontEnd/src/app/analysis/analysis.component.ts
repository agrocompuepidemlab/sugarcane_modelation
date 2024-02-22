import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import { Chart } from 'chart.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    NgChartsModule,
  ],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.css',
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  @ViewChild('TempChart') aTempChart: ElementRef | undefined;
  @ViewChild('PrepChart') aPrepChart: ElementRef | undefined;
  @ViewChild('HRChart') aHRChart: ElementRef | undefined;
  @ViewChild('PRChart') aPRChart: ElementRef | undefined;

  coordinatesPolygon: any | null = null;
  dataTemp: any;
  dataPrep: any;
  dataHR: any;
  dataPR: any;

  //data: any;
  chartTempA: any;
  chartPrepA: any;
  chartHRA: any;
  chartPRA: any;

  /* Valores para gráficos */

  dateValues: any;

  tempValues: any;
  foreTempValues: any;

  prepValues: any;
  forePrepValues: any;

  hrValues: any;
  foreHRValues: any;

  prValues: any;
  forePRValues: any;

  /*  #################### */

  area: any;
  polygons: any[] = [];

  loading: boolean = false;
  nameUser: string | null = null;
  emailUser: string | null = null;
  token: string | null = null;

  save = {
    token: '',
    namePolygon: null,
    geometry: null
  };

  polygonToSee = {
    id: null,
    token: ''
  }

  selectedOption: string | null = '';
  buttonClicked: boolean = false;
  data_t: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ipBackend: IP
  ) {}

  ngOnInit(): void {
    this.token = sessionStorage.getItem('token');

    if (this.token) {
      this.http.get(this.ipBackend.ipBackend + 'user-data-polygons', { params:{ token: this.token}})
        .subscribe((response: any) => {
          this.polygons = response.data;
        });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onOptionSelected(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value;
    this.selectedOption = value !== '' ? value : null;
  }

  ngAfterViewInit(): void {

    this.coordinatesPolygon = window.history.state.coordinatesPolygon;

    if (this.coordinatesPolygon){
      this.createGraphs();
    }else{
      Swal.fire('Atención!', 'No has dibujado nigún polígono. Debes dibujar uno o seleccionar un polígono guardado', 'warning');
    }
  }

  createGraphs(): void {
    this.loading = true;
    this.http
      .post(this.ipBackend.ipBackend + 'get-coords-data', {
        coords: this.coordinatesPolygon,
      })
      .subscribe((response: any) => {
        console.log(response);
        this.loading = false;

        if (response.ok) {
          this.area = JSON.parse(response.area);
          this.dataTemp = JSON.parse(response.temp).data;
          this.dataPrep = JSON.parse(response.prep).data;
          this.dataHR = JSON.parse(response.hr).data;
          this.dataPR = JSON.parse(response.pr).data;

          this.dateValues = this.dataTemp.map(
            (d: { [x: string]: any }) => d['date']
          );

          this.tempValues = this.dataTemp.map(
            (d: { [x: string]: any }) => d['temp']
          );
          this.foreTempValues = this.dataTemp.map(
            (d: { [x: string]: any }) => d['forecast']
          );

          this.prepValues = this.dataPrep.map(
            (d: { [x: string]: any }) => d['prep']
          );
          this.forePrepValues = this.dataPrep.map(
            (d: { [x: string]: any }) => d['forecast']
          );

          this.hrValues = this.dataHR.map((d: { [x: string]: any }) => d['hr']);
          this.foreHRValues = this.dataHR.map(
            (d: { [x: string]: any }) => d['forecast']
          );

          this.prValues = this.dataPR.map((d: { [x: string]: any }) => d['pr']);
          this.forePRValues = this.dataPR.map(
            (d: { [x: string]: any }) => d['forecast']
          );

          if (response.variables === 1) {
            if (response.cana === 0) {
              // panela
              Swal.fire(
                'Atención!',
                'Esta información SOLO aplica para Caña Panelera',
                'info'
              );
            } else {
              // azucar
              Swal.fire(
                'Atención!',
                'Esta información SOLO aplica para Caña Azucarera',
                'info'
              );
            }
          } else {
            Swal.fire(
              'Atención!',
              'Esta información aplica tanto para Caña Azucarera como Panelera',
              'info'
            );
          }

          this.createGraphHrA();
          this.createGraphPrA();
          this.createGraphPrepA();
          this.createGraphTempA();
        } else {
          Swal.fire('Error!', response.message, 'error');
        }
      });
  }

  createGraphTempA(): void {
    this.chartTempA = new Chart(this.aTempChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Temperatura Registrada',
            data: this.tempValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
          {
            label: 'Temperatura Pronóstico',
            data: this.foreTempValues,
            backgroundColor: 'rgba(39, 170, 178, 0.2)',
            borderColor: 'rgba(39, 170, 178, 1)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Temperatura (°C)',
            },
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha (AAAA-MM)',
            },
          },
        },
      },
    });
  }

  createGraphPrepA(): void {
    this.chartPrepA = new Chart(this.aPrepChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Precipitación Registrada',
            data: this.prepValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
          {
            label: 'Precipitación Pronóstico',
            data: this.forePrepValues,
            backgroundColor: 'rgba(39, 170, 178, 0.2)',
            borderColor: 'rgba(39, 170, 178, 1)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Precipitación (mm)',
            },
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha (AAAA-MM)',
            },
          },
        },
      },
    });
  }

  createGraphHrA(): void {
    this.chartHRA = new Chart(this.aHRChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Humedad Relativa Registrada',
            data: this.hrValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
          {
            label: 'Humedad Relativa Pronóstico',
            data: this.foreHRValues,
            backgroundColor: 'rgba(39, 170, 178, 0.2)',
            borderColor: 'rgba(39, 170, 178, 1)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Humedad Relativa (%)',
            },
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha (AAAA-MM)',
            },
          },
        },
      },
    });
  }

  createGraphPrA(): void {
    this.chartPRA = new Chart(this.aPRChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Punto de Rocío Registrada',
            data: this.prValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
          {
            label: 'Punto de Rocío Pronóstico',
            data: this.forePRValues,
            backgroundColor: 'rgba(39, 170, 178, 0.2)',
            borderColor: 'rgba(39, 170, 178, 1)',
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Temperatura (°C)',
            },
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha (AAAA-MM)',
            },
          },
        },
      },
    });
  }

  saveP() {
    this.loading = true;
    if (this.save.namePolygon && this.coordinatesPolygon) {
      this.save.token = sessionStorage.getItem('token')!;
      this.save.geometry = this.coordinatesPolygon;
      this.http
        .post(this.ipBackend.ipBackend + 'user-save-polygon', this.save)
        .subscribe((response: any) => {
          this.loading = false;
          if (response.ok) {
            Swal.fire(
              'Perfecto!',
              'Polígono guardado con éxito!',
              'success'
            );
          } else {
            Swal.fire('Ups!', response.message, 'error');
          }
        });
    } else {
      this.loading = false;
      Swal.fire('Ups!', 'Para guardar el polígono debes asignar un nombre!', 'error');
    }
  }

  seePolygon(){
    this.polygonToSee.token = this.token!;
    this.loading = true;
    if(this.polygonToSee.id){
      this.http.post(this.ipBackend.ipBackend + 'see-polygon-data', this.polygonToSee)
      .subscribe((response:any) => {
        this.loading = false;
        if (response.ok){
          this.coordinatesPolygon = response.coords;
          this.createGraphs();
        }else{
          Swal.fire('Error!', response.message, 'error');
        }
      })
    }
  }
}
