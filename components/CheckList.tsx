import { CheckIcon } from "./icons";

export default function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-white/85">
          <CheckIcon className="h-4 w-4 shrink-0 text-gold" />
          {item}
        </li>
      ))}
    </ul>
  );
}
