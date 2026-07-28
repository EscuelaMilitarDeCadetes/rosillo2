"""
E:\PROYECTO_ROSILLO\django_react\django\rosillo\seed_tipo_documento.py

Ejecutar UNA vez con:
python manage.py shell -c "exec(open('seed_tipo_documento.py', encoding='utf-8').read())"

Es idempotente: si vuelves a correrlo, no duplica ni falla en los que ya existen.
"""
from django.contrib.auth import get_user_model
from apps.common.services.tipo_documento_service import TipoDocumentoService
from apps.common.selectors.tipo_documento_selector import TipoDocumentoSelector

Usuario = get_user_model()

# HistorialService.registrar necesita un usuario real como ejecutor.
# Toma el primer superusuario que encuentre (ajusta el filtro si tu superusuario
# tiene otro criterio, ej. is_staff=True).
ejecutor = Usuario.objects.filter(is_superuser=True).first()
if ejecutor is None:
    raise SystemExit(
        "No se encontró ningún superusuario. Crea uno con "
        "'python manage.py createsuperuser' y vuelve a correr este script."
    )

CODIGOS = [
    ("APROBACION_POSTULACION", "INVESTIGACION_FORMATIVA"),
    ("APROBACION_PARTICIPANTE", "INVESTIGACION_FORMATIVA"),
    ("APROBACION_EVENTO_EVALUATIVO", "INVESTIGACION_FORMATIVA"),
    ("APROBACION_EVALUACION_PROCESO", "INVESTIGACION_FORMATIVA"),
    ("APROBACION_SEGUNDA_INSTANCIA", "INVESTIGACION_FORMATIVA"),
]

for nombre, grupo in CODIGOS:
    if TipoDocumentoSelector.existe_nombre(nombre):
        print(f"Ya existía, se omite: {nombre}")
        continue
    TipoDocumentoService.crear(nombre_documento=nombre, grupo=grupo, ejecutor=ejecutor)
    print(f"Creado: {nombre}")

print("Listo.")