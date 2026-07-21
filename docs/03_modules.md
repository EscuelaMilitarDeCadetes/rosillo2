# Estructura de módulos

Exceptuando el modulo de usuarios cada módulo Django sigue la estructura de forma general:

apps/modulo/

migrations/
models/
selectors/
serializers/
services/
tests/
validators/
views/
admin.py
apps.py
urls.py


# Modulo usuarios
Tiene la siguiente estructura

migrations/
models/
permissions/
serializers/
services/
tests/
views/
admin.py
apps.py
authentication.py
throttles.py
urls.py


# Modulo integracion
Tiene la siguiente excepción
constants.py
sin admin.py


# Modulo common
Tiene la siguiente excepción
signals.py