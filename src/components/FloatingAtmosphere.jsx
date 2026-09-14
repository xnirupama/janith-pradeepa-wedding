export default function FloatingAtmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <i key={index} style={{ "--i": index }} />
      ))}
    </div>
  );
}
