export default async function tvSearch(req, res) {
    const API_KEY = process.env.TMDB_KEY;
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Please provide a search query (q)' });
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'TMDB API Error' });
    }
}
