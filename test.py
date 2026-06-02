import os
from pathlib import Path

# Directorio donde están los archivos
directorios = "/Users/T056880/Documents/saudade_web/resources/libro"
carpeta = Path(directorios)

# Obtener todos los archivos .png ordenados por nombre
archivos_png = sorted([f for f in carpeta.iterdir() if f.suffix == ".png" and f.is_file()])

# Renombrar cada archivo con padding de 2 dígitos (sd_02.png, sd_04.png, etc.)
for n, archivo in enumerate(archivos_png, start=1):
    numero = 2 * n  # 2, 4, 6, 8...
    nuevo_nombre = f"sd_{numero:02d}.png"  # sd_02.png, sd_04.png, etc.
    nuevo_ruta = carpeta / nuevo_nombre
    
    # Evitar sobrescribir si ya existe el nuevo nombre
    if nuevo_ruta.exists() and nuevo_ruta != archivo:
        print(f"Advertencia: {nuevo_nombre} ya existe, saltando {archivo.name}")
        continue
    
    archivo.rename(nuevo_ruta)
    print(f"Renombrado: {archivo.name} → {nuevo_nombre}")

print(f"\nSe renombraron {len(archivos_png)} archivos.")