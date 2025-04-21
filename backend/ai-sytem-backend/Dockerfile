
FROM python:3.13-slim

WORKDIR /app

# Copia los archivos de gestión de dependencias desde el directorio actual (ai-sytem-backend)
COPY pyproject.toml poetry.lock ./

# Instala Poetry y las dependencias del proyecto (incluyendo las de desarrollo)
RUN pip install --no-cache-dir poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-root

# Copia la carpeta src y tests
COPY src ./src
COPY tests ./tests

# Añade el directorio src al PYTHONPATH
ENV PYTHONPATH=/app/src

# Expone el puerto que usa FastAPI (si aplica)
EXPOSE 7013

# Comando para ejecutar la aplicación usando el script de Poetry
CMD ["poetry", "run", "start"]
