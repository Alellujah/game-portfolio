function DecorativeCorners() {
  return (
    <>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          borderLeft: "4px solid black",
          borderTop: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 8,
          height: 8,
          borderRight: "4px solid black",
          borderTop: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 8,
          height: 8,
          borderLeft: "4px solid black",
          borderBottom: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 8,
          height: 8,
          borderRight: "4px solid black",
          borderBottom: "4px solid black",
        }}
      />
    </>
  );
}

export default DecorativeCorners;
