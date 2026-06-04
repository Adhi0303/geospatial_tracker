# Phase 5: Weather & Environmental Intelligence

## Overview
Phase 5 introduces real-time environmental monitoring to the Geospatial Tracker. Unlike the transportation modules (Flights/Ships) which use background collectors to stream raw point data, the Weather module will utilize a **Tile Server Architecture**.

By leveraging the **OpenWeatherMap Map Layers API**, we can fetch pre-rendered geospatial tiles (PNG images) of global weather patterns (Clouds, Wind, Precipitation, Temperature, Pressure) and drape them directly over the 3D Cesium globe.

This approach is highly performant because it shifts the heavy lifting of meteorological rendering to the OpenWeatherMap servers, while keeping our application's bundle size and processing overhead minimal.


---

## Architecture Plan

### 1. The Proxy API Layer (Next.js)
To keep the OpenWeatherMap API key secure, the client cannot request tiles directly from OpenWeatherMap. Instead, we will build a proxy server inside our Next.js `web` app.

**Modules:**
- **`apps/web/src/app/api/weather/layers/route.ts`**
  - Returns a JSON list of available layers (`clouds_new`, `precipitation_new`, `pressure_new`, `wind_new`, `temp_new`).
  - Returns `configured: true` if the API key is present in `.env.local`.
  - Returns the URL template for the client to use: `/api/weather/tile/{z}/{x}/{y}?layer={layer}`

- **`apps/web/src/app/api/weather/tile/[z]/[x]/[y]/route.ts`**
  - Accepts `z`, `x`, `y` and a `layer` query parameter.
  - Validates coordinates and layer names.
  - Injects the `OPENWEATHERMAP_API_KEY` from the environment.
  - Proxies the request to `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=API_KEY`.
  - Sets appropriate caching headers (`Cache-Control`) to minimize upstream API calls and reduce costs.
  - Returns the raw `image/png` buffer to the client.

### 2. The Visualization Layer (Cesium Engine)
We will create a new package module to render the weather tiles onto the globe.

**Modules:**
- **`packages/globe/src/WeatherLayer.tsx`**
  - A React/Resium component that manages the weather overlay.
  - On mount, fetches configuration from `/api/weather/layers`.
  - If a weather layer is selected, it instantiates a Cesium `UrlTemplateImageryProvider` pointing to our local proxy `/api/weather/tile/{z}/{x}/{y}?layer={selectedLayer}`.
  - Uses the Resium `<ImageryLayer>` component to drape the provider over the globe.
  - Implements alpha transparency controls so the user can see the Earth beneath the weather.

### 3. User Interface Integration
We will expose the weather controls to the user so they can interact with the new data.

**Modules:**
- **`apps/web/src/components/LayerSelector.tsx`**
  - Add a new "Weather" section.
  - Include a dropdown or radio buttons to select the specific weather layer (Clouds, Wind, Temp, Rain, etc.).
- **`packages/globe/src/GlobeViewer.tsx`**
  - Inject `<WeatherLayer />` into the viewer, passing down the selected layer state.

---

## Development Workflow & Checklist

- [ ] **Step 1: API Key Acquisition & Configuration**
  - Sign up for a free OpenWeatherMap account at https://openweathermap.org/api
  - Generate an API Key.
  - Add `OPENWEATHERMAP_API_KEY=your_key_here` to `worldwideview/.env.local` and `geospatial-tracker/.env`.

- [ ] **Step 2: Build the Next.js API Routes**
  - Implement `/api/weather/layers` endpoint.
  - Implement `/api/weather/tile/[z]/[x]/[y]` proxy endpoint.
  - Add error handling (400 Invalid Tile, 503 Missing API Key, 502 Upstream Error).

- [ ] **Step 3: Build the WeatherLayer Component**
  - Create `WeatherLayer.tsx` in the globe package.
  - Hook it up to Cesium's `UrlTemplateImageryProvider`.
  - Handle layer switching without crashing the WebGL context.

- [ ] **Step 4: UI Updates**
  - Update `LayerSelector.tsx` to include Weather options.
  - Wire the state from the Next.js frontend down to the `GlobeViewer` component.

- [ ] **Step 5: Testing & Verification**
  - Verify that zooming in/out correctly fetches new tiles.
  - Verify that the API Key is completely hidden from the browser network tab.
  - Verify caching is working to prevent API rate limits.

---

## Technical Considerations

1. **Caching:** OpenWeatherMap's free tier has strict rate limits. The Next.js proxy route MUST include `stale-while-revalidate` caching headers, and we may want to implement a simple in-memory cache if usage spikes.
2. **Tile Coordinate Validation:** A bad tile request (e.g. negative numbers) will be rejected by OpenWeatherMap. Our proxy should validate that `z`, `x`, `y` are positive integers within the valid Web Mercator range for the given zoom level before ever hitting the upstream API.
3. **Transparency:** Weather tiles have transparent backgrounds natively, but the data itself can be opaque. We will set the Cesium `ImageryLayer.alpha` to `0.6` by default for the best visual experience.
