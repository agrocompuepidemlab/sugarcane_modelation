# Sugarcane Modelation

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white) ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Static Badge](https://img.shields.io/badge/build-in_progress-green)

## Instalación de la App Web para pruebas locales

* Para poder correr el proyecto localmente clone el repositorio en su máquina con el siguiente comando de Git.

```
git clone https://github.com/agrocompuepidemlab/sugarcane_modelation.git
```

* Se debe contar con docker y docker-compose instalado en la máquina en la cual se quiere ejecutar el proyecto. Para más información se debe referir al siguiente link.

```
https://docs.docker.com/
```

* Si el repositorio ya se encuentra clonado, en la carpeta raíz del proyecto, ejecutar el siguiente comando en el terminal (Linux o MacOS) o terminal dedicado de Docker (Windows)

```
sudo docker compose build
```

* Una vez terminada la compilación ejecute el siguiente comando

```
sudo docker compose up -d
```

* La aplicación estará corriendo en el siguiente link:

```
http://127.0.0.1:8080
```

* Si desea detener la aplicación, nuevamente en la carpeta raíz del proyecto

```
sudo docker compose down
```

