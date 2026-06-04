import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const configured = Boolean(apiKey && apiKey !== 'your_api_key_here');

    const layers = [
        { id: 'clouds_new', name: 'Clouds', description: 'Cloud cover' },
        { id: 'precipitation_new', name: 'Precipitation', description: 'Rain and snow' },
        { id: 'pressure_new', name: 'Pressure', description: 'Sea level pressure' },
        { id: 'wind_new', name: 'Wind', description: 'Wind speed and direction' },
        { id: 'temp_new', name: 'Temperature', description: 'Temperature' },
    ];

    return NextResponse.json({
        configured,
        tileUrlTemplate: configured ? '/api/weather/tile/{z}/{x}/{y}?layer={layer}' : null,
        layers
    });
}
