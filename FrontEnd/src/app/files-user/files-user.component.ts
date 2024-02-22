import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IP } from '../app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-files-user',
  standalone: true,
  imports: [NavbarComponent, NgxFileDropModule],
  templateUrl: './files-user.component.html',
  styleUrl: './files-user.component.css',
})
export class FilesUserComponent {
  selectedFile: File | null = null;
  imageUrl: any;
  loading: boolean = false;
  images: boolean = false;

  files: NgxFileDropEntry[] = [];
  filesUp = [] as any[];
  filesToSend = [] as any[];

  constructor(private http: HttpClient, private ipBackend: IP) {}

  handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      this.selectedFile = inputElement.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.filesUp.push(droppedFile.relativePath);
          this.filesToSend.push({
            nameFile: droppedFile.relativePath,
            file: file,
          });
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  upload() {
    this.loading = true;
    if (this.filesToSend.length > 0) {
      let formData = new FormData();
      for (let i = 0; i < this.filesToSend.length; i++) {
        formData.append('files[]', this.filesToSend[i].file);
      }
      this.http
        .post(this.ipBackend.ipBackend + 'see-tif', formData)
        .subscribe((response: any) => {
          this.loading = false;
          if (response.ok) {
            this.imageUrl = 'data:image/jpeg;base64,' + response.image;
            this.images = true;
          } else {
            Swal.fire('Error!', response.message, 'error');
          }
        });
    } else {
      this.loading = false;
      Swal.fire('Ups!', 'Debes subir un archivo para procesar!', 'error');
    }
  }
}
