export default function Aurora() {
  return (
    <div className="aurora-wrap" aria-hidden>
      <div
        className="aurora"
        style={{
          width: "55vw",
          height: "55vw",
          top: "-18vw",
          left: "-12vw",
          background:
            "radial-gradient(circle at 30% 30%, #6366f1, transparent 70%)",
        }}
      />
      <div
        className="aurora"
        style={{
          width: "45vw",
          height: "45vw",
          top: "20vh",
          right: "-14vw",
          background:
            "radial-gradient(circle at 60% 40%, #8b5cf6, transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="aurora"
        style={{
          width: "40vw",
          height: "40vw",
          bottom: "-15vw",
          left: "25vw",
          background:
            "radial-gradient(circle at 50% 50%, #06b6d4, transparent 70%)",
          animationDelay: "-16s",
        }}
      />
    </div>
  );
}
