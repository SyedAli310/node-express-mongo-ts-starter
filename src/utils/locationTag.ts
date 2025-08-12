const GEO_API_URL = (ip: string | undefined) => `https://get.geojs.io/v1/ip/geo/${ip}.json`;

type GeoResponse = {
    city: string;
    region: string;
    country: string;
    organization_name: string;
};

/**
 * Builds a location tag string based on the user's IP address.
 * Fetches geolocation data from the geojs.io API and formats it as "City, Region, Country (Organization)".
 * If location data is unavailable, returns "Unknown Location".
 *
 * @async
 * @param {string} userIPAddress - The IP address of the user to look up.
 * @returns {Promise<string>} A formatted location string or "Unknown Location" if lookup fails.
 */
export async function buildLocationTag(userIPAddress: any | undefined): Promise<string> {
    const geoResponsePromise = await fetch(GEO_API_URL(userIPAddress));
    if (!geoResponsePromise.ok) {
        return 'Unknown Location';
    }
    const geoResponse = await geoResponsePromise.json();
    const { city, region, country } = geoResponse as GeoResponse;

    const locationParts = [city, region, country].filter(Boolean);
    const locationString = locationParts.join(', ');

    return locationString?.trim() || 'Unknown Location';
}
