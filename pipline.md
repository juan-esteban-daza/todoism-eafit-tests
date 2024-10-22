# Guía Paso a Paso del Archivo YAML: Ejecución de Pruebas Automáticas

## Introducción

Este archivo YAML es una configuración para un pipeline en GitHub Actions que automatiza el proceso de pruebas de una aplicación Flask y pruebas de integración con Playwright en un repositorio separado. A lo largo de esta guía, explicaremos paso a paso cómo funciona este pipeline y su relevancia.

## ¿Qué es un pipeline de CI/CD?

Un **pipeline de CI/CD (Integración Continua/Entrega Continua)** es un conjunto de automatizaciones que permiten construir, probar y desplegar aplicaciones. En este caso, usamos GitHub Actions para automatizar la ejecución de pruebas cada vez que se realiza un cambio en el código.

---

## Pipeline completo
```yaml
name: Run Tests

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

env:
    REPO_URL: XXXX
    WORKING_DIR: repo_path

jobs:
  run-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Flask app repo
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Flask app dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt

      - name: Run Flask app
        run: |
          source venv/bin/activate
          flask initdb
          flask translate compile
          nohup flask run > flask.log 2>&1 &

      - name: Checkout tests repo
        run: git clone $REPO_URL

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: | 
          cd todoism-eafit-tests
          npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: |
          cd $WORKING_DIR
          npx playwright test todolist.spec.ts

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: $WORKING_DIR
          path: $WORKING_DIR/playwright-report/
          retention-days: 30

```

### 1. **Triggers**
En este caso los triggers para el pipeline son el pull request y el push a la rama **master**.
```yaml
on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master
```

## 2. **Steps**

### Levantamiento de la versión X.X de la aplicación de flask

Para poder ejecutar las pruebas sobre una versión preliminar a la que se aceptará como productiva, se debe inicializar esa versión en el agente de sistema CI/CD. En este caso se utilizan varios steps que replican la ejecución local del código solicitante en el PR o el código post-merge.
```yaml
      - name: Checkout Flask app repo
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Flask app dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt

      - name: Run Flask app
        run: |
          source venv/bin/activate
          flask initdb
          flask translate compile
          nohup flask run > flask.log 2>&1 &
```

### Instalación de dependencias para ejecutar playwright

```yaml
      - name: Checkout tests repo
        run: git clone $REPO_URL

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: | 
          cd $WORKING_DIR
          npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
```

Con estos pasos nos aseguramos de que todas las dependencias de playwright junto a los navegadores queden instaladas correctamente. Es de suma relevancia declarar el directorio de trabajo para las pruebas dado que tenemos dos repositorios sobre el mismo agente, el de la aplicación a probar y el repositorio de pruebas!

### Ejecución y reporte de evidencias

```yaml
      - name: Run Playwright tests
        run: |
          cd $WORKING_DIR
          npx playwright test todolist.spec.ts

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: $WORKING_DIR/playwright-report/
          retention-days: 30
```

Finalmente ejecutamos las pruebas y subimos las evidencias como un artefacto!

[Ejemplo de YML funcional](https://github.com/juan-esteban-daza/todoism-eafit/blob/master/.github/workflows/tests.yml)
