# Figxly Hero (estático) — Deploy en Ubuntu 24.04.4 + Nginx

## 1) Copiar archivos al servidor

Recomendado:
```bash
sudo mkdir -p /var/www/figxly
sudo rsync -av ./ /var/www/figxly/
