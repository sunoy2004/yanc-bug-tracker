# Deploy to Google Cloud Run (Docker)

This project includes files to build a production Docker image and deploy it to Cloud Run.

Files added:
- `Dockerfile` - multi-stage Dockerfile that builds the Vite app and serves with Nginx
- `nginx.conf` - Nginx config for SPA fallback
- `.dockerignore` - files to exclude from Docker build
- `cloudbuild.yaml` - Cloud Build pipeline to build, push, and deploy to Cloud Run
- `deploy.sh` - local convenience script to build and deploy using Docker + gcloud

Quick steps (local)

1. Install dependencies and build locally:

```bash
npm ci
npm run build
```

2. Build Docker image:

```bash
docker build -t gcr.io/YOUR_PROJECT_ID/yanc-bug-tracker:latest .
```

3. Push image:

```bash
docker push gcr.io/YOUR_PROJECT_ID/yanc-bug-tracker:latest
```

4. Deploy to Cloud Run:

```bash
gcloud run deploy yanc-bug-tracker --image gcr.io/YOUR_PROJECT_ID/yanc-bug-tracker:latest --region us-central1 --platform managed --allow-unauthenticated
```

Quick steps (Cloud Build)

1. Submit Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_SERVICE="yanc-bug-tracker",_REGION="us-central1"
```

Notes
- Ensure you have enabled Cloud Run & Cloud Build APIs and have permission to push images to Container Registry.
- Replace `YOUR_PROJECT_ID` with your GCP project ID.
- For production, use Artifact Registry instead of Container Registry and secure your Cloud Run service (disable public access).

