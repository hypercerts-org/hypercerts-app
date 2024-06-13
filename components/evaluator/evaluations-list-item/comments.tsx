export default function Comments({ comments }: { comments?: string }) {
  if (!comments) return null;
  return <div>{comments}</div>;
}
