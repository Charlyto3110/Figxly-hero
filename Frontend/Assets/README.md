# Assets (NO incluir binarios en el PR)

Este proyecto está diseñado para que el PR contenga **solo archivos de texto**.
Los assets deben colocarse **localmente** en esta carpeta al desplegar.

## Archivos esperados (rutas exactas)

- `figxly-logo.png`  
  Logo principal (icono). Se usa en el header.

- `phone-mock.png`  
  Imagen del teléfono (mockup) usada en la columna derecha.

## Avatares opcionales para categorías (si no existen, el layout NO se rompe)

- `cat-electricistas.jpg`
- `cat-plomeros.jpg`
- `cat-cerrajeros.jpg`
- `cat-mas.jpg`

Si estos avatares no existen, se mostrará un placeholder con gradiente + icono SVG.

## Notas
- No uses base64 gigante en HTML/CSS/JS.
- No agregues binarios al repo/PR. Colócalos solo en el servidor o vía pipeline de despliegue.
