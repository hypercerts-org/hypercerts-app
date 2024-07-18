const variantStyles = {
  default: "bg-black text-white",
  secondary: "border border-black bg-transparent text-black",
};

const CountBadge = ({
  count = 0,
  variant = "default",
}: {
  count: number | null;
  variant?: "default" | "secondary";
}) => {
  return (
    <span
      className={`${variantStyles[variant]} text-xs px-1 py-0.5 rounded-lg h-max`}
    >
      {count}
    </span>
  );
};

export default CountBadge;
