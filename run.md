# How to Run the Project

To run this project, you will need two separate terminal windows (one for the backend and one for the frontend).

## 1. Run the Backend (.NET API)
Open your first terminal window, navigate to the API directory, and run the project.

```bash
cd backend/src/ECommerce.API
dotnet run
```
*(Note: If you specifically need it to run on port 8080 instead of the default port 5000, you can use: `dotnet run --urls="http://localhost:8080"`)*

## 2. Run the Frontend (Next.js)
Open a second terminal window, navigate to the frontend directory, and start the development server.

```bash
cd frontend
npm run dev
```
*(The frontend will automatically start on http://localhost:3000)*
