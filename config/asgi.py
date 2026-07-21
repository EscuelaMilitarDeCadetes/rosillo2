"""
ASGI config for rosillo project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

"""
Cambia 'config.settings.local' por el ambiente que corresponda 
cuando despliegues (config.settings.stage, config.settings.production), 
o mejor: usa la variable de entorno directamente:
os.environ.setdefault('DJANGO_SETTINGS_MODULE', os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.local'))
"""

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

application = get_asgi_application()
