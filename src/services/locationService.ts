export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
}

export class LocationService {
    static async getCurrentLocation(): Promise<LocationData> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Try to get address from coordinates using reverse geocoding
                        const address = await this.reverseGeocode(latitude, longitude);
                        resolve({
                            latitude,
                            longitude,
                            ...address
                        });
                    } catch (error) {
                        // If reverse geocoding fails, still return coordinates
                        resolve({
                            latitude,
                            longitude
                        });
                    }
                },
                (error) => {
                    reject(new Error(`Location access denied: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    static async reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationData>> {
        try {
            // Using a free reverse geocoding service with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }

            const data = await response.json();

            return {
                address: data.localityInfo?.administrative?.[0]?.name || data.locality || 'Unknown',
                city: data.city || data.locality || 'Unknown',
                state: data.principalSubdivision || 'Unknown',
                country: data.countryName || 'Unknown'
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {};
        }
    }

    static async getCityCoordinates(city: string): Promise<{ latitude: number; longitude: number }> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(
                `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(city)}&localityLanguage=en`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    latitude: result.latitude,
                    longitude: result.longitude
                };
            }

            throw new Error('No coordinates found for city');
        } catch (error) {
            console.error('Geocoding error:', error);
            // Fallback to predefined coordinates for major Indian cities
            const cityCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
                'delhi': { latitude: 28.6139, longitude: 77.2090 },
                'mumbai': { latitude: 19.0760, longitude: 72.8777 },
                'bangalore': { latitude: 12.9716, longitude: 77.5946 },
                'chennai': { latitude: 13.0827, longitude: 80.2707 },
                'kolkata': { latitude: 22.5726, longitude: 88.3639 },
                'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
                'pune': { latitude: 18.5204, longitude: 73.8567 },
                'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
                'jaipur': { latitude: 26.9124, longitude: 75.7873 },
                'lucknow': { latitude: 26.8467, longitude: 80.9462 },
                'kanpur': { latitude: 26.4499, longitude: 80.3319 },
                'nagpur': { latitude: 21.1458, longitude: 79.0882 },
                'indore': { latitude: 22.7196, longitude: 75.8577 },
                'thane': { latitude: 19.2183, longitude: 72.9781 },
                'bhopal': { latitude: 23.2599, longitude: 77.4126 },
                'visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
                'pimpri-chinchwad': { latitude: 18.6298, longitude: 73.7997 },
                'patna': { latitude: 25.5941, longitude: 85.1376 },
                'vadodara': { latitude: 22.3072, longitude: 73.1812 },
                'ghaziabad': { latitude: 28.6692, longitude: 77.4538 }
            };

            const lowerCity = city.toLowerCase();
            return cityCoordinates[lowerCity] || { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi
        }
    }
}
