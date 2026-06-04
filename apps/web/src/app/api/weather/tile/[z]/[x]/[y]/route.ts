import { NextRequest, NextResponse } from 'next/server';

const VALID_LAYERS = new Set([
    'clouds_new',
    'precipitation_new',
    'pressure_new',
    'wind_new',
    'temp_new'
]);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
        return NextResponse.json({ error: 'Weather API not configured' }, { status: 503 });
    }

    const { z, x, y } = await params;
    const layer = request.nextUrl.searchParams.get('layer');

    if (!layer || !VALID_LAYERS.has(layer)) {
        return NextResponse.json({ error: 'Invalid layer parameter' }, { status: 400 });
    }

    // Validate coordinates
    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    if (
        isNaN(zoom) || isNaN(tileX) || isNaN(tileY) ||
        zoom < 0 || tileX < 0 || tileY < 0 ||
        zoom > 18 || 
        tileX >= Math.pow(2, zoom) || 
        tileY >= Math.pow(2, zoom)
    ) {
        return NextResponse.json({ error: 'Invalid tile coordinates' }, { status: 400 });
    }

    try {
        const url = `https://tile.openweathermap.org/map/${layer}/${zoom}/${tileX}/${tileY}.png?appid=${apiKey}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'WorldWideView/1.0'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch weather tile' }, { status: 502 });
        }

        const buffer = await response.arrayBuffer();

        // Edge caching headers to minimize upstream API calls
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=600, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weather tile' }, { status: 502 });
    }
}
