import GenreCard from "../components/GenreCard";

// ...inside the render method
{
  loading ? (
    <p>Loading…</p>
  ) : Object.keys(eventsByGenre).length === 0 ? (
    <p>No events for this day.</p>
  ) : (
    Object.entries(eventsByGenre).map(([genre, evs]) => (
      <GenreCard key={genre} genre={genre} events={evs} />
    ))
  );
}
